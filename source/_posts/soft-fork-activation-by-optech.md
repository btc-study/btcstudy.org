---
title: '比特币软分叉激活史'
author: 'Bitcoin Optech'
date: '2021/09/29 11:04:24'
cover: ''
excerpt: '软分叉激活指的是一个比特币全节点开始增设一个或多个共识规则的瞬间。这种转换会在节点之间产生协调风险'
tags:
- 软分叉
---


> *作者：Bitcoin Optech*
> 
> *来源：<https://bitcoinops.org/en/topics/soft-fork-activation/>*

**软分叉激活**指的是一个比特币全节点开始增设一个或多个共识规则的瞬间。这种转换会在节点之间产生协调风险。所以开发者多年来花了相当多的力气来创建和提升软分叉激活机制，以尽可能降低出问题的概率。

软分叉使得网络整体上可以切换到使用新的共识规则，即使不是每个节点都接受这些规则。不过，每当不同的节点使用不同的共识规则，就有某个区块被一些接受但被另一些节点拒绝的风险（它违反了非统一的规则），导致共识错误（链分裂），最终可能出现资金的多重支付以及比特币系统安全性信誉的损失。这是激活机制尝试缓解的主要问题。

## 历史

新的软分叉激活提议通常被设计成避免之前的软分叉已经遭遇的问题，所以本节尝试概述之前比较著名的软分叉激活尝试。

### **[2009] 硬编码高度：共识层 nLockTime 启用**

