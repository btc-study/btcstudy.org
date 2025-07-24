---
title: '比特币 Layer 2 之 Statechain'
author: 'Shinobi'
date: '2025/06/22 02:16:36'
cover: ''
excerpt: '通过协调者的帮助，让一整个 UTXO 的所有权在链下不同用户间转移'
tags:
- Statechain
---


> *作者：Shinobi*
> 
> *来源：<https://bitcoinmagazine.com/technical/bitcoin-layer-2-statechains>*



“[Statechain](https://github.com/RubenSomsen/rubensomsen.github.io/blob/master/img/statechains.pdf)” 是一个原创的二层协议，最初由 Ruben Somsen 在 2018 年提出；初版提议依赖于 “eltoo（或者说 LN Symmetry）”提议。在 2021 年，CommerceBlock 团队开发出了初版提议的一个变种：“Mercury”。2024 年，最初的 Mercury 又迭代了一个版本，成为 “Mercury Layer”。

Statechain 提议讲起来要比其它系统（比如 [Ark](https://bitcoinmagazine.com/technical/bitcoin-layer-2-ark)（[中文译本](https://www.btcstudy.org/2025/06/10/bitcoin-layer-2-ark-by-shinobi/)） 或闪电通道）要复杂，因为从初版提议的设计到两个已经实现的变种，再到曾被零散提议的设计，它允许的变异范围很大。

与 Ark 实例一样，Statechain 实例也依赖于一个中心化的协调服务商。但与Ark 协议不同的是，statechain 的信任模型与 Ark 批次中的一个 vUTXO 略有不同。Statechain 依赖于协调服务商删去以往生成的一个私钥的碎片，以保持免信任性；但只要服务商遵循了定义好的协议，他们就提供了一个强大的安全性保证。

Statechain 的总体想法是，通过协调者的帮助，让一整个 UTXO 的所有权在链下不同用户间转移。它不像闪电通道那样要求收款方有收款额度，协调服务商也不需要像在 Ark 协议中那样提供流动性。

我们还是先来看看 Ruben Somsen 提出的初版协议吧。

## 最初的 Statechain 提议

对于一个 Statechain 的最新所有权人来说，这笔资金由两部分组成：（1）一笔预签名的交易，让 TA 可以随时在链上单方面取出资金；（2）一笔密码学签名的历史消息，证明以往的所有权人以及他们所授权的 statechain 转账的接收方。

最初的设计建立在使用 [ANYPREVOUT](https://bitcoinmagazine.com/technical/how-sighash-anyprevout-and-eltoo-could-improve-the-lightning-network) 的 eltoo 协议上，但当前关于如何启用相同功能的一种想法是利用 [CHECKTEMPLATEVERIFY](https://bitcoinmagazine.com/technical/bitcoin-covenants-checktemplateverify-bip-119)（CTV）和 [CHECKSIGFROMSTACK](https://bitcoinmagazine.com/technical/bitcoin-covenants-checksigfromstack-bip-348)（CSFS）（具体做法的一个概要解释可在关于 CSFS 的文章结尾找到）。它们背后的基本想法是，产生一种脚本，使得一笔预签名的交易可以花费任何带有此脚本且具有一定价值的 UTXO，而不是让预签名交易只能花费某一个 UTXO。

在 statechain 协议中，希望将资金存为 Statechain 的用户先联系一个协调服务商，然后走存款流程。这个存钱的用户我们称为 Bob，会生成一个只有他自己知道的密钥（“唯一密钥”），以及一个最终会被分享出去的 “临时密钥” （详情我们后面再说）。然后，他们可以构造一笔存入交易，将 Bob 的资金锁入一个需要协调员密钥以及临时密钥的签名才能花费的多签名地址中。

基于这个多签名地址，Bob 和协调员签名一笔交易，花费这笔资金、创建一个 UTXO：它既可以被临时密钥和协调员密钥使用 LN Symmetry 协议签名的任何交易花费，也可以被 Bob 唯一密钥在一个时间锁过期后花费。现在，Bob 可以为上述的存入交易签名并广播出去，然后这个 Statechain 就创建好了。

为将一个 Statechain 转移给 Charlie，Bob 必须完成一个多步骤的流程。首先，Bob  用自己的唯一密钥签名一条消息，表示自己准备将这个 Statechain 转移给 Charlie。Charlie 必须也签名一条消息，表明他已经从 Bob 处收到了这个 Statechain。最后，协调服务商必须签名一条新的交易，允许 Charlie 单方面在链上取出这个 Statechain 上的资金，然后 Bob 给 Charlie 发送临时密钥的副本。

所有步骤都是使用 “适配器签名” 来实现原子化的。这些签名会以特殊方法修改：加入的一段随机数据使它们成了无效签名，然而，如果签名的持有者得到了与那段随机数据对应的一段信息，就可以再度产生一个有效的签名。上述所有消息，以及新的预签名交易，都使用了适配器签名，并通过适配器数据的释放，在同一时间原子化地成为有效消息。

Statechain 的持有者必须信任协调服务商永不会跟前任所有权人勾结、签名立即关闭 Statechain 的交易（从而盗取属于当前所有权人的资金），但是，如果这个协调员这么做了，预签名消息的链条可以证明 TA 参与了盗窃活动。如果一个前任所有权人尝试使用自己手上的预签名交易来盗窃资金，（资金的目的地依然包含前述的两条花费路径），仅需动用其密钥的路径带有时间锁，因此现任所有权人有时间提交自己手上的预签名交易（其花费的是第一条使用 LN-Symmetry 的路径），从而正确地在链上取走资金。

## Mercury 和 Mercury Layer

最初的 statechain 架构需要软分叉（添加 ANYPREVOUT 或类似功能）才能工作。CommerceBlock 则设计了不需要软分叉的 statechain 变种，但功能性便有所牺牲。

其基本的思路与原始设计保持一致，所有用户都持有一笔预签名交易，允许他们单方面取出资金，而且协调员服务商依然在协调链下转账时扮演重要角色，用户们需要信任 TA 会诚实行动。两个重大区别是用户得到的交易的签名方式，以及这些预签名交易的结构。

首先是签名。用户之间不再传递临时私钥。相反，Mercury 使用一种多方计算（MPC）协议，使得用户和协调员可以合作生成一个私钥，但各自都只有该私钥的一部分，没有哪一方知道完整的私钥。这个私钥就用来签名预签名交易。这个 MPC 协议还允许现任所有权人和协调员与第三方（转账的接收者）参与第二轮协议，让协调员和第三方能生成 *另一份* 碎片但得到相同的私钥。在 Mercury 和 Mercury Layer 协议中，在完成一次转账之后，诚实的协调员需要删除对应于上一任所有权人的密钥材料。只要这么做了，协调员就不再能够跟前任所有权人合作签名，因为协调员手上仅剩的碎片与任何一个前任所有权人的碎片都不匹配，无法生成正确的私钥。这是比原始提议更强的安全性保证，只要协调员诚实的话。

Mercury 和 Mercury Layer 的预签名交易无法使用 LN Symmetry（还没有软分叉添加这个功能）。因此，CommerceBlock 选择了使用递减的时间锁。最早一位所有权人的预签名交易使用了 nLocktime 字段，也即绝对时间锁，在足够远的未来才能动用。随着每一次转账发生，后续一位用户获得这个 Statechain，其获得的预签名交易的绝对时间锁就比前一任所有权人的短出一个预定义的长度（可以更快动用）。这就保证了前任所有权人甚至没法抢先在链上提交预签名交易（最新的所有权人的预签名交易总是最快能够广播的），但这也意味着，到了某个时间点，最新的所有权人就 *必须* 在链上关闭自己的 Statechain，否则上一任所有权人就有机可乘。

Mercury 与 Mercury Layer 的主要区别在于交易签名的方式。在 Mercury 中，协调员服务商可以看到当前用户提议的转账，能够验证和签名。而在 Mercury Layer 中，由于使用了盲签名协议，协调员无法看到他们签名的交易的任何细节。因此，服务商必须使用匿名记录以及当前所有权人的一个特殊授权密钥来跟踪各个 Statechain，以保证只会签名有效的转账。

## 与其它方案的协同

Statechain 可以跟基于预签名交易的其它 Layer 2 方案协同工作。举个例子，初版提议的一部分提议结合 statechain 和闪电通道。因为两者都使用预签名交易，所以可以在一个 Statechain 中封装一条闪电通道。这只要求当前所有权人的单方退出密钥是一个多签名，并创建预签名交易将其 Statechain 花到一条闪电通道中。这让闪电通道可以完全在链下开启和关闭。

类似地，可以在一个 Ark 轮次的一个 vUTXO 中封装一条 Statechain。这只需要构建对 statechain 必要的、花费该 vUTXO 输出的预签名交易。

## 总结

Statechain 不是完全免信任的，但它已经很接近信任最小化；其流动性效率非常高，而且允许任何愿意接受 statechain 的信任模式的用户在链下转移 UTXO。

虽然初版提议还未实现，由 CommerceBlock 设计的两个变种已经完全实现。两者在现实世界中都只获得了边缘用户。这是因为用户们不愿意接受其中的信任模型，亦或只是因为营销不力、关注不高，很难下定论。

但不管怎么说，给定有两种完整的实现，而且只要 LN Symmetry 在比特币上实现就可以设计出更灵活的变种，这是一种永远可用的选择。开源软件好的地方就在于，它总是在那里，无论人们是现在就使用，还是等待未来。

