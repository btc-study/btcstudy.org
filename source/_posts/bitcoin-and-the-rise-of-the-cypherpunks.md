---
title: '比特币与密码朋克的延续'
author: 'Jameson Lopp'
date: '2020/09/01 17:22:25'
title_image: '..\images\bitcoin-and-the-rise-of-the-cypherpunks\91545f955a264321aee18927a7683c16.jpg'
excerpt: '密码朋克相信，隐私性是基本人权'
tages:
- [比特币, 密码朋克]
---

*作者：Jameson Lopp*

*来源：<https://blog.lopp.net/bitcoin-and-the-rise-of-the-cypherpunks/>*

*译者：闵敏 & 阿剑*


![1](..\images\bitcoin-and-the-rise-of-the-cypherpunks\91545f955a264321aee18927a7683c16.jpg)

从比特币到区块链再到分布式账本，密码学货币领域日新月异，以至于我们很难看清它的发展方向。

但是，我们仍然可以发现一些踪迹。虽然密码学货币行业有很多创新技术，但都建立在前人数十年的研究基础上。通过追溯这段历史，我们可以理解比特币运动背后的动机，进而理解比特币对未来的愿景。

20 世纪 70 年代以前，密码学主要由军事机构和间谍机构秘密使用。然而，两个出版物的发布让密码学技术进入了大众视野：美国政府出版的[《数据加密标准》](http://csrc.nist.gov/publications/fips/fips46-3/fips46-3.pdf)以及 Whitfield Diffie 博士和 Martin Hellman 博士共同撰写的首部公开的公钥密码学著作[《密码学的新方向》](https://www-ee.stanford.edu/~hellman/publications/24.pdf)。

20 世纪 80 年代，David Chaum 博士撰写了大量关于密码学的论文。其中一篇论文[《无需身份证明的安全性：让 “老大哥” 成为过去式的交易系统》](http://www.chaum.com/publications/Security_Wthout_Identification.html)提及了匿名数字现金和匿名声誉系统。

接下来的几年里，这些想法相互融合，形成了一场运动。

在 1992 年底，Eric Hughes、Timothy C May 和 John Gilmore 组成了一个小团队，每月都会在 John Gilmore 位于旧金山湾区的公司 Cygnus Solutions 碰面。这个团队有个诙谐的名字“密码朋克（cypherpunks）”，是 “cipher（密码）” 和 “cyberpunk（赛博朋克）” 的简称。

密码朋克邮件列表就是在这个时候创立的。几个月后，Eric Hughes 发表了[《密码朋克宣言（A Cypherpunk’s Manifesto](http://www.activism.net/cypherpunk/manifesto.html)[）》](http://www.activism.net/cypherpunk/manifesto.html)。他写道：

>**“在电子时代，隐私是实现开放型社会的前提。隐私不能与秘密混为一谈。私事是不想让所有人都知道的事，而秘密是不想让任何人知道的事。隐私是选择性向世界展露自我的权利。”**

听起来很有道理。但是你可能会想，我又不是密码朋克，我又没做错什么事，我有什么好隐藏的？但正如 Bruce Schneier 所言，说出 “无需隐藏” 论的人弄错了前提：并不是只有犯了事的人才需要隐私，使用隐私保护措施并不意味着有鬼。

例如，你在窗户上装了窗帘，防止外人看到屋内。这不能说明你在从事什么非法或不道德的活动，只是因为你担心向外界暴露自己可能会带来的负面影响。

正在阅读这篇文章的你会发现自己是密码朋克运动的直接受益者。

下面是一些知名密码朋克和他们所做的贡献：

* Jacob Appelbaum：Tor 的开发者
* Julian Assange：维基解密（WikiLeaks）的创始人
* Adam Back 博士：Hashcash 的发明者兼 Blockstream 的创始人
* Bram Cohen：BitTorrent 的发明者
* Hal Finney：PGP 2.0 的主要作者兼可重复使用的工作量证明（Reusable Proof of Work）的创造者
* Tim Hudson：SSLeay（OpenSSL 的前身）的合著者
* Paul Kocher：SSL 3.0 的合著者
* Moxie Marlinspike：Open Whisper Systems 的创始人（Signal 的开发者）
* Steven Schear：“权证金丝雀（warrant canary）” 概念的提出者
* Bruce Schneier：知名安全研究作者
* Zooko Wilcox-O’Hearn：DigiCash 的开发者兼 Zcash 的创始人
* Philip Zimmermann：PGP 1.0 的提出者

（译者注：这些成果中有一大部分都是关于互联网隐私的，并且有些已经成了互联网的基础设施，比如 SSL。）

## 20 世纪 90 年代

20 世纪 80 年代至 90 年代这 10 年间爆发了密码学战争，美国政府试图扼杀密码学技术商用的趋势。

这期间，密码学几乎完全被当作军事技术垄断，加密技术被列入美国军需品清单（US Munitions List）的第 13 类，遭严令禁止 “出口”。

由于出口限制，“可出口” 的 SSL 加密技术只支持 40 位的密钥长度，使用一台个人电脑花几天即可破解。

由于公民自由主义者和隐私倡导者对美国政府侵犯公民隐私的控诉、加密软件在美国境外的普及和 Matt Blaze 成功黑入美国政府提出的带后门的[ Clipper 芯片](https://en.wikipedia.org/wiki/Clipper_chip)，美国政府最终放弃了对密码学技术的垄断。

![2](..\images\bitcoin-and-the-rise-of-the-cypherpunks\854b706858304be08198f971d8da2c48.gif)

1997 年，Adam Back 博士[发明了 Hashcash](http://www.hashcash.org/papers/announce.txt)。Hashcash 是一个抗垃圾邮件机制，通过有效提高发送邮件的（时间和计算）成本，让垃圾邮件发送者血本无归。

Adam Back 认为 Hashcash 会比 Chaum 的 digicash 更易用，因为用户不需要创建账户。另外，Hashcash 还采取了一些措施来防止 “双重花费” 攻击。

1998 年底，Wei Dai [提出了 “b-money” 的设想](http://www.weidai.com/bmoney.txt)，用来执行匿名参与者之间的协议。他提出了两个有趣的概念，想必你不会感到陌生。第一个概念是让每位参与者都维护一个独立的数据库，用来记录用户的资金归属情况；第二个概念是第一个的变体，由一部分参与者记录用户的账户资金余额，这些参与者需要交纳押金来防止作恶。

比特币采用了第一个概念，其它很多密码学货币项目则采用了第二个概念的变体（也就是我们如今所说的[权益证明](https://en.wikipedia.org/wiki/Proof-of-stake)）。

## 21 世纪

显然，密码朋克基于彼此的研究成果进行了长达数十年的构建工作，实验并创建了 20 世纪 90 年代所需的框架。然而，最关键的还是 21 世纪诞生的密码学货币。

2004 年，Hal Finney 基于 Back 的 Hashcash [创造了可重复使用的工作量证明（RPOW）](https://cryptome.org/rpow.htm)。RPOW 是只能使用一次的特殊密码学代币，很像是比特币的未花费交易输出。但是，验证和防止双重花费攻击仍由中心化服务器执行。

Nick Szabo 在 2005 年[提出了 “bit gold”](http://unenumerated.blogspot.com/2005/12/bit-gold.html)—— 基于 Finney 的 RPOW 创建的数字收藏品。然而，Szabo 并没有提出一种机制来限制 bit gold 的总发行量，而是设想每单位 bit gold 的价值会根据创建它们所需的计算量有所不同。

最后，在 2008 年，中本聪（至今都身份不明的个人/团体）发布了[比特币白皮书](http://bitcoin.org/bitcoin.pdf)，并在其中提到了 hashcash 和 b-money。实际上，[中本聪曾在发给 Wei Dai 的电子邮件](http://www.gwern.net/docs/2008-nakamoto#section)中提到他从 Back 博士那里了解了 b-money。

中本聪在[比特币白皮书](https://bitcoin.org/bitcoin.pdf)中专门提到了隐私：

>“传统的银行模式会通过限制访问相关方的信息和可信第三方来实现一定程度的隐私性。在必须公开所有交易信息的情况下，传统的隐私保护方法行不通，但是还有另一种方法：通过隐藏公钥持有者的身份来阻断信息流。公众可以看到有人将一笔资金发送给了另一个人，但是无法通过任何信息将这笔交易与任何人联系起来。其信息公开程度类似于证券交易所。证券交易所只通过证券买卖汇总记录带（tape）公开每笔交易的时间和规模，但是不会泄漏参与方的身份信息。”



![3](..\images\bitcoin-and-the-rise-of-the-cypherpunks\50ae4488c1744bdfa412289715ddaea6.png)

<center>- 比特币的隐私模型（来源：比特币白皮书） -</center>

中本聪创建了一个可供人们使用、扩展和分叉的系统，极大地推动了密码学技术的发展。

比特币的诞生让整场密码朋克运动如虎添翼。它使得维基解密等组织在被传统金融系统列入黑名单之后，依然可以通过比特币捐款来维持运营。

## 隐私保护斗争

然而，随着比特币生态系统近年来发展壮大，隐私问题似乎被淡化了。

很多早期比特币用户以为比特币系统可以让他们完全匿名，但是据我们的了解，很多执法机构都[透露](http://www.wired.com/2015/01/prosecutors-trace-13-4-million-bitcoins-silk-road-ulbrichts-laptop/)过它们能够在调查期间查明比特币用户的身份。

[Open Bitcoin Privacy Project](http://www.openbitcoinprivacyproject.org/) 通过对用户进行隐私性教育和推荐最佳比特币服务用例弥补了这方面的不足。该团体构建了一个关于比特币钱包隐私性攻击的威胁模型。

该模型目前将攻击者分为以下几类：

* **区块链观察者** —— 通过观察价值流的模式来将不同的交易和同一个身份联系起来。
* **网络观察者** —— 通过观察点对点网络上的活动来将不同的交易和地址联系起来。
* **物理攻击者** —— 尝试查找钱包设备上的数据来篡改该钱包或对其进行分析。
* **交易参与者** —— 创建交易来追踪区块链上的活动并识别交易者的身份。
* **钱包提供商** —— 可能会要求用户提供个人身份信息，然后观察他们的交易。

Blockstream 的 Jonas Nick 就比特币用户的隐私问题进行了大量研究。

Jonas Nick 在一次精彩的演讲中揭露了很多隐私漏洞。其中一些漏洞对 SPV 比特币客户端来说是毁灭性的：

视频地址：[https://youtu.be/HScK4pkDNds](https://youtu.be/HScK4pkDNds)

就比特币而言，最大的隐私威胁来自区块链观察者 —— 由于网络中的每笔交易都是永久公开的，无论是现在还是将来，任何人都有可能威胁到比特币用户的隐私性。

因此，最好的做法就是永远不要重复使用同一个比特币地址，这也是老生常谈的建议。

中本聪甚至在比特币白皮书中强调了这一点：

>“作为额外的隐私安全保护措施，交易者每发送一笔交易都应该使用一个新的密钥对，以防有人找到这些交易的共同所有者。多输入交易必定会显示这些输入都来自同一个所有者，因此难免会泄漏一些关联性。这里的风险在于，这种关联性有可能在密钥所有者身份曝光时泄漏该所有者的其它交易。”
## 近年来的密码朋克创新

为了提高比特币用户的隐私性，近年来人们创建了很多系统和最佳范例。Pieter Wuille 博士在 [BIP32](https://github.com/bitcoin/bips/blob/master/bip-0032.mediawiki) 中提出的分层确定性钱包（hierarchical deterministic wallet）可以大幅降低比特币钱包管理地址的难度。

虽然隐私保护并非 Pieter Wuille 的主要目的，但是分层确定性钱包可以轻而易举地生成新的地址用于交易，帮助用户避免地址重用。

椭圆曲线迪菲-赫尔曼-默克尔（ECDHM）地址是隐私增强型比特币地址方案。ECDHM 地址可以公开分享。交易发送方和接收方可以利用 ECDHM 地址秘密生成区块链观察者无法预测的传统比特币地址。因此，ECDHM 地址是可以重用的，不像传统比特币地址那样会因重用而泄漏隐私。

ECDHM 地址方案的例子包括 Peter Todd 提出的 [Stealth Addresses](https://github.com/genjix/bips/blob/master/bip-stealth.mediawiki)（秘密地址）、Justus Ranvier 提议的 [BIP47](https://github.com/bitcoin/bips/blob/master/bip-0047.mediawiki) 可重用支付码和 Justin Newton 等人提议的 [BIP75](https://github.com/techguy613/bips/blob/master/bip-0075.mediawiki) 带外地址交换等。

用户还可以使用比特币混币器来增强隐私性，但是这种方法需要消耗较多人力资源。将网络参与者的代币混合这一概念类似 Chaum 博士提出的 “混合网络（mix network）”。

![4](..\images\bitcoin-and-the-rise-of-the-cypherpunks\0cf7e0ccde4e4b8faacf961f97aff895.png)

现有的几种混币算法包括：

* [CoinJoin](https://bitcointalk.org/index.php?topic=279249.0) —— 第一个混币算法是 Blockstream 的联合创始人 Gregory Maxwell 提出的 CoinJoin。它可以让用户使用来自多方的输入创建交易，然后将比特币发送至多个输出（即，同一批人），由于每笔资金都被混合在了一起，输入和输出之间的关联很难被找到。

![5](..\images\bitcoin-and-the-rise-of-the-cypherpunks\ce3e30c8ec1146c0919642e1bf17fcbc.png)

<center>- 简单的 CoinJoin 交易示意图 -</center>

* [JoinMarket](https://github.com/JoinMarket-Org/joinmarket/wiki) —— 开发者 Chris Belcher 提出的 JoinMarket 可以让比特币持有者通过提供比特币来参与 CoinJoin 混合来赚取手续费。JoinMarket 使用了某种智能合约来避免用户的私钥离开本地，从而降低私钥丢失的风险。简而言之，JoinMarket 可以让你以低成本且去中心化的方式来提高比特币交易的隐私性。
* [CoinShuffle](http://crypsys.mmci.uni-saarland.de/projects/CoinShuffle/coinshuffle.pdf) —— 一群德国萨尔大学的研究者开发了去中心化混币协议 CoinShuffle。CoinShuffle 是 CoinJoin 的改良版，不需要可信第三方来创建混币交易，因此不会收取额外的混币费。
* [CoinSwap](https://bitcointalk.org/index.php?topic=321228) —— Maxwell 提出的 CoinSwap 与 CoinJoin 差别很大，因为它使用一组 4 笔多签交易（两笔托管交易和两笔托管释放交易）来实现双方的免信任代币交易。它虽然在效率上远低于 CoinJoin，但是可以提供更强的隐私性，甚至实现跨链代币交易。

混币无异于 “藏木于林”，只是这片林子通常不会很大。混币只能产生混淆，无法实现完全匿名性，因为这类方案只能让低段位的观察者难以追踪资金流向，但是高段位的观察者依然有可能破解混币交易。

2014 年，Kristov Atlas（Open Bitcoin Privacy Project 的创始人）在[一篇文章](https://www.coindesk.com/blockchains-sharedcoin-users-can-identified-says-security-expert/)中阐述了 CoinJoin 客户端实现不当会产生的弱点。

![6](..\images\bitcoin-and-the-rise-of-the-cypherpunks\579b1f2857e94b23862df52e0bc65ca3.jpg)

<center>- CoinJoin 的输入和输出分组 -</center>

Atlas 指出即使使用比较粗糙的分析工具，他也能找出一笔 CoinJoin 交易内 69% 的输入和 53% 的输出。

甚至还有一些聚焦隐私性的密码学货币。

例如，Evan Duffield ­和 Daniel Diaz 设计的 Dash 有一个叫作 “[Darksend](https://www.dash.org/darksend/)” 的功能。Darksend 是 CoinJoin 的改良版，主要在使用金额和混币频率上进行了改进。

Dash 的混币方案使用 0.1 DASH、1 DASH、10 DASH 和 100 DASH 等常见金额，大幅提高了输入输出分组的难度。在每个混币会话中，用户提交相同的金额作为输入和输出。

为使混币的隐私性最大化，让时序攻击难以成功，Darksend 会自动以特定的时间间隔运行。

![7](..\images\bitcoin-and-the-rise-of-the-cypherpunks\da51adbc9efc4d6aa03248673fdb5a59.png)

<center>- DASH 混币（来源：DASH 白皮书） -</center>

还有一类隐私币甚至没有在比特币的基础上构建。2014 年，Nicolas van Saberhagen 发布了 [CryptoNote](https://cryptonote.org/inside/) 的白皮书。一些密码学货币就是根据 [CryptoNote](https://cryptonote.org/inside/) 概念实现的，例如门罗。主要的创新是密码学环形签名和一次性密钥。

常见的数字签名（比如比特币签名）都是由一对密钥（公钥和私钥）创建的。因此，只要有人能使用私钥签署一笔交易，即可证明该私钥对应的公开地址为 ta 所有。

![8](..\images\bitcoin-and-the-rise-of-the-cypherpunks\cce0d8cd91bd48e29fc1d9abf32bb207.png)

[环签名由（ring signature）Adi Shamir 博士等人在 2001 年首次提出](http://download.springer.com/static/pdf/432/chp%253A10.1007%252F3-540-45682-1_32.pdf?originUrl=http%3A%2F%2Flink.springer.com%2Fchapter%2F10.1007%2F3-540-45682-1_32&token2=exp=1458913055~acl=%2Fstatic%2Fpdf%2F432%2Fchp%25253A10.1007%25252F3-540-45682-1_32.pdf%3ForiginUrl%3Dhttp%253A%252F%252Flink.springer.com%252Fchapter%252F10.1007%252F3-540-45682-1_32*~hmac=9ced274de2c18a3f6ef7ca4a1147092b366f1b5f0167b6e45835a24f2c9ec5da)，基于 Chaum 博士和 Eugene van Heyst[ 在 1991 年提出](http://download.springer.com/static/pdf/412/chp%253A10.1007%252F3-540-46416-6_22.pdf?originUrl=http%3A%2F%2Flink.springer.com%2Fchapter%2F10.1007%2F3-540-46416-6_22&token2=exp=1458913679~acl=%2Fstatic%2Fpdf%2F412%2Fchp%25253A10.1007%25252F3-540-46416-6_22.pdf%3ForiginUrl%3Dhttp%253A%252F%252Flink.springer.com%252Fchapter%252F10.1007%252F3-540-46416-6_22*~hmac=9007c9e97a349ddd8789d9a97e26f496a6ff6b761af18c704ba28ff1e2c744ac)的群签名（group signature）构建。环签名需要一群参与方，各参与方持有自己的密钥对。

环签名能够证明某个信息的签名者是群成员。它与普通数字签名方案的主要区别在于，签名者只需要持有一个私钥，但验证者无法确定签名者的确切身份。

因此，如果你看到包含 Alice、Bob 和 Carol 的公钥的环签名，你只能断定签名者就是三人之一，但是无法知道被签署的交易究竟属于谁。环签名提供了另一种层次上的混淆，让区块链观察者难以追踪系统中每笔付款的归属（发起方）。

有趣的是，环签名是针对告密场景提出的，可以在不泄漏告密者身份的同时证明其消息来源的可信度（可知告密者是某个知名团体的成员）。

![9](..\images\bitcoin-and-the-rise-of-the-cypherpunks\904f30c669864b3d869288b4899f83be.png)

<center>- 环签名（来源：https://cryptonote.org/inside/） -</center>

CryptoNote 旨在降低密钥重用和利用输入追踪输出所产生的风险。付款地址是利用付款方和收款方的数据生成的一次性密钥。只要你在输入中使用环签名，它到底花了哪笔交易的输出会变得更加难于确定。

如果区块链观察者试图根据区块链上的交易找出已使用过的地址之间的关联并绘制关系图，将得到一个树状图，因为没有地址被二次使用过。随着交易越多，树状图的可能性会呈指数级增长，因为每个环签名都会为地址之间的价值流动增加不确定性。

因此，你无法确定具体的付款地址。

根据环签名所涉及的参与者人数，每笔交易的混淆性从 “1/2” 到 “1/100” 不等。每新增一笔交易都会增加熵值，并提高区块链观察者的追踪难度。

![10](..\images\bitcoin-and-the-rise-of-the-cypherpunks\9dc762a2ed4f478ca3a0ae24cc3f0812.gif)

<center>- 抗区块链分析（来源：https://cryptonote.org/inside/） -</center>

## 酝酿中的密码朋克创新

虽然密码学货币用户的隐私安全依然存在很多隐患，但是在密码朋克的不断努力下，前途将是一片光明。

零知识证明或将推动隐私保护实现下一个重大飞跃。零知识证明[于 1985 年首次提出](https://people.csail.mit.edu/silvio/Selected%20Scientific%20Papers/Proof%20Systems/The_Knowledge_Complexity_Of_Interactive_Proof_Systems.pdf)，旨在拓宽密码学协议的潜在应用。

基于 Back 博士在 2013 年撰写的[《具有同态值的比特币》](https://bitcointalk.org/index.php?topic=305791.0)，Maxwell 一直在潜心研究[保密交易](https://youtu.be/9pyVvq-vrrM?t=2107)（[Confidential Transaction](https://youtu.be/9pyVvq-vrrM?t=2107)）。保密交易使用零知识范围证明（zero-knowledge range proof）来创建比特币交易，使得交易所包含的值仅相关方可见。

保密交易本身就是一大进步。但是，如果我们将它与 CoinJoin 结合起来，就可以构建一种混币服务，切断交易输入和输出之间的一切关联。

Maxwell 曾在旧金山举办的比特币开发者会议上做了一场主题为 “侧链要素” 的分享。我记得他说了一句话： “[IETF（互联网工程任务组）](https://www.ietf.org/)里那帮老头最大的遗憾之一就是构建互联网时没有默认采用加密数据传输方式。”

对于比特币的隐私性，Maxwell 显然也是这么想的：要是一开始能使用保密交易就好了。如今，Blockstream 已经[在 Liquid 侧链上实现了保密交易](https://www.coindesk.com/blockstream-commercial-sidechain-bitcoin-exchanges/)，来掩盖交易所之间的转账。

Maxwell 已经在比特币网络上实现了[零知识证明有条件支付（](https://bitcoincore.org/en/2016/02/26/zero-knowledge-contingent-payments-announcement/)[Zero-Knowledge Contingent Payment，ZKCP）](https://bitcoincore.org/en/2016/02/26/zero-knowledge-contingent-payments-announcement/)，并成功完成了第一笔付款。ZKCP 是一种免信任交易协议，可以让买方使用比特币向卖方购买信息。只有当付款完成后，买方才会且一定会收到信息。买卖双方不需要信任对方，或依赖第三方仲裁。

几年前，[我写过一篇关于 Zerocoin 的文章](https://medium.com/@lopp/zerocoin-zero-knowledge-for-infinite-anonymity-b38322a46767)，并指出该系统需要解决一些技术挑战才能变得真正可用。自那以后，研究人员已经让证明变得更加高效，并通过初始系统参数生成[解决了信任问题](https://z.cash/blog/snark-parameters.html)。Zerocoin 的愿景即将由 Wilcox-O’Hearn 创建的 [Zcash](https://z.cash/) 实现。

Zcash 提供完全的付款保密性，同时使用公链来维护去中心化网络。Zcash 交易会自动隐藏所有链上交易的付款方、收款方和转账金额。只有查阅密钥的持有者才能查看对应交易的内容。由于 Zcash 交易的内容经过了加密，而且是私密的，系统需要使用新的密码学方法来验证付款。

Zcash 采用了一种叫作 zk-SNARK 的零知识证明结构。zk-SNARK 由一群经验丰富的密码学家开发。

交易元数据都是加密的，不会公开转账授权和金额。zk-SNARK 被用来证明交易的有效性。Zcash 很可能是首个实现防弹匿名性的数字支付系统。

## **密码朋克薪火相传**

密码朋克上下求索的这十年来，计算机技术也有了长足发展。无论是个人还是团体，都能以完全匿名的方式进行通信和交互。

两个人可以在不知道对方真实姓名和身份的情况下交换信息、开展业务并缔结电子合约。当然了，政府会以该技术有可能威胁国家安全、助长犯罪和导致社会分裂为由，来阻碍或遏制它的传播。

![11](..\images\bitcoin-and-the-rise-of-the-cypherpunks\742d93f651b744bf8c7b83645f412b7c.png)

密码朋克深知，要想获得隐私，我们必须捍卫它。几个世纪以来，为了捍卫隐私，人们使出了百般手段：窃窃私语、暗处密会、密封信函、紧闭门扉、秘密握手和专人传信。

20 世纪之前既没有强大的隐私技术，也没有可以实现低成本大规模监督的技术。

尽管存在隐私增强技术，但是这个世界依然偏重监视而轻视隐私。我们已经进入了[很多人口中的](https://www.techdirt.com/articles/20141107/08193529077/demonizing-strong-encryption-welcome-to-crypto-wars-20.shtml)密码学战争 2.0 时期。

虽然密码朋克赢得了第一场密码学战争，但是我们千万不能得意忘形。Zooko 有过密码朋克项目的失败经历，他[告诫](https://epicenterbitcoin.com/podcast/122/)我们要做好迎接失败的心理准备。

![12](..\images\bitcoin-and-the-rise-of-the-cypherpunks\555233a1111d4154a735d99e1c0ebe8f.png)

密码朋克相信，隐私性是基本人权，包括政府保障的隐私性。他们明白，无论系统的安全性因何种原因（包括 “可信当局” 的介入）被削弱，都会威胁到系统用户的安全。

密码朋克要写代码。他们知道必须要有人编写软件来捍卫隐私性，因此挺身而出。他们还会公开代码，以便其他密码朋克进行学习、攻击和改进。

密码朋克允许任何人使用他们的代码，也不在乎别人是否认同他们编写的软件。他们知道自己的软件无法被破环，广泛分布的系统也无法被关闭。

—–BEGIN PGP SIGNED MESSAGE—–

Hash: SHA256

Public Key: [https://keybase.io/lopp/key.asc](https://keybase.io/lopp/key.asc)

The original Cypherpunks mailing list no longer exists, but there are more Cypherpunks now than ever before. We discuss our ideas on a wide variety of email lists, chat rooms, and social media platforms. There is much work to be done; while great progress has been made designing and deploying privacy enhancing systems, they are still far from perfect and it is still far too difficult for the average person to benefit from them. There are many battles left to be fought in the Crypto Wars; take up your keyboards and let us proceed together apace.

—–BEGIN PGP SIGNATURE—–

wsFcBAEBCAAQBQJW9VrFCRAnjdn7DA6bSQAAI68QAKxMRyGXfr8g0xhNJadJFaH6

iXJlv+PA74h3oSKV97lOAejY8yGyhyb8UodF5H3YBqSrLUCEF2Xj8U4pCl5imvSe

uuRfxbSeyUcgMonxF8W4dswcU0Ls1znLbpVkoLiRNAkkFVG+LyGY0eC7dDQ17okf

mTzjaW6/3Ed289+yz7Lj5fE6pST4L7IsOEdlyPSm/1Rn6jLVaQ/WoNGB/xPUjNZw

zagpg5qHGgcTCHCPZR9i1obsJtKLHLCRhCCxHQ6ldAiLXJn0WeOCHYIRhaC4fr0P

C+yBB2BwzXccVh4PUvgc4OEXTFvZUCkvUd88Z3j5ZN8r0ZJB83ZPITk7TMueneYW

Ery21LXG2Wv+CACwPzE+LM9GkaOLkEDgiENDq20CsM6VQl3GkiCj3KdFl9btYvzw

tpiHbmvE4HMepiVc4TjhEmIiCTMAjkcn0MRQl/tJsPw5dyQBs22++O/cslzc3w+T

Ky+7DA4jIbMk993FpDsZwyqpvkPXWylLofbqq6DmLYCu1ahpdV8X18kApeY0W2E8

rsPDr4eukXnLdDemoqFDtsIYDPb/LdQe5RaXuH7/xpWzWuOccOe305pUZnic7CO3

5cVnSg7KgUjfZhfHPijyTzHKO8QShSl7bSMW/botaO9C/wha0/+qmnWVMdUwBVyj

BLDeMjqvB87UbJE5E7rl

=hR9e

—–END PGP SIGNATURE—–

（被签名的消息意为：最初的密码朋克邮件列表已不复存在，但是密码朋克队伍已然壮大到了前所未有的规模。我们在各种邮件列表、聊天室和社交平台上讨论了我们的想法。目前我们还有很多事情要做；虽然隐私增强系统的设计和部署方面取得了巨大进展，但还远远没到完美的地步，普通人也很难从中受益。密码学战争还有很多战斗要打响；拿起你们的键盘，我们一起冲锋向前。）

（完）
