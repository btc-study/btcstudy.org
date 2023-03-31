---
title: 'ZeroSync 路线图'
author: 'RobinLinus'
date: '2023/03/31 11:46:36'
cover: ''
excerpt: '逐步为比特币实现递归型链证据'
tags:
- ZeroSync
---


> *作者：RobinLinus*
> 
> *来源：<https://github.com/ZeroSync/ZeroSync/blob/main/docs/roadmap.md>*



这是 ZeroSync 项目路线图的概述。本文提到的所有内容都有可能出现调整。子目标时常会发生变化，因为我们仍在探索解决方案。或许当你阅读本文时，这里的内容已经过时了。但是，它们起码可以帮助你了解我们目前的前进方向。

> 译者注：根据 2023 年 3 月 30 日提交的 [3e616fa 号更新](https://github.com/ZeroSync/ZeroSync/commit/3e616fa806bd5cdbcc1b6d2cb3018bf6a63f5035)，这份路线图已经过时。译者将在下文适当环节补充新路线图的内容。

## 里程碑 1：assumevalid

[模仿 Bitcoin Core 的“assumevalid”选项](https://bitcoincore.org/en/2017/03/08/release-0.14.0/#assumed-valid-blocks)实现一种链证据。这种模式可以解析区块及其交易，验证链的工作量及哈希链，并正确管理 UTXO 集。它还能验证代币供应量、交易额和交易费。除了签名，它几乎可以验证一切东西。（更准确地说，它能验证非见证数据。）

- ✅ 解析区块头、交易和区块

- ✅ 验证哈希链（区块哈希、区块哈希、默克尔根、交易 ID）

- ✅ 验证链的工作量（工作量证明、中位时间和难度调整）

- ✅ 验证 UTXO 集（Utreexo 累加器和一个提供包含证据的“桥节点”）

- 👷‍♂️含有递归 STARK 的证据链：在当前链证据中验证前一个链证据

## 里程碑 2：度量和优化

度量 *assumevalid* 证明的性能并进行优化，直到它们能够验证比特币脚本为止。

- 👷‍♂️ 用装满交易的区块（例如，3500 笔交易）对 *assumevalid* 证明进行基准测试

- 迄今为止，当前 Cairo 程序验证过的最大区块是[区块 383838](https://blockstream.info/block/00000000000000000e9b42248aa61593ccc4aa0a399b3cb6b50c650f45761c3a)，总计包含 933 笔交易。使用 [cairo-rs-py](https://github.com/lambdaclass/cairo-rs-py) 生成踪迹需要耗费 50 分钟以及 3100 万个执行步骤。

- 不同区块大小的基准

| Commit 哈希 | 区块号 | 交易量 | 步数       | 运行时间 | 证明时间 | 最大 RAM |
| ----------- | ------ | ------ | ---------- | -------- | -------- | -------- |
| 1e614c1     | 100000 | 4      | 92,530     | 0:00:27  | 0:00:12  | 0.69 GB  |
| 1e614c1     | 170000 | 27     | 967,717    | 0:01:48  | 0:01:26  | 1.99 GB  |
| 1e614c1     | 328734 | 49     | 1,513,705  | 0:02:41  | 0:02:44  | 2.85 GB  |
| 1e614c1     | 222224 | 108    | 3,557,542  | 0:05:42  | 0:05:37  | 5.82 GB  |
|             | 383838 | 903    | 31,281,985 | 0:49:00  | 0:46:27  | 46.32 GB |
| 079a79c     | 400000 | 1660   | 64,049,396 | 1:41:59  | 1:25:03  | 94.04 GB |
| 079a79c     | 400002 | 2849   | 79,435,713 | 2:05:06  | 1:30:06  | 118.5 GB |

- 👷‍♂️ 找到性能瓶颈，看是否存在任何阻碍

- 👷‍♂️ 针对瓶颈处进行优化，直到我们能够引入比特币脚本验证为止

> *新路线图内容*：
>
> **提升证明器性能**
>
> 根本的瓶颈在于证明器的性能。需要重大优化。
>
> - 切换成 [cairo-rs 运行器](https://github.com/lambdaclass/cairo-rs)，它会比当前的运行器快得多，因为它使用 Rust 语言写的，而当前我们所用的运行器是用 Python 写的。
> - 为递归验证器使用一种 STARK 友好的哈希函数
> - 为 SHA256 和 secp356k1 实现 [Cairo 内置模块](https://www.cairo-lang.org/docs/how_cairo_works/builtins.html)。以及为位操作（bitwise）、佩德森承诺（pedersen）、椭圆曲线签名算法（ECDSA）、椭圆曲线操作（ec_op）实现剩下的内置模块
> - 使用 [Goldilocks Field](https://github.com/ingonyama-zk/papers/blob/main/goldilocks_ntt_trick.pdf) 以节约内存并提升性能

### 里程碑 3：比特币脚本

实现见证数据验证并完成完整的链证据。

- 比特币脚本
  - 计算签名哈希（ALL、NONE、SINGLE、ANYONECANPAY……）
  - 脚本解释器（实现所有操作码）
- 付款类型
  - 传统：p2pk、p2pkh、p2sh
  - SegWit：p2wpkh、p2wsh
  - Taproot: p2tr、密钥路径和脚本路径花费
- 👷‍♂️ 密码学
  - Schnorr、✓ ECDSA
  - ✓ SHA256、✓ HASH256、✓ SHA1、✓ RIPEMD160、✓ HASH160
- 👷‍♂️ 链验证器
  - ✓ 在[一个简单的网站](https://zerosync.org/)上演示链验证器
  - 支持下载客户端来为 Bitcoin Core 全节点证明链状态目录

实现这个里程碑后，我们只需下载当前 UTXO 集，就可以同步修剪后的全节点。运行一个经过零知识同步（zerosync）的全节点无需修改 Bitcoin Core 的代码。我们会在验证后将 此 UTXO 集复制到 Bitcoin Core 的链状态目录中。理想情况下，我们会将此 UTXO 集与 [AssumeUTXO](https://bitcoinops.org/en/topics/assumeutxo/) 结合逐步推出 ZeroSync，同时仍会使用备份检查来检查验证 🤓。

> *新路线图内容*：
>
> **完整的比特币共识**
>
> 我们还需要实现剩下的比特币共识规则：
>
> - Sighash（ALL、NONE、SINGLE、ANYONECANPAY）
> - 脚本解释器（实现所有的操作码）
> - 所有的支付类型
> - Schnorr 签名验证

## 里程碑 4：强化

为了让我们的链证明系统能够投入实际应用，我们必须彻底测试、审查和强化代码。

- 收集比特币开发者的反馈

- 执行代码审查

- 进行更多测试。使用[静态测试向量](https://raw.githubusercontent.com/bitcoin-core/qa-assets/main/unit_test_data/script_assets_test.json)。另增加模糊测试。

- bug 赏金计划

## 长期愿景：高效执行零知识同步和链扫描

- 默克尔区块头链。为区块链上的所有交易提供紧凑而灵活的包含证据。
- zk-client 可以通过 *区块过滤器* 快速查验一个区块是否与它们有关。
- *致密区块* 可以让 zk-client 仅下载与它们相关的区块部分。 （例如，为了快速扫描区块链，闪电网络节点使用的 zk-block 可以被简化为在单边通道关闭时揭示的哈希原像。）

> *新路线图内容*：
>
> **与生态系统集成**
>
> 逐步为真实的应用推出证明系统：
>
> - 将区块头链证据集成到 Neutrino 这样的轻客户端中
> - 开发一种跟 Bitcoin Core 全节点同步的方法。运行一个经过零知识同步（zerosync）的全节点无需修改 Bitcoin Core 的代码。我们会在验证后将 此 UTXO 集复制到 Bitcoin Core 的链状态目录中。理想情况下，我们会将此 UTXO 集与 [AssumeUTXO](https://bitcoinops.org/en/topics/assumeutxo/) 结合逐步推出 ZeroSync，同时仍会使用备份检查来检查验证
> - 设计一组新的网络消息，让比特币的点对点网络可以分享链证据。

## 未来想法：

- 持有量证明（Proof-of-reserves）/ 紧凑型环签名
  - 例如，证明你能控制价值至少 1 BTC 的输出，但是不揭露具体是哪些输出。
  - 或在所有比特币用户中发起匿名投票，投票权重由他们的质押额决定。
- 支持 Omni、RGB 和 Taro 等 “客户端验证（CSV）” 协议的即时历史验证。
  - 通过交易图混淆增强隐私性。每笔交易都可以是在零知识证明中证明的两个无关 UTXO 之间的转移。
  - 一个带有 zk-VM 的 CSV 协议，从理论上来说能够处理无限量的数据，但是不会导致代币的历史数据膨胀。
- 跨链桥
- 增强闪电网络中路由的隐私性？
- 更长远的愿景：在 Simplicity 语言中验证 STARK（中期愿景：离[在 Liquid 上通过 Simplicity 验证 STARK 的日子不远了](https://www.youtube.com/watch?t=1185&v=i1g9fm6g5Cg)？)
- 支持免信任双向锚定的 STARK 侧链

## ZeroSync 的发展史（按新路线图更新）

- 2022 年 2 月，[Lukas George](https://github.com/lucidLuckylee) 开始研究 [STARK 中继](https://github.com/lucidLuckylee/LightSync)，并以此作为他在柏林工业大学的学士论文选题。在该论文中，他证明了比特币的区块头链。
- [Geometry Research](https://geometryresearch.xyz/) 为此项目提供了资助。
- 2022 年 7 月，[Robin Linus](https://robinlinus.com/) 以开发负责人的身份加入，与 [Lukas George](https://github.com/lucidLuckylee) 一起创立了 ZeroSync，将此项目发展成完整的链证明系统。
- [Ruben Somsen](https://medium.com/@RubenSomsen/snarks-and-the-future-of-blockchains-55b82012452b) 将项目命名为 ZeroSync。
- 2022 年 9 月，Giza 证明程序的开发者 [Max Gillett](https://github.com/maxgillett) 加入团队，帮助实现了 Cairo 语言的 STARK 验证器，用于证据的递归。
- 2023 年 2 月，他们完成了第一个重大里程碑，递归型链证据的一个基本原型，可以验证比特币所有的共识，除了见证数据。
- 2023 年 3 月，[Giacomo Zucco](https://twitter.com/giacomozucco)（RGB 协议的联合作者之一）帮助团队在瑞士成立了 ZeroSync 协会，以成为一个长期的项目。
- StarkWare 的开源活动 [OnlyDust](https://app.onlydust.xyz/projects/92f022a9-dbd8-446f-a2a5-b161ccb4541c) 也为资助本项目的开发提供了一项研究奖金。

（完）