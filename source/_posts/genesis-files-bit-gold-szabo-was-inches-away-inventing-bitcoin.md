---
title: '创世文档：尼克·萨博的 Bit Gold 与比特币只半步之遥'
author: 'Aaron Van Wirdum'
date: '2021/10/02 22:08:45'
cover: '../images/genesis-files-bit-gold-szabo-was-inches-away-inventing-bitcoin/a9203f01c2b144e5927ee20b1c0b1279.png'
excerpt: '如果有一个协议可以在几乎不依赖于可信第三方的情况下在网络上创建出伪造成本极高的比特，而且可以以信任最小化的方式安全地存储、转移并鉴定这些比特，那就太好了'
tags:
- 比特币前传
- 密码朋克
---


> *作者：Aaron Van Wirdum*
> 
> *来源：<https://bitcoinmagazine.com/culture/genesis-files-bit-gold-szabo-was-inches-away-inventing-bitcoin>*


![](../images/genesis-files-bit-gold-szabo-was-inches-away-inventing-bitcoin/a9203f01c2b144e5927ee20b1c0b1279.png)

尼克·萨博（Nick Szabo）的父母原本是匈牙利人，为躲避一战后建立的匈牙利苏式政权，逃往美国定居。因此，萨博将 20 世纪 90 年代的加利福尼亚湾地区称作自己的家。在 90 年代，一群密码学家、程序员和隐私倡导者以一个电子邮件列表相互联系。在这个团体的创始成员蒂莫西·梅（Timothy May）、埃里克·休斯（Eric Hughes）等人举办的 “密码朋克” 私人聚会上，萨博是最早的常客之一。

