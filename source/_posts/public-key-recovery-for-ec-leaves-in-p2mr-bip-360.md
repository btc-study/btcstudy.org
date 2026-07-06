---
title: '用于 P2MR 椭圆曲线叶子的公钥复原'
author: 'starius'
date: '2026/07/06 18:43:18'
cover: ''
excerpt: '是从 P2MR 的椭圆曲线花费方法的见证脚本中移除包含了 EC 公钥的脚本'
tags:
- P2MR
---


> *作者：starius*
> 
> *来源：<https://delvingbitcoin.org/t/public-key-recovery-for-ec-leaves-in-p2mr-bip-360/2603>*

本文介绍了 [BIP-360](https://bips.dev/360/) 可以采用的一种优化措施：使用椭圆曲线（EC）的公钥复原技术。

基本的想法是，让一个 P2MR（支付到默克尔根）输出带有一个用起来比较便宜的椭圆曲线密码学叶子，和一个用起来比较昂贵的后量子密码学（PQ）叶子；EC 叶子用在日常花费中，PQ 叶子用在量子（计算机出现之后的）紧急转移中。这种优化措施只改变 EC 见证数据的体积。整个输出的量子弱点与一个普通的 P2MR EC 叶子保持不变：用到的 EC 公钥依然隐藏在 P2MR 哈希树后面，直到该 EC 花费路径被使用。

这种优化措施的目的，是从 P2MR 的椭圆曲线花费方法的见证脚本中移除包含了 EC 公钥的脚本。它被实现为一种特殊的 P2MR 叶子类型，这里叫做 “*可复原的 EC 叶子* ”，其中的 EC 公钥可以从签名中复原。在花费此种叶子时，其见证脚本的体积接近于 P2WPKH，甚至更短一些。 如无此种优化，则 P2MR 的椭圆曲线花费见证体积比 P2WPKH 大 25%（详见下文的体积比较）。

## 公钥复原与公钥前缀

普通的 Schnorr 签名支持从签名中复原公钥，但 [BIP-340](https://bips.dev/340/) 类型的验证一般来说不允许，因为有公钥前缀（key prefixing）。为了防止对 [BIP-32](https://bips.dev/32/) 未硬化公钥（unhardened keys）的 “相关密钥攻击（related-key attacks）”，BIP-340 将 EC 公钥放到了挑战值之中：

> **密钥前缀**
>
> 直接使用上述验证规则，会让 Schnorr 签名无法抵御 “相关密钥攻击”，也就是第三方可以将公钥 `P` 的一个签名 `(R, s)` 转化为公钥 `P + a⋅G` 的一个签名 `(R, s + a⋅hash(R || m))` （两个签名都针对同一条消息 `m`），对签名密钥应用任何加法调整项 `a` 都可以成功。当密钥是用 BIP32 的未硬化派生法生成、或用到了其它依赖于加法调整项的技术（比如 Taproot）时，签名就变得不安全。
> 
> 为了抵御这种攻击，我们选择了 *以公钥为前缀* 的 Schnorr 签名，即，在挑战哈希函数的输入中，公钥会用作消息的前缀。这将验证等式改变为 `s⋅G = R + hash(R || P || m)⋅P` 。可以证明，公钥前缀可以抵御使用加法调整项的相关密钥攻击。

但是，这就产生了一种循环依赖，使我们无法从签名中抽取公钥。

我的想法是，可以将 P2MR 的根 `q`（它本身承诺了用到的 EC 公钥）放在挑战值中，而不是将 EC 公钥本身放在里面。这就打破了循环依赖，并让 EC 公钥可以复原出来。

将签名挑战哈希值 `e = H(R || q || m)` 绑定到 P2MR 的根哈希值 `q`，依然将签名绑定到了一棵具体的 P2MR 树。这阻止了复用签名以及为一个相关的公钥 `P' = P + t⋅G` 微调签名，只要 `q' != q`，因为验证者在验证签名时会计算出不同的挑战哈希值 `e' = H(R || q' || m)` 。

然而，如果同一棵 P2MR 树承诺了多个可复原的 EC 叶子，只承诺 `q` 就不够。因为挑战值对这些 EC 公钥都一样，所以一个相关密钥签名可以从一个叶子转移给另一个叶子。解决办法是，同时承诺其花费路径用到确切序列化控制块（control block）。从而，一个签名既绑定了其 P2MR 输出，也绑定了这个叶子在树上的路径。

验证等式从 BIP 340 的：

```
s⋅G = R + H(R || P || m)⋅P
```

变成了：

```
s⋅G = R + H(R || q || control_block_hash || m)⋅P
```

从数学上来说，复原只是用 Schnorr 验证等式求解 `P` 。给定一个签名 `(R_x, s)`，将 `R_x`置为 Y 坐标值为偶数的点 `R`（如 BIP340 所定义的），计算挑战值 `e`，并要求 `e != 0` 。然后：

```
s⋅G = R + e⋅P
e⋅P = s⋅G - R
P = e^-1 ⋅ (s⋅G - R)
```

复原出来的 `P` ，仅在它是一个有效的 EC 公钥，且其压缩的 33 字节编码形式，使用同一个 `control_block` 可以重新计算出 `q`（P2MR 的默克尔根值），才是可以接受的。

这个 Schnorr 等式依然是线性的：

```
s⋅G = R + e⋅P
```

所以聚合型协议应该也是可以实现的，只不过 MuSig2/FROST 将需要改变协议的定义和证据。

不过，这无法再保留 BIP340 类型的批量验证。因为 BIP340 批量验证需要每一个 `P_i` 都是一个独立的公开输入，而我们已没有这样的公开输入了。保留验证验证的代价就是要在见证中揭晓 `P` 。

## 拟议的构造

在 BIP-360 中使用一个可复原的 EC 叶子。它是一种特殊的叶子版本，会从控制字节（control byte）表现出来。它不支持脚本，只有一种目的：利用 Schnorr 签名节约手续费。此处提议在 BIP-360 在激活之前就将本特性加入 BIP-360，因为，如果日后再加入，就需要另一个见证版本，而不是只需要另一个叶子版本：这种可复原的 EC 叶子会同时改变见证的解析和叶子哈希原像，所以旧的 BIP-360 将无法再普通的脚本叶子规则下验证它。

当前的 P2MR 验证程序会计算叶子哈希值、检查默克尔路径，然后再执行脚本：

```
k0 = TaggedHash("TapLeaf", v || compact_size(size of script) || script)
r  = MerkleRoot(k0, control_block_path)
要求 r == q
执行脚本
```

在一个可复原的 EC 叶子 中，没有包含其 EC 公钥的脚本。所以，这必然是 P2MR 验证逻辑的一个特例，放在移除附言（annex）之后、普通的“脚本中的第二个到最后一个见证元素”规则之前：

拟议的见证形式：

```
<signature> <control-block> [ <annex> ]
<签名> <控制块> [ <附言> ]
```

这个签名是 64 或 65 字节，使用跟 Taproot 一样的可选 sighash 字节。没有脚本组件。

其控制块是单个见证元素：

```
control_block = control_byte || 32-byte Merkle path element 0 || ...
```

对于深度为 `d` 的默克尔路径，其控制块长度为 `1 + 32×d` 。其控制字节为 `leaf_version | 0x01` ，遵循 BIP-360 规则。比如说，如果我们分配 了一个新的叶子版本 `0xc4` ，那么控制块就从 `0xc5` 开始。

如果输出是 P2MR 类型，并且控制字节选择了这种叶子版本，就应用可复原的 EC 叶子逻辑。对于这种叶子版本，其见证脚本必须符合上述形式。它不得应用普通的脚本叶子验证或未来版本的叶子验证。

验证程序：

```
const RECOVERABLE_EC_LEAF_VERSION = 0xc4   // 将可复原的 EC 叶子版本定义为常量

q = P2MR witness program, the 32-byte Merkle root   // 32 字节的默克尔根
v = control_block[0] & 0xfe 

require control_block[0] & 1 == 1
require v == RECOVERABLE_EC_LEAF_VERSION
require witness shape == <signature> <control-block> [ <annex> ]


hash_type = signature sighash byte, or SIGHASH_DEFAULT if absent   // sighash 看具体的字节，如缺失具体字节，则认为是 SIGHASH_DEFAULT
m = TapSighash(hash_type, ext_flag = 0)
control_block_hash = TaggedHash("P2MRRecoverable/control_block", control_block)

require R_x is a valid public nonce encoding   // 要求签名中的 R_x 是一个有效的 nonce 公开值编码
require s is a valid scalar   // 要求 s 是一个有效的标量
e = TaggedHash("P2MRRecoverable/challenge", R_x || q || control_block_hash || m) mod n
require e != 0   // 要求挑战值 e 不等于 0
P = recover_pubkey(R_x, s, e)   // 复原公钥
require recovery succeeds    // 要求复原成功
require P is a valid EC public key // 要求 P 是一个有效的 EC 公钥

leaf_hash = TapLeaf(v, bytes(P))
          = TaggedHash("TapLeaf", v || compact_size(33) || bytes(P))
r = MerkleRoot(leaf_hash, control_block_path)

require r == q // 要求重新计算出来的 r 等于 q
```

在这里，`bytes(P)` 是这个可复原的 EC 公钥的常规  33 字节的压缩公钥（compressed public key）编码形式。签名依然只存储 32 字节的 nonce 公开值 `R_x` 。

在签名之前，签名人需要知道控制块，并且必须检查其公钥以及这个控制块可以重新计算出 `q` 。

这里的 `m` 就是 [BIP-341](https://bips.dev/341/) 密钥路径花费中的交易摘要，虽然被花费的输出是 P2MR 类型。对于常见的 64 字节的 `SIGHASH_DEFAULT` 情形来说：

```
m = TaggedHash("TapSighash",
        0x00 || 0x00 ||
        tx.version || tx.locktime ||
        sha_prevouts || sha_amounts || sha_scriptpubkeys || sha_sequences ||
        sha_outputs ||
        spend_type || input_index ||
        [sha_annex if annex is present])

spend_type = 0x01 if annex is present, otherwise 0x00
```

其它 sighash 遵循 BIP341 规则：`SIGHASH_ANYONECANPAY`、`SIGHASH_NONE`、`SIGHASH_SINGLE`，等等。

在当前的 BIP341 sighash 中，`m` 也承诺了被花费的脚本公钥，所以它已经间接承诺了 `q` 。但是 `q` 依然要直接放到可复原的 EC 公钥的挑战值（`R_x || q || control_block_hash || m`）中，这样签名才能绑定到这个 P2MR 输出。把 `control_block_hash` 也放在里面，这样签名才能绑定树上这个选定的叶子的路径。

传入 `ext_flag = 0` ，所以 `m` 不包含 `tapleaf_hash`、`key_version` 和 `codeseparator_pos` 。如果 `m` 包含了 `tapleaf_hash`，那么 `m` 将依赖于 `P`，而后者在我们复原之前是未知的。

这意味着 P2MR 将有两种 sighash 风格：普通的脚本叶子使用常规的脚本路径交易摘要，而这种可复原的 EC 叶子则使用密钥路径风格的交易摘要（`ext_flag = 0`）。

Sigops（签名验证次数）需要显式统计：这种可复原的 EC 叶子的检查应该收取一个固定的验证成本，可以是算作一次（验证）签名操作。具体的公式尚未决定。

### Nonce 派生

重要的规则是，确定性的 nonce 输入必须涵盖可能改变挑战值的一切：`q`、`control_block` 和`m`。一个默认的 [BIP340 签名器](https://github.com/bitcoin/bips/blob/2ffcd9a4a1b834434f3c02718242235f9e270e94/bip-0340.mediawiki#user-content-Default_Signing)以及 secp256k1 Schnorr 签名器，如果不加变更就使用，在这里是不安全的。如果两个不同的控制块使用了相同的 nonce ，那么私钥就泄露。

可以转而使用以下 nonce 派生法：

```
aux = 32 bytes of auxiliary randomness, or 32 zero bytes
t = bytes(sk) xor TaggedHash("P2MRRecoverable/aux", aux)
nonce_input = t || bytes(P) || q || control_block_hash || m
k0 = TaggedHash("P2MRRecoverable/nonce", nonce_input) mod n
require k0 != 0
R = k0⋅G
k = k0 if R has even Y, otherwise n-k0
// 大意是用私钥与随机数的带标签哈希值作异或运算，然后与挑战值所承诺的部分前后拼接，再生成带标签的哈希值，作为 nonce 秘密值。只要挑战值不同，就会生成不同的 nonce 。
```

这里的 `P = sk⋅G` 就是由这个叶子承诺的压缩公钥。与 BIP340 签名不同，这个私钥不必为了让 `P` 有偶数 Y 坐标值而取负值，因为这里承诺的公钥是完整的压缩公钥。只有 nonce 公开值 `R` 要限定为具有偶数 Y 坐标值，如 BIP340 所定义的。

## 节约

这些数字是根据深度为 1 的 P2MR EC 叶子得出的，其中 EC 叶子有一个 32 字节的亲属。对于其目标用法，这就是现实的情形：一个便宜的 EC 叶子，加一个 PQ 叶子。

标准的 P2MR EC 叶子见证具有以下部分：

```
见证元素数目: 1 byte
签名元素:     1 + 64 = 65 bytes
叶子脚本元素:   1 + 34 = 35 bytes
控制块元素: 1 + 33 = 34 bytes
<p style="text-align:center">- --------------------------------------- -</p>

总计:                 135 bytes
```

这种可复原的 EC 叶子移除了叶子脚本元素，其长度是 35 字节：

```csharp
OP_PUSHBYTES_32 <32-byte public key> OP_CHECKSIG
```

所以它的见证变成了 100 字节。

相较之下：

- P2TR 密钥花费：66-67 字节
- P2WPKH：107-108 字节

从整个 创建-花费 周期来看，它并不比 P2WPKH 更便宜，因为 P2MR 的脚本公钥更大。但它让常用的 EC 花费的见证比 P2WPKH 更小，并且降低了使用 P2MR 的 EC 路径的成本。

## 致谢

感谢 Conduition 帮助我推理出这个提议，尤其是找出了 “树内相关密钥攻击” 以及修复措施：让签名挑战值承诺通过 `control_block_hash` 承诺控制块。

（完）