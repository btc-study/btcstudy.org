---
title: 'Taproot v2：比特币还能如何演化？'
author: 'Josef Tětek'
date: '2021/12/23 23:44:51'
cover: '../images/taproot-v2-how-will-the-latest-bitcoin-upgrade-evolve-in-the-future/M06zVg1XWuQ'
excerpt: 'Taproot 已经让比特币变得更美好了。但之后呢？'
categories:
- 比特币主网
tags:
- CISA
- eltoo
---


> *作者：Josef Tětek*
> 
> *来源：<https://blog.trezor.io/taproot-v2-how-will-the-latest-bitcoin-upgrade-evolve-in-the-future-e8559d0c5886>*



![Taproot brings benefits to Bitcoin and will improve performance of hardware wallets.](../images/taproot-v2-how-will-the-latest-bitcoin-upgrade-evolve-in-the-future/M06zVg1XWuQ)

Taproot 升级已经于 11 月 14 日（[区块号 709632](https://btc1.trezor.io/block/0000000000000000000687bca986194dc2c1f949318629b44bb54ec0a94d8244)）激活。这个最新的比特币协议升级带来了许多令人激动的东西 —— 但**未来版本的 Taproot** 可能更是如此。本文中，我会介绍 Taproot 未来可能的迭代，以及它们可能会给 Trezor 用户带来什么。

## SegWit 的版本

SegWit（隔离见证）于 2017 年在比特币上实现时，它也带来了一个版本系统：第一版的隔离见证版本号被安排成 v0，后续的版本则使用递推的版本号。引入版本系统的理由是它在未来可以更平滑地引入新的操作码，并与现有的验证规则保持平行。

实际上，[Taproot 的正式提案](https://github.com/bitcoin/bips/blob/master/bip-0341.mediawiki)叫做 *SegWit version 1 花费规则*，因为这就是它的实质：原始的 SegWit 的进一步延伸。以这种方式实现比特币协议的升级，保证了**最低的故障率**，因为比特币节点已经熟悉了 SegWit 类型交易的特性。Taproot 升级以这种方式平滑发布的经历，证明了比特币可以用这种方式升级而不陷入任何的争用和崩溃，对未来的升级有非常好的示范作用。

[链接：Taproot 升级如何有益于以硬件钱包](https://blog.trezor.io/how-taproot-will-benefit-hardware-wallets-fa43c0b6123e)（[中文译本](https://www.btcstudy.org/2021/10/09/how-taproot-will-benefit-hardware-wallets/)）

而 **Taproot 的未来升级**，也即 SegWit 的进一步升级，毫无疑问也会继续。现在激活的 Taproot 只是把最紧要且经过了时间考验的技术，比如 Schnorr 数字签名和默克尔抽象语法树（MAST）加了进来，但还有许多更有前景的升级尚未亮剑。如比特币核心开发者 Gregory Maxwell 在一个 [Reddit 帖子](https://www.reddit.com/r/Bitcoin/comments/hqzp14/comment/fyblgg4/?utm_source=share&utm_medium=web2x&context=3)里面解释的：

> 许多已知非常有用的功能都被排除在 Taproot 之外，为了让那些完全不需要新的研究和艰难取舍的东西尽快实现，也为了从真实的用例中获得反馈、指引下一个版本的方向。

不过，现在的 Taproot 升级也是相当强大的。简要回顾一下，它有这些**主要优点**：

- Schnorr 签名可以实现签名聚合（在多签名应用中很有用）；
- 多签名交易、闪电网络的开启和关闭交易，可以变得跟普通的支付无法区分；
- 在硬件钱包交易的签名和广播速度上的提升，让 CoinJoin 功能在硬件钱包中的实现也变得可行；
- 消除了潜在的[手续费利用漏洞](https://blog.trezor.io/details-of-firmware-updates-for-trezor-one-version-1-9-1-and-trezor-model-t-version-2-3-1-1eba8f60f2dd)；
- 有了 Tapscript，为比特币引入新的操作码会变的更加直接。

## CISA：所有比特币，一律平等

Taproot 升级有望启用的一个最激动人心的升级叫做 “跨输入的签名聚合（Cross-input signature aggregation，CISA）”。当前的 Taproot 已经可以聚合花费 *一个输入* 的多个签名成为一个签名 —— 让复杂的交易比如多签名和闪电网络的通道管理变得更隐私、更便宜。

CISA 将允许 *多个输入* 的签名可以聚合成一个签名。虽然听起来只是对当前的签名聚合功能的微小改进，它对**手续费节约和用户隐私**可以产生巨大的影响。

首先，普通的比特币交易将能受益于 CISA，因为**即使是单纯的支付，也可能包含多个输入**：当用户的支付需要超过任一历史交易收入数额的时候（也即没有单个 UTXO 的面额足够大的时候），他们就不得不在交易中使用多个输入。

当前，每个输入都要匹配一个独立的签名，这会占据更大的区块空间、要求用户付出更多的交易费。有了 CISA，**即使使用多个输入，也只需附带一个签名**，大大节约区块空间（以及用户需要支付的交易费）。

CoinJoin 交易也会大大受益，因为 CoinJoin 本质上就是一笔交易使用了许多输入。如果有跨输入的签名聚合，CoinJoin 将变得便宜跟多，**甚至于使用 CoinJoin 来支付可能比普通支付还要稍微便宜一些**。

这种激励会大大拓宽 CoinJoin 的匿名集（在撰文之时，一个最流行的 CoinJoin 池子 —— Samourai Whirlpool —— 也只包含 4350 BTC，数据来自 [Clark Moody 的公开牌](https://bitcoin.clarkmoody.com/dashboard/)）。有了随处可及的 CoinJoin，当前形式的链监控将变得几乎没用处。

![img](../images/taproot-v2-how-will-the-latest-bitcoin-upgrade-evolve-in-the-future/deWZc9FgiMT)

最后，跨输出的聚合也意味着，小面额的 UTXO （比如几百个、小几千个聪面额的 UTXO）整合（形成一个更大面额的 UTXO）将变得更便宜。不过注意，这**只适用于 Taproot 地址上的 UTXO** —— [传统地址和 SegWit 地址](https://blog.trezor.io/bitcoin-addresses-and-how-to-use-them-35e7312098ff)（[中文译本](https://www.btcstudy.org/2021/09/07/bitcoin-addresses-and-how-to-use-them/)）上的 “粉尘” 无法享受这种好处。

CISA 不是当前的 Taproot 的一部分，主要是因为我们需要更多时间来理解它的所有后果（[这个 Reddit 帖子](https://www.reddit.com/r/Bitcoin/comments/ibcnsv/taproot_coinjoins_and_crossinput_signature/)的第二部分概述了 CISA 的好处和不足）。

## Graftroot：委托签名

长期持有比特币有一个尚未得到满意解决的问题，就是**如何交接私钥**，做到既不丢币、又不会损害安全性和隐私性。[Shamir 备份](https://blog.trezor.io/protecting-your-bitcoin-inheritance-with-shamir-backup-77b5bc77ea5a)（[中文译本](https://www.btcstudy.org/2021/10/07/multisig-and-split-backups-two-ways-to-make-your-bitcoin-more-secure/)）在这个方向上迈出了重要的一步，但即使这种方案，也可能会慢慢失效 —— 几十年间丢掉几个部分，是完全有可能的，尤其是在继承计划没有得到定期的维护、继承人也对继承物的性质一无所知的情况下。

[链接：使用 Sharmir 备份来保护你的比特币继承](https://blog.trezor.io/protecting-your-bitcoin-inheritance-with-shamir-backup-77b5bc77ea5a)

Graftroot 可能是继承规划和其他需要逐渐转移特定货币控制权的场景的特效药。Pieter Wuille 在 2018 年提出的 Graftroot，可以让用户把**签名能力委托给一个代理脚本**，该代理脚本会定义从 Taproot 脚本中花费的另类方法 —— 甚至在 Taproot 脚本已经创建之后。

这就意味着，一个 Taproot 地址的所有者可以**将从给定地址花费的权限委托给 TA 的继承人，且无需执行任何链上的交易**，也无需交付任何敏感的数据比如助记词 —— 整个计划会完全保密，有多个备份方案，还有时间锁（所以被指定的继承者无法在所有者瞑目之前使用这些钱）。

继承规划只是安全和隐私委托的一个最明显的应用场景。能够做到委托给多个代理脚本而无需在链上公开任何信息、并且在委托脚本已经部署之后仍然能添加，我们尽可以想象我们还会看到哪些应用场景。

Graftroot 的想法已经被推广成了 [广义 Taproot](https://lists.linuxfoundation.org/pipermail/bitcoin-dev/2018-July/016249.html) 和 [Entroot](https://gist.github.com/sipa/ca1502f8465d0d5032d9dd2465f32603) 提议，而围绕 Taproot 赋能型委托最优形式的讨论仍在继续。

## OP-CAT：抗量子的比特币

对量子计算机的担忧已经持续很多年了，这主要是因为当前大家使用的签名方案（ECDSA 和 Schnorr）都在理论上受到足够高级的量子计算机的威胁。

而 Jeremy Rubis 在他最近讨论这一主题的博客中[声称](https://rubin.io/blog/2021/07/06/quantum-bitcoin/)：一个之前被禁用的比特币操作码 OP-CAT 可以有所帮助。如前所述，Taproot 让新的操作码可以更容易实现，而 OP-CAT 也在考虑之列，因为它有助于实现 Rubins 描述的应用。

## SIGHASH_ANYPREVOUT：提升闪电网络

每一笔比特币都有一个签名哈希值标签（SIGHASH），定义了一个签名签的是交易的哪个部分，那一部分因此也就变成了不能改动的（因为改动该部分会导致此前形成的签名失效）。默认的标签是 SIGHASH_ALL，表示签名的是**整个交易的所有部分**，因此没有一丝的调整空间。但在有些应用场景下，**如果能改动交易的特定元素而不使签名失效，那是非常有用的**。

其中一个应用场景就是 Eltoo，是一个闪电网络通道状态更新机制的提案。Eltoo [在 2018 年提出](https://blog.blockstream.com/en-eltoo-next-lightning/)，优化了当前基于惩罚的通道状态更新机制。基于惩罚的更新机制的问题在于，失手将旧的通道状态广播出去（例如在宕机重启之后）也会导致资金完全损失，即使一开始并没有恶意。它会给用户带来许多挫折，以及造成广泛采用的障碍。

Eltoo **免去了对惩罚措施的需要，同时仍能保护用户**免受恶意行为的攻击。但 Eltoo 需要实现一种新的 sighash 叫做 “**SIGHASH_ANYPREVOUT**” 作为垫脚石，因为它允许用户签名交易时无需承诺具体的交易输入（想了解更详细的解释，请听最近的一期 [Bitcoin Explained](https://bitcoinmagazine.com/technical/how-sighash-anyprevout-and-eltoo-could-improve-the-lightning-network) 播客）。

SIGHASH_ANYPREVOUT 的实现已经在 2017 年以 [BIP118](https://github.com/bitcoin/bips/blob/master/bip-0118.mediawiki) 的形式正式提出，而且非常有可能作为 Taproot 的下一次迭代而被激活。

## 总结

以更低的成本获得更多的隐私性、抗量子、优化的闪电网络 —— 这些是 Taproot 未来最有前景的迭代中的几个。

最近我们在一个 Twitter 空间里面跟来自 Braiins 和 Slush Pool 的专家们深入讨论了 Taproot —— 快来收听[完整版](https://youtu.be/h4892g7jpz8)！

现在还没法断定上面提到的哪些提议会进入比特币协议、什么时候会激活，但有一件事情是确定的：**只有能够大幅提升网络的提议** —— 而且不牺牲去中心化和用户主权的关键属性 —— 才能经过严格额同行评议过程。而且，虽然比特币生态里面的某些公司接受起这些升级会比较慢，[Trezor](https://trezor.io/?utm_source=Medium.com&utm_medium=referral&utm_campaign=2021-12_Taproot%20v2&utm_content=link) 在 Taproot 的实现上一直走在前沿。都是为了用户。

（完）