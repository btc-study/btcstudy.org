---
title: '点支付合约简介，Part-3：托管合约'
author: 'Nadav Kohen'
date: '2021/12/16 18:53:39'
cover: '../images/payment-points-part-3-escrow-contracts/200X675.jpg'
excerpt: '闪电网络上的托管合约'
categories:
- 闪电网络
tags:
- 闪电网络
---


> *作者：Nadav Kohen*
>
> *来源：<https://suredbits.com/payment-points-part-3-escrow-contracts/>*
>
> *[前篇中文译本](https://www.btcstudy.org/2021/12/10/payment-points-part-2-stuckless-payments/)*



![Lightning Data](../images/payment-points-part-3-escrow-contracts/200X675.jpg)

在上一篇文章中，我们讨论了需要点支付合约的一种闪电网络功能，叫做 “无滞支付”。无滞支付让用户可以同时尝试多个支付路径，而不必担心它们同时生效或遇上无法路由的情形。想要了解支付点合约的深入描述以及它们解决了什么问题，看我们本系列的[第一篇文章](https://suredbits.com/payment-points-part-1/)（[中文译本](https://www.btcstudy.org/2021/10/26/payment-points-part-1-replacing-HTLC/)）。在这篇文章里，我们会继续这个系列，讨论另一个需要用到支付点合约来实现的优秀提议：闪电网络上的托管合约（Escrow Contracts）！

<details><summary><strong>点支付合约系列</strong></summary>
<a href="https://suredbits.com/payment-points-part-1/">Payment Points Part 1: Replacing HTLCs</a><br>
<a href="https://suredbits.com/payment-points-part-2-stuckless-payments/">Payment Points Part 2: “Stuckless” Payments</a><br>
<a href="https://suredbits.com/payment-points-part-3-escrow-contracts/">Payment Points Part 3: Escrow Contracts</a><br>
<a href="https://suredbits.com/payment-points-part-4-selling-signatures/">Payment Points Part 4: Selling Signatures</a>
</details><br>

## 闪电网络上的托管合约

[托管合约](https://lists.linuxfoundation.org/pipermail/lightning-dev/2019-June/002051.html)在需要使用外部系统来处置比特币时是非常有用的。

一个托管合约有 3 个参与方：Alice、Bob（两个希望缔结合约的人）以及 Erin（他们信任的托管者）。合约的内容可以是任意的，只要是两人相信 Erin 可以证实的东西就行。这意味着任何类型的智能合约都在可以用这种方式来执行。就像 ZmnSCPxj 的[原创提议](https://lists.linuxfoundation.org/pipermail/lightning-dev/2019-June/002028.html)一样，如果我们使用支付点合约，我们就有可能在闪电网络上支持任意的托管合约。

为简单起见，我会用一个例子来演示：Alice 希望给 Bob 提供的服务付费；如有必要，两人信任的 Erin 会介入。

Alice 和 Bob 各自生成密钥对 (a，A = a * G) 和 (b, B = b * G)，而 Erin 的公钥 E = e * G。Alice 可以计算出一个[秘密值](https://en.wikipedia.org/wiki/Diffie%E2%80%93Hellman_key_exchange)，这个秘密值只有她知道，但如果 Erin 知道 A 的值，也可以揭开。我们把这个秘密值记为 ae = hash(a * E) = hash(e * A)。而 AE = ae * G 就是这个 Alice 和 Erin 共享秘密值相关的椭圆曲线点；令 B' = B + AE，即 Alice 给 Bob 的合约的支付点，所以支付证明就是 b+ae。

如果 Alice 对 Bob 提供的服务满意，她可以直接告诉他 ae 的值；有了这个值，Bob 就可以让 Alice 的支付生效。如果情形相反，Bob 没有履行服务，支付就会超时，他就得不到支付。  

现在考虑其中一方作恶的情形。假设 Alice 享受了服务却不愿意支付，那 Bob 就可以拿着 A 去找 Erin，Erin 可以计算出 ae。如果 Erin 判定  Bob 履行了服务，她可以跟 Bob 分享 ae，从而 Bob 就可以完成支付。如果情形反过来了，是 Bob 没有提供服务却想拿走 Alice 的钱，那 Erin 就不会给 Bob 秘密值，Bob 也是自讨没趣。

更复杂的合约（也即不是一方支付、另一方收钱的这种）也是可以实现的，办法是使用双向的多次支付。类似地，超过两方参与一个合约也是可以的。

这里我略过了一些细节，大部分是关于如何让这个合约保持隐私、让 Erin 除非被召唤否则压根不知道有这么个合约的。我建议大家阅读  lightning-dev 邮件组中讨论[托管合约](https://lists.linuxfoundation.org/pipermail/lightning-dev/2019-June/002051.html)的原始帖子，可以了解这些重要事情的全面讨论。

下一篇文章我们会继续深入点支付合约的世界，看看签名如何能在闪电网络中免信任地销售。

（完）

> *[后篇中文译本](https://www.btcstudy.org/2021/12/17/payment-points-part-4-selling-signatures/)*