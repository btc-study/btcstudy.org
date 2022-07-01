---
title: '比特币的 “侧链愿景”'
author: 'Paul Sztorc'
date: '2022/07/01 14:16:58'
cover: ''
excerpt: '很少有人会同时支持所有 6 种想法'
categories:
- 比特币主网
tags:
- 侧链
---


> *作者：Paul Sztorc*
> 
> *来源：<https://www.truthcoin.info/blog/sc-vision/>*



比特币未来会变成什么样？

我把下面列出的 6  种想法称为 “比特币需要侧链的愿景”。

有些人会专门抨击某一种想法，但很少有人会同时支持所有 6 种想法 …… 至少目前是这样的！

来看：

## 1. 比特币必须僵化

- 每一个变更都是一个攻击界面。<sup><a href="#note1" id="jump-1">1</a></sup> <sup><a href="#note2" id="jump-2">2</a></sup> <sup><a href="#note3" id="jump-3">3</a></sup> <sup><a href="#note4" id="jump-4">4</a></sup> <sup><a href="#note5" id="jump-5">5</a></sup>
- 即使是软分叉，以前的变更已经引入了 有害/有争议 的元素：
  - 2017 年，区块体积上限提高到 4MB <sup><a href="#note6" id="jump-6">6</a></sup>
  - 隔离见证输入的反常激励 <sup><a href="#note7" id="jump-7">7</a></sup>（同样在 2017 年引入）
- 如果协议已经冻结，用户就可以靠自己的亲身体验来学习比特币。他们不需要学会编程（就像我们日常使用电器而无需称为电气工程师一样）。

## 2. 区块上限必须缩减

- 见 Luke Dashjr 为缩减区块上限提出的论证 <sup><a href="#note8" id="jump-8">8</a></sup>。
- 要是用户能在 Layer2 上交易，那么 layer1 有 0.2 MB 的区块（即每天 36000 笔交易）就已经够了。<sup><a href="#note9" id="jump-9">9</a></sup> <sup><a href="#note10" id="jump-10">10</a></sup> <sup><a href="#note11" id="jump-11">11</a></sup>

## 3. 手续费收益必须提高

- 手续费低得令人发指。 <sup><a href="#note12" id="jump-12">12</a></sup> <sup><a href="#note13" id="jump-13">13</a></sup>
- 随着区块奖励的下降，总安全预算的下滑将让网络变得易受攻击。<sup><a href="#note12" id="jump-12-2">12</a></sup> <sup><a href="#note13" id="jump-13-2">13</a></sup> <sup><a href="#note14" id="jump-14">14</a></sup>
- 为补充实质手续费收入，合并挖矿既是必要的 <sup><a href="#note12" id="jump-12-3">12</a></sup>，又是充分的 <sup><a href="#note15" id="jump-15">15</a></sup>

## 4. 比特币必须变得可互通（即 “多链愿景”）

- 在任何协议纷争中，总有一群人会失望地离开。（即，区块不能既大又小。）但是：一种想法尽管不是最优的，也不妨碍它是一个好想法。（即，经济舱依然可以盈利，尽管航空公司主要依赖于头等舱。<sup><a href="#note16" id="jump-16">16</a></sup>）
- 只要有热情的矿工、开发者和用户，一套协议就能生存。如果不是成为一条比特币侧链，就会成为一个山寨币。这些山寨币 “突破” <sup><a href="#note17" id="jump-17">17</a></sup>了比特币的 2100 万 BTC 的限制，威胁到了比特币赖以生存的网络效应 <sup><a href="#note18" id="jump-18">18</a></sup>。但有了侧链，为山寨币辩护的论述就会被颠覆：山寨币将无法讲出投资人会接受的故事。
- “多链比特币” 的想法非常古老 <sup><a href="#note19" id="jump-19">19</a></sup> <sup><a href="#note20" id="jump-20">20</a></sup>，而且当前对侧链的技术反对理由是没有根据的。<sup><a href="#note21" id="jump-21">21</a></sup>
- 光在以太坊上，就已经有了超过 275000 “WBTC”。如果比特币链上做不到，比特币就会在山寨币上成为多链比特币。
- 选择不仅是效率问题 —— 也是道德问题。<sup><a href="#note22" id="jump-22">22</a></sup> <sup><a href="#note23" id="jump-23">23</a></sup>

## 5. 闪电网络是不够的。

