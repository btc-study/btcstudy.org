---
title: '比特币所用的时间锁'
author: 'James Prestwich'
date: '2021/10/31 16:30:54'
cover: '../images/bitcoins-time-locks/-tcpGlF.jpg'
excerpt: '时间锁让用户可以用基于时间的条件来指定交易（transaction）的有效性'
categories:
- 比特币主网
tags:
- 比特币
---


> *作者：James Prestwich*
> 
> *来源：<https://medium.com/summa-technology/bitcoins-time-locks-27e0c362d7a1>*



比特币没有明显的缺陷，它配置了多种时间锁。这些工具让用户可以用基于时间的条件来指定交易（transaction）的有效性。使用时间锁，你可以延期到下周支付、增设资金转移的强制等待期、设置用多笔交易组成的复杂智能合约，当然也有可能一不小心把你的币锁住几个世纪。

大部分时间锁功能都是很晚近才加到比特币里面的。它们内置在交易的结构中，还从我们最喜爱的匿名密码朋克，中本聪先生，所编写的漏洞百出的代码中继承了许多奇怪的特点。时间锁功能相应的比特币升级提议（BIP）都写得很好、很详尽，但需要你有大量背景知识才能读得懂。我在这里尝试汇集我能找到的所有关于时间锁的信息，并深入解释它们。

![img](../images/bitcoins-time-locks/-tcpGlF.jpg)

## 给时间锁分类

在深入了解这些工具之前，我们先分辨一下如何描述它们的操作。时间锁有三种重要属性：位置、目标和度量。

### **位置：交易层 vs. 脚本层**

> 时间是两地间最远的距离。
>
> —— Tennessee Williams

时间锁可以放置在交易本身中 以及/或者 放置在其 P2SH 输入的相关脚本中。每笔交易都有多个时间锁字段（即使不使用，它们也存在）。脚本则不然，可以不使用，也可以使用很多个。从功能上来看，交易层面的时间锁和脚本层面的时间锁，是极为相似的，但扮演的角色差别很大。**交易层面的时间锁**使得这笔交易在特定时间以前是无效的，无论是否提供了有效的签名和脚本。而**脚本层面的时间锁**会导致脚本的计算失败（除非交易本身也在锁定阶段，进不到脚本的处理）。脚本计算失败也会导致交易无效。总而言之，交易层面的锁决定了什么时候开始这笔交易能打包上链，而脚本层面的时间锁决定了给定的一个 scriptsig（“解锁脚本”）是否有效。

两者之间最主要的区别是它们锁定的东西。交易层的锁，锁住的是具体的一笔交易；可以把交易时间锁看成是一张日后生效的支票：我可以给你写一张未来会生效的支票，但是这个生效日期的限制仅适用于这张支票，我还是可以用你不知道的方式花掉这笔钱。脚本锁则为所有试图花费这个输出的交易都设置了条件。换句话来说，交易层面的锁只能在一笔交易构造好之后影响这笔交易的处理方式；但脚本层面的锁在一开始就决定了什么交易能够构造、什么不能。

交易时间锁不像你想的那么有用。它并不控制资金本身，只能控制这一次的花费。这就是为什么所有新颖的技术都需要 OP_CLTV 和 OP_CSV（脚本层面的时间锁）。使用脚本层面的锁和条件式逻辑（OP_IF），我们可以做出复杂的脚本，比如：允许多签名在任意时间花费这笔资金，或者，在一段时间过后，某一个签名可以花费这笔资金。这为 P2SH 交易提供了丰富的通用性。

### **目标：绝对 vs. 相对**

> 时间是一种幻觉，午餐时间尤甚。
>
> —— Douglas Adams

好吧，其实，它们都是相对的。你其实是在 “相对于时间原点” 和 “相对于上一个输出的产生时间点” 之间选一个。我就是喜欢搞这种没有用的吹毛求疵 : )

当你对一些币施加了时间锁时，你同时也设置了其释放的时间目标。**绝对时间锁**使用一个设定的时间来定义这个目标，也就是到了具体的某个时间点，这个锁会过期。**相对时间锁**则用前序输出生成以来经过的时间来定义（过期时间）。两者的区别相当于 “下午三点约定你” 和 “四个钟头后我们见面”。

