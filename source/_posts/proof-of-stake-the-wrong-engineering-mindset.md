---
title: '权益证明与错误的工程思维'
author: 'Hugo Nguyen'
date: '2021/12/02 17:55:07'
cover: ''
excerpt: '在设计协议的时候，仔细考虑长尾事件是非常重要的，尤其是该协议有潜力成为全球经济的支柱时，数以百万计的用户和业务都会依赖它。'
tags:
- PoW
---


> *作者：Hugo Nguyen*
> 
> *来源：<https://medium.com/@hugonguyen/proof-of-stake-the-wrong-engineering-mindset-15e641ab65a2>*


近期，许多权益证明（Proof-of-Stake, PoS）算法涌现出来。以太坊的 Casper，卡尔达诺（Cardano）的 Ouroboros，等等。对权益证明协议日益高涨的兴趣可能源于无限扩展区块链的愿望，再加上认定 “工作量证明（Proof-of-Work, PoW）很 ‘浪费’ ” 的错误观念。（到[这里](https://bitcointechtalk.com/the-anatomy-of-proof-of-work-98c85b6f6667)看关于工作量证明的更细致的讨论（[中文译本](https://www.btcstudy.org/2020/09/04/the-anatomy-of-proof-of-work/)））

**但是，关于权益证明协议，有件事还没有得到足够多的强调，就是它在处理完最恶劣的情况之后缺乏恢复能力 [<sup>1</sup>](#note)**。举个例子：导致网络中的大部分节点甚至所有节点掉线或是相互隔绝的极端情况。又或是 偷盗/买卖 私钥的风险。

有人可能会认为，这些情况是很罕见的或是不可能出现的，但是，a）这些情况也许并不像你认为的那么罕见以及 b）即便是发生的概率只有 0.1% 也意味着在长期中它 *将会* 发生 —— 也就是 Nassim Taleb 所说的[黑天鹅事件](https://en.wikipedia.org/wiki/Black_swan_theory)。

简单点来说，这些事件几乎不可能发生，但当它们发生的时候，结果通常是灾难性的。我们人类常常低估影响巨大的长尾事件。例如，我们会有一种幻觉，觉得明天肯定是安全的，因为我们在过去 10 年或是 100 年间一直是安全的。

在设计协议的时候，仔细考虑长尾事件是非常重要的，尤其是该协议有潜力成为全球经济的支柱时，数以百万计的用户和业务都会依赖它。

我们必须用对待核反应堆软件的态度来对待比特币软件。在工程的意义上，这一级别的软件是所谓的关键系统（Critical System）。有三种类型的关键系统：*安全关键型、任务关键型以及业务关键型*。比特币符合三种特征（丢钱可以是很要命的）。所以压根不能允许犯错。

有经验的工程师在晚上也不会熟睡，即便系统具备了当前[比特币安全性](https://www.coindesk.com/bitcoins-security-model-deep-dive)的程度，离完美也还远着呢。他们知道我们离灾难永远只有一步之遥，不管论文写得多可靠、系统看来已经平稳运转了多久。

过去已经出现了好几个令人瞩目的工程错误，清楚地证明了这种隐藏的危险。下面是一些例子：

**1）协和飞机坠毁（2003）**

协和号飞机（1976 ~ 2003）史上仅有的两种超音速客机之一。[协和飞机失事](https://en.wikipedia.org/wiki/Air_France_Flight_4590)是由于起飞时候爆炸的轮胎撞击油箱、造成连锁反应而发生的。而协和号还一度被认为是 “世界上最安全的飞机” 之一。

**2）挑战者号失事（1986）**

NASA（美国国家航空航天局）一开始估计失败几率只有十万分之一。Richard Feynman 领导研究发现 [32 度下 O 型环无法扩展](https://www.history.com/news/how-the-challenger-disaster-changed-nasa)。真正的几率非常接近于百分之一。误差达到了一千倍！

**3）福岛核电站事故（2011）**

日本是在防震技术和地震安全方面是最好的国家之一了。

然而，[福岛核电站事故](https://en.wikipedia.org/wiki/Fukushima_Daiichi_nuclear_disaster)还是在你可以称之为灾难的完美组合中发生了：日本有史以来最剧烈的 9 级大地震，再加上千年一遇的浪高 15 米的海啸。

**在组建关键系统时，考虑最糟糕的情形是绝对必要的；如果这些系统影响全球，这样的考虑会变得更加重要。**

---

然后，我们来解释一下工作量证明和权益证明是如何处理网络隔离以及没有预料到的断联的 [<sup>2</sup>](#note)。

直截了当地说，这些情况并不像人们想的那么罕见：在 “阿拉伯之春” 运动期间，土耳其政府成功地[劫持了 BGP 网络协议](https://bgpmon.net/turkey-hijacking-ip-addresses-for-popular-global-dns-providers)以阻止人们发推特。……

你也可以想象战争的情形 —— 互相敌对的也许会想要端掉敌人的通讯基础设施，这很有可能是第一个目标，因为不管是谁，有更好的通讯便占了上风。

那么，工作量证明系统或是权益证明在这种情况下有多强韧呢？我们来讨论一些例子。

**场景 1：一段时期，整个网络都被强制下线，然后重启。**

因为不同地区也许不会同时重启并重新联系上其他人，很有可能最终结果就是从网络被黑之前的最后一个共同区块开始，几个地区形成他们自己独立的链，因此分裂成了多条链。

跨地区的通信重建的时候，各独立链上的节点将联系上其他人。

在工作量证明中，节点会自动地自我组织并最终被吸引到单一的一条链上，就是累积了最多工作量证明（也是最安全的）的那条链。这个过程当然会很痛苦，因为一些链会被抛弃。但最终它会起作用，人们的行为也是确定的。

在权益证明协议中，节点不知道哪条链是更 “对” 的链。不像工作量证明，权益证明没有客观的尺度来评判两条链中哪条更 “真实”。人们的行为是不确定的；如果不引入一些武断的规则，不可能实现自动化；但这些规则又会增加受攻击的面。分裂可能会一直存在下去，因为一些权益证明协议[不允许进行太深的回滚](https://github.com/ethereum/research/wiki/Casper-Version-1-Implementation-Guide)。

权益证明协议的设计者在 “惩罚” 恶意参与者上已经走得太远。他们没有考虑过所有节点都诚实地行动、但链却分裂了的可能性！

**场景 2：部分网络与主网隔离开来。**

可以证明，这种情况的结果跟我们在场景 1 中看到的情形相似。各分区将继续运转，就好像一切都运转良好那样——除了 “活动的” 保证金节点的数量在每一个孤立的分区中都变得更少。各分区重新联系上主网时，困惑就随之而来。节点不知道哪条链是正确的链。

场景 1 与场景 2 的一个主要的区别在于，场景 2 发生的几率会更高。流量重定向总比完全关闭流量容易 —— 我们已经看过这种事发生了。这种类型的分区可以小到一个小镇。可以想象这种事情每几年就会发生一次，甚至比这还频繁。

----

**场景 3：在另一些最坏的情景中，比如私钥被盗，权益证明协议也会更糟糕。**

财富分布常常服从幂分布（Power Laws，或说少数支配定律），没有理由认为加密货币会是例外。“1% 的加密货币持有者”，屈指可数的几个人，可能掌控着全部货币供给的很大一部分，甚至绝大多数。

这些最富有的 PoS 权益所有者的私钥可能会因为机巧的社会工程学攻击（绑架、拷打、勒索，等等）而被偷走。通过偷盗私钥而不是在公开市场上租借或是购买货币，攻击者避免了货币价格的上升。奇怪的是，在考虑这种攻击途径的时候，权益证明协议的设计者常常假设在公开市场上购买货币是唯一一种掌控大多数控制权的方式，因此错误地断定攻击权益证明货币的成本仅仅由其市场价格决定。偷盗私钥可以干脆地躲开 “防御” 并显著地降低攻击成本。

（此类攻击的一个变种是从以前的大额权益所有者处购买旧密钥，这些人可能不再对加密货币感兴趣了。）

在工作量证明中，这等同于控制绝大多数的算力。

一个控制绝大多数算力的人在工作量证明系统里能做什么呢？他可以尝试双花（Double-spend）或是重写历史。但要双花的话，他得消耗掉一大笔钱。获得绝大多数的控制力仅仅是第一步。即便在这种场景下，就像它听起来那么糟糕的时候，协议还是会像预期中那样起作用，只有一条链可以被认为是有效的（即便 SPV（Simplified Payment Verification，简化交易验证）节点会觉得困惑——这也是我们一般鼓励运行全节点的原因）。重写历史要消耗的金额会跟天文数字一样大，所以丢失用户余额的风险不高。用户可以选择等待灾难过去然后采取行动改变工作量证明算法。

总而言之，这是非常让人讨厌的情况。但我们可以看到获得绝大多数的算力在工作量证明中不会让攻击者获得无限的权力。你必须控制绝大多数算力**并且**花钱去发动攻击。我们可以认为这是一种 *双层保护机制*。当攻击发生的时候，人们的行为还是确定的，以及，不会对哪条链是有效的感到困惑。此种在敌意环境下的恢复能力没有得到足够多的重视。

相反，获得权益证明系统中的绝大多数权益会给你不受限制的权力。不像在工作量证明系统中，你可以双花而无需消耗任何额外的金钱。你也可以 a）重写历史，如果协议没有检查点（Checkpoint） 或是 b）导致无从调解的链分裂，如果协议有检查点的话（比如 [Casper](https://arxiv.org/abs/1710.09437v2)）。改变权益证明算法不会有什么帮助，因为实际上没有转换的成本，不像投资在硬件中那样。

总结一下，进入安全领域，工作量证明会带来两种利益：

1. *工作量证明保护未来*：当链分裂的时候，它会给我们一个客观的机制，一种可自动化的方式来解决冲突，无需手动的人工干预，也无需信任第三方；
2. *工作量证明保护过去*：掌控绝大多数算力仍要消耗巨额的时间和金钱去重写历史，所以账户余额基本上是安全的。

权益证明没有办法提供这两种东西。权益证明的支持者也许会生成检查点可以缓解问题 #2，但实际上检查点只会将问题从一个地方转移到另一个地方。检查点是一个[中心化的方案](https://www.coindesk.com/bitcoins-security-model-deep-dive/)，会打开另一个潘多拉盒子 [<sup>3</sup>](#note)。

（*想知道关于 “私钥攻击” 的更深入的讨论，请看[本系列下一篇文章](https://medium.com/@hugonguyen/proof-of-stake-private-keys-attacks-and-unforgeable-costliness-the-unsung-hero-5caca70b01cb)* （[中文译本](https://www.btcstudy.org/2021/09/10/proof-of-stake-private-keys-attacks-and-unforgeable-costliness-the-unsung-hero/)）。）

----

结论是，具备正确的思维对比特币和区块链协议发展来说是非常重要的。它们理应是能够适配最高级别工程的关键系统。

**权益证明建立在有缺陷的并且是幼稚的假设上，它们在最糟糕的情形下会迅速崩溃**。权益证明是往错误的方向迈出的一步：它会降低而不是提高防御的质量。

----

<p id="note"><strong>作者注</strong></p>

注 1：一些早期对权益证明的分析：Andrew Poelstra,  “<a href="https://download.wpsoftware.net/bitcoin/pos.pdf">论权益与共识</a>” （[中文译本](https://www.btcstudy.org/2021/09/23/on-stake-and-consensus-by-Andrew-Poelstra/)）

注 2：网络隔离是一个重要的研究领域。看看  Ethan Heilman 在这个领域的<a href="https://eprint.iacr.org/2015/263.pdf">工作</a>

注 3：检查点可以用一种去中心化的方式来实现，但它们会导致一些问题，要求完全的中心化解决方案，所以实际上检查点就是中心化的。

（完）
