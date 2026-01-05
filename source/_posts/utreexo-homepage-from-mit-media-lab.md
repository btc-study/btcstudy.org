---
title: 'Utreexo：比特币状态的一种动态累加器'
author: 'Thaddeus Dryja'
date: '2021/11/23 14:30:22'
cover: ''
excerpt: 'utreexo 使得几百万条 utxo 可以用小于 1 千字节的数据来表示'
tags:
- utreexo
---


> *作者：Thaddeus Dryja*
> 
> *来源：<https://dci.mit.edu/utreexo>*



比特币最显而易见也最持久的问题之一便是其可扩展性。比特币非常严格地遵循了 “做你自己的银行” 的理念，所以参与比特币网络的每一台计算机都存储了在这个系统中持有资金的每一个用户的每一个账户；这些数据，被存储为 “未花费的交易输出” 或者说 “utxo” 的集合。utxo 这个概念没那么直观，但与传统金融业所用的基于 “账户”的模式相比，具有隐私和效率上的优势。

重要的是，我们要区分 “交易的历史” 和 “系统的当前状态”。比特币的交易历史数据体积现在是 200 GB 左右，包含了比特币自 2009 年初启动以来的每一笔交易。而当前状态则小得多，现在不超过 4 GB，只表明当前时刻，哪些人拥有哪些资金。状态数据的体积一般来说会不断增长，但实际上今年还下降了一点。

历史数据，尽管其体积更大，却不是可扩展性的瓶颈，因为使用这部分数据的方式对时间耗费不敏感；而且，节点在处理完所有历史后，可以抛弃这些数据，而不会有损自身的安全性。相反，日益增长的状态数据体积，才是问题 —— 也正是 utreexo 要解决的问题。

Utreexo 是一种新型的基于哈希函数的动态累加器，它使得几百万条 utxo 可以用小于 1 千字节的数据来表示 —— 小到一页纸就可以写完。不需要用到受信任的启动设置（trusted setup），也不会牺牲安全性；相反，跟踪资金流转的负担将转移给这些资金的所有者。

当前，比特币的交易要指定输入和输出，而验证输入需要你知道系统当前的完整状态。有了 Utreexo，资金的所有者会维护这笔资金存在的证明，并在花费这笔资金时向节点提供证明。这些证明体积不大（小于 1 KB），但确实代表了 utreexo 模式的主要缺点：需要传输额外的数据，以允许节点保存少得多的状态。

Utreexo 将维护网络的成本安排到了正确的地方：一个创建了几百万条交易的交易所要自己保管几百万个证明，而只有少量未花费输出的个人就只需要保管几千 kb 的证明数据。Utreexo 也提供了长期的可扩展性解决方案，因为与底层的状态集合的体积增长相比，累加器的体积增长得非常缓慢（累加器的体积增长与状态体积的增长是对数关系）。

**联系我们**

有任何的想法、建议和问题，欢迎联系我们：[dci@media.mit.edu](mailto:dci@media.mit.edu)。

## 论文

### **Utreexo demo 0.2 版本放出**