和其他密码朋克一样，萨博也很担心即将到来的数字时代会危及人们的隐私安全，并采取一切行动来抵挡这一趋势。例如，在密码朋克邮件列表上，萨博带头反对 “[Clipper 芯片](https://en.wikipedia.org/wiki/Clipper_chip)”。当时，美国政府试图将这款芯片植入手机，以便 NSA（美国国安局）监听电话。萨博颇具感染力，即使是不懂技术的人，听过他对于隐私侵权风险的解释后，也会产生共鸣。有时，他会就隐私侵权发表演讲，甚至派发宣传单。（最终，这款芯片因遭到厂商和消费者的联合抵制而停产。）

然而，萨博属于自由主义密码朋克，他对数字隐私的兴趣背后有着更宏大的愿景 —— 不止于隐私。受到蒂莫西·梅在[《密码学无政府主义者宣言》](https://activism.net/cypherpunk/crypto-anarchy.html)中提出的愿景的启发，萨博看到了在赛博世界中创造 “高尔特峡谷（Galt’s Gulch）” 的可能性：为世人打造一方可以自由交易的乐土，就像自由主义作家安·兰德（Ayn Rand）在小说《阿特拉斯耸耸肩》（Atlas Shrugged）中描绘的那样。梅和萨博相信，这个虚构故事中的伪物理力场可以使用公钥密码学来代替。

萨博在密码朋克邮件列表中[写道](https://cypherpunks.venona.com/date/1995/09/msg01303.html)：“如果我们重新思考许多密码朋克正在追求的目标，就会发现他们最大的理想是创建一个甘地式的赛博空间。在这个空间里，一切暴力都只能是虚幻的，就像《真人快打》和《火焰战争》里那样。”

萨博还意识到，自由企业不只需要加密作为安全层。受到另一位自由主义者及经济学家弗里德里希·哈耶克（Friedrich Hayek）的影响，萨博认为人类社会的基础在很大程度上是以财产权和合约作为砖石打造的，而这些砖石通常都依赖于国家强制力。萨博深知，若想创建一个没有国家、没有暴力的赛博社会，必须将这些砖石转移到网络领域。

这就是萨博为什么在 20 世纪 90 年代中期提出了他最知名的构想：*智能合约*。这些（当时还只是设想）计算机协议可以通过数字化方式促成、验证并执行合约的协商和履行，而且在理想情况下无需任何第三方参与。[正如萨博的那句名言](http://www.fon.hum.uva.nl/rob/Courses/InformationInSpeech/CDROM/Literature/LOTwinterschool2006/szabo.best.vwh.net/ttps.html)：“受信任的第三方即是安全漏洞。” 这些安全漏洞会成为黑客或犯罪分子乃至（处于政局动荡时期的）国家的目标。 

但是，智能合约只是完整拼图的一角。要想实现 “高尔特峡谷”，萨博还需要一个更加重要的工具 —— 货币。

## 电子现金

一直以来，数字货币（互联网原生货币）都是密码朋克们的[核心目标](https://cypherpunks.venona.com/date/1993/08/msg00426.html)。但是，很少有人像萨博探索得那么深。

在《货币的起源》中，萨博[讲述](https://nakamotoinstitute.org/shelling-out/)了使用货币是如何刻进人类的 DNA 的 —— 就像进化论生物学家理查德·道金斯（Richard Dawkins）最先提出的[设想](https://books.google.nl/books?id=ekonDAAAQBAJ&pg=PA244&lpg=PA244&dq=Richard+Dawkins+money+as+a+formal+token+of+reciprocal+altruism&source=bl&ots=kBbSS-l5AC&sig=fr85YmvwkvFqWcOYLBkL10O7sI4&hl=en&sa=X&redir_esc=y#v=onepage&q=Richard20Dawkins20money20as20a20formal20token20of20reciprocal20altruism&f=false)那样。在分析了原始社会之后，萨博发现不同文化背景的人都倾向于收集便于携带的稀有资源，而且通常会将它们制作成珠宝。这些稀有资源成为了货币，让人们得以建立合作关系：用交易实现博弈理论所谓的 “互惠利他主义（reciprocal altruism）”，跨越时间和空间。

萨博还对[自由银行制度](https://en.wikipedia.org/wiki/Free_banking)（哈耶克的货币理论）产生了强烈兴趣。在自由银行制度下，私人银行可发行自己的货币，而且不受任何国家的控制。在这样一个货币系统下，使用哪种货币将完全取决于自由市场。虽然这在今天属于新思想（在比特币诞生之前更是如此），但是自由银行制度在 19 世纪的美国以及其它一些国家真实存在过。

萨博继续将自己的兴趣付诸实践。早在 20 世纪 90 年代中期，大多数人尚未察觉到电商的潜力时，萨博就当起了互联网商务顾问。最值得一提的是，他还为大卫·乔姆（David Chaum）在阿姆斯特丹的创业公司 DigiCash 工作过一段时间。正是这家公司率先推出了全球首个数字现金 [eCash](https://bitcoinmagazine.com/articles/genesis-files-how-david-chaums-ecash-spawned-cypherpunk-dream)，让线上支付变得像现金支付一样私密。

然而，在 DigiCash 工作期间，萨博认识到了 eCash 的风险。DigiCash 是一家中心化公司，萨博发现无论是他自己，还是公司内部的其他人，要想对用户的余额动手脚都太过容易。毕竟，受信任的第三方就是安全漏洞，尤其当涉及到钱时，风险是最大的。

[萨博在 2005 年指出](http://unenumerated.blogspot.com/2005/12/bit-gold.html)：“简而言之，其问题在于我们目前所使用的货币的价值依赖于对第三方的信任。20 世纪多次出现的通货膨胀和恶性通货膨胀已表明，这不是理想的状态。”

事实上，他认为信任问题是很大的阻碍，即使是典型的自由银行解决方案也很难避免：“私人银行发行的纸币虽然有各种优缺点，但是同样依赖于受信任的第三方。”

萨博知道他想要创建的是一种无需信任第三方的新型货币。

基于他对史前货币的分析，萨博花了很长时间来思考他理想中的货币应该是什么样子。第一，“足够安全，不会发生意外损失和盗窃”；第二，“伪造成本很高，因此被认为是有价值的”；第三，“其价值可以通过简单的观察或测量得到准确估算”。

萨博想要创建出一种能够媲美黄金等贵金属的货币，兼具数字性和稀缺性，而且其稀缺性不依赖于对第三方的信任。他想要创建数字黄金。

> 极高的伪造成本赋予了贵金属和收藏品稀缺性。因此，货币的价值一度在很大程度上不依赖于任何可信第三方。但是，贵金属也存在一些问题 …… 因此，如果有一个协议可以在几乎不依赖于可信第三方的情况下在网络上创建出伪造成本极高的比特，而且可以以信任最小化的方式安全地存储、转移并鉴定这些比特，那就太好了！这就是比特黄金。

## Bit Gold（比特黄金）

萨博于 1998 年首次提出比特黄金的构想，但是他在 [2005 年](http://web.archive.org/web/20060329122942/http://unenumerated.blogspot.com/2005/12/bit-gold.html)才公开完整地阐述它。他所提出数字货币方案由多个解决方案构成，其中一些模仿了之前的电子现金概念或受之启发。

比特黄金的第一个中心属性是 *工作量证明*，即，Adam Back 博士在其 “抗击垃圾邮件的货币” [Hashcash](https://bitcoinmagazine.com/articles/genesis-files-hashcash-or-how-adam-back-designed-bitcoins-motor-block) 中使用的密码学机制。工作量证明就是萨博所寻求的高成本抗伪造性，因为这类证明需要现实世界的资源（算力）来生成。

Bit Gold 的工作量证明机制首先需要一个 “候选字符串”：基本上就是一个随机的数字。任何人都可以用数学方法把这个字符串与另一个字符串合起来（就是 “哈希计算”）。根据哈希计算的本质，结果会得到一串全新的看似随机的数字：哈希值。要想知道这个哈希值长什么样，唯一的方式就是将它创造出来 —— 无法倒推或预测。

这个机制（Hashcash 同样采用该机制）的巧妙之处在于并非所有哈希都会被 Bit Gold 协议视为有效。例如，有效哈希的开头必须带有预定数量的零。由于哈希具有不可预测性，找到有效哈希的唯一方法就是试错。因此，一个有效的哈希值证明了，其创造者确实花费了算力。

这个有效的哈希值将成为 Bit Gold 的下一个候选字符串。因此，Bit Gold 系统是一条不断增长的工作量证明哈希链，而且总有候选字符串可供使用。

谁找到了有效的哈希值，这个哈希值就归谁所有，就好比是谁挖到了一块金矿石，这个金矿石就归谁所有。为了通过数字化方式来实现这种所有制，Bit Gold 采用了[**数字所有权注册表**](https://nakamotoinstitute.org/secure-property-titles/#selection-125.47-125.66)：萨博受到哈耶克的启发而提出的另一个砖石。在这个注册表中，每个哈希会与其创造者的公钥相关联。

哈希值正是通过这个数字所有权注册表被转移给另一个所有者：原始所有者会使用密码学签名来签署交易。

所有权注册表由 Bit Gold 的 “财产俱乐部” 维护。这个 “财产俱乐部” 的 “成员（即，服务器）” 会追踪每个公钥所拥有的哈希。这个解决方案有点像是 Wei Dai 为 b-money 提出的复制型数据库解决方案。萨博和 Wei Dai 不仅同属密码朋克邮件列表，还活跃在讨论这类话题的私密邮件列表中。

但是，不同于 Wei Dai 的权益证明系统，萨博提议使用 “拜占庭式门限系统”。这个系统类似于飞机控制板计算机采用的高安全系统：如果只有一台（或少数）计算机掉线，整个系统将继续正常运行；只有当绝大多数计算机同时掉线时，整个系统才会出现故障。重要的是，这些检查不需要由行使国家权力的法院、法官或警察来执行，它们全都依赖于志愿者。

虽然这个系统本身并非 100% 安全（例如，它可能会遭到[女巫攻击](https://en.wikipedia.org/wiki/Sybil_attack)，又称马甲攻击），但是萨博相信它拥有自我修正的能力。即使是在绝大多数俱乐部成员试图做恶的情况下，诚实的少数派也可以分叉出另一个所有权注册表。用户可以选择使用哪个所有权注册表，萨博认为诚实的那个被选中的概率更高。

萨博解释道：“如果失信方在投票中胜出，失败的守信方可以退出该群体，并重新建立新的群体，继承过去的头衔。想要保有正确头衔的用户（依赖方）可以安全地自行验证哪个群体是诚实遵守规则的，并跟随该群体。”

（举个眼前的例子，这就好比是以太坊经典（Ethereum Classic），它[维护](https://bitcoinmagazine.com/articles/rejecting-today-s-hard-fork-the-ethereum-classic-project-continues-on-the-original-chain-here-s-why-1469038808)的是没有因 The DAO 事件而回滚的原始以太坊账本。）

## 通胀

接下来，萨博必须解决通胀问题。随着计算机的计算能力日渐提升，生成有效哈希会变得愈发容易。这就意味着，哈希值本身无法很好地充当货币：年复一年，它们的稀缺性会变得越来越低，以至于其价值被逐渐增多的供应量稀释。

萨博想出了一个解决方案。找到有效哈希值的人必须为其加上时间戳，最好使用不同的时间戳服务器，以便实现信任最小化。时间戳反映了生成该哈希值的难度：早期的哈希值可能比近期的哈希值更难生成。之后，市场会决定某个哈希值相对其它哈希值的价值，很有可能是根据其被找到的日期调整的。一个在 2018 年找到的有效哈希值应该远不如一个在 2008 年找到的有效哈希值有价值。

然而，这个解决方案引入了一个新的问题。萨博也[清楚](http://unenumerated.blogspot.com/2008/04/bit-gold-markets.html)这点：“一个时段（几秒到几周，比方说一周）内生成的比特（难题的解）和接下来一个时段内生成的比特本质上是不同的。” 同质化（即，每个货币单位之间是等价的）对于货币来说至关重要。店主当然不希望在收款时还要担心顾客用来付款的货币是何时创造的。

关于这个问题，萨博同样想出了解决方案。他[想出](http://unenumerated.blogspot.com/2008/04/bit-gold-markets.html)了一种将 Bit Gold 作为基础层的 “二层” 解决方案。这个 “二层” 由银行组成，不过这些银行都是安全可审计的，因为 Bit Gold 注册表是公开的。这些银行会收集不同时段的不同哈希，将它们打包，并基于这些哈希的值计算出一个标准值。一个在 2018 年创建的包所包含的哈希值数量比一个在 2008 年创建的包更多，但是这两个包的价值相等。

然后，这些包被切割成特定数量的单位。最后，“银行” 将这些单位发行成基于 Chaum 盲签名技术的具有匿名性和隐私性的 eCash。

萨博[解释称](https://unenumerated.blogspot.com/2011/05/bitcoin-what-took-ye-so-long.html)：“存在竞争关系的银行通过比特的形式发行可兑换的数字纸币，而每张数字纸币的面值均由这些比特的市场价值相加得到（即，比特被打包起来组成标准值）。” 

综上，Bit Gold 被设计成了具备黄金特质的基础层，用来建立数字时代下的自由银行制度。

## 比特币

21 世纪，萨博攻读了法学学位，试图深入了解现实世界的法律和合约，以便找到替代之法或在网络中更好地复刻出来。与此同时，他开始在其知名博客 [Unenumerated](https://unenumerated.blogspot.com/) 上收集并发布自己的想法。这个博客涵盖了计算机科学、法律、政治、历史和生物学等一系列主题。[据萨博所言](https://unenumerated.blogspot.com/2005/10/unenumerated.html)，之所以将其命名为 [Unenumerated](https://unenumerated.blogspot.com/)，是因为 “这个博客所涉及的主题广泛、门类众多，不胜枚举。”

2008 年（自他首次在私人场合提出 Bit Gold 这个构想已经过去了 10 年），萨博又一次在自己的博客上公开提出 Bit Gold，只不过这一次他想要实现这一构想。

萨博在博客的评论区[问道](http://unenumerated.blogspot.com/2008/04/bit-gold-markets.html?showComment=1207799580000#c3741843833998921269)：“如果能有一场演示和一个实验市场（例如，用复杂的安全性来代替现实世界中的系统所需的受信任第三方），这会给 Bit Gold 带来很大帮助。有人想要帮我写代码吗？”

这一询问并没有得到公开响应。萨博所构想的 Bit Gold 未能实现。

尽管如此，Bit Gold 确实给予了中本聪很大的启发。就在 2008 年年末，中本聪发表了比特币白皮书。

2010 年，这位匿名创造者在 Bitcointalk 论坛上[写道](https://bitcointalk.org/index.php?topic=342.msg4508#msg4508)：“比特币是 Wei Dai 于 1998 年在密码学朋克邮件列表中提出的 b-money 构想以及尼克·萨博提出的 Bit Gold 构想的实现。”

不难看出，Bit Gold 是比特币的早期雏形。除了基于公钥密码学的所有权记录共享数据库之外，工作量证明哈希链也与比特币的区块链设计有着惊人的相似之处。当然了，从二者的名称来看，“Bit Gold” 和 “Bitcoin” 也相差不远。 

然而，不同于 Hashcash 和 b-money 等系统，Bit Gold 显然没有出现在比特币白皮书中。有人甚至凭借这一点和其它一些蛛丝马迹推断萨博就是隐藏在中本聪这个面具背后的真人：不然还有谁会像这样试图掩盖比特币的来源？

虽然与 Bit Gold 有一些相似之处，但是比特币确实在萨博的设计上做出了一些改进。尤其值得一提的是，Bit Gold 在某种程度上仍需依赖于可信方（用户需要相信服务器和时间戳服务不会串谋），比特币是首个彻底解决信任问题的系统。而且，比特币的解决方案非常优雅，它让工作量证明系统同时起到激励系统和共识机制的作用：工作量证明最多的那条哈希链就被认为是有效的历史版本。

萨博[在 2011 年承认](https://unenumerated.blogspot.com/2011/05/bitcoin-what-took-ye-so-long.html)：“中本聪改进了我的设计中的一个重大安全缺陷，ta 将工作量证明引入拜占庭容错点对点系统，从而减少某个不可信方控制绝大多数节点并破坏重要安全功能的威胁。”

另外，比特币在货币模型的设计上也与萨博构想的截然不同。比特币有固定的发行时间表，不受算力增加的影响。随着比特币网络的算力增加，这仅仅意味着挖出新的比特币会变得更加困难。

萨博解释道：“鉴于解决难题的难度通常会随着硬件的改进和密码学领域的突破（例如，找到可以更快解开工作量证明难题的算法）而大幅下降，以及需求的不可预测性，我的构想是利用自动化市场来解决这些问题。中本聪则另辟蹊径，设计了一个可以调整难题难度的拜占庭算法。”

萨博补充说：“就这一设计而言，我无法断言它是强化了比特币的特性还是埋下了更多隐患，但它确实更为简单。”

这是《比特币杂志》的 “创世文档系列” 的第四篇。前三篇分别介绍了大卫·乔姆（David Chaum）博士的 [eCash](https://bitcoinmagazine.com/articles/genesis-files-how-david-chaums-ecash-spawned-cypherpunk-dream)、亚当·巴克（Adam Back）博士的[ Hashcash](https://bitcoinmagazine.com/articles/genesis-files-hashcash-or-how-adam-back-designed-bitcoins-motor-block) 和 Wei Dai 的 [b-money](https://bitcoinmagazine.com/articles/genesis-files-if-bitcoin-had-first-draft-wei-dais-b-money-was-it)。

注：高尔特峡谷（Galt’s Gulch），安·兰德（Ayn Rand）于 1957 年所著小说《阿特拉斯耸耸肩》（Atlas Shrugged）中描绘的神秘地带，隐藏在无人山谷之间，约翰·高尔特（John Gulch）带领一批创造者和企业家隐居在此，希望借罢工让外界社会那些使用暴力和道德罪恶感来拘束个体生产力的人体会到后果。


（完）
