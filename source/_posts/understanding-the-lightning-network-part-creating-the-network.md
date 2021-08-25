---
title: '理解闪电网络，Part-2：构建网络'
author: 'Aaron Van Wirdum'
date: '2020/08/24 10:36:25'
title_image: ''
excerpt: 'Alice 想要给一个第三方 Carol 支付 1 btc'
categories:
- 闪电网络
tages:
- [闪电网络]
---

*作者：Aaron Van Wirdum*

*来源：<https://bitcoinmagazine.com/technical/understanding-the-lightning-network-part-creating-the-network-1465326903>*

*译者：闵敏 & 阿剑（hongji@ethfans.org）*


![](..\images\understanding-the-lightning-network-part-creating-the-network\9dce5612c6aa4440a3905ded0d6b89c5.png)

## 网络

在上一篇文章中，Alice 和 Bob 建立了一个双向的支付通道。现在，Alice 想要给一个第三方 Carol 支付 1 btc。

一般来说，Alice 和 Carol 需要在彼此之间开设一个支付通道。但实际上并不需要。因为 Bob 和 Carol 之间已经有了一个通道，所以 Alice 可以通过 Bob 给 Carol 支付。

具体来说，Alice 可以给 Bob 支付 1 btc，而 Bob 再支付 1 btc 给 Carol。

但是，Alice 实际上并不信任 Bob，或者 Carol 并不信任 Bob。她担心把钱给 Bob 之后，Bob 不会给 Carol；又或者，他把钱给了 Carol，但 Carol 谎称自己压根没见到钱，而 Alice 也不知道该找哪个来追责。

因此，Alice 希望能保证，仅当 Bob 给了 Carol 1 btc，自己才需要给 Bob 支付 1 btc。

当 Alice 要给 Carol 支付 1 btc 时，她让 Carol 先生成一个秘密值（一个随机的数字串）并把对应的哈希值发给她。Alice 也告诉 Carol 可以用这个秘密值跟 Bob 交换 1 btc。

与此同时，Alice 把从 Carol 处得到的哈希值发给 Bob，并告诉 Bob 如果 Bob 能提供对应于这个哈希值的原始值，她就会给 Bob  1 btc（这个原始值当然只有 Carol 拥有）。

所以 Bob 找到 Carol，用 1 btc 换来了 Carol 的初始值。

然后，Bob 找回 Alice，提供这个初始值。Alice 因此知道了 Bob 一定给过钱了，也就是 Carol 肯定已经收到了 1 btc，于是就把钱给了 Bob。

皆大欢喜。

几乎，啊，几乎是皆大欢喜。

在这种 “过家家” 的情形下，中间人 Bob 还是需要信任 Alice 和 Carol。Bob 必须相信 Carol 给他的是一个真正有用的值（不然钱都给了就拿不回来了），而且要相信 Alice 真的会给他  1 btc，假如他能提供对应于哈希值的原像的话。

这时候，我们就需要哈希时间锁合约（HTLC）啦！

## 哈希时间锁合约

哈希时间锁可以让 Alice 和 Bob 用秘密值来交换 btc（当然 Bob 和 Carol 也需要这个，但我们先按下不提）。

为了使用哈希时间锁，Alice 要将 1 btc 发送至一个新的多签地址，而非直接发送给 Bob。这个地址中锁定的 btc 可以通过两种方式解锁。

第一种方式是 Bob 将自己的签名和秘密值一起发送至该地址。

第二种方式是 Alice 将自己的签名发送至该地址。但是，这个方式存在 [CLTV 时间锁](https://bitcoinmagazine.com/articles/checklocktimeverify-or-how-a-time-lock-patch-will-boost-bitcoin-s-potential-1446658530)限制：Alice 必须等待一段时间（例如两周）才能签署并广播交易取走这个 btc。

也就是说，Bob 有两周时间来创建一个包含签名和秘密值的交易，并广播该交易，将多签地址上的 btc 发送给自己。这样一来，这笔交易就有了保证。只要 Bob 能提供秘密值，他就能取走 Alice 的 btc：在比特币网络公开广播该交易可以让 Alice 看到它。

如果 Bob 没有在规定时限内提供秘密值，Alice 就可以取回她的 btc。就这么简单。

再说回网络，因为这是哈希时间锁合约真正发挥作用的地方。

如上文所述，不仅 Alice 和 Bob 之间有哈希时间锁合约，Bob 和 Carol 之间也有。因此，如果 Carol 向 Bob 索要 btc，Bob 也可以从 Carol 那里取得秘密值。这些在区块链上都是可见的。

因此，如果发生这种情况，Bob 也一定可以从 Alice 那里拿到 1 btc。Bob 可以将从 Carol 那里拿到的秘密值在链上公开，发送至他与 Alice 的哈希时间锁合约，然后取走多签地址上的 1 btc。这两个状态通道有效地关联了起来。

最后要强调的一点是，Bob 必须在有效期内从 Carol 那里拿到秘密值，否则 Alice 就有可能取回多签地址上的 1 btc。如果等 Alice 取回 1 btc 之后 Bob 才从 Carol 那里拿到了秘密值，Bob 就会被卡在中间进退两难。因此，Bob 和 Carol 的哈希时间锁合约必须比 Alice 和 Bob 的先到期（例如，前者的时限可以设成 10 天，而非两周）。这就是为什么哈希时间锁合约需要 CheckLockTimeVerify（绝对时间锁）而非 CheckSequenceVerify（相对时间锁）。

最后还有一个问题需要解决：要保证闪电网络的可用性，所有这些必须在链下完成。具体是如何实现的将在本系列第三篇文章中揭晓。


（完）

