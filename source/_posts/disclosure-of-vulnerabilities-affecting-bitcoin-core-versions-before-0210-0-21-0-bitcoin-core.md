---
title: '影响 0.21.0 以前版本 Bitcoin Core 软件的漏洞披露'
author: 'Optech'
date: '2024/08/15 11:06:55'
cover: ''
excerpt: '运用你的判断力'
categories:
- 比特币主网
tags:
- 尽责披露
---


> *作者：Optech*
>
> *来源：<https://bitcoinops.org/zh/newsletters/2024/07/05/>*
>
> 本文来自 Bitcoin Optech Newsletter #310 的新闻部分。译本由 “Optech 中文翻译小组（[BitcoinOptechCN](https://github.com/PrimitivesLane/BitcoinOptechCN)）” 提供。

> 原文总结了最近披露的影响 0.21.0 以前版本的 Bitcoin Core 软件的安全漏洞。为方便读者判定自己正在使用的软件版本的安全性，按照修复的时间倒序重新排列了漏洞的叙述。使用越新版本的用户需要严肃阅读的部分越少越靠前。
>
> 我们深知，软分叉哲学是比特币开发哲学的核心部分，它赋予了用户选择自己喜爱的共识规则的自由，因此，旧版本软件的安全性是所有人都应该捍卫的东西，如果没有它，软分叉哲学及其相应的自由就是一种空谈。但是，软件也像别的产品一样，有设计的使用周期，指望一款软件产品可以得到永续的安全维护是不现实的。因此，最终来说，全节点的运营者必须承担起判断的责任：在使用一款软件之前，评估其安全性，并随着信息的披露，更新自己的评估。

