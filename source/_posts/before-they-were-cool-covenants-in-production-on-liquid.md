---
title: 'Liquid 生产环境中的限制条款'
author: 'Randy Naar'
date: '2023/11/07 10:30:48'
cover: ''
excerpt: 'Liquid 代表了一个重要的学习机会'
tags:
- covenant
---


> *作者：Randy Naar*
> 
> *来源：<https://bitcoinmagazine.com/technical/before-they-were-cool-covenants-in-production-on-liquid>*



自从比特币社区燃起关于限制条款的优化的讨论以来，了解不同限制条款提议的取舍以及已经部署在 [Liquid Network](https://blog.liquid.net/) 上的限制条款的兴趣日益高涨。

鉴于这种重新萌芽的兴趣，也为了鼓励进一步的讨论，我们来回顾一些 Liquid 当前可支持的限制条款技术，把它们于比特币上的流行提议相比较，最后看看它们各自的应用场景。

## Liquid 上的限制条款的历史

Liquid 上的限制条款可以追溯到第一条 Elements 范式的侧链：[Alpha](https://blog.blockstream.com/en-covenants-in-elements-alpha/)。这个版本引入了 OP_CHECKSIGFROMSTACK (CSFS) 和 OP_DETERMINISTICRANDOM 等操作码。Alpha 还启用了被早期比特币禁用的操作码的修复版本，比如 [OP_CAT](https://blog.blockstream.com/cat-and-schnorr-tricks-ii/) —— 从社交媒体上的对话来看，现在也越来越多人重新思考这个操作码。这些新的操作码进一步强化了在 Elements 可用的 Script 语言的表达能力。一个概念验证项目 “[Möser-Eyal-Sirer 保险柜](https://maltemoeser.de/paper/covenants.pdf)” 就是为了展示这些新的可能性而用 CSFS 开发出来的

从实现 CSFS 中得到的一个教训是，要求在花费限制条款时将交易数据推入堆栈来实现限制条款，会让限制条款更加复杂。从开发者体验中也可观察到，使用 CSFS 的时候，制作签名哈希值的数据必须在堆栈内重新构造出来，可能迫使开发者推入跟他们真正在乎的 输入/输出 无关的交易数据。

为了简化限制条款的构造，超过 30 种被称为 “[内省操作码](https://glossary.blockstream.com/introspection-opcodes/)” 的新操作码在 Liquid 的 Taproot [升级](https://blog.blockstream.com/tapscript-new-opcodes-reduced-limits-and-covenants/)中引入，以实现更为模块化的方法。举个例子，搭配内省操作码和 CSFS，可以在花费的时候内省交易的更细粒度的部分（将这些部分放入堆栈）。这减轻了在见证数据中汇编部分签名数据的责任，因此也不必在堆栈中构造签名哈希值。

## 领头的限制条款提议

当前，比特币社区正在讨论一大堆可能启用的限制条款提议，包括 SIGHASH_ANYPREVOUT (APO)、OP_TXHASH、CSFS、OP_CAT、OP_TLUV、MATT 操作码 OP_CHECKCONTRACTVERIFY (CCV)、OP_VAULT，还有 OP_CHECKTEMPLATEVERIFY (CTV) 。此外，一种新一代的编程语言 [Simplicity](https://blog.blockstream.com/simplicity-language/)，也可以在底层实现类似于许多限制条款提议的功能，也是比特币的可能道路之一。

关于 VAULT 操作码呀许多讨论，这个操作码是专门创造出来解决比特币用户的便捷保管需求的。这个操作码将允许资金被锁在一个地址中、只允许花费到两个指定的地址：一个是热钱包地址，需要在一个时间锁之后才能进一步移动；另一个是一个冷钱包地址，随时可以直接动用。人们还提出其它的变种方案，但它们都基于先采用 CTV。

CTV 是一种操作码，从堆栈中读取一个哈希值，然后跟花费交易的数据一个确定的子集的哈希值相比对。它的灵活性有望启用许多应用，包括但不限于：拥塞控制（congestion control）、保险柜（vault），以及基本的支付池（payment pools）。

出了操作码，也有人提议用 SigHash 来启用限制条款。最流行的两种提议当属 APO 和 SIGHASH_GROUP。APO 是 SIGHASH_NOINPUT 操作码的一种演化，被广泛认为是实现 [eltoo](https://blockstream.com/eltoo.pdf) 的一个前置条件。eltoo 可以带来的许多提升之一是消除闪电通道中的惩罚机制，这种机制会强迫一方在另一方广播过时的通道状态时使用一些历史数据拿走所有的资金。这将带来一个更加用户友好、效率更高的闪电网络。

## 使用 Liquid 操作码实现类型功能

虽然 Liquid 并不具有 CTV 和 VAULT 操作码，但它有 CSFS 和 [CAT](https://blog.blockstream.com/cat-and-schnorr-tricks-i/)，也能实现限制条款。通过使用这些定义更狭窄的操作码，以及前面提到的内省操作码，开发者已经可以运用类似 CTV 和 VAULT 的功能，打开新的可能、增强侧链。

举个例子，资深的 Liquid 开发者、Ark 提议的作者 Burak，已经在跟 James O’Beirne（VAULT 提议的作者）的[社交媒体讨论](https://twitter.com/brqgoo/status/1636394034511101956?s=20)中展示了使用 Liquid 限制条款操作码如何 [模仿 VAULT](https://brqgoo.medium.com/emulating-op-vault-with-elements-opcodes-bdc7d8b0fe71)。

类似的，CSFS 也可实现 APO 的功能。这个 [demo](https://bitcoin.stackexchange.com/questions/89537/how-to-emulate-sighash-noinput-using-checksigfromstackverify) 运用了多种操作码，可以在当前的 Liquid 上启用 eltoo 这样的 layer-2 协议，只不过相比于  APO 的提议用法，其复杂性更多，而且交易的体积也更大。此外，这种构造还无法应用在 Taproot 交易上，这又引入了其自身的额外复杂性。

## 可用的 Liquid 操作码

许多应用已经利用了 Liquid 上的限制条款操作码。一个限制条款的支持者 Steven Roose 最近为此前人们设想的 OP_TXHASH 提议[定义](https://lists.linuxfoundation.org/pipermail/bitcoin-dev/2023-September/021975.html)了一种规范，并在 Liquid 上开发出了一款用于富达债券的[应用](https://github.com/stevenroose/doubletake)。这种限制条款将让资金在交易的见证数据证明了重复花费时销毁。

[Fuji Money](https://fuji.money/) 的 Fuji USD (FUSD) 是由 Vulpem Ventures 开发的一种算法稳定币，是另一个著名的案例。它完全依赖于断言机的信息来保持锚定，而且可以用去中心化的方式来发行。它使用签名验证和内省操作码的[组合](https://vulpem.com/synthetic-asset-smart-contract.pdf)来实现这些，而且最重要的是，它是可以在链上完全审计的。

Liquid 上的限制条款的其它应用还包括期权合约以及[基于资产的机密贷款](https://ruggedbytes.com/articles/ll/#liquidnetwork)。Blockstream Research 团队去年放出了一份关于前者的[白皮书](https://blockstream.com/assets/downloads/pdf/options-whitepaper.pdf)（以及一篇配套的[博文](https://blog.blockstream.com/use-smart-contracts-on-liquid-to-deploy-financial-products/)），解释了这些期权合约可以如何使用新的那组内省操作码构造出来。这些新的操作码也让用户可以免信任地创造表示一份备兑看涨期权合约的卖方和卖方的 token，然后卖出相反的仓位、留下自己想要持有的仓位。这样创造出来的合约也支持部分补仓（partial fills），意思是创建合约的用户可以卖出表示多个用户指定的担保品资产的最小数量（称为 “合约规模”）的仓位。

## 为什么不先试试 Liquid 呢？

在比特币生态继续开展关于限制条款操作码的健康辩论时，Liquid 已经提供了自己的一套工具，迈向了相似的目标（尽管有不同的实现）。随着对话的发展，见证比特币原生提议以及 Liquid 已经完成且可用的限制条款相关特性的互动、以及使用 Elements Script 实现的比特币限制条款提议模拟，是很有趣的事。

另一种新出现的技术是 [Simplicity](https://blog.blockstream.com/simplicity-language/)，一种为[区块链](https://bitcoinmagazine.com/guides/what-is-blockchain)而设计的可验证的编程语言。Simplicity 语言是由一些使用非常狭义的语义的操作定义出来的，但这些操作组合在一起就可以开发有表达力的程序。这种语言也是可验证的，这意味着，有办法自动化地证明 Simplicity 程序所作的断言。

Simpilicy 的富表达力特性，允许来自 Script 的限制条款操作码无缝移植，同时保证了更大的可靠性、更少意料之外的行为。比特币研究者 [Sanket Kanjalkar](https://twitter.com/sanket1729) 已经为 CTV 完成了这样的工作。使用 [s-lang](https://github.com/BlockstreamResearch/s-lang)（一种更好读的比特币导向型编程语言、可以编译成 Simplicity 程序），他完成了语义的复制，现在任何人都可以在一个可以工作的概念验证项目中尝试。

得益于 Liquid 对 Simplicity 的集成（预计会在 2024 年第二季度推出），比特币开发者很快就有机会使用 s-lang。s-lang 将为 Liquid 带来更加复杂的应用，比如保险柜和委托。[PR 草案](https://github.com/ElementsProject/elements/pull/1219)已经可以审核了。

[长期以来](https://twitter.com/adam3us/status/1517945477718847489?s=20)，Liquid 一直是日后进入比特币的想法的早期采用者，对于想要展示自己的提议的可行性的人，一个建议是先尝试在 Liquid 上实现，以验证你的想法 —— 已经证明，多个限制条款相关的操作码都可以使用 Liquid 现有的限制条款和内省操作码模拟出来了。

所以，下一次有人提出一种新的限制条款时，值得一问的是：为什么不先在 Liquid 上尝试？

（完）