---
title: '2024 闪电网络开发者会议笔记及总结'
author: 'roasbeef'
date: '2024/10/18 18:44:51'
cover: ''
excerpt: '闪电网络开发的最新状态'
categories:
- 闪电网络
tags:
- 通道构造
- 开发
- LSP
- BOLT12
---


> *作者：roasbeef*
> 
> *来源：<https://delvingbitcoin.org/t/ln-summit-2024-notes-summary-commentary/1198>*



大约 3 周以前，超过 30 位闪电网络的开发者和研究者齐聚日本东京，在三天中讨论了许多跟闪电网络协议（以及相关的比特币 P2P 协议和共识协议）当前的状态和未来的发展有关的问题。

此前，最后一次这样的会议发生在 2022 年 6 月的美国加州奥克兰：[LN Summit 2022 Notes & Summary/Commentary](https://lists.linuxfoundation.org/pipermail/lightning-dev/2022-June/003600.html) 。一份粗糙的会议笔记即总结可见此处：[LN Summit Oakland 2022 - Google Docs](https://docs.google.com/document/d/1KHocBjlvg-XOFH5oG_HwWdvNBIvQgxwAok3ZQ6bnCW0/edit?usp=sharing) 。

我对本次闪电网络开发者会议的速记可见此处：[Lightning Summit Tokyo - 2024 - Google Docs](https://docs.google.com/document/d/1erQfnZjjfRBSSwo_QWiKiCZP5UQ-MR53ZWs4zIAVcqs/edit?usp=sharing) 。而我们商定的每日议题时间表可在此处找到：[lightning summit.md · GitHub](https://gist.github.com/Roasbeef/5ac91c57cb9826c628b1445670219728) 。

值得一提的是，有许多的小组讨论没有出现在我的笔记中（虽然我已经尽力了），也没有反映在上述日程表中。

说了这么多，下面才是我对主要的讨论话题以及结论的总结尝试（还有一些评论）。如果与会者在我的总结中发现了不准确、不完整之处，关于这三天期间发生的讨论以及决定，请回复并填上这个空白。

## 交易包转发和 V3 承诺交易怎么样了？

这是我们讨论的第一个重大话题，紧随 Bitcoin Core 28.0 的最新候选版本发布的步伐（在本文撰写之时，28.0 版本已经发布）。

### 手续费估计和基本承诺

在跳到迄今为止最新、最伟大的新提议的承诺交易设计之前，我要先简述一下今天的承诺交易设计是如何工作的，以及它的短板在哪里。

（如果你已经知道当前的闪电通道中承诺交易是怎么工作的，你可以跳过这一节）

闪电网络的设计的关键一面是 “单方面退出（unilateral exit）” 的概念。在任一时间，任何一方都要能够从通道中强制退出、并在一个时延后拿回自己的资金。需要这个时延，是因为某一方可能会通过发布旧的、已被撤销的状态到链上，也就是欺诈对手。这个时间窗口，让诚实的一方可以驳回敌手的资金请求，具体办法是证明自己知道一个仅在某一个状态撤销时才会被公开的秘密值。

这种从通道中单方面退出的能力，也是强制执行 HTLC 合约所需的关键模块；HTLC 合约实现了 “要么领走，要么退款” 的功能，让多跳的闪电网络支付成为可能。这些合约带有另一种时延模块：以绝对时间点来决定的时延（绝对时间锁）。在闪电网络中转发一笔支付的一条路径上，每一跳都有 T 个区块的时间窗口（CLTV 的时间锁差值）来确认他们的承诺交易，以及让久久不能结算的出账 HTLC 超时。如果这些承诺交易无法及时确认，他们会因为 “单方赎回” 而冒资金损失的风险，因为接下来入账的 HTLC 会超时，从而产生一个 超时/赎回 的赛跑。

（译者注：在转发一笔支付时，一个节点会从自己的上一个节点得到一个 “入账 HTLC”，并向自己的下一个节点提供一个 “出账 HTLC”。当下游节点既不让支付失败、也不回传原像、只是拖延，节点唯一的办法就是让承诺交易得到区块确认，并在链上取回出账 HTLC 的价值。但是，入账 HTLC 也有个过期时间，一旦入账 HTLC 过期，下游节点使用原像来领取出账 HTLC 中的价值（参与手续费赛跑）就会导致节点的资金净损失。所以，节点只有在入账 HTLC 超时之前让出账 HTLC 得到区块确认，才能避免这种 赛跑/净损失。）

节点让自己的承诺交易（在单方面退出时）得到及时确认的能力，依赖于他们作出有效的手续费预测的能力。如果承诺交易（它是不能单方面修改的）所携带的手续费不足，就无法及时得到确认（甚至不会被节点的交易池接受！）。当前，通道的发起者可以向对手发送 `update_fee` 消息，来提高（或降低）最新的承诺交易的手续费率。这是一种关键的工具，但是这就强迫发起者要么准备好为承诺交易支付显著过高的手续费（以保证总能够在交易广播后的下一个区块中确认），要么费尽心思预测未来的手续费率。因为发起人要支付承诺交易的所有手续费，响应者无法直接影响这个手续费，反而，在当前，如果他们不接受这个手续费水平，就只能尝试强制关闭通道。

### 锚点输出来了！

为了解决当前的承诺交易格式的部分缺点，人们提出了 “锚点输出”【[1](https://lists.linuxfoundation.org/pipermail/lightning-dev/2018-January/000943.html)】。大体思路是，双方都可以在承诺交易中得到一个微小面额的输出，是只能由己方花费的（对方不能花费）；该粉尘输出允许在事后为承诺交易追加手续费。这一设计放宽了预估手续费的要求，但并没有完全消灭这种需要。现在，目标就不再是让承诺交易在下一个区块中确认，而是让手续费高到足以进入节点的 *交易池*。一旦交易进入交易池，双方都可以追加手续费、最终让承诺交易确认。而且，这样一来，我们还可以将两阶段的 HTLC 交易捆绑在一起，在清扫未结算的 HTLC 合约时实现更大程度的批处理。但是，进入交易池所需的手续费，也类似于进入下一个区块所需的手续费，是不断变化的。因为节点有一个默认的交易池空间上限，大约 300 MB，随着进入的交易逐渐增多，节点也会开始抛弃一些费率最低的交易，从而让进入交易池的手续费门槛升高。最后，现有的锚点交易可给出的最大手续费，可能也不足以进入交易池，这时候承诺交易也会被节点抛弃掉。这时候，想让交易确认的节点就无法（使用现有的 P2P 网络）来广播自己的承诺交易了，意味着 TA 也许不能及时确认（甚至完全无法确认），因此无法避免赛跑。

沿着这条道路，开发者和研究者们发现了一系列跟交易广播有关的微妙机理，以及实际上允许敌手将一笔交易 “钉死” 【[2](https://github.com/t-bast/lightning-docs/blob/398a1b78250f564f7c86a414810f7e87e5af23ba/pinning-attacks.md)】在交易池中（故意阻挠其得到确认）的交易池转发策略。已知的多种钉死攻击界面都利用了跟 BIP 125 以及今天广泛使用的交易池策略（多种祖先交易数量限制）有关的退化情形。

### V3、TRUC 和 1P1C 来了（就是这一次）！

接下来是 “V3 交易” 和 “限制拓扑直至区块确认（TRUC）”。闪电网络开发者们的终极梦想是完全去除 `update_fee`，转而让承诺交易变成 *零手续费*。这可以将所有尝试搞清楚应该设置多少手续费的猜测工作都抛在一边。然而，如果单单这样做，承诺交易携带零手续费的后果就是不会被交易池接受，因此也不会在比特币 P2P 网络中传播。

TRUC（即 BIP 434）（一种新型的锚点输出）以及 “乐观的 1 父 1 子” 交易包转发策略的结合，成了当前已知的最佳解决方案，可以实用地解决闪电网络当前的交易转发和确认问题。

TRUC 引入了一组新的交易替换规则，意在解决 BIP 125 在一小部分场景中的退化情形。此外，它加入了一组新的交易拓扑规模约束，以进一步限制问题。TRUC 交易使用版本号字段数值 3 （而不像 BIP 125 使用 sequence 字段）来表示交易自愿使用这套新规则。

也是在 Bitcoin Core 28.0 中，一种新的标准公钥脚本类型 “PayToAnchor（P2A）” 可用了【[2](https://github.com/t-bast/lightning-docs/blob/398a1b78250f564f7c86a414810f7e87e5af23ba/pinning-attacks.md)】。P2A 是一种新的特殊隔离见证 v1 输出（`OP_1 <0x4e37>`），意在用于 CPFP 手续费追加。花费这种输出的输入 *必须* 具有空的见证输入，而且无需签名就可以使用。这种新型输出的未来版本可能最终会允许输出变成粉尘，只要它们在被创造出来的同一个区块中被花掉（通过 CPFP）。

这套新的承诺交易格式设计的最后一个模块是：1 父 1 子（1P1C）交易包转发【[4](https://github.com/bitcoin/bitcoin/pull/28970)】。1P1C 基本上就是机会主义的交易包转发。它不是依赖于一种新的 P2P 消息（这可能需要时间来部署到整个网络中），而是让节点在收到孤儿交易（还不知道其输入的交易）时改变行为。节点不会将这笔子交易存储在孤儿交易池中，而是会选择性地尝试向报告该子交易的节点请求父交易，即使该父交易的手续费低于本地交易池的手续费门槛。

协同之下，这三种新的交易转发原语可以用来重新设计闪电通道的承诺交易格式（即锚点），以解决上面提到的许多长期存在的问题。t-bast 已经开始设计新的承诺交易格式的原型了：[x.com](https://x.com/realtbast/status/1834213774674247987) 。

虽说如此，还有一些为解决的问题，包括：

- 如何处理承诺交易的粉尘输出？
  - 使用 P2A 方法，我们可以将所有的粉尘都放到锚点输出中，而不是像现在的做法，让它们变成矿工手续费。这将解决一些跟粉尘输出过量相关的已知问题，但也会带来新的顾虑，因为 P2A 锚点输出不需要签名就可以花费。
- P2A 输出应该变成 “无密钥（keyless）” 形式吗？
  - 如果输出是无密钥的，那么任何第三方都可以 *立即* 帮助清扫锚点输出（相比于当前，只有参与通道的两方可以立即清扫锚点输出，直到锚点输出被确认的 16 个区块之后）。
  - 与上面这一点相关的是，如果我们将所有的粉尘输出放到 P2A 锚点中，那么无论是谁，清扫了 P2A 锚点的人就可以拿走所有的粉尘输出中的价值。天然地，矿工是最能可靠地申领其中资金的人，假设没有签名要求的话。
  - 一些人认为，我们应该维持签名要求，因为这能防止其他人干预尝试让承诺交易得到确认的参与者。这是为了对冲 TRUC+P2A 组合中出现未被发现的缺陷的风险（它们可能带来尚未被发现的钉死攻击风险）。
- V3 交易的病毒传播特性是否会影响跟高级的通道拼接相关的某些应用场景？
  - V3 交易的所有未确认后代都必须依然是 V3 交易。所以有人担心这会影响通道拼接的使用，在一个节点尝试用一个批量处理的交易来满足多个交易流的时候。V3 交易类型的病毒传播特性将迫使花费未确认的找零输出的人都要继续使用 V3 交易，这可能会超出他们的能力范围。

新的 TRUC 规则也允许一种交易包 RBF，如果有一个新的冲突交易包进入，节点会尝试对已有的交易包 RBF。在 1P1C 的语境下，这也被叫做 “亲属驱逐（sibling eviction）”【[5](https://github.com/bitcoin/bitcoin/pull/29306)】。

上述所有信息都可以在这本钱包开发者方便指南找到更多细节【[6](https://docs.google.com/document/d/1Topu844KUUnrBED4VaJE0lVnk9_mV6UZSz456slMO8k/edit)】。

对粉尘输出的处理这可能是这次会议之后的更具体的新举措之一。从这里开始，我们将搞清楚新的 V3 承诺交易是什么样的，同时等待 P2P 网络中足够多的节点升级到新的版本，从而我们可以依赖新的转发行为。

还值得指出的是，这种转变将进一步影响闪电节点背后的钱包如何处理 UTXO 库存。使用这种方法，给定承诺交易不会携带手续费，为了确认交易，节点 *必须* 使用一个既有的 UTXO 来锚定承诺交易，否则承诺交易甚至无法得到广播。在实践中，这意味着钱包需要储备链上资金，以备及时强制关闭通道。通道拼接和潜水艇互换这样的工具也可以用来允许钱包转移资金，或批量处理多笔链上交互。

## PTLC 与简化的承诺交易格式

接下来的会议重点讨论了 “点时间锁合约（PTLC）” 与 “简化的通道状态机” 的结合。乍看起来，这两个话题似乎没有任何关联，但我们很快就会看出来，PTLC 的设计考虑所带来的一些棘手情形，可以通过修改当前的通道状态机协议（姑且称为 “闪电通道承诺协议（LCP）”）为一个简化的变体来缓解。

首先，我们简要介绍下 PTLC。在当前的闪电网络协议中，我们使用支付哈希值来实现多跳的 取走或还钱 装置，从而允许信任最小化的多跳支付。虽然简单，这种协议在隐私性上有一个大缺点：在构成整条转发路径的每一个通道中，承载支付的这个哈希值都是一样的，所以如果一个敌手在路径上占据了两个位置，就可以轻松地将一笔支付关联起来（同时打破 “多路径支付（MPP）” 循环）。

为了修复这个隐私性漏洞，许多年前，开发者们就提议切换到使用椭圆曲线和私钥（替代支付哈希值和原像）。在 2018 年，一种正式的方案出现了【[7](https://eprint.iacr.org/2018/472)】，该方案实际上允许使用跨 ECDSA 和 Schnorr 签名方案的 “适配器签名（adaptor signature）” 来实例化这种新构造。这很有趣，因为它意味着我们无需等待 taproot 升级激活（它将启用 Schnorr 签名）。相反，多跳的锁可以在由 ECDSA 跳和 Schnorr 跳构成的路径中传输。最终，出于各种原因，这种混合方法从未得到部署。好处是，我们可以部署一种更简单、更统一、仅限 Schnorr 签名的多跳锁。

快进到现在，istagibbs 除了在研究 “对称式闪电通道（LN-Symmetry）” 的具体设计以外，已经探索了各种设计空间，从消息传播到状态机插件【[8](https://gist.github.com/instagibbs/1d02d0251640c250ceea1c66665ec163)】。

在讨论了他的一部分发现之后，我们开始关注一些关键的设计问题：

1. 我们应该使用基于单签名还是多签名的适配器签名？在两种方法中，用来创建签名的适配器点 `T` 都允许提议方补充签名入账 HTLC 所需的私钥。

   基于 musig2 签名算法的适配器签名体积更小（最终只有一个签名，而不是两个），但加入了额外的协作要求，因为双方都需要提供一个 nonce 值，以恰当地创建一笔新的承诺交易。

   基于单签名的适配器签名更大（有两个签名，就像当前的两阶段 HTLC 交易一样），但协议更简单，因为 HTLC 签名可以像往常一样，跟 `commit_sig` 一起发送。

2. 如果我们决定使用 musig2 适配器签名设计，那么，我们要尝试保留当前的全双工异步 LCP 流程吗？还是应该进一步简化，转而使用一种简单的同步承诺状态机协议呢？

   为两阶段 HTLC 交易引入 musig2 nonce 会让现有的 LCP 协议更加复杂，因为我们将不再能够随 `commit_sig` 消息一起发送两阶段 HTLC 交易的签名，因为提议状态变更的一方需要来自响应方的一个碎片签名，才能安全地继续。

   然而，如果我们修改通道状态机协议，变成 *基于轮次的*，那么，虽然我们牺牲了一些 x-put，但就不需要担心怎么处理可能出现的交错执行（双方同时发送 `update_add_sig+commit_sig`）了。这就引到了简化流程的话题。

### 基于轮次的通道状态机协议

在今天的闪电网络协议中，我们使用一种全双工的异步状态机。这意味着双方都可以随时提议状态变更，不需要预先跟另一方商量。任何时候，我们都可能有 4 种承诺交易： 对一方来说已经敲定的承诺交易，以及还未构造完成的承诺交易（收到了签名，但还未发送撤销秘密值）。假设双方都继续发送签名并撤销自己的旧承诺交易，最终双方的 “承诺交易链条头” 将覆盖同一组正在进行的 HTLC。

这种设计对吞吐量很友好，因为即使双方都在连接开始时发送多个撤销秘密值，他们也可以继续发送新的状态，不需要等待对方，因为他们在一个滑动窗口（sliding window）中消耗撤销点，每次对方发送一个新的撤销秘密值就能作废掉一个旧的状态。它旧类似于 TCP 的滑动窗口的作用。

这种协议的一个缺点在于，在执行期间遇到分歧或错误时，是绝对无法恢复的。因为双方都随意发送更新（甚至在重发之后也还继续这样做），那就没法暂停或倒回去，因此无法复原协议状态。

一个例子是通道的储备金（译者注：余额中不可动用的一部分，为了防止参与者在用尽余额后可以发送任意已撤销的承诺交易而没有损失）。在当前的承诺交易中，无论哪一方要要添加一个 HTLC，通道发起人都要用自己的注资输入支付手续费。然而，为了实际支付可能在任何时候出现的新 HTLC，通道发起人可能要用自己的通道储备金来支付手续费。因为双方都可以随时提议 HTLC，为了防止这种棘手情形，他们需要给未来的 HTLC 留下足够多的手续费缓冲资金。然而，很难准确估计对方未来的 HTLC。

如果我们有基于轮次的协议，那我们就能提前捕捉所有这些棘手情形，然后保证我们总是可以恢复通道的执行、避免昂贵的强制关闭。这样的基于轮次的协议将类似于基于 RTS（请求发送）和 CTS（允许发送）的流程控制协议【[8](https://gist.github.com/instagibbs/1d02d0251640c250ceea1c66665ec163)】。

在正常的执行期间，双方轮流提出对承诺交易集合的变更（添加或移除 HTLC）。如果一方没有任何变更，可以让对方先行。重要的是，在这种简化后的协议中，双方都可以显式表示反对（NACK）或同意（ACK）一组变更。有了可以反对变更的能力，我们可以可以从出错的流程中恢复，让协议在应对假关闭需求时更加健壮。

如果我们使用基于 musig2 的 PTLC，那么在基于轮次的执行中，双方都可以提前发送 nonce 值，从而消除异步交叉交换 nonce 值的分析困难。另一个彩蛋是，这种协议可能容易分析得多，因为当前的状态机协议是出了名地缺乏详细描述。

## 链下的花式表演：SuperScalar、通道工厂及其它

在会议第一天的末尾，我们集中讨论了利用 “共享 UTXO 所有权” 可以启用的链下通道构造：链下通道创建、更便宜的自主保管移动钱包（吸引新用户）、批量处理多方的交易执行。相关的提议包括：通道工厂、超时树、ark、clark，等等。

一种最近出版的提议 SuperScalar【[9](https://delvingbitcoin.org/t/superscalar-laddered-timeout-tree-structured-decker-wattenhofer-factories/1143?)】尝试结合许多原语，解决用户自主保管的移动端闪电钱包的 “最后一公里” 问题。SuperScalar 尝试改变现状，同时：保证 LSP（闪电网络服务商）无法偷盗资金、不依赖于任何讨论中的比特币共识变更，并最终保持随着系统进步而进步的能力，同时让 部分/全部用户 可以离线。

对 SuperScalar 最恰当的解释是，它是三种技术的总和：双工的微支付通道【[10](https://tik-old.ee.ethz.ch/file/716b955c130e6c703fac336ea17b1670/duplex-micropayment-channels.pdfkj)】、John Law 提出的 “超时树（Timeout Trees）”【[11](https://github.com/JohnLaw2/ln-scaling-covenants)】，以及一种阶梯技术，让 SuperScalar 实例的协调者可以分散资金并最小化机会成本。

我不会在这里完整地介绍整个方案，相反，我建议有兴趣的人看看上面引用的 Delving Bitcoin 帖子。在会议之后，Z 已经给他的方案提出了少许新的迭代，解决了部分短板并向不同的方向分叉。

概要地说，只要你把上述三者结合在一起，你就有了一大棵交易树，每笔交易（叶子）都是一个常规的两方通道，属于 LSP 和一个用户。从通道（叶子）开始，每往上一层，都是另一个由其子树的参与者组成的多签名装置。每个叶子也都有一个额外的输出，带有额外的资金 L，可以用来为一条通道分配额外的流动性，只要 LSP 和用户在线就行。如果更多参与者在线，那么交易树更高层的分支也可以重新签名，从而允许在更大范围内重新分配通道的容量。

这种阶梯技术让 LSP 可以在这种链下树结构的多个实例中分配自己的资金。超时树技术用于为所有用户提供一个基于时延的退出路径。这种构造不需要总是揭晓整棵交易树来强制退出，在一段时间后，一个实例中的所有资金都会交给 LSP。这意味着，用户需要跳转到该构造的下一个 实例/阶梯 中，就跟 Ark 构造中的共享 VTXO 的工作原理类似（它也使用了一种形式的超时树）。结果是，这种构造中的所有通道都不再具有无限长的生命：用户要么将所有资金转移出去，要么跟 LSP 合作、在下一个实例中获得一条新通道。否则，用户将失去自己的资金。

SuperScalar 实例的生命可以分成两个阶段：活跃阶段和消亡阶段。在活跃阶段，用户可以正常使用自己的通道。他们可能会选择提早退出实例，但在大部分时间都可以保持离线。在消亡阶段，用户**必须**来到线上、转移资金或迁移到另一个实例中。它还有一种内置的安全窗口，一旦消亡期开始，LSP 将不再跟用户协作更新交易树，而且可能只会签名出账支付（LSP 是所有通道的一部分，但子通道也是可以实现的，需要额外的信任）。

回到额外的输出 L，如前所述，输出 L 是 LSP 可以随意花费的。如果用户需要额外的通道容量，那么 LSP 就可以花费 L、跟目标用户 A 创建一条新的子通道。不过，LSP 也能跟另一个用户 B 签名 L ，也就是 *在链下* 重复花费输出 L 。这样的花费只有一个版本可以出现在链上，本质上，这表明 LSP 已经透支，可能会偷盗资金，或者导致用户损失自认属于自己的资金。一种解决方案是使用一种如果签名两次就会导致私钥曝光的签名方案。有一些办法可以构造出这样的方案：OP_CAT，将签名分解成 7 个以上的实例；或使用这篇论文所述的两重适配器签名方案【11】。

在较高层级中使用双工的微支付通道意味着，随着内部更新的数量增加，用户为了从这种构造中强制退出而要发布的交易的数量也会增加。与往常一样，我们最终会遇到一个跟区块链的经济学相关的无可回避的取舍：如果发起一笔支付的代价超过了这笔支付的价值本身，这笔支付就不会发生，或者发生在一种牺牲安全性以节约代价的系统中。换句话来说，对于用户来说，在这样的构造中拥有小规模的通道可能没什么意义，因为强制退出需要额外的手续费。为了让小通道变得经济，要么协调者需要补贴它们，要么用户永远不需要在链上展示它们，也就是总可以跳到下一个 SuperScalar 阶梯上。

另一个有趣的话题是一种猜想：如果完全不使用任何链上交易，就不可能安全地在链下加入一条通道。要看出为什么这很难，考虑这样一种场景：Alice 和 Bob 已经有了一条通道，他们希望 Carol 也加入这条通道。Alice 和 Bob 创建了一个新的状态，为通道的承诺交易加入了第三个输出，就使用 Carol 的公钥。Carol 向 Alice 和 Bob 请求一些信息，以说服她这就是最新的状态，但实际上，A 和 B 总是可以伪造一些虚假的状态更新历史。因为根上的多签名装置只有两个签名者，A 和 B 总是可以重复花费掉给 Carol 的承诺交易、将她从通道中移除，还可以偷走承诺给她的余额。你稍微想一想，就会发现这类似于 PoS 链中的 “nothing at stake（无本买卖）” 问题：A 和 B 伪造历史来欺骗 Caorl 是没有代价的。

这种不可能猜想的主要结论是：完全链下的动态成员资格（任何人都可以随时进入、随时离开）构造要求：要么（1）信任根签名人；要么（2）某种类型的 归责+惩罚 机制；或是（3）链上交易。第一类的解决方案包括：Liquid、Statechian 和带有轮次外支付的 Ark。第二类解决方案，在过去一年中，我们看到了 BitVM 这样的方案的出现，它依赖于 1-of-n 诚实参与者假设，利用了一种交互式链上欺诈证明来归因和惩罚欺诈。在最后一类中，我会将这样的构造归类在内：Ark、SuperScalar 以及广义来说 John Law 的超时树。在最后一类方案中，用户使用由链上交易创建的新输出来验证从叶子到根的一组 有效且不可更改 的交易，从而允许他们单方面召唤出自己的新通道。

总结起来，我认为，这一部分的有意义归纳是：

- 开发者和服务商都在寻找招揽用户的新方法，希望链上足迹较少而且资本效率高。
- 有希望的解决方案似乎是以下技术的某种组合：通道工厂、超时树、多方通道、临时的链下资金交换协议（Ark 协议族）。
- 为了避免引入太多不必要的复杂性，任何新协议可能都要跟随一种渐进式的部署计划，按顺序来交付模块，每一个新模块都建立在先前的模块之上。

## 彩蛋环节：闪电演讲

在会议的间隙，有一个闪电演讲活动，人们可以讲述自己在开发的任何有趣的东西。

这些演讲中出现的一个很棒的想法是让用户能够从虚假的强制关闭需求中复原。这样的事情一直在发生，原因多种多样，比如软件实现之间的不一致，最常见的原因是手续费上的分歧。这里的基本想法是给出一个额外的密钥，让对手在强制关闭通道时可以尽快花费自己的资金。这会是一种纯粹的利他主义行动，代表没有发起链上交易的一方，也是实在能帮到对手的友好行动。

从机制上讲，实现这一点的一种办法是尽最大努力帮助对手通过撤销路径来清扫输出（跟通常用法相反）。一些人也讨论了稍微修改输出的派生构造、在通道重建消息中封装新信息的方法。不广播的一方将仅公开这些信息，在他们明确知道被发布的是最新状态并且已经得到确认的话。

## 让 Gossip 不那么烦人

在第二天早上，第一场会议讨论的是定位 gossip 协议可以实现的具体提升。

### Gossip 同步线索

闪电网络的 gossip 协议有恰当定义的结构，但将许多关于行为的领域都留给了具体的实现。这样的行为的案例包括：要维护多少个同步的对等节点？要不要限制进入的 gossip 消息的速率？如何验证新进入的通道（如果有的话）？是否要定期抽查拓扑图，找出缺失的通道？是否每次都要从头下载所有东西？

在讨论过程中，大部分时候，每个实现都从其他人那里学到了自己没有同样实现的东西。每隔 几个月/几周，我们就会发现一些阻碍新通道更新或通道宣告传播的微妙漏洞。LND 发现，他们最近作出的对曝光度和传播帮助最大的提升就是开始在 gossip 查询请求中使用通道更新的时间戳信息。没有这种信息，节点就无法识别，即使他们跟对手方拥有同一组通道（基于 scid），对手方也可能拥有 *更新的* 通道。如果一种实现会修剪长期不活跃的 “僵尸通道”，却不主动同步 gossip，然后如果他们不通过 gossip 查询请求中的通道更新时间戳来抽查，那么他们就无法找回旧的僵尸通道，然后弄丢网络拓扑图的一大部分。

### Gossip 2.0

接下来，我们转向新提出的对 gossip 协议的改造，代号为 “Gossip 2.5”（或者 “2.0”，就看跟你聊的人是谁了）。自上一次规范会议以来，LND 一直在推进规范【14】和实现【[15](https://github.com/lightningnetwork/lnd/pull/8256)】。当前，这份规范正在等待额外的 审核/反馈，而今年以来， LND 已经让这套协议在 e2e 环境中工作（仅限新通道）。

我们讨论的一个新的增项是在通道宣布消息中添加 SPV 证据。一些实现要么是有条件地，要么是无条件地完全不验证被宣告的通道的链上资金（前者例如 LND，要使用 `--routing.assumechanvalid` 标签）。对于完全使用 P2P 网络的轻客户端（例如：Neutrino 客户端），获取区块中几万笔交易可能是对 电源/带宽/CPU 的巨大负担。如果通道宣告消息可以携带（但总是承诺）一个 SPV 证据，那么一条通道的存在性就可以仅靠最新的区块头链来验证。如果只有 哈希摘要/最终负载的根 得到了签名，那么不需要额外证据的节点都可以请求发送方省去这些信息。在过去，LND 已经开发出了一种证据格式，支持在批量处理层面聚合，可能会被复用【[16](https://github.com/lightningnetwork/lnd/pull/5987)】。

至于互操作性测试，别的实现要么现在有别的优先实现，要么可能要等待上游库的进展来集成 musig2（在本次开发者会议之后，musig2 在 libsecp 库的 PR 就被合并了！）。今天还没有一种主要实现支持 testnet4，所以它可能还没有闪电通道，与会者都同意让 testnet4 成为 gossip 2.0 的第一个试验场！

Gossip 2.0 取消了旧的通道更新消息中中时间戳字段，代之以区块高度。这简化了速率限制，因为你可以规定一个对等节点每个区块只能更新一次。因为区块高度是全球统一的（没有时区这样的本地属性），它更适合各种集合协调协议。多位与会者已经作了一些关于重新利用现有的 minisketch 实现的研究，虽然我们面临不同的局限，但可能最终会同时使用多个不同的东西。

（注：在此期间，我弄洒了咖啡在我的笔记本电脑上。为了排除故障，我错过了好一部分讨论。）

## 对支付分发的根本限制

然后，我们的一个会议讨论了一些关于闪电网络 寻路/路由 的最新研究。主要话题是一项 演示/讨论，关于一些尝试理解在支付通道网络中分发支付的根本限制的新研究【<a href="https://github.com/renepickhardt/Lightning-Network-Limitations/blob/305db330c96dc751f0615d9abb096b12b8a6191f/Limits of two party channels/paper/a mathematical theory of payment channel networks.pdf">13</a>】。

概要地说，这份研究将网络拓扑图建模位一系列的 边 和 顶点，每一条边都具有 3 种属性：本地端的余额、远端的余额，还有总的容量。给定一个样本拓扑图，我们可以确定一笔支付是否能送达：是否存在一系列的成对的余额修改，能够给予 “接收方” 所需的余额结束状态。该研究并不运行常规的基于贪婪的寻路算法，而是在全局上看待一笔支付的可行性。注意，这种方法自然捕捉到了支付期间强制再平衡的能力，可以让原本无法满足的支付流得以运行。

不可避免地，某些支付流是完全不可能实现的。理由包括：通道容量不充足、发送者没有足够多的余额、接收者没有足够多的额度，等等。出现这种情形时，在这个模型内，就必须发生一笔链上交易，向网络的活期余额集合添加资金，或从中抽出资金。这样的链上交易的例子包括：开启一条通道、关闭一条通道、通道拼接或使用潜水艇互换。

基于上述范式，给定一些起始假设（拓扑图、余额分布、任意两个节点之间支付可能性的样本分布），我们就可以得出该支付通道网络的有效吞吐量的一种上限。为了得出这个数值（T），我们要用区块链带宽 TPS（Q）除以不可行支付的预期发生率（R），也即 T = Q/R 。如果我们想让 T 为（比如说）47k TPS，那么再代入当前主链的 TPS（大约 14），就可以得到 R 为 0.029%，即仅在 0.029% 的支付不可行的时候，才能达到 47k TPS。

最终，这些数字可以归结为基于简化了的假设的简单数学计算。该模型没有考虑的一个侧面是可以批量处理链上交互，即，多个通道/用户 可以用一笔链上交易来配置他们的链下 容量/带宽。上面的推导也没有考虑平衡式支付（例如，我在我的两个节点间来回支付，不设手续费），这永远不需要触发链上交易，但也没有计入 TPS 的推导中。不过，这样的模型还是有用的，可以获得对这个系统的局限性的抽象感觉。

### 多方通道 & 信用通道

这份研究还定位了两种原语，可以帮助减少不可行支付的数量：多方通道，以及网络内部的授信（credit）。

多方通道在通道图中聚合了多位用户，实际上形成了一个新的充分连接的子图。此处的直觉是：如果你将每一方向通道中添加的资金数量视为一个常数，那么通过增加参与者的数量，你也提高了每一个用户可以拥有的最大资金数量。而在提高这个最大数量的时候，就减少了因为 余额/容量 的限制而不可行的支付的数量。

然后是积分，这个想法也很简单：如果一笔支付是不可行的，那么在某一些跳中，可以引入信用来永久或暂时地扩大一条通道的容量，同时增记某一方的余额。为了尽可能降低系统性风险，这样的信用似乎不应该引入网络的核心，而只应该存在于边缘。理论上，Taproot Assets 这样的协议也可以用来提高支付的可行性，同时降低招揽用户的成本，因为它让用户可以在通道中原生地表达 可寻址/可验证 信用的概念。

## 吸引移动用户的最后一公里问题

在结束的时候，我们有两个独立但相关的会议，关注移动端自主保管钱包的获客和用户体验。首先，是 “最后一公里” 问题，因为它跟移动端用户体验和上手有关【[17](https://bitcoinmagazine.com/technical/assessing-the-lightning-networks-last-mile-solutions)】。

在当前的闪电网络中，绝大多数的使用体验挑战都来自于一个用户尝试给另一个用户支付、但接收者使用的是自主保管的移动钱包。这就类似于互联网基础设施和带宽中的最后一公里传输问题：网络的内部包含具有高带宽的 “宽松管道”，可以在内网中快速交换信息。然而，要将内网中的信息发送到最终目的地，就变得更贵、更不可靠，也更慢。

### 获客成本 & 通道流动性

在闪电网络的语境下，需要应对的不是老化的基础设施，也不是高昂的建设成本，而是移动设备自身的各项特性。与持续在线的路由节点相比，移动节点需要被唤醒，以签名新的入账更新。此外，如果一个移动节点希望建成一个净收款用户（但还没有主链资金，直接进入闪电网络），那么就要有一个路由节点为 TA 锁定一些流动性。这第一条通道的建立从路由节点角度看是占用资本，因为有可能这个移动节点从此就退出网络，让通道中的资金闲置。为了从长期离线的用户手中收回资金，路由节点需要强制关闭通道、付出链上手续费和时间（等待相对时间锁过期，最长可达 2 周）。

随着我们深入最后一公里的流动性成本，我们开始遇上经济效益的一些根本限制。如果一个在一条通道中只接收 10 聪，却要付出 1000 聪（链上手续费）来开启一条通道，那么跟这样的用户创建连接就会导致路由节点的净损失（就不要说今天网络上还存在对通道最小容量的限制了）。路由节点分配给一个不活跃用户的任何资本（收款额度）都可以转而分配给网络中的高速通道，在其中赚取路由手续费来弥补开设通道的成本。假设成本可以平摊，补贴可以持续，那么基础设施工具有：Phoenix Wallet 的 JIT 通道系统、Liquidity Ads【[18](https://github.com/lightning/bolts/pull/1153)】、使用 Lightning Pool 的 Sidecar Channel、Amboss 的Magma，等等。

### 由协议引起的用户体验问题

除了在线交互要求和链上手续费，当前的协议设计也有一些抽象缺失，最终进入到了终端用户的移动钱包，成了获客成本。一个例子是通道储备金：为了保证双方在全生命周期中都有所顾忌（威慑欺诈企图），他们必须总在通道中保留少量余额（通常是约 1%） 。这会让用户困惑，因为他们常常想要转走钱包中所有的余额，以迁移到另一个钱包，但转过头他们会发现自己总是要保留少量资-金。此外，随着链上手续费的上涨，符合经济效益的通道容量也随之上涨。

### 流动性费用回扣

最近出现的对 粉尘/小额输出 问题的一种解决方案是 phoenixd【[21](https://phoenix.acinq.co/server)】所用的一个概念，叫做 “手续费回扣（fee rebates）”。手续费回扣是一种不可返还的支付，用于购买未来的收款额度。每当一个用户从一个特殊的路由节点（支持这种协议插件的节点）收到资金、但这个用户又还没有通道时，这笔资金会进入这个手续费回扣罐。一旦用户在这个回扣罐中积累得到足够多的资金，路由节点就会跟 TA 开启一条通道，并用罐中的回扣来支付服务费和链上手续费。开设通道所需的最低金额将因服务和链上手续费的不同而不同。

从实用主义的角度看，手续费回扣能很好地工作。假设一个用户最终能收到足够多的钱，那他们可以立即收到这些资金，无需等待通道开启。一旦他们有足够多的资金来形成一个 L1 UTXO，那么他们可以用手续费回扣罐支付，以创建这个 UTXO 。这种技术可以结合 ecash 这样的系统（用铸币厂中的金额来表示待处理资金），或甚至是使用 Taproot Assets 的信用通道（使用在一个 Pocket Universe 中表示的资产 UTXO 来冲抵 L1 上的手续费）。

这时候，讨论又回到了多种跟通道工厂类似的链下构造，以及它们在特定的链上手续费、用户数量和这些用户的余额分布环境下的局限性。基本上，如果你想象某种这样的构造，基于超时树，然后，如果有 1 亿用户，每个用户都只有 1 聪，那么在链上展开整棵树对他们来说是不划算的（因为手续费就已经超过了 1 聪）。如果我们想象有一种内置的机制，让用户可以将资金迁移到别的地方，从而协调员可以一次性领走所有资金（类似于 Ark 的模式），那么如果用户都没能及时退出，那么这 1 BTC 就会被协调员没收。所有用户都尝试让资金回到链上，就等同于烧掉所有资金，所以一些与会者想象了一种 “红色大按钮”，可以用来烧掉所有的现存余额。理想情况下，这样的燃烧需要某种脚本（或客户端）可以验证证据，让协调员无法欺诈。

虽然上述场景或多或少只是一种思想实验，我认为，它嘲笑了我们在面临链上手续费以及小额 UTXO 时的一些根本局限性。这里没有什么新鲜事，这种机理正是为什么绝大部分全节点都会默认粉尘输出的概念：要花掉一个 UTXO 价值的 1/3 来支付手续费（以转移其中的价值），是不划算的。链下系统也是同理，只有某种补贴或外生的价值系统能作为救生舱。任何在主链（或者在更高层级）上不经济的转移，都将不可避免地迁移到某些其它依然使用 BTC 作为记账单位、但牺牲安全性以换得更便宜手续费的系统中。

## BOLT 12：下一步是什么？

浓雾弥漫，美食环绕，你可畅享冷饮和寿喜烧，然后 BOLT12 的 PR 就合并到闪电网络规范仓库了！这一天的早些时候，作为会议的最后一场，我们讨论了 BOTL 12 的下一步，也即从原始版本中砍掉的哪些插件是人们想要的。

### 潜在的 BOLT12 插件

第一种被讨论的插件是：发票替换。考虑一种场景：一个用户使用一个 Offer 获得了一张发票（invoice），但过了很久才支付，所以全部的盲化路径 以及/或者 发票自身都过期了。在这种场景中，如果用户能够请求一张替换发票，那就很有用。具体这跟直接用 Offer 请求另一张新的发票有何区别，可能是一个语境问题。

一些实现者最想要卷土重来的领域是：周期性支付（recurrent payment）。周期性支付的一部分曾进入最初的规范，但最终还是被删去了一些。周期性支付相关的参数包括：时间间隔、支付窗口、限额、以及开始和结束时间。接收者可以使用的一个小技巧是利用哈希链条来最小化需要存储的原像数量。如果他们可以给发送者交付一个特殊的 盐/种子（在初始化协调期间），那么只有发送者和接收者会知道这些原像能恰好构成一个哈希链条。

至于身份鉴别，人们提出了 BIP 353 的一种反向版本。基本的想法是，让用户可以将一个节点的公钥绑定到一个域名。这可以用来鉴别节点 Y 跟某些 服务/域名/公司 相关联。

### 洋葱消息速率限制和背压传输

在会议的末尾，注意力转移到洋葱消息，以及几种主要的实现的 实现/行为 现状。一个话题是钱包如何处理后备（fallback）以及相关的用户体验影响，当一个钱包 *无法* 获得 Offer 的时候。洋葱消息是一种不可靠的、虽然会尽最大努力但没有任何内置的反馈机制的网络，所以，有可能一条消息永远不会送达。因此，钱包需要准备好：要么尝试另一条路径，重新发送消息，要么以某种其它机制为备选方案，在钱包请求失败时转而使用备选方案。

普遍来说，现状是使用一个单跳的洋葱消息路由，或者直接连接。“直接连接” 指的是在 P2P 中直接连接接收者、盲化路径的入门节点，或者连接到入门节点的节点，以尝试用更短的路径发送消息。如果 *这些* 尝试也都失败（没有节点监听、或者接收者不在线，等等），节点就要么需要其它的后备方案，要么尝试发送某种形式的自发付款（spontaneous payment）。

回到消息传递，很明显需要某种速率限制。节点可能一开始就有一些免费的预算，但需要限制消息传递，否则一个节点可能在不知不觉中免费转发了 10 GB 的洋葱消息流量（在我看来，在一个免费层之后，大多数节点最终都要切换成度量带宽的支付系统【[22](https://lists.linuxfoundation.org/pipermail/lightning-dev/2022-February/03498.html)】）。因此，节点需要采用某种带宽和速率限制。如果网络相对于典型的消息传递使用情况明显超量供应，那么服务将保持相对较高的水平，因为使用量还没够到配置好的带宽限制。然而，如果网络与消息传递活动相关（人们试图直播他们的游戏会话或诸如此类的活动），那么服务就会受到阻碍，因为大多数发送消息的尝试都会因为公地悲剧而失败。而且，消息被丢弃、未交付或接收者离线之间的差异都是无法区分的，这进一步给用户体验带来了挑战。

最终讨论转向了先前在邮件组中提出的旧的背压速率限制算法（back pressure rate limiting algorithm）【[23](https://gist.github.com/t-bast/e37ee9249d9825e51d260335c94f0fcf)】。虽然使用该算法，节点可以保存一个相对紧凑的描述，关于最后向其发送消息的对等节点。一旦某个对等节点超过限制，节点就会向流量发送方发送一条 `onion_message_drop` 消息。然后，发送方会尝试追踪向自己发送消息的人，并进一步向后传播 `onion_message_drop` 消息，从而将过程中的速率限制减半。如果发送方在 30 秒间隔内没有溢出速率限制，则接收方应将其速率限制加倍，直到达到正常速率限制。

这里仍然存在一些开放问题，例如：节点如何可以将泛滥消息正确归因到某个对等节点？节点是否可以陷害其他节点、切断他们的消息活动？是否还需要任何其他元数据才能正确确定泛滥消息的来源？对于知道这些速率限制、但依然尝试在限制之下尽可能滥用带宽的攻击者来说，这套方案是否有抗性？这种方案刚刚出现的时候，为衡量该方案的效果和抗性，有人运行了一些基本的模拟【[24](https://gist.github.com/joostjager/bca727bdd4fc806e4c0050e12838ffa3)】。初步结果令人鼓舞，也产生了一些额外的研究问题【[25](https://lists.linuxfoundation.org/pipermail/lightning-dev/2022-July/003663.html)】。

最终，一些与会者同意开始恢复背压算法的 工作/研究，并在短期内应用保守的速率限制参数。
