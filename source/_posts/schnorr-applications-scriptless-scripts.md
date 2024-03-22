---
title: 'Schnorr 签名系列：隐形脚本'
author: 'Nadav Kohen'
date: '2021/12/02 10:55:06'
cover: '../images/schnorr-applications-musig/security_flat_logo_orange.png'
excerpt: '隐形脚本是一种合约，但由实际上并不包含任何代码的区块链协议来执行'
categories:
- 比特币主网
tags:
- Schnorr-签名
- 开发
- PTLC
mathjax: true
---


> *作者：Nadav Kohen*
>
> *来源：<https://suredbits.com/schnorr-applications-scriptless-scripts/>*
>
> *[前篇中文译本](https://www.btcstudy.org/2021/11/29/schnorr-applications-musig/)*



本篇我们继续探讨由 Schnorr 签名赋能的方案以及它们在比特币中的应用。本次我们要探索的是 “隐形脚本（Scriptless Script）” 的概念，这种范式是由一种叫做 “适配器签名（[Adaptor Signatures](https://github.com/bitcoin/bips/blob/master/bip-0340.mediawiki#Adaptor_Signatures)）” 的签名方案支持的。在此要提醒的是，虽然[用 ECDSA 实现适配器签名也不会很麻烦](https://github.com/LLFourn/one-time-VES/blob/master/main.pdf)，但使用 Schnorr 签名仍然有好处，也更容易集成到其他的 Schnorr 签名变种中。

<details><summary><strong>Schnorr 签名系列</strong></summary>
<a href="https://suredbits.com/introduction-to-schnorr-signatures/">What are Schnorr Signatures – Introduction</a><br>
<a href="https://suredbits.com/schnorr-security-part-1-schnorr-id-protocol/">Schnorr Signature Security: Part 1 – Schnorr ID Protocol</a><br>
<a href="https://suredbits.com/schnorr-security-part-2-from-id-to-signature/">Schnorr Signature Security: Part 2 – From IDs to Signatures</a><br>
<a href="https://suredbits.com/schnorr-applications-musig/">Schnorr Multi-Signatures – MuSig</a><br>
<a href="https://suredbits.com/schnorr-applications-scriptless-scripts/">Scriptless Scripts – Adaptor Signatures</a><br>
<a href="https://suredbits.com/schnorr-applications-batch-verification/">Batch Verification</a><br>
<a href="https://suredbits.com/schnorr-applications-threshold-signatures/">Schnorr Threshold Sigantures</a><br>
<a href="https://suredbits.com/schnorr-applications-frost/">Flexible Round-Optimized Schnorr Threshold – FROST</a><br>
<a href="https://suredbits.com/schnorr-applications-blind-signatures/">Schnorr Blind Signatures</a><br>
<a href="https://suredbits.com/the-taproot-upgrade/">Taproot Upgrade – Activating Schnorr</a>
</details><br>

Andrew Poelstra 提出[隐形脚本](https://download.wpsoftware.net/bitcoin/wizardry/mw-slides/2018-05-18-l2/slides.pdf)的概念很大程度上是受到了 MimbleWimble 协议开发工作的启发：在后者的语境中，只允许使用签名，而不包含任何大部分其他区块链协议（比如比特币）具有的脚本执行措施。顾名思义，隐形脚本是一种合约（这个词在常见的区块链语境下意味着编程好的支付条件）、但由实际上并不包含任何代码的区块链协议来执行，因此，它意味着只用签名方案来执行合约。

在我们的 Schnorr 签名解释系列中，迄今为止，签名方案都几乎只用于相对简单的验证。由普通的 Schnorr 签名推动执行的 “合约” ，就是只有私钥所有者一个人能解锁的支付条件；至于 MuSig，你可以认为是稍微复杂一些的 “合约”，其中 n 个参与者必须团结一致来解锁资金。这无疑是朝着只使用普通的 Schnorr 签名验证、不使用别的模块来执行比特币智能合约的目标迈出了一步，因为它已经能替代 OP_CHECKMULTISIG 在许多场景下的作用。

要进一步推进隐形脚本的开发，我们要开始考虑一种常见的比特币合约：[哈希时间锁合约](https://en.bitcoin.it/wiki/Hash_Time_Locked_Contracts)（HTLC）。HTLC 是一种资金有条件、原子化解锁的合约，当且仅当收款人公开一个秘密值，才能拿走支付者支付的资金。HTLC 最流行的应用场景是[闪电网络](https://suredbits.com/category/lightning-network/)，这种合约允许 Alice 通过 Bob 向 Carlol 支付（原子化支付路由）：Alice 给 Bob 设置一个 HTLC，要求 Bob 出示一个仅有 Carol 才知道的秘密值；Bob 要想取得这个秘密值（并拿到 Alice 承诺支付的资金），就只有给 Carol 也设立一个 HTLC。在当前的闪电网络实现中，HTCL 需要[非常多的脚本编程](https://github.com/lightningnetwork/lightning-rfc/blob/master/03-transactions.md#offered-htlc-outputs)，但可以证明，HTLC 有隐形的版本：可以使用简单的签名验证来替代脚本，并使之与普通的转账活动无从分别。

## 适配器签名

我们的目标是修改 Schnorr 签名方案，使之能在签名中 “藏匿一个秘密值”，当收款方要取走资金时，他们必须向支付者公开这个秘密值。

设 t 为支付秘密值（对收款方是已知的），并使得 `T = t * G`，也就是与这个秘密值相关联的 公钥/椭圆曲线点（双方都可知）。就像一笔普通的支付一样，支付者/资金发送方会为发送资金给收款方的交易生成一个 Schnorr 签名；但跟普通的支付有区别的地方是，发送者将使用 T 来调整其签名，使得收款方必须使用 t 来修复这个签名才能使之成为一个有效的签名（并使支付生效）。这个支付方生成的无效签名将被发送给收款方（而不是发送到区块链网络中），后者会先用秘密值修复这个签名，然后再把交易和有效的签名发送到区块链网络中。

现在，我们来看看到底哪里需要 “调整” 。我们希望产生的是一个适配器签名 (R', s')，使得对某些 R 和 s = s' + t，(R, s) 是一个有效的 Schnorr 签名（用法与本系列的起始篇介绍的相同）。一个普通的 Schnorr 签名的形式是：

$$k’ + H(X, R’, m)*x$$

如果我们给它加入一个调整项 t，我们可以认为是 t 跟 k' 值结合了起来：

$$(k’ + H(X, R’, m)*x) + t = (k’ + t) + H(X, R’, m)*x$$

我们把 k' + t 的值记为 k，因为它实际上才是修复后的签名的 k 值。但是，这样的修复似乎会打破其它的一些东西。上述形式并不是一个有效的签名，因为哈希函数中的 R' 并不是 `k * G`，因为 `k * G = (k' + t)*G = R' + T`。但这个小错误也很容易修正，我们只需令 R = R' + T，放在初始签名的哈希函数中即可。

因此，对于消息 m、私钥 x、一次性私钥 k'，以及秘密值 t（其中 `T = t * G`），一个适配器签名是 (R', s', T)，其中

$$s’ = k’ + H(X, R’ + T, m)*x$$

在修复这个签名（即为这个适配器签名添加调整项）之前，收款方先验证这是不是一个有效的适配器签名：

$$s’*G ?= R’ + H(X, R’ + T, m)*X$$

检查等式成立后，再把 t 补充进这个签名：

$$s = s’ + t = (k’ + t) + H(X, R’ + T, m)*x = k + H(X, R, m)*x$$

最后，收款者就得到了一个有效的数字签名 (R, s)，它事实上跟任何普通的签名没有两样，除非之前看到了适配器版本 s'，否则根本无法识别。

我们现在已经知道如何创建、验证适配器签名以及补完适配器签名以形成一个有效的签名了。最后的部分是，发送者如何从补完的签名中复原出秘密值 t？因为 s = s' + t，所以只需在区块链上或者其它地方找到签名 s 就可以了；找出 s 之后，求它与适配器签名 s' 的差值就得到了 t。

所以，完整的流程如下：

1. 资金发送方生成一个适配器签名（只需要用到有关 T 的知识）
2. 接收方验证这个适配器签名
3. 接收方使用秘密值 t 来补完这个适配器签名，并使用这个完整的签名
4. 发送方取完整的签名与适配器签名的差值，获得秘密值 t

我最后要强调的是，适配器签名有一种可抵赖的属性。也就是说，给定任何有效的数字签名 (R, s) 和标量值 t，任何人都能计算出有效的适配器签名 `(R – t*G, s – t, t*G)`，所以没有任何适配器签名可以被证明是链上某个有效签名的前身。

## 适配器签名与 MuSig

适配器签名的一个关键属性是，它与普通的 Schnorr 签名有一样的结构，只不过我们哈希的是 R' + T 而不是 R'。因此，我们大体上可以相信，Schnorr 适配器签名[和 Schnorr 签名一样安全（不可伪造）](https://suredbits.com/schnorr-security-part-1-schnorr-id-protocol/)！

更进一步地，因为 [MuSig](https://suredbits.com/schnorr-applications-musig/) 运用过程中的碎片签名（partial signature）也相似于普通的 Schnorr 签名，适配器签名方案也可以跟碎片签名结合起来。以我们在上一篇博客中提到的 CoinSwap 应用为例，它本质上就是两个独立但使用同一个秘密值的 HTLC。我们现在可以使用用一个标量（scalar）和 PTLC（点时间锁合约）来替代 HTLC：假设参与的两个公钥 X 和 Y 有 MuSig 聚合密钥 `a_x * X + a_y * Y` ；假设 X 希望把资金发送给 Y，条件是他们公开一个可以生成椭圆曲线点 T 的标量（在这个案例中，这个标量即是用来解锁资金的秘密值）。我们可以将 MuSig 签名方案与适配器签名方案结合起来：令 X 的碎片签名为：

$$s_x’ = k_x + H(a_x * X + a_y * Y, R_x + T, m) * x$$

（注意，被哈希的 Nonce 值加上了 T。）在收到并验证了 Y 的碎片签名 s<sub>y</sub> 之后，X 交出自己的适配器签名 s<sub>x</sub>' ，使用该值，Y 可以计算 s<sub>x</sub> = s<sub>x</sub>' + t；最后，s = s<sub>x</sub> + s<sub>y</sub> 就是对链上聚合公钥有效的签名。而只要 X 看到了这条签名，Ta 就可以计算 s - s<sub>x</sub> - s<sub>y</sub> = t。

## 应用

现在，我们可以构造适配器签名了，我们来简单了解下它的应用。我们刚刚已经展示了，适配器签名可以消除 CoinSwap 的两笔交易之间的关联！它跟任何使用 HTLC 的 CoinSwap 形成了鲜明对比，因为两个 HTLC 需用使用相同的哈希值，出现在链上时就让人能够把两笔交易关联起来。

我们已经讨论到的这个替代 HTLC 的工具通常被称为 “点时间锁合约（Point Time Lock Contract，PTLC）”，它跟 HTLC 功能相似，只不过揭晓的是生成某个点的标量，而不是生成某个哈希值的原像。除了更加隐私、让更多合约可以在链外执行以外，事实证明 PTLC 对闪电网络有非常多的好处，多到我专门写了两个系列的博客来介绍！

- [Payment Points Series 1](https://suredbits.com/payment-points-part-1/)
- [Payment Points Series 2](https://suredbits.com/payment-points-monotone-access-structures/)

除了 PTLC，适配器签名可以为闪电网络带来的另一个提升叫做“统一状态的闪电通道（Unified State Lightning Channel）”。关于这个点子，我写过一个[详尽的讲解](https://suredbits.com/generalized-bitcoin-channels/)，这里只讲一个非常抽象的大概：当前的闪电网络撤销机制需要参与通道的双方保存双双对称的状态（每一方都有利于自己的惩罚条款），但我们可以把它转变成一个统一的状态，基于交易中使用的签名检测出是哪一方发布了旧状态。这是通过适配器签名来实现的：一方向通道对手提供的适配器签名中包含了只有自己知道的秘密值，因此这个秘密值可以用来锁定惩罚机制，而不需要保存与对方对称的状态。

### 谨慎日志合约

在我的 PTLC 博客系列中，一种常见的窍门是构造一个不仅代表了一个随机值的特殊点（普通的通道点时间锁合约只使用一个代表随机值的点）。在此我想简要讨论一种这样做的方案，因为它也契合于 Schnorr 签名的良好结构。设想一种场景：一个客户端想从服务端处购买对一条消息 m 的签名。一个签名也是一个标量，所以，如果我们能计算与这个标量关联的 点/公钥，我们就能使用这个点来建立一个 PTLC，并保证客户端只要且只需付出金钱，就一定能获得有效的签名。回忆一下，所有有效的 Schnorr 签名都满足：

$$ s_m*G = R + H(X, R, m)*x$$

因此，只要服务器预先承诺自己要用到的 nonce 值 R，客户端就可以计算 `R + H(X, R, m) * X` ，无需知道 s 。那么，客户端又可以用这个等于 `s_m * G ` 的点作为 PTLC 的适配器点，给服务器支付。只要服务器发布了完整的签名并取走了资金，客户端就可以计算出 s<sub>m</sub> （即完整签名与他们向服务器发送的适配器签名的差值）。否则，服务器将不能取走这些资金。换句话来说，适配器签名（以及预先承诺 R 的方案）支持了普通 Schnorr 签名的免信任销售。

使用 “给签名支付” 作为暗箱装置的一个更有趣的应用是所谓的 “谨慎日志合约（DLC）”。我们已经写过[详尽的 DLC 介绍](https://suredbits.com/category/discreet-log-contracts/)，也正在开发一个[开源的规范](https://github.com/discreetlogcontracts/dlcspecs)和一种[实现](https://github.com/bitcoin-s/bitcoin-s/tree/adaptor-dlc)。在 DLC 的运行中，一个签名者（通常被称为 “断言机（oracle）”）会承诺在未来签名并发布一些数据（比如，哪个队赢了哪一场球赛啦，比特币的价格是多少啦），并为这些.事件的签名预先承诺 R。这就意味着，只要所有可能被签名的结果 m 都是可知的，那所有可能的点 `s_m * G ` 都可以提前计算出来（就像上面一样）。想结成一个 DLC 赌博合约的双方可以构造一笔将产生一个 MuSig 2-2 输出的充值交易，并使用自己的密钥为每一个可能的结果向对方给出一个适配器碎片签名。具体来说，需要为每一个可能的结果都构造一笔花费充值交易的交易，因此，当断言机发布某条消息的签名时，双方都可以拿断言机的签名补完合约缔结时提前准备好的适配器碎片签名，并加上自己的碎片签名来获得可以有效的签名，从而按照断言机的结果花费充值交易！DLC 的主要执行过程都是发生在链下的，而这样一来，链上的足迹将只剩下一个 Schnorr 签名，与其它的应用和普遍的支付没有区别！

### 零知识的条件支付（Zero Knowledge Contingent Payment）

虽然 Schnorr 签名具备这种点可以从公开信息（假定 R 也公开了）中预先计算出来的良好属性，还有一类更广泛的结构化数据，可以零知识地证明其具有给定的公钥。举个例子，假设支付者希望从收款人处购买一个哈希值的原像，但又不想使用 HTLC，因为 HTLC 在链上是可见的（以及其它原因）。收款方可以使用原像计算出一个点，并向支付者提供一个零知识证明，证明这个点背后的标量的哈希值将是 XXX。这个证明使得支付者可以放心建立一个 PTLC，相信自己的资金被拿走之时自己就可以知道这个哈希值的原像。目前我们[已经知道](https://bitcoincore.org/en/2016/02/26/zero-knowledge-contingent-payments-announcement/)，这种叫做 “零知识条件支付” 的形式，是可以使用 HTCL 的一些变种来实现的，但 PTLC 提供了更好的隐私性和可扩展性（只不过面临一些特殊的限制，我就不在这里讨论了）。ZKCP 可以被认为是 PTLC（给标量支付）和给签名支付的一种普遍化形式（而这些特殊形式则是使用较简单的证明的 ZKCP）。

### 简单托管合约（Simple Escrow Contract）

我在这里想讲的最后一个应用是简单托管合约。传统上，这类合约表现在链上是一个 2-3 的 OP_CHECKMULTISIG 输出（三个公钥中任意两个的签名可以解锁的资金），参与的双方各有一个公钥，第三把公钥则属于托管者。如果双方已经（在链下）签名了一个合约操作，并一致同意合约资金的分割，他们就无需通知托管方，只需两人合作就可以解锁资金。但如果双方意见有分歧，任何一方都可以联系托管方，而托管方会决定向哪一方提供签名，使之可以无需对手方的同意就取走资金。想往常一样，我们希望使用 Schnorr 签名把这些活动都隐藏在一个公钥的后面，使他人无法在链上发现合约的存在。这个可以使用一个双密钥的 MuSig 方案来实现，就像 CoinSwap 一样，但每一方都为所有可能的结果提供相应的适配器碎片签名，这些适配器签名使用只有托管方才知道的秘密值作为调整项（比如，这些秘密值可以是托管者对结果的签名）。如此一来，只要双方意见一致，就可以直接执行普通的 MuSig 签名流程，来花费资金；否则，任何一方都可以联系托管方，请后者补完适配器碎片签名，加上自己的碎片签名后发到链上、结算资金。

托管合约本质上也是一种 DLC，只不过断言机在这里换成了托管者，因此，用户在链下要承担更多的开销。在未来关于 Schnorr 门限签名的博客中，我们会尝试创建一个更加简洁、更有表现力的托管合约。

关于适配器签名的讨论，到这里就结束了。不过，如果你发现这些应用都很有趣，我强烈建议你阅读我撰写的关于 PTLC 和适配器签名的进阶用法的博客。本系列剩余的部分，我们会研究批量验证、门限签名、盲签名和 Taproot。

（完）

> *[后篇中文译本](https://www.btcstudy.org/2021/12/06/schnorr-applications-batch-verification/)*