---
title: '比特币中的限制条款：用于评审的分类学'
author: 'Rusty Russell'
date: '2023/07/12 22:57:30'
cover: ''
excerpt: '描述一个可以用来分类和评估限制条款的全景'
categories:
- 比特币主网
tags:
- covenant
---


> *作者：Rusty Russell*
> 
> *来源：<https://rusty.ozlabs.org/2023/07/09/covenant-taxonomy.html>*



*限制条款（covenant）* 是一种允许内省（introspection）的构造：一个交易的输出，可以为接下来花费它的交易设置条件（超越具体的 “必须提供它自己以及某一个公钥的有效签名”条件）。

这种力量延伸了脚本的效用，例如，可以创建强制花费路径（比如 “保险柜” 合约，在花费的时候会强制执行一个时延）、可以重绑定的输入（可用于实现闪电通道 “状态固定” 协议，也即 “对称状态的闪电通道（LN-Symmetry）”）。但是，当我们讨论具体的协议（例如  *OP_TX*、 *OP_TXHASH* 或者  *OP_CHECKTEMPLATEVERIFY* 的时候），   我们很难确定一种方法所作出的具体取舍。所以，我希望描述一个可以用来分类和评估限制条款的全景（也可以叫分类学）。

## 最简单的限制条款（完全不能奏效！）

