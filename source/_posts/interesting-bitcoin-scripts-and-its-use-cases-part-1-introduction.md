---
title: '有趣的比特币脚本（一）：基本介绍'
author: 'Anony'
date: '2023/04/18 18:03:08'
cover: ''
excerpt: '比特币交易、输出、脚本的基本概念'
tags:
- 开发
---


> *作者：Anony*



## 前言

本系列文章旨在成为《比特币的可编程性》 <sup><a href="#note1" id="jump-1">1</a></sup> 一文的后续，在纯粹的理论探讨之外，为读者提供更富细节的解读以及更多的应用比特币脚本的案例。这些案例，将让读者更直观地理解，基于比特币脚本的合约式协议，如何嵌入具体的应用场景中并为相关参与者服务。

为求准确，本系列文章也将使用比特币脚本编程最新的工具：Miniscript 语言、Policy 语言及编译器，以生成更准确的脚本，同时让更有雄心的读者能够了解先进的工具。但鉴于笔者编程知识有限，这一部分不会是重点，也决不能代替更富技术细节的资料。

最终，读者将发现其主旨跟《比特币的可编程性》一文是一致的：相比于能够应用比特币脚本的场景，比特币脚本自身总是显得很简单；但这绝不意味着这样的场景就很有限，实际上，本系列文章正想证明，这样的场景比大多数人的直觉更为丰富。关键在于，比特币脚本是参与交互的双方（各方）的 “锚”，它要做的事情是为交互的关键步骤提供密码学保证，而不是让场景的业务操作的每一步都在整个网络中冗余式计算；只有这样做，比特币网络才能获得足够强的生存能力，同时保证可扩展性和隐私性。

闲话少说，我们进入正题。

## 比特币的交易、输出、脚本

### 交易

“比特币交易（transaction，也可译为 “事务”）” 表示比特币系统的状态转换操作。每一笔交易的基本组成部分都是一系列的 “输入” 和 “输出”；此外还有一些属于交易自身的 “元数据”（例如，时间锁）。

直白地说，交易就是 “转账”，也就是 “把一些比特币从一个地方移到另一个地方”。只不过，这样的 “地方” 可以很有趣。

### 输出

“输出（output）” 的全称应该是 “交易输出（TXO）”，代表着一笔比特币资金，也即比特币系统状态的基本单元。

每一个输出都有两个字段：（1）数额，以 “聪（satoshi）” 为单位（一亿聪为一 BTC）；（2）锁定脚本，也称 “脚本公钥（scriptPubKey）”，它表示动用这笔资金的解锁条件。

每一个输出都是由具体的一笔交易创造的，因此，我们用 “输出点（outpoint）”（交易的索引号 + 输出的序号）来表示一个输出（一笔资金）的 “位置”。当我们要花费一个输出时，就是让这个输出成为一笔交易的输入，也可以说是为这笔交易提供资金。

你可以把 “输出” 和 “交易” 分别想象成 “金属块” 及其 “熔铸过程” <sup><a href="#note2" id="jump-2">2</a></sup>：一些金属块进入了一个熔炉，熔完之后会形成新的一些金属块，旧的金属块就不复存在了。这也是为什么我们更常被使用的概念是 “UTXO（未花费的交易输出）”：UTXO 代表着可以使用的资金，同时也是比特币系统最新状态的一部分；而花过的 TXO 已经成为了历史，不复存在了。

所以说，比特币系统中是没有 “账户” 这个概念的，有的只有 “输出”，即具体的、一笔又一笔的资金；每一笔资金都有自己的脚本（锁定条件），需要为验证程序提供特定的数据才能解锁。所以，比特币的脚本编程不是对 “账户” 编程、产生用代码控制的账户，而是对 “钱/支票” 编程、让具体的一笔钱能够对输入的特定数据作出响应。

### 脚本

如上所述，每一个 UTXO 都有自己的锁定脚本，称 “脚本公钥”。为输入提供的、用于解锁资金的数据，则称为 “解锁脚本” 或者 “脚本签名（scriptSig）”。根据比特币的共识规则，脚本公钥可以形成一种验证程序，而解锁脚本的作用则是输入一些数据来运行这些验证程序；当程序的运行得到特定的结果 <sup><a href="#note3" id="jump-3">3</a></sup>，就表示相关的输入可以被解锁、使用。

