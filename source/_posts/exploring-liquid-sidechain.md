---
title: '探索 Liquid 侧链'
author: 'Joe Kendzicky'
date: '2022/10/18 21:42:58'
cover: ''
excerpt: '强联盟介于中本聪共识所提供的强大去中心化保证和中心化交易所服务的巨大信任因素之间'
tags:
- 联盟侧链
---


> *作者：Joe Kendzicky*
> 
> *来源：<https://medium.com/good-audience/overview-7b9ea0b0d5af>*



## 概述

在 2014 年，一群知名比特币开发者发表了《使用带锚的侧链赋能区块链创新》。此白皮书为侧链的工作原理列出了非常高级的框架，但是在具体实现上缺少重要技术规范。两年后，一群 Blockstream 研究员发表了《强联盟：应对中心化第三方风险的互操作型区块链解决方案》，阐述了白皮书中的哪些概念可以利用部分信任型拜占庭容错共识机制（即，强联盟）来实现。强联盟介于中本聪共识所提供的强大去中心化保证和中心化交易所服务的巨大信任因素之间。本文将探索第一代基于联盟的双向锚定协议 Liquid。Liquid 是一个主要面向交易所和其他流动性提供者的结算网络。

## 侧链能为用户提供什么？

侧链可以让我们将某条链上的原生资产转移到另一条链上，同时不会破坏资产的完整性。例如，通过某种方式将比特币转移至以太坊网络。虽然我们无法将真正的比特币转移到另一条链上，但是我们可以在以太坊主网上创建一个以比特币作为质押物的合成代币。只要是持有该合成代币的人都可以随时将其兑换成真正的比特币，因此这两种资产是 1:1 锚定的。

这种功能有助于实现多种不同形式的跨链互操作，例如，跨链执行智能合约。每条侧链都会涉及一条 *源区块链* 和一条 *目的区块链*。两条链之间的锚定指源链上的资产能够以固定比率（通常是 1:1）兑换成目的链上的全新资产。由于目的链是完全独立的区块链，目的链上的代币可以在网络用户之间自由转移，就像源链上的代币那样。用户可以随心所欲地将侧链上的代币重新转换成主链上的代币。通常来说，这些目的链代币具备源链代币所没有的优点：隐私性、图灵完备性、快速结算、低手续费等。在我们的例子中，比特币是源链，Liquid 是目的链。

## 履职者

首先，我们先介绍一下 Liquid 生态中的两类重要参与者：

1）**守望者**（watchman）：担任守门人的重要角色，负责管理源链和目的链之间的资产转换。

2）**区块签署者**（Blocksigner）：负责创建新的区块，类似 PoW 系统中的矿工和 PoS 系统中的见证人。

这两类参与者统称为 *履职者*（functionary）。履职者是一群拥有特权的网络参与者，机械地执行定义好的网络操作。这里之所以使用特权一词，是因为能够履行这些职责的是固定的一群经过许可的参与者。相较之下，在比特币之类的开放式系统中，任何网络参与者都能通过开放的挖矿作业为共识作贡献。

进入侧链的程序叫做 “挂钩”，比特币用户将比特币存入一个特殊构造的地址中，它是一个 “支付给脚本哈希值（pay-to-script-hash, P2SH）” 地址。传统的比特币脚本通常只需要花费者使用其私钥生成一个有效的签名。比特币就锁定在该私钥对应的公钥中。除数字签名之外，P2SH 还要求花费者生成更多信息。花费 LBTC 所需的脚本为 *<11 of 15 Multisig> OR <4-week timeout + 2-of-3 Multisig>*。我们将在后文介绍这一结构及其重要性。

一旦比特币被发送至这个 P2SH 地址，用户就会失去对这些比特币的控制权。随后会有一个确认期来保障比特币的结算，以防链重组和双重花费攻击。如果没有充分确认被锚定的比特币已经完成结算，攻击者可能会提前在 Liquid 侧链上获得 LBTC，再通过区块链重组（也叫双重花费攻击）来逃避在主链上质押比特币。这种情况会导致 LBTC 和比特币脱钩，让攻击者空手套白狼。

