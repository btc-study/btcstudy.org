---
title: '给比特币友的 “权益证明” 指南'
author: 'Scott Sullivan'
date: '2022/09/14 22:54:21'
cover: ''
excerpt: '你想生活在怎样的世界中？'
tags:
- PoW
---


> *作者：Scott Sullivan*
> 
> *来源：<https://scottmsul.substack.com/p/a-bitcoiners-guide-to-proof-of-stake>*



一般来说，比特币友都不会太关注山寨币领域发生的事，但是，因为以太坊的 “[The Merge](https://ethereum.org/en/upgrades/merge/)” 计划在一个月内推出，圈内的推特颇显得吵闹。当然，比特币网络是不会受到什么影响的，但我认为，这个 “升级” 也值得关注。一旦以太坊让自己跟 “肮脏” 和 “浪费” 的 PoW（工作量证明）撇清了关系，我们可以预期叙事的战争（narrative war）即将出现，比特币友应该准备好反击。

学习 “权益证明（PoS）” 怎么工作，是了解它和 PoW 的区别、取舍的好办法。虽然我已经看过了许多关于 PoS 的抽象论述 —— PoS 有更多的准入要求、更加中心化，而且会变成寡头政治 —— 我得承认，如果不了解 PoS 的细节，这些说法听起来都有点虚无缥缈。通过深入研究 PoS 算法，我们可以慢慢看出，所有这些属性都是从其原理中自然产生出来的。所以，如果你也好奇 PoS 算法是如何工作的、为什么它的工作原理会导致它有这些属性，那就请读下去！

## 解决 “重复花费” 问题

我们先快速回顾一下我们到底想解决什么问题。假设我们有一个很多人参与的密码货币网络，希望维护一个去中心化的账本。我们将面临一个问题：我们的交易如何添加到每一个人的账本中，使得每个人都能对一笔交易是否 “真实（correct）” 达成共识呢？PoW 解决这个问题的办法非常优雅：交易以区块的形式分组，同时每一个区块的生产（成为所有人认可的正确区块）都需要耗费大量的计算工作。区块生产所需的工作量会提高和降低，以保证区块以平均每 10 分钟一个的速度生成；如此一来，在下一个区块生成出来之前，每个区块都有好几分钟的时间可以在网络中传播。账本的任何不确定性，都可以通过选择凝聚了最多区块生产计算量的链来解决，重复花费也由此得到制止（在同一条链上，不会有两笔交易花费同一笔资金，重复花费的交易将变成无效交易，带有无效交易的区块是无效的区块），因为重复花费若要成功必须要掌握超过 51% 的全局区块生产计算力（这样才有可能先在一条链上花费某笔资金，然后在分叉链上再次花费这笔资金并让分叉链最终成为更长的链）。

但是，假设现在我们想抛弃中本聪的洞见（正是这种洞见让上述解决方案成为可能）。毕竟，这些讨厌的 ASIC（专门用于区块生产计算的硬件）既可恨、又吵，而且它们所消耗的能源比乔治·索罗斯、比尔·盖茨、希拉里·克林顿的私人飞机加起来还要多。有没有一种办法可以让我们只需通过交谈，就能毫不含糊地同意哪些交易是 “真实的（true）” 呢？

以太坊的权益证明机制使用两个关键要素来解决这个问题。第一个要素是时不时地制作特殊的 “检查点区块（checkpoint blocks）”，其目的是向网络中的每一个人保证这个系统在不同时间的 “真相”。创建一个检查点需要以 “押金（stake）” 计算的 2/3 的多数同意，这样就能保证在该时间点，绝大多数的 “验证者（validator）” 都认可一个事实。第二个要素是惩罚给网络增加不确定性的用户，也就是所谓的 “罚没（slashing）”。举个例子，如果一个验证者创建了一条分叉链，或者给一条更老的分叉链投票（类似于 51% 攻击），那么 TA 的押金就会被罚没。验证者也会因为不活跃而被惩罚，但力度不会那么大。

（译者注：我认为，将 PoS 共识机制的参与者命名为 “验证者（validator）”，是不折不扣的语言污染。在原本的概念中，“出块者” 指的是共识机制的参与者（比如矿工），而 “验证者” 指的是验证共识结果的人（比如全节点），但使用 “验证者” 来指称 “PoS 共识的出块者” 完全混淆了原本很清晰的分类方法。下文将该含义下的所有 “validator” 都翻译成 “见证者”。）

这使我们可以得出 PoS 背后的第一条原理：**PoS 是基于负向激励（惩罚）的系统**。这跟比特币和 PoW 完全相反，因为 PoW 是一个基于正向激励（奖励）的系统。在比特币中，矿工可以尝试打破规则 —— 生产格式错误的区块、打包无效的交易，等等 —— 但这些区块会被忽略掉。最坏的影响也就是浪费一点能量。矿工也可以自由在更老的分叉链上生成区块，但如果没有占到全局的 51% 的区块生产力，这些老旧的分叉链就永远不可能追上当前的最长链，所以也只是白费力气。任何参与这些活动的矿工，无论存心还是无意，都不担心会损失自己此前积累的比特币，也不用担心损失矿机。所以比特币矿工不会生活在恐惧之中，在采取行动、承担风险的过程中，他们可以犯错。

生活在以太坊大陆上的见证者可就完全不同了。他们不是靠工作努力、为网络增加安全性而得到奖励，他们不做实际工作（do no actual work），只是必须小心让自己的节点不要越轨（misbehaves），以免自己的储蓄付之东流。无论人们对网络提出了什么变更，见证者的第一反应都是随大流，不然就有被罚没的风险。这些见证者每天都是如履薄冰。

![img](../images/a-bitcoiners-guide-to-proof-of-stake/624x418.png)

顺带说一句，根据 Vitalik 的《[PoS 常见问题解答](https://vitalik.ca/general/2017/12/31/pos_faq.html)》，让出块者活在负向激励系统中，正是 PoS 的 “好处” 之一，嗯。

![img](../images/a-bitcoiners-guide-to-proof-of-stake/131x899.png)

那么，在技术层面上，罚没机制到底是怎么工作的呢？我们是不是先要建立一份列明所有见证者的清单，然后才能罚没一些东西呢？没错，就是这样。要想在以太坊的 PoS 共识机制中担当一位见证者，你先要把 ETH 移动到一个特殊的 “质押” 地址中。这不仅是为了应用罚没机制，也是为了投票，因为检查点区块需要得到 2/3 的多数票。

全天候维护这样一个记载所有见证者的列表会产生一些有趣的影响。加入见证者队伍困难吗？能不能随时离开？见证者是否可以投票表决其它见证者的状态？这就使我们得出了 PoS 背后的第二条原理：**PoS 是一个有准入的系统。**

成为见证者的第一个步骤就是把一些 ETH 存入一个特殊的质押地址。需要多少 ETH 呢？最少 32 ETH，按现价大约 50000 美元。补充一下背景，像样的比特币挖矿设备一般是几千美元一台，如果你是家庭挖矿，你可以从几百美元一台的 S9 开始。公平地说，ETH PoS 共识的高门槛是有[技术上的理由](https://notes.ethereum.org/9l707paQQEeI-GPzVK02lA?view#Why-32-ETH-validator-sizes)的，更高的门槛意味着更少见证者参与，可以降低带宽要求。

所以，准入门槛是很高的，但是，任何人只要拥有 32 ETH，不就可以想参加就参加了吗？还真不是。如果大量的见证者在同一时间离开或进入，会有[安全风险](https://ethresear.ch/t/weak-subjectivity-under-the-exit-queue-model/5187)。举个例子，如果网络中绝大部分的见证者同时离开，那他们就能在一条（自己没有退出的）分叉链上重复花费一笔资金，而且在两边都不会遭受惩罚。为了缓解这种风险，进入 PoS 共识和离开 PoS 共识都有内置的排队机制（throuthput limit，直译为 “吞吐量限制”）。当前，这个限制被设定为每个 “时段（epoch）”（大约 6.4 分钟） ` max(4, |V|/65536) ` 个见证者，进入和退出都是这个限制。换算过来，就是每 10 个月可以换掉整个见证者集合。 另外，虽然现在见证者可以发布一条 “退出” 交易、停止参加 PoS 共识，但实际取出资金的代码还没完成。听起来有点像加州旅馆 ……

![img](../images/a-bitcoiners-guide-to-proof-of-stake/609x611.png)

<p style="text-align:center">- 你可以随时住进来，但你再也不能离开 -</p>


最后一点是批准新的见证者加入的经济激励。假设你是一个大公司的股东，而且这个公司业务稳定，每个季度都会给你分红。你会愿意无偿增发股票吗？当然不会，因为这样会减少现在所有股东的分红。类似的激励结构也存在于 PoS 中。因为每一个新的见证者加入都会稀释现在所有见证者的收益。理论上来说，见证者可以直接审查所有添加新见证者的交易，但是，我认为，在现实中，这样露骨的办法是行不通的。这会非常明显，而且会一夜之间摧毁以太坊的 “去中心化” 形象（可能还会导致价格暴跌）。我认为，人们会使用更巧妙的办法。比如，以 “安全性” 或者 “效率” 为借口、缓慢地改变质押规则，让参与 PoS 的门槛越来越高。任何牺牲新见证者、有利于现有见证者的政策，都会得到经济上的支持，不论有没有在台面上曝光。现在，我们可以看出来为什么 PoS 会变成寡头制了。

![img](../images/a-bitcoiners-guide-to-proof-of-stake/big-club.png)

## Casper 算法概述

我们已经知道 PoS 背后的抽象原理了，那么，以太坊的 PoS 算法到底是怎么工作的呢？检查点和罚没机制背后的想法，是在一个名为 “[Casper](https://arxiv.org/pdf/1710.09437.pdf)” 的算法中提出的，所以我们就从 Casper 开始。Casper 自身并没有给出生产区块的方式，相反，它给出的是一个框架，说明了如何在已经存在的树状区块链分支中 添加检查点/施行罚没机制。

首先，选出任意常熟 C 作为 “检查点间距”，该参数决定了两个检查点之间间隔多少区块。举个例子，如果 C = 100，那就表示检查点会在区块高度 0、100、200 …… 上建立。然后，所有节点也要投票下一个 “合理化（justified）” 的检查点。见证者不是一次只投票一个区块，而是投票一对检查点 ` (s, t) ` ，其中 s 代表之前已经合理化的检查点，称为 “来源（source）” ；t 代表见证者希望它合理化的检查点，称为 “目标”。一旦某一对检查点 ` (s, t) ` 获得以押金计算的 2/3 多数票同意，t 就会变成一个新的合理化的检查点。下图展示了一棵作为示例的检查点树。

![img](../images/a-bitcoiners-guide-to-proof-of-stake/65x1045.png)

在这个图中， ` h(b) ` 函数表示 “检查点高度”，例如整百号的区块。你可能会注意到，并不是每发生 100 个区块就必然得到一个合理化的检查点，因为投票可能无法达成多数。举个例子，假设在区块高度 200 时，两个检查点分别获得了 50% 的票数。因为在同一时段中投票两次会被罚没，所以除非某些见证者愿意被罚没，否则系统就会 “卡” 在这里。解决方案是大家 “跳过” 区块高度 200 的这个检查点，在区块高度 300 时 “再次尝试”。

一个检查点得到了合理化，并不意味着它已经 “终局化（finalized）”了。为了让一个检查点终局化，紧接着这个检查点的下一个检查点必须被合理化。举个例子，如果检查点 0、200、400、500、700 是一脉相承的并且都得到了合理化，那么只有检查点 400 会被认为是终局化的，因为只有它的下一个检查点才是合理化的。

因为这里的术语都是非常精确的，所以我们来概括一下这三个类别。“检查点” 指的是**任何**发生在区块高度  ` C * n ` 上的区块，所以如果 C = 100，区块高度 0、100、200、300 等等上的区块，**都是**检查点。即使区块高度 200 上出现了两个区块，它们也都是检查点。如果一个检查点是高度为 0 的创世块，或者 2/3 的见证者通过投票在以前的合理化检查点和这个检查点之间建立了联结，这个检查点就被 “合理化”。然后，如果这个合理化的检查点（作为来源）被联结到下一个检查点并且后者被合理化，这个检查点就得到 “终局化”。不是每个检查点都会被合理化，也不是每个合理化的检查点都会被终局化，哪怕在最终得到公认的链上也不必然。

## Casper 罚没规则

Capser 的罚没规则被设计成这样：**两条分叉上不可能有分别有一个终局化的检查点，除非至少 1/3 的见证者违反了罚没规则**。换句话来说，只有终局化的检查点应该被视为无可争议的 “真相”。甚至两条分叉链上是有可能分别出现一个合理化的检查点的，但不会各自产生一个终局化的检查点（除非有人被罚没）。什么时候会出现终局化的检查点、在哪里出现，也是没有保证的；只不过，当链分叉发生的时候，你应该坐下来，等待一个终局化的区块出现，出现了，你就知道那是 “真实” 的链了。

Casper 使用两条罚没规则来实现这种特性：

![img](../images/a-bitcoiners-guide-to-proof-of-stake/989x333.png)

第一条规则禁止任何人先后将同一高度的两个不同区块投票为目标检查点（即双重投票）。所以，假设一个见证者，在先后两次投票时，把高度 200 的两个不同区块作为目标检查点，TA 就会被罚没。这条规则的目标是防止链在同一个高度分裂成两个不同的合理化检查点，因为这将需要 2/3 + 2/3 = 4/3 的总票数，也就意味着至少 1/3 的见证者打破了罚没规则。不过，如我们前面所见，合理化检查点可以跳过某些高度。那么，怎么防止一条链分裂成两个不同的目标检查点呢？举个例子，检查点 200 能不能分裂成两条链，分别在高度 300 和 400 形成合理化检查点，而不会有人被罚没呢？

这就要用到第二条规则了，它的用意是防止出现一个投票 “包住” 另一个投票。举个例子，如果一个见证者给 (300, 500) 和 (200, 700) 投票了，TA 就会被罚没。在链分裂的情形中，一旦某个分叉形成了一个终局化的检查点，其它分叉就不可能出现终局化的检查点，除非有 1/3 的见证者打破了这第二条规则。假设现在区块链分叉出来两个合理化的检查点 (500, 800) 和 (500, 900)。后来，人们在第一条分叉链上看到了一个终局化的检查点 (1700, 1800)。因为 1700 和 1800 只能在一号分叉链上得到合理化（假定没有人打破第一条规则），那么二号分叉链上可以看到 1800 之后的合理化检查点的唯一可能就是有些人把低于 1700 的检查点作为来源、高于 1800 的检查点作为目标。但因为这会包住 (1700, 1800) 这个投票，而且合理化需要 2/3 的投票（而 (1700, 1800) 已经获得了 2/3 的票数），那么，就至少有 1/3 的见证者打破了第二条规则。Casper 论文给了一个很漂亮的图：

![img](../images/a-bitcoiners-guide-to-proof-of-stake/559x606.png)

就是这样，只要你遵守 Capser 规则，你就是个好人！

![img](../images/a-bitcoiners-guide-to-proof-of-stake/924x770.png)

听起来很简单，对不对？我们可以保证将罚没机制只是 PoS 用于维护共识的终极手段，而不是逼迫见证者以特定方式行事的勒索机制，不是吗？

![img](../images/a-bitcoiners-guide-to-proof-of-stake/75x1153.png)

<p style="text-align:center">- “给以太坊社区提问。如果绝大多数见证者在下文中选择了 A（妥协并在协议层开展审查），你会怎么做？X）将审查视为对以太坊的攻击，通过社会共识烧掉他们的押金；Y）容忍审查”“我会选择 X” -</p>


这使我们得到 PoS 背后的第三条原理：**PoS 没有规则**。大多数人说什么，“规则” 就是什么。

![img](../images/a-bitcoiners-guide-to-proof-of-stake/408x204.png)

每一天，你的节点（从技术上来说）都严格遵循 Casper 诫命，但是第二天你的储蓄就有可能被罚没，因为你做了别人不喜欢的事情。你是不是打包过红队的交易？那蓝队的大多数就会罚没你。或者，你做了相反的事情，对红队的交易视而不见，那么明天红队就会说你搞审查，然后罚没你。罚没的力量远远超出了 OFAC（美国财政部海外资产控制办公室）审查的权力限度。PoS 就像永不停歇的墨西哥大逃杀，随时都有被罚没的威胁。

![img](../images/a-bitcoiners-guide-to-proof-of-stake/624x351.png)

我完全不怀疑 —— 在有争议的硬分叉中，双方都会硬编码针对对方的验证规则，以惩罚任何想加入 “邪恶” 一方的人。当然，这是一个核武器按钮，而且就像核战争一样，双方可能只会选择以牙还牙而不是率先攻击。我也怀疑，绝大多数个人见证者，都是 “中立的”，他们比较关心财务上的自我保全，而不是在政治上自我牺牲，但如果他们意识到，“选边站” 是一种避免被罚没的有效方法，他们可能也会这样做。

## 说到哪儿了？

现在，我们已经知道了检查点和罚没的基本知识，可以进入以太坊实际使用的算法 “Gasper”了。这是 Casper 和 GHOST 的一个组合。Casper 我们前面已经介绍过，而 GHOST 是一种用以在检查点之间选出 “最优” 链条的策略。

理解 Gasper，你要知道的第一件事情是，它将时间当成了一个主要的独立变量。真实世界的时间被切分成了 12 秒一个的 “时隙（slot）”，每一个时隙最多只能包含 1 个区块。许多个时隙组成了一个 “时段（epoch）”，每个时段都有一个检查点。一个时段包含 32 个时隙，所以每个时段的时长为 6.4 分钟。值得指出的是，这种范式逆转了在 PoW 中的时间与区块生成的关系。在 PoW 中，区块产生是因为找出了一个有效的哈希值，而不是因为过了多长时间。但是在 Gasper 中，区块产生是因为现实世界走过了足够长的时间、该到下一个时隙了。这样的系统会遇上什么棘手的时间问题，我只敢想象，不敢细数；尤其是，这不是运行在一台计算机上的程序，它是运行在全世界数万台尝试同步的计算机上的系统。希望以太坊的开发者们熟悉《[程序员对计算机时间的误区](https://gist.github.com/timvisee/fcda9bbdff88d45cc9061606b4b923ca)》。

现在，假设你要建立一个见证者节点，你要首次同步区块链。你只能看到使用了特定时间戳的特定区块，你怎么知道这些区块真的是在那个时间产生的？因为区块生产不需要做功，恶意的见证者群体不能伪造出一条从创世块开始的假链吗？而且，如果你看到了两条相互竞争的区块链，你怎么知道哪一条是真的呢？

由此，我们得出了 PoS 背后的第四条原理：**PoS 依赖于主观理解**。因为没有客观的办法从两条相互竞争的链中选出真实的那一条，而且任何新加入网络的节点都必须信任现有的一些节点作为事实的来源、解决不确定性。这跟比特币完全不同，在比特币中，凝聚了最多工作量的链就是那条 “真实” 的链。几千个节点告诉你 X 链是真的也没用，只要一个节点放出了 Y 链，而且 Y 链包含了更多的工作量，Y 就会成为真实的链。一个区块的区块头就告诉了你它的价值，所以它可以完全消除信任需要。

![img](../images/a-bitcoiners-guide-to-proof-of-stake/929x683.png)

<p style="text-align:center">- 这些 0 表明了找出这样一条哈希值是需要做功的 -</p>


因为依赖于主观理解，PoS 重新引入了信任需要。现在，我要承认，从这里开始，我可能会带上一些偏见。如果你想了解另一边的意见，Vitalik 写了一篇包含他的观点的[文章](https://blog.ethereum.org/2014/11/25/proof-stake-learned-love-weak-subjectivity)。我承认，在现实中，因为 Casper 规则，链分裂不太可能发生，但无论如何，我从比特币中得到的心神安宁，在这里是不可能的。

## 区块生产与投票

现在，我们已经熟悉了时隙和时段，那么单个区块是如何生产的，又是如何投票的呢？在每个时段开始之前，所有见证者会被 “随机” 地分成 32 组，每一组负责一个时隙。在每一个时隙中，“随机” 选出的一位见证者会成为区块生产者，而其他人则是投票者（或者说 “见证者（attestor）”）。我把 “随机” 打上引号是因为这个过程必须是确定性的，因为每一个人都必须无偏差地同意哪些验证者负责哪个时隙。但是，这个过程也必须是不可愚弄的（non-exploitable），因为区块生产者拥有优势地位，他们可以获得现在称为 “矿工可抽取价值（Miner Extractable Value）” 的额外价值（现在已经被重命名为 “最大可抽取价值（Maximun Extractable Value）”了）。有一篇好文讲了这种价值是怎么回事：《[以太坊是一个黑暗森林](https://www.paradigm.xyz/2020/08/ethereum-is-a-dark-forest)》。

那么，一个区块生产出来之后，其他见证者如何投票（或者说 “见证”）呢？区块提议被假设在时隙的前半段（前 6 秒）发生，而投票则在后半段发生，所以理论上来说，见证者应该有足够多的时间给自己所在的时隙的区块投票。但如果区块提议者下线、通信失败，或者构造了无效区块呢？其实，见证者的任务不是必须给所在的区块投票，而是指出从当时的自己出发 “看起来最棒” 的区块。在正常情况下，这个最好的区块就是他们所在时隙的区块，但也可能是更老的区块。不过，“最好的区块”，在技术上来说是什么意思呢？这就是 GHOST 算法的用场了。

GHOST 是 “可观察到的最贪婪的最重子树（Greediest Heaviest Observed SubTree）”，而且是一种贪婪的递归算法，用于找出包含最多 “最新活动” 的区块。基本上，这种算法将近期的所有区块看成一棵树，它会遍历整棵树，贪婪地选出累积有最多见证的分支。每个见证者都只有最新的一条见证消息会被计入，最终算法会得出某个叶子区块作为 “最好的区块”。

![img](../images/a-bitcoiners-guide-to-proof-of-stake/930x744.png)

见证者的见证消息中不仅包含对当前最好区块的投票，还包含了引向这个区块的最新一个检查点。需要指出的是，在 Gasper 中，检查点是基于时段而非区块高度的。每个时段都指向具体的一个检查点区块，要么是这个时段的第一个时隙中的区块，要么（假如这个时隙没有出块的话）是这个时隙以前的最新一个区块。理论上来说，同一个区块可以是两个不同的时段的检查点（前一个时段的每一个时隙都没有出块），所以，检查点使用 (epoch, block) 对来表示。在下图中，“EBB” 是 “时段边界区块（Epoch Boundary Block）” 的缩写，表示一个时段的检查点；而 “LEBB” 则是“最新的时段边界区块” 的缩写，表示整体上最新的一个检查点。

![img](../images/a-bitcoiners-guide-to-proof-of-stake/922x419.png)

类似于 Casper，一个检查点得到超过 2/3 的见证之后就会合理化；而如果其下一个时段的检查点也被合理化，该检查点就被终局化。投票机制的工作流程的一个示例如下图。

![img](../images/a-bitcoiners-guide-to-proof-of-stake/928x362.png)

 Gasper 也有两个罚没条件，跟 Casper 的罚没规则类似：

1）不能在同一个时段中重复投票。

2）一个投票所包含的检查点区间不能被 “包在” 另一次投票的检查点区间内。

尽管 Gasper 基于时段而废除区块高度，Casper 的规则依然能保证两条分叉链上不可能都有终局化的检查点，除非 1/3 的见证者被罚没。

同样值得一提的是，见证消息会被包含在区块中。类似于 PoW 中的区块使用自身的哈希值来为自己辩护，PoS 中一个终局化的检查点也会使用它过往的所有见证消息来为自身辩护。当某些人违反罚没规则是，这些坏的见证消息也会被包含到区块内，证明其越轨。区块生产者还有一个小额的经济激励去打包这些证明越轨的消息，这是为了给人们提供激励去惩罚破坏规则的人。

## 分叉

想象一下在分叉的时候会发生什么，是有趣的事。快速回顾一下，分叉指的是共识规则的变更，可以分成两种：硬分叉和软分叉。在硬分叉中，新的规则是不向后兼容的，可能会产生出两条互相竞争的区块链（要是两条链上谁也不愿意切换的话）。而在软分叉的，新规则比起老规则更加严格，所以它们是向后兼容的。一旦超过 50% 的矿工或者见证者开始强制新的规则，共识机制就会切换，而不会产生分裂。软分叉通常跟升级和新的交易类型有关，但从技术上来说，它也包括由 51% 的多数执行的任何类型的审查。PoS 还有一种 “分叉”，是 PoW 没有的：不是因为共识规则变更而引起的链分裂。但因为前面我们已经讲过了，这里就只讨论硬分叉和软分叉。

我们从最简单的情况开始：一个专门的、有争议的硬分叉。“有争议” 的意思是，某一条规则变更让人们产生政治上的派别。漏洞修复和微小的技术改变不太可能有争议，但有些变更 —— 比如改变见证奖励 —— 可能就会。如果一个硬分叉有很大争议，链分叉就可能发生，但最终会因为用户卖出一条链上的资产、购入另一条链的资产而得到经济上的解决。就像 2017 年的 Bitcoin Cash 分叉，似乎胜负已分：

![img](../images/a-bitcoiners-guide-to-proof-of-stake/951x523.png)

现在，假设某一天见证者们开了一场大会，认为他们没有得到足够的奖励，并决定将回报率从每年 5% 变成每年 10%。显然，这是牺牲非见证者的利益来满足见证者的胃口。要是出现了链分裂的话，哪条链会赢呢？

这就推导出了 PoS 背后的第五条原理：**金钱就是权力**。现在世界上有超过 1.2 亿的 ETH ，超过 10% 已经质押了起来，就如下图所示。

![img](../images/a-bitcoiners-guide-to-proof-of-stake/945x346.png)

假设一个硬分叉在见证者和非见证者之间产生了争议，假设所有的非见证者都在新链上卖掉所有的币、而所有的见证者都在旧链上把所有的币卖掉，那么理论上来说，旧链会赢，因为绝大部分的 ETH 还在非见证者手上（90% vs. 10%）。但我们还有一些东西需要考虑。首先，在分叉之后，见证者们依旧 “控制着” 两条链。如果见证者们有能力影响旧链，他们可能有激励让这条链失败。其次，上文说的核武器依然存在，新链可能会罚没依然在旧链上出块的见证者，以迫使他们加入。最后，一些见证者可能比网络中的其它人有更强大的社会和政治影响力。如果 Vitalik、以太坊基金会和交易所都结成了同盟，决定提高见证奖励，我很难相信普通的以太坊用户和见证者可以保证旧链继续运行，同时通过买入来让旧链变得相对更有价值。

至于软分叉，要是出现了有争议的软分叉，比如 OFAC 审查，那会怎么样？见证者是非常中心化的，看下面这个图就知道了。

![img](../images/a-bitcoiners-guide-to-proof-of-stake/884x849.png)

不像 PoW 中，矿工可以一键切换矿池，以太坊上的见证者被锁定在一个质押地址中，在发起退出交易之后才能离开。要是 Lido 和最大的交易所准备审查某一些交易，他们很容易可以达到决定检查点的 2/3 多数。前面我们已经看到了 Vitalik 和其它 ETH 见证者可以如何使用反审查的硬分叉来跟审查软分叉对抗（同时罚没审查者）。即使他们成功创建了一条分叉，这个过程中也会有许多价值被摧毁，不论是因为罚没，还是因为信任的崩塌。

## 结语

在这篇文章中，我们探讨了 PoS 如何使用 Gasper 算法来解决重复花费问题。Gasper 是 Casper 检查点/罚没规则和 GHOST “最佳区块” 投票规则的结合体。

Gasper 将时间划分成叫做 “时隙” 的单元，每个时隙只能包含最多一个区块；多个时隙组成时段，每个时段指向一个检查点。如果 2/3 的多数都投票了某个检查点，这个检查点就得到了合理化；而如果两个相邻的检查点的得到了合理化，两个中的第一个检查点就被终局化。一旦某个检查点得到终局化，与之相竞争的分叉链就不可能被终局化，除非超过 1/3 的见证者被罚没。

在这个过程中，我们发现了 PoS 的五条原理：

**1）PoS 使用负向（基于惩罚）的激励结构。**

**2）PoS 是一个带有准入机制的系统。**

**3）PoS 没有规则可言。**

**4）PoS 依赖于主观理解。**

**5）在 PoS 中，金钱就是权力。**

这些原理的每一条，都跟 PoW 相反：

**1）PoW 使用正向（基于奖励）的激励结构。**

**2）PoW 是一个无准入的系统（任何人都可以随时开始，也可以随时结束）。**

**3）在 PoW 中，不遵循规则的分叉会被忽略掉。**

**4）PoW 依赖于客观事实。**

**5）在 PoW 中，矿工为用户服务，而且只有有限的权力。**

我相信，每个人都应该奋力为自己想生活于其中的世界奋斗。如果你跟我一样，希望生活在一个没有准入的世界中，想控制自己的财产，希望努力工作可以得到奖励、被动的所有权成为债务，希望货币可以一直存储价值而不会因为一时兴起而改变，那么，你应该仔细思考 PoW 和 PoS 的区别，以及为你偏爱的原则奋斗。

（完）
