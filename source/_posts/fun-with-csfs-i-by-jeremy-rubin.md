---
title: 'CSFS 的有趣用法（其一）'
author: 'Jeremy Rubin'
date: '2026/02/04 16:36:28'
cover: ''
excerpt: 'CSFS 的有趣用法'
tags:
- CSFS
---


> *作者：Jeremy Rubin*
> 
> *来源：<https://rubin.io/bitcoin/2025/03/05/csfs-fun/>*



在这个系列博客中，我会记录一些我注意到的 CSFS 的有趣用法。

目标是记录一些其他人可能还不知道的东西。

它们是我发明的吗？可能是，也可能不是。欢迎指出前人已经作出的成果！

## 不可替换且不可复用的地址

创建一个 Taproot 输出并使用 “NUMS 点” 作为内部公钥（使用 NUMS 密钥路径以及只设一个脚本树叶子（tapleaf），意味着你总是知道所有的花费选择），并使用这样一个脚本树叶子（tapleaf）：要么满足 `<PK> CHECKSIG`（检查签名）脚本，要么提供一个证据，证明有这个公钥对任何两个不同的数据生成了超过 1 个签名；然后，在两者中选其一：

- 使用 CTV ，它可以发送到 OP_RETUREN；
- 不使用 CTV，它变成任何人都可以花费的。

这意味着，只要你观察到了从这个地址发出的一笔交易的签名，你就知道，发送者不会发送另一笔签名，除非愿意上自己的资金被烧掉。

更多乐趣：

这种 “模棱两可保险” 也可以用在不同输出、不同地址中，以保护带有新的担保品的地址，甚至可以是 *回溯性的*。

## 函数查找表预编译

假设我们希望给比特币添加一种操作码，它可以求值 `f(x)` 。

```
设 x = musig(巨大的联盟，带有一次性的启动仪式)

设 CSFS(key, sig, data) = ...
```

请回忆[密钥串联技巧](https://rubin.io/bitcoin/2024/12/02/csfs-ctv-rekey-symmetry/)（[中文译本](https://www.btcstudy.org/2025/07/28/csfs-ctv-rekey-symmetry-by-jeremy-rubin/)）……通过密钥串联来创建一个带有下列逻辑的脚本：

```
CSFS(X, sig_x, sig_arg)
CSFS(Tweaked(X, arg), sig_arg, arg)
CSFS(Tweaked(X, arg), sig_f, f(arg)))
sig_f != sig_arg
```

现在，（在签名人委员会内）对 `arg` 的所有值运行 `f(arg)` 。

这样一来，你就得到了一张查找表（lookup table），可以用在任何脚本的任意体积的树结构中，开销是常量：3 个签名和 2 个公钥，也就是 256 字节，比使用 taproot 预先生成的树结构在许多情况下都便宜。

这种技术还可以修改成与多个参数一起工作，只要结果是可以预先计算出来的。这就排除了比如 `OP_CAT` 这样的 “大输出空间” 函数，但查找表中可以有规则，比如默克尔树。

至于其用途，在（比如说）一棵默克尔树无论如何都要用一个密钥来签名的时候，使用上述技巧在信任上是等价的。例如，可以这样构造出一棵存储了用户余额的树，任何用户都能从签名集合中 “查找” 自己的余额。

对于 “标准库” 的典型用法，大的联盟可以用于一次性的受信任启动仪式（one-time-trusted-setup）。

## SIGHASH 标签检测

当前，比特币的脚本无法约束一个公钥使用哪个 sighash 标签。CSFS 则可以在 Taproot 输出中带来一个有局限的版本。以下是实现方法：

使用 CSFS，你可以从一个签名中获得交易的摘要并将它存入堆栈。

没有 OP_CAT，其用法是有限的 ……

但是，我们有以下公式：

^ `SigMsg()` 的输出长度是多少？`SigMsg()` 的总长度可以使用这个公式计算出来：` 174 - is_anyonecanpay * 49 - is_none * 32 + has_annex * 32`

（译者注：这里的 `is_anyonecanpay` 和 `is_none` 、`has_annex` 都是布尔值，表示签名是否使用了这些 sighash 标签。）

也就是，最多只有 206 字节（就是在设置了 `has_annex` 的时候）。

*注意：这个数字最终还要加上 1 字节的 sighash epoch ，以及 64 字节的 taggedhash 的值。*

这意味着，使用 CSFS，你可以通过使用 OP_SIZE 来约束一个签名使用特定的 sighash 标签。

- is_anyonecanpay=0， is_none=0， has_annex=0，大小是 174+65
- is_anyonecanpay=0， is_none=0， has_annex=1，大小是 206+65
- is_anyonecanpay=0， is_none=1， has_annex=0，大小是 142+65
- is_anyonecanpay=0， is_none=1， has_annex=1，大小是 174+65
- is_anyonecanpay=1， is_none=0， has_annex=0，大小是 125+65
- is_anyonecanpay=1， is_none=0， has_annex=1，大小是 157+65
- is_anyonecanpay=1， is_none=1， has_annex=0，大小是 93+65
- is_anyonecanpay=1， is_none=1， has_annex=1，大小是 125+65

也就是说，你可以用 CSFS 来区分使用 `anyonecanpay` 和 `none` 和 `annex` 的标签组合，除了 `is_none` 和 `has_annex` 都设置或者都没设置的情形（因为体积相同，所以无法区分）。

唉，再换句话说，你可能只能对以下组合动脑筋了：

- is_anyonecanpay=0， is_none=1， has_annex=0，大小是 142+65
- is_anyonecanpay=1， is_none=1， has_annex=0，大小是 93+65

至于以下组合，则只能没那么感兴趣，但依然可以感兴趣，因为 annex 还不是标准交易：

- is_anyonecanpay=0， is_none=0， has_annex=1，大小是 206+65
- is_anyonecanpay=1， is_none=0， has_annex=1，大小是 157+65

注：给定这些组合，依然可以设置其它标签！

