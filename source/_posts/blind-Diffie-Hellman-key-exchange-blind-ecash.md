---
title: '盲化的 Diffie-Hellman 密钥交换'
author: 'Ruben Somsen'
date: '2023/09/04 16:50:22'
cover: ''
excerpt: '另类的 ecash 协议'
tags:
- 密码学
- Ecash
---


> *作者：Ruben Somsen*
> 
> *来源：<https://gist.github.com/RubenSomsen/be7a4760dd4596d06963d67baf140406>*



本协议的目标是让 Bob 可以跟 Alice 执行一次盲化的 Diffie-Hellman 密钥交换，从而，在未来，当一个解盲后的数值返回给 Alice 时，Alice 将意识到这个值来自于她自身，但无法知晓这个值跟其它值有什么区别（即，类似于盲签名）。

```
Alice:
A = a*G
返回 A

Bob：
Y = hash_to_curve(secret_message)（将秘密消息哈希成椭圆曲线上的点）
r = 随机盲化因子
B' = Y + r*G
返回 B'

Alice：
C' = a*B'
  (= a*Y + a*r*G)
返回 C'

Bob：
C = C' - r*A
 (= C' - a*r*G)
 (= a*Y)
返回 C，秘密消息

Alice：
Y = hash_to_curve(secret_message)
C == a*Y

如果等式成立，则 C 必定来自 Alice
```

我在一个似乎被遗忘了很久的[密码朋克邮件组帖子](http://cypherpunks.venona.com/date/1996/03/msg01848.html)中发现了这个协议，它是 David Wagner 在 1996 年写的（修正：也许并不像我以为的那样被遗忘了，因为 [Lucre](https://github.com/benlaurie/lucre) 就是一个它的实现）。它的初衷是成为 RSA 盲签名的替代方案，以绕开 David Chaum 的（现在已经过期的）专利。就像在所有的 ecash 协议中一样，这里的 `secret_message` 将由 `Alice` 在验证后记录下来，以防止重复花费。

这个方案的一个好处在于，执行门限机制的时候相对直接（值要求椭圆曲线乘法）。而一个缺点在于，它比单纯的签名检查要更复杂，因为它需要重复 Diffie-Hellman 密钥交换过程。

这个协议还有一个额外的弱点，但可以解决。Bob 无法确定 `C'` 是正确生成的（对应于 `a*B'`）。Alice 可以通过同时提供一个离散对数相等证据（discrete log equality proof, DLEQ），证明 `A = a*G` 中的 `a` 等于 `C' = a*B'` 中的 `a`，从而解决这个问题。这个想到可以通过一种相对简单的 Schnorr 签名来证明，如下所述：

```
（这些步骤发生在 Alice 返回 C' 的时候）

Alice：
 r = 随机 nonce 值
R1 = r*G
R2 = r*B'
 e = hash(R1, R2, A, C')
 s = r + e*a
返回 e, s

Bob：
R1 = s*G - e*A
R2 = s*B' - e*C'
e == hash(R1, R2, A, C')

如果等式成立，则 A = a*B 中的 a 必定等于 C' = a*B' 中的 a
```

感谢 Eric Sirion、Andrew Poelstra 和 Adam Gibson 的有益评论。



