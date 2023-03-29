---
title: '理解比特币 Miniscript（二）：工作原理'
author: 'benma'
date: '2023/03/22 20:28:37'
cover: '../images/understanding-bitcoin-miniscript-part-2/orkflow.jpg'
excerpt: 'Miniscript 是如何简化复杂花费条件的开发的'
categories:
- 比特币主网
tags:
- Miniscript
---


> *作者：benma*
>
> *来源：<https://shiftcrypto.ch/blog/understanding-bitcoin-miniscript-part-2/>*
>
> *本文为 “理解比特币 Miniscript” 系列的第二篇。前篇可见[此处](https://www.btcstudy.org/2023/03/16/understanding-bitcoin-miniscript-part-1/)。*

![Understanding Bitcoin Miniscript - Part II](../images/understanding-bitcoin-miniscript-part-2/orkflow.jpg)

在本系列的[第一篇文章](https://shiftcrypto.ch/blog/understanding-bitcoin-miniscript-part-1/)中，我们检视了使用 Bitcoin Script（比特币的原生编程语言）来编程  `(1 号人物可以随时解锁) or (2 号人物可在一年后解锁)` 这样精心设置的资金锁定条件的例子。这些例子证明了，因为 Bitcoin Script 的缺点以及陷阱，这样的条件构造起来、使用起来多么地难。既难以开发出能够编码我们想要的花费条件的脚本，也难以为这样的脚本构造有效的见证数据（从而花费资金）。

Miniscript 通过引入封装了 Bitcoin Script 代码的片段、运用这些片段来编写脚本，解决了上面说的问题。

本文将深入讲解 Miniscript 的工作原理，以及它是如何映射成 Bitcoin Script 的。

如果你还没读过本系列的第一篇文章，请务必花上一点时间，因为我们将依赖于那篇文章介绍过的 Bitcoin Script 的概念，例如 Bitcoin Script 是如何执行，以决定资金是否可被花费的。

## 什么是 “Miniscript”？

Miniscript 编程语言由两个独立的部分组成：

### Policy 语言

Policy（“花费策略”）语言是一种抽象的表达式语言，是可以组合且易于直接阅读和编写的。Policy 句子可以由编译器自动编程成合适的 Miniscript 代码。Policy 句子的一个例子是  `or(pk(key_1),pk(key_2))` ，意思是 “公钥 1 和公钥 2 都可花费”。

### Miniscript

Miniscript 表达式，举例来说，是这样的： `or_b(pk(key_1),s:pk(key_2))` ，这是使用 [sipa 的编译器](https://bitcoin.sipa.be/miniscript/)，从上面那个花费策略编译而来的；它是  `or_b` 、`pk`  这样的片段的组合。

每一种片段都可以映射成特定的 Bitcoin Script 代码。 比如说， `pk(key)` 会映射成  `<key> OP_CHECKSIG`，而  `or_b(X, Y)` 会映射成  `[X] [Y] BOOLOR`。

Miniscript 自身也是一种表达式语言，容易用计算机读取，也易于被人类阅读。

对于计算机来说，这是很重要的，这样你的钱包应用可以解码一个 Miniscript 表达式，并转化成收款地址、让你能够花费其中的资金。

对于人类来说，它的意义在于你只需在纸上记录下来，就可以备份你的钱包的描述符，而且还可以使用同一个描述符跟不同的应用和工具交互。举个例子，你可能想要将你的钱包描述符导入一个投资组合监控工具中，或者一个报税工具中，或是导入一个移动端的观察钱包。钱包描述符可以包含一个 miniscript 表达式，然后就能推导出地址。

Miniscript 表达式语言看起来跟 policy 语言很像，所以很容易将两者搞混。但你要理解，它们是两种完全独立的语言：

Policy 语言是一种帮助开发者创建花费条件的工具，因为它是很容易编写的。它只有少数几种元件，例如  `and(X,Y)`、`or(X,Y)` 和 `older(time)`；而且这些元件彼此之间可以完美组合。Policy 语言只是一种给开发者使用的工具，并不是标准。不能保证同一个 policy 表达式总能产生同一个 Miniscript 表达式。

相反，Miniscript 是得到充分说明的。只有 Miniscript 会被用于推导 Bitcoin Script 代码、有效的见证数据，以及执行正确性分析。

那么，为什么开发者不直接编写 Miniscript 表达式呢？为什么我们还要依赖于 policy 编译器？原因是，手写 Miniscript 表达式并不容易，而且，因为它是 Bitcoin Script 的一种封装，它也继承了 Script 的复杂性：

- Miniscript 语言比 policy 语言有更多的片段。举个例子，在 Miniscript 中，至少有如下几种表达  `X or Y` 的方式：`or_b(X,Y)`、`or_c(X,Y)`、`or_d(X,Y)` 和 `or_i(X,Y)`，每一种都对应着不同的表示  `X or Y` 的 Script 代码，这些代码的脚本体积、见证数据体积、与其它代码的组合方式，都各不相同。
- 可能有许多 Miniscript 表达式可以编码同一种花费条件。而 policy 编译器可以帮助你优化表达，例如，通过降低脚本体积来减少所需的交易手续费。
- 不是所有的 Miniscript 表达式都能产生有效的脚本：这些片段必须以某些方式组合起来，才能获得正确性。policy 编译器可以确保只会产生有效的 Miniscript 表达式。

## 实际操作：映射成 Bitcoin Script

为了理解一个 Miniscript 表达式是如何编码一个 Bitcoin Script 代码的，我们看看下面这个表达式：

```
or_b(pk(key_1),s:pk(key_2))
```

每一个片段都可以映射成特定的 Bitcoin Script 代码。 `pk(key)` 映射成  `<key> OP_CHECKSIG`，而  `or_b(X, Y)` 映射成  `[X] [Y] BOOLOR`。

每一种片段都可以用封装器来封装，这是用冒号 `:` 来表示的： `s:X` 封装器会映射成  `OP_SWAP [X]`。封装器跟其它片段基本上是一样的，不过更准确一些。如此一来，它们就只是语法上的点缀。你可以认为（比如说）`s:X` 跟  `s(x)` 是一样的， `dv:older(144)` 跟  `d(v(older(144)))` 是一样的。

所以，整个 Miniscript 可以翻译成这样的 Bitcoin Script 代码：

```
<key_1> OP_CHECKSIG OP_SWAP <key_2> OP_CHECKSIG OP_BOOLOR
\_________________/   \     \________________/          /
 \       X             \            X       /          /
  \                     \__________________/          /
   \                             Y=s:X               /
    \_______________________________________________/
                         or_b(X,Y)
```

在这一个案例中，可以花费这笔资金的见证数据的形式将是  `<signature2> <signature1>` 这样的，其中至少要有一个签名是有效的。需要 `OP_swap`，这样  `<key2> OP_CHECKSIG` 才不会对栈顶的元素操作 —— 这时候的栈顶元素将包含  `<signature1> <key_1> OP_CHECKSIG`  的结果 ——而是对栈顶之下的第一个元素操作，这个元素包含的是第二个公钥的签名。

Miniscript 总共有 22 种定义好的片段和 11 种封装器，每一种都可以准确映射成 Bitcoin Script 代码。可在[这份规范](https://bitcoin.sipa.be/miniscript/)中了解这些片段以及它们的映射。

我们再分析一个更复杂的表达式：我们在本系列的第一篇文章中提到的那个一针见血的例子：

```
pubkey1 OR (pubkey2 in one year)
```

我们用来编码这个花费条件的 Script 代码是非常复杂的，而且很难手动开发出来：

```
<pubkey1> OP_CHECKSIG OP_IFDUP OP_NOTIF
  <pubkey2> OP_CHECKSIGVERIFY <52560 (one year)> OP_CHECKSEQUENCEVERIFY
OP_ENDIF
```

但是，使用 Miniscript，上述的花费条件就可以用这样的 policy 语句来表达：

```
or(10@pk(pubkey1),and(pk(pubkey2),older(52560)))
```

编程成 Miniscript 表达式：

```
or_d(pk(pubkey1),and_v(v:pk(pubkey2),older(52560)))
```

通过将表达式中的片段映射成对应的 Script 代码，我们就可以得到上面的复杂 Script 代码：

- `older(52560)` 概括了 `<52560> OP_CHECKSEQUENCEVERIFY`
- `v:pk(pubkey2)` 概括了 `<pubkey2> OP_CHECKSIGVERIFY`
- `and_v(X,Y)` 概括了 `[X] [Y]`，在这个例子中就是 `<puybey2> OP_CHECKSIGVERIFY <52560> OP_CHECKSEQUENCEVERIFY`
- `pk(pubkey1)` 概括了 `<puybey1> OP_CHECKSIG`
- `or_d(X,Y)` 概括了 `[X] OP_IFDUP OP_NOTIF [Y] OP_ENDIF`，最终得到上面那段复杂的代码

这里的  `10@` 给了 policy 编译器一个提示：我们预计，这种花费路径比其它路径更有可能被使用。编译器可以使用这个信息来优化总的脚本大小。

一旦我们有了最终的 Bitcoin Script 代码，钱包应用就可以将它转化为一个  `bc1...` 这样的收款地址，然后你就可以拿它来收款。这些资金将使用上面的 policy/Miniscript 表达式所表达的花费条件。

## 生成见证数据

对应的有效见证数据也可以从 Miniscript 表达式中自动生成出来，因为每一种片段都定义了如何构建有效的 “满足（satisfaction）” 和 “避开（dissatisfaction）”（译者注：分别指能够通过验证的数据，以及不能通过但不会让脚本终止执行的数据）。一种运用了 Miniscript 的钱包应用，将使用这种方法来允许用户发送交易。

所有片段的 satsifaction 和 dissatisfaction 的清单，可以在[这个网页](https://bitcoin.sipa.be/miniscript/)的 “Basic satisfactions” 找到。

举个例子， `pk(key)`  这个片段可以映射成  `<key> OP_CHECKSIG` ，这样的见证脚本可以用  `<signature>` （签名）这样的见证数据来满足。最终的执行脚本将是  `<signature> <key> OP_CHECKSIG` ；如果签名有效的话，它会留下  `1` 在堆栈中 ，不然就会在堆栈中留下  `0`。同一个片段，也可以用空的无效签名 `<>` 来 “避开”。“避开” 意味着脚本不会终止执行，只会在堆栈中留下一个  `0` 然后继续执行。

 请参考本系列的第一篇文章，了解见证数据和见证脚本是如何组合在一起、通过执行来确定资金是否可被花费的。

我们为上面案例中的同一个表达式生成见证数据：

```
or_b(pk(key_1),s:pk(key_2))
```

- `pk(key)` 片段可以用 `<signature>` 来满足，也可以用空签名 `<>` 避开
- `or_b(X,Y)` 片段（ `[X] [Y] OP_BOOLOR`）有三种不同的满足方式：X 和 Y 都被满足，或者其中一个被满足（另一个被避开）： `[satisfaction for Y][satisfaction for X]`，或  `[dissatisfaction for Y][satisfaction for X]`，或   `[satisfaction for Y][dissatisfaction for X]`。
- 结合两者： `or_b(pk(key_1),s:pk(key_2))` 有这三种有效的见证数据 ：
  1. ` <signature2> <signature1>`
  2. `<> <signature1>`
  3. `<signature2> <>`

## 结论

在这篇文章中，我们看到了 Miniscript 是如何简化复杂花费条件的开发的，以及它是如何让钱包应用能够使用这些条件来收账和发账的。

在下一篇文章中，我们会使用 Go 语言编写一个真正成熟的 Miniscript  解析器和正确性分析器。他将能够从任意的 Miniscript 表达式中创建比特币收账地址。敬请期待！

> 续篇见[此处](https://www.btcstudy.org/2023/03/29/understanding-bitcoin-miniscript-part-3/)。