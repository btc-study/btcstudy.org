---
title: 'CSFS 密钥串联及其在 LN-Symmetry 中的应用'
author: 'Jeremy Rubin'
date: '2025/07/28 15:41:36'
cover: ''
excerpt: ''
tags:
- CSFS
---


> *作者：Jeremy Rubin*
>
> *来源：<https://rubin.io/bitcoin/2024/12/02/csfs-ctv-rekey-symmetry/>*
>
> *本文与 [Rearden](https://twitter.com/reardencode) 联名发表。*
>
> 原文发表于 2024 年 12 月。



在今年的 Bitcoin++ 奥斯丁会议上，Rearden 展示了使用多种比特币升级提议来实现的 Lightning Symmetry 的多种方法。所有的方法都要么需要为每一次通道更新多执行一轮签名交易，要么需要强迫结算交易的哈希值暴露在对应的更新交易中。可以总结为：要求为给定的一条通道授权的签名即是可以重新绑定的（rebindable，即不会承诺具体的前序 UTXO），又承诺了一些额外的可见数据，以使该签名有效。

（译者注：“LN-Symmetry” 即 “对称式闪电通道”。当前正在服役的构造被称为 “LN-Penalty”，基于惩罚使得通道不敢提交旧状态到区块链上，而对应于每一个通道状态，双方所持有的承诺交易都是不对称的。LN-Symmetry 则希望让双方的承诺交易是完全对称的。LN-Symmetry 的思想是使用两笔交易来结算一条通道：更新交易及与之匹配的结算交易；当较旧的更新交易总是可以被较新的更新交易花费，则双方只需保存最新的一对更新交易和结算交易即可保证通道正确结算。）

我们将从探究为什么 LN-Symmetry 需要这种数据可见性开始，然后深入以往已知解决方案的细节，并展示一种新的通用技术，在两个乃至更多变种中使用 CSFS 。最后，我们基于已经推导出的原理，提出一种最优的解决方案，让 LN-Symmetry 使用额外的一个签名，但不需要额外的交互轮次，而且不需要字符串拼接（concatenation）和其它显式的多重承诺（multi-commitments）。

## 不常用的定义

- `APO`：[BIP118](https://github.com/bitcoin/bips/blob/master/bip-0118.mediawiki) 所定义的 `SIGHASH_ANYPREVOUT`
- `IKEY`：[BIP349](https://github.com/bitcoin/bips/blob/master/bip-0349.md) 所定义的 `OP_INTERNALKEY`
- `CSFS`：[BIP348](https://github.com/bitcoin/bips/pull/1535) 所定义的 `OP_CHECKSIGFROMSTACK`
- `S`：[比特币协议自身定义的](https://github.com/bitcoin/bitcoin/blob/master/src/script/script.h#L47)时间锁门槛 `500,000,000`

## 粗糙的 CTV-CSFS LN-Symmetry 交易

一个粗糙的 Taproot LN-Symmetry 通道的脚本是这样的：

```
通道:
tr(musig(keyA, keyB), raw(CTV IKEY CSFS VERIFY <S+1> CLTV))
update(n):
tr(musig(keyA, keyB), raw(DEPTH NOTIF <settlement-n-hash> CTV ELSE CTV IKEY CSFS VERIFY <S+n+1> CLTV ENDIF))
update-stack:
<update-n-sig> <update-n-hash>
```

（译者注：`update-stack` 中的见证数据让通道参与者可以花费通道输出，将对应于通道的第 n 个状态的更新交易发布到链上；这样的更新交易的输出的脚本则如 `update(n)` 部分所示：它有两个脚本花费条件，由 `DEPTH NOTIF` 来控制；`DEPTH` 的功能是获得栈中元素的数量；如果堆栈中没有任何元素，则激活 `<settlement-n-hash> CTV` 花费条件；如果堆栈中有元素，则激活 `CTV IKEY CSFS VERIFY <S+n+1> CLTV` 花费条件。可以看出，`update-stack` 中的见证数据也能用来通过后面这个花费条件。）

如果一条通道遭遇强制关闭情形，A 将一个更新（交易）输出点发布到链上，那么 B 将因为 `settlement-n-hash`（结算交易哈希值）中编码的 CSV 时延（无法立即结算）而拥有一个时间窗口，可以发布更新的状态。

LN-Symmetry 的其中一个规划目标是消除通道参与者为每一条通道存储 `O(n)` 个状态的需要，但现在我们又遇到了这个问题。因为更新交易的输出的赎回脚本在链上是不可见的，即使 B 能找出更新的状态，如果没有 `settlement-n-hash`，就无法重新构造出脚本（如果无法重新构造出脚本，也就无法花费它）；除非 B 为每一个状态存储 `settlement-n-hash`，否则将只有 A 知道这个哈希值。

## APO-annex 解决方案

在 @instagibb 的 [Lightning Symmetry 研究工作](https://delvingbitcoin.org/t/ln-symmetry-project-recap/359)中，他使用了 APO 和 Taproot Annex（附言），参与通道的双方在签名更新交易时，都会让签名承诺一个附言，附言中包含了重新构造更新交易花费脚本所需的结算交易哈希值。

其脚本（大概）是这样的：

```
channel:
tr(musig(keyA, keyB), raw(<1> CHECKSIGVERIFY <S+1> CLTV))
update(n):
tr(musig(keyA, keyB), raw(DEPTH NOTIF <sig> <01||G> CHECKSIG ELSE <1> CHECKSIGVERIFY <S+n+1> CLTV ENDIF))
update-stack:
<update-n-sig>
```

这里我们看到了使用 APO 作为限制条款的用法：使用私钥 `1` 和公钥 `G` 来预先计算一个签名。因为 `CHECKSIG` 操作承诺了 Taproot 附言，这些脚本就不需要通道参与者的特殊处理，只需要将结算交易哈希值放在附言里就可以了，因此，任何一方都可以在日后重新构造出任何旧更新交易的花费脚本。没有附言，基于 APO 的实现将要么回到需要额外的签名轮次，要么使用 `OP_RETURN` 来曝光这些数据。

## 粗糙 CTV-CSFS 通道的解决方案

我们能只使用一个额外的签名来承诺一个额外的哈希值吗？

```
channel:
tr(musig(keyA, keyB), raw(CTV IKEY CSFS VERIFY IKEY CSFS VERIFY <S+1> CLTV))
update(n):
tr(musig(keyA, keyB), raw(DEPTH NOTIF <settlement-n-hash> CTV ELSE CTV IKEY CSFS VERIFY IKEY CSFS VERIFY <S+n+1> CLTV ENDIF))
update-stack:
<settlement-n-sig> <settlement-n-hash> <update-n-sig> <update-n-hash>
```

这种方法是行不通的，因为这两个签名没有任何关联。恶意的通道参与者可以放置不匹配的结算交易哈希值和更新交易到链上，从而阻止拥有有效更新的对手重新构造出脚本并更新通道状态。

一个显然的解决方案是组合更新交易哈希值和解锁交易哈希值，但因为比特币没有字符串拼接操作符，所以做不到。最近，出于这个目的，[@4moonsettler](https://x.com/4moonsettler) 提出了 `OP_PAIRCOMMIT` 作为替代方案。

## CTV-CSFS 委托解决方案

现在来看看我们得出的新的解决方案：将更新交易和结算交易的哈希值通过签名它们的密钥捆绑在一起。 众所周知，CSFS 在委托上十分有用，所以我们最初委托给一个 rekay：

```
script(n):
    DUP TOALT DUP TOALT
    IKEY CSFS VERIFY
    OP_SIZE <32> EQUALVERIFY CTV
    2DUP EQUAL NOT VERIFY
    ROT SWAP FROMALT CSFS VERIFY
    FROMALT CSFS VERIFY <S+n+1> CLTV
channel:
    tr(musig(keyA, keyB), raw(<script(0)>))
update(n):
    tr(musig(keyA, keyB),
        raw(DEPTH NOTIF <settlement-n-hash> CTV ELSE <script(n)> ENDIF))
stack(n):
    <settlement-n-sig>
    <update-n-sig>
    <settlement-extradata>
    <update-n-ctv>
    <rekey-sig>
    <rekey>
```

这里的 `rekey` 是一个临时密钥，可以是随机生成的，也可以基于通道密钥和 BIP32 这样的技术、为每一个状态派生出一个。重要的是，`rekey` 只用来签名对应于一个状态的更新交易和结算交易哈希值的两条消息。这样一来，它们就只有在一起才是有效的，通道参与者必定能够获得正确的结算交易哈希值来重新构造交易和刷新通道的结算过程。

这个解决方案的一个怪癖是，如果两个被签名的东西可以相等，那么恶意的参与者就可以直接放置两个相同的更新交易哈希值以及对它的签名在堆栈中，所以，必须用脚本来检查这两个东西不相等。

因为对参数 `update-n-ctv` 有个长度检查，所以这个方案是安全的：它可以保证其它 `<settlement-extradata>` 要么不是一个有效的 CTV 哈希值，要么长度不为 32 。

## CSFS 密钥阶梯

“密钥阶梯（Key Laddering）” 延申了上述 rekey 方法，允许递归地对任意数量的变量重新安排密钥。这让 CSFS 无需 OP_CAT 就可以签名要插入一个脚本的变量的集合。

比如说，要签名 5 个变量（并不是最优的，只是为了清晰）：

```
数据签名: <sd1> <d1> <sd2> <d2> <sd3> <d3> <sd4> <d4> <sd5> <d5>
堆栈: 数据签名 + <k5> <s5> <k4> <s4> <k3> <s3> <k2> <s2> <k1> <s1>

程序:

\\ 首先，检查 k1 得到了 IKEY 的签名
    OVER IKEY CSFSV
    DUP TOALT

// 然后，检查 k_i 签名了 k_{i+1}
    // 堆栈: DATASIGS + <k5> <s5> <k4> <s4> <k3> <s3> <k2> <s2> <k1>
    // 异堆栈（altstack）: <k1>

        3DUP ROT SWAP CSFSV 2DROP DUP TOALT

    // 堆栈k: DATASIGS + <k5> <s5> <k4> <s4> <k3> <s3> <k2>
    // 异堆栈: <k1> <k2>

        3DUP ROT SWAP CSFSV 2DROP DUP TOALT

    // 堆栈: DATASIGS + <k5> <s5> <k4> <s4> <k3>
    // 异堆栈: <k1> <k2> <k3>

        3DUP ROT SWAP CSFSV 2DROP DUP TOALT

    // 堆栈: DATASIGS + <k5> <s5> <k4>
    // 异堆栈: <k1> <k2> <k3> <k4>

        3DUP ROT SWAP CSFSV 2DROP

    // 堆栈: <sd1> <d1> <sd2> <d2> <sd3> <d3> <sd4> <d4> <sd5> <d5> <k5>
    // 异堆栈: <k1> <k2> <k3> <k4>


        FROMALT FROMALT FROMALT FROMALT

    // 堆栈: <sd1> <d1> <sd2> <d2> <sd3> <d3> <sd4> <d4> <sd5> <d5> <k5> <k4> <k3> <k2> <k1>
    // 异堆栈:

// 现在，检查对每一个变量的签名

    <6> PICK // sd5
    <6> PICK // d5
    <6> PICK // k5
    CSFSV

    <8> PICK // sd4
    <8> PICK // d4
    <5> PICK // k4
    CSFSV

    <10> PICK // sd3
    <10> PICK // d3
    <4> PICK // k3
    CSFSV

    <12> PICK // sd2
    <12> PICK // d2
    <3> PICK // k2
    CSFSV

    <14> PICK // sd1
    <14> PICK // d1
    <2> PICK // k1
    CSFSV

// 现在，检查不相等，以证明没有哪个公钥被用作了数据:
    // 堆栈: <sd1> <d1> <sd2> <d2> <sd3> <d3> <sd4> <d4> <sd5> <d5> <k5> <k4> <k3> <k2> <k1>
    // 异堆栈:

    // 不需要检查 k1 != d0，因为没有 d0

    // 检查 k2 != d1
    <1> PICK
    <14> PICK
    NOT EQUAL VERIFY

    // 检查 k3 != d2
    <2> PICK
    <12> PICK
    NOT EQUAL VERIFY


    // 检查 k4 != d3
    <3> PICK
    <8> PICK
    NOT EQUAL VERIFY

    // 检查 k5 != d4
    <4> PICK
    <6> PICK
    NOT EQUAL VERIFY


// 堆栈: <sd1> <d1> <sd2> <d2> <sd3> <d3> <sd4> <d4> <sd5> <d5> <k5> <k4> <k3> <k2> <k1>
// 异堆栈:

2DROP 2DROP DROP
TOALT DROP
TOALT DROP
TOALT DROP
TOALT DROP
TOALT DROP

// 堆栈:
// 异堆栈: <d5> <d4> <d3> <d2> <d1>

// 接下来，就随你做什么了
```

这种方法让你可以按顺序签名任意数量的变量。

一个上述脚本没有显示出来的 “问题” 是，需要保证在每一步中，对数据的签名和对公钥的签名没有掉包。需要细致地保证这一点。

一种替代方法是 “签名阶梯”，也就是签名下一个签名，而不是签名下一个步骤中的公钥。

例如，通过 IKEY 来签名第一个签名。然后用这个签名来验证任意 公钥/消息 对。这个公钥又可以用在另一个签名中，而被签名的消息就是下一个签名。例如：

```
堆栈:
<sig B>
<key A>
<sig^IKEY(sig A)>
<sig^A(sig B)>

DUP TOALT
IKEY CSFS VERIFY
FROMALT

堆栈:
<sig B>
<key A>
<sig^A(sig B)>

ROT ROT CSFS VERIFY
```

阶梯法是很方便的，因为第一个 IKEY 签名承诺了所有其它的数据的角色（密钥 vs. 签名 vs. 参数）。

## CTV-CSFS 与派生内部公钥解决方案

对 LN-Symmetry 来说，得到签名的每一笔更新交易都带有一个具体的、单调递增的锁定时间（locktime），而且并不要求每一次更新的内部公钥（internal key）都保持不变，所以，我们可以用一个从通道公钥和锁定时间中确定性地派生出来的公钥、来替代内部密钥，然后几乎就可以使用粗糙的 CTV-CSFS 脚本：

```
internalkey(n):
bip32_derive(musig(keyA, keyB), /<S+n+1>)
script(n):
CTV 2DUP EQUAL NOT VERIFY ROT SWAP IKEY CSFS VERIFY IKEY CSFS VERIFY <S+n+1> CLTV
channel:
tr(musig(keyA, keyB), raw(<script(0)>))
update:
tr(internalkey(n), raw(DEPTH NOTIF <settlement-n-hash> CTV ELSE <script(n)> ENDIF))
update-stack:
<settlement-n-sig> <update-n-sig> <settlement-n-hash> <update-n-hash>
```

通道的任何一方都可以从更新交易自身的锁定时间中派生出重新构造花费脚本所需的正确内部公钥。这些派生出来的内部公钥只用于签名一对更新交易和结算交易哈希值，而脚本能检查两个签名是不一样的。

## 结论

这些技术消除了启用 LN-Symmetry 的比特币升级提议包含特定的函数以使用一个签名承诺多个对象的需要。当然，如果一种更高效的组合多个数据为一个承诺的技术可用，那么闪电网络的开发者将能利用它、减少 LN-Symmetry 所需的见证数据大小。

（完）