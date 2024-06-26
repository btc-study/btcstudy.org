---
title: '支持全面 RBF 的理由充足吗？'
author: 'Suhas Daftuar'
date: '2022/11/21 20:59:38'
cover: ''
excerpt: '网络参与者总是有可能做一些我们认为对网络有害的事，但不意味着这些参与者使用的工具没有合法的应用场景'
categories:
- 比特币主网
tags:
- 全面-RBF
---


> *作者：Suhas Daftuar*
>
> *来源：<https://lists.linuxfoundation.org/pipermail/bitcoin-dev/2022-October/021135.html>*
>
> *本文为作者发在 Bitcoin Dev 邮件组中的邮件，讨论了近期热门的、从 Bitcoin Core 试图加入 `-mempoolfullrbf` 选项而产生的争论。作者在本文中挑战了支持 “全面 RBF” 这种交易池策略的一方提出的所有论证。*



AJ：

感谢您发表的通透的帖子。我认为，你的观察 —— 我们看待 Bitcoin Core 项目的交易池的视角、这些视角如何在围绕 `-mempoolfullrbf` 的争论中改变 —— 是切题的，而且为我们考虑未来的交易池策略变更提供了一个有用的基准。

长期以来，我视 “全面 RBF（full-rbf）” 为可能之事，而且我认为自己的哲学是支持这个想法的。但是，在过去几周里我思考了这个问题，然后完全改变了我的想法。准确来说，我主张我们应该继续保持一种交易池策略 —— 未使用（BIP125 所定义的）RBF 信号的交易的替换版本应被拒绝；并且，我们应该从 Bitcoin Core 的最新候选版本中移除 `-mempoolfullrbf` 选项；而且，不再计划推出带有这个标签的软件，除非（或者说直到）网络的环境改变（这个我后文细说）。

当然，这是一个微妙的话题，而且考量的背后是我们思考转发策略以及 Bitcoin Core 可用配置选项的哲学（这种考量可能仅对这个项目有意义，但我认为在这个邮件组中讨论也是妥当的）。

我要先从事关在网络中启用全面 RBF 可能带来好处的技术问题讲起。在当前的 BIP125 时代，每当一笔交易创建时，就要作一个选择 —— 这笔交易是否接受 BIP125 的 RBF 规则（用输入的 sequence 值来表态）。所以，给定用户已经可以选择性使用 RBF，一个 “全面 RBF” 网络有没有好处，（在一定程度上）就要看 RBF 的用户是否会因为某些不选择 RBF 的交易而不能享受到 RBF 的好处

根据这个思路，Antoine Riard 提出了 [1] 一种 DoS 界面 —— 攻击者可以阻碍多方注资的交易 —— 并主张全面 RBF 可以解决这个问题。在这个帖子中再一次研究了这个问题（感谢 Greg Sanders 为我廓清这个问题）之后，我意识到，问题在于要保障多方参与（coinjoin 类型）的协议可以获得最终的进展 —— 候选的多方交易要么得到最终的确认，要么被发现跟已经确认的交易有冲突；在后者这种情形中，重复花费的信息应能用于开启新的一轮更少参与者的 coinjoin。Antoine 和 Greg 已经指出的是，非 RBF 的交易可以在交易池中不限时存在（携带较低的手续费，并且不支持替换）并打断一个 coinjoin 协议中取得的进展。

但是，对我来说，似乎这样的协议，在一个全面 RBF 的世界中，也依然存在类似的问题，就跟我们现在理解的一样。我提到了使用 RBF “钉死” 来打断多方交易的转发的可能性（即使冲突交易表示了使用 RBF，交易池中也可以存在一组体积大、手续费低的冲突交易，让 coinjoin 交易难以确认，至少必须附加一大笔手续费）；而且，Greg 也在后续回应中提到，BIP125 规则规定一次替换只能从交易池中移除最多 100 笔交易，也能以今日的非 RBF 冲突交易同样的方式打断一次 coinjoin 协议。对我来说，这些多方协议真正需要的是某种 “最大 RBF” 策略：保证一笔对矿工来说有吸引力的交易一定能到达矿工并被考虑加入区块中，不论网络中的节点的交易池状态如何。

