---
title: 'Lightning Rod 简介'
author: 'Roy Sheinfeld'
date: '2022/09/15 16:20:25'
cover: ''
excerpt: '随心享用是技术的发展目标'
categories:
- 闪电网络
tags:
- 异步支付
---


> *作者：Roy Sheinfeld*
>
> *来源：<https://medium.com/breez-technology/introducing-lightning-rod-2e0a40d3e44a>*
>
> *原文出版于 2019 年。*

![img](../images/introducing-lightning-rod/aFL4UPgORfO)

<p style="text-align:center">- 见识下 Lightning Rod 的力量！无论是闪电，还是闪电网络，它们或许有一天会被消耗殆尽，但绝不是今天！（来源：<a href="https://thewhizzer.blogspot.com/2005/12/bucks-on-sunday.html">TheWhizzer</a>） -</p>


可以让观众异步观看节目的点播技术已有[ 25 年历史](https://en.wikipedia.org/wiki/Video_on_demand#History)；支持远程异步对话的电话应答机（即，完全基于硬件的语音信箱）已有[ 80 年多历史](https://en.wikipedia.org/wiki/Answering_machine#History)；支持收付款方在不同时间地点异步付款的支票甚至有长达 [2300 年的历史](https://en.wikipedia.org/wiki/Cheque#History)。

很长一段时间来，随心享用都是技术的发展目标。如今，这类技术正在成为现实，其用户体验也在持续改进中。我们不再录制电视节目，而是制成流媒体；我们不再使用语音留言，而是使用通讯应用；我们不再开支票，而是使用 Venmo 支付。我们希望随时随地都能有产品和服务来满足我们的需求。

闪电网络同样需要追赶这一发展潮流。

## 传统闪电网络付款

首先，让我们重温传统闪电网络付款的运作方式。（如果你已经熟悉了闪电网络协议，可以直接跳到下一部分。如果你想了解更多细节，推荐阅读[《闪电网络 2.0》](https://blog.theabacus.io/lightning-network-2-0-b878b9bb356e)和[《走近闪电网络 part-2：创建网络》](https://bitcoinmagazine.com/articles/understanding-the-lightning-network-part-creating-the-network-1465326903/)（[中文译本](https://www.btcstudy.org/2020/08/24/understanding-the-lightning-network-part-creating-the-network/)），等你觉得更能将自己代入 Alice、Bob 和 Carol 时再回到本文。）

步骤 1：

![img](../images/introducing-lightning-rod/XoyxnAZ3srm)

在传统闪电网络付款中，Carol（收款方）通过向 Alice（付款方）发送发票来开启流程。Carol 的发票中包含 Carol 所生成的原像的哈希值。

步骤 2：

Alice 向 Bob（路由节点）发送一笔使用 Carol 的原像哈希值锁定的哈希时间锁合约（HTLC）付款。

![img](../images/introducing-lightning-rod/yKzEq4BGAQm)

步骤 3：

Bob 向 Carol 发送一笔 HTLC 付款。Carol 可以使用她最初发送给 Alice 的哈希值所对应的原像解锁该 HTLC 付款。

![img](../images/introducing-lightning-rod/5DKrW8SAdN5)

步骤 4：

一旦 Carol 从 Bob 那里收到了 HTLC 付款，就会将原像告诉 Bob，让 Bob 可以解锁 Alice 的 HTLC 付款。Bob 从 Carol 那里获得原像后，再将原像转发给 Alice，完成一次 HTLC 付款循环。

![img](../images/introducing-lightning-rod/D_rCSmMRxTv)

步骤 5：

Alice 从 Bob 那里收到原像后，最后一步是使用承诺交易（commitment transaction） 替换这些 HTLC 交易来重复上述流程，让支付通道可以保持开放。

## 同时性问题

托管式钱包将一切都简单化了。它们将用户与他们的资产分离，使用服务器进行远程管理 —— 将比特币当作 Candy Crush 代币那样对待。

非托管式客户端更加尊重用户，让用户保有对资金的控制，但是需要牺牲用户体验。若想在非托管型客户端上完成传统闪电网络付款，收付款双方必须同时开启客户端。除非双方同时在前台运行移动应用，否则他们都无法发起付款。

收付款双方可能身处不同的地点，但是他们必须同时在线 —— 就像打电话一样。在注重按需服务的年代，要求用户等候使用服务或等待彼此是一种倒退。法币在异步付款方面做得很好，[超越法币就是我们的目标](https://medium.com/breez-technology/why-breez-is-committed-to-bitcoin-b0418f86fec3)。

为了解决付款双方的客户端需要同时在线的问题，我们目前的权宜之计是“Connect-to-Pay（连接付款）”。该功能可以让一方向另一方发送一条链接，后者点击该链接后，将会开启付款会话。当然了，这种方式虽然优于二维码，但仍不是最佳选择。Connect-to-Pay 的便捷程度不亚于电话，它克服了空间距离问题，但是无法免除同时性要求。在需要快速发送通知时，谁会更喜欢打电话而不是发消息？

![img](../images/introducing-lightning-rod/0X8U6zgE-ZH)

<p style="text-align:center">- 电话常用于报警和电话推销。难道这就是我们要追求的用户体验吗？（来源：<a href="https://en.dopl3r.com/memes/dank/give-them-a-call-ive-emailed-oe-quick-to-call-i-texted-them-as-well-ill-send-them-another-email-oust-call-them/292682">dopl3r</a>） -</p>


现在，我们可以通过文字传达相同的信息。文字不仅便于接收，而且可以通过单一媒介发送，又没有电话那样的同时性要求。这才是我们所追求的。

## 新标准：Lightning Rod

Lightning Rod 可以让用户通过异步的方式完成付款。换言之，用户可以按照自己的想法，而不是客户端的要求来进行付款。接下来，我们将简单阐述 Lightning Rod 是如何运作的。[如需了解详细信息，欢迎查看我们的 GitHub](https://github.com/breez/LightningRod)。

![img](../images/introducing-lightning-rod/jEzhwMUK5GZ)

<p style="text-align:center">- 具象化有时会促进理解，图中人就是 Rod。（来源：<a href="https://www.flickr.com/photos/badgreeb_records/6432951781">badgreeb RECORDS</a>） -</p>


## Lightning Rod 的运作原理

使用 Lightning Rod 时，由付款方（Alice）启动付款流程。这个流程里没有 Bob，取而代之的是一个运行协议的节点。我们将这个节点叫作“Rod”。 

步骤 1：

Alice 发送一个秘密值给 Carol，接着就可以下线玩耍了。

![img](../images/introducing-lightning-rod/DTgnC2i5bt8)

步骤 2：

Carol 生成一个原像，然后将来自 Alice 的秘密值的哈希值连同原像的哈希值（即，付款发票）一起发送给 Rod。这实际上将 Alice 给 Carol 的付款拆分成了两笔付款：Alice 给 Rod 的付款和 Rod 给 Carol 的付款。

现在，Carol 也可以下线玩耍了。 

![img](../images/introducing-lightning-rod/z9DolMMHViD)

步骤 3：

Rod 将秘密值的哈希值连同包含（来自 Carol 的）原像哈希值的 [HODL 发票](https://github.com/lightningnetwork/lnd/pull/2022)一同发送给 Alice。（简而言之，HODL 发票支持收款方推迟或取消超出 HTLC 限制的付款，但是付款方的承诺依然有效。）

有了秘密值哈希值，Alice 就可以验证付款来源，这意味着 Alice 可以验证由 Carol 发起的付款请求。得益于 HODL 发票，Alice 无需立即与 Rod 完成结算。

![img](../images/introducing-lightning-rod/FAmArEMkanL)

步骤 4：

Alice 验证过付款后，会发送一个 HTLC 给 Rod。然后，Rod 会发送一个 HTLC 给 Carol，也就是从上述传统流程的步骤 2 开始。

![img](../images/introducing-lightning-rod/PlM69B8shT8)

换言之，一旦付款方启动流程，收款方可以等到有空时发送发票，付款方也可以自己选个适当的时间支付。Rod 要等待的时间最久，不过没关系。[*这颗沧桑的心愿意为你等待*](https://youtu.be/N9eQShsxkj4?t=110)。

Lightning Rod 有几点重要特性需要注意。

- 不同于传统闪电网络付款，Alice 在步骤 1 中向 Carol 发送初始秘密值时直接与 Carol 发起通信。Alice 可以自行选择安全的通讯应用发送秘密值。

- 交易是完全免信任的。初始秘密值只用来向 Alice 证明 Rod（仿佛是在跟 Alice 说“别担心，Carol 已经发给我了”）。但是，Rod 无法使用 Alice 的付款，因为他没有 Carol 的原像。

- 虽然有两个独立的发票，但是它们实际上被同一个原像绑定在同一个付款流程中。

- 无论付款方和收款方何时使用同一个 Lightning Rod，Lightning Rod 都会知道交易的来源、目的地和数额。用户可以使用多个随机选择的 Lightning Rod 来增强隐私性，就像使用 [trampoline 路由节点](https://medium.com/breez-technology/lightning-network-routing-privacy-and-efficiency-in-a-positive-sum-game-b8e443f50247)那样。协议支持用户在同一笔付款中使用多个 Lightning Rod，例如，Carol 将信息发送给 Rod B，再由 Rod B 与 Rod A 交互。在这种情况下，Rod A 并不知道 Carol 的信息（Alice → Rod A → Rod B → Carol）。 

## 目的

我们致力于推动比特币发展，颠覆法币的地位。这就意味着我们必须以魔法打败魔法：即使在[易用性上无法匹敌现金](https://medium.com/breez-technology/why-bitcoin-needs-to-become-a-medium-of-exchange-80d5c9e1de65)，也要与 Venmo 打平。光喊口号还不够，我们必须创新 —— 打造一个更好的方案，然后持续改进。

Lightning Rod 是我们最新推出的创新技术。它的诞生有助于闪电网络经济进一步迈向主流化。它为我们一直以来未能实现的异步付款功能提供了基础设施，而且充分尊重了比特币的价值观和底层技术。

（完）