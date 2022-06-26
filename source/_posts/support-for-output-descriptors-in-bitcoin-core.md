---
title: 'Bitcoin Core 对输出描述符的支持'
author: 'achow101'
date: '2022/05/15 23:44:34'
cover: ''
excerpt: '这是一种简单的语言，可以用来描述输出脚本的集合'
categories:
tags:
---


> *作者：achow101*
> 
> *来源：<https://github.com/bitcoin/bitcoin/blob/master/doc/descriptors.md>*



自 Bitcoin Core 软件的 0.17 版本开始，它就支持输出描述符（Output Descriptors）。这是一种简单的语言，可以用来描述输出脚本的集合。相关的 RPC 方法包括：

- `scantxoutset` 以描述符为输入，开展扫描；也将播报相匹配的 UTXO 的专门描述符
- `getdescriptorinfo` 分析一个描述符，并报告一个规范化的、带有校验和的版本
- `deriveaddresses` 以一个描述符为输入，计算出相应的地址
- `listunspent` 为被报告的未花费输出产生一个专门的描述符
- `getaddressinfo` 为可被解决的地址产生一个描述符（从 0.18 版本开始可用）
- `importmulti` 以描述符为输入，导入到钱包中（从 0.18 版本开始可用）
- `generatetodescriptor` 以描述符为输入，并为之生成资金（仅限于 `regtest ` ，从 0.19 版本开始可用）
- `utxoupdatepsbt` 以描述符为输入，添加信息到某 psbt 中（从 0.19 版本开始可用
- `createmultisig` 和 `addmultisigaddress` 都会返回描述符（从 0.20 版本开始可用）

本文档的目的是介绍这门语言。想要了解正在使用的规范，请看 RPC 文档来了解上述的函数。

## 特性

输出描述符当前支持：

- 支付到公钥型脚本（P2PK），通过 ` pk ` 函数
- 支付到公钥哈希值型脚本（P2PKH），通过 ` pkh ` 函数
- 支付到隔离见证公钥哈希值型脚本（P2WPKH），通过 ` wpkh ` 函数
- 支付到脚本哈希值型脚本（P2SH），通过 ` sh ` 函数
- 支付到隔离见证脚本哈希值型脚本（P2WSH），通过 ` wsh ` 函数
- 支付到 taproot 型输出（P2TR），通过 ` tr ` 函数
- 多签名输出，通过 ` multi ` 函数
- 多签名脚本，并且其中的公钥是按字典顺序排列的，通过 ` sortedmulti ` 函数
- 内置于 taproot 脚本树的多签名脚本，通过 ` multi_a ` （以及 ` sortedmulti_a ` ）函数
- 任意类型的已经得到支持的地址，通过 ` addr ` 函数
- 原始的十六进制字符串，通过 ` raw ` 函数
- 十六进制形式的公钥（压缩的和未压缩的），或者带有派生路径的 BIP32 扩展公钥（extended public key）

## 例子

