---
title: '近期关于 “全面 RBF” 的争论'
author: 'Gloria Zhao'
date: '2022/11/09 21:06:57'
cover: ''
excerpt: '全面 RBF 交易池策略意味着允许所有交易出现替换版本'
categories:
- 比特币主网
tags:
- 交易池
---


> *作者：Gloria Zhao*
> 
> *来源：<https://github.com/glozow/bitcoin-notes/blob/full-rbf/full-rbf.md>*



免责声明：这是我从阅读我可以得到的所有材料以及跟尽可能多的人交谈中得出的个人理解。在表达我个人的看法时，我将注明。此外，我已经尽可能保持心态开放和公平，但不能排除有不自知的偏见。

## 背景

### RBF 与 Full RBF

“手续费替换（RBF，[Replace-by-Fee](https://bitcoinops.org/en/topics/replace-by-fee/)）” 是一种交易池策略，让节点可以基于交易的手续费率来定夺相互冲突的未确认交易。在这种交易池策略出现之前，交易池一般采取先到先得的策略（如果新进入的交易与交易池中的交易有冲突，则拒绝进入）。

- [Bitcoin Core #6871](https://github.com/bitcoin/bitcoin/pull/6871)
- [BIP 125](https://github.com/bitcoin/bips/blob/master/bip-0125.mediawiki)
- Bitcoin Core 已经从 0.12.0 开始使用 “选择性 RBF”（Opt-in RBF，BIP125）

“全面 RBF（Full RBF）” 的定义[一直在变化](https://bitcoinops.org/en/newsletters/2022/10/19/#fn:full-rbf)。在本文中，全面 RBF 交易池策略意味着允许所有交易出现替换版本，不论原版本是否用信号位表示使用 BIP125 替换方法。

### 近期的争论

2021 年 6 月：Antoine Riard 发帖提出了一份在 Bitcoin Core v24.0（计划于 2022 年 9 月/10 月发布）中添加一个 ` -mempoolfullrbf ` 的选项，同时征求意见和担忧。

- [optech 的总结](https://github.com/bitcoin/bitcoin/issues/25353)

- [optech 的总结](https://bitcoinops.org/en/newsletters/2022/07/13/#bitcoin-core-25353)（[中文版本](https://bitcoinops.org/zh/newsletters/2022/07/13/#bitcoin-core-25353)）
- [邮件组帖子](https://lists.linuxfoundation.org/pipermail/bitcoin-dev/2022-October/020980.html)

2022 年 10 月：Dario Sneidermanis 发帖表示担心全面 RBF 和 ` -mempoolfullrbf ` 选项会给接受未确认交易作为结账手段的企业造成问题。他建议从 0.24.0 中移除 ` -mempoolfullrbf ` 选项，给 Muun 和其它应用一些时间来准备。

- [optech 的总结](https://bitcoinops.org/en/newsletters/2022/10/19/#transaction-replacement-option)（[中文版本](https://bitcoinops.org/zh/newsletters/2022/10/19/#transaction-replacement-option)）
- [邮件组帖子](https://lists.linuxfoundation.org/pipermail/bitcoin-dev/2022-October/020980.html)

这份帖子引出了许多的争论和邮件，主要是关于全面 RBF 的一般特性的：

- [许多人](https://lists.linuxfoundation.org/pipermail/bitcoin-dev/2022-October/020981.html) [回应](https://lists.linuxfoundation.org/pipermail/bitcoin-dev/2022-October/021017.html)强调 Bitcoin Core 的默认 RBF 策略并没有改变。
- Anthony Towns [发帖](https://lists.linuxfoundation.org/pipermail/bitcoin-dev/2022-October/021017.html)表示同意在网络层面部署全面 RBF 而不是在个体节点层面自选的办法，可以公开讨论。他建议，作为一种为协议和企业留出时间来测试和接收的办法，可以暂时约束这个选项，使之只能在测试网上使用，并创建一个在主网上部署默认的全面 RBF 的时间表。
- Sergej Kotliar [发帖](https://lists.linuxfoundation.org/pipermail/bitcoin-dev/2022-October/021056.html)提出了全面 RBF 的问题，不同意重复花费风险已经很高、闪电网络可以替代链上的 “零确认” 支付的想法。他提供了一些来自 Bitrefill 的经验数据。他说，在现实中，“只有不到百万分之一” 重复花费成功了。他指出，只有 15% 的支付使用了闪电网络，而且，之前一项实验表明默认使用 bech32 地址只会赶走用户。他估计，如果 Bitrefill 停止接受未确认的支付，“他们 85% 的比特币用户都在链上支付；这些用户的绝大部分将不再使用比特币。”
- John Carvaho [发帖](https://lists.linuxfoundation.org/pipermail/bitcoin-dev/2022-October/021011.html)讨论了 RBF 的一般问题。他相信这会让零确认支付的风险更难管理。在后面提到的同一篇[帖子](https://lists.linuxfoundation.org/pipermail/bitcoin-dev/2022-October/021056.html)中，Sergej Kotliar 也将免费期权问题作为交易替换技术的问题之一。见下文的美式期权部分。

人们已经为 Bitcoin Core 提交了多个跟全面 RBF 相关的代码和并请求。

- [#26287](https://github.com/bitcoin/bitcoin/pull/26287) 实现了在主网上移除该选项的请求。在多位审核人表示反对之后，该 PR 关闭了。
- [#26323](https://github.com/bitcoin/bitcoin/pull/26323) 是一个默认启用全面 RBF 的 PR，但它有一个预定的时间（2023 年 5 月 1 日）。即使用户设定了 ` -mempoolfullrbf=1 ` ，在这个时间点以前也不会影响节点的行为。在这个时间点之后，用户依然可以通过设定 ` mempoolfullrbf=0 ` ，继续要求交易用信号位表态。
- [#26305](https://github.com/bitcoin/bitcoin/pull/26305) 是一个默认启用全面 RBF 的请求，实现了 Antoine 在邮件组中的帖子的第二部分。这个 PR 不是为 v24.0 提出的。大多数审核人表示在概念上支持该特性进入 v25.0 及以后的版本。

## 总结

这是我在阅读和跟双方 1：1 交流之后的理解。还有一些人我没有联系上，而且我可能也会有偏见。我已经尽力了，如果我不公平地表达了其他人的观点，请谅解。

### 对全面 RBF 的看法

人们的想法差不多可以分成 3 种：

1. 我们应该主动走向全面 RBF
2. 我们现在应该阻止全面 RBF，但以后应该走向它
3. 我们应该 *一以贯之* 地避免激活全面 RBF

第一种立场主要由协议开发者持有，第二种是一些企业人士的观点。最后一种似乎很罕见。

**为什么我们应该主动走向全面 RBF**

1. 全面 RBF 是网络的自然状态。比特币区块、PoW 等等机制的用意就是解决资金的重复花费问题；未确认的交易本身就从来没有过终局性保证。当一个矿工收到两笔相互冲突的交易时，激励兼容的策略就是选择给他们更高收益的那一笔。使用 RBF 策略可以帮助节点对哪一笔交易更有可能确认获得更准确的认知。当一笔没有用信号位标记使用 RBF 的交易遇到相冲突的、手续费更高的版本时，“矿工会从善如流” 的安全假设大大弱于 “矿工会理性行事” 的假设
2. 已经可以观察到全面 RBF 的行为了，所以我梦应该准备好升级我们的交易池策略，以便更准确地预知什么交易会被挖出。如果全面 RBF 已经普及，而我的节点依然使用选择性 RBF 策略，那么我的节点会拒绝那些更有可能被挖出的交易，可能会让我对重复花费的尝试一无所知。
3. 启用全面 RBF 可以解决多种 基于信号位的 DoS/钉死[攻击](https://lists.linuxfoundation.org/pipermail/lightning-dev/2021-May/003033.html)。

常见的反对意见：

- 接受未确认的交易作为结账手段，在现实中通常是安全的。
- 对闪电网络的攻击在现实中不常见。

**为什么我们现在应该阻止全面 RBF**

1. 全面 RBF 会给接受未确认交易作为结账手段的企业带来更好的重复花费风险。理论上来说，接受未发信号使用 RBF 的未确认的交易是不安全的；但在现实中，就目前来说，往往是安全的，而且也是比特币用户发送快速支付的常见方法。闪电网络已经有了，但整个生态还在开发技术和 UI 层、希望它能触达更多用户，但接受度依然很低。移除使用链上未确认交易的选择可能不会在实质上助推闪电网络，反而会赶走用户。见 [Dario Sneidermanis 的帖子](https://lists.linuxfoundation.org/pipermail/bitcoin-dev/2022-October/020980.html)。

常见的反对意见：

- 零确认交易完全不安全；即使在当前，也是有可能被重复花费的。
- 如果零确认交易在现实中是安全的，这不是因为大家没有使用全面 RBF，而是因为企业采取了预防措施，例如要求用户附带更高的手续费率，而且会[等待](https://lists.linuxfoundation.org/pipermail/bitcoin-dev/2022-October/021112.html)一段时间、在[其它（有时候是多个）交易池](https://lists.linuxfoundation.org/pipermail/bitcoin-dev/2022-October/021084.html)中侦测相互赛跑的交易。而且企业往往会在用户重复花费时[受到法律的保护](https://lists.linuxfoundation.org/pipermail/bitcoin-dev/2022-October/021087.html)。

**为什么我们应该一贯阻止全面 RBF**

1. RBF 总会给接受未确认交易作为结账手段的企业带来更好的重复花费风险。当前的风险接近于 0。这些企业应该能够继续使用这个假设，因为它支持 “快速” 链上支付。
2. [美式看涨期权](https://lists.linuxfoundation.org/pipermail/bitcoin-dev/2022-October/021056.html)：如果在交易确认之前，比特币的汇率升高，用户可以通过替换来 “取消” 这笔交易、创建新的交易。

常见的反对意见：

- 全面 RBF 是不可避免的，尤其是当手续费变成矿工收益的重要部分时。尝试强迫人们做激励不兼容的事是没有意义的，在一个去中心化的网络中也是不现实的。见 [Russell O'Connor 的帖子](https://lists.linuxfoundation.org/pipermail/bitcoin-dev/2022-October/021037.html)、[Antoine Riard 的帖子](https://lists.linuxfoundation.org/pipermail/bitcoin-dev/2022-October/021067.html)。
- 当前的选择性 RBF [已经存在这个免费看涨期权问题](https://lists.linuxfoundation.org/pipermail/bitcoin-dev/2022-October/021056.html)了，而且[可能有其它的解决方案](https://lists.linuxfoundation.org/pipermail/bitcoin-dev/2022-October/021108.html)。

###  ` -mempoolfullrbf ` 选项

**为什么我们现在应该移除这个选项**？

1. 这个选项的存在不能跟 Bitcoin Core 的背书分离开来。Bitcoin Core 没有默认开启它，但加入这个选项就已经是一种信号，表示开发者认为用户可以安全地拥有这个选项。
2. 加入这个选项会让运行全面 RBF 变得更加容易，所以矿工 *就会* 打开这个选项，提高现实中无信号的替换交易的传播。只要少数人打开，无信号的替换交易就可以传播开来了。见 [Dario Sneidermanis 的帖子](https://lists.linuxfoundation.org/pipermail/bitcoin-dev/2022-October/020984.html)。
3. 如果这个选项导致网络在各企业准备好之前进入全面 RBF，企业们可能会被攻击 以及/或者 被迫缩小他们的（许多）用户的选择。这对比特币不是什么好事。

**为什么我们应该保留这个选项**

1. 一个软件产品的用户不应该能够从用户手上剥夺选择。我们已经听到一些用户表示 “我想要这个选项来配置我的个人节点”，而其他用户说 “我不想要其他用户拥有这个选项，因为 …………”。如果你的回应是 “没错，不好意思，你们不能拥有这个特性，但不是因为我们做不到，而是因为其他用户不让你们这么做”，这听起来不合理。
2. 这让 Bitcoin Core 需要对节点运营者的个人决定负责人。这个选项没有改变节点的默认行为。拥有这个选项并不意味着全面 RBF 就会被采用；即使我们移除这个选项，全面 RBF 依然可能落地。见 [Pieter Wuille 的帖子](https://lists.linuxfoundation.org/pipermail/bitcoin-dev/2022-October/021006.html)

常见的反对意见：

- 要是添加这个选项没什么大不了，那么移除它也没什么大不了。见 [Anthony Towns 的帖子](https://lists.linuxfoundation.org/pipermail/bitcoin-dev/2022-October/021001.html)

### 问题和事实上的分歧

我认为，有必要为这些根本性的分歧专门安排一节，因为这些分歧导致了人们在许多讨论中相互推诿。

- 全面 RBF 在网络中的流行
  - Peter Todd [报告](https://lists.linuxfoundation.org/pipermail/bitcoin-dev/2022-October/021012.html)称他已经用 opentimestamps 观察到了没有使用 RBF 信号的交易的替换版本）。他指出这很少见，而且有可能这些替换交易是因为别的原因而出现的。
  - 他也在 2016 年[发帖](https://np.reddit.com/r/Bitcoin/comments/40ejy8/peter_todd_with_my_doublespendpy_tool_with/cytlhh0/)讨论了相关主题。那场讨论读起来很像今天的争论。
- 当前接受零确认交易的重复花费风险
- RBF 和闪电网络在比特币生态中的接受程度
- Bitcoin Core 给出了多少 “提醒”
  - Murch 和其他人（尤其是在 [irc 会议](https://www.erisian.com.au/bitcoin-core-dev/log-2022-10-20.html)期间）[表示](https://github.com/bitcoin/bitcoin/pull/26287#issuecomment-1276444078)：“我们已经讨论全面 RBF 有 7 年了”
  - Antoine Riard 于 2021 年 6 月在邮件组中[发帖](https://lists.linuxfoundation.org/pipermail/bitcoin-dev/2021-June/019074.html)，早于这个选项被合并到代码库中一年多。
  - David Harding [指出](https://github.com/bitcoin/bitcoin/pull/26287#issuecomment-1289901007)，这篇帖子（译者注：应指 #25353 PR 本身的描述）可能没有完全搞清楚加入这个选项可能带来的影响和 *风险*。许多人认为这会直接导致全面 RBF 在网络中的流行，所以，应该传达的信息是，企业在那之前必须先做好准备。

我还有一些开放问题，如果能问到矿工，我会非常感激：

- 如果 v24.0 包含 `-mempoolfullrbf` 选项，矿工会打开它吗？如果会，什么时候会行动？
- 如果我们移除 `-mempoolfullrbf` 选项，矿工最终依然会实现完全 RBF（例如运行一个补丁）吗？

## 前进

### 侦测网络中的全面 RBF 行为

我们应该尝试侦测全面 RBF 的行为在网络中有多普遍，因为，如果无信号的替换交易已经非常普遍，这意味着我们有坚实的理由打开 `-mempoolfullrbf=1` 。还有一些事情需要关注：

- Peter Todd 的 [opentimestamps](https://alice.btc.calendar.opentimestamps.org/)。上面的每一笔交易都列出了其手续费；任何高于 182 聪的交易都是一笔无信号的替换交易。
- 无信号替换交易的个人实验。
- 对 Muun、Bitrefill 和其他接受未确认交易作为结账手段的企业尝试重复花费。
- 在其他软件上尝试全面 RBF 。例如，实现全面 RBF，或添加行为以假设替换交易可以不带信号。

### Bitcoin Core v24.0

Bitcoin Core v24.0 [计划](https://github.com/bitcoin/bitcoin/issues/24987)在 2022 年 12 月 19 日发布。修复 bug 会提出发布时间，但我认为这件事是我们的最后一个障碍。我不认为 “已经太晚了，不应该更改内容了” 是一个很好的理由，但紧迫性是存在的。

全面 RBF 在每周一次的 bitcoin-core-dev IRC 会议上[讨论过](https://www.erisian.com.au/bitcoin-core-dev/log-2022-10-20.html)。没有作出合并或推进 #26323 和 #26287 的决定。许多人支持 #26305，但希望设置更长的时间周期（1 至 2 个版本，或者一两年后）。许多人不喜欢从用户手中剥夺选择的想法，尤其是这个选择是他们喜欢的，而且对节点运营者个体来说是安全的。

对我来说，最大的问题是：“加入这个选项会导致矿工切换到全面 RBF 吗？” 而且我认为，需要由矿工自己来回答，而不是我们去猜测。就像全面 RBF 的支持者不能一口咬定 “矿工会这样做因为这是理性的”，我也不认为人们可以断言 “矿工会这样做，因为这就是打开一个开关”。

Dario 发表了一份从 Muun 的角度对现有 PR 的分析。他显然支持全面 RBF，但对一些可预测性感兴趣。举个例子，如果预计从现在开始的一段时间（比如 6 个月）后每个人都会切换到全面 RBF，Muun 就有时间来实现和部署他们的解决方案。

### 推出的时间表

许多人建议为全面 RBF 的合作性部署安排一份时间表：

- https://lists.linuxfoundation.org/pipermail/bitcoin-dev/2022-October/021026.html
- https://lists.linuxfoundation.org/pipermail/bitcoin-dev/2022-October/021017.html
- https://lists.linuxfoundation.org/pipermail/bitcoin-dev/2022-October/021099.html
- https://lists.linuxfoundation.org/pipermail/bitcoin-dev/2022-October/021101.html

我个人也认为，部署全面 RBF 最安全的办法是合作性部署，并在时机上与人们认为整个生态可以准备好的时间抑制。但这并不是一种共识变更，只是每个人都在同一时间切换会更安全。

如前所述，如果全面 RBF 已经开始在网络中出现，而且大部分 Bitcoin Core 的用户没有办法配置他们的节点以接收不带信号的替换交易，那么他们的交易池就会变得不准确。即使我们密切地监控网络、矿工也主动表示他们正在接受不带信号的替换交易，让节点能够自动切换还是比让每个人自己用  ` mempoolfullrbf=1 ` 重启节点更安全。

时间表可能会给企业压力、让他们搞清楚技术和用户体验上的东西，但从我的角度看，大约两年的时间是非常合理的。类似地，如果矿工计划在 2014 年的区块补贴减半后切换到全面 RBF（即，因为手续费因为补贴降低而变得更加重要），这（两年的周期）将与他们的计划一致，所以（我认为）他们不会通过打补丁来切换。

不过，我也认为，合并某种形式的超时激活方案，可能会使人们指责 Bitcoin Core 尝试强制推行全面 RBF。尝试问那些会受到全面 RBF 影响的企业 “你们什么时候会准备好接受全面 RBF？”，似乎永远只能得到一句 “想都别想！”，但我认为还是值得一试的。

### 在处理全面 RBF 上需要帮助的企业

**替换交易的侦测**

**替换交易的防范**