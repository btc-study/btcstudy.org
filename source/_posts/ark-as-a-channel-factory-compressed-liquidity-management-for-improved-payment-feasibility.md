---
title: 'Ark 作为一种通道工厂：压缩流动性管理以提高支付可行性'
author: 'Pickhardt '
date: '2026/02/06 12:06:17'
cover: ''
excerpt: '本文主张，把 Ark 理解为闪电网络的基础设施'
tags:
- Ark
- joinpool
---


> *作者：Pickhardt*
> 
> *来源：<https://delvingbitcoin.org/t/ark-as-a-channel-factory-compressed-liquidity-management-for-improved-payment-feasibility/2179>*



在过去几个月中，我在许多双边谈话中讨论了这篇文章中的想法。为了避免重复不连贯的主张并邀请更多反馈，我将它们写在这里。我向已经熟悉这些概念的读者们道歉，并欢迎评论、反驳和提出开放问题。

注：**因为我的母语并不是英语，所以我用了 LLM（大语言模型）来润色我的文字；而其中的技术内容和论点都属于我自己。在我指导 LLM 的时候，我并没有偏离标准的格式和语言风格。**

## 摘要

闪电网络支持快速、非托管的比特币支付，前提是在一个支付流的沿路（通常只有一条路径）都有充足的流动性。然而，**支付可行性**（payment feasibility）（这样一个支付流的存在性）是一个结构性的约束，无法单单靠对路由的启发式分析或者链外的再平衡（rebalancing）来解决。在流动性不足的时候，**就要发送链内交易来修改通道图谱**，这在根本上限制了闪电网络扩大比特币支付吞吐量的能力。

众所周知多方通道能够提升资金效率，但在实践中很难协调。Ark 提出了一种机制，以回合为单位协调多方的状态更新，以相对较低的协调开销让成员们对一个新状态达成共识。本文想要挑战当前正在形成的观点：Ark 应主要用作一种服务于 “最后一公里”  的支付系统，彼此之间通过闪电通道连接。相反，本文主张，把 Ark 理解为**闪电网络的基础设施**，可能更好，尤其是，作为一种 “**通道工厂**”，它可以带来高效的流动性重新配置。本文的关注点是这样做的取舍、可行性约束，以及开放的研究问题。

**重要提醒**：本文并没有明确反对将 Ark 用于支付，只是追问有没有更好的应用场景。

## 1. 回顾支付可行性和闪电网络的结构性限制

