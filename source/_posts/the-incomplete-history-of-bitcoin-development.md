---
title: '不完整比特币开发史'
author: '0xB10C'
date: '2021/09/29 11:04:24'
cover: ''
excerpt: '要想完全理解比特币开发现状背后的原因，就不能不了解一些历史事件'
tags:
- 比特币
---


> *作者：0xB10C*
> 
> *来源：<https://b10c.me/blog/004-the-incomplete-history-of-bitcoin-development/>*


要想完全理解比特币开发现状背后的原因，就不能不了解一些历史事件。本文着重列举了中本聪离开这个项目前后的历史事件、软件发布和漏洞修复；还额外添加了一个章节叙述比特币开发的现状。文章[后附的时间线](https://b10c.me/projects/bitcoin-dev-history/#timeline-bitcoin-history)为每一个事件提供了额外的细节。

对于这里的大部分事件，我都不是亲历者。所以这份时间线的一大部分引自 [John Newbery](https://twitter.com/jfnewbery) 的一次名为 “[比特币开发的历史与哲学](https://www.meetup.com/BitDevsNYC/events/262321510/)” 的演讲。本文的标题也写得很清楚了，本文没有，也做不到包含每一个重要事件。历史总在不断变化，如果你认为我遗漏了什么事件，或想提议我作一些修改，请在开源项目 [bitcoin-development-history](https://github.com/0xB10C/bitcoin-development-history) 中提交一个 issue，这也是我用来附加更多时间线的办法。

## 中本聪仍在的时候

这份时间线的起点是 2007 年早期。中本聪开始开发比特币。这个点对点的电子现金系统没有受信任的地方。整个系统完全由用户运行的软件来控制。

早期，有贡献者加入了中本聪的工作。除了软件的开发，这些新来的贡献者还为软件添加了 [Linux](https://b10c.me/projects/bitcoin-dev-history/#2009-release-0-2-0) 和 [maxOS](https://b10c.me/projects/bitcoin-dev-history/#2010-release-0-3-0) 操作系统的支持。到了 2010 年夏天，中本聪给软件做了一些关键的修改。比如，引入了 “[检查点](https://b10c.me/projects/bitcoin-dev-history/#2010-release-0-3-2)” 作为一项安全措施，来对抗传播低难度链的攻击。使用了这些检查点的节点会拒绝那些特定高度与特定区块不符的链。检查点是由中本聪独自硬编码的，理论上来说，这让中本聪可以自己决定整个网络要跟随哪条链。

加入检查点的几天后，中本聪在[版本 v0.3.3 的软件](https://b10c.me/projects/bitcoin-dev-history/#2010-release-0-3-3)中放出了第一个共识机制变更。中本聪敦促用户升级。在接下来一个月里，多个[小版本更新](https://b10c.me/projects/bitcoin-dev-history/#2010-release-multiple-0-3-xx)陆续放出。其中一个修复了一个[致命的溢出漏洞](https://b10c.me/projects/bitcoin-dev-history/#2010-bug-overflow-bug)。这个漏洞被利用来创造了两个高价值的 UTXO。中本聪建议矿工们重组包含了恶意交易的区块。

一周以后，中本聪加入了一个警报系统，来提醒节点运营者网络中出现的类似 bug 和问题。这个警报系统有一个安全模式。这个安全模式一旦触发，就会禁用整个网络的所有关于货币处理的 RPC 方法。只有中本聪能够用一个私钥签名来创建有效的网络警报。一些用户开始提出质疑：如果其他人，比如某个政府，拿到了这个私钥，那网络会变成什么样呢？

这个时候，中本聪对比特币网络有太大的权力。但大家主要担心的不是中本聪会变坏、会摧毁整个网络，而是一个去中心化的网络中不应该存在一个单点故障。

到了 2010 年 10 月，中本聪在 bitcointalk 论坛上发布了他的最后一个[帖子](https://b10c.me/projects/bitcoin-dev-history/#2010-post-final)，宣布移除这个安全模式。中本聪在他最后留下的[电子邮件](https://b10c.me/projects/bitcoin-dev-history/#2011-other-last-contact-satoshi)之一里面写道：“我准备到别的地方去了。有了 Gavin 和大家，这个项目会得到很好的维护。” 一些人主张，中本聪离开比特币世界，是他最伟大的贡献之一。

## 中本聪离开之后

几乎同一时间，整个[开发流程](https://b10c.me/projects/bitcoin-dev-history/#2010-other-moved-to-github)从 SVN 转移到了 GitHub 上。BlueMatt、sipa、laanwj 和 gmaxwell 加入了这个项目。在 2011 年中，[BIP（比特币升级提议）流程](https://b10c.me/projects/bitcoin-dev-history/#2011-other-first-bip)应运而生。在 2011 年的最后一个季度和 2012 年的第一个月，社区讨论了允许交易的接收者指定花费条件的[多个提案](https://b10c.me/projects/bitcoin-dev-history/#2011-other-p2sh)。由此，P2SH 交易引入了比特币。

在 2012 年末，[比特币基金会](https://b10c.me/projects/bitcoin-dev-history/#2012-other-bitcoin-foundation)宣告成立。比特币基金会（Bitcoin Foundation）模仿的是 Linux 基金会。在公告帖子下面，一些人留言表示担心开发会变得中心化。

Bitcoin [v0.8.0](https://b10c.me/projects/bitcoin-dev-history/#2013-release-0-8-0) 在 2013 年春天发布。两周以后，一场[意料之外的硬分叉](https://b10c.me/projects/bitcoin-dev-history/#2013-bug-hardfork)在网络中升级了和没升级的节点间爆发。硬分叉很快就被解决了，矿工们都把挖矿算力切换到了对已升级和未升级节点都有效的链上。

在 2013 年末，Bitcoin 软件[更名为 Bitcoin Core](https://b10c.me/projects/bitcoin-dev-history/#2013-other-rebranding-to-core)。在接下来几年里，包括 [Chaincode](https://b10c.me/projects/bitcoin-dev-history/#2014-company-chaincode) 和 [Blockstream](https://b10c.me/projects/bitcoin-dev-history/#2014-company-blockstream) 在内的公司成立。后来，[MIT Digital Currency Initiative](https://b10c.me/projects/bitcoin-dev-history/#2015-other-mit-dci) 加入了 Chaincode 和 Blockstream，为开发比特币的开发者和研究者提供报酬。在 2015 年二月，Joseph Poon 和 Tadgw Dryja 放出了[闪电网络白皮书](https://b10c.me/projects/bitcoin-dev-history/#2015-other-lightning-whitepaper)的第一份草稿。

第二年，Luke Dashjr  通过 [BIP 2](https://b10c.me/projects/bitcoin-dev-history/#2016-other-bip-2) 修订了 BIP 流程；Bitcoin Core 放出了 v0.13.0，加入了 [SegWit](https://b10c.me/projects/bitcoin-dev-history/#2016-release-0-13-1) 作为软分叉。在 2016 年 11 月，[警报系统](https://b10c.me/projects/bitcoin-dev-history/#2016-other-alert-system-retired)完全弃用。到了 2017 年 8 月，SegWit 在比特币网络上激活。2019 年，又一家公司 [Square Crypto](https://b10c.me/projects/bitcoin-dev-history/#2019-company-squarecrypto) 开始资助比特币开发。在 2019 年 5 月，Pieter Wuille 提出了 [BIP taproot](https://b10c.me/projects/bitcoin-dev-history/#2019-post-taproot)。

## 比特币开发的现状

在过去几年中，比特币的开发文化日益去中心化、目标明确而且严格。现在 Bitcoin Core 代码库[有 6 名维护者](https://bitcointalk.org/index.php?topic=1774750.0)，分布在三个国家。只有他们能够合并由贡献者提出的代码更改。不过，在内容合并之前，更改的内容还需经过一个[审议流程](https://github.com/bitcoin/bitcoin/blob/master/CONTRIBUTING.md#peer-review)，这个流程也变得严格得多。

举个例子，在比特币早期，有个与 P2SH 相竞争的提议，叫做 “[`OP_EVAL`](https://b10c.me/projects/bitcoin-dev-history/#2011-other-p2sh)”。有个实现了 OP_EVAL 的 [pull request](https://github.com/bitcoin/bitcoin/pull/669)（“合并请求”）在 2011 年底被合并到了代码库中。即便是这样对共识有重大变更的代码，它也只有一个审核人。Russell O’Connor 开了一个 [issue](https://github.com/bitcoin/bitcoin/issues/729) 批评了这个实现的一部分，并主张这么大的、对共识极为关键的变更应该得到更多的审核和测试。

这件事推动了如何通过更多的测试和审核来实现更高质量的代码的持续讨论。到了今天，每一个合并请求都有多个开发者来审核。如果某个改变触及到了对安全性甚至共识的关键部分，审核的流程还需要通过更多的审核员审核，需要大量的测试，通常会花费几个月的时间。活跃的 Bitcoin Core 贡献者 John Newbery 告诉我，“只需一个审核人员首肯就能合并影响共识的代码的事情，已经一去不复返”。

人们也投入了很多精力到自动化的测试中，比如，有 C++ 语言编写的[单元测试](https://github.com/bitcoin/bitcoin/blob/master/src/test/README.md)和 Python 语言编写的[功能性测试](https://github.com/bitcoin/bitcoin/blob/master/test/functional/README.md)。每一个不简单的变更都要相应更新现有的测试或者在框架中加入新的测试。在单元测试和功能测试以外，还要在 Bitcoin Core 上做[模糊测试](https://github.com/bitcoin/bitcoin/blob/master/doc/fuzzing.md)，以及建立[基准测试框架](https://github.com/bitcoin/bitcoin/blob/master/doc/benchmarking.md)来度量代码的性能。举个例子，[bitcoinperf.com](https://bitcoinperf.com/) 网络提供了 [Grafana](https://bitcoinperf.com/d/YiV16Vsik/overview) 和 [codespeed](https://codespeed.bitcoinperf.com/) 接口来可视化周期性的基准测试的结果。

多年努力下来，Bitcoin Core 软件已经形成了一个清晰的[发布流程](https://github.com/bitcoin/bitcoin/blob/master/doc/release-process.md)。Bitcoin Core 的大版本每 6 个月发布一次。[发行计划](https://github.com/bitcoin/bitcoin/issues/15940)包括一个[翻译流程](https://github.com/bitcoin/bitcoin/blob/master/doc/translation_process.md)，一个特性冻结流程，还通常有多个候选版本。近期 [Cory Fields](https://github.com/theuni) 和 [Carl Dong](https://twitter.com/carl_dong) 还致力于提高 [Bitcoin Core 构建过程的安全性](https://www.youtube.com/watch?v=I2iShmUTEl8)，使用[确定性和可引导的构建包](https://github.com/bitcoin/bitcoin/blob/master/contrib/guix/README.md)。这个新的构建系统可能还没准备好支持即将在今年秋天发布的 Bitcoin Core v0.19.0，但未来可以提供更好的构建过程安全性。

## 结论

十年间，比特币的开发文化沧海桑田，从围绕中本聪的高度中心化，变为[围绕几千名 GitHub 贡献者的去中心化](https://twitter.com/_jonasschnelli_/status/1080713877355081729)。显然，代码审核、代码质量和安全性的高标准都是有必要的。这些标准得到了遵循和持之以恒的提高。

我认为，要完全理解比特币开发现状背后的哲学，了解这些历史事件是必不可少的。所以我做了一个把更多事件串起来的时间线。

若有进一步的研究需求，建议阅读 [Alex B.](https://twitter.com/bergealex4) 写的 [*The Tao Of Bitcoin Development（比特币开发之道）*](https://medium.com/@bergealex4/the-tao-of-bitcoin-development-ff093c6155cd)（[中文译本](https://ethfans.org/posts/the-tao-of-bitcoin-development)）、[Eric Lombrozo](https://twitter.com/eric_lombrozo) 写的 [*The Bitcoin Core Merge Process（Bitcoin Core 代码合并流程）*](https://medium.com/@elombrozo/the-bitcoin-core-merge-process-74687a09d81d) 以及 [Jameson Lopp](https://twitter.com/lopp) 的大作 [*Who Controls Bitcoin Core？*（谁控制着 Bitcoin Core？）](https://blog.lopp.net/who-controls-bitcoin-core-/)。

## 致谢

感谢 John Newbery 帮助我梳理并审核这篇文章。他在自己的演讲 [*History and Philosophy of Bitcoin Development（比特币开发的历史和哲学）*](https://www.meetup.com/BitDevsNYC/events/262321510/)中做了很多历史考证工作，该演讲也是我这篇文章的基础。此外，我非常感激 [Chaincode Labs](https://chaincode.com/)，他邀请我参加他们的 2019 夏令营（Summer Residency），在那里我遇见了很多有意思的人，学到了很多东西，也正是在那里，我开始着手整理时间线和撰写这篇文章

## 时间线

### **2007 年早期：中本聪开始开发比特币**

中本聪开始写比特币的代码。这是根据中本聪在 Cryptography 邮件列表中一份写于 2008 年 11 月 17 日的邮件中得出的：

“我确信自己已经在过去一年半的编程工作中解决了所有这些细节问题。”

见：[e-mail (metzdowd.com)](https://www.metzdowd.com/pipermail/cryptography/2008-November/014863.html) 以及 [e-mail (nakamotoinstitute.org)](http://satoshi.nakamotoinstitute.org/emails/cryptography/15/#selection-101.55-103.36)

### **2008 年 11 月 1 日：比特币白皮书发布**

中本聪在 Cryptography 邮件组中公布了白皮书：

“我一直在开发一个全新的数字现金系统，它是完全点对点的，没有需要用户信任的第三方。”

见：[e-mail (metzdowd.com)](https://www.metzdowd.com/pipermail/cryptography/2008-October/014810.html) 以及 [e-mail (nakamotoinstitute.org)](https://satoshi.nakamotoinstitute.org/emails/cryptography/1/)，以及[白皮书](https://www.bitcoin.org/bitcoin.pdf)

### **2009 年 1 月 3 日至 9 日之间：比特币的创世区块挖出**

创世区块的时间戳是 1 月 9 日。

这个区块的 coinbase 交易（发行新币的交易类型）包含了著名的一段话：

“The Times 03/Jan/2009 Chancellor on brink of second bailout for banks（泰晤士报 2009 年 1 月 3 日刊 英国财政大臣正在考虑对银行的第二轮纾困计划）”

见：[区块浏览器](https://blockstream.info/block/000000000019d6689c085ae165831e934ff763ae46a2a6c172b3f1b60a8ce26f)、[百科词条](https://en.bitcoin.it/wiki/Genesis_block)

### **2009 年 1 月 9 日：Bitcoin v0.1 软件发布**

中本聪在 Cryptography 邮件组 中写道：

“我发布了 Bitcoin 软件的第一个版本。比特币是一种新的电子现金系统，使用点对点网络来防止多重支付。它是完全去中心化的，没有服务端，也没有中心化的权威。”

见：[e-mail](https://satoshi.nakamotoinstitute.org/emails/cryptography/16/#selection-19.0-23.66)

### **2009 年 12 月 16 日：Bitcoin v0.2 软件发布**

Martti Malmi (sirius-m) 加入了对 Linux 系统的初步支持。其它新功能包括在利用 CPU 的多个核心来挖矿以及初步支持使用代理。

见：[bitcointalk.org](https://bitcointalk.org/index.php?topic=16.msg73#msg73)

### **2010 年 7 月 6 日：Bitcoin v0.3 软件发布**

Laszlo Hanyecz (Bitcoin pizza guy) 加入了对 macOS 的支持。其他新特性包括 JSON-RPC 接口，以及一个新的 daemon 模式。用户帮助把软件的图形界面翻译成了德语、荷兰语和意大利语。

见：[bitcointalk.org](https://bitcointalk.org/index.php?topic=238.msg2004#msg2004)

### **2010 年 7 月 15 日：Bitcoin v0.3.1 软件（补丁）发布**

修复了各种各样的 bug。Gavin Andresen 开始作贡献。

见：[bitcointalk.org](https://bitcointalk.org/index.php?topic=383.msg3198#msg3198)

### **2010 年 7 月 17 日：Bitcoin v0.3.2 软件发布**

中本聪加入了检查点作为一项安全措施。检查点就是锁定某个高度的区块哈希值必须是某个，否则就拒绝。中本聪写道：

“我可能会从现在开始，每发布一个新版本就增加一个检查点。如果软件已经决定了哪个是被普遍接受的区块链，就没有必要留下一个徒增困扰的、可能在几个月后发生逆转的机会。”

见：[bitcointalk.org](https://bitcointalk.org/index.php?topic=437.msg3807#msg3807)、[checkpoints added (diff on GitHub)](https://github.com/bitcoin/bitcoin/commit/4110f33cded01bde5f01a6312248fa6fdd14cc76#diff-118fcbaaba162ba17933c7893247df3aR1344)

### **2010 年 7 月 25 日：Bitcoin v0.3.3 软件发布**

这个版本加入了第一个共识层面的变更。

比特币软件开始跟随累积工作量最多的链。在此之前，是跟随字面意义上的最长链。

见：[bitcointalk.org](https://bitcointalk.org/index.php?topic=570.msg5707#msg5707)、[consensus change (diff on GitHub)](https://github.com/bitcoin/bitcoin/commit/40cd0369419323f8d7385950e20342e998c994e1#diff-118fcbaaba162ba17933c7893247df3aR1236)

### **整个 2010 年夏天**

Bitcoin v0.3.xx 的多个版本在此期间放出

### **2010 年 8 月 15 日：致命的溢出漏洞得到修复**

中本聪在 v0.3.9(ish) 中放出一个补丁，告诉用户和矿工要重组带有溢出错误交易的区块。

见：[bitcointalk.org](https://bitcointalk.org/index.php?topic=823.msg9531#msg9531)

### **2010  年 8 月 22 日：警报系统引入**

中本聪开始开发一个警报系统，计划在 v0.3.11 加入。他写道：

“我一直在编写一个警报系统。警报会在网络中广播，并在一些版本的软件中生效。警报消息要用只有我知道的一把私钥签名。”

“节点偶尔陷入暂时的停机可能给你惊吓，但总好过你发现自己的钱被全部吸走的惊吓。”

“等什么时候我们很长一段时间都没有再发现新 bug、透彻的安全检查也没有发现任何问题时，这个系统可以缩减。我并不主张我们会永远使用它。但比特币还是一个 beta 阶段的软件。”

见：[bitcointalk.org](https://bitcointalk.org/index.php?topic=898.msg10722#msg10722)

### **2010 年 12 月 12 日：中本聪发出最后一个帖子**

中本聪在 bitcointalk.org 上发表他自己的最后一个帖子。他加入了一些 DoS 限制，并移除了前述的警报系统安全模式。

“在 DoS 保护上还有许多工作要做，但我正在开发一个备份的快速构建包，以备不测；更复杂的主意则以后再说。这个包所构建的软件是 v0.3.19。”

见：[bitcointalk.org](https://bitcointalk.org/index.php?topic=2228.msg29479#msg29479)

### **2010 年 12 月 19 日：开发工作转移到 GitHub 上**

Bitcoin 软件的活跃开发和 issue 跟踪转移到了 GitHub 上。

见：[GitHub 记录的第一个 issue](https://github.com/bitcoin/bitcoin/issues/1)

### **2011 年 4 月 23 日：中本聪最后一次发声**

据称来自中本聪给 Mike Hearn 的最后一份电邮：

“我已经做别的事情去了。Gavin 和大家会把这件事做好。”

见：[pastebin.com 上的电子邮件对话](https://pastebin.com/syrmi3ET)

### **2011 年 3 月至 6 月：新的贡献者加入**

多位新的贡献者加入：TheBlueMatt（于 3 月 3 日）、sipa（于 3 月 12 日）、laanwj（于 3 月 15 日）和 gmaxwell （于 6 月 18 日）。

他们的第一次合并请求见：[TheBlueMatt](https://github.com/bitcoin/bitcoin/pull/92)、[sipa](https://github.com/bitcoin/bitcoin/pull/116)、[laanwj](https://github.com/bitcoin/bitcoin/pull/225)、[gmaxwell](https://github.com/bitcoin/bitcoin/pull/326)

### **2011 年 8 月 19 日：第一个 BIP **

第一个 BIP “BIP 1：BIP 的目的和指南”  出现。

见：[BIP 1 on GitHub](https://github.com/bitcoin/bips/blob/master/bip-0001.mediawiki)

### **2011 年 9 月 23 日：Bitcoin v0.4 推出**

v0.4 放出，主要的新功能是钱包加密。见：[更新说明](https://bitcoin.org/en/release/v0.4.0)

### **2011 年 11 月 21 日：Bitcoin-QT v0.5 发布**

新特性是新的 qt 图形界面以及钱包加密功能的一个重大补丁（CVE-2011-4447）

见：[更新说明](https://bitcoin.org/en/release/v0.5.0)、[CVE-2011-4447](https://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2011-4447)

### **2011 年 11 月 ~ 2012 年 4 月：P2SH 和其他提议上的工作**

多个提议（OP_EVAL、P2SH、OP_CHV）都旨在允许交易的接收者可以指定花费资金的脚本。

P2SH 在 Bitcoin-Qt v0.5.4 上实现。另外两个则都被放弃了。

见：[BIP 12: OP_EVAL](https://github.com/bitcoin/bips/blob/master/bip-0012.mediawiki)、[OP_EVAL 合并请求](https://github.com/bitcoin/bitcoin/pull/669)、[OP_EVAL 递归问题](https://github.com/bitcoin/bitcoin/issues/729)、[BIP 16: P2SH](https://github.com/bitcoin/bips/blob/master/bip-0016.mediawiki)、[BIP 17: OP_CHECKHASHVERIFY](https://github.com/bitcoin/bips/blob/master/bip-0017.mediawiki)

### **2012 年 3 月 30 日：Bitcoin-QT v0.6 发布**

新特性包括地址二维码，BIP30（针对一种涉及复制 coinbase 交易的攻击的安全修复）的一个实现，以及修复内存相关的拒绝服务攻击向量。

见：[更新说明](https://bitcoin.org/en/release/v0.6.0)

### **2012 年 9 月 17 日：Bitcoin-QT v0.7 发布**

包括了 BIP22、BIP34 和 BIP35 的实现，以及图形界面上的许多变更，还有联网的 RPC 代码。

见：[更新说明](https://bitcoin.org/en/release/v0.7.0)

### **2012 年 9 月 27 日：Bitcoin Foundataion 宣布成立**

Gavin Andresen 宣布成立 Bitcoin Foundation。

见：[bitcointalk.org 上的帖子](https://bitcointalk.org/index.php?topic=113400.0)

### **2013 年 2 月 19 日：Bitcoin-QT v0.8 发布**

本版更新将区块链的存储从 BerkleyDB 数据库格式迁移成 LevelIDB 数据库。“Ultraprune（极致修剪）” 功能由 sipa (Pieter Wuille) 实现了，他将 UTXO 集合从区块链数据库中分离了出来。

见：[更新公告](https://bitcoin.org/en/release/v0.8.0)

### **2013 年 3 月 11 日：意料之外的硬分叉**

一次意料之外的硬分叉发生，将 v0.8 的节点与更老版本的节点分离了开来。

见：[BIP 50: 2013 年 3 月链分裂事件的事后报告](https://github.com/bitcoin/bips/blob/master/bip-0050.mediawiki)，[bitcoin.org 网络警报](https://bitcoin.org/en/alert/2013-03-11-chain-fork)

### **2013 年 12 月 12 日：软件品牌重新包装**

Bitcoin-Qt 软件重新包装，使用 Bitcoin Core 的新名称。

见：[GitHub 上的 PR](https://github.com/bitcoin/bitcoin/pull/3400)

### **2014 年 3 月 19 日：Bitcoin Core v0.9 发布**

新特性包括：OP_RETURN 操作码可以在区块链中写入数据，但也会让相关的 UTXO 变成不可使用的状态。此外，autotools 用作构建系统，而 bitcoin-cli（命令行工具）作为一个 RPC 客户端引入。

见：[更新说明](https://bitcoin.org/en/release/v0.9.0)

### **2014 年某个时间：Chaincode Labs 成立**

Alex Morcos 和 Suhas Daftuar 在 2014 年成立了 Chaincode Labs 以打造一个工程师和科学家能够支持去中心化数字货币开发的空间。

### **2014 年 10 月 23 日：Blockstream 成立**

Adam Back、Matt Corallo、Greg Maxwell、Pieter Wuille 等人创立了 Blockstream 公司并放出了他们的侧链白皮书。

见：[为什么我们要成立 Blockstream？](https://blockstream.com/2014/10/23/en-why-we-are-co-founders-of-blockstream/)

### **2015 年 2 月 16 日：Bitcoin Core v0.10.0 发布**

重要的更新包括：首先同步区块头的同步方法，REST 接口 以及用来创建和操控交易的 bitcoin-tx 模块。

见：[更新说明](https://bitcoin.org/en/release/v0.10.0)

### **2015 年 2 月：闪电网络白皮书发布**

Joseph Poon 和 Thaddeus Dryja 发布了 Lightning Network 白皮书第一版草稿

见：[闪电网络白皮书](https://lightning.network/lightning-network-paper.pdf)

### **2015 年 4 月 15 日：MIT DCI 成立**

MIT Media Lab 启动了 Digital Currency Initiative（DCI）。DCI 是一个研究社区，聚焦密码货币和区块链技术。

见：[DCI 启动公告](https://medium.com/mit-media-lab-digital-currency-initiative/launching-a-digital-currency-initiative-238fc678aba2)

### **2015 年 7 月 12 日：Bitcoin Core v0.11.0 发布**

这一版软件将区块文件修剪当成一个主要的特性。

见：[更新说明](https://bitcoin.org/en/release/v0.11.0)

### **2016 年 2 月 3 日：BIP 2**

Luke Dashjr 起草了 BIP 2，提出了一个定义更清晰的 BIP 流程。这个提议被社区接受

见：[BIP 2: BIP 流程修订](https://github.com/bitcoin/bips/blob/master/bip-0002.mediawiki)

### **2016 年 2 月 23 日：Bitcoin Core v0.12.0 发布**

主要更新是引入了 libsecp、sendheader，选择进入的 RBF（BIP 125）以及交易内存池限制。

见：[更新说明](https://bitcoincore.org/en/2016/02/23/release-0.12.0/)

### **2016 年 4 月 15 日：Bitcoin Core v0.12.1 发布**

这一版本包含了 BIP 9（版本标识逻辑）以及 OP_CHECKSEQUENCEVERIFY  软分叉的定义。

见：[更新说明](https://bitcoincore.org/en/blog/2016/04/15/release-0.12.1/)

### **2016 年 8 月 23 日：Bitcoin Core v0.13.0 发布**

包含了为 segwit（隔离见证）预备的变更、压缩区块功能，交易池基于手续费价格的筛选，HD 钱包的迟滞，以及 CPFP 交易选择算法。

见：[更新说明](https://bitcoincore.org/en/2016/08/23/release-0.13.0/)

### **2016 年 10 月 27 日：Bitcoin Core v0.13.1 发布**

这个版本包含了 SegWit 软分叉。

见：[更新说明](https://bitcoincore.org/en/2016/10/27/release-0.13.1/)

### **2016 年 11 月 1 日：警报系统退休**

网络层的警报系统代表着比特币的一个很大的中心化力量，如今走入历史。

见：[公告](https://bitcoin.org/en/alert/2016-11-01-alert-retirement)

### **2017 年 3 月 8 日：Bitcoin Core v0.14 放出**

本版软件大幅提高了初次下载区块的速度。

见：[更新说明](https://bitcoincore.org/en/2017/03/08/release-0.14.0/)

### **2017 年 8 月 24 日：SegWit 激活**

SegWit 在比特币主网上激活。

### **2017 年 9 月 14 日：v0.15 放出**

本版软件加入了一个更好的手续费预估功能，可在图形界面追加手续费，还有多钱包功能以及脚本缓存功能。

见：[更新说明](https://bitcoincore.org/en/2017/09/01/release-0.15.0/)

### **2017 年 11 月 11 日：v0.15.1 放出**

这个版本着力于 P2P 网络的安全性，以预防未来可能的网络分叉，也修复了一些 bug，为 0.15.x 系列做了优化和升级。

见：[更新说明](https://bitcoincore.org/en/2017/11/11/release-0.15.1/)

### **2018 年 2 月 26 日：Bitcoin Core v0.16 放出**

这一版主要是为 Bitcoin Core 钱包增加了 SegWit 支持。

见：[更新说明](https://bitcoincore.org/en/2018/02/26/release-0.16.0/)

### **2018 年 10 月 3 日：Bitcoin Core v0.17 放出**

这一版本为钱包增加了一些功能。其中一个是支持部分签名的比特币交易（PSBT）。

见：[更新说明](https://bitcoincore.org/en/releases/0.17.0/)

### **2019 年 3 月 20 日：Square Crypto 成立**

Jack Dorsey 宣布 Square Crypto 将招聘 3~4 名工程师和 1 位设计师来全职为比特币生态作开源的贡献。

见：[tweet](https://twitter.com/jack/status/1108487911802966017)

## **2019 年 5 月 2 日：Bitcoin Core v0.18 放出**

本版更新包括了大量新功能和一些小变更。

见：[更新说明](https://bitcoincore.org/en/releases/0.18.0/)

### **2019 年 5 月 6 日：Taproot 提出**

Pieter Wuille 提出了多个 BIP 以在比特币中实现 Schnorr 签名以及 taproot，以提高比特币智能合约的隐私性、效率和灵活性。

见：[邮件组帖子](https://lists.linuxfoundation.org/pipermail/bitcoin-dev/2019-May/016914.html)

### **2019 年 8 月 9 日：Bitcoin Core v0.18.1 放出**

这个小版本加入了新功能，多个补丁以及性能升级，还更新了翻译。

见：[更新说明](https://bitcoincore.org/en/releases/0.18.1/)

### **2019 年 8 月 19 日：Miniscript 推出**

Pieter Wuille 提出了 Miniscript，让比特币脚本的编程更友好的语言。

见：[邮件组帖子](https://lists.linuxfoundation.org/pipermail/bitcoin-dev/2019-August/017270.html)，[项目页面](http://bitcoin.sipa.be/miniscript/)

### **2019 年 11 月 24 日：Bitcoin Core v0.19.0.1 发布**

这个版本加入了新功能，多个补丁以及性能升级，还更新了翻译。

见：[更新说明](https://bitcoincore.org/en/releases/0.19.0.1/)

### **2020 年 3 月 9 日：Bitcoin Core v0.19.1 发布**

这个版本修复了多个 bug，提高了性能。

见：[更新说明](https://bitcoincore.org/en/releases/0.19.1/)

### **2020 年 6 月 3 日：Bitcoin Core v0.20.0 发布**

这个版本修复了多个 bug，提高了性能。

见：[更新说明](https://bitcoincore.org/en/releases/0.20.0/)

### **2020 年 8 月 1 日：Bitcoin Core v0.20.1 发布**

这个小版本的更新包括应对不轨对等节点的方式不同，钱包提醒以及 PSBT 支持带 witness 和不带 witness 的 UTXO。

见：[更新说明](https://bitcoin.org/en/release/v0.20.1)

### **2020：为比特币项目和个人贡献者设置的开发奖**

包括 BitMEX、Square Crypto、OKCoin、BTSE、Kraken 在内的公司，以及 Human Rights Fundation、Paradigm 和 Coinbase 交易所，为比特币项目和个人贡献者设立了多个开发奖项。

见：[Square Crypto Grants](https://squarecrypto.org/#grants)、[BitMEX Grants](https://blog.bitmex.com/grants/)、[OKCoin Grants](https://developergrant.okcoin.com/)、[Coinbase Grants](https://blog.coinbase.com/announcing-our-first-bitcoin-core-developer-grants-3d88559db068)、[Polylunar Grant Tracker](https://polylunar.com/bitcoin-grants-tracker/)、[Bitcoin Words Grant Tracker](https://bitcoinwords.github.io/grants/)

*所有的文字和图片都遵循[自由创作和分享协议 4.0](http://creativecommons.org/licenses/by-sa/4.0/)，作者保留署名权，允许自由分享和改编，后续使用应维持同样的使用条件。*

（完）
