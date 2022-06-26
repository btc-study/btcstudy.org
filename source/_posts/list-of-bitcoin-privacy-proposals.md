---
title: '回顾比特币的隐私强化方案'
author: 'Seth For Privacy'
date: '2022/06/24 23:50:23'
cover: ''
excerpt: '回顾比特币以往的隐私强化提议可以帮助我们吸取教训，指明未来优化的方向'
categories:
- 比特币主网
tags:
- 隐私性
---


> *作者：Seth For Privacy*
>
> *来源：<https://bitcoinmagazine.com/technical/list-of-bitcoin-privacy-proposals>*
>
> *本文的一个版本最早出版于 [sethforprivacy.com](https://sethforprivacy.com/posts/proposed-bitcoin-privacy-improvements/)。*

[Ragnar Lifthrasir 提问有没有一个清单](https://twitter.com/Ragnarly/status/1531667098522382336)涵盖了提升比特币隐私性的想法和提议，既包括正在开发的、已被放弃的、从未实现的，也要有沉寂无闻的，那么我尝试写写一份。

![image-20220623154333098](../images/list-of-bitcoin-privacy-proposals/image-20220623154333098.png)

当然，这份清单也做不到一网打尽，我只能尽己所能让它跟上最新紧张，并找出已经无人问津的历史提议。下文的章节将按照项目或者说实现来切分，并按照提议的时间排序（只要做得到的话）。

<strong><em>注：虽然某一些提议从未真正开始或已经被放弃，有一些是很有趣而且可能有前景的提议。这不是一个 “耻辱柱”，而是一个机会，帮我们从过往的提议中学到教训，并随着我们的进步增加新的内容。</em></strong>

## 比特币

### 机密交易（Confidential Transactions）

**状态**：从没有正式提出过。

**优点**：极大地提升对抗基于数额的启发法的隐私性；可以为比特币启用极大优化和更加灵活的应用层隐私工具（即输出面额不等的 CoinJoin）。

**缺点**：供给量审计会变得更加困难（但依然是有可能的），并且依赖于更高级的密码学；交易的体积和验证的时间都会急剧增加。

机密交易（2017 年进入门罗币 Monero，2018 年进入 Liquid 联盟侧链）是一种无需向交易对手以外的人公开数额即可验证和证明、因此可以隐藏交易数额的技术。矿工、节点和外部观察者不必知道被转让的数额，依然可以验证该交易没有创建或摧毁资金。

**延伸阅读**：

- [Greg Maxwell 的最早提议](https://elementsproject.org/features/confidential-transactions/investigation)
- [Elements 平台中的机密交易](https://elementsproject.org/features/confidential-transactions)

### 给层级确定式钱包的可复用的支付码（BIP47）

**状态**：一致反对实现

**优点**：更容易用一个静态的标识符（支付码）来接收支付，同时维持隐私性；支付码与链上地址（交易）之间没有直接关联（也即不像是静态的比特币地址）

**缺点**：大多数版本都要求先在链上发起一笔通知交易，使得接收方知道如何查找发送给自己的资金；如果不能正确实现，提醒交易会降低隐私性。

可复用支付码提议是最著名的 BIP 之一，因为它被 [Samourai Wallet](https://samouraiwallet.com/) 以 “[PayNym](https://samouraiwallet.com/paynym)” 之名接受并使用。这个提议类似于 “隐身地址（Stealth Addresses）” ，只需要一个支付码就能推导出互无关联的链上地址，区别在于可复用支付码并不在链上使用不同的地址格式，相反是依赖于一笔通知交易来告诉支付的接收者如何找出给自己的支付。

PayNyms 虽然在 BIP47 中被拒绝了，但还是得到了非常广泛的使用，最近也在 [Sparrow Wallet](https://sparrowwallet.com/) 中实现了，甚至一个比特币矿池  “[Lincoin](https://lincoin.com/)” 也采用了它。

[Ruben Somsen 为三种主要的可复用支付码提案作了很棒的总结](https://gist.github.com/Kixunil/0ddb3a9cdec33342b97431e438252c0a?permalink_comment_id=4013454#gistcomment-4013454)，并在  gist 频道“可复用的 Taproot 地址（[Reusable Taproot Addresses](https://docs.google.com/document/d/1-2D32CXzPwp7DIXLCrVq0B5JWC8TUwgNNFonSbvbwYo/edit#bookmark=kix.ymu76tgx99ik)）” 中提出了 “静默支付（[Silent Payments](https://docs.google.com/document/d/1-2D32CXzPwp7DIXLCrVq0B5JWC8TUwgNNFonSbvbwYo/edit#bookmark=kix.9po3fk6gi4e7)）”。

**延伸阅读**：

- [Payment Code BIP47 原本](https://github.com/bitcoin/bips/blob/master/bip-0047.mediawiki)

### 隐身地址（BIP63）

**状态**：虽然被赋予了一个 BIP 编号，但从未作为一个 BIP 被接受过。

**优点**：一旦执行，可以阻止链下地址（公钥）与链上一次性地址的一切关联；打破了所有基于地址的启发式跟踪

**缺点**：钱包必须扫描所有的交易来验证哪一笔是发给用户的；因此无法再做仅基于地址的钱包同步

隐身地址是一个很有创意的想法，接收者只需分享或公开一个静态的地址，发送者可以借此推导出一个一次性地址，而且可以打破跟公开的链上地址之间的所有密码学关联。虽然这不怎么会增加钱包同步的时间（它需要扫描所有交易来检查那些由你的私钥持有，而不能仅验证已知的地址），它可以完全打破基于地址的钱包聚类分析以及其它关键的启发式跟踪。

隐身地址最初是在 2011 年在 BitcoinTalk 论坛上提出的，但[后来因为 OP_RETURN 改变了，它作为一个 BIP 也就被废弃了](https://www.reddit.com/r/Bitcoin/comments/5xm9bt/comment/dejcjmw/?utm_source=share&utm_medium=web2x&context=3)：

> “OP_RETURN 在我临门一脚之时变成了只能挂载 40 字节，我的隐身地址标准也就没有用武之地了，我也转去开发别的东西了。”
>
>  —— u/petertodd

虽然 Dark Wallet 为比特币实现了隐身地址，这个钱包从未正式推出，也被放弃了。另一方面，门罗币则把隐身地址作为 Cryptonote 协议的核心部分之一（Cryptonote 协议也是创建门罗币的基础协议）。

**延伸阅读**：

- [Stealth Address BIP63 原本](https://github.com/genjix/bips/blob/master/bip-stealth.mediawiki)

### PayJoin（BIP78）

**状态**：草案

**优点**：所创建的交易看起来与普通交易无二，但打破了输入所有权同一性假设；如果能得到接收者支持，则很容易执行

**缺点**：要求在 商户/接收者 一端使用热钱包，无法发送到简单地址；恶意发送者可以尝试逼迫接收者揭示 UTXO（如果实现合理，这种攻击可以缓解）

PayJoin 可能也是比特币隐私性爱好者耳熟能详的东西，因为它获得了一些媒体的报道和小范围的接受，虽然其正式提议还处于 “草案” 阶段。PayJoin 让交易的发送者和接收者协作构造出一笔合并交易，该交易使用了来自发送者和目标接收者两方的资金（各出一个或多个 UTXO），从而在链上混淆支付的真实属性。

[Samourai Wallet](https://samouraiwallet.com/) 在 2019 年实现了一个类似的协议 “Stowaway”（还早于 PayJoin BIP 提议），而 PayJoin 提议还由 [BTCPay Server](https://btcpayserver.org/) 在 [2020 年 6 月](https://github.com/btcpayserver/btcpayserver/releases/tag/v1.0.5.0)、[JoinMarket](https://github.com/JoinMarket-Org/joinmarket-clientserver) 在 [2020 年 8 月](https://github.com/JoinMarket-Org/joinmarket-clientserver/releases/tag/v0.7.0)、[Blue Wallet](https://bluewallet.io/) 在 [2020 年 10 月](https://twitter.com/bluewalletio/status/1313822205286010883)、[Sparrow Wallet](https://sparrowwallet.com/) 在 [2020 年 11 月](https://github.com/sparrowwallet/sparrow/releases/tag/0.9.7)分别实现。这些文档可以帮助你了解更多：

- [Stowaway，Samourai Wallet](https://docs.samourai.io/en/spend-tools#stowaway)
- “[BTCPay Server PayJoin 指南”，BTCPay Server](https://docs.btcpayserver.org/Payjoin/)
- [PayJoin (aka, P2EP) 用户指南，JoinMarket](https://github.com/JoinMarket-Org/joinmarket-clientserver/blob/master/docs/PAYJOIN.md)
- [Paying to a PayNym，Sparrow Wallet](https://sparrowwallet.com/docs/spending-privately.html#paying-to-a-paynym)

虽然 PayJoin 在一些钱包和工具中实现了，它的使用量似乎还是不见起色（不过，你是很难在链上检测出它们的，所以真实用量比我们认为的要高也不一定）。不被采用的主要原因是商家为了支持 PayJoin 需要使用热私钥，而许多商家不愿意为了获得 PayJoin 的好处而这样做。

**延伸阅读**：

- [最早的 PayJoin 博文](https://reyify.com/blog/payjoin)
- [PayJoin BIP78 原本](https://github.com/bitcoin/bips/blob/master/bip-0078.mediawiki)
- “[PayJoin 采用情况”，Bitcoin Wiki](https://en.bitcoin.it/wiki/PayJoin_adoption)

### 点对点的通信加密（BIP151 和 BIP324）

**状态**：最初的 BIP151 撤回了，新的 BIP324 还在草案阶段

**优点**：防止互联网服务运营商（ISP）和手机运营商的简单窥探；防止恶意节点假扮你所执行的远程节点的中间人攻击；可以标注好的节点，以保证你总是有健康的节点作为对等节点

**缺点**：通信加密是保护比特币的点对点网络应对常见攻击的一个重大且必要的措施，还能给运行节点的用户提供基本的隐私性、应对来自 ISP 和其它基础服务的窥探，而且已经作为 BIP 提出（BIP151 和 BIP324）。

[引用作者的原话](https://bip324.com/)：

> “BIP324 提出一种新的比特币点对点协议，它可以传输加密的信息并稍微降低带宽使用量。”

点对点通信加密在密码货币世界里面并没有广泛实现，但在门罗币社区也在研究这个课题。

**延伸阅读**：

- [BIP324 网站](https://bip324.com/)
- [BIP151 原本](https://github.com/bitcoin/bips/blob/master/bip-0151.mediawiki)
- [BIP324 原本](https://gist.github.com/dhruv/5b1275751bc98f3b64bcafce7876b489)

### 蒲公英（BIP156）

**状态**：已被拒绝

**优点（尤其是蒲公英 ++ 版本）**：通过对 P2P 网络的主动监视，防止交易被确定性地关联到发出它地节点；提供强大地网络层隐私性而无需使用一个匿名网络（匿名网络往往自身有严重地 DoS/女巫攻击 问题）

**缺点（尤其是蒲公英 ++ 版本）**：交易地广播要花费更多时间（传遍网络要花费一分钟到一分半钟，而当前只需几秒）；如果使用了恶意的远程节点而非你自己的节点，会产生新的 DoS 攻击向量；

蒲公英（Dandelion）是一种给比特币点对点网络带来合理推诿特性的方法，它能防止网络中的其他人将交易确定性地关联到最初广播它的节点。它的办法是选出一组节点、依次传输交易数据（每次只发给一个节点，是所谓的 “steam” 节点），然后仅在预定数量的节点已经传输交易之后向网络的其余部分传输交易（“fluff” 阶段）。

Dandelion++ 解决了最初的 Dandelion 协议的一些问题；门罗币于 2020 年实现了它。

**延伸阅读**：

- [Dandelion BIP156 原本](https://github.com/bitcoin/bips/blob/master/bip-0156.mediawiki)
- [Dandelion++ 论文](https://arxiv.org/pdf/1805.11060.pdf)

### Taproot（BIP341）

**状态**：草案（实际上并不是，因为它已经通过软分叉部署到了比特币上）

**优点**：极大地提升了脚本用户（比如多签名、闪电通道 开启/关闭 交易）的隐私性（如果能得到广泛接受的话；Tapscript 具有更多的脚本编程可能性；潜在的效率提升；批处理交易，等等。

**缺点**：非合作性的通道关闭交易依然要公开脚本，削弱了此类情况下的隐私得益

Taproot 可能是这份清单中最知名的 BIP，而且，虽然它在 BIP GitHub 库中还标记为 “草案”，实际上已经在比特币上实现了。

但要论实际影响，迄今为止还没有人使用它。而且它的采用可能会非常非常缓慢（尤其是在你可以选择不用的时候，Taproot 就是这样的），可能要好几年才会等到 Taproot 被广泛使用。

一旦 Taproot 可以用在闪电网络通道的开启交易中，它可以将脚本的细节隐藏在通道开启交易中，并且让通道开启交易在链上更难辨识出来，从而提供更好的隐私型。但是，如果日后通道关闭之时不是双方一起合作的话，脚本依然会在链上公开，打破这种隐私性。

**延伸阅读**：

- [Taproot BIP341 原本](https://github.com/bitcoin/bips/blob/master/bip-0341.mediawiki)

### SNICKER

**状态**：已被放弃，从未作为正式提案提出过

因为我并不是太了解 SNICKER，我就不说我的想法了，[下面的引文](https://gist.github.com/AdamISZ/2c13fb5819bd469ca318156e2cf25d79?permalink_comment_id=3135350)可以作为对这种技术的目标的总结：

> “SNICKER（简单的非交互式 CoinJoin 并为加密而复用密钥）是一种简单的方法，允许我们创建两方的 coinjoin 而无需两个参与者者有任何的同步通信或者说交互。它依赖于复用密钥的想法（要么是复用地址，要么是签名输入的所有权标识符，因此会导致签名中的公钥复用）。”

就我所知，这个提议从 2020 年开始就被放弃了。

**延伸阅读**：

- [SNICKER 提议 gist](https://gist.github.com/AdamISZ/2c13fb5819bd469ca318156e2cf25d79)

### CoinSwap

**状态**：正在开发，但从未作为正式提议提出过

**优点**：在链上看起来像一笔普通的交易

**缺点**：不能真正混淆或者说打破链上的历史，仅仅是尝试打破简单所有权启发分析；允许那些有污点的资金跟 “干净” 的资金做互换，会损害互换的对手方；在大部分情况下都没有明显的隐私性好处

CoinSwap 是一个在 2020 年很受欢迎而且经常被讨论的提议，因为它让用户可以交换 UTXO（因此也交换了相关的历史），但因为它不能移除历史或打破确定性的关联，它遭遇了很大的阻力。

[下面的引文](https://bitcoinops.org/en/topics/coinswap/)可作为对 CoinSwap 的简单总结：

> “Coinswap 是一套协议，允许两方乃至多方创建一组看起来像是独立支付的交易，但实际上他们彼此交换了他们的币；也可以在此过程中发生真正的支付。”

看起来 CoinSwap 是已经被放弃了，因为从 2020 年以来就没有进展，但最近，Chris Belcher 发布了一个叫做 “电邮交易（[Teleport Transactions](https://github.com/bitcoin-teleport/teleport-transactions)）” 的 CoinSwap 实现。

**延伸阅读**：

- [CoinSwap 设计提议](https://gist.github.com/chris-belcher/9144bd57a91c194e332fb5ca371d0964)
- [Bitcoinops.org 上的 CoinSwap 主题页](https://bitcoinops.org/en/topics/coinswap/)

### 静默支付

**状态**：正在开发，但没有作为正式的提议提出

**优点**：保护隐私的同时可以更容易用静态的地址（支付码）来接收资金；支付码和链上的 地址/交易 之间没有直接的关联（不像静态的比特币地址）；并不要求在链上发起通知交易（不像 BIP47）

**缺点**：跟现有的轻钱包完全不兼容；在初始化区块下载（initial block download，IBD）之后添加一个新的静默支付码将需要完全重启 IBD；需要持续扫描区块链以获知新的交易

静默支付（Silent Payments）是最近比特币讨论的热门，原理跟 BIP47 有点像（前文有述）。

虽然静默支付也提供了公开一个静态支付码就能用没有关联的地址在链上接收支付的功能，这种方法也有重大牺牲，它会让轻钱包完全派不上用场，而且可能要求完全重新下载比特币区块链来发现给新的静默地址的新交易。

如果能看到这个提议付诸实践，那会很有趣，但迄今为止，BIP47 似乎依然是更好的选择。

[静默支付](https://docs.google.com/document/d/1-2D32CXzPwp7DIXLCrVq0B5JWC8TUwgNNFonSbvbwYo/edit#bookmark=kix.9po3fk6gi4e7)的作者 Ruben Somsen ，在  gist 频道“可复用的 Taproot 地址（[Reusable Taproot Addresses](https://docs.google.com/document/d/1-2D32CXzPwp7DIXLCrVq0B5JWC8TUwgNNFonSbvbwYo/edit#bookmark=kix.ymu76tgx99ik)）” 中[为三种主要的可复用支付码提案作了很棒的总结](https://gist.github.com/Kixunil/0ddb3a9cdec33342b97431e438252c0a?permalink_comment_id=4013454#gistcomment-4013454)。

**延伸阅读**：

- [Silent Address 提议](https://gist.github.com/RubenSomsen/c43b79517e7cb701ebf77eec6dbb46b8)

### 可复用的 Taproot 地址

**状态**：正在开发，但尚未作为正式的提议提出

**好处**：保护隐私的同时可以更容易用静态的地址（支付码）来接收资金；支付码和链上的 地址/交易 之间没有直接的关联（不像静态的比特币地址）；将通知交易和首次支付合并成了一笔 “真实” 交易（不像 BIP47）；通知交易在链上看起来就像普通的 Taproot 花费行为

**坏处**：发送者和接收者都要支持和使用 Taproot；发送者需要使用一套特殊的协议才能从备份中复原钱包

这个提议跟 BIP47 和[静默支付](https://docs.google.com/document/d/1-2D32CXzPwp7DIXLCrVq0B5JWC8TUwgNNFonSbvbwYo/edit#bookmark=kix.9po3fk6gi4e7)有许多相似之处，但它利用了 Taproot 的新特性，从本质上减少了 BIP47 可复用支付码的牺牲；[静默支付](https://docs.google.com/document/d/1-2D32CXzPwp7DIXLCrVq0B5JWC8TUwgNNFonSbvbwYo/edit#bookmark=kix.9po3fk6gi4e7)的作者 Ruben Somsen 在 gist 中作了很棒的总结：

> **可复用的 Taproot 地址**：
>
> - 不需要持续扫描每一笔交易
> - 跟接收者只需要一次交互（发送者要保存状态；如果他们忘了，则需要再次交互）
> - 没有链上足迹
> - 发送者需要遵循一套特殊的协议，才能从备份中恢复钱包（这个缺点可以被缓解，见下文）
>
> **BIP47:**
>
> - 不需要持续扫描每一笔交易
> - 不需要跟接收者交互
> - 会在链上留下足迹（可使用一次性交互和带状态的备份（stateful backups）来替代）
>
> **静默支付**：
>
> - 需要持续扫描每一笔交易（提高运行全节点的成本）
> - 不需要跟接收者交互
> - 没有链上足迹

**延伸阅读**：

- [可复用的 Taproot 地址提议 gist](https://gist.github.com/Kixunil/0ddb3a9cdec33342b97431e438252c0a)
- [概念验证实现](https://github.com/w0xlt/reusable-taproot-addresses)

## 闪电网络

请注意，这些提议中的绝大都还处在非常初步的开发阶段，所以还不能给出清晰的 认可/否决。因此，下文提到的闪电网络提议主要是作为可能提供隐私性的重大开发进展来介绍的。

因为闪电网络一开始是作为一种可扩展性的工具（而非隐私性的工具）来设计的，最初的许多核心设计决策都非常不利于用户隐私性。下面的许多提议都在寻求解决这些问题，同时希望不会伤害支付的可靠性和路由的效率。

### 路径盲化

**状态**：正在开发

**优点**：阻止发送方找出路由到接收者的完整路径；隐藏接收者节点的昵称/公钥；于当前的透明路径方法相比，提供整体上更好的接收者隐私性；在一些特定的场景下，可以通过提供本地路由数据来获得更好的支付成功率

**缺点**：在特定的路由图情形中，构造盲化路由可能很难；在某些时候可能对支付成功率造成负面影响

当前的闪电网络面临跟接收者隐私性的许多严重问题，而路径盲化（Route Blinding）是尝试解决这个问题（至少是一部分问题）的关键提议之一。

引自[该提议文档](https://github.com/lightning/bolts/blob/9ca59ace8f14d6dd5996f5c934823dd0eca23d1d/proposals/route-blinding.md)：

> “路径盲化是一种轻量的技术，可以通过在一个洋葱路径的末端盲化任意多跳来提供接收方匿名性。”

路径盲化仍在非常初步的开发阶段，但有望让接收者可以接收资金、且无需确定性地揭晓最后一个接收资金的节点。

**延伸阅读**：

- [路径盲化提议](https://github.com/lightning/bolts/blob/9ca59ace8f14d6dd5996f5c934823dd0eca23d1d/proposals/route-blinding.md)
- [Route Blinding BOLT pull request](https://github.com/lightning/bolts/pull/765)

### 蹦床洋葱路由

**状态**：正在开发

**优点**：可以让轻钱包以保护隐私的方法创建路由，而无需完整的路由图；可以用来提供接收者对发送者的隐私性（但接收者对蹦床节点是不隐私的，就我所知）

**缺点**：目前我还没发现

虽然不算严格的隐私性提升，蹦床洋葱路由（Trampoline Onion Routing）可以在某些场景下为接收者提供更好的隐私性，这也是我把它列在这里的利用。它可以跟路由盲化相结合，提供更好的接收者隐私性，尤其是在你无法运行一个全节点和构造完整路由的情况下。

它对隐私性的完整影响尚待考虑，但它将是一个值得关注的有趣提议。

**延伸阅读**：

- [蹦床洋葱路由提议](https://github.com/lightning/bolts/blob/038575ac38ced9eee5ace09dd5ec9ba7515cad55/proposals/trampoline.md)
- [蹦床洋葱路由 BOLT 文档 pull request](https://github.com/lightning/bolts/pull/829)
- [蹦床洋葱路由 BOLT 技术规范 pull request](https://github.com/lightning/bolts/pull/836)

### 昵称 SCID

**状态**：正在开发

**优点**：为每个 通道/对等节点 使用一个唯一的昵称，从而防止支付跟单个节点的 昵称/公钥 简单关联起来

**缺点**：我尚未发现

闪电网络当前的一个致命的隐私问题是，节点用于 gossip 和通道管理的公钥和昵称是永远不变的，因此，只要一次接收支付就会向发送者泄露你的节点昵称和公钥。

解决这个问题的关键方法叫做 “昵称 SCID”，它让你可以强制你的对等节点只能用某一个昵称来指向你和你的通道；而这个昵称可以因 节点/通道 而不同。

**延伸阅读**：

- [昵称 SCID BOLT pull request](https://github.com/lightning/bolts/pull/910)

### 主动支付 —— BOLT12

**状态**：正在开发

**优点**：为接收者极大地提高隐私性和灵活性；主动出价只需更小的二维码和更少的数据（因为必要的数据是从接收者节点处直接收集的，而不像 BOLT11 发票那样是全部包含在发票里面的）

**缺点**：我尚未发现

BOLT12 是许多其它升级提议的结合体，而且也将它们整合到了一种新的、更连灵活的发票类型中，这种类型也叫 “主动支付（offer）”。BOLT12 以及路径盲化和节点昵称 SCID 的实现，将是闪电网络隐私性和用户体验上的一大进步，某种程度上也是当前所有提议的圣杯。

如果你经常使用闪电网络或者对闪电网络感兴趣，请密切关注它的开发，因为它承诺要解决当前的许多问题。

**延伸阅读**：

- [BOLT12 网站](https://bolt12.org/)
- [BOLT12 — Offers BOLT pull request](https://github.com/lightning/bolts/pull/798)

## 侧链

### LiquidNetwork

**状态**：2018 年推出

**优点**：使用机密交易略微提高了每笔交易的隐私性（但几乎没什么用处，因为使用量太小，因此匿名集也很小）；比链上更便宜的手续费

**缺点**：托管形式（通过一个联盟来托管）；几乎没有使用量，因此也没有群体让你藏身；以前的“紧急” 多签名钱包仅由很少的几方参与

“液态网络（Liquid Network）” 是一个锚定比特币的联盟侧链，让用户可以锁定 BTC 然后获得 L-BTC，并使用 L-BTC 在液态网络上转账。

比起比特币，液态网络提供了些微的隐私性提升，因为它使用了机密交易，而且它的手续费非常便宜。

用户应该非常小心，液态网络是一个联盟模式，也就是 *托管商们保管着控制你的比特币的私钥*，因此你的资金是有丢失和被盗风险的，而且你不应该假设自己总能拿回 BTC。

但是，液态网络在经历了四年的探索和[重度市场营销](https://liquid.network/)之后，依然没有多少用户。

**延伸阅读**：

- [Liquid Network 网站](https://liquid.net/)

### Fedimint

**状态**：正在开发

**优点**：当交易在侧链内部发生时，具有非常强大的隐私性；可以跟闪电网络交互，而无需每个用户都 运行一个节点/管理通道/等等；任何人都可以启动一个新的 minimint，而不仅仅是特定的 个人/群体；可以根据联盟成员数量、声誉、信任等因素选择一个具体的 minimint；可以作为自主托管的闪电节点（Zeus、Core LN、LND，等等）跟 “单托管商” 闪电节点（Wallet of Satoshi、Cash App、Strike，等等）之间的中介，同时还能对托管商保护用户的隐私

**缺点**：托管形式（也是联盟）；因为 托管/转移用户的资金，联盟成员有潜在的合规压力；闪电网络中心化，因为用户不再运行自己的节点，反而是依赖于联盟化的闪电网络服务

Fedimint（及其特定的最初实现 minimint）是一个相对较新的提议，可以开发一个联盟化的、像 David Chaum 的盲化 eCash 的比特币侧链，并使用比特币来计价。这些联盟化的侧链都会有相对较小的体量，可以交互，也会在声誉、正常运行时间和手续费水平上竞争。

虽然它还在非常初级的开发阶段，minimint 在完全自主托管的闪电网络用法（Zeus、Core LN、LND，等等）跟单一托管商的闪电网络用法（Wallet of Satoshi、Cash App、Strike，等等）之间占据了一个中间位置，它让一个被信任的托管商联盟来持有资金并未用户关联闪电节点。

注意，这个提议依然是托管型的，只不过跟[液态网络](https://docs.google.com/document/d/1-2D32CXzPwp7DIXLCrVq0B5JWC8TUwgNNFonSbvbwYo/edit#bookmark=kix.hw2et1xxw644)相比有不同的取舍。

**延伸阅读**：

- [FediMint 网站](https://fedimint.org/)
- [MiniMint GitHub 代码库](https://github.com/fedimint/minimint)

（完）