**影响 0.21.0 以前版本 Bitcoin Core 的漏洞披露**：Antoine Poinsot 在 Bitcoin-Dev 邮件组中[贴出](https://mailing-list.bitcoindevs.xyz/bitcoindev/xsylfaVvODFtrvkaPyXh0mIc64DWMCchxiVdTApFqJ_0Q5v0bOoDpS_36HwDKmzdDO9U2RKMzESEiVaq47FTamegi2kCNtVZeDAjSR4G7Ic=@protonmail.com/)了一个链接，[公布](https://bitcoincore.org/en/security-advisories/)了 10 个影响已经退役接近两年的 Bitcoin Core 软件版本的漏洞。我们将披露总结如下：

- [源自过量时间调整的网络分裂](https://bitcoincore.org/en/2024/07/03/disclose-timestamp-overflow/)：旧版本的 Bitcoin Core 允许自身的时钟被它连接到的前 200 个对等节点所报告的时间扭曲。这些代码本意是允许不超过 70 分钟的扭曲。所有版本的 Bitcoin Core 软件都会暂时无视带有超过本地时间 2 个小时以上的时间戳的区块。两个 bug 的组合，让攻击者可以让受害者的时钟倒拨两个小时以上，使之忽略掉带有准确时间戳的区块。该漏洞由开发者 practicalswift 尽责披露，并在 Bitcoin Core 0.21.0 中得到了修复。

- [审查未确认的交易](https://bitcoincore.org/en/2024/07/03/disclose_already_asked_for/)：对等节点一般会通过交易的 txid 或 wtxid 来宣布新交易。在节点第一次看到一个 txid 或者 wtxid 时，它会从第一个宣布这笔交易的对等节点处请求完整的交易。在等待这个对等节点回复的时间里，节点也会跟踪其它宣布了相同 txid 或 wtxid 的对等节点。如果第一个对等节点不回复、直至超时，节点会从第二个节点处请求完整交易（如果再次超时，则转向第三个节点，以此类推）。

  在 Bitcoin Core 0.21.0 之前，节点最多只会跟踪 50000 个请求。所以，第一个对等节点在宣布一个 txid 之后，可以推迟回复节点对完整交易的请求，等待该节点的其它对等节点都宣布该笔交易，然后发送 50000 条关于其它 txid 的宣布（可以都是假的 txid）。如此一来，当节点对第一个对等节点的完整交易请求超时后，它将不会再向其它任何对等节点请求完整交易。攻击者（第一个对等节点）可以无限重复这种攻击，从而永久阻止节点受到这比交易。请注意，这种对未确认交易的审查可以阻止交易迅速得到确认，这可能导致合约式协议（比如闪电通道）中的资金损失。John Newbery 引用了来自 Amiti Uttarwar 的共同发现，负责地披露了这个漏洞。修复措施在 Bitcoin Core 0.21.0 中放出。
  
- [无限大小的禁止连接列表所带来的 CPU/内存 DoS](https://bitcoincore.org/en/2024/07/03/disclose-unbounded-banlist/)：Bitcoin Core [PR #15617](https://github.com/bitcoin/bitcoin/issues/15617)（首次包含在 0.19.0 中）添加了代码，使得在收到一条 P2P `getaddr` 消息时，检查被本地禁止连接的 IP 地址，最高可达 2500 次。节点的禁止连接列表的长度时不受限制的，如果一个攻击者控制了大量的 IP 地址（例如，易于获得的 IPv6 地址），这份列表会膨胀成巨大的规模。当这个列表变得很长的时候，每一次 `getaddr` 请求都可能消耗超量的 CPU 和内存，可能让节点不可用甚至崩溃。这个漏洞被编号为 [CVE-2020-14198](https://nvd.nist.gov/vuln/detail/CVE-2020-14198)，在 Bitcoin Core 0.20.1 中得到了修复。

- [尝试解析 BIP72 URI 而导致的内存崩溃](https://bitcoincore.org/en/2024/07/03/disclose-bip70-crash/)：0.20.0 以前的 Bitcoin Core 支持延伸了 [BIP21](https://github.com/bitcoin/bips/blob/master/bip-0021.mediawiki) `bitcoin:` URI 的 [BIP70 支付协议](https://bitcoinops.org/en/topics/bip70-payment-protocol/)、使用由 [BIP72](https://github.com/bitcoin/bips/blob/master/bip-0072.mediawiki) 定义的参与 `r` 来引用一个 HTTP(S) URL。Bitcoin Core 会尝试从这个 URL 上下载文件，并存储在内存中等待解析，但是，如果这个文件大于可用的内存，Bitcoin Core 最终就会终止。当尝试下载在后台发生时，用户可能会走开，因此没有注意到节点的崩溃、也没有重启关键的服务。这个漏洞由 Michael Ford 尽责披露，并由 Bitcoin Core 0.20.0 通过移除 BIP70 支持的方式修复（见周报 [周报 #70](https://bitcoinops.org/en/newsletters/2019/10/30/#bitcoin-core-17165)）。

- [来自大体积 `inv` 消息的内存 DoS ](https://bitcoincore.org/en/2024/07/03/disclose-inv-buffer-blowup/)：一条 P2P `inv` 消息可以包含一个高达 50000 个区块头哈希值的列表。在 0.20.0 版本以前，新式 Bitcoin Core 节点会为自己不理解的每一个哈希值回复一条单独的 P2P `getheaders` 消息，而这样的消息的体积将是约 1 kB。这导致节点会在内存中存储大约 50 MB 的消息，等待对等节点接收它们。每一个对等节点都可以这样做（而对等节点的数量默认可达大约 130 个），这就会在节点的常规内存要求之上额外使用超过 6.5 GB 的内存 —— 足以让许多节点崩溃。崩溃的节点可能无法处理为合约式协议的用户处理时间敏感的交易，可能导致用户损失资金。John Newbery 负责地披露了这个漏洞，并提供了一种修复措施：仅用一条 `getheaders` 消息来回复一条 `inv` 消息，无论后者包含了多少哈希值；此修复进入了 Bitcoin Core 0.20.0。

- [通过格式错乱的请求浪费 CPU 的 DoS](https://bitcoincore.org/en/2024/07/03/disclose-getdata-cpu/)：在 Bitcoin Core 0.20.0 以前，攻击者或出故障的对等节点可以发送一种格式错乱的 P2P `getdata` 消息，导致处理消息的线程消耗 100% 的 CPU。（攻击发生后）在连接持续时间内，节点将不再能从攻击者处接收消息，虽然还能从诚实对等节点处收取消息。对于拥有少数 CPU 核心的节点来说，这可能只会造成一些小问题；在别处就会变成一种麻烦。John Newbery 负责地披露了这个漏洞并提供了一种修复措施；该措施进入了 Bitcoin Core 0.20.0。

- [因处理孤儿交易而产生的 CPU DoS 以及节点卡顿](https://bitcoincore.org/en/2024/07/03/disclose-orphan-dos/)：Bitcoin Core 节点会跟踪 “*孤儿交易*” 的一个不超过 100 笔交易的缓存，对于这些交易，节点在交易池和 UTXO 集中还没有必要的父交易信息。在验证完一笔新交易之后，节点会检查孤儿交易中是否有某一个变得可以处理。在 Bitcoin Core 0.18.0 之前，每次检查孤儿交易缓存的时候，节点都会尝试使用最新的交易池和 UTXO 状态、验证每一笔孤儿交易。如果这 100 笔缓存的孤儿交易都被构造成需要大量的 CPU 来验证，节点可能会浪费超量的 CPU，可能因此无法处理新区块和新交易长达数小时。这种攻击基本上时免费的：孤儿交易时可以免费创建的，因为它们可以引用根本不存在的父交易。一个停滞的节点将无法生成区块模板，因此这种攻击可能会被用来阻止一个矿工获得收益，而且可以用来阻止交易得到确认、可能会导致合约式协议（例如闪电通道）的用户失去资金。开发者 sec.eine 尽责披露了这个漏洞；该漏洞在 Bitcoin Core 0.18.0 中修复了。

- [使用低难度区块头的内存 DoS](https://bitcoincore.org/en/2024/07/03/disclose-header-spam/)：自 Bitcoin Core 0.10 以来，节点会请求其每一个对等节点来发它们所知的 *最佳区块链*（累积最多工作量证明的有效区块链）的区块头。这种方法的一个已知问题是，一个恶意的对等节点可以用大量低难度（例如，难度 1）的假冒区块头来轰炸节点，这样的区块头用先进的 ASIC 挖矿设备是很容易创建的。Bitcoin Core 最初的解决方法是仅接受与代码内硬编码的 *检查点* 相匹配的区块链上的区块头。最后一个检查点，虽然来自 2014 年，但以现在的标准来说也具有一个相对高的难度，所以它会要求大量地做功来创建假冒的区块头。但是，Bitcoin Core 0.12 加入的一项代码变更开始允许节点接受低难度的区块头进入内存，潜在地让攻击者可以用假冒区块头填满内存。这可以会导致节点宕机，并进一步导致合约式协议（比如闪电通道）的用户损失资金。Cory Fields 负责地披露了这个漏洞；该漏洞在 0.15.0 中修复。

- [因 miniupnpc 而出现的远程代码执行漏洞](https://bitcoincore.org/en/2024/07/03/disclose_upnp_rce/)：在 Bitcoin Core 0.11.1（发布于 2015 年 10 月）以前的版本中，节点会默认启用 [UPnP](https://zh.wikipedia.org/wiki/UPnP) 以允许通过 [NAT](https://zh.wikipedia.org/wiki/网络地址转换) 的入站连接。这是使用 [miniupnpc 库](https://miniupnp.tuxfamily.org/) 来实现的，而后者已被 Aleksandar Nikolic 发现具有多个可被远程攻击的漏洞（[CVE-2015-6031](https://nvd.nist.gov/vuln/detail/CVE-2015-6031)）。这些流动在上游库中修复了，修复也进入了 Bitcoin Core，并且开发者们采取了一项更新：默认禁用 UPnP。在研究这个 bug 的过程中，Bitcoin 开发者 Wladimir J. Van Der Laan 发现了同一库中的另一个远程代码执行漏洞。该漏洞已得到[尽责披露](https://bitcoinops.org/en/topics/responsible-disclosures/)，并已在上游库中修复，也进入到了 Bitcoin Core 0.12 中（发行于 2016 年 2 月）。

- [来自多个对等节点的大体积消息可造成节点崩溃](https://bitcoincore.org/en/2024/07/03/disclose_receive_buffer_oom/)：在 Bitcoin Core 0.10.1 之前，节点对 P2P 消息的体积要求是不能超过（约）32 MB。并且，一直以来（直到现在），节点默认允许高达 130 个连接。如果每个对等节点都在几乎同一时间发送最大体积的消息，这会让节点需要在其它内存要求之上额外划出 4 GB 的内存空间，已经超过了许多节点能够提供的大小。这个漏洞是由 BitcoinTalk.org 论坛的用户 Evil-Knievel 尽责披露的，获得了编号 [CVE-2015-3641](https://nvd.nist.gov/vuln/detail/CVE-2015-3641)，并且在 Bitcoin Core 0.10.1 中修复了，修复方法是将消息的体积限制在 2 MB 之下（后续又为了隔离见证升级而提高到约 4 MB）。