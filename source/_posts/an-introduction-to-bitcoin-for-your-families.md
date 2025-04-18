---
title: '给你的家人看的比特币简介'
author: 'Anony'
date: '2022/05/18 23:09:43'
cover: ''
excerpt: '希望这篇文章能帮助你的家人懂得如何保护你的比特币财产，也更理解你'
tags:
- 比特币
- 货币
---


> *作者：Anony*



> To Bitcoiners:
>
> 身为 Bitcoiner，你可能难以向家人启齿你的安好和工作，又或者你为他们储蓄了比特币，但一直没有机会好好向他们介绍比特币。本文正是为了这样的目的而撰写的，我自己也有同样的需要，希望这篇文章能帮助你的家人懂得如何保护你的比特币财产，也更理解你。

无论你是因为什么关系而读到这篇文章，我想，可能对当下的你，最有用的莫过于了解比特币 —— 作为一种钱 —— 要怎么花、怎么保管。我准备就从这些东西开始。

我会先解释一些基本的概念，有了这些概念，你就知道了怎么花比特币。好在这些概念在现实生活中都有一些相似的东西：

- **地址**。功能上相当于你的银行账号。也就是说，只要向别人提供你的比特币地址，你就可以接收比特币了。同样地，当你要把比特币转账给别人时，也只需要知道对方的地址就行。

  它在形式上跟银行账号差不多，是一串混乱无意义的字符，只不过其中不仅有数字，还会有英文字母。

  那么，问题来了，银行账号是由银行发给你的，地址也是这么来的吗？怎么设密码呢？

- **私钥**。功能上相当于你的银行账号密码。重点是，**地址是由私钥根据一系列的算法计算出来的**，并且这些算法可以保证无法反向计算出来（无法用地址计算出私钥）（这个计算过程有点像打桌球，当一个球在桌上撞了许多许多次，最终停在一个位置的时候，只凭这个位置你又如何知道它的起点在哪里呢？）。

  所以，**千万不能把私钥暴露给别人，也不应该用互联网渠道（比如短信、微信、QQ 等）传播私钥**。因为私钥暴露就意味着你的银行账号和密码都让别人知道了。

  私钥跟地址一样，是一串混乱无意义的字符，也有英文字母和数字。它还有另一种形式，叫做 “助记词”，是 12 个或者 24 个有顺序的英文词。助记词跟私钥要么是完全等同的（只是视觉形式不同，所表达的数据含义相同），要么它是私钥的来源（即它可以衍生出许多可用的私钥），不论是哪一种，请不要认为这样的英文词组是没有意义的、丢弃记录了这些词的物件或交给别人。

  那么，私钥又是怎么来的呢？答案是，它是天外飞来的 : ) 私钥其实是一串随机数，任意一串可以写成 256 位二进制数的随机数都可以充当私钥、生成地址并接收资金。所以你可以自己生成出几乎无数个私钥（比如你可以抛硬币，正面记为 0，反面记为 1，抛了 256 次就可以得到一个私钥了），而不必向任何人申请或报备。

  2 ^ 256 是一个很大的数，这保证了几乎不会有人能生成一模一样的数，也就是你不会恰好得到一个别人正在用的私钥；同理，你也不用担心别人能生成跟你一模一样的私钥然后拿走你的钱。当然，这也意味着如果你弄丢了私钥，也不太可能找回来。

  这里有一个在线生成比特币私钥和地址的网站，来试试吧：https://www.bitaddress.org/bitaddress.org-v3.3.0-SHA256-dec17c07685e1870960903d8f58090475b25af946fe95a734f88408cef4aa194.html （网页会要求你移动鼠标，其实就跟叫你抛硬币差不多，是在积累随机性。）

  **千万不要在你没有备份一个私钥的时候，往该私钥所生成的地址里打钱**！

  与比特币保管相关的一切学问，实际上都是在探讨如何减少弄丢私钥的可能以及减少暴露的机会。原则上，只要你准备使用一个私钥，就必须备份（比如抄写下来放在安全的地方）；如果你要在设备间传输，请使用 U 盘或者二维码扫描这样的方式，并在传输期间断开互联网。

