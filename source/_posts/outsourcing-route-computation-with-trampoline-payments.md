---
title: '使用 “蹦床支付” 来外包路径计算'
author: 'Omar Wagih'
date: '2022/03/29 16:14:55'
cover: ''
excerpt: '蹦床支付是一种新提出的外包方法，旨在让轻节点可以将路由计算外包给蹦床节点'
categories:
- 闪电网络
tags:
- 闪电网络
---


> *作者：Omar Wagih*
>
> *来源：<https://bitcointechweekly.com/front/outsourcing-route-computation-with-trampoline-payments/?source=post_page--------------------------->*
>
> *原文发表于 2019 年 4 月 30 日。*



闪电网络的路由是一个永无止境的优化问题，开发者不仅致力于降低计算开销和提高隐私性，也希望能以免信任的方式将路径的计算委托给其他节点。我们看一个 Layer 1 的例子。

全节点是自主严重交易的节点，他们保存着完整的区块链和 UTXO 集合，这两样数据使得他们能够基于确定的共识以及交易输出的历史验证任何交易。另一方面，轻节点自己不下载区块，而是使用 “简易支付验证（SPV）” 这样的方法来验证某笔交易在某个区块中是否存在；它们依赖其它全节点来承担 CPU/内存 密集型的操作。

闪电网络当前的运作方式是支付**发送者计算从自己的节点到接收者节点的路径**，这就意味着发送者的节点必须拥有实时更新的网络节点图，如果它没有跟接收者的直接连接，就要通过网络中的路径来连接。

对于当前的闪电网络来说也许是可行的，但当闪电网络的通道随着接受度的提高、增加到几百万条的时候，就未必了。“蹦床支付（Trampoline payments）” 是一种新提出的外包方法，旨在让轻节点可以将路由计算外包给 “**蹦床节点**”（本身是具有更多内存、带宽和计算资源的节点）。

有一个非常简单的例子，我们假设节点 A 要给 F 发送支付，而一条通道路径是这样的：

A → B → C → D → E → F

发送节点 A 只知道近邻，所以它不知道 F 在哪儿，但她知道 C 在哪。因此她将支付发送给 C，要求后者路由支付给 F。C 是一个蹦床节点，*知道整个网络*，所以她可以计算出给 F 的最高效的路径，并发送给 F。

开发者 Christian Decker 提出了多种实现方法。第一种是一个简单的变体，发送节点先发现一个邻近的蹦床节点，然后向其发送支付信息（主要是接收者的公钥以及支付的数额），这个蹦床节点会计算通达接收节点的路径、生成共享的秘密值、HMAC、一条新的洋葱路径，等等。不过，这种模式有个小缺点，就是隐私性，因为发送节点给蹦床节点提供了支付信息，蹦床节点现在知道了接收者是谁；在当前的闪电网络常规路由方法中是不会出现这个问题的，因为每个节点都只是路由交易到下一个节点，只知道下一个节点是谁，并不知道下一个节点是不是支付的终点。

另一种实现方法是多蹦床路由。这是一种更复杂的思路，包含两个洋葱路由层，内层描述了 “蹦床路由” 而外层描述了两个节点间的路由，这两个节点可能是支付者和蹦床，也可能是蹦床和蹦床、蹦床和接收者。

内层是一组从已知的节点中随机选出的蹦床节点，一旦某个蹦床节点收到了支付，它就解开内层的洋葱信息、获知下一个蹦床节点，然后它会找出通达这个蹦床的路径并创建带有有效负载的外层洋葱路由。这使得我们可以在多个蹦床之间弹送支付，并且不必让他们知道接收者是谁、发送者也无需保存完整的网络拓扑图。只要保证两个连续的蹦床节点有合理的机会找到通达彼此的路径即可。

这种方法也有所牺牲，它将路由的最大长度从常见的外部跳转的长度提高到了 `外部跳转长度 * 内部跳转的长度 ` 。这可能会导致更高的手续费，但它也会提高支付成功的光彩，因为这个提议使得闪电网络 “更接近 TCP/IP 上的 Tor”。实际上，就像 TCP/IP 连接，失败的支付可以多次重发，直到每一个蹦床节点都创建自己的洋葱路由。Lightning-dev 邮件组中已经有了关于这个想法的有趣讨论，还有例子和未来实现的细节，你可以在[这里](https://www.mail-archive.com/lightning-dev@lists.linuxfoundation.org/msg01200.html)了解更多。

参考：

- [Discussion](https://www.mail-archive.com/lightning-dev@lists.linuxfoundation.org/msg01200.html)
- [闪电洋葱路由](https://github.com/lightningnetwork/lightning-rfc/blob/master/04-onion-routing.md)
- [洋葱路由](https://en.wikipedia.org/wiki/Onion_routing)

相关：

- [在闪电网络上实现 “会合” 路由的提议](https://bitcointechweekly.com/front/proposal-for-rendez-vous-routing/)
- [Lightning Mesh Network](https://bitcointechweekly.com/briefs/lightning-mesh-network/)
- [同步通道更新的提议](https://bitcointechweekly.com/briefs/proposal-for-syncing-channel-updates/)
- [闪电节点的中心化](https://bitcointechweekly.com/briefs/measuring-node-centrality/)
- [闪电网络通道的免费再平衡提案](https://bitcointechweekly.com/front/free-rebalancing-proposals-ln-channels/)