- 你需要 120 年才能让 80 亿人用上闪电网络。<sup><a href="#note24" id="jump-24">24</a></sup> 闪电网络不能是唯一的扩容方案。一些资深的闪电网络开发者在公开场合也这么说。<sup><a href="#note25" id="jump-25">25</a></sup>
- 通道入门问题有两个解决方案 —— CTV 和通道工厂 —— 但两个都是不可靠的。都可以被 DoS 攻击（而且是免费的），因此会消耗多得多的字节（然后进一步 *降低*  采用率，而不是提高采用率）。<sup><a href="#note24" id="jump-24-2">24</a></sup>
- 闪电网络在许多场景下是不适用的。<sup><a href="#note16" id="jump-16-2">16</a></sup> <sup><a href="#note26" id="jump-26">26</a></sup> 需要其它 Layer2，尤其是侧链。

## 6. 比特币开发需要竞争。

- Bitcoin Core 的开发流程利用了 *审慎心理*。但审慎不如竞争。尤其是在飞速发展的领域里。审核并不总能及时跟上；苏联式的管理对许多个人和团体来说都是难以接受的。我们需要制度化的反对派。<sup><a href="#note27" id="jump-27">27</a></sup>
- 从设计上来说，Core 会拒绝好但有争议（good-but-controversial）的想法。<sup><a href="#note28" id="jump-28">28</a></sup> 因此，今天的协议不是最优的。
- 许多新想法并不与 Core 合作，而是以山寨币的形式发布。<sup><a href="#note29" id="jump-29">29</a></sup>
- Core 帮助开发者 在职业生涯上升/获得更好的声誉；但终端用户被忽视了。<sup><a href="#note30" id="jump-30">30</a></sup> 这是不道德的。
- 软分叉需要很长时间才能完成。<sup><a href="#note31" id="jump-31">31</a></sup>（与此同时，过大的区块所造成的损害已经出现了，而且每天都在发生 <sup><a href="#note8" id="jump-8-2">8</a></sup>）。
- “激活” 流程建立在知情的同意之上，而这种东西是不存在的。<sup><a href="#note32" id="jump-32">32</a></sup> 大多数隔离见证的支持者都不理解隔离见证；而大部分 Drivechain 的支持者也不理解 Drivechain。这是正常而且合理的。<sup><a href="#note33" id="jump-33">33</a></sup>

那么，你认为这个愿景如何呢？

如果你讨厌它，你应该把自己的愿景写下来！不论如何，辱骂和恐吓绝不是战斗。

