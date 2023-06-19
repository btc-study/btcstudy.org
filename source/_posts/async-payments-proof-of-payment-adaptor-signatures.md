---
title: '使用适配器签名实现闪电网络异步支付'
author: 'Anthony Towns'
date: '2023/06/19 11:31:13'
cover: ''
excerpt: '如何在异步支付中获得支付证据？'
categories:
- 闪电网络
tags:
- 闪电网络
---


> *作者：Anthony Towns*
> 
> *来源：<https://lists.linuxfoundation.org/pipermail/lightning-dev/2023-January/003833.html>*



在听了关于这个主题的 optech 在线聊天之后，我觉得花点时间解释一下这个想法是有必要的。

Alice 尝试给 Bob 支付。Alice 有一个闪电网络服务商（LSP ）名为 Louise，Bob 也有一个 LSP 名为 Larry。Louise 和 Larry 是全天候在线的，但无法访问 Alice 和 Bob 的私钥。我们希望支付流程如下：

1. Larry 从 Bob 处获得一些启动信息，然后 Bob 离线。
   - Alice 知晓 Bob 的地址，并决定给 Bob 支付 50 元。
2. Alice 跟 Larry（Bob 的 LSP）协商一个唯一的发票 id，我们称为 “S”。
3. Alice 告诉 Louise 她想给 Bob 支付价值 50 元的发票 S。
   - Louise 请求 Larry 在 Bob 回到线上时告知自己。
   - Alice 离线。
   - Bob 上线。
   - Larry 告诉 Louise，Bob 已经回到线上了。
4. Louise 给 Bob 发送以 S 为条件的支付。
5. Bob 收取支付。
   - Louise 从 Alice 处领取 50 元并关闭交易。
6. Alice 收到来自 Bob 的支付证据（收据）。

收据的作用是，如果同时有两个人想给 Bob 支付 50 元，他们都能保证：（1）Bob 得到了支付，而不是别人得到了支付；（2）收据是不一样的（所以 Bob 收到了 100 元，而不是只收到了 50 元，其中一方得到的收据只是真实收据的复制品）；（3）他们可以证明自己所得到的收据是属于他们的，不是属于别人的的。第一种和第二种特性保证了资金没有发错地方，而第三种特性可能允许你使用这个收据作为证据，向第三方出示；比如你提前支付了货款，但没有拿到货的时候。

为了让一切都能顺利工作，签名（而不是 哈希值/原像）更有可能让我们满意。但 PTLC 中的原像和 Schnorr 签名没有多大区别：在 PTLC 中，你给椭圆曲线点 S 支付，然后收到原像 s ，这里 s * G = S，也即 s 是 S 的私钥。同时，Schnorr 签名由一个数（s）和一个点（R）组成，并满足方程：

```
s * G = R + H(R, P, m) * P
```

但是，你可以稍微眯一下眼睛，把等式的右边整个当成一个 “S”，于是它就成了一个 PTLC。

> 提醒：我使用大写字母表示椭圆曲线点，而小写字母表示数字。如果 A  是一个点，那么 a 就是它的离散对数，而且 a * G = A

为了计算 S，你只需要知道 3 样东西：R、P 和 m —— P 就是签名者的公钥，m 是被签名的消息，但这里的 “R” 是签名的公开 “nonce” 部分，必须由签名者选定（否则其他选择 nonce 的人就可以在一次或两次签名之后知晓签名者的私钥）。

所以，在这种情况下，协议是这样的：

- Alice 提议 Bob 签名一条消息，例如 m = “Alice 给我支付了 50 元 —— Bob”
- Bob 为这个签名选择一个 R，并告知 Alice 这个 R 是什么
- Alice 计算 “S”
- Alive 通过条件为 S 的 PTLC，给 Bob 支付 50 元、
- 如果 Bob 收到了 50 元，Alice 就能收到 S 的原像，也即 Bob 的签名 s
- Alice 结合 （R, s），这就是 Bob 对她所给出的消息的签名

因为 Bob 离线了，所以 Alice 只能跟 Bob 的 不可完全信任的代表  Larry 完成这个协议。Bob 无法在知道 Alice 的消息 m 之后选择一个全新的 R，这就产生了一种密码学攻击 [0] ，即如果 Alice 可以为许多消息请求 nonce，她就有可能找出一个 消息- nonce 的 “幸运组合”，可以结合 Bob 的签名、计算出 Bob 的私钥。

[0] https://medium.com/blockstream/insecure-shortcuts-in-musig-2ad0d38a97da

我 *认为*，这样的攻击可以通过使用跟 musig2 相同的 nonce 生成法来缓解：

- Bob 准备后一个 nonce *对* R1 和 R2
- Alice 选择消息 m 
- 对消息 m 的签名 nonce 由 `H(R1,R2,m)*R1 + R2` 计算出来

注意，nonce 复用并不因此是安全的 —— 只要你使用相同的 R1/R2 对签名了三条消息，Schnorr 签名等式（`s = r + H(R,P,m) * p`）一样会给你三条等式，而未知项只有三个（r1，r2 和私钥），从而使它们都能被解出，而不需要任何复杂的攻击。（可以假设，如果你同一对 nonce 你只使用了两次，则有遭受 “Wagner 攻击” 的风险）

所以，我们要给协议加入如下内容：

1）Bob 跟 Larry 分享一组（R1, R2），这些点可以用来生成他的签名的 nonce。这可以通过一种（加固的）HD 方案构造出来，所以 Bob 只需一个索引就可以重新生成出来。

2）Alice 从 Larry 处获得一个唯一的（R1, R2）对，然后选择她希望 Bob 签名的消息（Bob 可以提供一个标准化的模板，然后 Alice 填进自己的名字和支付理由）—— 这就是 “m”。Alice 通过 R1、R2 和 m 计算 R，然后通过 R、P、m 计算 S 。

3）Alice 传递 “m” 和 “S” 给 Louise 并开始支付、锁定自己的资金。

4）等到 Bob 上线之后，Louise 提供 “m”、“R1”、“R2” 给 Bob，并发送支付给 Bob。

5）Bob 检查这对 R1/R2 是自己生生的，并且还没有被使用过。Bob 检查 “m” 是一条自己愿意签名的消息。Bob 计算 s 和 S，并使用 s 接收点为 S 的条件式支付，前提是数额跟 “m” 中指定的一致。

6）Alice 已经计算出 R，当 Louise 前来领取资金时，就可以从 Louise 处获得 s，这里的（R, s）恰好是 Bob 对 m 的 BIP340 签名（也即满足 `s * G  = R + H(R, P, m) * P`），这个签名就是她从 Bob 处得到的支付证据。



