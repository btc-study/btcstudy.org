---
title: '使用限制条款实现盲化合并挖矿'
author: 'Ruben Somsen'
date: '2022/07/04 20:22:31'
cover: ''
excerpt: 'BMM 是一种让其它区块链将挖矿工作外包给比特币区块链的机制'
categories:
- 比特币主网
tags:
- Spacechain
- 合并挖矿
- eltoo
- covenant
---


> *作者：Ruben Somsen*
> 
> *来源：<https://gist.github.com/RubenSomsen/5e4be6d18e5fa526b17d8b34906b16a5>*



更新：本文的内容也在[这个 Spacechain 讲解视频](https://youtu.be/N2ow4Q34Jeg)中解释过。

本文也在 [bitcoin-dev](https://lists.linuxfoundation.org/pipermail/bitcoin-dev/2019-December/017534.html) 邮件组中发表过。

盲化合并挖矿（Blind Merged Mining，BMM）的想法是在比特币区块链的一个唯一的位置承诺另一条区块链的哈希值，并且承诺者为了使用这个哈希值来续写那条区块链、收取那条链上的手续费，需要向比特币矿工支付费用。因为矿工不需要知道这个哈希值代表什么，而且直接被激励去选择出价最高的一个，所以矿工不需要额外的验证（因此是 “盲目的”）。这个想法最初由 Paul Sztorc 提出，但他的提议需要一次特殊的软分叉 [0] 。

本质上，BMM 是一种让其它区块链（山寨币，token）将挖矿工作外包给比特币区块链的机制。这些区块链不是直接用 ASIC 消耗电力，而是给矿工支付比特币，这些矿工会反过来为了获得这些报酬而执行工作量证明挖矿。这就提高了比特币区块链的总 PoW，也为比特币网络增加了安全性。这是一种容易实现、容易挖矿的共识机制，只需要两条链（比特币和挖矿外包的链）的全节点客户端和一些比特币。

虽然很难说为之推动一场软分叉是值得的，但事实证明，Sighash_AnyPrevOut（曾用名 “Sighash_noinput”）的加入就足以实现 BMM。因为，正如 Anthony Towns 所说 [1] ，Sighash_AnyPrevOut 可以创建 OP_CheckTemplateVerity（OP_CTV）形式的限制条款 [2] 。有了它，我们无需任何可信任的启动设置，就可以实现下列功能：

- 一长串的 Sighash_AnyPrevOut 交易，每一个都只能被下一个花费（花费的签名是放在输出脚本中的，形成了一个限制条款）
- 启用 RBF（手续费替代），并使用 Single、AnyOneCanPay、AnyPrevOut 三种 Sighash 模式来签名，允许为交易添加输入和输出来支付手续费（类似于 eltoo 中支付手续费的方式 [3] ）。
- 一个区块的相对时间锁，保证每个区块只能挖出一笔交易。

完整的交易流程图示见此处：https://gist.github.com/RubenSomsen/5e4be6d18e5fa526b17d8b34906b16a5#file-bmm-svg

（注意，如果使用的不是 Sighash_AnyPrevOut 而是 OP_CTV，则需要使用 CPFP（子为父偿），因为所有输出都需要预先定义好。）

（译者注：RBF 和 CPFP 都是追加手续费的方法，RBF 的思路是直接通过减少找零输出的面额来增加手续费；而 CPFP 的思路是发起一笔子交易来花费未确认的父交易，并使用子交易来支付更高的手续费。）

这种设置为哈希值创建了一个独一无二的位置，任何人都可以使用 RBF 来竞争这个位置。哈希值可以通过 Taproot 承诺到支付手续费的输出中。如果相应于被承诺的哈希值的区块没有公开或是违反了共识规则，这个区块会在自己的网络中被当成孤块，就像 Sztorc 的提议一样。

虽然比特币区块链对一个 BMM 的链是无感的，但反之不成立。所以，一些有趣的可能性也出现了。例如，你可以创造一种有条件的 BMM 代笔转账，只有当某一笔比特币交易在某一段时间内发生，才能执行；这就是一种原子化互换（结合 资产发行/染色币/锚定币 功能会变得非常有用）。基于比特币的算力及其它指标创建合约也会成为可能。

现在看起来，这样的 BMM 链似乎不可避免要发行一种原生的代币作为链内交易的手续费支付工具。这让我很不舒服。我能想到的最公平、最不会导致投机的方法就是一种永续的单向锚定机制：任何时候你都能燃烧 1 BTC 来换得 1 token。这就维持了 2100 万 BTC 的上限。燃烧掉的比特币就回不来了，可以均匀地给所有比特币持有者带来好处。持有 BTC 将永远是更优的，因为你总能将 BTC 迁移过去（反之就不行）。这样应该能遏制投机 —— 让人们仅在可以满足一个即时的目标时才将币迁移过去。

因为没有区块奖励，人们可能没有足够多的动力推动链的前进，而是会发动重组。但是，BMM 链的重组也有自己的特点：重组链必须跟原本的链竞争同一个位置。一个 10 区块长的重组平均要花 100 分钟才能跟原链打平（前提是这段时间原链不推进）。要是这段时间的新交易的手续费只给原链 [4] ，这种压力会让重组更加昂贵。不过，这种缓解措施是否充分，尚未有定论。

最后，值得追问的是 BMM 是否对比特币当前的激励结构影响过大。我没有清晰的答案，但需要指出，更低效的 BMM 在当前的比特币上已经可以实现了。你不必为哈希值指定一个专门的位置，你可以直接使用大量的区块空间，就像 Veriblock [5] 那样。因此，我认为这跟要通过 OP_RETURN 添加输入的理由是一样的 —— 如果你不支持这种方法，那人们就会使用更浪费的方法。

一些技术细节（感谢 Anthony Towns 提供他的洞见）：

- 因为具体的签名已经提前承诺了，私钥的安全性在此无关紧要。你可以直接使用 G（生成点）来取代常规签名 s = r + e * p 中的 R 和 P。这意味着任何人都可以使用 s = 1 + e  预先计算出所有 Sighash_AnyPrevOut 签名。
- 假设有了 taproot，花费的脚本可以成为一个 taproot 叶子。那么，为了保证限制条款的功能，密钥花费路径必须被禁用。这可以通过使用一个 NUMS（[Nothing-up-my-sleeve number](https://en.wikipedia.org/wiki/Nothing-up-my-sleeve_number)） 比如 hashToCurve(G) = H 来实现，然后 taproot 公钥可以是 T = H + hash(H||bmm_hash) * G 。



[0] https://github.com/bitcoin/bips/blob/master/bip-0301.mediawiki

[1] https://www.mail-archive.com/bitcoin-dev@lists.linuxfoundation.org/msg08075.html

[2] https://github.com/JeremyRubin/bips/blob/ctv-v2/bip-ctv.mediawiki

[3] https://blockstream.com/eltoo.pdf

[4] https://lists.linuxfoundation.org/pipermail/bitcoin-dev/2018-September/016352.html

[5] https://twitter.com/lopp/status/1081558829454802945https://www.btcstudy.org/2022/01/27/breaking-down-the-bitcoin-lightning-network-eltoo/