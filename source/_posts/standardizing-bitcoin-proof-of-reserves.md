---
title: '比特币保证金证明的标准化'
author: 'Steven Roose'
date: '2022/04/15 21:32:49'
cover: '../images/standardizing-bitcoin-proof-of-reserves/20x1080.jpg'
excerpt: '创建一个能够为区块链行业提供最佳标准保证金证明实践的解决方案'
tags:
- 生态
---


> *作者：Steven Roose*
> 
> *来源：<https://blog.blockstream.com/en-standardizing-bitcoin-proof-of-reserves/>*



![Standardizing Bitcoin Proof of Reserves](../images/standardizing-bitcoin-proof-of-reserves/20x1080.jpg)

用户和监管机构向比特币交易所施加越来越多的压力，要求它们证明自己能正确管理用户的资金。这些年来经历了如此多高调的黑客攻击（其中很多攻击不为人知地持续了一段时间）后，证明比特币保证金已经成了想要维系用户信任的企业的重要任务。

遗憾的是，少数几个正在采取措施向第三方证明其比特币余额的交易所都是采用自己的解决方案来生成证明。五花八门的证明方法给想要亲自验证交易所持仓量的人出了难题，因为他们必须熟悉每个系统，这通常需要具备一些专业技术知识。

Blockstream 旨在创建一个能够为区块链行业提供最佳标准保证金证明实践的解决方案。该解决方案广泛兼容大多数比特币交易所存储用户资金所采用的方式。我们已经向 bitcoin-dev 邮件列表[提交了 BIP](https://github.com/bitcoin/bips/pull/756)。而今，我们已经将工具开源，以征求行业反馈。

## 缘起

起初，我们是为 Liquid 打造解决方案，以便其向第三方审计提供 Liquid Bitcoin（L-BTC）保证金证明。但是，在研究 Liquid 项目的过程中，我们很快就意识到交易所目前用来证明比特币保证金的方法尚有改进空间，以及我们的软件在 Liquid Network 之外还有更广阔的应用空间。

## 传统方法

缺少标准化的比特币保证金证明方法主要存在两大问题：

1. 可及性差：正如上文所述，由于各个交易所都采用 DIY 的方式，保证金证明解决方案技术门槛高，且认知度低。用户必须弄清楚如何验证他们所使用的交易所的持仓量。这只会减少验证，增加需要的信任因素。
2. 安全风险：保证金证明需要交易所方面证明其持有交易所钱包所对应的私钥。为此，交易所方面通常要将所有资金转移至一组新的地址，让试图窃取交易所资金的攻击者有了可乘之机。

## 保证金证明是如何运作的

Blockstream 的保证金证明工具基于行业内久经检验的方法迭代而成，而非一个从头开始构建的全新优质解决方案。

简单来说，保证金证明可以让交易所证明其能够花费多少比特币，无需创建“实时”交易或承担转移资金的风险。

Blockstream 工具可以让交易所创建一个花费交易所内所有比特币 UTXO 的交易，然后另外添加一个无效输入。包含无效输入后，整个交易就会被视为无效，并在广播时被比特币网络拒绝。但是，通过这种方式构建的交易仍可以用来证明交易所有能力花费其持有的全部比特币 UTXO。

然后，该交易数据可以分享给所有需要验证保证金的人。这些人只需将数据导入自己的保证金证明客户端，即可确认交易所的总持仓量以及与之关联的地址。该解决方案简单易用，只要是知道如何运行 CLI 应用的人都可以轻松驾驭。

## 落地

保证金证明是用 Rust 编写的，现已支持 Bitcoin Core 钱包和 Trezor，后续将完成更多集成（很快就会支持 Ledger！）

我们很高兴看到保证金证明能够落地，这都要感谢我们 Blockstream 研究团队提出的部分签名比特币交易（PSBT） 能够自由使用。

## 未来计划

目前，使用保证金证明工具构建的证明需要交易所公开完整的 UTXO 列表。一旦 UTXO 列表公开，可能会泄露过多交易所的财务运作信息。但是，在 Liquid 的帮助下，交易所能够证明并公开其总持仓额，但是不会暴露每个 UTXO 的金额，因为 Liquid 使用了保密交易（Confidential Transaction）。

目前，我们的保证金证明工具有望得到交易所的广泛采用，用于创建保证金证明以便审计方进行验证。我们已经有了一些想法 <sup><a href="#note1" id="jump-1">1</a></sup> 准备落实，旨在提高工具的隐私性，以便在将来进一步推广给交易所用户。

## 欢迎加入

保证金证明将成为  Liquid 上的标准功能，用于证明 L-BTC 持仓量。我们还将为所有 Liquid Network 成员提供技术支持，帮助大家在常规比特币操作过程中部署该工具。如果你想了解如何加入 Liquid Network，请向我们发送邮件申请。

## 资源

- 该项目的 Github：https://github.com/ElementsProject/reserves

- BIP 参考：https://github.com/bitcoin/bips/pull/756

- bitcoindev 邮件列表中的原始提案：https://lists.linuxfoundation.org/pipermail/bitcoin-dev/2019-January/016633.html

## 脚注

1.<a id="note1"> </a>Making Bitcoin Exchanges Transparent - Christian Decker, James Guthrie, Jochen Seidel and Roger Wattenhofer. 20th European Symposium on Research in Computer Security (ESORICS), Vienna, Austria, September 2015. https://www.tik.ee.ethz.ch/file/b89cb24ad2fa4e7ef01426d318c9b98b/decker2015making.pdf <a href="#jump-1">↩</a>

（完）