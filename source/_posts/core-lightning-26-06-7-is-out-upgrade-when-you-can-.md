---
title: 'Core Lightning 的用户：请尽快升级到 26.06.7 版本'
author: 'Blockstream'
date: '2026/09/05 16:55:50'
cover: ''
excerpt: '修复了我们在过去三周中收到报告并已经确认的漏洞'
categories:
- 闪电网络
tags:
- 安全警告
---


> *作者：Blockstream*
> 
> *来源：<https://blog.blockstream.com/core-lightning-26-06-7/>*



## 立即升级

[马上升级到 26.06.7 版本](https://github.com/ElementsProject/lightning/releases/tag/v26.06.7?ref=blog.blockstream.com)。这是一个小版本更新，修复了我们在过去三周中收到报告并已经确认的漏洞。

## 为何细节仍要守密两个星期

在八月上旬，Core Lightning 开始从比特币开源软件社区收到安全报告。我们的团队成员包括其他贡献者，马上采取了行动。

经过签名的 26.06.7 版本的二进制可执行文件已经放出。源代码将在 14 天后（2026 年 9 月 11 日）公开。

补丁本身会暴露它所改变的代码。源代码守密两个星期，让用户可以升级，同时降低漏洞被完全识别的风险。

在我们发布源代码之后，你应该验证它与你运行了两个星期的二进制可执行文件相匹配。为此，你需要从源代码重新编译，并确认结果与你安装的二进制可执行文件一致。

## 现在要做什么

[马上升级到 26.06.7 版本](https://github.com/ElementsProject/lightning/releases/tag/v26.06.7?ref=blog.blockstream.com)。先验证对这些二进制可执行文件的签名，然后安装、重启你的节点。

如果你现在无法升级，那么请使用 `-offline` 启动标签重启你的  Core Lightning 客户端。请不要把这与关闭电脑的电源相混淆，使用 `-offline` 来重启软件会阻止恶意人给你的节点发送消息，从而消除攻击界面，同时，你的后台程序可以继续运行，你可以继续观察区块链以侦测欺诈。升级软件之后，请删去 `-offline` 标签并重启节点。

26.06.7 以前的版本将不再拥有技术支持。26.09 版本依照原定计划在 9 月下旬发布。

## 致谢

我们衷心感谢社区遵循尽责披露流程：

- 安全报告来自：erickcestari、project-loupe、instagibbs、benthecarman、0xaudron、callebtc、haoxucu、vincenzopalazzo、ksedgwic、jaonoctus、whkim0、Ahmadsm2005、labrat-guy、FrancisPouliot、the Bitcoin Red Team，以及 [coinos.io](http://coinos.io/?ref=blog.blockstream.com) 的  moinaiagent 。
- 补救措施由众人完成：[nGoline](https://x.com/ngoline?ref=blog.blockstream.com)、[cdecker](https://x.com/Snyke?ref=blog.blockstream.com)、[ddustin](https://x.com/dusty_daemon?ref=blog.blockstream.com)、[Lagrang3](https://x.com/rm_windows?ref=blog.blockstream.com)、[sangbida](https://x.com/sangaChau?ref=blog.blockstream.com)、[rustyrussell](https://x.com/rusty_twit?ref=blog.blockstream.com)、[daywalker90](https://github.com/daywalker90?ref=blog.blockstream.com)、[Andezion](https://github.com/Andezion?ref=blog.blockstream.com)、[nepet](https://x.com/nepetonium?ref=blog.blockstream.com) 以及 [niftynei](https://x.com/niftynei?ref=blog.blockstream.com) 。

## 下一步

因为我们将继续收到更多的报告，我们会主动拥抱 AI 辅助的审核，为所有 CLN 的用户提高产品质量、安全性和可靠性。

我们欢迎社区成员加入并了解最新状态：

- 安全报告请发送至 [security@blockstream.com](mailto:security@blockstream.com?ref=blog.blockstream.com)
- 关注 [@Core_LN](https://x.com/Core_LN?ref=blog.blockstream.com) 和 [@Blockstream](https://x.com/Blockstream?ref=blog.blockstream.com)

（完）