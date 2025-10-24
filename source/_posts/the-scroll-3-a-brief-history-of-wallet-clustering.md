---
title: '钱包聚类分析简史'
author: 'nothingmuch'
date: '2025/10/23 10:36:16'
cover: ''
excerpt: '更加复杂的聚类分析方法'
tags:
- 隐私性
---


> *作者：nothingmuch*
>
> *来源：<https://spiralbtc.substack.com/p/the-scroll-3-a-brief-history-of-wallet>*
>
> *[前篇见此处](https://www.btcstudy.org/2025/10/21/the-scroll-2-wallet-clustering-basics/)*



我们的上一篇文章介绍了钱包（地址）聚类分析背后的基本想法、地址复用的简单例子、基于输入来源同一性（CIOH）启发式分析（也叫 “多输入线索”）的集群合并。

今天，我们会扩展到更加复杂的聚类分析方法、简要地总结几篇重要的论文。本文的内容与这场同主题的[直播](https://www.youtube.com/watch?v=ndgSQlLIfI4)多有重叠；该视频也是本系列补充。请注意，我们所引用的工作的列表不是毫无遗漏的。

## 早期的观察式研究：2011 ~ 2013

就我所知，最早发表的关于钱包聚类分析的学术研究是 Fergal Reid 和 Martin Harrigan 的《[比特币系统的匿名性分析](https://link.springer.com/chapter/10.1007/978-1-4614-4139-7_10)》（[PDF](https://arxiv.org/pdf/1107.4524)）。这项工作以更加广义的视角研究了比特币的匿名属性；在讨论链上交易图谱时，它使用了 “用户网络（User Network）” 的概念来捕捉一个用户的钱币的相关性（也基于 CIOH）。使用这种模型，作者批评了 WikiLeak 的 “[接受匿名的比特币捐赠](https://twitter.com/wikileaks/status/80774521350668288)”的说法。

另一项研究没有出版为论文，是 Kay Hamacher 和 Stefan Katzenbeisser 在 28c3 会议上的演讲 [Bitcoin - An Analysis](https://fahrplan.events.ccc.de/congress/2011/Fahrplan/events/4746.en.html)（[YouTube 视频](https://youtube.com/watch?v=hlWyTqL1hFA)）。他们使用交易图谱数据研究了资金的流动，并对比特币作出了一些非常有先见之明的观察。

在《[完整比特币交易图谱的量化分析](https://link.springer.com/chapter/10.1007/978-3-642-39884-1_2)》（[PDF](https://eprint.iacr.org/2012/584.pdf)）中，Dorit Ron 和 Adi Shamir 分析了完整交易图谱的一个快照。除此之外，他们指出了一种奇怪的模式，可能就是打破 CIOH 的一项初步尝试：

> 我们发现，几乎所有这些大规模交易都是一笔大规模交易（涉及 90000 BTC）【可能是 [b9a0961c07ea9a28…](https://mempool.space/tx/b9a0961c07ea9a28bdfa950556bd96f71d9ecf6e42d19c08cb2ee331a30d30cb)】的后代；作为起源的这笔交易发生在 2010 年 11 月 8 日，而这些交易所形成的子图包含了许多看起来奇怪的链条和 拆分-合并 构造；在这些构造中，一笔大额资金或者是在几个小时内经过了几百个临时的中转账户，或者是拆分成了许多笔小额资金、发送到了不同账户中，但很快又重新汇集在一个新账户中、数额几乎不变。

这种模式的一个早期干扰项来自 MtGox 交易所，他们[允许用户上传自己的私钥](https://en.bitcoin.it/wiki/MtGox/API/HTTP/v1#redeem_a_wallet.dat)。许多用户的私钥都被用在由 MtGox 构造的资金清扫交易中（作为输入），以服务这种罕见的存款模式。对这些交易粗暴地应用 CIOH，会导致 “聚类崩溃”，尤其是以前在 walletexplorer.com 网站（现在叫做 CoinJoinMess）上被称为 “[MtGox 的朋友们](https://www.walletexplorer.com/wallet/MtGoxAndOthers)” 的集群。Ron 和 Shamir 似乎也注意到了这一点：

> 不过，这些统计数据中有一个很大的方差；实际上，有一个主体跟 15 6722 个不同地址有关。通过分析其中的部分地址、跟踪他们的交易，可以容易地知道，这个主体就是 Mt.Gox 。

虽然找零识别已被提及（Ron 和 Shamir 将这些输出称为 “内部” 转账），但正式形成概念的第一次尝试似乎是《[评估比特币的用户隐私性](https://link.springer.com/chapter/10.1007/978-3-642-39884-1_4)》（[PDF](https://eprint.iacr.org/2012/596.pdf)），来自 Elli Androulaki、Ghassan O. Karame、Marc Roeschlin、Tobias Scherer 和 Srdjan Capkun 。他们使用了“影子地址（Shadow Addresses）” 这个术语，但现在，人们更常管它们叫“找零输出”。这指的是给（支付者）自己支付的输出 —— 由为这笔交易提供输入的同一个主体持有，通常每笔交易都有一个。这篇论文引入了一种启发式分析，用于识别出这样的输出，从而将它们与输入划分为同一个集群。一个例子是：一笔交易带有两个输出，那么，如果其中一个输出的数额（的美元价值，根据历史汇率）接近于一个整数，那么这个输出可能是真正的支付，从而另一个输出就是找零。

在比特币隐私性研究的起步阶段，就已经能看出，钱包聚类分析的理论被确立为比特币隐私性研究的基础工具。虽然它还没有形成完整的理论，证据支持也比较有限，因此需要使用相对较强的假设来解释观察到的数据。

## 经验结果：2013 ~ 2017

虽然研究者们尝试验证这些论文的结论，比如，通过访问比特币的用户并让他们确认钱包聚类分析的准确性，或者使用模拟方法（就像 Androulaki 等人的论文一样），关于用户正在使用的对抗策略的信息很少。

Sarah Meiklejohn、Marjori Pomarole、Grant Jordan、Kirill Levchenko、Damon McCoy、Geoffrey M. Voelker 和 Stefan Savage 的论文《[一堆比特币：识别匿名人之间的支付](https://dl.acm.org/doi/abs/10.1145/2504730.2504747)》（PDF：[1](https://dl.acm.org/doi/pdf/10.1145/2896384)、[2](https://web.archive.org/web/20180417225209id_/http://conferences.sigcomm.org/imc/2013/papers/imc182-meiklejohnA.pdf)）研究了比特币混币器（mixer）的用法，并通过真的使用这些服务来测试启发式分析。在理论层面，他们定义了一种比以往的论文更加通用且准确的找零分析。

在论文《[数据驱动的比特币去匿名化](https://www.research-collection.ethz.ch/bitstream/handle/20.500.11850/155286/eth-48205-01.pdf)》中，Jonas Nick 成功地验证了 CIOH 和找零识别启发式分析，使用的是从 BIP 37 布隆过滤器的实现中的一个隐私性 bug 中获得的信息。这个实现主要用在 bitcoinj 内置的轻客户端中，背后的隐私性泄露也在  Arthur Gervais、Srdjan Capkun、Ghassan O. Karame 和 Damian Gruber 的论文《[论比特币轻量客户端中的布隆过滤器的隐私性配置](https://dl.acm.org/doi/abs/10.1145/2664243.2664267)》（[PDF](https://discovery.ucl.ac.uk/id/eprint/10182350/1/2014-763.pdf)）中得到了描述。这些泄露信息证实，聚类分析是非常强大的；Martin Harrigan 和 Christoph Fretter 的论文《[地址聚类分析的反常效率](https://ieeexplore.ieee.org/abstract/document/7816867)》（[PDF](https://arxiv.org/pdf/1605.06369)）就详细讲解了这一发现。

还有人观察到，攻击者也会发送比特币，不过不是像《一堆比特币》论文说的那样通过混币器，而是将小额的资金发送到在区块链上已经出现过的地址中。这种动作被称为 “粉尘攻击” <sup><a href='#note1' id='jump-1-0'>1</a></sup>，可以借由两种方式让受害者去匿名化。第一种是，收款的钱包可能会花费这些资金，造成地址复用；第二种是，较老版本的 Bitcoin Core 软件[经常](https://github.com/bitcoin/bitcoin/pull/18038)重新广播收款交易，所以一个在 P2P 网络中连接了许多节点的攻击者就可以观察，是否哪个节点在重新广播这些粉尘交易，然后将这个节点的 IP 地址跟钱包集群关联起来 <sup><a href='#note2' id='jump-2-0'>2</a></sup>。

虽然 Matteo Loporchio、Anna Bernasconi、Damiano Di Francesco Maesa 和 Laura Ricci 的论文《[比特币在积累粉尘吗？小额比特币交易分析](https://link.springer.com/article/10.1007/s41109-023-00557-4)》（[PDF](https://link.springer.com/content/pdf/10.1007/s41109-023-00557-4.pdf)）提出了一些洞见、探究了粉尘攻击，但他们分析的数据集仅仅覆盖到 2017 年（论文的出版时间是 2023 年）。这项工作看到了这种攻击在揭晓地址集群时候的有效性：

> 这意味着，尽管粉尘攻击交易仅占所有产生了粉尘输出的交易的 4.86% ，但在所有感染过粉尘且被聚类的地址中，有 66.43% 都是因为粉尘而被聚类的。考虑到整个数据集的大小，可以假设是粉尘攻击的交易只占所有交易的 0.008% ，却让所有地址的 0.14% 被聚类（如无粉尘攻击，它们会依然被认为是孤立的）。

这一阶段的研究令人印象深刻的地方在于，出现了对钱包聚类理论的更严苛检验。越来越清楚的是，在一些情况下，用户的行为是可以很容易、很确凿地被观察出来的；比特币对隐私性的保障绝不完美，不仅在理论上如此，越来越多的科学证据也表明事实如此。

## 钱包指纹：2021 ~ 2024

“钱包指纹” 指的是在交易的数据外观中可以识别出来的模式，也许意味着用户在使用某一款钱包软件。近年来，研究者们已经在钱包聚类分析中应用了钱包指纹分析。通常来说，一个钱包集群，都是使用同一款钱包软件来创建的，因此，在集群内，任何可以观察到的指纹都应该是完全一致的 <sup><a href='#note3' id='jump-3-0'>3</a></sup>。

举个钱包指纹分析的简单例子：每一笔交易都有一个 nLockTime 字段，可以用来顺带标注创建交易的日期  <sup><a href='#note4' id='jump-4-0'>4</a></sup>；它的数值可以是区块高度，也可以是日期。在不需要标注日期时，这个字段可以使用任何代表已经过去的时间点的数值，一般来说是 0 ，但这样的交易在签名时候就没有日期标准。为了避免暴露用户的意图以及解决 “[手续费狙击](https://bitcoinops.org/en/topics/fee-sniping/)” 顾虑，一些钱包会随机指定一个代表近期时间的 nLockTime 数值。然而，因为一些钱包总是使用 0 数值，当我们无法确定一个输出到底是支付还是找零时，后续的一笔交易可能就会揭晓这个信息。比如说，假设跟一个输入钱包相关的所有交易都使用 0 作为 nLockTime 数值，但某一个输出的花费交易竟然不是这样的，那就可以合理假设，这个输出是给另一位用户的支付。

还有许多其他已知的指纹。Ishaana Misra 的文章《[钱包指纹：侦测与分析](https://ishaana.com/blog/wallet_fingerprinting/)》是一份全面的总结。

Malte Möser 和 Arvind Narayanan 的论文《[比特币中的复活地址聚类](https://link.springer.com/chapter/10.1007/978-3-031-18283-9_19)》（[PDF](https://arxiv.org/pdf/2107.05749)）也在聚类问题中应用了钱包指纹。他们使用它作为改进找零识别方法的基础。他们依靠钱包指纹来训练和评估使用机器学习技术（随机森林）的强化找零分析。

很快，在《[如何拆分 100 万：验证和拓展比特币聚类分析](https://www.usenix.org/conference/usenixsecurity22/presentation/kappos)》（[PDF](https://www.usenix.org/system/files/sec22-kappos.pdf)）中，George Kappos、Haaroon Yousaf、Rainer Stütz、Sofia Rollet、Bernhard Haslhofer 和 Sarah Meiklejohn 就使用一份由一家区块链分析公司提供的交易类聚数据样本，拓展并验证了这一方法；结果表明，钱包指纹方法比起单单使用 CIOH 和更简单的找零识别线索要准确很多很多。在聚类中考虑钱包指纹之后，去匿名化就变得简单很多很多。相应地，在钱包软件实现中考虑指纹，就能提高隐私性。

最近的一篇论文《[探究未确认的比特币交易，用于高效的比特币地址聚类](https://dl.acm.org/doi/abs/10.1145/3589334.3645684)》（[PDF](https://arxiv.org/pdf/2303.01012)），来自 Kai Wang、Yakun Cheng、Michael Wen Tong、Zhenghao Niu、Jun Pang 和 Weili Han，分析了交易在被区块确认以前的广播模式。比如说，可以观察到不同的手续费追加动作，有些是 “[手续费替换](https://bitcoinops.org/en/topics/replace-by-fee/)”，有些是 “[CPFP](https://bitcoinops.org/en/topics/cpfp/)”。这样的模式，虽然并非严格意义上从交易的数据外观中推导出来的指纹，也依然可以认为是钱包的指纹，不过是跟特定的钱包软件相关的更加昙花一现的模式，在连接到比特币 P2P 网络时可以观察到，但不会在已经得到确认的交易的历史上出现，因为区块链不记录这些。

类似于比特币点对点网络层，闪电网络的 gossip 层也会分享关于公开通道的信息。这通常并不会被视为一种钱包指纹，但可以松散地认为也是，是闪电交易在区块链上的指纹的补充。闪电通道也是钱币（UTXO，未花费的交易输出），每一条通道都连接两个闪电节点（可以用他们的公钥来识别），可以视作一条边，许多的边就形成了一个网络。因为一个节点可能跟多条通道有关，而且每条通道都是钱币，这就类似于地址复用 <sup><a href='#note5' id='jump-5-0'>5</a></sup>。Christian Decker 曾经公开存档闪电网络图谱的历史数据。一项关注这一语境下的钱包聚类分析的工作是《[闪电网络协议种的跨层去匿名化方法](https://link.springer.com/chapter/10.1007/978-3-662-64322-8_9)》（[PDF](https://arxiv.org/pdf/2007.00764)），来自 Matteo Romiti、Friedhelm Victor、Pedro Moreno-Sanchez、Peter Sebastian Nordholt、Bernhard Haslhofer 和 Matteo Maffei 。


在过去十五年间，钱包聚类分析技术发展迅猛。不幸的是，比特币隐私技术的采用却遥遥无期。而且就算曾经采用过，也没有跟上攻击研究的最新进展。

## 故事还未完

如我们所见，从中本聪寥寥数笔介绍“地址复用”和“CIOH”开始，钱包聚类分析就是比特币隐私性中的基础观念，并在过去几年中逐渐完善。大量的学术文献质疑了一些对比特币隐私性的过分乐观的理解，起点是 WikiLeaks 在 2011 年将比特币捐赠称为是 “匿名的”。隐私性保护的进一步研究和开发还有许多机会。

应该放在心里的事情是，聚类分析技术只会不断进步。“要记住：攻击只会变得更加精巧，绝对不会变弱”<sup><a href='#note6' id='jump-6-0'>6</a></sup>。区块链的本性不会改变，交易图谱中的模式会永远留存，等待着某人来探究它。使用 Electrum 协议的轻钱包会向自己的 Electrum 服务端泄露自己的地址集群。提交 [xpub](https://github.com/bitcoin/bips/blob/master/bip-0032.mediawiki)（拓展公钥）给某个服务商的用户会在一次查询中泄露所有过去和未来交易的集群信息。区块链分析行业的本性不会改变，专有的技术有显著的优势，比如有渠道访问 KYC 信息、为大量交易打标签。这些外在于区块链的聚类信息格外难以估量，因为，虽然它们会被分享给第三方，这些信息并不总是公开的，不像基于链上数据的聚类信息一样。因此，这些泄漏并不总能广泛观察到。

此外，还要记得，对隐私性的控制权并不总在当事人手上。当某个用户失去了隐私性，所有其他用户的隐私性也会降级。这个消除过程意味着隐私性的线性衰减：每一个被成功去匿名化的用户都可以先被排除在外，然后对剩余用户进行进一步的去匿名化。换句话说，即使你采取了措施来保护你的隐私性，如果其他人没有这样做，你就会显得扎眼。

但是，如我们所见，假设隐私性的衰减是线性的，还是过分乐观了一些；指数型衰减才是更加安全的假设。这是因为分治策略（divide-and-conquer）也适用于钱包聚类分析，就像“20 问题游戏”一样。CoinJoin 交易也被专门设计为打破 CIOH，我们的下一篇文章的话题就是这个：有一篇论文结合了钱包聚类分析和 “交集攻击（intersection attacks）” —— 这是一个借自混合网络隐私性文献的概念 —— 来去匿名化 CoinJoin 交易。

（完）

## 脚注

1.<a id='note1'> </a>不要跟另一种 “粉尘攻击” 相混淆，就像 LaurentMT 和 Antoine Le Calvez 在聚类分析[这个案例](https://medium.com/@laurentmt/good-whale-hunting-d3cc3861bd6b)时那样。 <a href='#jump-1-0'>↩</a>

2.<a id='note2'> </a>一个值得关注、或多或少也有关联的论文是《[对 Zcash 和 Monero 节点的攻击（对匿名交易的远程侧信道攻击）](https://www.usenix.org/conference/usenixsecurity20/presentation/tramer)》,来自 Florian Tramer、Dan Boneh 和 Kenny Paterson，也通过研究点对点网络层的时间侧信道，成功将节点的 IP 地址与观察密钥（viewing keys）关联起来。 <a href='#jump-2-0'>↩</a>

3.<a id='note3'> </a>更准确地说：指纹的分布在一个集群中应该是一致的，因为一些钱包会故意将交易的特定属性随机化。 <a href='#jump-3-0'>↩</a>

4.<a id='note4'> </a>注意，为了强制执行 nLockTime，交易的至少一个输入的 nSequence 应该也是非最终的（non-final），这就让事情变得更加复杂，不管是为了附注时间，还是为了产生不同的可观察模式。 <a href='#jump-4-0'>↩</a>

5.<a id='note5'> </a>通道资金是有参与通道的双方共享的，但通道的关闭交易类似于一笔来自通道注资者的支付。双向注资通道也许可以击败 CIOH ，就跟 [PayJoin 交易](https://payjoin.org/)一样。 <a href='#jump-5-0'>↩</a>

6.<a id='note6'> </a>[对 AES 的新型攻击 —— Schneier 论安全](https://www.schneier.com/blog/archives/2009/07/new_attack_on_a.html) <a href='#jump-6-0'>↩</a>