---
title: '等待确认 （二）：激励兼容'
author: 'Gloria Zhao'
date: '2023/06/25 16:33:09'
cover: ''
excerpt: '不挖矿节点的交易池的效用，是由它跟矿工的交易池的相似性决定的'
tags:
- 入门系列
- 交易池
---


> *作者：Gloria Zhao*
>
> *来源：<https://bitcoinops.org/zh/newsletters/2023/05/24/>*
>
> *译者：[Primitives Lane](https://github.com/PrimitivesLane)*
>
> *本文为 Gloria Zhao 在 Optech Newsletter 上编写的 “交易池” 系列周刊的第二篇。*
>
> *[前篇见此处](https://www.btcstudy.org/2023/06/25/waiting-for-confirmation-part-1-why-we-need-mempools/)*



[本栏目在上周](https://bitcoinops.org/en/newsletters/2023/05/17/#waiting-for-confirmation-1-why-do-we-have-a-mempool)提到，交易池（mempool）是未确认交易的缓存空间，它为用户提供了一种去中心化的、向矿工发送交易数据的方法。但是，矿工没有义务确认这些交易；只包含了一笔 coinbase 交易的区块也是共识上有效的区块。用户可以通过提高输入的价值而不改变输出的总价值 —— 矿工能够获取两端的差额作为交易 *手续费* —— 来吸引矿工打包自己的交易。

虽然交易手续费在传统的金融系统中很常见，但刚接触比特币的用户可能经常觉得惊讶，这些手续费不是按支付额的比例收取的，而是根据交易的重量（weight）收取的。也就是说，区块空间才是限制因素，流动性并不是。*手续费率* 通常以 聪/vB（虚拟字节）来衡量。

共识规则限制了每个区块可用于打包交易的空间。这个限制使得区块广播到整个网络的时间低于出现区块的间隔，从而降低了出现 “过时区块（stale blocks）” 的风险。它也帮助限制了区块链和 UTXO 集的体积增长，这两者都直接构成了启动和维护一个全节点的成本。（编者注：基于比特币的共识规则，如果网络在同一个区块高度出现了两个及以上区块，则只有一个区块会成为最终得到公认的有效历史区块；其它区块会成为 “过时区块”。从共识整体安全性的角度看，这意味着有一些挖矿力量被浪费了。）

因此，作为这个未确认交易的缓存的角色的一部分，交易池也协助了无弹性的区块空间的公开拍卖：在正常运行的时候，拍卖会遵循自由市场的原理，即，完全基于手续费，而非跟矿工的个人关系，来决定交易打包的优先级。

为一个区块（有自身的总重量限制和签名操作数量限制）选择交易、同时最大化手续费，是一个 “[NP 困难问题](https://en.wikipedia.org/wiki/NP-hardness)”。这个问题会因为交易之间的关联而变得更加复杂：打包一笔高费率的交易，可能需要同时打包一笔低费率的父交易。反过来说，打包一笔低费率的交易，可能会开启打包高费率子交易的机会。

Bitcoin Core 客户端的交易池会为每一笔交易及其祖先交易计算手续费率（称为 “*祖先手续费率*”），缓存这个结果，然后使用一种 “贪婪区块模板建构算法”。它会按 “*祖先分数*”（在祖先手续费率和单体交易手续费率两者间取小值）为交易池排序，然后按顺序选出祖先交易包、更新剩余交易的祖先手续费，并对信息加权。这套算法在性能和获利能力之间取得了一个平衡，但并不一定能产生最优的结果。它的效力可以通过限制单体交易和祖先交易包的体积来提高 —— Bitcoin Core 将它们分别限制在 40 0000 重量单位和 40 4000 重量单位。

类似地，可以计算出一个 *后代分数* 并用来选择要逐出交易池的交易包，因为逐出自身低手续费率但具有高手续费率后代的交易可能会错失好处。

交易池验证在处理花费相同输入的交易（即，重复花费或者说冲突交易）时也会用到手续费和手续费率。节点不会按先到先得的规则保留先收到的那一笔交易，而是会根据一组规则来确定哪一笔交易更加激励兼容，然后保留下来。这个行为叫做 “手续费替换（[Replace by Fee](https://bitcoinops.org/en/topics/replace-by-fee/)）”。

矿工会最大化手续费，这符合直觉，但为什么一个不挖矿的节点也要实现这些规则呢？就像上周本栏目所说的，不挖矿节点的交易池的效用，是由它跟矿工的交易池的相似性决定的。因此，即使一个节点从不尝试使用其交易池中的内容产生区块，他们也愿意保存最为激励兼容的交易。

虽然没有共识规则要求交易支付手续费，但手续费和手续费率在为比特币网络中扮演着重要角色，它是一种 “公平的” 解决区块空间竞争的办法。矿工使用手续费率来评估可取程度、处理驱逐和冲突，而不挖矿的节点也参照这种行为，以尽可能提高自己的交易池的效用。

区块空间的稀缺性，产生了降低交易体积的压力，并鼓励开发者构造更有效率的交易。下周的专栏中，我们会探索链上交易节约手续费的实用策略和技术。

> *[续篇见此处](https://www.btcstudy.org/2023/07/03/waiting-for-confirmation-3-bidding-for-block-space/)。*