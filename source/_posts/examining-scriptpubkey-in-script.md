---
title: '限制条款：在比特币脚本中求出脚本公钥'
author: 'Rusty Russell'
date: '2023/10/25 11:22:38'
cover: ''
excerpt: '在脚本中求出一个 taproot 脚本公钥'
tags:
- covenant
---


> *作者：Rusty Russell*
> 
> *来源：<https://rusty.ozlabs.org/2023/10/20/examining-scriptpubkey-in-script.html>*



*限制条款（covenants）* 是一种允许内省的构造：交易的输出可以为花费它的交易设置条件（超越了具体的 “必须提供一个具体的公钥以及这个公钥的有效签名”。

我偏爱的实现内省的方式，是让 Bitcoin Script 拥有一种办法将花费交易的多个部分放入堆栈中（也即 `OP_TX`），以便于直接的测试（按照我的[分类学](https://rusty.ozlabs.org/2023/07/09/covenant-taxonomy.html)（[中文译本](https://www.btcstudy.org/2023/07/12/covenants-in-bitcoin-a-useful-review/)），可以定义为 “全方位的限制条款”，与 “等式限制条款” —— 使用一些交易哈希值、要求脚本在产生一个相匹配的哈希值时才能通过 —— 相对）。在全方位限制条款中，你可以这样做：

```
# 检查 nLocktime 是否 大于 100
OP_TX_BIT_NLOCKTIME OP_TX 100 OP_GREATERTHAN OP_VERIFY
```

而在等式限制条款中，你需要这样做：

```
# 为堆栈提供 nLocktime 的数值
OP_DUP
# 先检查这个数值是否大于 100
100 OP_GREATERTHAN OP_VERIFY
# 现在，检查这个被检查的数值真的就是所要求的数值，通过比较一个哈希值与 nLocktime 数值的哈希值
OP_SHA256
OP_TX_BIT_NLOCKTIME OP_TXHASH OP_EQUALVERIFY
```

但是，当我们要检查一个输出的脚本公钥时，我们不得不采取后面这种模式（等式限制条款），除非我们要的是一个精确的一直：脚本公钥（几乎总是）实际上的花费条件的单向函数。

## 在脚本中，制作一个简单的 Taproot 脚本公钥

我们举一个简单 taproot 的例子。你想要断言一个脚本公钥支付给了一个已知的公钥 `K`，以及一个由限制条款花费者给出的一个脚本。这是 Taproot 的最简单的有趣形式 —— 只有一个脚本路径。

（根据 [BIP 341](https://github.com/bitcoin/bips/blob/master/bip-0341.mediawiki)）将这些条件转变一个脚本公钥需要采取以下步骤：

1. 获得这个脚本的一个带标签的 tapleaf 哈希值
2. 使用这个哈希值来调整公钥 `K`
3. 加上两个字节的前缀 “0x51 0x20”
4. 与这笔交易的脚本公钥相比较

### 步骤 1：我们需要 OP_CAT，或者 OP_MULTISHA256

如果我们列出需要哈希的内容，看起来会是这样的：

```
SHA256(SHA256("TapLeaf") + SHA256("TapLeaf") + 0xC0 + CSCRIPTNUM(LEN(脚本)) + 脚本)
```

`CSCRIPTNUM(X)` 的值是（若要让 `X` 具备规范形式，`X` 应该来自 OP_SIZE）：

- 如果 `X` 小于 253：
  - `X`
- 否则，如果 `X` 的长度小于 256：
  - 0xFD 0x00 `X`
- 否则，如果 `X` 的长度小于 65536：
  - 0xFD `X`
- 否则，不论什么原因，请写一个更短的脚本！

最显然的实现上述运算的方法是启用 `OP_CAT`，但这个操作码已经被移除了，因为它允许构造巨大的堆栈变量。如果这是一个问题的话，我们可以转而使用一种 “拼接并哈希” 函数 `OP_MULTISHA256`，可以证明这个函数更易于使用，如果我们要哈希堆栈上自顶到底的所有元素的话。

`OP_MULTISHA256` 定义：

1. 如果堆栈为空，传出错误。
2. 从堆栈中弹出 `N` 。
3. 如果 `N` 不是一个 CScriptNumb，传出错误。
4. 如果堆栈中的元素少于 `N` 个，传出错误。
5. 初始化一个 SHA256 语境（context）。
6. 如果 `N` > 0：
   1. 弹出堆栈顶部的元素。
   2. 将该元素哈希到 SHA256 的语境中
   3. `N` 递减 1
7. 结束 SHA256 语境，将结果的 32 字节推入堆栈：

最终成果是这样的：

```
# 目标脚本已经在堆栈中，需要产生它的带标签的 tapleaf 哈希值

# 首先，编码长度
OP_SIZE
OP_DUP
# 是否小于 253？
OP_PUSHDATA1 1 253 OP_LESSTHAN 
OP_IF
	# 堆栈中的空字节：
	0
OP_ELSE
	OP_DUP
	# 是否大于 255？
	OP_PUSHDATA1 1 0xFF OP_GREATERTHAN 
	OP_IF
		OP_PUSHDATA1 1 0xFD
	OP_ELSE
		# 需要补充字节
		OP_PUSHDATA1 2 0xFD 0x00
	OP_ENDIF
OP_ENDIF

# 将叶子版本号 0xC0 推入堆栈
OP_PUSHDATA1 1 0xC0

# 将哈希标签推入堆栈，需要做两次
OP_PUSHDATA1 7 "TapLeaf"
OP_SHA256
OP_DUP

# 现在，将它们一起哈希
6 OP_MULTISHA256
```

或者，如果我们使用 `OP_CAT` 的话（假设它可以将堆栈顶部的元素跟第二个元素拼接起来）：

```
# 目标脚本已经在堆栈中，需要产生它的带标签的 tapleaf 哈希值

# 首先，编码长度
OP_SIZE
OP_DUP
#是否小于 253？
OP_PUSHDATA1 1 253 OP_LESSTHAN 
OP_NOTIF
	OP_DUP
	# 是否大于 255？
	OP_PUSHDATA1 1 0xFF OP_GREATERTHAN 
	OP_IF
		OP_PUSHDATA1 1 0xFD
	OP_ELSE
		# 需要补充字节
		OP_PUSHDATA1 2 0xFD 0x00
	OP_ENDIF
	OP_CAT
OP_ENDIF
# 给脚本加入长度作为前缀
OP_CAT

# 将叶子版本号 0xC0 作为前缀
OP_PUSHDATA1 1 0xC0
OP_CAT

# 将哈希标签推入堆栈，两次，并作为前缀
OP_PUSHDATA1 7 "TapLeaf"
OP_SHA256
OP_DUP
OP_CAT
OP_CAT

# 哈希一切
OP_SHA256
```

### 步骤 2：我们需要调整一个公钥，OP_KEYADDTWEAK

现在，我们需要调整一个根据，根据 [BIP 341](https://github.com/bitcoin/bips/blob/master/bip-0341.mediawiki) 的细节：

```
def taproot_tweak_pubkey(pubkey, h):
    t = int_from_bytes(tagged_hash("TapTweak", pubkey + h))
    if t >= SECP256K1_ORDER:
        raise ValueError
    P = lift_x(int_from_bytes(pubkey))
    if P is None:
        raise ValueError
    Q = point_add(P, point_mul(G, t))
    return 0 if has_even_y(Q) else 1, bytes_from_int(x(Q))
```

假设有一个操作码 `OP_KEYADDTWEAK`，是这样工作的：

1. 如果堆栈中的元素少于 2 个，传出错误。
2. 将调整因子 `t` 弹出堆栈。如果 `t >= SECP256K1_ORDER `，传出错误。
3. 见公钥 `P` 弹出堆栈。如果它不是一个有效的压缩公钥，传出错误。如有必要，转化成 Y 值为偶数的形式（即 `lift_x()`）。
4. `Q = P + t*G`
5. 将 Q 的 X 坐标值推入堆栈。

那么我们就只需创建带标签的哈希值，然后将它喂入 `OP_KEYADDTWEAK`：

```
# 公钥、tapscript 哈希值已经在堆栈中

OP_OVER
OP_PUSHDATA1 8 "TapTweak"
OP_SHA256
OP_DUP

# 堆栈中现在是：公钥、tapscript、公钥、H(TapTweak)、H(TapTweak)
4 OP_MULTISHA256
OP_KEYADDTWEAK
```

或者，如果使用 `OP_CAT` 而不是 `OP_MULTISHA256` 的话：

```
# 公钥、tapscript 哈希值已经在堆栈中

OP_OVER
OP_PUSHDATA1 8 "TapTweak"
OP_SHA256
OP_DUP

# 堆栈中现在是：公钥、tapscript、公钥、H(TapTweak)、H(TapTweak)
OP_CAT
OP_CAT
OP_CAT
OP_SHA256
OP_KEYADDTWEAK
```

### 步骤 3 ：我们需要加入 Taproot 字节前缀

如果有 `OP_CAT`，那就简单了：

```
# 脚本公钥、Taproot 公钥已经在堆栈中

# Prepend "OP_1 32" to make Taproot v1 ScriptPubkey
OP_PUSHDATA1 2 0x51 0x20
OP_CAT
OP_EQUALVERIFY
```

如果使用 `OP_MULTISHA256`，我们需要哈希脚本公钥，以检查它（或者，如果我们只有 `OP_TXHASH` 的话，那它已经哈希过了）：

```
# 脚本公钥、Taproot 公钥已经在堆栈中

OP_SHA256
# 加入 “OP_1 32” 作为前缀，使之成为一个 Taproot v1 脚本公钥
OP_PUSHDATA1 2 0x51 0x20
2 OP_MULTISHA256

# 检查 SHA256(ScriptPubkey) == SHA256(0x51 0x20 taproot)
OP_EQUALVERIFY
```

## 在脚本中实现一个更完整的 Taproot

上一节中的技巧已经覆盖了 “一个公钥、一个脚本” 的情形。

如果我们需要使用超过一个 taproot 叶子的 taproot 脚本公钥，我们需要对这些叶子执行默克尔运算，而不能直接使用 taproot 叶子。为了简化，假设我们需要放置两个脚本：

1. 产生脚本的带标签叶子哈希值，分别称为 `H1` 和 `H2`
2. 如果 `H1` < `H2`，那么默克尔值是 `TaggedHash("TapBranch", H1 + H2)`，否则为 `TaggedHash("TapBranch", H2 + H1)`

### 步骤 1：带标签的哈希值

这在上一节中已经做到了。

### 步骤 2：对比然后哈希：我们需要 OP_LESS 或者 OP_CONDSWAP

不幸的是，除了 `OP_EQUAL`，所有的算术函数都只接收 CScriptNum 对象，所以我们需要一种新的操作码来比较 32 字节的数据。最简单的是 `OP_LESS`，不过 `OP_CONDSWAP`（将更小的数值放在栈顶）也够用了。在这里我们并不在乎数据不等长的时候要怎么做，但如果我们假设更有可能使用大端数值（big-endian values），我们可以在比较之前为较短的数值填充 “0” 前缀。

结果是这样的：

```
# Hash1、Hash2 已在堆栈中

# 将更小的哈希值换到栈顶
OP_LESS
OP_NOTIF OP_SWAP OP_ENDIF

OP_PUSHDATA1 9 "TapBranch"
OP_SHA256
OP_DUP

4 OP_MULTISHA256
```

或者，使用 `OP_CAT` 和 `OP_CONDSWAP`：

```
# Hash1、Hash2 已在堆栈中

# 将更小的哈希值换到栈顶
OP_CONDSWAP

OP_PUSHDATA1 9 "TapBranch"
OP_SHA256
OP_DUP

OP_CAT
OP_CAT
OP_CAT
OP_SHA256
```

现在，我们已经可以在比特币脚本中制作任意复杂的默克尔树了！

## 制作更有用的模板：削弱 OP_SUCCESS 的威力

如果我们只是想要一个类似于 “…… OR anything you want” 的条件的话，那么允许限制条款花费者指定自身的一个脚本分支就够了。但是这并不总是能奏效：考虑保险柜合约，我们希望任何花费行为都强制执行一个时延；这时候我们需要的是 “…… AND anything you want ”。

当然，我们可以让送进去的脚本以 `1000 OP_CHECKSEQUENCEVERIFY` 开头。但是，因为任何位置的操作码都会导致脚本立即通过（而不是实际执行它们），他们只需在剩余的脚本中插入一个无效的操作码，就可以覆盖掉这个检查。

我认为，有两种办法可以解决这个问题：一个是委托，就是让剩余的脚本弹出堆栈（`OP_POPSCRIPT`？）。你只需坚决要求所提供的脚本正是 `1000 OP_CHECKSEQUENCEVERIFY OP_POPSCRIPT`。

另一种办法是削弱 `OP_SUCCESSx` 操作码。这必须谨慎！具体来说，我们可以使用一种分隔符，例如 `OP_SEPARATOR`，从而改变 `OP_SUCCESSx` 的语义：

- 如果在 `OP_SUCCESSx` 之前有一个 `OP_SEPARATOR`：
  - 考虑 `OP_SEPARATOR` 前面的部分：
    - 如果（`OP_IF` 的次数）+（`OP_NOTIF` 的次数）> （`OP_ENDIF` 的次数）：传出错误
    - 否则，按照脚本原来的样子执行：该出错，就出错。
- 让脚本通过

这将一个前缀跟 `OP_SUCCESSx` 隔离开来，但必须小心，因为它是一个完整的脚本片段：未来的 `OP_SUCCESSx` 定义不能让一个无效脚本变成一个有效脚本（通过展示一个 `OP_ENDIF` 将让脚本变得有效）。

## 总结

我尝试列举了在 Script 中实现通用的限制条款需要什么元件：假设有某种方式（例如 `OP_TXHASH` 可以访问一个输出的脚本），这样的通用限制条款可以有意义底检查花费条件。有（完整性考虑以外的）理由认为这是可欲的：特定的保险柜构造需要这个。

我们需要 3 种新的脚本操作码：我的提议是 `OP_MULTISHA256`、`OP_KEYADDTWEAK` 和 `OP_LESS`，以及对 `OP_SUCCESSx` 的处理的一个（软分叉）修订。这些新操作码都不算非常复杂。

最终的脚本非常长（而且我的脚本是没有经过测试的，所以肯定有很多 bug）。需要 41 字节来哈希一个 tapleaf，19 个字节来拼接两个 tapleaf，8 个字节来对比它们并产生最终的脚本公钥。至少需要 109 单位的见证重量，才能制作一个保险柜，而且你还得提供你想要在输出中使用的脚本。这似乎非常昂贵，但并非毫无道理：如果这种应用变得普遍，可以使用新的操作码将这些步骤合并起来。

我没有认真考虑关于这些操作码的普遍适用性，所以在别的用途中，可能会有更好的变体。

感谢阅读！

（完）