---
title: '解释 CHECKTEMPLATEVERIFY：比特币最新的争议性软分叉提案'
author: 'Namcios'
date: '2022/02/07 19:31:11'
cover: ''
excerpt: '到目前为止，BIP119 看起来停滞不前，在冲突中左支右绌'
categories:
- 比特币主网
tags:
- CTV
---


> *作者：Namcios*
> 
> *来源：<https://bitcoinmagazine.com/technical/what-is-bitcoin-checktemplateverify>*



CheckTemplateVerify（CTV）是一个比特币的软分叉提议，其详述是 [BIP 119](https://github.com/bitcoin/bips/blob/master/bip-0119.mediawiki)。它的用意是通过加入一种基础类型的 “限制条款（covenant）”（一类智能合约），让网络能支持一些新的应用场景，实现比当前更多的功能。

## 为什么要引入 “限制条款”？

因为，比特币在基本的交易层面上的可编程性并没有多少弹性 —— 显然比不上用来签名交易的公钥和私钥层面的灵活性。

当前，程序员可以用 [Bitcoin Script](https://en.bitcoin.it/wiki/Script) 来控制一笔交易的输入，限制一笔交易在花费前可以做什么，但他们无法控制哪种类型的交易可以被签名花费。换句话说，在今天的大多数[比特币智能合约](https://bitcoinmagazine.com/technical/why-bitcoin-smart-contract-platform)中，用户可以通过定义必须被满足的约束条件，来控制资金的解锁方式，但是，他们无法很好地控制币在解锁之后能做什么、不能做什么。

举个例子，你可以使用[时间锁](https://en.bitcoin.it/wiki/Timelock)来定义多久之后一笔交易才能被花费，基本上就是锁定一笔交易，直到网络达到某个区块高度。在这个案例中，约束条件是一笔资金 *什么时候* 才可以被花费。但是，一旦时机成熟、比特币网络到达特定的区块高度，相应的私钥就可以解锁这些资金并自由地花费他们。*时机* 有所限制，但花费的 *内容* 和 *方式* 都没有什么限制。

因此，限制条款可以通过启用一些规定哪些输出可以被接受的预定义条件（而不是控制输入），为比特币的可编程性打开一些全新的可能性。虽然无穷可能性的复杂限制条款可能会给网络带来安全风险，因为它可能引发意料之外的结果，但 CTV 提议的大部分是比较简单的。

## 什么是 CTV？

简而言之，CTV 让比特币用户限制一笔比特币被花费的方式，并且即使拥有对应的私钥也无法绕开这些限制。

更重要的是，CTV 让这些花费上的限制条件的执行无需参与者在线交互。CTV 支持的一些应用场景在当前也是 *可以* 实现的，但大部分情况下，参与一个智能合约的用户都必须在线并彼此交互、合作，来满足花费规则；而这种在线要求有时候是不现实的。CTV 让这些限制条件可以按提前设置的程序执行，无需参与者的手动交互，因此可以提高限制条款的可靠性。

当前，你可以随意花费你的 UTXO。在 CTV 实现之后，你可以在 UTXO 中放置条件来控制或限制你自己花费这些资金的方式。不仅仅是你什么时候可以花，也覆盖你花费它的方式。为比特币引入这些类型的新特性之后，更多样的[一些应用场景](https://utxos.org/uses/)就能出现，也可以催生出一个新的应用生态系统。

CTV 可以为比特币带来得一些功能包括安全性、隐私性和可扩展性上的强化。CTV 激活之后，用户可以创建出更精巧的托管方案，比如 “金库（vault）”，用户可以预先定义从冷储蓄转变成热储蓄的方案并限制其花费，这样就能减少被盗可能带来的伤害。CTV 还可以实现一种叫做 “支付池” 的工具：一群人可以免信任地共享同一个 UTXO 并在彼此间免信任地再平衡资金，这不仅提高了隐私性，也为比特币带来了更好的扩展机会。而且，CTV 可以极大地帮助闪电网络的通道创建和赎回，以及 [哈希时间锁](https://en.bitcoin.it/wiki/Hash_Time_Locked_Contracts)，因此可以提高比特币二层协议的效率和流动性。

## CTV 是怎么工作的？

一言以蔽之，CTV 是给比特币带来了一个新的[操作码](https://en.bitcoin.it/wiki/Script#Opcodes)，也就是增加了一个[比特币脚本](https://en.bitcoin.it/wiki/Script)可以运用的操作。

[BIP119](https://github.com/bitcoin/bips/blob/master/bip-0119.mediawiki) 通过 OP_NOP4 给比特币增加了一个新的操作码 OP_CHECKTEMPLATEVERIFY，即通过软分叉实现了一个共识规则的变更。

当前，带编号的 OP_NOP 操作码（OP_NOP1 和 OP_NOP4 到 OP_NOP10）会被忽略而不是使交易无效；更重要的是，它们是[被保留的](https://en.bitcoin.it/wiki/Script#Reserved_words)操作码，可以被用来为协议添加新的操作码。不过，OP_NOP （不编号的这个）又没有这些特性，因为它是一个 “不处罚任何操作” 的操作码。

BIP119 谋求通过重新定义 OP_NOP4 来安排 OP_CHECKTEMPLEVERIFY 形式的验证。类似的方法也被利用来为协议加入 OP_CHECKLOCKTIMEVERIFY 和 OP_CHECKSEQUENCEVERIFY，相应是 OP_NOP2 和 OP_NOP3（译者注：脚本层面的绝对时间锁和相对时间锁）。

在运行的时候，OP_CHECKTEMPLATEVERIFY 会执行三项检查：第一项，自然地，它要检查栈中是否有存在元素；如果有，它执行第二项检查，该元素是否恰好是 32 字节 —— 也即一个 SHA-256 哈希值的体积；如果有元素在栈中，又恰好是 32 字节，那么 CTV 就检查第三项，它是否匹配当前输入的索引位置的交易哈希值。

这一步 —— 检查该元素是否与该交易哈希值一致 —— 就是它实现强制执行的方式。在这里，程序是在验证，向它传入的交易是不是由合约（或者说限制条款）预先指定的 “可以接受的” 的交易之一。这样的交易的集合可以被合约的用户预先指定。

虽然编程 CTV 不必非得使用哪种编程语言，[Sapio](https://learn.sapio-lang.org/) 是一种专门设计用于这种编程的语言，尚在开发中。它抽象到了底层的编程细节来帮助开发比特币的智能合约，并搭配了一些组件，比如，可重用的代码部分，来提高程序的可读性和可用性。

程序员首先使用 Sapio 开发一个模板，指定一些条件，然后输出一个部分签名的比特币交易（PSBT）列表，这个列表就可以用来定义出可行的花费交易的完整集合 —— 让我们可以限制一笔交易中 *可允许* 的输出集合，使之 *小于* 所有可能的输出集合。

CHECKTEMPLATEVERIFY 通过限制大部分会决定所有可能的交易 ID 的数据，预先承诺了一笔交易。这就意味着，给定一个 UTXO 和一个合约，一般来说你都可以预先计算出所有的 TXID。虽然有局限性，这里的假设是因为我们提前知道交易 ID，所以限制条款也会更容易执行，因为需要检查的交易的范围是有限的。

操作码 DefaultCheckTemplateVerifyHash 所分析的具体哈希函数会哈希序列化形式交易的一部分（从版本号和 locktime 开始）。然后，这个函数会哈希 scriptSig 哈希值，如果交易不是一笔隔离见证交易的化。然后，它会哈希输入的数量、sequence 的哈希值和输出的数量。最后，这个函数会哈希输出的哈希值和输入的索引。

通过预先承诺（或者说决定）大部分这些 数据，我们不仅可以提前确定交易 ID，它也是的只有少部分数据可以后来再核定（或者说改变），并让验证更有效率，因为许多字段都已经被哈希了。（译者注：此处的逻辑反过来更容易理解：一笔交易的一部分数据会决定这笔交易的 ID，因此，当脚本已经指定了怎样交易 ID 的交易可以花费这个 UTXO 之后，交易的大部分内容也就有了限定。）

“以特定的方式排序这些字段的理由是，如果未来我们会在比特币中实现像 OP_CAT 这样的东西，你可能会在栈中操作这些字段”，BIP 119 的作者 Jeremy Rubin 告诉 *Bitcoin Magazine*，“让它们按次序排列的好处会跟你有多大可能以程序来改变它们有关”。

“所以，一部分的推理是，nVersion 是最不可能被改变的，输入索引是最有可能被改变，其余的都在这两者之间”，Rubin 补充。

这里的假设是，比特币开发者在编程一个限制条款时，更有可能编程式地变更关于输出的信息，而不是输入的信息；而事实上，限制条款尝试做的正是限制资金可以被花费的方式。

因此，OP_CHECKTEMPLATEVERIFY 做的事情，总的来说就是 *检查* 这笔花费交易是否是被允许的。换句话来说，它会强制执行用 Sapio 编写出来的限制条款的约束。

但检查只会在栈中元素恰有 32 字节的时候发生。若非如此，CTV 会 OP_NOP 栈中的元素，意思是不会执行失败，而只会 “什么也不做”。

这个细微的区别是为了适应 CTV 未来可能的开发，比如，一个 “CTV v2” 可能会加入一个标签字节 —— 那栈中元素就需要是 33 字节了。那么，我们就不能使用 CTV 来检查它了，因为 CTV 只检查 32 字节的元素，我们要用会检查 33 字节元素的 “CTV v2” 来检查它。而这也是有可能做到的，因为 OP_NOP 会保证脚本执行会继续。如果不是 32 字节就传出错误，那么脚本执行就没法继续，然后这个元素也无法用 “CTV v2” 来检查。（译者注：这种情况下，激活了和没激活 CTV v2 的节点会分叉，因为执行结果不一致；但如果它只是会跳过，则不会分叉，因为两者的结果都是成功。）

“在标准规则下，即使有这些变更，一个 33 字节的 CTV 的交易依然会被网络拒绝，但如果矿工打包了它，则也是一笔有效的交易”，Rubin 解释道，“这保证了我们预期它在未来会被赋予明确的含义，从而阻止粗心的使用。”

## CTV 会进入比特币的下一次升级吗？

比特币的升级一直以其严明和细致而闻名，这是重视网络生存的一个重要象征，也保证了每一次代码变更的正确性。因此，CTV 会不会在可见的未来加入比特币，还是非常不明朗的。

虽然 CTV 已经不是一个新提案了，这个 BIP 是在 2020 年 1 月提出的，主要的比特币开发者仍然主张它需要更详尽的测试以及围绕建议内容的讨论，尤其是可能的优化和对替代方案的更详尽讨论。

CTV，在撰文之时，将为比特币加入有限的可能性，因为它谋求为协议实现低风险的限制条款。Rubin 告诉 *Bitcoin Magazine* ，目标是既能推出 *一些东西* 来为比特币启用一些新功能，同时又成为 “在影响我们已经实现的比特币验证上最简单的软分叉之一”。

“举个例子，像 CLTV 和 CSV 这样的软分叉，都需要一次软分叉来加入一个操作码和一次软分叉来实现共识层强制执行 nLockTime 和 nSequence 字段（语境型数据），而 CTV 验证只检查一个内在于这笔交易的一个属性”，Rubin 补充道。

Rubin 也说，他感觉开发者社区在审核他的提议时 “有那么一点儿双重标准”。

“CTV 承受着比以前我们实现的所有东西都要更高的标准”，他告诉 *Bitcoin Magazine*，“虽然我们应该不懈第提高标准，但是”，Rubin 澄清道，“我们不能否认，CTV 已经达到乃至超越了以前的分叉的测试和应用水平”。

本月早些时候，来自 Spiral 的比特币和闪电网络的开发者 Matthew Corallo [发推特](https://twitter.com/TheBlueMatt/status/1477818234153930752?s=20)表示，“在比特币的历史 上，从没有过不考虑替代方案，就通过提案、改变共识层的事”。Corallo [声称](https://twitter.com/TheBlueMatt/status/1477818020110090244?s=20) Rubin 和其他正在开发和支持 CTV 的人，在过去的几年中都没法提出 “一种更正式的方法来比较 CTV 和替代方案”。

“对 CTV 的推动 …… 感觉在所有地方都是错的”，Corallo [补充道](https://twitter.com/TheBlueMatt/status/1477818570394329090?s=20)。“感觉他们不是在协作工程，而是在说，‘你看，我开发好了，所以你们通过吧’，并无视所有的反馈”。

Blockstream 的研究总监 Andrew Poelstra 也表示希望看到京一部的解释和分析。在 *Bitcoin Magazine* 询问 CTV 是不是比特币在当前延伸功能性来支持限制条款的最佳方法时，他说，“应该不是”，并补充道：“CTV 并不是唯一一个在比特币上实现限制条款的提案 —— 而它在安全性和通用性上做出了权衡，并在两个方向上都留下了空间。”

“它能够工作的一个原因时， CTV 可能是实现 ‘减法限制条款（subtractive convenants）’ 的最高效的方法，即用户限制住了交易数据的绝大部分，只留下一部分允许自由改动”，Poelstra 说，“同时，其它像 [introspection opcodes](https://github.com/ElementsProject/elements/blob/master/doc/tapscript_opcodes.md) 这样的方案，可能是实现 ‘加法限制条款（additive covenants）’ 的最好方法，就是交易数据的绝大部分都可以自由改变，只有一小部分数据收到限制。如果我所言为真，那么社区需要更多的时间来研究它们，我们可能需要 APO *以及* CTV *以及*  通用的限制条款”。

APO，也即 [SIGHASH_ANYPREVOUT](https://anyprevout.xyz/)，是另一个为比特币添加新功能的提议，其详述是 [BIP118](https://github.com/bitcoin/bips/blob/master/bip-0118.mediawiki)。BIP118 的作者 Christian Decker 是 Blockstream 的一个研究员，专注于比特币的扩繁方案；他告诉 *Bitcoin Magazine* 他也认为 APO 和 CTV “是互补关系，而非竞争关系”。

“两者都是有好处的”，Decker 说，“所以我认为，在两者经过充分的审核和测试之后，两者应该一起激活”。

当前，激活的时机在比特币社区中是一个微妙的话题。实际上，一些开发者对 CTV 的反对，部分理由正是因为 CTV 的支持者描绘出来的一种紧迫感。如果尚未就绪的变更被添加到比特币的代码中，冲刺开发也可能带来坏处。

Decker 告诉 *Bitcoin Magazine*，他接受自己的提案要花比预期更长的时间来进入比特币，只要这些时间是花在更全面的测试中的，虽然他也理解 CTV 的支持者希望这个提案尽快激活。

“但我们不认为强推一个变更时有好处的，也不觉得 APO 迫切需要部署”，Decker 说，“提案酝酿的时间越长，就有越多人可以审核它并点出可能的弱点。审核者和开发者的时间是比特币最稀缺的资源，所以我们想要尊重这个特点，尽管（比如说）我们已经有了一些 eltoo 的（概念验证）实现。”

在 2021 年 10 月，在努力吸引大家关注他的提案时，Rubs 为 CTV 及其详述 BIP设立了一个 [bug 悬赏](https://twitter.com/JeremyRubin/status/1476007963403767808?s=20)，声称他愿意为任何在此软分叉中发现 “实质性” 错误的人奖励 1 万美元。奖金额度从那时候开始[增加了许多](https://twitter.com/JeremyRubin/status/1477760236115034113?s=20)，但一些开发者，包括 [Corallo](https://twitter.com/TheBlueMatt/status/1477814428061949954?s=20) 和 [Adam Back](https://twitter.com/adam3us/status/1477958056776540164?s=20)（密码朋克传奇人物、Blockstream 公司 CEO），都质疑 Rubin 的动机，并主张这不是获得更多审核的最好方法。

虽然一部分社区反对限制条款，Poelstra 表示，他认为 “比特币社区在接受这些想法时没有什么阴影魔障；我们只不过需要有人来担当责任、推动相关的公共沟通、工具、测试、发现可能的应用场景，等等，就像 Jeremy 为 CTV 做的那样。”

除了 Twitter 上的激烈讨论，Rubin 的提议还在 [bitcoin-dev 邮件组](https://www.mail-archive.com/bitcoin-dev@lists.linuxfoundation.org/index.html)中获得更正式的反馈和之一。最近为 CTV 给出反馈的开发者包括 [Michael Folkson](https://www.mail-archive.com/bitcoin-dev@lists.linuxfoundation.org/msg10743.html)、[Peter Todd](https://www.mail-archive.com/bitcoin-dev@lists.linuxfoundation.org/msg10753.html) 和 [Luke Dashjr](https://www.mail-archive.com/bitcoin-dev@lists.linuxfoundation.org/msg10791.html)。Decker 也为 CTV 和他自己的提案的交集[提出了自己的思考](https://www.mail-archive.com/bitcoin-dev@lists.linuxfoundation.org/msg10745.html)。Poelstra 与 *Bitcoin Magazine* 分享了他对 CTV 的反馈和建议。

“如果 CTV 是比特币社区想走的路，我会建议从两个角度入手去提升它：第一，改变其哈希算法的结构，使之对更通用的限制条款应用有用”，他说，“至于要怎么做到，则还是一个开放的研究领域，也是我希望我们能在接下来的几周里了解更多的地方。也许  CTV 应该像现在的签名检查一样，有 ‘sighash 标签’ 或类似的东西”。

“第二，我会建议稍微改变 CTV，仅仅将交易的哈希值推入栈中，然后要求用户使用现有的 EQUALVERIRY 操作码来检查它是否匹配一个给定的模板”，他补充道，“这会花费普通 CTV 用户额外一个字节的交易见证数据，但拓宽了比特币未来插件的设计空间”。

另一方面，Rubin 则告诉 *Bitcoin Magazine*，他认为按现在的面貌推出 CTV 就很有用，即使它功能性有限，它可以在未来迭代，增加额外的特性。

总而言之，虽然 BIP119 已经在比特币社区中引起了很大的轰动，但它所提议的升级的未来道路还很不明朗。其支持者希望提升比特币功能性范围、容纳新的应用场景的渴望，与一些老一辈人更谨慎的态度产生了冲突。

此外，在比特币的历史上，只有实现了压倒性的共识和已经被充分审核的升级才会被激活，CTV 可能还有很艰难的路要走，因为 Rubin 尝试倡导他的改进提案。这个开发者已经做了额外的工作，他创建了一个[专门的网站](https://utxos.org/)来索引大量的教育资源，来提高比特币友对 CTV 可以支持的可能应用的兴趣，但他对带有新功能的比特币协议的热情尚未得到比特币开发者社区的主要人物的认可。

到目前为止，BIP119 看起来停滞不前，在冲突中左支右绌：有些人希望为比特币增加新奇应用，而另一些人希望在给世界上最具革命性的货币系统变更共识的时候使用更谨慎的方法，他们认为这个系统应该存续千年，容不得半点闪失。

总而言之，两派人可能需要一些时间来达成共识，但随着这个提案获得更多的理解和兴趣，通往共识的道路正在铺就。

*衷心感谢 Rubin，他耐心地帮助笔者跨越理解的鸿沟。想获得 BIP119 的技术细节讲解，可观看这个几年前的研讨会视频（[part one](https://twitter.com/JeremyRubin/status/1223672458516938752) 和 [part two](https://twitter.com/JeremyRubin/status/1223729378946715648)）。这个[链接](https://diyhpl.us/wiki/transcripts/ctv-bip-review-workshop/)有相应的文字记录。其它有用的资源包括[这场访谈](https://twitter.com/brian_trollz/status/1481136636574457857?s=21)、[这期播客](https://podcasts.apple.com/us/podcast/the-chaincode-podcast/id1496858178?i=1000464142641)、[另一期播客](https://stephanlivera.com/episode/339/)，以及 [Rubin 和 Poelstra 之间的一场对谈](https://btctranscripts.com/tabconf/2021/2021-11-05-jeremy-rubin-andrew-poelstra-covenants/)。想参与围绕 BIP119 的讨论并聆听最新的讨论，[请加入 bitcoin-dev 邮件列表](https://lists.linuxfoundation.org/mailman/listinfo/bitcoin-dev)。*

（完）





