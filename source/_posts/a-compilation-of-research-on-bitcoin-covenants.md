---
title: '比特币限制条款研究汇总'
author: 'corollari'
date: '2023/02/10 14:43:50'
cover: ''
excerpt: '基于操作码的 vs. 基于签名的'
categories:
- 比特币主网
tags:
- covenant
---


> *作者：corollari*
>
> *来源：<https://bitcoincovenants.com/>*
>
> *原文出版于 2020 年。*

## 什么是限制条款（covenant）？

限制条款也叫做 “花费限制”，是人们给一类理论上的比特币脚本的命名；这种脚本附着于 UTXO，但会限制这些 UTXO 的花费方式，比如限制资金转移的目的地。

会将自身复制到接收资金的 UTXO 中的限制条款，就叫做 “递归型限制条款”。

## 限制条款有趣在哪？

通用的限制条款（generalized covenants）可以开启非常多的新应用，例如：

- 长度不受限制的脚本（包括任意大小的多签名）
- 图灵完备的合约
- 交易层面的 “默克尔抽象语法树（MAST）”（MAST 的一个粗粒度的版本，可以在 脚本/交易 层面分割代码路径）
- 类似于 Drivechain 的双向锚定侧链

还有一些应用可在 [OP_CTV 宣传网页](https://utxos.org/uses/)中了解。

**注意**：本页中介绍的限制条款方案并非都是通用的；许多方案受到了严格的限制，因此每种限制条款方案所提供的应用并不完全相同。

## 为什么我要创建这个网页呢？

我花了一整个月来研究在当前的比特币脚本的局限下创建限制条款，就在我以为自己找到一个突破口后，我发现我所设想的系统在几个月前就已经在 bitcoin 邮件组的一篇帖子中出现了。

这个网站的目标就是提供关于比特币限制条款技术的信息，这样其他人就不会像我一样浪费时间了。

换句话说：

> 忘记历史，便会重蹈覆辙。

## 摘要

Bitcoin Cash 和 Liquid 侧链都已经有了构建通用型限制条款的能力。

比特币脚本无法使用通用型限制条款，但可以通过受信任的启动设置，开发出一种非常局限的限制条款。

不仅如此，现在有许多的协议升级提议，可以启用更加灵活的限制条款（但依然不是通用的），而最活跃的当属 SIGHASH_ANYPREVOUT/NOINPUT 和 OP_CHECKTEMPLATEVERIFY 。

## 基于操作码的限制条款

### OP_CHECKOUTPUTVERIFY

最早出现的限制条款提议之一。[这篇论文](https://maltemoeser.de/paper/covenants.pdf)介绍了一种可以加入比特币协议的的新操作码，它取三个参数`(index, value, pattern)` ，当且仅当尝试花费这笔资金的交易的第 `index` 个输出符合以下条件时，该操作码会返回 True ：

- 该输出的面值等于 `value`
- 该输出中的脚本，除了公钥和哈希值之类的东西（在 `pattern` 中表示为占位符），跟 `pattern` 相同

一种在技术上有误，但可以作为实例的 python 代码如下：

```python
def CheckOutputVerify(tx, index, value, pattern):
    output = tx.outputs[index]
    if value != 0:
        if output.value != value:
            return False
    if pattern != "":
        sanitizedPattern = pattern.replace("PubKeyPlaceholder", "00000000").replace("HashPlaceholder", "00000000")
        mask = replaceLocationsOfPlaceholdersWithZeroes("1"*len(sanitizedPattern), ["PubKeyPlaceholder", "HashPlaceholder"])
        if (output.script & mask) != sanitizedPattern:
            return False    
    return True
```

**注意**：这种实现是错的，因为二进制操作被替换成了字符串操作，而这些字符串操作也有许多地方是错的（字节的伪装并没有被构造成由 1 组成的字符串），但作为一段伪代码案例，它可以帮助理解。

这种操作码可以启动所有类型的限制条款，但现在，它已经被其它方案取代了，得到部署的概率已经下降到了零。

### OP_CHECKOUTPUTSHASHVERIFY

这个操作码是作为 tapscript 的一个插件而提出来的，并且目标是尽可能简单，仅仅是序列化一笔交易的输出、对结果哈希两次、跟传入的参数相比较：

```python
def CheckOutputsHashVerify(tx, outputsHash):
    if sha256(sha256(tx.outputs)) == outputsHash:
        return True
    else:
        return False
```

关于这个操作码，少有人知晓的是，在脚本中，它所需要的参数是在OP_CHECKOUTPUTSHASHVERIFY 之后提供的，而不是先提供参数再提供操作码。这种行为跟其它的操作码大相径庭：它们一般是从栈中获得参数（即参数先进入堆栈）；这样做是为了防止输出的哈希值在脚本中构建。

这个提议后来被 OP_CHECKTEMPLATEVERIFY 取代了，后者修改了操作码的行为，以便在花费嵌入了这种限制条款的 UTXO 的交易中执行 “抗变形性（non-mallability）”，并且回归了使用 NOP 操作码来部署的方式（而不是作为 tapscript 的插件）。

这份 [BIP](https://github.com/JeremyRubin/bips/blob/op-checkoutputshashverify/bip-coshv.mediawiki) 提供了细节。

### OP_CHECKTEMPLATEVERIFY

曾用名 “OP_SECURETHEBAG”，是一种新版的 OP_CHECKOUTPUTSHASHVERIFY，它通过让哈希值覆盖交易的多个部分，实现了抗变形性（OP_CHECKOUTPUTSHASHVERIFY 中的哈希值仅包含了输出，所以不具有抗变形性）。

具体来说，这个操作码还会读取下列字段：

- Version bits（交易的版本位）
- nLockTime（时间锁字段）
- 输入的签名脚本
- 输入的数量
- nSequence
- 输出的数量
- 输出
- 当前被验证的输入的索引号

将它们全部序列化，然后计算哈希值、跟栈顶的元素相比对，以此验证交易。

要了解更多信息，请看 [BIP119](https://github.com/bitcoin/bips/blob/master/bip-0119.mediawiki) 以及[这个网页](https://utxos.org/)。

## 基于签名的限制条款

### 关于签名的导论

下面是一份对 Schnorr 签名的简单解释；现在的比特币并不使用这种签名，但它们在概念上是相似的：

这种签名背后的主要想法是：假定你在某一条椭圆曲线上有一个点 *G*，以及一个数字 *n*，并且你可以很容易将它们相乘、得出同一条曲线上的另一个点 *N = n·G* ，使得从 *N* 猜测出 *n* 是非常困难的、几乎不可能的。

那么，我们可以拿 *p* 当成我们的私钥，计算 *p·G = P*，这就是我们的公钥 *P*（*G* 只是我们在曲线上选出来的一个点）。给定一笔交易 *tx* ，我们可以选出一个随机数 *k*，计算 *s = k + hash(tx)·p* 以及 *K = k·G* ，以 *(s, K)* 作为我们对这笔交易 *tx* 的签名（译者注：这里的算式是简化过的，跟实际使用的 Schnorr 签名不同）。

拿到这些数值，任何人都可以验证这个签名出自我手，他们只需检查 *s·G = K + hash(tx)·P* 是否相等；因为只有知道 *p* 的人才能建构出这样的签名，而不知道 *p* 的人如果想计算出 s，就要通过点 *S = K - hash(tx)·P* 来找出一个乘以 *G* 可以等于 *S* 的数字，这跟通过 N 来寻找 n 是一样的，这在我们解释的第一段里就已经假设是不可能的了。

基于签名的限制条款背后的想法是，虽然交易的信息对脚本来说并不能直接获得，但这些信息也被用来建构 OP_CHECKSIG（签名检查操作码）所用的 <em>hash(tx)</em>，因此，可以通过改造传递给 OP_CHECKSIG 的签名，间接地对比（交易的内容）。

### OP_CHECKSIGFROMSTACK

从内核上来说，这个操作码很简单，它取一条消息、一个公钥和一个签名，然后检查签名是否有效。有趣的地方在于，你可以使用这个操作码，将脚本内部建构的交易与触发调用的交易相比较、检查它们是否相等，因此它等于是可以访问被 OP_CHECKSIG 签名所用的哈希值覆盖的所有交易数据。

更具体来说，它的工作流程是：让一个 UTXO 的验证脚本（脚本公钥）构建（或者说验证）一笔序列化的交易，确保该交易具有特定属性（例如输出等同于提前建构好的一些输出），然后哈希这样的交易并对结果哈希值、来自赎回脚本（脚本签名）的 *(s, K, P)* 运行 OP_CHECKSIGFROMSTACK （赎回脚本中的数据是用户在链下计算好的）。

如果签名是有效的，那么 OP_CHECKSIG 将对相同的数值运行，也就是前面用过的数值 <em>(s, K, P)</em>（不包括那个哈希值）。如果其它操作码也返回了 True，那么我们就可以确定花费这个 UTXO 的交易，正是我们构造过的（因此执行了我们希望的任意条件）。这是因为 *s·G = K + hash(tx<sub>构造交易</sub>)·P* 在且仅在 *s·G = K + hash(tx<sub>真实交易</sub>)·P* 成立时，才成立。

要了解更多信息，请看[这篇论文](https://fc17.ifca.ai/bitcoin/papers/bitcoin17-final28.pdf)和[这篇文章](https://blockstream.com/2016/11/02/en-covenants-in-elements-alpha/)。

**注意**：这个操作码已经在 Elements 上实现了，这是 Blockstream 的 Liquid 侧链赖以建立的区块链层。此外，一种非常类似的，叫做 [OP_CHECKDATASIG](https://github.com/bitcoincashorg/bitcoincash.org/blob/master/spec/op_checkdatasig.md) 的操作码，也已经在 Bitcoin Cash 上实现了。

### SIGHASH_NOINPUT/ANYPREOUTS

如果 SIGHASH_NOINPUT（ANYPREVOUTS）得到部署，也能创造一种有点局限的限制条款。这些限制条款基于提前创建多笔交易，然后构造出只能计算出一种签名的公钥，使得任何发送给这个公钥的资金都只能通过提前创建的交易来花费。

换句话说，你可以使用下列协议创建一种限制条款：

1. 构造一笔交易 *tx*，它会花费一些资金
2. 选出一个数字 *s* 和一个点 *K*，必须是确定性的、可验证的（也可以是常数）
3. 通过等式 *s·G =  K + hash(tx)·P* 求解 P（公钥），即计算 *P = hash(tx)<sup>-1</sup>(K - s·G)*
4. 把钱发送到一个只能用 *P* 的签名来解锁的地址

因为 *P* 背后的私钥是未知的，所以除了一开始选定的 *s*，根本就不可能计算出别的签名；而这个 *s* 是对交易 *tx* 的签名。因此 *tx* 将是唯一一笔可以花费被 *P* 锁定的资金的交易。

但是，这套方案的一个大问题在于，为了构造交易 *tx* ，以及相应的 *P*，你需要把钱发给 *P* 的交易的 *txid*，但是为了构造出这样的交易，又必须先知道 *P*，这就成了一个死循环。

SIGHASH_NOINPUT 通过让 *hash(tx)* 可以不承诺交易的 txid，从而计算 *P* 也只需要对 *tx* 的输出的知识，解决了这个问题。

请看[首次介绍这套方案的 bitcoin-dev 帖子](https://blockstream.com/2016/11/02/en-covenants-in-elements-alpha/)，了解更多细节。

### 签名的构造

另一种类似的方案没有选择依赖于 SIGHASH_NOINPUT，转而依赖任一种可以对堆栈中的一个元素的一部分执行检查的操作码（例如：OP_AND、OP_SUBSTR、OP_CAT……），从而启用了通用的限制条款，并且是基于直接在脚本内构造某一笔交易的签名的：

1. 在脚本内部，获得一笔交易 *tx* 并验证所有的属性都符合限制条款的要求
2. 在脚本内部，计算 *hash(tx)* + 1，然后以 *-G* 为公钥（*P*）、G 为 nonce（*K*）、刚刚计算出的值为 *s*，执行 OP_CHECKSIG 。另一种理解这种操作的角度是，将私钥 *p* 设为 -1，nonce（k）设为 1。
3. 如果 OP_CHECKSIG 检查通过，则被花费的交易就是 *tx*。

这个方案的重点是，OP_CHECKSIG 变成了检查 <em>s·G = G + hash(tx)·(-G)</em>，该等式仅在 *s = hash(tx) + 1* 时才为真，因此，通过构造 *s = hash(tx<sub>构造交易</sub>) + 1*，我们让 *hash(tx<sub>构造交易</sub>) + 1* = *hash(tx<sub>真实交易</sub>) +1*，这就是直接检查在脚本内构造的交易与花费这笔输出的交易是一样的。

你可能会好奇为什么要让 *k = 1* 而不是让 *k = 0*，这样可以在计算的时候省去一个烦人的 “+1”。原因很简单，签名标准不允许我们将 k 设为 0。

### 多签名的变种

另一种可以在当前的比特币协议中创造限制条款的方案需要一个受信任的启动设置：一次性的密钥。主要的想法就是你可以创建一个新的私钥，使用它签名一组交易，然后毁掉这个私钥，仅保留签好名的交易，从而这个密钥名下的钱将只能通过这些交易来花费。

这种想法还可以延伸成多签名的启动设置：受信任的启动设置为所有的参与者一起构造一个 n-of-n 的多签名，以及所有需要的交易，然后，每一位参与者都将自己的私钥销毁，只要至少一个人诚实地销毁了自己的私钥，即可保证不再能构造出有效的签名，实际上就变成了一种限制条款。也就是说，如果没有人销毁自己的私钥，并且所有的参与者会串谋，就能创造出新的任意签名，让限制作用完全消失。因此，这种方案需要信任（假设参与初始化设置的人中至少有一个是诚实的）。

<p style="text-align:center">- - -</p>


本文是开源的（MIT 许可），并且可以在 [Github](https://github.com/corollari/bitcoin-covenants) 上获得。欢迎贡献。

（完）