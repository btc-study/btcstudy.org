---
title: '在闪电通道内使用限制条款聚合 HTLC 输出'
author: 'Johan'
date: '2023/11/15 16:34:24'
cover: ''
excerpt: '聚合 HTLC 输出，作为一种缓解交易替代循环、通道阻塞以及提高链上交易效率的措施'
categories:
- 闪电网络
tags:
- 闪电网络
- covenant
---


> *作者：Johan Torås Halseth*
> 
> *来源：<https://lists.linuxfoundation.org/pipermail/lightning-dev/2023-October/004181.html>*



在替代交易循环攻击从上周开始引发一些讨论之后，我发现分享一些我在 HTLC 输出聚合上的研究可能是有价值的，它可能关系到如何在未来的一种闪电通道中解决这个问题（替代交易循环攻击）。

简而言之：使用合适的限制条款，我们可以创建链上效率高得多的 HTLC 输出、使之不受替代交易循环攻击，而且更难被阻塞。

## 替代交易循环攻击

替代交易循环攻击是因为对 “锚点通道（anchor channel type）” 的 HTLC 二层交易的更改 [8] 而成为可能的；该更改允许通过向交易添加输入来字版型手续费，而不会使签名作废。对 “传统通道（legacy channel type）”，这种攻击是不可能的，因为所有的手续费都是从 HTLC 输出自身中支出的，而且必须在签名时得到通道对手的同意（当然，它也有它自身的问题，也是为什么我们要改变它）。

HTLC 输出聚合的想法是，将承诺交易的所有 HTLC 输出折叠成一个。这有许多好处（我后面要解释），其中一个好处是可以让花费者领取自己有权得到的部分，并决定多少应该成为手续费。注意，这需要一种限制条款才能做到。

## 单个的 HTLC 输出

当前，每一个被转发的 HTLC 都会在承诺交易中形成单独一个输出，以在通道对手不合作时收回资金。这就给活跃状态的 HTLC 的数量设置了限制（为了不让承诺交易的体积变得太大），这也使得只需少量资金就可以阻塞一条通道 [1] 。事实也证明，将这个限制设置得较大，也会让清扫这些输出变得更昂贵也更复杂 [2] 。

如果基础层支持限制条款，我们就可以在承诺交易中创建一个聚合输出，而不必为每一个转发活动制作一个新的 HTLC 输出。聚合输出的面额将是活跃的 HTLC（包括给出的和收到的）的价值总和；也可以为给出的 HTLC 和收到的 HTLC 分别形成一个聚合输出。在花费这样的输出时，你只能得到相应于你知道的原像的 HTLC 的数额（在收到的 HTLC 的部分），或者是已经到期的数额（在给出的 HTLC 的部分）。

## 对替代交易循环的影响

取决于可用的限制条款的能耐（例如，限制交易的输入的数量），花费这样的聚合 HTLC 输出的交易可以自给自足：花费者可以申领属于自己的部分（无论使用原像还是到期机制），然后发送到任何自己想要的输出，也可以用来缴纳手续费。剩余的资金将回到一个用限制条款约束的输出中，维持剩下的 HTLC 的条件。注意，这很有可能需要 Eltoo，以便规避 “手续费虹吸（fee sipohoning）”[7] 。

## 对占位阻塞的影响

有了聚合输出，“占位阻塞（slot jamming）” 的性质就被极大地改变了。虽然通道的容量依然会被处理中的 HTLC 占据，但不再需要为每一个 HTLC 分配一个承诺交易输出、也不会再碰上硬编码的限制。

在今天的闪电网络协议中，这个限制数量是 483；而且我相信绝大部分实现的默认值都会低于这个值。这使得通道阻塞非常便宜，因为你可以用小面额的 HTLC 很快地占满一条通道的限额，这不需要很多自办。

取 “483” 这个数值，是为了在最糟糕的情况下不让承诺交易变成网络中非标准的交易 [3]。而有了聚合输出，就完全不会如此了，因为添加 HTLC 不再影响承诺交易的体积。相反，HTLC 的完整链上踪迹将推迟到申领时才揭露。

这是不是意味着，我们可以将活跃 HTLC 的数量限制抛在一边、甚至完全移除？不幸的是，显然的方法似乎不能完全解决这个问题，只是能大大缓解它。

### 占位阻塞攻击场景

考虑这样一个场景，一个攻击者通过一条通道发送了许多非粉尘 * 的HTLC，而 TA 的通道对手没有为活跃的 HTLC 的数量施加任何限制。

