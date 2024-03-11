---
title: 'Breez SDK：让闪电网络走进大众应用'
author: 'Roy Sheinfeld'
date: '2023/03/07 14:51:58'
cover: ''
excerpt: '在恰当的时间将技术应用到适当的地方就能改变世界'
categories:
- 闪电网络
tags:
- 开发
---


> *作者：Roy Sheinfeld*
> 
> *来源：<https://medium.com/breez-technology/lightning-for-everyone-in-any-app-lightning-as-a-service-via-the-breez-sdk-41d899057a1d>*



[阿基米德（Archimedes）](https://www.goodreads.com/quotes/207927-give-me-a-lever-long-enough-and-a-fulcrum-on) 有句名言（应该是他亲口说的）：“给我一根足够长的杠杆和一个支点，我就能撬动地球。”纵使世人皆爱的是他言语中的狂放不羁，这句话揭示了一个简单的道理：在恰当的时间将技术应用到适当的地方就 *能* 改变世界。蒸汽能等待了[将近 2000 年](https://en.wikipedia.org/wiki/Timeline_of_steam_power)才有了合适的条件，得以实现规模化应用，带来翻天覆地的变化。

自中本聪创造比特币以来，所有比特币用户本能地明白这一道理。正因如此，在这项仍未发展成熟的技术上投入时间和金钱是明智之举。我们知道，当万事俱备之时，当比特币技术足够高效便利之时，当人们对法币的不满超过他们对新事物的恐惧之时，比特币将迎来它的时代。

闪电网络本身就代表比特币在效率和便利上的重大突破，但是在用户**和开发者**的体验上仍有改进空间。

我们新推出的 SDK 旨在弥补这一不足。使用我们的 SDK，开发者就不需要重头开始学习一项新的技术，直接就能将比特币付款功能添加到他们（*已经上线*）的应用上。因此，我们的 SDK 革新了开发者的闪电网络体验，而开发者又将发挥其聪明才智和创造力，将闪电网络整合进他们的应用，进而提升用户体验，形成共赢的局面。

由此可见，非托管式 [LaaS（闪电网络即服务）](https://medium.com/breez-technology/scaling-bitcoin-with-lightning-as-a-service-laas-369e7e6f6cb2?source=collection_home---5------1-----------------------)将催生点对点闪电网络经济。那就让我来介绍一下我们的 SDK，它能满足哪些人的需求，以及如何使用它。

![img](../images/lightning-for-everyone-in-any-app-lightning-as-a-service-via-the-breez-sdk/njy4zYw2jVB)

<p style="text-align:center">- 作为一名工程师，我一直不明白为什么被叫作 “工具” 会是一种侮辱（图：<a href="https://www.thoughtspot.com/blog/codex-2015-unleashing-50x-teams">Amit Prakash</a>） -</p>


## 何为 Breez SDK？

一些开发者可能已经对[闪电网络](https://medium.com/breez-technology/waypoints-on-the-road-to-lightnings-mass-adoption-88e4148a2c3c)的优点有所耳闻，并正在考虑如何将闪电网络整合到自己的应用上。然而，光是维护和优化他们自己的应用可能就要占用他们大部分的时间，以至于他们没有时间去熟练掌握闪电网络技术。朋友，我深表同情，发自肺腑的那种。

借助于[开源的](https://github.com/breez/breez-sdk) Breez SDK，开发者无需学习或掌握任何技术知识，即可将闪电网络和比特币付款功能整合到他们自己的应用上。Breez SDK 是基于 [Greenlight](https://blockstream.com/lightning/greenlight/) 的端到端非托管式即用解决方案，包含一个内置的 [LSP](https://medium.com/breez-technology/introducing-lightning-service-providers-fe9fb1665d5f)（闪电网络服务提供商）、链上互通模块、法币入口以及用户和运营者所需的其它服务。

开发者不再需要为了将闪电网络整合到自己的应用而弄懂闪电网络。只要是能够正常使用法币付款处理器（例如，PayPal、信用卡等等）的地方，都可以引入闪电网络。事实上，闪电网络微支付能够创造出全新用例和商业模型，为法币所不能为。下面我来给出几个例子。

Breez SDK 很像智能手机：它们只需几分钟就可以学会，可以帮助你简化很多日常工作，让你做到以前连想都不敢想的事。另外，它们的底层运作机制非常精妙，但是对于大多数用户来说无关紧要。

Breez SDK 的出现标志着闪电网络将不再是一种小众技术，而是成为一种（大众）服务。几年后，闪电网络功能将得到普及，平凡到不再引起人们的关注，而且它会变得非常有用，成为人们生活的必需品。就像手机、鞋子、混凝土和字母表那样。

这一切只需要[几个基础的 API 调用](https://breez.github.io/breez-sdk-rustdoc/doc/breez_sdk_core/)就可以成真。欢迎试用，并[告诉我们](https://breez.technology/sdk/)你希望 Breez SDK 新增什么功能，它给你和你的用户带来了什么好处，哪些功能运行良好，哪些功能有待改进。我们想要根据你的需求开展构建，[成为我们的设计伙伴吧](https://breez.technology/sdk/)。

![img](../images/lightning-for-everyone-in-any-app-lightning-as-a-service-via-the-breez-sdk/Jyu0TBp58av)

<p style="text-align:center">- 再过 10 年左右，托闪电网络即服务的福，你得向你的小孩解释上面这张图中的场景了。我们将重塑货币。（图：<a href="https://unsplash.com/de/@emkal?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText">Emil Kalibradov</a>） -</p>


## Breez SDK 是如何打败法币并尊重比特币的

Breez SDK 将法币的良好用户体验与比特币的优势相结合：

### 1. 端到端：无需装配

Breez SDK 可以让开发者跳过很多步骤，更准确地来说是将一些重要步骤授权给我们完成。例如，Breez SDK 包含一个内置的 LSP 以确保充足的入站容量和可靠的路由。此外，Breez SDK 还能够管理终端用户节点，实现链上互操作性，实现 LNURL，以及提供法币兑换。开发者不再需要解决这些问题，甚至无需完全弄懂这些，因为 Breez SDK 已经将它们一网打尽。开发者只需要知道他们想要为用户引入哪些功能，然后将对应 API 调用添加到他们的应用内即可。

### 2. 免信任：无托管

每个 Breez SDK 用户都有自己的节点并自行保管私钥。他们的比特币不会因为某种 [刷交易量手法](https://www.nber.org/papers/w30783)/[收益计划](https://www.wsj.com/articles/celsius-used-customer-funds-to-prop-up-token-and-cover-shortfalls-examiner-finds-11675177377?tpl=cb) 或其它[离奇事件](https://www.cnbc.com/2022/11/08/ftxs-ftt-token-plunges-80percent-wiping-out-over-2-billion-in-value.html)而丢失。所有对等节点自始至终都将比特币牢牢控制在自己手中。我们的环境里只有比特币 —— 没有 “币圈” 和庞氏骗局 —— 不用担心跑路。Breeze SDK 不会给比特币用户带来额外的风险。

### 3. 无摩擦：无 KYC/AML

KYC/AML 会增加用户在支付过程中的点击负担和摩擦，并给试图实现合规的开发者带来恐惧和监管难题。Breez SDK 支持点对点支付，因此开发者无需接触用户的资金。用户既可以减轻点击负担，又可以免去上传本人照片的麻烦。开发者无需取得[汇款](https://www.fincen.gov/resources/statutes-regulations/administrative-rulings/definition-money-transmitter-merchant-payment)许可证（一大幸事），也不必花费[数十亿美元](https://www.google.com/finance/quote/PYPL:NASDAQ)向第三方法币支付平台购买服务。这不是在扭曲现代支付和金融的规则，而是走上了另一条通往去中介化的道路。

### 4. 互操作：无钱包

由 Breez SDK 实现的 LaaS 从根本上重新定义了用户与比特币的交互方式。其目标是不再向全世界 “按头安利” 比特币，教育世人什么是比特币，而是通过在用户体验上击败法币来改变世人对比特币的看法。同法币一样，用户可以在任何一台设备上登录任何应用查看其比特币余额，但比特币独具去中心化、点对点和免托管特性。用户可以正常地与现有应用交互，而且无论他们身处何地、在做何事都能够访问自己的资金。没有钱包，没有托管，没有摩擦，没有缝隙，没有壁垒。

### 5. 全球化：无国界

为什么要让你的护照来决定你使用什么货币？既然我们都呼吸着同样的空气，吃着同样的食物，为什么我们不能使用同一种货币呢？为什么开发者必须重新设计他们的应用，并为每个市场成立新的子公司？所有监管要求都是旧时代货币遗留下来的阻碍。只有像 Breez SDK 这样的非托管式闪电网络才能让所有人使用同一种货币，并享受无差别的用户体验，不受国籍、地点和掌权者的影响。

### 6. 不费力：无麻烦

毋需多言。

https://youtu.be/PRVWB4K52Es


## 潜在应用场景

让我们想得更远一些。Breez SDK 不仅能够改进无数已有应用，还能够依托闪电网络的经济系统实现全新的盈利模式。Breez SKD 并不只是一个更优秀的技术产品，它能够为编码创造力的[寒武纪大爆发](https://en.wikipedia.org/wiki/Cambrian_explosion)打入一针催化剂。

全世界有大约 [2700 万软件开发者](https://www.bairesdev.com/blog/how-many-software-developers-in-the-world/)，可能有大约 540 亿个想法等待被构建。以下是我个人的看法，以供参考：

### 针对流媒体内容的流式付款

我们的[播客播放器](https://medium.com/breez-technology/podcasts-on-breez-streaming-sats-for-streaming-ideas-d9361ae8a627)就是一个概念证明。想象一下，如果我们制作一个没有剧集的视频，时长为 4 或 12 乃至无穷小时，用户按照观看秒数或分钟数付费。同理，这个模式也可以套用到音乐、有声书、文字、直播上面。就像我们的播客播放器，付费由受众直接支付给创作者，没有中间方经手。

### 社交媒体变现

很多伟大的应用打造的都是用户交互型平台。事实上，过去 15 年来，交互一直是社交媒体背后的驱动力。但是，就像用户可以通过内容、评论和 “点赞（伪货币）” 等方式进行交互那样，他们也可以在闪电网络的帮助下与比特币（真货币）交互。用户能够通过真正的货币将真正的价值像点赞那样轻松传递。由于 Breez SDK 是一个点对点的非托管式解决方案，所有用户都可以使用它，无论他们身处何方，受何法律约束。

### 游戏内货币

捆绑式战利品宝箱和游戏 DLC 包是继横幅广告以来用户体验最差的点子。但是，由于法币交易费太高，这是开发者收回成本的唯一方式。闪电网络小额支付可以改变这一切。为什么不让玩家去酒馆、药剂店和铁匠铺使用真正的比特币通过小额支付购买复活蜂蜜酒、补血剂和狂怒之剑？用户彼此间也可以在游戏内进行交易，开发者可以用真正的比特币作为玩家达成游戏内成就的奖励。

### 跨境汇款

全球有很多人为了让家人过上更好的生活漂洋过海来到异国他乡。他们每天工作很长时间，尽可能省吃俭用，然后将赚到的钱寄回家乡支付房租、医药费和学费。像西联汇款这样的公司会[收取大概 9.5%](https://wise.com/us/blog/western-union-fees) 的汇款手续费。此处我不就手续费定价是否公允做出评判，但是我可以保证 Breez SDK 的手续费会低得多。通过 Breez SDK，任何人都能编写应用以确保更多血汗钱汇入收款方的账户。得益于 Breez SDK 的非托管和点对点特性，汇款不会像过去那样受到国界和 KYC 的困扰。

### 去中介的点对点支付和金融科技

开发者可以使用 Breez SDK 构建无阶层的支付和金融科技应用，实现人人平等和点对点转账。Breez SDK 会淘汰从 Stripe 到信用卡等付款处理商，因为消费者可以直接与供应商交互。银行和交易所也会被淘汰，因为每个人都自行持有和花费自己的钱。将银行、等级制度和中间方去掉之后，我们将缔造一个全新的世界，开创全新的行业规则。

现在轮到你了。

## 未来要靠我们自己构建

蒸汽机的第一个行业用例是[矿井汲水](https://en.wikipedia.org/wiki/Thomas_Savery#Steam-powered_pump)，但是没有人谈论它，因为蒸汽机是静止的而且藏在暗处。三代人之后，投资者开始在蒸汽机上[加装轮子](https://en.wikipedia.org/wiki/Steam_engine)，解锁了蒸汽能，让它走到阳光下，受到万众瞩目。自此，蒸汽改变了世界。

闪电网络正处于同样的关头，Breez SDK 将释放它的力量。Breez SDK 让闪电网络走到了阳光下，使其不再局限于过时且用途单一的应用。有了 Breez SDK，开发者能够在几个小时（而非几周）内将闪电网络添加至他们的项目，使得用户能够无缝自然地享受全新体验。由 Breez SDK 实现的点对点小额付款逻辑意义重大，用户很快会意识到法币及其带来的重重阻碍犹如牢笼一般。

面对 “谁需要接受 KYC”、“谁需要支付交易费” 和 “谁需要银行服务” 等问题时，用户会发现答案全都是“不是我”。同样地，那些因学习难度大、整合困难和信托问题而放弃比特币和闪电网络的开发者会发现上述障碍全都不复存在。

比特币为世界谱写未来，闪电网络为比特币谱写未来，Breez SDK 为闪电网络谱写未来。我们已经完成了 Breez SDK 的构建。[点击此处，了解更多内容](https://github.com/breez/breez-sdk)。[欢迎给我们提出建议](https://breez.technology/sdk/)。现在让我们一起改变世界吧！

![img](../images/lightning-for-everyone-in-any-app-lightning-as-a-service-via-the-breez-sdk/bEDZ3Uv7m57)

（完）