这个[已知最早](https://bitcoin.stackexchange.com/questions/90229/nlocktime-in-bitcoin-core/99104#99104)的软分叉在 Bitcoin 软件 0.1.6 版本中实现（发布于 2009 年 11 月），硬编码在区块高度 31000 处激活，实际发生时间是 2009 年 11 月 22 日。在大部分开发工作都是由中本聪完成时，这种硬编码激活高度的方法至少还用在了[另一个](https://github.com/bitcoin/bitcoin/commit/8c9479c6bbbc38b897dc97de9d04e4d5a5a36730#diff-608d8de3fba954c50110b6d7386988f27295de845e9d7174e40095ba5efcf1bbR1421-R1423)早期的软分叉中。

### **[2011] 硬编码时间和手动干预：BIP12 `OP_EVAL` 失败**

在中本聪离开比特币之后，合并到比特币的第一个软分叉代码是 [BIP12](https://github.com/bitcoin/bips/blob/master/bip-0012.mediawiki)  `OP_EVAL`。本来计划是使用一个 *硬编码时间* 和在支持变更的算力占比少于 50% 时手动干预的方法。引自 BIP12：

> [...] 新的客户端和矿工将解释 OP_EVAL 为一个 no-op，直至 2012 年 2 月 1 日。在此之前，支持的矿工可以将 “OP_EVAL” 字样写在自己生产的区块里面，方便我们计算支持的算力占比。如果在 2012 年1 月 15 日之前没有超过 50% 的算力支持这一变更，激活将会推迟，直到有超过 50% 的算力支持 OP_EVAL（如果显然大部分算力都不会激活这一升级，则升级会被取消）。

手动干预可能是有必要的，因为 `OP_EVAL` 在激活代码合并之后、推出之前，被发现有一个[严重的漏洞](https://github.com/bitcoin/bitcoin/issues/729)。虽然这个 bug 被[修复](https://github.com/bitcoin/bitcoin/pull/730)了，一些开发者担心这个强大的新操作码可能会有其它问题，所以人们就放弃了这次软分叉。

### **[2012] 再次尝试硬编码时间以及手动干预：BIP16 P2SH**

人们提出了多个替代  ` OP_EVAL `  的简化提案（见 BIP[13](https://github.com/bitcoin/bips/blob/master/bip-0013.mediawiki)/[16](https://github.com/bitcoin/bips/blob/master/bip-0016.mediawiki)、[17](https://github.com/bitcoin/bips/blob/master/bip-0017.mediawiki)、[18](https://github.com/bitcoin/bips/blob/master/bip-0018.mediawiki) 和 [19](https://github.com/bitcoin/bips/blob/master/bip-0019.mediawiki)，还有[其它想法](https://bitcointalk.org/index.php?topic=58579.msg690093#msg690093)）。而 BIP13/16 支付给脚本哈希值（P2SH）[获得了大部分开发者的支持](https://en.bitcoin.it/wiki/P2SH_Votes)。P2SH [使用](https://github.com/bitcoin/bitcoin/commit/7bf8b7c25c944110dbe85ef9e4eebd858da34158)了 跟 OP_EVAL 一样的激活机制。最初计划的激活时间是 2012 年 3 月 1 日，但到了 2 月 15 开票日，在最后 100 个区块中，只有不到 50% 的矿工表示他们会在 3 月之前执行 BIP16 规则。这[导致](https://github.com/bitcoin/bitcoin/issues/925)了一个 “相当长的替代链”（链分裂），因为一些仍然在 3 月 1 日实行 BIP16 的 矿工拒绝了来自多数矿工（不实行新规则）的区块。第二次开票日是在几千个区块之后，3 月 15 日；这一次它获得了足够多的支持。所以开发者在 3 月 30 放出了 [Bitcoin 0.6.0](https://bitcoin.org/en/release/v0.6.0)，将激活时间设在了 4 月 1 日。

### **[2012] 硬编码时间：BIP30 拒绝复制 txid**

P2SH 的激活完成后，人们发现可能出现多个交易共用同一个 txid 的情况。就其自身而言，这个 bug 只会导致尝试利用这个 bug 的用户的资金被销毁，但它也可以结合比特币的默克尔树构建中的一些奇怪的行为打破节点间的共识（见 [CVE-2012-2459](https://bitcointalk.org/?topic=102395)）。第一个修复这个漏洞的软分叉是 BIP30，它简单将使用同一个 txid 的后发交易标记为无效交易，如果前发交易还有没花费的输出的话。这个修复在开发团队中没有争议，因此在包含 P2SH 激活参数的 [Bitcoin 0.6.0](https://bitcoin.org/en/release/v0.6.0) 中以硬编码时间的方式[激活](https://github.com/bitcoin/bitcoin/commit/a206b0ea12eb4606b93323268fc81a4f1f952531#diff-34d21af3c614ea3cee120df276c9c4ae95053830d7f1d3deaf009a4625409ad2R1271)。

### **[2012] IsSuperMajority (ISM)：BIP34 coinbase 前缀**

虽然 BIP30 修复了 txid 重合导致的短期问题，比特币开发者知道这只是权宜之计，软件没理由每次收到一笔新交易都要搜索带有未花费输出的所有交易的索引。所以第二个解决方案开始提上日程，旨在消除让 txid 复制变成实用攻击向量的弱点。这就是 [BIP34](https://github.com/bitcoin/bips/blob/master/bip-0034.mediawiki)。对这一次更新，开发者使用了 类似于 BIP16 P2SH 的矿工投票方法，但这一次，准备好支持 EIP34 的矿工需要增加他们的区块的 ` nVersion` 的数值。更重要的是，开发者自动化了比特币代码中新规则的实行，因此他们可以在等待矿工升级期间发布支持软分叉的软件。这个来自 BIP34 的规则用一个叫做  ` IsSUperMajority() ` 的函数实现了。最开始它包含了一个[单项的激活阈值](https://github.com/bitcoin/bitcoin/commit/de237cbfa4c1aa7d4f9888e650f870a50b77de73#diff-34d21af3c614ea3cee120df276c9c4ae95053830d7f1d3deaf009a4625409ad2R1829-R1841)，达到了便开始实行 BIP34 的新共识规则：

> 75% 规则：如果最新的 1000 个区块中有 75% 是 vision2 或者更大的，就开始拒绝无效的 vision 2 区块

在这个功能的开发期间，人们[决定](https://github.com/bitcoin/bitcoin/pull/1526#issuecomment-6717685)加入[第二项激活阈值](https://github.com/bitcoin/bitcoin/commit/d18f2fd9d6927b1a132c5e0094479cf44fc54aeb#diff-34d21af3c614ea3cee120df276c9c4ae95053830d7f1d3deaf009a4625409ad2R1829-R1837)，决定性地修复使用 BIP34 所要解决的问题：

> 95% 规则：如果最新的 1000 个区块中有 950 个都是 vision2 乃至更大的，就拒绝所有 vision 1 区块

拒绝旧版本区块这个规则的一个已知问题是，除非所有矿工都已经升级，每天都可能有几个无效区块产生（如果恰好是 95% 的矿工激活，每个区块都有 5% 的几率是无效的）。已经升级并执行 ISM 规则的节点会拒绝这些区块，但更老的节点和轻客户端不知道这个规则，所以会接受这些区块。这会让网络比普通情形更加依赖于不在无效块后面继续挖矿的矿工。

### **[2015] ISM 以及无验证挖矿：BIP66 严格 DER 激活**

在 2014 年 9 月，Pieter Wuille [发现](https://lists.linuxfoundation.org/pipermail/bitcoin-dev/2015-July/009697.html) OpenSSL 在处理不同平台的 DER 编码签名时存在分歧。这个可以被利用来，比如说，创建一个在 Linux 操作系统上可以通过验证但在 windows 操作系统上会失败的区块 —— 攻击者定点创造链分裂。Wuille 和其他几位开发者秘密开发了补丁，并致力于以软分叉激活，保证所有签名都使用同样的格式。BIP66 就是为这件事创建的，在公开宣传中，是作为移除比特币对 OpenSSL 依赖的一步（这个目标是真实的，最终在 2019 年[得以实现](https://bitcoinops.org/en/newsletters/2019/12/28/#openssl)）。在 BIP66 获得用户和开发者充分多的支持（许多人甚至不知道这个安全漏洞存在）之后，它使用与 BIP34 相同的 ISM 激活机制，将区块版本号递增为 v3，并要求达到 95% 的阈值后就拒绝 v2 和更低版本号的区块。

75% 的阈值在 2015 年 7 月 4 日达到，而 95% 阈值在区块高度 363725 处达成，所有的节点都运行 [Bitcoin Core v0.10.0](https://bitcoin.org/en/release/v0.10.0#bip-66-strict-der-encoding-for-signatures) 乃至更高版本的软件（或者兼容的实现），开始实行新规则。不过，在区块高度 363731 处，一个没升级的矿工生产了一个没包含当前版本号的区块，在新的 ISM 激活规则下不是有效区块。但其他矿工都在这个无效区块后面继续生产，最终产生了一条带有 6 个无效区块的链。这意味着未升级的节点和许多轻客户端都会将第一个无效区块中的 96 笔交易当成积累了 6 个区块确认的交易，即使它们在当时还没获得过哪怕一个有效区块的确认。最终，开发者只能联系矿池运营者，让他们手动重启软件并回到有效的链上。这样的事件在第二天又重演了一次，使一些交易获得了三次无效的确认。幸运的是，这六个和三个区块中的所有常规交易，后来都打包到了有效区块内，意味着普通用户没有损失。

最初位于 363731 高度的无效区块就是仅仅因为使用旧的版本号而变成无效的、预计每天都有可能出现的约 5% 区块之一。而下一个区块是未升级矿工挖出的概率也是 5%，所以连续两个区块都是版本号取消区块的概率是 0.25%。给定 95% 的矿工都已升级，连续 6 个区块都是版本号无效区块的概率是 0.000002% —— 但罪魁祸首还不是极端坏运气。没有考虑到的是矿工可能会做 “无验证挖矿”，也就是矿工在收到一个新区块之后，不加验证，直接在后面继续生产，这样可以提高一点效率。虽然无验证挖矿软件理论上很容易就能处理无效区块版本号，这个功能在当时挖掘那五个区块的矿工所用的软件中还没有实现。最终，足够多的矿工升级了他们的无验证挖矿软件，或者升级了他们的节点，而 BIP66 激活相关的意外链分裂就此绝迹。

为了应对这些导致 [2015 年 7 月出现分叉](https://en.bitcoin.it/wiki/July_2015_chain_forks)的问题，开发者加倍努力减少对无验证验证挖矿的需求，成果如 [BIP152](https://github.com/bitcoin/bips/blob/master/bip-0152.mediawiki) 压缩区块的中继以及 [FIBRE](http://bitcoinfibre.org/) 软件。开发者也开始思考一种更好的激活机制，也就是后面会提到的 BIP9 协议。

### **[2015] 最后一次 ISM：BIP65  `OP_CHECKLOCKTIMEVERIFY` 激活**

BIP66 严格 DER 软分叉之前，就有人提出要用软分叉为比特币增加一个新的操作码 `OP_CHECKLOCKTIMEVERIFY` （CLTV），但因为修复 OpenSSL 漏洞而推迟了。这就体现了 ISM 机制使用递增版本号的另一个弱点 —— 一个矿工如果发出信号支持最新的提议（vision n）也就隐含地表示了支持之前所有的提议（如 vision n-1）。这就限制了使用 ISM 同时协调多个升级的能力。

不过，尽管 BIP 66 激活时出了一些问题，ISM 被再一次用到了推迟的 [BIP65](https://github.com/bitcoin/bips/blob/master/bip-0065.mediawiki) 的激活中。这一次就没有再出问题了。

### **[2016] BIP9 versionbits：BIP68/112/113 相对锁定时间激活**

[BIP9](https://github.com/bitcoin/bips/blob/master/bip-0009.mediawiki) 提出了一种新的激活机制来解决 ISM 的几个问题：

- **没必要地惩罚矿工**：ISM 激活会导致区块版本号递增，没有递增版本号的矿工所生产的区块就会被当成无效的，即使这个区块并没有违反软分叉的其它规则。举个例子，在 2015 年7 月 4 日的链分裂中，所有的交易都遵守软分叉规则 —— 这些矿工损失 50 万美元的唯一理由就是升级要求区块头里应该包含一个 ` 3  ` 而没升级的矿工使用了 ` 2 ` 。
- **很难并行化**：使用 ISM，即使开发者认为有必要，也必须等待一个分叉结束，另一个分叉才能开始收集信号。
- **不允许失败**：ISM 不设过期时间。等待激活信号的节点软件一旦放出，运行了新软件的节点就会一直监控信号，直到激活完成。没有办法确定人们是不是完全不需要这个软分叉。
- **不可预期的激活时间**：无法提前知道确切的激活时间，意味着协议开发者、商户系统管理员以及矿池运营者，都很难在激活之后短时间内立即投入使用，即使出现了需要快速反应的问题。

BIP9 versionbits 尝试解决这些问题。它将区块头内的 vision 字段用作 bit 字段。这个字段里面的数据只用来表示信号 —— 不会被当成无效区块的依据 —— 并且可以并行地设置。测量每 2016 个区块运行一次，以压缩某一小部分算力足够幸运便能冒充 95% 支持的可能性。最后，当达到了 95% 的信号门槛，激活之前会有额外的 2016 个区块（约两周）的 “锁定期”，以便各方准备升级。如果过期时间之前未能达到激活的门槛，整个软分叉的尝试就结束，没有用上的代码可以在后来的软件版本中删除。

这个激活方法第一次使用是在 [BIP68](https://github.com/bitcoin/bips/blob/master/bip-0068.mediawiki) 共识强制的序列号、[BIP112](https://github.com/bitcoin/bips/blob/master/bip-0112.mediawiki) ` OP_CHECKSEQUENCEVERIFY ` 以及 [BIP113](https://github.com/bitcoin/bips/blob/master/bip-0113.mediawiki) 中位时间定义的 nLockTime 的软分叉中。这个分叉很快进入了锁定阶段，然后自动进入了激活阶段。

### **[2016-7] BIP9、BIP148 以及 BIP91：BIP141/143 隔离见证激活**

隔离见证软分叉是用 [BIP9](https://github.com/bitcoin/bips/blob/master/bip-0009.mediawiki) 激活参数发布的。少数矿工很快地表示了支持，但支持率远低于 95% 的门槛。一些比特币用户认为矿工是在不合理地拖延一个有用的新特性，所以开发出了自愿的激活措施，就是 [BIP148](https://github.com/bitcoin/bips/blob/master/bip-0148.mediawiki)。BIP148 的最终形式指定，从某个日期开始，拒绝一切不支持 segwit 的区块，

实现 BIP148 的软件出现后，网络中就有了三类节点 —— 不升级的节点，BIP9/141 节点，以及 BIP148/141 节点 —— 陷入共识错误的几率更大了。如果矿工没有支持隔离见证，而大部分用户都继续把这些区块当成有效的，BIP148 的用户可能就会收到在其他用户看来无效的比特币。此外，如果大部分用户都支持 BIP148，但矿工继续生产许多在 BIP148 看来无效的区块，那些不实行 BIP148 的用户就会接受 BIP148 用户认为无效的比特币。只有用户都遵守同样的规则，且大部分算力都支持 BIP148 规则，升级才是安全的。

一种降低风险的办法是，给出足够的时间，让用户可以升级到强制激活隔离见证的节点，但 BIP148 无法做到这一点，因为它的目标是触发现有的 BIP9 流程，也就意味着，它要在 BIP9 到期日很久以前就强迫矿工发信号表示支持。作为 BIP148 可能不得人心的替代方案，[BIP149](https://github.com/bitcoin/bips/blob/master/bip-0149.mediawiki) 提议给用户多一年的时间来升级。BIP149 从未获得足够多的公开支持，但它是第一个使用 [BIP8](https://github.com/bitcoin/bips/blob/master/bip-0008.mediawiki) 的提案，而 BIP8  在未来几年里引发了更多的讨论。

在 BIP148 开始获得重大的公开支持时，多个矿工、交易所和业界人士表示支持一个两步骤的提议，在激活隔离见证的同时会与支持 BIP148 的节点保持共识。第一个步骤写在 [BIP91](https://github.com/bitcoin/bips/blob/master/bip-0091.mediawiki) 中，它改进了 BIP9 的规则。矿工可以使用 BIP9 的位字段来表示他们是否会实行一个暂时的规则：拒绝一切不发信号支持 BIP141/143 隔离见证的区块。与 BIP9 不同，BIP91 的阈值从 95% 降到了 80%，而其监控和锁定期的长度从 2016 个区块降低到了 336 个区块。

BIP91 锁定并且激活了。随后，BIP141/143 锁定并激活。在它们锁定时，BIP148 的强制支持措施过期。

这个来自矿工、交易所和业界人士的提议的第二个阶段需要一个硬分叉，在遭到大量个人用户和企业的激烈反对之后，提案的签名人撤回了这个提议。

至今，人们仍然在争论，这些事件以及同期发生的其他事件，到底为隔离见证激活造成了多大的影响。

## 紧急激活

不止一次，人们在共识代码中发现了严重的漏洞，开发者没有经过激活的流程就放出了补丁。这样做可能导致共识失败，但也为升级的节点立即消除了漏洞。重大的事件包括：

- **使用 chainwork 来替换高度（2010 年 7 月）**：比特币一开始认定最多区块的链（“最长链”）为有效的链。如果每个区块都有同样的难度，那这样的最长链同时也会是积累了最多工作量证明的链。但是不同的区块有不一样的难度，所以 [chainwork](https://github.com/bitcoin/bitcoin/commit/3b7cd5d89a226426df9c723d1f9ddfe08b7d1def#diff-608d8de3fba954c50110b6d7386988f27295de845e9d7174e40095ba5efcf1bbR1229) 软分叉在 [Bitcoin 0.3.3](https://bitcointalk.org/index.php?topic=570.0) 中放出，将累积最多工作量证明的链视为有效链。
- **消除绕过脚本的 bug（2010 年 7 月）**：比特币一开始将花费 UTXO 的脚本（scriptSig）和保护 UTXO 的脚本（scriptPubKey）结合起来、同时求值。这种设计使得人们可以在锁定机制计算之前就终止脚本，以成功状态退出，例如，在运行 ` OP_CHECKSIG `  以检查签名之前就终止脚本。这个 bug 最初[被报告为](https://bitcoin.stackexchange.com/questions/38037/what-is-the-1-return-bug) 使用  ` OP_TRUE OP_RETURN `  的 scriptSig 可以花费任何人的比特币。这个漏洞在 [Bitcoin 0.3.6](https://bitcointalk.org/index.php?topic=626.msg6490) 中第一次[修复](https://github.com/bitcoin/bitcoin/commit/a75560d828464c3f1138f52cf247e956fc8f937d#diff-27496895958ca30c47bbb873299a2ad7a7ea1003a9faa96b317250e3b7aa1fefR175)，办法是让  ` OP_RETURN `  必定以失败收场，而且为脚本的其它显示安排了数字。虽然所有这些变更都是软分叉，但相同代码的修改（后来移除某些限制）也会造成[硬分叉式的更改](https://github.com/bitcoin/bitcoin/commit/a75560d828464c3f1138f52cf247e956fc8f937d#diff-27496895958ca30c47bbb873299a2ad7a7ea1003a9faa96b317250e3b7aa1fefR113-R116)。即使是这么重大的变更，scriptSig 可以篡改 scriptPubKeys 运行的底层问题仍然存在，所以[第二次软分叉](https://github.com/bitcoin/bitcoin/commit/6ff5f718b6a67797b2b3bab8905d607ad216ee21#diff-27496895958ca30c47bbb873299a2ad7a7ea1003a9faa96b317250e3b7aa1fefL1135)在 [Bitcoin 0.3.8](https://bitcointalk.org/index.php?topic=696.msg7364#msg7364) 中实现，它让两者独立执行。
- **修复溢出漏洞（2010 年 8 月）**：某人创建了一笔交易来花费 0.5 btc 并创建了两个价值 92,233,720,368.54277039 BTC 的输出。比特币的确要求输出的数值不能大于输入的数值，但检测方法是把输出的数值加入到一个最多能表示  9,223,372,036,854,776 聪（约 9200 万 btc）的 64 位整数中，这个整数溢出后就会从 -9,223,372,036,854,776 聪开始。这就意味着，这个交易似乎只花费了总计 -0.1 btc。这还绕过了另一条规则，就是禁止单个为负的输出，但是不禁止总计为负的数值 —— 因为它假设了任何正值的总和都仍会是正的。这使得某人创造出了 1840 亿 btc，而且这样的把戏可以不断重复，没有任何代价，产生无数的比特币。几个小时内，[Bitcoin 0.3.10](https://bitcointalk.org/index.php?topic=827.0) 放出了一个软分叉[补丁](https://github.com/bitcoin/bitcoin/commit/2d12315c94f12d62b2f2aa39e63511a2042fe55d#diff-506a3b93711ef8e9623d329cf0a81447492e05867d2f923c6fa9fcffeca94f35R479)，限制输出为 2100 万 btc。它还要求放弃带有溢出交易的链 —— 这是有意制造的共识失败，但为了比特币仍然有意义就必须这么做。
- **临时修复 BDB 锁定问题（2013 年 3 月）**：2012 年初，比特币开发者[意识到](https://github.com/bitcoin/bitcoin/issues/925)，如果同时对 UTXO 数据库（链状态）做太多更改，可能会超出链状态数据的默认容量限制之一。因为当时的比特币区块比较小，只有在区块链重组、需要同时处理来自多个区块的交易时才会观察到这个情形。当时人们实现了一个简单的[解决方案](https://github.com/bitcoin/bitcoin/pull/930)：在重组期间，一次只处理来自一个区块的交易。后来，一些人开始[请求矿工](https://bitcointalk.org/index.php?topic=149668.0)把可选的默认区块大小从 250 KB 提高。在 2013 年 3 月 12 日，某个矿工生产了一个[约 1 MB 的区块](https://buildingbitcoin.org/bitcoin-dev/log-2013-03-12.html#l-229)，包含了超过 1700 笔交易 —— 也是截至当时最大的比特币区块 —— 在许多节点上都超过了数据库的容量，导致它们认为这个区块时无效的，即使它完全符合比特币的明示的共识规则。把水搅得更浑的是，一个新版 Bitcoin Core 已经发布，它用上了不一样的数据库引擎，没有这种限制，因此也能安然地接收这个更大的区块  —— 所以不同版本的节点之间出现了共识错误。在快速分析了情况之后，开发者鼓励用户暂时降级到旧版本（会拒绝掉这个大区块的版本），然后更新到一个[紧急版本](https://bitcoin.org/en/release/v0.8.1)，以软分叉暂时将区块大小的上限降到 500 KB，好留出时间让每个用户都能升级新的数据库引擎，而这种暂时的下调会在几个月之后自动过期。

## 未来的激活

Segwit 激活几个月出现问题之后，一些人开始考虑 [BIP8](https://github.com/bitcoin/bips/blob/master/bip-0008.mediawiki)。BIP8 的支持者们认为它能解决 BIP9 的一些问题：

- **允许强制激活**：BIP8 是 BIP148 的一般化，矿工可以在等待激活的时间段里自愿发信号表示支持，但它还设了一个最后通牒时间段，矿工在这段时间里必须发信号表示支持，否则所生产的区块就有可能变作无效的。后来，人们设计了一个参数 ` LockinOnTimeout ` （LOT）来触发这种动作：使用 `  LOT=true ` 的节点，会要求矿工在激活即将超时的最后一段时间里发出信号；使用 ` LOT=false ` 的节点，不会这么要求，但如果有足够多的区块带有信号，仍然会实行新规则。
- **使用高度而非时间**：BIP9 开始和停止监控激活信号的时间都基于矿工写入区块的时间的平均值。所以矿工是有可能操控这个时间的，这会阻碍 `  LOT=true ` 的功能，所以 BIP8 提议使用区块高度而非时间。

BIP8 的灵活性使其成为了 [taproot](https://bitcoinops.org/en/topics/taproot/) 软分叉的[多种候选激活提案](https://en.bitcoin.it/wiki/Taproot_activation_proposals)之一，虽然批评者也批评了它的某些方面，比如某些设置[允许矿工拒绝激活](https://lists.linuxfoundation.org/pipermail/bitcoin-dev/2021-February/018498.html)得到广泛社区支持的提议、鼓励一个团体 [“俘虏” 另一个团体所用的信号机制](https://lists.linuxfoundation.org/pipermail/bitcoin-dev/2021-March/018595.html)、要求矿工对所生产的区块作[没有实质意义的更改](https://lists.linuxfoundation.org/pipermail/bitcoin-dev/2020-January/017582.html)、看起来给了开发者[凌驾于共识规则的权威](https://lists.linuxfoundation.org/pipermail/bitcoin-dev/2021-February/018380.html)以及[提高了共识失败的风险](https://lists.linuxfoundation.org/pipermail/bitcoin-dev/2021-March/018723.html)。截至本文撰写之时，taproot 激活方法的讨论仍在进行。

其它想法也一直在讨论，包括 “概率性的软分叉激活（[sporks](https://bitcoinops.org/en/newsletters/2019/02/05/#probabilistic-bitcoin-soft-forks-sporks)）”、“多阶段软分叉激活（[MSFA](https://bitcoinops.org/en/newsletters/2020/01/15/#discussion-of-soft-fork-activation-mechanisms)）”、“阈值递减型激活（[decthresh](https://bitcoinops.org/en/newsletters/2020/07/22/#mailing-list-thread)）”、“返回硬编码高度或时间的激活（[flag days](https://bitcoinops.org/en/newsletters/2021/03/10/#flag-day)）”，以及 “激活推迟后使用更短信号期的方法（[speedy trial](https://bitcoinops.org/en/newsletters/2021/03/10/#a-short-duration-attempt-at-miner-activation)）”。

## 主要的代码和文档

- [BIP9](https://github.com/bitcoin/bips/blob/master/bip-0009.mediawiki)
- [BIP8](https://github.com/bitcoin/bips/blob/master/bip-0008.mediawiki)

## Optech 新闻和网站相关部分

（很多，略）

## 又见

- [BIP 激活高度、时间和阈值](https://gist.github.com/ajtowns/1c5e3b8bdead01124c04c45f01c817bc)
- [Taproot](https://bitcoinops.org/en/topics/taproot/)

（完）

------

**原文链接:** https://bitcoinops.org/en/topics/soft-fork-activation/
**作者:** Bitcoin Optech