支付的数量完全不会影响承诺交易的体积，而只会影响再申领或者到期领取这些 HTLC 时必须展现的见证（witness）的体积。这意味着，依然存在一个足够高的手续费水平，让这些 HTLC 不值得被领取。这跟今天的规范并没有什么不同，这样的 HTLC 只是搁浅在链上，直至手续费水平下降，只不过到那时，成功申领的交易和到期领取的交易会有一场手续费竞赛。

似乎没有办法解决这个问题：只要你想在链上领取一个 HTLC，你就必须把原像发布到链上。而且，当这个 HTLC 第一次传到你这里时，你也没有办法预测未来的手续费水平。如果有大量的不经济的 HTLC，承担风险的 BTC 的总数量可能依然是十分多的，所以你可能依然想在一定程度上限制它。

> \* 注：只要 HTLC 的总价值超过粉尘限制，你就可以在交易中为之制作一个输出。

## 好消息

有了聚合 HTLC 输出，在通道开启和正常运行的时候，活跃 HTLC 的数量就不会再影响承诺交易的体积。

使用一个原像领取一个 HTLC 的边际成本会更低：不需要增加输入和输出，只需要线性增加见证的体积。有了限制条款元件，到期交易和成功领取交易的额外踪迹将不再存在。

到期领取 HTLC 的交易的体积可能依然接近于一个常数（因为不需要展示原像），所以更多的 HTLC 也不会产生额外的链上开销。

## 坏消息

最显然的问题是，我们需要在 L1 上部署一种的新的限制条款元件。不过，我认为，现在开始研究这些想法，以便引导 L1 上的工作走向我们可以在 L2 充分利用的东西，会很有好处。

如前所述，即使有一种可用的限制条款，我们也无法逃避让原像展现在链上的需要，因此无法摆脱高到一定程度的手续费会让一个 HTLC 变得不值得领取的可能性。这就类似于 [6] 中提到的粉尘暴露问题，也因此，某些限制依然会存在。

### 开放问题

使用 PTLC，我们是否可以创建一种紧凑的证据，证明你知道输出的 m-of-n 聪的原像？（某种门限签名）

如果我们可以做到，就可以完全消除占位阻塞问题；任意数量的活跃 PTLC 都不会改变申领它们的链上开销。

## 限制条款元件

需要一种递归的限制条款来实现聚合输出。OP_CTV 和 OP_APO 这样的东西似乎是不够的，因为 HTLC 的数量会导致可能的花费交易的数量出现组合爆炸。

我的个人看法是，我发现 OP_CHECKCONTRACTVERIFY [4] 的简单而强大的特性，结合 OP_CAT 以及数额内省，对这个场景尤其有用，但我也确定许多其它提议也可以实现相同的事情。更直接的内省，比如从 OP_TX [9] 这样的提议中得到的能力，也很有可能具备所需的模块。

### 概念验证

我实现了一个粗糙的样品 ** ，花费一个支付给带有 OP_CHECKCONTERACTVERIFY 的脚本的 HTLC 输出 [5] 。这里的想法是承诺所有活跃的 HTLC 到一棵默克尔树，并让花费者提供要申领的 HTLC 的默克尔证据，从而申领这些 HTLC 的总面额都一个新的输出中。剩余的资金会回到一个被申领的 HTLC 已经从其默克尔树上移除的新输出中。

在创建这样的默克尔树时，一种有趣的技巧是通过到期顺序来给这些 HTLC 排序。这意味着，在到期的情形中，领取一棵子树只需一个默克尔证据（而且可以随着更多的 HTLC 到期而使用 RBF 替代这一笔到期批量领取交易），从而交易的见证的体积可以缩减为常量（更确切地说，是 HTLC 的数量的对数）。

> ** 请把这个当成一个实验，因为它缺少很多东西，因此无法用在任何真实的承诺交易中。

## 参考文献

[1] https://bitcoinops.org/en/topics/channel-jamming-attacks/#htlc-jamming-attack
[2] https://github.com/lightning/bolts/issues/845
[3] https://github.com/lightning/bolts/blob/aad959a297ff66946effb165518143be15777dd6/02-peer-protocol.md#rationale-7
[4] https://lists.linuxfoundation.org/pipermail/bitcoin-dev/2022-November/021182.html
[5] https://github.com/halseth/tapsim/blob/b07f29804cf32dce0168ab5bb40558cbb18f2e76/examples/matt/claimpool/script.txt
[6] https://lists.linuxfoundation.org/pipermail/lightning-dev/2021-October/003257.html
[7] https://github.com/lightning/bolts/issues/845#issuecomment-937736734
[8] https://github.com/lightning/bolts/blob/8a64c6a1cef979b3f0cecb00ba7a48c2d28b3588/03-transactions.md?plain=1#L333
[9] https://lists.linuxfoundation.org/pipermail/bitcoin-dev/2022-May/020450.html
