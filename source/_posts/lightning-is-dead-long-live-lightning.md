---
title: '闪电网络已死，闪电网络永生'
author: 'Roy Sheinfeld'
date: '2026/03/27 18:44:53'
cover: ''
excerpt: '这正是我们想要的工作方式'
tags:
- 产品
---


> *作者：Roy Sheinfeld*
> 
> *来源：<https://blog.breez.technology/lightning-is-dead-long-live-lightning-f224292dbcd0>*



![1_jim2VFx79gYPh2HQq-63yQ](../images/lightning-is-dead-long-live-lightning/1_jim2VFx79gYPh2HQq-63yQ.webp)

闪电网络一直在演化，但在过去十年中，我们见证的绝大多数变化，都是这项技术 *内部* 的变化。而在过去两年出，出现的是 *围绕* 这项技术的改变。我讲的并不是协议的强化措施或者是新特性，而是对闪电网络的性质、它能够做什么、谁在什么地方使用它，有了根本上的新理解。

以往我们孤立地讨论过其中一些变化，但可能有些抽象。这也是为什么我们会拥抱 “[通用语言](https://medium.com/breez-technology/lightning-is-the-common-language-of-the-bitcoin-economy-eb8515341c11)”（[中文译本](https://www.btcstudy.org/2025/06/12/lightning-is-the-common-language-of-the-bitcoin-economy/)）和 “最后一公里” 这样的比喻。

幸运的是，我们的合作伙伴之一 [Cake Wallet](https://cakewallet.com/)，与我们一起走过了这条路。他们的故事生动地展现了闪电网络近期的转型。所以，让我来给你讲讲闪电网络、Breez 和 Cake Wallet 的故事。

## 如果继续钻牛角尖 ……

在 2024 年，我们很高兴地 [欢迎 Cake](https://blog.breez.technology/adding-lightning-to-crypto-is-a-piece-of-cake-with-the-breez-sdk-2476db0ed9dc) 作为一个早期的设计伙伴、使用我们（后来）全新的 SDK（软件开发工具）。Cake 在他们的钱包实现中实现了 Breez SDK 以使用 [Greenlight](https://medium.com/breez-technology/get-ready-for-a-fresh-breez-multiple-apps-one-node-optimal-ux-519c4daf2536) 。虽然 Greenlight 的远端节点模式，相比于运行在用户收集上的客户端节点有更好的闪电网络使用体验，但 Cake 从未将它发布到生产环境，后来我们也放弃了它。

相比更早的移动设备上的闪电节点实现，Greenlight 可以称得上是 “生活品质提升”。在用户的手机上运行一个真正的闪电节点，要消耗大量资源，还要持续与比特币区块链和闪电网络同步， 这在当时的移动设备操作系统的限制下，是非常难办的。通过将用户的节点转移到云端、将许多活动部件转移到幕后，Greenlight 确实提升了使用体验。

但是，即使使用 Greenlight，我们也还是要在免许可的、无边界的比特币，与符合直觉的、无摩擦的使用体验之间，作出进一步的取舍。举个例子，[通道流动性](https://blog.breez.technology/lightning-economics-how-i-learned-to-stop-worrying-and-love-inbound-liquidity-511d05aa8b8b)就[依然](https://blog.breez.technology/lightning-is-a-liquidity-network-550896ca27ea)是一个让每个用户都[头疼](https://medium.com/breez-technology/liquidity-on-lightning-moving-from-ux-to-economix-6e597d9e1abd)的问题。我们当时认为，Greenlight 已经是那个时候能够取得的最好的平衡，在保管模式和开放性上与其前辈们相当，但在简洁性上超越了它们；但是，它的使用体验依然过于复杂，而 Greenlight 也被证明是难以扩大规模的。

正是这些理由，Cask 从未将 Breez SDK 的 Greenlight 实现投入生产环境，而只是[表扬了它的设计](https://blog.breez.technology/adding-lightning-to-crypto-is-a-piece-of-cake-with-the-breez-sdk-2476db0ed9dc)、简洁性和功能性。Greenlight 是（闪电网络）这种技术 *内部* 的一个进步，但闪电网络需要 *围绕* 这种技术的根本性改变。

Cake 尝试了 Greenlight 解决方案，事实证明，它虽然对开发者已经足够好，对用户来说却仍然不够。他们选择了不妥协、等待更好的产品。说实话，这正是我们需要的反馈。

## 最后一公里的一种通用语言

斗转星移，技术亦然。

更具体地说，[多种瞄准 “最后一公里” 的技术](https://bitcoinmagazine.com/technical/spark-and-ark-a-look-at-our-newest-bitcoin-layer-twos)出现了（[中文译本](https://www.btcstudy.org/2025/10/28/spark-and-ark-a-look-at-our-newest-bitcoin-layer-twos/)），提升了比特币用户的体验和转移比特币的经济性。这些技术有：新一代的 statechain（比如 [Spark](https://bitcoinmagazine.com/technical/spark-explained-like-youre-five)（[中文译本](https://www.btcstudy.org/2026/01/20/spark-explained-like-youre-five/)）） 、侧链（比如 [Liquid](https://blog.breez.technology/to-help-bitcoin-flow-were-adding-some-liquid-to-the-breez-sdk-b56c14b0c9b0)）、适合朋友和家庭的联盟（比如 [Fedimint](https://fedimint.org/docs/GettingStarted/Who-are-the-fms)）、eCash 网络（比如 [Cashu](https://cashu.space/)），还有高级的可编程层（比如 [Arkade](https://docs.arkadeos.com/primer)）。它们全都是同一个主题的变奏：就像闪电网络提升了比特币的经济性和吞吐量，这些最后一公里的结束，都提升了闪电网络的支付通道、经济性、复杂性和可扩展性。

闪电网络依然是我们转移价值的方法中不可缺少的一部分，但它已经成了一种[通用语言](https://blog.breez.technology/lightning-is-the-common-language-of-the-bitcoin-economy-eb8515341c11)（[中文译本](https://www.btcstudy.org/2025/06/12/lightning-is-the-common-language-of-the-bitcoin-economy/)）和支付协议，是一种连接这些最后一公里技术的协议，而不是一种用户需要理解的支付通道协议。而且闪电网络的连接会进入更深层次。即使比特币是从一个 Spark 实体转移给了 Arkade，或者在一个 Fedimit 联盟与 Liquid 之间转移， 这些次级网络都是用流利的闪电网络语言来沟通的。

只要你理解[闪电网络的经济模型](https://medium.com/breez-technology/liquidity-on-lightning-moving-from-ux-to-economix-6e597d9e1abd)并且看重用户体验，那闪电网络的转型在你看来就是大势所趋。当存在持续的高速交易流时，Poon-Dryja 支付通道（即当前的闪电通道构型）无与伦比，尤其是这些交易流是双向的时候。即使源自移动端的先天问题（比如网络同步和离线收款）得到了解决，网络边缘的节点们依然会因为交易速度较低而无法发挥性能。流动性管理和经济模型，对于路由节点来说是一种特性，对于终端用户节点来说却是一个 bug 。好在，这些最后一公里技术解决了这些问题和使用体验上的复杂性，而闪电网络作为通用语言连接起了它们，开发者和用户都能亲近比特币了。

## Cake 回归

介绍闪电网络的演化非常过瘾，差点忘了告诉你个大新闻：Cake Wallet 现在将 Breez SDK 带到生产环境了！耶！

Cake 一直在研究比特币的使用体验困局，并且[探索了多种最后一公里解决方案](https://bitcoinmagazine.com/technical/spark-and-ark-a-look-at-our-newest-bitcoin-layer-twos)。Breez SDK 的 Spark 实现，为 Cake 在[信任最小化的解决方案](https://docs.spark.money/learn/trust-model)和适配的使用体验之间，取得了平衡。它结合了比特币的开放性、有用性和终局性，以及到目前为止闪电网络还不具备的特性，比如离线支付。

至于使用体验，它曾经是我们的弱点，现在已经成了强项。支付是即时送达的。离线支付和闪电网络地址都是自带的。手续费是可以忽略不计的。就跟任何金融科技 app 一样，大量不相关的复杂性都藏在幕后，因为用户只需要看到资金按照自己定义的时间、方式，去到想让它去的地方。这就是比特币作为一种电子货币的样子。用户只需要拿上蛋糕（Cake），美美地吃掉它就好！（不好意思，我真的忍不住。）

当然，在开发者体验上我们也没有落下，比以往时候都要好。Breez SDK 的 API（应用程序接口）是由开发者们为开发者设计的，尽可能简单、使用清晰而有延展性的指令，还有快速和有用的支持。作为一个亲近用户的产品，Cake 服务于自己的终端用户；而作为一个亲近开发者的产品，我们服务于 Cake 的产品团队。

## 耕耘终有收获

Breez 几乎是第一个看到闪电网络的潜力的团队，并且也发布一款易用的移动端 app，但我们的用户迫使我们打造更好的体验。我们跟 Blockstream 团队一起工作（他们设计了 Greenlight），尝试为用户和开发者优化它。说起来我们依然感到自豪，而且有理由自豪，因为我们的旧的 Greenlight SDK 也是一个显著的提升。但是 Cake 这样的合作伙伴依然不满意（哪怕已经给了 Greenlight 实现很多机会）。所以他们也迫使我们去开发更好的东西。

我们做到了。我说的 “我们”，指的是整个闪电网络社区。Breez 依然在跟 Blockstream 合作，开发我们的 SDK 的 Liquid 实现；我们也在跟 Lightspark 合作，开发 Spark 实现、利用它来提供一流的闪电网络使用体验。

这就是我们想要的工作方式。我们尽己所能，利用现有的技术开发出成果，然后将它推向市场，一边推高标准，一边看哪里还需要提升。Cake 这样忠实的合作伙伴会告知他们和他们用户的需要。然后，我们与追求同一个目标的盟友碰面，合作打造下一个奇迹、下一个最优解。

Breez、闪电网络和 Cake 的故事，至少告诉了我们两个道理。第一，天上不掉馅饼。第二，即时不可能断定闪电网络上出现的下一个创新是什么、它会怎么工作，趋势不会骗人：闪电网络一直在变好。比起我们刚刚起步的时候，闪电网络已经变得好用很多很多，能够帮助多得多的人了。

你不喜欢圆满的结局吗？

（完）