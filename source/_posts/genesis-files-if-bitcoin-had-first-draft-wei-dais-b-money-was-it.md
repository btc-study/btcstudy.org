---
title: '创世文档：Wei Dai 的 B-Money，也许是比特币的初稿'
author: 'Aaron Van Wirdum'
date: '2021/10/02 22:08:43'
cover: '../images/genesis-files-if-bitcoin-had-first-draft-wei-dais-b-money-was-it/e757dfb98063404ca53c747ac75b1126.png'
excerpt: '“高效的协作需要交换媒介（货币）以及强制执行合约的办法”，Dai 在 1998 年 11 月介绍 b-money 的文字中如是说。'
tags:
- 比特币前传
- 密码朋克
---


> *作者：Aaron Van Wirdum*
> 
> *来源：<https://bitcoinmagazine.com/technical/genesis-files-if-bitcoin-had-first-draft-wei-dais-b-money-was-it>*

![1](../images/genesis-files-if-bitcoin-had-first-draft-wei-dais-b-money-was-it/e757dfb98063404ca53c747ac75b1126.png)

所有的密码朋克都重视隐私权，可以说，这是这个 1990 年代靠电子邮件列表而形成的密码学家、学者、开发者和活动人士团体共同的精神图腾。但即使在这个团体中，也很少有人像 Wei Dai 那样在生活中也贯彻到底。纽约时报（New York Times）曾[形容](https://www.nytimes.com/2015/05/17/business/decoding-the-enigma-of-satoshi-nakamoto-and-the-birth-of-bitcoin.html)他是一位 “深居简出的计算机工程师”，关于此人的个人信息，我们所知甚少。但这个人在二十年前，构想出了一种与比特币非常相似的电子货币系统。

个人信息缺失，但我们可靠 Wei Dai 的工作和他所传播的思想来了解他。他首先是一位天才的密码学家，创造了 [Crypto++](https://en.wikipedia.org/wiki/Crypto2B2B)（一个密码学算法的 C++ 语言代码库）并至今仍在维护它；他（时至今日）还活跃在 [LessWrong](https://www.lesswrong.com/users/wei_dai) 这样的科普论坛上，常常对人工智能、伦理学、认识论等话题发表看法。他的洞见使他[获得了](https://www.lesswrong.com/posts/YduZEfz8usGbJXN4x/transcription-of-eliezer-s-january-2010-video-q-and-a)著名 AI 研究者 Eliezer Yudkowsky 的赞誉，并多次受邀到后者的[机器智能研究所](https://intelligence.org/)（MIRI，曾用名 “奇点研究所”）发表演讲。

Dai 对哲学和政治学的兴趣由来已久。早在 1990 年代，他还是华盛顿大学（Washington University）计算机科学系的本科学生时，他就读过 Timothy May 的作品。后者是密码朋克运动的元老之一。Dai 也受到 May 所作的 “[密码学无政府主义](https://activism.net/cypherpunk/crypto-anarchy.html)” 的[启发](https://www.lesswrong.com/posts/YdfpDyRpNyypivgdu/aalwa-ask-any-lesswronger-anything#xeDaB4HMwxsadLZfr)：这种围绕密码朋克的全新意识形态，基于这样一种信念：密码学和软件可以比所有的治理系统做得更好，提供更多对政治自由和经济自由的保障。

“我痴迷于 Tim May 的主张”，Dai 在 1998 年[写道](http://www.weidai.com/bmoney.txt)，“不同于传统上抱持 ‘无统治’ 观念的社区，在密码学-无政府主义中，治理系统不是暂时被打破了，而是被永远禁止了，其必要性也彻底消失了。在这样的世界里，暴力威胁不再有用，因为暴力根本不可能发生；暴力之所以无法发生，因为其成员的真名和真实位置永远不会暴露。”

到了 1990 年代中期，Dai 参与了密码朋克邮件组中的多个主题讨论，比如 “[电子声誉系统](https://cypherpunks.venona.com/date/1995/11/msg01043.html)”、博弈论以及[电子货币系统中的匿名性](https://cypherpunks.venona.com/date/1998/02/msg00753.html)。也许更重要的是，Dai 也提出了多个想法，来推进密码朋克的事业，包括“ [可信任的时间戳服务](https://cypherpunks.venona.com/date/1994/08/msg00800.html)”，一种[加密的 TCP 协议通道](https://cypherpunks.venona.com/date/1995/10/msg01690.html)、一种[安全的文件共享系统](https://cypherpunks.venona.com/date/1996/02/msg00427.html)，等等。他因此被称赞为密码朋克社区作出了重大贡献 —— 饶是如此，在当时也没人知道他到底是个什么样的人（Timothy May [最近说](https://www.youtube.com/watch?v=MrGLraSiRZk&feature=youtu.be&t=25m36s)，那时大家甚至不知道 TA 是男是女）。

但给 Dai 带来最大名声的还是他在 1998 年 11 月[偶然提出的一个想法](https://cypherpunks.venona.com/date/1998/11/msg00941.html)（那时候他才刚大学毕业不久！）。“高效的协作需要一种交换媒介（即货币）以及强制执行合约的办法”，Dai 解释道。“本文提出的协议为无法跟踪的准匿名实体提供了一种交换媒介和一种强制执行合约的办法，因此能让他们的协作更加高效 …… 我希望它能增强密码学无政府主义在现实和理论中的可行性”。

他把这份提议命名为 “[b-money](http://www.weidai.com/bmoney.txt)”。

## B-Money

一般的数字货币系统都是用一个集中式的账本来跟踪各账户的余额。从中央银行、商业银行到 VISA 和其它支付服务提供商，都有一套集中管控的数据库，来跟踪各账户的余额变化。

在 Dai 和其他密码学无政府主义者看来，这个方案的问题在于，它最终让政府可以用管制来控制货币的流动，而用户则通常要暴露自己的个人信息。Dai 后来[这么说](https://spectrum.ieee.org/computing/software/bitcoin-the-cryptoanarchists-answer-to-cash)：“我发明 b-money 的动机就是推动纯粹自愿的互联网经济 …… 不会出现暴力威胁下的征税和管制”。

所以，Dai 想出了一个替代方案。实际上，是两种方案。

在第一个方案里，不是由某个权威实体来控制账本，而是每个参与者都维护着同一账本的一个单独的备份。每当有一笔交易发生时，每个人都各自更新自己的账本记录。此外，这份账本的账户名都是公钥 —— 不是真实姓名。这种去中心化的方法可以防止某个实体审查交易，同时为所有用户带来隐私性。

举个例子。假设 Alice 和 Bob 都是 b-money 的用户。他们各自的公钥分别是 “A” 和 “B”，这也意味着他们各自都掌握有对应的、独一无二的私钥。而且，根据所有用户维护的账本记录，这两把公钥都有一些 b-money 余额。假设这两把私钥都拥有 3 个单位。

如果 Bob 想要从 Alice 手上收取 2 单位的 b-money（因为他正跟她做生意，要卖给她一些东西），他就把自己的公钥公开给 Alice。假设 Alice 决定要买了，她就按如下格式，发送一笔交易：“从 A 账户发往 B 账户，2 b-mony”。然后，她用 A 所对应的私钥给这条消息签名。这条消息以及对应的密码学前面就会发送给所有的 b-money 用户。

这条签名消息向所有的 b-money 用户证明了，A 账户的真实所有人要发送 2 b-mony 给 B 账户。因此，每个人都更新自己的账本记录，将 A 的余额改为 1，B 的余额改为 5 —— 无需知道账户控制者的真实身份。

如果这个方案听起来很耳熟，那你没理解错：10 年后，中本聪设计比特币的时候，大体上也就是这样的。

## B-Money，版本 2

但是，Dai 认为自己的第一版 b-money 方案是不实际的，“因为它过于依赖同步且抗干扰的匿名通信通道”。

换句话来说，第一版的 b-money 没法解决 “多重支付” 问题。Alice 可以同时发送 2 b-money 给 Bob 的 B 账户和 Carol 的 C 账户。Bob 和 Carol 都会给 Alice 发货 —— 到后来才会发现，网络中有一半人不承认 B 账户（C 账户）的新余额。

这也是为什么 Dai 提出了第二版的 b-money，就在同一份提议中。

在这个版本中，不是每个人都维护着账本。相反，系统将由两类用户组成：普通用户和 “服务器”。只有服务器才会通过一个 [Usenet](https://en.wikipedia.org/wiki/Usenet) 类型的广播网络相互连接，b-moeny 的账本也由他们来维护。要验证交易处理的情形，普通用户 —— 比如 Bob 和 Carol —— 需要随机抽取一小部分的服务器来验证。（若是发生了冲突，Bob 和 Carol 可以合理地拒绝来自 Alice 的请求，拒绝发货）。

提案中没有详细说明的一部分是，虽然每个人都可以成为 “服务器”，但是 “每个服务器都要先存入一定数量的货币，到特定的账户中，用作被证实的不当行为的奖励和惩罚”。

“每个参与者都要验证自己的账户余额是正确的，而且账户余额的总和不大于创造出来的货币单位总和”，Dai 这么设想，“这样做能防止服务器轻而易举地永久增加货币供应量，即使他们集体串通也不行”。

如果这听起来也有点耳熟，那你的感觉也没错：Dai 的第二种 b-money 构想，大体相似于今天所谓的 “权益证明（Proof of stake）” 系统。

此外，Dai 还在自己的提案中增加了一个初步的智能合约解决方案。这些智能合约在类型上非常相似于一个权益证明系统和仲裁系统的混合，通过合约来交易的双方和仲裁员都要把钱存到一个特殊的账户中。从现在的眼光来看，令人奇怪的是，这些合约并没有安排一个纠纷解决系统：相反，在争议的情形中，不同的用户（或服务器）可能会各自改变自己账本上的记录，实际上，这就是让网络账本的状态脱离共识。（按照假设，潜在的惩罚会使这么做无利可图。）

## 货币政策

但是，b-money 跟比特币差别最大的地方可能就是 Dai 提议的货币政策了。

比特币的货币政策是非常直接的。要让货币进入流通（发行货币），每个区块都会发行一些新币；一开始每个区块发行 50 个新币，但这个数量每过一段时间就会降低，当前已降到了 12.5 个（译者注：原文撰写于 2018 年；在 2020 年，这个数字已经降低到了 6.25 个）。一百多年以后，比特币将基本发行完成，总量会稍低于 2100 万（bitcoin）。这套政策是否理想可以争论，但有一点是很清楚的：迄今为止，它还不能产生稳定的币值。

相反，币值稳定显然是 Dai 愿景的一部分。为了实现这一点，b-money 的价值将锚定（理论上的）一篮子商品的价值。举个例子，100 b-money 会刚好能购买一定数量的某几种商品。这就给了 b-money 一个稳定的价值，至少相对于这一篮子商品而言：同样的 100 b-money 总是能买到同样数量的这几种商品，过去、现在、未来，都如此。

要发行新币，用户需要确定一篮子商品和一个计算问题解答（也就是 “工作量证明”）的相对成本。举个例子：假如在某个时间，一篮子商品价值 80 美元，那必须提供平均耗费 80 美元来生产的工作量证明（才能发行新币）。假如 10 年以后，同样的一篮子商品价值 120 美元，那同样的 100 单位 b-money 就必须提供耗费 120 美元才能生产的工作量证明才能发行。

使用这一指标，第一个产生了有效工作量证明的人将被所有用户和服务器加记 100 单位的余额。因此，没有人会有激励去生产工作量证明，除非他们确实要用到 b-money，这就限制了 “b-money 经济体” 的通货膨胀。

此外，在这份提议的一个附录中，Dai 提议，货币的创造可以通过拍卖来实现。要么所有用户（第一版协议）、要么所有服务器（第二版协议）先确定货币的理想增发量。然后，假设这个理想增发量是 500 b-money，一场拍卖将决定谁能获得这 500 单位：愿意提供最多工作量证明的人，将获得这批新增发的货币。

## 比特币

B-money 从来没被实现过。也没法实现。多年以后，Dai 在 [LessWrong 论坛的一个帖子](https://www.lesswrong.com/posts/YdfpDyRpNyypivgdu/aalwa-ask-any-lesswronger-anything#TLvSTxuypiHBuoCLM)里承认：“b-money 尚不是一个完整的、可付诸实践的设计”。而且，Dai 从未指望 b-money 能大获成功，即使它真的能实现。

“我估计，b-money 最多只能成为一个小众的 货币/合约执行机制，服务于不想或者不能使用政府所提供服务的人”，宣布提案之后，他在密码朋克邮件组的一份[邮件](http://cypherpunks.venona.com/date/1998/12/msg00261.html)如是说。

确实，b-money 有许多问题没有解决，或至少算没有明确。也许，更重要的是，其共识模型不是非常健壮，Dai 所提议的智能合约解决方案就是最好的证明。后来，权益证明协议也被证明引入了一些 Dai 所没有预见到的挑战；举个例子，我们不太清楚如何能客观上证实发生了一件 “恶意行为”。这还没涉及到提案中那些更微妙的问题，比如因为资金的可追溯性导致隐私缺失，以及潜在的货币发行中心化。实际上，某些问题直到今天，比特币也还是没有解决。

在提出 b-money 之后，Dai 去了 TerraSciences 和微软工作，而且可能很早就退休了，他没有留下来解决这些问题。

“我没有继续完善它的设计，因为在我写完 b-money 方案的时候，我已经，对密码学无政府主义有点失望了”，Dai 后来在 LessWrong 论坛这么[解释](https://www.lesswrong.com/posts/YdfpDyRpNyypivgdu/aalwa-ask-any-lesswronger-anything#TLvSTxuypiHBuoCLM)。他说，“我没法想象，这样的一个系统，即使真的能实现，能吸引到足够多的关注、能被一小群硬核的密码朋克以外的人使用。”

虽然 Dai 的提议没有被遗忘：b-money 位列比特币白皮书参考文献的第一篇。但是，就像 b-money 和比特币貌合神离一样，也有可能中本聪完全没有受到 Dai 的观念的启发。Dai 自己相信，比特币的发明者是独立地想出这些办法的。

在比特币白皮书公布之前，Hashcash 的发明者 Adam Bcak 博士给中本聪[介绍](https://www.gwern.net/docs/bitcoin/2008-nakamoto)了 Dai 的成果，这使得 Dai 成为少数几个在比特币白皮书出版之前，中本聪有所接触的人。但 Dai 没有回复中本聪的邮件。回想起来，他很希望自己回复了。毫不意外，Dai 想质疑的正是比特币的货币增发模型。

“我认为，比特币在货币政策上已经失败了（因为这种政策会导致大幅的价格波动，使其用户不堪重负，用户想使用这种货币，要么得承担可怕的风险，要么必须采用昂贵的对冲工具）”，他在 LessWrong 论坛[写道](https://www.lesswrong.com/posts/P9jggxRZTMJcjnaPw/bitcoins-are-not-digital-greenbacks#MwJE7tFnJZdu56Qbz)，“比特币所带来的一种影响是，因为其货币政策的缺陷和价格的波动，它没法被大规模使用；而因为它已占据了密码学货币的小众领域，不再有一种密码学货币能成长到获得大范围接受了。”

他补了一句，“这可能得部分归咎于我。因为中本聪曾写信给我，征求我对他的论文初稿的意见，而我一直没有回复他。不然，也许我能让他（或者 他们）放弃 ‘固定货币供给量’ 的想法。”

*作者注：本文完成之后，有人指出，Nick Szabo 的第一版 [Bit Gold](https://bitcoinmagazine.com/articles/genesis-files-bit-gold-szabo-was-inches-away-inventing-bitcoin) 可以追溯到 1998 年早期，甚至比 b-money 更像中本聪的发明。所以，也许把 Bit Gold 当成 “比特币的初稿”，会更为准确。*

（完）