**这就是基于比特币脚本的应用的基础**！通过设计脚本公钥以及用户之间的交互流程，我们可以为参与一套经济合约的用户的关键交互步骤（合约的关键状态转换）提供密码学保证，从而约束各方的行为、确保合约正常履行。

> 比特币上发生过多次共识规则的软分叉升级，一些升级也影响了比特币脚本的执行，并形成了一些新的概念；其中尤为重要的两次升级是：
>
> 1. P2SH 升级
>
>    在该升级以前，写在 UTXO 的脚本公钥字段的就是实际编程验证程序的脚本；而在该升级之后，写在脚本公钥字段的成了这样的脚本的哈希值；即，实际编程验证程序的脚本，在接收资金的时候不再暴露在链上；暴露在链上的变成了这段脚本（“赎回脚本（redeem scripts）”）的哈希值。当这样的 UTXO 被花费时，其赎回脚本才会曝光
>
>    这样做有许多好处：一是缩减使用复杂脚本的 UTXO 的体积，其脚本公钥字段不再携带完整的脚本，而只余脚本的哈希值；二是经济负担的转移 <sup><a href="#note4" id="jump-4">4</a></sup>，比特币交易的手续费是按交易的体积支付的，原本，支付方需要为使用复杂脚本的接收方支付额外的手续费，现在，因为赎回脚本仅在相关资金被花费时才会完整暴露，额外的交易手续费将由使用者（原来的接收方）自己承担；最后，它还有一些隐私性上的好处：在资金被实际被花费之前，区块链的观察者无法知道其实际解锁条件。
>
> 2. 隔离见证升级
>    隔离见证升级以前，交易的输入的脚本签名字段负责携带数据，以求通过其所引用的输出的脚本公钥所表示的解锁条件。但是，人们发现这样的设计会导致第三方可以改动脚本签名的内容而不使交易失效，但因为计算交易索引值（txid）时也包括了脚本签名字段，所以这样会使 txid 改变。这个问题被称为 “熔融性（malleability）” 问题。它会让 txid 变成一种不可依赖的跟踪交易的方法， 进而多方参与的合约协议也很难安全 <sup><a href="#note5" id="jump-5">5</a></sup>。
>
>    隔离见证的创新在于，它将原本放在脚本签名中的内容放在交易之外的一个专门的地方，称作 “witness”。输入的脚本签名字段不再有内容，也就不再能被改动而不影响交易的有效性。这就修复了这里所说的熔融性的问题。
>
> 这两大升级，从表象上来说，产生了新的概念和结构：原本脚本公钥中的内容，改称 “赎回脚本”，在输入的脚本签名中提供；原本放在脚本签名字段的内容，被转移到 witness 字段中。但从根本上来说，它们没有改变比特币脚本的工作原理：由脚本公钥给出一种验证程序，而脚本签名（witness）则负责提供数据以通过验证程序。在后文中，我们会在这个意义上继续使用这两个词，虽然它们当前的用法已经跟最初的比特币设计不同了，但它们所代表的东西没有改变。
>
> 此外，如上所述，隔离见证升级修复了熔融性漏洞，是一个重大的安全性升级。因此，凡是考量使用复杂比特币脚本的人，都应该考量使用隔离见证之后的脚本类型（即 P2WSH）。
>
> 隔离见证之后，Taproot 升级又提供了进一步的优化，我们将在后文中逐渐展开其优化的内容。

### 简单脚本示例

比特币脚本是堆栈式执行的，对其执行过程感兴趣的读者，可以阅读这篇文章 <sup><a href="#note6" id="jump-6">6</a></sup>。其动图形象地展示了比特币交易的执行过程。

出于演示的目的，此处仅提供单签名输出的比特币脚本示例。

顾名思义，“单签名输出” 就是只需提供一把公钥的签名就可以花费的输出，这是个人用户最常接触的输出（地址）类型。这样的输出类型包括 “P2PKH” 和 “P2WPKH”。

P2PKH 的锁定脚本是这样的：`OP_DUP OP_HASH160 <A 公钥的哈希值> OP_EQUALVERIFY OP_CHECKSIG`；需要为之提供的脚本签名是这样的：`<A 公钥的签名> <A 公钥>`。

P2WPKH（隔离见证下的公钥哈希值输出）的锁定脚本：`0 <B 公钥的哈希值>`；需要为之提供的 witness 是这样的：`<B 公钥的签名> <B 公钥>`。

