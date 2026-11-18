---
title: '影响 30.0 以前版本 Bitcoin Core 软件的漏洞披露'
author: 'Bitcoin Core'
date: '2026/11/18 18:22:47'
cover: ''
excerpt: '为便于读者检查自己所用软件的安全性，将漏洞按照修复它们的版本号排列'
categories:
- 比特币主网
tags:
- 尽责披露
---


> *作者：Bitcoin Core*
>
> *来源：<https://bitcoincore.org/en/security-advisories/>*
>
> *本文汇集了已经披露的影响 30.0 以前版本 Bitcoin Core 软件的漏洞。*
>
> *自 [2024 年 7 月](https://mailing-list.bitcoindevs.xyz/bitcoindev/rALfxJ5b5hyubGwdVW3F4jtugxnXRvc-tjD_qwW7z73rd5j7lXGNdEHWikmSdmNG3vkSOIwEryZzOZr_DgmVDDmt9qsX0gpRAcpY9CfwSk4=@protonmail.com/T/#u)以来，Bitcoin Core 项目改变了影响旧版本的漏洞的披露策略。如今，已披露的漏洞在[此页面](https://bitcoincore.org/en/security-advisories/)集中呈现。*
>
> *影响 25.1 以前版本 Bitcoin Core 软件的漏洞可见[此处](https://www.btcstudy.org/2025/11/24/disclosure-of-vulnerabilities-affecting-bitcoin-core-versions-before-25-0-bitcoin-core/)。*
>
> *便于读者检查自己所用软件的安全性，将漏洞按照修复它们的版本号排列。*
>
> *标题带有超链接，可跳转到具体的漏洞披露网页。*



## [CVE-2025-62859 - 见证熔融导致区块处理停滞](https://bitcoincore.org/en/2026/11/10/disclose-cve-2025-62859/)

（发布于 2026 年 11 月 10 日。）

在 `Bitcoin Core` 29.2 和 30.0 版本以前，区块处理可能会因为一个恶意的对等节点（在某些条件下）在致密区块中利用见证熔融（witness malleation）而停滞。

这个问题被认为具有**中等**危险性。

### 细节

受影响的 `Bitcoin Core` 版本，在收取致密区块之后的重新构造期间、检查见证熔融之前，会清空下载状态。如果检查不通过，节点会回退到向同一个对等节点用 `GETDATA` 消息请求区块，超时时间为 10 分钟。

恶意的对等节点，在最先向受害者宣布一个致密区块的时候，可以利用这种漏洞来阻断受害者的区块处理。 只要攻击者控制了受害者的 3 个高贷款对等节点，或者受害者使用了 `-blocksonly` 标签，这个过程可以无休止重复。

### 致谢

Eugene Siegel 发现了并尽责披露了这个漏洞。

### 时间线

- 2025-04-28 - Eugene 向 Bitcoin Core 安全邮件组报告了这个漏洞。
- 2025-05-30 -  Gregory Sanders 开启 PR [#32646](https://github.com/bitcoin/bitcoin/pull/32646) 来修复这个漏洞。
- 2025-06-30 -  PR #32646 合并。
- 2025-09-12 -  PR #32646 反向移植到 29 版本。
- 2025-10-10 - 包含一项修复措施的 `Bitcoin Core` 30.0 版本发布。
- 2025-10-14 - 包含一项修复措施的 `Bitcoin Core` 29.2 版本发布。
- 2026-10-27 - 含有漏洞的最后一个 `Bitcoin Core` 版本（29.x）结束软件的设计寿命。
- 2026-11-10 - 公开披露。

## [CVE-2025-62860 - 来访的 Tor 连接错误获得白名单许可](https://bitcoincore.org/en/2026/11/10/disclose-cve-2025-62860/)

（发布于 2026 年 11 月 10 日。）

28.3、29.2 及 30.0 版本以前的 `Bitcoin Core` ，都在一份用 IP 范围来配置的白名单中包含 Tor 来访对等节点。

这个问题被认为是**中等**危险的。

### 细节

在 `Bitcoin Core` 中，来访的 Tor 对等节点的 IP 地址就是 Tor 后台进程的，这个进程通常运行在同一台机器或是本地网络中。`-whitelist` 配置项目会给受信任的对等节点放宽多种 DoS 限制和隐私性泄露的缓解措施。`Bitcoin Core` 会将来访的 Tor 连接加入白名单，只要 Tor 代理的地址匹配通过 `-whitelist` 选项配置的 IP 范围。

`Bitcoin Core` 30.0 以及所有的后续版本（以及 28.3 和后续小版本、29.2 以及后续小版本），都不再将从 onion bind 收到的来访 Tor 连接加入白名单。没有设置非默认 `-whitelist` 选项的节点一直不受影响。

热门的软件供应商常常将 `Bitcoin Core` 与一个 Tor 后台进程捆绑，并将 `-whitelist` 选项设定为一个匹配该 Tor 后台进程的 IP 范围。这个 `-whitelist` 选项也曾经是 `Bitcoin Core` 的客户端软件的运行要求，这样的软件常常跟 Tor 后台进程一起运行。这导致数以千计的可连接的主网节点将所有来访的 Tor 连接都当成白名单。

### 致谢

Martin Zumsande 和 Antoine Poinsot 发现了这个问题并尽责披露了。

### 时间线

- 2025-09-12 - Martin 和 Antoine 向 Bitcoin Core 安全团队报告了这个问题。
- 2025-09-15 - Martin 开启了 PR [#33395](https://github.com/bitcoin/bitcoin/pull/33395) ，在应用白名单许可时，停止考虑 Tor 来访对等节点。
- 2025-09-17 - Antoine 向 Bitcoin Knots 维护者 Luke Dashjr 报告了这个问题，后者在同一天确认了问题存在。
- 2025-09-17 - PR #33395 合并，并反向移植到以往的发行版。
- 2025-09-19 - Antoine 向受到影响的多个软件供应商报告了这个问题。
- 2025-10-10 - 包含修复措施的 `Bitcoin Core` 30.0 发布。
- 2025-10-14 - 包含修复措施的 `Bitcoin Core` 29.2 发布。
- 2025-10-20 - 包含修复措施的 `Bitcoin Core` 28.3 发布。
- 2026-10-27 - 含有漏洞的最后一个 `Bitcoin Core` 版本（29.x）结束软件的设计寿命。
- 2026-11-10 - 公开披露。

## [CVE-2025-62861 - 链重组期间 TRUC 亲属驱逐导致区块模板停止生产](https://bitcoincore.org/en/2026/11/10/disclose-cve-2025-62861/)

（发布于 2026 年 11 月 10 日。）

披露了一项 bug 的细节：在区块链重组期间，因为 TRUC “亲属驱逐（sibling eviction）” 产生交易池不一致性。一项修复措施已经于 2025 年 10 月 10 日在 `Bitcoin Core` v30.0 中发布。受影响的版本是 28.0 到 28.2、29.0 到 29.1 。

这个问题被认为具有**高**危险性。

### 细节

交易转发规则对版本号为 3 的（“TRUC”）交易应用了额外的拓扑限制，详见 [BIP 431](https://github.com/bitcoin/bips/blob/master/bip-0431.mediawiki)：一笔 TRUC 交易至多只能拥有一笔未确认的祖先交易，并且至多只能拥有一笔未确认的后代交易。这是交易池规则，并非共识规则，因此，一个区块可以包含其他形式的交易拓扑而依然是有效的，包括一笔 TRUC 亲交易带有多个子交易。当一笔交易被提交到交易池、即将导致一笔 TRUC 亲交易拥有第二个未确认的子交易时， `Bitcoin Core` 的亲属驱逐逻辑（在 v28.0 引入）会将现有的子交易当成替代的候选，并且，如果新交易支付的手续费更多，就根据 “手续费替换（replace-by-fee）” 规则驱逐现有的子交易。 

在区块链重组期间，被重组的区块中的交易会被 —— 使用 `bypass_limits=true` 标签 —— 重新添加到交易池。这就意味着，它会原样地恢复已经确认的交易，而不应用交易池的抗 DoS 规则及拓扑策略。这个 bug 在于，亲属驱逐分支并没有被 `bypass_limits` 挡住，所以 TRUC 规则在被复原的交易中依然会强制执行。

重组可能会复原出一套违反 TRUC 后代限制的交易拓扑：在区块中是有效的，但在交易池中无法形成（给定 TRUC 的限制）。在依然适用亲属驱逐规则的情况下重新添加这样的交易，可能会驱逐一笔复原出来的交易，但在交易池内留下它的后代，这样，交易池中就出现了花费尚不存在的输出的交易。

这种不一致状态的主要后果是，作为一个矿工，程序的区块模板创建可能永远无法再完成：组装出来的模板无法通过有效性检查，所以经历了这样一次重组的节点无法再生产区块，除非重启 —— 这会重新加载交易池，成为一个一致的状态。修复措施在 [PR #33504](https://github.com/bitcoin/bitcoin/pull/33504) 中：在 `bypass_limits` 中关住 TRUC 检查，从而在区块链重组、重新添加交易到交易池期间，不再运行亲属驱逐逻辑。

### 致谢

感谢 Niklas Goegge 发现并尽责披露了这个漏洞。

### 时间线

- 2025-09-26 - Niklas Goegge 向 Bitcoin Core 安全邮件组报告了这个问题。
- 2025-09-29 - Greg Sanders 开启了带有修复措施的 PR [#33504](https://github.com/bitcoin/bitcoin/pull/33504) 。
- 2025-10-02 - PR #33504 合并到主分支。
- 2025-10-03 - 修复措施在 PR [#33474](https://github.com/bitcoin/bitcoin/pull/33474) 中反向移植到 29.x 分支。
- 2025-10-06 - 修复措施在 PR [#33473](https://github.com/bitcoin/bitcoin/pull/33473) 中反向移植到 30.x 分支。
- 2025-10-07 - 修复措施在 PR [#33535](https://github.com/bitcoin/bitcoin/pull/33535) 中反向移植到 28.x 分支。
- 2025-10-10 - 包含该修复措施的 `Bitcoin Core` 30.0 发布。
- 2025-10-14 - 包含该修复措施的 `Bitcoin Core` 29.2 发布。
- 2025-10-17 - 包含该修复措施的 `Bitcoin Core` 28.3 发布。
- 2026-10-27 - 最后一个含有漏洞的 `Bitcoin Core` 版本（29.x）结束软件的设计生命周期。
- 2026-11-10 - 公开披露。

## [CVE-2025-46597 - 在 32 位系统上极难利用的远程崩溃](https://bitcoincore.org/en/2025/10/24/disclose-cve-2025-46597/)

（发布于 2025 年 10 月 24 日。）

披露了一项在 32 位系统上的 bug 的细节： 在极罕见的情况下，该漏洞可能会导致收到有缺陷的区块的节点崩溃。这个 bug 是极为难以利用的。一项修复措施已经于 2025 年 10 月 10 日在 `Bitcoin Core` v30.0 中发布。

本漏洞被认为是**低**危险性的。

### 细节

在将一个区块写入硬盘之前，`Bitcoin Core` 会检查它的大小在一个正常的范围内。这种检查，在 32 位系统上处理大于 1GB 的区块时会溢出，并在写入到硬盘时导致节点崩溃。使用正常的 `BLOCK` 消息是无法发送这样的区块，但理论上，可以作为一个致密区块发送给受害者，如果该受害者节点拥有一个非默认的、空间巨大的交易池、并且已经包含了总体积达 1GB 的交易时。这需要受害者主动将 `-maxmempool` 选项配置为一个大于 3GB 的值，而 32 位系统可能最多只有 4GB 的内存。

这个问题通过在 32 位操作系统上限制 `-maxmempool` 配置的最大数值来间接防止。

### 致谢

Pieter Wuille 发现了这个 bug 并尽责披露了它。

Antoine Poinsot 提出并实现了一项隐蔽的缓解措施。

### 时间线

- 2025-04-24 - Pieter Wuille 报告了这个问题。
- 2025-05-16 - Antoine Poinsot 开启了 PR [#32530](https://github.com/bitcoin/bitcoin/pull/32530) ，带有一个隐蔽的修复措施。
- 2025-06-26 - PR #32530 合并到主分支。
- 2025-09-04 - 带有该修复措施的 29.1 版本发布。
- 2025-10-10 - 带有该修复措施的 30.0 版本发布。
- 2025-10-24 - 公开披露

## [CVE-2025-46598 - 由未确认交易的处理导致的 CPU 拒绝服务式攻击](https://bitcoincore.org/en/2025/10/24/disclose-cve-2025-46598/)

（发布于 2025 年 10 月 24 日。）

披露了一项在处理未确认交易时耗尽资源的 bug 的细节。一项修复措施已经于 2025 年 10 月 10 日在 `Bitcoin Core` v30.0 中发布。

本漏洞被认为是**低**危险性的。

### 细节

攻击者可以发送专门构造的未确认交易给受害者节点，每处理这样的一笔交易就要耗费几秒钟。这种非标准的交易会被拒绝，但不会导致对等节点连接断开，因此可以重复触发这个过程。这可以用来拖延区块传播。

这个问题是通过减少多种 Script 语境的验证时间的多个步骤来缓解的。

### 致谢

Antoine Poinsot  向 Bitcoin Core 安全邮件组报告了这个问题。

Pieter Wuille、Anthony Towns 和 Antoine Poinsot 实现了缓解措施，减少了最坏情况下未确认交易的验证。

### 时间线

- 2025-04-25 - Antoine Poinsot 报告了这个问题。
- 2025-05-12 - Pieter Wuille 开启 PR [#32473](https://github.com/bitcoin/bitcoin/pull/32473) 以缓解最坏情况下传统 Script 语境中的签名哈希次数平方增长问题。
- 2025-07-24 - Anthony Towns 开启 PR [#33050](https://github.com/bitcoin/bitcoin/pull/33050) ，目标是缓解最坏情况下 Tapscript 语境的哈希运算量。
- 2025-07-30 - Antoine Poinsot 开启 PR [#33105](https://github.com/bitcoin/bitcoin/pull/33105)，进一步缓解 Script 语境的最坏情况。
- 2025-08-08 - PR #33105 合并到主分支。
- 2025-08-11 - PR #32473 合并到主分支。
- 2025-08-12 - PR #33050 合并到主分支。
- 2025-10-10 - 带有缓解措施的 30.0 版本发布。
- 2025-10-24 - 公开披露

## [CVE-2025-54604 - 伪造自连接所引发的磁盘满载](https://bitcoincore.org/en/2025/10/24/disclose-cve-2025-54604/)

（发布于 2025 年 10 月 24 日。）

披露一项日志填充 bug 的细节：该漏洞允许攻击者通过伪造自连接（self-connections）导致受害者节点的硬盘满载。利用这项 bug 并不容易，因为需要花费很长时间才能让受害者的磁盘满载。 一项修复措施已经于 2025 年 10 月 10 日在 `Bitcoin Core` v30.0 中发布。

本漏洞被认为是**低**危险性的。

### 细节

`Bitcoin Core` 在遇到自连接时会无条件写下日志。这可以被攻击者利用：等待一个受害者连接本节点，然后复用版本消息 nonce 来建立许多对受害者这连接，导致该受害者节点将这些尝试理解为自连接。不过，爆破能力较为有限，因为默认情况下，来自受害者的最初连接在 60 秒后就会超时。

修复措施是实现日志写入的全局速率限制，这样也能防止未来出现同类的攻击。

### 致谢

Niklas Goegge 发现了这个 bug 并尽责披露了它。

Eugene Siegel 和 Niklas Goegge 开发了一项可以缓解所有类型的日志填充攻击的修复措施。

也要感谢贡献者 “practicalswift”，提出了对 `Bitcoin Core` 中磁盘填充攻击界面的关注，并尝试解决这些问题。

### 时间线

- 2022-05-16 - Niklas Goegge 向 Bitcoin Core 安全邮件组报告了这个问题。
- 2025-05-23 - Eugene Siegel 开启了 PR [#32604](https://github.com/bitcoin/bitcoin/pull/32604) ，引入了日志写入的速率限制，基于 Niklas Goegge 更早时候的工作。
- 2025-07-09 - PR #32604 合并到主分支。
- 2025-09-04 - 带有此种修复的版本 29.1 发布。
- 2025-10-10 - 带有此种修复的版本 30.0 发布。
- 2025-10-24 - 披露

## [CVE-2025-54605 - 无效区块塞满硬盘](https://bitcoincore.org/en/2025/10/24/disclose-cve-2025-54605/)

（发布于 2025 年 10 月 24 日。）

披露一个日志填充 bug 的细节：该漏洞允许攻击者通过向受害者节点反复发送无效区块来让该节点塞满其硬盘空间。利用这个 bug 并不容易，因为需要很长时间才能让受害者节点用尽硬盘空间。一项修复措施已经于 2025 年 10 月 10 日在 `Bitcoin Core` v30.0 中发布。

本漏洞被认为是**低**危险性的。

### 细节

在收到一个无法通过基本的合理检查的区块时，节点会无条件写下日志；在收到最后一个 “检查点（checkpoint）” 之前分叉出去的区块时，也会这样做。通过向受害者节点反复发送这样的无效区块，攻击者可以导致受害者用尽硬盘空间。

这个问题是通过全方位实现日志写入的速率限制来解决的；该修复也防止了未来出现同类漏洞。

### 致谢

Niklas Goegge 发现了这个 bug 并尽责披露了它。Eugene Siegel 独立地再次发现了这个 bug，也做了尽责披露。

Eugene Siegel 和 Niklas Goegge 开发了一项可以缓解所有类型的日志填充攻击的修复措施。

也要感谢贡献者 “practicalswift”，提出了对 `Bitcoin Core` 中磁盘填充攻击界面的关注，并尝试解决这些问题。

### 时间线

- 2022-05-16 - Niklas Goegge 向 Bitcoin Core 安全邮件组报告了这个问题。
- 2025-03-13 - Eugene Siegel 向 Bitcoin Core 安全邮件组报告了这个问题。
- 2025-04-24 - Eugene Siegel 在安全邮件组中报告了他对最坏情况下的磁盘填充速率的研究。
- 2025-05-23 - Eugene Siegel 开启了 PR [#32604](https://github.com/bitcoin/bitcoin/pull/32604) ，引入了日志写入的速率限制，基于 Niklas Goegge 更早时候的工作。
- 2025-07-09 - PR #32604 合并到主分支。
- 2025-09-04 - 带有此种修复的版本 29.1 发布。
- 2025-10-10 - 带有此种修复的版本 30.0 发布。
- 2025-10-24 - 披露

## [CVE-2024-52911 - 脚本解释器远程崩溃](https://bitcoincore.org/en/2026/05/05/disclose-cve-2024-52911/)

（发布于 2026 年 5 月 5 日。）

在 `Bitcoin Core` 0.14.0 版本之后、`Bitcoin Core` 29.0 版本以前，验证一个专门构造的区块可能会导致节点访问此前已经释放的内存。

在验证期间，为检查每一笔交易的各个输入而必需的数据，会预先计算和缓存。但在专门构造的无效区块上，这些数据可能会在仍被一个后台的验证线程访问期间，就被摧毁。有能力挖出一个带有足够工作量证明的区块的攻击者，可以理由这个漏洞来远程崩溃受害者节点。因为这种 “使用已释放的内存（use-after-free ）bug” 的特性，也许这种崩溃可以用来远程执行代码，但对输入（区块）的数据的约束使得这种利用不太可能。

这个问题被认为具有**高**危险性。

### 细节

默认情况下，新区块的脚本验证是派发给后台线程的，通过 `CScriptCheck` 函子（functor）的一个界面。每个 CScriptCheck 都持有一个指向 `PrecomputedTransactionData` 对象的指针，这个对象持有交易的各个输入所需的一些数据。因为它存储的时一个指针，而非数据本身，必须要谨慎才能保证  `PrecomputedTransactionData` 的存活时间长于 `CScriptCheck` 。

脚本检查的生命周期是靠一个 RAII 类 `CCheckQueueControl` 来强制执行的。然而，这种控制是在预计算的交易数据之前实例化的。因为 C++ 中的局部对象是[根据构造顺序的相反顺序来解构的](https://isocpp.org/wiki/faq/dtors#order-dtors-for-locals)，这就意味着 `PrecomputedTransactionData` 的界面会在 `CCheckQueueControl` *之前* 被解构。

在区块是有效区块时，这并不是问题，因为在函数返回之前、 `PrecomputedTransactionData` 被摧毁之前，会调用 `CCheckQueueControl::Wait()`。但是，在提前返回的情形中（当一项单独的检查失败时），一个后台的脚本线程可能会读取预先计算的 —— 已经摧毁的 —— 交易数据。攻击者可以利用这一点来让受害者崩溃，代价是区块链顶端的一个有效 PoW 的价值。

### 致谢

Cory Fields（MIT DCI）发现了这个漏洞并用一份详尽的报告尽责披露了它。该报告包含了一个用于复现的概念验证，以及一种提议的缓解措施。

### 时间线

- 2024-11-02 - Cory Fields 私下报告了这个 bug 。
- 2024-11-06 - Pieter Wuille 在已经打开的 [PR #31112](https://github.com/bitcoin/bitcoin/pull/31112) 中加入了一个隐蔽的修复措施，通过移除提早返回绕过了这个问题。
- 2024-12-03 - PR #31112 合并。
- 2025-04-12 - 包含该修复措施的 `Bitcoin Core` 29.0 版本发布。
- 2026-04-19 - 最后一个有漏洞的 `Bitcoin Core` 版本（28.x）结束软件设计寿命。
- 2026-05-05  - 公开披露。

## [CVE-2024-52919 - addr 消息导致的远程崩溃（part-2）](https://bitcoincore.org/en/2025/04/28/disclose-cve-2024-52919/)

（发布于 2025 年 4 月 28 日）

披露一个整数溢出 bug 的细节：如果一个节点遭到了持续很长时间（数年）的 `addr` 消息轰炸，该 bug 会导致节点崩溃。一项修复已经于 2025 月 14 日在 `Bitcoin Core` v29.0 中发布。

本漏洞被认为是**低**危险性的。

## 详情

`Bitcoin Core` 中的网络地址管理器为每个条目使用一个 32 比特的标识符；每次插入操作递增一个条目。一项[更早的安全披露](https://bitcoincore.org/en/2024/07/31/disclose-addrman-int-overflow)（[中文译本](https://www.btcstudy.org/2025/11/24/disclosure-of-vulnerabilities-affecting-bitcoin-core-versions-before-25-0-bitcoin-core/#CVE-2024-52919%EF%BC%9Aaddr-%E6%B6%88%E6%81%AF%E8%BD%B0%E7%82%B8%E5%8F%AF%E5%BC%95%E5%8F%91%E8%BF%9C%E7%AB%AF%E8%8A%82%E7%82%B9%E5%B4%A9%E6%BA%83)）解释了攻击者如何可以利用它来远程触发一次断言失败：使用 `addr` 消息持续轰炸受害者节点，直至其 32 比特标识符溢出。

该问题在 `Bitcoin Core` v22.0 中已经得到部分解决：通过在地址管理器中限制插入的速度，每个对等节点每 10 秒只允许插入 1 个地址。这已经让攻击变得昂贵很多，哪怕还不是完全不实用：即使一个节点有 1000 个对等节点，也需要超过要过一年的时间来让 32 比特标识符溢出。

剩余的、更加昂贵的攻击界面，在 `Bitcoin Core` 29.0 中解决，办法是让标识符使用 64 比特。

## 致谢

感谢 Eugene Siegel 发现并披露这个漏洞；感谢 Martin Zumsande 将标识符改为 64 位。

## 时间线

- 2021-06-21 - Eugene Siegel 发送初步的报告到 security@bitcoincore.org 。
- 2021-07-19 - 速率限制在 PR [#22387](https://github.com/bitcoin/bitcoin/pull/22387) 中合并。
- 2021-09-13 - v22.0 发布，带有速率限制。
- 2024-07-31 - 出版[第一份安全披露](https://bitcoincore.org/en/2024/07/31/disclose-addrman-int-overflow) 。
- 2024-09-20 - 变更位 64 比特标识符在 PR [#30568](https://github.com/bitcoin/bitcoin/pull/30568) 中合并。
- 2025-04-14 - `Bitcoin Core` v29.0 发布，使用 64 比特标识符。
- 2025-04-28 - 公开披露。

