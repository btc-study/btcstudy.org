---
title: 'Graftroot：委托签名如何实现近乎无限的花费条件'
author: 'Aaron van Wirdum'
date: '2022/06/28 21:15:25'
cover: '../images/graftroot-how-delegating-signatures-allows-near-infinite-spending-variations/iations.jpg'
excerpt: '不再需要担心比特币智能合约有多复杂'
categories:
- 比特币主网
tags:
- Graftroot
---


> *作者：Aaron van Wirdum*
>
> *来源：<https://bitcoinmagazine.com/technical/graftroot-how-delegating-signatures-allows-near-infinite-spending-variations>*
>
> *原文出版于 2019 年 1 月。*



![Technical - Graftroot: How Delegating Signatures Allows for Near-Infinite Spending Variations](../images/graftroot-how-delegating-signatures-allows-near-infinite-spending-variations/iations.jpg)

*这篇文章是我[解释 Taproot 文章](https://bitcoinmagazine.com/articles/taproot-coming-what-it-and-how-it-will-benefit-bitcoin)的续篇没准你应该先看一下那篇文章。*

如果 Taproot 部署在比特币上，许多智能合约构造看起来都会像区块链上的普通交易一样。只要参与者们一致同意合约的结果 —— 也就是 “合作关闭合约” —— Schnorr 签名和 MAST 的聪明组合就能提供数据效率和隐私性。

但是，如果 Taproot 智能合约足够复杂 —— 也就是说，如果它可能有许多种结果 —— 在非合作关闭合约的情形中，相关花费条件的默克尔路径就要揭晓，可能交易的体积依然会很大。

Bitcoin Core 贡献者 Gregory Maxwell 后来提出的一个协议，“[Graftroot](https://lists.linuxfoundation.org/pipermail/bitcoin-dev/2018-February/015700.html)”，提供了跟 Taproot 类似的好处，但没有这种缺点，所以能提供甚至更强的智能合约灵活性。

## Graftroot

使用 Taproot，一个智能合约里的所有参与者可以将他们的公钥加起来，形成一个 “门限公钥”，可以通过相应的 “门限签名” 来花费资金。至于 Graftroot，所有的参与者也创建这样的门限公钥，但这一次，他们不必调整这个门限公钥。

参与者们创建不同的脚本：也就是可以花费资金的另类条件。但是，在 Graftroot 中，他们集体签名这些脚本，以创建对应于这些脚本的门限签名。每个希望使用一个特定脚本作为后备机制的参与者都存储那个特定的脚本以及相应的门限签名。这些签名可以在日后证明所签名的脚本是有效的另类条件，也就是所有参与者一致同意的 “代理”。

假设 Alice 和 Bob 要建立一个智能合约，其功能是：双方可以一起花费其中的资金，*或者* Alice 可以在一周后独自花费其中的资金，*或者* Bob 可以独自花费其中的资金，前提是揭晓一个秘密值。于是，Alice 和 Bob 先将他们的公钥合并起来创建一个门限公钥，日后如果他们能提供相应的门限签名，就能花费合约中的资金（他们现在不必创建门限签名 —— 等到想要一起花费其中的资金时合作签名即可）。

然后，他们也创建和签名另类脚本。Alice 所保存的签名相应于让她可在一周后花费资金的脚本的，而 Bob 保存的门限签名相应于让他可通过揭开一个秘密值来花费资金的脚本。（注意，光有门限签名和相应的脚本还无法花费资金；这两样东西只是证明了被签名的脚本是得到了 Alice 和 Bob 的一致同意的。而脚本中指定的条件依然要得到满足，才能花费其中的资金。）

第二天，当他们要结算这个合约时，Alice 和 Bob 可能会一致同意签名结算交易。他们一起创建门限公钥的一个门限签名来花费合约中的资金，这时候没有外人能知道另类花费条件的存在，也不知道这笔交易的创建者居然不止一个。因为从表面上看，这笔交易跟普通的交易没有任何分别。

但是，如果两人中有人不愿意合作，那么另一个人就可以用另类花费条件来花费合约中的钱。假如 Bob 拥有秘密数值，那他就可以揭晓 “他的” 另类脚本以及相应的门限签名。其他人可以用门限公钥检查门限签名，然后知道参与这个智能合约的所有人都同意使用这个另类脚本。因此 Bob 可以使用秘密值来花费资金。相反，如果一个星期已经过去，Alice 就可以揭晓 “她的” 另类脚本以及相应的门限签名，以花费合约中的资金。不论是哪一种情况，外人的都只会知道被使用的那个脚本，而不知道另一个脚本。

Graftroot 的主要优势在于，不论一个智能合约有多复杂 —— 准确点说，不论它有多少种可能的结果 —— 都无关紧要。虽然上面的例子只用到了两种另类脚本，Graftroot 构造可以包含几百个另类脚本，都不会有什么区别。Alice 和 Bob 甚至可以在最初的智能合约构造好之后加入更多的条件！

不过，Graftroot 也有缺点：它是交互式的。参与者必须彼此沟通、签名另类脚本，在花费资金之前就要这么做。此外，参与者将需要存储自己需要使用的脚本的门限签名；如果他们弄丢了签名，后备机制就没有了。

## Graftroot 的开发

那么，什么时候比特币用户能用上这种科技呢？

好消息是隔离见证有个特性叫做 “脚本版本控制”，可以相对容易地发布这样的变更 —— Schnorr 签名、Taproot、Graftroot —— 而且是向后兼容的。

尽管如此，理想情况下，开发此类升级的 Bitcoin Core 贡献者 —— 包括 Pieter Wuille、Anthony Towns、Johnson Lau、Jonas Nick、Andrew Poelstra、Tim Ruffing、Rusty Russell 和 Gregory Maxwell —— 会更倾向于一次性发布所有升级。虽然脚本版本控制让升级变得更加简单，它依然要求交易指明所用的协议升级。所以，虽然 Graftroot 可以完美地隐藏所有可用的另类脚本，脚本的版本依然会曝光该笔交易正在使用 Graftroot。同时部署多套协议虽然能在一定程度上避免这一点（多个协议会使用同一个脚本版本号）。此外，一次性部署多个协议升级有利于软件的兼容性。

另一方面，“相对容易的发布” 依然是一个繁重的任务，因为这是对一个 24/7 运行的安全敏感协议做共识变更，人们对升级有不同的兴趣和偏好。每一种可能的特性都有自己的取舍，所以把许多协议放在一起可能导致更多的反对意见。而且，显然，把多个特性打包在一次升级中会让开发变得更难。

因此，从目前来看，Schnorr 签名和 Taproot 的优先级更高，会放在一起。而 Graftroot 可能是它们完成后的下一步。

*本文只是对 Graftroot 概念的简单梳理；实现的规范可能有所不同。欲知更多细节，请看 Gregory Maxwell 的 [Graftroot 协议原始提议](https://lists.linuxfoundation.org/pipermail/bitcoin-dev/2018-February/015700.html) 以及 Pieter Wuille 作的[这个演讲](https://www.youtube.com/watch?v=YSUVRj8iznU&feature=youtu.be)。*

（完）

