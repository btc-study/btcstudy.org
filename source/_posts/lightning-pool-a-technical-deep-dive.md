---
title: 'Lightning Pool：技术详解'
author: 'Olaoluwa Osuntokun'
date: '2022/09/28 16:54:48'
cover: ''
excerpt: '我们将入账流动性问题定义成市场设计领域内的一个经济学问题，并提出了解决问题的新方法'
categories:
- 闪电网络
tags:
- 通道租赁
---


> *作者：Olaoluwa Osuntokun*
>
> *来源：<https://lightning.engineering/posts/2020-11-02-pool-deep-dive/>*
>
> *原文出版于 2020 年 11 月。*



今天我们很激动地宣布，[Lightning Pool 的 alpha 版本发布](https://lightning.engineering/posts/2020-11-02-lightning-pool/)。作为一种新的非托管型市场，它可以将希望购买入账流动性的用户，和希望通过闪电网络中的比特币赚取回报的用户撮合在一起，让闪电网络实现更高效率的资金分布。在本文中，我们将[深入讲解这种市场的架构和设计](https://lightning.engineering/lightning-pool-whitepaper.pdf)。

参与市场的人群自然可以分为两边：

|          | 吃单者                                                       | 挂单者                                                       |
| -------- | ------------------------------------------------------------ | ------------------------------------------------------------ |
| 描述     | 需要通过闪电网络来接收资金的节点                             | 需要帮助闪电网络实现更高效的资金分布状态的节点               |
| 问题     | 无法在网络中发信号表示需要入账流动性                         | 不知道自己在闪电网络中的资金分配是否已达最优状态             |
| 解决方案 | 在 Lightning Pool 中提交一个竞价（bid），从某个挂单者处购买新的入账流动性 | 在 Lightning Pool 中提交一个要价（ask），以租借现有的出账流动性给某个吃单者 |
| 案例     | 商家、交易所、钱包服务，等等                                 | 资金重组的路由节点、交易所，等等                             |
| 替代用名 | 购买者                                                       | 销售者，出租人                                               |

Pool 是一种非托管的交易市场，参与者可以在其中通过拍卖来购买和销售闪电通道租约（Lightning Channel  Leases，LCL）。一个 LCL 包装着入账（或者出账）通道流动性（指发送或接收资金的能力），也是一种混合资产，既带有一份传统的固定收入资产（就像债券），又包含一对一的对等协议（就像互联网上的网络服务商（ISP）协调分配带宽所用的协议一样）。

类似于传统的债券，一份 LCL 拥有以区块号表示的到期时间。LCL 的到期时间是由比特币合约来强制执行的，保证了一份合约的买方在确定的一段时间内可以利用租来的资金，并在合约持续期间为 LCL 的卖方支付利息。Lightning Labs 在这个市场中充当拍卖行，而拍卖自身是一种非托管的、密封式的（sealed-bid）、采用统一出清价格（uniform clearing-price）的多重拍卖（double-call auctions）（别担心，这些名词在后文都有详细解释），大约每 10 分钟运行一次。在每一批成功的拍卖中，参与者都能算出当前的闪电网络中的资金的逐区块租金率（区块化的收益率，BPY）。同一批次中所有出清的订单但使用单笔批处理交易来执行，让参与者能支付更低的链上手续费（对比不是按批次处理的通道开启交易）。

 从今天开始，用户可以使用 Pool 的开源客户端（ ` poold ` ）的 alpha 版本来参与拍卖，既可以使用 [pool 命令行工具](https://github.com/lightninglabs/pool/releases/tag/v0.3.2-alpha)，也可使用 [RPC API](https://lightning.engineering/poolapi/index.html#pool-grpc-api-reference)，购买和销售通道租赁合约任君选择。在 alpha 版本中， ` poold ` 可以为指定的  ` lnd `  节点购买通道，也可以使用来自 ` lnd ` 节点的资金出售通道。作为一种非托管系统，在用户使用 ` poold ` 参与拍卖时，从他们开立账户始，出清和执行合约的整个过程中，资金始终控制在他们手中。结合客户端验证和比特币的合约功能，客户端可以验证整个系统的每个部分。

## 闪电网络的资源分配问题

在当前的闪电网络中，参与者们无法高效地交换价格信号，因此无法确定网络的资金应该分配到哪里去。因为没有合适的地点，所以需要入账流动性来运行闪电服务的节点不得不通过各种聊天群、论坛乃至推特来招揽资金。另一方面，那些希望部署资金并赚取路由手续费的用户也必须猜测哪里的需求更加旺盛。因此，节点运营者要承担开启无人需要的通道的风险，资金效率也低下。这就好像节点运营者在投机地建设可能无人会使用的道路（我的节点怎么收不到要转发的交易呀？），而那些希望接收支付的用户，也不能将展示自己的节点的吸引力、让网络内部的 “高速公路” 接进来。

Pool 通过创造一种新的拍卖方式来解决这个资源分配问题：拍卖可以匹配希望部署流动性（开启通道）的用户和那些需要通道来运行闪电服务和商业的用户。在每一批执行的拍卖中，拍卖的参与者可以得出一个按区块计算的收益率，这实质上就是当时闪电网络中的资金的租金率。

由 Pool 解决的资源分配、业务启动和激励问题的不完整清单如下：

- **直接使用闪电网络来引导新用户进入比特币**：过去我们常常听到的一个问题时这样的：“用户 Carol，完全没有比特币，可不可以直接通过闪电网络上手使用比特币呢？”在理想情形下，Carol 还应该能够在设置好闪电网络钱包后立即开始接收和发送支付。Pool 通过实例化一个叫做 “side-car channel” 的旧概念来解决这个问题：第三方可以为 Alice 从 Bob 手上购买一条通道，通道中既有入账容量也有出账容量，这样 Alice 就能通过闪电网络直接进入比特币。在这个过程中，Bob 最终也会有所收获，因为 Alice 会为他的服务付费。
- **路由节点的入账容量分配问题**：闪电网络的许多新参与者都会问：“跟哪个节点开设通道，我的节点才会真正被用来路由支付呢？” 在 Pool 出现之前，路由节点的运营者只能猜测哪里的需求更旺盛。Pool 则为路由节点运营者和自动代理提供了一种新的信号：实际的市场需求。有了 Pool，一个节点可以为自己能够分配到通道中的资源要价，并自动分配到需求最高的地方。通过在网络中购买和销售通道，路由节点可以在实质上模拟 “[通道双向注资](https://github.com/lightning/bolts/pull/524)” 的效果。
- **为闪电网络吸引新服务**：任何新服务如果要在闪电网络上启动，都会可能会遇到获取入账流动性（从而可以接收支付）的难题。为此，Pool 提供了一种优雅的方案：商家可以通过市场谈判建立一系列的 “入门点（intrduction points）”。商家可以为分配给它的流动性支付一小笔费用，同时保证这些资金在一段时间内总是可用的。
- **允许用户即刻开始使用闪电网络钱包**：闪电网络的钱包开发者一般都会遇上一个用户体验问题：用户想要在安装钱包后尽快开始接收资金。一些钱包供应商选择自己跟用户开启新的通道，这给了用户需要的入账容量，但反过来对钱包运营商就意味着高昂的资金成本，因为他们要按 1:1 的比例为通道提供资金。Pool 让钱包运营商可以降低获客成本，而且他们只需为分配给新用户的资金支付一笔租金。就像上文中的商家可以购买入账流动性，钱包也可能只需 1000 聪，就可以为用户分配 100 万聪的容量，不需要自己实际提供 100 万聪。
- **补偿路由节点运营者的资金成本**：当前，路由节点加入网络时为了在协助支付的同时从成功完成的支付中赚取手续费。然而，一旦节点无法定期路由交易，他们就无法对冲他们的资金要承担的多种风险（尽管这些风险不大）。有了 Pool，路由节点运营者就可以保证他们能持续地覆盖自己的资金成本。

作为 [Lightning Loop](https://lightning.engineering/loop/) —— 一个非托管的 链下/链上 资金桥梁 —— 的运营者，我们自己在 Loop 服务增长的同时也会遇上这些问题。在我们调研的时候，我们发现没有现成的工具或服务能满足我们的需要，更别说解决我们的客户在建立自己的闪电服务和商业的时候面临的挑战了。Pool 启动之后，Lightning Loop 将为了 Loop 网关节点，成为入账流动性的一个活跃买家。以前，吸引新的入账通道基本上要靠手动、缓慢的流程来操作。有了 Pool 这样的在线市场，我们就能自动化地解决 Loop 在业务量增长时会遇到的资源分配问题。

## 闪电网络的市场设计

市场设计是经济学的一个分支学科，它主要关注的是稀缺资源的高效分配。具体来说，我们借鉴了市场设计的一个使用货币来管理物品和服务交换的领域：拍卖设计。当前广泛使用拍卖设计的案例包括：碳信用的发放、电力市场、飞机座位的拍卖，还有无线电频谱的拍卖。在所有这些案例中，市场设计的原理都被用于产生更高效的市场信息沟通手段、资源分配以及偏好表达。在闪电网络的语境下，我们希望更高效地分配的资源就是入账通道容量（也称为 “入账流动性”）。

### 通过闪电网络通道租赁来实现资源分配

因为闪电网络是一个全额担保（fully collateralized）的系统，为了在一条通道中接收 N BTC，你的对等节点就必须在跟你开启的一条通道中锁定至少 N BTC。类似地，如果你的节点只开启了出账通道，你是无法立即开始路由交易的，因为这需要你的对等节点分配一定的资金给你们的通道（理想情况下应该跟你分配给对方的相同）。新加入网络的用户也会受困于这些问题，因为钱包的用户无法立即接收资金，要么得先在通道中花一些钱，要么得获得一条入账通道。

这个问题有点类似于作为一个刚起步的互联网服务提供商（Internet Service Provider，ISP）在互联网上建立初始连接时会遇到的问题。一个新的 ISP 需要跟其它 IPS 建立对等连接（一般来说是通过 “对等互联协议（[peering aggreements](https://en.wikipedia.org/wiki/Peering)）”，要么是直接互联，要么是进入一个互联网交换点（[Internet Exchange Point](https://en.wikipedia.org/wiki/Internet_exchange_point)，IXP），这样才能服务潜在的新客户并连接到更大的互联网。如果说互联网是一系列的导管，那么闪电网络就是一系列的资金导管，管子中的资金就是互联网支付的运输基础设施。但是，因为这里的资源（通道中的 BTC）是 “虚拟的”，新人加入的门槛要低得多，他们不需要铺设昂贵的光缆，也不需要跟现有的生态系统参与者达成长期的合约。我们估计，随着时间推移，这种低门槛会创造一个由闪电网络服务商（LSP）构成的、更具有竞争力的、更加去中心化的市场（相比于 ISP）。

但是，尝试在闪电网络上创业的新公司和个人也有类似的需要：他们需要资金才能运行自己的业务、投资有前景的新领域。在传统金融的世界里，债券常常用来为公司募集资金，公司可以从许多投资人手上获取资金。债券一般来说都有到期日（到期之后，资金就将全额返回给债权人），并且需要为债券的存续期支付利息，以补偿债权人的资金成本。

闪电网络通道租约实际上就是借鉴了这些背景，创造了一种结合传统互联网对等互联协议和债券的一种新型合约。LCL 是低风险的，因为 LCL 的卖方或者说出租方，始终完全控制着被分配的资金。跟现有的运行一个闪电节点的热钱包相比，不会有更多的风险。LCL 允许资金供应方通过资金分配赚取收益（或者说利息）。因此，那些希望得到资金（以接收支付）的用户可以为资金总量支付一小笔费用，来保证这些资金在一段最小化的时间里持续可用。因为这是一种全新的市场，我们很难猜测市场成熟的时候手续率是多高。但是，因为 LCL 是一种相对低风险的资产，我们预期收益也会保持在相应的水平。

### LCL 的节点评级

在 Pool 的 alpha 版本中，LCL 的买方将默认指定他们只愿意跟 “表现良好” 的节点配对（“表现良好” 指的是基于我们的评级系统，得到了一个 “良好（adequate）” 的评级）。那些希望购买通道，又不在乎对等节点质量的用户可以选择关闭这个过滤器。但是，我们希望提供这个仅从高评级节点购买流动性的选项，以保证购买 LCL 的用户有信心自己买到的会是高质量的服务。潜在用户也可以通过这个[公开可见的网站](https://nodes.lightning.computer/availability/v1/btc.json)监控自己的路由节点评级。Pool 的用户也可以集体选择不用这套评级系统。

## 拍卖设计概述

Pool 是一种新的间歇性的（discrete-interval）、非托管的、密封的、统一出清价格的批量拍卖，让参与者可以从一个公开市场种购买和销售 LCL。对于不熟悉拍卖设计的用户来说，这样的描述可能显得很拗口，所以我们逐个来讲解：

- **间歇性**：不同于持续出清的市场（例如一般的持续运行的中心化订单簿交易所），Pool 这个市场是周期性出清的。间歇性的市场消除了几种有问题的情形，例如订单的滑点和抢跑问题。同样地，因为所有的订单都是使用比特币区块链来执行的，区块间隔自身就为 Pool 的执行时延提供了一个天然的下限。随着一批一批订单出清，市场参与者可以持续地发现闪电网络种的资金的实时租金率。
- **非托管的**：拍卖的参与者需要保管一个链上的账户，用来支付执行费用、溢价，并为卖出的通道充值资金。因为系统是非托管的，分配到这些特殊账户中的资金，在整个拍卖期间，依然是完全由用户掌控的。这种自主保管的属性，让客户端可以审计拍卖行的一举一动，以保证市场在按部就班地运行。
  - 因为所有的资金都是存储在 2-of-2 的多签名输出中的，所以客户端需要签名所有交易。在当前的架构下，服务端无法发起客户端账户的取款，只有客户端可以这么做。
- **密封式拍卖**：所用的订单（出价和要价）都只发送给拍卖行。因此，你没法看着其它订单的价格来出价（只有之前已经出清的价格是可见的），也无法切断系统中现有的订单。相反，参与者被激励纯粹从公开的信息和网络中入账流动性的可感知价值来出价。当然，所有的订单都是在链下直接发送给拍卖行的，因此在出价和清市阶段，不会有链上的活动。
- **统一的出清价格**：在同一批次中，所有的订单都支付相同的价格。这就类似于美国财政部拍卖包括国库券在内的金融工具的方法。所有的交易员都支付相同的价格，这可以被认为是 “更公平的”，因为所有的参与者都被激励给出自己认为最真实的价格。这里的一个经验法则是，参与者要么会得到自己给出的价格，要么会得到更好的价格。
- **批量执行**：在一个拍卖周期中出清的所有订单，都会打包到一笔链上交易中。这种批处理让用户可以将多笔通道开启交易压缩成一笔，最终减少了同一批次的所有参与者的链上手续费负担。随着市场的增长，因为每个用户都摊销了一部分手续费，使用这种拍卖机制来开启通道（而不是独自开启）可能会更加便宜。

如果你想深入了解这些部件是如何构造出来的，我们欢迎你阅读这份[技术白皮书](https://lightning.engineering/lightning-pool-whitepaper.pdf)。

## 别信任，自己验证：客户端的安全属性

类似于 Loop，Pool 的服务端后台是闭源的，但是客户端是可以完全验证和审计拍卖的每一个阶段的。概要来说，Pool 可以被认为是锚定在比特币区块链上的一条 “影子链（Shadowchain）”。这个影子链会验证 UTXO 集的一个子集（Pool 账户）的所有修改，而拍卖行就是该链的一个区块提议者。新区块的内容（一批拍卖）决定了状态的变更，会被验证然后接受。更新的客户端甚至能够审计整个系统的所有历史，以确保它是合理运行的。Pool 将比特币区块链用在了刀刃上：比特币区块链是一个全球的、抗审查的批处理机制。

利用影子链的结构，用户可以全程保持对自己的资金的控制，同时只进入自己可以完全验证的合约；这样就能确保通道是被合理建构的，而且市场是按照预期运行的。比起现有的中心化交易所（同样带有链下订单执行引擎），Pool 有许多安全属性上的有点：

- 作为一个非托管的系统，用户始终控制着自己的资金。
- 一个 LCL 成交将产生一条通道，并且通道的参数将符合初始订单中表达出来的偏好。
- 即使拍卖行服务端被黑，也无法盗取用户的资金。
- 一个交易员的订单不能被用来欺骗另一个交易员的订单。
- 客户端可以完全验证并审计由服务端在批处理交易建构期间发起的所有操作，包括订单的合理匹配。

在 alpha 版本之后，我们会继续迭代这个系统，以提升可验证性和透明性。敬请期待关于这些额外的安全强化措施的更多信息。

## Alpha 版本的局限性

因为这是一个早期的 alpha 版本，许多特性从这个版本中删除了，在 beta 版本时会重新加入。除了这些限制，我们已经开始设计系统的未来迭代，可以增加额外的功能、提升安全性、产生新的应用场景。想了解更多关于这些未来方向的信息，请看我们的[技术白皮书](https://lightning.engineering/lightning-pool-whitepaper.pdf)。

### 基于服务层的生命周期控制

在 alpha 版本中，LCL 不是完全由比特币脚本来执行的。相反，一个 Pool LCL 的买家不会允许挂单者（也就是卖出通道的节点）执行合作式的通道关闭。因此，恶意的挂单者必然会强制关闭，这将导致 LCL 的卖方的资金额外锁定一段时间。在 lnd 实现必要的新类型通道并改变脚本之前，作为一种补救措施，系统会持续监控所有 LCL 的状态，并惩罚过早强制关闭通道的挂单者，识别出唯一的错误方。那些被侦测出违反协议的节点将被暂时禁止参与市场。惯犯的禁止期会以复合模式不断延长。

### 一次性的收益率支付

在 alpha 版本中，所有的利息都是在一批拍卖执行之后由吃单者预付给挂单者的。换句话说，吃单者的所有利息是按总和一次性支付的。这样可以简化系统，但也意味着如果被租借的通道因为某种原因崩溃了，出租人已经收齐了利息，不提供服务也不会有什么损失。

未来，我们希望允许利息实时地 “川流式支付”（每个区块支付一次），从而解决这个问题。在更新之后，吃单者将能够以可验证的方式、使用比特币合约给挂单者支付利息。我们将在未来公布这个吸引人的概念的更多细节，因为在它之上可以建构许多有趣的概念。

### 对账户和通道规模的限制

在 alpha 版本中，账户的规模限制在 10 BTC。当我们对它的信心变得更充足之后，这个限制会提高，最终移除，就像 lnd 的 [Wumbo 通道限制](https://lightning.engineering/posts/2020-08-20-lnd-v0.11/)一样。

### 统一的持续期

在 Pool 的 alpha 版本中，只允许使用一个长达 2016 区块（约两周）的租约持续期。在不久的奖励，我们希望加入额外的选择（4 周、8 周，等等），同时，让用户能够合理地表达他们对 短期/长期 租约的价格偏好。

## 结论

Pool 的 alpha 版本发布，意味着我们将入账流动性问题定义成市场设计领域内的一个经济学问题，并提出了解决问题的新方法。Pool 可以帮助那些需要通过闪电网络来接收支付的人（商家、交易所、服务商，等等）获得他们需要的入账流动性，也可以帮助那些希望找出应该在哪里开设通道的路由节点。因为这是这个系统的一个早期版本，想要推动市场成型我们还有很长的路要走，包括还要继续优化这个系统的吞吐量和安全性。想了解更多技术细节的读者可以看我们的[技术白皮书](https://lightning.engineering/lightning-pool-whitepaper.pdf)。

我们诚邀喜欢运营底层节点的读者下载[这个 alpha 版本的客户端](https://github.com/lightninglabs/pool/releases/tag/v0.3.2-alpha)，并立即开始请求和租借入账通道！在当前的版本和最终的 beta 版本之间，我们会微调 API、收集用户的反馈、修复 bug，并贯彻我们的愿景、保证这个系统能发挥它全部的潜力。有兴趣马上加入这个市场，或者将 Pool 整合进自己的服务的节点运营者和开发者，应该加入我们的 [Slack 频道](https://lightning.engineering/slack.html)，我们很乐意回答你的任何问题并引导你起步。

（完）

