---
title: 'Simplicity：高度安全的智能合约编程语言'
author: 'Andrew Poelstra'
date: '2022/04/12 10:14:16'
cover: ''
excerpt: '我们有可能不需要图灵完备性就能验证任意的代码执行'
tags:
- 开发
- Simplicity
---


> *作者：Andrew Poelstra*
>
> *来源：<https://blog.blockstream.com/en-simplicity-github/>*
>
> *原文出版于 2018 年 11 月 28 日。*

本月早些时候，我们放出了区块链编程语言 [Simplicity](https://blockstream.com/simplicity.pdf) 的 [源代码](https://github.com/ElementsProject/simplicity)。

Simplicity 是我们对当前在区块链环境中编写复杂的智能合约所面临的问题的回答。在 Simplicity 之前，区块链的编程语言一般都要在表达能力和可靠性之间作取舍；开发者要么开发复杂但不可靠的智能合约，要么开发可靠但非常基础的合约。有了 Simplicity，开发者最终可以设计出复杂的智能合约并且确信他们的成果。

Simplicity 被设计成与 Blockstream 的 [Elements 平台](https://blockstream.com/elements/)相兼容。这意味着，在 Elements 上开发侧链以及独立区块链的开发者很快就能用上 Simplicity 提供的特性。作为 Elements 的一个实现，Liquid Network 也将支持 Simplicity；这会给 Liquid 用户带来有趣的应用，比如免信任的托管合约、金库以及其它更复杂的智能合约。

本月放出的源代码包括：

- 以 [Coq](https://coq.inria.fr/) 形式化详述的核心 Simplicity 语言的指称语义及其插件
- 以 [Coq](https://coq.inria.fr/) 形式化详述的核心 Simplicity  语言的操作语义
- 用 [Haskell](https://www.haskell.org/) 语言编写的 Simplicity 语言的解释器、类型检查器以及序列化工具
- Simplicity 表示案例，包括像 SHA-256 和 椭圆曲线-Schnorr 签名验证这样的密码学操作
- 包含 Simplicity  语言许多细节的[技术报告](https://github.com/ElementsProject/simplicity/blob/pdf/Simplicity-TR.pdf)

## 为什么要发明 Simplicity?

区块链编程有许多独特的挑战，是传统的编程语言无法胜任的。

- 所有用户都必须一致同意一个计算进程在所有环境下的结果
- 一个智能合约的每一个参与者都要知道这个程序在所有可能输入情况下的所有可能结果
- 所有用户都必须能够防范拒绝服务式攻击（此类攻击会消耗过量的内存和计算时间）
- 一个智能合约的每一个参与者都要理解他们的程序在所有可能的输入下的执行成本

现有的专为区块链设计的编程语言，比如以太坊的 EVM，也依然面临这些挑战。近期，[一个 EVM 升级在测试期间出错](https://www.coindesk.com/ethereums-next-blockchain-upgrade-faces-delay-after-testing-failure)，因为不同的实现无法就计算的结果达成共识。因为智能合约的逻辑错误和程序的资源消除超过限制，资金被[盗走](https://en.wikipedia.org/wiki/The_DAO_(organization))或者[再也取不出来](https://www.coindesk.com/30-million-ether-reported-stolen-parity-wallet-breach)的事情多了去了。

另一方面，比特币的 Script 语言的功能通常来说限制在数字签名检查、[时间锁](https://en.bitcoin.it/wiki/Timelock)和[哈希锁](https://en.bitcoin.it/wiki/Hashlock)的组合。虽然这些元件也组合出了神奇的协议（比如[闪电网络](https://lightning.network/)），比特币的 Script 语言缺乏表达更富在的智能合约的能力。

Simplicity 致力于提供足以实现任何计算的灵活性和表达能力，同时允许你验证你的智能合约的安全性、可靠性和成本。

## 什么是 Simplicity?

Simplicity 是一种底层的编程语言和机器模型，用于基于区块链的智能合约编程。自始至终，它的设计目标就是拥有简单的语义，使得它能用形式化的方法来静态分析和推理。Simplicity 语言由其在 [Coq 证明助手](https://coq.inria.fr/)下的实现来定义。

虽然其核心语言是非常简单的，简单到[一件 T-恤上就能印得下](https://blockstream.com/2017/10/30/simplicity/)，但语言的简洁性不一定能转化成开发的简洁性。原因如下：

- 区块链使用的编程模型与常规编程完全不同。区块链的工作是 *验证计算*，而非做计算。这是一个微妙但[影响极为深远](https://cyber.stanford.edu/sites/default/files/russelloconnor.pdf)的区别，因为，我们有可能不需要图灵完备性就能验证任意的代码执行。
- 一旦部署，一个智能合约就是不可更改的了，这使得我们没有修正错误的空间。Simplicity 通过帮助用户为自己的智能合约创建形式化证明来解决这个问题。
- Simplicity 是非常直接的底层语言，直接面向执行，比 Java 和 Python 之流更接近汇编语言。最终来说，我们预计用户会以一种或多种更高级的语言来编写合约，然后编译成 Simplicity 程序。

## 有何新闻？

自我们[上一次在博客发布关于 Simplicity 的消](https://blockstream.com/2018/02/08/simplicity-a-new-language-for-blockchains-bpase/)息以来，我们一致在努力将实验性质的语言研究转化为更正式的语言详述。

我们已经用 [Coq 证明助手](https://coq.inria.fr/)实现了 Simplicity 语言：

- 我们已经有了完整 Simplicity 语言的指称语义，包括支持见证数据、断言和委托的语言插件。
- 基于自由分类的抽象机器 “the Bit Machine” 的一个形式化详述，为核心 Simplicity 语言提供了操作性语义。
- 以 “[tagless final style](http://okmij.org/ftp/tagless-final/index.html)” 开发的一个 Haskell 实现，可以让你实验 Simplicity 表达的求值、计算和类型检查。
- Simplicity 语言的一种模块化方法，让你可以在不使用插件时无视插件的效果。
- 我们已经有了许多密码学元件的 Simplicity 表达式，包括我们自己用 Simplicity 重现实现的 [libsecp256k1](https://github.com/bitcoin-core/secp256k1)。
- 一份[技术报告](https://github.com/ElementsProject/simplicity/blob/pdf/Simplicity-TR.pdf)，提供了 Simplicity 语言的一份形式化数学详述，并提供了 Coq 和 Haskell 开发的指南。

虽然 Simplicity 的开发仍在继续，我们的研究已经到了让开发者可以自己探索 Simplicity 语言的底部。因此，是时候[将 Simplicity 的开发转为公开状态](https://github.com/ElementsProject/simplicity)，并开启一个[邮件组](https://lists.ozlabs.org/listinfo/simplicity)了。

## 接下来如何发展？

展望未来，Simplicity 的开发还有许多事情要做。

我们计划：

- 完成 C 语言解释器。
- 为多种常见的密码学函数实现一个 jets 库。
- 使用 [Verifiable C](http://vst.cs.princeton.edu/veric/) 来证明我们的 C 语言解释器和 jets 是正确的。
- 将 Simplicity 语言集成到 [Elements 区块链平台](https://elementsproject.org/)。

其它开发方向包括：

- Simplicity 代码优化器。
- 创建或适用现有的高级智能合约平台（比如 [Ivy](https://blog.chain.com/ivy-for-bitcoin-a-smart-contract-language-that-compiles-to-bitcoin-script-bec06377141a)）来生成 Simplicity 实现。
- 结合 Simplicity 的密码学元件的功能正确性与[密码学协议的形式正确性](https://hal.inria.fr/inria-00552886)，开发完全可验证的智能合约。

（完）