---
title: '基于哈希函数的签名（四）：XMSS 和 SPHINCS'
author: 'David Wong'
date: '2026/01/08 12:07:05'
cover: ''
excerpt: ''
tags:
- 哈希签名
---


> *作者：David Wong*
>
> *来源：<https://cryptologie.net/posts/hash-based-signatures-part-iv-xmss-and-sphincs/>*
>
> *原文出版于 2015 年 12 月。*
>
> *[前篇见此处](https://www.btcstudy.org/2026/01/07/hash-based-signatures-part-iii-many-times-signatures/)*

本文是本系列关于基于哈希函数的签名方案的系列博客的终章。你可以在这里找到本系列[第一篇文章](https://www.cryptologie.net/article/306/hash-based-signatures-part-i-one-time-signatures-ots/)（[中文译本](https://www.btcstudy.org/2026/01/04/hash-based-signatures-part-i-one-time-signatures-ots/)）。

现在，我们要到达有趣的部分了 —— 真正的签名方案。

**PQCrypto** 在一个多月以前已经放出了一份[初步建议](http://pqcrypto.eu.org/docs/initial-recommendations.pdf)。其中建议的两种后量子算法是 “**XMSS**” 和 “**SPHINCS**”：

![initial-recommend](../images/hash-based-signatures-part-iv-xmss-and-sphincs/initial-recommend.png)

本文将先介绍 XMSS，一种带状态的签名方案；然后是 SPHINCS，第一种无状态的签名方案！

## XMSS

“**延展的默克尔签名方案**（eXtended Merkle Signature Scheme，XMSS）” [在 2011 年出现](https://eprint.iacr.org/2011/484.pdf)，然后在 [2015 年成为 IETF（互联网工程任务组）的草稿](https://datatracker.ietf.org/doc/draft-irtf-cfrg-xmss-hash-based-signatures/)。

其主要构造看起来就像一棵默克尔树，只有少数区别。在 XMSS 树上，子节点在哈希到亲节点之前，回先与一个**掩码**（mask）运行异或（XOR）运算。每个节点的掩码都不同：

![xmss_tree](../images/hash-based-signatures-part-iv-xmss-and-sphincs/xmss_tree.png)

第二个特殊之处在于，XMSS 树的叶子不是一个一次性公钥的哈希值，而是另一种树 —— 叫做 “L-树” —— 的根值。

L-树也在节点的哈希值上应用了掩码；L-树的掩码与主 XMSS 树的不同，但在所有 L-树之间都是通用的。

L-树的叶子存储了一个 WOTS+ 公钥的元素（这种方案在本系列的[第一篇文章](https://cryptologie.net/article/306/hash-based-signatures-part-i-one-time-signatures-ots/)中有解释（[中文译本](https://www.btcstudy.org/2026/01/04/hash-based-signatures-part-i-one-time-signatures-ots/)））。

如果你像我一样，疑惑什么要在树上存储一个 WOTS+ 公钥，以下是 Huelsing 的解释：

> 树结构的用途并不是存储一个 WOTS 公钥，而是为了哈希它，并且这种方式让我们可以证明，一种具备 “第二原像抗性” 的哈希函数就足够了（不需要具备碰撞抗性的哈希函数）。

此外，主公钥由 XMSS 树的根节点以及用在 XMSS 树和 L-树 中的比特掩码组成。

## SPHINCS

“SPHINCS” 是更新的一种方案，结合了这个领域的许多进步，还不止！它带来了我们所有人期待已久的无状态性。

没错，这意味着你不需要再保存任何状态了。但在解释它如何做到之前，我们先来看看 SPHINCS 的构造。

首先，SPHINCS 是由许多树组成的。

我们来看第一棵树：

![first_tree1](../images/hash-based-signatures-part-iv-xmss-and-sphincs/first_tree1.jpg)

- 每个节点，都是前面的节点的拼接与所在层级的比特掩码运行异或运算的结果的哈希值。
- 公钥是根哈希值以及比特掩码。
- 树的叶子是 WOTS+ L-树 的压缩公钥。

请将 WOTS+ L-树看成我们前面解释的 XMSS L-树，只是，其比特掩码设计看起来更像一棵 SPHINCS 哈希树（也就是树的每一层有一个专门的掩码）。

每一个叶子，都包含了一个 Winternitz 一次性签名，允许我们签名另一棵树。所以，按照上图，下一叠（layer）将有 4 棵 SPHINCS 树，在它们的叶子里都包含 WOTS+ 公钥。

如是不断往下延伸 …… 有多少叠的树、每棵树有多少叶子，全看你最初的参数。最终，在你到达第 0 层（layer 0）的时候，WOTS+ 签名不再签名其它 SPHINCS 树，而是 HORS 树。

![second_tree](../images/hash-based-signatures-part-iv-xmss-and-sphincs/second_tree.jpg)

HORS 树与 L-树在结构上是一样的，只是它包含的是 HORS 少量次数签名，而不是 Winternitz 一次性签名。我们使用它来签名我们的消息，而这将提高这个方案的安全性，因为，只要我们签名一条消息时总是使用相同的 HORS 密钥，就不会酿成大祸。

以下是一张图，来自 SPHINCS 论文，它抽象掉了 WOTS+ L-树（将它们显示为下一棵 SPHINCS 树的签名），并展示通向一条消息的唯一路径：

![sphincs](../images/hash-based-signatures-part-iv-xmss-and-sphincs/sphincs.png)

在签名消息 M 时，我们先创建 M 的一个 “随机化” 哈希值以及一个 “随机” 索引号。我使用双引号是因为，在 SPHINCS 签名方案中，一切都是使用一个伪随机函数确定性地计算除了的。这个参数告诉你，要用哪棵 HORS 树来签名 M 的随机化哈希值。这就是为什么你无需记忆状态：因为索引号是根据消息确定性地取出的。签名同一条消息总是会使用同一棵 HORS 树；而签名两条不同的消息，将有很大的概率使用两棵不同的 HORS 树。

本系列到此结束！

补充：以下是来自论文《[Armed SPHINCS](https://eprint.iacr.org/2015/1042.pdf)》的另一张图示，我认为非常好！

![armed-sphincs-fig-4](../images/hash-based-signatures-part-iv-xmss-and-sphincs/armed-sphincs-fig-4.png)

（完）