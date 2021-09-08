---
title: '比特币开发之道'
author: 'Alex B.'
date: '2021/09/07 16:19:58'
cover: '../images/the-tao-of-bitcoin-development/c60b282deb994081bd56353ee37ff367.png'
excerpt: '“我们不要国王、总统和投票。我们相信的是大致共识和运行代码。”'
categories:
- 比特币主网
tags:
- 比特币
- 升级
---

*作者：Alex B.*

*来源：<https://medium.com/@bergealex4/the-tao-of-bitcoin-development-ff093c6155cd>*

*译者：闵敏 & 阿剑*




![](../images/the-tao-of-bitcoin-development/c60b282deb994081bd56353ee37ff367.png)

<center>- 八卦通常是道家及其思想的象征 -</center>

过去几年来，比特币扩容问题引发热议，史无前例地将大众的目光聚焦在了比特币协议演进背后的开发流程上。虽然开源软件项目历来都要承受来自利益竞争的重压，并应对不同开发团队所推崇的不同愿景，但是，在比特币这个项目上，这个系统关系到的利益的范围和种类，以及人们对开发流程发表意见的动机，凝结成了一种完全独一无二的情形。

在应对这些挑战时，大型开源项目有小心定义的宗旨、使命和原则，以指导贡献者的工作。互联网工程任务组（Internet Engineering Task Force，IETF）的[《IETF 之道：](https://www.ietf.org/tao.html)[互联网工程任务组新手入门](https://www.ietf.org/tao.html)[》](https://www.ietf.org/tao.html)就是一个广为人知的例子。作为成员遍布全球的最大标准化组织之一，IETF 有着数十年志愿者开发工作的组织经验。更重要的是，IETF 的 “大致共识” 与比特币开发的决策流程惊人的相似。

过去，社区内部没能理解影响比特币协议方向的正确做法，形成了[不必要的冲突](https://medium.com/@bergealex4/on-extended-communication-failures-5ffb6fcc6b89)。现在，这一问题再度制约了比特币的发展，尽管相关参与者都怀有最大的善意。我们应该记住，开源项目的发展需要大家齐心协力。如何让社区中的每个人都有机会凝聚来自各方的正能量，更高效地产出成果，这是我们当下需要应对的挑战。

本文旨在以 IETF 的指南作为范本来促成比特币社区成员的相互理解。除了如何为比特币做贡献之外，本文还概述了如何在这一过程中达成共识。文中所述概念只是我这个门外汉的个人浅见，不代表官方意见和正式标准。

## 比特币开发领域

目前，Bitcoin Core 项目是比特币开发活动中最活跃、最高产的主打项目。它拥有一个较为松散的开发团队，聚集了数百名来自世界各地的志愿者，共同为比特币实现做贡献。他们的成果都保存在 [Github.com/Bitcoin](http://github.com/bitcoin) 库里。

Bitcoin Core 项目不设管理机构，也没有成员制度：面向所有人开放，任何人都可以成为贡献者，并基于以往的贡献质量获得影响力（类似同行评审）。为了促进开发工作，首席维护者会任命专门的维护者负责监督发布周期，来推动项目的进展。这种等级划分和相关头衔反映的是客观情况，不附带任何形式的特权或权力。如果有任何实体滥用了对 Bitcoin Core 项目代码库的控制权，其余成员可以自由 fork 该项目并继续展开工作。

虽然 Bitcoin Core 项目从未正式定义过自己的使命，但是我们可以从[过去的交流](https://bitcoincore.org/en/2015/09/01/open-letter/)中推断出一些具体目标。Bitcoin Core 致力于：

1. 维护网络的健康发展
2. 达到最高的性能标准
3. 为所有用户保障比特币的安全性
4. 出于用户的考虑维护并发布面向比特币社区的软件
5. 支持向后兼容的升级，以便用户保留当前选择
6. 保护网络的核心特征：去中心化、安全性和免许可创新

虽然大多数贡献者都是志愿参与，但是也有一些实体通过资助或直聘等方式提供资金支持，以确保开发工作的可持续性。这些实体包括但不限于 [Blockstream](http://blockstream.com/)、[ChainCode Labs](http://chaincode.com/)、[Ciphrex](https://ciphrex.com/)、[MIT DCI](http://dci.mit.edu/index.html) 和 [Purse.io](https://www.google.com.ph/url?sa=t&rct=j&q=&esrc=s&source=web&cd=1&cad=rja&uact=8&ved=0ahUKEwj8h4Xp6bLUAhXGXLwKHX4rAXsQFggmMAA&url=http%3A%2F%2Fbcoin.io%2F&usg=AFQjCNEDIYJ4Y4NUvySAcXEZLK7IsDZlqw&sig2=Nyv_V7Ge5jM2gYECoaOsjQ)。这些实体几乎都会制定具体的合同条款和协定来维护开发者的独立性，并帮助他们避免与比特币及其用户产生利益冲突。

Bitcoin Core —— 2016 年的开发活动报告：https://www.youtube.com/watch?v=eK1gfMV2Tqw

经年累月的协作、高水平的资深开发团队和可信的成就记录使得 Bitcoin Core 成为了比特币领域最值得信赖的实现。但是，Bitcoin Core 项目之所以能成为比特币协议的技术骨干，只是因为全世界比特币用户的自发行为。Bitcoin Core 既不能控制比特币，也不能单方面强行改变其共识规则。很多用户和企业都运行自己的 Bitcoin Core 软件。其他开发者则创建了自己的实现，有的基于 Bitcoin Core 代码库，有的是使用另一种语言从头创建的。知名的例子有 btcd、Libbitcoin、 Bcoin 和 NBitcoin。

然而，整个比特币开发领域远不止 Bitcoin Core 项目和这些个人开发者。已经有成百上千名学者对比特币及其生态系统和相关技术进行了研究，并发表了共计[ 1150 多篇论文](https://cdecker.github.io/btcresearch/)。2015 年起举办的比特币扩展性研讨会（[Scaling Bitcoin Workshop](https://scalingbitcoin.org/about)）为开发者和研究者提供了不可多得的机会，他们就协议开发事宜进行合作，并从学术角度探讨比特币技术的演进。另外，斯坦福（Stanford）、普林斯顿（Princeton）和苏黎世联邦理工学院（ETH Zurich）等机构在比特币研究方面也有着丰富的资源。

## 如何作贡献？

目前有几种方式可以为比特币开发做贡献。凡是了解当前流程并尊重多年来形成的标准和惯例的人都可以参与进来。

新的贡献者面临的最大挑战之一是代码库的广度和相关技术的复杂性。具体来说，新人常常会发现所谓的新想法鲜少具有创新性，十有八九是之前就已提出或思考过的。

为使开发者做出卓有成效的贡献，避免在错误的道路上越走越远，开发者也被鼓励在提出正式的建议之前先查阅下文列出的各种在线资源。

自由及开放源代码软件（FOSS）的开发注重开放式交流。迄今为止，已有各式各样的平台建立，为贡献者提供提案反馈渠道。

### **参与前须知**

比特币开发以 [bitcoin-dev](https://lists.linuxfoundation.org/mailman/listinfo/bitcoin-dev) 邮件列表为核心。[bitcoin-dev](https://lists.linuxfoundation.org/mailman/listinfo/bitcoin-dev) 列表对待所有实现一视同仁，目前由 Linux 基金会打理。有意参与比特币开发的贡献者应当查阅邮件列表中的[归档文件](https://lists.linuxfoundation.org/pipermail/bitcoin-dev/)，一来提前熟悉开发流程，二来挖掘与其工作有潜在关联的内容。

为了将焦点放在技术讨论和提案上，该邮件列表内的讨论有少许删减。原始讨论可以在 [bitcoin-discuss](https://lists.linuxfoundation.org/mailman/listinfo/bitcoin-discuss) 邮件列表中找到。

贡献者如有任何关于比特币开发的想法或问题，还可以在其它平台上寻求意见和解答，例如 IRC 免费节点上的 #bitcoin-dev、#bitcoin-core-dev 和 #bitcoin-wizards 等频道。这些频道的历史日志还包含大量可能对贡献者有价值的信息，可点击下方链接查看：

1. [#bitcoin-dev](http://bitcoinstats.com/irc/bitcoin-dev/logs/2017/06)
2. [#bitcoin-core-dev](https://botbot.me/freenode/bitcoin-core-dev/)
3. [#bitcoin-wizards](https://botbot.me/freenode/bitcoin-wizards/)（[点击此处](https://download.wpsoftware.net/bitcoin/wizards/)，查看更早期的内容）

此外，很多由个人维护的网站上都收集并归档了各个圈子里多年来讨论的想法。其中，开发者 [Bryan Bishop 的 wiki](http://diyhpl.us/wiki/bitcoin/) 收录的信息最全面，尽管理解起来确实很难。另外还有一些社区资源包括[ Bitcoin Wiki](https://en.bitcoin.it/wiki/Main_Page) 和 Bitcointalk 的[ “开发和技术讨论板块（Development & Technical Discussion section）”](https://bitcointalk.org/index.php?board=6.0)。

最后，近年来还出现了一些线下集会，通过另一种社交场景支持技术合作并宣传新的想法。这类例子包括但不限于[ SF Bitcoin Devs](https://www.meetup.com/fr-FR/SF-Bitcoin-Devs/) 见面会、[NYC Bitcoin Devs](https://www.meetup.com/fr-FR/BitDevsNYC/?chapter_analytics_code=UA-72468922-1)、[Bitcoin Milano 见面会](https://www.meetup.com/fr-FR/bitcoinmilano/)、[Paralelni Polis Bitcoin 见面会](https://www.paralelnipolis.cz/program/bitcoin-meetup/)、[Scaling Bitcoin](https://scalingbitcoin.org/) 大会和[ S3ND](https://s3nd.org/) 圆桌会议。

### **提议和实现**

对贡献代码和参与代码评审感兴趣的开发者请阅读[这篇指南](https://bitcoincore.org/en/faq/contributing-code/)。考虑到对整个生态的影响，如果有开发者想要改变比特币的共识规则，或者引入需要标准化的功能，需要付出极大的努力。

比特币采用的比特币改进提案（BIP）机制类似 IETF 的 Request For Comment (RFC)。RFC 被用来记录与互联网背后的核心系统相关的新标准、方法或技术。开发者 Amir Taaki 将这一概念应用于比特币。比特币 BIP 的初始规范主要改编自 Python 的[ PEP-0001](https://www.python.org/dev/peps/pep-0001/)，后由开发者 Luke-Jr 进行[修订](https://github.com/bitcoin/bips/blob/master/bip-0002.mediawiki)。

> 我们的目的是让 BIP 成为提议新功能、收集社区对某项议题的意见和记录已采纳的比特币设计决策的主要机制。BIP 的作者有责任在社区内部建立共识，并记录反对意见。—— [ *BIP2，BIP 流程（修订版*](https://github.com/bitcoin/bips/blob/master/bip-0002.mediawiki)*）*

BIP2 的 “[BIP 工作流程](https://github.com/bitcoin/bips/blob/master/bip-0002.mediawiki#bip-workflow)” 部分强调了 BIP 流程本质上是一种协作工具。

鉴于比特币的分布式信任特征和开源原则，开发者需要严格遵守科学的同行评审模型。对于任何提案的成功乃至良性比特币开发来说，透明性和开放对话都至关重要。新加入的贡献者在参与开发流程时应保持谦虚的心态，切勿在初期因提案被拒绝而气馁，因为比特币社区沉淀多年的知识和经验绝非一人之功。

这一严格的审查流程需要尽可能多的参与者加入，才能就某项提案建立起共识。涉及到更改比特币系统共识规则的提案尤其重要。虽然有些人可能觉得这一惯例很繁琐，但是不尊重它很有可能导致不信任和内斗，从而阻碍开发进程。即使某项技术提案非常合理，也有可能因其作者试图绕过既定流程而被质疑动机不纯，迟迟未能通过。为避免这类情况，贡献者应积极加入比特币生态的相关组织并进行交流，尤其是与其他开发者的交流。如果你想了解不同参与者的职责以及达成共识的要求，可以阅读 BIP0002 的 “基本原理（[*Rationale*](https://github.com/bitcoin/bips/blob/master/bip-0002.mediawiki#Rationale-2)）” 部分。

> 如果你决定尝试编写一份 IETF 标准文档，请做好心理准备：虽然每个步骤都非常简单，但是整个流程可能会很繁琐。尽管如此，还是有很多人毫发无伤地成功了，而且还有大量文字指南帮助作者或多或少地保留自我。—— 《IETF 之道：互联网工程任务组新手入门》，[2012](https://www.ietf.org/tao.html#rfcs.ids)

一旦某个新想法满足了上述要求，它的支持者就会编写一个可行的、与当前的规范兼容的实现。此举旨在保持向后兼容性，并尽可能降低破坏性。为了实现互操作性，开发者 Eric Lombrozo 提出了 [BIP123](https://github.com/bitcoin/bips/blob/master/bip-0123.mediawiki)，基于与提案交互的网络层对提案进行分类。

## 大致共识和运行代码

> 在很多方面，IETF 都是基于参与者的信念运行的。 “最根本的信念” 之一就像 David Clark 早期提及 IETF 时所言：“我们不要国王、总统和投票。我们相信的是大致共识和运行代码。” ——《IETF 之道：互联网工程任务组新手入门》，[2012](https://www.ietf.org/tao.html#rfcs.ids)

多年来，已经有很多文章探讨了比特币的治理模型（及其缺陷）。中本聪在 2010 年销声匿迹时，并没有给后人留下任何关于如何做出重要共识决策的指示或指导。

纵观比特币的发展史，这没有造成什么问题。对协议的技术修改很少引起争议，用户也信任同行评审过程。评审参与者会根据技术优点对提案进行评估，一旦认定某项提案达到 “最低采纳标准（[the minimum standards for inclusion](https://bitcoincore.org/en/faq/contributing-code/)）”，就会将其合并到比特币的代码库中。

久而久之，随着生态系统中参与者多样性增加以及参与者之间在利益和预期上分歧加剧，建立共识的潜在挑战浮出水面，这是意料之中的结果。许多人认为，比特币系统的社会复杂性阻碍了它的技术演进。在没有权威机构的情况下，不同利益相关者如何在关于比特币协议基本规则的争论中达成可接受的结果？

缺乏耐心的参与者[倡导](https://freedom-to-tinker.com/2015/05/11/bitcoin-faces-a-crossroads-needs-an-effective-decision-making-process/)正式的治理模式，即，授予高调的参与者特权，让他们来把控比特币协议的方向。遗憾的是，这类治理模式与比特币的共识机制背道而驰，因为比特币系统的规则是由用户驱动的共识（user-driven consensus）维护的。一旦公众人物被赋予了过多的权力，就会成为敌对势力胁迫和施压的目标。

> 大致共识有很多定义；一个简单的版本是，对于很强烈的反对意见，人们必须持续讨论下去，直到绝大多数人都认可这些反对意见是错误的为止。—— 《IETF 之道：互联网工程任务组新手入门》，[2012](https://www.ietf.org/tao.html#rfcs.ids)

更完善的决策流程可以从 IETF 采用的 “大致共识” 模式中得到。[《论 IETF 的共识和分歧》](https://tools.ietf.org/html/rfc7282#page-3)的部分章节提供了深刻的见解，帮助比特币开发者正确看待以共识驱动的开发。

### [**没有分歧比一致认同更重要**](https://tools.ietf.org/html/rfc7282#section-2)

推动比特币开发的一个重头戏是让某个协议获得支持。可惜人们常常错把广泛支持的表象当作共识。即使某个想法达到了认同的衡量标准，可能也只是得到了社区的青睐，只要有人明确提出异议，就不能判定社区就该想法达成了共识。即使只有一个贡献者在技术层面上提出了有效的反对意见，也要集体解决，如果这个反对意见的分量足够重，甚至可以阻止提案的实现。

因此，开发者在考虑提案时应本着 “最小分歧” 原则。虽然让所有人都达成一致意见是不切实际的，但是我们可以通过权衡所有分歧并确定它们属于不可调和问题还是工程偏好问题来达成 “大致共识”。

### [**只要考虑到了一切问题，即可达成大致共识，不一定要全部解决**](https://tools.ietf.org/html/rfc7282#page-7)

透彻地思考提案的潜在问题固然重要，但也要承认，工程上总是存在取舍，需以最务实的方法处理。另一种方法是不要让 “完美成为优秀的敌人”。

开发团队应不带有任何偏见地权衡每个反对意见，对评审过程持开放态度，并确定最终决策。如果每个人的担忧都能得到彻底审视，让开发团队更好地理解潜在的替代方案，并论证替代方案的优越之处，开发流程就能取得重大进展。

> 如果只是绝大多数人都不认同反对意见，还不足以称之为大致共识。团队必须真诚思考反对意见，并评估其是否会导致其它问题。如果无法进行论证或评估，就不能算作真正的共识。—— 《[论 IETF 的共识和分歧](https://tools.ietf.org/html/rfc7282#page-3)》，[2014](https://tools.ietf.org/html/rfc7282#page-7)

不同的问题在性质和重要性上不尽相同，但是只要团队承认所有潜在权衡都得到了妥善处理，就更有可能实现最佳技术成果。团队应该警惕任何试图通过 “讨价还价” 的方式不顾合理的反对意见而作出让步来加速开发流程的行为。开源开发不容许任何为了内斗而在工程上做出妥协的行为，尤其是在比特币系统中，利益团体不应凌驾于用户安全之上。

### [**共识是道路而非终点**](https://tools.ietf.org/html/rfc7282#section-5)

> 虽然 IETF 在大致共识方面不可能有完美的原则，但是如果我们无法警醒自己坚守这些原则，未来只会越来越难坚守它们，最后导致技术成果滑坡。 —— 《[论 IETF 的共识和分歧](https://tools.ietf.org/html/rfc7282#page-3)》，[2014](https://tools.ietf.org/html/rfc7282#page-7)

在讨论共识问题时，最常见的问题之一是，如何评估共识是否已经达成。典型的做法通常是数人头和其它容易被误解或受到操控的社会信号。这些做法过分关注结果而忽视了过程，可谓因小失大。

更准确地来说，建立共识是一种实现开放式协作的系统方法，即，一种基于生态中每个参与者的输入得到最佳技术成果的迭代过程。只要生态中的每个参与者都认可一套最佳规则，并共同遵守基本的开源原则，得到满意结果的可能性就会提高。这背后的透明度至关重要，以便没有直接参与其中的用户可以判断他们想要采用的变更的合法性。

我之所以要强调这一点，是因为系统的共识最终取决于用户运行的代码以及用户通过自己的验证节点执行的规则。虽然某些变化无需经历漫长而繁琐的生态审查过程就可以实行，但是那些涉及共识层的变化需要相关参与者之间进行大量协调。一旦操之过急，随之而来的时间压力会让部分参与者觉得自己的意见没有得到应有的考虑，最终导致一无所获。

> 对于新手来说，还有一点非常重要：IETF 绝不会 “管理互联网”，尽管有些人可能有这种误解。虽然 IETF 制定的自愿性标准常被互联网用户采用，但是 IETF 绝不会控制，甚至审查互联网。如果你是因为想要成为审查者而对 IETF 产生兴趣，那 IETF 要让你失望了。—— 《IETF 之道：互联网工程任务组新手入门》，[2012](https://www.ietf.org/tao.html#rfcs.ids)

就协调各方利益和维护协议的去中心化性质而言，比特币的社会经济影响带来了独特的挑战。幸好这是有先例可循的，互联网协议标准的发展史为我们提供了应该如何应对这些挑战的宝贵信息。本文强调的 IETF 准则并非凭空出现，而是经过长期磨砺得到的。如今，很少有用户记得，互联网也经历过要解决[自身扩容问题](https://twitter.com/i/moments/879724151124115456)、各方欲争夺其控制权的阶段。IETF 对于开放式开发的坚持在维护系统的自愿性及技术完整性上发挥了关键作用。

![](https://upyun-assets.ethfans.org/uploads/photo/image/63f3dd35ffd04025b4839c9115a741a8.png)

<center>- <a href="https://groups.csail.mit.edu/ana/People/DDC/future_ietf_92.pdf">MIT 的 David Clark 在 1992 年的 IETF 会议上的重要演讲节选</a> -</center>

翻译：随着互联网及其社区发展，我们如何管理变革和发展流程？

- 开放式流程 —— 让所有声音都能被听到。
- 封闭式流程 —— 取得进展。
- 快速流程 —— 与现实接轨。
- 慢速流程 —— 留出思考时间。
- 市场驱动流程 —— 通往商业时代。
- 扩容驱动流程 —— 通往互联网时代。

如今，我们的社区正面临 20 多年前互联网遇到的相同困境。在不久的将来，我们做出的集体决策有可能对比特币的演化产生深远影响。虽然商业利益对整个生态的发展来说至关重要，但是我们应该尽量避免让它们干预开发流程，不能让短期利益阻碍协议实现长期抗逆性所需的工程。

归根结底，比特币网络由全球成千上万名自愿运行该软件实例的独立用户支持。在这种情况下，任何破坏开源开发流程的行为必然会导致用户之间的不信任。虽然某些用户可能认为自上而下的举措会加速比特币技术的进步，但是更有可能阻碍它。更糟糕的是，对加速开发的强烈欲望有可能对比特币协议造成无法修复的损害。

我们可以合理地假设，很多参与者都以自己的利益为重，可能会担心这种缓慢的渐进式进程会影响到自己的业务。因此，我们要让每个相关方都参与开放式交流和合作，以确保在解决短期问题时不会牺牲比特币技术的长期愿景。比特币技术有希望比我们这代人走得更远。

毕竟，比特币就是未来。

（完）
