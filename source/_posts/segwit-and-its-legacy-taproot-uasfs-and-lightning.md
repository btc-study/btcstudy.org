---
title: 'SegWit 及其后继者：Taproot、UASF 和闪电网络'
author: 'SatoshiLabs'
date: '2020/09/07 15:59:25'
cover: '../images/segwit-and-its-legacy-taproot-uasfs-and-lightning/29ce3aaaafb64ff783d31fe7d3265cc2.png'
excerpt: '作为一次学习的经历，SegWit 告诉了我们很多关于比特币的事情，不论是实践意义上，还是哲学意义上'
categories:
- 比特币主网
tags:
- 隔离见证
- 文化
---

> *作者：SatoshiLabs*
> 
> *来源：<https://blog.trezor.io/segwit-and-its-legacy-taproot-uasfs-and-lightning-82ce40e94fe2>*




![1](../images/segwit-and-its-legacy-taproot-uasfs-and-lightning/29ce3aaaafb64ff783d31fe7d3265cc2.png)

人们常说，比特币抗拒变化。在某种程度上，说得没错 —— 在协议变更的事项上，比特币开发者保守得令人发指 —— 但这种看法未免有些偏狭：比特币也拥抱变化，但是仅限于那些让比特币变得更好的变化。

比特币要做到之前没有任何技术能做到的事，成为一种货币，就必须是无懈可击的。不能容许网络停机、区块出错、溢出错误和舍入错误。比特币必须保持稳定：任何对比特币代码的改进和修改都有可能造成灾难性的经济后果，故而给人以如临深渊、如履薄冰之感。

