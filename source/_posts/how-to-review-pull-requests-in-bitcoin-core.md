---
title: '如何审核给 Bitcoin Core 提交的 PR'
author: 'jon atack'
date: '2026/02/03 20:12:49'
cover: ''
excerpt: '审核和测试，可能是给 Bitcoin Core 贡献代码的最佳起步方式'
tags:
- 贡献
---


> *作者：jon atack*
> 
> *来源：<https://jonatack.github.io/articles/how-to-review-pull-requests-in-bitcoin-core>*



## 引言

审核（reviewing）和测试（testing），可能是给 Bitcoin Core 贡献代码的最佳起步方式。

丰富的审核和测试常常被长期的 Bitcoin Core 开发者提及，因为：

- 资源瓶颈，以及
- 它是学习、开始贡献代码和积累在社区中的剩余的最佳方式，也是最有效益的方式。

## 在你开始之前

本指南建立在这些文献的基础上：

1. 《[向 Bitcoin Core 贡献：个人经验](https://johnnewbery.com/contributing-to-bitcoin-core-a-personal-account/)》，来自 [John Newbery](https://x.com/jfnewbery)（2017）
2. 《[理解比特币的技术一面](https://medium.com/@pierre_rochard/understanding-the-technical-side-of-bitcoin-2c212dd65c09)》，来自 [Pierre Rochard](https://x.com/BitcoinPierre)（2018）
3. 硬核研讨会 [视频](https://www.youtube.com/watch?v=MJBhZg0ytiw) / [转录稿](https://diyhpl.us/wiki/transcripts/sf-bitcoin-meetup/2018-04-23-jeremy-rubin-bitcoin-core/) / [幻灯片](https://drive.google.com/file/d/149Ta1WRXL5WEvnBdlL-HxmsFDXUbvFDy/view)，来自 [Jeremy Rubin](https://x.com/JeremyRubin)（2018）

## 术语

[ACK，NACK](https://github.com/bitcoin/bitcoin/blob/master/CONTRIBUTING.md#peer-review)：它们的定义和起源可以在 [这里](https://www.freecodecamp.org/news/what-do-cryptic-github-comments-mean-9c1912bcc0a4/) 和 [这里](https://searchnetworking.techtarget.com/definition/ACK) 找到。

Nit：一个微小的，通常不造成阻塞的问题。

[PR](https://help.github.com/en/articles/about-pull-requests)：“*代码拉取请求（pull request）*” 的缩写，有时候也被称为 “合并请求（merge request）”。它是对源代码库中的代码或说明书的一次变更提议。

[WIP](https://en.wikipedia.org/wiki/Work_in_process)：“*还在开发中（work in progress）*” 的缩写。

## 通识

作为一名新人，我们的目标是尝试增加价值，以友好和谦逊的态度，同时尽可能多学习。（虽然这些目标也不是只对新人有意义；或者说，这个过程不会有终点。）

一个好办法是，不把它当成一个由你主导的事，而是问自己： “如何最好地服务大家？”

新的贡献者面对的最难问题之一是代码库的广度以及围绕它的技术复杂性。

要意识到还有你不知道的事。长期开发者有多年的开发经验和专业背景。社区已经建立了知识和经验的深度的集体财富。请记住，你的新想法可能已经有人提过、考虑过好几次了。

请记住，贡献者和维护者的时间精力都是有限的 —— 在你请求帮助的时候，应该谨慎并且尊重。目标是给予多于索求、帮助多于妨碍，同时加快速度。

多多尝试自己搞明白，至少要充分尊重其他人的时间。

关注 [#bitcoin-core-dev](https://kiwiirc.com/nextclient/irc.libera.chat) 即时聊天室以及 [bitcoin-dev](https://lists.linuxfoundation.org/mailman/listinfo/bitcoin-dev) 邮件列表。

更多值得关注的 IRC 频道[可在此处找到](https://github.com/jonatack/bitcoin-development/blob/master/irc-channels.txt)。

在你开始之前，要先投入大量时间：

- 理解贡献的流程和指引，不仅仅要阅读[代码库](https://github.com/bitcoin/bitcoin)里的说明书（尤其是《[贡献指南](https://github.com/bitcoin/bitcoin/blob/master/CONTRIBUTING.md)》、《[开发者笔记](https://github.com/jonatack/bitcoin-development/blob/master/irc-channels.txt)》和《[生产力笔记](https://github.com/bitcoin/bitcoin/blob/master/doc/productivity.md)》这几篇）（以及广义地说，[文档](https://github.com/bitcoin/bitcoin/tree/master/doc) 和 [测试](https://github.com/bitcoin/bitcoin/tree/master/test) [代码库](https://github.com/bitcoin/bitcoin/tree/master/src/test) 中的一切），还要关注 [#bitcoin-core-dev](https://kiwiirc.com/nextclient/irc.libera.chat) IRC 频道中的互动，以及[代码库中正在进行的代码审核](https://github.com/bitcoin/bitcoin/pulls)。
- 了解定期贡献者：他们做些什么、喜欢什么、想要什么，以及他们如何接收反馈。

许多新来者一上来就打开 PR ，但这只是在几百个正在等待有价值审核的 PR 中增加一个。从审核已有的 PR 、理解什么类型的 PR 和审核是更有帮助的、与此同时逐步理解全景，会好得多。

一个有用的经验法则是：每当你要创建一个 PR，就先审核 5 ~ 15 个 PR 。

### 全景

全景（big picture）比 nit、拼写和代码风格都要重要得多。

全景审核有几个不同层级：“这个变更会影响什么行为吗” 或者 “这个变更安全吗” 与 “这是个好想法吗” 是不一样的。回答后面这个问题需要更多背景，这也是你会逐渐了解的事。别因为它而停止思考这些问题、也别放弃在这个层面上审核。

提升你对全景的理解的步骤：

- 完成 [Chaincode Labs 的学习指南](https://github.com/chaincodelabs/study-groups)
- 考虑申请和参加最受推荐的 [Chaincode Labs 在线课程](https://learning.chaincode.com/)（这个项目实际上也为搜寻正在找比特币工作和开源奖金的新开发者服务）
- 学习[比特币升级提议](https://github.com/bitcoin/bips/)（通常以单数和缩写形式的 “BIP” 指代），并经常回顾
- 订阅 [Bitcoin Optech 周报](https://bitcoinops.org/)并使用他们的 [topics 页面](https://bitcoinops.org/en/topics/)作为手边资源
- 完成 “[从命令行学习比特币](https://github.com/ChristopherA/Learning-Bitcoin-from-the-Command-Line)”

追求质量而非数量，并在深入的工作和快速出成果之间取得平衡。

撰写说明有重要意义，比如说，关于各部件如何工作及如何交互的概要说明、清晰且准确的代码文档、一个函数是否有号的说明和 [Doxygen 文档](https://github.com/bitcoin/bitcoin/blob/master/doc/developer-notes.md#coding-style-doxygen-compatible-comments)、测试日志（既包括 `info` 也包括 `debug`），等等。

  测试覆盖面也是重要的，别犹豫，去提升和编写任何缺失的[单元测试](https://github.com/bitcoin/bitcoin/blob/master/src/test/)、[功能测试](https://github.com/bitcoin/bitcoin/tree/master/test/functional/)以及[模糊测试](https://github.com/bitcoin/bitcoin/blob/master/doc/fuzzing.md)。

称为一个谦虚、友善的贡献者。通过审核、[提出测试](https://github.com/bitcoin/bitcoin/pull/15996#issuecomment-491740946)以及有用的修复措施、提议变更代码初始状态（rebase）来帮助 PR 前进，甚至，可以考虑在 PR 沉寂几个月之后提出接管请求。总而言之，互帮互助！

### NIT

尝试避免过度纠结 PR 中的 nit、细枝末节和代码风格，尤其是那些还打着 “WIP” 标签的 PR；并且，在一个 PR 才刚刚创建、作者还在寻求概念上的 ACK（支持）和方法上的 ACK 的时候（比如还在寻求普遍共识的阶段），不要急着挑刺。

长期贡献者都报告说，这样的活动让他们反感；而且，这样做会消耗你在项目中的社会资本。尝试理解人们需要什么样的审核，以及什么时候需要审核。

评论任何 nit 的最佳时机，都是在 PR 已经获得足够多 概念/方法 上的 ACK（也即得到共识）之后，在 PR 终结、获得 “已测试 ACK” 之前。如 Pieter Wuille [在 IRC 中说的](http://www.erisian.com.au/bitcoin-core-dev/log-2020-05-17.html#l-307)：“我感觉，对一个 PR 来说，最挫败的事情就是得到了大量关于 细枝末节/nit/代码风格 的评论，而依然不知道这个 PR 作为一个概念是不是可取的。”

给出对 nit 和代码风格的建议时，应该友善、轻松、鼓励 —— 比如，“请自由忽略”、“如果你恰好改变代码，可以顺带调整”，等等。

请记住，没有人有义务将你的审核意见考虑在内；如果作者认为你的意见已经超出了变更的范围、因此回复称不想采纳，那没有任何问题（尤其是在你的评论都是在纠缠 nit 的时候）。

### 提高

在你能够做到的时候，提高你审核的 PR 的难度和优先级。

审核的质量比数量重要得多。你可以通过为[高优先级的 PR](https://github.com/orgs/bitcoin/projects/1/views/1) 和更难的 PR 提供深入、高质量的审核来学习以及[增添更多价值](https://jonatack.github.io/articles/on-reviewing-and-helping-those-who-do-it)。这些 PR 可能会吓倒人们，可能会停滞几个月，因为缺乏高质量的审核、遍布吹毛求疵的代码风格和 rebase 评论而让作者的激情消磨殆尽。好好审核它们是给比特币提供真正的服务。

提升的过程需要时间；没有什么能够替代投入在了解背景、关注 [代码](https://github.com/bitcoin/bitcoin)、[问题报告](https://github.com/bitcoin/bitcoin/issues)、[PR](https://github.com/bitcoin/bitcoin/pulls)、[#bitcoin-core-dev](https://kiwiirc.com/nextclient/irc.libera.chat) IRC 频道和 [bitcoin-dev](https://lists.linuxfoundation.org/mailman/listinfo/bitcoin-dev) 邮件组的经年累月时间。

在开始一次审核之前，一个有用的问题是：“在这个阶段，它最需要的东西是什么？” 回答这个问题需要经验和积累起来的背景知识，但它的有用之处在于，可以确定如何以最少时间添加最大价值。取决于变更的复杂性和致命性，以及这个 PR 在审核流程中已经走过的阶段，审核可能要略读代码、在关键位置的一个相关的代码评论中应用大量背景知识，而不是运行包含 debug 开发、测试和审核每一次提交的完整审核。不过，在绝大多数情况下，完成合适的全面审核都是最好的、能够增加最多价值。

### 一步一个脚印

把自我评价和愿望排除在外。不要把事情变成个人意气，应该推动事物前进。

有所怀疑的时候，假设他人有良好的意愿。

对人们和结果保持耐心。

公开表扬；私下批评，并且应该带有鼓励。

持续帮助。每天都要努力。

所有事情都是说起来容易做起来难，宽恕你自己，也宽恕其他人。

请记住：每当你要创建 1 个 PR，就先审核 5 ~ 15 个 PR（或者 处理/测试 5 ~ 15 个问题报告）。

最后，要从不同背景、不同经验层级的人了解你的贡献的价值，而不仅仅是你的同事或熟人。联系新朋友（直接通过 IRC 消息挺好的），问问他们需要什么帮助。你可以偶尔请求帮助，但不要把这当成一种权利。多给予，少索取。

## 技术细节

*别相信，去验证（Don't trust, verify）。* 尽可能减少你的审核流程对 GitHub 的以来。只为 GitHub 的元数据而使用 GitHub 网站，例如，阅读评论和添加你自己的评论 —— 审核提交和代码的工作应该在你本机环境中完成。

### 为本机拉取代码

因此，审核过程的起点是为你的电脑拉取 PR 分支，从而在本机编译和审核。相应于你的想法、需要、磁盘空间、互联网带宽，有不同的方法。以下仅举几例：

1. 使用 `git checkout pr/<number>` 来拉取远端的 PR， 就像[这篇短小精悍的 gist](https://gist.github.com/piscisaureus/3342247) 说的那样，可以修改成适合你的需要。
2. 我的 git 配置的 `[remote "origin"]` 部分：`fetch = +refs/pull/*/head:refs/remotes/origin/pr/*` 
3. Bitcoin Core 贡献者 Luke Dashjr 的版本：“为了避免所有的合并分支，将 origin-pull remote 配置成”：`fetch = +refs/pull/*/head:refs/remotes/origin-pull/*/head` 
4. Bitcoin Core 的文档：[使用 refspecs 轻松引用 PR](https://github.com/bitcoin/bitcoin/blob/master/doc/productivity.md#reference-prs-easily-with-refspecs)
5. 使用 `pull/<number>/head`（贡献者分支）和 `pull/<number>/merge`（合并到 master 分支），  GitHub 会[将 PR 暴露成](https://help.github.com/en/github/collaborating-with-issues-and-pull-requests/checking-out-pull-requests-locally)上游代码库的分支，例如，`git fetch origin pull/17283/head && git checkout FETCH_HEAD` 。也就是说，我倾向于尽可能少依赖 GitHub。

你可以在贡献者分支上测试一个 PR，也可以在合并了变更的 master 分支上测试它。测试后者，可以检查自上一次 PR 提交以来是否有什么合并到 master 分支的东西打破了变更，非常有用。

然后，你可以开始在本机编译和测试，同时开始阅读代码。你应该能够熟练地从[源代码编译 Bitcoin Core](https://jonatack.github.io/articles/how-to-compile-bitcoin-core-and-run-the-tests)，然后运行[单元测试](https://github.com/bitcoin/bitcoin/tree/master/src/test/README.md)和[功能测试](https://github.com/bitcoin/bitcoin/blob/master/test/README.md)，因为你需要为许多 PR 做测试。因此，Bitcoin Core 的《[生产力笔记](https://github.com/bitcoin/bitcoin/blob/master/doc/productivity.md)》是无可替代的。

阅读和了解 Bitcoin Core 的《[开发者笔记](https://github.com/bitcoin/bitcoin/blob/master/doc/developer-notes.md)》。

### 对比工具

在编译和测试还在运行中时，开始在你本机环境中审核每一次代码提交，使用 [gitk](https://git-scm.com/docs/gitk)、[meld](https://meldmerge.org/)、[meld                    for macOS](https://yousseb.github.io/meld/)、[GNU](https://www.gnu.org/software/emacs/manual/html_node/ediff/index.html) [ediff](https://www.emacswiki.org/emacs/EdiffMode) for Emacs、[vimdiff](https://vim.fandom.com/wiki/A_better_Vimdiff_Git_mergetool) 或 [vim-diffconflicts](https://github.com/whiteinge/diffconflicts) for Vim、opendiff on macOS、[diffoscope](https://diffoscope.org/) 这样可以高亮差异部分的对比工具（这里还有一份[对比工具使用技巧](https://github.com/fanquake/core-review/blob/master/diffoscope.md)）。

如果你使用 gitk 并且喜欢黑暗模式，我建议使用 [Dracula for gitk](https://github.com/dracula/gitk) 。

### Git Grep

熟练地使用 `git grep` 来搜索代码库。你会一直使用它，直到在代码库中找到你需要的材料。在命令行环境中运行 `git grep --help` 来获得帮助。

### 如果你不确定从哪里开始

阅读代码、阅读 PR 评论，然后回头重新阅读两者。找出不理解的地方，然后搞清楚。如是不断重复。

一旦所有一切都开始明朗，那就在 regtest/testnet 上运行 `bitcoind` （或者在主网上运行，只投入很少的钱），然后追踪和搜索相关的日志（运行 `bitcoin-cli help logging` 来获得不同的 `bitcoind` 日志类别以及如何 打开/关闭 它们）。

 也许你可以添加一些自定义的日志逻辑，`LogPrintf` 或者 `assert`； 将它们添加到别人的代码中是一种特权（想了解为什么，请在代码库中运行 `git grep -ni logprintf` 或 `git grep asset`）。

运行相关的功能测试，查看 debug 日志。验证它们在 master 分支上的出错方式 符合预期。然后回到 PR 分支，逆转或改变新的测试，让它们失败，并理解其中的原因。

也许 C++ 的 [gdb](https://www.gnu.org/software/gdb/documentation/) 或 Python 的 [pdb](https://docs.python.org/3/library/pdb.html) （或者在任何功能测试代码中加入 `import pdb:pdb.set_trace()` ）可以获得断点视图。求值。运行 RPC 命令。

检查该 PR 是否忽略了任何调用站点、头文件或声明。

尝试重构代码到更好状态，并探索为什么这样行不通。做好实际花费时间是预计时间两倍长的准备。没错，这就是工作。

也许可以运行 strace（`man page strace`）来跟踪系统调用和信号。

取决于变更的内容，贡献基准测试、内存分析/valgrind 或火焰图（flame graphs）到 PR 审核中，有时候会很有帮助，甚至是决定性的。

### 技术资源

我为自己整理了一份包含多种技术笔记的文档，我在开发 Bitcoin Core 时经常引用它们，放在这里：[jonatack/bitcoin-development/notes.txt](https://github.com/jonatack/bitcoin-development/blob/master/notes.txt) 。这些笔记所在的代码库中还有有用的资料。另一个很好的资源库是 [fanquake/core-review](https://github.com/fanquake/core-review) 。

### 调试

两个很好的 gist，讲解了调试 Bitcoin Core ：

- 《[调试 Bitcoin Core](https://github.com/fjahr/debugging_bitcoin)》，来自 [Fabian Jahr](https://x.com/fjahr)
- 《[使用 GDB 或 LLDB 深入和调试 Bitcoin Core](https://gist.github.com/gubatron/36784ee38e45cb4bf4c7a82ecc87b6a8)》，来自 [Angel Leon](https://www.gubatron.com/blog/)

### 添加缺失的测试

虽然你是在审核，但自己编写测试可以帮助你理解代码的动作并验证变更的内容。而且，如果它们添加了有用的覆盖面，你可以向作者提议在 PR 中加入这些测试。提议自动化测试是开始贡献的非常有用的方式。有人审核代码并提供额外的测试，作者会很感激的。[这里就有一个例子](https://github.com/bitcoin/bitcoin/pull/15996#issuecomment-491740946)。

### 从全景到 nit

请记住，全景比 nit、拼写和代码风格都重要得多。请重新阅读上文的 “NIT” 一节。在审核中，应尝试避免评论这些东西，即使你没有别的东西要评论。我知道，这很难 —— 我也很多次管不住自己 —— 但有一些更好的替代：

### 提问

作为一个审核员，（无需对代码的专门知识）你可以做的一个好事情是 *提出问题* 。PR 的作者通常乐于讨论自己的工作以及看到对它的兴趣。所以，花上 20 多分钟，看看变更的内容、找出看起来最令人困惑或者意外的地方，然后在 PR 评论中（或者 [#bitcoin-core-dev](https://kiwiirc.com/nextclient/irc.libera.chat) 频道中）礼貌地问问这些问题。可能其他人也对同样的问题感到亦或，然后它可以得到更好的澄清和记录。这样一来，你既可以学到知识，又能帮助这个项目变得更加易于理解（本段要归功于 [Russ Yanofsky](https://github.com/bitcoin/bitcoin/pull/15934#issuecomment-547095024)）。

### 同侪审核

确保你学习并理解了 Bitcoin Core 的[同侪审核流程](https://github.com/bitcoin/bitcoin/blob/master/CONTRIBUTING.md#peer-review)。这个流程 [经常](https://github.com/bitcoin/bitcoin/pull/15626) [更新](https://github.com/bitcoin/bitcoin/pull/16149)，所以要经常回顾。

“[ACK](https://www.freecodecamp.org/news/what-do-cryptic-github-comments-mean-9c1912bcc0a4/)”（[起源](https://searchnetworking.techtarget.com/definition/ACK)）一般用在审核员对自己如何审核以及手动测试的描述之后。作为一个新的贡献者，建议在审核评论中更加详细地提供关于你做了什么、想了什么的详细描述，以证明你理解了这项变更。

“Concept ACK（概念 ACK）” 意味着审核人认可并同意这项变更的目标，但（尚且）没有承认自己看了代码、测试了代码。这对 PR 作者来说也可能是一个有价值的信号，让他们知道这个 PR 是有价值的，并且是往正确的方向前进。相对应的，“概念 NACK” 则表示不同意这个 PR 的目标。

“Approach ACK（方法 ACK）” 则比概念 ACK 更进一步，意味着既同意 PR 的目标，又同意这个 PR 用来实现这一变更的方法。“方法 NACK”则表示同意目标，但不同意实现的方法。

审核人有时候会评论 “代码审核 ACK” 来表示代码看起来不错，但他们还没测试变更的内容，或者对概念还没有形成观点。添加更多的背景会更好：“代码审核 ACK `HEAD`，还不清楚概念的用意，我将验证 x、y、z ”等等。

还有其它 ACK 变体：“tACK” 或者 “tested ACK”，表示已经测试；而 “utACK” 或者 “untested ACK” 表示尚未测试。

手动测试新特性，或者报告问题，都是受到欢迎的。审核评论中出现了这样的字眼：“以下是我的测试内容和测试方法”，那是非常有帮助的，尤其是末尾还有一个 “ACK” 的话。

一些 PR 可能难以测试，或难以 ACK，因为它的复杂性、背景或缺乏测试和模拟的框架。比如说，如果你透彻审核了代码，留下 “我看起来代码是正确的，但对于它的动作，我无法自信到给出一个 ACK” 这样的评论，那也是非常有用的贡献。

还有其它有用的评论，比如， 对于包含了 move-only 的评论，“验证了 move-only 部分” 就是有用的；还有 “苦苦思索改变 X 有没有可能打破 Y，但没有想出任何结果（这种情况真的会发生吗？）”，等等。

### 带有提交哈希值的 ACK

给出一个 ACK 的时候，通过附加 `HEAD` 提交（或者你审核的那一个提交）的哈希值来指明你审核的代码状态。免信任的、正确的方式是使用来自你的 *本机* 分支的哈希值，而不是来自 GitHub 网页的哈希值。这样一来，除非你的本机工具被攻破了，否则你可以保证，你是在 ACK 具体的一些变更。在强制推送（force push）发生、链接到的旧提交在 GitHub 上已经丢失时，这样做也是有用的。

一个完整的 ACK 应该是这样的：“ACK `fa2f991` ，我编译了、运行了测试，通过运行 X/Y/Z 手动进行了测试，并且审核了代码，它看起来不错，我同意它可以合并。”

当前的 Bitcoin Core 合并脚本会将（在合并的时刻）与 `HEAD` 提交相关的每一条 ACK 意见的第一段都复制到合并代码的提交中。所以，请记住，你在其中写下的任何东西都会被合并脚本复制，成为 git 历史上永远的一部分。

一个复杂或者更加高风险的 PR，可能需要至少 3 ~ 4 个有经验的 ACK ，才能合并。

### APACHE 投票系统

Bitcoin Core 的审核人们经常在评论中使用 [Apache 投票系统](https://www.apache.org/foundation/voting.html#expressing-votes-1-0-1-and-fractions)。这里就是一个[例子](https://github.com/bitcoin/bitcoin/pull/11426#issuecomment-334091207)。

### 对人宽容一点

审核代码，而不是审核贡献者本身和他们的评论。

当你不能同意的时候，一次性说明你的观点，然后推进。[这里就是一个例子](https://github.com/bitcoin/bitcoin/pull/22245#issuecomment-862044403)。不要用多次发言冲垮评论去，也别恐吓他人或过度反应。要有耐心，不要过激或霸凌他人。请记住，最重要的东西可能不是讨论中的问题，而是你跟其他贡献者的关系。

作为一个新贡献者，在给出 NACK 时要慎重。要默认假设是你对背景缺乏理解。如果你要给出 NACK，请提供好的推理。[这里就是一个例子](https://github.com/bitcoin/bitcoin/pull/12360#issuecomment-383342462)。

### 使用 OpenTimeStamp 签名提交

一些比特币贡献者会为 ACK 签名并附加 OpenTimeStamp（Open 时间戳）。虽然这超出了本文的范围，但使用 [OpenTimeStamp 的 Git 插件](https://github.com/opentimestamps/opentimestamps-client/blob/master/doc/git-integration.md)来签名你的提交是非常简单的。

### 可折叠的评论

一段时间以后，你会注意到，贡献者们有时候会使用[可折叠的评论](https://github.com/bitcoin/bitcoin/pull/15600#issuecomment-604144041)来审核。*太酷了*，你会想，*这是怎么做到的* ？它用的是 HTML 的 `details` 标签。[这里有用法说明](https://gist.github.com/joyrexus/16041f2426450e73f5df9391f7f7ae5f)。 

## 致谢

感谢 [Steve Lee](https://x.com/moneyball)（moneyball）和 [Michael Folkson](https://x.com/michaelfolkson) 审核本文并提出他们的建议。

通过关注值得致谢的 Bitcoin Core 开发者，本文包含了在 GitHub 和 IRC 上观察到的评论：Wladimir van der Laan、Marco Falke、Pieter Wuille、Gregory Maxwell、Anthony Towns 和 Russ Yanofsky 。

多年以来，我因为 BDFL（终身仁慈独裁者）在编程语言和开源项目中的影响力而失望。Wladimir van der Laan 为比特币贡献的 [长期](https://x.com/orionwl/status/1131564038444453889) [谦逊](https://x.com/orionwl/status/1131827793908645888) 的[服务](https://x.com/orionwl/status/1131924832071880705)，点燃了我再次投身开源项目的可能性。

最后，衷心感谢各位 Bitcoin Core 贡献者对我的审核的耐心，主要有 John Newbery、Marco Falke、João Barbosa、practicalswift、Gregory Sanders、Jonas Schnelli、Pieter Wuille 和 Wladimir van der Laan 。还要感谢 Adam Jonas 和 John Newbery 在一开始的指引和建议。

（完）