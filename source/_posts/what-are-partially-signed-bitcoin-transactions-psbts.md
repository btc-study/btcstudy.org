---
title: '什么是 “部分签名的比特币交易（PSBT）”？'
author: 'River Financial'
date: '2022/08/15 11:18:22'
cover: ''
excerpt: 'PSBT 是一个比特币标准，可以让多方更容易签名同一笔交易'
categories:
- 比特币主网
tags:
- PSBT
---


> *作者：River Financial*
> 
> *来源：<https://river.com/learn/what-are-partially-signed-bitcoin-transactions-psbts/>*



## 什么是 “部分签名的比特币交易（PSBT）”？

PSBT 是一个比特币标准，用来协助未签名交易（unsigned transactions）的传输；该标准可以让多方更容易签名同一笔交易。

PSBT 标准定义了用来传递比特币交易的一种精确格式。这种格式可以携带一笔交易的元数据，让签名者更容易签名和验证这笔交易。这个标准也定义了签名合并和交易终局化的流程，所以多方可以并行地签名同一笔交易，然后将相应的 PSBT 合并起来、形成一笔完整签名的交易。

![Partially Signed Bitcoin Transactions (PSBTs) allow multiple parties to sign a transaction.](../images/what-are-partially-signed-bitcoin-transactions-psbts/psbt.gif)

## PSBT 有什么用处？

PSBT 给比特币社区提供了许多好处，也让此前的复杂协议得到简化，变得更容易验证。

- **互通性**。PSBT 的设计初衷是强化钱包和其它比特币软件的互通性，让交易可以更容易地在钱包和节点间传输。PSBT 在很大程度上已经成功了，它获得了所有主要的钱包供应商和节点软件的支持，也就是已经得到了行业的接受。
- **离线签名**。PSBT 格式提供了有用的元数据，可以协助冷存储设备验证即将被签名的交易相关的地址和金额。这使得从[冷存储](https://river.com/learn/terms/c/cold-storage/)设备发起签名变得更加安全，而且 [观察钱包](https://river.com/learn/terms/w/watch-only-bitcoin-wallet/)构造交易-冷钱包签名-[比特币节点](https://river.com/learn/terms/n/node-bitcoin/)广播交易 的整个过程也变得更加容易。
- **多签名流程**。因为 PSBT 让一个部分签名的比特币交易变得更容易传输和理解，多方（或者说多个设备）签名一笔交易也变得更容易、更安全，因此多签名技术也变得更容易使用。用户友好型多签名钱包将给比特币社区带来进一步的好处，包括更好的隐私性、安全性和私钥丢失抗性。
- **多方交易**。PSBT 对想要签名同一笔交易的协作多方尤为实用。比如，[CoinJoin](https://river.com/learn/terms/c/coinjoin/)、[CoinSwap](https://river.com/learn/terms/c/coinswap/) 和 [PayJoin](https://river.com/learn/terms/p/payjoin-p2ep/) 协议，都要求多方签名同一笔交易。PSBT 格式提供了构造交易、在多个签名者之间传输交易、组装成最终交易的方法。

## PSBT 的工作原理

PSBT 在许多场景下都很有用。举个例子，五位参与者要建构一笔 CoinJoin 交易，他们各自给一位协调员发送一条消息，包含自己希望放入这笔 CoinJoin 中的 [UTXO](https://river.com/learn/terms/u/unspent-transaction-output-utxo/)。每个参与者也都提供接收比特币的地址。

协调员实用所有的 UTXO 作为输入，建构出一笔交易，并创建相应的输出，将相同数量的比特币发到各参与者的接收地址。

下一步，协调员将这笔交易转化成一个部分签名的比特币交易，然后将这个 PSBT 发送给每一位参与者。参与者们各自为自己收到的 PSBT 加入自己的[签名](https://river.com/learn/terms/s/signature-digital-signature-algorithm-dsa/)，然后将签过名的 PSBT 发回给协调员，协调员会将这 5 个 PSBT 合并起来、形成最终的交易。最终，协调员得到了一个完整签名的交易，每个参与者的输入都有相应的签名。

这个过程是完全免信任的：虽然每个成员都依赖于协调员来创建和敲定 PSBT，无论协调员还是参与者，没有人能从其他参与中手上偷取资金。

## 采用 PSBT

PSBT 标准由 BIP174 定义，而且已经得到了行业内的硬件钱包、软件钱包、比特币节点软件（包括 [Bitcoin Core](https://river.com/learn/terms/b/bitcoin-core/)）的广泛采用，但还不是全面采用。

但是，PSBT 标准也有一些缺点，这也是为什么有人正在开发 PSBT v2 标准。具体来说，迭代式地添加输入来构建交易是低效的，而且 PSBT 文件会变得相对比较大。

就当下来看，PSBT 已经极大地强化了比特币软件和硬件之间的互通性，协助了 CoinJoin 和其他合作型交易的运作，也让多签名变得更加易用。

（完）