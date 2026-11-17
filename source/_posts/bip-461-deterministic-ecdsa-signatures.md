---
title: 'BIP 461：确定性的 ECDSA 签名'
author: 'Liam Gilligan'
date: '2026/11/17 19:12:19'
cover: ''
excerpt: '本文档详细说明了一种 ECDSA 签名算法， 其输出是完全由签名的私钥和要签名的消息决定的'
tags:
- BIP
---


> *作者：Liam Gilligan*
> 
> *来源：<https://github.com/bitcoin/bips/blob/master/bip-0461.md>*



## 摘要

本文档详细说明了一种 ECDSA 签名算法， 其输出是完全由签名的私钥和要签名的消息决定的。由此得到的签名，在 DER 编码时，最多是 70 字节，而不像理论的 ECDSA 签名那样最多可能有 72 字节。

## 动机

在当前的共识规则中，一个有效的 ECDSA 签名，不管对什么消息、用什么形式的密钥，都有两个方面的自由度： 签名器自由选择 nonce，从而固定 *r* <sup><a href='#note1' id='jump-1-0'>1</a></sup>；并且，使用同一个 *r* ，*s* 有两种可能的值。一个恶意的签名器可以利用这种自由，生成出泄露密钥材料的签名 <sup><a href='#note2' id='jump-2-0'>2</a></sup>；但是，一种标准化的、确定性的签名算法，可以消除这种自由。签名器若要遵循这样的算法，就无法偷偷摸摸地泄露密钥材料：密钥的持有者可以将同一个私钥导入两个独立的签名器，要求两者签名相同的消息并对比结果；任何一丝差别都将表明，至少一个签名器是没有遵循这套规范的。

确定性算法的标准化能够启用泄露检查，因为没有标准化的算法并没要其它实现可供交叉检查。
我是分隔符

## 定义

- 数值 *(n - 1) / 2*  为**曲线阶数的一半**，这里的 *n* 就是 secp256k1 曲线的阶数。
- 当一个签名 *(r, s)* 中的 *r < 2<sup>255</sup>* 时，我们说它是 “**低 r 的**”；反之，则是 “**高 r 的**”。
- 当一个签名 *(r, s)* 中的 *s* 小于或等于曲线阶数的一半时，我们说它是 “**低 s 的**”；反之，则是 “**高 s 的**”。
- “**低 r 研磨**” 指的是不断使用新的 nonce 来生成新的签名、直至找到一个低 r 签名的过程。
- “**低 s 归一化**” 指的是将签名 *(r, s)* 替换成等价的签名 *(r, n - s)* 的过程，给定 *(r, s)* 是高 s 签名 <sup><a href='#note3' id='jump-3-0'>3</a></sup>。

## 详述

### 记号

