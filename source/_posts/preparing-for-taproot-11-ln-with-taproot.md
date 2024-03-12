---
title: 'Taproot 与闪电网络'
author: 'ZmnSCPxj'
date: '2022/02/17 14:28:23'
cover: ''
excerpt: '在这篇文章中，我们将介绍 taproot 支持 LN 实现的两个隐私功能'
categories:
- 闪电网络
tags:
- 通道构造
- Taproot
---


> *作者：ZmnSCPxj*
> 
> *来源：<https://bitcoinops.org/en/newsletters/2021/09/01/#preparing-for-taproot-11-ln-with-taproot>*



在这篇文章中，我们将介绍 [taproot](https://bitcoinops.org/en/topics/taproot/) 支持闪电网络（LN）实现的两个隐私功能。

- LN 上的 [PTLC](https://bitcoinops.org/en/topics/ptlc/)（译者注：点时间锁合约，亦称点支付合约，其用意是取代 HTLC。在 HTLC 中，只有知道一个哈希值的原像才能拿走合约中的资金；而在 PTLC 中，要知道一个公钥对应的私钥才能拿走资金）。
- P2TR 通道。

## LN 上的 PTLC

PTLC 实现了[许多功能](https://suredbits.com/payment-points-monotone-access-structures/)，其中一个主要的功能就是支持 LN 在不需要随机路线 <sup><a href="#note1" id="jump-1">1</a></sup> 的情况下实现[支付无关性](https://bitcoinops.org/en/newsletters/2021/08/25/#preparing-for-taproot-10-ptlcs)。沿着单路径或[多路径](https://bitcoinops.org/en/topics/multipath-payments/)路线的每个节点都可以得到一个标量用来调整每个转发的 PTLC，实现*支付无关性*，在这个过程中，任意路由节点都不会再[泄露](https://bitcoinops.org/en/newsletters/2021/08/25/#privacy-problems-with-htlcs) LN 支付的唯一标识（译者注：在 HTLC 实现的多跳支付中，由于大家共用一个哈希值，这个哈希值就成了闪电支付的唯一标识符）。

PTLC **不是隐私的万能药**。如果一个监视者节点看到一个具有特定时间锁和金额的转发，而第二个监视者节点在不久之后看到一个具有更低的时间锁和金额的转发，那么即使监视者节点不能再通过唯一标识哈希值来关联它们，也能推测这些转发很可能属于同一支付路径。但是，PTLC *确实*能够实现下面这几点：

- 增加分析中的不确定性。监视者推测正确的概率现在更低了，因此他们的信息的价值就降低了。
- 在多路径支付中，*有更多* 的不相关因素。不同的路径的时间锁及支付金额相关性不强，且若 LN 成功，其中会有足够多的时间相关性不强的付款。
- 与 [HTLC](https://bitcoinops.org/en/topics/htlc/) 相比，成本没有增加（甚至可能因为[多重签名](https://bitcoinops.org/en/newsletters/2021/08/04/#preparing-for-taproot-7-multisignatures)的效率而略微降低成本）。

原则上，一个 taproot 激活前开设的通道可以直接升级到支持 PTLC，不需要关闭和重新打开通道。现有通道可以在创建链外交易时，将现有的非 taproot 资金输出转为包含 PTLC 的 taproot 输出，这就可以使用 PTLC 了。也就是说，要在 LN 上增加对 PTLC 的支持，除了要求每个节点和它的通道的对等节点升级他们的软件外，不需要用户付出任何成本。

然而，要实际使用 PTLC，从支出方到接收方的每个转发节点都必须支持 PTLC。这意味着在有足够数量的节点升级之前，对 PTLC 的支持可能大部分都不会被使用。节点不一定都需要使用相同的协议（可能会有多个 PTLC 协议），但它们都必须支持某一些 PTLC 协议。支持多个 PTLC 协议会有额外的维护成本，我 *希望* 我们不要有太多这样的协议（最好只有一个）。

### P2TR 通道

提升基础层和 LN 层之间的不相关性的一个方案是[非公开通道](https://bitcoinops.org/en/topics/unannounced-channels/)—— LN 上不会广播这些通道的存在。

不幸的是，每一个 LN 通道都需要两个签名者之间的合作，而在尚未激活 taproot 的比特币中，每一个 2-of-2 脚本都是 *公开* 编码的。LN 是 2-of-2 多签名最主要的使用场景，所以从任何查看区块链的人都可以看到一个 LN 通道被关闭。然后可以基于此追踪资金，如果它们进入另一个 P2WSH 输出，就可以推测出这很可能是 *另一个* 非公开通道。因此，即使是非公开通道，一旦被关闭，也是可以在链上识别的，虽然可能在一定程度上会误判。

Taproot 通过使用 [schnorr 签名](https://bitcoinops.org/en/topics/schnorr-signatures/)，可以让 [n-of-n](https://bitcoinops.org/en/topics/schnorr-signatures/) 看起来和 1-of-1 完全一样。通过一些处理，甚至可以让 [k-of-n](https://bitcoinops.org/en/topics/threshold-signature/) 和 1-of-1（以及 n-of-n）看起来一样。由此我们可以提出一个功能，即一个由 P2TR UTXO 支持的 LN 通道，也就是一个增加了非公开通道的*链上*隐私的 P2TR 通道。<sup><a href="#note2" id="jump-2">2</a></sup>

这种（相当小的）隐私提升也有助于公开的通道。已公开的通道只有在打开的时候才会被广播，所以当有人试图寻找已公开的通道时，不能找到 *历史* 通道。如果监视者想看到每一个已公开的通道，它必须自己存储所有这些数据，无法依赖任何一种存档节点。

此外，taproot keypath 的花费比 LN 现有的 P2WSH 花费小 38.5 vbytes（40%）。不幸的是，你**不能把现有的 pre-taproot 通道升级为 P2TR 通道**。现有的通道使用现有的 P2WSH 2-of-2 方案，必须要关闭才能切换到 P2TR 通道。

从理论上讲，实际的存款交易的输出点只有使用该通道的两个节点关注，网络上的其他节点不会关心任何两个节点之间的通道的安全问题。然而，公开的通道是通过 LN gossip 网络共享的。当一个节点收到一个传输过来的公开通道时，它会咨询自己信任的比特币全节点，检查存款输出点处是否存在，以及更重要的是检查**地址是否正确**。检查地址有助于确保无法滥用通道传播机制，因为你需要区块链上存有资金，才能发送通道信息。因此，在实践中，即使是 P2TR 通道也需要一定程度的远程节点的兼容；否则，发送者在选择路由时会忽略这些通道，因为他们无法验证这些通道是否存在。

### 时间范围

我认为，在一个 FOSS 项目中，给功能确定实现所需时间的最好方法是查看 *以前* 的功能和它们所花的时间，并将这些作为功能实际部署所需时间的参考。<sup><a href="#note3" id="jump-3">3</a></sup>

我认为最近实现的、在范围上与 LN 的 PTLC 相似的主要更能就是[双边供资](https://bitcoinops.org/en/topics/dual-funding/)。Lisa Neigut 在 [BOLTs #524](https://github.com/lightningnetwork/lightning-rfc/issues/524) 中提出了一个关于双边供资协议的初步提案，而[主网上的第一个双边供资通道](https://medium.com/blockstream/c-lightning-opens-first-dual-funded-mainnet-lightning-channel-ada6b32a527c)几乎在两年零六个月后才被[打开](https://blockstream.info/tx/91538cbc4aca767cb77aa0690c2a6e710e095c8eb6d8f73d53a3a29682cb7581)。双边供资只需要与你的直接连接的节点兼容，而LN 上的 PTLC 需要与你所选择的路径上的所有路由节点兼容，包括接收方。所以我觉得因为它增加了复杂性，有理由给这个功能一个 +50% 的时间调整。预计从一个具体的 PTLC 协议被提出开始，需要 3 年零 9 个月才能被应用。

对于 P2TR 通道，我们应该注意到，虽然这“只涉及到”两个直接连接的节点，但它带来的好处也较少。因此，我预计它的优先级会比较低。假设大多数开发者优先考虑 PTLC 而不是 LN，那么我预计 P2TR 通道将在底层的 [SIGHASH_ANYPREVOUT](https://bitcoinops.org/en/topics/sighash_anyprevout/) 或其他实现 Decker-Russell-Osuntokun（"[Eltoo](https://bitcoinops.org/en/topics/eltoo/)"）的方式出现时开始工作。

## 脚注

<a id="note1">1</a>. 支付者可以选择一个非常复杂的路径（即路径的随机化）来让基于 HTLC 的支付关联性分析出错，但但它有自己的缺陷：

- 复杂的路径往往更昂贵 *而且* 更不可靠（你需要支付给更多路由节点，相应地，为了将支付送达目的地，需要 *成功* 转发支付的节点也更多）。
- 复杂的路径更长，因此支付方要告知 *更多* 节点这笔支付的存在，因此也使这笔支付更有可能遇到 *一些* 监视节点。因此，复杂的路径并不必然能提升隐私性。<a href="#jump-1">↩</a>

<a id="note2">2</a>. 在考虑不公开的通道是，请记住，一个巴掌拍不响，如果在不公开的通道关闭之时，有一个参与者（比如，一个闪电网络服务提供商）将剩余的资金用在了一个 *公开的* 通道中，那么浏览区块链的人可以猜测这些资金有可能来自一个已经关闭的不公开通道。<a href="#jump-2">↩</a>

<a id="note3">3</a>. 当然，细节很重要，但也可以说不重要：从一个足够高的视角来看，开发工作某些方面的意料之外的困难会跟某些方面的惊喜相互抵消，从而每一个大功能的开发时间都会在一个大体的时间框架上。如果我们想获得更**精确**的估计，而不是**大体过得去**的估计，我们应该使用避免[计划谬误](https://en.wikipedia.org/wiki/Planning_fallacy)的方法。因此，我们应该近看一个此前已经完成的类似功能，然后 *有意忽略* 其细节，只看这个功能花了多久来实现。<a href="#jump-3">↩</a>

（完）