一次闪电支付是可行的，当发送者与接收者在流动性图谱之间的**最小割**（minimum cut）超出了支付数量。在实践中，可行性是难以确定的，因为[远端的通道余额存在不确定性](https://arxiv.org/abs/2103.08576)。这种不确定可以通过使用[概率性路由和最优的可靠支付流来减少](https://arxiv.org/abs/2107.05322)。

然而，即使优化路由、手续费更新和再平衡能够提高利用率，[它们无法改变全局的支付可行性](https://github.com/renepickhardt/Lightning-Network-Limitations/blob/f670738cd2af93a55c3c919c9a864015f6dd042a/Limits%20of%20two%20party%20channels/paper/a%20mathematical%20theory%20of%20payment%20channel%20networks.pdf)，除非通道图谱自身改变。

尤其是：

- 链外的再平衡技术可以重新分布现有通道中的流动性。
- 它 *不会* 创造新的连接性或单向通行能力（directional capacity）。
- 在无法存在可行的支付流时，就需要发起一笔**链内交易**（开启通道、关闭通道、通道拼接，等等）。

这个区别就是核心。即使一个节点可以将流动性从一条通道移动到另一条通道（通过环路支付），这样的操作也会影响远端的通道，因此不会定向地提高一笔可欲的支付的可行性。想要局部地改变可行性而不影响网络的其余部分，就只有通过链内交易介入。

《[支付通道网络的一种数学理论](https://github.com/renepickhardt/Lightning-Network-Limitations/blob/f670738cd2af93a55c3c919c9a864015f6dd042a/Limits%20of%20two%20party%20channels/paper/a%20mathematical%20theory%20of%20payment%20channel%20networks.pdf)》中的形式化分析证明了，**最大可行支付速率**（maximum supported payment rate）极度依赖于：

- 固定的可用的链内带宽，以及
- 预期的不可行支付比率。

这对两方支付通道网络限制非常严重，在现实的假设之下，如果没有持续的链内带宽支持，预期的不可行支付比率可以变得非常高。这一局限性促使人们探索协调机制，以使用更少的链上足迹来重新构造支付网络图拓扑。

## 2. Ark：回合与虚拟 UTXO

Ark 引入了 “**回合**（rounds）” 的概念：同一回合的参与者们，在一个 Ark 服务提供商（ASP）的协调之下交换 “**虚拟 UTXO**（vTXO）”。这些 vTXO 代表着链外的价值承诺，可以在一段时间内重新分配。

看起来，Ark 风格的系统通过引入 ASP 作为协调员，减少了 coin pool（直译为 “钱币池”）的协调和在线交互要求；ASP 会在一个固定的时间窗口内提供过量的流动性，从而不必每个人都立即同一每一个新状态，而只需最终同意即可。这是一个非常好的属性。

然而，在 Ark *直接* 用作一个支付系统时，其三个属性就不可不察：

1. **因为过期机制而带来的流动性锁定**：vTXO 带有过期机制，在还未过期时， ASP 的资金是一直绑定的，等到过期之后才会释放。
2. **找零放大**：支付通常要销毁一个输入、创建多个输出（收款和找零），这就增加了 ASP 必须垫付的流动性数量。
3. **回合间结算的信任因素**：支付只能在回合边界上最终结算。在两个回合之间，花掉的 vTXO 在理论上是可以重复花费的，这就产生了关于托管和 ASP 角色的合规解释的问题。

如果 vTXO 会在到期之前频繁支付，ASP 需要的运营资本[可能会显著增长（相对于净支付额）](https://bitcoin.stackexchange.com/questions/128113/how-well-does-ark-scale-bitcoin-payments)。这让 Ark 可以独自提供低开销、可扩展的支付层的论述变得更加复杂。

## 3. 将 Ark 解读为一种通道工厂，和闪电网络的基础设施

另一种解读是不把 Ark 当成一种与闪电网络竞争的支付系统，而是**闪电网络之下的基础设施**。更具体来说，可以把它理解成**一种通道工厂，或者说多方通道机制**。

在这种理解之下：

- vTXO 对应于闪电通道，
- 一个 Ark 回合自动可以打开、关闭和重塑许多通道，
- **单笔链内交易**就可以可以**重新构造通道图谱的一大部分**。

这与路由和（链外）再平衡都有根本上的不同。它不是 *在* 一个固定的图谱中优化支付流，而是带来图谱自身的脱坡的结构性变化，这就有可能让以往不可行的支付成为可行。

多种通道操作 —— 注资、关闭、拼接 —— 都能被压缩到单笔 Ark 回合交易中。因为闪电网络已经为这样的变更要求链上确认，所以 Ark 也不会让时延恶化，因为 Ark 的回合最终可以在每个区块中发生。

## 4. 流动性重新配置和操作考虑

闪电网络运营者已经需要：

- 监视通道，
- 响应链内事件，
- 偶尔再平衡或者关闭通道。

在 Ark 回合中轮换 vTXO（例如，每个月几次），从操作上来看是同类的。具有更高利用率的通道可能要求更加频繁的轮换，这可以在通道还被主动使用时协调。

故障假设在细节上有所不同，但类型上是一样的：运营者需要定期参与，而不是持续监视。

## 5. 流动性池与动态分配

在一个通道工厂（或者说多方通道）中：

- 流动性会在参与者之间形成池子，
- 各池子的规模可以一轮又一轮地调整，
- 需求可以被预测，或者动态响应。

这与当前的 LSP 模式恰好相反：在 LSP 模式中，流动性是以用户为单位提供的，通常会保持闲置状态，或者分布不均。

而池化可以提高资金效率 —— 尤其是（但也不限于）对移动客户端 —— Ark 也是如此，只是引入了取舍，包括过期事件、协调开销和 ASP 的流动性管理。确定最优的超时参数（让 ASP 重新领取 vTXO）依然是一个开放问题。

## 6. 与闪电网络集成与托管考虑

当 Ark 被用作一种基础设施时：

- 支付发生在闪电 通道/网络 中，
- 结算依然是原子化、端到端的，
- ASP 协调流动性，但并不作为支付的中介。

这保持了闪电通道的非托管、实时结算属性。相反，在支付中直接使用 Ark 会在回合间引入信任假设。

各司其职 —— 闪电通道用于支付、Ark 用于流动性协调 —— 保持了闪电网络的核心保证，比如支付的即时结算和强壮的隐私性，同时解决了结构性的可扩展性限制。

## 7. 路由、Gossip 和开放问题

通过 vTXO 来注资的通道缺少链上注资交易，因此在当前，无法通过闪电网络的 gossip 来公开。这带来了几个开放问题：

- 这样的通道，要如何向路由者表示？
- 路由应该在工厂的层面上运行吗？
- “流动性广告（liquidity advertisement）” 是否需要新的抽象？
- 这些机制会如何影响隐私性和可靠性？
- 应该限制基于 vTXO 的通道只能在 ASP 和用户间存在？还是可以直接在用户之间存在？

## 8. 延申的开放问题

将 Ark 视为闪电网络的基础设施，而不是一种独立的支付系统，可以厘清一些取舍，但也提出了一些值得研究的其它开放问题：

- **激励因素与 ASP 的行为**：激励因素应如何保持一致，从而让 ASP 的流动性管理决策能够提升闪电网络层面的支付可行性，而不仅仅是局部的盈利能力？多个 ASP 之间的竞争会如何影响流动性分配和定价？
- **中心化压力**：在多方构造中汇集流动性，是否会偏向少数量、大规模工厂的规模经济？这与闪电网络如今已经存在的支付中心和 LSP 的效应相比如何？
- **故障模式和退出**：根据 [Peter Todd 论述 Layer 2 的文章](https://petertodd.org/2024/covenant-dependent-layer-2-review)（[中文译本](https://www.btcstudy.org/2024/09/11/soft-for-covenant-dependent-layer-2-review/)）：ASP 故障（或者说大规模退出）的链内后果和运营后果是什么样的？系统的压力要如何优雅地释放？以及，最坏情况下，链内操作的代价是多大？
- **时延与可行性**：Ark 可以支持结构性的重新配置，但每逢一个回合才能配置一次。回合的频率和过期窗口要如何选择，才能平衡支付可行性、资金效率和用户体验？
- **隐私性考虑**：基于回合的协调机制是否会逐渐泄露关于需求模式的信息或用户的活动？匿名集与双向闪电通道相比如何？
- **互操作性和路由抽象**：vTXO 注资的通道如何向路由者表示（给定它没有链内的注资交易）？需要新的 gossip 消息或者工厂层面的抽象吗？

这些问题也不专属于 Ark ，而是无论什么时候，只要多方流动性协调装置出现了，就会自然提出的问题。解决它们，对于理解这样的机制如何与闪电网络互补，是根本性的。 

## 参考文献

1. Pickhardt et al., *On the Uncertainty of Lightning Network Channel Balances* [[2103.08576\] Security and Privacy of Lightning Network Payments with Uncertain Channel Balances](https://arxiv.org/abs/2103.08576)
2. Pickhardt & Richter, *Optimally Reliable Payment Flows on the Lightning Network* [[2107.05322\] Optimally Reliable & Cheap Payment Flows on the Lightning Network](https://arxiv.org/abs/2107.05322)
3. Pickhardt *A Mathematical Theory of Payment Channel Networks* (draft) [Lightning-Network-Limitations/Limits of two party channels/paper/a mathematical theory of payment channel networks.pdf at f670738cd2af93a55c3c919c9a864015f6dd042a · renepickhardt/Lightning-Network-Limitations · GitHub](https://github.com/renepickhardt/Lightning-Network-Limitations/blob/f670738cd2af93a55c3c919c9a864015f6dd042a/Limits of two party channels/paper/a mathematical theory of payment channel networks.pdf)
4. Pickhardt *How well does Ark scale Bitcoin payments?* https://bitcoin.stackexchange.com/questions/128113/how-well-does-ark-scale-bitcoin-payments 5 Todd, *Covenant dependent layer 2 review* [Soft-Fork/Covenant Dependent Layer 2 Review](https://petertodd.org/2024/covenant-dependent-layer-2-review).
5. BTC++ Talk on Lightning scaling and limitations https://www.youtube.com/watch?v=c3AuaHJordg
6. Bitcoin Amsterdam LN vs Ark panel (2025) https://www.youtube.com/watch?v=AU52kQz2zIM

## 致谢

在 BTC++ 和 Bitcoin Amsterdam 上与许多朋友的讨论以及得到的反馈，帮助我理清了这些论述。本研究就到了 Optensats 和 Patreons 的资助。