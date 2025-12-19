---
title: 'FROST 的关键一步：何为分布式密钥生成？'
author: 'Jonas Nick'
date: '2025/12/19 12:26:55'
cover: ''
excerpt: '为 FROST 而设计的一种独立 DKG'
tags:
- FROST
---


> *作者：Jonas Nick*
>
> *来源：<https://blog.blockstream.com/the-key-to-frost-what-is-distributed-key-generation/>*
>
> *作者：Jonas Nick，Kiara Bickers，Tim Ruffing*
>
> *原文出版于 2024 年 8 月。*

“Multisig（多签名）” 对于比特币领域的大部分人，都是一个熟悉的概念：一笔多签名交易要求来自多个参与者的许可，才能生效。但是，在此，我们要区分 “*n-of-n* ” 多重签名和 “*t-of-n* ” 门限签名；前者指的是参与者有 *n* 个，他们全都需要许可；而后者指的是，只需 *t* 个（更少数量的参与者），就足以许可交易。使用 MuSig、[MuSig-DN](https://blog.blockstream.com/musig-dn-schnorr-multisignatures-with-verifiably-deterministic-nonces/) 和 [MuSig2](https://blog.blockstream.com/musig2-is-pending-two-new-bips-introducing-a-new-era-of-multisig-privacy/) 这样的多种签名方案，还有（由 Komlo 和 Goldberg 提出的） [FROST](https://eprint.iacr.org/2020/852.pdf?ref=blog.blockstream.com) 这样的门限签名方案，可以减少交易成本，并且提高多签名钱包的隐私性。

迄今为止，在比特币社区中，FROST 仅被用于实验环境。在本文中，我们会解释现状的成因，以及我们如何致力于推动 FROST 进入比特币的生产环境 —— 通过我们近期发布的 “ChillDKG” 分布式密钥生成协议的 [BIP 草案](https://github.com/BlockstreamResearch/bip-frost-dkg?ref=blog.blockstream.com)。

那么首先，使用 FROST 门限签名方案由什么好处？

## 使用 MuSig2 和 FROST 可以获得隐私性和效率性好处

使用了 MuSig2 或者 FROST 这样的方案，即便是多个参与者参与到了签名流程中，结果也只有一个签名。

这不仅给了参与者隐私性优势 —— 最终的交易看起来就跟常规的单签名钱包交易一样；它还能精简交易、降低交易的体积，从而降低交易手续费。都是好事情！

[视频：Blockstream 研究总监 Andrew Poelstra 解释 MuSig2 协议及其好处](https://youtu.be/B-tqX9DfT4g)

MuSig2 和 FROST 让比特币的多签名钱包用户的交易成本降低到了与常规的单签名钱包相同。这种成本好处，对于有大量签名人和频繁交易的系统 —— 比如 [Liquid](https://liquid.net/?ref=blog.blockstream.com) 这样的联盟侧链，还有 [Fedimint](https://glossary.blockstream.com/fedimint/?ref=blog.blockstream.com) —— 来说，是极为重要的。传统的多签名脚本会留下可辨识的指纹，让区块链观察者能识别出多签名交易；而基于 FROST 的钱包的交易，与常规的单签名钱包的交易，在区块链上是无法区分的。因此，相比于传统的多签名钱包，它提供了隐私性提升。

虽然 MuSig2 已经在比特币行业中得到了采用，FROST（至少就我们所知）却还未获得同等的采用。这可能让人惊讶，因为现在已经有了多种 FROST 实现，比如 [ZF FROST](https://github.com/ZcashFoundation/frost/?ref=blog.blockstream.com)（来自 Zcash 基金会）、[secp256kfun](https://github.com/LLFourn/secp256kfun/?ref=blog.blockstream.com)（来自 Lloyd Fournier），在 [libsecp256k1-zkp](https://github.com/BlockstreamResearch/secp256k1-zkp/pull/138?ref=blog.blockstream.com)（来自 Jesse Posner 和 Blockstream Research）也有一个实验性实现。甚至 FROST 还有一项 IETF（互联网工程任务组）规范：[RFC 9591](https://datatracker.ietf.org/doc/html/rfc9591?ref=blog.blockstream.com)（虽然因为 Taproot 密钥调整和 x-only 公钥形式，该规范跟比特币无法兼容）。最合理的解释之一是，FROST 的密钥生成流程比 MuSig2 的要复杂得多。

## 未解之谜：FROST 还未进入生产环境

[FROST](https://glossary.blockstream.com/frost/?ref=blog.blockstream.com) 本质上由两部分组成：密钥生成和签名。虽然它的签名流程与 MuSig2 的签名流程非常相似，但其密钥生成流程却要比 MuSig2 的复杂很多。FROST 的密钥生成流程可以是受信任的，也可以是分布式的：

1. 在 “受信任的密钥生成” 中，一个 “受信任的处理人” 会生成密钥，然后将密钥碎片分发给签名人。这个处理人代表着一个单点故障：如果他是恶意的，或者被劫持了，那么这个 FROST 钱包就有被洗劫的风险。
2. 在 “分布式的密钥生成（DKG）” 中，虽然不再需要一个受信任的处理人，但也面临独有的挑战：所有的参与者都需要参与到一个交互式的密钥生成 “仪式” 中；完成了仪式，才能开始签名。

[视频：Andrew Poelstra 讨论 FROST 带来门限签名](https://youtu.be/odvlj0RutJs)

## 核心挑战：Agreement

DKG 通常需要参与者之间具有安全的 —— 即，带有身份验证并且加密的 —— 信息通道，以分发秘密值碎片给各个签名人；还要有一种安全的取得一致（agreement）的机制。安全同意机制的目的是为了保证，所有的参与者最终会对 DKG 的结果达成一致意见，这不仅包括参数（比如所生成的门限公钥），还有是否发生了错误、仪式是否因为行为不轨的参与者而中断。

然而， IETF 的规范完全不考虑 DKG，上面提到的 FROST 实现，也都不实现安全同意机制，而将这个任务留给代码库的使用者。但是，同意机制实现起来也不简单：现有有不计其数的协议，各有各的偏好，从简单的回声广播方案（echo broadcast shemes），到完整的拜占庭共识协议，不一而足；而且，它们的安全性和易用性保证都有很大差别（但也有相当微妙的地方）。

尽管这个同意协议的泥潭可能引发许多困惑，DKG 对所依赖的同意机制的具体偏好，通常都没有清晰地传达给工程师，任他们一头雾水。

## ChillDKG：为 FROST 而设计的一种独立 DKG

为了克服这个障碍，我们提出了 “ChillDKG”，一种新的 “开箱即用” DKG 协议，为 FROST 的用法量身定制（[草案](https://github.com/BlockstreamResearch/bip-frost-dkg?ref=blog.blockstream.com)）。我们以 BIP 草案的形式提供了详细的描述；而 BIP 本身就旨在称为指导实现者的规范。

ChillDKG 的主要特性在于它是独立的：安全信道和安全同意的建立，都是在协议内完成的，只是所有底层的复杂性都会隐藏起来，只有一个简单的、难以误用的 API 。因此，ChillDKG 已经准备好了用在实际场景中，并不依赖于任何启动假设，唯一的假设是：每一个签名人都已经直到了联合签名人的集合，各签名人用单个的公钥来识别。ChillDKG 基于 “SimplPedPop” 协议；Blockstream Research 参与到了后者的设计和形式化安全证明中，详见发表于 CRYPTO 2023 会议的[论文](https://eprint.iacr.org/2023/899?ref=blog.blockstream.com)《无需代数群模式的实用 Schnorr 门限签名》，作者是 Chu、Gerhart、Ruffing（来自 Blockstream Research）和 Schröder 。

ChillDKG 的其它设计目标有：

- **广泛可应用**：ChillDKG 支持广泛的实用场景，从签名设备都由单个人持有并相互连接的情形，到居住于不同这位置的多位持有者各自管理签名设备的情形。
- **简单备份**：无需在安全位置备份来自其他签名人的秘密值，ChillDKG 允许仅仅从设备种子词和公开数据（对所有 DKG 参与者都一样）中恢复钱包。因此，获得了公开备份数据的攻击者无法获得秘密的签名密钥，而如果某个用户丢失了备份，可以从其他诚实签名人那里重新获得。

[ChillDKG BIP](https://github.com/BlockstreamResearch/bip-frost-dkg?ref=blog.blockstream.com) 当前还在草案阶段，我们正在寻求对设计选择和实现细节的反馈。虽然这份规范已经大部分完成了，它还缺少测试向量，而且我们还在考虑添加一些额外的特性（例如 “可识别的终止”）。一旦完成，这个 BIP 就可以结合一个为 FROST 签名而撰写的 BIP，将完整的 FROST 协议实例化。

（完）