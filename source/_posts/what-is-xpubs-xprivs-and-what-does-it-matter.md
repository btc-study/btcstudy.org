---
title: '扩展公钥与扩展私钥'
author: 'Hezron Karani'
date: '2023/05/28 23:53:25'
cover: ''
excerpt: '一个比特币钱包有无数个地址'
categories:
- 比特币主网
tags:
- 入门系列
---


> *作者：Hezron Karani*
> 
> *来源：<https://blog.wasabiwallet.io/xpubs-xprivs/>*



比特币钱包软件让你可以在同一个应用中使用许多个 “钱包” 并生成无数个地址。理解 “xPub” 和 “xPriv” 可以帮助你理解这是怎么做到的。

“xPub” 是 “扩展公钥（Extended Public Key）” 的缩写，而 “xPriv” 是 “扩展私钥（Extended Private Key）” 的缩写。简单来说，xPub 和 xPriv 是父密钥，钱包软件用它们就可以自动地产生不计其数的子密钥，并在软件中使用这些私钥和公钥。

作为比特币用户，理解 xPub 和 xPriv 可以帮助你：

- 探索能够丰富你的比特币使用体验的方法
- 理解公钥和私钥如何影响你的比特币的安全性和隐私性
- 理解为什么最好的比特币钱包都使用这样的规范

xPub 和 xPriv 并不是比特币钱包一诞生就有的东西，下面就是我们需要它们的理由。

## xPub 和 xPriv 出现以前的比特币

