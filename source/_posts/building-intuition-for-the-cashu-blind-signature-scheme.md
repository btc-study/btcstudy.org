---
title: '构建 Cashu 盲签名方案的直觉'
author: 'thunderbiscuit'
date: '2024/03/13 17:37:46'
cover: ''
excerpt: '以更加平实易懂的方式介绍了已被 Cashu 采用的盲签名方案'
tags:
- Ecash
mathjax: true
---


> *作者：thunderbiscuit*
> 
> *来源：<https://delvingbitcoin.org/t/building-intuition-for-the-cashu-blind-signature-scheme/506>*



本文以更加平实易懂的方式分解了当前已被 [Cashu](https://github.com/cashubtc/nuts) 采用的 ecash 盲签名方案的工作流程；[Ruben Somsen](https://gist.github.com/RubenSomsen/be7a4760dd4596d06963d67baf140406) 和 [David Wagner](https://cypherpunks.venona.com/date/1996/03/msg01848.html) 此前也对同一方案作了解释。（译者注：David Wagner 是这一方案的原创作者；Ruben Somsen 解释的中文译本见[此处](https://www.btcstudy.org/2023/09/04/blind-Diffie-Hellman-key-exchange-blind-ecash/)。）

## Part 1

### 前提

**前提 1：Diffie-Hellman 点**。给定两位用户 Alice 和 Bob，各自有自己的公私钥对（分别是 $A = aG$ 和 $B = bG$ ），那么，任一方都可以使用对方的公钥独立地推导出椭圆曲线上的同一个 Diffie-Hellman 点。假定 Alice 知道 Bob 的公钥，Bob 也知道 Alice 的公钥，那么两人都可以使用下列公式得出一个共有且互相知晓的点（公钥）$C$：

$$C = aB = bA$$

$$C = a(bG) = b(aG) = abG$$

上述等式表明，Alice 可以用自己的私钥 $a$ 乘以 Bob 的公钥 $B$ 来获得点 $C$；而 Bob 也可以用自己的私钥 $b$ 乘以 Alice 的公钥 $A$ 来得到**完全相同**的点 $C$。

这种推导出共享秘密值 $C$ 的能力，已经用在今天网络生活的方方面面；凭借它，即使信息通道可能不安全，人们也只需在其中交换公钥，就可以得出 *只有他们俩知道* 的共享秘密值，然后用这个秘密值来加密两人之间的进一步通信。

注意，虽然他们能够独立得出相同的点，但双方都需要这两件东西：

1. 对方的公钥
2. 自己的私钥

你可以认为，Diffie-Hellman 点是一个可以从两端趋近的位置，只要两端都有自己的私钥：

```
Alice's private key   --->   D-H Point   <---   Bob's private key
```

任何一方只要没有自己的私钥，就不能知道这个 D-H 点。

（译者注：[Whitfield Diffie](https://en.wikipedia.org/wiki/Whitfield_Diffie) 和 [Whitfield Diffie](https://en.wikipedia.org/wiki/Martin_Hellman) 是两位最早公开提出这种密钥交换方法的密码学家。）

**前提 2：你可以 “证明” 自己不知道某个点的私钥**。通过展示一个点的坐标是如何从某一条消息的哈希值中推导出来的，你可以证明自己并不知道这个点的私钥。为了帮助我们“证明”，我们将使用一个函数：

```
hash_to_curve(message) = PointCoordinates
哈希到曲线(消息) = 点坐标
```

如果某人从一个私钥创建曲线上的一个点（即用私钥乘以椭圆曲线上的生成元，从而得出一个点，例如 $A = aG$ ），而该点的坐标是 `Coord1`。那么，找出一条消息，可以哈希得到相同的坐标，例如：

```
hash(message) = Coord1
```

将需要攻破这个哈希函数的原像抗碰撞性 <sup><a href="#note1" id="jump-1">1</a></sup>（也即找出一个能够得出特定输出的输入）。因为（能够打破抗碰撞性）是一个不可靠的假设，所以，我们可以假设一个知道某个点的私钥的人不可能 *也知道* 某条消息能哈希出同一个点的坐标。我们也知道，椭圆曲线的一个特性是给定曲线上的一个点，我们无法便利地计算出其对应的私钥。综合这两点，就意味着：

<em><strong>如果你知道某个点的私钥，你就不知道能够哈希出相同点坐标的原像；反过来，如果你知道一组坐标的原像（消息），你不会知道这个点的私钥。</strong></em>

## Part 2：幼稚的，非盲化的 token

我们先从协议的一个 “幼稚” 版本开始，在这里，token 不会盲化。这本身是如何在铸币厂和用户两个角色中运行一套 token 系统的介绍（我们会在 Part 3 中加入隐私性）。

假设有一个铸币厂 `Mike`，承诺向拥有 token 的用户提供自己的 API 服务。为了简化，我们假设 Mike 只提供单体价值 10 美元的 token。你可以跟 Mike 购买 token（我们管这叫做 Mike “铸造” 了一个 token），用协议外的方式给他转移 10 美元。那么这些 token 会长什么样？Mike 如何铸造它们？

一种办法是 Mike 公布自己的公钥 $K$ 。他需要一种办法，证明 token 真的是由自己发行的；所以他在自己的网站上公开这样的方案：

*只要你给我发送一个公钥，并可以证明你自己不知道它的私钥，我将知道我可以独自生成我的公钥与你公钥之间的 Diffie-hellman 点 $C$。我只会在收到 10 美元的支付之后才把 $C$ 交给你。每个这样的 Diffie-hellman 点都价值 10 美元，你可以随时从我这里取回。*

这里的重点是，任何人都可以用一个公钥得出与 Mike 的 Diffie-Hellman 点，只要 TA 知道这个公钥背后的私钥（就是 $aK = C$ 嘛）。Mike 也知道这一点，所以不能接受 *任意的* 公钥与其 $K$ 的 Diffie-Hellman 点。要让 Mike 认为一个点 $C$ 是一个有效的 token，用户必须证明自己并不知道用来生成它的私钥。如此一来，Mike 就知道他们并不能自己推导出点 $C$，而只能 *等待 Mike 先生成一个然后交给他们*（因此，他可以保证绝不会在没有收到支付之前就放出 D-H 点）（这个点也成了一个有效的证据，证明曾在过去给 Mike 支付过 10 美元）。

这个方案的步骤可以理解如下：

1. Alice 创建一个公钥，且该公钥是可证自己并不知道其私钥的：

   ```
   hash_to_curve(message) = PointA
   ```

2. 她把这个公钥交给 Mike 并发送 10 美元

3. Mike 看到这笔支付以及这个公钥（点）之后，就放出对应的 Diffie-Hellman 点 $C$：

   $$kA = C$$

4. Alice 现在得到了点 $C$。

5. 当她要兑现这个 token 的时候，她知道点 $C$ 和点 $A$ 。Mike 会说，“没问题，但你可以证明这个点是我给你的，而不是由你自己推导出来的吗？”Alice 通过提供用来生成点 $A$ 的秘密值 `message` 来证明她无法推导出 $C$。

6. Mike 计算：

   $$hash\_to\_curve(message) = PointA$$
   $$kA = C$$
   
   然后就知道 Alice 无法独自计算出点 $C$ ，因此自己必定曾给过 TA 这个点。他会把这个点当成有效的，而 Alice 也可以用这个 token 买到她想要的东西。

从上述流程中，我们可以看出，Alice 需要两件东西才能兑现这个 token：

1. 点 $C$
2. 秘密值 $message$

所以，可以认为一对数据 $(C, message)$ 就是一个 token 。

因此，这个系统允许 Mike 提供一种电子 token，并且这个电子 token 可以在日后在他这里兑现。不过，他完全知道哪个 token 被兑现了（谁购买了它）、在什么时候兑现的，因为要发行 $C$ 就得知道 $A$，而他可以将 $A$ 与 Alice 联系起来，在 Alice 最初给他支付的时候。这意味着，在 Alice 兑现这个 token 的时候，他也会知道 Alice 就是兑现它的人。Part 3 会解释 Alice 如何可以通过稍微调整 $C$ 和 $A$ 来获得对铸币厂的隐私性，同时保留 Mike 验证自己是 token 发行人的能力。

回顾一下，这里的 “幼稚” token 方案大体是这样的：

*Alice 找到铸币厂 Mike 并提出，“这里是 10 美元，请把你的公钥和这个公钥的 D-H 点给我。我没法自己生成这个点，因为我不知道这个公钥背后的私钥”。下一周，Alice 找回 Mike，并提出，“这里是 一个 D-H 点，是你的公钥与我拥有的这个公钥的。你可以验证自己正是发行它的人，因为我可以证明我不知道这个公钥背后的私钥，所以它必定是你创建的。”*

## Part 3

在 Part 2 中，我们罗列了铸币厂 Mike 和用户 Alice 可以用来创建和兑现 token 的通用方案。不过，迄今为止，我们的方案还面临一个严重的问题：所有 token 都可以跟请求 token 的人联系起来，所以 Mike 可以分辨出：

1. 用户 *何时* 兑现了自己的 *哪一个* token
2. 如果一位用户兑现了不是自己请求的 token（假设 Bob 兑现了 token A，而 Mike 知道 token A 来自 Alice），Mike 可以推断这个 token 被用在了 Alice 给 Bob 的支付中。

两者加起来，就是 token 用户的隐私性的严重问题，也让这个 “幼稚” 的方案在现实中完全不可用。

### 目标

更好的方案是任何人都能兑现 Mike 所发现的任何一个 token，不让 Mike 知道谁是最初请求这个 token 的人、这个 token 是否被交换过、从创建到兑现隔了多久。这就遇上了一个问题，因为 Alice 要兑现自己的 token（Mike 给她的 DH 点）的时候，Mike 完全记得给她的是哪一个点！

### Token 的盲化与解盲

实用的办法是，Alice 给 Mike 发送一个她已经 *盲化* 的密钥，以交换一个签名（计算 DH 点）；日后她可以 *解盲* 这个密钥。

我们把这个密钥称为 `盲化消息`，记作 `B_`。它是由 Alice 真正想用的一个公钥 *加上* 一个随机公钥组成的（还记得吧，我们可以在椭圆曲线上运行点加法）。Alice 可以实用她在 Part 2 里 的公钥（`A = hash_to_curve(x)`），并加入公钥 `R`（`R = rG`）。Alice 只需选择一个随机秘密值 `r` 就可以生成出 `R`，保存下来即可。这个 `盲化信息` 可以通过这两个点的加法来定义：

```
盲化消息 = A + R
盲化消息 = A + rG
```

她给 Mike 发送盲化消息（依然只是椭圆曲线上的一个点），Mike 生成这个点与其公钥 `K` 的 DH 点：

```
C_ = k(盲化消息)
```

我们管这个点 `C_` 叫 *盲化签名*。Mike 将盲化签名发回给 Alice，Alice 可以通过下列步骤来解盲：

```
C_ = k(A + rG)
C_ = kA + krG
C_ = kA + rK
C_ - rK = kA + rK - rK
C = kA
```

注意，在 Part 2 中，Mike 给 Alice 的 DH 点是用私钥 `k` 乘以 Alice 所提供的公钥 `A` 得出的（`D-H = kA`）。而在这里，Alice 是通过一种迂回的方式得到它的：她并不 *直接* 给 Mike 提供 `A`，这也意味着在她兑现的时候，Mike 不会知道点 A 跟盲化消息有什么关系，也不能把 A 跟 Alice 关联起来。

这个点 `C` 叫做 *解盲密钥*，也正是 Alice 如果直接给 Mike 提供公钥 `A` 会得到的密钥。

日后，Alice 可以找到 Mike 并出示 `(C, x)`。Mike 可以通过运算 `hash_to_curve(x) == A` 来见证 x 产生了点 `A`（确认 Alice 并不知道这个点的私钥），而且 `C` 是 `A` 与其公钥 `K` 的 DH 点（`C == kA`）。基于这两个事实，只有他能够给出这个点。他再验证这个点 `C` 还未被兑现过，如果真的没有，那就认为这个 token 是有效的。

### 在用户之间使用 token 来支付

因为这个 token 是有效的，而且有很好的隐私性，它可能会被其它人接受。Alice 可以在给 Bob 支付时使用这个 token `(C, message)`，Bob 可以跟 Mike 兑现这个 token。Mike 无法知道这两个人发生过交易。

## 脚注

1.<a id="note1"> </a>*抗碰撞性* 是指一个哈希函数是难以反算的：给定哈希函数的一个输出，找出能够产生这个输出的输入是计算上不可行的。 <a href="#jump-1">↩</a>