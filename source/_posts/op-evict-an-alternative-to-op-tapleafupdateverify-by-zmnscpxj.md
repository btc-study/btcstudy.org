---
title: 'OP_EVICT：OP_TLUV 的一种替代'
author: 'ZmnSCPxj'
date: '2023/11/28 17:24:08'
cover: ''
excerpt: '通过避免使用树结构来回避 O(log N) 次揭晓'
tags:
- covenant
---


> *作者：ZmnSCPxj*
> 
> *来源：<https://lists.linuxfoundation.org/pipermail/bitcoin-dev/2022-February/019926.html>*



在 2021 年末，aj 提出了 `OP_TAPLEAFUPDATEVERIFY`，以实现 CoinPool 及类似的构造。

Jeremy 观察到，由于使用了默克尔树路径，一个 `OP_TLUV`将需要揭晓 O(log N) 个哈希值，以触达某个 tapleaf ；在 CoinPool 的案例中，这个叶子将会在花费由它指定的数额之后删除自身。Jeremy 还观察到，`OP_CTV` 也类似，也需要揭晓 O(log N) 笔交易，但有个好处：一旦被揭晓，这笔交易就可以被复用，因此整体期望上看，链上的总字节数会比 `OP_TLUV` 少。

思索一番之后，我意识到，这是因为使用了默克尔树来表示 CoinPool 的预先承诺但放在链下（promised-but-offchain）的输出，从而导致了 O(log N) 的链上空间使用。然后我开始思考对预先承诺的输出集合的另一种表示方案，通过避免使用树结构来回避 O(log N) 次揭晓。

（译者注：“promised output” 在下文中会译成 “预先承诺的输出” 或者 “得到承诺的输出”。）

## 预先承诺的输出

最根本来说，我们可以将扩容比特币的解决方案理解成 *承诺* 某些输出在未来 *可以* 出现在链上，而不要求这样的输出 *立即* 出现在链上。然后，我们可以执行在这些被承诺的输出上执行交易层面的 cut-through，而不需要链上的活动（这正是 “链下” 的含义）（译者注：“cut-through” 在比特币世界里，可以算是一个专有名词，它意味着可以省略中间的过程，仅发布起点状态和终局状态）。仅在一些糟糕而错误的事情发生的时候，我们才需要真的将预先承诺的输出的最新集合发布到链上、接受所有全节点的全局验证（并因此付出扩容和隐私性上的代价）。

作为上述范式的一个例子，我们先来看看闪电网络。代表一条通道内各方资金的输出得到预先的承诺，而且 *可以* 出现在链上（通过单方面关闭通道的机制）。与此同时，有一种机制可以执行交易的 cut-through，允许在通道参与者之间转移资金；任意数量的交易都可以发生，并仅在未来某一天 “固化” 下来，不需要昂贵的链上活动。

因此：

- CoinPool 也是一种承诺这样的输出的方式。为了改变这些预先承诺的输出的分布，coinpool 的运营者需要在链上发布一笔交易，但这是一笔只有 1 个输入和 1 个输出的交易；而且，有了 Schnorr 签名，这个输入只需要 1 个签名就可以了。但在一些糟糕的情况发生时，任何参与者都可以单方面关闭 CoinPool、从而将预先承诺的输出实例化。

- Statechain 实际上也只是一种托管在 Decker-Wattenhofer 或者 Decker-Russell-Osuntokun 构造内的 coinpool。它允许不使用链上交易来改变这些预先承诺的输出的分布 —— 相反，它是在 Decker-Wattenhofer/Decker-Russell-Osuntokun 构造内创建一个新状态（代表新的分布）、作废掉所有的旧状态。

  同样地，任何参与者都可以单方面叫停，将这样的 coinpool 的内部状态暴露到链上。

- Channel factory（通道工厂）也只是一种 statechain，只不过其中被承诺的输出不是简单的 1-of-1 的单个所有者的输出，而是 2-of-2 的通道。

  这允许优雅的 “降级”：即使 statechain 层（通道工厂层）缺失了参与者，单条的 2-of-2 通道依然可以继续运行，只要他们的活动不影响不在场的参与者，所以大量的交易都不要求所有参与者在线。

