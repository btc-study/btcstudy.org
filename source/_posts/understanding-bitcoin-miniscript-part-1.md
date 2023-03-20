---
title: '理解比特币 Miniscript（一）：Script 何以难用'
author: 'benma'
date: '2023/03/16 20:28:57'
cover: ''
excerpt: 'Script 操作码的 失败/成功 有不同的含义，所以脚本难以组合及复用'
categories:
- 比特币主网
tags:
- Miniscript
---


> *作者：benma*
> 
> *来源：<https://shiftcrypto.ch/blog/understanding-bitcoin-miniscript-part-1/>*



![Understanding Bitcoin Miniscript - Part I](../images/understanding-bitcoin-miniscript-part-1/iscript.jpg)

当前被广泛使用的比特币花费条件仅有简单的单签名和简单的多签名，虽然 Bitcoin Script 这种用来编程花费条件的语言远不止这点能耐。这是为什么呢？

原因在于，[Bitcoin Script](https://en.bitcoin.it/wiki/Script) 虽然看起来像是一种简单的、基于堆栈的编程语言，但实际上非常难用。每当开发者希望创建一种新的花费条件的时候，都要花 *大量* 的时间来保证程序是正确的、在所有情形下都是可靠的，而这是很难推理的。我们稍后会探讨一个直击人心的例子。

最重要的是，因为运用 Script 来编写的脚本缺乏标准化和工具链，所以钱包和其它软件很难跟这种脚本交互。在现实中，这意味着，即使你决心花一些功夫开发一种新的脚本，最终你还是回得到一种非标准的钱包。其它钱包不能兼容你这种脚本，这对用户来说明显是坏事。

在本系列文章中，我们讲研究 Bitcoin Miniscript 语言。Miniscript 是一种表达 Bitcoin Script 的高级语言，至于让钱包开发者更容易创建复杂的花费条件以及推理脚本的正确性和可靠性，同时让所有的钱包和工具都更容易跟它们交互。

## BitBox02

作为 [BitBox02](https://shiftcrypto.ch/bitbox02/) 硬件钱包的开发者，我们一直在研究提高自主保管的安全性和可用性的方法。在过去，我们已经实现并部署了 [anti-klepto](https://shiftcrypto.ch/blog/anti-klepto-explained-protection-against-leaking-private-keys/) 协议，并为所有的硬件钱包供应商[提高了多签名钱包的安全性](https://shiftcrypto.ch/blog/how-nearly-all-personal-hardware-wallet-multisig-setups-are-insecure/)。

[Revault/wizardsardine](https://wizardsardine.com/about/) 的 Kevin 和 Antoine 联系我们，问我们是否有可能让 BitBox02 支持 Miniscript。这也是 [BTC Azores '22](https://btcazores.com/) 小会的热门话题，那时候 Antoine 给出了一份漂亮的介绍，[Salvatore](https://twitter.com/salvatoshi/) 则展示了他们将 Miniscript 整合进 Ledger 的进展。

我们认为 Miniscript 以及 “[限制条款（covenant）](https://bitcoinops.org/en/topics/covenants/)” 和 “[MuSig](https://bitcoinops.org/en/topics/musig/)” 是自主保管实践以及 BitBox02 的重要开发方向。

Miniscript 让更多高级的花费条件成为可能，Wizardsardine 在他们正在开发的新型钱包 [Liana](https://github.com/wizardsardine/liana) 中展示了。

让 BitBox02 支持 Miniscript 之后，像 Liana 这样高级的钱包就可以用 BitBox02 来保护。这将为在 [BitBoxApp](https://shiftcrypto.ch/app/) 开发更高级的自主保管解决方案打开大门。

在整合之前，我们首先需要建立对 Miniscript 的了解。从我的经验来看，了解一个软件工程主题的最好办法就是自己去实现它。在独自开发它的时候，你会被迫思考每一个细节。所以这个系列有两个目标：它包含了一个 Miniscript 的是加密，并尝试以与众不同的方式教会你 Miniscript。

## Bitcoin Script 的极简通识课

作为金钱，一笔一笔的比特币锁在不同的脚本里，这些脚本编码了花费这些资金所需满足的条件。在这个系列中，我们仅讨论 “[P2WSH (Pay-to-Witness-Script-hash)](https://github.com/bitcoin/bips/blob/master/bip-0141.mediawiki)” 。在这种形式的脚本中，“见证脚本（witness script）” 编码了花费相关资金所需满足的条件，一般来说包含了公钥。而 “见证数据（witness）” 则是为了满足这些条件所需提供的数据，一般来说包含了对应公钥的签名。

为了花费一笔所在一个见证脚本中的资金，花费这笔资金的交易必须包含有效的 *见证数据*。*见证数据* 和 *见证脚本* 会根据 Bitcoin Script 的规则求值。

举个例子，`bc1q2fhgukymf0caaqrhfxrdju4wm94wwrch2ukntl5fuc0faz8zm49q0h6ss8` 这样的一个比特币地址，就表明了一个事实：这是一个 P2WSH 输出，这个输出中包含了一个见证脚本的哈希值。比特币的节点知道，当资金进入这样的输出之后，花费这些资金的交易必须包含（与哈希值）对应的见证脚本，以及满足这个见证脚本所需的见证数据。

举个例子，为了编码一个简单的单签名条件，*见证脚本* 是这样的：

```
<publicKey> OP_CHECKSIG
```

而能够满足它的 *见证数据* 是这样的：

```
<signature>
```

在验证这个脚本的时候，程序会从空堆栈开始，按顺序执行 *见证数据* 和 *见证脚本*：

1. 堆栈初始状态：*空无一物*
2. 签名进入堆栈：`<signature>`
3. `publicKey`进入堆栈：`<signature> <publicKey>`
4. `OP_CHECKSIG` 取出栈顶的两个元素，验证签名，如果不通过，则向栈中推入 `0`；如果通过，则推入 `1`

如果栈中只留下一个非零的元素，并且脚本没有终止，那就说明这段见证数据是有效的，因此花费行为（交易）也是有效的。

[Bitcoin Script](https://en.bitcoin.it/wiki/Script) 其实有很多 `OP_CHECKSIG` 以外的不同操作码，可以用来编码更复杂的花费条件。举个例子，你可以使用 `OP_CHECKMULTISIG`，将资金锁在一个多签名的输出中；或者，你可以使用 `OP_CHECKSEQUENCEVERIFY`，将资金冻结一段时间（在一段时间里完全无法动用）。

## Miniscript 的激动人心的例子

Miniscript 通过解决 Bitcoin Script 语言的几个问题，帮助开发者创建更安全和高效的比特币脚本。我们来看一些可能有用的花费条件，以解释直接使用 Bitcoin Script 来开发的难度。后面，我们会看到 Miniscript 如何解决这些问题，并让新的花费条件的开发和部署变得容易得多。

举个例子，假设我们想设计一种花费条件：两个人中，只要有一个人愿意，就可以花费资金。最简单的解决方案就是使用 [`OP_CHECKMULTISIG`](https://en.bitcoin.it/wiki/OP_CHECKMULTISIG)。*见证脚本* 是这样的：

```
1 <publicKey1> <publicKey2> 2 OP_CHECKMULTISIG
```

这里的 `1` 是为了告诉 `OP_CHECKMULTISIG`，只需提供多少个签名就可以通过验证；而 `2` 是为了告诉它，有多少个公钥可能会参与。

*见证数据* 是这样的：

```
<> <signature>
```

（见证数据开头的空元素是无用的，它的存在仅仅是因为 `OP_CHECKMULTISIG` 最初实现中的一个 bug，它会从堆栈中多移除一个元素）

在最终的验证程序中，如果所提供的一个签名是有效的（跟某一个公钥相匹配），则 `<> <signature> 1 <publicKey1> <publicKey2> 2 OP_CHECKMULTISIG` 会在堆栈中留下 `1`，不然就会留下 `0`。

现在，我们稍微改变一下语法。不是 `pubkey1` 或 `pubkey2` 其中一个的签名就行，而是 `pubkey1 OR (pubkey2 in one year)`：其中一个人随时都可以花费这笔资金，而另一个人必须在一年后才能花费这笔资金。因为 `OP_CHECKMULTISIG` 只能检查签名，不能检查时间锁，因此见证脚本必须完全改变。许多种脚本可以实现这类花费条件，其中一种是这样的：

### 解决方案

*见证脚本*：

```
<pubkey1> OP_CHECKSIG OP_IFDUP OP_NOTIF
  <pubkey2> OP_CHECKSIGVERIFY <52560 (one year)> OP_CHECKSEQUENCEVERIFY
OP_ENDIF
```

52560 这个数字传达的是比特币区块的数量；因为它平均而言每 10 分钟出现一个，所以 52560 个区块就约等于一年。

*可行的见证数据*：

1. 任何时候：`<signature for pubkey1>`
2. 一年时间过去以后：`<signature for pubkey2> <>`

我们来看看这两种见证数据是如何跟见证脚本一起执行的。如前所述，见证数据和见证脚本会从空的堆栈开始按顺序执行。假设一年过去了，并且见证数据中包含了 2 号公钥的有效签名：

1. 堆栈初始状态：*空无一物*
2. 推入签名：`<signature for pubkey2>`
3. 推入空元素：`<signature for pubkey2> <>`
4. 推入 1 号公钥：`<signature for pubkey2> <> <pubkey1>`
5. `OP_CHECKSIG` 取出栈顶的两个元素 `<>` 和 `<pubkey1`，并使用这个公钥来检查这个签名。因为这个本应是签名的元素是空的，所以它是个无效的签名，`OP_CHECKSIG` 会给堆栈推入一个 `0`：`<signature for pubkey2> 0`
6. `OP_IFDUP` 会复制栈顶的元素，如果该元素不是 0 的话。但因为我们这里栈顶的元素正是 0，所以无事发生：`<signature for pubkey2> 0`
7. `OP_NOTIF` 会移除栈顶的元素。如果这个元素是 0，就继续执行剩下的语句，直到遇上 `OP_ENDIF`：`<signature for pubkey2>`
8. 推入 2 号公钥：`<signature for pubkey2> <pubkey2>`
9. `OP_CHECKSIGVERIFY` 会取出栈顶的两个元素（签名和公钥），然后验证个签名。如果有效，则不作任何操作，否则执行会传出错误、终止。现在堆栈空了。
10. 推入 52560（表示一年时间的数值）：`<52560>`
11. `OP_CHECKSEQUENCEVERIFY` 会将栈顶的元素视为一个年龄。如果被花费的资金年龄不足，则脚本会传出错误、终止。否则，就不作任何操作：`<52560>`。
12. `OP_ENDIF`：终止 OP_IF 语句块。
13. 堆栈只剩下一个非零的元素，所以脚本验证通过了，资金可以花费了。

在步骤 5，空的签名元素我们叫做 “dissatisfaction”。这是为了跳过我们不想使用的、使用 1 号公钥的部分。注意，根据 [BIP141](https://github.com/bitcoin/bips/blob/master/bip-0141.mediawiki#new-script-semantics)，只有空元素能充当 `<key> OP_CHECKSIG` 的有效 dissatisfaction —— 任何其它无效签名都会导致脚本终止：

> 如果要让 OP_CHECKSIG 或者 OP_CHECKMULTISIG 执行失败，签名元素必须是空元素（不论是在隔离见证前的见证脚本中还是 P2WSH 中，详见 BIP146）。

另外，这个脚本仅在时间锁不是 0 的时候才能通过。如果我们使用同样的脚本、但把时间锁从一年改成了 0，你可能以为这意味着我们的语法从 `pubkey1 OR (pubkey2 in one year)` 变成了 `pubkey1 OR (pubkey2 anytime)`；但是，因为最后堆栈中会留下一个 0，所以脚本一定会执行失败，所以实际上它会意外让语法变成 `pubkey1 only`，第二个公钥根本无法花费其中的资金。

作为课后练习，请尝试使用第一中见证数据执行上述见证脚本（即假设第一个人签名了而第二个人没有），然后说服你自己它是可以工作的。

如我们可以看到的，运用 Bitcoin Script 创建这样的脚本和有效的见证数据是吃力不讨好的，哪怕是这么简单的语法。堆栈操作的顺序很复杂，而且难以建构和分析。如果你想延伸这个花费条件，开发工作基本上又要从零开始。而且你需要充分了解 Bitcoin Script。除此之外，你还要了解 “cleanstack 规则”（要求执行结束后堆栈内只剩下一个非零的元素）、只有空元素是签名检查的有效 dissatisfaction。

总结一下，直接使用 Script 来开发是难事，因为下列原因：

- Script 并不能很好地组合，意味着花费条件的期望属性的少许变更都将需要完全不同的脚本来实现。
- Script 操作码的 失败/成功 有不同的含义，所以脚本难以组合及复用。一些操作码会在 失败/成功 时向堆栈推入 0/1，而另一些会在失败时让脚本的执行终止，而在成功时什么也不作。
- 对于一组目标的花费条件，总有许多种可能的解决方案脚本，所以很难决定应该使用哪个。
- 为所有情景创建有效的见证数据是困难的。
- 共识和标准化为脚本的大小、操作码和签名的数量、见证数据的堆栈元素的数量设置了限制，开发者必须将这些限制考虑在内，才能避免自己的脚本被网络拒绝。
- 设计复杂脚本的时候，保证最终堆栈中只会留下一个非零的元素，是很难的，就像我们看到的案例一样。

在本系列的下一篇文章中，我们会仔细看看 Miniscript 是什么，它如何能显著地简化 Bitcoin Script、让实践中使用复杂的花费条件成为可能。敬请期待！

（完）

