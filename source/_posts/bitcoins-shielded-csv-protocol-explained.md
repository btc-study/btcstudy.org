---
title: '暗影 CSV 协议简介'
author: 'Kiara Bickers'
date: '2025/06/13 00:44:55'
cover: ''
excerpt: 'CSV 将交易验证的负担从网络的每一个全节点处转移给各个交易的接收者'
tags:
- shielded-csv
---


> *作者：Kiara Bickers*
> 
> *来源：<https://blog.blockstream.com/bitcoins-shielded-csv-protocol-explained/>*



今日的比特币开发主要关注两个方向：（1）扩容；（2）隐私性。常见的提议往往需要向比特币的脚本系统添加新的操作码和编程工具。但一种古老的想法也在回归：可以用更加隐私和点对点的方式来制作交易。当前，每一笔比特币交易都会广播到整个网络中，用于验证。这是防止重复花费的有效方法、但也意味着所暴露的信息超过了严格必要的程度。这导致了更重的计算负担、更高的代价，以及难以扩大吞吐量的系统。但如果我们将交易处理的一部分交给受益方（client-side），这岂不是既提高了效率、又给比特币的隐私性打开了一个新天地？

在我们最近出版的论文中，Blockstream 与 Alpen Labs、ZeroSync 一起，开发出了 “暗影 CSV 协议（Shielded CSV Protocol）”，是对受益方验证协议（译者注：有时也译为 “客户端验证协议”）的提升，提供了完全隐私的交易。这一新协议是加强比特币交易隐私性道路上的重大一步，而且，通过我们会在本文中介绍的额外措施，有望将交易吞吐量从每秒 11 笔提升到超过每秒 100 笔。

