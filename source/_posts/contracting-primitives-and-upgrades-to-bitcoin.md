---
title: '构造合约的元件与比特币的升级'
author: 'Jeremy Rubin'
date: '2022/05/25 18:22:25'
cover: ''
excerpt: '为比特币提议的构造智能合约的元件'
categories:
- 比特币主网
tags:
- 开发
- CTV
- Eltoo
- covenant
---


> *作者：Jeremy Rubin*
> 
> *来源：<https://rubin.io/bitcoin/2021/12/05/advent-8/>*



在本文中，我们会快速浏览一些构造智能合约的元件，既包括现有的，也包括还在提议阶段的。若需要更透彻的解读，我在文内相关段落提供了链接。

## BIP-119 CTV CheckTemplateVerity

CTV 是一种通用的智能合约操作码，具有完整的枚举能力，没有动态的状态，没有递归，而且主要通过验证来工作。

本质上，CTV 只是让你选出一笔具体的交易作为下一笔可以发生的交易。网络仅仅检查花费交易的哈希值是否跟脚本中的 CTV 哈希值一致。

虽然这听起来功能非常有限，它可以用来跟模板元编程系统（比如 [Sapio](https://rubin.io/bitcoin/2021/12/05/advent-8/learn.sapio-lang.org)）创建出复杂的程序。

而且，功能有限不是个问题，是一个特性。CTV 被有意设计成能够跟整个比特币社区快速达成技术共识的样子，因为简单、安全的限制条款（covenant）系统不会出现更复杂的限制条款系统可能带有的问题。不过，自它出现以来，一些人希望开发更灵活的限制条款，而这需要更多时间来开发才能给用户带来实际的好处。

CTV 也被设计成能跟未来可能添加的其它操作码（比如 CSFS、OP_AMOUNT 和 OP_CAT）一起工作，所以，假设未来有更多特性被添加到比特币中，它也不会过时，反而会变得更加有用。

CTV 目前是一个得到了充分审核的 BIP，正在等待来自社区的更多支持以激活（见：[社交信号](https://utxos.org/signals)）。

声明：我是 BIP-119 的 作者/支持者。

补充阅读：

1. [Optech](https://bitcoinops.org/en/newsletters/2019/05/29/#proposed-transaction-output-commitments)
2. [utxos.org](https://utxos.org/)
3. [模板，Elstoo，限制条款，我的天！](https://rubin.io/blog/2021/07/02/covenants/)
4. [Shinobi 对通用限制条款的担忧](https://medium.com/block-digest-mempool/my-worries-about-too-generalized-covenants-5eff33affbb6)（[中文译本](https://www.btcstudy.org/2022/05/26/my-worries-about-too-generalized-covenants/)）

## BIP-118 APO AnyPrevout

AnyPrevout 是闪电网络研究的一个成果（回溯到其最初的白皮书），它可以创建一种 “可以重新绑定（rebindable）” 的比特币交易，可以极大地简化闪电网络的协议，因为它消除了围绕状态存储和单方关闭通道的许多复杂性。AnyPrevout 也让 “Decker 通道” 成为可能（为了避免跟 L2 相混淆，AnyPrevout 有时候也被称作 “Eltoo”，这真让人混淆）（译者注：两者发音相同）。

AnyPrevout 的基本工作原理是，它改变了签名所覆盖的部分，从而排除了交易要花费哪些币的细节。这在改变签名的当前不变量时有一些缺点，但总的来说是安全的。

APO 也可以用来实现类似 CTV 的东西，但两者之间的差异足够大（也包括效率方面的差异），所以两者并非竞争关系。

APO 当前也是经过充分审核的 BIP，正在等待来自社区的更多支持以激活。获得广泛支持的最大阻碍是缺乏一个用 Decker 通道建构的闪电网络的可靠功能原型，需要这样的原型来证明 APO 具有 “产品市场契合度”。有些开发者认为，需要其它的提议（比如 SIGHASH_BUNDLE）才能让 APO 完全可用。

1. [我对 BIP-118 的审核](https://rubin.io/bitcoin/2021/07/09/bip-118-sighash-chart/)
2. [BIP-118](https://github.com/bitcoin/bips/blob/master/bip-0118.mediawiki)
3. [Eltoo/Decker Channels 白皮书](https://blockstream.com/eltoo.pdf)
4. [模板，Elstoo，限制条款，我的天！](https://rubin.io/blog/2021/07/02/covenants/)

## TLUV TapLeafUpdateVerify

TLUV 是一个还在提议阶段的通用智能合约操作码，它是开放的（open ended），具有动态的局部状态（dynamic local state），可以递归，甚至一定程度上是可以计算的。

本质上，TLUV 是让你可以通过改变顶层的密钥以及被花费的脚本路径，来改变正在被花费的输出。TLUV 只能读取和影响单个的 输入/输出 对；其它的输出是不受影响的。TLUV 的功能与 Taproot 的实现细节高度 “关联”，因为 TLUV 必须修改一个输出背后的 taproot 数据结构。举个例子，你有一个 taproot 输出，面额为 10  btc，其脚本如下：

```json
[{"amt": 10,
  "key": "multi(A,B,C)",
  "scripts": ["signed(A) with up to 2 coins",
              "signed(B) with up to 5 coins",
              "signed(C) with up to 3 coins"]
 }
]
```

而 TLUV 将允许你将它转变成下面的输出：

```json
[{"amt": 9,
  "key": "multi(A,B,C)",
  "scripts": ["signed(A) with up to 1 coins",
              "signed(B) with up to 5 coins",
              "signed(C) with up to 3 coins"]
 },
 {"amt": 0.25,
  "address": "someone paid by A"
 },
 {"amt": 0.75,
  "address": "someone else paid by A"
 }
]
```

甚至是完全退出：

```json
[{"amt": 9,
  "key": "multi(B,C)",
  "scripts": ["signed(B) with up to 5 coins",
              "signed(C) with up to 3 coins"]
 },
 {"amt": 0.25,
  "address": "someone paid by A"
 },
 {"amt": 0.75,
  "address": "someone else paid by A"
 }
 {"amt": 1,
  "address": "A's key (exiting funds)"
 }
]
```

围绕修改顶层密钥的功能，TLUV 还有一些走火的危险，因为需要调整之后的密钥仍是有效的 Taproot 密钥。

TLUV 被设计成需要某种形式的 OP_AMOUNT 来启用上面所示递归共享型 UTXO，

TLUV 当前还没有稳定的提议（比如 BIP），现在还是一个开放的研究。

1. [Optech](https://bitcoinops.org/en/newsletters/2021/09/15/)
2. [邮件列表](https://www.mail-archive.com/bitcoin-dev@lists.linuxfoundation.org/msg10437.html)
3. [我在邮件列表中的回应](https://www.mail-archive.com/bitcoin-dev@lists.linuxfoundation.org/msg10442.html)

## CSFS CheckSigFromStack

CheckSigFromStack 或者说 CheckDataSig（给专家提醒：这是仅验证版本的简写，因为没必要检查某个东西没有被某人签名）是一个操作码，它可以检查任意信息是否被某个密钥签名。正常来说，当比特币脚本检查一个签名时，这个消息 *必须* 是当前正在被验证交易的哈希值，并注有签名的哈希模式。

CSFS 有许多 “基本” 的应用。举个例子，你可以写一个程序，要么是正常情况，密钥 K 签名了一笔交易；要么，是密钥 K 签名了另一个密钥，这个密钥再签名一笔交易。这使得币的持有者可以 “委托” 币的所有权给另一个密钥，而无需转移这笔资金。

CSFS 在比特币中可以说已经存在了：使用  Lamport 签名，可以做到检查一个超过 5 字节的数据的签名。它并不是非常有用，但你可以想象它的一些特定的用途，例如：在一段时间锁内，将签名权委托给某一个签名者。

CSFS 跟其它操作码相结合时，就变得非常强大。举个例子，CSFS 加上 CTV，就可以实现一些类似于 AnyPrevout 的东西。CSFA 加上 CAT，就可以在隔离见证 v0 中实现完全通用的限制条款，但不能在 Taproot 中使用（因为还没有某种形式的 OP_TWEAK）。欲知详情最好阅读这里补充的材料，但设想我先按照常规检查交易的签名，然后我把交易本身推入栈中并检查它，最后使用 CAT 将所有东西组装起来。这将允许我们对一个脚本的所有组件运行程序性检查。

虽然现在还没有 CSFS 的明文提议，它没有什么争议，设计也相对比较直接。

1. [BIP 建议](https://lists.linuxfoundation.org/pipermail/bitcoin-dev/2021-July/019192.html)
2. [模板，Elstoo，限制条款，我的天！](https://rubin.io/blog/2021/07/02/covenants/)
3. [CSFS from Math (5 bytes)](https://rubin.io/blog/2021/07/02/signing-5-bytes/)

## OP_AMOUNT

OP_AMOUNT 是在 2017 年由 Johnson Lau 提议的（这是我能追溯到的最早引用），它通过一个叫做 PUSHTXDATA 的脚本插件，让任何数据都可以被推入栈中。作为一个独立的插件，在栈中获得 被花费/被创建 的数据（无论是使用 push 操作码还是带有验证语义的操作码）都将允许智能合约限制被花费的数量，或者根据数量来切换行为。

举个例子，OP_AMOUNT 加上 TLUV，一个 Taproot 分支就可以拥有一个独立的余额，并且这个余额还可以由分支的所有者更新。假设我有一个脚本树，说明 Alice 拥有 1 btc，而 Bob 拥有 20 Btc。当 Alice 花费的时候，脚本将要求对应的输出（例如：0 号输入对应的 0 号输出）最多只能减少 1 btc，而且脚本将被更新到改变 Alice 的脚本分支具有 1-（花费数额） 的余额。

另一个例子是，CTV 也可以跟 OP_AMOUT 一起使用，在花费的数额大于和小于 1 btc 时采取不同的安全措施。

当前没有 OP_AMOUT 的明确提议。加入这个功能的难度在于，比特币的脚本处理 32 比特的数学，而数额是 64 比特的值（准确来说是 51 比特）。

1. [OP_PUSHTXDATA](https://github.com/jl2012/bips/blob/vault/bip-0ZZZ.mediawiki)
2. [OP_IN_OUT_AMOUNT](https://www.mail-archive.com/bitcoin-dev@lists.linuxfoundation.org/msg10438.html)

## SIGHASH_BUNDLE

Sighash Bundle 是让 “Sighash Flag” 变得更加通用的一种思路。Sighash 标签是一种迷你的 “编程语言”，可以描述签名者想签名一笔交易的哪些部分。而 Bundle 则允许签名者选出一组输入和输出来签名，并且交易包的描述可以重新绑定，从而允许一些形式的事后交易聚合。

提出 SIGHASH_BUNDLE 的主要目的是帮助 Decker 支付通道跟一种叫做 “分层承诺（layered commitment）” 的次级协议一起工作。它是有可能被激活的，但它跟 AnyPrevout 有一样的问题：我们需要看到一个使用它的端到端闪电网络实现，以确定这个技术真的解决了它希望解决的问题。

当前尚未有可靠的实现。

1. [邮件组帖子](https://lists.linuxfoundation.org/pipermail/bitcoin-dev/2018-April/015862.html)

## Transaction Sponsors

Transaction Sponsors（“交易赞助者”）是另一个由你们提出的提议。

交易赞助者的基本概念就是允许表达一个逻辑：仅当 A 交易在某个区块中时，该区块才能包含 B 交易。具体来说，这个提议认为，一笔产生 0 值输出且输出脚本为  ` OP_VER <txids> ` 的交易，将仅在 txids 所代表的交易也在同一个区块中时，才会有效。

这种表达依赖的能力，会影响基于这种依赖所实现的新型智能合约的设计，但这并不是交易赞助者这种面向交易池的提议的目标。

相反，赞助者提议的目标是使用这种功能来表达额外的依赖，从而产生一种在交易池中为交易动态追加手续费的方法，无需依赖 CPFG（子为父偿）和 RBF（交易费替换）。这个元件在驱动基于 CTV 或者 Decker 通道的智能合约流程时尤其有用，它无需依赖任何类型的交易变形性。

当前已经有了交易赞助者的实现和 BIP 草案，但这个 BIP 还没有被改进到可以正式纳入仓库。

1. [邮件组帖子](https://lists.linuxfoundation.org/pipermail/bitcoin-dev/2020-September/018168.html)
2. [追加手续费的难度](https://lists.linuxfoundation.org/pipermail/bitcoin-dev/2021-November/019614.html)

## OP_CAT（或者叫 SHASTREAM）

OP_CAT “看起来很简单”。它具有的功能只不过是获得一个参数 “hello” 和第二个参数 “world”，然后拼成 “hello world”。

CAT 从一开始就是比特币的一部分，但它有实现上的错误，后来被中本聪在比特币早期的一次紧急补丁中移除了。

虽然它很简单，事实证明，拼接字节串的能力给比特币加入了非常多样的功能，包括量子证据签名和限制条款这样的东西。CAT 有许多可能实现的变种，每一种都有自己的取舍，但大部分 CAT 提议在设计上都没有什么争议。有争议的是因为它会给比特币引入许多令人意外的行为，我们更倾向于先搞清楚这种可以编写高级智能合约的能力对用户造成的影响。

1. [Quantum Proof Bitcoin](https://rubin.io/blog/2021/07/06/quantum-bitcoin/)
2. [Poelstra CAT Blog I](https://medium.com/blockstream/cat-and-schnorr-tricks-i-faf1b59bd298)
3. [Poelstra CAT Blog II](https://medium.com/blockstream/cat-and-schnorr-tricks-ii-2f6ede3d7bb5)

## OP_TWEAK / ECMUL

有两种操作码支持调整用在限制条款中的椭圆曲线点，或者计算出一个特定的私钥。

这两个操作码都没有稳定的提议，但其实现已经基本被 secp256k1 曲线的要求指定了。

## 适配器签名

适配器签名是一种可以跟 Schhnorr 签名一起使用的技术，不要求比特币作额外的升级。

适配器的基本原理是一方（或者一群参与者）创建一个数据对象，该对象要么接受一个签名而揭示一个秘密值，要么接收一个秘密值然后揭示出一个签名。

适配器签名可以用在许多原来使用哈希原像锁的场景中。

1. [Optech](https://bitcoinops.org/en/topics/adaptor-signatures/)

## 委托 / Graftroot

委托指的是，使用这种脚本后，你可以不直接签名交易，而是签名另一个脚本来执行。举个例子，假设有一笔资金，需要一个来自 Alice 和 Bob 的签名才能花费。假设 Alice 想要下线，但 Bob 想要转账。Alice 可以签名一个脚本，要求一个来自 Carol 的签名来 “替代” Alice 的签名。

目前我们可以通过资金的委托以较为迂回的方式实现委托。也就是另一个脚本的片段必须用一个 UTXO 来表示。

Graftroot 是 Taproot 的一个插件，可以让顶层的密钥花费路径签名者签名委托脚本，而不是其它 tapscript 分支。下面的链接展示了多种命名混乱的插件和替代方案。

委托也可以跟 Anyprevout 相结合，使得签名授权被限制在特定的一笔资金或者具体的一个脚本上。CSFS 也可以支持一种基本的委托。它跟 Graftoot 一起可以实现一种 Taproot，其树可以非交互地建构出来，而且没有任何搜索成本。

除了目前可以实现的情况，其它的委托协议还没有可靠的提案。

1. [Coin Delegation](https://lists.linuxfoundation.org/pipermail/bitcoin-dev/2021-March/018615.html)
2. [Graftroot](https://lists.linuxfoundation.org/pipermail/bitcoin-dev/2018-February/015700.html)
3. [Entroot](https://gist.github.com/sipa/ca1502f8465d0d5032d9dd2465f32603)
4. [G’Root (not graftroot)](https://lists.linuxfoundation.org/pipermail/bitcoin-dev/2018-July/016249.html)

## BIP-300 DriveChain

DriveChain 是一种为应用高度定制化的递归限制条款，它的设计是使用链上的矿工驱动型投票系统来跟踪侧链的存款和取款，从而帮助侧链运行。

这样的侧链将可以运行任意的智能合约（要看侧链运营者的选择）。矿工可以通过一种特殊的输出对取款投支持、反对或弃权票。

这个方法的一个主要缺点在于，BIP-300 要求加入新的全局状态数据库，而不是在限制条款交易自身中包含局部状态。

总体来说，DriveChian 的争议是比较大的；许多人表示感兴趣，也有许多人表达了严厉的批评，因为它改变了比特币共识的激励稳定性。把它放在这里是为了文章的完整。

我自己认为，虽然 Drivechain 的概念是很有用的，但它的实现并不需要把交易放在现有的区块空间内，可以通过一个额外的承诺来追踪（就像隔离见证一样）。如果 Drivechain 可以用一种更加通用的限制条款，而非为应用定制化的限制条款来实现的话，这是可以发生的。

1. [BIP-300](https://github.com/bitcoin/bips/blob/master/bip-0300.mediawiki)
2. [Drivechains](https://www.drivechain.info/)

## Elements 操作码

Elements 是 Blockstream 的比特币分叉，用在他们自己的 Liquid 侧链上。Elements 计划加入许多操作码，来帮助实现许多功能（包括上面提到的哪些），还有他们现有的插件。

1. [Existing Opcodes](https://elementsproject.org/features/opcodes)
2. [Upgrade for Taproot](https://github.com/ElementsProject/elements/blob/master/doc/tapscript_opcodes.md)

<p style="text-align:center">- - -</p>


好了，这就差不多了！当然还有其它东西也跟这个主题有关，但以上是讲到为比特币带来更多可编程性时我脑海里最先浮现的东西。

接下来的文章将专注于 BIP-119 和 Sapio 的可能性，并帮助论证它是比特币升级历程中的绝佳步骤。我们会展示（而非断言）这个小巧而有限的操作码可以打开大大的可能性，以及我个人的升级路线图，以及其它升级的开发，作为比特币的连贯的叙事。

（完）

