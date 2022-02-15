---
title: '比特币钱包需要通讯和存储解决方案'
author: 'Leo'
date: '2022/06/29 22:43:54'
cover: ''
excerpt: '通讯和存储方案的缺位困扰着钱包开发者'
tags:
- Nostr
---


> *作者：Leo WalletScrutiny Wandersleb*
> 
> *来源：<https://twitter.com/leowandersleb/status/1541577041342091265?s=21&t=X2-yvoL_mR42vdHegckkbA>*



缺乏默认的通讯和存储解决方案，从 2009 年开始就困扰着钱包开发者。

大部分钱包都允许用户在钱包内存储元数据，但缺乏可以互通的存储方式，所以你只能尝试将 “12 词”（助记词）导入另一个供应商的钱包软件来复原资金的控制权。

启用了多签名的钱包，也缺乏一种办法在不同供应商的解决方案间沟通 PSBT（部分签名的比特币交易） —— 所以你只能来回扫描二维码。

用发票或者说消息来发送支付的系统很少见，而且笨拙，而且通常是为山寨币设计的。

最近，至少通讯应用似乎越来越多地借用闪电网络，但主要是给闪电钱包和小众的聊天软件使用的。

还有一些钱包允许用户存储内容在专门的平台（比如 Dropbox 和 Google Drive）中，但这自然无法成为行业的标准。

数十种山寨币承诺要解决存储问题，但没有任何一个敢声称自己是事实上的标准，那些桀骜的比特神教教徒无论如何也不会使用 Filecoin/Srotj/Siacoin 等等。

但是，我们是不是过分复杂化了这个问题？[@fiatjaf](https://twitter.com/fiatjaf) 提出了 [#nostr](https://twitter.com/hashtag/nostr?src=hashtag_click) —— 可能是跨时间和空间发送消息的最简单、直接的协议。Nostr 希望使用简单的 relay 服务（可能收费也可能不收费）来解决存储和通讯问题。

到现在为止，每天都有新的 relay 服务端出现，通过 Nostr 协议发送过的所有信息都被高度冗余地存储，目前只有一个 relay 收取很少的服务费。

Nostr 可能不足以支持 [@SomsenRuben](https://twitter.com/SomsenRuben) 所提出的 “静默支付”（支付的接收者无法以来这些消息来找到发给 TA 的币），但我非常相信我会看到多签名合约的参与者通过 nostr 加密信息来相互协调。

对于临时的通讯，nostr 已经准备好了，便于钱包集成的代码库也正在开发。实际上，我就在开发一个 Android 的，非常期待您的帮助：https://github.com/Giszmo/NostrPostr

（完）

