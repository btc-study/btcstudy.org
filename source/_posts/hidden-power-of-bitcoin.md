---
title: 'Miniscript 和描述符：比特币的隐藏力量'
author: 'Sandipan Dey'
date: '2022/06/26 13:37:44'
cover: ''
excerpt: '比特币可以打开一个新世界，不仅仅是转账而已'
categories:
- 比特币主网
tags:
- 描述符
- Miniscript
- 开发
---


> *作者：Sandipan Dey & Rajarshi Maitra*
> 
> *来源：<https://bitcoindevkit.org/blog/hidden-power-of-bitcoin/>*



要给某人发送比特币，我们只需扫描一个二维码（*或者粘贴一个地址*）、输入地址，然后就 “呦吼”，发送成功了！用户可能会认为，就像传统的货币一样，我们只能用比特币来相互转账。碰巧的是，比特币的底层技术给输出指定的不是一个地址，而是一个可编程的脚本。因此，比特币可以打开一个新世界，不仅仅是转账而已。

## Script

比特币支持 [Script](https://en.bitcoin.it/wiki/Script)（直译为 “脚本”），一种**基于堆栈**的轻量级编程语言。任何使用 Script 编写的脚本都包含有 ` OP_* ` 代码和比特币全节点可以理解和处理的原始字节数组。当前，有  ` 117 ` 个 OP 代码（操作码）可用。你可以在[这个页面](https://en.bitcoin.it/wiki/Script)了解这些操作码。

Script 是故意不实现[图灵完备](https://en.wikipedia.org/wiki/Turing_completeness)的，因此用它编写的脚本不会有 “[停机问题](https://en.wikipedia.org/wiki/Halting_problem)”。它没有循环语句，而且整体上它是非常局限的编程语言。

当且仅当 Script 在执行结束时返回  ` true ` 时，一笔交易会被全节点认为是有效的交易。交易输出的脚本（也就是 “脚本公钥（scriptpubkey）”）定义了该输出中的资金可以被花费的条件。要花费某一笔资金（某一个交易输出），你要找出一个输入脚本（也就是 “脚本签名（scriptsig）”）使得  ` scriptsig + scriptpubkey ` 串联而成的脚本在执行后能返回 ` true ` 。

举个例子，一笔基础的、传统的 ` Pay-to-Pubkey-Hash（支付给公钥哈希值） ` 交易看起来就像这样：

```Script
scriptPubKey: OP_DUP OP_HASH160 <pubKeyHash> OP_EQUALVERIFY OP_CHECKSIG 
scriptSig: <sig> <pubKey>
```

使用比特币 Script 能够实现的案例：

1. 支付给某人（p2pkh/p2wpkh）：必须有某个公钥的签名才能花费这笔资金。
2. 第三方保管（2-of-3 多签名）：需要两方一起签名才能花费这笔资金。
3. 金库（锁定的）：某一个公钥需要在某个时间点之后才能花费这笔资金；但另一个主公钥随时可以花费这笔资金。
4. 哈希时间锁合约（HTLC）：接收者必须在某个时间点以前揭晓一个秘密值，不然这些币会被转回给支付者。

### **使用复杂花费条件（policies）的动机**

不幸的是，因为它基于堆栈的罕见特性和底层特点，Script 是非常难分析和使用的。虽然它从比特币诞生之时就存在，编写和理解 Script 从来不是一件简单的事。这也是为什么上面的案例脚本会这么长，一眼看上去会觉得毫无意义。在编写脚本时，我们会很想知道我们编写的逻辑是否**正确**、**最优**以及**在体积上有效率**（使用更少的[重量](https://en.bitcoin.it/wiki/Weight_units)）。

整个社区都希望有一种简单的替代方法，不必直接使用 Script 但能创建处最优的 Script 代码。这就要讲到 **Miniscript** 了。

## Miniscript

[Miniscript](http://bitcoin.sipa.be/miniscript/) 正面解决了上述问题。它是一种以结构化和简单的方式创建比特币 Script 花费条件的表示方法。使用 Miniscript，你很难出错。

Miniscript 的另一个非常重要的目标是将一个花费条件中的任何公钥替换成另一个花费条件。这很重要，因为人们在现有的花费条件中可能安排了多个公钥和复杂的时间锁。他们虽然签名了新的花费条件，但可能希望使用现有的条件为新的条件生成地址。这是使用叫做 “**输出描述符**（output descriptors）” 的技术来实现的，我们下一章会讲到。

Miniscript 编译器将一个花费条件编译成 Miniscript 代码。它不包含任何签名，主要是一个用于设计花费条件的组合器语言。你可以使用[这个链接](http://bitcoin.sipa.be/miniscript/#:~:text=Policy%20to%20Miniscript%20compiler)尝试在线编译器。

### 代码碎片

这里有一些代码碎片，这些碎片可以组合起来创建强大的表达式。

1.  ` pk(key) ` —— 指定某一个公钥
2.  ` thresh(k, expr_1, expr_2, ..., expr_n) ` —— 使用表达式指定 k of n 的多签名
3. `older(T)` —— T 个区块的时间锁
4. `and(expr_1, expr_2)` —— 两个表达式都必须返回 True 才能花费
5. `or(expr_1, expr_2)` —— 任何一个表达式返回 True 就足以花费
6. `aor(expr_1, expr_2)` —— 类似于 `or` ，但 `expr_1` 有更高的概率返回 Ture

比特币 Script 让我们可以使用另一个替代堆栈（译者注：就是流程控制操作码）。而组合器函数使用这种二级堆栈来处理 ` thresh`、`and`、`aor` 和 `or ` 的表达式。完整的 Miniscript 参考可见[此处](http://bitcoin.sipa.be/miniscript/#:~:text=Miniscript%20reference)。

### 花费条件案例

下面是我们在前面看到的案例的 Miniscript 条件。注意， ` A ` 、 ` B ` 、 ` C ` 是交易所涉及的密钥（包括 ` xpub ` 公钥和 ` xprv ` 私钥）的占位符。而使用 Miniscript 撰写的微型脚本（miniscripts）就是描述实际上的赎回脚本（redeemscript）的语义。总体上你就具有了描述符（Miniscript）格式。

1. 给 A 支付（支付给公钥）

```Script
pk(A)
```

2. A、B 和第三方 C 之间的托管账户

```Script
thresh(2,pk(A),pk(B),pk(C))
```

3. 给 A 设置了 T 个区块的时间锁，但 B 是主密钥的金库

```Script
aor(and(pk(A),time(T)),pk(B))
```

4. 支付给 B 的哈希时间锁合约，如果 T 个区块内未花费，将返回给 A

```Script
aor(and(pk(A),time(T)),and(pk(B),hash(H))))
```

Miniscript 花费条件编译器是用 Rust 写的，在[这个代码库](https://github.com/rust-bitcoin/rust-miniscript)中有展示。在本博客中，我们稍后将以相同的方式使用 [bitcoindevkit/bdk](https://github.com/bitcoindevkit/bdk)，这是一个带有[命令行工具](https://github.com/bitcoindevkit/bdk-cli)的、基于描述符的轻量级钱包代码库。

## 描述符

比特币脚本公钥支持多种方案，比如 P2PKH、P2SH、P2WPKH、P2TR（隔离见证 v1），等等。一个描述符就是对用在某一个花费条件中的脚本公钥的简单 “描述”。它可以在自身中包含一个公钥，也可以包含完整的 miniscript 条件。另一方面，Miniscript 条件是用来推导赎回脚本（redeemscript，实际执行的脚本）的，而描述符描述了如何在脚本公钥中设置赎回脚本。

换句话说，一个描述符 “描述了” 如何通过给定的一个 *花费条件* 创建一个地址的流程。

为了让多签名和复杂的密钥安排处理起来更简单，描述符是高度可插拔的（portable），可以被任何钱包软件用来确定可以从同一个钱包中生成的所有地址的清单。这个特性未所有的比特币应用和软件创建了一个共同的平台。

描述符的概念是在 2018 年出现的，自那时候开始，许多钱包都支持了描述符。你可以在  ` bitcoin-core ` 的[代码库](https://github.com/bitcoin/bitcoin/blob/master/doc/descriptors.md)中阅读描述符的文档（[中文译本](https://www.btcstudy.org/2022/05/15/support-for-output-descriptors-in-bitcoin-core/)）。

根据 Bitcoin Core，输出描述符是 “一种简单的语言，可以用来描述输出脚本的集合”。描述符自带了密钥的派生路径，主 公钥/私钥 的指纹，以及生成地址的路径。我们用一个输出描述符的例子来理解一下：

```java
Descriptor: pkh([d34db33f/44'/0'/0']xpub6ERaJH[...]LJRcEL/1/*)#ml40v0wf
            <1> <--------2---------><----------3---------><4> <---5--->
            
1：地址类型指定符（PKH 表示这是一个 P2PK 类型的地址）
2：主密钥的指纹以及从主密钥派生当前密钥的路径
3：在 m/44'/0'/0 位置的 xpub 公钥
4：派生 密钥/地址 的路径
5：这个描述符的校验和
```

一个描述符分成三个部分：

- *地址类型指定符*（也就是上例的第 1 部分）：说明这个描述符所创建的地址类型
- *花费条件*：将资金锁到该地址的花费条件
- *检验和*：用于快速验证

当前支持的地址类型指定符包括  ` pk ` 、 ` pkh ` 、 ` sh ` 、 ` wpkh ` 和 ` wsh ` ，最近又为 taproot 地址加入了 ` tr ` 指定符。

还有一种特殊的地址指定符，叫做 ` combo `，可以用同一套花费条件创建所有类型的地址。

在地址指定符之后，是 *花费条件*，描述了这个地址中的资金如何能够花费。上面案例中的描述符有一个简单的花费条件，“使用正确的私钥就能花费”。还可以有更复杂的条件，我们在后面的章节会讲到。

 ` multi ` 是一个特殊的关键词，既能表示 *地址类型*，又能表示 *花费条件*。当它用作一种 *地址类型* 时（比如 ` multi(...) ` ），它将从原始的多签名脚本公钥创建一个地址。而当它作为一种 *花费条件* 时（比如 ` wsh(multi(...)) `）它会从这个多签名脚本创建出特定类型的地址。当然，我们没法使用 ` ph(multi(...)) ` 、 ` pkh(multi(...)) ` 和  ` wpkh(multi(...)) ` ），因为这些地址类型无法装载脚本（任何类型的脚本都不行）。

举个例子，像 ` wsh(multi(2, PKA, PKB, PKC)) ` 这样的描述符，就描述了一个 P2WSH 地址，它是从一个使用公钥 ` PKA ` 、 ` PKB ` 和 ` PKC ` 的 ` 2-of-3 ` 多签名脚本创建的。

## 当它们结合在一起……

在这个章节中，我们会尝试开发一个基于描述符的钱包软件，并从 ` bitcoin-cli ` 推导出地址，然后使用 ` bdk-cli ` 来确认这些为描述符钱包生成的地址，对一个给定的描述符来说是确定性的。

我们也会尝试创建一个金库 miniscript 花费方法，并充值资金到这个金库中锁定两个月。在这段时间里，我们会尝试打破这个金库，然后看看我们的交易是如何失败的。

### 工具和护甲

- [docker](https://docs.docker.com/engine/install/)
- [bdk-cli](https://github.com/bitcoindevkit/bdk-cli)
- [miniscriptc](https://bitcoindevkit.org/bdk-cli/compiler/#installation)

### 起步

我们需要 ` bitcoind ` 运行在 ` regtest ` 模式下。使用下面的配置文件或其它你熟悉的配置文件。

```java
regtest=1
fallbackfee=0.0001
server=1

rpcuser=user
rpcpassword=password
```

```sh
# 启动 Bitcoin Core
bitcoind
```

### 公钥和地址生成

快速安装 ` bdk-cli ` 和 ` miniscriptc ` ：

```sh
cargo install bdk-cli --features=rpc,compiler
cargo install bdk --features="compiler" --example miniscriptc
```

让我们先生成一个 XPRV（私钥）并创建 wpkh 钱包描述符

```sh
XPRV=$(bdk-cli key generate | jq -r '.xprv')
EX_DESC="wpkh($XPRV/86'/1'/0'/0/*)"
EX_DESC_CS=$(elcli getdescriptorinfo $EX_DESC | jq -r '.checksum')
EX_DESC=$EX_DESC#$EX_DESC_CS

# 把这个描述符导入 bitcoin-cli 中的一个钱包
bitcoin-cli -named createwallet wallet_name="mywallet" descriptors=true
bitcoin-cli -rpcwallet="mywallet" importdescriptors "[{\"desc\":\"$EX_DESC\", \"timestamp\":\"now\", \"active\": true, \"range\": [0,100]}]"

echo $EX_DESC
```

结果应该看起来像这样：

```bash
wpkh(tprv8ZgxMBicQKsPeuazF16EdPZw84eHj55AU8ZKgZgdhu3sXcHnFgjzskfDvZdTaAFHYNCbKqrurFo9onSaT7zGT1i3u3j7LKhVZF5sJA39WPN/86'/1'/0'/0/*)#40hv8z77
```

现在，我们使用上面这个描述符，先通过 ` bitcoin-cli ` 生成 10 个地址，再通过 ` bdk-cli ` 生成 10 个地址。注意，它们生成的地址应该是完全一样的。

```sh
# Generation via bdk-cli
repeat 10 { bdk-cli -n regtest wallet --descriptor $EX_DESC -w mywallet get_new_address | jq -r ".address" }
bcrt1qc9wzxf8pthyexl00m23ug92pqrthagnzzf33wp
bcrt1qgnh7e72q92fqujwg3qxlg5kplxkm6rep0nerur
bcrt1qea6r8yvd0peupk29p94wm0xasvydgdsnyzkhez
bcrt1qm99230tpqflq0f8kpkn5d2tee02hgqcsw5sd99
bcrt1qd0afjfnl5udrsfkrj72rl34pss34yluma752qv
bcrt1qj2aymplrzxcp4m7vcxrzq93g58pmgm4fpluesy
bcrt1q4p4k63xglftez0h8yc7d4kmhsn5j5kecguu34j
bcrt1q29z2uanskweur7qrzr43gyv3l028s0pnd9ptvp
bcrt1qkzpeqz8sd73sucfythjxftez0e3ee30yhp9w67
bcrt1qptwd6ggy8ttryck2f6yjf4la68apruc3fs7elz

# Generation via bitcoin-cli
repeat 10 { bitcoin-cli -rpcwallet="mywallet" getnewaddress }
bcrt1qc9wzxf8pthyexl00m23ug92pqrthagnzzf33wp
bcrt1qgnh7e72q92fqujwg3qxlg5kplxkm6rep0nerur
bcrt1qea6r8yvd0peupk29p94wm0xasvydgdsnyzkhez
bcrt1qm99230tpqflq0f8kpkn5d2tee02hgqcsw5sd99
bcrt1qd0afjfnl5udrsfkrj72rl34pss34yluma752qv
bcrt1qj2aymplrzxcp4m7vcxrzq93g58pmgm4fpluesy
bcrt1q4p4k63xglftez0h8yc7d4kmhsn5j5kecguu34j
bcrt1q29z2uanskweur7qrzr43gyv3l028s0pnd9ptvp
bcrt1qkzpeqz8sd73sucfythjxftez0e3ee30yhp9w67
bcrt1qptwd6ggy8ttryck2f6yjf4la68apruc3fs7elz
```

注意：

-  ` repeat n {} ` 这个语法只能在 ` zsh ` 中使用，你可以为你的 shell 程序使用其它的循环语句，或者你也可以重复输入代码 10 次
- 如果你发现程序输出的地址有区别，请尝试删除 ` ~/.bdk-bitcoin ` ，然后再尝试一次（感谢 [@Steve](https://twitter.com/notmandatory) 给出这个提醒！）

再说一次，正常情况下， ` bdk-cli ` 和 ` bitcoin-cli ` 会产生完全一样的地址。所以，我们有了确定的证据，描述符可以让钱包变得可移植。一串简单的字符，就可以让所有钱包产生同样的地址集合，因此它们可以用同样的方式同步和广播交易！

### 为资金制作一个多签名描述符

在现实生活中，大部分人都有两种储蓄账户 —— 一种是用来存储我们整个生命中的大额资金的（*可能没有互联网银行功能*），而另一种是用来应付日常支出需要的。

在比特币世界里，为了存储大体量的资金，很多人都喜欢使用多签名钱包， ` 2-of-3 `（需要且仅需要 3 个密钥中任意 2 个密钥的签名）或者 ` 3-of-4 ` 的。他们可以把一个私钥放在个人电脑上，一个放在硬件钱包里，还有一个写在纸上放在保险柜里或记在心里。万一发生房屋火灾或永久失忆的情形，他们也可以用其它私钥来找回钱包。

这里是一个安全的 ` 2-of-3 ` 描述符的生成过程。

```sh
# 生成私钥
K1_XPRV=$(bdk-cli key generate | jq -r ".xprv")
K2_XPRV=$(bdk-cli key generate | jq -r ".xprv")
K3_XPRV=$(bdk-cli key generate | jq -r ".xprv")

# 生成公钥
K1_XPUB=$(bdk-cli key derive --xprv $K1_XPRV --path "m/84'/1'/0'/0" | jq -r ".xpub")
K2_XPUB=$(bdk-cli key derive --xprv $K2_XPRV --path "m/84'/1'/0'/0" | jq -r ".xpub")
K3_XPUB=$(bdk-cli key derive --xprv $K3_XPRV --path "m/84'/1'/0'/0" | jq -r ".xpub")

# 每个公钥的描述符，因为我们为公钥使用了 BIP-84 派生路径
# 所以我们需要给私钥也附加同样的路径，这样钱包软件才能理解
# 用哪个路径来生成地址和公钥
K1_DESC="wsh(multi(2,$K1_XPRV/84'/1'/0'/0/*,$K2_XPUB,$K3_XPUB))"
K2_DESC="wsh(multi(2,$K1_XPUB,$K2_XPRV/84'/1'/0'/0/*,$K3_XPUB))"
K3_DESC="wsh(multi(2,$K1_XPUB,$K2_XPUB,$K3_XPRV/84'/1'/0'/0/*))"
```

我们创建这三个 bdk 钱包的昵称，以方便未来的使用；然后我们执行初始化同步以创建钱包文件。

```sh
alias k1wallet='bdk-cli -n regtest wallet -w K1 -d $K1_DESC'
alias k2wallet='bdk-cli -n regtest wallet -w K2 -d $K2_DESC'
alias k3wallet='bdk-cli -n regtest wallet -w K3 -d $K3_DESC'

k1wallet sync
{}
k2wallet sync
{}
k3wallet sync
{}
```

现在，我们要发送一些资金到 ` k1wallet ` 生成的一个地址。

```sh
# 要求 regtest 生成 101 区块，这样我们就有 50 个 regtest 币了
# 因为 coinbase 资金在 100 个区块之后才能使用，所以我们创造
# 101 个区块，以使用第一个区块创造出来的币
CORE_ADDR=$(bitcoin-cli getnewaddress)
bitcoin-cli generatetoaddress 101 $CORE_ADDR
bitcoin-cli getbalance
50.00000000

# 然后我们发送 10 btc 到使用  ` K1 ` 描述符创造出来的地址
BDK_ADDR=$(k1wallet get_new_address | jq -r ".address")
bitcoin-cli -rpcwallet=mywallet sendtoaddress $BDK_ADDR 10

# 通过创建更多的区块来确认这笔交易
bitcoin-cli generatetoaddress 1 $CORE_ADDR
```

现在，同步钱包并检查每个钱包的余额

```sh
k1wallet sync
{}
k1wallet get_balance
{
  "satoshi": 1000000000
}

k2wallet sync
{}
k2wallet get_balance
{
  "satoshi": 1000000000
}

k3wallet sync
{}
k3wallet get_balance
{
  "satoshi": 1000000000
}
```

结果显示，每个钱包都拥有同样的余额。这是因为它是一个多签名钱包。现在，我们尝试花掉一些钱。我们要把一些钱发回给 ` bitcoin-cli ` 控制的钱包。但是，这是一个 ` 2-of-3 ` 的多签名钱包。所以我们至少需要两个私钥的签名才能发起有效的交易。

这时候我们就要用到 “[PSBT ](https://github.com/bitcoin/bips/blob/master/bip-0174.mediawiki)（部分签名的比特币交易）” 了。比特币使用 PSBT 作为创建交易的标准协议，并且，它可以在交易广播前为之加入一个乃至更多的签名，使之最终成为一笔有效的 *交易*。

我们将要求  ` k2wallet `  创建一笔交易，然后 ` k1wallet ` 和 ` k3wallet ` 将一起签名该交易。注意， ` k2wallet ` 虽然创建了这笔交易，但并不需要签名它，因为这是一个 ` 2-of-3 ` 多签名交易！

```sh
# 创建交易，可以由任何人发起
PSBT=$(k2wallet create_tx --to "$CORE_ADDR:100000000" | jq -r ".psbt")

# 用 K1 签名交易并查看输出
# 它应该会说，这笔交易尚不能敲定，因为只有一方签了名
k1wallet sign --psbt $PSBT
{
   "is_finalized": false,
   "psbt": "[...]"
}

# 保存 K1 签名后的 PSDT
K1_SIGNED_PSBT=$(k1wallet sign --psbt $PSBT | jq -r ".psbt")

# 用 K3 签名 —— 这次应该能敲定了
# 注意，这一次输入的 PSBT 是 K1 签过名的那个
k3wallet sign --psbt $K1_SIGNED_PSBT
{
   "is_finalized": true,
   "psbt": "[...]"
}

# 保存 K3 签名的 PSBT
SIGNED_PSBT=$(k3wallet sign --psbt $K1_SIGNED_PSBT | jq -r ".psbt")

# 广播交易，谁广播都无所谓
k2wallet broadcast --psbt $SIGNED_PSBT
{
   "txid": "49e2706fc73c49605692bf1b9ce58baf1eb0307ea39b3118628994fd56c9b642"
}

# 产生一个区块来确认这笔交易
bitcoin-cli generatetoaddress 1 $CORE_ADDR

# 同步并检查钱包余额，应该减少了 100000000 + 交易费
k1wallet sync
k1wallet get_balance
{
  "satoshi": 899999810
}
# 用类似的方法检查 ` k2wallet ` 和  ` k3wallet `，它们显示的余额应该是一样的
```

所以，这就证明了我们可以用复杂描述符所生成的多签名钱包来发起交易。因为在比特币中，拥有私钥就等于拥有使用资金的权限，我们需要保证私钥的安全。对于传统的单签名钱包来说，通常的做法是在多个地方保存助记词的备份。这是很不安全的，因为任何一个备份泄露，我们的整个账户就会被洗劫一空。复杂的多签名钱包描述符就是我们下一步要走的路 —— 即使单个私钥泄露或丢失，也没人能拿走我们的钱。

使用多签名钱包面临的另一个问题是钱包之间的同步，要保证咋能生成一致的地址。一个钱包软件怎么能知道另一个钱包要生成的下一个地址是什么，如果两者不通信的话？答案是  ` descriptors + PSBT ` 。如果所有的钱包都共享正确的描述符字符串，它们将总能产生同样的地址序列，并且，输入 PSBT，它们就知道如何签名，而无需相互通信。而 BDK 可以让这个过程尽可能无感。

## 保留奖金 —— 比特币的智能合约

假设一家公司现在要给自己的雇员一笔为期 2 个月的保留奖金。如果某个雇员为这家公司继续工作 2 个月， TA 就能得到 1 BTC 的奖励。这就是公司和雇员之间的一个智能合约。雇员要看得到自己会在两个月之后获得奖金，公司要确信雇员没法在两个月以内取走奖金。

这个合约的 Miniscript 代码将是这样的：

```sh
or(99@and(pk(E),older(8640)),pk(C))
```

 ` E ` 表示雇员， ` C ` 表示公司。

我要强调一下，这个花费方法会让公司在 2 个月后依然能转走这些钱。

当然，两个月之后，资金就可以被雇员解锁，但在此之前，公司是可以把资金撤回的。现在我们把这个花费方法转化成一个描述符。这一次，我们要请求  ` miniscript ` 程序的帮助。

```sh
# 描述符会在日志中显示出来，E 和 C 是占位符
miniscriptc "or(99@and(pk(E),older(8640)),pk(C))" sh-wsh
[2021-08-05T12:25:40Z INFO  miniscriptc] Compiling policy: or(99@and(pk(E),older(8640)),pk(C))
[2021-08-05T12:25:40Z INFO  miniscriptc] ... Descriptor: sh(wsh(andor(pk(E),older(8640),pk(C))))#55wzucxa
Error: Descriptor(Miniscript(Unexpected("Key too short (<66 char), doesn't match any format")))
```

所以编译出来的描述符是

```sh
sh(wsh(andor(pk(E),older(8640),pk(C))))
```

使用上面的奴身上生成公钥和地址，然后充入资金。

```sh
# 私钥
E_XPRV=$(bdk-cli key generate | jq -r ".xprv")
C_XPRV=$(bdk-cli key generate | jq -r ".xprv")

# 公钥
E_XPUB=$(bdk-cli key derive --xprv $E_XPRV --path "m/84'/1'/0'/0" | jq -r ".xpub")
C_XPUB=$(bdk-cli key derive --xprv $C_XPRV --path "m/84'/1'/0'/0" | jq -r ".xpub")

# 描述符使用 minicsript 编译出来的
# 请注意，如果公司或是雇员使用了一个复杂的多签名钱包
# 这个钱包可能会在这里显示出来，就像我们上面的例子一样
E_DESC="sh(wsh(andor(pk($E_XPRV/84'/1'/0'/0/*),older(8640),pk($C_XPUB))))"
C_DESC="sh(wsh(andor(pk($E_XPUB),older(8640),pk($C_XPRV/84'/1'/0'/0/*))))"

# 创建钱包昵称，以便于访问和同步钱包，创建初始化钱包文件
alias Cwallet='bdk-cli -n regtest wallet -w C -d $C_DESC'
alias Ewallet='bdk-cli -n regtest wallet -w E -d $E_DESC'

Cwallet sync
{}
Ewallet sync
{}

# 为钱包地址充值一些资金
C_ADDR=$(Cwallet get_new_address | jq -r ".address")
bitcoin-cli -rpcwallet=mywallet sendtoaddress $C_ADDR 10

# 确认交易
bitcoin-cli generatetoaddress 1 $CORE_ADDR

# 同步并检查余额
Cwallet sync
{}
Cwallet get_balance
{
  "satoshi": 1000000000
}

# 就像前面一样，雇员也能看到钱包的余额
Ewallet sync
{}
Ewallet get_balance
{
  "satoshi": 1000000000
}
```

根据花费条件， ` E ` 必须等待 8640 个区块后才能花费这些资金。但，我们可以尝试一下在 2 个月内发起交易，看看会出现什么后果。

```bash
# 接收资金的地址
E_ADDR=$(Ewallet getnewaddress | jq -r ".address")

# 获得外部花费条件 id —— 这个 id 将指示钱包要用哪个条件来签名
POLICY_ID=$(Ewallet policies | jq -r ".external | .id")

# 创建交易。在我这里，上一步中得到的外部条件 id 是 j7ncy3au
PSBT=$(Ewallet create_tx --to "$E_ADDR:100000000" --external_policy "{\"$POLICY_ID\":[0]}" | jq -r ".psbt")

# 签名和保存签过名的 PSBT
SIGNED_PSBT=$(Ewallet sign --psbt $PSBT | jq -r ".psbt")

# 现在我们尝试广播这笔交易，然后看它如何失败
Ewallet broadcast --psbt $SIGNED_PSBT
[2021-08-05T17:48:45Z ERROR bdk_cli] Electrum(Protocol(Object({"code": Number(2), "message": String("sendrawtransaction RPC error: {\"code\":-26,\"message\":\"non-BIP68-final\"}")})))
```

报错信息说，我们的这笔交易**并非 BIP68 终局化**的。[BIP68](https://github.com/bitcoin/bips/blob/master/bip-0068.mediawiki) 是一个相对时间锁规范，当一笔交易在时间锁窗口内发送时，它可以保证共识不出错，因为时间锁不会通过。这正好是我们预期会出现的报错信息。

现在，我们试试模逆两个月后发送交易的情形。

```
# 模拟两个月
# 预计需要 1 分钟来完成
bitcoin-cli generatetoaddress 8640 $CORE_ADDR

# 创建、签名和广播交易
PSBT=$(Ewallet create_tx --to $E_ADDR:100000000 --external_policy "{\"$POLICY_ID\":[0]}" | jq -r ".psbt")
SIGNED_PSBT=$(Ewallet sign --psbt $PSBT | jq -r ".psbt")
Ewallet broadcast --psbt $SIGNED_PSBT
{
  "txid": "2a0919bb3ce6e26018698ad1169965301a9ceab6d3da2a3dcb41343dc48e0dba"
}

# 确认交易
bitcoin-cli generatetoaddress 1 $CORE_ADDR

# 同步和检查余额
Cwallet sync
{}
Cwallet get_balance
{
  "satoshi": 999999810
}

Ewallet sync
{}
Ewallet get_balance
{
  "satoshi": 999999810
}
```

这一次就通过了，因为我们已经模拟 2 个月过去了（产生了 8640 个区块）。现在公司和雇员的钱包都更新了。因此，可以看到，我们能够用比特币产生一些智能合约。

## 启示

1. [Descriptors from Bitcoin Core](https://github.com/bitcoin/bitcoin/blob/master/doc/descriptors.md)
2. [Miniscript](http://bitcoin.sipa.be/miniscript)
3. [Output Script Descriptors](https://bitcoinops.org/en/topics/output-script-descriptors)
4. [Descriptors in Bitcoin Dev Kit](https://bitcoindevkit.org/descriptors)
5. [描述符的角色](https://bitcoindevkit.org/blog/2020/11/descriptors-in-the-wild/#the-role-of-descriptors)
6. [使用 bitcoin-cli 开发一个 Taproot 描述符钱包](https://gist.github.com/notmandatory/483c7edd098550c235da75d5babcf255)
7. [Miniscripts SBC '19 视频](https://www.youtube.com/watch?v=XM1lzN4Zfks)
8. [视频·重新思考钱包的架构：原生的描述符钱包](https://www.youtube.com/watch?v=xC25NzIjzog)

衷心感谢我的导师 [Steve Myers](https://twitter.com/notmandatory)，感谢他给我持续的鼓励，并为我解答了这么多异化。非常感谢 [Raj](https://github.com/rajarshimaitra) 审核这篇博客，并给了我许多详细的建议。许多段落都是由他补充的。还要感谢在 ` #miniscript ` IRC 频道中的许多人，他们帮助我编写了 “保留奖金” 花费条件。

这篇博客是在 [Summer of Bitcoin 2021](https://summerofbitcoin.org/) 期间由 [Sandipan Dey](https://twitter.com/@sandipndev) 撰写的。

（完）