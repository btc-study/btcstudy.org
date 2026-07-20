---
title: '关于秘密值分割（下）'
author: 'Dadav Kohen'
date: '2026/07/18 17:38:44'
cover: ''
excerpt: '如果我们要分割许多随机生成的秘密值，那么我们不必为每一个秘密值作一次分割，而可以只执行一次 RSS 设置'
tags:
- 密码学
mathjax: true
---


> *作者：Dadav Kohen*
> 
> *来源：<https://nkohen.github.io/blog/some-secrets-shared/>*



## 伪随机的秘密值分割

一个 SSS 所无、RSS 所有的好处是，如果我们要分割许多随机生成的秘密值，那么我们不必为每一个秘密值作一次分割，而可以只执行一次 RSS 设置，然后将每一个加法秘密值都当成一个[伪随机函数 (PRF)](https://en.wikipedia.org/wiki/Pseudorandom_function_family) 的密钥（也就是种子）。然后，我们就能非交互地、确定性地生成无穷无尽的 RSS 共享秘密值。

具体来说，一种办法是先固定一个[密码学哈希函数](https://en.wikipedia.org/wiki/Cryptographic_hash_function) $H$ ，然后给定某种会话标识符 $sid$ 以及一个秘密值种子 $\phi_i$ ，我们就能计算出新的秘密值 $\alpha_i = H(\phi_i\vert\vert sid)$ 。如果每一方都为自己所知的每一个 $\phi_i$ 计算出了 $\alpha_i$，那么他们就能使用这些新数值作为伪随机的秘密值 $s_{sid} = \sum_i \alpha_i$ 的 RSS 碎片。请注意，参与者们之间无需通信，就能执行秘密值 $s_{sid}$ 的（新一轮） RSS ！每一个参与者都只需要在已经从最初的复制型 PRF 种子启动仪式中获得的数值上运行本地计算。关键在于，因为 PRF 在固定的种子上是确定性的，所以各参与者能够计算出相同的数值 $\alpha_i$ ，而无需相互通信，只要他们知道复制的秘密值 $\phi_i$ 就行了。

这种方案，基于一个初始化的 Shamir 秘密值分割仪式是无法实现的，因为每个参与者知道都是一条曲线上的一个点，无法用作一个伪随机函数的种子，因为从这样一套装置中得到的输出不会落在同样是 $(t-1)$ 次的多项式上。事实上，如果 $n$ 个参与者每个都以随机生成、没有复制的种子作为 PRF 的输入，并将这些 PRF 的输出当作 Shamir 碎片，那么几乎是压倒性的概率，这些点不会落在任何次数低于 $(n-1)$ 的多项式上（$n$ 就是这些点的数量）。问题就在于 Shamir 是相互关联的，因为任何 $t$ 个点都能缺点所有 $n$ 个点。RSS 没有这个问题，因为加法秘密值并不是相互关联的。

不过，跟 SSS 相比，RSS 的主要缺点还是存储负担和通信复杂性。在 SSS 中，你只需要保管一个秘密值。而且，当你把这个秘密值用在多方计算当中时（比如，你要计算出一个碎片签名），你只需要径直计算出碎片签名就可以了。但是，使用 RSS ，你可能需要为你所知的每一个碎片计算碎片签名并把它交给其他人。没有办法降低 RSS 的存储负担，但可以将 RSS 碎片（就是许多的加法秘密值）转化成 SSS 碎片（就是一个秘密点），而且无需任何通信！这就意味着，只需要付出一次 RSS 初始化启动仪式的代价，你就能确定性地生成无尽数量的伪随机 SSS 分发的秘密值，无需进一步的通信 —— 你只需创建 RSS 秘密值并将它们转化为 SSS 碎片。

将一个 RSS 分发的秘密值转化伪一个 SSS 分发的秘密值，这背后的关键思路是，我们必须定义一个多项式 $f_{sid}(x)$ ，它是 $(t-1)$ 次的，并且 $f_{sid}(0) = s_{sid} = \sum_i \alpha_i = \sum_i H(\phi_i, sid)$；并且，对于每一个 $k\in\{1,\ldots, n\}$，$f_{sid}(k)$ 是一个可以由参与者 $k$ 计算出来的数值；也就是说，$f_{sid}(k)$ 可以只用参与者 $k$ 所知的秘密值 $\phi_i$ 计算出来。

定义 $L_{a_i}(x) = \prod_{j\in a_i}\frac{j-x}{j}$ ，是唯一的次数为 $\vert a_i\vert = t-1$ 的多项式，使得 $L_{a_i}(0) = 1$ 且 $L_{a_i}(k) = 0$（对于所有的 $k\in a_i$ ）。如果我们令：

$$
f_{sid}(x) = \sum_i H(\phi_i, sid)\cdot L_{a_i}(x)
$$

那么，这是一个 $(t-1)$ 次的多项式，使得：

$$
f_{sid}(0) = \sum_i H(\phi_i, sid)\cdot L_{a_i}(0) = \sum_i H(\phi_i, sid) = s_{sid}
$$

并且，对每一个 $k\in\{1,\ldots,n\}$，都有：

$$
f_{sid}(k) = \sum_i H(\phi_i, sid)\cdot L_{a_i}(k) = \sum_{i\text{ with }k\notin a_i} H(\phi_i, sid)\cdot L_{a_i}(k)
$$

请主要，我们不需要知道 $k\in a_i$ 中的任何 $i$ 的 $\phi_i$ 来计算  $f_{sid}(k)$，因为对于 $k\in a_i$ 中的所有 $i$，$L_{a_i}(k) = 0$ 。因此，参与者 $k$ 只需使用自己所知的秘密值，就能计算出 $f_{sid}(k)$，因为他们知道所有 $k\notin a_i$ 的 $\phi_i$。

因此，在一次 RSS 启动仪式之后，我们就能计算出无尽数量的 Shamir 私钥碎片而无需进一步的通信，只需让每一方都为会话标识符 $sid$ 计算自己的秘密值碎片 $s_{sid,k} = \sum_{i\text{ with }k\notin a_i} H(\phi_i, sid)\cdot L_{a_i}(k)$ 。还要注意，因为数值 $L_{a_i}(k) = \prod_{j\in a_i}\frac{j-k}{j}$ 不随会话而改变，所以他们可以缓存起来、提高计算效率。

这套方案叫做 “伪随机的秘密值分割（PSS）”，最初是由 [Cramer 等人在 2004 年出版的这篇论文](https://scispace.com/pdf/share-conversion-pseudorandom-secret-sharing-and-35akwluifi.pdf) 中提出的。PSS 基本上允许协议既能获得 RSS 方案只需启动一次就能重复使用的好处，又能获得等价于 Shamir 方案的通信复杂性（因为碎片转换）。此外，基于 PSS 的方案的安全性似乎是比较容易分析的，可以通过模拟参数化约为纯粹的基于 RSS 的变体（这样论证效率不高，但非常容易分析）。基本上，这里的安全证明可以分成三个阶段：

1. 将基于 PSS 的方案的安全性化约为纯粹使用 RSS 的方案的安全性。
2. 将基于 RSS 的方案的安全性化约为非门限版本的安全性，需要所有参与者配合才能复原，而敌手只剩下一个参与者没有攻克。
3. 证明这个非门限版本的安全性。

举个例子，这就是 [Iceberg](https://github.com/nkohen/Iceberg/tree/master) 将安全性证明化约到 [Nested MuSig2](/publication/2026-02-12-nested-musig2) 安全性的办法（论文正在准备中）。

## 分布式密钥生成

目前为止，我们已经讨论了在有一个可信任的处理人的前提下的秘密值分割方案：这个人知道底层的秘密值、将它分割成几份，然后将这些碎片分发给参与者。而在实践中，我们常常希望用一套免信任的分布式密钥生成（DKG）协议来替代这个受信任的处理人。

搭配 RSS 的 DKG 是非常简单的！对每一个要参与求和的秘密值，一个我们有意让其知晓该秘密值的参与者（可以用任何方式指定，比如说，编号最小的参与者）随机生成这个秘密值，然后将它分享给所有需要知晓这个秘密值的其他参与者。然后，参与者们验证他们都收到了同样的秘密值。比如说，可以这样实现这种检查：让每个参与者都给生成这个秘密值的人回复一个对该秘密值的签名，然后，让秘密值生成人收集所有这些签名、将完整的集合发回给每一方，用于批量验证。

到目前为止，在这篇文章中，我们还没有直接讨论任何公钥密码学，因为我们一直在讨论与 “公钥” 无关的秘密值。在本文剩余的部分中，要讨论的将全都是与公钥有关的秘密值 —— 私钥。尤其是，我们假设读者熟悉[循环群](https://en.wikipedia.org/wiki/Cyclic_group)以及它们在基于[离散对数](https://en.wikipedia.org/wiki/Discrete_logarithm)的公钥密码学中的作用。

在 1987 年，Feldman [出版了](https://www.cs.umd.edu/~gasarch/TOPICS/secretsharing/feldmanVSS.pdf)一种可验证的私钥分割方案（VSS），允许一个不被信任的处理人来执行一场 SSS 启动仪式。就像我们[前面介绍的](https://www.btcstudy.org/2026/07/16/some-secrets-shared-by-dadav-kohen-part-1/#Shamir-%E7%A7%98%E5%AF%86%E5%80%BC%E5%88%86%E5%89%B2)受信任启动仪式一样，这个处理人选出一个多项式 $f(x) = s + a_1x + a_2x^2 + \cdots + a_{t-1}x^{t-1}$ ，其中数值  $a_1,\ldots, a_{t-1}$ 是随机选出的，然后处理人分发数值 $s_i = f(i)$ 给参与者 $i$ 。此外，处理人要给每个参与者这样一个数值列表 $P_0 = g^s, P_1 = g^{a_1},\ldots, P_{t-1} = g^{a_{t-1}}$ ，如果我们把 $f(x)$ 的各项系数视作私钥的话，它们就是对应的公钥。每个参与者 $i$ 都可以通过检查下式来验证自己的秘密值碎片 “在指数之中”： 


$$
g^{s_i} = P_0P_1^iP_2^{i^2}\cdots P_{t-1}^{i^{t-1}} = g^{s}(g^{a_1})^i(g^{a_2})^{i^2}\cdots(g^{a_{t-1}})^{i^{t-1}} = g^{s + a_1i + \cdots + a_{t-1}i^{t-1}} = g^{f(i)}
$$

如果没有任何一方抱怨自己的碎片是无效的，那么启动仪式就成功了。这套 VSS 可以转化成一套 DKG ，办法是让每个参与者都生成一个均匀随机的秘密值，然后充当所有其他参与者的处理人。结果是，每一方都持有其他每一个参与者的秘密值的一个 Shamir 碎片。假设每一个参与者都有一个固定的编号，也就是说，每个人都知道每一个多项式在某一个固定的 x 坐标值上的结果，那么每个参与者都能把自己手上的碎片都加起来，结果就是所有多项式的和（本身就是一个多项式）的一个碎片。本质上，这是让每一方都生成一个加法秘密值，然后我们将聚合的 DKG 秘密值定义为所有这些数值的和，然后，我们让每个参与者都作为自己的加法秘密值的不受信任的处理人，最后，每个人都把自己手上的碎片加起来，就得到了聚合秘密值的一个碎片。

如你所见，SSS DKG 比 RSS DKG 复杂许多，所以如果你的参与者数量不是那么多（满足 RSS 本身实用的前提），然后你需要运行许多 SSS DKG，那么使用 PSS 会更好，你只需运行一次 RSS DKG 就能产生许许多多的 SSS DKG 。

## 在指数中复原

假设你有一个 RSS 秘密值 $s$ ，已经在许多参与者之间处理过了（无论是直接分发，还是作为伪随机秘密值分割的结果）。那么，要计算出公钥 $g^s$ 是非常简单的，无需让每一方都广播自己的所有加法秘密值的公钥、验证所有参与者都达成一致、然后取得每一个（复制）因子来复原 $s$ 。换句话来说，如果：

$$
s_1 + s_2 + \cdots + s_\gamma = s
$$

那么：

$$
g^{s_1}g^{s_2}\cdots g^{s_\gamma} = g^{s_1 + s_2 + \cdots + s_\gamma} = g^s
$$

类似地，只要 $s$ 使用 SSS 处理过（无论是直接处理，还是作为伪随机秘密值分割的结果）， 那么只要所有参与者都不仅知道自己的碎片 $s_i = f(i)$，还知道所有数值 $j$ 的公钥 $P_j = g^{s_j}$ ，那么其中的任何 $t$ 个参与者，都能 “在指数中” 使用[插值法](https://www.btcstudy.org/2026/07/16/some-secrets-shared-by-dadav-kohen-part-1/#%E6%8B%89%E6%A0%BC%E6%9C%97%E6%97%A5%E6%8F%92%E5%80%BC%E6%B3%95) 来计算出 $g^s$  ，就像这样：

$$
P_{i_1}^{\lambda_1}P_{i_2}^{\lambda_2}\cdots P_{i_t}^{\lambda_t} = g^{f(i_1)\lambda_1 + f(i_2)\lambda_2 + \cdots + f(i_t)\lambda_t} = g^s
$$

其中 $C = \{i_1,\ldots, i_t\}$ 且 $\lambda_j = L_{i_j}(0) = \prod_{i_k\in C\setminus\{i_j\}}\frac{i_k}{i_k - i_j}$ 。

不过，如果 “只知道公钥 $P_j$ ”，就并不必然是简单的，因为我们不知道它背后的私钥（参与者 $j$ 的碎片），而我们可能也不信任 $j$ 。如果[基于 Feldman 式 VSS 的 DKG](#分布式密钥生成) 用来建立 SSS ，那么我们可以免信任地从中间承诺中计算出这些数值。在下一节，我们将介绍如何在 PSS 语境下验证得到的 $P_j$ 数值。

## 可验证的伪随机秘密值分割

对于一个固定的 $sid$ ，参与者 $k$ 在本地计算下式作为自己的碎片：

$$
s_k = f_{sid}(k) = \sum_{i\text{ with }k\notin a_i} H(\phi_i, sid)\cdot L_{a_i}(k)
$$

关键思路是，我们希望组合一些计算，可以用来检查一些 $s_k$ 数值的集合是有效的、可以投入 “在指数中” 中的计算。也即，如果我们得到了一些数值 $s_{i_1},\ldots, s_{i_{2t-1}}$ ，它们据说等于$f(i_1),\ldots, f(i_{2t-1})$ ，那么我们应该能够使用[插值法](https://www.btcstudy.org/2026/07/16/some-secrets-shared-by-dadav-kohen-part-1/#%E6%8B%89%E6%A0%BC%E6%9C%97%E6%97%A5%E6%8F%92%E5%80%BC%E6%B3%95)、从这些数值中计算出 $f$ 。具体来说，我们可以检查 $f$ 的次数等于 $t-1$ 。

**如果我们假设至多有 $t-1$ 个不诚实的参与者，那么就至少存在一个诚实参与者集合可以形成多数**，然后任何至少有 $2t-1$ 个参与者的团体中都会有至少 $t$ 个诚实参与者。这就意味着，单靠这些参与者，我们就能通过差值法复原出 $f$ 的真正值。但如，如果向我们的插值法加入更多点，会怎么样呢？假设设这篇点都是正确计算的，即 $s_i = f(i)$ ，那么插值法依然会输出相同的多项式 $f$ 。但如，如果不诚实的参与者使用的数值 $s_i\neq f(i)$ ，那么诚实参与者的点以及这个点 $(i, s_i)$ 一起运行插值法，将得出一个次数高于 $t-1$ 的多项式。这是因为， $f$ 是唯一一个次数为 $(t-1)$ 、又能穿过这 $t$ 个诚实点的多项式，添加任何不在这条曲线上的点，都将需要通过超过 $t$ 个点来插值，从而产生更高次数的多项式。因此，只要我们作出了诚实参与者占多数的假设，那么通过至少 $2t-1$ 个碎片来计算插值得到的多项式的次数，就足以验证这些碎片的正确性。请注意，使用 $m\geq 2t-1$ 个点插值，产生的多项式最高是 $m-1$ 次，并且我们可以直接验证这个多项式在 $x^t, x^{t+1}, \ldots, x^{m-1}$ 上的值都是 $0$ 。

现在，我们将这种计算转化到 “在指数中”。给定一组数值 $\{D_j\}_{j\in C}$ 使得 $D_j$ 据称等于 $g^{s_j}$ ，其中$s_j = f(j)$ 。我们希望计算 $g^{f(x)} = g^{\sum_{j\in C}s_j\cdot L_{C, j}(x)}$ ，其中 $L_{C,j}(x) = \prod_{i\in C\setminus\{j\}}\frac{i-x}{i-j}$ 。如果我们使用 $\Lambda_{j,k}^C$ 来表示 $L_{C,j}(x)$ 展开式中的 $k$ 次项的系数，使得：

$$
L_{C,j}(x) = \sum_{k=0}^{\vert C\vert - 1}\Lambda_{j,k}^Cx^k
$$

那么我们就可以归类相似的项，得到：
$$
f(x) = \sum_{j\in C}s_j\cdot L_{C,j}(x) = \sum_{k=0}^{\vert C\vert - 1}\left(\sum_{j\in C} s_j\cdot \Lambda_{j,k}^C\right)x^k
$$
因此，如果我们令 $f(x)$ 等于使用数值 $\{s_j\}_{j\in C}$ 的插值的结果，那么：
$$
g^{f(x)} = g^{\sum_{k=0}^{\vert C\vert - 1}\left(\sum_{j\in C} s_j\cdot \Lambda_{j,k}^C\right)x^k} = \prod_{k=0}^{\vert C\vert - 1}\left(\prod_{j\in C}g^{s_j\cdot \Lambda_{j,k}^C}\right)^{x^k} = \prod_{k=0}^{\vert C\vert - 1}\left(\prod_{j\in C}D_j^{\Lambda_{j,k}^C}\right)^{x^k}
$$
就是使用 $\{D_j\}_{j\in C}$ “在指数中插值” 的结果。因此，在诚实参与者占多数的背景下，就足以为所有 $k\geq t$ 验证 $\prod_{j\in C}D_j^{\Lambda_{j,k}^C} = g^0 = \text{Id}_{\mathbb{G}}$  成立。如果成立，则所有数值 $\{D_j\}_{j\in C}$ 都必然是落在同一个 $t-1$ 次多项式上的秘密值的公钥，而这个多项式必然是诚实参与者假设（至少 $t$ 个用于插值的输入是诚实的）下的正确多项式。

因此，在诚实参与者占多数的假设下，我们得到了 “可验证的伪随机秘密值分割（VPSS）”！使用 VPSS，我们不仅能从一次 RSS DKG 中获得无数免费的 SSS 秘密值，还能验证各个参与者的碎片，并因此能够从底层的分散的秘密值中可验证地计算出聚合公钥（即，执行[在指数中复原](#在指数中复原)），而无需直接复原这些秘密值。

注意，另一种验证方式是使用 “零知识证明（ZKP）”，这将不再需要诚实参与者占多数的假设。举个例子，只要 VPSS 启动仪式（本身是一个 RSS DKG）以每个人都知晓所有伪随机函数秘密种子的公钥告终，然后，参与者们就能生成一个 ZKP 来证明自己的点 $D_j$ 是正确计算的。为了让这样的证据实用，使用代数哈希函数（比如 [MiMC](https://eprint.iacr.org/2016/492)）来定义伪随机函数可能是必要的。

### 边注：计算 $\Lambda_{j,k}^C$

如果你对计算 $\Lambda_{j,k}^C$ 的最优方法的细节不感兴趣，完全可以[跳过这一节](#在门限 Schnorr 签名中的应用)。

多项式 $L_{C,j}(x)$ 的次数（也就是 $k$ 值的数量）等于 $\vert C\vert$ ，又因为有许多 $j$ 值，所以总共有 $\vert C\vert^2$ 个数值要计算。我们可以展开每一个 $L_{C, j}(x) = \prod_{i\in C\setminus\{j\}}\frac{i-x}{i-j}$ 柿子，但傻乎乎这样做就要花费 $O(\vert C\vert^3)$ 量级的时间。

不过，显然是可以做得更好的，因为我们把式子重写成 $L_{C,j}(x) = \frac{A_{C,j}(x)}{A_{C,j}(j)}$，其中 $A_{C, j}(x) = \prod_{i\in C\setminus\{j\}} i - x = \frac{A_C(x)}{j-x}$ ，而 $A_C(x) = \prod_{i\in C}i-x$ 。我们可以在  $O(\vert C\vert^2)$ 时间内计算出 $A_C(x)$ ，然后使用 “[Horner 方法](https://en.wikipedia.org/wiki/Horner%27s_method)”，既用于计算 $A_{C,j}(x)$ ，也用于求值 $A_{C,j}(j)$，时间复杂度为 $O(\vert C\vert)$；并且，第二部分（求值）我们需要运行 $\vert C\vert$ 次，总共只需要 $O(\vert C\vert^2)$ 时间就能产生最终结果（考虑到我们计算的值的数量，这就已经是最优的了）。这个流程是更优的 [Parker-Traub 算法](https://www.sciencedirect.com/science/article/pii/S0885064X97904428)的一个变种。

不过，还有别的高效计算 $\Lambda_{j,k}^C$ 值的方法。绝大部分计算这些值的高效算法都利用了这一洞见：如果 $C = \{i_1, i_2, \ldots, i_n\}$，那么，因为 $L_{C, i_j}(i_\ell)$ 在 $\ell = j$ 时等于 $1$，其它时候则等于 $0$ ，并且 $L_{C, i_j}(x) = \sum_{k=0}^{\vert C\vert - 1}\Lambda_{j,k}^Cx^k$ 。因此，我们可以得到下列矩阵的积：

$$
\begin{pmatrix} 1 & i_1 & \cdots & i_1^{n-1}\\ 1 & i_2 & \cdots & i_2^{n-1}\\ \vdots & \vdots & \ddots & \vdots\\ 1 & i_n & \cdots & i_n^{n-1}\end{pmatrix} \begin{pmatrix} \Lambda_{i_1, 0}^C & \Lambda_{i_2, 0}^C & \cdots & \Lambda_{i_n, 0}^C\\ \Lambda_{i_1, 1}^C & \Lambda_{i_2, 1}^C & \cdots & \Lambda_{i_n, 1}^C\\ \vdots & \vdots & \ddots & \vdots\\ \Lambda_{i_1, n-1}^C & \Lambda_{i_2, n-1}^C & \cdots & \Lambda_{i_n, n-1}^C\end{pmatrix} = \begin{pmatrix} L_{C,i_1}(i_1) & L_{C, i_2}(i_1) & \cdots & L_{C, i_n}(i_1)\\ L_{C,i_1}(i_2) & L_{C, i_2}(i_2) & \cdots & L_{C, i_n}(i_2)\\ \vdots & \vdots & \ddots & \vdots\\ L_{C,i_1}(i_n) & L_{C, i_2}(i_n) & \cdots & L_{C, i_n}(i_n)\end{pmatrix} = \text{Id}.
$$

因此，我们可以得出结论，这个包含了所有我们想要计算的 $\Lambda_{j,k}^C$  值的矩阵，是由 $C$ 生成的 [Vandermonde 矩阵](https://en.wikipedia.org/wiki/Vandermonde_matrix)的逆。换句话说，包含了所有我们想知道的数值的举证，恰好是一种结构很清楚的矩阵的逆，而对它求逆是可以高效计算的。

[Bjorck-Pereyra 算法](https://www.ams.org/journals/mcom/1970-24-112/S0025-5718-1970-0290541-1/S0025-5718-1970-0290541-1.pdf)将一个 Vandermonde 矩阵分解为有结构的稀疏矩阵的积，允许允许在 $O(n^2)$ 时间内对这些矩阵求逆，并产生了另一种对我们需要执行验证的数据的高效计算方法。

[Vandermonde 矩阵求逆高效算法（VIMEA）](https://www.mdpi.com/2075-1680/12/1/27)是另一种办法，在初级对称多项式上使用递归计算，来计算矩阵的逆，基本上没有除法，因此可能是像我们这样在 $\mathbb{F}_p$ 上运算时的最佳选择。

## 在门限 Schnorr 签名中的应用

作为这篇文章的结尾，我们切换一下，从我们在这篇文章中学到的所有东西出发，简单考虑 Schnorr 门限签名的设计空间。我计划将来写一篇更深入解读 Schnorr 门限签名的文章，在这里就先演习一下。关于 Schnorr 签名的背景介绍，请看[这篇文章](https://nkohen.github.io/blog/introduction-to-schnorr-signatures)（[中文译本](https://www.btcstudy.org/2021/11/20/introduction-to-schnorr-signatures-by-suredbits/)）。关于 Schnorr 门限签名的用途，请看[这篇文章](https://nkohen.github.io/blog/schnorr-applications-threshold-signatures)（[中文译本](https://www.btcstudy.org/2021/12/08/schnorr-applications-threshold-signatures/)）。要理解本节的内容，知道私钥和 nonce 在一个 Schnorr 签名中的作用，是很重要的。

FROST（我们曾在[一篇文章](https://nkohen.github.io/blog/schnorr-applications-frost)中介绍过（[中文译本](https://www.btcstudy.org/2021/12/09/schnorr-applications-frost/)））是一种最少通信轮次的协议，它让一组参与者可以用一个 SSS 分割的私钥来执行多方计算，最终得到他们的共享私钥的一个 Schnorr 签名。FROST 非常著名，以至于在许多圈子里，哪怕实际想说的只是 “ Schnorr 门限签名方案”，也会说成 “FROST”。不过，在 Schnorr 基础上，除了 FROST 还有许多其他门限签名方案，各有各的取舍。

有一种替代方案，也是一套 2 轮通信的协议，叫做 “[Arctic](https://eprint.iacr.org/2024/466)”（请看第 20 页的图 6）。Arctic 也应用在一个 SSS 分割的私钥上，但使用 [VPSS](/blog/some-secrets-shared/#verifiable-pseudorandom-secret-sharing) 来生成共享的 nonce 值。（事实上，VPSS 中的可验证性的框架，正是由 Arctic 最早提出的）。相反，FROST 则将聚合 nonce 值的确定推迟到第二轮交互中，这时候，将要合作生成签名的参与者子集是已知的了，而且 FROST 只是把这些参与者所贡献的数值累加起来。这一区别，给了 Arctic 超过 FROST 的三个重要好处：

1. 聚合的 nonce 值在第一轮通信结束后就确定和知晓了，早在签名会话的参与者被选定之前。这一属性是必要的，当我们尝试将一个两轮的签名协议嵌套进另一个两轮签名方案（比如 [MuSig2](https://eprint.iacr.org/2020/1261)）中的时候，以及递归嵌入自身的时候。（欲了解嵌套的签名方案，见 [Nested MuSig2](/publication/2026-02-12-nested-musig2) 论文。）
2. 除了最初的密钥生成启动仪式，Arctic 不会加入敏感状态，因为所有 VPSS 输出都可以确定性地重新计算出来。（FROST 要求为每一个签名会话存储一个新的 nonce 秘密值（即贡献的那个）。）
3. Arctic 在最初的密钥生成仪式之后，提供完全确定性的功能。在许多环境下，这就有可能让攻击者更难制造 nonce 重用。

另一方面，Arctic 相对 FROST 的主要缺点是：

1. 因为 PSS/RSS 启动装置，Arctic [无法容纳很大的签名人集合](https://www.btcstudy.org/2026/07/16/some-secrets-shared-by-dadav-kohen-part-1/#%E5%A4%8D%E5%88%B6%E5%9E%8B%E7%A7%98%E5%AF%86%E5%80%BC%E5%88%86%E5%89%B2)（比如，无法超过 20 个）。
2. Arctic 需要诚实参与者占多数的假设。

不过，第二点也有一些引人误解，因为，首先，可以把 VPSS 验证替换成 ZKP，从而消除这个诚实参与者占多数的假设；其次，也有一个 Arctic 的变种使用 PSS 而完全不设验证，因此不需要诚实参与者占多数的假设（我正在撰写这种变种及其安全证明）。因此，在这里主要需要考虑的取舍就是上面列出的三项好处，与大量签名人参与时候的状态和计算规模。因此，因为阈值签名的绝大部分应用，都不会超过 10 个签名人，我个人认为 FROST 与基于 PSS 的门限签名（比如 Arctic 的变种）相比，在绝大部应用场景下都不如，尤其是在有良好定义的签名会话标识符的协议中。

## 结论

在本文中，我们介绍了 Shamir 秘密值分割和复制型秘密值分割，以及它们背后的数学工具和分布式密钥生成。我们讨论了为什么 SSS 会受到偏爱成为常用的秘密值分割工具，但我们也讨论了依然有许多场景下，使用（可验证的）伪随机秘密值分割（V）PSS 会更好 —— 后者是一种基于 RSS 的构造，可以在一次 RSS 启动仪式后产生无尽数量的确定性生成的 SSS 分散的秘密值。最后，我们简要讨论了 （V）PSS 在 Schnorr 门限签名中的用法，作为对 FROST 的替代；后者极为知名，但未必是最优的 Schnorr 门限签名。

敬请期待未来对 Schnorr 门限签名和嵌套 Schnorr 签名方案的深入分析！

（完）