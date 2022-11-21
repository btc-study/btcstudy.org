---
title: '小众比特币实现的历史及其可欲性争议'
author: 'Aaron van Wirdum'
date: '2022/11/20 17:15:38'
cover: ''
excerpt: '小众的比特币实现是加强了比特币网络呢 —— 还是削弱了它？'
categories:
- 比特币主网
tags:
- 文化
---


> *作者：Aaron van Wirdum*
>
> *来源：<https://bitcoinmagazine.com/technical/the-long-history-and-disputed-desirability-of-alternative-bitcoin-implementations-1474637904>*
>
> *原文出版于 2016 年。*

![Blockchain - The Long History and Disputed Desirability of Alternative Bitcoin Implementations](../images/the-long-history-and-disputed-desirability-of-alternative-bitcoin-implementations/tations.jpg)

本周恰逢[以太坊基金会](https://ethereum.org/)的 Devcon2 大会在上海召开，以太坊网络的一大部分却[崩溃了](http://cointimes.tech/2016/09/ethereum-bug-makes-geth-nodes-crash-while-ethereum-classic-not-affected/)。[似乎是](https://np.reddit.com/r/ethtrader/comments/53ea3g/can_someone_please_eli5_the_geth_hack/d7sc7cd)一名攻击者在使用有意设计得难以执行的智能合约，最多人用的以太坊实现 Geth [停止了工作](https://blog.ethereum.org/2016/09/18/security-alert-geth-nodes-crash-due-memory-bug/)，而另一种实现 —— Parity 客户端 —— 也出现了[问题](https://www.reddit.com/r/ethereum/comments/53eaj2/security_alert_all_geth_nodes_crash_due_to_an_out/d7sddl9)。发现攻击之后，以太坊的开发者在几个小时内为 Geth 客户端编写了一个[热修复](https://github.com/ethereum/go-ethereum/releases/tag/v1.4.12)，似乎解决了问题，至少暂时解决了。* 有趣的是，在修复的过程中，小众的以太坊实现（Geth 和 Parity 以外的实现）都安然无恙。除了因为使用 Geth 的矿工离线导致哈希率下降，对使用这些小众客户端的大部分用户来说，以太坊网络运行平稳。网络没有中断，被[某些人](https://www.youtube.com/watch?v=KDggJvvc6L8&feature=youtu.be)认为证明了以太坊使用多个互通的软件实现（而不是单一客户端）的优越性。

以太坊在这一时刻的成功，反过来，又[点燃](https://twitter.com/peterktodd/status/777646825218138112)了比特币社区已经存在多时的辩论：小众的比特币实现是加强了比特币网络呢 —— 还是削弱了它？

## “模范实现”

替代性的比特币软件实现是不是好事的问题，已经争论了许多年了。这些实现（也叫客户端），本质上是计算机程序，连接到比特币网络，因此也是网络的一部分。围绕着小众客户端的角色，这样的辩论可以追溯到比特币历史早期，那时候的比特币社区主要是由修补软件的技术工作者组成的。

第一个比特币实现毫无疑问是[中本聪](https://bitcoinmagazine.com/guides/who-created-bitcoin)发行的，是用 C++ 编程语言编写的。这个客户端后来被称为“Bitcoin-Qt”，再后来成了现在的 Bitcoin Core；有时候它被称为比特币的 “模范客户端”，也叫 “[中本聪](https://bitcoinmagazine.com/guides/who-created-bitcoin)客户端”。有一段时间，这是唯一一种比特币实现 —— 虽然随着时间推移，中本聪放出了更新版本，也就是同一种客户端的稍微不同的版本。

中本聪自己认为，最好是整个网络只使用一种比特币实现。他认为不同的实现可能会用不同的方式来处理数据，因此会带来极大的风险 —— 它们可能会跟其他人无法同步。中本聪警告说，这会削弱比特币的一种关键属性：所有用户都能对区块链账本的状态达成共识的能力。

在 2010 年，跟 Gavin Andresen 在 [Bitcointalk](https://bitcointalk.org/index.php?topic=195.msg1611#msg1611) 论坛辩论时，中本聪说：

> “我不认为开发另一种兼容的比特币实现是一个好主意。整个设计的大部分都依赖于所有节点可以整齐划一地得到完全相同的结果；第二种实现会变成对网络的威胁。”

Gavin Andresen —— 他后来接替中本聪成了比特币的模范实现的开发主管 —— [回应](https://bitcointalk.org/index.php?topic=195.msg1613#msg1613)道，替代性的客户端好不好根本无关紧要。Andresen 认为这是不可避免的 —— 无论中本聪喜不喜欢。

他说：

> “无论你是否认同，早晚总会有人尝试在网络中搞破坏（或试图令它为己所用）。他们要么会魔改现有的代码，要么会写出自己的，然后变成对网络的威胁。”

## 第一种替代性实现

事实证明，中本聪喜不喜欢替代性的比特币实现确实无关紧要。在比特币的创始人从社区消失后，第一种替代性客户端很快冒出头来。

首开风气的是 [libbitcoin](https://libbitcoin.org/)，这个项目在 2011 年首次发布。这个项目用 Amir Taaki 领导，目的是提供中本聪客户端的替代选择，以去中心化对比特币的控制、提高网络应对攻击的健壮性。

在《[Libbitcoin 宣言](https://libbitcoin.dyne.org/libbitcoin-manifesto.pdf)》中，Taaki 这样解释自己的动机：

> “由许多钱包和实现组成的多元化比特币，将是强大而纯粹的比特币。为了保护网络的完整性，我们需要消除单点故障。在所有地方都使用相同的软件代码，会具有相同的弱点，而且无法抵抗同一种攻击；这样的比特币是近亲繁殖的。一种病原体就可以消灭拥有相同基因的一个种群。而且中心化的软件也很容易收到控制着其软件代码开发的人的支配，因此也受到可以向这些人施压的人的支配。”

稍晚一些时候，更多的替代性实现出现了。Mike Hearn 的 [bitcoinj](https://bitcoinj.github.io/) 是第一种使用另一种编程语言（Java）编写的比特币客户端，随后 Jeff Garzik 推出了 [picocoin](https://github.com/jgarzik/picocoin)、Tamás Blummer 推出了 [Bits of Proof](https://bitsofproof.com/)。

在 2013 年，一种使用谷歌的编程语言 “Go” 编写的比特币实现 [Btcd](https://github.com/btcsuite/btcd/tree/master/docs#About) 发布了。当时 *Bitcoin Magazine* 还有一位作者 Vitalik Buterin [报道](https://bitcoinmagazine.com/articles/btcd-a-full-bitcoin-alternative-written-in-go-1368114292)了此事。

Buterin 的文字唱和了 Taaki 对更多元的生态系统的呼求：

> “一套协议走得越深，它越会变成一种单一文化；但单一文化是危险的。如果只有一种被广泛使用的实现，那么，升级中引入（甚至是修复了）意料之外的 bug 时，比特币区块链也有可能完全分叉成两条，因为两个版本的协议无法对另一方的交易和区块的有效性达成共识。”

那时候，Andresen 已经成为了 Bitcoin Core 的开发带头人。与三年前跟中本聪辩论时相比，Andresen 甚至更加相信了多种实现会强化比特币生态。

在为 “比特币基金会（Bitcoin Foundation）” 撰写的一篇[博客](https://web.archive.org/web/20130809080513/https://bitcoinfoundation.org/blog/?p=204)中，他写道：

> “多样性是好事。多样、可互通的比特币协议实现，会让网络更能对抗软件 bug、DoS 攻击和漏洞。”

自此，越来越多的比特币实现进入到了[比特币网络](https://bitnodes.io/nodes/)中，大部分都是用新一种编程语言来撰写的。

## 批评

出现越来越多的比特币实现，看起来是多客户端方法的成功。但是，大部分的比特币网络依然由 “榜样客户端” —— Bitcoin Core 的各种版本 —— [主导](https://bitnodes.io/nodes/)。迄今为止，完全的重新实现得到的关注似乎比较少，不论是用户、公司还是（尤其是）矿工。

在 2015 年，在比特币开发者邮件组中[联系](https://www.mail-archive.com/bitcoin-development@lists.sourceforge.net/msg07052.html) libbitcoin 开发团队时，Bitcoin Core 的开发者 Peter Todd 解释了他理解的原因。简单来说，用户、公司和矿工，都要求软件遵循比特币协议。而比特币协议，Todd 认为，（某种程度上）是由中本聪客户端的代码实现来 *定义* 的。

“起源于中本聪的、在共识上关键的源代码，就是协议的 *规范*，只不过它恰好也是机器可以阅读和执行的”，Todd 写道，“如果你重写共识代码 —— 重新实现协议的规范 —— 你就跑开了比特币开发这一政治性的流程。你这不是在去中心化比特币 —— 因为你不参与，留下了一个更小、更中心化的开发流程，你实际上是在助推它的中心化。事实是，你在 libbitcoin 中实现的并不是比特币协议，也不会被矿工接受、被要求严格的商家和交易所使用 —— 他们是真正的政治力量的源泉。”

在写信给另一个开发邮件组时，Todd 使用了同样的逻辑，认为甚至源于中本聪的源代码中的 bug 都应该被认为是协议的一部分 —— 意思是任何 “没有 bug” 的替代性软件实现，在这个意义上，都不是在运行同一套协议。对于真正运行比特币协议的替代性实现，它们必须是 “同病相怜（bug-for-bug compatible）”。

因此，Todd 主张，开发者不应该完全重新实现一套代码，应该直接复制 Bitcoin Core，然后为自己的需求稍微调整代码。Todd 自己正是这样做的，他开发了 [Replace-by-fee fork](https://github.com/petertodd/bitcoin/tree/replace-by-fee-v0.13.0)，而 Bitcoin Core 开发者 BtcDrak 和 Luke Dashjr 也是这样做的，他们维护者 Bitcoin Core 的子版本 [Bitcoin Addrindex 和 Bitcoin Knots](https://bitcoinmagazine.com/articles/bitcoin-rbf-bitcoin-knots-and-bitcoin-addrindex-three-core-forks-that-don-t-break-with-consensus-1458237046) 。（而且，在过去几年中，另一种趋势出现了，一些开发者想要提高比特币的区块大小限制，发行了 [Bitcoin XT](https://bitcoinxt.software/)、[Bitcoin Classic 和 Bitcoin Unlimited](https://bitcoinmagazine.com/articles/unlimited-classic-and-bitpay-core-bitcoin-s-new-kids-on-the-blockchain-1452705977) —— 只不过这些子版本都是为了在特定条件下迁移到一套新协议而设计的。）

## 反批评

当然，Todd 的主张也受到了批评。

举个例子，虽然众所周知另类实现会承担分叉为一个自己的小网络的风险，Btcd 开发者 Dave Collins 指出，比特币已经由许多软件版本组成，其中就包括中本聪客户端的许多版本。而且，这些同一种客户端的不同版本也可以分叉为一个小网络，而且也确实[发生过](https://bitcoinmagazine.com/articles/bitcoin-network-shaken-by-blockchain-fork-1363144448)。

因此，Collins 生成，同一种客户端的不同版本，跟替代性客户端没有区别。他在博客中说：

> “现在来说，没有任何版本可以保证**任意**两种比特币软件的版本 —— 无论它们是 Bitcoin Core 的不同版本，还是两种小众实现的不同版本，还是一种 Bitcoin Core 和另一种实现的某个版本，甚至是 Bitcoin Core 的同一个版本但使用不同编译器的两份拷贝 —— 可以绝对达成共识。做到这一点是非常难的，甚至是不可能的。这个问题跟实现没有关系。”

Libbitcoin 现在由 Eric Woskuil 领导。意料之中的是，Voskuil 也同意 Collins 的观点。而且，当 Voskuil 知道 Todd 关于 bug 也是共识的一部分、应该进入实现的代码时，他主张这意味着没有 *任何* 一种实现能够定义比特币协议。

“所有影响共识的代码都是共识的一部分”，Voskuil 告诉 *Bitcoin Magazine*，“但如果某一些代码会导致网络停机，或者会产生一些坏的效果，它就叫 bug，而且需要修复，但这样的修复也是对共识的更改。因为 bug 是共识，修复就是分叉。因此，单一的实现会给它的开发者赋予太多权力。在网络停机的时候，一群人却在 “星室” 里推出一种新的共识规则，这是不折不扣的专制。”（译者注：“星室” 为英国历史上的一个特殊法庭，以不公开审判而知名。）

## 以太坊

本周以太坊 Geth 节点的失败似乎贡献了第一个真实世界的的案例：一组节点实现宕机，而小众的节点 —— 以及网络自身 —— 却保持运行。

当然，以太坊生态内部的多样性，在很大程度上是以太坊创始人 Vitalik Buterin 的远见的结果 —— 你没看错，就是上面那位呼唤更多元的比特币生态系统的 *Bitcoin Magazine* 作者。从一开始，以太坊就推出了多个不同的客户端，而不是一个模范实现。

然而，并不是每个人到认为在 Geth 节点宕机时以太坊能继续运行是一个好事。Peter Todd 就[依然认为](https://twitter.com/peterktodd/status/777646825218138112)，所有节点行为一致会更好 —— 即使这意味着全部节点都宕机。

Todd 跟 *Bitcoin Magazine* 解释道：

> “基本上，这里面的权衡是很简单的。多种实现将网络的可用性置于首位，但使用网络的同时修复问题是非常危险的事。Parity 节点不能以正常的速度传播区块，提高了孤儿块率并让交易的区块确认得而复失。更低的哈希率使得 51% 攻击的风险更大。Geth 的修复也可能失败。而且总的来是，在事件 *期间*，有无发生上述任何一件事都是不可知的。最安全的做法是在出错时全部停机，在这个案例下就是几个小时的宕机时间 —— 这并不是什么大事。”

而且 Todd 认为，如果 Geth 节点没有宕机、转而确认或拒绝某些交易和区块，情况会变得更糟。

“Geth 节点可能很容易会变成另一条链，这时候问题会变得更糟，因为不知道哪一条才是正确的链了”，他说。

当然，这也使 libbitcoin 的 Eric Voskuil 不能同意的地方。Voskuil 向 *Bitcoin Magazine* 表示他认为 Todd 理解这个问题的方式是错的：协议应该由真正使用它的人来定义，而不是由软件实现来定义。

“压根没有什么 ‘正确的链’ —— 只有选择使用什么链的人”，Voskuiil 说，“如果唯一的实现定义了共识，而它失败了，那共识在哪里？事实是以太坊网络上的人继续使用其它实现，这就意味着为 Geth 编写修复的开发者无法定义共识，而且他们需要认可 *实际* 的共识。”

## 未来的策略

展望未来，正在开发的多个项目也许有潜力让比特币生态系统变得更加多样 —— 或许，也会让链分裂的风险变得更大。至少一些人是这么认为的。

Peter Todd [指出](https://twitter.com/peterktodd/status/777651433759969280) “形式化证明（formal proof）” 也许可以派上用场。在向 *Bitcoin Magazine* 解释这个概念时，他说：

> “简单来说，形式化证明是用数学来证明代码实现了你对它的期望。或者，至少这些代码具有特定的属性。这可以用来验证不同的实现确实在运行同一种协议。这不是异想天开；形式化证明已经有点比特币中，用来证明 libsecp256k1 库的一些部分是正确的。”

另一个有前景的项目可能是 libconsensus，是一个来源于 Bitcoin Core 代码的软件库。这是 Bitcoin Core 开发者从 2014 年开始的一项工作，它也许能让替代性的实现更容易采用跟网络的其余部分保持共识所需的代码。

Bitcoin Core 和 [Blockstream](https://blockstream.com/) 的开发者 Jorge Timón 一直是 libconsensus 最主要的支持者和贡献者之一。他向 *Bitcoin Magazine* 解释，仅凭 Bitcoin Core 是当前最多人使用的实现，就认为 “这个实现就是规范”，是很有问题的。

“在一定意义上，这对其它实现并不公平，”，Timon 说，“他们被警告不要重新实现共识验证程序，但除了 ‘在 Bitcoin Core 节点上运行你想要的东西’ 之外，他们没有得到别的解决方案。所以，我们正从 Bitcoin Core 中分离出足以完全验证一个区块 —— 而且仅有这个功能 —— 的代码。这可以被别的实现使用，作为基础。”

但是，Libbitcoin 的 Voskuil 依然怀疑 libconsensus 对比特币生态的多样化是不是真的必要：

“Libconsensus 是一个真诚的项目，希望帮助创建一个更加多元的社区；libbitcoin 也支持它作为一个选项”，他告诉 *Bitcoin Magazine* ，“但它不足以成为一个长期的解决方案。它并不是必要的，而且会让开发变得更加复杂，而且当前除了脚本验证什么都不能做。要是它能延展到覆盖所有可能导致分叉的东西，那它很大程度上就会成为一种节点实现。我们可以抛弃自己的脚本验证代码来迁就 libconsensus，但随着 libconsensus 延伸到包含对共识有影响的一切东西，我们又如何自处呢？千里之堤，溃于蚁穴（It's a camel's nose under the tent）。”

Voskuil 加了一句：

> “最后，所有这一切都是有争议的。另类的实现已经存在、并且运行在网络中了。它们不会止步，只会越来越多。认为共识无法可靠地在多种代码中实现、无法在单种实现的多个版本中实现的想法，不仅是荒谬的，也是不切题的。”

（完）