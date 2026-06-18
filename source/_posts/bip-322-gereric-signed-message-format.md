---
title: 'BIP 322：通用的签名消息格式'
author: 'Karl-Johan Alm'
date: '2026/06/18 16:59:28'
cover: ''
excerpt: '既可用于证明资金的可用性，也可以作为资金的目标收款方在消息中承诺发票地址'
tags:
- BIP
---


> *作者：Karl-Johan Alm*
>
> *来源：<https://github.com/bitcoin/bips/blob/master/bip-0322.mediawiki>*
>
> 原文为 BIP 322 “通用的签名消息格式” 的 [4061a54](https://github.com/bitcoin/bips/commit/4061a54418f62a5a1ae44f4604e56373329bfad3) 版本。
>

## 摘要

本文描述了一种可以互操作的签名消息（signed messages）标准，基于 Bitcoin Script 格式，既可用于证明资金的可用性，也可以作为资金的目标收款方在消息中承诺发票地址。

## 动机

当前的消息签名标准只对 P2PKH (`1...`) 发票地址有效。我们提出，使用一种基于 Bitcoin Script 的办法来延展和一般化消息签名标准。这保证了，任何一个钱币，不论它是被什么类型的脚本控制的，在理论上都可以为它签名。为了易于跟现有的硬件签名设备互操作，我们还定义了一种类似于比特币交易的签名消息格式（只不过它包含了一个无效的输入，因此无法在任何真实的网络上花费这笔交易）。

此外，当前的消息签名格式使用 ECDSA 签名，它们并不承诺公钥，所以实际上并没有证明知晓任何一个私钥。（实际上，有效的签名可以被第三方调整，变成特定相关密钥的有效签名）。

在终极意义上，没有消息签名协议能够实际证明资金的控制权，这既是因为签名一旦创建出来就过时了，也是因为私钥的持有者也许愿意代表他人签名消息（哪怕不愿意签名实际的交易）。没有消息签名协议能够解决这些局限性。

最后，本 BIP 只能解决这种应用场景：一个签名人证明自己能够控制发送到某个发票地址上的资金。想要证明一个签名人发送了一笔前序交易，使用本 BIP 是做不到的。

## 术语

在本 BIP 的语境下，“签名（signature）”或类似用词，总是指下述签名流程的输出，并且，取决于 `message_challenge` 的脚本类型，要么是一个完整的交易输入见证堆栈，要么是一笔完整交易或一个 PSBT 包裹，可以用 Bitcoin Script 解释器来验证。这样的 “签名” 可能包含，也可能不包含一个实际的密码学签名（ECDSA 签名或 Schnorr 签名），这取决于 `message_challenge` 所对应的脚本的需要。

## 签名的类型

本 BIP 指定了三种待签名消息（signing messages）的格式：*传统型*、*简单型* 和 *完整型*。并额外定义 *完整型* 格式的一个变种，可以用来证明对一组 UTXO 的控制权。

|                    | 兼容的脚本类型                                           | 签名前缀 | 签名格式                                                  |
| ------------------ | -------------------------------------------------------- | -------- | --------------------------------------------------------- |
| 传统型             | `P2PKH`, `P2SH-P2WPKH`<sup>1</sup>, `P2WPKH`<sup>1</sup> | n/a      | 紧凑的、可以复原出公钥的 ECDSA 签名，base64 编码          |
| 简单型             | `P2WPKH`, `P2WSH`<sup>2</sup>, `P2TR`<sup>2</sup>        | `smp`    | 见证堆栈，共识编码和 base64 编码                          |
| 完整型             | 所有                                                     | `ful`    | 完整的 `to_sign` 交易，共识编码和 base64 编码             |
| 完整型（资金证明） | 所有                                                     | `pof`    | `to_sign` 交易的完全终局化的 PSBT，共识编码和 base64 编码 |

<sup>1</sup> ：技术上可以做到，但在本 BIP 的语境下**不应该**再使用，详见接下来的 “传统型” 章节。
<sup>2</sup> ：排除时间锁脚本。

签名人**必须**为签名加上用来创建该签名的变体名作为前缀。为了在本 BIP 敲定之前，在其实现中支持后向兼容性，验证者可以假设 *传统型* 变种中是没有前缀的。

### 传统型

新证据**应该**为所有发票地址格式使用新的签名类型，也包括 P2PKH 。

**可以**使用传统型签名类型，但**必须**严格限定在传统的 P2PKH 发票地址格式上。

### 简单型

一个 *简单型* 签名由一个见证堆栈组成，先根据共识规则编码为一个指向字节向量的向量，然后使用 base64 编码，再加上变种名（`smp`）作为前缀。验证者应该按照下文的定义构造 `to_spend` 和 `to_sign`，并将所有字段都置为默认值，除了以下字段：

- `message_hash` 是该消息的一个 BIP340 标准的带标签哈希值，如下文所述
- `to_spend` 中的 `message_challenge` 设为被签名的脚本公钥
- `to_sign` 中的 `message_signature` 设为得到的简单型签名

然后像得到一个完整型签名那样继续处理。

### 完整型

完整型签名遵循 BIP325 那样的 “挑战和解决” 规范（BIP325 已被 Signet 使用）。

假设有两笔虚拟交易 `to_spend` 和 `to_sign`。

`to_spend` 交易是这样的：

```
    nVersion = 0
    nLockTime = 0
    vin[0].prevout.hash = 0000...000
    vin[0].prevout.n = 0xFFFFFFFF
    vin[0].nSequence = 0
    vin[0].scriptSig = OP_0 PUSH32[ message_hash ]
    vin[0].scriptWitness = []
    vout[0].nValue = 0
    vout[0].scriptPubKey = message_challenge
```

其中，`message_hash` 是一个 BIP340 标准的带标签哈希值，即 `sha256_tag(m)`，其中标签为 `BIP0322-signed-message`，而 `m` 就是消息原状（没有长度前缀，也没有终止符），而 `message_challenge` 是等待证明的公钥脚本。

而 `to_sign` 交易是这样的：

```
    nVersion = 0 或（仅适用于完整型签名）合适的值（例如，2 表示时间锁）
    nLockTime = 0 或（仅适用于完整型签名）合适的值（用于时间锁）
    vin[0].prevout.hash = to_spend.txid
    vin[0].prevout.n = 0
    vin[0].nSequence = 0 或（仅适用于完整型签名）合适的值（用于时间锁）
    vin[0].scriptSig = [] 或（仅适用于完整型签名）合适的值（用于非隔离见证原生的交易）
    vin[0].scriptWitness = message_signature
    vout[0].nValue = 0
    vout[0].scriptPubKey = OP_RETURN
```

一个 *完整型* 签名包含了用变体名（`ful`）作为前缀的、base64 编码的、得到签名的 `to_sign` 交易的标准网络序列化对象。

### 完整型（资金证明）

资金证明变体延申了基本的方案：除了用一个地址上的公钥来签名一条消息，签名人可以证明自己控制着一组数量不定的 UTXO 。这个 UTXO 集合是由签名人任意选定的，**可以**使用签名地址（`message_challenge`）关联起来。比如说，它可以由发送到这个地址的多个输出组成；不过，签名人可以展示自己想展示的任何 UTXO 。不过，任何时候，这个 UTXO 列表都不能证明完备性（比如说，它**无法**表示：“这就是存在于该地址上的所有 UTXO”），也不能证明这些 UTXO 还没有被花费（比如，验证者必须查阅区块链来验证这一点）。

一个签名人可以构造一个资金证明，通过构造如上所述的完整型签名，演示对一组 UTXO 的控制权，但要加上以下修改：

- `to_spend` 交易被表示为一个终局化（finalized）的 PSBT，而不是一笔裸交易（关于终局化过程的细节，参见 [BIP174](https://github.com/bitcoin/bips/blob/master/bip-0174.mediawiki#input-finalizer)）
- 签名人希望演示其控制权的所有输出，都被包含作为 `to_sign` 虚拟交易的额外输入；并且，它们的见证（witness）字段和脚本签名（scriptSig），应该置为像这些输出真的被花费那样
- 每个额外输入的非见证和见证 UTXO 字段必须根据对应的 UTXO 来设置（按其类型选择合适的值）。
- 作为一种优化措施，当许多非见证 UTXO 都是花费同一笔交易的输出时，对于任何一个输入，只要其跟列表上靠前的输入花费的是同一笔交易的输出，其非见证 UTXO 字段可以省略。

一个 *完全型资金证明* 签名包含了以变体名（`pof`）为前缀的、base64 编码的、已经签好名的终局化 PSBT 。

与普通签名不同是的，资金证明的验证者需要访问最新的 UTXO 集，了解签名人所声称的输入确实存在于区块链上、并且还未花费。因此，一个离线的验证者只能认证这些额外输入的见证堆栈的密码学有效性，但不能认证其区块链状态。一个经过认证的 UTXO 列表也永远无法证明某一特定地址上不存在其它的 UTXO 。

## 详细描述

对于所有的签名类型，除了传统型，`to_spend` 和 `to_sign` 交易都必须是有效的额，能通过所有的共识检查，只是输出点（prevout）为 `000...000:FFFFFFFF` 的那个输出根本不存在。

### 验证

一个验证者被给定一个地址 *A*、签名 *s* 和消息 *m* 作为输入，输出以下三种状态之一：

- *在时刻 T 以及币龄 S 有效*，表明该签名设置了时间锁，除此之外都是有效的
- *无法断定*，表明该验证者无法检查脚本
- *无效*，表明一些检查不通过

#### 验证过程

验证过程由以下步骤组成：

1. 基本验证

   i. 从 *m* 和 *A* 计算交易 `to_spend`

   ii. 解码 *s* 作为交易 `to_sign`

   iii. 如果 *s* 是一笔完整的交易或者 PSBT ，确认所有字段都按上述规范设置了值；尤其是

   - `to_sign` 有至少一个输入，并且其第一个输入花费了 `to_spend` 的输出
   - 如果 `to_sign` 有多于一个输入，那么每一个输入都有合适的见证 UTXO 或非见证 UTXO
     - 如果（基于输入的类型）需要一个非见证 UTXO 但未提供，那么根据使用相同交易 id 的第一个输入来检查该交易是否有一个非见证 UTXO 集合；有则使用它，如果找不到这样的非见证 UTXO，则验证失败
     - `to_sign` 只有一个输出，如前指定

   iv. 确认这两笔交易都满足所有的共识规则，除了 `to_spend` 有一个缺失的输入、且 `to_sign` 的第一个输入的 *nSequence* 和 `to_sign` 的 *nLockTime* 不受检查

2. （可选）如果验证者没有一个完整的脚本解释器，它应该检查自己是否理解了所有需要被满足的脚本。如果不理解，应该停止验证并输出 *无法断定* 。

3. 检查**必要规则**：

   i. 所有签名都**必须**使用 `SIGHASH_ALL` 标签，除非输出类型支持 `SIGHASH_DEFAULT`，那么**可以**用作替代（例如 [BIP341 P2TR 输出](https://github.com/bitcoin/bips/blob/master/bip-0341.mediawiki)）

   ii. 禁止使用 `CODESEPARATOR` 以及 `FindAndDelete`。

   iii. `LOW_S`、`STRICTENC` 和 `NULLFAIL`：有效的 ECDSA 签名必须是严格 DER 编码的，并且有 低-S 值；无效的 ECDSA 签名必须是空值推入

   iv. `MINIMALDATA`：所有推入堆栈操作必须是最小编码

   v.`CLEANSTACK`：要求在求值结束后，堆栈中只剩一个元素

   vi.`MINIMALIF`：`IF`/`NOTIF` 的参数必须是 0x01 或空值推入

   vii. 只要上述任何一个步骤失败，验证者就停下，输出 *无效* 状态。

4. 检查**可升级的规则**

   i. `to_sign` 的版本号必须是 0 或 2 。

   ii. 禁止使用为升级而保留的 NOPs（无动作操作码）。

   iii. 禁止使用大于 1 的隔离见证版本号。

   iv.只要上述任何一个步骤失败，验证者就停下，输出 *无法断定* 状态。

5. 令 *T* 为 `to_sign` 的 nLockTime 值、*S* 为 `to_sign` 的第一个输入的 nSequence 值。输出状态 *在时刻 T 以及币龄 S 有效* 。

   i. 对于 *完整型资金证明* 签名，验证者**可以**额外报告资金证明输入中的任何非零的 nSequence 值（即 `vin[1..n]`），并且**可以**根据当前的区块链状态来验证它们（当可以获得最新 UTXO 集的时候）；这些检查仅供参考，不影响输出状态。

### 签名

控制着一个地址 *A* 的签名者希望签名一条消息 *m*，那就这样做：

1. 依据上述规范构造 `to_spend` 和 `to_sign` 交易，使用 *A* 作为 `message_challenge` 的 scriptPubkey 值（脚本公钥）；使用 *m* 的带标签哈希值作为 `message_hash`
2. 可选地，签名者可以设置 `to_sign` 的 vVersion/nLockTime 值，或者第一个输入的 nSequence 值
3. 可选地，签名者可以为 `to_sign` 加入其想要证明自己有控制权的任何额外输入
4. 像完成任何其它交易那样完成 `to_sign` 交易。

然后，他们编码这个签名，按照以下程序选择 *简单型*、*完整型* 或 *完整型资金证明* ：

- 如果没有为 `to_sign` 增加输入，并且 nVersion、nSequence 和 nLockTime 都置为 0，并且 *A* 是一个 “原生的” 隔离见证地址（P2WPKH、P2WSH、P2TR），那么他们可以按 base64 编码 `message_signature`，使用 `smp` 作为前缀
- 如果没有为 `to_sign` 增加输入，可以按 base64 编码 `to_sign`，并以 `ful` 为前缀
- 否则，必须按 base64 编码 `to_sign` 的终局化的 PSBT，并以 `pof` 为前缀。

### 基于 PSBT 的签名

为一个多签名地址构造有效的见证堆栈，必须协调多个签名器、要求每个都产生一个碎片签名。本 BIP 不指定这个协调过程，但因为使用了 PSBT，它应该跟为发布一笔多签名交易到网络的协调签名流程非常相似。

主要区别在于使用了一个新的全局 PSBT 字段，以及签名器向用户表示交易签名请求的方式。 新的全局类型定义如下：

| 名称                   | `<keytype>`                                 | `<keydata>` | `<keydata>` 描述 | `<valuedata>`     | `<valuedata>` 描述           | 要求纳入的版本 | 要求排除的版本 | 允许纳入的版本 |
| ---------------------- | ------------------------------------------- | ----------- | ---------------- | ----------------- | ---------------------------- | -------------- | -------------- | -------------- |
| Generic Signed Message | `PSBT_GLOBAL_GENERIC_SIGNED_MESSAGE = 0x09` | 无          | 无 key data      | `<bytes message>` | 待签名的、UTF-8 编码的消息。 |                |                | 0, 2           |

### PSBT 创建者

一个 BIP322 PSBT 的**交易创建者**必须遵循以下步骤：

1. 根据前述规范构造`to_spend` 和 `to_sign`，在 `message_challenge` 中使用 *A* 的脚本公钥，并以 *m* 的带标签哈希值作为 `message_hash` 。

2. 可选地，可以设置 `to_sign` 的 vVersion/nLockTime 值，或者第一个输入的 nSequence 值

3. 可选地，签名者可以为 `to_sign` 加入其想要证明自己有控制权的任何额外输入

4. 为第一个输入设置合适的 `witness_utxo` 和 `non_witness_utxo` 字段，使用 `to_spend` 交易作为一个 `non_witness_utxo` ，或 `to_spend` 交易的第一个输出作为 `witness_utxo`

5. 为每一个额外的输入设置合适的 `witness_utxo` 和 `non_witness_utxo` 字段

6. 根据签名器的要求设置合适的 PSBT 输入和全局字段，以产生一个碎片签名

7. 设置 `PSBT_GLOBAL_GENERIC_SIGNED_MESSAGE` 字段，使用完全由 UTF-8 编码的消息作为 `valuedata`

   i. 没有像 [BIP174](https://github.com/bitcoin/bips/blob/master/bip-0174.mediawiki) 那样为一个输入的 `valuedata` 或整个 PSBT  字节设置长度上限，但不同的签名器可能会实施安全限制。建议使用几 kB 的长度上限以尽可能保证兼容性。非常大的消息应该转而用哈希值来承诺。

### PSBT 签名器

一个 BIP322 PSBT 的**交易签名器**必须遵循以下步骤：

1. 解码由 base64 编码的 PSBT，如 [BIP174](https://github.com/bitcoin/bips/blob/master/bip-0174.mediawiki) 所述。

2. 如果侦测到了以下属性（必须全部为真，否则这就**不是** 一个 BIP322 PSBT，并且应该当成一个普通 PSBT）：

   i. 这个 PSBT 为 `PSBT_GLOBAL_GENERIC_SIGNED_MESSAGE` 字段设置了数值。抽取并用作下一个步骤中的 `message`。

   ii. 第一个PSBT 输入要么设置了 `witness_utxo` 字段，要么设置了 `non_witness_utxo` 字段，且 `scriptPubKey` 可以抽取出来；使用它作为下一个步骤中的 `message_challenge` 。

   iii. 第一个 PSBT 输入有 `prevout.n = 0` 。

   iv. 第一个 PSBT 输入有 `prevout.hash = to_spend.txid`，其中 `to_spend.txid` 是根据上述规则，使用从前面步骤中得到的 `message` 和 `message_challenge` 构造出来的。

   v. 这个 PSBT 中的待签名交易仅有一个输出，其价值为 `0`，而其 `scriptPubKey` 设为 `OP_RETURN`（`0x6a`）。

3. 如果上述所有步骤都为真，那么签名器必须通知用户其正在签名的消息，以及其为之签名的地址。

   i. 虽然被签名的消息是一笔交易，用户交互（比如，步骤和展示在硬件签名设备屏幕上的消息）都应该跟签名一条传统消息的步骤相似，而不是跟签名一笔交易的步骤相似。

   ii. 举例：设备不应显示 “从地址 <challenge_address> 花费 0 聪”， 而应该显示 “为地址 <challenge_address> 签名消息 \<message> ”。

4. 得到用户确认之后，签名器为自身能够签名的每一个输入添加一个碎片签名。

### PSBT 敲定者

一个 BIP322 PSBT 的**交易敲定者**必须遵循以下步骤：

1. 如 [BIP174](https://github.com/bitcoin/bips/blob/master/bip-0174.mediawiki) 所述，解码由 base64 编码的 PSBT 。
2. 如 [BIP174](https://github.com/bitcoin/bips/blob/master/bip-0174.mediawiki) 所述敲定这个 PSBT 。
3. 遵循与本 BIP 的 “签名” 章节所述的相同步骤，编码最终的签名。

## 兼容性

本规范与传统的 signmessage/verifymessage 规范在特殊情形中保持后向兼容性，如 “传统型” 一节所述。为与本 BIP 敲定之前的本 BIP 实现保持后向兼容性，验证者可以假设缺乏前缀的是 *简单型* 变体。

## 参考实现

- `Bitcoin Core` 的 PR（基本支持）：[bitcoin/bitcoin#24058](https://github.com/bitcoin/bitcoin/pull/24058)
- btcd PR（完整支持，亦是测试向量的来源）：[btcsuite/btcd#2521](https://github.com/btcsuite/btcd/pull/2521)

## 致谢

感谢 David Harding、Jim Posen、Kalle Rosenbaum、Pieter Wuille、Andrew Poelstra、Luke Dashjr，以及其他人对本规范的反馈。

## 参考文献

1. 最初的邮件组帖子： https://lists.linuxfoundation.org/pipermail/bitcoin-dev/2018-March/015818.htmlChangelog

## 变更日志

- **2.0.0** (2026-06-04)：
- 澄清 message_challenge 对 “资金证明” 来说 *并非* 可选的
- **1.0.0** (2026-04-15)：
  - 标记为完成状态
  - 破坏性变更：添加人眼可读的前缀来编码签名
  - 破坏性变更：“资金证明” 签名的格式为 base64 编码的已敲定的 PSBT
  - 为基于 PSBT 的签名添加新的 PSBT全局字段

- **0.0.1** (2018-09-10)：
  - 作为草案提出

## 版权

本文档在Creative Commons CC0 1.0 Universal 许可下发布。

## 测试向量

（略）

（完）