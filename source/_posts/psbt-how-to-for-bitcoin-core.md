---
title: '在 Bitcoin Core 中使用 PSBT'
author: 'mjdietzx'
date: '2022/08/15 23:23:11'
cover: ''
excerpt: 'PSBT 是尚未完全签好名的比特币交易的传输格式'
tags:
- PSBT
- 开发
---


> *作者：mjdietzx*
> 
> *来源：<https://github.com/bitcoin/bitcoin/blob/master/doc/psbt.md>*



自 0.17 版本开始， Bitcoin Core 就有了一套给 “部分签名的比特币交易（Partially Signed Bitcoin Transactions，PSBT，由 [BIP 174](https://github.com/bitcoin/bips/blob/master/bip-0174.mediawiki) 定义）” 准备的 RPC 接口。

## PSBT 简介

PSBT 是尚未完全签好名的比特币交易的传输格式，它携带有相关的元数据，可帮助人们签名交易。它的设计初衷是简化多个参与者合作生成一笔交易的流程。这样的场景包括硬件钱包、多签名钱包和 [CoinJoin](https://bitcointalk.org/?topic=279249) 交易。

### 流程概述

构建一笔完整签名的比特币交易需要经历下列步骤：

- 一位**创建者**提出需要创建的某一笔交易。他们构造一个 PSBT，包含特定的输入和输出，但不包含其它元数据。
- 对每个输入，都由一位**更新者**为该 PSBT 加入关于被花费的 UTXO 的信息。他们也在该 PSBT 的每一个输入（可能的时候包括输出）中加入关于脚本和公钥的信息。
- **签名者**检查交易及其元数据，来决定是否同意该交易。他们可以利用来自 UTXO 的数额信息，知晓相关的价值和手续费。如果他们同意，就为自己具有相关公钥的输入生成一个部分签名。
- 为每个输入运行一个**定稿器**，将部分签名和可能的脚本信息转化为一个最终的  ` scriptSig ` （脚本签名）以及/或者  ` scriptWitness ` （脚本见证数据）。
- **抽取器**从各输入已经定稿的 PSBT 中产生一笔有效的比特币交易（变成可在网络中广播的形式）。

一般来说，上述的每一个流程（除了创建者和抽取器）都会为处理中的 PSBT 加入越来越多的数据，直至所有输入都被签名。在一个粗疏的工作流中，他们必须按照顺序、一个接一个地参与，直到抽取器将 PSBT 转化为一笔真实的交易。为了允许并行操作，可以增加一个**合并者**，由 TA 来为同一笔未签名的交易合并来自不同 PSBT 的元数据。

上述所有加粗的名词及其角色都由 BIP174 定义。这些名词在理解背后的流程时是有帮助的，但在实际操作中，软件和硬件实现往往会同时实现多个角色。

## Bitcoin Core 中的 PSBT

### RPCs

- **`converttopsbt` （创建者可用）**是一个效用型 RPC，可以将一笔未签名的原始交易转化成  PSBT 格式。它会忽略存在的签名。
- **`createpsbt` （创建者可用）**是一个效用型 RPC，可以读取一组输入和输出，并将他们转化成一个不带其它信息的 PSBT。等价于在 ` createrawtransaction ` 之后调用 ` converttopsbt ` 。
- **`walletcreatefundedpsbt` （创建者、更新者可用）**是一个钱包 RPC，会使用具体的输入和输出创建一个 PSBT。具体来说，对于该钱包已经直到的输入（识别为普通余额或观察余额的），该方法会为 PSBT 加入 UTXO 信息。对于已有 UTXO 信息的输出和输入，会加入钱包知晓的公钥和脚本信息。等价于在运行 `fundrawtransaction` 和 `converttopsbt`之后运行 `createrawtransaction`。
- **`walletprocesspsbt` （更新者、签名者、定稿器可用）**是一个钱包 RPC，取一个 PSBT 作为输入，为缺少数据的输入和输出加入 UTXO、公钥和脚本数据，还可以选择签名输入。可以做到的时候，它还会敲定部分签名。
- **`utxoupdatepsbt` （定稿器可用）**是一个节点 RPC，取一个 PSBT 作为输入，并从 UTXO 集合中获得可用的信息来更新它（仅对 SegWit 输入可用）。
- **`finalizepsbt` （定稿器、抽取器可用）**是一个效用型 RPC，可以敲定任何部分签名；而且，如果所有的输入都已经敲定，该方法会将结果转化为一笔完整签名的、可以使用 `sendrawtransaction` 在网络中广播的交易。
- **`combinepsbt` （合并者可用）**是一个效用型 RPC，实现了合并者，它可以用在整个工作流的任一时间点，合并添加到同一个 PSBT 的不同版本中的信息。具体来说，它可用于合并来自多个更新者和签名者的输出。
- **`joinpsbts`**（创建者可用）是一个效用型 RPC，可以将多个 PSBT 结合在一起，汇总输入和输出。可以用来构建 CoinJoin 交易。
- **`decodepsbt`** 是一个诊断型效用 RPC，可以将一个 PSBT 中的所有信息以人类可读的形式表现出来，还可以计算出最终的手续费（如果 PSBT 中已有的话）。
- **`analyzepsbt`** 是一个效用型 RPC，可以检查一个 PSBT 并报告其输入的当前状态、操作流程的下一个步骤（如果可知的话）；而且，如果可行的话，它还会计算最终交易的手续费，并估计最终的重量和手续费率。

### 操作流程

**多个 Bitcoin Core 设备参与的多签名**

想要快速上手，请看《[使用描述符钱包和 PSBT 的 M-of-N 多签名基本示例](https://github.com/bitcoin/bitcoin/blob/master/doc/descriptors.md#basic-multisig-example)》。如果你用的是传统钱包，那么请继续了解这里提供的例子。

Alice、Bob 和 Carol 希望创建一个 2-of-3 的多签名地址。他们都使用 Bitcoin Core。我们假设他们的钱包中只包含多签名资金。与此同时他们各有一个个人钱包，这可以通过 Bitcoin Core 的多钱包特性来实现 —— 可能因此在使用  ` bitcoin-cli ` （命令行工具）时需要使用 ` rpcwallet=name ` 来指明调用哪个钱包。

启动：

- 三人各使用 ` getnewaddress ` 来创建一个新地址；我们把这三个地址分别叫做 *Aalice*、*Abob* 和 *Acarol*。
- 三人各自调用  ` getaddressinfo "X" ` ，X 就是他们各自的地址，并记录相应的公钥；我们把这几个公钥分别叫做  *Kalice*、*Kbob* 和 *Kcarol*。
- 现在，三人可以各自运行 ` addmultisigaddress 2 ["Kalice","Kbob","Kcarol"] ` 以产生多签名脚本并告知钱包模块；这条命令所产生的多签名地址，我们叫做 *Amulti*。他们可以需要手动指定相同的地址类型，以免因为不同的节点设置而建构出不同版本的地址。
- 他们还各自运行  ` importaddress "Amulti" "" false ` ，命令钱包跟踪  ` Amulti ` 所收到的支付并作为观察钱包余额。
- 其他人可以通过运行 ` createmultisig 2 ["Kalice","Kbob","Kcarol"] ` 、检查结果是否为 *Amulti* 来验证这个地址。同上，可能有必要指定地址类型，才能获得匹配的地址。不过，这个命令不能用来初始化交易。
- 他们现在可以对外给出 *Amulti*，作为其他人可以支付的地址。

后来，*Amulti* 收到 *V* BTC 之后，Bob 和 Carol 想把资金全部移到 *Asend*，没有找零。Alice 不需要参与。

- 其中一人 —— 这里假设是 Carol —— 初始化创建流程。她运行 ` walletcreatefundedpsbt [] {"Asend":V} 0 {"subtractFeeFromOutputs":[0], "includeWatching":true} ` 。我们把这个命令所返回的 PSBT 叫做 *P*。*P* 不包含任何签名。
- Carol 需要自己签名这笔交易。为此，她运行 ` walletprocesspsb "P" ` ，然后将结果 *P2* （也是一个 PSBT）交给 Bob。
- Bob 使用 ` decodepsbt "P2" ` 来检查这个 PSBT，确认这笔交易是否有预期的输入、有一个输出给   *Asend*、手续费合理。如果他也同意这笔交易，他调用 ` walletprocesspsbt "P2" ` 来签名。结果是 *P3*，包含了 Carol 和 Bob 的签名。
- 现在，任何一人都可以调用  ` finalizepsbt "P3" ` ，抽取出完整签名的交易 *T*。
- 最后，任何人都可以使用 ` sendrawtransaction "T" ` 来广播这笔交易。

在需要更多签名者参与的情形中，让所有者并行签名而不是按顺序处理可能会有一些好处。在我们的例子中，就会变成 Carol 分别给每个签名者传递 *P* 的拷贝；这些签名者各自调用 ` walletprocesspsbt "P" ` 来签名，最终得到各自签名的 PSBT 结构体。然后，他们将各自的 PSBT 结构体发回给 Carol（发给其他某一人也可以），由后者来运行 ` combinepsbt ` 。最后的两个步骤（ ` finalizepsbt` 和 `sendrawtransaction ` ）保持不变。

（完）