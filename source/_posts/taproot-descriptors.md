---
title: 'Taproot 描述符'
author: 'Optech newsletter'
date: '2022/02/11 15:21:08'
cover: ''
excerpt: '输出脚本描述符提供了一种通用方式，让钱包能存储创建地址所需的信息'
categories:
- 比特币主网
tags:
- 钱包
- 描述符
---


> *作者：Optech newsletter*
> 
> *来源：<https://bitcoinops.org/en/preparing-for-taproot/#taproot-descriptors>*



[输出脚本描述符](https://bitcoinops.org/en/topics/output-script-descriptors)提供了一种通用方式，让钱包能存储创建地址所需的信息、高效扫描这些地址上的可用输出，以及从这些地址上支出。此外，描述符相当紧凑并且内含一个基础校验和，便于备份地址信息、在不同钱包之间复制或在参与多签的钱包之间共享。

虽然目前只有极少数项目使用描述符，但是描述符连同相关的 [miniscript](https://bitcoinops.org/en/topics/miniscript/) 项目或将显著提高不同钱包和工具之间的互操作性。当越来越多用户利用 taproot 的优势通过[多签](https://bitcoinops.org/en/topics/multisignature)来提高安全性，并通过备份支出条件来提升弹性时，提高互操作性将变得愈发重要。

为此，我们需要更新描述符，以便将它们与 taproot 一起使用。这是最近刚合并的 [Bitcoin Core #22051](https://github.com/bitcoin/bitcoin/issues/22051) PR 的主题。该语法旨在让单个描述符模版提供使用 P2TR 私钥路径支出和脚本路径支出所需的一切信息。在简单的单签场景中，我们仅需使用以下描述符：

```java
tr(<key>)
```

同样的语法也可用于多签和[门限签名](https://bitcoinops.org/en/topics/threshold-signature)。例如，Alice、Bob 和 Carol 使用 [MuSig](https://bitcoinops.org/en/topics/musig) 聚合他们的私钥，然后支付给 `tr()`。

反直觉的一点是，`tr()` 指定的 `key` 不会是地址中编码的私钥。根据 BIP341 的[安全建议](https://github.com/bitcoin/bips/blob/master/bip-0341.mediawiki#cite_note-22)，`tr()`描述符使用的是承诺到不可花费脚本树的内部私钥。这可以保护简单私钥聚合方案的用户免受攻击（像 [MuSig](https://bitcoinops.org/en/topics/musig/) 和 MuSig2 这样更高级的方案不受影响）。

新增了一种专门针对脚本花费路径的语法，能够指定二叉树的内容。例如，`{ {B,C} , {D,E} }` 指定的二叉树如下所示：

```java
Internal key
    / \
   /   \
  / \ / \
  B C D E
```

我们可以将一个二叉树指定为之前使用的描述符模版的第二个可选参数。假设 Alice 既想通过私钥路径进行花费，又想让 Bob、Carol、Dan 和 Edmond 能够通过脚本路径进行花费（该脚本路径会为 Alice 生成审计跟踪，但不是为了实施第三方链上监控），Alice 可以使用以下描述符：

```python
tr( <a_key> , { {pk(<b_key>),pk(<c_key>)} , {pk(<d_key>),pk(<e_key>)} )
```

若想将描述符与 taproot 搭配使用，上述功能都是必不可少的。但是 PR #22051 指出，这里依然缺少一些能够让描述符更善于完整描述预期策略的东西：

- **无效私钥路径**：一些用户可能想要禁止使用私钥路径进行花费，从而强制使用脚本路径进行花费。现在，我们只需将不支持花费的私钥作为 `tr()` 的第一个参数就可以做到这点，但是最好能够让钱包将这一偏好存入描述符中，并让描述符计算隐私性强且不支持花费的私钥路径。
- **Tapscript 多签**：就传统地址和 segwit v0 而言，`multi()` 和 `sortedmulti()` 描述符支持 `OP_CHECKMULTISIG` 操作码。为了在 taproot 中实现批量验证，基于脚本的多签在 tapscript 中的处理方式略有不同。因此，`tr()` 描述符目前需要通过 `raw()` 脚本指定所有必需的多签操作码。如果有针对 tapscript 的升级版 `multi()` 和 `sortedmulti()`就好了。
- **基于多 MuSig 的多签**：在上文中，我们提到了 Alice、Bob 和 Carol 通过手动聚合他们的私钥来使用 `tr()`  描述符。在理想情况下，会有一个函数让他们指定类似 `tr(musig(, , ))` 的内容，以便他们保留所有原始的密钥信息并使用这些信息来填充 [PSBT](https://bitcoinops.org/en/topics/psbt/)（部分签名的比特币交易） 中用来协调签名的字段。
- **时间锁、哈希锁和 pointlock**：这些用于闪电网络、[DLC](https://bitcoinops.org/en/topics/discreet-log-contracts)（谨慎日志合约）、[coinswaps](https://bitcoinops.org/en/topics/coinswap) 等协议的强大构造目前只能通过`raw()` 函数来描述。我们有可能直接在描述符中添加对它们的支持，或在描述符的姊妹项目 [miniscript](https://bitcoinops.org/en/topics/miniscript/) 中添加对它们的支持。将 miniscript 整合到 Bitcoin Core 的项目仍在开发中。但是，我们预期这项创新能像 PSBT 和描述符等工具那样惠及其它钱包。

钱包不需要为了使用 taproot 而实现描述符。但是，这么做的钱包将为今后使用更高级的 taproot 功能奠定良好的基础。

（完）