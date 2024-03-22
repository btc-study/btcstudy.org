---
title: 'Schnorr 签名系列：Schnorr 盲签名'
author: 'Nadav Kohen'
date: '2021/12/13 14:10:13'
cover: '../images/schnorr-applications-blind-signatures/bitsmap.png'
excerpt: '除了必要的信息、对其它信息一无所知的服务器'
tags:
- Schnorr-签名
mathjax: true
---


> *作者：Nadav Kohen*
>
> *来源：<https://suredbits.com/schnorr-applications-blind-signatures/>*
>
> *[前篇中文译本](https://www.btcstudy.org/2021/12/09/schnorr-applications-frost/)*



![Suredbits Lightning Map](../images/schnorr-applications-blind-signatures/bitsmap.png)

本文是我们 Schnorr 签名系列的最后一篇文章：盲签名（Blind Signature）。顾名思义，一个 Schnorr 盲签名就是一个签名者自己也不知道自己签了什么的 Schnorr 签名。大家可能很难想象它的用处，但事实证明，它在打造 “木讷（oblivious）” 服务器时是非常有用的；而我认为，“木讷” 服务器在比特币和互联网的未来会扮演重要的角色。

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

盲签名方案遵循四个步骤：

1. 签名者出示一个 nonce
2. 接收方使用这个 nonce 构造一个盲签名挑战值（不会暴露被签名对象的任何信息）
3. 签名者对这个使用第一步中的 nonce 构造出来的挑战值生成一个普通的 Schnorr 签名
4. 接收方 “复明” 这个签名，得到一个普通的、有效的 Schnorr 签名，但看起来跟签名者在上一步中提供的签名没有任何关联，因为 R 和 s 值都经过随机数的调整

我会在本文的末尾讲解这个方案的数学细节。

在上面讲到木讷服务器时，我指的是一种支持一些受信任的计算或数据存储服务、有可能对服务收费，但是对所有与运营服务无关的信息一无所知的服务器。这些无关信息比如用户的身份、谁正在跟谁交互、哪些数据要存储、正在执行的计算有什么含义，等等。木讷服务器应该只是一个可靠的计算服务，不应包含其它。

“木讷转账（[Oblivious Transfer](https://en.wikipedia.org/wiki/Oblivious_transfer)）” 就是一个使用密码学元件来打造木讷服务器（为用户存储数据）的例子。但在这篇文章里，我会专注于讲解盲签名是计算型木讷服务器的一个关键部件。

## 简单 token 服务器

这种服务器有一个最简单的例子：一个 token 服务器，其唯一的目的就是发行 token 并保证同一个币不会被多次使用（double-spend）。在这种方案中，一个 token 只是一个能够报错的数据对（序列号，服务器（对序列号）的签名）；由于服务器是盲签名序列号的，所以用户能保持匿名，甚至服务器自己也无法将 token 与此前某一笔交易关联起来。在这种方案种，序列号是公开的 token ，是服务器签名定义所有权。要注意的是，假设你向他人分享了签名的 nonce ，只需使用 [Schnorr ID 协议](https://suredbits.com/schnorr-security-part-1-schnorr-id-protocol/)（[中文译本](https://www.btcstudy.org/2021/11/22/schnorr-security-part-1-schnorr-id-protocol/)）或它相应的非交互式签名方案，即可为知道 “服务器（对相应序列号）的签名” 提供零知识证明（译者注：即伪造签名）。

如果物主想转移一个 token，物主只需要公开服务器的签名。接收方必须（匿名）与服务器一起执行一个重新发行协议：接收方先生成一个新的序列号，向服务器发送 token（原序列号，服务器签名（原序列号））以及新序列号的盲签名挑战值。服务器检查本地数据库以保证这个原序列号没有被花费过；若检查通过，则将原序列号加入数据库中并签名盲挑战值。最后，接收方通过复明来获得服务器对新序列号的签名；成功复明后，接收方就成了这个 token 的唯一所有者，转账也可以认为是完成了。如果发送者日后尝试再次发送 token，或尝试通过重新发行来主张自己的所有权，他们是不会成功的，因为服务器里记录着这个序列号已经被花过了。

虽然这木讷服务器的一个非常简单的例子：它使用了盲签名来保证，除了为执行禁止多重支付（double-spend）规则必需的信息之外，它不掌握任何信息；但它不是很实用，因为 token 只是一些没有什么用处的随机数。

## 有趣 Token （即品牌证书）服务器

想让上述方案变得更加有趣，我们面临两大挑战：

1. 用户要能做到无需信任他人即可购买 token
2. Token 必需编码有用的信息（比如 “同质” token 的数量或其它 token（比如电子猫）的属性）

恰巧，这两个问题都可以使用同一种机制来解决：Pedersen 多重承诺。它是对形式如下的多个数值的承诺：

$$a_1 * G_1 + a_2 * G_2 + ... + a_n * G_n + r * G$$

这里的 $a_i$ 是被承诺的属性，而 r 只是一个随机数。因为它的优雅结构，这种多重承诺允许为多个单独的属性或它们的关系提供相对简单的零知识证明。举个例子，如果数量是属性 1，那么你就可以在新的一轮重新发行协议中证明两个 token 拥有同样的数量（无需公开任何其它信息）（其它属性也必然保持不变）。

举个简单的例子，你可以想象一种这样的 token：（时间锁、类型、数量、序列号、服务器签名）；而重新发行协议除了向服务器公开一个 token 以及服务器验证它没有被花过（使用序列号）以外，用户还可以提出多个盲签名挑战值（也即要求发行多个 token）以及零知识证明，证明这几个 token 的数量总和（以及其它属性）没有改变；如果验证通过、没有多重支付，那客户端就可以收到这多个 token。

这就解决了我们的第二个问题：让 token 编码有用的信息。但如何用它来执行无需信任对手方的买卖呢？我们加入了另一种可用的重新发行协议：客户端可以向服务器请求交换多个具有相同序列号（意味着只有一种一个能成功花费）、但具有不同时间锁（对买方是 0，而对卖方则是更大的数字）的 token。

举个例子，一个 token 的卖方可以拿一个 token（类型·普通、数量、序列号、服务器签名）跟服务器一起重新发行两个 token：一个买方 token（类型·买方、买方秘密值、卖方秘密值、数量、新的序列号、服务器签名）和一个卖方 token（类型·卖方、时间锁、数量、新的序列号、服务器签名），两者的序列号是一样的。卖方可以把买方 token 交给买方，但扣住卖方秘密值，同时向买方证明自己的卖方 token 有很长的时间锁。

这时候，买方可以使用比特币（无论在链下还是链上）和[点时间锁合约](https://suredbits.com/payment-points-part-1/)（[中文译本](https://www.btcstudy.org/2021/10/26/payment-points-part-1-replacing-HTLC/)）来购买这个卖方秘密值，然后从服务器处获得自己的 token。如果买方迟迟没有动作，卖方可以在时间锁过期后在服务器处用卖方 token 拿回这个 token。

我认为这种类型的服务器，比起在任何需要信任的环境中使用 “区块链” token 都要更优越（而且是在每一方面都好得多），比如让一个服务器为游戏发行 token。Jonas Nick 在[这个演讲](https://diyhpl.us/wiki/transcripts/building-on-bitcoin/2018/blind-signatures-and-scriptless-scripts/)和[这份幻灯片](https://nickler.ninja/slides/2018-bob.pdf)中探讨了这种应用。

## 盲眼 CoinSwap 服务器

盲签名的另一个有趣的应用是 CoinSwap 服务器。就像我们在[有关适配器签名的博客](https://suredbits.com/schnorr-applications-scriptless-scripts/)（[中文译本](https://www.btcstudy.org/2021/12/02/schnorr-applications-scriptless-scripts/)）中讲的，CoinSwap 就是一对表面上没有关系的交易，一般来说是两方互相给对方原子化地支付等量的币。

使用盲签名，我们可以打造出一种木讷的 CoinSwap 服务，用户可以支付一小笔费用来跟服务器做 CoinSwap、并且不让服务器跟踪哪个出账支付对应于哪个入账资金！

关键概念在看过 Schnorr 盲签名的数学细节后会更清楚：它就像普通的 Schnorr 签名，它们支持预承诺 nonce 的方案。具体来说，一旦服务器给出一个 nonce，客户端就可以借此产生一个调整项，并计算 s * G，这里的 s 是用带着一条已知信息的盲签名推导出来的。在我们的 [PTLC 系列](https://suredbits.com/payment-points-part-4-selling-signatures/)中，我们使用这种特性来支持签名的原子化购买。这是通过使用 s * G 作为适配器签名的适配点来实现的；只有完整的签名才能让你给服务器的支付生效。两个操作是相互绑定的：在服务器要拿走你支付的资金时，也必将向你公开 s，而你就可以拿中各 s 来复明盲签名，并拿走服务器给你的支付（需等待一段时间来等待匿名集扩大）。这样一来，假设与服务器所有的通信都是匿名的（使用 TOR 或者闪电网络或其它类似的机制），服务器也无法将入账和出账的交易关联起来，即使明明是它自己在向用户提供 CoinSwap 服务。

要想了解这个方案的深入描述，我建议你先阅读后文的 Schnorr 盲签名部分，然后看看[这个文档](https://github.com/ElementsProject/scriptless-scripts/blob/master/md/partially-blind-swap.md)。我发现它非常聪明地结合了 MuSig、适配器签名和盲签名！

## Schnorr 盲签名如何工作？

使用公钥 X 的签名者与接收者创建一个盲签名的通信过程非常类似于 Schnorr ID 协议：

1. 签名器生成一个随机数 k 并发送 ` R = k * G ` 给接收者。、
2. 接收者回应以挑战值 c。
3. 签名者回应以 ` s =  k + c * x `，其中 x 是签名者的私钥

在普通的 Schnorr 协议中，接收者使用 H(X, R, m) 作为 c（其中 m 就是他们要求签名的消息）。但我们的目标是让接收者可以调整 R 和 s 来获得 (R', s')，而且这种调整基于随机数，所以 (R', s') 看起来将与 (R, s) 没有任何关联。

在设计这样的方案时，最直接的办法就是让接收方生成随机数 α 和 t，令 ` X' = X + t * G `、` R' = R + α * G ` 分别作为调整后的公钥和 nonce。因此，接受方的挑战值将是 ` c = H(X', R', m) `。结果盲签名将是 `s =  k + H(X', R', m) `，需要调整才能变成一个对调整后的 nonce 有效的 Schnorr 签名。

$$s' = s + α + c ∗ t = (k+α) + H(X’,R + α ∗ G, m) ∗ (x + t)$$ 

如此一来，我们就得到了一个公钥 X' 对消息 m 的有效 Schnorr 签名(R', s')。

不过，这个方案有一个致命的缺陷。如果签名者尝试看破自己签名的是什么（比如，通过观察所有比特币交易的签名），TA 看到 (R', s') 时只知道它是公钥 X' 对消息 m 的有效 Schnorr 签名，TA 没办法识别这些值中的任何一个，但 TA 可以计算 H(X', R', m) 并与自己在步骤 2 中得到的挑战值相比较。这就打破了我们对签名者也匿名的目标。

为了解决这个问题，我们也许会想到可以生成一个随机数 β 来调整我们的挑战值，使之成为 ` c=H(X', R', m)+β `，这能奏效吗？如果挑战值变成了这种形式，那么调整后的签名就成了：

$$s' = s + α = k + α + (H(X’,R’,m) + β) ∗ x = (k + α + β ∗ x) + H(X’,R’,m) ∗ x$$

因此，这时候我们要增加一个额外的调整，来保证签名与新的 `R' = R  + α * G + β * X ` 相匹配。最终我们得到了公钥 X' 的签名 (R', s')，这个值对签名者来说也是随机的，而且挑战值哈希看起来也是随机的！这就是 Schnorr 盲签名的定义。

最后一个重要提醒是，Schnorr 盲签名方案并不能防御所有类型的攻击，但只需规定签名者在某一小部分时候终止并重试即可获得安全性（不过也变成了一个不那么高效的方案）。因此，普遍来说，最好的用法是在你只需要 Schnorr 签名是使用 Schnorr 盲签名方案（比如要签名的是一个比特币交易时）。对于盲签名在链下的大部分用途，使用其它的盲签名方案可能会更好。我想引用 BIP-340，它说得更准确：

“Schnorr 签名支持一个非常简单的盲签名方案，但它是不安全的，因为无法抵御 Wagner 攻击。一种已知的缓解措施是让签名者以一定的概率终止签名过程，结果方案可以在非标准的密码学假设下被证明是安全的。”

对 Schnorr 签名及其变种的研究到这里就结束啦。我们已经研究了 [Schnorr 签名](https://suredbits.com/introduction-to-schnorr-signatures/)、[其安全性](https://suredbits.com/schnorr-security-part-1-schnorr-id-protocol/)、[MuSig](https://suredbits.com/schnorr-applications-musig/)、[适配器签名](https://suredbits.com/schnorr-applications-scriptless-scripts/)、[批量验证](https://suredbits.com/schnorr-applications-batch-verification/)、[门限签名](https://suredbits.com/schnorr-applications-threshold-signatures/)以及盲签名（译者注：这些材料的中译本都可以在 btcstudy.org 网站内找到）。在本系列的下一篇文章（也是终结篇），我们会看看 Taproot 软分叉除了 Schnorr 签名以外还会给我们带来什么。

（完）

> *[后篇中文译本](https://www.btcstudy.org/2021/11/02/the-taproot-upgrade-explainer-from-Suredbits/)*