首先，考虑最简单的限制条款：*OP_TXIDVERIFY*。它会检查花费交易的 txid，要求等于给定的数值。这种操作码容易实现，不论在现有的脚本中（替代 *OP_NOP3* ），还是在 tapscript 中。但它实际上无法工作，因为它会遇上承诺的循环（在脚本中给定的 txid 数值需要包含输入的 txid，但输入的 txid 又由这个脚本中的数值决定 …… 感谢 [Jeremy Rubin](https://twitter.com/JeremyRubin/status/1678565241322348545?s=20)），但这是一个有用的思想实验。

## 最全面的限制条款

现在，考虑最完整的限制条款提议：*OP_TX* 。它的想法是，将花费交易的某些字段的数值推入堆栈。为了效率，它会采用位图，一次性将多个字段推入，而且（因为我们没有 *OP_CAT*）可以选择将它们前后相接、作为一个元素推入。这里有一些重要的细节，例如，比如比特币脚本在处理数字时候的粗糙程度，以及对大体积交易的堆栈空间限制，但这个想法还是蛮简单的。

这种提议将允许你实现比如 “输出的数额必须大于 10 0000 聪” 这样的条件。 

 ## 等式限制条款

处在最简单到最完整两者之间的，是 Russell O'Connor 的 *OP_TXHASH* 提议（我会将它推广成 *OP_TX* 提议），它可以从堆栈中取出一个位图，然后哈希某些字段，然后将最终的结果推入堆栈。当然，你可以使用多个  *OP_IF* 分支，从而实现不同的等式，但实际上只能使用少数几次：你会很快用尽脚本的空间。 如果有  *OP_CAT* ，你可以进一步延伸它，在运行的时候组装出一个模板并要求比对这个模板；但因为我们没有，所以我暂时会忽略这种可能性。

这可以实现简单的等式测试，例如  “输出的数额必须是 10 0000 聪”。

## OP_CHECKTEMPLATEVERIFY 限制条款

*OP_CHECKTEMPLATEVERIFY*  是在基本的等式限制条款上作进一步的限制：它就像使用固定位图的  *OP_TXHASH* 。 虽然这是一个顽固的子集，但这也让它比 *OP_TXIDVERIFY* 更加强大（也更有用！）：尤其是，它完全不承诺输入（只承诺输入的数量），但承诺所有的输出；这意味着，理论上来说，你可以添加手续费（输入）而依然不违反条件，但你不能改变输出。它在 tapscript 之外也有用，因为它是用旧的 “不要触及堆栈” 脚本软分叉风格编写的。

## Taproot 允许我们先设计，然后限制

身处 2023 年下半年，我认为，可以合理假设限制条款只会在 taproot 中实现。

这意味着，我们有能力轻松地限制它，同时，让它可以在未来通过软分叉 *解除限制*：

- 如果我们只允许设定特定的比特、否则就将其视作 *OP_SUCCESS* ，我们可以先获得它的能力，然后通过软分叉启用新的比特，而不需要添加新的操作码。
- 类似地，我们也可以要求它后面紧跟着一个 PUSH 操作码（否则就降格成为 *OP_SUCCESS* ），从而限制它成为一种静态可分析的集合。

举一个例子，我们将 *OP_TX* 转化为 *OP_TXIDVERIFY*。只需定义一个比特币：*OP_TX_BIT_TXID* 。这个比特意味着 “将 txid 推入堆栈”；如果你设定了别的东西，*OP_TX* 会被解释成 *OP_SUCCESS* ：

```
01 OP_TX_BIT_TXID OP_TX <txid> OP_EQUALVERIFY
```

类似地，如果我们想要 *OP_CHECKTEMPLATEVERIFY*，我们需要定义以下的 *OP_TX* 比特：

1. OP_TX_BIT_COMBINE （意味着全部拼接成一个堆栈元素）
2. OP_TX_BIT_NVERSION
3. OP_TX_BIT_NLOCKTIME
4. OP_TX_BIT_SCRIPTSIG_HASHES
5. OP_TX_BIT_INPUT_INDEX
6. OP_TX_BIT_NSEQUENCES
7. OP_TX_BIT_NUM_INPUTS
8. OP_TX_BIT_OUTPUTS_AMOUNT
9. OP_TX_BIT_OUTPUTS_SCRIPT
10. OP_TX_BIT_NUM_OUTPUTS

即：（假设它们从 0 到 10 重新分配了比特）

```
02 b1111111111 OP_TX OP_SHA256 <hash> OP_EQUALVERIFY
```

字段被哈希的方式以及顺序上可能会有一些区别，但这只是外观上的差异，不是功能上的差异。

在未来延伸这个集合，就意味着定义其它字段、允许某一些组合。

## 令人分心的递归

我们可以讨论许许多多剪断限制条款的翅膀的办法。但我希望讨论（并且反驳）的是这种：需要限制 *递归型限制条款* 的想法。递归型限制条款可以限制它所有的后代输出。

本文列出的所有限制条款系统都可以限制输出。这意味着，我可以要求这笔花费交易要花到哪里、并通过这个 “哪里” 来要求再下一笔交易要花到哪哪里，再通过 “哪哪里” 限制再下下一笔交易 …… 经过 1 亿笔交易，再把钱交给我。你可以通过要求任何花费限制条款的交易的输出都不能再使用限制条款，来阻止这一切，但这会增加复杂性，也会削弱它的用处。

从数学上来说，可以限制 *任意* 深度的交易，和限制 *无限* 深度的交易，是有区别的。但没有人会在乎的：不管怎么说，要让你的钱变成废品，有大把的办法比将它放到一长串交易中、一个无限循环中更好。

## 通过后门实现限制条款

我之前写过一篇文章，论述了[通过签名实现的限制条款](https://rusty.ozlabs.org/2023/07/08/backdoor-to-covenants.html)。我在文章里指出，BIP-118 的签名可以用来制作限制条款。这不是一种整洁的设计，更像是 “手电钻也可以用来敲钉子”。在限制条款的光谱上，这种方法属于 *OP_TXIDVERIFY* 和 *OP_CHECKTEMPLATEVERIFY* 之间的等式限制条款，因为它可以使用集中不同的字段位图，就看签名使用了哪些 SIGHASH 标签。

## 光有内省还不够

值得指出的是，比特币的 *OP_CHECKSIG* （家族）做三件事：

1. 组装当前交易的各个部分；
2. 对上一步的结果运行哈希计算；
3. 检查这个哈希值得到了给定公钥的签名。

*OP_TX* 实现了第一件事；我们已经拥有了 *OP_SHA256* 和多种类似的操作码，可以做到第二件事。*OP_TXHASH* 和 *OP_CHECKTEMPLATEVERIFY* 实际上合并了前两件事。

所以，希望一个单独的操作码来做到第三件事，也是理所当然的，因此，有一个提议可以检查对给定哈希值的签名：*OP_CHECKSIGFROMSTACK* 。这个操作码将允许你模拟任何 *OP_CHECKSIG* 的变种（只取决于你允许使用什么 *OP_TX/OP_TXHASH* 标签）：

```
02 <flags> OP_TX OP_SHA256 <pubkey> OP_CHECKSIGFROMSTACK
```

## 总结

我们应该启用 ANYPREVOUT。它将开启 LN-symmetry，让闪电通道变得更加简单（并因此更加健壮），这已经实现了。它还可以启用限制条款，虽然有一个比较奇怪的要求：把签名放在脚本公钥里面，这也让它没有别的限制条款提议那么高效，但它同时开启了真实的应用和实验性场景，为未来的软分叉提供了参考。

对于未来的限制条款软分叉，我们应该审视完整的设计，比如 *OP_TX* ，然后根据需要裁剪它的翅膀，稍后再启用完整的功能。最终的结果可能是 *OP_CHECKTEMPLATEVERIFY* 这样的东西。

同时，Greg Sanders 既提炼了 *OP_VAULT* 提议，又实现了 LN-Symmetry（也就是 Eltoo），他的观点是，我们正在快速接近比特币脚本有用性的极限，所以他现在坚定地认为，一个引入 Simplicity 语言的软分叉会是更好的选择。也许这个想法最终会取代 *OP_TX* ？

（完）
