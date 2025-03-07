---
title: '等待确认（九）：交易池规则新提议'
author: 'Gloria Zhao'
date: '2023/07/28 10:24:16'
cover: ''
excerpt: '凸显了交易中继规则设计中合作的重要性和困难'
categories:
- 比特币主网
tags:
- 交易池
---


> *作者：Gloria Zhao*
>
> *来源：<https://bitcoinops.org/zh/newsletters/2023/07/12/>*
>
> *译者：[Primitives Lane](https://github.com/PrimitivesLane)*
>
> *本文为 Gloria Zhao 在 Optech Newsletter 上编写的 “交易池” 系列周刊的第九篇。*
>
> *[前篇见此处](https://www.btcstudy.org/2023/07/21/waiting-for-confirmation-8-policy-as-an-interface/)*



[上周的文章](https://bitcoinops.org/zh/newsletters/2023/07/05/#等待确认-8交易池规则是个接口)介绍了 “[锚点输出](https://bitcoinops.org/en/topics/anchor-outputs/)” 和 [CPFP carve out](https://bitcoinops.org/en/topics/cpfp-carve-out/)，以确保通道双方任意一方都可以在不需要协作的情况下为他们共同的承诺交易追加手续费。这种方法仍然有一些不足之处：通道资金被绑定以创建锚点输出；承诺交易费率通常高于交易池最低费率以确保其能够被尽快打包。而且，CPFP carve out 只允许一个额外的后代。锚点输出也不能为三方或更多方共享的交易如 [coinjoin](https://bitcoinops.org/en/topics/coinjoin/) 或多方合作协议提供相同的手续费提升能力。本篇文章探讨了目前为解决这些和其他限制所做的努力。

“[交易包中继](https://bitcoinops.org/en/topics/package-relay/)（package-relay）” 提议包括点对点协议和规则变更，以使得交易组的传输和验证得以实现。这将允许承诺交易即使未达到交易池的最低费率，也可通过子交易进行费用提升。此外，“*包 RBF*” 可让追加手续费的子交易[替换](https://bitcoinops.org/en/topics/replace-by-fee/)掉与其父交易发生冲突的交易。包中继旨在消除基础协议层的一般限制。然而，由于它在共享交易费用提高方面的实用性，它也催生了一些旨在消除特定情况下交易[钉死攻击](https://bitcoinops.org/en/topics/transaction-pinning/)的尝试和努力。例如，包 RBF 允许承诺交易在广播其各自的费用提升子交易时互相替换，从而消除了每个承诺交易上需要多个锚点输出的需要。

需要注意的是，现有的 RBF 规则要求替换交易支付的绝对费用高于所有待替换交易支付的累计费用。此规则有助于防止通过重复替换来发起的 DoS，但允许恶意用户通过附加高费用但低费率的子交易来增加替换其交易的成本。这种通过阻止善意用户发起高手续费率的替代交易包、从而阻碍交易被挖出的不公平情形，通常被称为，“针对规则 3 的交易钉死”。

开发人员还提出了完全不同的给预签名交易增加费用的方式。例如，使用 `SIGHASH_ANYONECANPAY | SIGHASH_ALL` 签署交易输入，可以允许交易广播者通过在交易中附加额外的输入（而不改变输出）来提供费用。然而，由于 RBF 没有任何规则要求替代交易具有更高的“挖矿分数”（即会更快地入选一个区块），攻击者可以通过创建来自低手续费率祖先交易的替换交易，来钉死这些类型的交易。难以准确评估交易和交易包“挖矿分数”的原因在于，现有的祖先和后代限制不能限定该计算的计算复杂性。任何关联的交易都会影响交易被挑选到区块中的顺序。一个完全连接的组合（称为_集群_）可以是给定的当前祖先和后代限制的任何大小。

解决一些交易池不足和 RBF 钉死攻击的长期解决方案是[重构交易池数据结构，以跟踪集群](https://github.com/bitcoin/bitcoin/issues/27677)而不仅仅是祖先和子孙集合。这些集群的大小将受到限制。限制集群的大小会限制用户使用未确认的UTXO的方式，但可以使用基于祖先分数的挖矿算法快速线性化整个交易池，极快地构建区块模板，并添加条件：要求替换交易需要具有比待替换交易更高的挖矿分数。

即便如此，可能没有一套规则能够满足交易中继的广泛需求和期望。例如，尽管批量付款交易的收款方受益于能够花费未确认的输出，但相对宽松的后代限制会给共享交易的绝对费用留下包 RBF 钉死攻击的空间。为此，针对 “[v3 交易中继规则](https://bitcoinops.org/en/topics/version-3-transaction-relay/)” 的一个提议被制定出来，以允许合约协议选择更严格的一套包限制要求。V3交易仅允许大小为二的包（父级与子级），并限制子交易的重量。这些限制将减轻通过绝对费用钉死 RBF 的攻击，并为集群交易池提供一些好处，而无需重构交易池。

“[临时锚点](https://bitcoinops.org/en/topics/ephemeral-anchors/)” 提议建立在 v3 交易和交易包中继属性之上，以进一步改进锚点输出。它使得零费用 v3 交易所属的锚点输出免于[粉尘限制](https://bitcoinops.org/en/topics/uneconomical-outputs/)，但前提是该锚点输出被费用提升的子级花费。由于零费用交易必须由一个子级（孩子）进行费用提升（否则矿工不会被激励将其包含在区块中），因此此锚点输出是“短暂的”，不会成为 UTXO 集的一部分。临时锚点提案隐含地阻止了在未确认时花费非锚点输出，而不需要设立 `1 OP_CSV` 时间锁，因为唯一允许的子级必须花费锚点输出。这也使得使用 [CPFP](https://bitcoinops.org/en/topics/cpfp/) 作为通道关闭交易的费用提供机制的 [LN symmetry](https://bitcoinops.org/en/topics/eltoo/) 协议成为可能。它还使得这种机制可用于多于两个参与者共享的交易。开发者一直在 [signet](https://bitcoinops.org/en/topics/signet/) 上使用 [bitcoin-inquisition](https://github.com/bitcoin-inquisition/bitcoin) 来部署临时锚点以及各种软分叉提议，以构建和测试这些多层次的变化。

在本文中提到的钉死问题，以及其他问题，在去年引起了[许多关于改进 RBF 规则得讨论和建议](https://bitcoinops.org/zh/newsletters/2022/12/21/#rbf)，这些讨论和建议的平台包括邮件列表、PR、社交媒体和面对面会议。开发人员提出并实施了各种解决方案，从小的修改到完全改版的方案都有。`-mempoolfullrbf` 选项旨在解决钉死问题和 BIP125 实现中的差异，突显了交易中继规则中合作的重要性和困难。虽然已经做出了真正的努力并使用了常规的方式让社区参与进来，包括提前一年开始 bitcoin-dev mailing 对话，但很明显，现有的沟通和决策方法并没有产生预期的结果，需要改进。

去中心化的决策过程具有挑战性，但是它对于支持使用比特币交易中继网络的协议和应用程序的多样化生态系统来说是必要的。下周将是我们系列文章的最后一篇，我们希望鼓励我们的读者参与并改进这个过程。

