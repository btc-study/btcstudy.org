---
title: 'OP_CHECKSIGFROMSTACK 操作码简介'
author: 'Bitcoin Optech'
date: '2025/03/20 16:11:18'
cover: ''
excerpt: '这种操作码可以检查对任意消息的签名'
tags:
- CSFS
---


> *作者：Bitcoin Optech*
> 
> *来源：<https://bitcoinops.org/en/topics/op_checksigfromstack/>*



**OP_CHECKSIGFROMSTACK（OP_CSFS）**是基于 ELEmentsProject.org 的侧链上的一种操作码，有时候也被提议在比特币上实现。这种操作码可以检查对任意消息的签名。它会接收三个参数：一个签名、一条消息和一个公钥。

比特币现有的签名检查操作码，比如 `OP_CHECKSIG`，是不允许指定任意消息的；它们所验证的消息是从执行签名检查操作码的交易中派生出来的，这样它们就能验证签名跟一个公钥相匹配、且该公钥背后的私钥生成了授权这次花费的数据（公钥和签名）。这套机制足够强大，足以保护比特币的 UTXO，但阻止了使用电子签名来鉴证比特币系统中的其他类型的数据。使用 `OP_CSFS`，我们就能验证对任意消息的签名，从而给比特币用户带来多项新特性：

-  **为签名支付**：如果 Alice 控制着一个私钥、该私钥可以签名一笔给 Bob 支付的交易，那么 Bob 可以使用 OP_CSFS 来免信任地承诺会为了 Alice 的签名而给 Alice 支付。

  不过，近期，涉及为签名支付的协议通常[假设使用 “适配器签名”](https://gnusha.org/url/https://lists.linuxfoundation.org/pipermail/lightning-dev/2019-July/002077.html)，那会更加隐私，也只需使用更少的区块空间。

- **委托**：Alice 可能希望委托授权 Bob 来花费她的资金，但又不想显式地创建一笔链上交易、将资金转移到她和 Bob 的一个 1-of-2 多签名地址。如果 Alice 有意将她的脚本设计成带有这种委托，那么她可以将 Bob 的公钥放在一条消息中，然后使用 OP_CSFS 来证明她将花费的权限委托给了这个公钥。

  另一种可以实现相同效果的替代方案是 [graftroot](https://gnusha.org/url/https://lists.linuxfoundation.org/pipermail/bitcoin-dev/2018-February/015700.html)，而且更加隐私、更加灵活，也更节省区块空间，不过着需要一个软分叉，而且到目前为止很少关注。

- **断言机**：断言机指的是答应会签名一条消息来见证一个事件（比如体育比赛）的结果的参与者。然后，两个或更多用户可以将资金存到一个使用 OP_CSFS 的脚本中，该脚本会基于断言机所见证的结果触发支付。

  近期对断言机主持合约的关注包括 “[谨慎日志合约](https://dci.mit.edu/smart-contracts)（DLCs）”，它会更隐私，区块空间效率也会更高。

- **防止重复花费的保证金**：一个服务商可以承诺永远不会花费自己的某个 UTXO，以鼓励其收款方接受其未确认的交易为可靠的支付。为了证明自己的诚意，这个服务商可以使用 OP_CSFS 来承诺将一笔保证金支付给任何能证明同一个密钥为花费同一个 UTXO 而创建了两个不同签名的用户。

  这种用法可以跟 “[single-show signatures](https://gnusha.org/url/https://lists.linuxfoundation.org/pipermail/bitcoin-dev/2014-December/007038.html)” 相类比，后者允许任何人只要看到来自同一密钥的两个签名就能推导出用来创建它们的私钥，从而可以花费该密钥所保护的其他资金。
  
-  **交易内省**：如果同一对公钥和签名对 `OP_CSFS` 和 `OP_SHECKSIG` 两种操作码都是有效的，那就说明，传递给 `OP_CSFS` 的消息跟 `OP_CHECKSIG` 所隐式使用的序列化交易（以及其他数据）是完全一样的。因此，我们可以利用这一点，将一个经过验证的花费交易的副本放在脚本求值堆栈 中、使用其它操作码来运行检查，从而对实际的花费交易执行一些限制。

   比如说，如果 `OP_CSFS` 在 2015 和 2016 年就启用了，那么，我们只需编写一种验证脚本就可以实现  [BIP65](https://github.com/bitcoin/bips/blob/master/bip-0065.mediawiki) `OP_CHECKLOCKTIMEVERIFY` （CLTV 脚本绝对时间锁）和 [BIP112](https://github.com/bitcoin/bips/blob/master/bip-0112.mediawiki) `OP_CHECKSEQUENCEVERIFY` （CSV 脚本相对时间锁）的特性，无需专门的共识变更。

   展望未来，`OP_CSFS` 也可以用来编写能够[实现](https://gnusha.org/url/https://lists.linuxfoundation.org/pipermail/bitcoin-dev/2019-May/016946.html)提议中的 [SIGHASH_ANYPREVOUT](https://bitcoinops.org/en/topics/sighash_anyprevout/) 特性，以及提议中的其它操作码（比如 [OP_CHECKTEMPLATEVERIFY](https://bitcoinops.org/en/topics/op_checktemplateverify/)）特性的脚本。此外，`OP_CSFS` 还可以用来创建 “[限制条款](https://bitcoinops.org/en/topics/covenants/)” —— 用来约束一组比特币被花费的方式 —— 比如，“[保险柜合约](https://bitcoinops.org/en/topics/vaults/)” 可以限制花费交易的输出的脚本公钥，从而限制被盗的风险。

   `OP_CSFS` 的强大指出在于，它提供了对运行脚本的交易的完全内省，而且是完全通用的。它的缺点在于，它需要将交易的完整副本添加到堆栈中，可能会极大地增加交易的体积。相比之下，一些单一用途的内省操作码，比如 CLTV 和 CSV，只有极小的开销，但是每添加一种特殊的内省操作码都需要一次共识变更，而且想要禁用就必然要冒让某些用户丢失资金的风险（即使它看起来已不再流行）。

    