本文提供了对暗影 CSV 协议的概要介绍。暗影 CSV 协议的目标是提高一层区块链的性能，同时保持跟比特币的完全兼容。该协议由 [Jonas Nick](https://x.com/n1ckler?ref=blog.blockstream.com)、[Liam Eagen](https://x.com/liameagen?ref=blog.blockstream.com) 和 [Robin Linus](https://x.com/robin_linus?ref=blog.blockstream.com) 联手打造。以下是暗影 CSV 协议背后的故事，以及何以它有潜力改变一切。

## 比特币的过去和现在

### 重复花费问题：比特币如何解决它

在比特币诞生以前，人们普遍相信，创建一种没有受信任中间人的可靠电子货币是不可能的。重复花费问题意味着，没有办法可以保证一个 “电子钱币” 只能花费一次。这是阻碍电子货币成为现实的根本问题。

然后，在 2009 年，中本聪通过引入现在称为 “区块链” 的共享公开账本解决了这个问题。比特币不依赖于哪一个受信任的权威，而在共享公开账本的基础上形成一个由节点组成的网络；每一笔交易都会在公开账本中得到记录和验证。这个系统保证了每一个钱币都是唯一的，所以你没法一币多花。

当我们要让区块链记录一笔比特币交易时，需要经历这样一个流程：

1. 用户的钱包软件签名这笔交易，并将它广播到比特币网络中；
2. 网络中的全节点会验证这笔交易，保证一切都没有出问题；
3. 然后这笔交易会被包含在一个区块中，得到整个网络的确认，然后永久记录在共享的公开账本中。

在验证过程中，节点要确认被这笔交易花费的钱币真的存在、检查电子签名的有效性，然后强制执行关键的抗重复花费规则 —— 确保每一个钱币都只被花费了一次。账本的唯一意义是确定交易的顺序、明确地展示谁拥有某一个钱币、这些钱币什么时候转移了。

自比特币诞生以来，开发者们一直在思考同一个问题：这真的是最好、最隐私的交易处理方式吗？我们如何让这个系统更精简、更高效、更隐私呢？

### 隐私问题：公开的交易

比特币最大的隐私性挑战在于，比特币的交易是公开在区块链上的。中本聪从一开始就看出了这个问题。在原版的白皮书中，他提出了一种直截了当的解决方案：用户应该为每一笔交易创建新的公钥，避免重复使用旧地址。

这个点子使交易难以跟单个所有者关联起来。然而，在现实中，使用今天可得的各种高级区块链分析方法，保护隐私笔看起来要难得多。即使换用了新地址，对于有心跟踪用户活动的人来说，将交易关联起来、识别特征，都变得比以前更容易了。

作为应对，Zcash 这样专注隐私的协议已经进入了取消交易细节的创新方法；它使用了更加高级的密码学，比如 [zk-SNARKs](https://glossary.blockstream.com/snarks/?ref=blog.blockstream.com)。但这些方法也有巨大的代价：交易的体积变得更大，让节点的验证过程耗费更多资源。

### 沟通问题：沟通是低效的

在比特币的设计中，挖矿服务于两个基础目标：（1）交易的 “出版证明”；（2）为交易的顺序提供共识。然而，比特币系统也让这两个核心功能与不那么核心的任务交织在一起：交易的验证和货币发行。

纵观所有区块链系统，无论是比特币、以太坊、Zcash 还是 Dogecoin，交易的流程看起来都是一样个：钱包签名交易、广播到网络中、全节点验证它们。*但是，直接验证区块链上的每一笔交易是必要的吗？*

我们认为有更好的方法。这个观念可以追溯到一个[于 2013 年提出的洞见](https://lists.linuxfoundation.org/pipermail/bitcoin-dev/2013-November/003714.html?ref=blog.blockstream.com)，来自 Peter Todd 的 “受益方验证（CSV）”。在这篇邮件组帖子中，他问道，“*如果只有出版证明和对交易顺序的共识，我们能创造一个成功的密码货币系统吗？令人惊讶，答案是肯定的！*”

CSV 不要求每一个全节点都验证每一笔交易，而让你可以将钱币以及关于其有效性的证据直接发送给接受方。这就意味着，即使一个区块包含了一笔无效交易，全节点也不会拒绝它。结果？结果是更少的链上沟通，以及整体上更加高效的系统。

### CSV：一种点对点的扩容方案

CSV 将交易验证的负担从网络的每一个全节点处转移给各个交易的接收者。这让比特币变得更加 *点对点*。设想如果我们不需要使用区块链来存储所有的交易细节。你不使用一笔详细的、可能跟你的身犯关联起来的交易，而仅仅使用一个简单的 64 字节的废止符（nullifier），它对于观察区块链上的公开记录的任何人都毫无意义，只对发送者和接收者有意义。

如果每个节点都需要验证每一笔交易，整个网络自然就被拖慢了。将交易的验证转移给受益方，存储在区块链上的数据可以大大缩减 —— 从平均 560 重量单位（WU）变成 64 WU，缩小大约 8.75 倍，系统会变得更加精简和高效。

这样的可塑性协议给比特币带来了巨大的可扩展性能量，让用户可以处理额外 10 倍数量的交易 —— 大约是每秒 100 笔。

## 比特币的今天

你可能会说，“说起来容易，做起来难。它到底是怎么回事？有什么取舍？”

### 暗影 CSV 如何让比特币变得更加隐私？

相比于透明的区块链交易，CSV 协议一般都会提高隐私性，因为一些信息只转移给了受益方。但是，在传统的 CSV 协议，比如 RGB 和 Taproot Assets  中，一个钱币一旦发送出去，发送方和接收方就都能看到完整的交易历史。

而在暗影 CSV 协议中，我们使用类似于 zk-SNARK 的方案来 “压缩” 证据，保证不泄露任何交易信息。这意味着，交易的历史是隐藏的；相比于现有的协议，提供了更好的隐私性。

### 什么是 “废止符”，它如何防止重复花费？

在发起一笔支付的时候，发送者将交易直接传给接收者。从交易推导处的一小段数据会被写入区块链，称做 “废止符”。

网络中的全节点只需要对每一个暗影 CSV 废止符执行一次 Schnorr 签名验证。接收者检查钱币的有效性，并确保废止符放在了区块链上，以阻止任何重复花费。

其它 CSV 协议也有废止符，但在许多情况下，它们都是完整的比特币交易，而不是我们这里使用的派生出来的 “随机泡沫”。暗影 CSV 废止符使得区块链分析更难执行。

### 暗影 CSV 是否需要软分叉或者硬分叉？

暗影 CSV 不需要软分叉和[硬分叉](https://glossary.blockstream.com/fork/?ref=blog.blockstream.com)。它自始至终与比特币兼容。CSV 将交易的验证从共识规则中脱离出来，获得了灵活性，又不需要变更核心协议。因为比特币可以存储任意类型的数据，不同的 CSV 协议，比如 RGB、Taproot Assets，乃至多个版本的暗影 CSV，都可以一起存在，没有冲突。

节点不必因为区块包含了不熟悉的数据就拒绝它。相反，这些数据只需要在 “受益方” 处解析，如果这些数据与他们有关的话。通过卸除交易验证的负载，区块链的主要目标就化简成了：以一致认可的顺序确认交易数据、防止重复花费。

### 暗影 CSV 是否允许我交易比特币？

暗影 CSV 会作为一个独立的系统，使用比特币区块链来记录废止符以及防止 CSV 协议中的重复花费。但若要让它直接与比特币集成、实现无摩擦的交易，就依然需要一种桥接方案。当前的协议没有深入探究 BitVM 的桥接方案是如何工作的，但这是一个开发和研究依然活跃的领域。

当前，通过使用一个受信任的第三方或者一个联盟，桥接是可以实现的，但最终目标是一个完全免信任的系统。实现这个目标意味着要在比特币和暗影 CSV 之间建立真实、无缝的互动，让用户能够从加强的隐私性中获益，而不需要放弃比特币的免信任数据。这是一个复杂的挑战，但也是可以重新定义比特币如何扩展、如何保证交易安全性的挑战。

## 阅读完整的论文

暗影 CSV 协议提供了一种方法来提升比特币的可扩展性和隐私性，有望为更加高效的点对点交易打开新天地。通过将交易验证的负担转移给受益方，链上数据得以极大减少，因此更高的交易吞吐量和更强的隐私性得以实现 —— 所有这些都不需要软分叉和硬分叉。如果你好奇这套协议的工作原理和其中的取舍，非常推荐你阅读完整的论文：“[暗影 CSV：隐私而高效的受益方验证](https://t.co/3WLFEtiDMB?ref=blog.blockstream.com)”。这可能是比特币的未来。

> 译者注：令人遗憾的是本文仅止步于介绍 CSV 的基本原理及其潜力，并未透彻地介绍暗影 CSV 协议及其与现有其它协议的区别。简单来说，暗影 CSV 放弃了 RGB 和 Taproot Assets 所使用的 “一次性密封” 范式，转而加入了一种账户。账户有自身的状态，钱币也有自身的状态，交易意味着同步更新钱币的状态以及发送者账户的状态，从而允许验证废止符只生效了一次。
>
> 尽管协议作者们加入了许多压缩证据体积的方法（比如基于证明系统的证据压缩，以及基于 Schnorr 签名的非交互式聚合签名），提高了协议的吞吐量，但由于其放弃了一次性密封范式，它与基于比特币 UTXO 的扩容方案会面临更多隔阂。