[链接：为何比特币的开发如此保守？](https://blog.trezor.io/why-is-bitcoin-development-so-conservative-a22d37765c5b)（[中文译本](https://ethfans.org/posts/why-is-bitcoin-development-so-conservativ)）

我们不能仅仅因为一个升级提案可能对网络中的部分参与者有利就认可它。除非为了全体利益，比特币开发者绝不会拿网络公正性冒险。这是为了让比特币对每个人都更有用、更易用，而不是追求只有一小部分人会用到的花哨特性。

## 为什么隔离见证（SegWit）如此重要？

四年前的 2017 年 8 月 24 日，在[区块](https://wiki.trezor.io/Block)高度 [481824](https://btc1.trezor.io/block/0000000000000000001c8018d9cb3b742ef25114f27563e3fc4a1902167f9893) 处，[SegWit](https://wiki.trezor.io/SegWit) 升级激活。根据[比特币升级提议（BIP）141](https://github.com/bitcoin/bips/blob/master/bip-0141.mediawiki) 至 144 的描述，SegWit 解决了不定形（malleability）问题，与此同时也解决了由区块大小限制而引起的可扩展性挑战。

那时，即使 SegWit 已经被加到了 Bitcoin Core 软件的代码库中，比特币应不应该接受它仍然引发了激烈的争论，暴露出了[节点运营者](https://wiki.trezor.io/Full_node)和[矿工](https://wiki.trezor.io/Miner)的权力拉锯战。

[链接：比特币挖矿行业的一次内部升级](https://blog.trezor.io/an-insider-update-on-the-bitcoin-mining-industry-b5fc020a3c1d)

出于许多理由，许多矿工并不支持 SegWit，还试图阻止这场升级。但可预见的好处最终还是让用户推动了一次用户激活的[软分叉](https://wiki.trezor.io/Soft_fork)（UASF）。这是一种带有强制力的网络升级，因为激活 UASF 的节点会拒绝来自不合作矿工的区块。这是比特币的一个历史性时刻，证明了两点：比特币网络是去中心化的；矿工是服务用户的，不能颠倒过来。

## SegWit 如何工作

SegWit 的首要目标不是节省区块空间，而是修复交易的不定形漏洞。在 SegWit 启用之前，尚未上链确认的[交易的 ID (txid)](https://wiki.trezor.io/Transaction_ID)可能会因为所纳入的脚本或者签名本身的变化而发生变化。SegWit 将脚本签名（ScriptSig）转移到了交易的一个新部分  “witness”（该部分不用来计算 txid）中，交易的不定形漏洞得以修复，交易 ID 也变成了未确认交易可以依赖的标识符。这对于[闪电网络](https://wiki.trezor.io/Lightning_network)来说极为关键。

[链接：比特币地址及使用方法](https://blog.trezor.io/bitcoin-addresses-and-how-to-use-them-35e7312098ff)

虽然这一关键升级让交易的 ID 变成可以依赖的数据，但将脚本和签名数据移到 Witness 字段中使得开发者必须提出一种新的交易费计量方法，即，根据 “block weight” 而非 “block size” 计算交易费（译者注：后者是以数据量的大小来衡量，而前者为不同类型的数据设计了数据量的乘数）。在 SegWit 启用之前，区块大小是 100 万字节（约 1 MB）。而在 SegWit 启用之后，区块大小上限变成了 400 万 weight，换算过来就是平均每区块 1.5 ~ 2.0 MB 左右（具体视区块中包含的交易量而定），但是最多可容纳 4 MB 的数据。这是因为 witness 数据和交易中其它数据的 weight 比是 1:4，区块中可以塞入更多交易，连带会让手续费水平降低。

## 从 SegWit 中我们学到了什么

作为一次学习的经历，SegWit 告诉了我们很多关于比特币的事情，不论是实践意义上，还是哲学意义上。SegWit 升级见证了广泛的用户群体站出来与贪婪的矿工对抗，通过拒绝非 SegWit 的区块来迫使矿工升级。它利用了比特币的博弈经济学来降低矿工的动力 —— 如果他们的区块会被拒绝，就不能从中收获区块奖励和手续费了。

### **节点掌握权力**

用户激活的软分叉，顾名思义，反应了节点在这个系统中的权力范围。不是投入了大量资本买入 ASIC 设备、控制着巨大算力的矿工有这个权力，反而是微不足道、保存着比特币账本的副本来验证的用户具有这个权力。这是一场由用户主导的针对比特币去中心化原则的最强压力测试，而它最终产生了我们想要的效果，迫使矿工接受了分叉。

Segwit 升级也产生了一些副作用，比如，帮助反对 SegWit 和支持区块扩容的矿工发声的[《区块大小之争》](https://blog.bitmex.com/the-blocksize-war-chapter-1-first-strike/)。据推测，矿工们有此反应，是因为他们使用了一种叫做 “[AsicBoost](https://bitcoinmagazine.com/business/breaking-down-bitcoins-asicboost-scandal-solutions)” 的技术来提高挖矿效率，但是该技术与 SegWit 并不相容。

这场冲突让我们看清了谁才是真正的比特币支持者，也淘汰了那些只想为一己私利而改变网络的人。最终也产生了两种后果：一些矿工投诚了分叉链；比特币网络也经历了艰难而缓慢的 SegWit 升级，花了超过一年的时间才获得了 50% 的支持。

### **分叉不是非得以争议收场**

很长一段时间，人们并不知道 SegWit 的结局会如何。一些节点激活 UASF 反对矿工，在社区中造成了意料之外的分裂；如果没有来自用户的压力，升级的走向可能有所不同，甚至根本不会发生。此外，这些经验也被带到了比特币的下一次升级，也就是今年的 Taproort 软分叉中，最近，这一计划已经锁定了。

[链接：Taproot 会给硬件钱包带来什么好处？](https://blog.trezor.io/how-taproot-will-benefit-hardware-wallets-fa43c0b6123e)

Taproot 的投票过程比起 SegWit 要正式很多，在预期激活时间之前的很长一段时间里，矿工被鼓励升级客户端并在区块中发出支持信号。每一个表示支持的矿池所挖出的区块，都被当做一张支持激活的投票，如果在投票期内，支持的区块超过 90% ，则意味着投票通过。

这种方法将矿工的共识置于用户之前，避免了普通节点和矿工之间因意见分歧而产生激烈冲突。如果矿工未能在投票期结束前就 Taproot 升级达成一致意见，要求实行 UASF 的呼声无疑会再度响彻整个社区。

我们可以预见到，同样的历史还会在今后的网络升级时重演，但是否会跟 Taproot 采取相同的做法则不得而知。如果这个流程标准化，可能会被别有用心的人利用，在本应避免的情形中要求矿工投票并激起 UASF。

### **闪电降临**

虽然隔离见证的缓慢采用令人失望，但它所带来的好处正逐渐显露出来。闪电网络是一个建立在比特币基础之上的二层网络，过去一年来常驻各大媒体的头版头条。闪电网络可以提供即时、近乎免手续费的支付交易，并保证能在比特币上结算；因此，它让比特币对普通人来说更容易获得，也更容易使用。如果使用得当，它还能提供更好的隐私性。

[链接：你的金融数据没有隐私，看比特币如何解决这问题](https://bitcoinmagazine.com/culture/financial-data-private-bitcoin-tips)

没有隔离见证，可靠的即时支付是不可能实现的；但是，由于上文提到的交易不定形问题得到解决，这类新场景的大门已然打开。比特币上已经有了一个即时支付层和数据路由层，还可以进一步构建计算处理层，例如，智能合约、去中心化应用和[专用网络](https://twitter.com/ImperviousAi/status/1428857277256142851)。

SegWit 解锁了比特币的新技能。随着闪电网络发展壮大，它所能提供的新功能也会随之增加。过去几年中，另类币尝试构建了许多新奇的应用。其中一些较为实用的应用可能会整合到基于闪电网络的计算层中，并享受比特币的安全性。Taproot  激活已成定局，今年 11 月就将激活，比特币未来必将变得更有效率、带来更多创新。敬请期待！

（完）