﻿![img](../images/exploring-liquid-sidechain/D7xMGla71Wq)

1. 用户将比特币发送到特殊的地址以 “锁定” 它们。
2. 一旦被发送到 “锁定地址” 上的比特币完成结算，侧链上就会生成对应数量的 LBTC。
3. LBTC 经过确认后，就可以在侧链上花费。

根据 Liquid 的要求，挂钩交易必须经过 102 个比特币区块的确认，用户才可获得对应的 LBTC。这个数字看似莫名其妙，其实背后有两层深意：

1. **100 个区块**是一种加强保护机制，确保重组的发生概率为零。同理，比特币协议也要求出块矿工等待同样数量的区块确认，才能花费 coinbase 奖励。虽然我们通常认为 6 次确认就足以确保比特币交易的终局性，但是在少数情况下存在远超过该深度的孤块（尽管这种情况通常都是由隐蔽的漏洞导致的）。例如，[2013 年 3 月 12 日](https://bitcoin.org/en/alert/2013-03-11-chain-fork)的分叉长达 31 个区块，而 [2010 年的](https://en.bitcoin.it/wiki/Value_overflow_incident)[数值](https://en.bitcoin.it/wiki/Value_overflow_incident)[溢出](https://en.bitcoin.it/wiki/Value_overflow_incident)漏洞产生了 53 个孤块。
2. **另外 2 个区块**是为了确保所有节点就第 100 个区块达成共识。根据比特币的第一原则，如果在第 99 个区块处发生链分叉，网络节点可能会就第 100 个区块产生分歧。这多出的 2 个区块确认是为了在必要时让区块链有时间重新达成共识。

此处要强调的是，比特币区块链上的比特币并没有被销毁，它们只是在多签名账户中保持“冻结”状态，直到对应的 LBTC 在目标链上销毁，并且有销毁证明作证。

## LBTC 是如何构建的

[BIP 32 ](https://github.com/bitcoin/bips/blob/master/bip-0032.mediawiki)引入了一组重要功能，可以实现分层钱包结构。分层架构用处很大，因为它们能够以确定的方式创建出新的公钥（进而生成无限多新的比特币地址），完全无需暴露公钥的对应私钥。对于想要在销售终端集成比特币付款的线上商户来说，这是一个很棒的功能。他们可以将主私钥上传至网络服务器，并直接根据主公钥计算出新的比特币地址的子域名。在该功能出现之前，他们只能在服务器上暴露自己的私钥来生成新的地址（风险系数高），或离线生成多个新的公私钥对，然后手动将对应地址导入服务器（效率低下）。

我们能够以同样的方式来理解 LBTC 是如何构建的，尽管二者在技术层面上存在一些差异。从本质上来说，用户在创建 Liquid 挂钩交易时，实际上是在执行一些密码学操作，以直接利用每位履职者已有的公钥（A）衍生出新的公钥（A'），就像 BIP 32 支持用户无需使用对应私钥即可从父公钥中衍生出子公钥那样。然后，用户将比特币发送到一个特殊 P2SH 地址，该地址引用了所有新的 A' 地址。该 P2SH 交易看起来很像多签从句，表达的是“如果（15 位履职者中）有 11 位证明其拥有此模板中列出的 A' 公钥，他们可以使用对应的 a' 私钥集体签署该交易，从而解锁并花费地址上的比特币。”

在发布比特币 P2SH 交易后，用户需要让履职者知道交易已经发生。至此，履职者还不知道他们已经收到了比特币。一切都在用户侧完成。现在，用户需要将新的 A' 模板交给履职者，以便后者通过逆向工程得到 a' ，获得被锁定的比特币。

![img](../images/exploring-liquid-sidechain/D7xMGla71Wq)

1. 发送方使用椭圆曲线原语生成新的公钥 PK1' 、PK2'  …… PK15' 。
2. 每位履职者可以回过头找出对应的私钥 p1'、p2 '…… p15 '，看他们是否收到了比特币。

注：P2SH 冗余：如果模板 A' 中的 15 个公钥中有 11 个的履职者完成签名，他们就可以花费对应的比特币。

用户执行该操作的方式是重新创建一个 LBTC 交易。该交易的输入看起来可能有点奇怪，因为它们不引用之前的 LBTC 输出（想象一下矿工挖出新的比特币区块时的 coinbase 交易）。不同的是，LBTC 交易将原始的比特币交易作为输入，证明用户之前将比特币的控制权交到了守望者手中。一旦履职者看到比特币已经支付给了公钥 A'，而且 102 个区块的验证期已经通过，就可以通过逆向工程得到对应的私钥 a'，并控制这些资金。万事既已俱备，履职者会将挂钩 LBTC 交易打包到 Liquid 区块内进行验证。

一旦新的 LBTC 在 Liquid 侧链上解锁，用户就能自由进行交易。无异于传统的比特币区块链，LBTC 由其所有者的底层私钥管理，是无法篡改的数字资产，可通过分布式账本公开审计。相比传统的比特币网络，LBTC 具备一些独特的优势。例如，抗重组性、1 分钟出块时间、确定的区块间隔（而非动态出块）和环机密交易。

等到用户希望将其 LBTC 转换回比特币时，他们可以进入 “脱钩” 流程。具体步骤包括将他们的 LBTC 转入某一个 Liquid 地址，等待 2 个区块确认。由于 Liquid 网络不存在重组风险，我们无需像等待挂钩流程那样等待 100 个区块确认。2 个 Liquid 区块生成之后，守望者在比特币区块链上签署 11/15 多签交易，将比特币还给原本的所有者，随后销毁 LBTC。

## 脱钩交易

当用户准备好将 Liquid 侧链上的 LBTC 转换回比特币网络中的比特币时，需要销毁 LBTC，对应的比特币才会经由守望者执行的多签机制释放。为了保护隐私性并减轻安全性风险，履职者们控制着一个脱钩授权密钥列表，确保比特币交易被发送至由授权方控制的比特币地址。但是，这也带来了麻烦：想要用自己的 LBTC 换回比特币的用户只能借助于交易所或与区块签署者合作。从本质上来说，其过程就是用户将 LBTC 发送至销毁地址，然后等待 2 个 Liquid 区块确认，完成该 LBTC 交易的结算。交易所将交易视为已确认，从自己的热钱包中拿出比特币支付给用户，之后收到由履职者多签机制释放出的比特币作为补偿。

这一策略旨在减少侧链上的失窃（进而导致主链失窃）的风险。守望者支付的脱钩地址都是由交易所维护的不联网的冷钱包地址。这些地址的构建方式使得攻击者极难获取底层私钥。

## 紧急恢复流程

还记得我们之前提到的用于锁定比特币的“11/15 多签”或“4 周限时 + 2/3 多签”P2SH 吗？当离线或作恶的网络参与者人数达到全网的三分之一，“4 周 + 2/3 多签”从句起到应急恢复组件的作用。一旦出现上述情况，网络将停摆，无法产出新的区块，但是如果无法满足 11/15 的多签条件，主链上被托管的比特币将无法释放。因此，我们引入了第二个从句。该从句包含一组完全不同的应急密钥，能够用于（且仅用于）网络停摆超过 4 周的情况，这时我们只需要 3 个签名者中的 2 个完成签署就能释放比特币。这 3 个密钥由一组完全不同的履职者控制（出于安全考虑，这组参与者的身份并未公开，但据推测是身处不同地区的律师），而且只能在 4 周限期结束后使用。因此，履职者需要在第 27 天将被锁定的比特币发送到一个新的可控锚定地址，以重置时间锁。否则，2/3 应急应急组件将生效，履职者可能会串谋窃取用户的存款。

![img](../images/exploring-liquid-sidechain/grBxYdvr1WI)

## 共识算法

在比特币系统中，矿工将多笔交易打包成一个叫作候选区块的聚合单元，每个候选区块都有一个独一无二的区块头。矿工会对区块头执行 SHA 256 哈希算法，在每次哈希计算后调整 nonce 字段元素，直到某个矿工随机得到低于预定义目标的摘要。获胜者将解广播给网络中的其他参与者，由后者验证其真实性。如果网络中的其他参与者对证明没有异议，就会同时采用获胜者的候选区块作为“正式的”账本状态。

Liquid 并不依靠动态哈希竞赛来达成网络共识，而是在一组拥有特权的区块签署者（也就时我们在上文提到的第二类履职者）之间实行拜占庭容错式循环多签机制。这些履职者可类比为 PoW 系统里的矿工和 PoS 系统里的见证人。他们的职责是通过创建新的区块来推进网络的传播，从而验证交易。通过限制能够为共识作出贡献的候选者人数，而非坚持开放式联盟，Liquid 网络能够以较低的延时、较短的出块时间和较少的计算压力达成广泛共识。其共识算法在很多方面都借鉴了 Ripple RCPA 协议的特点（详见[此处](https://medium.com/@jkendzicky16/ripple-xrp-analysis-cc4f440d0604)）。Liquid 系统采用了循环的方式，由区块签署者轮流提议候选区块。待区块签署者发布候选区块后，其对等节点会通过预承诺方案来表露见证区块的意图。预承诺轮结束时，如果有三分之二乃至以上的区块签署者表示同意，都会用他们的密钥签署 k/n 区块。如果签名者的人数超过 2/3，区块就会被全网接受并写入账本。请注意，承诺签名的区块签署者和实际签名的可能略有出入。例如，如果有签署者在此过程中失联，系统会轮换到另一个提议候选区块的区块签署者，并重复上述流程。

![img](../images/exploring-liquid-sidechain/grBxYdvr1WI)

Liquid 的拜占庭容错机制有一个的特点，即，不可能发生两个以上的区块重组（在没有作恶或漏洞的情况下）。如果一个候选区块没有达到指定的签名阈值，或被选中的区块签署者没有在限时 1 分钟内履行职责，这一时间间隔内就不会有区块产生。然后，这些交易进入下一轮候选阶段。用户不会面临网络分叉成两条冲突的链的风险。为此要付出的代价是，如果区块签署者一直未能达到出块所需的指定阈值，网络就有可能停摆。

## 隐私性

Liquid 通过直接在协议中内嵌环机密交易功能保障用户的隐私性。环机密交易功能屏蔽了重要的元数据，如，交易输出值和 目的/接收方地址。和 Zcash 一样，Liquid 用户能够以透明或私密方式广播交易。但是，在默认情况下，协议自动以非透明方式广播交易。如果用户想要公开元数据，必须手动配置交易。在处理机密交易的元数据时，只有可以访问盲密钥（blinding key）的参与者才能查看这类数据。盲密钥仅限于交易的发送方和接收方，但是也可以被分享给其它参与者。

上述系统的优点是，可以让网络参与者有选择地公开信息。选择性公开有助于网络参与者保护有关其业务或交易运作的敏感信息，同时让授权方（业务合作伙伴、审计员、政府官员等）能够以简单、灵活、无摩擦的方式分享数据。关于机密交易的优点，一个很好的例子是大额交易者。由于比特币区块链支持公开审计，外部参与者可以看到大额资金流入交易所，因此可以抢先交易，从而推高价格，给大额交易者造成滑点。

## 挑战

虽然 LBTC 有很多优点，但它也为此付出了代价，尤其是对于节点运营者来说。LBTC 在性能方面最大的局限性包括：

- 区块容量上限为 1 MB（较低）

- 高于比特币 10 倍的 CPU 需求

- 高于比特币 10 倍的带宽需求

- 由于机密交易的特点，LBTC 有着高于比特币 10 倍的交易体积。但是，随着 Bulletproof（防弹协议）的实现（见门罗币），这一点将有巨大改进。

- UTXO 集可能会成倍增长

- 同步和新节点引导可能会困难得多，而且计算成本很高。

- 信任因素更多（见后文）

## 资产发行功能

Liquid 还有一个有趣的功能是 Issued Asset（发行资产）。Issued Asset 类似以太坊网络上常见的 ERC20 标准，而且是 Liquid 侧链独有的原生功能。任何侧链参与者都能在 Liquid 系统上发行自己的资产并转移给生态中的其他用户。资产发行者可以选择让供应量永远保持不变，或保有对于未来增发计划的决定权。这是通过一个叫作再发行代币（reissuance token）的功能实现的，后者可以通过多签方案构建并分散给众多用户。这类资产可以在很多场景中发挥作用，例如，发行者可以在一个高度流动的互联网络中分发某种形式的代币化证券：黄金储值代币、法币背书的代币、公司股份、收藏品、ETF 相关产品等等。

## 降低风险

一些攻击向量虽然不是显而易见，但是确实存在。履职者不仅需要相互通信，有时还要依靠这些通信来决定**他们自己在特定情况下应该采取哪些行动**。例如，在共识算法的预承诺期间，如果区块签署者针对特定候选区块发送了同意信号，却发现发送信号的签署者人数没有达到目标值 X，则会在正式签署阶段袖手旁观。如果攻击者能够拉拢超过三分之一的区块签署者，就能通过拒绝投票来迫使网络停摆，阻止创建区块所必需达到的三分之二共识阈值。如果攻击者能够拉拢三分之二的区块签署者，就可以将恶意区块上链。

为了防范这类威胁，当新的履职者加入网络时，Blockstream 会为他们提供专有硬件来进行网络操作。该硬件包括两个组件：一个带有预编译软件的服务器，用于执行网络操作；一个“离线”硬件模块，用于存储履职者密钥。这些硬件装置在设计上有意限制了可能危及共识流程的网络堆栈漏洞。每个履职者服务器一般存储在安全、隐匿位置，只通过 Tor 与其它履职者服务器通信。Tor 连接通过混淆服务器的 IP 地址来保障安全性，降低物理盗窃或篡改的风险，同时抵御潜在的 DDOS 攻击。RCP 调用受到严格限制，而且硬件专门配置为仅当装置上的按钮按下时才支持 SSH 连接。这意味着你必须亲自到硬件的存放处修改软件或网络，严格限制了攻击向量。

对于联盟来说，最显而易见的威胁是履职者本身。归根结底，在 Liquid 网络上交易的用户不得不信任履职者。如果超过三分之二的履职者串谋，他们就能窃取用户的资金。但是，鉴于博弈论下的激励模型，这种情况发生的可能性似乎较低。首先也是最明显一点是，这些履职者并非匿名参与者，而是在司法辖区内经营的已知机构。公开串谋窃取用户资金的履职者几乎不可能逃避司法追索。第二，至于秘密串谋（伪装成黑客攻击），交易所天然不会做窃取用户资金这样的事，这会影响其核心业务收入（交易费），除非攻击所得超出串谋成本和放弃未来业务收入所损失的资本的机会成本。还要考虑这样一个事实，串谋成本与总串谋人数呈对数增长。鉴于交易所获得的巨额交易费收入，除非 Liquid 网络增长至极高的价值，否则这种情况发生的可能性很低。

## 工作流

Liquid 主要面向交易所、做市商和其它大型流动性提供者以及它们的用户。虽然 Issued Asset 功能提供了诱人的资产发行机会，但是其它区块链系统提供的脚本能力和更高的吞吐量加剧了整个市场的竞争和饱和程度。另一方面，交易者亟需更快的资产结算速度，从主流交易所之间存在的巨大价差可见一斑。支持跨平台转移大额资金可以帮助交易者和流动性提供者减少摩擦和成本，同时减少交易所指数之差来提高整体市场效率。

## 结论

虽然 Liquid 不是最前沿的侧链技术实现，但是它可以让交易者和交易所提供流动性并迅速完成交易结算，从而解决密码学资产生态当下的合法需求。其优点包括利用机密交易引入的隐私性、更高的吞吐量、更快的结算速度和发行自定义资产的能力；缺点包括增加节点运营者的计算成本、高于中本聪共识的信任需求，以及资金失窃或无法找回的对手方风险。一旦成功，Liquid 将证明侧链模型是有效的，并通过后续实现为比特币区块链带来更多功能。这无疑会带来一定风险，但是鉴于侧链技术不具有强制性，这是值得我们追求技术挑战。

非常感谢 Allen Piscitello（来自 [Blockstream](https://twitter.com/Blockstream)）、[Pietro Moran](https://twitter.com/PietroMoran) 和 [Hasu](https://twitter.com/hasufl) 对本文的贡献！

 （完）