- **交易和手续费**。比特币的交易就是一个人给另一个人的转账。需要注意的有几点：（1）发送交易时，你需要使用联网的设备和一些特殊的软件；（2）交易需要给比特币网络的处理者 —— “矿工” —— 一些手续费，就像有时候你的银行转账需要支付手续费一样，只不过，这个手续费是实时波动的，有时候高，有时候低；就看多少人跟你同时发起交易；（3）交易无法即时到账，一般需要 10 分钟甚至更久。

  有一类网站叫做 “区块浏览器”，比如这个：https://blockstream.info/ 。它可以让你直观地看到最近有哪些交易正在发生、近期的手续费水平。但这些都需要你有更多关于区块链的知识，此处就不细说了。

- **钱包（软件）**。**从实操上来说，花费比特币需要且仅需要使用比特币钱包（和互联网）**。因为发送交易涉及一些几乎只能使用计算机来完成的操作，所以你必定要借助软件的力量。但是，我依然啰嗦了这么多，这是因为钱包软件虽然能帮你完成几乎所有必要的操作，但如果没有上面的基本概念，你就无法理解钱包软件的行为。

  所以，虽然上面的内容看起来那么复杂，但绝大部分操作都可以由钱包来帮你完成。钱包可以：（1）生成私钥，创建可以收账的地址；（2）发起交易；（3）报告到账（不管你是发送还是接收资金）；（4） 如果你已经有私钥了，那么你可以将其导入钱包软件中，从而获知这个私钥所创建的地址及资金情况；你没看错，你可以在多个设备上导入同一个私钥，只要钱包软件是安全的，就不会导致你的资金损失，这是因为，钱包软件本质上只是帮你完成一些计算机操作，你的比特币并不 “存放” 在软件中。钱包有点像邮局或者快递站，他们帮你贴邮票或者快递单，但并不能拿走你家里的东西。

  在使用钱包软件时，它往往会要求你设置一个 “口令”，在你发起交易或者尝试备份私钥的时候要求你输入。这是一种额外的安全措施，有点像你使用其它互联网支付软件的支付密码。但是，只要你备份了私钥，这个口令你忘了也无所谓，你的资金不会因此被冻结。

  除了钱包软件，还有一种专门的硬件，只具备钱包的功能，称为 “硬件钱包”。通常安全性更高，因为它们不像电脑和手机那样允许运行任意的软件，传入数据的接口也比较有限，因此感染恶意程序的可能性自然就小一些。请优先选择使用二维码或者蓝牙来收发数据的硬件钱包。

  话说回来，在钱包软件的选择上，还是要选择品牌创建时间久，口碑好的。因为钱包软件的安全性是非常重要的。钱包监守自盗（你毕竟导入了私钥）或者因为漏洞而导致用户私钥暴露，都是有可能的；靠谱的钱包自己也会使用一些安全措施来防止这两种情形，比如私钥会加密存储，要用你的口令来解密。这里推荐几款软硬件钱包：Blue Wallet（手机软件钱包）、Keystone（硬件钱包）。

总结一下，我们现在知道了花费比特币所需的所有概念，当然最根本来说，你需要一个安全的比特币钱包。如果你想了解更多关于比特币保管的知识，你可以到网上搜索相关的信息；想了解靠谱的钱包品牌，也可以在网上关注不同品牌的口碑。

你可能还想知道另一个问题：我在这里讲的只是怎么花费比特币，但是，你生活的地方可能绝大多数商家都不接受比特币，有没有办法把它换成在你生活的区域能花的钱呢，比如美元、英镑？这样的办法是存在的，因为我们生活在一个商业社会中，只要有人愿意接受这样的互换，就会形成市场。你自然而然就能借助一些工具，跟他人换得日常能用的钱。此外，还有商家接受你用比特币购买礼品卡。但很遗憾，我在这里不会为你介绍这样的方法。希望在你读到这篇文章的时候，它已经不再是个问题。