虽然这听起来这是一个合理的要求（而且值得开发），但这并不是选择性 RBF 工作的方式，甚至也不是交易转发策略在理论上的工作方式。至少就目前为止，我们无法提出一种交易可欲性的全面排序方法。而且，因为跟交易转发有关的 DoS 问题，有许许多多看似合法的交易构造方法，所构造出来的交易都无法在网络中很好地传播。转发一直都只是一个尽力而为的概念 —— 在交易的整个宇宙中划出一小片，以尝试优化传播。这个办法背后的理念是：如果我们能够设想的每一种应用场景，（最终）都可以使用可以被转发的交易来实现其目标，那么用户就不会对偏离受到支持的交易池策略的交易有太多的需求；因此，我们也不用太过担心完全不会被转发的交易的激励兼容性问题，哪怕这些交易有比较高的手续费。（而且，当标准交易不能适应用户需要的情况变多时，开发者一般会定义一种兼容于我们的抗 DoS 目标的策略，来支持这些应用场景，比如最近提出的、为版本号为 3 的交易设计的一套转发机制 [2] 。）

BIP125 的 RBF 规则自身也是如此，它是为了从所有情况种划出一个子集 —— 交易池应该驱逐一笔交易的冲突交易的情形 —— 没有任何人认为这种设计可以保证所有 “应该” 被挖出的替代版本都能得到传播。而且我也不认为我们知道如何设计出一种规则，既能实现多方协议的这个目标、又是抗 DoS 的，至少现在做不到。沿着这个思路，我要指出，即使 BIP125 的设计自身，也不能做到完全激励兼容，因为你可以构造出一笔交易、驱逐掉另一些对矿工来说更有利可图的交易 [3] ！（这一点我们好多年前就知道了，但修复措施被证明难以实现，而且我注意到修复它的唯一办法就是让 BIP125 RBF 的规则变得比今天更加严格。我确实也认为这是我们应该开发的事。）

给定我们当前拥有的 RBF 的限制，看起来全面 RBF 网络策略也不能解决 Antoine 提出的问题。因此，在没有其它例子的情况下，我没看出全面 RBF 为 RBF 的用户解决了什么问题 —— 他们已经可以自由地让子集的交易适用 BIP125 的 RBF 策略了。从这个角度来看，“启用全面 RBF” 真的只是剥夺用户不允许交易被替换的选择。

我认为我们真的应该问一问，从表面上来看，用户可能希望进入一个不允许替换的模式，这理性吗？换句话说，一名用户将一笔交易标记为不可替换的、然后交给网络来强制执行这个要求，合不合理？注意，这是两个不同的问题：你可以设想在一个全面 RBF 占主导策略的世界，用户依然使用 BIP 125 信号方法、表示希望交易不要被替换，只不过不能强制执行。这会给整个网络和交易的接收者给出如何跟这笔交易交互的有用信息。

我认为，用户完全有可能会继续使用 BIP125 信号机制，表示他们无意替换掉这笔交易。不论好坏，都有可能出现这种情形，因为接受零确认交易的服务会继续基于这个信号（可能会结合其它因素）来区别对待不同的交易；或者，因为交易的创建者发了这个信号，别的一些行为就可以得到更高效的利用，比如接收方可以追加一笔未确认的交易，作为追加手续费的方法（也就是 CPFP 子为父偿）[4] 。

如果真的有用户继续使用 BIP125 形式的信号机制，表示自己无意替换这一笔交易，这对网络有什么害处吗？这可不是我们能用交易池策略来禁止的事（罪名是审查交易，显而易见的坏主意）。我认为，网络参与者总是有可能做一些我们认为对网络有害的事，但不意味着这些参与者使用的工具没有合法的应用场景。只是因为一些人可能使用某些策略来支持零确认交易，并不意味着其他人不能使用同一种策略来达成其设计目标（比如更好的 CPFP 表现）。

