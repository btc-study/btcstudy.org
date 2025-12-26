---
title: 'Schnorr 签名系列：批量验证'
author: 'Nadav Kohen'
date: '2021/12/06 22:24:41'
cover: '../images/schnorr-applications-batch-verification/g_logo2.png'
excerpt: '可以一次性验证许多签名，并且比一个一个验证它们还要更快'
categories:
- 比特币主网
tags:
- Schnorr-签名
- CISA
mathjax: true
---

> *作者：Nadav Kohen*
>
> *来源：<https://suredbits.com/schnorr-applications-batch-verification/>*
>
> *[前篇中文译本](https://www.btcstudy.org/2021/12/02/schnorr-applications-scriptless-scripts/)*



![img](../images/schnorr-applications-batch-verification/g_logo2.png)

迄今为止，我们已经讨论了[什么是 Schnorr 签名](https://suredbits.com/introduction-to-schnorr-signatures/)（[中文译本](https://www.btcstudy.org/2021/11/20/introduction-to-schnorr-signatures-by-suredbits/)），[为什么它们是安全的](https://suredbits.com/schnorr-security-part-1-schnorr-id-protocol/)（[中文译本](https://www.btcstudy.org/2021/11/22/schnorr-security-part-1-schnorr-id-protocol/)），以及 Schnorr 签名的变种如何实现[隐私和可扩展的多签名方案](https://suredbits.com/schnorr-applications-musig/)（[中文译本](https://www.btcstudy.org/2021/11/29/schnorr-applications-musig/)）、[适配器签名和隐形脚本](https://suredbits.com/schnorr-applications-scriptless-scripts/)（[中文译本](https://www.btcstudy.org/2021/12/02/schnorr-applications-scriptless-scripts/)）。今天我们要来看另一个 Schnorr 签名可以给比特币生态系统带来的重大提升：批量验证！

<details><summary><strong>Schnorr 签名系列</strong></summary>
<a hef="https://suredbits.com/introduction-to-schnorr-signatures/">What are Schnorr Signatures – Introduction</a><br>
<a href="https://suredbits.com/schnorr-security-part-1-schnorr-id-protocol/">Schnorr Signature Security: Part 1 – Schnorr ID Protocol</a><br>
<a href="https://suredbits.com/schnorr-security-part-2-from-id-to-signature/">Schnorr Signature Security: Part 2 – From IDs to Signatures</a><br>
<a href="https://suredbits.com/schnorr-applications-musig/">Schnorr Multi-Signatures – MuSig</a><br>
<a href="https://suredbits.com/schnorr-applications-scriptless-scripts/">Scriptless Scripts – Adaptor Signatures</a><br>
<a href="https://suredbits.com/schnorr-applications-batch-verification/">Batch Verification</a><br>
<a href="https://suredbits.com/schnorr-applications-threshold-signatures/">Schnorr Threshold Sigantures</a><br>
<a href="https://suredbits.com/schnorr-applications-frost/">Flexible Round-Optimized Schnorr Threshold – FROST</a><br>
<a href="https://suredbits.com/schnorr-applications-blind-signatures/">Schnorr Blind Signatures</a><br>
<a href="https://suredbits.com/the-taproot-upgrade/">Taproot Upgrade – Activating Schnorr</a>
</details><br>

如 [BIP 340](https://github.com/bitcoin/bips/blob/master/bip-0340.mediawiki#motivation) 所言，“已被标准化的 ECDSA 签名的具体形式，在批量验证时并不比单独验证更有效率，除非增加额外的见证数据。改变签名方案提供了一个解决这个问题的机会。” 换句话说，在 ECDSA 当前的形式下，批量验证大量的 ECDSA 签名，没有办法比单个单个地验证更快。引入一种新的签名标准（Schnorr 签名），让我们可以启用可称为 “批量验证” 的功能，也即是可以一次性验证许多签名，并且比一个一个验证它们还要更快。

在我们讲解这是怎么做到的之前，我们先来想想批量验证对比特币网络可能有哪些好处。很多时候我们都需要验证许多签名，举个例子，在验证一个新区块的时候，网络中的每一个节点都验证每一笔交易所用的每一个输入的每一个数字签名。而在当前实现的 Schnorr 批量验证程序中，批量验证一个区块中的所有签名，将比单个单个验证每一个签名，快两倍以上。

可能更让人激动的是，在新节点初次下载区块（IBD）期间，它要验证整条区块链的每一个签名；使用批量验证，加速的效果随着需要验证的签名的数量呈对数上升，所以，如果节点需要验证 10 亿个签名，使用批量验证可以得到 4 倍的加速效果！（当然我也要指出，这个在今天可能是不可行的，因为它需要大量的内存空间。）现在比特币区块链上的签名已经有 10 亿量级了，但这种加速效果却与我们无缘，因为它们都是 ECDSA 签名。不过，未来数十年里，包含了 Schnorr 签名的区块在 IBD 时将能从批量验证中收益。

虽然这两个用途似乎已经是批量验证在比特币中最基础、最广泛的应用了，但我还是要提一句：任意组合的 Schnorr 签名都可以批量验证。这就意味着，你可以同时验证支持 BIP-340 的多个区块链（例如，未来的 Liquid 和比特币）。此外，甚至在几十个几百个参与者参与的交互式多方协议中，使用 MuSig 传递碎片签名时，也能看到轻微的加速效果。

如果你想知道一定数量签名的验证到底能快多少，请看 BIP340 所附的[这个图表](https://github.com/bitcoin/bips/blob/master/bip-0340.mediawiki#design)。

## 批量验证的原理

批量验证算法的语句只比普通验证的稍微复杂一点；所以，跟按顺序执行普通验证相比，你可能很难一下子看出来加速效果来自哪里。

给定有 n 个公钥、消息和签名元组 (P<sub>i</sub> , m<sub>i</sub> , (R<sub>i</sub> , s<sub>i</sub>))，验证者生成 n 个随机数 a<sub>1</sub>, ... , a<sub>n</sub> ，来计算 n 个挑战哈希值 e<sub>i</sub> = H(P<sub>i</sub> , R<sub>i</sub> , m<sub>i</sub>) ，然后检查：

$$(a_1s_1 + a_2s_2 + … + a_ns_n) * G ?=  a_1* R_1 + a_2 * R_2 + … + a_n * R_n + (a_1e_1) * P_1 + (a_2e_2) * P_2 + … + (a_ne_n)* P_n$$

注意，这就是把所有的验证等式（$s_i * G ?= R_i + e_i * P_i$ ）在等号两端乘以相应的 a<sub>i</sub> ，再加总起来。因此，如果所有的签名都是有效的，那上面这个等式也必然成立。不过，注意，如果我们不生成随机数  a<sub>1</sub>, ... , a<sub>n</sub> ，直接把所有的验证等式都加起来，那是有可能包含了许多无效的签名，但批量验证检查不出来的。

举个例子，如果 (R, s) 和 (R', s') 都是有效的签名，但 (R, s') 和  (R', s) 不是，但后面一对签名仍然能通过批量验证（如果批量验证只是简单加总的话）。甚至更阴险的是，有人可能会想在区块里塞入无效的签名 (R<sub>1</sub>, s<sub>1</sub>)，TA 可以计算出另一个无效签名 (R<sub>2</sub>, s<sub>2</sub>)，使得 $$(s_1 + s_2) * G = R_1 + R_2 + e_1 * P_1 + e_2 * P_2$$ 。这就是为什么我们要让验证者生成随机数，就是为了防范这种以一个无效签名来遮掩另一个无效签名的攻击。不过，要注意的是，仍然有几率选出的随机数会使无效的签名在批量验证中蒙混过关（虽然非常小，可以无视），这意味着这个算法是 “概率性” 的。

批量验证算法是什么样的我们算是清楚了，但，为什么它会更快呢？毕竟，到现在为止，似乎不论是批量验证还是逐个验证，我们做的点乘法和点加法的次数是一样多的。但是，事实证明，有一些算法在计算多个点的和时，比先乘再加更快。也就是说，给定我们要计算：

$$a_1 * P_1 + a_2 * P_2 + … + a_n * P_n$$

有许多办法，会比先做 n 次乘法再做 n-1 次加法更快。我在这里介绍一个最简单的算法，只需更少的操作即可计算完成，叫做 “Bos-Coster 算法” 虽然在计算很大的一批签名时，其它算法（就是 Pippenger 算法）的效率更高。

算法流程如下：给定要计算上面的式子

1. 重写表达式，按照系数的大小排列每一项，因此，在最终的表达式中，a<sub>1</sub> 是最大的系数，a<sub>2</sub> 次之，以此类推
2. 将第一个和 $a_1 * P_1 + a_2 * P_2$ 重写为 $(a_1 – a_2) * P_1 + a_2 * (P_1 + P_2)$；如果第一项的系数为 0，那第一项就可以直接舍弃了。注意，点加法 (P<sub>1</sub> + P<sub>2</sub>) 要比点乘法便宜很多，这样我们就能大大降低第一项的系数（因为 a<sub>2</sub> 是原式中第二大的系数）
3. 不断重复上述两步，直至只剩下一个项。最后一项要么是 a * P，要么是 0。如果是前者，那 a 将是原始系数的最大公约数。同时，a 在绝大多数时候都是最小的系数，尽管它几乎总是 1（尤其对于很大的 n）。

使用这个算法就能省去绝大多数点乘法，最终运算会比做 n 次点乘法快得多。

我们可以在批量验证等式中运用这种算法（或其它更有效率、更复杂的算法），先把等号左边的全搬到右边：

$$ 0 ?= a_1 * R_1 + … + a_n * R_n + (a_1e_1) * P_1 + … + (a_ne_n) * P_n – (a_1s_1 + … + a_ns_n) * G$$

现在右边已经是一连串点加法的形式。如果验证能够通过，我们的算法应该会导致相互抵消，最后变成 0，一次点乘法都不用做！

好奇的读者可以读读这种算法的[总结](https://cr.yp.to/papers/pippenger.pdf)。此外，这里有一个 [Pull Request](https://github.com/bitcoin-core/secp256k1/pull/760)，是为 Schnorr 签名加入批量验证算法。

除了解释 Schnorr 签名是什么以及它何以是安全的，现在我们已经看过了 Schnorr 签名是如何实现多签名和适配器签名、让比特币的合约能更加隐私、更可扩展的。现在我们又看到了批量验证如何节约验证时间。但我们还有许多可谈的！敬请期待下周的 Schnorr 门限签名介绍！

（完）

> *[后篇中文译本](https://www.btcstudy.org/2021/12/08/schnorr-applications-threshold-signatures/)*