---
title: 'Swaproot：更便宜、更隐私的链上入账体验'
author: 'ACINQ'
date: '2024/03/14 18:29:59'
cover: ''
excerpt: '好钢用在刀刃上'
categories:
- 闪电网络
tags:
- 产品
- 描述符
- Taproot
---


> *作者：ACINQ*
> 
> *来源：<https://acinq.co/blog/phoenix-swaproot>*



**摘要**：在链上向 Phoenix 钱包存入资金现在变得更便宜（\*），也更隐私，这都得益于过去几年添加到比特币和闪电网络上的强大新功能的组合。

（*）在 swap 交易只有一个输入时便宜了 16%，有两个输入时便宜了 23%，而在三个输入时便宜了 27%。

去年，我们为 Phoenix 钱包软件发布了一个[重大升级](https://acinq.co/blog/phoenix-splicing-update)（[中文译本](https://www.btcstudy.org/2023/07/12/phoenix-splicing-update/)）：用户可以只使用一条通道，通道的容量可以按需扩大和缩小。

在那次升级中，一项关键的特性就是免信任的、即时的 “swap-in”：当资金被发送到你的钱包的链上地址（swap-in 地址）时，这些资金会通过 swap-in 交易 “拼接” 进入你已有的闪电通道。

但那一套 swap-in 协议还不能尽如人意：

- 显示在 Phoenix 钱包界面中的 swap-in 地址是长期不变的，这会带来隐私问题；
- 相关的 swap-in 交易有明确的特征，这使它很容易在链上跟踪，这也是一个隐私问题。

使用 Taproot、MuSig2 以及描述符，我们设计并实现了一种新的 swap-in 协议：swap-in 交易现在变得更加便宜，也更难跟踪，而且 Phoenix 钱包会在每次你想要链上收款时为你生成一个新的 swap-in 地址。

## 什么是 swap-in 交易？

一笔 `swap-in` 交易就是一笔链上交易，可以用来为一条闪电通道增加资金。Phoenix 使用了一套基于 “[swap-in potentiam](https://lists.linuxfoundation.org/pipermail/lightning-dev/2023-January/003810.html)”（[中文译本](https://www.btcstudy.org/2023/03/06/swap-in-potentiam-moving-onchain-funds-instantly-to-lightning/)）的免信任的、即时的 swap-in 协议。

这套协议跟 “零确认”的理念是兼容的，而 “零确认” 是 Phoenix 钱包使用体验的一个关键：在 swap-in 交易还在等待链上确认时，通道依然是可用的；一旦交易获得确认， Phoenix 钱包就会触发零确认的通道拼接（默认拼入通道的资金已经可用）。

之前，我们使用的是一种 *pay-to-script* 构造，脚本是 `用户公钥 + 服务商公钥 OR 用户公钥 + 时延`。这里，“用户” 指的是 Phoenix 钱包的一个用户，而 “服务商” 指的是 ACINQ 闪电节点。

有两种办法可以花费这个脚本：

- 普通使用场景：用户和服务商一致同意，将其中资金 “拼接进入” 一条新的或者已有的闪电通道。
- 退款使用场景：其中的资金一直没有动用，在一段时间之后，用户可以独自花费它（这也是如果 ACINQ 跑路的话，用户取回资金的办法）。

但这种设计有一些缺点：

- *pay-to-script* 构造比较昂贵，而且这个代价不是在创建 资金/脚本 的时候支付的，而是在花费 资金/脚本 的时候支付的，因为花费交易必须把完整的脚本都公布出来。
- 缺乏隐私性：*pay-to-script* 构造与常规的 *pay-to-public-key* 构造不同，特征比较明显，可以在链上跟踪。在我们这个案例中，这种脚本是非常鲜明的，包含了这种脚本的交易有极大概率是 Phoenix swap-in 交易。
- 难以建立一种通用的钱包复原流程。这就是为什么 Phoenix 要使用静态的 swap-in 地址。这也带来了隐私性问题。

## 什么是 “Taproot”？为什么能帮上忙？

“Taproot”（详见 [BIP 340](https://github.com/bitcoin/bips/blob/master/bip-0340.mediawiki) 和 [BIP 341](https://github.com/bitcoin/bips/blob/master/bip-0341.mediawiki)）是比特币的一个重大升级，为比特币协议带来了许多提升，包括：

- Schnorr 签名，比 ECDSA 更容易组合；
- 一种用于 *pay-to-script* 交易的新设计，你不再需要披露完整的脚本（而只需披露一部分）；
- 这种能力，在有些时候，可以让 *pay-to-script* 交易跟 *pay-to-public-key* 交易无法区分；

最后一项对我们的新的 swap-in 协议非常关键。Taproot 引入了 `key-path spending`（使用公钥来花费）和 `script-path spending`（使用脚本来花费）的概念。

在以往的比特币交易中，你只能在 *pay-to-script* 和 *pay-to-public-key* 之间选择一种，但有了 Taproot，你可以两者都要。你可以实现 `pay-to-public-key OR pay-to-script` 这样的协议，这样，当你在使用 pay-to-public-key 条件时，你的花费交易将跟其它 pay-to-public-key 构造的花费交易没有区别。

所以，回到我们的 swap-in 脚本：`用户公钥 + 服务商公钥 OR 用户公钥 + 时延`。为了在合作情形中使用 `key-path spending`，我们需要把 `用户公钥 + 服务商公钥` 换成一把公钥。这是怎么做到的呢？

## 什么是 “MuSig2”，它又能帮上什么忙？

有了 Schnorr 签名，加总公钥和签名就变得非常简单。事实上，如果你用 N 个私钥对同一条消息生成了 N 条签名，你可以把这 N 条签名全部加起来（成为 “聚合签名”），然后把对应的 N 个公钥全部加起来（成为 “聚合公钥”），这个聚合签名就是这个聚合公钥的有效签名。

非常非常简单 …… 而且根本不安全！

事实证明，因为加总非常简单，所以在你使用公钥 `P` 的时候，攻击者可以使用 `-P`，把你的公钥 “取消掉”。

因此，我们需要 “[MuSig2](https://github.com/bitcoin/bips/blob/master/bip-0327.mediawiki)”，这是一种用来聚合签名和公钥的算法，可以证明是安全的，而且已经在生产环境中就绪了。

所以，有了 MuSig2，我们可以真的把用户公钥和服务商公钥聚合成一个公钥，然后用在 `key-path` 花费中，然后我们的脚本就变成了：`用户-服务商 聚合公钥 OR 用户公钥 + 时延 `：

![swapin-script-description](../images/swaproot-cheaper-and-more-private-on-chain-desposits-on-Phoenix/swapin-script-description.png)

在合作情形中，使用 swap-in 资金的通道拼入交易会变得更加便宜，而且跟其它的 *pay-to-taproot-address* 交易没什么区别。很棒！

但 swap-in 地址能不能换呢？如何既能轮换地址，又能提供一种通用的资金复原流程、保证可以扫描所有可能的 swap-in 地址？

## “描述符” 是什么，也能帮上忙是吧？

“[描述符](https://github.com/bitcoin/bitcoin/blob/master/doc/descriptors.md)” 是一种简单的语言，可以用来描述标准钱包的范式，包括 BIP32 密钥生成的模式。

描述符可以使用 “[miniscript](https://bitcoin.sipa.be/miniscript/)” 来描述大部分标准的脚本范式。Miniscript 支持 Taproot，但（还）不支持 MuSig2：它可以显式地说明 key-spend 公钥以及 script-path 脚本（包括地址的生成）。

为了让我们的 swap-in 协议与 miniscript 描述符兼容，我们只需要为合作情形使用一个固定的用户公钥（\*），而在退款分支中可以使用不同的退款公钥（可以使用 BIP32 方案），从而：

- 为每一个新的退款密钥生成一个不同的 swap-in 地址
- 用在通道拼接交易中的 swap-in 输出跟普通的 P2TR 交易依然是不可分辨的
- 我们可以使用一条紧凑的、说明了密钥轮换的描述符，来描述复原钱包

这就是 swap-in 复原描述符的样子：

```
tr(
  // 使用固定的 key-path 花费密钥
  1fc559d9c96c5953895d3150e64ebf3dd696a0b0...48ff6251d7e60d1,
  // 下面则是 secipt-path 花费脚本
  and_v(
    // the xprv with the derivation path
    v:pk(xprvA1EfxcCy5HJnYBfPmwi9iXAyCktUSN...tvYsWqFTu29/...),
    // CLTC timeout
    older(2590)
  )
// checksum
)#sv8ug44m
```

（*）每一个 Phoenix 钱包都有一个唯一的用户公钥以及一个唯一的服务商公钥（两个都是从你的 12 词种子词中推导出来的）

## 结论

我们的 swap-in 协议站在了巨人的肩膀上：

- 已经合并进入闪电网络规范的 “[双向注资](https://github.com/lightning/bolts/pull/851)” 协议以及交互式交易构造协议；
- Taproot 升级，让比特币脚本更加强大，也更加隐私；
- MuSig2，启用了公钥聚合以及签名聚合；
- 描述符和 miniscript 上的工作，以及添加到 Bitcoin Core 26 版本的大量支持。

所有这些特性和协议乍看起来都暗淡无光，可能也很难看出它们对终端用户有什么好处。但现在，清楚起来了：它们是开发更好、更便宜、更隐私也更易用的协议的工具。这正是 Phoenix 的使命！

（完）