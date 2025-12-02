---
title: '零知识证据，给 Cashu 带来任意的花费条件'
author: 'Starknet'
date: '2025/12/02 11:32:20'
cover: ''
excerpt: 'Cairo 花费条件允许将任意 Cairo 程序的有效执行设定为花费条件'
tags:
- Cashu
---


> *作者：Starknet*
> 
> *来源：<https://blog.cashu.space/bringing-zero-knowledge-proofs-to-cashu/>*



在本文中，我们会探究 “零知识证据” 如何让带有任意花费条件（由一种图灵完备的编程语言指定）的 ecash token 可以交换，而 *不会* 牺牲隐私性。

## Cashu 协议概述

*以下是对 “Cashu” 协议的一个概括性介绍，想了解其中的细节，要阅读协议文档：[Cashu NUTs (Notation, Usage, and Terminology)](https://github.com/cashubtc/nuts?ref=blog.cashu.space)*

[Cashu](https://https//cashu.space/?ref=blog.cashu.space) 是一种自由且开源的 Chaumian ecash 协议（[Chaum, 1982](https://chaum.com/wp-content/uploads/2022/01/Chaum-blind-signatures.pdf?ref=blog.cashu.space)），允许近乎免费、保护隐私的比特币交易，通过电子 token 实现；这些电子 token 就类似于纸币和硬币，由用户保存。

![img](../images/bringing-zero-knowledge-proofs-to-cashu/zk1-1.svg)

Cashu 协议定义了三方之间的交互：

- 发送者（Alice）：传输 token 给 ……

- 接收者（Carla）：接收 token 。

- 铸币厂（Bob）：一个第三方，允许 Alice 和 Carla 执行以下操作：

  - [铸币](https://github.com/cashubtc/nuts/blob/main/04.md?ref=blog.cashu.space)：用户通过闪电网络发送比特币，以铸造 cashu token

    - Alice 发信号给 Bob，表明自己想要铸造价值一定数额的 cashu token
    - 然后，Bob 生成价值该数额的闪电发票，并交给 Alice
    - 收到支付后，Bob “[盲签名](https://github.com/cashubtc/nuts/blob/main/00.md?ref=blog.cashu.space#protocol)” 由 Alice 定义的一些秘密值
    - 然后，Alice 可以通过解除盲化来获得 Bob 的签名，从而生成 cashu token
    - 然后，Alice 就可以发送这些 token —— 本质上就是揭晓的秘密之，以及 Bob 对它们的（解除盲化的）签名 —— 给 Carla

    （译者注：在 Cashu 协议中，token 都有标准化的面额，是 2 的幂数，所以，用户一次铸造不是得到一个 token，而是得到多个组合出所需数额的 token）

  - 互换：用其它 cashu token 创建 cashu token

    - Carla 发信号给 Bob，表明自己想要互换一个 token（需要把 token 发送给 Bob）
    - Bob 验证了 token 之后，就盲签名由 Carla 定义的一些新的秘密值，并作废 Carla 用来交换的 token
    - 此外，就像现金的找零一样，Carla 也可以请求将 token 分割成其它面额，比如，将一个价值 32 “聪” 的 token 分割成两个价值 16 聪的 token

  - [熔化](https://github.com/cashubtc/nuts/blob/main/05.md?ref=blog.cashu.space)：使用 cashu token 换回比特币

    - Alice 发信号给 Bob，表示她希望熔化一些 token
    - 她把 cashu token 和等价值的闪电发票发送给 Bob
    - Bob 验证了这些 token 之后，就支付闪电发票，并作废掉这些熔化的 token

## 案例：Alice 发送 100 聪给 Carla

（以下这个案例是在 [cashu.me](https://cashu.me/?ref=blog.cashu.space) 网页版钱包中展示的。）

使用一个更加具体的例子。假设 Alice 测 cashu 钱包中有充足的资金，希望发送价值 100 聪的 ecash 给 Carla 。

![img](../images/bringing-zero-knowledge-proofs-to-cashu/zk2.svg)

1. 在 “发送” 页面，Alice 的钱包软件将保证她持有至少价值 100 聪的 token 。如果她的余额超过这个数额，但她的 token 无法恰好组合成 100 聪，而钱包向铸币厂执行互换操作。
2. 然后，Alice [序列化](https://https//github.com/cashubtc/nuts/blob/d3e2a510dcfc20ecb19cce59d5a4f5cc58c51e25/00.md?ref=blog.cashu.space#v4-tokens)要发送的 token
3. 然后，Alice 就可以把序列化形式的 token 发送给 Carla了（通过通信通道）
4. 在 “收款” 环节，Carla 立即拿收到的 token 执行互换。如前所述，互换将让 Bob 作废掉用来互换的 token、使用由 Carla 定义的秘密值来创建新的 token，从而完成 token 价值的所有权的转移

## 花费条件

Alice 可能想要发送不能被任意花费、只能由某一个公钥的主人来花费的 token 。这就产生了 “[花费条件](https://github.com/cashubtc/nuts/blob/main/10.md?ref=blog.cashu.space)” 的概念。

token 上的花费条件使得一个 token 仅在能够提供满足条件的 “见证（witness）” 时才互换或者熔化。

为了在一些 cashu token 上设定花费条件，在铸造或者互换环节，秘密值必须遵循[约定好的秘密值格式](https://github.com/cashubtc/nuts/blob/main/10.md?ref=blog.cashu.space#well-known-secret)。

比如说，如果条件是 Carla 是某个公钥的持有者，那么 Alice 的秘密值必须遵循 “[支付给公钥（P2PK）秘密值格式](https://github.com/cashubtc/nuts/blob/main/11.md?ref=blog.cashu.space#pay-to-pubkey)”。

还是使用我们前面的这个例子，在倒数第二步中，如果这个序列化的 token 价值 100 聪、包含了一个这样的秘密值：

![img](../images/bringing-zero-knowledge-proofs-to-cashu/8.18.52.png)

那么，Calir 若要收款（也就是互换 token），她就必须提供这个公钥的有效签名作为见证。如果 Carl 提供的所有的签名都得到了在 `secret.data` 中的公钥的验证，那么 Bob 就执行互换。

当前，Cashu 协议只支持两种花费条件（[P2PK](https://github.com/cashubtc/nuts/blob/main/11.md?ref=blog.cashu.space)、[HTLC](https://github.com/cashubtc/nuts/blob/main/14.md?ref=blog.cashu.space)）。新型的花费条件的实现需要修改许多活动部分，而且可能非常麻烦。为了解决这些问题，我们引入了一种新的保护隐私的、任意的花费条件，我们称为 “Cairo 花费条件”。

## STARK 证明的计算

Cairo 花费条件允许将任意 [Cairo](https://https//www.cairo-lang.org/?ref=blog.cashu.space) 程序的有效执行设定为花费条件。花费者所提供的见证是被指定的 Cairo 程序的零知识的执行证据、其输出与条件匹配。

### （非常）简短的 Cario 和 STARK 介绍

“STARK 证据” 用来非常高效地验证一段计算的正确性（远远快于计算本身需要的时间），而无需揭晓计算的输入数据（这种属性被称为 “零知识性”）。

“[Cairo](https://https//www.cairo-lang.org/?ref=blog.cashu.space)” 是一种编程语言，专门设计成与 STARK 证据一起使用，它将人类可读的代码编译为一组多项式求值约束（polynomial evaluation constraints）（证明系统处理的是一个大的有限域 **Fp** 中的多项式，而一个 Cairo 程序的字节码则是 **Fp** 中的一个数值数组）。

我们举个例子，以下这个 Cairo 程序 `fibonacci: Fp → Fp` 计算了第 n 个斐波那契数对 **p** 求模的结果：

![img](../images/bringing-zero-knowledge-proofs-to-cashu/8.22.03.png)

计算出下列结果需要花大约 500 毫秒：

![img](../images/bringing-zero-knowledge-proofs-to-cashu/8.31.40.png)

然后，我们可以使用 [stwo-cairo](https://github.com/starkware-libs/stwo-cairo?ref=blog.cashu.space) ，生成一个 STARK 证据来断言这段计算的正确性。

给定 `fibonacci` 的字节码、输出 `c` 以及这个 STARK 证据，一个专门的验证器可以断言这个语句的有效性：`∃n : fibonacci(n) = c` ，不需要知晓 `n`，也不需要运行 `fibonacci` 计算，只需要 50 毫秒！

你可以在 [stwo-cairo.vercel.app](https://stwo-cairo.vercel.app/?ref=blog.cashu.space) 网页上尝试这个例子。

现在，如果我们将 `fibonacci` 替换成我们喜欢的某一种数字签名方案的验证函数的实现，我们就获得了一种定制化的 P2PK 条件！我们来看看它实际上是怎么工作的。

### Cairo 花费条件

- （发送者）设定条件：

  在发送一个 token 的时候，用户可以通过指定一个编译好的程序的哈希值以及输出条件的哈希值，来添加一个 Cairo 花费条件。

  这个程序（以及输出条件）可能需要通过独立的通信通道分享给接收者。

- （接收者）花费被锁定的 token：

  任何想要花费这个 token 的用户都不得不运行这段程序、匹配发送者所要的那个输出条件，然后生成这段计算的 STARK 证据 —— 最后由铸币厂来验证。

### 关于隐私性的要点

在上面这种设置中，铸币厂将在用户花费一个 token 时知道这个程序的字节码（这是验证证据的前提）。

在隐私性非常紧要的情形中，我们可以在原本的程序上使用一种 [bootloader](https://zksecurity.github.io/stark-book/cairo/bootloader.html?ref=blog.cashu.space) 。

这种 bootloader 是一个 Cairo 程序，就像一个虚拟机，它会执行原本的程序，然后输出 `(program_hash, program_output)`。

我们可以这样修改花费条件：

- `程序哈希值` → `bootloader_program_hash`
- `输出条件` → `(program_hash, output_condition)`

从此，铸币厂将只能知道这个 bootloader 的字节码，而原本的程序则自始至终对铸币厂保持隐秘！

## 我们的工作

要了解更多细节，请看我们的 [NUT 提议](https://github.com/cashubtc/nuts/pull/288?ref=blog.cashu.space)，以及这个我们创建的 [typescript 语言](https://github.com/clealabs/stwo-cairo-ts?ref=blog.cashu.space)的代码库，用于在浏览器中用客户端证明 Cairo 程序！

## 样品视频

[Cairo 花费条件 Demo](https://youtu.be/nO3eZG8Nf9M)

（完）