---
title: '比特币与以太坊的扩容路线区别'
author: 'gentryverse'
date: '2021/10/24 21:13:54'
cover: ''
excerpt: '把抗性和去中性化看得比资本效率和用户友好更重'
categories:
- 比特币主网
tags:
- 文化
---


> *作者：gentryverse*
> 
> *来源：<https://twitter.com/RyanTheGentry/status/1312092552305225730>*



好了，我们都知道把全网共识的区块空间用于实际计算，是没法扩容的；区块空间最好用于链下计算的验证。这里有一些我对以太坊的扩容方法和比特币扩容方法异同的思考，供大家参考。

长文预警！

首先是定义：

1）广播（broadcast）交易：所有人通过 gossip 网络发给所有人。所有的 L1 交易都是这种类型。受制于可扩展性三难问题

2）单播（unicast）交易：一对一的直接通信，仅在两个对等节点间发生（闪电网络）

3）多播（multicast）交易：一对多的通信，在对等节点的一个子集中发生（rollup、侧链）

比特币和以太坊的 L1 都使用广播通信。但（我个人认为）因为比特币使用 UTXO 模式而以太坊使用账户模式，所以比特币会优先尝试通过单播交易（闪电网络）来扩展，而以太坊一开始对单播交易的兴趣已经过去了，转向了多播交易。

先来谈谈以太坊。Rollup 方案很酷！像这样的多播结构显然比单播结构的资金效率更高。只要设计得当，对用户来说也友好得多，因为这些多播方案是非交互式的：用户无需运行节点也无需自己管理通道，甚至无需做任何事。

为了获得用户的信任，rollup 的验证者要在链上发布 L2 交易数据和执行证明。这是因为，当 Alice 把钱存进一个 rollup 系统时，她本质上是放弃了自己的 L1 资金的控制权、交给了管理这个 rollup 的验证者的合约账户。

如果这些验证者 行为不轨/玩失踪，Alice 只能从这个合约账户处取回自己的资金，前提是能证明她的密钥有对这个合约账户的求偿权。而获得这个证明需要从这个 rollup 的创世状态开始执行其历史上的所有交易（如上所述，交易历史从链上数据中获得）。

所以：“数据可得性 + 欺诈证明 ”是以太坊多播交易的安全前提，因为合约账户完全托管着资金。这种模式有一些好处，但在两个（可能造成全局故障的）单点处积累了大量压力：智能合约代码、dapp 接口。

作为连接这些多播 rollup 空间的一种办法，单播交易又回到了以太坊的扩展故事中。大规模的 rollup 间转账需要在链上路由，既慢又贵，除非 OVM 验证者 Bob 和 zk-sync 验证者 Carol 之间有状态通道！

在我看来，所有的全球公链都要为自己的广播基础层匹配一种单播和多播交易的混合方案。以太坊已经为了对用户友好，把他们的链下系统的复杂性推给了验证者 —— 希望他们的故障单点不会出错！

（中场提问：[@jadler0](https://twitter.com/jadler0)、[@ercwl](https://twitter.com/ercwl)、[@gakonst](https://twitter.com/gakonst)、[@paddypisa](https://twitter.com/paddypisa) 各位，现在有哪个 rollup 系统是由多个验证者来运营的么？还是说全都是一个节点来 维护链下数据库 + 创建广播交易 + 证明 呢？）

总的来说，比特币协议的开发者对自主托管和自主验证的重视程度，要比以太坊开发者高得多。我确实认为，这就是多播交易（即侧链）没有看到什么起色，一直被当成次要于单播交易（即闪电网络）的方案。

就像 rollup 方案一样，当比特币持有者 Alice 把自己的 UTXO 存进一个多播交易的环境（比如 RSK 或者 Liquid）时，她就完全放弃了币的托管。区别只在于，她确实需要信任这些链下系统的验证者不会作出恶意的行为，也不会玩失踪！

这是因为比特币脚本无法像 EVM 那样验证欺诈证明，而且，因为比特币考虑到链上数据的开销要所有的全节点运营者承担，在设计上让链上数据的经济成本很高。所以 Alice 没法向矿工证明自己仍有资格拿回那些钱。头疼！

但是，比特币开发者一直在开发闪电网络。在闪电网络的环境里，用户永远保持资金的控制权，代价是要运行自己的节点并管理一些单播通信的通道。这使得只有用户自己会成为单点故障，也就是免信任性！

这种权衡也可以用另一种角度来理解：把抗性和去中性化看得比资本效率和用户友好更重，这一言以蔽之也就是比特币与其它密码货币的区别！

不像 rollup，闪电网络是一个完全交互式的协议，需要对等节点一直在线。

我觉得这是一件非常好的事，因为比特币 Taproot 升级中的新的多签名特性也是高度交互式的（译者注：应指 Schnorr 签名）。只有参与的各方拥有安全、私密和永久的通信渠道时，它才能发挥作用 —— 那不就是闪电网络吗！

[链接：Musig 签名交互性](https://bitcoin.stackexchange.com/questions/91534/musig-signature-interactivity)

记不记得我前面说多播交易什么来着？它需要数据可得性和欺诈证明。需要这些，是因为你完全放弃了资金的托管，但希望保留向矿工证明你有资格取回那些钱的能力。但是，如果你不必放弃托管，就能加入一条侧链呢？

要是你能维持自己 UTXO 50% 的控制权，但是把剩下的 50% 分享给一个链下的验证者（或者一群使用门限签名的链下验证者）呢？只要你有可以用于交互的单播通道，那就不需要链上数据可得性和欺诈证明了。（译者注：此处所指的技术方案可能是 statechain）

想想这该多有趣？比特币可以有广播、单播和多播交易，无需使用新的权益证明检查点链、无需数据可得性分片、无需增加新的密码学假设，无需在价值观上妥协！

我认为，需要 OP_CTV 来让这些多播交易（基本上就是多个所有者共享一个 UTXO）变成非交互式的，对吗 [@JeremyRubin](https://twitter.com/JeremyRubin) ？

（完）





