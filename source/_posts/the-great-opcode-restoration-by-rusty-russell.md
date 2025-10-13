---
title: '恢复比特币脚本的全部力量'
author: 'Rusty Russell'
date: '2025/10/13 15:58:17'
cover: ''
excerpt: '如果我们有了内省，可能想要给 Bitcoin Script 添加什么升级'
tags:
- Great-Script-Restoration
---


> *作者：Rusty Russell*
> 
> *来源：<https://rusty.ozlabs.org/2024/01/19/the-great-opcode-restoration.html>*



> 编者注：本文为作者 Rusty Russell 的 “Great Script Restoration”（直译为 “Script 复兴”）提议的概述，公开出版于 2024 年 1 月。“Script 复兴” 的想法是恢复比特币脚本在 2010 年由于 DoS 问题而被禁用的操作码；为避免重新启用这些操作码会造成同样的 DoS 问题，作者提出了一套新的约束交易的验证资源使用量的方法，并提出了新的操作码。
>
> 2025 年 9 月，作者已经为本文中涉及的想法撰写了[相关的 4 个 BIP](https://bitcoinops.org/en/newsletters/2025/10/03/#draft-bips-for-script-restoration)。

在我过去几篇文章中，我一直在谨慎地思考，如果我们有了 “内省（introspection）”，可能想要给 Bitcoin Script（比特币脚本编程语言）添加什么升级。Sccript 因为拒绝服务式攻击问题而止步于 0.3.1 版本：这一直是人们的一个遗憾，但是，像 `OP_TXHASH` 这样的功能，让 Script 的局限性变得清晰。

## 陈旧的 Bitcoin Script

许多人都知道，中本聪在 0.3.1 版本中禁用了 `OP_CAT` 和其它几种操作码，但 Anthony Towns 指出，在 0.3 版本以前，bitcoin 软件也允许使用 OpenSSL 的 BIGNUM 类型，实现[任意长度的数值](https://github.com/bitcoin/bitcoin/blob/v0.3.0/script.cpp#L44)。  

那是比特币项目的起步阶段，我完全理解这种愿望：立即、清楚地避免 DoS 问题，等到这个问题经过慎重考虑之后再恢复功能。不幸的是，直到多年以后（也就是我们现在所处的位置），人们才理解为 Script 增强功能的难度。

## 变长操作码预算：完全恢复 Script 功能而不引入 DoS

BIP-342 将全局的签名数量限制替换为一种基于重量（weight）的[签名操作预算](https://github.com/bitcoin/bips/blob/master/bip-0342.mediawiki#resource-limits)，该预算设计为能够支持任何合理的签名验证（比如可以由 miniscript 制作的脚本），又足以避免 DoS 。

我们可以在其它操作上使用这个办法，只要这种操作的开销与它们的运算对象（operand）的体积相关，并类似地移除现有脚本系统中的武断限制。我将这种想法称为 “变长操作码（varops）” 预算，因为它适用于在变长对象上的操作。

我的提议草案将变长操作码预算设得很简单：

- 交易的重量乘以 520 。

这保证了即使在现有的脚本上强制执行预算，也不会有可以想象到的脚本无法执行（例如，每一个 OP_SHA256 都总可以在最大长度的堆栈元素上操作，它自身的操作码重量就足以支撑其预算）。

注意：这种预算是在整个交易上生效的，不是以输入为单位的：这是因为预期会有内存操作码，它意味着一个非常短的脚本可能会检查其它非常大的输入。

每一个操作码的预算消耗量如下（未列出的操作码不消耗预算）：

| 操作码       | 变长操作码预算消耗量               |
| ------------ | ---------------------------------- |
| OP_CAT       | 0                                  |
| OP_SUBSTR    | 0                                  |
| OP_LEFT      | 0                                  |
| OP_RIGHT     | 0                                  |
| OP_INVERT    | 1 + len(a) / 8                     |
| OP_AND       | 1 + MAX(len(a), len(b)) / 8        |
| OP_OR        | 1 + MAX(len(a), len(b)) / 8        |
| OP_XOR       | 1 + MAX(len(a), len(b)) / 8        |
| OP_2MUL      | 1 + len(a) / 8                     |
| OP_2DIV      | 1 + len(a) / 8                     |
| OP_ADD       | 1 + MAX(len(a), len(b)) / 8        |
| OP_SUB       | 1 + MAX(len(a), len(b)) / 8        |
| OP_MUL       | (1 + len(a) / 8) * (1 + len(b) / 8 |
| OP_DIV       | (1 + len(a) / 8) * (1 + len(b) / 8 |
| OP_MOD       | (1 + len(a) / 8) * (1 + len(b) / 8 |
| OP_LSHIFT    | 1 + len(a) / 8                     |
| OP_RSHIFT    | 1 + len(a) / 8                     |
| OP_EQUAL     | 1 + MAX(len(a), len(b)) / 8        |
| OP_NOTEQUAL  | 1 + MAX(len(a), len(b)) / 8        |
| OP_SHA256    | 1 + len(a)                         |
| OP_RIPEMD160 | 0 (fails if len(a) > 520 bytes)    |
| OP_SHA1      | 0 (fails if len(a) > 520 bytes)    |
| OP_HASH160   | 1 + len(a)                         |
| OP_HASH256   | 1 + len(a)                         |

## 移除其它限制

Ethan Hilman 的[恢复 OP_CAT 的提议](https://lists.linuxfoundation.org/pipermail/bitcoin-dev/2023-October/022089.html)保留了 520 字节的限制（译者注：指单个堆栈元素不得超过 520 字节长的限制）。应用变长操作码预算之后，就可以移除这一限制，替换成在 taproot v1 上已经应用的堆栈总规模限制（1000 个元素和 520 000 字节）。

此外，如果我们希望引入一个新的隔离见证版本（比如 Anthony Towns 的 “[generalized taproot](https://lists.linuxfoundation.org/pipermail/bitcoin-dev/2018-July/016249.html)”）或者希望允许 “无密钥的条件（[keyless entry](https://rusty.ozlabs.org/2024/01/19/%7B%20%%20post_url%202024-01-16-pay-to-tapscript.md%7D)）”，我们可以将这些限制适配为合理的区块体积上限（也许是 1 0000 个元素，最大 4M 字节）。

## 稍微改变语义

数值将依然是小端序编码（little-endian），但变成无符号数（unsigned）。这能简化实现，而且让位操作（bit opertations）和算术运算（arithmetic operations）的相互作用变得简单很多。它允许现有的正数使用这些操作码而无需修改，也不需要转换。

如果我们有意使用一个新的隔离见证版本，现有的操作码可以替换；否则，就需要添加新的操作码（例如 `OP_ADDV`）。

## 实现细节

v0.3.0 比特币软件使用了 OpenSSL 的 BIGNUM 类型的一种简单的类封装器，但为了最大限度的简洁性，我在不使用外部依赖的前提下重新实现了每一个操作码。

除了 `OP_EQUAL`/`OP_EQUALVERIFY` ，每一个操作码都转换为 `uint64_t` 的一个小端序向量（或从这样的向量开始转换）。这可以通过按需转换来优化。

`OP_DIV`、`OP_MOD` 和 `OP_MUL` 是粗糙地实现的（与 libgmp 的大数字操作的比较表明，更复杂的方法会快得多）。

## 基准测试：上述限制是否低到足以防止 DoS ？

## 上述限制是否高到足以被忽略？

我们可以移除 520 字节的限制。（译者注：应指单个堆栈对象体积不得超过 520 字节的限制。）

但我们依然需要对堆栈的总体积作一个限制：使用一种新的隔离见证版本，可以将这个限制提高到 400 0000；或者跟当前的限制保持一致：52 0000 字节。

在我之前的《[在 Script 中求出脚本公钥](https://rusty.ozlabs.org/2023/10/20/examining-scriptpubkey-in-script.html#making-more-useful-templates-reducing-the-power-of-op_success)》（[中文译本](https://www.btcstudy.org/2023/10/25/examining-scriptpubkey-in-script/)）一文中，我指出，有些时候，我们希望要求一类特定的脚本条件，但不是一段确切的脚本：一个例子是保险柜合约类型的限制条款，它要求时延，但不关心脚本里还有没有别的东西。

问题在于，在 Taproot 脚本中，任何未知的操作码（`OP_SUCCESSx`）都将导致整个脚本通过（完全不会被执行），所以我们需要稍微调整一下。我以往的分隔符的提议很令人尴尬，所以我想出了一个更简单的新办法。

## 加入 OP_SEGMENT

当前，验证程序会在[整个 tapscript](https://github.com/bitcoin/bips/blob/master/bip-0342.mediawiki#specification) 中扫描 `OP_SUCCESS` 操作码，一旦找到，脚本就直接通过。这将被修改成：

1. 在 tapscript 中扫描 `OP_SEGMENT` 和 `OP_SUCCESSx`。
2. 如果找到了 `OP_SEGMENT`，那就执行位于这个操作码前面的脚本；如果脚本没有失败，那就从这个操作码开始继续扫描。
3. 如果找到了 `OP_SUCCESSx`，那么脚本直接通过。

基本上，这就将一段脚本分成了几个 *片段*，每个片段按顺序执行。它并不像 “使用 OP_SEGMENT 将脚本分成几段，一次只执行一个片段” 这么简单，因为 tapscript 允许在 `OP_SUCCESSx` 之后包含无法解码的东西，我们希望保留这种能力。

在执行 `OP_SEGMENT` 的时候，它什么也不做：它的存在只是为了限制 `OP_SUCCESS` 操作码的覆盖范围。

## 实现

`ExecuteWitnessScript` 将有必要重构（可能是作为一段专门的 `ExecuteTapScript`，因为它的 38 行代码中有 21 行都在 “if Tapscript” 条件下），而且它也暗示了，对当前的 tapscript 的堆栈限制，在遇到了 `OP_SEGMENT` 时会强制执行，即使后面跟着 `OP_SUCCESS` 。

有趣的是，核心的 `EvalScript` 函数不会改变，除了忽视 `OP_SEGMENT`，因为它已经非常灵活了。

提醒一句，我还没完成实现，所以可能会有惊喜，但我计划在这个想法获得一些评论之后制作原型。

希望你们喜欢！

（完）