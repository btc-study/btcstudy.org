---
title: 'Cashu：Chaumian e-cash 和闪电网络上的铸币厂'
author: 'Bitfinex'
date: '2023/08/17 15:27:34'
cover: ''
excerpt: '它接受比特币并使用盲签名系统来发行 e-cash token'
tags:
- Cashu
---


> *作者：Bitfinex*
> 
> *来源：<https://blog.bitfinex.com/education/cashu-chaumian-e-cash-mints-over-lightning/>*



**摘要**：

Cashu 是一个为比特币启用 Chaumian e-cash 的项目。Chaumian e-cash 是一种电子现金支付系统，得名于其创造者 David Chaum（大卫·乔姆）。这位传奇的密码学家在比特币之前开发了一种初步的电子现金系统（“Digicash”），通过密码学给用户提供了安全性和隐私性上的巨大提升。

## 使用Cashu 实现 Chaumian e-cash

[Cashu](https://cashu.space/) 是一个令人激动的新型比特币 Layer 2 项目，它实现了 Chaumian e-cash，可以实现快速的、可扩展的、完全隐私的、由比特币背书的 e-cash 交易。Cashu 的基本参与者称为 “铸币厂（mint）”，它接受比特币并使用盲签名系统来发行 e-cash token，这种 token 可以花费、转让和接收，最终也可以赎回比特币。

使用 Cashu 的时候，用户不需要注册账户，也不需要提供私人信息，铸币厂看不到你的余额、不知道你手上有那些 token、也不知道你在跟谁交易，而且你可以持有你自己的 token（虽然为其背书的比特币在铸币厂的保管下）。任何人都可以自己开一个铸币厂，从而称为可以发行 e-cash 的 “银行”。用户可以自由选择铸币厂、在任何时候用 e-cash token 赎回比特币。

Cashu 是由一位匿名的比特币和闪电网络开发者 [Calle](https://twitter.com/callebtc) 创建的，TA 从 David Chaum 初创的 “Digicash” 项目中获得了 Cashu 的灵感。Digicash 启动于 1990 年代，但没有获得关注和大规模采用。

更准确地说，Cashu 基于 Chaumian 盲签名系统的一个变种，是由 David Wagner（他是 Chaum 的学生）设计的；以及一种使用 “[盲化 Diffie-Hellman 密钥交换](https://en.wikipedia.org/wiki/Diffie%E2%80%93Hellman_key_exchange)” 方案的基于 minicash 的 token 逻辑。Wagner 曾是 Chaum 的学生，他制作了一个 e-cash 的替代实现，通过加密获得了类似的安全性和隐私性，同时避开了 Chaum 在 Digicash 的一些专利。

Cashu 也跟比特币上的另一种叫做 “Fedimint” 的 Chaumian e-cash 项目相似。Fedimint 使用类似的技术实现了许多相同的目标，比如优化的隐私性和扩展性，关键的区别在于，Fedimint 使用了[联盟化](https://en.wikipedia.org/wiki/Federation_(information_technology))的 Chaumian 铸币厂，而 Cashu 没有。

Cashu 的模式允许任何人创建自己的铸币厂，而且用户也可以选择任意铸币厂，每一个铸币厂都是相互独立的，不像 Fedimint 那样会产生联合（译者注：作者在这里可能误解了 Fedimint 的 “联盟化” 的含义，实际上 Fedimint 和 Cashu 应被认为是极为相似的）。Cashu 用户可以轻易地使用多个铸币厂，根据铸币厂的声誉、费用、便利性、其它因素和激励机制作出选择。

## Chaumian e-cash 可以给比特币提供什么好处？

Cashu 为常规链上比特币和闪电网络交易所没有的一些重要好处奠定了基础。Cashu 的 e-cash 牺牲了一些东西，以实现隐私、安全、可扩展且便宜的交易。主要的牺牲在于，用户必须在铸币厂存入比特币，以铸造 e-cash，所以这是一种托管式钱包的设计，虽然这种设计所需的信任假设比常见的托管式钱包要少得多。

一旦用户在某个铸币厂存入了比特币，就可以创造出 e-cash token，而铸币厂自身无法知晓用户的数量、用户的身份、用户的账户余额，以及他们的交易历史。Cashu 的用户也可以给普通的闪电网络钱包支付/从闪电网络收取支付（链上支付功能还在开发）。此外，Cash e-cash 交易很便宜，可扩展，而且没有限制。

Cashu 是一个新项目，还在开发的早期阶段，所以一直在优化 —— 如果用户准备投入真金白银，需要有心理准备。但话说回来，它是最令人激动的新项目之一，它使用新的角度来解决比特币的隐私性和可扩展性问题。

Cashu 的 e-cash 跟托管式闪电钱包相比，在隐私性和安全性上都有所不同。当前，托管式闪电钱包，虽然能做到即时、便宜的支付，但在受到胁迫或诱惑的时候，也可以审查用户的交易，此外还可以监控用户的交易数据和消费习惯。但在 e-cash 这里，这是做不到的，因为铸币厂不知道关于数额、发送者和接收者之类的任何信息。

Cashu 也提供了类似于闪电网络交易的速度和成本优势，所以支付是即时的，而且非常便宜，但隐私性更好。哪怕跟自主保管的闪电钱包相比，Cashu 的 e-cash 依然提供了易用性上的一些好处：用户不需要管理通道，不需要担心 入账/出账 流动性，也不需要应对被通道对手单方面关闭通道的情形。

Cashu 的创造者 Calle 还设想了一种未来：Cashu 作为一种协议，被集成到许多比特币钱包和服务中，让 e-cash、铸币厂和闪电网络的集成更加顺滑。Cashu 提供了多种好处，有望引领商业应用和用户尝试中的大规模采用。

Cashu 优化之后的易用性，让原本习惯于闪电网络的比特币用户能够得到大大简化的 Layer 2 体验，也让今天可用的据大部分托管闪电钱包的用户能够得到更好的隐私性和安全性。

这可能是提供媲美闪电网络用户体验的更好、更简单的方式，让不懂技术的用户无需运行比特币和闪电网络节点、无需自己管理通道和流动性，就可以在网上买卖东西。

Cash 和其它 e-cash 实现（比如 Fedimint），拥有巨大的潜能，可以通过减缓尝试接受 Layer 2 技术（比如闪电网络）的比特币用户的学期曲线，极大地提升比特币的循环经济。

比特币钱包、企业和服务会不会支持 Cashu 或其它基于比特币的 e-cash 方案，还有待观察。这一次，e-cash 会彻底革新比特币吗？还是说它会像 30 年前 David Chuam 奋力将 Digicash 带给公众的时候一样，逐渐失势，最终无人问津？