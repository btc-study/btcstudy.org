---
title: 'Taproot 如何有益于硬件钱包'
author: 'SatoshiLabs'
date: '2021/10/09 17:06:44'
cover: '../images/how-taproot-will-benefit-hardware-wallets/a4f439b91d004371960f738cf0bbe116.png'
excerpt: 'Taproot 将带来更高效和更快的交易，会让网络更易用、更安然，同时还能修补手续费设置漏洞并提高隐私性。'
categories:
- 比特币主网
tags:
- 比特币
- Taproot
---


> *作者：SatoshiLabs*
> 
> *来源：<https://blog.trezor.io/how-taproot-will-benefit-hardware-wallets-fa43c0b6123e>*


![1](../images/how-taproot-will-benefit-hardware-wallets/a4f439b91d004371960f738cf0bbe116.png)

最新的一个比特币升级 —— [Taproot](https://github.com/bitcoin/bips/blob/master/bip-0341.mediawiki) —— 将改变比特币的工作模式，使之更上一层楼。它改变了交易的签名方法，移除了不必要的信息暴露（比如是否涉及智能合约），还降低了一笔交易需要占用的整体数据量。所以说，它对用户隐私有正面影响，也使得一个区块能塞入更多复杂的交易，提高网络的效率。

虽然 Taproot 是后向兼容的，意味着用户不需要专门做什么来使用它，而矿工们需要承诺会升级软件。“[Signalling for Taproot](https://taproot.watch/)（Taproot 升级许诺）” 的活动已从上周开始，迄今已有 6 个矿池表示已准备好升级，SegWit 将从版本 0 升级到版本 1。（编者注：原文撰写于 2021 年 3 月 7 日，在翻译之时，Taproot 的升级已成定局。需要多说一句的是，比特币协议的升级是一个过程，而不是一个瞬间，因为不升级的节点同样能留在网络中。）

尽管许多人在期待 Taproot 带来如理论上那般美好的隐私性和可扩展性提升，也有一些人担心它会步 Segwit 第一个实现的后尘，在软分叉激活后两年时间，接受度才堪堪突破 50%。

本文的目的不是比较 Taproot 的好处和缺点。许多有志于此的博客，都已经把主要的意见解释得很深入了，比如[这篇来自 SlushPool 运营者 Braiins 的平易近人的文章](https://braiins.com/blog/explain-like-im-not-a-developer-taproot-privacy)（[中文译本](https://ethfans.org/posts/explain-like-im-not-a-developer-taproot-privacy)）。我们考虑的点相当单一，就是 Taproot 升级对硬件钱包来说到底意味着什么，以及如果 Taproot 能在 11 月成功激活的话，可以期待出现什么有意思的事。

## Taproot 契合了比特币的保守主义

不管你喜不喜欢，比特币网络的治理规则之一就是区块大小是限定的。这就意味着一个区块只能塞进约 3000 笔交易，换算过来就是每秒约 5 笔交易的吞吐量。单从绝对数值来看，这个数字相当低，但有很多理由可以为之辩护，可以解释为什么这种取舍比其它更加中心化的方案要好：

1. 交易在一段时间内就清算完成，不像借记卡之类的，要等待第三方的确认
2. 诸如闪电网络这样的升级可以将数千笔链下交易压缩为一笔链上交易
3. 任何人都无法取消、逆转或拦截一笔已经上链的交易

一些比特币的批评者提议过提高区块的大小，但这是一种幼稚而且危险的办法。相反，[比特币的保守主义特性](https://blog.trezor.io/why-is-bitcoin-development-so-conservative-a22d37765c5b)（[中文译本](https://ethfans.org/posts/why-is-bitcoin-development-so-conservativ)）引领着开发者研究其它更优雅的方法来缩小交易的体积，用更聪明的密码学来提升比特币。保持比特币的小区块，也间接地实现了更大的去中心化。

对于希望自己运行一个节点的普通用户而言，他们现在可以使用便宜的解决方案（比如树莓派和一块硬盘），或者拿旧的笔记本电脑下载一份比特币网络的副本就行。任何人都能帮助验证比特币网络上的交易以及保护比特币区块链的安全，不限地域，无需专门采购新的硬件并持续追加存储空间，更无需依赖中心化的服务商（比如交易所）代他们来同步和验证区块链。

提高区块大小之后，个人运行节点的成本很快会变得令人望而却步。但 Taproot 引入了一种新的签名方案，Schnorr 签名，它可以在 SegWit v0 的基础上进一步缩小交易的体积，也就是让一个区块能塞进更多的交易。这等效于提高了区块的大小，但没有提高同步一个节点的带宽要求，也没有导致节点存储的成本膨胀，确保了参与比特币网络对普通用户来说仍然是力所能及的。

## Taproot 如何提升硬件钱包的体验？

对于硬件钱包来说，Taproot 有希望带来更高的效率，体现在发送交易所需的时间上；前序交易的[输入](https://wiki.trezor.io/Input)和[输出](https://wiki.trezor.io/Transaction_output)的平均数量越多，时间上的节省越多。这是因为有了 Taproot 之后，钱包无需花费之前发送（通常体量很大）的交易历史。

对于一笔只有一个输入和两个输出的交易，使用 Taproot 可以节约大概 50% 的时间（相比于 SegWit v0 交易）。这个数字看起来很棒，但在实际使用中用户不会有什么感觉。但随着输入的数量增加，节省的时间也随之增加：如果有 100 个输入（但仍是 2 个输出）那么发送交易的时间可以节约 90%。

对于更复杂的，带有大量输入和输出所组成的历史的交易，比如 CoinJoined（混币）交易，节省更为巨大。假设一次混币有 100 位参与者，使用 Taproot 的签名时间可以比当前的 SegWit 交易快上几十倍。[Trezor 已计划在今年底引入 CoinJoin 功能](https://github.com/orgs/trezor/projects/28)，Taproot 将使这些隐私交易用起来更快更简单。

## Taproot 给多签名钱包、闪电网络和智能合约带来的好处

随着比特币的用户越来越多样化，用上不同类型的地址、像闪电网络这样的二层方案或是其它类型的智能钱包，识别出特定钱包的活动变得更加容易，也即隐私更岌岌可危。Schnorr 签名取消了暴露智能合约脚本的需要，使得所有交易看起来都一样，提高了隐私性。

许多企业现正使用多签名合约来管理资金，很多个人用户也正使用闪电网络来节约链上交易费，所以 Taproot 是一个大家迫切需要的解决方案，它使得用户可以在链上执行交易而不暴露有多少参与者和他们使用了智能合约这个事实。

至于性能，在 Jameson Lopp 的[硬件钱包的多签名合约测试](https://blog.keys.casa/bitcoin-multisig-hardware-signing-performance/)中，Trezor 即使在更极端的条件下也表现优良。但随着签名数量的提高，签名的时间也越来越长，长到完全不可用。感谢 Schnorr 签名，这将不再是问题，因为不再需要传输前序交易。在 Taproot 激活之后，即使最复杂的多签名方案，也可以在数分钟，甚至数秒之内完成。

## 用 Taproot 修补手续费设置漏洞

Taproot 还有一个额外的好处，修补了一个长期存在的、与手续费有关的理论攻击向量，我们在[这篇固件更新的博客](https://blog.trezor.io/details-of-firmware-updates-for-trezor-one-version-1-9-1-and-trezor-model-t-version-2-3-1-1eba8f60f2dd)中有详细描述。在当前的 SegWit 和 P2SH 交易中，手续费并不是以一个显式的元数据字段表示出来的，而是以交易的数据推断出来的。

这就引发了一个漏洞：攻击者可以诱骗用户支付异常巨大的手续费，而用户可能在看似无害的操作中浑然不觉。当然，你的 Trezor 总是会显示准确的交易费数额，但有了 Taproot，所有输入的数额都会显式地包含在需要签名的数据中（当前可不是这样的），从而保护使用不那么可靠的手续费算法的用户；因为，当攻击者试图向钱包软件谎报输入的数额时，钱包软件所生成的签名就不会被网络接受。

## Taproot 是向可持续的网络成长迈出的正确一步

从工程的角度看，Tarproot 的好处是巨大的。更高效和更快的交易，会让网络更易用、更安全，同时还能修补手续费设置漏洞并提高隐私性。而可能的弊端，是 Taproot 会被当作另一种识别用户行为的方式，不过这个弊端只会在 Taproot 接受度不见进展时才会出现。考虑到 Taproot 在社交网络上获得的狂热支持，应该不会出现这种情形。

只要使用 Taproot —— 这样做的理由是充分的 —— 识别个人地址的难度就会变得更大。现在，用户要等待矿池铺平道路，[在 11 月激活之前公开表示对 Taproot 的支持](https://taproot.watch/)。大矿池需要考虑到自己的用户。而且如果不表示支持，他们的声誉可能也会受损。但最终如果再来一次用户激活的软分叉，他们的影响力会进一步降低，而升级仍会激活。

Taproot 是这个行业的合理下一步，Trezor 全心全意支持它。硬件钱包会因此变得更高效，用户在安全性和隐私性之间将有更多选择。随着比特币变得更加普及，Taproot 升级会是扩展网络、迎接全球用户的关键，而 Trezor 已经准备好交付了。

（完）