而且，虽然用户可能尝试爆破提供零确认交易的服务或其它对标记不允许替换的交易实行区别对待的服务，但他们也可能不会这样做 —— 我认为这样预测用户的行为（尤其是预测这种商家会怎么做、用户会不会尝试破坏它的复杂情形）超出了我们作为协议开发者的责任范围。反过来，我认为我们可以试着问另一个问题：如果一群用户希望获得选择性进入不允许替换的模式的能力，有没有技术上可靠的选择，能让用户在网络中获得这样的能力并靠软件来强制执行？具体来说，它是否会干扰合理的抗 DoS 交易池入池算法、会不会干扰网络层的其它协议，或者必然跟矿工和节点运营者的利益相对立？

我认为，这些问题的答案，从选择性 RBF 和全面 RBF 的区别来看，是 “不会”：为交易提供这样选择性进入不允许替换的模式的能力，不会给软件和网络的交易池策略和其它协议带来任何根本性的问题。在一个我们只有全面 RBF 交易池策略的世界里，我可以设想某些时候我会自己提出一种表示不允许替换的信号，因为围绕交易链条（和钉死攻击）的复杂性，在交易支持 RBF 时会比不支持 RBF 时更为复杂（而且 BIP125 也并不总是激励兼容的）。对我来说，这在概念上跟一直在推进的 “v3 交易” 策略没有什么不同，只要我们认识到它是为了助推一种应用场景而专门设计出来一套限制规则。

从哲学上来时，我认为我们应该谋求在网络已经支持的东西上添加不会干扰其它部分的应用。

对那些主张要让全面 RBF 成为网络的默认策略（甚至只是为用户提供一个启用全面 RBF 的标签）的人，我提出这样一个问题：假设我们部署了 v3 交易策略的提议（我真希望近期就能发生），这个策略会限制 未得到确认的 v3 交易的输出可以被花费的方式，包括限制后代交易的数量和体积、限制可以被包含的未确认祖先交易的类型。假设几年后，有人提议我们要加入一个 “-disable_v3_transaction_enforcement” 标签，让用户可以决定关闭这些策略限制、对 v3 交易和 v2 交易一视同仁，并且依据的理由跟当前支持全面 RBF 的理由完全一样：如果我们允许 v3 交易有更多的后代，矿工可以赚到更多收益；未确认的 v3 交易的发送者不发出更高价值的子交易，是一种完全不可执行的承诺，因此接收者相信这样的承诺也是没有逻辑的；由 Bitcoin Core 来决定网络的交易池策略是不合适的，而且只有用户想关闭这个选项，我们就应该尊重他们 的选择；如果有用户依赖于 v3 交易在策略上的限制以实现安全性，那么这是一种不稳定的模式，而且我们应该假设这种模式会被打破 [5] 。

对我来说，显然，加入禁用 v3 交易池策略的标签会颠覆 v3 交易的闪电网络应用。而且，因此，我对这样的假想方案的回应就是否决，不，我们不应该让用户能够禁用这个策略，因为只要这个策略只是可选的，而且对想要使用它的人有用，它就没有伤害任何人，因为我们只是为特定的用途提供了更严格的规则集而已。加入一种能够绕过这些规则的办法，只是尝试打破别人的应用场景，而不是在增加新的应用场景。我们不应该拿 “激励兼容性” 当成一个大棒，打破那些似乎可以工作而且没有伤害他人的东西。

我认为这就是全面 RBF 现在的情形。

对比 v3 交易策略以及选择性退出可替换性的交易，有一个重大的区别是我迄今没有讲到的：我认为，真正的区别只存在于观点上，你是否认为今天人们正在使用的不允许替换的交易是否在整体上对比特币网络不利，以及未来闪电网络对 v3 交易的使用对否对比特币不利。如果你认为零确认交易是绝对的坏事，但没有人能合理地构造出闪电网络变成坏事的情形，那么这种定性判断可能会让你毫不担心我上面提到的哲学问题，因为在你看来这些情形是可以区分的。