因此，我们只需考虑基本的 coinpool 的用法就够了，因为其它机制（`OP_CTV`+`OP_CSFS`、`SIGHASH_NOINPUT`）可以用来实现状态链、通道和通道工厂。

因此，我得出结论，我们需要的 “只是” 一种办法，向我们承诺能够暴露一组预先承诺的输出，而且只要我们都同意，我们就可以改变这个集合（无需暴露当前的集合或者下一个集合，不论是为了扩容还是为了隐私）。

（写给 Bitcoin Cash 的支持者：它们不是一种 IOU（借条），而是 *得到了承诺的*、可以在链上强制执行的，这就足以威慑你的链下对手、让他们规矩行事。否认自己承诺过的输出不能给他们带来任何好处，因为这些输出总是可以发布到链上并强制执行。所以，它不仅仅是一种 IOU，因为 IOU 并不必然可以执行，但这种机制 *可以*。区块链是 法官+陪审团+侩子手，不是一个吵闹的市场。）

重要的是，`OP_CTV` 和 `OP_TLUV` 都迫使用户为被承诺的输出决定一个特定、但最终来说是任意的排序。原则上来说，一组被承诺的输出，如果这些输出的主人都是平等的，那就没有 *任何* 内部排序。

因此，我开始思考一种承诺方案，在承诺中不强加任何排序。

## 题外话：带有逐出机制的 N-of-N

使用一种 N-of-N 构造的一个问题在于，只要任何一个参与者离线，这种构造就无法推进状态了。

这使得一些人提议转为在 coinpool/statechain/通道工厂 中使用 K-of-N 机制，只要 N 大于 2 。

然而，即使如此，K-of-N 依然要求 K 个参与者保持在线，而且 K 成了一个安全参数。如果少于 K 个参与者在线，那么这种构造就 *还是* 无法推进状态。

更糟糕的是，因为 K < N，某个参与者的资金可能会被另外 K 个参与者联手偷走。没有办法证明同一构造中的其他参与者不是同一个人的木偶，因此，有可能这 K 个成员实际上都是同一个人，现在 TA 有办法偷走其他所有人的钱了。避免这个问题的唯一办法就是使用 N-of-N：N-of-N 要求 *你的* 私钥参与，因此可以保证那些钱是 *你的* 钱。简而言之，K-of-N，正因为它无需你的密钥就可以更新状态（以 “尽管您离线了，我们也需要更新状态” 为接口），违反了 “无钥即无币” 的法则。

K-of-N 应该仅用在所有 N 个公钥都是你的木偶，而你想要保住自己的资金的情况。这也是共识（“每个人都必须同意”）与投票（“只需足够多的木偶就可以给你带来权力”）的区别。

不过，有了 `OP_TLUV`，我们可以创建一种 “带有逐出机制的 N-of-N” 构造。当 N-of-N 构造中的某个参与者离线、但其他参与者都想更新状态时，他们可以逐出这个离线的参与者、创建一个更小的 N-of-N 构造，在这个新构造中 *所有* 参与者都在线，可以继续运行。

这避免了 K-of-N 的 “无钥即无币” 问题，同时提供了一种办法，无需所有参与者都在线就可以更新状态。

使用 `OP_TLUV` 的唯一问题在于，它要揭露 O(log N) 个哈希值，以逐出一个参与者；而每逐出一个参与者都需要一笔单独的交易。

相比之下，K-of-N 有个 “优势”：即使你离线了，也可以在不逐出你的前提下更新状态。不过，如前所述，因为资金无需你的密钥就可以花费，这些钱也就不是你的钱，因此这种好处是可疑的 —— 无论你在线还是离线，K 个人总可以联手偷走你的资金。而逐出机制会让你的资金回到你的控制中。

## 承诺一个无排序的集合

