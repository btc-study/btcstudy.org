---
title: '基于 Statechain 的闪电网络通道'
author: 'SHINOBI'
date: '2023/01/12 11:19:57'
cover: ''
excerpt: '在一笔 statechain 资金上建立一条闪电通道'
tags:
- 闪电网络
- Statechain
---


> *作者：SHINOBI*
> 
> *来源：<https://bitcoinmagazine.com/technical/statechain-lightning-combined-in-bitcoin>*



去年我写过 [Commerceblock 团队开发的 Mercury Wallet](https://bitcoinmagazine.com/technical/a-new-privacy-tool-for-bitcoin) 功能，这是一种 [statechain](https://bitcoinmagazine.com/technical/statechains-sending-keys-not-coins-to-scale-bitcoin-off-chain) 和 [CoinSwap](https://en.bitcoin.it/wiki/CoinSwap) 的双料实现。它既引入一种新的混币工具，又是第一种实现了 statechain 这种新的二层扩展方案的钱包。他们团队在 Ruben Somsen 的原始 statechain 提议基础上作了一些变更，使得没有 [ANYPREVOUT/Eltoo sighash flag](https://bitcoinmagazine.com/technical/how-sighash-anyprevout-and-eltoo-could-improve-the-lightning-network) 也能正常实现 statechain，还整合一种新的 CoinSwap 设计，让用户可以多次混币而无需在链上交互。

## 背景

给尚未读过我前一篇文章的读者简单总结一下：statechain 是一种离链机制，用于在完全离链的任何人之间免费地转账。资金的原始所有者跟一个 statechain 运营者合作，构造一个 ECDSA-MPC 地址，该地址的私钥是分成两半的，一半在用户手里，另一半在运营者手里，然后双方要一起构造一个带有时间锁的取款交易并签好名，再然后用户再把钱打到这个地址里去。

没有任何一方完整控制这个私钥，而且用户拿着一个预先签好名的交易，因此可以在时间锁解锁后单方面拿回这些资金。当用户希望转移这笔资产时，他们就通知运营者，后者跟支付的接收方合作，一起创建新的一组私钥碎片（但跟原来的私钥碎片有相同的地产），然后生成另一笔带有时间锁（且时间锁更短）的交易并签名；最后，运营者删除上一份私钥的碎片。

如此一来，现在运营者手上的私钥碎片，将仅能与资金的新主人手上的私钥碎片结合，所以只要他们删除了旧的私钥碎片，他们就无法与资金的旧主人一起花费资金。此外，越新的取款交易，其时间锁越短，因此资金的新主人总是能比旧主人更快取走资金。这种机制限制了 statechain 资金可以转移的次数，到点了就必须取出（否则便有可能被旧主人取走）。

## 基于 statechain 的闪电通道

Commerceblock 现在正在撰写一个[新的 BLIP](https://github.com/commerceblock/blip-XXXX/blob/main/blip-XXXX.md)（比特币闪电网络升级提议），以实现一种在 Somsen 的最初提议中便提出的东西：在一笔 statechain 资金上建立一条闪电通道。

statechain 自身的一个缺点在于，每次转移时，都是整个 UTXO 一起转移的。但是，假如 statechain 的取款交易不是把资金转移到一个普通用户的地址中，而是转到一条闪电通道中呢？那么 statechain 资金的一部分就可以通过通道的初始余额分布来传输，而这条通道随后便可按常规发起闪电支付。

整个流程也从一名用户创建一笔 statechain 资金起步。创建者和这个 Statechain 的运营者走一遍常规流程：创建共有私钥，并签名带有时间锁的区块交易；然后创建者（Alice）找到一个愿意接受 statechain 资金的通道对手方（Bob）。Alice 和 Bob 一起，如法炮制 Alice 与运营者一起分割私钥的流程，创建出他们自己的共有公钥。然后，俩人都把他们的共有公钥和个人公钥碎片分享给这个 Statechain 的运营者。这使得运营者可以质询他们，让他们各自签名并证明自己同意按最新的余额合作关闭 statechain，而不必等候 statechain 的取款时间锁过期。

从这里开始，有了 Bob 的授权，Alice 和这个 Statechain 的运营者就可以签名一笔交易，将 statechain 中的资金直接花费到一个多签名的闪电通道中，并处理闪电网络通道的创建流程（译者注：这条通道是 Alice 和 Bob 的通道）。这时候，这个 Statechain 地址依然控制在 Alice 和运营者手中，但开启闪电通道的交易现在到了 Bob 手上，而且其时间锁比最初那笔取款交易更短，保证了这笔交易可以在 Alice 单方面关闭这个 Statechain 之前就生效。然后，Alice 和 Bob 跟运营者完成最后一次更新，使用他们的共有公钥跟运营者创建一笔将 statechain 资金花费到 Alice-Bob 通道的取款交易（译者注：常规的 statechain 转账，让 Alice 和 Bob 的共有公钥变成这个 statechain 的新主人），并且这笔取款交易的时间锁更短。现在，Alice 和 Bob 可以向外公布自己有一条闪电通道了。

（译者注：这套协议的目的是基于一笔 statechain 资金，在当前所有者和意向支付者之间创建一条通道，从而允许当前所有者分割 statechian 资金、仅支付部分资金给意向支付者。在协议结束后，相关的 Statechain 将不再属于原主人（在这里是 Alice），因为跟 Alice 匹配的私钥碎片已被运营者销毁；取而代之的是 Alice-Bob 的通道。

（译者注：它的缺点，或者说尚不完备的地方，在于 Alice 其实无法把通道（或者说自己剩下的余额）全部转给 Carol，因为这需要把 Alice 和 Bob 在通道内发生的所有交互的记录都转移给 Carol，否则 Alice 和 Bob 可以串谋欺诈 Carol；但这里没有设计保证 Alice 转移了所有资料的机制，这需要 Alice/Bob 在每次发起闪电支付之后，都提交一个承诺。不过，基于上文所述的原理，也可以考虑将它实现为多方参与的 coinpool，而不是两方参与的闪电通道。）

## 提升 statechain 的效用

这一提议将大大提升 statechain 的效用，因为它放宽了 statechain 原本严格的流动性要求。不论什么时候某人想接受一笔 statechain 资金但发现面额跟支付额不匹配，发送者都可以通过跟 TA 开启一条闪电通道来解决这个问题，直到某一方花完自己剩下的资金（或者说通道中的资金全部属于其中一方），再完成一笔转移全部 statechain 资金的转账。这样的可能性不仅提升了 statechain 的用途，也提高了闪电网络的效用（如果这套协议得到合理的支持的话）。

通道内余额的再平衡，对闪电网络中的节点是必要的功能，不论你是路由节点还是仅仅收发交易的边缘节点。当通道内的资金全部移动到了通道的一端，这条通道就失去了向某个方向传递支付的作用（如果所有资金都在你这边，你就没法通过这条通道收取支付了；如果所有资金都在你的对手那边，那你就没办法使用这条通道来支付了）。所以，你需要把一条通道中的资金移动到另一条通道中，通过引起别的通道的失衡来重新平衡你自己的通道。最终，这样的动态会以某处的通道必须在闪电网络和链上交换资金收尾。

Statechain 则允许流动性像在链上移动那样，但又不需要创建链上的足迹，也不必为此支付手续费。假设你有一条枯竭的通道，所有的余额都在你的对手那边，你已经没有可以花费的容量了，同时你又有一个 Statechain 资金。那么，你可以把这笔 Statechain 资金转移给任何愿意接受的人，假如你不能花费全部的 Statechain 资金，那么你可以在它之上建立一条闪电通道，而且这条通道也可以用来再平衡你的普通闪电通道。

从再平衡你的通道需要经过的通道数量上看，这将允许提升效率（别忘了，当你要再平衡你的通道时，它会让资金流经的每一条通道都失衡），最优的情况下，你可以直接将资金发送给同一个对手，从而再平衡你的通道。如果你希望关闭某一条通道，跟另一个人开启另一条通道，你甚至可以将此通道中的所有余额都再平衡掉、全部转移到你跟新对手基于 statechain 建立的新通道中。

## Statechain 和闪电网络的未来

在讨论他们未来的计划是，Commerceblock 的 Nicolas Gregory 说：“我们的计划是建立一套结合 statechain 和闪电网络技术的标准方法，从而协助闪电网络通过使用 state channel 在链下完成再平衡。当前的这套规范将成为实现这一目标的基石。”

在一开始，statechain 就被提议跟闪电网络结合，以解决它自身的一个问题：在支付时必须转移整个 UTXO 的价值。这也为闪电网络提供了一定程度的灵活性，因为闪电网络没有自身的流动性管理方法。

现在，闪电网络已经处在早期增长的健康阶段，而一份可靠的 statechain 实现也已经存在超过一年了，所以，是时候考虑结合两者了。闪电网络，作为一个网络，是一个可在任意没有直接联系的两方之间自动化处理转账的系统。至于网络图谱中的各通道的内部是如何工作的，严格来说，对于发送者和接收者，都是无关紧要的；只要建立通道的两方自己过得去就行。

Statechain 和闪电通道都给对方提供了许多好处，我们需要做的，就是开发出让两者交互的标准化方法。

（完）