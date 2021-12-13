---
title: 'Schnorr 签名系列：MuSig'
author: 'Nadav Kohen'
date: '2021/11/29 16:01:17'
cover: '../images/schnorr-applications-musig/security_flat_logo_orange.png'
excerpt: 'Schnorr 的一种多签名协议'
tags:
- 密码学
mathjax: true
---


> *作者：Nadav Kohen*
>
> *来源：<https://suredbits.com/schnorr-applications-musig/>*
>
> *[前篇中文译本](https://www.btcstudy.org/2021/11/24/schnorr-security-part-2-from-id-to-signature/)*



![](../images/schnorr-applications-musig/security_flat_logo_orange.png)

欢迎来到本周的 Schnorr 签名系列博客！迄今为止，我们已经（非常深入地）介绍了 Schnorr 签名是什么以及为什么它是安全的。不过，就算你没有关注我们或还未读过[前两篇文章](https://suredbits.com/schnorr-security-part-1-schnorr-id-protocol/)（[中文译本](https://www.btcstudy.org/2021/11/22/schnorr-security-part-1-schnorr-id-protocol/)）（详细解释了 Schnorr 签名的安全性），也不影响你阅读这篇文章（以及本系列博客后续的部分），只要你熟悉本系列的[第一篇博客](https://suredbits.com/introduction-to-schnorr-signatures/)（[中文译本](https://www.btcstudy.org/2021/11/20/introduction-to-schnorr-signatures-by-suredbits/)） 或者知道 Schnorr 签名的工作模式就好。在本文中，我们会开始介绍 Schnorr 签名的变种，以及它们如何开启数不尽数的应用场景，就从 MuSig 开始。

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


## 什么是多签名（Multi-Signature）？

MuSig 是一种 Schnorr 的多签名方案，由 Maxwell、Poelstra、Seurin 和 Wuille 在[这篇](https://eprint.iacr.org/2018/068.pdf)论文中提出。顾名思义，多签名方案就是一组签名密钥 (X<sub>1</sub>, X<sub>2</sub>, ... , X<sub>n</sub>) 共同为一条消息形成一个签名。在普通的签名方案（比如 Schnorr 和 ECDSA）中，最简单的多签名方案就是把每一个签名者（对给定的一条消息）的普通签名串联起来：s = (s<sub>1</sub>, s<sub>2</sub>, ... , s<sub>n</sub>) 。比特币已经使用操作码 OP_CHECKMULTISIG（缩写为 “OP_CMS”）支持这种方案了。实际上，OP_CMS 不止支持多签名，还可以用来创建 n 个参与者中任意 m 个（m 小于 n）即可花费资金的地址，但我们会在本系列的另外一篇文章中讨论这种门限签名，本篇只讨论 n 个参与者一致参与的情形。

虽然 OP_CHECKMULTISIG 可以作为一种正确的多签名方案，它有一些严重的缺陷：在 n-n 的多签名方案中，签名的体积是普通单签名的 n 倍，而且它要把 n 个签名和公钥都暴露在链上。类似地，验证多签名也要比验证单签名花费更长的时间。最后，它没有隐私特性，参与者都是公开可知的，因为所有 n 个公钥都必须公开、用来验证签名。

MuSig 尝试实现一种 Schnorr 多签名方案来解决所有这些问题：无论签名的参与者有多少个，都只产生一个签名，且该签名与常规的 Schnorr 单签名没有形式上的区别。因此，验证 MuSig 签名的过程将与验证普通 Schnorr 签名的过程一模一样。此外，它还支持密钥聚合，所以签名的密钥都可以保持隐私。具体来说，如果有 n 个签名者 X<sub>1</sub>, X<sub>2</sub>, ... , X<sub>n</sub>，要签名的消息记为 m，使用 MuSig 它们可以生成一个 Schnorr 签名 (R, s)，该签名是聚合密钥 X = agg((X<sub>1</sub>, X<sub>2</sub>, ... , X<sub>n</sub>)) 对 m 的有效签名。所以，在任何公开的空间中（比如区块链），这 n 个参与者都被公钥 X 保护了起来。简而言之，我们可以让多签名的输出与标准的输出看起来没有分别，一模一样。

说得再明确一些，使用 MuSig 不仅有显而易见的隐私优势，还能为区块链带来很大的扩容效果。使用 OP_CMS（和类似方案）要占据大量的区块空间并耗用大量验证计算，但 MuSig 让这些交易可以被替换为一个体积很小的、易于验证的单签名交易。

## 应用

在讨论 MuSig 背后的数学之前，我们先来介绍一下多签名在现在和未来的比特币中的应用场景。

在 Suredbits 中，我们最喜爱的多签名用途之一就是闪电网络通道。当前，闪电网络通道在链上的足迹是这样的：

（此处应有示意图，但缺失了）

要指出的是，这张图中的 “ A's ” 和 “ B's ” 分别表示 Alice 和 Bob 的公钥，但是，这里不是双方都把同一个密钥重用了三次，而是双方都使用了 3 个不同的密钥。有了 MuSig，这个图就可以被简化成一笔 2-2 的充值交易、形成一个单公钥的输出，这样一个闪电网络通道就跟带有一笔支付和找零的 UTXO 整合交易（UTXO consolidation）没有区别了（而支付活动与许多其它协议同享一个匿名集）（译者注：UTXO 整合交易指的是把多个 UTXO 也即多笔资金整合为一个 UTXO 的交易；匿名集指的是特征上相同的输出集合，匿名集越大，越难以辨别其中个人的身份）。实际上，闪电网络的输出会跟常见的单用户钱包地址一模一样！

零为一种常见的 2-2 多签名用途是双因子验证（2FA）的钱包，比如 Blockstream 的 [Green Wallet](https://blockstream.com/green/)，一个私钥在用户手里，另一个私钥在强制执行双因子验证的服务器手里（请注意，用户仍然能够的时间锁过期后单方面花费，所以资金仍然控制在他们自己手上）。当前 Green Wallet 在链上的地址很容易和大部分其它钱包区分开来。但有了 MuSig，这样带有额外安全设置的钱包也将使用一个普通的单公钥地址。

更广泛低说，我们可以想象到，会有许多应用像 2FA 钱包一样，具有 n-n 的一致合作花费条件以及一个较弱的、 m-n 签名要求的备用支付条件。这个洞见就是 Taproot 提议的关键动机之一。Taproot 好像在提出后的 2 周内就确定了要进入比特币协议？虽然我不会在这里讲解 Taproot 的全部细节（可以看看这篇[研讨文](https://bitcoinops.org/en/schorr-taproot-workshop/)，如果你有兴趣的话），我还是想讨论一些大概，因为它们跟多签名有关。实际上，每一个 Taproot 地址都有一个内置的 n-n 合作性支付条件，如果一个输出的所有参与者都同意如何花费资金，他们可以使用 MuSig 来一起花费这笔资金，而且没有任何人能从区块链上知道这不是一笔简单的单公钥支付交易而是一个合约。这可了不得！这意味着任何多方参与的协议，只要各方愿意合作，那么**所有**的活动都跟单方参与的交易没有区别。这个输出是闪电网络通道吗？还是一个谨慎日志合约？还是一个双因子钱包？Liqid 侧链交易？托管合约（Escrow Contract）？……？没有人知道！所有这些输出花费起来都像是我在给朋友转一些钱。

我想提到的最后一个隐私性提升，与一种叫做 “CoinSwap” 的协议有关。CoinSwap 是双方（比如 Alice 和 Bob）做一次资金的原子化互换来提高隐私性和他们的输出的同质性。具体来说，双方先确定一个合约，如果 Bob 花费了 Alice 的输出，就必然会泄露一个秘密值，让 Alice 可以花费 Bob 的输出；然后，双方把资金转移到一个 2-2 的多签名输出中。如果你对细节感兴趣，可以看[这篇 gist](https://gist.github.com/chris-belcher/9144bd57a91c194e332fb5ca371d0964)。一个重要的特性是，Alice 和 Bob（不需要对方的许可和帮助）就能以合作的形式花用资金（并且知道自己是安全的，即使对方想动歪脑筋也不会丢失资金），而他们的交易不仅是没有关联的、相互独立的，而且从链上的实际足迹来看，它就像是 Alice 把钱给了某个看起来普通的公钥，而这个公钥又支付给了另一个看起来普通的公钥（实际上是术语 Bob），反过来看 Bob 的行为也是一样。想进一步了解 CoinSwap 的独特隐私好处，请看 [waxwing 讲解这个主题的文章](https://joinmarket.me/blog/blog/coinswaps/)；想了解设计良好的实现，请看 “[简洁的原子化互换](https://gist.github.com/RubenSomsen/8853a66a64825716f51b409be528355f)”。

此外，请注意，即使你从未计划使用上述任何方案，MuSig 也对每个使用区块链的用户有好处，因为其他人将使用更少的区块空间。

本节只是使用 MuSig 将有所提升的协议的一个非常有限的列表。直白地说，比特币上可以做的东西非常多，其中许多都受益于 MuSig（如果能用的话）能够带来的隐私和扩容好处。所以剩下的篇幅我不会再介绍这些应用（相信你已经尝到甜头了），我们已经准备好看看上述这些方案（以及其它种种）是如何实现的了。

## MuSig 工作原理

Schnorr 签名得以支持 MuSig 的关键属性是 “线性”，我们在[本系列第一篇](https://suredbits.com/introduction-to-schnorr-signatures/)（[中文译本](https://www.btcstudy.org/2021/11/20/introduction-to-schnorr-signatures-by-suredbits/)）里介绍过。

我们想要的属性是：在 n 方参与、每一方都有自己的公钥的情形中，将他们的公钥聚合成一把公钥，并使该公钥可用于 n 方一致参与的情形中的签名验证（即功能上就像 n-n 的 OP_CMS）。

不加思索，假设有一组签名密钥 (X<sub>1</sub>, X<sub>2</sub>, ... , X<sub>n</sub>)，我们以下面的形式形成聚合公钥：

$$X = X_1 + X_2 + … + X_n$$

（你应该能回想起，公钥就是椭圆曲线上的点，而这种方式就是把这些点都加起来，形成一个新的点）。现在，如果你想为这个聚合公钥生成一个签名，我们需要让每一方都生成自己那一部分的签名，最后把所有这些签名都加起来（就像我们在第一篇博客中讨论线性的时候那样），得到对这个聚合公钥有效的签名。也就是说，对任何消息 m，我们要让每一方都生成一个 nonce (R<sub>1</sub>, R<sub>2</sub>, ... , R<sub>n</sub>)，并分享出来，再定义聚合 nonce 为 R = R<sub>1</sub> + R<sub>2</sub> + ... + R<sub>n</sub> ，然后每一方都要使用这个 R 来计算自己那一部分的签名：

$$s_i = k_i + H(X, R, m)*x_i$$

最后，聚合签名就是：

$$s = s_1 + s_2 + … + s_n = (k_1 + ... + k_n) + H(X, R, m) * (x_1 + ... + x_n)$$

$$= k + H(X, R, m)*x$$

这里的 k 和 x 分别是聚合的一次性私钥和签名私钥。这个当签名方案使用公钥 X 为消息 m 生成了一个有效的（普通）Schnorr 签名 (R, s)。不幸的是这种方案无法抵御所谓的 “Rogue Key 攻击”。

假设我说服了一些人跟我一起参与这个协议、我们每个人都要公开自己的公钥，我的公钥是 X<sub>1</sub> ，但我可以说谎，告诉其他人我的公钥是 X<sub>1</sub>' = X<sub>1</sub> - X<sub>2</sub> - ...  - X<sub>n</sub> ；我并不知道这个 X<sub>1</sub>' 的私钥，但是，当我们把密钥聚合起来时，得到的就是 X = X<sub>1</sub>' - X<sub>2</sub> - ... - X<sub>n</sub> = X<sub>1</sub> ，这个公钥的私钥我是知道的！因此，我可以把这个公钥里的资金单方面发到任何地方，无需任何人的同意。

如果你能够让我证明我知道自己所公开的公钥的私钥，那就能防止我的 Rogue Key 攻击。但是，我可以对 nonce 值做同样的攻击，来控制聚合的一次性私钥 k。这看起来没什么问题，但在我们集体签名时，我可以等待其他人先暴露签名，然后计算聚合签名 s = k + H(X, R, m) * x，然后计算出 x（聚合私钥），再一次，我可以把所有资金都转走，不需要经过其他人的同意。

因此，为了解决上述方案存在的问题，我们需要让聚合 nonce R 和聚合公钥 X 都能抵抗 Rogue Key 攻击。对于 nonce，一种办法时让所有的参与者先公开对自己的 nonce R<sub>i</sub> 的承诺，然后在公开具体的数值（这样一来就没有人能提前知道其他人的 nonce 并恶意生成自己的 nonce）。具体来说，我们会要求每一方都广播自己所选 nonce 的哈希值，即 t<sub>i</sub> = H(R<sub>i</sub>)，并且只在看到所有人的承诺 t<sub>i</sub> 之后才公开自己的 R<sub>i</sub> 。

这样做可以缓解对 noce 的 Rogue 攻击，但是对聚合签名密钥来说却有点不切实际，因为公钥往往已经公开了，并且是可以重用的，所以上述方案也许无法保护我们。相反，我们可以更改 聚合密钥的形式，在计算时使用所有签名公钥的一条哈希值，类似于我们在介绍篇里面为签名哈希加入 nonce 的做法。具体来说，我们令 `<L>` 是所有公钥 (X<sub>1</sub>, X<sub>2</sub>, ... , X<sub>n</sub>) 的某种编码，然后，令：

$$a_i = H(<L>||Xi)$$ 并且

$$X = a_1 * X_1 + a_2 * X_2 + ... + a_n * X_n$$

因此，现在已经很难为 (X<sub>1</sub>, X<sub>2</sub>, ... , X<sub>n</sub>) 构造出一个 X<sub>1</sub>' 使得 X = X<sub>1</sub> 了。但是这样做在数学上就脱节了，因为如果我们的各部分签名的总和仍然使用 (x<sub>1</sub> + x<sub>2</sub> + ... + x<sub>n</sub>)，得出的就不是对应于公钥 X 的私钥 x。好在，我们也很容易调整一下我们的单人签名，来适应公钥的变化：

$$s_i = k_i + H(X, R, m) * a_i * x_i$$

因此，我们的聚合签名为：

$$s = s_1 + s_2 + … + s_n = (k_1 + ... + k_n) + H(X, R, m) * (a_1 * x_1 + a_2 * x_2 + ... + a_i * x_n)$$

$$= k + H(X, R, m)*x$$

总结一下，MuSig 签名分成三轮：

1. 所有参与者发送承诺 t<sub>i</sub>
2. 所有参与者公开 nonce 数值 R<sub>i</sub>，各方验证 t<sub>i</sub> = H(R<sub>i</sub>)
3. 所有参与者计算并发送自己的部分签名 s<sub>i</sub>

此时，任何一个能看到所有的 nonce 数值和部分签名的人都可以计算并使用 Schnorr 签名 (R, s)。

MuSig 协议的安全性证明在[这里](https://eprint.iacr.org/2018/068.pdf)，但许多人不满足于 3 轮的通信要求，许多工作都为了砍掉一次交互从而制作一个只需要 2 轮交互的 MuSig。[Jonas Nick 的这篇文章](https://medium.com/blockstream/insecure-shortcuts-in-musig-2ad0d38a97da)讲解了为什么某些可以把 3 轮的协议转化为 2 轮交互的捷径是不安全的。

但我很高兴可以告诉大家，这实际上是可以做到的！上述 MuSig 协议的另一个问题是，不像普通的 Schnorr 签名（比如 [BIP 340](https://github.com/bitcoin/bips/blob/master/bip-0340.mediawiki#default-signing) 定义的变种），它没法简单使用哈希语境（hashing the context）的方式来确定性地生成 nonce 值。这是因为攻击者可以尝试跟你开展 MuSig 签名，获得你的签名后再拒绝出示自己的签名从而叫停签名流程。因为其他参与者的 nonce 不是你用来生成自己的 nonce 时所用的 context 的一部分（因为有承诺阶段），哈希语境将产生同一个 nonce 但不同的签名（因为聚合 nonce 不同）！这样一来，当攻击者知道了你的第二个签名时，他们就拿到了你重用 nonce 而产生的两个不同签名，从而能计算出你的私钥。因此，在生成一次性私钥时，真随机数必须是可得而且安全的。

据说很快将会有一篇文章出来，给出安全、确定性计算 nonce 的方法，同时摆脱第一轮通信！在这个 MuSig 的变种中，所有参与方都被要求生成一个确定性的 nonce 并提供（NIZK）证据，证明自是按照规则来生成的。因此，MuSig 的第二轮会变成这个变种协议的第一轮，而且各方不仅要公布 nonce 还要提供计算完整性的证明。关于这个 nonce 如何计算以及如何证明正确计算的细节，据说是非常酷的，希望我有一天能专门开一篇博客写写（在这篇现在还不知道存不存在的论文出版之后）。

免责声明：本文中没有任何观念是我原创的。

在本文中，我们介绍了多签名和一种叫做 “MuSig” 的 Schnorr 多签名方案（还暗示了其它的变体）。我们也了解了以下 MuSig 在比特币中的应用，以及它对比特币的资金及合约的隐私性提升和扩容效果。敬请期待下周的博客，我会带大家研究我个人最喜欢的 Schnorr 签名变种，叫做 “Adaptor Signature（适配器签名）” ！

（完）

> *[后篇中文译本](https://www.btcstudy.org/2021/12/02/schnorr-applications-scriptless-scripts/)*