在一个 N-of-N 的 coinpool/statechain/通道工厂 中，链上的单个 UTXO 的所有权是在 N 个参与者缠绵分享的。也就是说，有 N 个得到承诺的输出，并未暴露在链上，是这 N 个参与者都同意的、是这个构造的 “真实的” 最新状态。不过，这 N 个参与者也可以一直同意改变最新状态，只要所有人都签名这次变更。

每一个得到承诺的输出都有一个面额（价值），而所有得到承诺的输出的面额之和，就是链上 UTXO 的面额。有趣的是，每一个预先承诺的输出也都有一个 SPEC256K1 点，可以用作一个公钥；而所有预先承诺的点的总和，也正是链上 UTXO 的点。（译者注：这似乎是说，链上 UTXO 的公钥是各参与者的聚合公钥，而参与者们也将自己的原公钥用在获得承诺的输出中。）

因此，链上的 UTXO 可以视为承诺了预先承诺的输出的总和。问题在于，如何承诺每一个单体的输出？

我们可以观察到，一个数字签名不仅证明了对某个一私钥的知识，也承诺了一条具体的消息。因此，我们可以让每一个签名者签名符合自己预期的、属于自己的输出，并为这些输出分享签名。

当某个参与者要被逐出时，其他参与者就取得这个参与者为自己的得到承诺的输出的签名，并在链上展示，作为这个输出的键政。然后，链上机制会将剩余的资金发给减去了被逐出的参与者的 N-of-N 群组。

## `OP_EVICT`

基于上述所有，我现在提议一种 `OP_EVICT` 操作码。

`OP_EVICT` 接受可变数量的参数。

- 栈顶要么是常数 `1`，要么是一个 `SECP256K1` 点。

  - 如果是 `1`，那就意味着 “使用 Taproot 内部公钥”，就像 `OP_CHECKSIG` 那样。

- 堆栈的下一个元素是一个数字，等于被承诺的输出（也即要被逐出的）输出的面额。

- 接下来的堆栈元素会两两交替出现：

  - 一个数字，指明一个输出的索引号。

  - 对该输出的一个签名。

  - 输出的索引不能重复，而且被索引的输出必须是 SegWit v1（“Taproot”）输出。这个输出的公钥将被用于验证对应的签名，而且签名仅涵盖输出自身（即，面额以及 `scriptPubKey`）。

    这也意味着，这个签名没有 `SIGHASH`。

  - 因为签名也涵盖了公钥，这可以放置使用某个公钥的签名被熔铸成使用另一个公钥的签名。

- 然后是另一个签名。

  - 这个签名是使用 `OP_CHECKSIG` 的语义（以及 `SIGHASH` 支持）来检查的。
  - 这个公钥是输入的点（即栈顶元素）**减去**得到索引的输出的所有公钥。

举一个具体的例子，假设 A、B、C 和 D 想建立一个 CoinPool（或是某个链下的变种），他们的初始状态如下：

* A := 10
* B := 6
* C := 4
* D := 22

假定 A、B、C、D 以一种可以避免 “密钥取消（key cancellation）” 的方式（例如预承诺或者 MuSig 方案）生成了公钥。（译者注：此处指的应该是 Schnorr 公钥的 “Rogue Key 攻击”。）

然后，参与者们为上述面额生成预先承诺的输出，然后各自分享这些预先承诺的输入的签名：

* sign(a, "A := 10")
* sign(b, "B := 6")
* sign(c, "C := 4")
* sign(d, "D := 22")

完成之后，他们就生成：

- Q = A + B + C + D
- P = h(Q|`<1> OP_EVICT`) * Q

然后他们汇集资金，形成一个 Taproot 输出：

* P := 42

如果所有参与者都在线，他们可以通过合作签名在彼此之间转移资金（或者移动到另一个地址）；这时候使用的公钥是 P，taproot 的魔法意味着 `OP_EVICT` 是不可见的。

