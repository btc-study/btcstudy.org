---
title: '闪电网络隐私性研究（一）：简介'
author: 'Max Hillebrand'
date: '2023/02/27 13:37:34'
cover: ''
excerpt: '如果一笔闪电交易可以很容易跟一笔比特币交易关联起来，那它就会继承那笔比特币交易的隐私性'
categories:
- 闪电网络
tags:
- 隐私性
---


> *作者：Max Hillebrand*
>
> *来源：<https://lightningprivacy.com/en/introduction>*
>
> *本文为多位作者的合作作品。作者详见[此页](https://github.com/BitcoinDevShop/lightning-privacy-research)。*



比特币交易一旦发布到比特币区块链上，就将永远公开；而有效的比特币交易，也必须引用（至少一笔）出现在比特币区块链上的交易 <sup><a href="#note1" id="jump-1">1</a></sup>。关于隐私地使用比特币，[已经有了许多得到充分支持的最佳手法](https://bitcoin.org/en/protect-your-privacy)，只是还不算尽善尽美。

作为比特币上的二层，闪电网络可以极大地帮助[提升比特币流转中的隐私性](https://abytesjourney.com/Lightning-privacy)。闪电网络没有统一的账本（不存在所有交易的永久记录） —— 所有的交易都是点对点地执行的 —— 而且交易之间也没有天然的关联。但是，闪电网络（在隐私性上），也不是尽善尽美的：

1. 作为一种二层方案，闪电支付通道建立在链上的比特币交易商。如果一笔闪电交易可以很容易跟一笔比特币交易关联起来，那它就会继承那笔比特币交易的隐私性。
2. 不会有人能够知道每一笔闪电交易，但参与一笔交易的两个对等节点知道关于这笔交易的特定事实。如果他们公开了这些信息，或者让这些信息与别的信息关联起来，那么其他人就能让这些交易去匿名化。
3. 中心化带来了两种风险：更多连接的节点可以看到网络活动的更大部分，更能够作出有效推理。

这里有一个思考如何隐私地使用闪电网络的好角度：

> 某一个操作的匿名集有多大？

就是说，如果你要发起一笔交易，那么网络上有多少人会发起跟这笔交易看起来差不多的交易？

举个例子，如果我有一个未公开的通道，然后我又直接向我的通道对手发送了一笔支付，那么我的对手就可以合理假设我在向他支付，因为：*还有谁能通过这条只有我们两个人知道的通道路由支付呢？*

## 我们的研究的概述

有了这个框架，我们就可以开始研究闪电网络隐私性的优化方案了，不论是协议层面的，还是用法层面的，都可以。知晓了[当前隐私性最佳的习惯和陷阱](https://abytesjourney.com/lightning-privacy/)之后（[中文译本](https://www.btcstudy.org/2022/03/24/current-state-of-lightning-network-privacy/)），我们还能做什么来提升闪电支付的隐私性？

我们将我们的研究分成了三个篇章，虽然同时采用多种技术显然会有复合作用，但也有可能产生陷阱，让整套隐私技术失效。没有 一劳永逸的解决方案，至少现在没有！

### 路由分析

在“[路由分析](https://lightningprivacy.com/en/routing-analysis)”一节，我们会研究网络上的第三方节点通过在支付路由中扮演一跳乃至多跳、从而攻破发送者隐私性和接收者隐私性的办法。我们将探究 PTLC、Timing Delay 和多路径支付在内的一些缓解措施。

### 通道 Coinjoin

在“[通道 Coinjoin](https://lightningprivacy.com/en/channel-coinjoins)”一节，我们会了解链上输出与闪电通道的关联：通道的开启和关闭交易可能会伤害一个闪电通道的隐私性。这个问题对于在网络中公开了通道的路由节点来说尤其严峻。潜在的解决方法包括多种形式的 Coinjoin，比如通道内部和外部的 Coinjoin，还有通道拼接（splicing）。

### 盲化路径与蹦床路由

在“[盲化路径与蹦床路由](https://lightningprivacy.com/en/blinded-trampoline)”一节，我们将专注于接收者隐私问题。在当前的闪电网络中，接收者会在闪电发票中暴露自己的节点公钥，以便发送者知道如何将支付送达，这就让保证接收者的隐私变得很难。我们研究了“盲化路径（Blinded Paths）”和“蹦床路由（Trampoline Routing）”的潜能，以及两种的可能结合方式。

## 欢迎反馈

本研究在 [lightning-privacy-research](https://github.com/BitcoinDevShop/lightning-privacy-research) 库开源了。欢迎一切评论、建议、修正和额外的想法。

## 关于作者

我们是一群密码朋克、比特币人和隐私至上主义者，正在研究和开发为保护用户的隐私性和安全性而优化的下一代闪电网络客户端。我们是：

[benthecarman](https://github.com/benthecarman)、[Evan Kaloudis](https://github.com/kaloudis)、[Max Hillebrand](https://github.com/maxhillebrand)、[Paul Miller](https://github.com/futurepaul)、[Tony Giorgio](https://github.com/TonyGiorgio)

## 致谢

在撰写本文过程中，我们采访了几位闪电网络专家，从他们那里了解了关于闪电网络和隐私性的知识，包括：[Rusty](https://mobile.twitter.com/rusty_twit)、[t-bast](https://mobile.twitter.com/realtbast) 和 [Dusty](https://mobile.twitter.com/dusty_daemon) 。

## 感谢资助

这项工作得到了 [zkSNACKs](https://github.com/zksnacks)、[Dan Gershony](https://github.com/dangershony) 和 [Wasabi Wallet 团队](https://wasabiwallet.io/)的[慷慨资助](https://blog.wasabiwallet.io/1-11-btc-ln-privacy-grant/)。

## 脚注

1.<a id="note1"> </a>只有 coinbase 交易不必引用以前的交易，它可以接收挖矿奖励。 <a href="#jump-1">↩</a>

> 续篇见[此处](https://www.btcstudy.org/2023/02/28/lightning-privacy-research-routing-analysis/)。

