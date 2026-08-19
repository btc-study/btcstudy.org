---
title: 'SuperScalar 实现报告'
author: '8144225309'
date: '2026/08/19 15:42:17'
cover: ''
excerpt: 'SuperScalar 协议让许多自主保管的闪电客户端共享同一个链上的 UTXO。本文报告的是一个开发中的实现。'
tags:
- 通道工厂
---


> *作者：8144225309*
> 
> *来源：<https://delvingbitcoin.org/t/superscalar-an-implementation-report/2705>*




SuperScalar 协议让许多自主保管的闪电客户端共享同一个链上的 UTXO，不需要软分叉（共识变更）也不需要对协调者 LSP 的信任。这是 [@ZmnSCPxj](https://delvingbitcoin.org/u/zmnscpxj) 的[设计 “使用伪 Spiman 叶子的 SuperScalar”](https://delvingbitcoin.org/t/superscalar-laddered-timeout-tree-structured-decker-wattenhofer-factories-with-pseudo-spilman-leaves/1242)（下文称为 “t/1242”），本文报告的是一个开发中的实现。

下文说的所有过程都运行在 regtest 或者 signet 上。还没有外部审计，主网运行有意隐藏在一个显式的 `--i-accept-the-risk` 标签之后。

代码（C 语言、MIT 协议，已发布 [v0.2.0 版本](https://github.com/8144225309/SuperScalar/releases/tag/v0.2.0)）见[此处](https://github.com/8144225309/SuperScalar)。其中包含四个二进制文件：`superscalar_lsp`、`superscalar_client`、`superscalar_watchtower`、`superscalar_bridge`。

## 如何构造一个通道工厂

一个通道工厂是一个 P2TR 类型的注资 UTXO，其内部公钥是一个 MuSig2 聚合公钥，来自一个 LSP 及其至多 127 个客户端（包含 LSP，总计 128 个签名人）。（注资工厂对应着一棵超时树）每一层的每一个输出，都只能由容身于其中的所有人的聚合签名来花费，所以没有任何一个参与者子集（包括 LSP）能够移动并非自己所有的资金。甚至通道工厂的超时机制也偏向客户端而非 LSP（分配交易，详见下文）。这里没有 “至少一个诚实参与者” 假设：从一个客户端进入一个通道工厂的时刻起，其资金的安全性都取决于其自己的密钥以及共识执行的时间锁，而不是 LSP 或任何客户端同僚的正直。[t/1242 ](https://delvingbitcoin.org/t/superscalar-laddered-timeout-tree-structured-decker-wattenhofer-factories-with-pseudo-spilman-leaves/1242) 的机制，从上到下看是这样的：

最小的标准规模是这样的：8 个客户端，超时树的叉数为 2，每个叶子是 k=2 的伪 Spilman 子工厂，，这就是 ZmnSCPxj 的 t/1242 的标准形状。本实现所推出的默认形式是一个客户端占据一个叶子， k=1；“L” 代指 “LSP”：

（译者注：代码框中的中文注释为译者所加）。

```
funding UTXO  =  MuSig2(A..H, LSP) // 注资 UTXO，其内部公钥为所有参与者的聚合公钥
   |
kickoff_root     (n-of-n, no timelock) // n-of-n 多签名，不设时间锁
   |
state_root       (DW, decrementing nSeq) // Decker-Wattenhofer 机制，使用递减的 nSeq 来推进状态
   |
   +-- leaf_1  (A-D)  // 叶子_1，容纳用户 A ~ D
   |    +-- A&B&L or L&CSV -> A-L, B-L // 该输出要么由 A、B、L 共同花费，要么由 L 在时间锁解锁后花费；该输出又产生两个输出，分别为 A 与 L 的通道和 B 与 L 的通道。
   |    +-- C&D&L or L&CSV -> C-L, D-L
   |    +-- A&B&C&D&L or L&CSV -> L-stock // L 的储备资金
   +-- leaf_2  (E-H)
        +-- E&F&L or L&CSV -> E-L, F-L
        +-- G&H&L or L&CSV -> G-L, H-L
        +-- E&F&G&H&L or L&CSV -> L-stock
```

**Decker-Wattenhofer 内部结构**。在原设计中，`kickoff` 和 `state` 层交替出现，并且状态交易携带递减的 `nSequence`（更新的状态交易的 `nSequence` 数值总是更小）。本实现的形式的灵感来自设计的树构造指引：叉数逐层增加（`--arity 2,4,8`）、`kickoff` 只放在 *静态的临近树根* 的层级中。本实现的开发者拒绝任何其最坏退出情形用时会超过 BOLT 所规定的 CLTV 限值（2016 个区块）的形状。一个普通的二叉树，在搭配 128 个签名人时会超过这个限制（需要大约 3456 区块）；混合叉数加上两个静态层级，可以将用时压缩到大约 864 个区块。

**超时树，以及反转的超时默认动作**。每一个状态交易输出都可以被 N-of-N 的密钥路径花费，或者在超时后被 LSP 独自花费：`or(N-of-N, L&CLTV)` 。在超时的时候，默认动作偏向客户端：临近过期，所有人会联合签名一笔 “分配交易”，返还每个客户端的资金，并且每个参与者都有副本。LSP 的后台程序会在通道工厂过期时自动广播它，如果状态更新次数用完，还会提早广播；客户端可以用自己的退出路径广播完全一样的交易，所以双方都可以启动它。本实现用到的 CLN 插件就是做这件事，它会持有这笔交易，并在 `expiry_block` 广播它（即使经历过重启）：[`9f3e0829`](https://mempool.space/signet/tx/9f3e082943b4133261525d6e98137317535365c8f49f0535c4ae059ac9050997) 。通道工厂也可以原地刷新，整棵树使用更晚的 CLTV 重新签名，没有任何人需要退出到链上，也无需迁移。

**伪 Spilman 叶子**。在原设计中：一个 k 叉的树会形成 k 个子工厂，每个子工厂由 k 个客户端组成，卖出流动性的动作会链接一笔交易到子工厂的输出，而不是递减 `nSequence` 。所以花费一个叶子的动作没有 CSV 预算，也没有旧状态需要撤销。本实现则添加了一个重复签名保护，从而没有签名人会被诱骗为同一级链条的两笔不同花费签名：每个签名人会记录自己给出的碎片签名，并拒绝为已经签名过 `(parent_txid, parent_vout)` 的冲突交易签名；这种拒绝在客户端重启后也能实施，因为它会在数据库中持久化存储。欺诈驱动程序会在重启以及区块链重组后操练这个动作。

> 译者注：“Spilman 通道” 是一种单向通道，扮演支付者的一方可以多次向收款方支付，但无法单方面结算通道；收款方在时间锁到期之前负责用最新状态结算通道。SuperScalar 的伪 Spilman 设计应用在 LSP 的自有资金上（即上面代码框中的 L-stock），每当花费这笔资金（意义是为用户提供流动性），都是用一笔交易来花费剩余资金，而不是改变整个子工厂的状态。

**筑梯法**。刷新工厂是最重要的仪式：它可以异步运行、等待客户端就绪（在 127 个客户端上已证明可行）；并且，如果用尽了通道工厂的状态更新次数，也可以启动一个专门的仪式来重新签名每一个叶子。超时时候的大规模退出不会变成 N 方的手续费竞赛。分配交易会一次性返还所有人的资金；并且，因为筑梯法错开了各个通道工厂的到期时间，退出活动不会挤在同一个区块中。

**叶子内部：普通的闪电通道**。每个叶子都是一个普通的 BOLT -2/3 Poon-Dryja 通道，可以支持 HTLC ； PTLC 支持已经搭建完成，但尚未启用。每一次撤销承诺交易都使用独立的扁平秘密值，如 ZmnSCPxj 在 [t/1143 #34](https://delvingbitcoin.org/t/superscalar-laddered-timeout-tree-structured-decker-wattenhofer-factories/1143/34) 的指引。流量和连接都是标准的：BOLT -8（使用Tor/SOCKS5）、BOLT #2/#4/#11 以及 #12 offer 消息、LSPS0/1/2，MPP（多路径支付）。

其余部分按照原设计实现：k<sup>2</sup> 个子工厂叶子（可选）、静态的临近的树根的层级，在一个 JIT（按需）操作未完成时省去（cut-through）它，都来自 [t/1242](https://delvingbitcoin.org/t/superscalar-laddered-timeout-tree-structured-decker-wattenhofer-factories-with-pseudo-spilman-leaves/1242)。 承载仪式的消息（MuSig2 回合、仪式中止、更新次数用尽时候的绑定时重签名、注资交易被重组的提醒）都还没有规范，它们是前述开发中的规范草案的原始材料。

## 安全性和操作

1. **通过 “投毒交易” 来惩罚旧状态**。如果 LSP 广播一个过时的状态，一笔预先签名的交易会将该状态的 L-stock 都分给客户端，所以发布旧状态会让 LSP 承担损失，超过其收获。投毒交易有一个揭晓的、类似闪电通道的撤销秘密值作为开关，所以只能用来针对已经撤销的状态。它会在状态更新时，在所有四个更新路径上得到联合签名，并且从 L-stock 支出手续费，所以是欺诈者自己资助惩罚。在 signet 上真实广播了一笔投毒交易，将 L-stock 重新分配为了客户端 （21085 聪）：[`d2ae19cf`](https://mempool.space/signet/tx/d2ae19cf39547b7eb69930ef8ad92e3d7f51e683b02cd8643a74d45640d4a4f0)。
2. **签名不会在磁盘上保存 nonce 秘密值**。如果保存了 nonce 秘密值，然后在某次仪式中止、重启、重组的时候复用，签名密钥就会泄露。所以没有任何 nonce 秘密值会被保存下来，如果方案中出现了 nonce 秘密值表，测试会失败。所以，仪式可以干净地中止，在每个阶段都允许崩溃。在 regtest 上通过了 20 轮演练。
3. **手续费是在广播时附加的，不是在签名时决定的**。 每个预先签名的交易都默认携带一个无密钥的、价值 240 聪的 P2A 锚点输出，不论谁广播这笔交易，就自己用 CPFP 子交易来追加手续费；无争议的退出将从其清扫的输出中支出手续费。一个追加手续费的程序会在截止日期之前逐步提高子交易的手续费，直到其硬上限。资金有风险的客户端可以运行这样的程序并追加手续费，任何客户端也都可以运行自己的。LSP 可能会为客户的便利而运行一个，但这是一种信任假设。
4. **处理区块链重组**。如果注资交易被重组，LSP 会通过一种专用的信息来提醒客户端，双方会重设链状态；瞭望塔可以检测前向的重组；要求的确认深度因网络而不同；重组和违规事件都会记录。
5. **上述一切都可以被一个不接触私钥的单独后台程序强制执行**。单独的瞭望塔的数据库只持有结束的、预先签名的响应（最新状态、投毒交易、惩罚、以及对每个 HTLC 的清扫），每一个都可以在私钥还留在内存中的时候就提交给它（瞭望塔）。如果某人控制了这个瞭望塔，最多也只能阻止广播，无法构造出新的交易或读取私钥，因为能够读取私钥的二进制文件与瞭望塔二进制文件毫无关联。一个 `nm` 命令就能确认这一点。

## 在公开网络上实现规模化与互操作

- 在公开的 signet 上完成 127 个客户端的完整生命周期：通过真实的闪电支付形成一个新的通道工厂，并由 128 个签名人合作式关闭，一笔交易花费单个共享的 UTXO，产生 128 个输出：[`d1468287`](https://mempool.space/signet/tx/d1468287a30839962ca849d9b88f3f6442e9d6a357141180a401ce1b4d0dd727)。一台单独的旗舰级设备保持了 127 个独立的客户端后台，在 24 小时的高强度运行中路由了 99 笔支付：[`143471b5`](https://mempool.space/signet/tx/143471b5d1ddc0eee3ea54d74ed17081f24d48f429bb826723c8b0897e55c0e6)。合作是优化，不是强制要求：每个客户端都保留了单方面退出交易，所以安全性从不依赖于 128 个签名人都保持在线。这个工厂运行的是每个客户端一个伪 Spilman 叶子的默认形式；前面代码框中描述的更宽的 k-子工厂 形式是在一次投毒交易广播演习中使用的。
- 一个 *未修改的* `Core Lightning` 节点，对通道工厂一无所知，也不使用 bLIP -56，但是能够通过双向的桥给工厂内的通道支付，也能收取来自工厂内的工厂的支付，在相同的限制之下。所以，工厂的流动性，是现有的闪电网络就能触及的，无需节点作任何修改。
- 一个客户端强行离开一个小型的工厂，手续费率为 1 聪/vB ：三笔交易（[`978f62f6`](https://mempool.space/signet/tx/978f62f662eb1c8180f7c617b4e7ef6a1d30eaf8fb3fb281cc21550a03fdd053)、[`1fbc8f2f`](https://mempool.space/signet/tx/1fbc8f2f7b1fcf470a239c6c8f0f88ef6ab5794c226eb554e17b67b023be1ee4)、[`a28bb6f7`](https://mempool.space/signet/tx/a28bb6f7de7949fe0aaacdbc561f09970592e4b35c3585c4f41d0f7f3b56a223)） ，间隔144 个区块的 CSV 超时时间，得到了确认，退出的输出在整个时间窗口内没有被花费，在区块高度 312510 之后才能花费。
- 我们也运行了一个欺诈驱动器，尝试击败每一层防线：LSP 在树的不同深度广播 过时的状态，在状态计数器滚动期间尝试欺诈、攻击 JIT 通道创建、攻击流动性买卖，以及攻击备份复原，还有一次 HTLC 粉尘竞赛。每一个客户端都会检查能否捕捉到违规行为，我们则观察瞭望塔在重启竞赛和重组之后的动作。
- 状态保存在 SQLite 数据库中，使用额外的带有版本控制的迁移能力（sheema v39）。在上述所有事项之外，还有 1500 个单元测试、regtest 和 signet 套件，以及带有内存消毒的命令行界面以及一个模糊测试器。

还有两个核心事项并未完成：通道拼接程序还没准备好（BOLT-2 连接代码已经就绪，但状态机还没有）；而且 PTLC 支持还未启用（offer 和结算路径已经开发完成，但作废、超时和瞭望塔违规行为防御都还没有）。其它这里讲到的事情都已经开发好并演练过。在外部审计完成之前，不会支持在主网运行。

## 审核

本实现建立在标准的、得到充分理解的原语上：MuSig2 交易树签名、Taproot、CLTV 超时机制、Poon-Dryja 通道。新东西主要是两个机制，也是开始读代码的最佳位置：伪 Spilman 叶子的重复签名防御（也即前文说的持久化到磁盘因此可以一贯执行的拒绝），以及揭晓秘密值的投毒（已在 signet 上证实可用）。承担密码学操作的代码很紧凑：`src/musig.c`（遵循 [BIP-327](https://github.com/bitcoin/bips/blob/c021a5f51ae9d3e71a41eac3dda6dc060fead35d/bip-0327.mediawiki) 无状态流程）、`src/tapscript.c`、`src/channel.c`、`src/noise.c`。自然，下一步就是寻找外部审计。

重复签名防御是所有安全性的以来。伪 Spilman 叶子是不可撤销的，所以唯一能阻止 LSP 确认旧状态的办法就是每个签名人都拒绝联合签名相同父交易（`client_ps_signed_inputs`）的冲突花费，这也是 ZmnSCPxj 在 [t/1143 #16](https://delvingbitcoin.org/t/superscalar-laddered-timeout-tree-structured-decker-wattenhofer-factories/1143/16) 中提议的缓解措施。这种拒绝是持久化的，即使客户端重启、区块重组也不会丢失；最值得检查的地方它是否能在任意的同时进行的仪式的交错中保持完整。

没有钱币的客户端的手续费储备依然是一个开放的设计问题。每一笔追索交易都带有一个无密钥的 P2A 锚点输出，所以任何利益相关人都能运用 CPFP 来追加手续费，只要输出的价值值得追加手续费，无需预先保留资金。拥有外源 UTXO 的客户端可以使用它更快退出。问题在于，没有其它钱币的用户是否需要一笔明确的保证金（就像通道保证金），还是要应该使用 ZmnSCPxj 提出的存款保险构造呢？

筑梯法的节奏和子工厂的运行时间（同时运行多少个工厂、它们的生命周期）在实际部署之前依然难以确定。欢迎 signet 上的运营者：即使是两个客户端的工厂，运行几天，也是有用的证据，并且上面的程序都是独立的。

## 工具

- 实现（C 语言，MIT 协议）：[`github.com/8144225309/SuperScalar`](https://github.com/8144225309/SuperScalar)
- 解释文档：[`superscalar.win`](https://superscalar.win/)。前述每笔交易均有标注，带有区块高度和完整的交易 id ，在[实时的 signet 看板](https://superscalar.win/#deep-dives/signet-exhibition)上。
- CLN 插件（bLIP-56）：[`github.com/8144225309/superscalar-cln`](https://github.com/8144225309/superscalar-cln)，针对一个 CLN 复刻版本的  `blip-56` 分支。
- bLIP -56 草案 PR（ZmnSCPxj）：[`lightning/blips #56`](https://github.com/lightning/blips/pull/56)
- 一个测试用的协调器，自己运行了 36 个多方场景
- 一个只读的操作仪表板（Python 标准库），以及一个 Prometheus 导出器
- LSP 发现： [soup-rendezvous](https://github.com/8144225309/soup-rendezvous)，一个 Nostr 上的有担保 LPS 的种子清单（工厂协议自身并不触及 Nostr）
- 样品钱包（[superscalar-wallet](https://github.com/8144225309/superscalar-wallet)，一个 CLN 应用的复刻）：早期测试版，用于发现、监控和生成演示。本报告中的东西都不依赖于此钱包。
- 一个实验性的限制条款复刻（CTV、Mutinynet）：[`github.com/8144225309/superscalar-ctv`](https://github.com/8144225309/superscalar-ctv) 。使用了 CTV ，就不需要多方交互的仪式了，也没有单工厂的签名人数量限制了。

## 现状

[v0.2.0](https://github.com/8144225309/SuperScalar/releases/tag/v0.2.0)（2026-07-12 发布）实现了 [t/1242](https://delvingbitcoin.org/t/superscalar-laddered-timeout-tree-structured-decker-wattenhofer-factories-with-pseudo-spilman-leaves/1242) 中的机制集合，在 regtest 和公开的 signet 上完成了概念验证。接下来：一个可以总结这个实现的明文规范（连接消息、仪式状态机、记录-拒绝 规则、对区块链重组的应对），以及外部审计。登陆主网排在规范和审计之后。感谢 [ZmnSCPxj](https://delvingbitcoin.org/u/zmnscpxj) 提出这套设计以及给出实现指引。欢迎纠正和批评：可以在此处回复，也可以在库中打开一个 Issue 。