然而，假设 B 掉线了。那么 A、C、D 就决定驱逐 B。为此，他们创建了一个交易，带有一个输出 `B := 6`，然后他们揭晓 `OP_EVICT` Tapscript 以及签名 `(b, "B:=6")`。这使他们能改变状态、花费自己的钱，而无需 B 在线。而且 B 也是安全的，因为他们要逐出 B 的时候就必须使用这个预先签名的输出，而这个输出是 B 自己认证了可以接受的。

注意，上述的操作码允许在一笔交易中逐出多个成员。如果 B 和 C 都离线了，那么剩余的参与者只需在同一笔交易中暴露多个输出即可。

## 安全性

我不是一个密码学家。因此，这个方案的安全性是不确定的。

只要不出现密钥取消，应该就是安全的。合并在一起的资金必须所有人都同意才能花费。仅在逐出一个参与者的时候才能创建一个更小的参与者集合，而驱逐又只能将被驱逐的参与者的资金实例化。其他参与者，在不知道被逐出的参与者的私钥的情况下，无法生成签名另一个值的签名。

为了放置签名重放（replay），像 CoinPool 这样的可以更新的方案的每一次更新，都需要每个参与者使用一个不同的公钥。因为签名涵盖了公钥，所以使用一种非强化的派生方案应该也是安全的，因此只需要一个根私钥。

## 额外讨论

### 驱逐方案

我们可以将这里提议的驱逐方案视为下列合约：

- 要么，所有人都同意转移资金，或者
- 让我拿回我的钱，然后剩下的人你们爱怎么玩就怎么玩。

而涵盖了一个得到承诺的输出的签名，就是一个协议，让这个参与者可以想象自己能够拿回具体的数额。

我们可以想象一个参与者可以用另一个数额重新签名自己的输出，但这就是为什么 `OP_EVICT` 需要其他参与者一起合作签名。如果其他参与者合作式签名，这就表示他们都同意这个人重新签名一个不同的数额，因此属于 “所有人都同意转移”。

### 纯粹的 SCRIPT 合约

一个 “纯粹的 SCRIPT 合约” 是一个 Taproot 合约，其 keysend 路径是人们不想要的，它纯粹由 Tapscript 分支组成。

在这种情况下，预计合约的参与者需要一种技术，对一个 NUMS 点达成一致：没有任何一个参与者知道这个点背后的标量（私钥），并将这个点用作 Taproot 输出的内部公钥 `Q`。对于整个协议，NUMS 点可以是一个协议定义的常数。

因为 `OP_EVICT` 要求每一个预先承诺的输出都要得到签名；从表面上看，这种技术是无法用在 `OP_EVICT` 预先承诺输出中的，因为不可能使用 NUMS 点来签名。

但是，我们注意到，一个 “纯粹 SCRIPT 合约” 的要求是没有任何一个参与者可以单方面签名另一种花费行为。使用参与者的 N-of-N 工作作为 Taproot 内部公钥，已经足以保证这一点。

一个具体的例子：假设我们想要一个 HTLC，其哈希锁分支要求参与者 A，而时间锁分支要求参与者 B。这样一种简单的方案不需要 A 和 B 能够合作式花费这个交易，因此我们会倾向于使用一个 NUMS 点作为Taproot 内部公钥。但使用 NUMS 点将不允许任何签名，即使是 `OP_EVICT` 要求的、对预先承诺的输出的签名。

预期使用一个 NUMS 点作为 Taproot 内部公钥，我们可以使用 `A[tmp] + B[tmp]` 的和（需要适当地防止密钥取消）。然后，A 和 B 可以合作签名预先承诺的输出，并将在一个可以强制执行 `OP_EVICT` 的 UTXO 中保存预先承诺的输出。在为预先承诺的输出创建好签名后，A 和 B 可以通过安全地删除自己的临时私钥 `A[tmp]` 或 `B[tmp]` 来保证密钥分支无法被使用。

### 签名的减半聚合

可以实现批量验证，而且因为 `OP_EVICT` 必须验证至少两个签名（一个驱逐签名和一个剩余参与者的签名），所以为 `OP_EVICT` 使用批量验证是有意义的。

