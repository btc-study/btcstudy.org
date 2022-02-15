---
title: 'BIP 324：增强比特币节点安全性的信息传输协议'
author: 'Tony Sanak'
date: '2022/07/15 12:44:30'
cover: ''
excerpt: '利用 “握手”操作保护比特币节点免受中间人攻击'
categories:
- 比特币主网
tags:
- 点对点网络
---


> *作者：Tony Sanak*
> 
> *来源：<https://bitcoinmagazine.com/technical/bip-324-a-message-transport-protocol-that-could-protect-bitcoin-peers>*



![BIP 324, proposed by Jonas Schnelli, is designed to protect Bitcoin peers against man-in-the-middle attacks using an action called a “handshake” to share keys more privately.](../images/bip-324-a-message-transport-protocol-that-could-protect-bitcoin-peers/n-peers.jpg)

*Jonas Schnelli 提议的 BIP 324 旨在利用 “握手”操作增强密钥分享的隐私性，从而保护比特币节点免受中间人攻击（man-in-the-middle attack）。*

目睹比特币生态这十余年来的发展情况，我们发现比特币开发者依然任重道远，而 2019 年 3 月创建的 BIP 324 或将带领我们迈出重要一步。

BIP 324 由 [Shift Cryptosecurity](https://bitcoinmagazine.com/articles/video-shift-cryptosecurity-on-its-base-node-and-bitbox02-wallet) 的联合创始人兼比特币开发者 Jonas Schnelli 撰写，旨在解决人们对于比特币对等节点之间消息交换的担忧。

正如比特币白皮书的标题《比特币：一种点对点的电子现金系统》所展示的那样，P2P 层是比特币网络的主要组成部分，却又存在效率显著低下、理论上容易遭受攻击的问题。P2P 网络正是比特币的主要研究和升级领域之一。该领域已经有一些新兴项目得到了人们的专注，包括 [Dandelion](https://bitcoinmagazine.com/articles/anatomy-anonymity-how-dandelion-could-make-bitcoin-more-private)（BIP 156）和 [Erlay](https://bitcoinmagazine.com/articles/how-the-new-erlay-protocol-could-speed-up-the-bitcoin-network) 之类的提案。

那么，什么是 P2P 网络架构？在比特币诞生之前，最成功的 P2P 网络实现应用于文件分享服务：最初是 Napster（因使用中央服务器目录而具备部分中心化），之后是 BitTorrent。

在理想配置下，P2P 网络不应该有任何层级（所有节点都是平等的），而且节点应该均等分担网络负载。这样一个由相互连接的节点构成的基础层帮助比特币实现了抗审查性。[多国政府已经采取措施](https://en.wikipedia.org/wiki/Countries_blocking_access_to_The_Pirate_Bay)在搜索引擎层面屏蔽了 torrent 网络。屏蔽 torrent 搜索引擎虽易，要杀死 P2P torrent 网络却难得多，几乎是不可能的。这类网络的最主要问题是：对用户的隐私保护程度如何？

## 比特币的 P2P 层存在的问题

就当前的比特币 P2P 层实现而言，其中一个问题是，缺少在消息传输层上执行的加密。因此，比特币容易遭受中间人攻击（MITM）。MITM 攻击的方式是秘密连接到两个对等节点，并在二者之间传递消息。两个对等节点以为自己在直接对话，实际上它们之间的通信已经被攻击者控制了。MITM 攻击也有主动和被动之分，被动 MITM 攻击者只观察网络的状态，主动攻击者会操控网络流量。

在比特币协议中，节点之间发送的消息没有经过加密，仅以纯本文形式发送，这就为攻击者提供了攻击向量。网络服务提供商（ISP）和 WiFi 提供商之流无需运行对等节点与你连接，即可读取你的所有入站和出站连接。从理论上来说，他们可以[拦截甚至阻止](https://arxiv.org/pdf/1605.07524v2.pdf)某些数据的传输，如，与受制裁实体之间的交易往来。

由于比特币不实行消息加密，任意一个国家的网络服务提供商都可以作为中间方来审查比特币流量，查看其包含的数据，然后进行拦截。他们有可能攻击矿工，推迟区块验证。又或者，像 [PRISM](https://en.wikipedia.org/wiki/PRISM_(surveillance_program)) 这样的监视程序可能会通过 MITM 攻击观察所有比特币流动情况，并在发现不被允许的交易时进行拦截或阻止。各洲或各国甚至可以在 P2P 网络上发送协同攻 击，将比特币网络四分五裂，这就是“分割攻击（partitioning attack）”。

当前的实现对比特币的隐私性来说，最关键的一点是：即使 MITM 攻击真的发生了，被攻击的对等节点也无法确认。

但是，为什么比特币社区不采用 [VPN 或 Tor](https://bitcoinmagazine.com/articles/bitcoin-is-not-anonymous-and-tor-users-are-forgetting-this) 之类的工具混淆或加密比特币节点流量？Tor 是一个加密的洋葱路由网络，会隐藏交易的端点，因此从理论上来说，互联网服务提供商无法以此追踪交易活动。但是，使用 Tor 加密的 P2P 服务也有缺点，主要是因为将 Tor 整合到除 HTTP(S) 以外的层上的相关研究不足，存在[理论上可能的攻击威胁](https://arxiv.org/pdf/1410.6079.pdf)，以及一些可能会引入[攻击向量](https://lists.linuxfoundation.org/pipermail/bitcoin-dev/2019-November/017453.html)的 Bitcoin Core 软件依赖性问题。

## 比特币 P2P 层的潜在解决方案

为了解决这一问题，Schnelli 提出了一系列 BIP。BIP 151 提出如何对节点之间的流量进行加密，BIP 150 则阐述了一种节点可选的、基于椭圆曲线数字签名算法（ECDSA）公私钥密码学的身份验证机制供。

如果你对上述 BIP 很感兴趣，建议先阅读 Aaron van Wirdum 关于 [BIP 151 的文章](https://bitcoinmagazine.com/articles/bip-the-end-to-end-encryption-bitcoin-never-had-but-soon-will-1465401187)，因为 BIP 151 率先针对 P2P 层隐私性不足问题提出了解决方案。自 BIP 151 发布以来，已经有团队开始将该解决方案整合至各个比特币客户端实现，Schnelli 又进一步提出了新的升级版解决方案 [BIP 324](https://gist.github.com/jonasschnelli/c530ea8421b8d0e80c51486325587c52)。

BIP 324 旨在让比特币节点能够判断自己是否遭受 MITM 攻击。虽然攻击者依然能够假装成节点 B 去连接节点 A，并假装成节点 A 去连接节点 B，但是真正的节点 A 和 B 可以看到它们的会话 ID 不同，并且有 MITM 攻击者正在拦截它们的通信。虽然这些节点可能想要采用额外的身份验证机制，但是这超出了 BIP 324 的范围。

正如[ BIP 324 的摘要](https://gist.github.com/jonasschnelli/c530ea8421b8d0e80c51486325587c52)所言，“在现行的非加密型消息传输下，BGP 劫持、区块中继攻击和消息篡改不仅成本很低，还可以瞒天过海（因为受害者察觉不到中间人攻击）。引入伺机加密（opportunistic encryption）会极大提高攻击者被发现的风险。节点运营者可以比对加密会话 ID 或使用其它身份认证机制来识别攻击。”

最终，中间人攻击者还是能够读取比特币区块链上的未加密数据，因为比特币区块链是公开且去中心化的。因此，BIP 324 实际上最有助于防范非对等节点类攻击者，例如，能够过滤并拦截交易的网络服务提供商和开放 WiFi 提供商。当然了，PRISM 能够通过成为比特币节点来监听比特币节点间的流量。对于潜在攻击者来说，监听未加密流量要简单得多：如果中间人攻击有可能被发现，被动区块链观察者不得不权衡监听 P2P 消息和被抓住的利弊。

尽管如此，BIP 324 只是增强比特币 P2P 层抵御恶意中间人攻击的基石。它或许会在开发工作中发挥关键作用，确定中间人攻击是否对比特币构成了真正的威胁。但是，如果没有 BIP 324 中提到的工具，我们很难收集到这方面的数据。

BIP 324 聚焦于提供防范被动中间人攻击的工具，与 BIP 150 结合能够防范一些主动中间人攻击。

## 握手

BIP 324 中提到的第一个操作是 “握手”，能够为 P2P 层上的节点建立进一步通信的协议。

如果两个节点从未通过发送消息的方式建立通信，一方可将自己的公钥（从临时的椭圆曲线 secp256k1 密码学函数中衍生而来）发送给对方来发起握手。顾名思义（“临时”），每次握手成功后内存（RAM）中的密钥都会被清除。因此，攻击者无法拦截这些密钥或破译与之相关的历史消息传输。该攻击向量需要访问受害者的内存，因此在有了 P2P 加密和身份验证的情况下不足为虑。

共享秘密值对于建立端到端的加密通信来说至关重要。只有获得了一方的私钥和另一方的公钥，攻击者才能计算出共享秘密值。虽然获取公钥对攻击者来说轻而易举，但是从设计上来说，私钥就不该被传递。因此，攻击者无法获得私钥。

握手的最后步骤是推导出对称加密密钥（实际用来加密消息的秘密值），并计算会话 ID。

## 加密

接下来，这两个节点可以互相发送消息，而无需担心消息内容被第三方窥视。

那么，消息究竟是如何加密的？和 BIP 151 一样，BIP 324 吸取了密码学原语 ChaCha20 和 Poly1305 的精华。加密并不只有优点。通常情况下，加密会增加消息的大小和计算难度，从而降低通信速度。BIP 324 提议的新型消息结构却能让加密消息变得更小更易计算，这全都得益于选择了上述密码学原语。相比之下，未加密的 Bitcoin Core 客户端目前使用的是已发送消息的双 SHA256 哈希（一种密码学标准）校验和（只取 4 个字节），是中本聪的原始实现遗留下来的。

BIP 324 只是增强比特币的隐私性和可互换性的基石之一。该提案对比特币的共识规则没有任何影响，甚至预设了选择性加入。随着 Bitcoin Core 升级，有些节点可能无法返回握手应答。简而言之，BIP 324 是向后兼容的，虽然这可能会削弱其防范中间人攻击的能力。

等到 BIP 324（以及 BIP 150）在 Bitcoin Core 上实现后，中间人攻击有望减少，至少我们有了一个能够比对会话 ID 并识别攻击的工具。此外，值得一提的是，虽然 BIP 324 没有提供在加密初始化（也就是所谓的 “初次使用的信任假设”）时避免中间人攻击的方案，但是 BIP 150 提供了。

感谢 Schnelli 对本文提出的建设性意见。本文还参考了以下资料：

1. [https://youtu.be/DKOG0BQMmmg?t=3h5m3s](https://www.youtube.com/watch?v=DKOG0BQMmmg&feature=youtu.be&t=3h5m3s)
2. https://lists.linuxfoundation.org/pipermail/bitcoin-dev/2019-March/016806.html
3. https://gist.github.com/jonasschnelli/c530ea8421b8d0e80c51486325587c52
4. https://github.com/bitcoin/bips/blob/master/bip-0151.mediawiki
5. https://bitcoinmagazine.com/articles/bip-the-end-to-end-encryption-bitcoin-never-had-but-soon-will-1465401187
6. https://github.com/bitcoinbook/bitcoinbook/blob/develop/ch08.asciidoc
7. https://lists.linuxfoundation.org/pipermail/bitcoin-dev/2018-September/016355.html
8. https://diyhpl.us/wiki/transcripts/sf-bitcoin-meetup/2017-09-04-jonas-schenlli-bip150-bip151/
9. https://bitcoinops.org/en/newsletters/2018/08/28/
10. https://github.com/bitcoin/bitcoin/pull/14032
11. https://gist.github.com/jonasschnelli/c530ea8421b8d0e80c51486325587c52

（完）