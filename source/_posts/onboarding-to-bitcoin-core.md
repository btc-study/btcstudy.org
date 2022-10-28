---
title: 'Bitcoin Core 贡献者新手指南'
author: 'Amiti Uttarwar'
date: '2022/10/28 17:35:45'
cover: ''
excerpt: '如果你也想为 Bitcoin Core 作贡献，我希望它可以帮助你找到适合自己的方法'
tags:
- 贡献
---


> *作者：Amiti Uttarwar*
> 
> *来源：<https://medium.com/@amitiu/onboarding-to-bitcoin-core-7c1a83b20365>*



过去一年来，我都在为 Bitcoin Core 作贡献，感觉仿佛掉进了《爱丽丝漫游仙境》里的兔子洞那般奇妙。一路走来，我有幸得到了很多人的指导和支持，也收获了一些心得。在本文中，我想要分享一些我觉得很实用的工具。

为 Bitcoin Core 作贡献只是改进比特币协议的方式之一。 还有很多其它方式，包括但不限于参与邮件列表讨论、研究攻击向量或扩容技术、为 Lightining 客户端之一（[[1] ](https://github.com/lightningnetwork/lnd) [[2] ](https://github.com/ElementsProject/lightning)[[3] ](https://github.com/ACINQ/eclair) [[4] ](https://github.com/rust-bitcoin/rust-lightning)）作贡献、开发 secpk256k1 库之类的工具或更好的[测试基础架构](https://bitcoin.jonasschnelli.ch/)。但是，这些内容都不在本文的讨论范畴内。

本文是 Bitcoin Core 的新手指南，以我为 Bitcoin Core 作贡献的亲身经历为例。如果你也想为 Bitcoin Core 作贡献，我希望它可以帮助你找到适合自己的方法。

## 阅前须知

- 首先，请务必阅读[比特币白皮书](https://bitcoin.org/bitcoin.pdf)。如果你还没读过白皮书，请停止阅读本文。

- 若想针对 Bitcoin Core 提出有效 PR（哪怕是最微不足道的那种），你必须了解比特币的基本运作概念和原理。获取知识的途径有很多。我建议先阅读[《精通比特币》](https://github.com/bitcoinbook/bitcoinbook)、[《比特币编程》](https://github.com/jimmysong/programmingbitcoin)、[《领悟比特币》](https://github.com/kallerosenbaum/grokkingbitcoin)中的任意一本。想要获取在线资源，可以访问 Jameson Lopp 的[资源集合](https://www.lopp.net/bitcoin-information.html)或 Chaincode Labs 的[课程](https://github.com/chaincodelabs/bitcoin-curriculum)。前者涉及的维度更广，后者则偏重协议开发部分。

- 如果你立志成为 Bitcoin Core 的贡献者，不要过度纠结于弄清楚每个概念的细枝末节。在比特币领域，很多话题之间都有着数不清的微妙差别。你的目标应该是从整体到局部对比特币系统有大致了解。你需要时间来消化这个分布式共识系统的基本运作原理。

- [Bitcoin Optech](https://bitcoinops.org/) 的每周时讯是了解比特币生态内技术发展情况的 *最佳* 途径。你可以关注 [Dave Harding](https://github.com/harding) 获取最新动态。我强烈建议你订阅。

## 如何做减法

一旦你决定要为 Bitcoin Core 做贡献，你将踏上一条永无止境的征途。比特币项目之复杂、发展之快足够我们花上几辈子的时间。为了有效分配你的注意力，你需要明确哪些是你不想关注的（至少就当下而言）。

若想改进 Bitcoin Core，你必须在拓宽广度的同时加深深度。找到平衡点是一门需要积累的艺术。拓宽广度可以让你接触更多新的概念，找出相关性。若想提出改进代码库的 PR (pull request)，你不只需要具备全局视角，还要深入钻研某一方面，熟悉你所提议的变更集。

过来人总喜欢向新手推荐过多需要阅读学习的材料和吸收掌握的知识点……我已经在“阅前须知”部分推荐了 3 本书、2 个持续更新的资料集合和 1 个每周时讯。另外，你需要对比特币有广泛的了解，才能与其他人无障碍交流任意有关比特币的话题，这也在无形当中给你施加了压力。这些都有助于拓宽你的广度，但是深度需要你自己想办法挖掘。你想要针对哪一方面提出改进的 PR，就得精钻哪一方面的知识（无论是多么微小的点）。不要过度沉溺于“内化”阶段，只有找到专注点才能助你踏入“创造”阶段。

如果你不是整天都在研究比特币，就更应该注意这点。比特币是一个究极复杂的项目。即使是看似简单的任务也会需要花上一段时间才能完成。

以上就是我给新手的人生建议。现在来看具体的项目……

## 熟悉代码库

- 克隆代码库，编译它并运行测试

- 通读比特币项目的开发者文档：

1. [《如何为 Bitcoin Core 作贡献》](https://github.com/bitcoin/bitcoin/blob/master/CONTRIBUTING.md)是新手入门的必读指南，阐述了 PR 准则和审核流程。

1. [《开发者须知》](https://github.com/bitcoin/bitcoin/blob/master/doc/developer-notes.md#development-guidelines)可以先快速浏览一遍，等到提 PR 之前再细读，以确保你遵守最新标准。

1. [《生产须知》](https://github.com/bitcoin/bitcoin/blob/master/doc/productivity.md)提供了**非常有用**的技巧，可以帮助你优化工作流程。我强烈建议你立马完成前四项（安装`ccache`、利用 `./configure` 、使用 `make -j [num-cores]` 进行编译，以及明确构建目标）。

- 阅读 [Jimmy Song](https://bitcointechtalk.com/a-gentle-introduction-to-bitcoin-core-development-fdc95eaee6b8) （[中文译本](https://www.btcstudy.org/2022/09/23/a-gentle-introduction-to-bitcoin-core-development/)）和 [John Newbery](https://bitcointechtalk.com/contributing-to-bitcoin-core-a-personal-account-35f3a594340b) 撰写的新手入门博客文章。

- 参加每周[ PR 审查俱乐部](https://bitcoincore.reviews/)。审查 PR 对于比特币项目来说非常重要。尤其对于新手来说，这种方式可以有效帮助你了解代码库和合并流程。参与审查俱乐部可以让你在他人的帮助下了解具体的变更集。你在审查俱乐部投入多少精力就会获得多少回报。每周笔记可以增进你对技术架构和历史背景的认识，如果你独力前行，将需要花费更长的时间。无论你是默默收听会议还是提前花时间了解代码后参与会议，你都会获益匪浅。做好会前准备不仅便于你利用会议时间提出疑问，也能增强你对代码理解的信心。

## 找到你的第一个 PR

等你熟悉了代码库后，你或许会觉得自己虽然有能力提 PR，却不知如何选择真正对项目有价值的 PR。本文提到了很多获取比特币知识的途径，你极有可能会从中找到一个尚待研究的领域。如果你还没有找到，也可以考虑以下选择：

- 关注 [good first issue](https://github.com/bitcoin/bitcoin/issues?q=is%3Aopen+is%3Aissue+label%3A"good+first+issue") 和 [up for grabs](https://github.com/bitcoin/bitcoin/issues?q=is%3Aopen+is%3Aissue+label%3A"Up+for+grabs") 这两个标签。对于标签为 up for grabs 的问题，一定要将开放问题和已关闭问题都筛选出来。

- 使用 grep 在代码库中搜索字符串 “TODO”并进行解析，看看是否有符合你对代码库熟悉程度的任务。我在测试时看到过一些适合新手的任务。

- 选择代码库的一个部分（即，[《如何为 Bitcoin Core 作贡献》文档](https://github.com/bitcoin/bitcoin/blob/master/CONTRIBUTING.md#contributor-workflow)的其中一节），并关注与之相关的开放状态下的 PR。持续关注人们对这些 PR 的讨论，你**肯定**会注意到后续的待办事项。另外，辩证地思考如何测试修改后的代码。如果你能开放 PR 以解决代办事项并增加测试覆盖面，我们将万分感谢。如果你想更深入了解自己感兴趣的部分，还可以查看 [PR 审查俱乐部的相关历史记录](https://bitcoincore.reviews/meetings-components/)。

从本质上来说，开源贡献意味着没有中心化的项目管理系统。因此，有些变更集虽然对项目有用，但是其 PR 作者并不一定投入了全部注意力和技能集。因此，新手贡献者需要找到符合自己学习曲线的（小众但）有用的贡献。我提的第一个 PR 就是源自这个 [up-for-grabs PR](https://github.com/bitcoin/bitcoin/pull/13931) 。

出乎我意料的是，可贡献之处竟如此之多，这是我在认真查看比特币的 Github 库之前不敢想象的。

面对如此深受年轻人欢迎又令人敬而远之的 Bitcoin Core 项目，我简直不敢相信为其作贡献竟这么容易。看到永无止境（或简单或复杂的）代办事项，就会发现比特币项目是如此稚嫩，亟需更多贡献者。

## 善用互联网作为学习工具

当我开始学习 C++ 时，我得到了一些很棒的书，但老实说，我还在努力吃透它们。

动手实践带来的学习效果最好，而且我在学习 C++ 语言的过程中将主要精力放在了如何看懂 Bitcoin Core 代码库上。

因此，我会写代码。当我遇到一个新的 C++ 概念时，我会阅读文档并尝试将这个功能订单独放到一个示例程序里。我总会打开一个 [tmux](https://github.com/tmux/tmux) 页签调用 `c++ play` 。这些程序也可作为文档记录我修改过的概念。另一个很棒的工具是[编译器浏览器](https://godbolt.org/)。我发现高亮显示尤其有助于比较同一个功能的不同执行方式，可以分辨出它们之间的区别是否流于表面，发掘其中真正优化过乃至具有颠覆性的方式。

为了更深入了解具体的 C++ 概念，我喜欢上了观看 [CppCon 频道的视频](https://www.youtube.com/playlist?list=PLHTh1InhhwT6KhvViwRiTR7I5s09dLCSw)，尤其是 《基础知识回顾》系列。

虽说有了个良好的开始，但有时候我希望能跟真人交流。起初，我碰到过一些关于标点的问题，却又不知道如何使用 google 搜索（例如，知道了 `:` 放在某个特定位置时表示初始化程序列表）。这些天来，我总想确认我在阅读文档和修改概念的过程中得到的理解是否正确。

我发现了一些很棒的网络社区，网友们都很乐意为我答疑解惑。如果你也对 C++ 感兴趣，可以加入 [CPP lang 的 slack 频道](https://cpplang.now.sh/)、`##C++-general` IRC 频道和 [#include 社区](https://www.includecpp.org/)及其 [Discord 频道](https://discordapp.com/invite/ZPErMGW)。我从没想到网友会给我带来这么大的帮助。我也在 `#git` IRC 频道上提问过。

两点注意事项：

1. 我支持你向网友求助，但是请注意礼貌和方法。在求助他人之前，先自己查阅资料，试试看能否找出问题的答案。请注意语气态度友好，根据你想问的问题选择适合的通讯频道。别人并不亏欠你，帮助你都是出于善心。

1. 选择一个 IRC 客户端：我发现 irccloud 是一个操作简单、界面美观的服务器，而且不需要你购买工具。你也可以选择花点钱买个永久用户名和日志。可供选择的 IRC 客户端有很多，但是我建议你将精力放到更重要的决策上，随意选择一个客户端即可。

我最喜欢的比特币资源基本上都在本文分享过了，但我还要着重推荐一些关于代码的资源：

- 关于 P2P 消息和 RPC 的[开发者参考](https://bitcoin.org/en/developer-reference)

- [Bitcoin Stack Exchange 网站](https://bitcoin.stackexchange.com/)上有专门针对协议开发的讨论。谷歌搜索不太能搜到。我建议你直接访问该网站，按主题进行搜索。

- Fabian Jahr 整理了一份关于如何调试 Bitcoin Core 的综合文档 [[演讲](https://www.youtube.com/watch?v=6aPSCDAiqVI&t=1s)] [[要点](https://gist.github.com/fjahr/2cd23ad743a2ddfd4eed957274beca0f)]

- 我很喜欢 James O'Beirne 关于比特币架构的概述 [[演讲](https://youtu.be/L_sI_tXmy2U)] [[幻灯片](https://jameso.be/dev++2018/#1)]

如果你在某个技术概念上存有疑问，不知道该如何解决，请联系我！我当然不是什么问题都解决得了，但是我很乐意通过各个途径进行头脑风暴，帮助你找到解决方案。

## 更多学习比特币的途径

有很多绝佳途径可以增进你对比特币生态系统发展情况的了解。以下是一些高信噪比的方法：

- 北京时间每周五凌晨 3 点 `#bitcoin-core-dev` 有一场 IRC 会议。

- `#bitcoin-core-pr-reviews` 频道上有时也会有人讨论流程和工具，因此关注该频道可能会有帮助。

- 关注 Chaincode Labs 的比特币课程，内含演讲、论文乃至代码挑战等丰富资源！

- 参加[高质量会议](https://bitcoinops.org/en/newsletters/2019/12/28/#conferences)。

- 观看之前会议的视频。我利用通勤时间观看了 Bitcoin Edge Dev++ [[2017](https://www.youtube.com/playlist?list=PLlWSs86hGNb8QKRuRP3maUsVmZm8uVmIR)] 和 [[2018](https://www.youtube.com/playlist?list=PLlWSs86hGNb8bUsTnDmZz2ZvMfHy9fS_t)]，从中获益匪浅。

- 如果你居住的城市有举办[苏格拉底式研讨会](https://bitcoinmagazine.com/articles/op-ed-want-to-learn-about-bitcoin-try-a-local-socratic-seminar)，可以参加。

- 阅读[比特币的维基百科](https://en.bitcoin.it/wiki/Main_Page)，尤其是关于协议和隐私的部分。

- Chaincode 近期推出了关于比特币协议的[播客](https://podcast.chaincode.com/)。

理解比特币协议并非易事，对全职工作者和学生来说更是如此。我利用[间隔重复](https://en.wikipedia.org/wiki/Spaced_repetition)的抽认卡来记忆新的知识。我强烈推荐这个方法，它可以增强你的长效记忆力，让你有更多时间获取新的概念或运用你的所学。我在笔记本电脑上使用 [Anki](https://apps.ankiweb.net/) 创建抽认卡，并通过手机查看，以便随时随地学习新的概念，并利用碎片化的空余时间完成代码库中的特定任务。

密切关注 Chaincode 学员计划。我非常感谢去年夏天能有机会参加，对我加入比特币项目起到了至关重要的作用。但是，请注意 Chaincode 学员计划的竞争非常激烈。如果你之前为 Bitcoin Core 做过贡献（例如，参加审查俱乐部、评审 PR、提出 PR 等），入选的概率会更大。

## 赶快行动起来

为 Bitcoin Core 作贡献虽非易事，但绝非无法办到。在踏上这条征途之前，我从没写过（甚至没有看过）任何 C++ 代码。有畏难之心乃人之常情，但是不要让它阻碍你前进的步伐。

对自己有耐心。我为 Bitcoin Core 所做的一切都耗费了很长时间。有一次，我花了 3 天时间进行集成测试，反复使用不同的方式来将交易填入交易池。我最初的几次尝试所需的测试设置过长，因此我只得一直尝试不同的方法。不要执着于“这应该不难”的心理魔咒，聚焦于你能学到什么并不断尝试。

新手往往会将 Bitcoin Core 和核心贡献者视作遥不可及的大型神秘组织，但是换个角度来看，贡献者只不过是热爱比特币的人而已。出乎我意料的是，他们是如此乐于助人。比特币项目的贡献者的时间精力都非常有限，如果你能够做出有意义的贡献，大家都会受到鼓舞。

有一点很重要：不要将给 PR 纠正错别字作为你入门的第一步。多点耐心，先潜心学习、观察项目，再决定如何做出有意义的贡献。

无论你现在处于学习曲线的哪个阶段，你都有可能成为比特币项目的财富。如果你正在为比特币奉献你的精力，并且具备批判性的思考和学习能力，你就是财富。不要让傲慢或不安全感将你带入歧途。

## 最后，一些奇思妙想……

如果我们将成为 Bitcoin Core 贡献者的各种学习路径画出来，肯定不会像区块链那样是线性的、有序的。踏上你的征途，欣赏沿途风景，享受美好时光。

探索开源领域给我的感觉就像是越野背包旅行。

在背包旅行时，我会先在地形图上找到我想要探索的领域，在图上大致画出我的计划路线，尽量选择地势平缓的地带。比特币领域的“地形图”可不像[美国地质调查局绘制的地图](https://caltopo.com/m/016R)那样能够指引我在险峰叠嶂之间行进。因此，在探索比特币领域时，你首先要根据自己的点滴理解大致拼凑出一幅地形图，然后找出探索路径。我希望本文能够让这一过程变得更轻松一些。

徒步旅行需要不断更新你对周遭环境的认知。每走一步，你都会获得新的信息，帮助你找到一条更好行走的路线，留下精力探索更远的地方。你要注意的不仅是每一步的细节，还有它们构成的宏观路线。

比特币领域也是如此。你学到的东西越多，就越能预见前方的地形，不断调整路线朝着正确的方向前进。有时你会遇到悬崖，只能折返尝试另一条路线。寻路需要耗费大量精力和注意力。在这场徒步旅行中，你只能依靠自己的力量寻找方向。

如果深入分析我的所有经历的相似之处，这篇文章的篇幅很可能会是现在的两倍，不过就到此为止吧。

祝你好运！希望能在 GitHub 上看到你 :)

如果你有任何问题或建议，请在[推特](https://twitter.com/amizi)上私信我。

感谢 [*Jonas*](https://twitter.com/adamcjonas)、[*Carla*](https://twitter.com/actuallyCarlaKC) 和 [*Paul*](https://twitter.com/paulhenry) 对本文的审阅。

（完）