要指出的是，Schnorr 签名允许第三方的减半聚合，其中多个签名的 `s` 值被加载一起，但 `R` 值不加总。

（警告：我还不知道减半聚合的安全性证明！而且，BIP-340 没有定义减半聚合，而且，根据我的直觉，它的批量验证算法不能扩展到减半聚合。）

基本上，如果我们要批量验证两个签名（两条消息 `m[0]` 和 `m[1]` 的签名 `(R[0], s[0])` 和 `(R[1], s[1])`，分别来自公钥 `A[0]` 和 `A[1]`），我们需要：

- 对 `i = 0, 1`，`e[i] = h(R[i]|m[i])`
- 检查：`(s[0] + s[1]) * G` 等于 `R[0] + e[0] * A[0] + R[1] + e[1] * A[1]`

如我们所见，`s` 可以在发布到区块链之前加总，因为验证者并不需要知道每一个 `s[i]`。但是 `R` 不能加总，因为每一个 `R` 都要分别哈希。

减半聚合可以由第三方来做，即，不需要知道任何私钥，也可以直接加总多个签名的 `s`。

因为 `OP_EVICT` 总是至少要验证两个签名，所以使用减半聚合算法可以减少至少 32 个重量单位，而且每多一个被逐出的输出，就多一个可以加入到总和中的 `s`。当然，**这一切都依赖于减半聚合真的安全**。

> Jonas Nick 在[回帖](https://lists.linuxfoundation.org/pipermail/bitcoin-dev/2022-February/019935.html)中指出：
>
> 关于减半聚合的安全性，Chalkias 等人已经在去年给出了一份有说服力的安全性证明：
>
> https://eprint.iacr.org/2021/350
>
> 此外，减半聚合不可以使用本帖子中的方案，因为这是不安全的。这不影响 Zmn 的结论，而且在最初的减半聚合帖子中就已经指出了：
>
> https://lists.linuxfoundation.org/pipermail/bitcoin-dev/2017-May/014306.html
>
> 需要每一个 `s` 值都各自乘以一个不同的、不可预测的值，举例：
>
> https://github.com/ElementsProject/cross-input-aggregation/blob/master/slides/2021-Q2-halfagg-impl.org#schnorr-signature-half-aggregation-1

### 与其他操作码的关系

`OP_CTV` 的功能与本操作码不同，而且无法用作本操作码的直接替代。具体来说，虽然 `OP_CTV` *可以* 承诺一组得到承诺的输出，但如果需要发布某一个预先承诺的输出，剩余的资金会分散到一组 UTXO 中。因此，“复苏” 一个 CoinPool（或者其链下变体）需要花费多个 UTXO，而花费多个 UTXO 是危险的，除非进行专门的设计。（尤其是，如果 UTXO 有不同的签名者集合，一群签名者可以一开始合作复苏一个 CoinPool，然后再另一笔交易中花费自己的 UTXO；一旦这另外的交易得到确认，复苏交易就会作废。）

本操作码似乎在很大程度上跟 `OP_TLUV` 直接竞争，因为设计目标在很大程度上是相同的。其优势在于，在需要逐出多个成员时，需要的交易数量较少，而且 CoinPool 的复苏可以放在同一笔交易中。而它的劣势（相对于 `OP_TLUV`）在于，它需要点运算。我还未彻底研究，但我的直觉认为，`OP_TLUV` 也需要至少一次签名验证。

也许可以用 `OP_TX`/`OP_TXHASH`、`OP_CSFS` 以及一种点减法运算实现 `OP_EVICT`。但是 `OP_EVICT` 允许批量验证的简单实现（而且，如果减半聚合是安全的，可以转而使用减半聚合），相反，我们预计需要多次 `OP_CSFS` 才能实现同样的通道，而且没有任何批量验证的可能。也许有可能设计一种 `OP_CSFS` 的变体以允许批量验证，例如通过一种待处理的签名验证的累加器来延展虚拟机。

（完）