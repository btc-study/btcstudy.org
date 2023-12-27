---
title: 'AssumeUTXO 项目简介'
author: 'jamesob'
date: '2023/12/27 17:37:49'
cover: ''
excerpt: ''
tags:
- IBD
---


> *作者：jamesob*
> 
> *来源：<https://github.com/jamesob/assumeutxo-docs/tree/2019-04-proposal/proposal>*
> 
> *本文档撰写于 2019 年 4 月。*


> [Bitcoin Core #27596](https://github.com/bitcoin/bitcoin/issues/27596) 完成了 [assumeutxo](https://bitcoinops.org/en/topics/assumeutxo/) 项目的第一阶段，包括了同时使用一个假定有效（assumedvalid）的链状态快照和在后台进行完整验证同步所必需的所有余下变更。它通过 RPC（`loadtxoutset`）使 UTXO 快照可加载，并在链参数（chainparams）中添加了 `assumeutxo` 参数。
>
> 尽管该功能集在[激活](https://github.com/bitcoin/bitcoin/issues/28553)前在主链上都不可用，但这个合并标志着到达了多年努力的顶点。该项目[在 2018 年提出](https://btctranscripts.com/bitcoin-core-dev-tech/2018-03/2018-03-07-priorities/#:~:text="Assume UTXO")并[在 2019 年正式确定](https://lists.linuxfoundation.org/pipermail/bitcoin-dev/2019-April/016825.html)，将显著改善首次接入网络的新的全节点的用户体验。后续合并包括 [Bitcoin Core #28590](https://github.com/bitcoin/bitcoin/issues/28590)、[#28562](https://github.com/bitcoin/bitcoin/issues/28562)和[#28589](https://github.com/bitcoin/bitcoin/issues/28589)。
>
> —— [Optech Newsletter #272](https://bitcoinops.org/zh/newsletters/2023/10/11/#bitcoin-core-27596)

## 摘要

本文为 `assumeutxo` 提议了一种实现和部署计划。AssumeUTXO 使用序列化的 UTXO 集，以持续地减少冷启动一个可用的比特币节点所需的时间，同时保证安全性上的变更是可以接受的。

### 设计目标

1. 为非业余的用户运行全验证节点提供一条现实的大道，
2. 避免显著增加存储负担，并且
3. 不在安全性上作出重大让步。

### 计划

这个特性可以分成两步（或者三步）来部署：

1. 可以创建 UTXO 快照（约 3.2 GB）并通过 RPC 来加载，以取代常规的初始化区块下载（IBD）流程。
   - UTXO 快照将通过 bitcoind 以外的方法来获得。（译者注：“bitcoind” 即 “Bitcoin Core” 程序的后台进程。）
   - 一个硬编码的 `assumeutxo` 哈希值将确定哪个快照被认为是有效的。
   - 快照的异步验证将在加载好之后，在后台运行。这个阶段包含了绝大部分（甚至是全部）需要对现有的验证代码作的变更。（见[这个 PR](https://github.com/bitcoin/bitcoin/pull/15606)）
2. 快照可以通过 bitcoid 来生成、存储和传输。
   - 为了缓解关于 DoS 和存储消耗上的顾虑，节点将存储跨越三个快照（一个当前快照，两个历史快照）的 FEC（前向纠错编码）分割的数据块的子集，预计存储负担约为 1.2 GB。
   - 冷启动的节点（在启用 assumeutxo 的时候）会从多个对等节点处获得这些数据块，重新组装成一个快照，然后加载。
   - 硬编码的 assumeutxo 数值将从一个内容哈希值转变成一个默克尔根值，该根值承诺一个特定快照的数据块集合。
   - 我们可能会考虑为本地节点存储添加一个滚动的 UTXO 集哈希值，从而更快地访问预期的 UTXO 集的哈希值，而且可能可能会使用这个数值来形成 assumeutxo 承诺。
3. （在遥远的未来）可以考虑在共识中添加给定高度的 UTXO 集哈希值的承诺。这个快照以及后台的验证程序可能会被复用，在我们迁移到对 UTXO 集的更加紧凑的表示形式（比如 [utreexo](https://www.youtube.com/watch?v=edRun-6ubCc)、[UHS](https://lists.linuxfoundation.org/pipermail/bitcoin-dev/2018-May/015967.html) 或者[累加器](https://eprint.iacr.org/2018/1188)）的时候。

如果有什么部分难以理解，请继续阅读以了解更多的细节。

现在，你可以帮助审核这个提议以及代码草稿。

**资源**

- Github issue：[bitcoin/bitcoin#15605](https://github.com/bitcoin/bitcoin/issues/15605)
- 阶段 1 的实现草稿：[bitcoin/bitcoin#15606](https://github.com/bitcoin/bitcoin/pull/15606)

**已经熟悉这些想法了？**

如果你一直在跟踪相关的讨论、已经理解了 `assumeutxo` 的基本原理，你可以直接跳到下文的 “安全性” 章节。

**致谢**

我希望对帮助这个提议的人们表示感谢，虽然他们不应该为我在这份文档以及相关的代码中可能犯的任何愚蠢的错误负责。他们是：

Suhas Daftuar、Pieter Wuille、Greg Maxwell、Matt Corallo、Alex Morcos、Dave Harding、AJ Towns、Sjors Provoost、Marco Falke、Russ Yanofsky，以及 Jim Posen。

## 基本原理

### 什么是 UTXO 快照？

“UTXO 快照” 是在区块链的某个特定高度上的 “未花费的交易输出（UTXO）” 集合的一个序列化版本。这些序列化的 UTXO 会被打包并带上一些元数据，例如：

- 本快照所包含的 UTXO 的总数量
- 本快照所浓缩的最新区块的区块头（其 “基础”），

等等。你可以在 [assumeutxo pull request](https://github.com/jamesob/bitcoin/blob/utxo-dumpload-compressed/src/validation.h#L827-L881) 中看到完整的数据结构（形式可能会变化）。

### 什么是 `assumeutxo`？

它是嵌入软代码中的一片数据，承诺了一个序列化的 UTXO 集的哈希值，这个 UTXO 集被认为是在特定区块高度下形成的真实集合。这个承诺的最终形式还有待讨论，因为生成它要耗费大量的计算，而且它的结构也会影响我们如何存储序列化 UTXO 集合以及在对等节点间传输它。但当前来看，它就是使用现有的 [`GetUTXOStats()` 功能](https://github.com/bitcoin/bitcoin/blob/91a25d1e711bfc0617027eee18b9777ff368d6b9/src/rpc/blockchain.cpp#L944-L981)所生成的 UTXO 集内容的一个基于 SHA-256 的哈希值。

### 那么，它有什么用呢？

我们可以使用 UTXO 快照以及 `assumeutxo` 承诺，从而极大地减少冷启动一个可用的比特币节点所需的时间，并且其安全模式是可以接受的。

当前，初始化区块下载程序所需花费的时间会随着区块链历史的增加而线性增加。不管在哪里，一个新安装的 bitcoind 总要花费至少 4 个小时甚至几天来走完流程，具体时间取决于你的硬件和网络带宽。这个过程会劝退想要运行全节点的用户，促使他们转向安全模式更差的客户端。

### 快照加载是怎么实现的？

在加载一个快照的时候，这个快照会解序列化、变成一个完整的链状态（chainsate）数据结构，该数据结构包含了对区块链（`chainActive`）的一种表示以及 UTXO 集（既存放在硬盘中，也缓存在内存中）。加载快照所得的 chainstate 会跟加载快照之前的原 chainstate 同时存在。在接受一个被加载的快照之前，必须先从对等节点网络中检索得到一条区块头链，并且该区块头链应该包含该快照所压缩的最新区块（其 “基础”）的区块哈希值。

加载好快照之后，快照 chainstate 会执行初始化区块下载，从快照状态开始，一直下载的网络的链顶端。然后，系统将允许操作，就像 IBD 已经完成了一样，并且这个假定有效的快照 chainstate 会被视为 `chainActive`/`pcoinsTip`/等等。

在快照 chainstate 追上网络的链顶端之后，原来的 chainstate 会在后台恢复因为加载快照而中断的区块初始化下载。这个 “后台验证” 流程跟激活的（快照）chainstate 是异步的，所以系统可以如常服务（比如，运行钱包操作）。这个后台验证的目的是检索所有的区块文件并完全验证整条链，直到快照的起点（即其 “基础” 高度）。

在后台验证完成之前，我们会拒绝加载任何 `bestblock` 标记低于快照基础高度的钱包，因为我们没有执行重新扫描所需的区块数据。

一旦后台验证完成，我们就可以丢弃原先的 chainstate，因为快照 chainstate 已经被证明是完全有效的了。如果因为某些原因，后台验证产生了一个 UTXO 集哈希值，跟快照所声称的不同，我们会给出明确的警告并使程序停止运行。

## 安全性

### 引入 `assumeutxo` 是否改变了安全模型？

如果我们讨论的是用户是否需要在辨别什么是 有效的/无效的 比特币状态时信任某一些开发者（及其程度），那么：不，使用 assumeutxo 并不会在实质上改变现在比特币 “信任开发者” 的程度。

现在，比特币软件也带有硬编码的 assumevalid 数值。这个数值定义了，如果你在区块头链上看到了某个区块，那么该区块以前的区块的签名检查就可以全都跳过，作为一种性能优化措施。

> 使用 “assumevalid” 模式，你假设平等审核你所用软件的人可以运行一个全节点、验证所有区块直至（包括）某一个区块。并不需要进一步信任（假设）平等审核你所用软件的人懂得这个软件的编程语言、懂得共识规则；实质上，可以说需要的信任更少了，因为 *没有人* 完全懂得 C++ 这样的复杂语言，而且 *没有人* 可能懂得公式规则的每一种可能的细微差异 —— 然而，几乎每个懂技术的人都可以使用 `-noassumevalid` 启动一个节点，并等待几个小时，然后检查 `bitcoin-cli getblock $assume_valid_hash` 所返回的 `"confirmations(确认次数)"` 字段不为 `-1`。
>
> *David Harding*

Assumeutxo 的想法也是类似的，而且会以一种更严格的方式来指定（不能通过 CLI 来指定）。硬编码的 assumeutxo 数值将以跟 assumevalid 数值完全相同的方式得到提议和审核（通过 pull request），而且会在提议和合并之间留出足够长的时间，从而让任何感兴趣的人可以自己重新生成相同的数值（即验证）。

### 但是，代码中的这个哈希值假设了某一个链状态的有效性，岂不就像开发者在决定 “正确的链” 是哪一条？

这个数值跟开发者所提议的其它任何代码变更没有区别；实际上，在另一个更加模糊的代码部分中偷藏某种实现了扭曲的有效性的反向逻辑，会容易得多，比如， `CCoinsViewDB` 可以修改成在某些特殊条件下总是承认一笔钱的存在性，或者网络也可以修改成仅跟特定的对等节点沟通。

assumevalid/assumeutxo 数值的无遮掩特性，实际上让用户的参与更加直接，因为如何审核这种优化是显而易见的。

同样值得指出的是，存在 assumevalid/utxo 数值并不阻止其它链被认为有效，它只是说 “软件以前验证过 *这一条链*”。

### 好的，那么，也许在理论上存在某种等价，但 assumeutxo（与 assumevalid 相比）有任何 *实际上* 的安全性差异吗？

是的，两者有一个实践上的安全性差异。当前，如果我想要欺骗别人，让他们认为我拥有某一笔钱（而诚实的网络会看穿我），我需要这样所：

- 让他们启动带有坏的 `-assumevalid=` 参数的 bitcoind，
- 将他们的节点跟诚实的网络隔开，从而阻止他们看到具备最多工作量证明的区块头链，然后
- 构造一条具备有效 PoW 的链（兼容现有的[检查点](https://github.com/bitcoin/bitcoin/blob/91a25d1e711bfc0617027eee18b9777ff368d6b9/src/chainparams.cpp#L146-L160)），并且在最后一个检查点之后的某个区块中，将一笔资金分配给我

这显然要付出许多精力，因为攻击者需要生产一条具备有效 PoW 的区块链。

然而，在 assumeutxo 中，只要我让用户接受一个恶意的 `assumeutxo` 成熟数值，大部分工作就完成了。修改和序列化错误的 UTXO 快照是非常简单的 —— 并不需要工作量证明。

### 这听起来非常糟糕 —— 所以攻击者所需的不过是让一个用户接受一个坏的 assumeutxo 数值，然后给 TA 提供一个污染过的快照就好了？

没错，确实如此。

因此，assumeutxo 数值需要嵌进源代码中，并且我们不会开发一种通过运用命令行来指定 `assumeutxo` 数值的机制了；这在实践中的风险太高了。如果用户希望指定另一个数值（不推荐这样做），他们可以修改源代码然后重新编译。

### 听起来这是要主张在某个地方（比如说区块头）包含一个对 assumeutxo 数值的承诺，从而让共识可以保证它。我们应该这么做吗？

也许未来可以这么做，但不是现在。在我们获得使用 UTXO 快照的实际经验之前，我们不知道正确的承诺结构是什么样的。改变共识是一个非常昂贵的过程，而且除非我们绝对确定希望承诺它，不然就不该尝试。

沿着这条路一直走下去，也许我们会在共识关键的地方引入这样的承诺，但目前，我们应该将 assumeutxo 设计成不需要这样的假设也是安全的。

### 对导入的快照，除了比较它的哈希值与 `assumeutxo` 数值，我们还会运行别的验证吗？

是的。在 UTXO 快照加载完成、同步到网络的链顶端之后，我们会在后台运用单独的数据结构（即一个单独的 chainstate）启动一次初始化区块下载。这个后台的 IBD 会一直下载和验证所有区块，直至被快照假设有效的最后一个区块（即该快照的 “基础”）。

一旦后台的 IBD 完成，我们就验证完了在我们加载快照时候假定有效的所有历史区块。然后，我们就可以丢弃后台验证后得到的 `chainstate` 数据了。

## 资源使用情况

### 我们用在后台 IBD 中的额外 chainstate，不会占用额外的硬盘空间和内存吗（它会使用单独的数据库和缓存）？

没错，因为我们要维护两个完全独立的 UTXO 集，以支持后台 IBD（这会同时使用快照假定有效的链条以及快照基础高度后的链条），我们必须拥有一个额外的 `CCoinsView*` 层级。这意味着要在硬盘上临时保存一个额外的 `chainsate`（leveldb）目录，而且需要根据每个 `-dbcache` 分割内存、分配给需要放在内存内的 UTXO 缓存。

我不认为这是一个很大的问题，因为这基本上意味着（在当前来说）额外的 3.2GB 的存储空间。我们可以按照大约 80/20 的比例给 后台 IBD 所用的 `CCoinsViewCache` vs. 假定有效的 `chainActive` 分配指定的 `-dbcache` 内存，因为可调节大小的 dacache 仅在 IBD 期间才提供了重大的性能好处。

### 我们还应该运行后台验证同步吗？如果我们接受了 assumeutxo 的安然模式，为什么还要执行后台 IBD？IBD 不是一个长期的扩展问题吗？道理在哪？

如果我们引入 assumeutxo 和快照而不在后台运行 IBD，那么容易想象几乎每个建立节点的人都会使用 UTXO 快照（因为它比传统的 IBD 快得多）、假定某一段区块链是有效的，然后将自身作为剪枝节点（pruned node）呈现给网络。在极端情况下，这将导致缺乏节点为网络提供历史区块。这显然不是我们想要的，因此，将后台 IBD 作为默认设置似乎是有意义的。

硬件受限的用户无疑可以在剪枝模式下使用 assumeutxo 。

Assumeutxo 是一项性能优化。如果我们移除 IBD 模式、换成它，就改变了比特币的安全模型。在未来，我们可能会分割区块下载与 连接/验证 程序，从而 assumeutxo 节点依然可以为对等节点提供区块，而无需花费计算资源来执行 IBD 式的验证。

### 用户和审核者该如何高效地验证给定一个 UTXO 集的哈希值？

当前，计算特定高度的 UTXO 集的哈希值可以使用 `gettxoutsetinfo` RPC 命令来做到（即 `GetUTXOStats()`）。这会花掉几分钟来计算；如果你要对某一个具体的高度计算这个值，你需要调用 `invalidateblock` 来回滚到那个高度；计算完成后，你可以使用 `reconsiderblock` 快速切换回来。显然，这会打断正常的操作。

这不方便，但我们可以修改 `gettxoutsetinfo` 的行为，使之可以接受一个高度作为参数，然后至少抽象掉通过 `invalidateblock/reconsiderblock` 手动回滚和切换的过程。

未来，可以想象我们可以使用一个节点本地的[滚动 UTXO 集哈希值](https://lists.linuxfoundation.org/pipermail/bitcoin-dev/2017-May/014337.html)以让特定高度的 UTXO 哈希值随时可用。但是，滚动的 UTXO 集哈希值跟 assuemeutxo 承诺方案是不兼容的，因为后者涉及到分块快照（下文有述），并且因此最终的 assumeutxo 值可能必须是 `(rolling_set_hash, split_snapshot_chunks_merkle_root)` 这样的元组。

（未完）
