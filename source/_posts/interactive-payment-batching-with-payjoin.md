---
title: '使用 payjoin 实现交互式的支付批处理'
author: 'Dan Gould'
date: '2023/06/20 17:07:21'
cover: ''
excerpt: '一个简单的 HTTP 交互能够带我们走多远'
tags:
- 开发
---


> *作者：Dan Gould*
> 
> *来源：<https://lists.linuxfoundation.org/pipermail/bitcoin-dev/2023-May/021653.html>*



## 隐私性之外的 Payjoin

高手续费率的比特币总是会[吸引](https://twitter.com/BTCsessions/status/1655733065426296832)人们[搜索](https://twitter.com/w_s_bitcoin/status/1655885695762808832)更高效使用区块空间的方法。区块链是一种速度缓慢的数据库，而批处理（batching）是最古老的优化数据库的方法之一。闪电通道是基于间歇式结算（intermittent settlement）的交互式支付批处理技术。Payjoin 是交互式的结算批处理技术。商家跟顾客的 payjoin 是 payjoin 正式规范中的内容。并不意外的是，商家-顾客 的框架跟闪电通道这样的支付批处理框架相比，进展缓慢。闪电通道自始至终是用于扩容的批处理技术。 本文罗列了 payjoin 如何放到批处理的结算基础设施中，以及它可以如何为下一波区块空间稀缺的浪潮做好准备。

“Payjoin” 这个属于用来指称一种在网络上的对等节点之间构造交易的交互式方法，也就是 “Pay-to-Endpoint（P2EP）”；还指称一种模棱两可的交易结构，一般来说有多个输入和两个输出，我称为 “严格 payjoin”。严格 payjoin  看起来就像任何钱包都能实现的普通交易，但实际上，它的输入来自不止一个人。这就打破了所有交易输入都来自同一个人的假设，因此打破了区块链监视的基础，以及中本聪白皮书中唯一 “无法解决” 的隐私问题。在通过采用 payjoin 来提升比特币隐私性的过程中，我发现了一些使用 payjoin 的办法，可以在个人和企业环境中极大地减少手续费开支和区块空间使用。其中一些新技术保持了交易的隐私性，不然的话，就应理解成是明确可跟踪的。为了简洁，下面的例子大部分都忽略了挖矿手续费。

## 批处理之前

### 原生的支付方式

payjoin 如果没有了 joi， 就只是 payn。（不要扣我的钱！）

```
A's input0:    2 btc
A's input1:    3 btc
<p style="text-align:center">- - -</p>

B's output0:   4 btc B's address0  
A's output1:   1 btc A's change
# A 提供了两个输入，产生了两个输出，一个是给 B 支付了 4 BTC，剩余的 1 BTC 是自己的找零
```

标准的比特币支付，从 Alice 到 Bob ，就是这样的。注意，只有地址和数量发布到了链上，输入和输出之间没有进一步的关联。没有姓名标签。第三方的分析者会假设所有的输入都来自同一个实体（因为通常是这样的）。他们还会假设 `output0` 是支付，因为没有哪一个输入单独足以支付 4 BTC 。

### 严格 payjoin

Payjoin 推翻了第三方分析的假设，因为它让 Alice 和 Bob 都为交易提供输入。第三方会假设这是一笔原生的支付，但实际上它是一笔 payjoin。不论假设这两个输入来自哪个人 —— Alice 或 Bob —— 都是错的。

```
A's input0:      2 btc
B's input1:     3 btc
<p style="text-align:center">- - -</p>

A's output1:   1 btc A's change
B's output0:   4 btc B's address0
# A 和 B 各贡献了一个输入，并分别产生了一个输出。在这里 A 只支付了 1 BTC 。
```

是 Alice 给 Bob 支付了 1 BTC ，还是 Bob 给 Alice 支付了 2 BTC ？没有人知道。

## 输出替换

Payjoin “[支付输出替换](https://github.com/bitcoin/bips/blob/master/bip-0078.mediawiki#payment-output-substitution)”（`pjos`）让 Bob 这样的支付接收者可以将自己所提议的输出替换为任何等值的输出。BIP 78 `pjos` 在中继通信（relayed communications）中是不安全的，所以被禁用了。BIP 78 接收者必须运行自己的、带有身份验证的服务器来使用 `pjos`。“[无服务器的 payjoin](https://gist.github.com/DanGould/243e418752fff760c9f6b23bba8a32f9)” 保护了中继的 `pjos`。

接下来，我们介绍这种技术（无服务器的 payjoin）如何防止地址复用、将资金重定向到冷存储、转发支付，以及使用批处理节约大量手续费。

### 最小交互数量

我们来制作一些不太像 payjoin 但依然非常有趣的东西。叫做 “Payjoi”。你 get 到了吗？

如果 Bob 的钱包是空的，或者他正在使用一个冷钱包，也依然可用。

设想 Bob 是一位酒保，他在吧台上放着一个 QR 码，内容是 `bitcoin:address0?pj=https://payjoin.bob.cash`.

Alice 会扫描这个二维码，就跟普通的支付一样，但 Bob 的服务端会返回一个 payjoin 交易提议，该交易有一些小小的更改。这样一来他就不会让吧台上的其他人知道小费的数额。

```
A's input0:    2 btc
A's input1:    3 btc
<p style="text-align:center">- - -</p>

B's output0:   4 btc B's address1
A's output1:   1 btc A's change
```

你看，Bob 把 `output0` 的 `address0（0 号地址）` 换成了 `address1`。其他人不知道 `address1` 因为 Bob 是通过 payjoin 提议将它发送到网上的。他们查不到自己一无所知的东西。

### 支付转发

玩笑归玩笑，输出替换是很强大的。当 Bob 计划给供应商 Cloudy 支付时，他可以在下次收取支付时将自己的 `address1` 换成 `C 的地址`。

```
A's input0:    2 btc
A's input1:    3 btc
<p style="text-align:center">- - -</p>

C's output0:   4 btc C's address
A's output1:   1 btc A's change
```

Alice 只能看到一个不一样的地址，而这个 payjoin 提议是由 Bob 的身份发起的，所以两方都同意这笔 payjoin 支付给了 Bob。因为交易是原子性的，所以 Bob 也没有托管发送给 Cloudy 的资金。

Bob 也可以向这笔交易添加输入，使之成为严格的 payjoin。或者，Bob 也可以将资金转发到自己的冷钱包。如果 Bob 的 payjoin 服务器热钱包已经保管了太多的钱，让 Bob 不安的话，这样的功能对 Bob 就是有价值的。甚至 Alice 也只是像往常一样支付手续费。Bob 节约了区块空间、时间、资金和发起单独一笔交易的麻烦。

### 接收端的支付批处理

我们可以让这个过程变得更加复杂，因为它可以给比特币扩容，而且有趣。

设想 Bob 是一个交易所，现在持有来自 Dan 和 Erin 的分别价值 0.6 btc 和 0.4 btc 的低优先级取款交易。当 Alice 发起存入操作时，Bob 可以将一个输出替换成多个输出，从而将入账的金额分散到多个地址。在这里，他不仅替换了地址，而且完整替换掉了输出。

```
A's input0:    2 btc
A's input1:    3 btc
<p style="text-align:center">- - -</p>

B's output0:   0.99 btc B's address0
A's output1:   3 btc A's change
D's output2:   0.4 btc D's address
E's output3:   0.6 btc E's address
```

批处理为 Bob 节约了矿工费，因为 Alice 已经支付了一部分手续费。Bob 可以用自己的输出承担因为交易体积增加而需额外支付的手续费。这里的 `output0` 是 0.99 BTC，这说明他支付了额外的 0.01 BTC 手续费。这里没有展示的是，在前一个例子中，Bob 甚至可以分拆 Cloudy 的输出，从而给 Cloudy 发送一个准确的数额，然后获得剩余的找零。

[之前](https://www.bullbitcoin.com/blog/announcing-batcher-by-bull-bitcoin-open-source-non-custodial-on-chain-wallet-batching-plugin-for-high-volume-bitcoin-enterprise-users) [有](https://blog.bitgo.com/utxo-management-for-enterprise-wallets-5357dad08dd1) [许多人](https://medium.com/@hasufly/an-analysis-of-batching-in-bitcoin-9bdf81a394e0) [探讨了](https://bitcoinops.org/en/payment-batching/) 基于发送者的批处理技术；在这样的批处理交易中，输入被假定属于发起支付者的同一个实体集群。而基于接收者的支付批处理交易，则杀死了这样的线索式分析，为输入少而输出多的支付提供了多种新的解释角度。

### 闪电通道

没错，甚至[闪电通道 payjoin](https://chaincase.app/words/lightning-payjoin) 输出也是可行的。闪电通道是一个 2-of-2 的 P2SH 或者 P2TR 地址。（译者注：应为 P2WSH 或 P2TR 地址。）

```
A's input0:    5 btc
<p style="text-align:center">- - -</p>

B's output0:   2 btc B & his peer's ⚡️ channel
A's output1:   3 btc A's change
```

Bob 的闪电通道输出甚至更好地保护了隐私性，因为它属于两方 —— Bob 和他的通道对手。当 P2TR 通道变成常规配置时，陌生人甚至无法知道 `output0` 是一条闪电通道。新的标准闪电协议允许 payjoin 输出拼接和双向注资，即使没有 BIP 78，也能打破输入所有权同一性假设。

### 混淆及批处理

将所有这些结合在一起，就可以对交易图产生多种模棱两可的解释。使用基本的网络工具，不需要协调员，Alice 和 Bob 都可以给多人支付，将输入和资金合并在一起，而不必担心被审查。

交互，让多种模糊的可能性汇聚在了一起，保护了比特币的内在可互换性。不需要使用不便利的、费用高昂的、预先计划并且耗费时间的混币机制。

**批处理发送者和接收者的交易**

```
A's input0:    2 btc
B's input1:    4 btc
B's input2:    3 btc
<p style="text-align:center">- - -</p>

B's output0:   1.5 btc B's address1
A's output1:   2 btc A's change
B's output2:   0.4 btc B's ⚡️ channel
C's output3:   2.5 btc C's address
E's output4:   1 btc E's address
D's output5:   0.6 btc D's address
F's output6:   1 btc F's address
```

虽然输出的数额并不相等，这些新的 payjoin 结构也提供了大量的模糊性，通过打破最基础的假设挫败今天最常见的线索分析。因为 payjoin 是从 Alice 到 Bob 的内在转移，[CoinJoin sudoku](http://www.coinjoinsudoku.com/advisory/) 的分析也不适用。

甚至 Alice 和 Bob 在彼此眼中也保留了一些隐私性。即使他们知晓对方的输入，他们也无法确定某个输出是否属于对手的钱包，或是已经被替换掉了。

## 现状

Bob 和 Alice 依然知道对手的子交易。当前，Bob 依然需要运行一个服务端。他们都知道哪个输入属于哪个对手方。虽然 P2P 可以做到许多事，恶意的对手方依然可以向分析公司报告对方的输入和输出，从而找出钱包的集群。我知道这些问题需要解决，但我想看看一个简单的 HTTP 交互能够带我们走多远。

**感谢** Hunter Beast、Andrew "Kukks" Camilleri、Ishi、Kexkey、Francis Pouliot 和 Yashraj 阅读本文的草稿。

（完）