---
title: '比特币的去中心化矿池的诸元素'
author: 'Bob McElrath'
date: '2023/12/05 15:35:33'
cover: ''
excerpt: '最大的未解问题是报酬分发的授权'
tags:
- 矿池
mathjax: true
---


> *作者：Bob McElrath*
> 
> *来源：<https://github.com/mcelrath/braidcoin/blob/master/general_considerations.md>*



我写这篇文章是为了帮助组织和厘清围绕比特币 “去中心化矿池” 的一些想法、它成立的前提条件，以及一些尚未解决的问题 —— 若要完整地定义一种去中心化矿池，就必须解决这些问题。

## 比特币的去中心化矿池

一个去中心化矿池由下列部分组成：

1. 一种 “弱区块” 以及难度目标机制；
2. 一种共识机制，用于收集和统计矿工的挖矿分数（share）
3. 一种支付承诺，要求一定数量的参与者参与签名以给挖矿分数支付
4. 一种签名程序，以签名支付承诺，使得矿池参与者得到合理的支付
5. 一种交易选择机制，用于构建有效的比特币矿池

[StratumV2](https://github.com/stratum-mining/sv2-spec) 项目所提供的优化还包括给挖矿设备的加密通信。这些问题很重要，大部分都是从矿池自身分析出来的，所以我们不会讨论诸如加密通信的部分，但假设任意去中心化矿池都会使用 StratumV2 的通信机制。

## 弱区块

一个 *share* （挖矿分数；矿池份额）就是一个 “弱区块”，它是一个标准的比特币区块，只是没有达到比特币的目标难度 $T$，但达到了小一些的难度目标 $t$。 *矿池* 指定了这个参数 $t$，每当一个矿工发现了一个 “弱区块” 时，就跟矿池通信（矿池就给 TA 记一个 share）。

Share 自身是一个不记名的凭证，证明做了一定次数的 SHA256 运算；它也必须带有一个结构，以指明它 “属于” 哪一个矿池。在中心化矿池中，矿池自身会分发 “工作单元”（比特币区块头），是跟由该矿池创建的某个区块相对应的，而且交易的选择也由这个（中心化的）矿池完成了。

而在去中心化矿池中，share 自身必须有额外的结构，以向矿池内的其他矿工表明这个 Share 属于这个矿池；而且，如果它真的满足了比特币的难度目标，这个 Share 将包含承诺，使得池内的所有 *其他* 矿工都根据该矿池的去中心化共识机制所实现的 share 计数得到支付。

没有承诺额外的元数据、证明自身所属的 Share（或者区块）必须在 share 计算中排除出去，那些矿工不是 “自己人”。换句话说，提交一个随机的 SHA256 区块头到一个矿池，不能被统计为一个 Share，除非（假定它是一个比特币区块）它在给这个矿池支付的同时会让所有其它 shares 得到支付。

举个例子，考虑一种去中心化矿池的 “share” 是这样的：

```
Version | Previous Block Hash | Merkle Root | Timestamp | Difficulty Target | Nonce
Coinbase Transaction | Merkle Sibling | Merkle Sibling | ...
Pool Metadata
```

在这里，第二行的 `Merkle Sibling` 是交易默克尔树中的额外节点，是验证特定的 `Coinbase 交易` 被包含在 `默克尔根` 中所必需的。我们假设 `Coinbase 交易` 会承诺矿池的共识机制所要求的任何额外数据，比如在一个 `OP_RETURN` 输出中。

`Coinbase` 交易是一笔标准的交易，但没有输入，而且应该具有下列输出：

```
OutPoint(Value:0, scriptPubKey OP_RETURN <Pool Commitment>)
OutPoint(Value:<block reward>, scriptPubKey <P2TR pool_pubkey>)
```

`<block reward>`（区块奖励）是本区块的所有手续费加上本次减半周期内的区块奖励，而 `pool pubkey` 则是一个由矿池（内成员）集体控制的地址，搭配共识机制，使得它只能按照其 share 统计方法，给池内所有的矿工支付。

`<Pool Commitment>` 是 `Pool Metadata` 的哈希值，而 `Pool Metadata` 承诺了这个矿池的运行所需的任意额外数据。至少，它必须包含弱区块的难度目标 $t$（或者至少要能从这段元数据中计算出来）。这个 share 的验证要求这个比特币区块头的 PoW 小于难度目标 $t$。

`<Pool Commitment>` 中还可以加入：

1. 可以用在合作式签名支付承诺的的矿工们的公钥
2. 跟这个矿工进行加密通信所需的密钥
3. 身份信息，比如 IP 地址、TOR 地址，或其它路由信息，允许其它矿工在协议外跟这个矿工联络
4. 这个 share 的父区块（在 braidpool 中是 bead），或者其它由共识指定的数据，如果使用了一些别的共识机制的话。
5. 用在多轮门限签名仪式中的临时共识数据

最后，我们要指出，有一种提议[使用限制条款（CTV）来形成挖矿协同](https://utxos.org/uses/miningpools/)，但并不使用弱区块，也不以比比特币区块更密的频次对哈希率采样，而且不能减少收益方差。因此，从实用的意义上来说，它不是一个 “矿池”，而且我们不会进一步考虑这种设计。虽然限制条款对一个去中心化矿池可能是有用的，我们会在 “支付承诺” 一节中讨论。

## 共识机制

在一个中心化的矿池中，作为中心的矿池运营者会收到所有的 shares，并执行统计。虽然这种统计是容易的事，但去中心化矿池的用意正在于，我们不希望需要信赖某个实体来正确统计，也不希望给任何一个实体能够盗窃矿池中所有资金的权力、不公平地发放支付的权力。

因此，所有矿工都需要从所有其他矿工处接收 shares。每一个 share 都必须是一个比特币区块（假定他能满足比特币的难度目标），而且必须承诺矿池的元数据（如上所述）。

给定一个时段的 shares 集合，我们必须对这些 shares 运行一个共识机制，使得矿池的所有成员都同意这些是有效的 shares、应该根据矿池的支付机制得到支付。

这种共识机制必须有一个特点：比比特币的共识运行更 *快*，从而可以在比特币出块间隔中尽可能多地收集有效的 share。这是因为矿池的首要目标就是 *削减矿工的收益方差*。[P2Pool](https://en.bitcoin.it/wiki/P2Pool) 通过使用一种标准的区块链、出块时间为 30 秒来实现这一点；而 [Monero p2pool](https://github.com/SChernykh/p2pool) 通过 10 秒的出块时间来实现。

比特币已经催生了大量关于共识算法的研究，在此，可以考虑的包括 [GHOST 协议](https://eprint.iacr.org/2013/881)、[异步 PBFT](https://eprint.iacr.org/2016/199)、[Avalanche](https://arxiv.org/abs/1906.08936) 这样的 “取样” 算法（以及被 [DFinity](https://arxiv.org/abs/1704.02397) 采用的取样算法），以及[基于 DAG](https://eprint.iacr.org/2018/104) 的算法。（这不是一个大全，只是举了一些有代表性的例子）

所有共识算法的一个共同特征是，达成共识的速度受制于全局的网络延迟。无论选择哪一种共识算法，都必须让所有参与者都看到所有数据进入当前状态，并且能够同意这就是正确的最新状态。调查开发上述算法的网络可知，他们最快达成共识的速度大概是 1 秒。因此，不同算法的确切 “达成共识的时间” 会以 O(1) 的常数变化，所有算法都是大概 1 秒。这比比特币区块的出现速度快了 600 倍，结果是规模是 1/600 的小矿工也可以贡献算力，而且相比于单干挖矿（solo mining），收益方差可以缩小 600 倍。

虽然 600 倍的收益方差削减是一个有价值的目标，但这个提升还不足以使得只有一台矿机的矿工加入。因此，还必须寻找另一种方案，让小于一定哈希率的矿工也能加入。我们在 “子矿池” 一节提出了一些想法。

从我们的角度看，共识算法的一个显然选项是一种复用比特币的工作量证明的 DAG 算法，以贯彻比特币自身的精神 —— 也就是说，链的顶端是由得到工作量加权后最重的顶端决定的，而 DAG 内部的冲突则用工作量加权来解决。注意，这跟只在恒定难度下工作的 “最长链规则” 相同，但我们假设 DAG 不会有固定的难度，所以必须正确地结合难度。解决方案是识别从创世区块到链顶端的最重线性路径，并沿着这条路径加总难度。

最后，我们还要警告，在考虑容纳小矿工的机制时，不能违反比特币的 “无过程性（progress-free）” 特征。也就是说，在 DAG 中，不应该能够从更小的矿工的一个子集中加总工作量、然后得到一个更高工作量的区块。

## 支付承诺

支付承诺是比特币区块中的 coinbase 输出，包含了来自区块奖励和本区块内手续费的所有资金。这个支付必须承诺在这个区块挖出时候计算出来的 share 支付结构。换句话来说，它必须表示和承诺这个去中心化矿池的 share 统计的共识。

### 未花费的矿工支付输出（UHPO）机制

关于支付承诺，我们提出一种新的、简单的 share 记录统计方法。假定共识机制是一种类似于比特币的基于 UTXO 的区块链。而共识机制的 “UTXO” 集就是给所有 share 的支付输出的集合，而支付的数额是由已经记录的 share 和共识机制的规则决定的。

我们将这种支付的集合称为 “未花费的矿工支付输出（Unspent Hasher Payment Output）集” ，也就是这个去中心化矿池的 “UTXO 集”，并且 UHPO 集的计算和管理就是这个去中心化矿池的首要目标。

UHPO 集可以简单表示成一笔交易：将该矿池挖出的所有未花费的 coinbase 交易作为输入、给每一个矿工分配一个输出，并且数额由其 share 贡献（由共识机制的规则确定）决定。

在 p2pool 中，这个 UHPO 集被放在每个区块的 coinbase 交易中，产生对矿工的大量极小额度的支付。传统矿池的一个优势在于，可以在多个区块中 *聚合* 这些支付，从而减少每个矿工 “取款” 的次数。去中心化矿池也应该能做到同样的事。如果没有做到的话（像 p2pool），携带大量小额输出的 coinbase 交易（体积很大）就会跟支付手续费的交易争夺区块空间。

在 coinbase 输出中放置对 UHPO 集的承诺，就是一种让所有矿工能在出块之后、去中心化矿池宕机或者出错时得到正确支付的机制。为此，UHPO 集的交易必须是正确构造、完全签名并且有效的、可以广播的比特币交易。见 “支付授权” 一节，了解关于 签名/授权 UHPO 交易的考虑。

我们不希望真的要广播这笔 UHPO 集交易，除非矿池出故障。就像闪电网络这样的乐观协议，我们希望保留这些交易、不让它上链，然后在比特币协议之外的协议中更新它。每挖出一个新区块，我们就会更新 UHPO 集交易，以计入自矿池上次出块以来的任何新的 share。

此外，一个去中心化矿池还应该指出矿工 “取款”。形式可以是一种特殊的消息或者交易，发送到矿池（然后得到矿池内的共识的认可），以从 UHPO 集交易中 *移除* 一个矿工的输出，并创建一笔新的单独的比特币交易来给这个矿工支付、完成授权，然后广播到比特币网络中。

### 池交易和衍生品工具

如果这个去中心化矿池支持自身的交易，一个人可以 “发送 Share” 给另一方。这种操作是将一方在 UHPO 集交易中的地址换成另一方的。这样一来，还未支付的份额就可以交给一个交易所、做市商或者 OTC 柜台，换成即时支付（比如通过闪电网络）或者换成一种衍生品合约。

转移 shares 可以构造一种衍生品合约的道理在于，它实质上是对 *哈希率* 的一种度量，而且尚未得到比特币的结算。虽然给定矿池当前挖出的比特币的数量，我们可以随时计算 UHPO 集，并转化成比特币输出，但在请求结算之前，这个矿池还能挖出多少区块、这些区块能收获多少手续费，都是不确定的。

可以创建一种私人合约，一方使用现货比特币，向另一方 *购买未来的 shares* 。这是一种 *期货* 合约，矿工的对手方得到是矿池的 “运气” 风险以及手续费波动风险。

为了形成哈希率衍生品，必须能够跨越难度调整窗口 $d_1$ 和 $d_2$ 转移 shares。在一个难度调整窗口中，单个 Share 的价值是 $BTC_1$ ，但在另一个窗口中，可能是 $BTC_2$ 。如果你可以计算这个微分
$$
d(hashrate)/d(BTC) = (d_1 - d_2)/(BTC_1 - BTC_2)
$$
那么期权和期货这样的衍生品工具就可以通过私人合约构造出来，不同难度调整周期内的 shares 被交给衍生品合约的对手，以换取 BTC，可能会带有时间限制。我们不再进一步描述如何做到这些，只是指出让去中心化矿池支持私人衍生品工具的充分条件：

1. 可以将 share 发送给另一个人
2. 可以在充分定义好的时间、计入难度调整的影响（比如在难度调整之后、考虑上一个难度周期的影响）将 share 结算成 BTC
3. 可以跨越两个难度调整窗口交易 share

把一个去中心化矿池转变成一个带有订单簿的完整 DeFi 市场可能很诱人。我们要提出警告，矿工可抽取价值（Miner Extractable Value, MEV）是一个严重的问题，它破坏了公平以及人们对系统的信心，此处也应该避免。我们可以考虑的操作仅有：（a）发送 share 给另一方；以及（b）请求给 shares 支付 BTC。

最后，我们还要指出，一个 “Share” 的价值在经历难度调整事件之后，天然就固定下来了。在一个为期两周的难度调整周期中，每一次 SHA256D 运算的价值（以 BTC 计）都是固定的，但具体值多少，是未知的，要等到下一次难度调整周期来临时才知道。因此，难度调整的时间是自动广播上一个周期的 UHPO 树、结算上一个周期的 shares 的天然时机。

## 支付授权

在 “支付承诺” 部分，我们描述了一种简单的机制来表示 shares 和由实时对 shares 运行的 “共识机制” 决定的 share 支付额。然而，比特币无法模拟矿池的共识机制的逻辑，而且我们必须找出一种更简单的办法，向比特币表示 share 支付额的共识，使得 coinbase 输出无法以其它方式花费，只能以矿池的共识决定的方式花费。

可能最直接的授权 share 支付和签名 coinbase 输出的办法就是使用一个大规模的门限多签名机制。签名者的集合包括任何运行着矿池的共识机制、可以获得所有数据、看得到共识机制的链顶端的参与者。我们假设在弱区块的元数据中，参与者们会包含一个公钥，是他们用来合作式签名支付授权的公钥。

最符合逻辑的授权 coinbase 花费的签名者集合是成功挖出比特币区块的矿工的集合。我们希望避免让单个矿工可以单方面控制一个 coinbase、有能力偷走资金而不给其他矿工支付。因此，签名者至少要有 4 个人，这是使用拜占庭共识文献的 $(3f + 1)$ 规则实现的。这意味着，在矿池的启动阶段，头 4 个区块的收益必须直接、立即支付给矿工，因为他们还不足以签名一个多签名输出，而且我们甚至不知道他们的公钥，也无法构造一个比特币（P2TR、P2SH，等等）输出地址和脚本公钥。

在挖出前面 4 个区块之后，我们假设曾经挖出过区块的 66% + 1 个矿工比如签名 coinbase 输出，才能给 UHPO 集支付。

这可能是在去中心化矿池的开发中最大的未解问题 —— 如何协调这么多的矿工。如果我们假设每个难度周期都会支付一次收益，这就是 2016 个区块，最多会有 1345 个签名者必须合作以形成一个门限多签名构造。这是非常大的数字，基本上远远超过了可用的签名算法，比如 [FROST](https://eprint.iacr.org/2020/852)、[ROAST](https://eprint.iacr.org/2022/550)、[MP-ECDSA](https://eprint.iacr.org/2017/552) 以及 [Lindell 门限 Schnorr](https://eprint.iacr.org/2022/374) 算法的能力。

下面我们会讨论 Schnorr 门限签名算法的更多细节，但这可能不是唯一的先承诺然后授权 coinbase 交易给 UHPO 集支付的方法。我们鼓励读者寻找其它的解决方案。我们可以发现，所有签名算法的一个非常大的缺点是它们无法容忍故障。

## Schnorr 门限签名

我们阅读了大量关于 Schnorr 门限签名算法的文献。

它们基本上都需要一个分布式密钥生成（DKG）阶段，使用 [Pedersen's DKG](https://link.springer.com/chapter/10.1007/3-540-46766-1_9) 的一个标准，常常声称搭配 Feldman 提出的多项式承诺可以实现一种 “可验证的私钥分割（[Verifiable Secret Sharing](https://ieeexplore.ieee.org/document/4568297), VSS）”。许多论文都提出了这种想法的变体，每一种都针对性优化通信的轮次、对通信环境的假设（例如是否存在广播信道）以及安全性证据。

一个门限签名构造的每一个参与者都在 DKG 阶段贡献熵，形式是创建一个私钥并将其公钥分享给所有其他参与者。这样一来，一个共有公钥就可以使用来自所有参与者的熵输入创建出来，从而没有任何人知道这个公钥背后的私钥，但在 DKG 阶段结束的时候，每个参与者都持有一个碎片私钥，只有 n 个碎片中的任意 t 个，才能用拉格朗日插值法创建完整的私钥。

此后，这些碎片私钥会用来计算签名。参与者们不会直接重构出玩完整的私钥（这会给完成重构的参与者单方面花费资金的权力），而是每个人都用自己的碎片私钥计算签名，然后对这些签名的集合运行拉格朗日插值法。

无论 ECDSA 签名还是 Schnorr，都要求所有签名成员在签名之前同意使用同一个 nonce 值 $k$ 来计算签名；这个值也会得到签名的承诺。一般来说，这要求运行额外的一轮 DKG 以计算 $k$ ，从而每个人都只拥有它的一个秘密碎片。

## 交易挑选

[Stratum V2](https://github.com/stratum-mining/sv2-spec) 就致力于一种模式，让矿工可以自己构造区块、挑选交易。这是对 Stratum V1 的提升，因为 V1 是由（中心化的）矿池来挑选交易和构造区块的。

这里的风险在于，中心化的矿池要么可能在政府机构的授意下审查有效的交易，要么可能出于协议外的支付、为某些交易提高优先级，都会牺牲整个系统的 “抗审查” 特性。

在 “弱区块” 一节，我们没有指明如何挑选交易。这是一个可以分析的问题，而在去中心化矿池中，我们也假设单体矿工可以构造区块，而且矿池不会对参与者矿工挖出的区块的内容有进一步的限制。实际上，对于不满足比特币难度门槛的弱区块，为了 share 的更快验证，最好完全省去交易集。这产生了一个问题：矿工可以构造带有无效交易的区块。但这很容易发现（一旦这样做的矿工挖出一个区块），然后 TA 的 shares 就会作废。

一种同时使用一个去中心化矿池和 Stratum V2 的交易选择机制应该很容易插入由去中心化矿池所要求的区块结构（如 “弱区块” 章节所述），只要 Stratum V2 不限制所需的 coinbase 交易和元数据结构。

我们的想法是，单纯允许矿工进行交易选择是不够的，因为中心化矿池可以很容易扣住支付，迫使矿工按照矿池指定的规则来选择交易。保留比特币的抗审查特性需要去中心化支付的完整解决方案。

## 未解决的问题和未来的方向

这里最大的未解问题就是支付授权。虽然 [ROAST](https://eprint.iacr.org/2022/550) 这样的开箱即用的算法已经有了，但它需要固定签名者集合，而且无法容忍在 nonce 生成和签名任一环节中的错误（当然也无法容忍两者环节都出错）。必须选出阈值数量的参与者，而且在密钥生成和签名阶段必须 *全都* 保持在线。任意一个参与者出错，就必须在已有的签名者中选出一个子集，然后重复整个流程。确实有一种方法（[由 Joshi 等人提出](https://link.springer.com/chapter/10.1007/978-3-031-08896-4_4)），可以让最终的签名聚合成为异步的（假定 nonce 生成已经成功），但启动阶段依旧无法容忍错误。

ECDSA 和 Schnorr 签名都需要 nonce 值，这是一个巨大的缺点，因为它需要额外的一轮密钥生成，要让每一个人都在线，而 BLS 签名这样的系统就不需要。

在实践中，如果没有新的算法出现、仅是由现有的 Schnorr 门限签名（需要 DKG 和私钥分割）的话，就必须在签名者数量上取得一个平衡：签名者太多，支付就可能无法在合理时间内完成；签名者太少，系统又不安全，coinbase 可能会被一小群签名者偷走。

一种可以考虑的方法是对签名者集合进行次级采样，并有时候从子集中聚合签名。这样一来，签名将拥有不同的 nonce，因而无法直接聚合，但这跟在一笔交易或者一个区块内聚合不同签名是同一个问题，而 “[跨输入的密钥聚合（CISA）](https://github.com/ElementsProject/cross-input-aggregation)” 这样的技术也许可以用在这里，而且也许在这个方向上说明了为之安排一次软分叉是值得的。

## 限制条款

你可能会想到，UHPO 集交易可以转化成一种树结构，而 “限制条款（covenants）”可以在后续交易中强制保持这样的树结构。这是人们在限制条款相关的软分叉提议中人们常常提到的事，在这种结构中，一方可以取出自己的资金而不会强迫他人也在同时取款。

因为一个去中心化的矿池是一个在线的系统，似乎运用交互式方法、为一次取款发起一笔新的交易更为合理，而直接广播树的一部分则不那么合理。如果树的一部分被广播出去了，那必须让每一个矿工知晓，并更新 share 支付记录。

我们的看法是，要让整个 UHPO 集交易广播的唯一理由就是矿池出故障或者宕机了，不然就只是增加链上的数据负担，没有任何好处。

## 子矿池

因为一个共识系统达成共识的速度不可能比全局的时延更快，所以 share 体积上的提升最多就是 1000 倍。为了支持更小的矿工，我们可以考虑 “链接” 去中心化矿池以创建一个子矿池。

子矿池的 UHPO 集交易的输入不是 coinbase UTXO，而是父矿池的 UHPO 集中的一条 UHPO。因为子矿池跟父矿池使用独立的共识机制，这两个去中心化矿池可以允许 1000000 分之一规模的小矿工参与。理论上，一个矿池可以动态地创建和关闭子矿池、在子矿池之间移动矿工。主矿池依赖于自己可以观察到的哈希率，让所有矿工趋向一个恒定的方差。

（完）