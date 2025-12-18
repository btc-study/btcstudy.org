---
title: '《比特币开发哲学》：开源开发'
author: 'bitcoindevphilosophy'
date: '2025/12/15 16:35:44'
cover: '../images/bitcoin-development-philosophy-opensource/opensource-banner.jpg'
excerpt: '比特币是是用开源软件打造出来的'
tags:
- 文化
---


> *作者：Kalle Rosenbaum & Linnéa Rosenbaum*
>
> *来源：<https://bitcoindevphilosophy.com/#opensource>*
>
> [*前篇见此处*](https://www.btcstudy.org/2025/12/11/bitcoin-development-philosophy-upgrading/)

![opensource-banner](../images/bitcoin-development-philosophy-opensource/opensource-banner.jpg)

比特币是是用开源软件打造出来的。在本章中，我们会分析这一事实的含义、如何维护开源软件，以及比特币生态中的开源软件如何允许免许可的开发。在 “挑选密码学” 这一节，我们要简单聊聊在密码学系统中如何挑选和使用上游代码库。本章还有一个小节关注比特币开发中的代码审核流程，然后是比特币开发者获得资金支持的方式。最后一节讨论的是比特币的开源文化，这种文化在外人眼里可能非常怪异，但是，这种看似怪异的现象，正是健康的标志。

绝大部分比特币软件，尤其是 `Bitcoin Core`，是开放源代码的。这意味着，软件的源代码是公开给所有人审核、修补、修改和重新分发的。在 https://opensource.org/osd 网站上，“开源” 的定义包括了下列重点（但不限于此）：

> **自由分发**
>
> 使用许可不应限制任何一方将该软件放在一整套包含了不同来源的程序的软件发行版本中销售或赠与。使用许可不应要求对这样的销售征收版税或其它费用。
>
> **源代码**
>
> 该程序必须包含源代码，并且必须允许分发源代码以及编译好的形式。当一项产品的某些形式不与源代码一起分发时，必须有一种公开出版的形式，能让用户以合理的复制成本获得源代码，最好是通过免费的互联网下载。源代码必须是程序员修改程序时候的首选形式。故意模糊源代码是不允许的。（源代码采用）中间形式，比如一个预处理器或者翻译器的输出，也是不允许的。
>
> **衍生作品**
>
> 使用许可必须允许修改和衍生作品，而且必须允许它们在原软件的使用许可相同的条款下分发。
>
> *—— “开源” 的定义，开源运动网站*

`Bitcoin Core` 遵循这一定义，在 [MIT 许可](https://github.com/bitcoin/bitcoin/blob/master/COPYING)下分发：

```
The MIT License (MIT)

Copyright (c) 2009-2022 The Bitcoin Core developers
Copyright (c) 2009-2022 Bitcoin Developers

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.
```

```
MIT 许可（MIT）

版权（c）2009-2022 Bitcoin Core 开发者
版权（c）2009-2022 Bitcoin 开发者

在此将许可免费地授予任何获得了本软件和相关说明书文件（即 “本软件”）的人，可以不受限制地处理本软件，包括不受限制地使用、复制、修改、合并、出版、分发、转许可、以及/或者 销售本软件之拷贝的权利；并且得到本软件服务的人也得到同样的许可；上述许可仅受制于下列条件：

上述版权声明和本许可声明必须包含在本软件的所有拷贝和主要部分中。
```

（译者注：版权声明中的 “Bitcoin Core” 和 “Bitcoin” 都指软件。）

如本书[章节 2.1](https://bitcoindevphilosophy.com/#donttrustverify)（[中文译本](https://www.btcstudy.org/2025/12/08/bitcoin-development-philosophy-trustlessness/#2-1-%E5%88%AB%E4%BF%A1%E4%BB%BB%EF%BC%8C%E5%8E%BB%E9%AA%8C%E8%AF%81)）所指出的，用户能够验证比特币软件 “工作情况与声明一致”，是非常重要的。为此，用户必须能够不受限制地获得（他们想要验证的）软件的源代码。

在后续章节中，我们会深入了解比特币中的开源软件的一些有趣的方面。

## 7.1 软件维护

`Bitcoin Core` 的源代码是在托管于 [GitHub](https://github.com/bitcoin/bitcoin) 网站上的一个 Git 代码库中维护的。任何人都可以克隆这个代码库，无需请求任何人许可；然后，就可以在自己的设备上检查、编译和改动。这意味着，这个代码库可能有几千个拷贝，分散在全球。它们全都是同一个代码库的副本，那么，是什么让这个源头的 `Bitcoin Core` 代码库如此特别呢？技术上来说，它根本没有什么特别的；但从社会关系上来说，它已经成了比特币开发的焦点。

（译者注：“Git 库” 的意思是，它是一个使用一种分布式协作软件 “Git” 来管理的代码库。分布式协作意味着人们会各自复制代码库并独立修改，然后谋求代码合并；在这个过程中，Git 可以帮助人们分析代码变动以及减少冲突。）

比特币专家和安全专家 Jameson Lopp 在自己的博客文章 《[谁控制着 Bitcoin Core？](https://blog.lopp.net/who-controls-bitcoin-core-/)》中解释得非常好：

> Bitcoin Core 是比特币协议开发的一个焦点，而不是一个命令点或者控制点。如果它出于什么理由而不存在了，那就会出现一个新的焦点 —— 这个代码库所在的技术社区平台（当前是 GitHub）只影响便利性，不影响 定义/项目 的完整性。事实上，比特币开发的焦点已经改过平台，甚至换过名字了！
>
> *—— Jameson Lopp，《谁控制着 Bitcoin Core？》（2018）*

然后，他解释了 `Bitcoin Core` 软件是如何维护、如何抵抗恶意的代码变更的。整篇文章的要点可以在末尾得到了总结：

> 没有哪个人控制着比特币。
>
> 没有哪个人控制着比特币开发的焦点。
>
> *—— Jameson Lopp，《谁控制着 Bitcoin Core？》（2018）*

`Bitcoin Core` 开发者 Eric Lombrozo 在他的名为《Bitcoin Core 合并流程（The Bitcoin Core Merge Process）》的 [Medium 文章](https://medium.com/@elombrozo/the-bitcoin-core-merge-process-74687a09d81d)中进一步讲解了这个开发过程：

> 任何人都可以复制这个基础代码库，然后在属于自己的代码库中作出任何改动。他们可以用自己的代码库编译出一个客户端，而不是运行基础代码库编译出来的软件，只要他们想的话。他们也可以放出编译好的二进制文件，供其他人运行。
>
> 如果一个人想要将自己对本地代码库的修改合并到 Bitcoin Core 中，他们可以提交一个 “代码合并请求（pull request，PR）”。一旦提交，其他任何人都能审核这一变更，并作出评论，不论他们本身是否拥有 Bitcoin Core 代码库的代码合并权限。
>
> *—— Eric Lombrozo，《Bitcoin Core 合并流程》（2017）*

需要指出的是，一项 PR 可能要用很长时间来审核，然后才能由 “维护者” 合并到代码库中，这通常是因为 PR 缺乏审核（review）（详见[章节 7.5](https://bitcoindevphilosophy.com/#review)）；而缺少审核又通常是因为缺少 *审核员*。

Lombrozo 也谈到了围绕共识规则变更的过程，但那个有些超出本章的范围了。[本书第五章](https://bitcoindevphilosophy.com/#upgrading)（[中文译本](https://www.btcstudy.org/2025/12/11/bitcoin-development-philosophy-upgrading/)）有关于这个主题（比特币协议升级）的更多信息。

## 7.2 免许可的开发

我们已经知道了，任何人都能为 `Bitcoin Core` 编写代码、无需请求任何许可，只是并不必然能让它合并到原本的 Git 代码库里面。这一点适用于任何修改，从图形用户界面的颜色方案到点对点消息的格式，甚至到共识规则，即定义有效区块链的规则集合。

也许同样重要的是，用户可以自由开发建立在比特币协议之上的系统，同样不需要请求任何须贺。我们已经看到了不计其数的成功的软件项目，是建立在比特币之上的，比如：

**闪电网络**

这是一个支付网络，允许非常小额的快速支付。它仅要求在比特币区块链内确认少量交易。现在已经有了多种可以互操作的软件实现，包括：[Core Lightning](https://github.com/ElementsProject/lightning)、[LND](https://github.com/lightningnetwork/lnd)、[Eclair](https://github.com/ACINQ/eclair) 和 [Lightning Dev Kit](https://github.com/lightningdevkit) 。

**CoinJoin**

多个参与者，将他们的支付合并为一笔交易，从而让 “地址聚类” 变得更难（在本书[章节 3.4](https://bitcoindevphilosophy.com/#blockchainprivacy)（[中文译本](https://www.btcstudy.org/2025/12/09/bitcoin-development-philosophy-privacy/#3-4-%E5%8C%BA%E5%9D%97%E9%93%BE%E9%9A%90%E7%A7%81%E6%80%A7)）有解释）。已经有了多种软件实现。

**侧链**

这样的系统可以在比特币区块链内锁定一个钱币，然后在其它区块链内解锁这个钱币。也就是说，比特币可以流动到其它区块链，也即 “侧链”，从而使用侧链上的特性。例子包括 [Blockstream 公司的 Elements](https://github.com/ElementsProject/elements) 。

**OpenTimestamps**

它让你可以在比特币区块链内以私密形式[为一个文档打上时间戳](https://opentimestamps.org/)。你可以使用这个时间戳来证明，这个文档在该时刻以前必定已经存在了。

没有免许可的开发，许多这样的项目就不会实现了。如[本书章节 1.3](https://bitcoindevphilosophy.com/#neutrality)（[中文译本](https://www.btcstudy.org/2025/12/05/bitcoin-development-philosophy-decentralization/#1-3-%E4%B8%AD%E7%AB%8B%E6%80%A7)） 所说的，如果开发者们必须请求许可，才能在比特币上开发协议，那就只有中央开发者委员会所允许的项目才会得到开发。

上面列举的项目，将自身确定为开源软件的情形是很常见的，这又反过来允许人们贡献代码、重复使用以及审核这些项目，无需请求任何许可。开源开发已经成了比特币软件许可的黄金标准。

## 7.3 匿名开发

开发比特币不需要请求许可，这带来了一个有趣且重要的选择：你可以为 `Bitcoin Core` 和任何其它开源项目编写和发布代码，无需揭晓自己的身份。

许多开发者就是这样的：使用假名，并尝试让假名与真实身份分离。这样做的理由因人而异。有一位匿名开发者叫 “ZmnSCPxj”。除了别的项目，他为 `Bitcoin Core` 和 `Core Lightning`（闪电网络客户端的一种实现）贡献代码。他在自己的[个人网页](https://zmnscpxj.github.io/about.html)上说：

> 我是 ZmnSCPxj ，一个随机生成的互联网人格。我的代词是 他 。
>
> 我知道人们本能地想知道我的真实身份。然而，我认为我的身份基本上无关紧要，并且更希望人们关注我的工作撑过。
>
> 如果你在犹豫要不要捐赠，或者怀疑我的生活成本或我的收入，请理解：恰当地说，你应该根据我的文章或我在比特币和闪电网络上的工作为你创造的价值而捐赠。
>
> *—— ZmnSCPxj，他的 GitHub 主页*

ZmnSCPxj 使用假名的理由是，更希望人们关注他的工作而不是他（或者他们）的生活。有趣的是，他[在 CoinDesk 上的一篇文章](https://www.coindesk.com/markets/2020/06/29/many-bitcoin-developers-are-choosing-to-use-pseudonyms-for-good-reason/)透露，这个假名本身是出于另一个理由而创建的。

> 我【使用这个假名】最初的理由是，我担心我会闯出大祸；所以，“ZmnSCPxj” 最初是想当作一个用后即弃的加密，可以在这种情况下放弃。然而，似乎它获得的声誉大部分都是正向的，所以我就保留了它。
>
> *—— 《许多比特币开发者在选择假名，而且很有道理》（2021）*

使用匿名实际上允许你更自由地说话，不用担心你会说的蠢话或者犯下的大错会危及你的个人声誉。事实证明，他的假名非常著名，而且[在 2019 年他甚至还获得了一项开发者奖金](https://twitter.com/spiralbtc/status/1204815615678177280)，这本身就是对比特币的免许可性的一个证明。

不过，可以说，在比特币世界里，最著名的加密就是 “中本聪”。我们尚不清楚他为什么要使用假名，但是，事后来看，这可能是个好主意：

- 随着越来越多人猜测中本聪拥有许多比特币，为了他的财务安全和人身安全，保持秘密身份是必要的。
- 因为他的身份不为人知，也就没有起诉任何人的可能，这给许多政府权威将无处施展。
- 没有权威人士可以崇拜，比特币会变得更加举贤与能，更能抵御勒索。

请注意，这些道理不仅对中本聪适用，对任何开发比特币或持有大量比特币的人，也都程度不一地适用。

## 7.4 择优密码学

开源软件开发者常常要使用由其他人开发的开源代码库。这是任何健康的生态系统中自然而且令人惊讶的部分。但比特币软件处理的是真实的钱，而且，有鉴于此，开发者们在挑选要依赖哪些第三方库时，需要额外的谨慎。

在一场[关于密码学的哲学讨论](https://btctranscripts.com/greg-maxwell/2015-04-29-gmaxwell-bitcoin-selection-cryptography/)中，Gregory Maxwell 希望重新定义 “密码学” 这个词 —— 他认为原来的语义太狭窄了。他解释说，从根本上来说 *信息希望自由流动*，然后基于此给出他自己的定义：

> “**密码学**” 是我们用来打败信息的这种天性的艺术和科学；我们希望信息服从于我们的政治和道德愿望，让它抵抗所有违背人道目的的机会和尝试，引导它走向人道的目的。
>
> *—— Gregory Maxwell，《比特币择优密码学》（2015）*

然后，他使用了新的术语 “择优密码学（*selection cryptography* ）”，指的是挑选密码学工具的艺术，并解释了为什么这是密码学中的重要部分。这门艺术围绕着如何挑选密码学库、工具和实践；用他自己的话来说，这是 “挑选密码系统的密码系统”。

使用具体的例子，他展示了择优密码学如何会轻易铸成大错，还提出了一个问题清单，用于参与者扪心自问。以下是这份清单的一个精选版本：

1. 这个软件最初是为你的目标用途而开发的吗？
2. 密码学考虑是否已被严肃对待？
3. 审核流程 …… 真的有审核吗？
4. 软件作者的经验如何？
5. 这个软件有说明书吗？
6. 这个软件可以移植吗？
7. 这个软件经过测试吗？
8. 这个软件采用了最佳习惯（best practices）吗？

虽然这不是通向成功的最终指南，但在执行择优密码学时，对照这些问题可能是非常有帮助的。

由于 Maxwell 提到的这些问题，Bitcoin Core 付出了艰苦的努力来[尽可能减少对第三方代码库的依赖](https://github.com/bitcoin/bitcoin/blob/master/doc/dependencies.md)。当然，你不可能根除所有的外部依赖，不然你就要自己重写所有东西，从字体渲染到操作系统调用的实现。

## 7.5 审核

这一节名为 “审核（Review）”，而不是 “代码审核（Code review）”，是因为比特币的安全性重度依赖于多个层面的审核，不仅仅对源代码的审核。而且，不同的想法所要求的审核层面是不一样的：相比于颜色方案变更和错别字修正，共识规则变更需要更多层级的更加深入的审核。

在获得最终采用的路上，一个想法通常要经历讨论和审核的多个阶段。部分阶段列举如下：

1. 这个想法发布在 Bitcoin-dev 邮件组中
2. 这个想法正是形成一份比特币优化提议（BIP）
3. 这个 BIP 被实现为 `Bitcoin Core` 的一份 PR
4. 部署机制得到讨论
5. 一些有吸引力的部署机制被实现为 `Bitcoin Core` 的 PR
6. PR 被合并到代码库的 master 分支
7. 用户选择是否要运行这套软件

在每一个阶段，要由带有不同审核视角和背景的人来审核可以得到的信息，可能是源代码、BIP，也可能只是松散描述的想法。这些阶段通常不会严格按顺序执行，多个阶段可能同步进行，或者有时候会来回反复。不同的人在不同阶段可以提供不同视角的反馈。

Jon Atack 是 Bitcoin Core 的最多产的代码审核员之一。他写过一篇[博客文章](https://jonatack.github.io/articles/how-to-review-pull-requests-in-bitcoin-core)来介绍如何审核 `Bitcoin Core` 的 PR 。他强调，一个好的代码审核员关注的 是如何提供最大的附加价值。

> 作为新人，你的目标是尝试增加价值，要友好和谦虚，同时尽快学习。
>
> 一个好办法是，不要以自我为中心，转去问 “我如何能更好地服务大家？”
>
> *—— Jon Atack，《如何审核 `Bitcoin Core` 的 PR》（2020）*

他指出，审核是真正限制 `Bitcoin Core` 的因素。大量好的想法都被困在进退不得的境地中：没有审核，就只能原地不动。注意，审核不仅对比特币有好处，也是你学习软件的同时为之增添价值的好方法。Atack 的经验法则是：在提出你自己的任何一个 PR 之前，先审核 5 ~ 15 个 PR 。再说一遍，你的关注点应该是如何最好地服务整个社区，而不是让你自己的代码得到合并。在此基础上，他强调了在正确的层面上执行审核的重要性：现在到了检查错别字的时候了吗，还是说，这个开发者现在更需要对概念的审核？

> 在开始审核的时候，一个有用的起点问题是，“现在它最需要的是什么？” 回答这个问题需要经验和不断累积的语境，但这是一个有用的问题，决定你如何在最短时间内增加最大的价值。
>
> *—— Jon Atack，《如何审核 `Bitcoin Core` 的 PR》（2020）*

这篇文章的下半部分是许多有用的上手技术指导，关于如何实际操作审核；文章还提供了重要文档的链接，可供进一步阅读。

`Bitcoin Core` 开发者和代码审核员 Gloria Zhao 曾经写过[一篇文章](https://github.com/glozow/bitcoin-notes/blob/master/review-checklist.md)，包含了她在操作审核的时候常常问自己的问题。她也提到了她认为是好的审核的标准。

> 我个人认为，一次好的审核是，我问了自己关于这项 PR 的许多针对性问题，而这些问题都得到了回答。
>
> ……
>
> 自然地，我会从概念性问题开始，然后是跟方法有关的问题，再然后是实现问题。通常，我个人认为，在一项 PR 草稿中留下 C++ 语法相关的评论是没有用的；而且，给作者留下 20 多个代码组织建议、等到他一个个看完再问他 “这个 PR 有什么意义呢” 会让人感觉没礼貌。
>
> *—— Gloria Zhao，《常见 PR 审核问题》，GitHub（2022）*

她的想法是，好的审核应该关注此时此刻这个 PR 最需要的东西，这跟 Jon Atack 的建议是一致的。她也提出了一个问题清单，你可以在审核的的不同阶段问自己，但请注意：这个清单绝对不是无所不包的，也不是捷径。这个清单是用来自 GitHub 的真实案例来掩饰的。

## 7.6 资金支持

许多人服务于比特币的开源开发，不论是为 `Bitcoin Core`，还是为其它项目。许多人是在业余时间这样做的，不会得到任何补偿，但一些开发者能够得到报酬。

对比特币的持续成功感兴趣的公司、个人和组织可能会给开发者捐赠资金，可能是直接捐赠，也可能通过组织将资金分发给个人开发者。还有一些关注比特币的公司会雇佣有经验的开发者，让他们能全职为比特币工作。

## 7.7 文化冲击

人们常常会有这样的印象：比特币开发者内部有许多内斗，而且有吵不完的架，而且好像根本无能做决定。

就比如[章节 5.2.3](https://bitcoindevphilosophy.com/#taproot-deployment)（[中文译本](https://www.btcstudy.org/2025/12/11/bitcoin-development-philosophy-upgrading/#5-2-3-%E2%80%9CTaproot%E2%80%9D-%E5%8D%87%E7%BA%A7%E4%B8%8E-%E2%80%9CSpeedy-Trial%E2%80%9D)）所介绍的 “Taproot” 部署机制，被讨论了很长时间，期间还形成了两个 “党派”。一派希望在特定时刻之后，发现矿工没有压倒性投票支持新规则时让升级 “失败”，另一派则希望无论如何，在某个时刻之后就强制执行新的规则。Michael Folkson 总结了来自两派的争论，并[发布](https://lists.linuxfoundation.org/pipermail/bitcoin-dev/2021-February/018380.html)到了 Bitcoin-dev 邮件组中。

争论似乎会永远持续下去，而且完全看不到什么时候能够形成什么共识。这让人们感到沮丧，而结果是热度加剧了。Gregory Maxwell（作为用户 “nullc”）在 [Reddit 论坛](https://www.reddit.com/r/Bitcoin/comments/hrlpnc/technical_taproot_why_activate/fyqbn8s/?utm_source=share&utm_medium=web2x&context=3)上表示担心这样漫长的讨论会让升级没那么安全。

> 到了现在，额外的等待已经不会增加更多的审核以及确定性。相反，额外的推迟会减缓势头，可能还会增加风险（因为人们开始忘记细节了）、推迟下游应用场景的工作（比如钱包支持），而且，如果人们对激活的时间窗口感到惬意，也就不会投入尽可能多的额外审核精力。
>
> *—— Gregory Maxwell，《Taproot 部署是太快还是太慢了？》，Reddit*

最终，感谢由 David Harding 和 Russel O’Connor 提出的新提议 “速战速决（Speedy Trial）”，争议得到解决。这个提议得到这个名称，是因为它安排了相对较短的信号期给矿工表态，即要么快速锁定升级，要么快速表明失败。如果矿工们在这个信号期内激活它，Taproot 就会在大约 6 个月后部署。这次升级在[第 5 章](https://bitcoindevphilosophy.com/#upgrading)有更多讲解（[中文译本](https://www.btcstudy.org/2025/12/11/bitcoin-development-philosophy-upgrading/)）。

不熟悉比特币的开发流程的人，可能会认为这些激烈的辩论看起来非常糟糕，甚至是有毒。至少有两个因素，让它在某些人眼中很糟糕：

- 相比于闭源的公司，开源开发中的所有争论都会在公开环境中发生，而且不会经过剪辑。谷歌（Google）这样的软件公司不会让自己的雇员在公开环境中争论提案，反之，他们最多只会发表一份声明，表达公司在这个话题上的立场。这让公司看起来比比特币更和谐。
- 因为比特币是免许可的，任何人都可以说出自己的观点。这跟闭源开发公司完全相反，后者只有少数人可以表达观点，通常是观点相似的人。比特币开发者内部的观点，（相比于比如说 PayPal 这样的公司），多到简直令人震惊。

绝大多数比特币开发者会说，这种开放性带来了一种好的、健康的环境，甚至这是产生最好结果的必要环境。

如[章节 6.2](https://bitcoindevphilosophy.com/#threats)（[中文译本](https://www.btcstudy.org/2025/12/12/bitcoin-development-philosophy-adversarial-thinking/#6-2-%E5%A8%81%E8%83%81)）所暗示的，上述第二点可能是非常有好处的，但也有一个缺点。攻击者可以使用拖延战术，就像《[Simple Sabotage Field Manual](https://www.gutenberg.org/ebooks/26184)》书中列举的那样，来扭曲开发流程和最终决定。

另一个值得指出的是，如章节 7.4 所说，因为比特币是钱，而 `Bitcoin Core` 保护的是不计其数的资金，因此安全性是重中之重。这就是为什么有经验的 `Bitcoin Core` 开发者可能看起来非常头铁，其实这种态度是合理的。实际上，一个缺乏合理设计原则的特性可能不会被采用。会打破 “可复现编译（reproducibale builds）” 的特性（详见[章节 2.1](https://bitcoindevphilosophy.com/#donttrustverify)（[中文译本](https://www.btcstudy.org/2025/12/08/bitcoin-development-philosophy-trustlessness/#2-1-%E5%88%AB%E4%BF%A1%E4%BB%BB%EF%BC%8C%E5%8E%BB%E9%AA%8C%E8%AF%81)））、添加新的依赖以及没有遵循比特币的[最佳习惯](https://github.com/bitcoin/bitcoin/blob/master/doc/developer-notes.md)的代码变更，同样如此。

新的（和老的）开发者可能会因此觉得沮丧。但是，按照开源软件的惯例，你总是可以复刻代码库、将代码合并到你自己的副本中，然后编译和运行你自己的二进制文件。

## 7.8 结论

Bitcoin Core 和其它绝大部分比特币软件，都是开源的，意味着任何人都能自由分发、修改和使用这些软件。GitHub 网站上的 `Bitcoin Core` 代码库是当前的比特币开发的焦点，但如果人们开始不信任代码库的维护者，或者这个网站本身，那么状况也有可能发生改变。

开源开发允许免信任的开发，即包括开发比特币，也包括开发比特币之上的系统。无论你是编写代码还是审核代码（提议），开源让你能够自由地投身其中，不论你是否匿名。

围绕比特币的开发流程是极为开放的，这让比特币看起来像是一个有毒的、低效的地方，但正是这样的文化，让比特币能够抵御恶意的参与者。

> [*续篇见此处*](https://www.btcstudy.org/2025/12/16/bitcoin-development-philosophy-scaling/)