---
title: 'Taproot 升级详解'
author: 'Nadav Kohen'
date: '2021/11/02 12:22:01'
cover: '../images/the-taproot-upgrade-explainer-from-Suredbits/es_logo.png'
excerpt: '使用同一个软分叉集体引进的方式，使得这些 BIP 所提出的变更可以相互组合'
categories:
- 比特币主网
tags:
- 比特币
- Taproot
mathjax: true
---


> *作者：Nadav Kohen*
> 
> *来源：<https://suredbits.com/the-taproot-upgrade/>*



![img](../images/the-taproot-upgrade-explainer-from-Suredbits/es_logo.png)

迄今为止，在本系列中我们一直在讲解 Schinorr 数字签名，其安全性、多样的变种和优点。你可能也知道了，Schnorr 签名将通过代号为 “Taproot” 的软分叉引入比特币区块链。在[之前的一篇文章](https://suredbits.com/activating-taproot/)中，Ben 提到了 Taproot 激活的几种可能办法。这里我准备讲讲 Taproot 软分叉，除了会加入 Schnorr 签名以外还会加入什么功能！

Schnorr 签名系列：

- [What are Schnorr Signatures – Introduction](https://suredbits.com/introduction-to-schnorr-signatures/)
- [Schnorr Signature Security: Part 1 – Schnorr ID Protocol](https://suredbits.com/schnorr-security-part-1-schnorr-id-protocol/)
- [Schnorr Signature Security: Part 2 – From IDs to Signatures](https://suredbits.com/schnorr-security-part-2-from-id-to-signature/)
- [Schnorr Multi-Signatures – MuSig](https://suredbits.com/schnorr-applications-musig/)
- [Scriptless Scripts – Adaptor Signatures](https://suredbits.com/schnorr-applications-scriptless-scripts/)
- [Batch Verification](https://suredbits.com/schnorr-applications-batch-verification/)
- [Schnorr Threshold Sigantures](https://suredbits.com/schnorr-applications-threshold-signatures/)
- [Flexible Round-Optimized Schnorr Threshold – FROST](https://suredbits.com/schnorr-applications-frost/)
- [Schnorr Blind Signatures](https://suredbits.com/schnorr-applications-blind-signatures/)

Taproot 软分叉的内容详见 BIP [340（Schnorr）](https://github.com/bitcoin/bips/blob/master/bip-0340.mediawiki)、[341（SegWit V1）](https://github.com/bitcoin/bips/blob/master/bip-0341.mediawiki) 和 [342（Validation）](https://github.com/bitcoin/bips/blob/master/bip-0342.mediawiki)。这个软分叉是作为 SegWit 的一个新版本（version 1）来实现的，意味着其输出在链上会显示为 “OP_1” 接上一些数据。那些没有升级的节点只会草草验证这些输出，但升级后的节点会将它们理解为 taproot 地址并执行进一步的验证。这也意味着新规则只会影响这种新型的地址（其它所有的 UTXO 都不受影响）。

在我详述所有的更新之前，我想引用 BIP 341 摘要的一些段落，它回答了一些常见的疑问。你肯定也好奇，为什么这么多变更要捆绑到一次升级中，而不是分几次更小的升级来做；BIP 341 的作者说：

> “……将它们分割成独立的升级，会降低我们可以获得的效率和隐私性，而且钱包和服务供应商可能也不喜欢经历多次递增的升级。”

使用同一个软分叉集体引进的方式，使得这些 BIP 所提出的变更可以相互组合，使他人无法分辨用户到底在使用哪种新特性。因此，这样做可以提高我们从中获得的隐私性好处，因为它能让新特性的所有用户共享同一个非常大的匿名集。也即，这三个 BIP 可以很恰当地组合成一个可以穷尽的变更集合。

> “在这个设计中，我们关注 Taproot 和默克尔分支所提供的脚本结构性提升，以及使它们变得有用和有效率的必要变更，以此取得了平衡。对于sighasher 和操作码，我们加入了已知问题的修复措施，但排除了任何独立添加也无妨的新特性。”

如上所述，Taproot 升级由三个主要特性组成：默克尔分支（也即 MAST，默克尔抽象语法树），Taproot（令人困惑的名字，不管是作为升级和还是作为特性），以及 Schnorr 签名。Taproot 也包含了一些很棒的小范围提升，为的是解决比特币协议中两个已知的痛点。我们会逐个讲解这些特性及其提升效果。

## 默克尔分支（MAST）

[默克尔树](https://en.wikipedia.org/wiki/Merkle_tree)是一种基于哈希函数的数据结构，自[比特币概念形成](https://bitcoin.org/bitcoin.pdf)依赖就一直用在比特币中。它使得一个链上的哈希值可以承诺（commit）一个几乎无限大的数据集合。这种数据结构自身是一种[二叉树](https://en.wikipedia.org/wiki/Binary_tree)，每一个节点都包含其子哈希值的哈希值，即 Hash(left_child_hash || right_child_hash) ；而叶子节点是实际上被承诺的数据元素的哈希值。根节点的哈希值一旦上链，拥有整棵树（包括实际数据元素）的任何人都能证明某个叶子节点是这棵树的一部分，办法就是出示从根节点到该叶子节点的分支，无需揭示整个集合中的其它数据。

默克尔树已经用在比特币区块中，用于支持[简易支付验证（SPV）](https://en.bitcoinwiki.org/wiki/Simplified_Payment_Verification)：任何获得了一个完整区块的人，都可以向一个轻客户端证明这个区块中包含了某一笔交易，而无需把整个区块发给这个轻客户端。

Taproot 升级将使花费条件（spending condition）的默克尔树成为使用 UTXO 的新方法。举个例子，假如你想要创建一个输出，这个输出既可以被某个私钥以揭示哈希值原像的方式花费，也可以被另一把密钥在一段时间后直接花费（这是个哈希时间锁合约）。使用默克尔分支，你可以把这两个解锁条件分别做成单独的短脚本，然后用这两个脚本生成一棵默克尔树，并把默克尔根哈希值发布到链上。当需要使用这个输出时，你只需为自己要用到的那个条件，提供一个默克尔证明，即可；无需公开你没有用到的其它条件；这样揭示的脚本，使用起来与普通的脚本一样。

这种使用默克尔树来承诺脚本的提议通常叫做 “默克尔抽象语法树（MAST）”。它的提升在于隐私性，你在花费一个 UTXO 时，无需再揭示完整的脚本；而且，在使用较大、较复杂的花费条件时，可以减少链上的足迹。

MAST 的另一大关键好处是，可以区分的 UTXO 花费行为变得非常少（尤其是结合 Schnorr 签名和密钥聚合）。几乎每一个使用 MAST 的输出都要么会揭示一个使用单公钥定义的花费条件，要么会揭示一个带有时间锁的单公钥花费条件。这样可以把普通的比特币用户（使用单个公钥来花费）和科技范儿的合约用户（使用复杂脚本）的匿名集汇总起来，同时提升这两个群体在链上的隐私性，并提高比特币的同质性（fungibility）。

## Taproot

基于 MAST 的提升，另一个特性是名字让人摸不着头脑的 Taproot（后来升级也叫这个名字）。Taproot 特性背后的想法是，将一直以来泾渭分明的 pay-to-key（给密钥支付）和 pay-to-script（给脚本支付）两种输出类型合并为一种输出类型，即 Tarproot 输出。这是通过在链上安排一个经过微调的公钥来实现的。

$$Q = P + H(P, m) * G$$

*P* 是一个可以花费这个输出的公钥，而 *m* 是一个 MAST 的默克尔根，这棵 MAST 包含了可以花费这个输出的脚本条件。

如果想用 pay-to-public-key 的条件来花费一个 Taproot 输出，你只需提供一个对应于公钥 Q 的数字签名即可，因为你知道 H(P, m)，也知道公钥 P 的私钥，所以你可以把这两个数（原私钥和哈希值）的和作为私钥，生产对应于公钥 Q 的有效签名。

如果你想用 pay-to-script 的条件来花费这个输出，你可以揭示 P 和 m，让验证者看到 Q 实际上是对 m 的承诺，然后你就可以提供自己想用来花费这个输出的脚本，以及它的默克尔证明。

这个方案的结果是，链上的所有（Taproot）输出会显得一模一样；而且进一步地，脚本中如果有多签名合约并设置了 “大家一致同意” 情形的分支，可以直接使用 [MuSig](https://suredbits.com/schnorr-applications-musig/) 密钥聚合，把所有人的公钥聚合为一个 P，这样一来，在所有参与者都愿意合作的情形中，没有任何一方需要公开脚本；他们暴露在链上的足迹，与某一个人花费一个普通的单签名输出没有任何区别！

## Schnorr 签名（OP_CHECKSIG）

Taproot 软分叉最后一个主要的特性是作为 MAST 叶子的 Taproot 脚本，叫做 “TapScript”，它会把操作码 OP_CHECKSIG 和 OP_CHECKSIGVERIFY 解释为检查 [Schnorr 数字签名](https://suredbits.com/introduction-to-schnorr-signatures/)（而不是 ECDSA 签名）的有效性。这个特性的好处是巨大的，整个系列我们都在介绍它，此时就不赘述了。

## 各式各样的改进

除了我们已经解释的三个主要特定，Taproot 升级还包含了其它一些改进。

### **新的 SigHash 算法**

在我看来，这里最重要的地方在于，引入这个新的签名哈希模式使其对 Taproot 输出有效，不仅能承诺 SIGHASH_ALL 在当前的的比特币交易中承诺的全部东西，还能承诺被签名的交易正在花费所有交易输出。

这对于所有多方参与的协议都是非常重要的，因为它使得不能访问 UTXO 集合的签名客户端（例如，硬件钱包和闪电网络客户端）也能安全地参与多方的交易签名，无需额外的数据。当前，像[闪电网络](https://github.com/lightningnetwork/lightning-rfc)、[Discreet Log Contracts](https://github.com/discreetlogcontracts/dlcspecs) 这样的协议、硬件钱包，等等，都需要轻客户端解析和验证被（当前要签名的交易）花费的所有交易。这是非常不切实际的，因为交易可能会很大（例如 CoinJoin 交易），而且多方协议可能用到很多输入（因此涉及许多交易）。这个需要额外数据的问题通常被称为 “BIP 143 漏洞”。这种要求也会妨碍修剪后的客户端，因为它们的内存里没有自己的前序交易的数据。

引入这个新的默认签名哈希算法修复了所有这些问题，并且意味着客户端在签名多方协议的交易前不再需要请求额外的数据或作额外的验证。

### **强制执行 MINIMALIF**

另一个小而重要的改进是，MINIMALIF 不再只是个标准，变成了一个强制要求。在此之前，在使用 OP_IF 或者 OP_NOTIF 的时候，人们可以输入任何非空的数据作为 witness，这会被当成 “true”。MINIMALIF 规定 “true” *只能* 被编码为数字 1。不再共识代码中强制实施 MINIMALIF 意味着可能会有 witness 不定形的问题，一个恶意的行动者可以改变他人的脚本 witenss（使之不同于当事人的预期或其他参与者的要求），比如将 1 改成其它数字（比如 2）而不会影响脚本 witness 的有效性。在 Taproot 输出中，在 OP_IF 中使用非标准的 “true” 表示会被认为是无效的，因为违反了共识规则。这就消除了不定形攻击的界面。

### **为未来升级铺平道路**

所有的 TapScript（即 MAST 的叶子中的脚本）都将带有版本，因此 TapScript 未来的软分叉升级将不需要新的 SegWit 版本，只需要侵入性小得多的变更：新的 TapScript 版本。同样地，某些已经被禁用的操作码可能在 TapScript 中重新解释为 OP_SUCCESS，这使得我们无需重大变更就可通过软分叉引入新的操作码。

### **标签化哈希值**

Taproot 中用到的所有哈希值都是标签化的哈希值。所谓标签化的哈希值，就是在你使用现有的哈希函数（比如 SHA256）时，你把所有需要放到哈希函数里的输入都带上一个特殊的标签作为前缀，来告诉协议这个哈希值是用来干什么的。比如 MAST 叶子哈希值、MAST 分支哈希值，Taproot 哈希值（用于调整公钥），都使用不同的标签。这就创造了所谓的 “域分离（domain separation）”，通过标签来指定解释方法，防止了同一个哈希值以多种不同方式解释所产生的攻击可能。

如果你对上述所有内容的具体实现细节感兴趣，我强烈建议你阅读 BIP [341](https://github.com/bitcoin/bips/blob/master/bip-0341.mediawiki) 和 [342](https://github.com/bitcoin/bips/blob/master/bip-0342.mediawiki)，它们都相对比较易懂。

写完这篇文章，我们就结束了对 Schnorr 签名及其影响的深入探索。我们已经详细梳理了，[Schnorr 签名是什么](https://suredbits.com/introduction-to-schnorr-signatures/)、[为什么它是安全的](https://suredbits.com/schnorr-security-part-1-schnorr-id-protocol/)、它如何能实现[多签名](https://suredbits.com/schnorr-applications-musig/)、[adaptor signatures](https://suredbits.com/schnorr-applications-scriptless-scripts/)、[批量验证](https://suredbits.com/schnorr-applications-batch-verification/)、[门限签名](https://suredbits.com/schnorr-applications-threshold-signatures/)、[盲签名](https://suredbits.com/schnorr-applications-blind-signatures/)，以及如何将它引入比特币，等等！[bitcoin-core 软件最近已经加入对 Schnorr 签名的支持](https://github.com/bitcoin/bitcoin/pull/19944)，[而且已经有公开的 PR 包含了 Taproot 升级](https://github.com/bitcoin/bitcoin/pull/19953)（如果你感兴趣并且有能力，应该去审核一下！）。一旦这些新代码被合并到代码库中，剩下的就是[等待激活](https://suredbits.com/activating-taproot/)啦！（译者注：截至本文翻译之时，Taproot 升级已确定将于比特币网络区块高度 709632 处激活。）