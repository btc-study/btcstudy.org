---
title: '在闪电网络上使用合成稳定币'
author: 'Kollider'
date: '2022/08/17 16:32:30'
cover: ''
excerpt: '如何在闪电网络上创建合成稳定币？借助支持闪电网络的交易所'
tags:
- 闪电网络
- 稳定币
---


> *作者：Kollider*
> 
> *来源：<https://twitter.com/kollider_trade/status/1496507594214723590>*



本文将介绍[闪电网络](https://twitter.com/hashtag/LightningNetwork?t=Pg7SSMIc7jK9aI7ozER5YQ&s=09)上的合成稳定币是什么，是如何创建的，又是哪些人在使用它们。

以下内容仅供学习使用，不作为投资建议。请自行甄别。

**什么是稳定币？**

稳定币是一种旨在 1:1 锚定外部参考价格的密码学货币。例如，USD 稳定币的目的是将单位资产的市场价格维持在 1 美元左右。

**稳定币为何如此重要？**

1:1 锚定使得稳定币不仅具有低波动性，而且可以快速转移。这对于需要以法币价格结算的企业或个人，或无法忍受比特币波动性的人来说尤其有用。

**那么，有谁正在将稳定币引入闪电网络？**

[@Synonym_to](https://twitter.com/Synonym_to?t=RbF2qwNgXZUl4cCVdjtzLw&s=09) 正在努力将 USDT 引入闪电网络。[Liquid_BTC](https://twitter.com/Liquid_BTC?t=MGy_S4RrpKgjEZ8FSPlK6Q&s=09) 也在尝试将 liquid 资产引入 C-Lightning。

**闪电网络上有原生的稳定币吗？**

目前还没有，但是有合成稳定币。

**合成稳定币是什么？**

合成资产指模仿另一种金融工具却又没有实际使用它的金融工具。例如，不使用真正的美元，而是使用比特币期货，让一种金融工具尽可能锚定 1 美元。在 [kollider_trade](https://twitter.com/kollider_trade?t=139s-Yg3aLomMyk5yy0Qrg&s=09) 等整合了闪电网络的交易所上，有一些衍生品可以用来创建合成 USD 稳定币。

**但是，创建合成稳定币究竟该怎么做？**

要想创建这种合成 USD 稳定币，你需要在不出售手中比特币的情况下将它们“转化成”美元。一种方法是通过卖出反向 BTC/USD 永续合约得到你所需的美元金额。

但是，在此之前，你应该注意的是，既然是合成资产，就会存在脱离 1:1 锚定的情况。

我们可以想到以下两种情况：

- 资金费率

- 延时

**资金费率**

卖出永续合约后，你有可能获得资金费率（也有可能需要支付资金费率）。因此，在资金费率的影响下，你拥有的每“1 美元”合成稳定币的实际价值可能略高或略低于 1 美元。

**买入比特币和卖出反向永续合约之间的延时**

以美元为例，假设你用 1 万美元的汇率买入 1 BTC，然后卖出反向永续合约作为对冲。但是，如果在卖出之前比特币的汇率变为 9900 美元或 1.1 万美元，你的合成稳定币价格会发生 1 美元 ± 1% 的波动。

幸好在闪电网络的帮助下，交易所之间的转账速度非常快，能够有效避免延时。除了 Kollider 之外，还有其它一些交易所同样连接到闪电网络。参阅：https://twitter.com/kollider_trade/status/1490724060862500867?t=hzb3bJ0V9AAaSHiZOnSQWQ&s=09

**如何仅使用比特币创建合成稳定币？**

假设你收到比特币付款后，需要月底时手中能持有 1 万美元。你可以拿出价值 1 万美元的 BTC，并以 1 倍杠杆卖出价值 1 万美元的反向永续合约。你可以通过自己的闪电网络节点或钱包，直接在支持闪电网络的交易所（如 Kollider）上卖出 1 万美元的反向永续合约。如果比特币的价格为 4 万美元，你需要 0.25 BTC 作为保证金以 1 倍杠杆卖出 1 万美元的 BTC/USD 反向永续合约。如果你想拿回最初的 1 万美元，可以回到交易所关闭你的做空仓位，拿回价值 1 万美元的比特币（如果比特币的价格发生了变化，你拿到的比特币数量会与之前不同）；然后，你可以通过交易所（如 Bitfinex）将现货比特币卖成美元。

**在持有美元的情况下如何创建合成稳定币？**

如果你一开始就持有美元，想要在闪电网络上创建合成 USD 稳定币，首先需要买入比特币，之后的具体步骤与上述相同。最好在支持闪电网络的交易所上买入比特币，以便减少延时。

**哪些人在使用合成稳定币？他们为何要这么做？**

[Standard Sats](https://devpost.com/software/standard-sats) 正在试验合成稳定币，用来实现“托管型通道”，以便用户在 Sats 支持的闪电通道内使用法币进行交易。[@GaloyMoney](https://twitter.com/GaloyMoney?t=TStyxasOxu6Ei2M_kF63fw&s=09) 也在其应用中将比特币与法币挂钩，让用户可以使用与上述类似的交易在支付通道内持有美元仓位。另外，@GaloyMoney 的 [@nicolasburtey](https://twitter.com/nicolasburtey?t=scOqBFDKLh6FJS3oAcYDxg&s=09) 在 [@stephanlivera](https://twitter.com/stephanlivera?t=RVuaaUDMRWug0JMZWmAV-Q&s=09) 的播客（https://stephanlivera.com/episode/346/）上也阐述了合成资产的重要性。

闪电网络未来完全有可能推出自己的原生稳定币，不过目前只有使用比特币实现的合成稳定币。

 （完）