---
title: '软链：通过软分叉激活的 POW FP 侧链'
author: 'Ruben Somsen'
date: '2022/02/10 17:52:54'
cover: ''
excerpt: '本文介绍了一个完全去中心化的双向锚定侧链设计。这种新型侧链需要通过软分叉激活'
tags:
- Softchain
- 欺诈证明
---


> *作者：Ruben Somsen*
> 
> *来源：<https://gist.github.com/RubenSomsen/7ecf7f13dc2496aa7eed8815a02f13d1>*

本文首发于 [bitcoin-dev](https://lists.linuxfoundation.org/pipermail/bitcoin-dev/2020-December/018331.html)。

本文介绍了一个完全去中心化的双向锚定侧链设计。这种新型侧链需要通过软分叉激活，因此得名软链（softchain）。其设计重点在于，每个人都会使用基于工作量证明的欺诈证明（Proof-of-Work Fraud Proofs，PoW FP）对所有软链进行验证。PoW FP 是一种耗时久但是非常高效的共识机制，只要求验证有争议的区块。这确实加重了主链全节点的验证负担，但只增加了一点点（每年每条链约增加 100 MB）。软链与 [drivechain](https://www.drivechain.info/) 相似，但是不像后者那样必须依赖矿工，因为所有比特币全节点用户都可以有效验证每条侧链。

## 基于工作量证明的欺诈证明

去年，我将 [PoW FP 的构想发布到了比特币邮件列表上](https://lists.linuxfoundation.org/pipermail/bitcoin-dev/2019-April/016873.html)（[点击此处查看](https://lists.linuxfoundation.org/pipermail/bitcoin-dev/2019-September/017287.html)）。我的构想是，我们可以利用比特币 PoW 链上存在的分叉来证明某个区块有可能是无效的（即，潜在欺诈证明）。每当分叉出现时，我们都会下载相关的区块来验证其是否有效（可用），如果该区块无效，则拒绝接受它。通过假设存在于两条分叉起始的前一个区块内包含的承诺是有效的，我们无需维护一整个 UTXO 集合及其承诺（例如 [utreexo](https://eprint.iacr.org/2019/611.pdf)）。因此，我们只需要下载所有孤块（及其对应的 UTXO 集证明），与运行全节点相比大幅降低了验证成本。

过去 4 个月来，[Forkmonitor](https://forkmonitor.info/notifications)[ 已经发现了 11 个无效区块](https://forkmonitor.info/notifications)。根据该数据推断，验证比特币共识的 PoW FP 节点每年只需下载并验证略多于 100 MB 的数据，就能实现媲美全节点的共识保障：

- 所有 PoW 区块头（每年约 4 MB）

- 3 x 11 = 33 个完整区块（~2 MB x 33 = 66 MB）

- UTXO 默克尔证明（~1 MB x 33 = 33 MB 内含 utreexo）

之所以说共识耗时久，是因为我们要让少数诚实的 PoW 矿工有时间脱离无效的链。假设只有 1% 的矿工是诚实的，共识的速度就会减慢 100 倍。如果你通常只需要等待 6 次确认，现在就得等待 600 次确认。你愿意等待的时间越久，诚实矿工人数在矿工总人数中的占比就可以越低。

## 软链

若想实现双向锚定侧链，你要能找到一种简单的方法来向主链证明转出侧链（peg-out）交易是有效的。PoW FP 刚好可以做到这一点，即，通过一种低带宽的方式来证明一条链（包括转出侧链交易）是否有效。PoW FP 共识的高耗时不成问题，因为转出侧链交易的速度是可以任意减慢的（例如，一年）。

最安全的设计是让一组软链与 Bitcoin Core 共享共识代码和 UTXO 集合承诺，同时禁用非 taproot 类型的地址来尽可能减少[某些资源使用问题](https://lists.linuxfoundation.org/pipermail/bitcoin-dev/2019-September/017298.html)。所有用户都像往常一样使用全节点对主链进行验证，所有软链都经由 PoW FP 共识验证。如果有用户想要直接使用某条软链，应该将其当作全节点那样运行，以便快速获得共识。

转入侧链（peg-in）就是先将主链上的比特币冻结，再将它们分配给软链。转出侧链就是在主链上创建一个交易指向软链上的转出侧链交易，然后等待足够多的主链交易确认。如果 PoW FP 共识表明该转出侧链交易仍属于软链，则该交易中包含的比特币是可以花费的。

转入/转出 侧链机制本身需要通过软分叉（具体设计未定）来实现，因此每条软链也都需要通过软分叉来激活。

## 隐患

软链共识依然需要主链用户通过某种方式进行验证，也就是说共识问题可能会造成负面影响，尤其是当软链出现非确定性共识问题时。例如，一个转出侧链交易被大多数用户接受，被少部分用户拒绝。这种场景可能会导致主链共识中出现链分裂问题。这就是为什么基于 Bitcoin Core 的侧链设计是最安全的。

从理论上来说，软链也有可能发生重大重组，致使已经被主链接受的转出侧链交易无效，造成共识分裂。转出流程越久，这种可能性越低，但是无法被消除。有一个办法或许有用（也有可能让情况变得更糟），就是通过制定共识规则来禁止超过转出侧链交易期一半时间的重组（如果转出侧链交易耗时一年，这个限期就是半年）。这一规则实际上无法解决该共识问题，而是促使这个问题率先在软链上爆发出来，让人们有时间采取行动，保护主链不受其影响。

这里还需要强调的一点是，每条软链上都会产生大量工作量证明，因为如果难度值太低，创建分叉和增加 PoW FP 共识资源使用量的成本就会下降。因此，我们需要为软链区块设置一个可接受的最低难度值（在交易费不足时放慢出块速度）。合并挖矿也会有帮助，因为这样可以让软链获得与比特币相同的算力（假设所有矿工都参与），但是也会给矿工带来额外的验证负担。

## 总结

虽然软链可能会因为过高的共识风险而无法采用，但是它看起来值得我们一试。至少，软链会为用户提供更多开放的区块空间，还有可能拥抱那些共识规则大相径庭的链。

感谢你阅读完本文。如果你有任何问题，我都乐意解答。如果我有任何疏忽之处，或是你有办法缓解上述问题来保障软链的安全性，期待收到你的反馈。

希望我的构想能帮助去中心化的双向锚定侧链方案尽早成为现实。

祝大家新年快乐。

（完）