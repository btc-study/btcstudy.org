---
title: '等待确认（八）：交易池规则是个接口'
author: 'Gloria Zhao'
date: '2023/07/21 17:48:01'
cover: ''
excerpt: '合约式协议甚至更密切地依赖于跟打包优先级相关的交易池规则'
categories:
- 比特币主网
tags:
- 开发
---


> *作者：Gloria Zhao*
>
> *来源：<https://bitcoinops.org/zh/newsletters/2023/07/05/>*
>
> *译者：[Primitives Lane](https://github.com/PrimitivesLane)*
>
> *本文为 Gloria Zhao 在 Optech Newsletter 上编写的 “交易池” 系列周刊的第八篇。*
>
> *[前篇见此处](https://www.btcstudy.org/2023/07/20/waiting-for-confirmation-7-network-resources/)*

到目前为止，我们已经探讨了关于去中心交易转发的[目的](https://bitcoinops.org/zh/newsletters/2023/05/17/#等待确认-1-我们为什么需要一个交易池)和挑战，这些因素使得[节点本地](https://bitcoinops.org/zh/newsletters/2023/06/14/#等待确认-5用于保护节点资源的规则)和[整个网络](https://bitcoinops.org/zh/newsletters/2023/06/28/#等待确认-7网络资源)都要使用比共识规则更严格的交易验证规则。因为 Bitcoin Core 软件的交易转发规则变更可能影响一个应用的交易是否能被转发，所以在提出之前，需要整个比特币社区的社会合作。类似地，使用了交易转发的应用和二层协议也必须跟交易池规则一起设计，以避免创建会被拒绝的交易。

合约式协议甚至更密切地依赖于跟打包优先级相关的交易池规则，因为其强制执行能力依赖于能够让交易快速得到确认。在对抗环境中，通过推迟交易的确认欺骗对手可能会有利可图，所以我们必须思考交易转发规则（作为一种接口）的 “怪癖” 如何可以用来攻击用户。

闪电网络的交易遵循前面的文章提到的标准化规则。举例来说，这种点对点协议在其 `open_chennel` 消息中指定了一个 `dust_limit_satoshis` 参数，用来明确粉尘输出的门槛。因为一笔包含了价值低于粉尘门槛的输出的交易不会被转发（因为节点的粉尘输出限制），这些支付会被认为是 “不可在链上强制执行的”，然后从承诺交易中剔除。

合约式协议经常使用带有时间锁的花费路径，让每一个参与者都有机会竞争将状态发布到链上。如果受影响的用户没有办法在这个时间窗口内得到让自己的交易确认，他们就有可能损失资金。这让手续费变得极为重要，因为它是提高确认优先级的首要机制，但也产生了更多难点。交易需要在未来的某个时候广播，或者受影响的用户只拥有轻节点，或者一些追加手续费的方法不可用，都导致[费率估计](https://bitcoinops.org/zh/newsletters/2023/06/07/#等待确认-4费率估算)很难。比如说，如果闪电通道的一个参与者离线了，另一方可能会单方面广播一笔预签名的承诺交易，来结算他们在链上共享的资金。没有任何一方可以独自花费他们共享的 UTXO，所以当其中一方离线的时候，就无法签名一笔[替换](https://bitcoinops.org/en/topics/replace-by-fee/)交易来为承诺交易追加手续费。反过来，闪电通道的承诺交易可能会为通道参与者包含 “[锚点输出](https://bitcoinops.org/en/topics/anchor-outputs/)”，让他们可以在广播交易的时候附上[用于追加手续费的子交易](https://bitcoinops.org/en/topics/cpfp/)。

但是，这些手续费追加方法都有局限性。如[之前的文章](https://bitcoinops.org/zh/newsletters/2023/06/21/#等待确认-6规则一致性)文章所述，如果交易池的最低手续费率已经比承诺交易的手续费率要高，那么添加一个子交易是不会奏效的，所以闪电通道的用户依然必须使用稍微高估的费率来签名交易，以应对未来交易池的最低费率上涨的情形。此外，锚点输出的开发综合了一系列的考量，因为某一方可能从推迟交易确认中获利。举个例子，一方（Alice）可能会在离线之前广播自己的承诺交易。如果这笔承诺交易的费率太低、无法立即得到确认，而且 Alice 的对手（Bob）没有看到这笔交易，那么，他可能会很困惑 —— 当他想把自己的承诺交易广播出去的时候，会发现自己这笔交易无法转发。每一笔承诺交易都有两个锚点输出，所以任何一方都可以加速任意版本的承诺交易的确认，例如，Bob 可以盲目地尝试广播一笔基于 Alice 版本的承诺交易的 CPFP 子交易，即使他不确定 Alice 之前有没有广播过这个版本。每一个锚点输出都带有高于粉尘门槛的价值，而且在一段时间后就可被任何人领走，从而避免让 UTXO 集膨胀。

但是，保证每一方的 CPFP 能力，光凭给每一方一个锚点输出可不够。如[之前的文章](https://bitcoinops.org/zh/newsletters/2023/06/14/#等待确认-5用于保护节点资源的规则)所述，Bitcoin Core 会限制可以附加到一笔未确认交易上的后代交易的数量和总体积，这是一种 DoS 保护措施。因为每一方都可以为共享的一笔交易附加后代，那么，其中一方就可以阻止别人的 CPFP 交易得到转发 —— TA 可以用自己的 CPFP 交易用尽这个可附加的容量。结果是，这些后代交易会让承诺交易以低优先级的状态 “钉死” 在交易池中。

为了缓解这种可能的攻击，闪电网络的锚点输出提议使用一个相对时间锁锁定了所有的非锚点输出，从而阻止它们在承诺交易未得确认的时候就被花费，而且 Bitcoin Core 的后代限制规则也[修改](https://bitcoinops.org/en/topics/cpfp-carve-out/)了，允许附加额外的一个子交易，条件是这笔交易的体积较小而且没有其它祖先交易。这些变更的组合保证了一笔共享交易的两个参与者都可以在交易广播的时候调整交易费率，同时不会显著增加交易转发的 DoS 攻击界面。

通过耗尽后代交易的容量来阻止 CPFP，是 “[钉死攻击](https://bitcoinops.org/en/topics/transaction-pinning/)” 的一个例子。钉死攻击利用交易池规则的限制来阻止激励兼容的交易进入交易池以及得到确认。在这个案例中，交易池的规则在 [DoS 抗性](https://bitcoinops.org/zh/newsletters/2023/06/14/#等待确认-5用于保护节点资源的规则)和[激励兼容性](https://bitcoinops.org/zh/newsletters/2023/05/24/#等待确认-2激励)之间做了取舍。你必须取舍 —— 节点需要考虑追加手续费的机制，但无法处理无限数量的交易。CPFP 的 carve out 为一个具体的应用场景细化了这种取舍。

除了耗尽后代交易的容量限制，还有别的钉死攻击[可以同时阻止 RBF 的使用](https://lists.linuxfoundation.org/pipermail/lightning-dev/2021-May/003033.html)、或让 RBF [贵得离谱](https://lists.linuxfoundation.org/pipermail/bitcoin-dev/2022-January/019817.html)、或者利用 RBF 来推迟一笔 ANYONECANPAY 交易的确认。钉死攻击仅在多方合作创建一笔交易的时候，或者一个不受信任的参与者可以干预交易的时候是个问题。尽量不将交易暴露给不受信任的参与者，总的来说是一种避免钉死的好方法。

这些摩擦点不仅显示了交易池作为比特币生态系统中的应用和协议的接口的重要性，还指明了需要提升的地方。下周，我们会讨论交易池规则的变更提议以及悬而未决的问题。