用绝对时间锁锁定的交易，在到达那个时间点之前，都是无效的交易。这就意味着我可以提前一年构造一笔交易，可以签名、可以分享出去，甚至广播出去，而不用担心这笔交易会在一年内打包上链。我可以用绝对时间锁给我的孩子安排资金，还可以设立一个你可以存钱进去、但得等到明年才可以取出的储蓄账户。

相对时间锁则相反，它使得一笔交易在该交易的前序输出生成后的一段时间内，该交易是无效的。这是一个微妙又强大的特性。相对时间锁真正巧妙的用法在于，可以拿 *未广播*、*未确认* 的交易，作为锁的条件。一笔交易上链确认之后，你当然总是可以（为后序交易）设定一个绝对时间锁。但想要这么做，你得先等待前一笔交易上链，而且要知道其上链的时间；或者你要提前设置一个很长的锁，这个时间也就变成了你整套智能合约的解锁时间。但相对时间锁可以根据未确认的交易来设定，也就是说，你可以提前创建和签名一整套多步骤的智能合约，并且确信这些交易会按照你安排的顺序上链，*不论这些交易具体在什么时候执行*。

### **度量：区块 vs. 秒**

> Then’s the time to time the time flies –
>
> Like time flies like an arrow.
>
> — Edison B. Schroeder

在比特币中，时间是一个共识出来的幻觉，所以永远没有午餐时间。交易不可能看着墙上的钟来决定自己什么时候上链，所以我们需要定义 “时间”。比特币用两种办法来度量 “时间”：区块号，区块时间戳。每一种时间锁都以这两个度量为操作模式，没有专门、独立的锁机制。你可以为锁设定一个**区块数量**（区块号），也可以设置**秒数**（时间）。两种方式都有各自的复杂性。在实践中，这两种度量对现实世界的应用来说都是足够准确的。但了解它们的特点很重要。

我们常常说，区块挖出符合泊松分布：一般来说每 10 分钟出现一次。但并不绝对数次。当挖矿的算力在增加的时候，区块挖出的速度会比预期要快。当算力离线或者转向别的链时，网络的出块速度会变慢。挖矿难度每 2016 个区块（大约 2 周）调整一次，目标是让出块速度回到 10 分钟，但区块出现的速度可能单纯因为网络阻塞或随机因素而大幅偏离。

