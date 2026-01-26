---
title: 'Bitcoin Core v30.0 及 v30.1 在钱包迁移中可能出现误删除错误'
author: 'Bitcoin Core'
date: '2026/01/26 15:26:03'
cover: ''
excerpt: '严重故障'
tags:
- 尽责披露
---


> *作者：Bitcoin Core*
> 
> *来源：<https://bitcoincore.org/en/2026/01/05/wallet-migration-bug/>*

> 编者注：`Bitcoin Core` 软件一直有一个内置的钱包模块。从 v30.0 版本开始，`Bitcoin Core` 不再支持在旧版本的 `Bitcoin Core` 中创建的 “传统钱包（Legacy wallets）”，而只支持 “描述符钱包（descriptor wallets）”；用户需要将传统钱包迁移为描述符钱包，才能在 `Bitcoin Core` 中继续使用。
>
> 本公告提到的严重故障，正是在 v30.0 及 v30.1 版本中使用钱包迁移功能时出现的，为此，用户应绝对避免在这两个版本中使用钱包迁移功能，要么使用更老的版本，要么使用更新的版本。
>
> - 公告中提到的 v30.2 版本已经放出，可在此处下载：https://bitcoincore.org/en/download
> - 关于传统钱包迁移为描述符钱包的指南，见此处：https://www.btcstudy.org/2025/11/05/bitcoin-core-document-managing-the-wallet/

我们已经注意到了，`Bitcoin Core` 30.0 及 30.1 版本中引入了一个钱包迁移故障。在罕见的情况下，当一个钱包 `.dat` 文件迁移失败时，程序可能会删除整个钱包文件夹，从而有可能导致资金损失。修复措施即将到来，将在 30.2 版本中发布。但出于充分的谨慎，我们已经从 bitcoincore.org 下载页面中移除了受影响的版本的二进制文件。

此刻，我们请求用户不要使用图形界面（GUI）以及命令行调用（RPC）来尝试钱包迁移，应该等待 30.2 版本的发布。所有其他用户，包括已在软件内建立钱包的用户，不受此故障影响，可以继续使用已有的版本。

具体来说，该故障发生的前提是有一个默认的（未命名的）钱包 `.dat` 文件 —— 从 0.21 版本（5 年前发行）开始，`Bitcoin Core` 就不再默认创建这样的钱包文件了 —— 并且该文件在迁移或加载中失败。可能触发此故障的其中一个条件是打开了区块修剪功能（pruning），并且在修剪正在发生的时候弹出（unload）钱包了。