[第一种比特币钱包](https://www.bitcoininsider.org/article/76048/bitcoin-history-part-18-first-bitcoin-wallet?ref=blog.wasabiwallet.io) Bitcoin-Qt，是有密钥管理问题的。它会随时生成一堆私钥，然后全部存储在计算机本地的 wallet.dat 文件里。

虽然这种办法也不是不行，但要是用户意外删除了这个密钥文件，或者遇到了恶意软件，那用户就可能会弄丢比特币。此外，如果你加密了这个文件，但忘记了加密的口令，也无法再复原你的资金。

作为 Bitcoin-Qt 的用户，要保证你的资金的安全，你还必须每当发起一笔交易就备份一次新版本的 wallet.dat 文件。当然，它还是没有针对忘记口令的解决方案。

为了让钱包和地址的管理不那么麻烦，人们提出了 BIP32（比特币升级提议 32），改变了私钥的生成方式。在这个协议中，比特币钱包不再需要为每一笔交易随机生成私钥，一个主密钥（master key）就足以按照预先定义的方式生成其它密钥。

用一种确定性的方式来生成私钥，意味着：

- 你只需要备份一个私钥（主私钥）
- 在多个钱包软件中使用相同的私钥变得更加便捷

下面，我们来看看父私钥是如何取代多个私钥的：

## xPub 和 xPriv 的工作原理

比特币离不开密钥对的概念，其中，私钥是用来签名交易（转移资金）的，而公钥（本身是从私钥计算出来的），则是用来接收交易的。

至于 xPub（扩展公钥）和 xPriv（扩展私钥），它们当然分别是公钥和私钥，但是其作用跟上述的不同。它们的 “扩展性” 使得它们可以派生出更多的子私钥和子公钥。此外，就像普通的私钥和公钥的关系一样，扩展公钥也是从扩展私钥中计算出来的。

而且，派生出来的子密钥可以继续派生子密钥（对扩展密钥来说就是孙子密钥了）。但不论派生多少代，（因为派生的方法）每一代子密钥都携带其父密钥的唯一签名（就像 DNA 一样）。这种家族树一样派生程序，催生了新一代的比特币钱包 —— 层级确定式钱包。

在层级确定式钱包（也称 “HD 钱包”）中，选定了某一条 树路径/分支，也就确定了子密钥。持有父密钥（也就是 xPub 和 xPriv），你可以遍历所有分支来检查子密钥（译者注：实际上，完全遍历是做不到的）。

只需持有一个主密钥，就可以派生出许许多多的密钥；这样的便利给比特币打开了一个全新的世界，用户再也不需要在更好的隐私性与便利的备份之间权衡取舍。

（译者注：在 BIP 32 出现之前，“钱包” 与 “地址” 的概念几乎是等同的，因为地址之间没有关联，所以每一个地址都是一个钱包；但在 BIP32 出现之后，两者就可以分离了，一个钱包指的不是一个地址，而是一对拓展密钥（主密钥）推导出来的一组地址。当然，因为地址是层级式的，由路径决定，所以， 你可以给地址分组，从而产生其它的概念，例如，下文所说的 “账户”。）

## 实际操作 xPub 和 xPriv

### 你可以在同一个钱包中拥有许多账户

因为一个父密钥就可以生成出许多子密钥，钱包软件可以派生出子私钥和子公钥，并将这些子私钥和子公钥进一步用作父密钥，从而在一个主钱包中产生新钱包。

作为用户，如果你想在一个钱包中设立多个账户，这是非常有用的。你可以运用这种特性，将你的金融身份分离开来。例如，你可以设立一个用于私人支出的账户、一个用作商务的账户，甚至一个储蓄账户，无需建立多个比特币钱包。

### 易于保管你的密钥

随机生成私钥意味着你在备份时需要备份许多私钥。但实现了 xPub 和 xPriv 的钱包，备份起来就不必这么麻烦了。

因为父密钥可以确定性地生成子密钥，并将这些密钥用于你的交易，所以你只需备份一个主密钥就可以了。这个主密钥可以推导出你曾用在交易中的所有密钥。因此，你只需要备份主密钥，就可以复原你所有的资金。（译者注：对大部分单签名钱包，这段说法是成立的；但是，请记住，地址是由主密钥和派生路径决定的，不同钱包可能使用不同的派生路径，所以最好也备份派生路径，除非你非常确定被使用的派生路径是标准的。）

### 你可以在单个比特币钱包中共享资金

因为 xPriv 可以签名用它来生成的任意地址的交易，分享它就可以让受你信任的人代你发起交易。举个例子，一个阻止可以使用主密钥 xPriv 生成子密钥，并将这些密钥分别发给采购部门和员工薪酬部门，它们都可可以获得资金，但无法花费其他部门的资金。

因此，在分享 xPriv 时，应当极为小心，因为任何人只要掌握了你的私钥，就可以控制你所有的资金。

### 更好的隐私性

一个 xPub 可以生成许多子公钥，用来接收资金。这是一种非常简单的提升比特币交易隐私性的办法，因为它防止了许多交易数据跟同一个地址关联起来（如果你重复使用相同的地址来接收互无关联的交易，就有这样的风险）。

### 可以同时使用多种钱包软件

xPriv 和 xPub 是比特币世界的进步，它让用户可以使用不止一种钱包软件，而无需创建多个备份。

在某一个钱包软件中生成种子词之后，你就可以将它导入另一种钱包软件，并推导得出相同的 xPub 和 xPriv，并复原资金的控制权（即使你此前从没用过这种钱包软件）。

不过，不同的钱包可能使用不同的派生路径，所以你并不是一定能成功。在切换软件供应商之前，你可以先检查一下[不同比特币钱包的兼容性](https://walletsrecovery.org/?ref=blog.wasabiwallet.io)。

### 安全地给不信任的人支付

因为私钥完全控制着你的资金，在联网、接收支付的设备上存储它们是不理想的。尤其是，如果你在不安全的支付处理器上存储私钥的话，任何恶意软件都可能让你损失资金。

但是，只需 xPub 就足以生成许多地址（用于接收支付），所以你不必让你的私钥暴露在可能的威胁中。

（译者注：作者在此处没有探讨的一种可能性是，当某人公开了自己的 xPub，我们就可以在其主人不知情的情况下使用其公钥 —— 我们可以用这个 xPub 推导出许多子公钥，然后放在我们的多签名钱包中。因为派生路径无限多，如果我们不告知原主人，TA 就不可能直到我们用到了 TA 的公钥；但因为确定性推导的特性，当 TA 知道了这些公钥之后，又确实能为它们生成有效的签名。）