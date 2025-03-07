---
title: '盲化的两方 ECDSA 签名'
author: 'tomt1664'
date: '2022/08/17 15:32:21'
cover: ''
excerpt: '两方 ECDSA 签名的完全盲化形式，用到同态加密'
tags:
- 密码学
---


> *作者：tomt1664*
>
> *来源：<https://github.com/commerceblock/mercury/blob/master/doc/blind_2p_ecdsa.md>*
>
> *本文为 Mercury statechain 的文档，介绍的是盲化的两方 ECDSA 签名，Mercury 使用这种技术来实现盲化的 statechain。*

两方的 ECDSA（椭圆曲线签名算法）协议让两个互不信任的参与者可以安全地生成一个共有的公私钥对，而且既无需知晓另一方的私钥信息，也无需知晓整个私钥，就可以对一条双方一致认可的信息生成一个有效的 ECDSA 签名。我们提出了一种基于 Lindell [1] 协议的方法，让其中一方可以完全盲化地参与签名生成，这样 TA 就既不知道被签名的消息的内容，也不知道最终的签名是什么样。

## ECDSA 签名

标准的 ECDSA 运作流程如下。签名者具有私钥 ` x ` 及其对应的公钥 ` Q ` 。 ` Q ` 是一个椭圆曲线点，定义为 `Q = x.G ` ，这里的 ` G ` 是一个椭圆曲线 ` q ` 阶群的生成点，而 ` . ` 则是椭圆曲线点乘法（在这套记号中，大写字母表示椭圆曲线点，而小写字母表示标量）。 签名者签名消息  ` m ` ， ` H() ` 表示 SHA256 哈希函数。

1. 选择一个随机的一次性私钥 ` k <- Zq ` 
2. 计算 ` R = k.G ` 
3. 计算 ` r = r_x mod q ` ，其中  ` R = (r_x, r_y) ` 
4. 计算  ` s = k^-1(H(m) + rx) mod q ` 
5. 输出签名 `(r, s) ` 

 ` k^-1 ` 是私钥 ` k ` 的模逆（modular inverse）。标准 ECDSA 的一个关键特性就是  ` k ` 必须保持秘密，而且需要在签名后删除（即，不能用在另一个签名的生成中）。公开 ` k ` 或者复用它（用在另一个签名的生成中）会使其他人可以揭晓私钥 ` x ` 。

## 两方的 ECDSA 签名

互不信任的两方可以共同拥有一对公私钥 ` x ` 和 ` Q ` ，而且没有人知道完整的 ` x ` 、两方需要合作才能生成 ` Q ` 的有效签名。为了兼容 ECDSA 算法（通过模逆实现乘法），分割完整私钥的最好办法是生成乘法碎片，也即  ` x = x1x2 ` ， ` x1 ` 和 ` x2 ` 分别是第一方（` P1 `）和第二方（` P2 ` ）的私钥碎片。为了实现完整签名的多方计算，我们使用 Pailier 加密系统来执行同态加密，以计算 ` s ` 。

### 分布式密钥生成

 ` P1 ` 和 ` P2`可以合作生成共有私钥 ` x ` 的公钥 ` Q ` （ ` x ` 永远不会有显式的存在形式）。步骤如下：

1. ` P1 ` 选出一个随机私钥 ` x1 <- Zq ` ，然后计算 ` Q1 = x1.G ` 并发送给 ` P2 ` 
2.  ` P2 ` 选出一个随机私钥 ` x2 <- Zq ` ，然后计算 ` Q2 = x2.G ` 并发送给 ` P1 ` 
3.  ` P1 ` 计算 ` Q = x1.Q2 ` ，而 ` P2 ` 计算 ` Q = x2.Q1 ` 

为了在恶意敌手假设下保持安全，每一方都必须为另一方提供关于所生成的点（公钥碎片）的离散对数的知识证明（使用 Schnorr 证明）（译者注：意思是要证明自己知道这个公钥背后的私钥）。

