---
title: '闪电网络的闭环悄悄到来'
author: 'Kukks'
date: '2025/11/19 10:31:50'
cover: ''
excerpt: '比特币的支付基础设施在表象之下已经发生了根本的变化，它并不让用户觉察'
tags:
- Ark
---


> *作者：Kukks*
> 
> *来源：<https://blog.arklabs.xyz/closing-the-lightning-loop-bitcoins-missing-layer-secretly-goes-live/>*



[视频：Ark 协议带来的一切](https://youtu.be/qPkgs1sLaX0)

[10 个月以前](https://blog.arklabs.xyz/ark-labs-at-bitcoin-amsterdam-2024-lightning-without-the-storms-the-future-of-bitcoin-scaling-b0f46cc4b5d1/)，我们确定了自身的使命 —— 解决比特币最长期的挑战之一：开发真正可用的支付基础设施。我们开始使用 Ark 的 VTXO 系统以及虚拟互换供应商来 “打造闪电网络流动性的闭环”。

这个月的早些时候，在里加（Riga）举行的 Baltic Honeybadger 2025 大会上，这个愿景成为现实：我们的 Ark 旗舰实现 “ [Arkade](https://arkadeos.com/?ref=blog.arklabs.xyz) ” 处理了第一笔主网支付。

大多数人所不知道的是，大会上的每一笔闪电支付都是运行在 Arkade 的基础设施之上的。大会的参与者们使用流行的闪电支付钱包（比如 Phoenix 、Wallet Of Satoshi 和 Aqua）来支付，既没有提前安装什么应用，也对这场实验一无所知。但是 —— 商家收到的是 VTXO ，不需要管理通道，也不必接触与通道相关的支付流程，这是由我们的 [Boltz 闪电互换插件](https://github.com/arkade-os/boltz-swap?ref=blog.arklabs.xyz)带来的。

比特币的支付基础设施在表象之下已经发生了根本的变化，它并不让用户觉察。

这次活动不仅仅是一个技术上的里程碑。它验证了自 Ark 协议诞生以来我们就一直在开发的方法，开启了新一代的比特币应用和服务。

## 为什么闪电网络需要闭环

人们预想的闪电网络采用模式面临着根本性的挑战。自我治理、点对点支付的承诺，已经因为操作上的复杂性、糟糕的用户体验和不可靠的经济模式而受到阻碍，推着许多人走向违背比特币的信任最小化理念的托管方案。

> *除了技术上的障碍，零售商业的应用场景跟闪电网络的双向通道模式并不匹配，因为它的支付基本上都是单向的：从消费者流向商家，然后造成通道失衡，需要持续、昂贵的通道管理。这就是 Boltz 作为一个专业的服务供应商发挥作用的地方：我们可以帮助管理流动性和通道失衡。*
>
> *—— Michael，“ [Boltz](https://boltz.exchange/?ref=blog.arklabs.xyz) ” 的 CTO*

即使 “闪电网络服务商（LSP）” 能够帮用户消除一些负担，整个生态也需要另一种方法。互换模式（swap model）作为一条平行的路径，已经生长了许多年，它提供了一种截然不同的愿景：终端用户（消费者和商家）留在网络的边缘，根本不管理通道。相反，他们将钱换成闪电支付，或者将闪电支付换成钱，将通道管理的任务留给位于网络中心、资金会双向流动的专业节点。

最初的尝试展现其前景，但也有局限性。这种想法的先行者之一是 “ [Muun](https://muun.com/?ref=blog.arklabs.xyz) Wallet ”，它证明了基于 HTLC 的互换模式可以交付更好的用户体验，但比特币网络的手续费波动性让它的经济模式不可持续。基于侧链的解决方案，比如 “ [Aqua](https://aqua.net/?ref=blog.arklabs.xyz) ”，则为了效率而牺牲了安全性。

Arkade 则给出了一条更好的路径：批量处理的、可扩容的互换服务，它保留了自主保管特性，同时让专业的流动性供应商和运营者来做他们最擅长的事：提供可靠和有竞争力的服务。用户可以直接换入、换出，使用服务商的通路将支付送达。

## 九层之台，起于累土

从去年 10 月开始，我们一直在开发三个关键模块，希望让上述设想成为现实。

“ [Fulmine](https://github.com/ArkLabsHQ/fulmine?ref=blog.arklabs.xyz) ” 是我们对互换运营商的需求的回答：这是一款比特币钱包后台程序，它集成了 Ark 协议的批量处理交易模式，以及闪电网络基础设施。它是专门为路由节点、服务供应商和支付中心开发的，它可以最优地管理流动性，同时尽可能降低区块确认手续费开销，并且无需牺牲自主保管特性。Fulmine 为我们在 Baltic Honeybadger 2025 大会联合专业的互换服务供应商、协调互换操作、证明我们的方法在生产环境中的有效性，打下了坚实的地基。

我们与 Boltz 的合作关系，也直接建立在这个基础上。作为互换服务的行业领袖，Boltz 已经在闪电网络和侧链（比如 “ Liquid ”）之间实现了无感的互换，他们立即意识到了 Arkade 的潜力。他们也很快发现，Arkade 与他们并不是竞争关系，对他们的业务也有帮助，可以扩大他们作为闪电网络主要流动性骨架之一的地位。在整合过程中，他们的运营经验被证明是无价之宝。

最后，我们的 CTO [Mr. Kukks](https://x.com/MrKukks?ref=blog.arklabs.xyz) 发起了最后一公里冲刺，他开发了一款 BTCPayServer 插件，满足了商家的需要。我们开发了定制化的工具，完全抽象到了闪电网络和 Arkade 的副总行。商家无需理解通道和管理流动性，甚至不需要知道 VTXO 是什么。他们只需接收支付，所有的技术细节都隐藏在了技术设施所属的背景之中。

## 里加：理想照进现实

上述三个模块都在 [Baltic Honeybadger 2025](https://baltichoneybadger.com/?ref=blog.arklabs.xyz) 大会上结合起来：Arkade 诞生了。每一笔支付都得到了处理、每一个商家都得到了支付、零摩擦。我们的基础设施运转起来了。

大会的参与者使用自己已经在用的闪电钱包，不需要任何修改，也不需要特殊的指令。他们扫码、支付，就跟面对任何支持闪电支付的商家一样。在背后，每一笔支付都会经过 Arkade 的互换服务，通过我们的 Blotz 集成。商家收到的是 VTXO 、不是通道余额，但是 —— 他们永远不需要知道这其中的差别。所有跟通道和流动性管理相关的概念都被完全抽象掉了。

对于大会的组织者来说，这一实验引人注目：

> *Arkade 在里加实现的东西绝对是历史性的。这是一种推动比特币进步的突破 —— 这也正是我们举办 Baltic Honeybadger 大会的初衷：展示开发者们正在将大胆的想法转化为现实。*
>
> *—— Anna，“ [Hodl Hodl](https://hodlhodl.com/?ref=blog.arklabs.xyz) ” 的 CEO*

我们的基础设施处理了超过 1300 笔支付，总支付额超过 20000 美元（0.2 BTC）。但最能说明问题的并不是这些数字，也不是我们的支付成功率，而是 —— 无人发觉。没人担心流动性。用户没有学习曲线。支付都顺利成功了，这是最重要的。

不需要许可。不需要共识。直接就干。

> *着就是推动比特币进步的密码朋克工程。不用夸大其词，也不用发行 token —— 就是打造闭环、让 “聪” 流动起来的艰苦工作。向开发者致以崇高的敬意 —— 这是比特币的一个真正的突破。*
>
> *—— Max Kei，“ [Debifi ](https://debifi.com/?ref=blog.arklabs.xyz) ” 的 CEO*

## 打开大门

支持 Riga 大会的基础设施很快就会用于更加广大的环境。私密的主网合作关系将开放给准备好集成 Arkade 到他们服务中的基础设施供应商开放。前面提到的 [BTCPayServer 集成](https://github.com/ArkLabsHQ/NArk/tree/master/BTCPayServer.Plugins.ArkPayServer?ref=blog.arklabs.xyz) 和 [.NET SDK](https://github.com/ArkLabsHQ/NArk/tree/master/NArk?ref=blog.arklabs.xyz) 都是开源的，任由开发者探索和测试，很快也将发布可以进入生产环境的版本。

闪电节点运营者可以立即开始探索 [Fulmine](https://github.com/ArkLabsHQ/fulmine?ref=blog.arklabs.xyz) 、获得在大会上无障碍工作的同等效率的流动性管理。专业的流动性供应者可以开始给用户提供基于 Arkade 的服务。能在里加完成的事情，在别处也能做到。

为商家抽象掉复杂性的方法，对消费者钱包也非常有用。在大会上，我们开发的 [Arkade 参考钱包](https://github.com/arkade-os/wallet?ref=blog.arklabs.xyz)就证明了这一点；它是一种完全无节点的实现，用户完全不会接触到通道管理。就像给商家的支付由 [Boltz 互换服务](https://github.com/arkade-os/boltz-swap?ref=blog.arklabs.xyz)来处理，Arkade 参考钱包让用户也能平滑支付任何闪电网络发票，无需自己运行基础设施。不需要闪电节点，只需要在收到闪电支付时换成 VTXO、在支付时将 VTXO 换成闪电支付。交易两头的终端用户只需关注最要紧的事情：发起和接收支付。

## 路在脚下

里加标志着一个转折点：Arkade 已经到来，它在主网上证实了我们的愿景，并且已经准备好公开部署。里加的实验验证了我们的猜想：使用专业的运营者来管理复杂性、同时让用户顺畅地交易，就可以打造闪电网络流动性的闭环。此外，它还证明了，Ark 协议不再是一个概念，而是一个可以工作的现实。

互换模式只是 Arkade 的革命性架构的第一步。虚拟的交易输出、批量处理的结算、水平扩容，它们拓展了比特币应用的边疆，让比特币作为可编程货币的前景变得更加光明。

我们正在有条有理地打造这个未来，一步一个脚印，将真实世界的验证放在理论猜想之上。Ark 协议已经到来，不仅重新塑造了闪电的网络，也重新定义了比特币的潜能。请加入我们，打造下一代的信任最小化应用。

<p style="text-align:center">- - -</p>


马上开发你自己的 Arkade 钱包：[ *docs.arkadeos.com*](https://docs.arkadeos.com/wallets/introduction?ref=blog.arklabs.xyz)

开源的资源：

- [*Fulmine Lightning Daemon*](https://github.com/ArkLabsHQ/fulmine?ref=blog.arklabs.xyz)
- [*BTCPayServer Integration*](https://github.com/ArkLabsHQ/?ref=blog.arklabs.xyz) 
- [*.NET SDK*](https://github.com/ArkLabsHQ/?ref=blog.arklabs.xyz) 

（完）