如果你喜欢它，欢迎加入我们的 [Bip300 sidechain Telegram](http://t.me/DcInsiders)！

## 脚注

1.<a id="note1"> </a>中本聪；2010 年 6 月，[“比特币的本质是 ……”](https://satoshi.nakamotoinstitute.org/posts/bitcointalk/126/#selection-33.0-33.128) <a href="#jump-1">↩</a>

2.<a id="note2"> </a>Peter Todd；2016 年 1 月；[“强制的软分叉”](https://petertodd.org/2016/forced-soft-forks) <a href="#jump-2">↩</a>

3.<a id="note3"> </a>Vlad Costea；2020 年 9 月；[“为什么比特币的开发如此保守”](https://blog.trezor.io/why-is-bitcoin-development-so-conservative-a22d37765c5b) <a href="#jump-3">↩</a>

4.<a id="note4"> </a>Shinobi;2021 年 9 月；[“比特币共识规则”](https://www.whatbitcoindid.com/podcast/bitcoin-tech-5-bitcoin-consensus) <a href="#jump-4">↩</a>

5.<a id="note5"> </a>请看这个推特评论的[搜索结果](https://www.google.com/search?q=ossify+bitcoin+site%253Atwitter.com) —— 3000 多个结果，大部分都是积极的。 <a href="#jump-5">↩</a>

6.<a id="note6"> </a>Luke-Jr;2019 年 1 月；[“隔离见证……会伤害比特币，因为它产生了更大的区块并提高了中心化的扩张速度，”](https://twitter.com/LukeDashjr/status/1085940241414979586) <a href="#jump-6">↩</a>

7.<a id="note7"> </a>P2WPKH-SegWit 输入要大 1 字节（[148.5, vs 147.5](https://medium.com/coinmonks/on-bitcoin-transaction-sizes-part-2-9445373d17f4#7f9a)），却被当成只有 80 字节 *甚至更小* 来收费。而且，P2SH-SegWit 甚至更糟。相比于 P2PKH，隔离见证确实为输出节省了 3 个字节（相比于让 79 字节不用收费，折现节省是微不足道的）；但 P2PKH 自身也可以节省这些字节，只需使用额外的交易版本号（交易版本号还有 43 亿个可用  …… 有很多闲置的）。 <a href="#jump-7">↩</a>

8.<a id="note8"> </a>Luke-Jr；2019 年 5 月；[“简单来说，区块大小的上限不应该太高”](https://youtu.be/JJF5Gnro1GU?t=393)。在 16:09 ，Luku 说，“也许现在说已经太晚了 …… 我们几年前就该削减区块大小上限”。要是那时候（2019 年 5 月）都已经太晚了，现在（2022 年中）就更不用说了。 <a href="#jump-8">↩</a>  <a href="#jump-8-2">↩<sup>2</sup></a>

9.<a id="note9"> </a>Turr Demeester；2015 年 5 月；[“LBMA …… 保存了价值 2620 亿美元的金条，但平均来说每天只有 106 笔交易”](https://twitter.com/TuurDemeester/status/602613356948631552) <a href="#jump-9">↩</a>

10.<a id="note10"> </a>Nick Szabo；2017 年 2 月；[“货币，区块链和社会可扩展性”](https://nakamotoinstitute.org/money-blockchains-and-social-scalability/#:~:text=the%20Bitcoin%20blockchain%20itself%20cannot%20possibly%20come%20anywhere%20near%20Visa%20transaction%2Dper%2Dsecond%20numbers%20and%20maintain%20the%20automated%20integrity%20that%20creates%20its%20distinctive%20advantages) <a href="#jump-10">↩</a>

11.<a id="note11"> </a>Michael Goldstein；2022 年 4 月；[“在 2021 年，12 个 Fedwire 节点的每秒处理交易量小于 7 笔，但总交易额接近 1 千万亿美元。”](https://twitter.com/bitstein/status/1510474416286846976) <a href="#jump-11">↩</a>

12.<a id="note12"> </a>Paul Sztorc；2021 年 10 月；[“安全预算第二篇：低手续费与合并挖矿”](https://www.truthcoin.info/blog/security-budget-ii-mm/) <a href="#jump-12">↩</a> <a href="#jump-12-2">↩<sup>2</sup></a> <a href="#jump-12-3">↩<sup>3</sup></a>

13.<a id="note13"> </a>Joe Kelly；2021 年 11 月；[“论比特币的基于手续费的安全模型”](https://joekelly100.medium.com/on-bitcoins-fee-based-security-model-part-1-beware-the-turkey-fallacy-4285e18d41ea) <a href="#jump-13">↩</a> <a href="#jump-13-2">↩<sup>2</sup></a>

14.<a id="note14"> </a>Peter Todd；2022 年 6 月；[“这是否会导致比特币最终失败呢”](https://twitter.com/peterktodd/status/1540079027913998341) 以及 [“一个致命的缺陷”](https://twitter.com/peterktodd/status/1540784802198040576) 长推特 <a href="#jump-14">↩</a>

15.<a id="note15"> </a>Paul Sztorc；2019 年 2 月；[“长期的安全预算” viii 节](https://www.truthcoin.info/blog/security-budget/#viii-visas-transaction-fee-revenues) <a href="#jump-15">↩</a>

16.<a id="note16"> </a>想了解更多，请在[这里](https://www.truthcoin.info/blog/thunder/#b-a-new-framework)看看 “头等舱 vs 经济舱”  的分析，以及 [“人群是多样的，所以交易也有别”](https://lists.linuxfoundation.org/pipermail/bitcoin-dev/2022-March/020034.html) <a href="#jump-16">↩</a> <a href="#jump-16-2">↩<sup>2</sup></a>

17.<a id="note17"> </a>Gavin Andresen；2016 年 4 月；[“Gavin 在巴比特的 AMA 全英翻译” —— “偷偷的提高了 2100 万 BTC 的上限”](https://old.reddit.com/r/btc/comments/4ftw41/full_english_transcript_of_gavins_ama_on_8btc/#:~:text=a%20sneaky%20way%20of%20increasing%20the%2021%2Dmillion%20coin%20limit) <a href="#jump-17">↩</a>

18.<a id="note18"> </a>Daniel Krawisz；2016 年 7 月；[“这无关技术，跟货币有关”](https://nakamotoinstitute.org/mempool/its-not-about-the-technology-its-about-the-money/) <a href="#jump-18">↩</a>

19.<a id="note19"> </a>中本聪；2010 年 10 月；[“回帖：BitDNS 和比特币通用化”](https://bitcointalk.org/index.php?topic=1790.msg28696#msg28696) <a href="#jump-19">↩</a>

20.<a id="note20"> </a>Reid Hoffman；2014 年 11 月；“我为什么投资 Blockstream” <a href="#jump-20">↩</a>

21.<a id="note21"> </a>Paul Sztorc；2022 年 1 月；[“同行评议（以及 Drivechain 的争议）”](https://www.drivechain.info/peer-review/peer-review-new/) <a href="#jump-21">↩</a>

22.<a id="note22"> </a>Ian Shapiro；2010 年 5 月；[“政治学的道德基础 23.5 熊彼得”](https://youtu.be/Z9ouzj3R574?t=1984) <a href="#jump-22">↩</a>

23.<a id="note23"> </a>米尔顿·弗里德曼；1978 年；[“资本主义符合人道主义吗？”](https://youtu.be/ORQtnQRqOKc?t=925) <a href="#jump-23">↩</a>

24.<a id="note24"> </a>Paul Sztorc；2022 年 4 月；[“闪电网络：根本局限性”](https://www.truthcoin.info/blog/lightning-limitations/) <a href="#jump-24">↩</a> <a href="#jump-24-2">↩<sup>2</sup></a>

25.<a id="note25"> </a>Tadge Dryja；2019 年 4 月；[“闪电网络的局限性”](https://www.youtube.com/watch?v=LnG5H62I7Ko)；（27:50）“所以，没错，提高区块体积上限 ……（或类似的插件区块，随你怎么说），这些（扩容方案）*全都* 必须同时发生 …… 而且我认为大部分 Core 开发者已经这么说过了 …… 这很奇怪 …… 变成了一种使人们分裂的东西”。（43:20）Peter：“这不是我预期的对话 …… 我希望的是一个非常突出闪电网络优点的讨论”，Tadge：“…… 我已经看到了，人们就像一个部落一样 …… 每个人都在说 ‘闪电网络会成为有史以来最好的东西’，但是，闪电网络并不能做到 …… 它是一个扩容方案的一部分，但我认为还需要其它东西”。 <a href="#jump-25">↩</a>

26.<a id="note26"> </a>亦见 [“其它的一些也都是可以争取的”](https://lists.linuxfoundation.org/pipermail/bitcoin-dev/2022-March/020043.html) <a href="#jump-26">↩</a>

27.<a id="note27"> </a>具体来说，需要有人能从在位的领导者（也就是 Wladimir）倒台中收益，并且 *不会* 伤害到普通用户。这是保证审核流程合理的唯一方法。见 [“女王陛下最忠诚的反对党”](https://en.wikipedia.org/wiki/Her_Majesty%27s_Most_Loyal_Opposition_%28United_Kingdom%29) <a href="#jump-27">↩</a>

28.<a id="note28"> </a>Core 开发者在开发的东西，跟对比特币用户最好的东西存在 [“鸿沟”](https://twitter.com/Truthcoin/status/1523349241879425025)。 <a href="#jump-28">↩</a>

29.<a id="note29"> </a>首先，这通常被归功于 BTC 卓越的品质控制。据说 BTC 只接受最好的想法，而山寨币不在乎想法是否新颖。但侧链已经承担了质量控制的功能。其次，也有人将之归结于山寨币的贪婪。据说，山寨币的开发者一心只想鼓吹自己的币。但我们比特币人的大部分新想法也是为了炒作。问题是有用的新想法现在变得很少见（闪电网络，Taproot）。第三，许多山寨币的想法 —— Minblewimble、zksnarks、环签名，等等 —— 最早都是由比特币开发者（同时也是有名的反山寨币头子）提出来的。他们只是没有办法推动这些想法走完流程，只能作为山寨币或者一条侧链来发布。 <a href="#jump-29">↩</a>

30.<a id="note30"> </a>Udi Wertheimer；2022 年 5 月/6 月；[“我们什么时候才能坦诚讨论 taproot 的彻底失败”](https://twitter.com/udiWertheimer/status/1529563243856990209)，[“反转之处在于，它什么用也没有，也没人想要它”](https://twitter.com/udiWertheimer/status/1532507243777867776)，以及[这个图表](https://transactionfee.info/charts/transactions-spending-taproot/)。 <a href="#jump-30">↩</a>

31.<a id="note31"> </a>Paul Sztorc；2019 年 1 月；[“分叉事件表”](https://twitter.com/Truthcoin/status/1088934244762640384) <a href="#jump-31">↩</a>

32.<a id="note32"> </a>各种各样的观点，即使在比特币正统派内部，也是非常极端的。看这个[关于 Taproot 暴露公钥的争议](https://twitter.com/ercwl/status/1522283651085574149)，以及 Luke-Jr 的信仰：[每个人都**必须**运行完全相同的软件](https://twitter.com/LukeDashjr/status/1523352520692625408)（最起码，这就意味着**每一个**比特币用户都**必须**（1）参与比特币的开发；（2）总是切换到 “Core” 放出的最新版本，等等）。 <a href="#jump-32">↩</a>

33.<a id="note33"> </a>F.A. 哈耶克（引用 A. Whitehead）；1945 年 9 月；[“散在社会的知识之利用”：“…… 而无需思考它们。”](https://fee.org/articles/the-use-of-knowledge-in-society/#:~:text=%22It%20is%20a,thinking%20about%20them.%22) <a href="#jump-33">↩</a>