在 Lindell [1] 协议中， ` P1 ` 会生成一个 Paillier 密钥对 ` (pk, sk) ` ，然后计算 ` ck = Enc_pk(x1) `，也就是 ` P1 ` 的私钥部分的 Pailier 加密形式。除此之外， ` P1 ` 还要给 ` P2 ` 发送一个零知识证明，证明某一个 Paillier 密文所加密的值，正是某一个椭圆曲线点的离散对数。

### 分布式的两方签名

当 ` P1 ` 和 ` P2 ` 同意对一条已知的消息 ` m ` 生成一个签名时，第一步是生成一个共有的一次性私钥 ` k ` 以及相应的点 ` R ` （ ` k ` 必须是一个共有私钥，因为知道  ` k ` 将会让完整的私钥可以从签名中推导出来）。这个私钥的生成过程就像上面说的一样，最终的结果是 ` P1 ` 得到了 ` k1 ` 而 ` P2 ` 得到了 ` k2 ` ，而 ` R = k1.R2 = k2.R1 = k1k2.G `，因此 ` r ` （ ` R ` 的 x 系数）也将为两方所知并得到同意。

然后 ` P2 ` 使用来自 ` P1 ` 的 Paillier 公钥 ` pk ` 计算 ` c1 = Enc_pk(k2^-1.H(m) mod q) ` 以及 ` v = k2^-1.rx2 mod q ` 。

然后， ` P2 ` 利用 ` ck ` 来执行 ` v `  的同态标量乘法，获得 ` c2 = Enc_pk(k2^-1.rx2x1 mod q) ` ；以及 ` c1 ` 和 ` c2 ` 的同态加法，获得 ` c3 = Enc_pk(k2^-1.H(m) + k2^-1.rx2x1 mod q) ` 。这个叫做 “差不多签名”，被发送给 ` P1 ` 。（译者注：在原文中， ` c3 ` 的表达式中的 ` H(m) ` 写成 ` H(x) ` ，应为笔误。下文 ` t ` 和 ` s ` 表达式中的相关项，都改为 ` H(m) ` ，以符合上文 ECDSA 算法的定义。 ）

收到 ` c3 ` 之后， ` P1 ` 可以使用 Paillier 私钥 ` sk ` 来解密它，获得  ` t = Dec_sk(c3) = k2^-1.H(m) +  k2^-1.rx2.x1 mod q ` 。现在， ` P1 ` 只需用自己的一次性私钥碎片的模逆 ` k1^-1 ` 乘以这个值 ` t ` ，即可获得完整的签名。

 ` s = k1^-1.k2^-1.H(x) + k1^-1.k2^-1.rx2x1 mod q = k^-1.H(m) + k^-1.rx mod q ` 

 然后 ` P1`可以利用消息 ` m ` 和共有公钥 ` Q ` 验证签名 `(r, s) ` ，如验证通过，则将签名发送给 ` P2 ` 。

## 盲化的两方 ECDSA 签名

（为了用在比特币的交易联合签名服务器中）*完全* 盲化的两方 ECDSA 签名的原理，是一方（即 ` P1 `）拥有完整私钥的一个碎片（如上所述），而且可以跟 ` P2 ` 合作生成共有公钥 ` Q ` 的数字签名，只不过，  ` P1 ` 无需知道被签名的消息（` m `）的任何信息，也不需要知道最终签名 ` (r, s) ` ，依然能生成有效的签名（在比特币中，即使 ` P1 ` 不知道信息的内容，只要其知道最终签名的内容，便能在公开的区块链上找出那条交易；所以两者必须一起盲化）。

在上述两方协议的基础上对  ` P1 ` 盲化 ` m `  是很简单的： ` H(m) ` 是由 ` P2 ` 添加到加密签名中的，然后才是 ` P1 ` 使用  ` m ` 来验证最终的签名（在签名计算完成之后）。要是 ` P1 ` 同意不关心消息 ` m ` 的内容，那么 TA 可以直接把签名发送给 ` P2 ` ，由后者来验证，而不是自己去检查（当然，也可以说 TA 做不到，因为 TA 不知道 ` m ` ）。