- `pk(0279be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798)` 描述了这个公钥的 P2PK 输出
- `pkh(02c6047f9441ed7d6d3045406e95c07cd85c778e4b8cef3ca7abac09b95c709ee5)` 描述了这个公钥的 P2PKH 输出
- `wpkh(02f9308a019258c31049344f85f89d5229b531c845836f99b08601f113bce036f9)`描述了这个公钥的 P2WPKH（隔离见证公钥哈希值）输出
- `sh(wpkh(03fff97bd5755eeea420453a14355235d382f6472f8568a18b2f057a1460297556))` 描述了这个公钥的 P2SH-P2WPKH 输出（用脚本哈希值封装的隔离见证公钥哈希值输出）
- `combo(0279be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798)` 描述了这个公钥的任意 P2PK、P2PKH、P2WPKH 和 P2SH-P2WPKH 输出
- `sh(wsh(pkh(02e493dbf1c10d80f3581e4904930b1404cc6c13900ee0758474fa94abe8c4cd13)))` 描述了这个公钥的（过于复杂的） P2SH-P2WSH-P2PKH 输出（使用 P2SH 封装的隔离见证脚本哈希值，而这个隔离见证脚本哈希值又封装了这个公钥哈希值）
- `multi(1,022f8bde4d1a07209355b4a7250a5c5128e88b84bddc619ab7cba8d569b240efe4,025cbdf0646e5db4eaa398f365f2ea7a0e3d419b7e0330e39ce92bddedcac4f9bc)` 描述了带有裸露 *1-of-2* 多签名脚本的输出，并且公钥的顺序已由描述符指明
- `sh(multi(2,022f01e5e15cca351daff3843fb70f3c2f0a1bdd05e5af888a67784ef3e10a2a01,03acd484e2f0c7f65309ad178a9f559abde09796974c57e714c35f110dfc27ccbe))` 描述了 P2SH 的 *2-of-2* 多签名脚本输出，并且公钥的顺序如此处所载
- `sh(sortedmulti(2,03acd484e2f0c7f65309ad178a9f559abde09796974c57e714c35f110dfc27ccbe,022f01e5e15cca351daff3843fb70f3c2f0a1bdd05e5af888a67784ef3e10a2a01))` 描述了 P2SH 的 *2-of-2* 多签名脚本输出，并且赎回脚本（redeemScript）中的这 2 个公钥是按字典顺序排序的
- `wsh(multi(2,03a0434d9e47f3c86235477c7b1ae6ae5d3442d49b1943c2b752a68e2a47e247c7,03774ae7f858a9411e5ef4246b70c65aac5649980be5c17891bbec17895da008cb,03d01115d548e7561b15c38f004d734633687cf4419620095bc5b0f47070afe85a))` 描述了 P2WSH（隔离见证的脚本哈希值）的 *2-of-3* 多签名脚本输出，并且这 3 个公钥是按这里的顺序排序的
- `sh(wsh(multi(1,03f28773c2d975288bc7d1d205c3748651b075fbc6610e58cddeeddf8f19405aa8,03499fdf9e895e719cfd64e67f07d38e3226aa7b63678949e6e49b241a60e823e4,02d7924d4f7d43ea965a465ae3095ff41131e5946f3c85f79e44adbcf8e27e080e)))` 描述了 P2SH 的 P2WSH 的 *1-of-3* 的多签名输出，并且这 3 个公钥是按这里的顺序排序的
- `pk(xpub661MyMwAqRbcFtXgS5sYJABqqG9YLmC4Q1Rdap9gSE8NqtwybGhePY2gZ29ESFjqJoCu1Rupje8YtGqsefD265TMg7usUDFdp6W1EGMcet8)` 描述了以该 xpub 形式表示的公钥的 P2PK 输出
- `pkh(xpub68Gmy5EdvgibQVfPdqkBBCHxA5htiqg55crXYuXoQRKfDBFA1WEjWgP6LHhwBZeNK1VTsfTFUHCdrfp1bgwQ9xv5ski8PX9rL2dZXvgGDnw/1/2)` 描述了以该 xpub 形式表示的公钥的 *1/2* 代子密钥的 P2PKH 输出
- `pkh([d34db33f/44'/0'/0']xpub6ERApfZwUNrhLCkDtcHTcxd75RbzS1ed54G1LkBUHQVHQKqhMkhgbmJbZRkrgZw4koxb5JaHWkY4ALHY2grBGRjaDMzQLcgJvLJuZZvRcEL/1/*)` 描述了一组 P2PKH 输出，但额外指明了，这个公钥是指纹为 `d34db33f ` 的主密钥的  ` 44'/0/0' ` 代子密钥
- `wsh(multi(1,xpub661MyMwAqRbcFW31YEwpkMuc5THy2PSt5bDMsktWQcFF8syAmRUapSCGu8ED9W6oDMSgv6Zz8idoc4a6mr8BDzTJY47LJhkJ8UB7WEGuduB/1/0/*,xpub69H7F5d8KSRgmmdJg2KhpAK8SR3DjMwAdkxj3ZuxV27CprR9LgpeyGmXUbC6wb7ERfvrnKZjXoUmmDznezpbZb7ap6r1D3tgFxHmwMkQTPH/0/0/*))` 描述了一组 P2WSH 的 *1-of-2* 多签名输出，其中，第一个多签名公钥是描述符中第一个 xpub 形式公钥的   *1/0/*` i ` 个子密钥，而第二多签名公钥是描述符中第二个形式公钥的第 *0/0/*` i ` 个子密钥，而  ` i ` 是一个可配置的区间（默认为 ` 0-1000 ` ）内的任意数字
- `wsh(sortedmulti(1,xpub661MyMwAqRbcFW31YEwpkMuc5THy2PSt5bDMsktWQcFF8syAmRUapSCGu8ED9W6oDMSgv6Zz8idoc4a6mr8BDzTJY47LJhkJ8UB7WEGuduB/1/0/*,xpub69H7F5d8KSRgmmdJg2KhpAK8SR3DjMwAdkxj3ZuxV27CprR9LgpeyGmXUbC6wb7ERfvrnKZjXoUmmDznezpbZb7ap6r1D3tgFxHmwMkQTPH/0/0/*))` 面熟了一组 P2WSH 的 *1-of-2* 多签名输出，其中第一个多签名公钥是描述符中第一个 xpub 形式公钥的  *1/0/* ` i ` 个子密钥 ，另一个多签名公钥则是描述符中第二个 xpub 定时公钥的 *0/0/* ` i ` 个子密钥；  ` i ` 是一个可配置的区间（默认为 ` 0-1000 ` ）内的任意数字。最终的 witenessScript（见证）脚本中的公钥的顺序由具体索引号下的公钥的字典顺序决定
- `tr(c6047f9441ed7d6d3045406e95c07cd85c778e4b8cef3ca7abac09b95c709ee5,{pk(fff97bd5755eeea420453a14355235d382f6472f8568a18b2f057a1460297556),pk(e493dbf1c10d80f3581e4904930b1404cc6c13900ee0758474fa94abe8c4cd13)})` 描述了一个 P2TR 输出，该输出以  ` c6…… ` 这个 x-only 公钥作为内部密钥（internal key），并带有两个脚本花费路径
- `tr(c6047f9441ed7d6d3045406e95c07cd85c778e4b8cef3ca7abac09b95c709ee5,sortedmulti_a(2,2f8bde4d1a07209355b4a7250a5c5128e88b84bddc619ab7cba8d569b240efe4,5cbdf0646e5db4eaa398f365f2ea7a0e3d419b7e0330e39ce92bddedcac4f9bc))`描述了一个 P2TR 输出，该输出以  ` c6…… ` 这个 x-only 公钥作为内部密钥，并带有一个 ` multi_a ` 脚本，该脚本需要这两个 x-only 公钥的签名，并且公钥是按字典顺序排列的

## 参考

描述符由多种表达式组成。顶级的表达式要么是一个  ` SCRIPT ` ，要么是 ` SCRIPT#CHECKSUM ` ，其中  ` CHECKSUM ` 是一个 8 字符长的描述符校验和，包含字母和数字。

 ` SERIPT ` 表达式：

- `sh(SCRIPT)` （只能用在顶层）：嵌入参数中的 P2SH
- `wsh(SCRIPT)` （要么用于顶层，要么内置于 ` sh ` 函数中）：嵌入参数中的 P2WSH
- `pk(KEY)` （可用在任何地方）：给定公钥的 P2PK 输出
- `pkh(KEY)` （不可放置于 ` tr ` 函数中）：给定公钥的 P2PKH 输出（如果你只知道公钥的哈希值，则应使用 ` addr ` 函数） 
- `wpkh(KEY)` （要么用在顶层，要么内置于 ` sh ` 函数）：这个压缩公钥（compressed pubkey）的 P2WPKH 输出
- `combo(KEY)`（只能用在顶层）：`pk(KEY)` 和 `pkh(KEY) ` 集合的缩写。如果这是一个压缩公钥，则该集合还包括 `wpkh(KEY)` 和 `sh(wpkh(KEY))`。
- `multi(k,KEY_1,KEY_2,...,KEY_n)` （不能放置于  ` tr ` 中）：使用  OP_CHECKMULTISIG 的 k-of-n 多签名脚本。
- `sortedmulti(k,KEY_1,KEY_2,...,KEY_n)` （不能放置于 `tr` 中）：所示公钥在最终脚本中以字典顺序排序的多签名脚本。
- `multi_a(k,KEY_1,KEY_2,...,KEY_N) ` （只能用在  ` tr ` 中）：使用 OP_CHECKSIG、OP_CHECKSIGADD 和 OP_NUMEQUAL 实现的多签名脚本。
- `sortedmulti_a(k,KEY_1,KEY_2,...,KEY_N)` （只能用在  ` tr ` 中）：类似于 `multi_a`，但脚本中的（x-only）公钥会按字典顺序排序。
- `tr(KEY)` 或者 `tr(KEY,TREE)` （只能用在顶层）：以所示公钥为内部密钥的 P2TR 输出，可选加入一个脚本花费路径树
- `addr(ADDR)` （只能用在顶层）：编码成所示 ADDR 的脚本
- `raw(HEX)`（只能用在顶层）：十六进制编码为所示 HEX 的脚本



 ` KEY ` 表达式：

- 可选加入，密钥的来源信息，由下列数据组成：
  - 起点方括号 `[`
  - 8 个 16 进制字符，表示作为密钥衍生的起点的密钥的指纹（详情见 BIP32）
  - 接上 0 ，或多个  ` /NUM ` 路径元素来指明从指纹密钥到所示密钥所遵循的未强化派生路径（unhardened derivation），或多个  ` /NUM' ` 路径元素来指明从指纹密钥到所示 xpub/xprv 根值所遵循的强化派生路径（hardened derivation）
  - 终点方括号 `]`
- 然后是实际的密钥，是下列其中之一：
  - 十六进制编码的公钥（要么是以  ` 02 ` 或 ` 03 ` 开头的 66 位字符，表示一个压缩公钥；要么是以 ` 04 ` 开头的 130 位字符，表示一个未压缩的公钥）
    - 在 ` wpkh ` 和 ` wsh ` 函数中，只能使用压缩公钥
    - 在  ` tr ` 函数中，只能是由 x-only 公钥（64 位的十六进制数）
  - 可以使用 [WIF](https://en.bitcoin.it/wiki/Wallet_import_format) 编码的私钥而非对应的公钥，意思是相同的
  -  ` xpub ` 编码形式的扩展公钥或者 ` xprv ` 编码的扩展私钥（由 [BIP 32](https://github.com/bitcoin/bips/blob/master/bip-0032.mediawiki) 定义）
    - 接上 0 或者多个 ` /NUM ` 或 ` /NUM' ` 来表示未强化和强化的 BIP32 推导步骤
    - 可选，接上一个 ` /* ` 或者 ` /*' ` 最终步骤来指明来所有（直接）未强化或强化的子私钥
    - 强化型派生路径需要提供私钥

（在任何使用  ` ' ` 后缀来指明使用强化派生路径的，都可以使用 ` h ` 作为替代）

 ` TREE ` 表达式：

- 任何 ` SCRIPT ` 表达式
- 起点大括号 ` { ` ，一个 ` TREE ` 表达式，一个逗号 ` , ` ，一个 ` TREE ` 表达式，以及一个终点大括号 ` } ` 

 ` ADDR ` 表达式表达任意得到支持的地址：

- P2PKH 地址（base58 编码，主网的地址以  ` 1... ` 开头，测试网地址以 ` [nm]... ` 开头。注意，描述符中的 P2PKH 地址不能被用于 P2PK 输出（需要使用 ` pk ` 函数）
- P2SH 地址（base58 编码，在主网以 ` 3... ` 开头，在测试网以 ` 2... ` 开头，由 [BIP 13](https://github.com/bitcoin/bips/blob/master/bip-0013.mediawiki) 定义）。
- 隔离见证地址（bech32 和 bech32m，在主网以 ` bc1... ` 开头，在测试网以 ` tb1... ` 开头，由 [BIP 173](https://github.com/bitcoin/bips/blob/master/bip-0173.mediawiki) 和 [BIP 350](https://github.com/bitcoin/bips/blob/master/bip-0350.mediawiki) 定义）

## 解释

### 单公钥（single-key）脚本

人们习惯使用许多单公钥脚本构造，通常来说包括 P2PK、P2PKH、P2WPKH 和 P2SH-P2WPKH。还有许多可以想象出来的组合，尽管它们可能不是最优的：P2SH-P2PK、P2SH-P2PKH、P2WSH-P2PK、P2WSH-P2PKH、P2SH-P2WSH-P2PK、P2SH-P2WSH-P2PKH。

为了描述这些，我们将它们模型化为函数。函数 ` pk ` （描述 P2PK）、 ` pkh ` （描述 P2PKH）和 ` wpkh ` （描述 P2WPKH）以一个 ` KEY ` 表达式为输入，返回相应的 *scriptPubkey*（脚本公钥）。函数 ` sh ` （描述 P2SH）和 ` wsh ` （P2WSH）以一个 ` SCRIPT ` 表达式作为输入，返回以该输入作为嵌入脚本所生成的 P2SH 和 P2WSH 脚本。为了简洁，这些函数的名字都不包含 “p2”。

### 多签名（Multisig）

许多软件使用基于比特币的 OP_CHECKMULTISIG 操作码的多签名脚本。为了支持这种输出，我们加入了 ` multi(k,key_1,key_2,...,key_n)` 和 `sortedmulti(k,key_1,key_2,...,key_n) ` 函数。它们代表一种 *k-of-n* 的多签名花费条件，在花费这样的输出时，n 个所提供的  ` KEY ` 表达式中必须有至少 k 个参与签名。

密钥的顺序对 ` multi() ` 是非常重要的。一个 ` multi() ` 表达式中的密钥的顺序，与所描述的多签名脚本中的密钥顺序一致；在用来搜索交易输出（TXO）时，它将不会匹配密钥相同但允许不同的多签名 scriptPubkey。同样地，为了防止搜索空间组合式膨胀，如果一个  ` multi() ` 中超过一个密钥参数是以  ` /* ` 或 ` *' ` 结尾的通配符，这个 ` multi() ` 表达式只会匹配各带通配符  ` KEY ` 的第  ` i ` 个子密钥所形成的多签名脚本，而不会匹配这许多子密钥的任意组合。

密钥的顺序对 ` sortedmulti() ` 就不重要。 ` sortedmulti() ` 的行为跟 ` multi() ` 是一样的，但最终脚本中的密钥会重新排序，按 BIP67 的定义形成字典排序。

**基本的多签名例子**

想获得多个参与者之间的 M-of-N 多签名脚本使用描述符钱包和 PSBT 的例子（以及签名流程），请看[这个功能性测试](https://github.com/bitcoin/bitcoin/blob/master/test/functional/wallet_multisig_descriptor_psbt.py)。

免责声明：请注意，这个例子只用作入门介绍，并且为了好读易懂而做得比较基础。此处所列方法的一个缺点是每个参与者都必须保管（和备份）两个钱包：一个签名器和相应的多签名脚本。还应该说明的是，此处的 “默认” 并不是隐私上最好的习惯 —— 参与者应该留心，这个签名器只应用来签名跟这个多签名脚本有关的交易。最后，不建议使用 Bitcoin Core 描述符钱包以外的工具来作为签名器。其它钱包，不论是软件的还是硬件的，可能会加入额外的检查和安全措施来防止用户签名可能导致资金损失或被视为安全隐患的交易。符合各种第三方检查和验证并不在本例的意图之内。

基本步骤有：

1. 每个参与者都生成一个 xpub。最直接的办法就是创建一个新的描述符钱包，这个钱包我们称为该参与者的签名器钱包。请避免在签名来自相应多签名脚本的交易以外的用途中使用这个钱包。提示：使用 ` listdescriptors ` 抽取这个钱包的 xpub 公钥，然后从 ` pkh ` 描述符中选出一个；之所以要使用  ` pkh ` 是因为这是最不可能被意外使用的（传统地址）
2. 创建一个仅可观察（watch-only）的描述符钱包（空白的、禁用了私钥）。现在，可通过导入两个描述符来创建多签名脚本： ` wsh(sortedmulti(,XPUB1/0/*,XPUB2/0/*,…,XPUBN/0/*))` 和 `wsh(sortedmulti(,XPUB1/1/*,XPUB2/1/*,…,XPUBN/1/*)) ` （前者使用 ` 0 ` 路径，用作收款地址，后者使用 ` 1 ` 路径，用作找零）。每一个参与者都这样做。
3. 收款地址可从这个多签名脚本中生成出来。作为一个确保步骤 2 正确执行的检查，参与者们应该相互比对，验证大家得到了同样的地址。
4. 资金发送到收款地址
5. 使用 ` walletcreatefundedpsbt ` 创建从该多签名钱包发出的交易（任何一个参与者都可以发起）。如果有图形界面，只需跳到该多签名钱包的  ` Send ` （发送）栏，然后创建一个未签名的交易（PSBT）
6. 至少  ` M  ` 个参与者在自己的多签名钱包中使用 ` decodepsbt `  检查这个 PSBT，以验证这笔交易是没问题的
7. （如果没问题）参与者们用自己的签名器钱包使用 ` walletprocesspsbt ` 签名这个 PSBT。如果有图形界面，则只需从文件中加载 PSBT 并签名即可
8. 签好名的 PSBT 使用  ` combinepsbt ` 来收集并用 ` finalizepsbt ` 来定稿，然后这笔最终的交易就会广播到网络中。注意，任何钱包（任意一个签名器钱包或多签名钱包）都可以做这件事。
9. 检查在交易被打包进区块后，钱包的余额发生了正确的变化

你可能更喜欢串联式的签名流程，就是参与者们按顺序一个接一个地签名，直到这个 PSBT 得到了 ` M ` 个签名、可视为 “完成了”。两种签名流程的大部分步骤都相同，除了第 6、7 步：从各人并行签名最初的 PSBT ，变成了按顺序签名。在串联式签名中， ` combinepsbt ` 就不是必要的了，最后一个（第 ` m ` 个）签名者可以在签名后直接广播该 PSBT。注意，并行式签名在参与者较多的时候可能更好用。串联式签名在 测试/Python 案例 中也收纳了。[这个测试](https://github.com/bitcoin/bitcoin/blob/master/test/functional/wallet_multisig_descriptor_psbt.py)既有意成为文档和功能性测试，所以它做得尽可能简单和易读。

### BIP32 派生密钥和链条

大部分先进的钱包软件和硬件都使用 BIP32（“层级式密钥”）来派生密钥。我们允许由一个扩展公钥（通常称为 *xpub* ）加上生成一个公钥所用的派生路径组成的字符串，从而直接支持这个协议。派生路径由一连串的 0 或更多整数（在 0  ~ 2 ^ 31 - 1 的范围内）组成，每个整数都可以选择接上  ` ' ` 或者  ` h ` ，并使用  ` / ` 字符分隔开。这串字符可以用字符 ` /* ` 或者 ` /*' ` （或 ` /*h ` ）结尾，以指代一个可配置的范围（默认是 ` 0-1000 ` ，包含的）内所有未强化或强化的子密钥。

在使用强化派生步骤描述一个公钥时，如果没有相应的私钥，脚本就无法计算出来。

### 密钥起源辨识

为了描述签名密钥驻留在另一台设备上的脚本，有必要定位主密钥（master key）和派生出一个 xpub 公钥的路径。

举个例子，遵循 BIP44，直接使用  ` xpub.../44'/0'/0'/1/* ` （其中 ` xpub... ` 对应于主密钥 ` m ` ）来描述一串找零地址是很方便的。但是，因为这里面有强化派生路径，如果你不能访问到相应的私钥，单靠这个描述符是无法计算出脚本的。相反，它应该写成 ` xpub.../1/* ` ，而 ` xpub... ` 对应于 ` m/11'/0'/0' ` 。

在跟硬件设备交互时，有必要包含从主密钥开始的完整路径。[BIP174](https://github.com/bitcoin/bips/blob/master/bip-0174.mediawiki) 标准化了这个流程：提供主密钥的 *指纹*（主密钥的 Hash 160 值的前 32 比特），再加上所有的派生步骤。为了支持这样的构造，我们允许在描述符语言中提供这一密钥起源信息，即使它并不会影响一个描述符所指代的 scriptPubKey。

每一个公钥都可以加上由方括号括起来的前缀，括号内是8 个十六进制字符的指纹以及（可选）派生路径（强化和未强化的），从而指明主密钥以及这个密钥（或 xpub）所遵循的派生路径。

注意，父密钥的指纹只用于在软件内快速检测父密钥和子密钥，软件自己要处理可能的冲突。

### 包含私钥

通常来说，传输一个脚本的描述时一并传输必要的私钥都是有用的。所以，在任何支持使用公钥或 xpub 公钥的地方，都可以提供 WIF 格式的私钥或 xprv 私钥作为替代。这在私钥是必要信息时都是有用的，比如在强化派生路径中推导强化派生公钥时，以及在转存储包含私钥材料的钱包描述符时。

### 与旧钱包的兼容性

为了易于表示在现有的 Bitcoin Core 钱包中得到支持的脚本集合，我们提供了一个便利的函数 ` combo ` ，它以一个公钥为输入，可以描述该公钥的一系列 P2PK、P2PKH、P2WPKH 和 P2SH-P2WPKH 脚本。在公钥未压缩的情况下，这个集合将仅包含 P2PK 和 P2PKH 脚本。

### 校验和

描述符可以加上一个校验和后缀，来防止误输入和复制粘贴错误。

这些校验和由 8 个字母数字字符构成。只要错误限制在将某一属于  `0123456789()[],'/*abcdefgh@:$%{}  ` 集合的字符替换成了集合内的其他字符以及字母大小写的不同，在 501 字符长的描述符中最多可以检测到 4 个错误，在更长的描述符中最多能检测到 3 个。对于更大数量的错误或者其他类型的错误，检测不到错误的几率只有不到万亿分之一。

Bitcoin Core 的所有 RPC 都会在输出中包含校验和。只有特定的 RPC 需要在输入中添加校验和，包括  ` deriveaddress` 和 `importmulti ` 。尚未具有校验和的描述符的校验和可以使用 ` getdescriptorinfo ` RPC 计算出来。

（完）

