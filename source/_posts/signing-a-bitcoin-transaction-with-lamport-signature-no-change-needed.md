---
title: '在 ECDSA 之上使用 Lamport Signature 签名比特币交易'
author: 'Ethan Heilman'
date: '2024/05/23 17:52:27'
cover: ''
excerpt: '验证对花费交易的 lamport 签名'
categories:
- 比特币主网
tags:
- 比特币脚本
---


> *作者：Ethan Heilman*
> 
> *来源：<https://mailing-list.bitcoindevs.xyz/bitcoindev/CAEM=y+XyW8wNOekw13C5jDMzQ-dOJpQrBC+qR8-uDot25tM=XA@mail.gmail.com/>*



> 本文为 Ethan Heilman 在 Bitcoin-Dev 邮件组中的帖子。更细致的解读可见 [Optech Newsletter #301](https://bitcoinops.org/zh/newsletters/2024/05/08/#consensusenforced-lamport-signatures-on-top-of-ecdsa-signatures-ecdsa-lamport)。

有一天在 MIT DCI（麻省理工学院电子货币工作室）吃午饭、讨论 OP_CAT 和 lamport 签名的时候，我们得出了一种在比特币交易中使用 lamport 签名且不需要 OP_CAT 的方案。

这个方案有以下特性：

1. （应该）在今天的比特币上就可以工作（无需 OP_CAT）
2. 不像比特币脚本中的其它形式的 lamport 签名，这个方案是可以签名花费交易的。

免责声明：这是一个非常初步的工作，而且这些签名的安全性依赖于一系列关于 ECDSA 签名的简化假设为真。不要在真实的比特币输出中使用这个签名方案，除非你已经准备好把相关资金当成一个有趣的密码学赏金。我还没有在比特币脚本中测试过这个方案。

使用签名长度的想法在很大程度上跟 Robin Linus [3, 4] 提出、由 VzxPLnHqr 实现的 sigPOW（在签名中要求 PoW）是一样的，后者将签名长度的反复尝试（“研磨（grinding）”）作为交易层面的 POW 机制；跟 Anthony Towns 和 Greg Maxwell 使用  ECDSA 签名长度约束来强制揭晓签名密钥的早期工作 [6] 也是共通的。

我们的方法与 Jeremy Rubin 在 [7] 中的方法不同，因为我们不需要 OP_CAT，而且我们使用 P2SH（而不是 tapscript）；与 Jeremy Rubin 在 [8] 中的方法也不同，因为我们的目标是验证对花费交易的 lamport 签名，而不是对任意数据的 lamport 签名。相比 [7, 8] ，我们的方案在实用性上远远不如，因为它需要大量的签名（在下文中我们估计的量级在 1000 个）。

## 使用 Lamport Signature 签名比特币交易

一个 ECDSA 签名 `(r, s)` 是这样计算出来的：`r = (k*G)_x`，`s=(z+r*dA)/k`。其中：

-  k 是一个随机选出的一次性数字
- dA 就是签名密钥
- z 是从被签名的消息的哈希值（也即交易的哈希值）中派生出来的

我们的 lamport 签名方案基于下列洞察。比特币中的 ECDSA 签名的长度不是固定的；而 s 值的长度，在 nonce 值 k 固定、签名密钥固定时，将由交易哈希值决定。我们可以使用 OP_SIZE 来获得一个签名的长度，然后我们可以用 lamport 签名来签名这个长度。我们会在后文解释 lamport 签名。

我们的方案的安全性依赖于一种固定 nonce 值 k 的办法。在讨论这个方案时，Madars Virza 和 Andrew Poelstra 都向我指出，设定 k = 1/2，也就是将 k 设为 2 的乘法倒数，结果是这个 k 会有一个非常短的 r 值（`r=0x00000000000000000000003b78ce563f89a0ed9414f5aa28ad0d96d6795f9c63`）[0] 。这意味着，前面的 11 个字节（r 值的开头 88 个比特）全部都是 0，会被截断，所以 r 值将只有 21 字节长！一个众所周知的 k 会导致签名密钥的泄露，但这对我们的目的来说不重要。

使用这个 k，我们可以保证，两个签名中的 r 值是一样的（我们可以用 `OP_SIZE(sig) < (21+32+6)` 来检查它们的长度）。通过研磨 r 来找出一个更小的值需要 2^96（12 字节的 0）次计算，假定没有数学上的捷径可以找出 k = 1/2 的话。

为了解释如何使用上述洞察来使用lamport signature 签名比特币交易，我们先回顾一下 lamport signature [1] 是怎么工作的。为了使用 lamport signature 签名 1 个比特，我们先要使用一种哈希函数 H，计算：`x0 = H(y0), x1 = H(y1)`。然后，你发布 `x0, x1` 作为你的公钥。然后，为了签名 比特 0，你公开数值 `y0`。任何人都可以使用 `y0` 来验证 `x0 == H(y0)`。如果要签名比特 1，你就放出 `y1`。

我们使用 lamport signature 来签名一个比特币签名的长度。签名的长度实际上是花费交易的交易哈希值的一个代理。多次重复，就可以提供一定程度的密码学安全性。我们来看一个例子：

Alice 计算出自己的 lamport 公钥和签名密钥：

```
x00 = Hash(y00)
x01 = Hash(y01)
x10 = Hash(y10)
x11 = Hash(y11)
x20 = Hash(y20)
x21 = Hash(y21)
```

用伪代码表示，Alice 的赎回脚本是这样的：

```
PUSH ecdsaPubkey0
OP_CHECKSIG (ecdsaSig0)
// 验证对 ecdsaSig0 的 lamport 签名
PUSH x00, x01
if OP_SIZE (ecdsaSig0) == 59:
  if OP_HASH(y00) != x00: OP_RETURN
else if OP_SIZE (ecdsaSig0) < 59:
  if OP_HASH(y01) != x01: OP_RETURN

PUSH ecdsaPubkey1
OP_CHECKSIG (ecdsaSig1)
// 验证对 ecdsaSig1 的 lamport 签名
PUSH x10, x11
if OP_SIZE (ecdsaSig1) == 59:
  if OP_HASH(y10) != x10: OP_RETURN
else if OP_SIZE (ecdsaSig1) < 59:
  if OP_HASH(y11) != x11: OP_RETURN

PUSH ecdsaPubkey2
OP_CHECKSIG (ecdsaSig2)
// 验证对 ecdsaSig2 的 lamport 签名
PUSH x20, x21
if OP_SIZE (ecdsaSig2) == 59:
  if OP_HASH(y20) != x10: OP_RETURN
else if OP_SIZE (ecdsaSig2) < 59:
  if OP_HASH(y21) != x21: OP_RETURN
```

Alice 计算 ECDSA 签名：`ecdsaSig0` 、`ecdsaSig1` 和 `ecdsaSig2`。比如说，假设 `OP_SIZE(ecdsaSig0)=59, OP_SIZE(ecdsaSig1)=58, OP_SIZE(ecdsaSig2)=59`，那么，为了通过上述脚本，她必须通过释放原像 `y00, y11, y20` 来提供对这些签名长度的 lamport 签名。

花费脚本的伪代码：

```
PUSH ecdsaSig0
PUSH y00 // Signs that OP_SIZE(ecdsaSig0) should be 59
PUSH ecdsaSig1
PUSH y11 // Signs that OP_SIZE(ecdsaSig1) should be less than 59
PUSH ecdsaSig2
PUSH y20 // Signs that OP_SIZE(ecdsaSig2) should be 59
```

与尝试偷盗其资金的攻击者相比，Alice 的优势在于，Alice 只需要为其所有的 ECDSA 签名的长度释放原像，但攻击者必须构造一个能够与每一个 ECDSA 签名的长度相匹配的交易哈希值（译者注：此处的 “攻击者” 应指有能力伪造 Alice 签名的攻击者）。给定长度分别为 `(59, 58, 59)`，攻击者能够成功构造出三个随机 ECDSA 签名的概率为 255/256 * 1/256 * 255/256 ~= 0.3%。Alice 可以通过添加额外的 ECDSA 签名来任意提高她的安全性。

Andrew Poelstra 向我指出，一个随机的签名短 1 个字节的概率是 1/256，因为 OP_SIZE 只度量一个值的字节长度，而不是其比特长度。这意味着，绝大部分时候，如果 Alice 只是使用 3 个 ECDSA 签名，它们的长度全部都是 59 字节。在这个时候，攻击者一次尝试就成功的概率会是 (255/256)*3 = 98%。

因此，Alice 需要大量的 ECDSA 签名，而且可能需要研磨出更安全的数值来签名（“更安全” 指的是长度上更加多样）。

假设一种极简的模式，ECDSA 签名长度为 59 字节的概率为 `(1 - 1/256)`，而小于 59 字节的概率为 `1/256`，那么 Alice 生成恰好 m 个短签名和 n-m 个常规长度签名的概率是 `(255/256)^(n-m)*(1/256)^m*(n choose m)`  。

而攻击将不仅需要生成 m 个短签名和 n-m 个常规长度签名，还要让它们所在的位置跟 Alice 所生成的恰好相同，这个概率就成了 `(255/256)^(n-m)*(1/256)^m` 。

平均来说，Alice 需要 1000 次尝试才能得到 n=800，m=10 。而攻击者在观察到 Alice 使用 n=800，m=10 个签名来这笔资金的尝试之后需要 2^84 次计算才能暴力搜索成功。

## 已知的弱点

1. *调优攻击*：攻击者可以为不同签名使用不同的 SIG_HASH 标签来逐个攻击。举个例子，如果 ecdsaSig1 没有正确的长度，攻击者就可以用 SIGHASH_NONE 再次尝试，不需要改变其它签名的长度。这会给攻击者带来一些好处，但只要签名的数量足够多，就不足以打破这个方案。Alice 也可以使用这个办法，通过提高长度的多样性来提高安全性。还不清楚这最终来说是有害于安全性还是有益于安全性。
2. *混搭攻击*：即使攻击者无法研磨出一个更短的 r 值，但一个长度大致是 21-23 字节的 r 值将允许攻击者对一个签名的长度作几次单独尝试。这是因为我们仅仅度量 ECDSA 签名的整长，所以一个 23 字节的 r 值搭配 29 字节的 s 值（23+29+6 = 58）也满足要求。29 字节的 s 值比较罕见，出现的概率只有约 1/2^24，但只要攻击者成功以 2^27 次计算的代价研磨出了一个 23 字节的 r 值，就能获得更多的优势。

## 已知的优化

1. 不仅仅以 59 字节作为长度的分界线。我们可以将这个方案延展成签名多种 ECDSA 签名长度，59、58、57、56，等等。这让 Alice 可以极大第提升安全性，因为（比如说）56 字节的签名发生的概率只有 1/2^32 。Winternitz 一次性签名（WOT）[2] 可以用在这里，压缩签名的长度。

2. Jeremy Rubin 建议了下列优化：并不直接签名 ECDSA 签名的长度，而是使用 OP_MUL、OP_ADD 构造出签名长度的一个 32 比特长的比特向量。

   ```
   bit vector = OP_SIZE(ecdsaSig0)==59 + 2*(OP_SIZE(ecdsaSig1)==59) +
   4*(OP_SIZE(ecdsaSig2)==59) ...
   ```

   然后，你可以在这个比特向量上计算一个 WOT 签名。这也要求计算这个比特向量的校验和的一个 Winternitz 签名或者 lamport 签名。这将大大减少 lamport 公钥和签名密钥的数量，而且也许能让赎回脚本脚本和花费脚本的体积减半。

3. 因为 59 是默认长度，Alice 实际上并不需要签名 59。可以推测，如果不给出原像，或已经给出原像 0，那么 Alice 意图的长度就是 59。这可以节约花费脚本和赎回脚本的长度。

## 开放问题

1. OP_CODESEPARATOR 可以被 Alice 或攻击者用来 加强 或者 削弱 这个方案的安全性吗？Alice 通过使用 OP_CODESEPARATOR 来提高签名长度多样性、进而提高本方案安全性的建议，是由 Jeremy Rubin 提出的。经过一些讨论之后，我们认为，因为赎回脚本是 P2SH 地址的一部分，因此，OP_CODESEPARATOR 中的数据也会影响所有其它 ECDSA 签名。也就是说，也许有某种办法可以利用它，来帮助 Alice 或帮助攻击者。
2. 如果一个满足 k*G = r = 1 的 nonce 值 k 被发现了，我们就要移除没人可以找出更小的 r 的假设。还不知道如何找出 r = 1，因为这要求找出离散对数。有可能在不知道 k 的前提下创建一个交易签名、其 r = 1，办法是 ECDSA 公钥复原。这对我们的方案来说没有用，因为在花费交易中我们必须指定 ECDSA 公钥。还有已知比 r = 1/2 * G 更小的 r 值吗？
3. 给定 SIGHASH 混搭攻击的可能性，一个 ECDSA 签名在这里到底贡献了多少比特的安全性？我们需要多少 ECDSA 签名？我们已经将 ECDSA 签名的 s 值建模为在 2^256 的空间内平均分布。但对我来说，椭圆曲线数学不太可能跟 256 比特的空间恰好对齐，尤其是对一些具有特殊数学属性的固定 r 值。在这里，非均匀性最终可能有益于（增加长度多样性）或有害于（帮助攻击更快找出能够匹配签名长度的交易）安全性。
4. 攻击者可以通过计算出一个较小的 r 值来减少需要暴力搜索交易哈希值的计算量。这里的 时间-内存 交换比例是什么样的？
5. 这个方案除了是一个有趣的聚会把戏，还有别的用途吗？

感谢 Madars Virza、Dan Gould、Armin Sabouri、Neha Narula、Jeremy
Rubin、Andrew Poelstra 和 Robin Linus 与我讨论这个方案并给我反馈。最初的讨论是由 MIT DCI 的咖啡机驱动的。我已经尽力指出了每一位贡献者的观念贡献，如果文章有误或遗漏了什么贡献，请给我发邮件。任何错误都归属于我自己。

[1]: "Constructing Digital Signatures from a One Way Function", Leslie
Lamport (1979),
https://www.microsoft.com/en-us/research/publication/constructing-digital-signatures-one-way-function/

[2]: "A Certified Digital Signature", Ralph C. Merkle (1979),
https://www.ralphmerkle.com/papers/Certified1979.pdf

[3]: "Timelocked Proof of Work via signature length",  Robin Linus (2021),
https://gist.github.com/RobinLinus/95de641ed1e3d9fde83bdcf5ac289ce9#file-sig_pow-md

[4]: "Proof of Work in Bitcoin Script", Robin Linus (2020),
https://github.com/coins/bitcoin-scripts/blob/master/proof-of-work.md

[5]: "sig-pow - work-locked outputs", VzxPLnHqr (2022),
https://github.com/VzxPLnHqr/sig-pow/

[6]: "[Lightning-dev] Better privacy with SNARKs", Anthony Towns (2015),
https://lists.linuxfoundation.org/pipermail/lightning-dev/2015-November/000344.html

[7]: "Quantum Proofing Bitcoin with a CAT", Jeremy Rubin (2021),
https://rubin.io/blog/2021/07/06/quantum-bitcoin/

[8]: "CheckSigFromStack for 5 Byte Values", Jeremy Rubin (2021),
https://rubin.io/blog/2021/07/02/signing-5-bytes/

（完）