## Miniscript 与 Policy 语言

在上面的脚本示例中，我们直接使用了比特币共识规则中可用的操作码 <sup><a href="#note7" id="jump-7">7</a></sup> 来编写代码；这种编写方法可以称为 “Bitcoin Script 语言”。

但在本系列的后续文章中，除了提供这样的 Script 代码，我们还会提供另一种编程语言 Miniscript 的代码。虽然 Script 代码才是比特币网络上可以执行的脚本，但实际上，这样的脚本是非常难以编写和分析的 <sup><a href="#note3" id="jump-31">3</a></sup>。正是因此，人们才提出了 Miniscript 语言：它实际上是 Script 语言的一个子集，但是具有结构化的表现形式，因此更容易分析和组合。它代表着比特币开发者驯服工具上的努力，也代表着开发比特币脚本的新实践，值得具有雄心和知识的读者的关注。 

更重要的是，Miniscript 的作者在开发它的同时还提出了另一种语言：Policy 语言，这是一种将 UTXO 的花费条件表示成可以直接阅读的代码的语言。也就是说，它的用法是，我们先将解锁条件表达成 Policy 代码，然后用编译器将它译为 Miniscript 代码，最后将 Miniscript 代码翻译成 Script 代码（可以在比特币网络上直接执行的脚本）。这是因为，Miniscript 的主要用意是让代码变得可分析、可组合，确保生成的 Script 的正确性是其首要设计目的；而在这种设计目的之下，就很难兼顾让代码变得可读、易于编写的目的 <sup><a href="#note8" id="jump-8">8</a></sup>。因此，我们将大量的工作交给编译器，而让这两种独立的语言各司其职。

往后，我们会先用 Policy 语言来表达花费条件，然后产生对应的 Miniscript 代码和 Script 代码。

但读不懂这些代码不会影响读者对比特币脚本功能的理解。笔者自身的编程知识也极为有限。

## 小结

这是 “有趣的比特币脚本” 系列的第一篇文章。在本文中，我们介绍了比特币系统的基本概念：交易、输出以及脚本。这些概念会在后续的文章中不断遇到。此外，我们还简单介绍了 Miniscirpt 和 Policy 语言以及它们在后续篇章中的用途。

在下一篇文章中，我们会介绍最常用的比特币脚本编程模块：多签名（multisig）。

## 参考文献

1.<a id="note1"> </a>https://www.btcstudy.org/2022/09/07/on-the-programmability-of-bitcoin-protocol/ <a href="#jump-1">↩</a>

2.<a id="note2"> </a>https://www.btcstudy.org/2022/07/19/the-words-we-use-in-bitcoin/#%E5%9C%B0%E5%9D%80%EF%BC%88address%EF%BC%89 <a href="#jump-2">↩</a>

3.<a id="note3"> </a>https://www.btcstudy.org/2023/03/16/understanding-bitcoin-miniscript-part-1/#Bitcoin-Script-%E7%9A%84%E6%9E%81%E7%AE%80%E9%80%9A%E8%AF%86%E8%AF%BE <a href="#jump-3">↩</a> <a href="#jump-31">↩</a>

4.<a id="note4"> </a>https://www.btcstudy.org/2021/09/29/bitcoin-taproot-a-technical-explanation/#Pay-to-ScriptHash-P2SH <a href="#jump-4">↩</a>

5.<a id="note5"> </a>https://www.btcstudy.org/2022/10/07/segregated-witness-benefits/#%E4%BF%AE%E5%A4%8D%E7%86%94%E8%9E%8D%E6%80%A7%E9%97%AE%E9%A2%98 <a href="#jump-5">↩</a>

6.<a id="note6"> </a>https://www.btcstudy.org/2022/09/24/script-a-mini-programming-language-by-Greg-Walker/ <a href="#jump-6">↩</a>

7.<a id="note7"> </a>https://en.bitcoin.it/wiki/Script <a href="#jump-7">↩</a>

8.<a id="note8"> </a>https://www.btcstudy.org/2023/03/22/understanding-bitcoin-miniscript-part-2/#%E4%BB%80%E4%B9%88%E6%98%AF-%E2%80%9CMiniscript%E2%80%9D%EF%BC%9F <a href="#jump-8">↩</a>

> *[续篇见此处](https://www.btcstudy.org/2023/04/19/interesting-bitcoin-scripts-and-its-use-cases-part-2-multisig/)*