---
title: '什么是 “托管通道”？'
author: 'Fanis Michalakis'
date: '2022/09/22 21:35:12'
cover: ''
excerpt: '信任要求是一条光谱'
categories:
- 闪电网络
tags:
- 闪电网络
---


> *作者：Fanis Michalakis*
> 
> *来源：<https://fanismichalakis.fr/posts/what-are-hosted-channels/>*



上周的文章介绍了[ Turbo 通道](https://fanismichalakis.fr/posts/turbo-channels/)。今天，我将介绍托管通道（hosted channels）。这类通道旨在改善闪电网络通道的用户体验，同时遵循规范要求，减少不得已的牺牲。

## 非链上可执行通道

托管通道与普通闪电网络通道之间的**最大区别**是，前者不能在链上执行，因为没有可以花费的通道开启交易。没错，开启托管通道无需使用比特币交易。虽然没有充值交易，但是托管通道需要用户和托管者之间有一定的信任基础。

事实上，托管通道的参与双方并不平等：

- 托管方提供通道，持有流动性
- 用户使用托管方的通道访问闪电网络，而且可以立即收到付款，因为资金都在托管方手中。

事实上，即使在一些交易发生后，资金也没有离开托管方的控制。因此，托管通道是一种寄存通道。一旦用户通过托管通道收到了比特币（本质上就是托管方欠用户的债），用户必须信任托管方不会卷款跑路。那么，托管通道究竟是如何运作的？为何值得我们注意？

## 信任要求是一条光谱

是什么让托管通道比普通托管钱包（如 Wallet of Satoshi）更有趣？这个问题一度让我感到费解。直到我看到 [Matt Odell](https://twitter.com/ODELL)、[Anton Kumaigorodski](https://twitter.com/akumaigorodski)、[fiatjaf](https://twitter.com/fiatjaf) 和 [Eric Sirion](https://twitter.com/ericsirion) 在[第 45 期 Citadel Dispatch](https://citadeldispatch.com/cd45/) 中[富有见地的讨论](https://bitcointv.com/w/uTtKtUmfWZ7mZDztVXVRWv?start=13m34s)，我才得以豁然开朗。我非常推荐各位读者听一听（我所说的讨论从音频的 13:30 到 28:00 为止，大约持续 15 分钟），但我会在下文中作出总结 <sup><a href="#note1" id="jump-1">1</a></sup>。

如果你使用 Wallet of Satoshi 之类的托管钱包，钱包供应商将包揽一切。比方说，你的余额是 10000 sats，这笔资金实际上位于钱包供应商的某一条通道内。如果你收到一笔付款，其实是钱包供应商收到了这笔付款，再将对应数额加到你的余额上。如果你发送一笔付款，你只需要让钱包供应商替你发送一笔付款。钱包供应商将计算到达收款方的路径，并处理这笔付款。因此，你必须非常信任钱包供应商，钱包供应商也就有千百种方法利用你的信任作恶。

想象一个场景：你需要接收一笔付款。如果你使用的是完全托管钱包，你的发票实际上是钱包供应商帮你创建的。当付款完成，资金到账时，钱包供应商会将相应数额加到你的余额上。但是，它们完全可以骗你说对方付款失败，不更新你的余额，将这笔付款收入自己的囊中。你却没有办法坐实钱包供应商的偷窃行为。即使付款方坚称付款成功，把原像给你看，你也没有办法辨别付款方和钱包供应商之间谁在说谎，因为发票是钱包供应商生成的，你并不知道相关的原像。

如果你使用的是利用托管通道的托管钱包（例如，[Simple Bitcoin Wallet](https://sbw.app/)），情况虽然略有不同，但是用户体验依旧：你可以几乎零成本地在闪电网络上接收和发送比特币 <sup><a href="#note2" id="jump-2">2</a></sup>。你在钱包应用上看到的属于你的余额依然由托管方持有，与 Wallet of Satoshi 并无区别。但是，因为你的钱包实际上是轻闪电网络节点，收付款的隐私性和安全性高得多。

我们再说回收款。这回，你亲自创建发票，不再由钱包供应商代劳。钱包供应商也就无法在收到付款的情况下谎称没有，因为它需要从你那里获取原像来解锁上一跳的 HTLC。

反之，如果你发送一笔付款，托管方必须给你一个有效的原像用于付款，才能解锁你的 HTLC，就像普通的付款路由那样。因此，托管方无法私吞你的付款，然后谎称付款成功。

托管通道的另一个有趣之处是隐私性。正如我在上文所述，如果你使用 Wallet of Satoshi 之类的托管钱包接收付款，钱包负责计算路径，因此知道从付款额到收款方的所有付款信息。如果使用托管通道，用户在本地计算好路径，托管方只是整条路径上的一跳（但请注意，托管方知道付款方是谁）。

最后，由于托管通道上所做的操作与普通通道上的一样，托管方和用户会交换交叉签名的通道状态数据（托管通道等同于承诺交易）。因此，用户拥有某种密码学证明来证实托管方欠他们的债，与传统托管钱包大相径庭。

**一句话总结：有了托管通道，一旦被骗，用户可以证实。**

托管通道还体现了一个有趣的特性，即，托管通道可由除钱包供应商之外的实体提供。例如，你可以在自己的 SBW 应用内拥有一条托管方是 fiatjaf 的通道。这条通道将通道和资金托管与钱包应用及其展示信息分离。我认为，这可以带给用户更强有力的保障，并创建一个基于信誉的广阔托管通道市场。

## 托管通道可公开

托管通道的最后一个有趣之处是，它们可以在网络中公开。因此，其它对等节点无需信任即可使用你的托管通道。事实上，他们甚至无需在意是托管通道还是普通通道：即使出了问题，他们的资金也不会受到影响。用 Anton 在播客中的话来说，托管通道需要网络中协议层面上的两个对等节点之间相互信任，但是如果托管通道公开，网络上的其它节点无需信任即可使用。

## 结论

托管通道属于寄存通道。它们无法在链上执行。但是，我认为在所有托管方案中，托管通道的风险最低。它们能够以极低的成本将新用户引导至闪电网络，因为不需要提交通道充值交易上链。当然了，托管通道相比 Turbo 通道需要更多信任，但是它们解决了这类通道的主要问题之一：加入闪电网络所需的前期成本。

### 脚注

1.<a id="note1"> </a>欢迎向 Citadel Dispatch 捐赠 satoshi。我认为，Citadel Dispatch 是目前关于比特币的最优质节目之一，而且完全没有广告和赞助商。 <a href="#jump-1">↩</a>

2.<a id="note2"> </a>你必须支付路由费，但是开启通道是免费的，因为无需发布比特币交易。这与使用 Turbo 通道的非托管方案（如 Phoenix）形成鲜明对比，后者需要用户支付开启通道的费用。 <a href="#jump-2">↩</a>