Utreexo 的目标是让运行一个比特币全节点变得更简单、运行速度更快、占用空间更小，虽然我们只能做到不断接近，而无法一蹴而就，我们还是取得了一些成果。今天我们发布 Utreexo 演示版 0.2 版本，它为一个修改过的 [btcd 客户端](https://github.com/btcsuite/btcd)匹配了 Utreexo 累加器（暂时命名为 utcd）。utcd 的大部分工作都是由 [Calvin Kim](https://github.com/kcalvinalvin) 完成的，因为 [Niklas Gögge](https://github.com/dergoegge) 和我已知在改进累加器以及它与比特币数据结构的互动方式。Calvin 也写了[一篇关于这些工作的文章](https://blog.bitmex.com/progress-towards-utreexo-goals/)。

这个新版本工作起来更像一个普通的比特币节点：启动之后，它会寻找对等节点、验证整个区块链。有一些功能它还不具有，比如交易池，比如处理链重组的能力（当前它是靠停机来处理链重组的）。

[详情见此处](https://dci.mit.edu/research/2021/2/2/utreexo-demo-release-02-by-tadge-dryja)。

2021 年 2 月 2 日

### **Utreexo：为比特币 UTXO 集合优化的一种基于哈希函数的动态累加器**

作者： Thaddeus Dryja，来自 MIT 的数字货币计划（Digital Currency Initiative）

摘要：在比特币的共识网络中，所有节点都要对未花费的交易输出的集合（即 “UTXO” 集合）达成共识。这部分共享状态的体积是网络可扩展性的瓶颈，因为它的体积会随着更多用户加入这个系统而膨胀，并因此提高所有节点的资源要求。解耦网络的状态数据体积与个体设备的存储负担之间的关联，将降低验证节点的硬件要求。我们引入了一种基于哈希函数的累加器，在节点本地表示 UTXO 集合；它的体积增长与整个状态集合的体积增长是对数关系。节点为交易的输入附加和传播 “包含证明”；该证明与累加器状态一道，可以给出验证一笔交易所需的所有信息。虽然包含证明提高了网络的通信量，这些证明在验证后可以抛弃，而且聚合方法可以将它们的体积降低到完全可以接受的水平。在我们的模拟中，我们分配了 500 MB 的 RAM 用于缓存、下载了比特币从 2019 年至今的区块链，这些证明只增加了约 25% 的下载量。

[详情见此处](https://dci.mit.edu/research/2019/6/6/utreexo-a-dynamic-hash-based-accumulator-optimized-for-the-bitcoin-utxo-set)。

2019 年 6 月 6 日

### **Utreexo：比特币状态的动态累加器**

（即上文简介部分，不附。）

## 媒体报道

### **Utreexo demo 0.2 版本放出**

（与论文同题部分重合，不附。）

### **Calvin Kim 作为 Utreexo 贡献者得到奖励：“BitMex 将最后一席开发者奖金授予来自 MIT 的比特币扩容方案”**

BitMex 的 100x Group 已经给出今年的最后一席比特币开发奖。这家公司为比特币扩容方案 Utreexo 的开发者 Calvin Kim 授予了价值 4 万美元的奖项。Utreexo 项目最初由来自 MIT Digital Currency Initiative 的 Tadge Dryja 创立。

[详情见此处](https://dci.mit.edu/research/2020/9/2/calvin-kim-is-awarded-for-his-role-as-an-utreexo-collaborator-announced-in-cointelegraphs-bitmex-awards-its-last-developer-grant-to-a-bitcoin-scalability-solution-from-mit)。

2020 年 9 月 2 日

### **“来自 MIT 的闪电网络创造者首次演示其比特币扩容技术” ——Coindesk 报道 Utreexo**

Alyssa Hertig 撰文发表于 2020 年 7 月 28 日，在 coindesk.com。

闪电网络的创造者 Tadge Dryja 一直在开发一种轻量级比特币全节点的新方案，他首次公开这套方案的论文是在 2019 年。上周，他和工程师团队放出了第一个版本的 Utreexo 软件。作为 MIT 数字货币计划的一部分，他们将这个轻量节点的观念变成了可以工作的代码。

完整的比特币节点就像金融安全系统一样，会验证比特币区块链的交易并保护用户不被虚假的支付欺骗。但节点必须负担大量的计算和日渐膨胀的状态数据存储。

因为全节点是比特币最为 “免信任” 的使用方式，开发之一直在尝试让它变得更容易使用。这是比特币的 “圣杯” 之一。

[详情见此处](https://dci.mit.edu/research/2020/7/30/mit-lightning-creator-unveils-first-demonstration-of-bitcoin-scaling-tech-by-coindesk-discusses-utreexo)。

2020 年 7 月 30 日

### **Tadger Dryja 放出了 Utreexo 的第一个演示**

数字货币计划（DCI）研究科学家 Tadger Dryja 今天在 Medium 上放出了 Utreexo 的演示。

“我很高兴地宣布放出 Utreexo 的第一个演示。Utreexo 是比特币的一种新的扩容方案，它可以让比特币的节点更小、运行起来更快，同时能跟全节点享有同样的安全性和隐私。”

[详情见此处](https://dci.mit.edu/research/2020/7/22/tadge-dryja-releases-utreexos-first-demonstration-in-a-medium-article)。

2020 年 7 月 22 日

### **Coindesk 报道：使用 Tadge Dryja 提出的 UTreeXO，“你可以直接在手机上同步比特币”**

“也许我们不需要自己存储所有东西。”

这是 Tadger Dryja，MIT 数字货币计划的密码货币研究科学家，在解释比特币扩容方案 “utreexo” 背后的理念时说的话。

基于一个开发者们已经追求了许多年的理念，utreexo 尝试简化比特币的代码中导致存储负担日益变重的部分。

[报道原文见此处](https://www.coindesk.com/this-scaling-tech-could-let-you-sync-bitcoin-straight-from-your-phone)。

[详情见此处](https://dci.mit.edu/research/2019/1/15/coindesks-this-scaling-tech-could-let-you-sync-bitcoin-straight-from-your-phone-using-utreexo-created-by-tadge-dryja)。

2019 年 1 月 15 日

## 视频和演讲

- [密码经济安全会议，2020 年 7 月 9 日  - 比特币节点：使用 UTreexo 解耦信任与存储](https://dci.mit.edu/video-gallery/bitcoin-nodes-decoupling-trust-and-storage-with-utreexo)
- [MIT Bitcoin 大会 2020 - 节点模式：比特币网络节点的税收及其它](https://dci.mit.edu/video-gallery/2020/4/15/hg2n6d8rl01i5hhjumebo4puu5wvda)
- [Tadge Dryja 在 Scaling Bitcoin 大会上讲解 Utreexo](https://dci.mit.edu/video-gallery/2020/1/3/kf7s9uzw7knetidlc0dum2lzde9kxs)

（完）