但是，还没完。这种在现实生活中 “用不上” 的东西，怎么会有人把它当钱呢？它既不像我们手上的纸钞，也不像银行里的存款，怎么会有人觉得它是一种宝贵的东西呢？你的家人，为什么会相信比特币是有价值的，储蓄起来呢？

这是我接下来希望解释的第二个问题。首先要说明的是，它代表的是我个人的理解，未必是你的家人的理解，也不一定代表绝大多数人的理解。 但是，如果你的家人一直关注甚至投入了这个行业，我猜，TA 倾心比特币的理由与我这里说的相去不远。

如上所述， 比特币的 “账户”，实际上是一串乱序的字符，这串乱序的字符同时也决定了你可以公开示人的账户地址。为什么要这样做呢？

**因为比特币的目标是：你不必假手他人，就能持有电子化的财产。**

电子化的财产并不是比特币的首创。你存放在银行里的钱，或存在一些互联网支付工具（比如：微信支付、支付宝）里的钱，都是电子化的 —— 它们可以接受你用互联网设备发出的指令、用电子化的方式转移。但是，这些系统都是不透明的，你必须信任他人（银行和产品背后的公司），才能使用这些工具 —— 如果银行和支付工具不为你发放一个账户，你就无法使用这些工具；银行可以随时冻结你的存款，也可以拿出各种理由拒绝为你服务。同样地，你也不知道自己账户里面的钱 —— 不论是你自己存入的还是别人转账给你的 —— 究竟有无足额的纸钞作为储备。你实际上并没有能力保证自己随时能取出钱。

你必须信任银行 —— 信任他们会诚信经营并且守财有道，不会把储户的本金都亏掉；信任他们会保留充足的现钞储备；信任他们不会作出出格的事情。因为（但是）你**无法验证**（无法获得保证）。

但是，比特币不需要。不需要任何人来帮你生成账户，你可以自己生成，可以生成无数个；转移比特币所需的操作，不过是一些计算机操作，没有什么秘密可言，也不需要谁的许可。所有的钱包软件不过是帮你实现这些操作而已，他们无法控制你的钱（当然对你也没有什么承诺和债务）。你实在不愿意用它们，也可以自己用电脑写一个。同样地，你钱包中的每一笔钱，什么来历都是清清楚楚的，完全透明的，没有人能拿空气当比特币支付给你。

这有什么意义呢？它的意义是让你的电子资产摆脱运营商风险。从此人们获得了一种无需把财产托管给别人，就能获得电子化价值转移便利性的办法。

从这个意义上说，比特币很像我们手里的纸钞，你拿着，别人想阻止你使用它的难度就非常大。

但是，我们不是已经有纸钞了吗？如果我都保留纸钞，只把必要的数量存入银行来获得便利，不就行了吗？为什么要搞出一样新的东西来呢？

**因为在现代社会，持有纸钞并不能提供你设想的那种财产安全性 —— 财产不被腐蚀的安全性**。

别误会，我不是说你留的纸钞可能被蟑螂吃掉。而是，即使你好好地保管纸钞，也无法获得价值上的稳定性、无法应对通货膨胀的威胁 —— 这是一种更隐秘、更难以觉察的威胁。

毋庸赘言，纸钞（货币）只是财富的一种 —— 我们为何要储蓄货币呢？无非是因为两者：一，借助市场，我们可以迅速地把它换成有实用价值的东西，包括粮食和被子、医疗和教育；二，它们在时间流逝中可以保持其价值。而且仔细想想，后者其实更加重要，因为如果它无法长期保持价值，其第一点的效用也会打折扣。

事实上，在我们当前日常使用的货币中，没有历时久远而不贬值的；想在其中找出较为保值的，只不过是矮子里面拔高子。无论是响当当的发达国家所发行的货币，还是新兴经济体的货币。生活在这些经济体中，都有明显的感觉。你还记得自己小时候吃一碗面需要多少钱吗？现在呢？

那么，货币到底是如何贬值的呢？是因为货币数量的增加。货币与别的商品并没有什么不同，数量多了、泛滥了，你愿意用来交换同样数量（或者说面额）的货币的商品就少了，反过来说也就是同样面额的货币能买到的东西变少了。货币购买力的下降会持续地蚕食你的储蓄的价值。

