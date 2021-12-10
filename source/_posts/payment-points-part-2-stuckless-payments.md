---
title: '点支付合约简介，Part-2：无滞支付'
author: 'Nadav Kohen'
date: '2021/12/10 16:05:29'
cover: '../images/payment-points-part-2-stuckless-payments/branded.jpg'
excerpt: '不会卡住的闪电网络支付'
categories:
- 闪电网络
tags:
- 闪电网络
---


> *作者：Nadav Kohen*
>
> *来源：<https://suredbits.com/payment-points-part-2-stuckless-payments/>*
>
> *[前篇中文译本](https://www.btcstudy.org/2021/10/26/payment-points-part-1-replacing-HTLC/)*

在我们的[上一篇文章](https://suredbits.com/payment-points-part-1/)中，我们讲到了，使用原像和哈希值来做闪电网络的原子化支付，可能导致路由支付的关联曝光以及遭遇虫洞攻击。我们也讨论了，使用标量和点来替代原像和哈希值，可以隐去支付之间的关联，并解决哈希支付面临的问题。在本文中，我们将讨论基于点支付，闪电网络上可以出现的一些新功能！

<details><summary><strong>点时间锁合约系列</strong></summary>
<a href="https://suredbits.com/payment-points-part-1/">Payment Points Part 1: Replacing HTLCs</a><br>
<a href="https://suredbits.com/payment-points-part-2-stuckless-payments/">Payment Points Part 2: “Stuckless” Payments</a><br>
<a href="https://suredbits.com/payment-points-part-3-escrow-contracts/">Payment Points Part 3: Escrow Contracts</a><br>
<a href="https://suredbits.com/payment-points-part-4-selling-signatures/">Payment Points Part 4: Selling Signatures</a>
</details><br>
在当前的闪电网络中，即使已经过了启动阶段，支付也是可以 “卡住” 的。所以资金可能会锁在哈希时间锁合约（HTLC）中，等时间锁过期后才能解锁（可能要等待很成一段时间）。支付卡住可能因为很多原因。应当注意的是，一个恶意节点也可以扣住你的支付，而不必付出任何个人代价（只不过得不到 TA 本可以获得的手续费）。即使有办法可以在启动期间解除支付，结算也有可能卡住（较不严重）。在这种情况下，接收方可以收到资金，但支付方得不到支付凭证（Proof of Payment，PoP）。

几个月前，Hiroki Gondo 曾经在 lightning-dev 邮件组中提出过一个无滞支付的[提议](https://lists.linuxfoundation.org/pipermail/lightning-dev/2019-June/002029.html)，通过在启动阶段和结算阶段之间增加一轮叫做 “更新” 的通信，来解决这两个问题。

（译者注：下面这一段需参考前一篇文章，才了解其区别。）

假设 Alice 要给 Carol 支付，如图所示。在 “启动” 阶段，在 Alice 把随机数的和通过洋葱网络发给 Carol 之前（注意，这个和是要用在这次路由支付的 “结算” 阶段的），Carol 在自己收到哈希时间锁合约（表明支付在 “启动” 阶段并没有卡住）后，先发送一个 ACK 给 Alice。收到 ACK 之后，启动阶段才算完成；这时候 “更新” 阶段开始，Alice 把随机数的和发给 Carol，然后 Carol 回复以支付凭证（因为从功能上来说，支付已经完成了）。最后，“结算” 阶段如往常一样进行。

![Stuckless Payments](../images/payment-points-part-2-stuckless-payments/ntPoint.png)

这就解决了支付在结算阶段卡住的问题，因为 Alice 在结算阶段开始前就已经收到了支付凭证。

但它如何解决支付在启动阶段卡住的问题呢？答案是：现在卡住的交易可以安全地重发了。

Alice 不仅可以重新尝试以新路径给 Carol 支付，她甚至可以并行尝试两笔支付！因为 Alice 没有给 Carol 用来结算支付的信息，要到更新阶段才给，所以 Alice 可以安全地跟 Carol 启动多个路径，Carol 也知道只有其中一个路径会被使用。这是因为只有 Alice 可以启动更新阶段，Carol 无法径直结算 Alice 启动的所有支付（而在当前的闪电网络中 Carol 是可以这么做的）。因此，Alice 尝试创建的支付中只有一个会成功启动，只有这个会成功，其它的都会失败。

注意，Bob 在这里要做的与普通的闪电支付没有什么不同。所以，这个方案不需要所有闪电节点都使用，只需每笔支付的终点节点使用就可以了（可能还要加上路由 ACK 和更新信息的所有节点）。

另一个重要提醒是，虽然一种类似的方案可以使用哈希值和原像来实现，但它会要求 Alice 一开始就知道哈希值的原像，所以还是得不到支付凭证。支付凭证是非常重要的，不仅因为应用层的代码依赖于它，还因为它可以用来搭配使支付与其它操作原子化，例如[信息解密](https://suredbits.com/paid-apis/)。

这种 “无滞” 支付提议是许多依赖于点支付方案的闪电网络提议之一。在我的下一篇文章中，我们会继续这个系统，讲解另一个应用：闪电网络上的托管合约！