但是，我个人不想说我认为当前在网络中的不使用 RBF 信号的交易对比特币是坏事（或者说全面 RBF 就是明确的好事 —— 多年来我们一直在改进 BIP125 的 RBF 规则，但收效甚微）。我也不相信断定人们无法为闪电网络对比特币不利提出一种有说服力的证据，因为闪电网络依赖于难以设计、无法保障的转发策略作为其安全模式的一部分。所以，我转而选择只作一个看起来更加符合事实的判断：不允许替换是一种当今广泛存在于网络中的策略，而且（就我所知！）我们很大程度上没有理由认为网络中正出现大量会违反这个策略的交易。

如果事实证明许多用户常常用信号表示不允许替换、但随即又签名并尝试转发重复支付的交易，那么我就同意 Bitcoin Core 有一个很好的理由接受全面 RBF，以应对正在发生的事实。与此同时，我认为，说我们因为有了 BIP125，用户不必说一套做一套，因此也不必推出可能会打破对许多用户来说运作良好的策略的软件，是更合理的。其它项目可能会有不一样的选择，而且，因为这毕竟是一个免信任的网络，所以如果这在事实上是一种不稳定的、无法保持的均衡，那么也许有一天它无法工作的事实会暴露出来，我们可以到时候再抛弃它。但我认为，Bitcoin Core 中的交易转发策略的哲学应该是支持各种应用场景，以尝试让所有东西都能更好地工作，而不是因为我们猜测其他人最终会打破某些东西而贸然打破它们。

如果你读完了这篇长邮件但依然倾向于一个全面 RBF 的网络（甚至于你只是希望用户可以自己打开全面 RBF 功能），我想问你们几个问题，这些问题也指导了我对这个问题的思考：

- 全面 RBF 除了破坏零确认交易的商业实践之外，有没有提供别的好处？如果有，在哪里呢？
- 对所有交易强制执行 BIP125 的 RBF 规则，是否合理？如果这些规则自身并不总是激励兼容的呢？
- 如果某人在未来提议加入一个打破 v3 交易转发策略的命令行选项，并且其理由与当前支持迁移到全面 RBF 的一致，有没有逻辑上的理由能反对他们？

敬礼，

Suhas

[1]
https://lists.linuxfoundation.org/pipermail/lightning-dev/2021-May/003033.html

[2]
https://lists.linuxfoundation.org/pipermail/bitcoin-dev/2022-September/020937.html

[3]

这是因为在 BIP125 的规则中，替代版本的手续费率不必与被驱逐的所有交易的单体费率相比较 —— 只需要跟与之直接冲突的交易相比较（不包括其后代）。所以，完全有可能一笔交易会驱逐两笔乃至更多的交易，但其手续费率只是高于与之直接冲突的交易的费率、 总手续费也比被驱逐的交易组合要高，但手续费率会比被驱逐的交易组合的某个子集要低（例如因为它的体积比较大）。

[4]

当发送者为父交易使用 RBF 规则时，接续未确认的交易的风险会高得多（对比发送者表示不计划这样做的情形）（花费一笔 RBF 交易会给花费者带来钉死问题，而且要承担因为父交易被替换而导致子交易消灭的风险），我认为这就是为什么发信号表示一笔交易不会被替代是有用的。

[5]

这是一个微妙的点。我不认为 v3 交易为它的设计目标应用场景创建了一种不合理的安全假设。但是，我也不认为人们可以完全排除某人接受 v3 交易的使用模式但颠覆其设计意图的情形。举个例子，如果用户开始为所有的支付使用 v3 交易，那么对后代交易的数量限制可能会直接干预接收者的 CPFP 操作，而有些人也会主张我们应该打破这种策略以允许这种假设的行为。我认为，这就类似于说零确认交易 + BIP125 创建了一种重复花费无 RBF 信号的交易的激励。