对 ` P1 ` 盲化最终的签名相对来说更难一些，但依然是非常直接的。上述协议的一个特征是，就像  ` m `  一样，数值 ` r ` 也是由 ` P2 ` 添加到 Pailier 加密表达式中的，所以本来 ` P1 ` 也不必知道 ` r ` 。为了防止 ` P1 ` 计算 ` r ` ， ` P2 ` 可以不给 ` P1 ` 发送 ` R2 = k2.G `（但是 ` P2 ` 依然需要从 ` P1 ` 处接收 ` k2 ` ，以计算 ` r `）。

为了防止 ` P1 ` 知晓最终签名 ` s ` 的值，即使在完成计算之后，Paillier 密文形式的 “差不多签名”（` c3`）也可以使用一套致盲的 私钥/一次性随机数、通过一个同态标量乘法来盲化，然后再由 ` P2 ` 发送给 ` P1 `。然后 ` P1` 可以通过乘以 ` k1^-1 ` 来计算（盲化的）` s ` 值，然后发回给 ` P2 `，后者可以解盲，获得最终的签名（而 ` P1 ` 则对最终的 ` s ` 值一无所知）。

根据上述思考，对 ` P1 ` 完全盲化的签名协议将如下所示：

1.  ` P1 ` 选择一个随机的一次性私钥 ` k1 <- Zq ` ，然后计算 ` R1 = k1.G ` ，并将  ` R1 ` 发送给 ` P2 ` 
2.  ` P2 ` 选择一个随机的一次性私钥 ` k2 <- Zq ` 并计算 ` R = k2.R1 ` 
3.  ` P2 ` 确定 ` r ` 的值（即 ` R ` 模 q 的 x 系数）
4.  ` P2 ` 生成一个随机的盲化私钥 ` b <- Zq ` 
5.  ` P2 ` 选择 ` m ` 并计算 ` c1 = Enc_pk(k2^-1.H(m) mod q) ` 和 ` v = k2^-1.rx2 mod q ` ，这需要用到来自 ` P1 ` 的 Paillier 公钥
6. 然后 ` P2 ` 拿 ` ck ` 和 ` v ` 执行同态标量乘法，获得 ` c2 = Enc_pk(k2^-1.rx2x1 mod q) ` ；以及 ` c1 ` 和 ` c2 ` 的 Paillier 同态加法，获得 ` c3 = Enc_pk(k2^-1.H(x) + k2^-1.rx2x1 mod q) ` 
7. 再然后， ` P2 ` 拿 ` c3 ` 和 ` b ` 使用同态标量乘法，获得 ` c4 = Enc_pk(k2^-1.H(x).b + k2^-1.rx2x1.b mod q) ` ，并发送给 ` P1 ` 
8.  ` P1 ` 使用 Paillier 私钥 ` sk ` 解密 ` c4 ` ，获得 ` t = Dec_sk(c4) = k2^-1.H(x).b + k2^-1.rx2x1.b mod q ` 
9.  ` P1 ` 使用自己的一次性私钥的逆元 ` k1^-1 ` 乘以 ` t ` ，获得盲化的 ` s ` 值 ` s_b = k^-1.H(x).b + k^-1.rx.b mod q ` ，并发送给 ` P2 ` 
10.  ` P2 ` 解盲 ` s_b ` ，获得最终的签名 ` s = s_b.b^-1 ` 
11.  ` P2 ` 通过消息 ` m ` 和共有公钥 ` Q ` 验证签名 ` (r, s) ` 

### 假设

这个完全盲化形式的两方 ECDSA 协议打破了许多安全假设，因为 ` P1 ` 变得无法执行特定的验证，不过这并不是一个问题，只要 ` P1 ` 能对签名操作添加一些约束的话 —— 尤其是， ` P1 ` 可以执行一条规则：对给定的一个私钥，TA 只执行一次联合签名（这就是一个状态链实体之所需），从而防止 ` P2 ` 从单次请求中了解 ` x1 ` 和 ` k1 ` 的任何信息。

（完）

