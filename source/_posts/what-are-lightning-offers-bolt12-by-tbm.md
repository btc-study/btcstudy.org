---
title: '什么是 “闪电网络 offer（BOLT12）”？'
author: 'Che Kohler'
date: '2023/02/24 15:27:01'
cover: ''
excerpt: 'offer 是一种 “元发票”'
categories:
- 闪电网络
tags:
- BOLT12
---


> *作者：Che Kohler*
> 
> *来源：<https://thebitcoinmanual.com/articles/lightning-offers-bolt12/>*



如果你熟悉比特币，你可能知道怎么创建一个用来接收支付的地址（以及相应的 QR 码）。而且这样的地址也是可以重复使用的，虽然[重复使用相同的地址不是一种值得推荐的习惯](https://thebitcoinmanual.com/articles/why-bitcoiners-should-always-generate-a-new-recieve-address/)，但这是一种人们习惯的用户体验，也有特定的用途。

许多人和机构都会在自己的网站或者实体物件上使用一个[公开的地址](https://thebitcoinmanual.com/security/keys-seeds/)，作为管理支付和接收捐赠的手段。这是一种简单、便利的手段，只是不那么隐私，因为所有人都可以看到这个地址接收的所有交易。

当我们转去使用闪电网络这样的二层协议时，这种用户体验就没有了：没有办法产生可靠的静态 QR 码或者公开的地址。这件事一直困扰着一些闪电网络用户。虽然不是绝对没有办法，比如你可以使用 [Lightning Email Address](https://thebitcoinmanual.com/articles/lightning-email-address/)，但并不是所有的钱包都支持这项服务。

如果 BOLT12 能在所有闪电网络客户端上实现，那么情况可能会完全改变。

## 什么是 BOLT12？

BOLT12（闪电网络技术基础 12）是一种新出现的闪电网络技术规范提议，它提出了 “offer”（一种类型的 “元发票”）的概念，是由 c-lightning 客户端的开发者 Rusty Russell 提出的。

BOLT12 offer 尝试在不使用 web 服务端的前提下实现 [LNURL](https://thebitcoinmanual.com/articles/what-is-ln-url-and-how-does-it-work/) 提供的部分功能。BOLT12 offer 可以编码触达某个节点、请求闪电网络发票所需的数据，要么是节点 id，要么是一条[盲化路径](https://github.com/lightning/bolts/blob/route-blinding/proposals/route-blinding.md)（一条洋葱路由中的最后几条，是预先计算并且加密过的）（触达使用洋葱消息的节点）。

它还可以编码支付的最小数额、用来支付的货币类型、支付超时的时间以及商品数目的 最大值/最小值（单次支付可能会购买多种东西）。

这都是为了从发行 offer 的节点处获取一张实际的闪电网络发票所必需的信息。想要给发票支付的人可以通过洋葱消息来支付，这也是 BOLT12 的核心特性之一。

## BOLT12 的好处

BOLT12 让[闪电节点](https://thebitcoinmanual.com/behind-btc/nodes/lightning-node/)可以互相建立直接的、端到端加密的连接，而且这种连接跟闪电通道无关。就像闪电支付一样，这样的连接可以用来发送洋葱消息。在获得一个 offer 之后，支付方可以使用其中编码的信息，向发行 offer 的闪电节点发送一条 `invoice_request` （请求发票）消息。而发行 offer 的一方则可返回一条真正的发票。

BOLT12 还支持为每个用户生成唯一的 offer，并且允许 offer 的接收者向 offer 的创建者请求一笔支付，就类似于 LNURL 的取款请求功能。BOLT12 发票承诺了唯一的支付者密钥 —— 这可以用来证明你是实际上支付发票的人，从而触发退款。

同样的功能可以结合取款 offer，保证只有对的人才能成功获得由 offer 创建者支付的一个发票，而不是任何能够获得 offer 拷贝的人都可以获得支付。Offer 的这两种用法实际上满足了跟 LNURL 的发票请求和取款请求一样的功能，而且不需要运行一个 web 服务端。

## BOLT12 的工作原理

一个 BOLT12 “offer” 编码了足够多的信息，让你可以 *通过闪电网络* 触达 offer 的发行方并获得一个真正的闪电网络发票；发送支付的时候也是如此，只不过不需要用到 web 服务端。

然后，你的钱包可以给真正的发票支付（或者，如果收到的是 “发送发票（请支付）”offer，你的钱包会生成一个发票，让 offer 的发行方来支付；ATM 机和退款就会用到这个功能）。这意味着，offer 可以比发票小得多，而且可以包含更多信息（货币类型、商家名称、数量限制，触达商家的盲化路径）。

## 提升匿名性

在需要保护收款方匿名性的时候，必须使用一种 URL 方案。

一个例子是使用一个指向一个 Tor 隐藏服务的 URL。为了不向支付方揭开自己的节点 id，接收方可以发送一个发票给支付方，在发票里面只提供部分洋葱路由作为目的地（而不是提供节点 id）。

这个残缺的洋葱路由以接收方为终点，但可以从别的节点开始。支付方要做的就是在这个路径上添加额外的步数，从而补全路径，让这个路径以自己（支付者）为开头。注意，这会让发票大很多；所以在 BOLT11 中是做不到的。

## 让闪电网络退款变得更加容易

BOLT12 也支持便利和可以做到匿名的退款，因为通信通道可以保持开启，然后支付方可以通过同一条信道发送退款发票，这对商家来说会便宜和容易很多。使用 [HODL invoices](https://thebitcoinmanual.com/articles/hodl-invoice/) 以及处理退款的能力，而且成本仅为传统金融的几分之一，可能会变成商家采用闪电网络的重大推动力。

## 了解更多

想要更好地了解你可以如何使用 BOLT12，请看这个关于 LNURL 和 BOLT12 的讨论视频：<https://youtu.be/Vk7Eyi9SHj0> 。

## 参考文献

1. https://bolt12.org/
2. [BOLT 12 & LNURL](https://bitcoinmagazine.com/technical/bolt12-lnurl-and-bitcoin-lightning)（[中文译本](https://www.btcstudy.org/2022/07/04/bolt12-lnurl-and-bitcoin-lightning/)）

（完）