问题是，在我们生活的这个时代，人们使用的货币都是有单一的发行者的，就是各国的货币发行机构，**这些机构以及相关的利益集团可以人为地通过货币的增发或缩减来造成货币价值的变动并从中渔利**。在货币增发的过程中，货币的价值会持续降低，但这种降低不是一次性发生的，也不会在一瞬间让所有人知情，因此，有人可以拿增发出来的货币，享受它增发之前的购买力 —— 跟 TA 交易的对象还不清楚货币会增发、会贬值，或不清楚增发、贬值的幅度，于是接受了。这就是所谓的 “铸币税”。离货币增发的源头越近的人，可以享受到的利益就越大。也就是说，在法币社会，通货膨胀是一种结构性的现象而不是偶然现象，许多人完全有动机去促成它发生。尽管人们发明了许多伪饰的说法，提振市场信心、稳定就业和物价云云，这些说法无法从统计数据上证否，但统计数据不会告诉你的是：它绝对不是公平的，不会每个人都能在通胀中享受到同样多的好处。

（而且，要命的是，你还无法拒绝。按照法律，法币享受 “无限法偿权”，你不能拒绝他人拿法币来偿还你的债务以及给你支付，否则你就是违反法律。我想象不出有什么比这更侵犯人的尊严的了。）

这正是比特币立志要解决的问题。但它的做法，不是找出一个更高明、道德更高尚、实力更雄厚的货币发行机构，而是让货币的增发情形透明化并用免准入的网络来保证它不可被更改。比特币的创造者和维护者都知道，货币政策的不透明，正是有人可以拿它渔利的关键，所以他们一开始就把比特币的增发方式和增发速度公开了；然后，再通过一个可以自由加入的网络 —— 其中的参与者每分每秒都在验证没有人违反这个规则 —— 来保证规则的实施。自由加入的意思是，你也可以加入，只需要一台联网的电脑，运行一个软件就行；软件的内容是开源的，你可以自己搞清楚这些代码是什么意思，甚至于你可以自己写一个。（在比特币诞生之时，比特币网络的参与者只有几个人；而在撰文之时，已经有了[15072](https://bitnodes.io/) 个。）

比特币网络运行的关键就是所谓的 “工作量证明（PoW）” 机制。它的意思是，如果你要增发比特币，那么你必须不断运行一个输出没有规律且无法根据输出反推输入的函数，并找出一个输入能让这个函数产生一个足够小的数 —— 由函数的特性可知，为了找出这样的输入，你必须投入能量来运行计算机；而且，网络的参与者 —— 作为验证的一方 —— 很容易验证你提出的值是否有效，而且，还能根据概率反推你大概算了多少次。PoW 保证了增发货币必须付出明显可见的代价，而约束货币增发的一方只需付出非常小的代价。此外，货币增发的速度也在这个过程中受到约束。

比特币是人类有史以来最激进的货币实验，它拒绝相信人们为通货膨胀找的各种托辞，将个人财产的安全性置于最神圣的地位，实际上，也是把个人的自治权置于最神圣的地位，为了实现这个目标，不能让他人能随时冻结你的财产，也不能让一小群人能任意动摇你的财产的价值。

诚然，这是一个大胆的目标，谁也不能说它已经实现了，或者断言这是一个完美的方案，但它，确确实实已经是我们所见的最彻底的方案，最不妥协的方案。正是这种特性，吸引我们成为 bitcoiner。我们相信，比特币不是什么有意制造的骗局，也不包含什么惊天阴谋和祸心，更不仅仅只是让某些人拥有财富，相反，它是对一个社会问题提出的严肃的解决方案。许多人都思考过这个问题，也有不少人提出过解决的思路，比特币是总结前人的智慧结出的硕果，也成为了新的旗帜，召唤我们继续为一个更加公平、更少欺骗、个体更有尊严的社会持续奋斗。

我想，这也是你的家人会成为 bitcoiner 的原因吧。

（完）