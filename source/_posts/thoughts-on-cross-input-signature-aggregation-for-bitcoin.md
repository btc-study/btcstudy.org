---
title: '跨输入签名聚合如何集成到比特币？'
author: 'jonasnick'
date: '2022/06/23 14:21:15'
cover: ''
excerpt: '可供运用的技术和集成的路径'
categories:
- 比特币主网
tags:
- 密码学
- CISA
---


> *作者：jonasnick*
> 
> *来源：<https://github.com/ElementsProject/cross-input-aggregation>*



跨输入的签名聚合（cross-input signature aggregation，CISA）是一种可以减少交易体积的技术，有望成为比特币的软分叉。本代码库的目标是为了收集关于签名聚合的思想和主题，以及构想它们集成到比特币中的方式。

## 减半聚合

“减半聚合（Half Aggregation）” 技术可以将一组签名非交互式地聚合成单个聚合签名，并且这个聚合签名的大小是原签名集合大小的一半。

更详细的描述见本仓库内的 “[half-aggregation.mediawiki](https://github.com/ElementsProject/cross-input-aggregation/blob/master/half-aggregation.mediawiki)”。仓库内的“[幻灯片（slides）](https://github.com/ElementsProject/cross-input-aggregation/blob/master/slides/2021-Q2-halfagg-impl.org)” 还有[配套的视频](https://www.youtube.com/watch?v=Dns_9jaNPNk)，讲解了如何使用 libsecp256k1-zkp 代码实现减半聚合。

## 签名聚合案例研究：闪电网络通道公示

[通道公示消息](https://github.com/lightningnetwork/lightning-rfc/blob/master/07-routing-gossip.md#the-channel_announcement-message)是在闪电网络中用 gossip 协议广播的，用于让节点可以找出支付的路径。

为了证明使用公钥  ` node_1 ` 的节点和使用公钥  ` node_2 ` 的节点间具有通道，公示消息包含四个签名。首先，公示消息包含 ` node_signature_1 ` 和 ` node_signature_2 ` ，是公钥  ` node_1 ` 和 ` node_2 ` 分别对通道公示消息的签名。

通道公示还提供了两个公钥 ` bitcoin_key_1 ` 和 ` bitcoin_key_2 ` ，是记载在通道充值交易的输出中的、分别由   ` node_1 ` 和 ` node_2 ` 持有的密钥。因此，它还包含了签名 ` bitcoin_signature_1 ` 和  ` bitcoin_signature_2 ` ，分别是 ` bitcoin_key_1 ` 对 ` node_1 ` 和 ` bitcoin_key_2 ` 对 ` node_2 ` 的签名。

1. 因为 ` node_signature_1 ` 和 ` node_signature_2 ` 是对同一条消息的签名，我们可以使用 [MuSig2](https://eprint.iacr.org/2020/1261.pdf) 这样的方案，将两个签名替换为单个签名 ` node_signature ` ，它的体积将与普通的单签名一样大。
2. 为了创建通道公示消息，两个节点本身就需要协作。因此，他们可以交互式地完全聚合三个签名（经过聚合的  ` node_signature ` 和另外两个签名），成为单个签名。
3. 通道公示消息通常是成批发送的。在一个批次内，所有通道公示消息的签名都可以聚合，因为减半聚合并不要求这些节点集体行动。相当于每个通道公示消息的签名都变成了一个减半聚合签名，其体积是原本签名的一半。

结果是，一开始我们需要包含 4 个签名（256 字节），占据了今天的通道公示消息的 60% 的体积；聚合之后只需一个签名（一批通道聚合消息只需 32 字节）。

当然，上面的配方也可以变化。例如，若是为了简单起见，不想使用完全聚合，可以仅聚合一条消息中的 4 个签名，将体积降低到 2.5 个签名的大小。

## 集成到比特币协议

因为 BIP 340 Schnorr 签名验证的减半聚合和完全聚合的验证算法不同，节点没法立即开始产生和验证聚合签名。如果这样做会导致链分裂。

Taproot 和 Tapscript 提供了多种升级路径：

- 将 ` OP_SUCCESS ` 重新定义为 ` OP_CHECKAGGSIG `：就像 [bitcoin-dev 邮件组的这篇帖子](https://lists.linuxfoundation.org/pipermail/bitcoin-dev/2018-March/015838.html)指出的，在一个包含 ` OP_SUCCESS ` 的脚本中出现  ` OP_CHECKAGGSIG ` 会导致链分裂。这是因为` OP_CHECKAGGSIG ` 并不真的验证签名，只是将一个公钥放到某个数据结构中，并在最终 —— 也就是处理完所有的  ` OP_CHECKAGGSIG `  之后 —— 使用这个数据结构来验证聚合签名。而当一个节点遇到  ` OP_SUCCESS OP_CHECKSIGADD ` 之时，另一个升级（假设是软分叉）之后的节点可能会认为这是  ` OP_DOPE OP_CHECKSIGAD ` 。因为他们无法对验证聚合签名的方式达成共识，自然也无法对验证结果达成共识，所以会分裂。因此， ` OP_CHECKAGGSIG ` 无法跟 ` OP_SUCCESS ` 一起用在一个脚本系统中。同样的论证对通过 Tapscript 的密钥版本来加入聚合签名的尝试也是一样成立的。
- **定义新的叶子版本来取代 tapscript**：如果新的脚本系统依然有 ` OP_SUCCESS ` ，那就依然无法解决这个问题。
- **定义新的隔离见证版本**：可以定义一个新的隔离见证版本、复制 Taproot 和 Tapscript 的功能，只不过例外是所有的密钥路径（keyspand）的签名都可以被聚合。不过，这个版本的密钥路径签名无法跟其它隔离见证版本的签名聚合。

假设使用一个新的隔离见证版本来部署聚合签名，也就是复制 Taproot 和 Tapscript 的功能，并且只允许密钥花费路径的签名被聚合。它是很局限的一个东西。举个例子，一个花费条件 ` (pk(A) and pk(B)) or (pk(A) and older(N)) ` 在 Taproot 中通常会实例化为聚合公钥 A 和 B 来创建一个密钥花费路径，再加上一个 ` (pk(A) and older(N)) ` 的脚本路径。要是使用了脚本花费路径，其中的签名就无法聚合了。

这篇 [bitcoin-dev 帖子](https://lists.linuxfoundation.org/pipermail/bitcoin-dev/2018-July/016249.html)证明了，这种局限性实际上是没有必要的，只要引入广义 Taproot（Generalized Taproot）（也就是 g'root）就行（要了解这个概念，请看[这篇文章](https://lists.linuxfoundation.org/pipermail/bitcoin-dev/2018-October/016461.html)）。本质上，它不像 taproot 默克尔树那样每个叶子都是一个脚本，而是每个叶子都由一个公钥和一个脚本组成；为了使用某一个叶子来花费，必须提供其中的公钥的签名，以及满足其中脚本的输入。这就意味着，公钥移到了脚本系统之外，所以它不会受到  ` OP_SUCCESS ` 的约束，也不会被 Tapscript 组件的潜在危险困住。因此，这些公钥的签名 *是可以* 聚合的。

还是上面的  ` (pk(A) and pk(B)) or (pk(A) and older(N)) ` 的例子。在 g'root 中，根密钥  ` keyagg((pk(A), pk(B))) ` 还通过 taproot 的调整承诺了一个由公钥 ` pk(A) ` 和脚本 ` older(N)` 组成的花费条件。为了使用后一个路径来花费，脚本指定的条件必须被满足，同时  ` pk(A) ` 的一个 *聚合* 签名必须存在。

[Entroot](https://gist.github.com/sipa/ca1502f8465d0d5032d9dd2465f32603) 协议是 g'root 的一个略微升级的版本，它集成了 Graftroot。Entroot 的主要吸引力之一是 “惊人的优雅”，因为 Entroot 的验证规则比它产生的功能要简单。

## 跨输入签名聚合的节约效果

见：[savings.org](https://github.com/ElementsProject/cross-input-aggregation/blob/master/savings.org)。

## 减半聚合与交易池缓存

如[这篇 bitcoin-dev 帖子](https://lists.linuxfoundation.org/pipermail/bitcoin-dev/2017-May/014308.html)所述，接受了一笔拥有半聚合签名 ` (s, R_1, ..., R_n) ` 的交易进入本地交易池的节点不会丢弃它，也不会与其它签名聚合。相反，他会保留签名，当一个具有全块聚合签名 ` (s', R'_1, ..., R'_n') ` 的区块到达时，节点会从 ` s' ` 中减去  ` s' ` ， 并从全块聚合签名中移除 ` R_1, ..., R_n ` ，然后再验证签名。因此，节点可以跳过自己已经验证过的东西。

## 减半聚合与重组

假设一笔交易  ` X ` 具有半聚合签名 ` S0 = (s0, R_1, ..., R_n) ` 。这笔交易被包含在链 ` C1 ` 上，所在区块的半聚合签名为 ` S1 `（也就是说  ` S1 ` 是该块内所有签名的减半聚合签名），因为 ` S0 ` 已经聚合到了 ` S1 ` ，所以它是无法从区块中恢复出来的。

现在发生了一次重组，节点从 ` C1 ` 链切换到了 ` C2 ` 链。减半聚合会在两种情形下对重组造成影响。

1.  ` C1 ` 链和 ` C2 ` 链都包含了交易 ` X ` 。记 ` S2 ` 为`C2 ` 上包含了 ` X ` 的区块的全块减半聚合签名。一般而言，S1 不会等于 S2，所以节点必须验证完整的减半聚合签名 ` S2`，包括  ` X ` 的部分，即使它已经被单独验证过。如果本地保存了 ` S0 ` ，可以从 ` S2 ` 中减去它。这跟常规的签名是不一样的，常规签名在重组中不需要再次验证。
2. 交易 ` X` 进入了 ` C1 ` 但没有进入 ` C2 ` 。因为我们无法复原出 ` S0 ` ，我们也就无法广播交易 ` X ` ，我们也无法构造一个包含它的区块。因此，实际上我们无法让 ` X ` 回到交易池中。

两种情形都表明，保存 ` S0 ` 是有好处的，即使交易已被打包到了最好的链上。当且仅当交易已经埋得足够深，不再可能出现重组时， ` SO ` 可以被丢弃。这种方法显然不是那么完美。

处理第二种情形得另一个办法是，让交易的参与者（比如发送者或者接收者）重新广播该笔交易。但这可能会产生隐私问题。

## 减半聚合与适配器签名

减半聚合不能允许使用适配器签名（[stackexchange](https://bitcoin.stackexchange.com/questions/107196/why-does-blockwide-signature-aggregation-prevent-adaptor-signatures)）。但是，上面 “集成到比特币协议” 章节所述的、使用新的 SegWit 版本的方法，将可以让 Tapscript 内部的签名不可聚合，因此，使用适配器签名的协议可以通过仅在 Tapscript 内使用适配器签名来实例化。

如果输出可以直接用一个脚本来花费，也即不需要展示默克尔证明的话，那么这种模式使用 g'root 也不会有什么效率损失。但是，因为这不是一个常规的密钥路径花费，并且是显式不可聚合的，这样的交易会显得特别碍眼。它是不是真的会影响建立在适配器签名之上的协议还是一个开放问题。换句话说，这样的协议能否为适配器签名使用 Tapscript 花费路径、但又无需真的使用这个路径（至少在双方合作的情况下）？