使用下列转化，其中的常量都依照 [secp256k1](https://www.secg.org/sec2-v2.pdf) 的定义。

- 小写的变量代表整数、字节数组或是签名：

  - 常量 *p* 指的是域空间（field 大小），*0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEFFFFFC2F* 。
  - 常量 *n* 指的是曲线的阶数，*0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEBAAEDCE6AF48A03BBFD25E8CD0364141* 。
  - 常量 *half_order* 指的是曲线阶数的一半，*(n - 1) / 2*  。
  - 常量 *empty_bytestring*（空字节串）指的是长度为零的字节数组。
  - 一个 ECDSA 签名 *sig* 0 可以表示为一对整数 *(r, s)* ，其中 *0 < r, s < n* 。
- 点落在满足等式 *y<sup>2</sup> = x<sup>3</sup> + 7* 且位于模 p 整数域（integers modulo *p*）的曲线上：
  - 无限远处的点是这个曲线群（group）的身份元（identity element），也是唯一一个没有 X 坐标值和 Y 坐标值的点。
  -  函数 *is_infinite(P)* 会判断一个点 *P* 是不是无限远处的点。
  - *x(P)* 和 *y(P)* 是在范围 *0..p-1* 内的整数，指的是一个点 *P* 的 X 坐标值和 Y 坐标值（假定它不是无限远处的点）。
  - 常量 *G* 指的是基本点（base point），其中*x(G) = 0x79BE667EF9DCBBAC55A06295CE870B07029BFCDB2DCE28D959F2815B16F81798* ，并且 *y(G) = 0x483ADA7726A3C4655DA4FBFC0E1108A8FD17B448A68554199C47D08FFB10D4B8* 。
  - 点加法指的是普通的[椭圆曲线群运算](https://en.wikipedia.org/wiki/Elliptic_curve#The_group_law)。
  - [一个整数和一个点的乘法（⋅）](https://en.wikipedia.org/wiki/Elliptic_curve_point_multiplication)指的是多次应用群运算。
- 函数和运算：
  - “||” 指的是字节数组拼接。
  - 函数 *int(x)* ，在 *x* 是一个 32 字节长的数组时，返回 256 比特的无符号整数（unsigner integer），这个整数的大端序编码（most significant byte first encoding）的值等于 *x* 。
  - 函数 *bytes(l, x)* ，在 *x* 是一个整数时，返回 *x* 的 *l* 字节编码，大端序。
  - 函数 *bytes_le(l, x)* ，在 *x* 是一个整数时，返回 *x* 的 *l* 字节编码，小端序（least significant byte first）。
  - 函数 *fill_bytes(l, x)* ，在 *x* 是一个字节时，返回长度为 *l* 的字节数字，其中的每个字节都是 *x* 。
  - 函数 *hmac(k, m)* ，当 *k* 和 *m* 都是字节数组时，返回私钥 *k* 对消息 *m* 的 HMAC-SHA256 哈希值 <sup><a href='#note4' id='jump-4-0'>4</a></sup>。
  - *x<sup>-1</sup>* 指的是整数 *x* 模 *n* 的模乘法逆元。

### 算法

本节规定的以下算法：

- *nonce_rfc6979(sk, msghash, extra, count)* 确定性地派生出一个 nonce 。
- *sign(sk, msghash, extra)* 在一个给定的额外数据输入下产生一个 ECDSA 签名。
- *verify(sig, P, msghash)* 检查一个 ECDSA 签名。
- *DeterministicSign(sk, msghash)* 不断尝试 *sign* 直到 *r* 是低的，然后归一化 *s* 。

#### nonce 派生

输入：

- 私钥 *sk*：一个 32 字节长的数组
- 消息哈希值 *msghash* ：一个 32 字节长的数组
- 额外的字节 *extra* ：一个字节数组，可以是空的
- 尝试计数器 *count* ：一个整数，*count >= 0*

算法 *nonce_rfc6979(sk, msghash, extra, count)* 定义如下： <sup><a href='#note5' id='jump-5-0'>5</a></sup>

- 令 *h = bytes(32, int(msghash) mod n)*  <sup><a href='#note6' id='jump-6-0'>6</a></sup>
- 令 *V = fill_bytes(32, 0x01)*
- 令 *K = fill_bytes(32, 0x00)*
- 令 *K = hmac(K, V || 0x00 || sk || h || extra)*
- 令 *V = hmac(K, V)*
- 令 *K = hmac(K, V || 0x01 || sk || h || extra)*
- 令 *V = hmac(K, V)*
- 令 *V = hmac(K, V)*
- 对  *j = 1, ..., count* ：
  - 令 *K = hmac(K, V || 0x00)*
  - 令 *V = hmac(K, V)*
  - 令 *V = hmac(K, V)*
- 返回 *V*

#### ECDSA 签名

输入：

- 私钥 *sk*：一个 32 字节长的数组
- 消息哈希值 *msghash* ：一个 32 字节长的数组
- 额外的字节 *extra* ：一个字节数组，可以是空的

算法 *sign(sk, msghash, extra)* 定义如下：

- 令 *d = int(sk)*
- 如果 *d = 0* 或 *d >= n*，失败
- 对  *count = 0, 1, ..., 2<sup>32</sup> - 1* ： <sup><a href='#note7' id='jump-7-0'>7</a></sup>
  - 令 *nonce = nonce_rfc6979(sk, msghash, extra, count)*
  - 令 *k = int(nonce)*
  - 即使 *k = 0* 或 *k >= n* ，继续
  - 令 *R = k⋅G*
  - 令 *r = x(R) mod n*
  - 即使 *r = 0* ，继续
  - 令 *s = k-1 \* (d \* r + int(msghash)) mod n*
  - 即使 *s = 0* ，继续
  - 返回 *(r, s)*
- 失败


#### ECDSA 验证

输入：

- 签名 *sig* ：*(r, s)* 
- 公钥 *P* ：一个点
- 消息的哈希值  *msghash* ：一个 32 字节长的数组

算法  *verify(sig, P, msghash)* 定义如下：

- 如果 *is_infinite(P)* ：
  - 返回 *false*
- 如果 *x(P) >= p* 或者 *y(P) >= p* ：
  - 返回 *false*
- 如果 *y(P)<sup>2</sup> ≠ x(P)<sup>3</sup> + 7 mod p* ：
  - 返回 *false*
- 令 *(r, s) = sig*
- 如果 *r <= 0*  或者 *r >= n* ：
  - 返回 *false*
- 如果 *s <= 0* 或者 *s >= n* ：
  - 返回 *false*
- 令 *w = s<sup>-1</sup>*
- 令 *u<sub>1</sub> = w \* int(msghash) mod n*
- 令 *u<sub>2</sub> = w \* r mod n*
- 令 *R = u<sub>1</sub>⋅G + u<sub>2</sub>⋅P*
- 如果 *is_infinite(R)* ：
  - 返回 *false*
- 如果 *x(R) mod n ≠ r* ：
  - 返回 *false*
- 返回 *true*


#### 确定性签名

输入：

- 私钥 *sk*：一个 32 字节长的数组
- 消息哈希值 *msghash* ：一个 32 字节长的数组

算法 *DeterministicSign(sk, msghash)* 定义如下。**研磨计数器**在第一次调用 *sign* 时为 0 ，不提供额外的数据，并为后续每一次调用采用循环变量 *i* 的值。

- 如果 *int(sk) = 0*  或者 *int(sk) >= n* ，失败
- 令 *(r, s) = sign(sk, msghash, empty_bytestring)*  <sup><a href='#note8' id='jump-8-0'>8</a></sup>
- 令 *i = 1*
- 如果 *r >= 2<sup>255</sup>* ： <sup><a href='#note9' id='jump-9-0'>9</a></sup>
  - 如果 *i >= 2<sup>32</sup>* ：
    - 失败
  - 令 *extra = bytes_le(4, i) || fill_bytes(28, 0x00)*
  - 令 *(r, s) = sign(sk, msghash, extra)*
  - 令 *i = i + 1*
- 如果 *s > half_order* ：
  - 令 *s = n - s*
- 令 *P = int(sk)⋅G*
- 如果 *verify((r, s), P, msghash)* 返回 *false* ，放弃
- 返回 *(r, s)*

谓词 *r >= 2<sup>255</sup>*  等价于测试 *bytes(32, r)* 的最高位字节大于或等于 *0x80* 。

## 理由

比特币对 ECDSA 签名的编码方式是一种严格的 DER 形式，带有额外的 1 字节长的 sighash 标签，它将 *r* 和 *s* 序列化为任意程度的大端序有符号整数 <sup><a href='#note13' id='jump-13-0'>13</a></sup> 。它们的编码是有符号的，意味着哪怕 *r* 和 *s* 在作为无符号整数时都可以编码为 32 字节（或更少），如果其最高比特置 1，就必须带有一个 null 字节，使得两部分的长度都是 33 字节。DER 编码的 ECDSA 签名最大长度是 72 字节，加上 sighash 标签，就成了 73 字节。

本提案所指定的签名算法，利用了 *低 r 研磨* 和 *低 s 归一化* <sup><a href='#note14' id='jump-14-0'>14</a></sup>，从而排他地产生 *低 r 且 低 s 的签名*。这样产生的签名 —— 在 DER 编码下 —— 最大只有 70 字节（加上 sighash 标签是 71 字节） <sup><a href='#note15' id='jump-15-0'>15</a></sup> 。对于归一化 *s* 就不研磨 *r* 的签名器，低 *r* 研磨在传统交易输入上平均每个签名可以节约 0.5 字节，在 v0 隔离见证输入上可以节约  0.125 字节 <sup><a href='#note16' id='jump-16-0'>16</a></sup>。在一个 2-of-3 的 P2SH 输入中，它平均可以节约 2.5 字节，因为一个 *高 r* 签名就可能让输入脚本的长度指示符从 1 个字节变成 3 个字节。而代价是很偏倚的：*低 r 研磨* 需要一次额外的签名操作，而 *低 s 归一化* 只需要一次标量减法。普遍采用这种算法是值得的，即使我们不考虑这些节约，因为不研磨的签名器会因为在链上留下 *高 r* 签名而被识别出来。 

### 低 *r* 研磨

#### 为什么要使用 RFC 6979

研磨需要使用被私钥和消息决定的确定性 nonce 派生方法，然后额外采用一个计数器，从而可以在相同的私钥和消息上产生新的、没有关联的 nonce <sup><a href='#note18' id='jump-18-0'>18</a></sup> 。RFC 6979 提供的就是这样的东西：它是 IETF 的用于 ECDSA 的标准确定性nonce 派生方法，并且其文件的 3.6 章节允许一个额外的数据输入，其中它还使用了签名作为一个例子： <sup><a href='#note19' id='jump-19-0'>19</a></sup>

> 只要额外的数据 k' 是不重复的（例如，一个签名计数器，或者一个单调时钟），就足以保证“看起来随机” 的签名是不可辨别的（在密码学意义上），与普通的 （EC）DSA 签名无从区别。

#### 潜在的另类研磨方法

**每次尝试都使用一个新的随机 nonce** 。每次都从一个密码学安全的随机源采集候选 nonce，也能产生互无关联的 nonce ，并且也是产生低 *r* 签名的有效方法。这样的方法没有被采用，是因为这样产生的签名是无法复现的，也就产生了 “动机” 章节所述的泄露问题。随机性可以提供一定的防止 “故障注入（fault injection）” 的保护，这是为什么 [BIP 340](https://github.com/bitcoin/bips/blob/master/bip-0340.mediawiki) 要为 Schnorr 签名推荐使用它的原因。而且，将确定性派生用于 ECDSA，在比特币世界里已经是广泛采用的实践，因为 RFC 6979 是 libsecp256k1 的默认 nonce 函数，并且 Bitcoin Core 是显式要求它的 <sup><a href='#note20' id='jump-20-0'>20</a></sup>。

**为更小的 *r* 而研磨**。为了得到更小的 *r* 来节约空间，它必须小上整整一个字节，因此，需要将开头的 9 个比特都置 0，而不能仅仅将第一个比特置 0 。计算这样的一个 *r*  值将需要 512 次签名运算（平均而言），而不像常规的 *低 r 研磨* 那样只需要两次  <sup><a href='#note9' id='jump-9-1'>9</a></sup> 。为更小的 *r* 而研磨，是太过昂贵了，无法广泛采用。因为很少签名器会这样做，而且这样做的签名器还会在链上被识别出来 <sup><a href='#note21' id='jump-21-0'>21</a></sup>。

**使用 λ 自同态加速研磨**。曾经有人建议使用 secp256k1 的 λ 自同态来加速计算替代性 nonce <sup><a href='#note22' id='jump-22-0'>22</a></sup>。此处所述的 *低 r 研磨* 平均来说只需要两次点乘法。使用 λ 自同态的额外复杂性无法显著提升效果  <sup><a href='#note23' id='jump-23-0'>23</a></sup>。

## 后向兼容性

依据本规范所生成的签名都是普通的有效签名，并且在现有的共识规则下能够通过验证，因此是完全后向兼容的。

## 参考实现

出于开发和测试用途，我们提供了[CSV 格式的测试向量集合](https://github.com/bitcoin/bips/blob/master/bip-0461)；一个幼稚的、非常低效而且非常量实现的 [纯粹 Python 3.8 参考实现（签名和验证算法）](https://github.com/bitcoin/bips/blob/master/bip-0461/reference.py)；以及 [用于生成测试向量的脚本](https://github.com/bitcoin/bips/blob/master/bip-0461/gen_test_vectors.py)。这份参考实现只可用于演示，不可用于生产环境。

## 版权

本 BIP 才有 CC0-1.0 许可。

## 教主

1.<a id='note1'> </a>从技术上讲，签名器选择的是一个 nonce *k*，然后得到 *r = x(k⋅G) mod n*。除非能够求解离散对数问题，否则无法瞄准特定的 *r* 值；并且，整体上，只有大约一半的整数模 *n* 能够作为 *r*，因为 *r* 必须是一个椭圆曲线点的 X 坐标值。如果签名器能够自由选择 *k*，那么，结果就是能够自由决定 *r* 的值。 <a href='#jump-1-0'>↩</a>

2.<a id='note2'> </a>“[Dark Skippy](https://darkskippy.com/)” 是一种攻击手法，恶意的签名设备固件在看起来有效的签名的 nonce 中嵌入种子材料，从而，攻击者能够对在链上观察这些签名，然后复原出种子。Craig Raw 在本文档的背景中提到了这一点；详见[这条评论](https://github.com/bitcoin/bips/pull/2224#issuecomment-5114943404)。 <a href='#jump-2-0'>↩</a>

3.<a id='note3'> </a>低 *s* 归一化保持了签名的有效性：令 *(r, s)* 为一个高 *r* 签名，并且给定一个公钥 *P* 和消息哈希值 *msghash*，通过通过 *verify*（验证）；令签名 *(r, s')* 为一个低 *r* 签名，而 *s' = n - s* ；现在，我们看看它是否能通过 公钥 *P* 和消息哈希值 *msghash* 的 *verify*。对 *P*、*msghash* 和 *r* 的检查不涉及 *r* ，因此保持不变；而 *s'* 也能通过范围检查，因为 *0 < s < n* 就意味着 *0 < n - s < n* 。因为 *s' ≡ -s (mod n)*，*w' = -w* ，所以  *u<sub>1</sub>' = -u<sub>1</sub>* ，*u<sub>2</sub>' = -u<sub>2</sub>*，并且相应地，*R' = -R* 。一个无限远的点的 X 坐标值，即使取负也是不变的，所以 *x(R') mod n = r* ，因此 *verify* 会通过，所以低 *s* 归一化保持了有效性。 <a href='#jump-3-0'>↩</a>

4.<a id='note4'> </a>[RFC 2104: HMAC：消息真实性的带密钥哈希](https://www.rfc-editor.org/rfc/rfc2104)，使用 SHA-256 实例化，如 [FIPS 180-4](https://nvlpubs.nist.gov/nistpubs/FIPS/NIST.FIPS.180-4.pdf) 所述。 <a href='#jump-4-0'>↩</a>

5.<a id='note5'> </a>*K* 和 *V* 是基于 HMAC 的生成器的内部状态变量，如 [RFC 6979 section 3.2](https://www.rfc-editor.org/rfc/rfc6979#section-3.2) 所指定的，并且沿用了其名称。两者都是 32 字节长的数组，不是椭圆曲线点，并且 *K* 与 nonce *k* 没有关联。 <a href='#jump-5-0'>↩</a>

6.<a id='note6'> </a>这个减法是 RFC 6979 中的 *bits2octets(h1)*，为其 [section 3.2d](https://www.rfc-editor.org/rfc/rfc6979#section-3.2) 所要求。它没有效果，除非 *int(msghash) >= n* ，这样的事发生的概率大概是 1.27·2<sup>-128</sup>。libsecp256k1 在 `nonce_function_rfc6979` 中执行它作为 `msgmod32`；详见 [libsecp256k1 `src/secp256k1.c`](https://github.com/bitcoin-core/secp256k1/blob/master/src/secp256k1.c) 。`Bitcoin Core` 在 v24.0 中开始使用这种减法；但从 v0.17.0 到 v23.0 都使用未减的哈希值。 <a href='#jump-6-0'>↩</a>

7.<a id='note7'> </a>*count* 在不改变 *extra* 的前提下推进 RFC 6979 生成器，并且与研磨计数器 *i* 是不一样的。 libsecp256k1 在派生的 nonce 落到 *[1, n-1]* 范围之外、或者结果的 *r* 或 *s* 为 0 时，也会递增同样的计数器；详见 [libsecp256k1 `src/secp256k1.c`](https://github.com/bitcoin-core/secp256k1/blob/master/src/secp256k1.c) 中的 `secp256k1_ecdsa_sign_inner` ，它在两种情况下都会重试，而不是失败。这两种条件的发生概率都在 2<sup>-128</sup> 量级甚至更小，，所以，在现实中，每一个产生的签名的 *count* 值都是 0 。因为 *sign*（签名）会拒绝超出范围的私钥，而 *DeterministicSign* 会在进入循环之前拒绝这样的私钥，所以，不会有私钥能让每一次尝试都失败，所以在现实种，这个循环的 *Fail*（失败）分支是不会出发的。因此，软件实现可以省略这种重复尝试、在遇到第一个无法使用的 nonce 时就传出失败。重试是建议做法，并且也没有什么代价；但两种选择都不会影响测试向量和互操作性。 <a href='#jump-7-0'>↩</a>

8.<a id='note8'> </a>省略额外的数据会让 RFC 6979 的哈希运算使用 64 字节的种子，而不是 96 字节的种子，所以研磨计数器 *0* 不会产生 32 个空字节所产生的 nonce 。详见 [libsecp256k1 `src/secp256k1.c`](https://github.com/bitcoin-core/secp256k1/blob/master/src/secp256k1.c)、`nonce_function_rfc6979`，它指出，这种参数混合有不同的长度，所以无法混同。 <a href='#jump-8-0'>↩</a>

9.<a id='note9'> </a>出于一个事件的概率 *q*，在第一次成功之前的期望尝试次数就是 1/*q* 。低 *r* 出现在概率大约是 1/2 ，所以按此处规定的研磨平均来说需要两次，需要超过 *j* 次尝试的概率是 2<sup>-j</sup>，并且会结束的概率是 1 。Bitcoin Core 安排了一个 32 比特的计数器，在现实种是不会用尽的。研磨出一个小上一整个字节的  *r* 的概率是 *q = 2<sup>-9</sup>*，因此平均来说需要尝试 512 次。这里的阈值是 9 个比特而不是 8 个，因为只要开头的内容字节的最高位比特置 1，DER 就会复原填充的字节，因此 *r* 必须小于2<sup>247/sup>，而不是2<sup>248</sup>。 <a href='#jump-9-0'>↩</a> <a href='#jump-9-1'>↩</a>

10.<a id='note10'> </a>这个小端序的计数器是 `CKey::Sign` 用 `WriteLE32` 将计数器写入一个 32 字节的缓冲区的结果；详见 [`Bitcoin Core` `src/key.cpp`](https://github.com/bitcoin/bitcoin/blob/master/src/key.cpp)。

11.<a id='note11'> </a>[libsecp256k1 `src/ecdsa_impl.h`](https://github.com/bitcoin-core/secp256k1/blob/master/src/ecdsa_impl.h)，`secp256k1_ecdsa_sig_sign`： `high = secp256k1_scalar_is_high(sigs); secp256k1_scalar_cond_negate(sigs, high);`

12.<a id='note12'> </a>在签名离开签名器之前验证他，可以防止随机的或者攻击者出发的计算错误。这防止了在发布无效签名时泄露关于私钥的信息。建议这样做，但如果计算成本非常高，可以省略，代价是无法检测签名计算中的故障。 上述措辞取自 [BIP 340](https://github.com/bitcoin/bips/blob/master/bip-0340.mediawiki) 的签名算法中的等价步骤，该算法采用 BSD-2-Clause 许可。Bitcoin Core 在 [`CKey::Sign`](https://github.com/bitcoin/bitcoin/blob/master/src/key.cpp) 中无条件执行这种检查。因为检查无法替换产生的签名，省略它不会影响测试向量和互操作性。

13.<a id='note13'> </a>[BIP 66: 严格 DER 签名](https://github.com/bitcoin/bips/blob/master/bip-0066.mediawiki) 。 <a href='#jump-13-0'>↩</a>

14.<a id='note14'> </a>注意，带有高 *s* 签名的交易也是有效的，但当前，在标准的交易池策略中不会被转发：见 [Bitcoin Core `src/policy/policy.h`](https://github.com/bitcoin/bitcoin/blob/master/src/policy/policy.h)。 <a href='#jump-14-0'>↩</a>

15.<a id='note15'> </a>一个归一化 *s* 但不研磨的签名器（所产生的签名）会落在两个边界之间，在 DER 下是 71 字节。[BIP 62](https://github.com/bitcoin/bips/blob/master/bip-0062.mediawiki) “DER 编码” 说 “总的签名体积最大是 72 字节（平均是 71.494 字节）”，已经计入了 sighash 标签。平均大小是稍微小于 71.5 ，因为 *r* 偶尔会小于 32 字节。 <a href='#jump-15-0'>↩</a>

16.<a id='note16'> </a>[Bitcoin Optech: Low-r grinding](https://bitcoinops.org/en/topics/low-r-grinding/) 。 <a href='#jump-16-0'>↩</a>

17.<a id='note17'> </a>见（比如说）[这条评论](https://github.com/bitcoin/bitcoin/pull/13666#issuecomment-406053492)以及在 Bitcoin Core 中引入研磨的 PR 的相关讨论。

18.<a id='note18'> </a>两个公开的签名的 nonce 之间如果有攻击者可以发现的关系，则也会泄露私钥。不论是研磨的中间状态，还是成功产生签名的计数器，都不应该发布，从而约束会绑定在消息之间，而不是在单个研磨循环内。RFC 6979 在任何情况下都满足这两个方向。每次都从密码学安全随机源取出新 nonce 也能满足这个要求，只是最终产生的签名是不可复现的。 <a href='#jump-18-0'>↩</a>

19.<a id='note19'> </a>[RFC 6979: Deterministic Usage of the Digital Signature Algorithm (DSA) and Elliptic Curve Digital Signature Algorithm (ECDSA)](https://www.rfc-editor.org/rfc/rfc6979) 。额外的数据输入以及不重复的要求在 [section 3.6](https://www.rfc-editor.org/rfc/rfc6979#section-3.6) 给出。 <a href='#jump-19-0'>↩</a>

20.<a id='note20'> </a>`secp256k1_nonce_function_default` 是 `nonce_function_rfc6979`；详见 [libsecp256k1 `src/secp256k1.c`](https://github.com/bitcoin-core/secp256k1/blob/master/src/secp256k1.c) 。Bitcoin Core 向 `secp256k1_ecdsa_sign` 传入 `secp256k1_nonce_function_rfc6979`，在 [`CKey::Sign`](https://github.com/bitcoin/bitcoin/blob/master/src/key.cpp) 中。 <a href='#jump-20-0'>↩</a>

21.<a id='note21'> </a>[Bitcoin Core PR #13666, “总是使用低 R 值来产生签名”](https://github.com/bitcoin/bitcoin/pull/13666)，在  [`Bitcoin Core` v0.17.0](https://bitcoincore.org/en/releases/0.17.0/) 中发布。审核中的讨论也考虑了为更小的 *r* 而研磨；见 [这条评论](https://github.com/bitcoin/bitcoin/pull/13666#issuecomment-405116700)。 <a href='#jump-21-0'>↩</a>

22.<a id='note22'> </a>[在给 Bitcoin Core 引入研磨的 PR 的审核期间的建议](https://github.com/bitcoin/bitcoin/pull/13666#issuecomment-405116700)；这条回复以及下文讨论了它会产生的 nonce 的分布。 <a href='#jump-22-0'>↩</a>

23.<a id='note23'> </a>nonce *k* 的一次点乘法也会产生位于 *λk* 和 *λ<sup>2</sup>k* 之间的 *r* 值，其中 *λ* 是是一个素数立方单位根对群阶求模（a primitive cube root of unity modulo the group orde）；见 [libsecp256k1 `src/scalar_impl.h`](https://github.com/bitcoin-core/secp256k1/blob/master/src/scalar_impl.h)， `secp256k1_const_lambda`。因为签名无论如何都要计算一次点乘法，这样每个签名可以节约至多一次运算，并且捕获它需要签名流程之外的曲线算术。 <a href='#jump-23-0'>↩</a>