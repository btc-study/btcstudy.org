---
title: '点支付合约简介，Part-4：签名销售'
author: 'Nadav Kohen'
date: '2021/12/17 15:09:48'
cover: '../images/payment-points-part-4-selling-signatures/200X675.jpg'
excerpt: '免信任的签名销售'
categories:
- 闪电网络
tags:
- 闪电网络
- PTLC
---


> *作者：Nadav Kohen*
>
> *来源：<https://suredbits.com/payment-points-part-4-selling-signatures/>*
>
> *[前篇中文译本](https://www.btcstudy.org/2021/12/16/payment-points-part-3-escrow-contracts/)*



![Lightning Data](../images/payment-points-part-4-selling-signatures/200X675.jpg)

本系列文章讨论了点支付合约给闪电网络带来的好处。我们研究了它如何保护我们免受虫洞攻击和[支付关联曝光](https://suredbits.com/payment-points-part-1/)、它如何支持 [“无滞碍” 的支付](https://suredbits.com/payment-points-part-2-stuckless-payments/)，以及如何在闪电网络上实现[托管合约](https://suredbits.com/payment-points-part-3-escrow-contracts/)。在本文中，我们会讨论一个我个人最喜欢的新功能：免信任的签名销售！

<details><summary><strong>点支付合约系列</strong></summary>
<a href="https://suredbits.com/payment-points-part-1/">Payment Points Part 1: Replacing HTLCs</a><br>
<a href="https://suredbits.com/payment-points-part-2-stuckless-payments/">Payment Points Part 2: “Stuckless” Payments</a><br>
<a href="https://suredbits.com/payment-points-part-3-escrow-contracts/">Payment Points Part 3: Escrow Contracts</a><br>
<a href="https://suredbits.com/payment-points-part-4-selling-signatures/">Payment Points Part 4: Selling Signatures</a>
</details><br>

我们[之前](https://suredbits.com/paid-apis/)已经提到，在闪电网络上，只需对卖方最基本的信任即可购买数据，即保证数据送达和支付是同步完成的。但不管怎么说，它还是需要信任卖方，因为虽然用户需要且只需要 支付就可以收到数据，但没法提前验证自己收到的就是自己想要的数据。这对于许多应用（比如给信息断言机（oracle）支付）是可以接受的。但如何能在更有敌意的环境下购买数据呢？

这就是支付点合约发挥用处的地方了。因为椭圆曲线上的一个点揭示了其标量的一些信息，我们就能够作一些验证。这在哈希函数上是不可能的 —— 它只会摧毁所有信息。

你可能还记得，公钥 P 使用 nonce 值 R 对消息 m 的每一个 Schnorr 签名 s，都满足  ` s * G = R + m * P`。也就是说，即使我们完全不知道 s 长什么样，s * G（也即与 s 相关的支付点）也能使用公开信息（R、P 和 m）计算出来。因此，使用 s * G 作为支付点可以保证 s 成为支付证明（Proof of Payment，PoP），会随着支付的完成一起送达给购买者。

这个方案消除了一切对卖方的信任，因为 TA 必须揭示买方指定的 s 才能获得支付给自己的资金。如果卖方不公开对买方指定消息 m 的有效签名，卖方是不可能获得支付的。

Jonas Nick [深入讨论](https://youtu.be/XORDEX-RrAI?t=26552)了这种签名销售如何用来实现 ecash/盲签名侧链，以及小组匿名的证书。他也提到，这种方案可以用来售卖谨慎日志合约（DLC）的签名。

我把这最后一个想法推得远一点。DLC 的签名不仅可以买卖，甚至可以只在一个方向上购买，从而实现谨慎日志期权合约（Discreet Log Option Contracts，DLOCs）。所谓期权合约，是一方（比如 Alice）从另一方（比如 Bob）购买执行一个合约的权利，但无执行的义务（例如，在明天以当前价格两倍的价格购买比特币，假使比特币价格真的翻倍有余，那她会愿意执行合约）。

如果闪电网络可以迁移到支付点模式，Alice 就可以跟 Bob 缔结 DLOC，然后她可以通过购买 Bob 的签名来执行花费充值交易的交易。如此一来，只有她能执行这些交易（因为 Bob 无法生成 Alice 的签名），或者她可以选择不执行，这样超时之后，Alice 和 Bob 就能拿回自己的资金（除了 Alice 支付给 Bob 的期权费）。因此，使用支付点合约的闪电网络将支持点对点的期权合约。

我们的支付点合约系列到这里的结束了。我们讲解了闪电网络如何因为使用[哈希支付合约](https://suredbits.com/payment-points-part-1/)而受困于支付关联暴露和虫洞攻击。我们展示了支付点合约如何解决这些问题，还展示了基于支付点合约的闪电网络如何支持 “[无滞支付](https://suredbits.com/payment-points-part-2-stuckless-payments/)”、[托管合约](https://suredbits.com/payment-points-part-3-escrow-contracts/)和签名销售。虽然支付点合约在当前的 Lightning v1.1 上还未实现，我有信心，我们会在 taproot 相关的 BIP 在 bitcoin-core 软件中实现以后，迁移到这种客观上更优的路由解决方案上。

（完）