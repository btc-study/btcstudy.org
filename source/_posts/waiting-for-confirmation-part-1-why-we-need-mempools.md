---
title: '等待确认 （一）：为什么我们需要交易池？'
author: 'Gloria Zhao'
date: '2023/06/25 16:23:16'
cover: ''
excerpt: '我们为什么不直接向矿工提交交易呢？'
tags:
- 交易池
---


> *作者：Gloria Zhao*
>
> *来源：<https://bitcoinops.org/zh/newsletters/2023/05/17/>*
>
> *译者：[Primitives Lane](https://github.com/PrimitivesLane)*
>
> *本文为 Gloria Zhao 在 Optech Newsletter 上编写的 “交易池” 系列周刊的第一篇。*

比特币网络上的许多节点，将未确认的交易存储在一个内存内的池子里，这个池子也被称为 “*交易池（mempool）*”。该缓存是每个节点的重要资源，使得点对点的交易中继网络成为可能。

参与交易中继的节点稳步而非陡然地下载和验证区块。每隔约 10 分钟发现一个区块时，没有交易池的节点就会出现带宽峰值，随之而来的是验证每笔交易的计算密集期；另一方面，具有交易池的节点通常已经看到了区块的所有交易并将它们存储在它们的内存池中。使用 “[致密区块中继](https://bitcoinops.org/en/topics/compact-block-relay/)”，这些节点只需下载一个区块头和 shortid，就可以使用其交易池中的交易来重建区块。与区块的大小相比，用于中继致密区块的数据量很小。验证交易也快得多：节点已经验证（并缓存）了签名和脚本，计算了时间锁要求，并已经出于必要、从磁盘加载了相关的 UTXO。该节点还可以迅速将区块转发给其他节点，从而显著提高网络范围内的区块传播速度、降低出现陈旧区块的风险。

交易池也可用于构建独立的费用估算器。区块空间市场是收费拍卖，保留交易池可以让用户更好地了解其他人在竞标什么以及过去哪些竞标成功了。

然而，没有“唯一交易池”这样的东西 —— 每个节点可能会收到不同的交易。向一个节点提交交易并不一定意味着它已经到达矿工手中。一些用户发现这种不确定性令人沮丧，并想知道，“我们为什么不直接向矿工提交交易呢？”

设想一种比特币网络，其中所有交易都直接从用户发送到矿工。人们可以通过要求少数实体记录与每笔交易对应的 IP 地址来审查和监视金融活动，并拒绝接受任何符合特定模式的交易。这种类型的比特币有时可能更方便，但会缺少一些比特币最有价值的特性。

比特币的抗审查性和隐私性来自于它的点对点网络。为了中继交易，每个节点都可能连接到一些匿名的对等节点（peers）集，每个对等节点都可以是矿工或与矿工有联系的人。此方法有助于混淆交易源自哪个节点，以及哪个节点可能负责确认它。希望审查特定实体的人可能会针对矿工、热门交易所或其他中心化提交服务，但很难完全阻止任何事情。

未确认交易的普遍可用性，也有助于最大限度地降低成为区块生产者的进入成本 —— 对被选择（或被排除）的交易不满意的人可能会立即开始挖矿。将每个节点视为交易广播的平等候选者，可避免给予任何矿工获取交易及其费用的特权。

总之，交易池是一种非常有用的缓存，它允许节点随时间分配区块下载和验证的成本，并让用户获得更好的费用估算。在网络层面，交易池支持交易分发和区块中继网络。当每个人都在矿工将它们包含在区块中之前看到所有交易时，所有这些好处最为明显 —— 就像任何缓存一样，交易池在 “火热” 时最有用，并且必须限制其大小以适应内存。

下周本栏目将探讨使用激励相容性作为判断哪些交易将保留在交易池中的最有用的指标。

> *[续篇见此处](https://www.btcstudy.org/2023/06/25/waiting-for-confirmation-2-incentives/)*