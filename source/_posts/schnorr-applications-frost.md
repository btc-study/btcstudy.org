---
title: 'Schnorr 签名系列：最优轮次的灵活 Schnorr 门限签名（FROST）'
author: 'Nadav Kohen'
date: '2021/12/09 17:52:12'
cover: '../images/schnorr-applications-batch-verification/g_logo2.png'
excerpt: '本文会用非常技术化的语言讲解 FROST'
tags:
- 密码学
mathjax: true
---


> *作者：Nadav Kohen*
>
> *来源：<https://suredbits.com/schnorr-applications-frost/>*
>
> *[前篇中文译本](https://www.btcstudy.org/2021/12/08/schnorr-applications-threshold-signatures/)*



在本系列的上一篇文章中，我们讨论了门限签名方案和用法，这一期我们延续上文的话题，解释 FROST。FROST 可以被认为是 [MuSig](https://suredbits.com/schnorr-applications-musig/)（[中文译本](https://www.btcstudy.org/2021/11/29/schnorr-applications-musig/)）利用分布式的密钥生成（distributed key generation）延伸成了门限签名（从 n-n 变成了 t-n）。FROST 在某种意义上是迄今我们所知的最通用的门限签名，因为它有令人惊艳的特点：它所生成的密钥和签名与普通的 Schnorr 单一密钥和签名（在链上）是无法区别的！本文会用非常技术化的语言讲解 FROST，先建立分布式密钥生成的概念，再把它应用到 Schnorr 签名上。

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

## 实现 FROST

[最优轮次的灵活 Schnorr 门限签名（FROST）](https://eprint.iacr.org/2020/852.pdf)的构造是非常优雅的，并且依赖于我们本系列还没讲过的一些密码学和数学元件。我准备一点一点构造出 FROST（或者说其简化的版本），不要求读者熟悉这里的任何一个概念。但还是要说一句，如果你还不熟悉这里的数学，请读慢一点，花点时间来理解它们。

### 元件 1：多项式插值法（Polynomial Interpolation）

MuSig 这样的 n-n 方案可以使用公有密钥的加法碎片（即，聚合密钥就是各参与者密钥的加法和），但 t-n 的门限方案必须使用一些构造来让任意 t 方都可以控制共有密钥。我们没法使用把参与者的密钥直接加起来的方案，因为这样一来，要想控制总和密钥并签名就必须每个人都参与了。具体来说，我们需要一种数学对象，n 个参与者各自持有一部分消息，但只要其中任意 t 个参与者一起，就可以计算出这个对象。

事实证明，我们总是可以使用多项式来实现这种对象。所谓多项式，就是一条平面上的一条曲线，包含了所有满足等式 $y = a_nx^n + a_{n-1}x^{n-1} + ... + a_2x^2 + a_1x + a_0$ 的 （x, y)，其中系数 a<sub>n</sub>, ... , a<sub>0</sub> 都是一些定值（模 p）。给定 a<sub>n</sub> 不为 0，我们称 n 为这个多项式的阶数。那么一个阶数为 1 e多项式可以写成 $y = a_1x + a_0$ 。[这里有一个绘图网站](https://www.desmos.com/calculator/nproi7ulnj)，你可以输入多项式来观察其图像，感受一下。事实上，任何一个 n 阶多项式，都可以由 n+1 个点来唯一确定（如果你感兴趣，[这里有许多证明](https://math.stackexchange.com/questions/837902/prove-there-exists-a-unique-n-th-degree-polynomial-that-passes-through-n1-p)）。因此，给定 n+1 个点 $(1, y_1), ... , (n+1, y_{n+1})$ ，我们就能确定唯一一个包含了这些点的 n 阶多项式，方法如下：

1. 对于 i = 1, ... , n+1，令
   $$
   \begin{align}
      P_i(x) &= \prod ^{n+1} _ {j=1, j\neq i} (x - j)\\
       &= (x - 1)(x - 2)...(x - (i-1))(x - (i+1))...(x - (n+1))
   \end{align}
   $$
   也就是对所有不等于 i 的 j，(x - j) 的乘积


2. 定义

$$P(x) = \sum_{i = 1}^{n+1} y_i \prod ^{n+1} _ {j=1, j\neq i} \frac{x - j}{i - j}$$

$$ = \sum_ {i = 1}^{n+1} y_i \frac{P_ i(x)}{P_i(i)}$$

$$ = y_1\frac{P_1(x)}{P_1(1)} + y_2\frac{P_2(x)}{P_2(2)} + ... + y_{n+1}\frac{P_{n+1}(x)}{P_{n+1}(n+1)}$$

注意，对于等于 1, ... , n + 1 的任一 i，都有 $P(i) = 0 + 0 + 0 + ... + 0 + y_i\frac{P_i(i)}{P_i(i)} + 0 + ... + 0 = y_i$ ，这就意味着 P(x) 必定是个独一无二的多项式。

我们已经知道了，如何根据给定 n+1 个点，构造出完整的 n 阶多项式。这个过程叫做多项式插值法。值得注意的是，我们可以在上述共识中代入 0 从而计算出 P(0) 

$$P(0) = \sum_{i=1}^{n+1}y_i λ _ i$$

$$ = y_1λ _ 1 + y_2λ _ 2 + ... + y _ {n+1}λ _ {n+1}$$

这里的 $λ _ i = \prod ^{n+1} _ {j=1, j\neq i} \frac{j}{j-i} = (\frac{1}{1-i})(\frac{2}{2-i})...(\frac{n+1}{n+1-i})$（跳过了第 i 项）是一个常数。

### 元件 2：Shamir 私钥分享（Secret Sharing）

就像我上面所说的，私钥分享（也即私钥分割）就是让 n 个参与者每人都拥有私钥的一些 “碎片（份额）”，而参与者可以按某种方式计算出底层的共有私钥。举个例子，假如我在手机上存放着私钥 x，但我担心手机会丢，于是我找了三个信得过的朋友，给了他们每人一个我的私钥的碎片：我分别给了两给朋友 a 和 b，都是随机数（模 p），而第三个朋友我给了他 (x - a - b)，看起来也像无意义的随机数。现在，即使我的朋友串通了起来，也无法知道关于 x 的信息，而假如我真的弄丢了手机，需要找回私钥时，我可以让他们把手上的随机数交回给我，三者相加即是我原来的私钥。

上面这个例子演示的方案通常被称为相加型私钥分割。它可能是最简单的私钥分割方案，但它有个缺点，它只能用于 n-n 的密钥分享，不支持门限设置。而且，只要有一个人弄丢了手上的碎片，其他人手上的也就失效了。

反过来，我可以构造一条直线 f，其 y 轴截距就是我的私钥，f(0) = x。我可以给我的朋友们 3 个点：( 1, f(1) )，( 2, f(2) )，( 3, f(3) )。相应地，我只需要请求两个朋友给我他们手上的碎片，即可使用上面的插值法计算出我的私钥！更一般化地来说，假设我需要给 n 个朋友分享私钥并希望设置 t < n 的门限，我们可以构造出一个 t-1 阶的多项式，并给每个朋友一个（多项式曲线上的）点。这个多项式的诸系数 a<sub>i</sub> 可以都使用随机数，除了 a<sub>0</sub> 要设置成你的私钥。这种方案叫做 “Shamir 密钥分割”。

属于参与者集合的任意子集 S = {k<sub>1</sub>, ... , k<sub>t</sub>} 的相应 Shamir 碎片 y<sub>k1</sub>, ... , y<sub>kt</sub>，令 y<sub>ki</sub> 与 $λ _ i = \prod ^{n+1} _ {j=1, j\neq i} \frac{j}{j-i}$ 相乘得出相加型碎片，因为共有密钥 

$$f(0) = y _ {k1}λ _ {k1} + y _ {k2}λ _ {k2} + ... + y _ {kt}λ _ {k1t}$$

迄今为止，我们只考虑到了有可信发起者（trusted dealer）的私钥分割情形，但我们还需要一种分割方案，在我们希望恢复出共有私钥时不那么需要信任。这样的方案叫做 “可验证的私钥分割方案”。假设我是个不可信的发起者（untrusted dealer），我要跟 n 个不信任我的参与者形成一个 t-n 的私钥分割。我像上面那样做了 Shamir 私钥分割（给了每个参与者 t-1 阶的多项式曲线上的一个点），此外，我还向所有人都广播了我的多项式的每个系数的公钥，即 A<sub>0</sub> = a<sub>0</sub> * G，...，A<sub>t-1</sub> = a<sub>t-1</sub> * G。在收到一个碎片( i, f(i) ) 之后，每个人都可以检查 f(i) * G 是否等于 $i^{t-1} * A_{t-1} + ... + i * A_1 + A_0$ 来验证自己的碎片。任何一方，如果发现这个验证不通过，他们就可以告诉所有其他人并公开自己的碎片。其他所有人也都公开自己的份额，这样就可以计算出那个多项式，以及各系数的公钥。要么发起者搞了鬼，以后大家再也不带他玩；要么那个参与者撒谎了，大家一起排挤他。无论如何，只有所有人都是诚实的，这个过程才继续；任何人尝试欺诈，过程就终止。

### 元件 3：分布式密钥生成

现在，最有意思的部分来啦！我们已经有了可验证的门限私钥分割方案，可以通过一个叫做 “分布式密钥生成” 的流程来创建一个共有私钥了。注意，迄今为止，我们讲的都是如何把发起者已经知道的私钥 x 分割给多方，现在，我们要讨论的是如何构造一个没有任何一方完整掌握的私钥。

可以这样来实现：所有 n 方异步地生成一个随机秘密值，所有 n 方都对自己的秘密值做一次可验证的密钥分割。完成之后，所有的碎片都得到了验证，每一方都可以把自己手上所有碎片的 y 值加总起来，获得聚合多项式的一个碎片。注意，如果 f(x) 和 g(x) 是两个多项式，那么 (f+g)(x) 就是两个多项式的和，并且 f(i) + g(i) = (f+g)(i)；所以，各碎片的总和就是多项式总和的一个碎片。因此，在整个流程结束之后，各方都拥有了聚合多项式的一个碎片；这个聚合多项式就存储着所有人秘密值的和，因为 $f_1(0) + f_2(0) + ... + f_n(0) = (f_1 + f_2 + ... + f_n)(0)$。更进一步地，只要每一方的多项式都是 t-1 阶的，聚合多项式也会拥有相同的阶数，所以聚合多项式将支持 t-n 门限方案！

我们再用更多细节来过一遍。每一个参与者都有唯一的身份号码，从 1 到 n。参与者 i 通过生成 t 个随机秘密值 $a _ {i0}, ... , a _ {i(t-1)}$ 作为系数来生成一个随机的、t-1 阶的多项式。下一步，每一方都被要求提供对 a<sub>i0</sub> 的知识证明，因为这是他们对共有私钥的贡献。这是使用[非交互式 Schnorr ID 协议](https://suredbits.com/schnorr-security-part-1-schnorr-id-protocol/)来证明的，使用一个随机 nonce 值 k<sub>i</sub>，并使用其个人 ID（i）、公钥 a<sub>i0</sub> * G ， k<sub>i</sub> * G 和所有其它与分布式密钥生成协议相关的语境的哈希值来作为挑战值 c<sub>i</sub> 。即，$sig_i = (k_i * G, k_i + c _ ia _ {i0})$。每一个参与者都向其他所有人广播自己的签名以及自己的多项式所有系数的公钥 $a _ {i0} * G, ... , a _ {i(t-1)} * G$。收到这些值后，所有参与者都验证其他人的签名。这是第一轮的交互。

在第二轮交互中，每一个参与者都安全地向其他每一位参与者发送碎片 (i, f<sub>k</sub>(i))，这里的 k 是发送方的 id，而 k 是接收方的 id。这样，i 就可以使用 k 在上一轮中公开的系数公钥来验证得到的碎片。接收完所有对手方的碎片之后，每一个参与者都计算 $s_i = f_1(i) + ... + f_n(i)$，这个 s<sub>i</sub> 就是 TA 所掌握的聚合私钥的碎片。

这个分布式密钥生成（DKG）协议只要求两轮的交互，交互完之后，每一方都有了这个持久的（门限）聚合私钥的一个有效碎片（而且，因为有了第一轮中各参与者公布的自己的多项式系数的公钥，每个人都能计算其他人的公钥 s<sub>i</sub> * G，并相应得到聚合公钥，就是这些公钥的和）。

## FROST 签名流程

现在，我们已经准备好构造一些门限签名了！我们假设 n 各参与方在过去已经根据上面的流程，创建了一个 t-n 的门限共有私钥，且每个人都拥有一个有效碎片。

我们从一个预备轮开始，这一轮可以预先完成（比如在密钥生成的时候），但也可以作为额外的一轮，在签名之前完成。在这一轮中，参与者 i 创建一个随机的一次性 nonce 对 $(d _ {i1}, e _ {i1}), (d _ {i2}, e _ {i2}), ... , (d _ {iπ}, e _ {iπ})$，其中 π 是这个参与者再次执行预处理轮之前可以参与生成签名的次数；然后为这些一次性秘密值发布相应的公钥 $(D _ {ij}, E _ {ij})$。

假设一个分布式密钥已经生成，预处理也做完了，我们已经完成了签名消息 m 的准备工作。一些参与者（比如其中一个签名者）要扮演签名聚合人（SA）的角色，选出一组 t 个签名者（一般来说也包括他们自己），记这个 id 列表为 S。这个 SA 也要负责为每个签名者检索尚未使用的公钥 $(D_{ij}, E_{ij})$，我们把这个列表记为 B。SA 会把 B 和 m 发给 S 中的每个人。对于 S 中的每个 k，一个绑定值 ρ<sub>i</sub> 定义成 i、B 和消息的哈希值（使用 B 是为了承诺这个人和所有其他人的 nonce）。这些绑定值是所有签名者都要计算的。而这次签名的聚合 nonce 值 R，等于 S 中的每个 k 的点 $D _ {ki} + ρ _ k * E _ {kj}$ 的和，而相应地，被签名的挑战哈希值就是聚合公钥、R 和消息三者的哈希值。

此时，每一个签名者在使用手上的持久私钥碎片 s<sub>i</sub>（来自 DKG）来创建碎片签名（partial signature）。因为 s<sub>i</sub> 在上面已经用了（代表私钥），我们使用 z<sub>i</sub> 来表示碎片签名：

$$z_i = d _ {ij} + ρ _ i * e _ {ij} + H(X, R, m) * s_i * λ _ i$$

注意，这是一个 Schnorr 碎片签名，是使用一次性私钥 $d _ {ij} + ρ _ i * e _ {ij}$ 和私钥 $s_i * λ _ i$ 对消息 m 签出来的。你应该记得，$λ _ i$ 是一个常数，是为了让任何可能的 S 将 Shamir 私钥碎片转化成相加碎片（即，聚合私钥就等于 t 个 $s_i * λ _ i$ 的和）（在多项式插值法一节里）。

签名聚合者 SA 收到所有这些碎片签名后一一验证。假设所有碎片签名都能通过验证，SA 就把所有签名简单加总：

$$z = z_1 + ... + z_t$$

最终的 (R, z) 就是一个有效的 Schnorr 签名，是属于从最开始的 DKG 中生成的（门限）聚合密钥的签名。

好了，我们对 Schnorr 门限签名的讨论就结束了。敬请期待未来关于 Schnorr 盲签名和 Taproot 的篇章。

（完）