时间戳也同样耐人寻味。你可以再到，在比特币里面，区块的时间戳不是单向递增的。因为区块时间戳的共识规则，时间戳在一两个区块内可能向后滚动，或停滞一分钟。我可以跟你保证，共识规则这样设计不是胡闹。它可以保证时间戳总是在整个网络的 “真实时间” 的前后几小时范围内（译者注：在比特币网络中，节点收到区块时会查看时间戳，只要时间戳与本地时间相差在一定范围内，都能接受；但相差范围过大，区块会被拒绝；前后区块的时间戳并没有只能增不能减的要求）。尽管如此，为了让基于时间戳的锁变得可靠，开发者们使用了 [BIP 113](https://github.com/bitcoin/bips/blob/master/bip-0113.mediawiki) 中描述的 “过往中值时间（median time past，MTP）” 方法来度量时间。时间锁不会使用当下区块的时间戳来度量时间，而是使用过去 11 个区块的时间戳中值。这样既能平滑化时间的推进，也能保证时间不会 “倒流”。

![img](../images/bitcoins-time-locks/qrLicCV.jpg)

## 不同的锁

现在你们应该有点概念了，所以我么可以具体讲讲这些时间锁工具了。现在比特币有四种时间锁：nLocktime、nSequence、OP_CHECKLOCKTIMEVERIFY（OP_CLTV）和 OP_CHECKSEQUENCEVERIFY（OP_CSV）。两个是脚本层面的，两个是交易层面的。

### **nLocktime**

**nLocktime 是交易层面的绝对时间锁**。它也是中本聪初版软件（Satoshi’s Original Vision）所用的唯一一种时间锁。

交易的数据结构很简单，包含了版本、输入、输出和其它的一些字段。nLocktime 有自己的专属字段 `lock_time`。它指定了一个区块号或者时间戳。在到达这个指定时间之前，这笔交易都是无效的。Bitcoin Core 软件构造的交易默认将 `lock_time` 字段设为当前的区块号，[以避免有人靠重组区块来获得更多手续费](https://www.reddit.com/r/Bitcoin/comments/47upgx/nsequence_and_optin_replacebyfee_difference/d0g612x/?context=5)。时间被表示为一个 32 位的非负整数（32 bit integer）。如果 `lock_time` 的值是 0，则这个字段会被忽略掉；如果它的值大于等于 5 0000 0000（5 亿），则会被当成一个 unix 时间戳。所以 nLocktime 可以使用区块号把一笔交易锁定 9500 年之久；用时间戳，也可以锁定到 [2106 年](https://en.wikipedia.org/wiki/Time_formatting_and_storage_bugs#Year_2106)。

奇异的是，如果所有的输入的序列号都是 `0xFFFFFFFF`（32 位整数的最大值），`lock_time` 字段会被完全忽略掉。[BIP 125](https://github.com/bitcoin/bips/blob/master/bip-0125.mediawiki) 所描述的可选的 replace-By-Fee（RBF，用增加手续费来 替换/加速 未上链交易的办法）也类似。使用 `sequence_no` 来发送信号是中本聪不成熟时代的时间锁实现的产物。要想改变，只能动用硬分叉。nLocktime 和交易输入的序列号一开始提出是为了构建一个简单的交易更新机制：你可以构建一个带有时间锁的交易，然后通过发送带有至少一个更高序列号的版本来替换原交易。

按照假设，矿工会抛弃掉带有更低序列号的交易。那么，如果所有的输入都具有最大的序列号，这就成了一笔没法更新的交易，它当然可以无视掉时间锁。这个更新机制没有完全实现过，后来就被抛弃了。阴沟里翻船，中本聪似乎假设了一种良好的实践，但这个假设在比特币中是不合理的。没法保证矿工总能看到更新后的交易，也没法保证他们看到了就会丢弃掉旧的版本。矿工只会打包最有利可图的版本，而不是最新的版本。

**nLocktime 案例**

```java
# 交易的大部分结构都已省去，为便于阅读，使用十进制。
# 因为标签的存在，在序列号中使用十六进制。

# 这笔交易在区块高度 499999999 之前都是无效的（不要学，反面教材）
tx_1:
  lock_time: 49999999
  
# 这笔交易在区块时间戳中值到达 1514764800 (1/1/2018 0:00:00 GMT) 之前都是无效的。
tx_2:
  lock_time: 1514764800
  
# 没有时间锁，所以这笔交易即时可上链。
tx_3:
  lock_time: 0

# 这个时间锁无效，因为所有输入的序列号都已经是最大值 0xFFFFFFFF。
tx_4:
  lock_time: 3928420
  input_1:
    sequence_no: 0xFFFFFFFF
```

### **nSequence**

**nSequence 是交易层面的相对时间锁**（从技术上来说，nSequence 实际上是输入层面的，容后详述）。它提议重新使用每个输入的 `sequence_no` 字段，基于前一个输出确认后经过的时间来开启交易的有效性。nSequence 时间锁是在 [BIP 68](https://github.com/bitcoin/bips/blob/master/bip-0068.mediawiki) 引入的，后来在 2016 年中段的软分叉中激活。Satoshi 给了我们柠檬，我们做出了 nSequence 时间锁。

Sequence  字段从一开始就存在。但因为中本聪的交易替换机制从未被实现（而且长期来看也不可能奏效），这个字段就变得繁琐无用。多年以来，这个字段唯一的用途就是禁用时间锁。现在，序列号可用于实施交易层面的相对时间锁，就像 BIP 68 提议的那样。nSequence 锁是在每个输入中设置的，是根据每个输入所消耗的输出的上链确认时间来度量的。这也意味着，同一条交易可以指定多个不同的时间锁条件，所有条件都必须满足，这笔交易才是有效的。即使只有一个时间锁未解锁，整笔交易也无法上链。

比特币开发者精通升级改造（upcycling），但有时仍不免留下蛛丝马迹。因为 nSequence 时间锁是重用了已有的 `sequence_no` 字段，它会有一些奇怪的行为。序列号字段是 32 位的，但我们没法全部使用，因为它还是会跟 nLoncktime 和 RBF 信号交互。此外，`sequence_no` 也是我们仍有余力在未来作出变更的地方之一。为了平衡这些需求，nSequence 时间锁只使用这个字段的 18 个位。其余 14 个位留给未来可能派上用场的地方。

有两个位充当告诉节点如何处理 `sequence_no` 字段的标签。最高有效位（most significant bit）就是 “禁用” 标签。如果设置了这个标签，nSequence 时间锁就被禁用了。如果没有设置这个标签，其余的 `sequence_no` 就会被作为相对时间锁。Bit 22（第 23 个最低有效位，least significant bit）是类型标签，如果设置了这个标签，时间锁会以秒来计量；如果未设置，则表示以区块数量来指定。

`sequence_no` 字段最低的 16 个有效位用来编码目标时间。不像 nLocktime，nSequence 只使用 16 位来编码锁定时间。也就意味着，nSequence 时间锁最长只能达到 65535 个单位。如果以区块为单位，在最长可以锁定 455 天；但如果使用一秒为单位，则最长只有 18 个小时。为了缓解这个问题，nSequence 不使用一秒为单位，而是以 512 秒为单位。如果设置了类型标签，则锁定时间会被设置为 16 单位，也即该输入会被相对锁定 16 × 512 秒。

Bitcoin core 软件构造的交易会默认把每个输入的 `sequence_no` 都设为 `0xFFFFFFFE`。这样做会启用 nLocktime 来防止有人专门挑选高手续费的交易来重组区块；同时会禁用 Replace-By-Fee。Replac-By-Fee 交易一般会把每个输入的 `sequence_no` 设为 `0xFFFFFFFD`。值得点出的是，RBF *不是* 协议层的变更，只是默认挖矿策略的变更。但是，因为 nSequence 锁需要把 `sequence_no` 字段设置得小于 `0xFFFFFFFD`，所有的 nSequence 锁定交易都支持 RBF。

**nSequence 示例**

```
# 交易的大部分结构都已省去，为便于阅读，使用十进制。
# 因为标签的存在，在序列号中使用十六进制。

# 这笔交易相对锁定了 4096 秒，也就差不多一个小时。
tx_1:
  input_1:
    sequence_no: 0x00400008
	# 未设置禁用标签，设置了类型标签。所以该输入会被锁定 8 * 512 秒。
	
# 这笔交易没有使用 nSequence 锁，但可能使用了 nLocktime 锁，并且允许 RBF。
tx_2:
  input_1:
    sequence_no: 0xFEDC3210
    # 设置了禁用标签，所以 nSequence 锁定禁用了。
    
# 这笔交易在 input 1 所使用的输出首次确认（上链）后的 16 个区块内，都是无效的。
tx_3:
  input_1:
    sequence_no: 0x00000010  
    # 未设置禁用标签，未设置类型标签。所以该输入会被锁定 16 个区块。
  input_2:
    sequence_no: 0xFFFFFFFF  
    # 设置了禁用标签。

# 这个交易没有设时间锁，但可以选择 RBF 替换机制。
tx_4:
  lock_time: 0
  input_1:
    sequence_no: 0xFFFFFFFE  
    # nSequence 已禁用，nLocktime 启用了，未表示使用 RBF。
  input_2:
    sequence_no: 0xFFFFFFFD  
    # nSequence 已禁用，nLocktime 启用了，表示使用 RBF。
    
# 这笔交易在区块高度 506221 前都是无效的。
# 在 input_1 所用的输出首次确认后的 87040 秒内，这笔交易也同样是无效的。
tx_5:
  lock_time: 506221
  input_1:
    sequence_no: 0x004000AA
```

![img](../images/bitcoins-time-locks/vzSG6Ro.jpg)

### **CLTV**

**OP_CHECKLOCKTIMEVERIFY（OP_CLTV）是脚本级的绝对时间锁**。它是在 [BIP 65](https://github.com/bitcoin/bips/blob/master/bip-0065.mediawiki) 中提出，并在 2015 年底的软分叉中激活的。OP_CLTV 使得[哈希时间锁合约](https://z.cash/blog/htlc-bip.html)得以出现，这对闪电网络通道的第一个版本来说是硬性要求。

CLTV 的软代码简单而优雅，只有不到 20 行的简洁、注释详尽的代码。简而言之：OP_CLTV 会比较栈顶的元素与交易的 nLocktime。它会检查栈顶的元素是不是一个有效的时间（以秒为单位或者以区块为单位），并且交易自身也通过合适的 `lock_time` 锁定了至少那么长时间。如此一来，OP_CLTV 就相当于保证了交易不会在某个特定的时间点之前上链。

在下列情况中，OP_CHECKLOCKTIMEVERIFY 会立即导致脚本计算失败：

1. 栈是空的（即没有为 OP_CLTV 指定目标时间）。
2. 栈顶的元素小于 0（负数的时间锁是没有意义的）。
3. nLocktime 以区块为单位，栈顶的元素却以秒为单位，反之亦然（苹果与梨不可比较）。
4. 栈顶的元素大于交易的 `lock_time`（也即还没到解锁时间）。
5. 这个输入的 nSequence 字段设为 `0xFFFFFFFF`（时间锁可能被禁用）。

OP_CLTV 取代了 OP_NOP2，那是一个（你可能也猜到了）没有任何作用的操作码。设计 OP_CLTV 来取代 OP_NOP2 产生了一个有趣的约束：OP_CLTV 只能让堆栈保持原样。因为 OP_CLTV 只能读取栈元素，但不能 *消耗* 栈元素。它只是检查时间锁，然后就会把目标时间留在栈中。因此，它后面总是必须接一个 OP_DROP，用来丢掉栈顶元素（然后继续）。

将脚本中的锁定时间与交易的锁定时间相比较是一种非常聪明的实现，因为它是间接检查时间的。它将执行要求传递给 nlocktime 共识规则，同时仍然允许脚本指定多个不同的时间锁条件。它允许在任何适合检查解锁脚本的有效性并[存入缓存](https://bitcointechtalk.com/whats-new-in-bitcoin-core-v0-15-part-5-6a9cfa85821f)。缺点在于，一旦 OP_CLTV 又在了脚本中，`lock_time` 就必须在交易中指定，而输入中就必须存在 `sequence_no` 小于 `0xFFFFFFFF` 的输入。对于刚上手的开发者来说，这一点可能有点反直觉，所以要记在心上。

**OP_CLTV 案例**

```java
# 交易的大部分结构都已省去，为便于阅读，使用十进制。
# 因为标签的存在，在序列号中使用十六进制。
    
# 只要区块高度达到 506391，任何人都能花费
tx_1:
  lock_time: 506391
  input_1:
    sequence_no: 0xFFFFFFFE
    script:
      506391 OP_CHECKLOCKTIMEVERIFY OP_DROP

# 这笔交易是无效的
# lock_time 以区块为单位，CLTV 却以秒为单位
# sequence_no 是 0xFFFFFFFF
tx_2:
  lock_time: 506391
  input_1:
    sequence_no: 0xFFFFFFFF
    script:
      1514764800 OP_CHECKLOCKTIMEVERIFY OP_DROP

# 这笔交易是无效的
# 栈顶元素的值大于 lock_time
tx_3:
  lock_time: 506391
  input_1:
    sequence_no: 0xFFFFFFFE
    script:
      600000 OP_CHECKLOCKTIMEVERIFY OP_DROP

# 这笔交易在区块高度达到 512462、且其输入所消耗的输出初次确认的 32 * 512 秒后才是有效的
# 可以构造另外的一笔交易，在区块高度 506391 和 512462 时间花掉这笔资金
tx_4:
  lock_time: 512462
  input_1:
    sequence_no: 0x00400020
    script:
      506391 OP_CHECKLOCKTIMEVERIFY OP_DROP

# 这笔交易从区块高度 506321 开始变成有效的
# 这个脚本允许一种使用 2-of-2 多签名的执行路径
# 可以用一个没有时间锁的交易来花费这笔资金
tx_5:
  lock_time: 506321
  input_1:
    sequence_no: 0xFFFFFFFE
    scriptsig:
      OP_TRUE
    script:
      OP_IF
        506321 OP_CHECKLOCKTIMEVERIFY OP_DROP
      OP_ELSE
        OP_2 <pubkey_1> <pubkey_2> OP_2 OP_CHECKMULTISIG
      OP_ENDIF

# 这是哈希时间锁合约的一个变种
# 给定下列条件，这笔交易在区块高度 507381 开始变成有效的：
# 1. 解锁脚本中的 secret 的哈希值与 input_2 脚本中的 hash 相同
# 2. 为 input_2 提供了有效的签名和公钥
# 3. input_2 的 nSequence 时间锁已解锁
tx_6:
  lock_time: 507381
  input_1:
    sequence_no: 0xFFFFFFFE
    script:
      507381 OP_CHECKLOCKTIMEVERIFY OP_DROP
  input_2:
    sequence_no: 0x000000A0
    scriptsig:
      <signature> <pubkey> <secret>
    script
      OP_HASH160 <secret hash> OP_EQUALVERIFY
      OP_DUP OP_HASH160 <pub keyhash> OP_EQUALVERIFY OP_CHECKSIGOP_CSV
```

### **OP_CHECKSIGOP_CSV**

OP_CHECKSEQUENCEVERIFY（OP_CSV）是脚本层面的相对时间锁。它是在 [BIP 112](https://github.com/bitcoin/bips/blob/master/bip-0112.mediawiki) 中提出的，并与 nSequence 和 MTP 测量方法一同在 2016 年中段的软分叉中激活。

从功能上来说，OP_CSV 与 OP_CLTV 非常相似。它不是检查时间，是比较栈顶元素与输入的 `sequence_no` 字段。OP_CSV 解析栈顶元素的方法也与 nSequence 解析锁定时间的方法相同。它也会解析 nSequence 的禁用标签和类型标签，并从栈顶元素的后 16 位中读取 16 位的锁定时间描述。OP_CSV 会在下列情况下报错：

1. 栈是空的（没有指定目标时间）。
2. 栈顶的元素小于 0（负数的时间锁是没有意义的）。
3. 栈顶元素的禁用标签未设置且是下列情形的至少一种：
   - 交易的版本号小于 2（交易并未表示兼容 OP_CSV）
   - 输入的 `sequence_no` 设置了禁用标签（禁用了相对时间锁）
   - 输入的类型标签与栈顶元素的类型标签不同（使用了不同的度量）

OP_CSV 取代了 OP_NOP3；为了跟旧的客户端保持兼容，（跟 OP_CLTV）一样会留下未修改的栈顶元素。它可以读取栈顶元素，但并不能消耗它。所以它也一般要搭配 OP_DROP 使用。如果栈顶的元素设置了禁用标签，那 OP_CSV 的行动就跟 OP_NOP3 没有区别了。

就像我们前面讨论相对时间锁的时候说得，OP_CSV 是一个非常强大的工具，可以将多笔交易串联在一起。如果我们使用 OP_CLTV，整个交易链条将有一个绝对的解锁日期。OP_CSV 让你可以设置相对于第一笔广播交易的解锁时间。所以可以制作一个交易链条、存储无限笔交易，同时获得时间锁的保证。

交易，一旦确认，就无法被逆转，除非链重组。但通过 OP_CSV 相对时间锁实现的连锁交易，让我们可以通过创建脚本计算路径来提供相近的（撤销交易）功能，办法是创建相斥的路径。使用 OP_IF，我们可以创建多个使用同一个输出的交易（这个输出自身也可以来自一笔尚未确认的交易），并保证某些交易使用相对时间锁。这样一来，如果带锁的交易在锁定期内传播到了网络中，未锁定的版本就可以先上链并拿走这些钱。这就意味着我们可以给特定的交易设置优先级，并控制复杂智能合约的执行。闪电网络就利用了这个特性。

**OP_CSV 案例**

```java
# 交易的大部分结构都已省去，为便于阅读，使用十进制。
# 因为标签的存在，在序列号中使用十六进制。
    
# 在 input_1 的前序交易上链的 255 个区块后，任何人都可以花费这笔资金。
tx_1:
  lock_time: 0
  input_1:
    sequence_no: 0x000000FF
    script:
      0x000000FF OP_CHECKSEQUENCEVERIFY OP_DROP

# 只要下面两个条件都满足，这笔钱的任何人都可以花：
# a) input_1 所用的输出确认的 16,384 秒后
# b) input_2 所用的输出确认的 255 个区块后
tx_2:
  lock_time: 0
  input_1:
    sequence_no: 0x00400020
    script:
      0x00400020 OP_CHECKSEQUENCEVERIFY OP_DROP
  input_2:
    sequence_no: 0x000000FF
    script:
      0x000000FF OP_CHECKSEQUENCEVERIFY OP_DROP

# input_1 所用输出确认的 256 个区块后
# 注意，可以创建另外一笔交易来花费这些币
# 另一种使用路径至少要等区块高度 506321 后才行
# 这个脚本使用户可以自选使用相对时间锁还是绝对时间锁，哪个比较短就可以用哪个
tx_3:
  lock_time: 0
  input_1:
    sequence_no: 0x00000100
    scriptsig:
      OP_FALSE
    script:
      OP_IF
        506321 OP_CHECKLOCKTIMEVERIFY
      OP_ELSE
        0x00000100 OP_CHECKSEQUENCEVERIFY
      OP_ENDIF
      OP_DROP

# 这笔交易在 1/1/2020 前是无效的，
# 在前序输出确认后的 31457280 秒内也是无效的
# 它还用公钥指定了一个可以花费它的人
tx_4:
  lock_time: 1577836800
  input_1:
    sequence_no: 0x0004F000  # type flag is set
    scriptsig:
      <signature> <pubkey>
    script:
      1577836800 OP_CHECKLOCKTIMEVERIFY OP_DROP
      0x0004F000 OP_CHECKSEQUENCEVERIFY OP_DROP
      OP_DUP OP_HASH160 <pubkey hash> OP_EQUALVERIFY
      OP_CHECKSIGVERIFY

# 这笔交易是无效的，因为下面三种原因：
# 1) input_1 的脚本失败，因为其中的 16 位锁定时间大于 sequence_no 中指定的时间
# 2) input_2 的脚本失败因为 sequence_no 的类型标签未设置， 但栈中元素设置了类型标签
# 3) input_3 的脚本失败，因为最终栈中的元素不为空
tx_5:
  lock_time: 0
  input_1:
    sequence_no: 0x0004F000
    script:
      0x0004FFFF OP_CHECKSEQUENCEVERIFY OP_DROP
  input_2:
    sequence_no: 0x0000FFFF
    script:
      0x0004FFFF OP_CHECKSEQUENCEVERIFY OP_DROP
  input_3:
    sequence_no: 0x00000001
    script:
      0x00000001 OP_CHECKSEQUENCEVERIFYReview
```

比特币的时间锁是非常强大的工具，但容易让人误解。以下是重要事项的快速清单：

- 带 OP 的都属于脚本层
- “Locktime” 都表示绝对的时间锁
- “Sequence” 都表示相对时间锁
- 所有的时间锁都可以用区块和秒数来度量，只不过表示的方式不同
- 不要一不小心把东西锁上几个世纪
- 脚本层的时间锁需要在花费交易中使用同样类型的交易层锁

## 延伸阅读

- [BIP 65 — CLTV](https://github.com/bitcoin/bips/blob/master/bip-0065.mediawiki)
- [BIP 68 — nSequence locks](https://github.com/bitcoin/bips/blob/master/bip-0068.mediawiki)
- [BIP 112 — CSV](https://github.com/bitcoin/bips/blob/master/bip-0112.mediawiki)
- [BIP 113 — MTP measurement](https://github.com/bitcoin/bips/blob/master/bip-0113.mediawiki)
- [BIP 125 — RBF signalling](https://github.com/bitcoin/bips/blob/master/bip-0125.mediawiki)
- [Zcash’s primer on HTLCs](https://z.cash/blog/htlc-bip.html)
- [The Lightning Network Paper](https://lightning.network/lightning-network-paper.pdf)
- [Theymos on sequence_no in 2011](https://bitcoin.stackexchange.com/a/2032)
- [nullc on fee sniping](https://www.reddit.com/r/Bitcoin/comments/47upgx/nsequence_and_optin_replacebyfee_difference/d0g612x/?context=5)
- [mulllhausen on nLocktime vs CLTV](https://bitcoin.stackexchange.com/a/40784)
- [bitcoinwiki article on time locks](https://en.bitcoin.it/wiki/Timelock)
- [maaku7 on the CSV soft fork](https://www.reddit.com/r/Bitcoin/comments/4p4klg/bitcoin_core_project_the_csv_soft_fork_has/d4i7rwl/?context=999)
- [CLTV’s source](https://github.com/bitcoin/bitcoin/blob/v0.12.0/src/script/interpreter.cpp#L334-L374)
- [CSV’s source](https://github.com/bitcoin/bitcoin/blob/v0.13.0/src/script/interpreter.cpp#L376-L411)

（完）
