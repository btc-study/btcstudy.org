---
title: '最小化的 TXHASH 和 CSFS：结合 CTV + APO'
author: 'Brandon Black'
date: '2023/12/26 17:35:20'
cover: ''
excerpt: '两种提议的支持者之间的分歧很大程度上都来自于对提议的特性缺乏全面的理解'
tags:
- CSFS
---


> *作者：Brandon Black*
> 
> *来源：<https://lists.linuxfoundation.org/pipermail/bitcoin-dev/2023-August/021907.html>*



我正在为[这份提议](https://gist.github.com/reardencode/2aa98700b720174598d21989dd46e781)（下附全文）征求反馈。该提议以综合的方式实现了 BIP118 和 BIP119 的支持者们希望的功能，同时保持了跟它俩任意一个提议同样的低风险。创建这个提议的部分目的跟我提出 BIP [PR#1472](https://github.com/bitcoin/bips/pull/1472) 以及我的 “[限制条款比较表](https://docs.google.com/spreadsheets/d/1YL5ttNb6-SHS6-C8-1tHwao1_19zNQ-31YWPAHDZgfo/edit)” 的目的相似，是帮助进一步讨论这些提议，并让它们的相似性和区别变得更加明显。

对我来说，显然的是，两种提议的支持者之间的分歧很大程度上都来自于对提议的特性缺乏全面的理解。我们希望这个工作可以帮助厘清我们对它们两者（单个也好，一起也好）的思考，并对启用更好的闪电网络、保险柜以及其它类似的使用比特币的神奇方式的道路达成共识。

## 摘要

本提议是对 [bip119][] 和 [bip118][] 的替代；它提供了这两种提议的功能，而且在[大部分场景](#compared-to-non-tapscript-ctv)下没有额外的开销；同时，它能辩驳对上述两种提议的某些反对意见，从而开启清晰的升级的路径。

实质上，本提议是 Russel O'Connor 的 [OP_TXHASH+OP_CSFS 提议][OP_TXHASH+OP_CSFS proposal]的一个初级的、受限的版本。

我们定义了三种新的专属于 Tapscript 的操作码，将 `OP_SUCCESS80`、`OP_SUCCESS187` 和 `OP_SUCCESS188` 分别替换成 `OP_TXHASH`、`OP_CHECKSIGFROMSTACK` 和 `OP_CHECKSIGFROMSTACKVERIFY`。

##  总结

对 `OP_TXHASH`，我们定义了 5 种哈希交易的方法，取决于从堆栈中弹出的、最小化编码的数字参数：

| 参数 | 行为                                       |
| ---- | ------------------------------------------ |
| 0    | 如同 [bip119][]                            |
| 1    | 如同使用 sighash 标签 `0x41` 的 [bip118][] |
| 2    | 如同使用 sighash 标签 `0xc1` 的 [bip118][] |
| 3    | 如同使用 sighash 标签 `0x43` 的 [bip118][] |
| 4    | 如同使用 sighash 标签 `0xc3` 的 [bip118][] |

`OP_CHECKSIGFROMSTACK(VERIFY)` 的定义类似于它[在 Elements 项目中的实现][OP_CHECKSIGFROMSTACK in elements]，但在内部求 SHA256 哈希值时并不包含数据参数。因为 [bip340][] 定义了对任意长度的消息的签名，而且`OP_CHECKSIGFROMSTACK(VERIFY)` 仅可用于 Tapscript，内部哈希是没有必要的限制。用户可能希望使用预先哈希的数值（就像在本提议中一样），或者可以在脚本中使用非 SHA256 的哈希值。

## 动机

人们花了很多笔墨在讨论比特币脚本编程的未来上。两个最接近于取得共识的提议是 [bip118][] 和 [bip119][]，但两个协议的支持者在两者的相对优先级和对方的优点上存在分歧。这里，我们会简要列举这样的一些反对意见，并展示本提议如何避免这些批评。我们不会讨论对引入限制条款或者 “递归限制条款” 的担忧。

### 对 [CTV][bip119] 的批评

- 不够通用
- 在不仅需要验证哈希值的场景中不够高效（例如，跟 `OP_CHECKSIGFROMSTACK` 结合的时候）
- 使用 `OP_NOPx` 的语义（尽管 `OP_SUCCESSx` 已经可用）

## 对 [APO][bip118] 的批评

- 不够通用
- 意外地启用了低效、难以使用的限制条款
- 使用新的 Tapscript 公钥版本以避免以外

## 解决方案

- 通过提供 [bip118][] 以及 [bip119][] 的行为，本提议相比它们任何一个都更加通用。本提议也提供了显式的升级钩子，以备进一步增加通用性（例如，启用[全面的 OP_TXHASH][OP_TXHASH+OP_CSFS proposal]）
- 通过将哈希运算从 [bip119][] 的验证中分离出来，哈希值就可以单独用在别的地方（而不是只能用在 `OP_EQUALVERIFY`中）
- 我们使用 `OP_SUCCESSx` 升级语义
- 我们显式地启用部分 [bip118][] 意外启用的基于 sighash 的限制条款
- 通过使用新的签名检查操作码，我们不需要新的 Tapscript 密钥版本来保证安全性

## 详述

### `OP_TXHASH`

在验证 Tapscript 的时候，`OP_SUCCESS80` 的行为修改如下：

- 如果堆栈中 1 个元素也没有，那么执行失败 <sup><a href="#note1" id="jump-1">1</a></sup>
- 如果栈顶的元素不是最小编码的 `OP_0`、`OP_1`  或者 `OP_2`，那么立即成功退出 <sup><a href="#note2" id="jump-2">2</a></sup>
- 弹出栈顶的元素，并命名为 `哈希模式`
- 如果 `哈希模式` 为 0：
  - 求交易的哈希值，如 [bip119][] 的定义
  - 将结果哈希值推入堆栈
- 如果 `哈希模式` 为 1：
  - 求交易的哈希值，如 [bip118][] 内使用 `sighash_type=0x41` 的定义
  - 将结果哈希值推入堆栈
- 如果 `哈希模式` 为 2：
  - 求交易的哈希值，如 [bip118][] 内使用 `sighash_type=0xc1` 的定义
  - 将结果哈希值推入堆栈
- 如果 `哈希模式` 为 3：
  - 求交易的哈希值，如 [bip118][] 内使用 `sighash_type=0x43` 的定义
  - 将结果哈希值推入堆栈
- 如果 `哈希模式` 为 4：
  - 求交易的哈希值，如 [bip118][] 内使用 `sighash_type=0xc3` 的定义
  - 将结果哈希值推入堆栈

### `OP_CHECKSIGFROMSTACK(VERIFY)`

在验证 Tapscript 时，`OP_SUCCESS187` 和 `OP_SUCCESS188` 的行为修改如下：

- 如果堆栈中不足 3 个元素，执行失败 <sup><a href="#note1" id="jump-1-1">1</a></sup>
- 如果栈顶的（top-minus-0）元素的长度不是 32 字节，立即成功并退出 <sup><a href="#note2" id="jump-2-1">2</a></sup>
- 如果栈顶往下数第三个（top-minus-2）元素的长度不是 64 字节，执行失败 <sup><a href="#note3" id="jump-3">3</a></sup>
- 从堆栈中弹出三个元素，分别是 `公钥`、`消息` 和 `签名`
- 令 `结果` 等于根据 [bip340][] 验证 `签名` 对 `消息` 和 `公钥` 有效的结果
- 如果 `结果` 为 `true`，则推入堆栈，否则将 `false` 推入堆栈
- 如果验证的是 `OP_CHECKSIGFROMSTACKVERIFY`
  - 将栈顶的元素弹出，作为 `检查值`
  - 如果 `检查值` 不是 `true`，则执行失败

## 讨论

### 它的效率与 [bip118][] 相比如何？

`SIGHASH_ANYPREVOUT`：

```
<64 字节的签名>||<1 字节的 sighash 类型> <33 字节的公钥> OP_CHECKSIG(VERIFY)
加上 PUSH 操作符： 64+1+1 + 33+1 + 1 = 101 witness bytes (25.25vBytes)
```

本提议：

```
<64 字节的签名> <1 字节的参数> OP_TXHASH <32 字节的公钥> OP_CHECKSIGFROMSTACK(VERIFY)
加上 PUSH 操作符： 64+1 + 1 + 1 + 32+1 + 1 = 101 witness bytes (25.25vBytes)
```

### 它的效率与 [bip119][] 相比如何？

**都放在 Tapscript 内**

单独使用 `OP_CHECKTEMPLATEVERIFY`：

```
<32 字节的哈希值> OP_CHECKTEMPLATEVERIFY OP_DROP OP_TRUE
加上 PUSH 操作符： 32+1 + 1 + 1 + 1 = 36 witness bytes (9vBytes)
```

`OP_CHECKTEMPLATEVERIFY` 加上后续的检查：

```
<32 字节的哈希值> OP_CHECKTEMPLATEVERIFY OP_DROP <...>
加上 PUSH 操作符： 32+1 + 1 + 1 = 35 witness bytes (8.75vBytes)
```

本提议：

```
<1 字节的参数> OP_TXHASH <32 字节的哈希值> OP_EQUAL(VERIFY)
加上 PUSH 操作符： 1 + 1 + 32+1 + 1 = 36 witness bytes (9 vBytes)
```

**与非 Tapscript 的 CTV 比较**

裸的 `OP_CHECKTEMPLATEVERIFY`：

```
锁定： <32 字节的哈希值> OP_CHECKTEMPLATEVERIFY OP_DROP OP_TRUE
加上 PUSH 操作符： 32+1 + 1 + 1 + 1 = 36 bytes (36vBytes)

解锁： <empty>

总计： 36 + 0 = 36vBytes
```

Witness v0 CTV：

```
锁定： OP_0 <32 字节的哈希值>
加上 PUSH 操作符： 1 + 32+1 = 34 bytes (34 vBytes)

解锁：
<36 字节的见证脚本>
加上大小： 36+1 = 37 witness bytes (9.25vBytes)

总计： 34 + 9.25 = 43.25vBytes
```

本提议：

```
锁定： OP_1 <32 字节的哈希值>
加上 PUSH 操作符： 1 + 32+1 = 34 bytes (34 vBytes)

解锁：
<36 字节的叶子脚本> <33 字节的控制块>
加上大小： 36+1 + 33+1 = 71 witness bytes (17.75vBytes)

总计： 34 + 17.75 = 51.75vBytes
```

相比于裸 CTV，本提议要贵 15.75 个虚拟字节。如果 CTV 的用例得到流行，可能需要为裸 CTV 专门安排一个升级，无论是像 [bip119][] 定义的那样作为一个单独的见证版本，还是别的方法。

考虑 [bip119][] 提到的风险，手续费敏感的用户可以在使用 `OP_TXHASH` 和 `OP_EQUAL(VERIFY)` 时加入 `OP_RIPEMD160` 以节约 2.75 虚拟字节，这将让本提议相比裸 CTV 的额外开销降低到 13 虚拟字节。

### 为什么不加入 [bip118][] 的 0x42 和 0xc2 类型？ <sup><a href="#note4" id="jump-4">4</a></sup>

可能由于我们缺乏想象力，我们看不到它在不签名任何输入以及任何输出（或者只签名一个输入脚本而不签名任何输出）时候的用途。

### 这个提议可以用在 LN-Symmetry 中吗？

可以，它完全兼容 N-Symmetry。它使用了另一种脚本，但跟出于这个目的而使用 [bip118][] 时的体积和行为都是相同的。

### 这个提议可以用在 PTLC 中吗？

可以，它完全兼容 PTLC。它使用了另一种脚本，但跟出于这个目的而使用 [bip118][] 时的体积和行为都是相同的。

### 这个提议可以跟 OP_VAULT 一起使用吗？

可以，也完全兼容 OP_VAULT。它使用了另一种脚本，但跟出于这个目的而使用 [bip119][] 时的体积和行为都是相同的。

## 被哈希的有什么？

| 字段模式               | CTV(0) | APO/ALL(1) | APOAS/ALL(2) | APO/SINGLE(3) | APOAS/SINGLE(4) |
| ---------------------- | ------ | ---------- | ------------ | ------------- | --------------- |
| 哈希类型               |        | x          | x            | x             | x               |
| 交易版本号/锁定时间    | x      | x          | x            | x             | x               |
| 本输入 UTXO            |        |            |              |               |                 |
| 其它输入 UTXOs         |        |            |              |               |                 |
| 本脚本公钥/面额        |        | x          |              | x             |                 |
| 其它脚本公钥/面额      |        |            |              |               |                 |
| 本脚本签名             | x      |            |              |               |                 |
| 其它脚本签名           | x      |            |              |               |                 |
| 输入的个数             | x      |            |              |               |                 |
| 本输入的 sequence      | x      | x          | x            | x             | x               |
| 其它输入的 sequences   | x      |            |              |               |                 |
| 花费类型/annex         |        | x          | x            | x             | x               |
| 叶子脚本               |        | x          |              | x             |                 |
| 公钥版本/codesep pos   |        | x          | x            | x             | x               |
| tap 默克尔路径  |        |            |              |               |                 |
| 对应输出的脚本/面额    | x      | x          | x            | x             | x               |
| 其它输出的脚本/面额    | x      | x          | x            |               |                 |
| 输出的个数             | x      |            |              |               |                 |

## 脚注

1.<a id="note1"> </a>在堆栈元素的长度无效时执行失败，可以保证攻击者无法跳过验证。 <a href="#jump-1">↩</a> <a href="#jump-1-1">↩</a>

2.<a id="note2"> </a>我们在遇到未定义的 TXHASH 模式或公钥长度时执行成功，是为了允许未来的插件。 <a href="#jump-2">↩</a> <a href="#jump-2-1">↩</a>

3.<a id="note3"> </a>我们在公钥长度检查 *之后* 遇到无效的签名长度时失败，就可以让 64 字节的签名仅能使用 32 字节的公钥，但允许未来的公钥类型也能使用另一种长度的签名。 <a href="#jump-3">↩</a>

4.<a id="note4"> </a>迄今为止，就我们所知，除了在 [bip118][] 中定义的 sighash 类型， 其它类型在本提议中没有用处，因为其它类型要么会使操作降格为 `OP_CHECKSIG(VERIFY)`，要么会创建无限的哈希循环。 <a href="#jump-4">↩</a>


[bip118]: https://github.com/bitcoin/bips/blob/master/bip-0118.mediawiki
[bip119]: https://github.com/bitcoin/bips/blob/master/bip-0119.mediawiki
[bip340]: https://github.com/bitcoin/bips/blob/master/bip-0340.mediawiki
[OP_TXHASH+OP_CSFS proposal]: https://lists.linuxfoundation.org/pipermail/bitcoin-dev/2022-January/019813.html
[OP_CHECKSIGFROMSTACK in elements]: https://github.com/ElementsProject/elements/blob/f08447909101bfbbcaf89e382f55c87b2086198a/src/script/interpreter.cpp#L1399
[proposed ln-symmetry scripts]: https://github.com/instagibbs/bolts/blob/eltoo_draft/XX-eltoo-transactions.md