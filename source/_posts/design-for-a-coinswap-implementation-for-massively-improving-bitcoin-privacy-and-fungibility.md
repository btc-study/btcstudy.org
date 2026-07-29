---
title: '为提升比特币的隐私性和同质性而设计一种 CoinSwap实现'
author: 'Chris Belcher'
date: '2026/07/29 18:40:01'
cover: ''
excerpt: '无法探测的隐私性'
tags:
- CoinSwap
---


> *作者：Chris Belcher*
>
> *来源：<https://gist.github.com/chris-belcher/9144bd57a91c194e332fb5ca371d0964>*
>
> *原文出版于 2020 年 5 月。*

## 摘要

设想在未来，用户 Alice 拥有一些比特币，并且希望在发送它们的时候拥有最佳的隐私性，因此她创建了一种特殊形式的交易。对于区块链的观察者来说，她的交易似乎完全没有异样：她的钱币从地址发送到了地址 B 。但实际上，她的钱币最终到了跟 A 和 B 都完全没有关联的地址 Z 。

再想象有另一个用户 Carol ，她完全不在乎隐私性，使用今天就已存在的普通钱包软件来发送比特币。但因为 Carol 的交易看起来跟 Alice 的一模一样，那么，分析区块链的人就必须考虑 Carol 的交易实际上把她的钱币发送到了完全无关的地址的可能性。所以，Carol 的隐私性也提升了，虽然她根本没有改变自己的行为习惯，甚至从来没听过别的什么软件。

当广告商、社交媒体和其它公司都热衷于收集 Alice 和 Carol 的时候，这样的隐私性提升是非常有价值的。并且， 对每一笔交易都多一些怀疑，将显著地提升比特币的同质性（可互换性），使之成为更好的货币。

这种无法探测的隐私性，今天就能通过实现 CoinSwap 打造出来，虽然光凭 CoinSwap 是不够的，必须有各种各样的模块通力合作，才能形成一个良好的系统。CoinJoin 软件可以单独运行，作为一种比特币混淆 app，但也可以作为一个库，为现有的软件钱包所用，让它们的用户在发送比特币交易获得好得多的隐私性。

## CoinSwap

与 CoinJoin 一样，CoinSwap 的概念是 Maxwell 在 2023 年提出的【1】。但跟 CoinJoin 不一样的是，它实现起来相对要复杂，目前也还没有得到运用。但这个想法依然是非常有前景的，并且解决了某些类型的 CoinJoin 的许多问题。CoinSwap 是比特币链上隐私性的下一步。

CoinSwap 是一种非托管的交易两个钱币的办法。它非常接近于 “原子化互换（atomic swap）” 的想法。Alice 和 Bob 可以互相交换钱币，办法是先将钱币发送到一个 CoinSwap 地址，然后让这些钱币发送给 Bob ：

```
Alice 的地址 1 ----> CoinSwap 地址 1 ----> Bob 的地址 1
```

完全无关联的另一组交易，则反过来，把 Bob 的钱币交给 Alice ：

```
Bob 的地址 2 ----> CoinSwap 地址 2 ----> Alice 的地址 2
```

这里的符号 `---->` 表示一笔比特币交易。

隐私性得到了提升，是因为区块链的观察者无法将 Alice 的地址 1 和 Alice 的地址 2 关联起来，两者之间并无交易。Alice 的地址 2 可以是 Alice 现有钱包中的一个地址，也可以是她想要支付的对象的地址。就这样，CoinSwap 就打破了交易图启发式分析，具体来说是这样的假设：如果在区块链上观察到一笔交易是 `A -> B` ，就表明资金的所有权实际上从 A 转移给了 B 。

CoinSwap 不会破坏比特币的任何假设（或者说特性 ），比如可审计的供应量，或者可以修剪历史区块。它在现在的比特币上就能开发出来，无需任何软分叉。

（译者注：本文出版于 2020 年，彼时尚未激活 Taproot 升级，Schnorr 签名尚未服役。）

CoinSwap 自身无法大幅提高隐私性，所以它需要其它模块来配合，打造出真正隐私的系统。

## ECDSA-2P

最初的 CoinSwap 想法使用 2-of-2 多签名。我们可以通过使用 2-of-3 多签名（加入一个假的公钥）来获得稍微大一些的匿名集。想获得更大的匿名集，则可以使用两方的 ECDSA 、创建一个 2-of-2 的多重签名公钥，其地址看起来跟普通的单签名地址一模一样【2】。即使是老旧的 p2pkh 地址（以 1 开头的那种），也有可能是 CoinSwap 地址。

因为其交易外观与其它比特币交易没有什么两样，基于 CoinSwap 的应用将能提供比现有的等面额输出 Coinjoin 应用（JoinMarket、Wasabi Wallet 和 Samourai Wallet 的 Whirlpool）好得多的隐私性。为获得等量的隐私性，CoinSwap 也会更便宜，因为 CoinJoin 用户通常需要创建多笔 CoinJoin 交易才能获得实质上的隐私性，比如说，在使用默认参数时，JoinMarket 的 tumbler 脚本通常要运行 7 ~ 12  次 CoinJoin（而且它们的体积都比常规交易要大）。

Schnorr 签名以及 MuSig 算法提供了创建隐形 2-of-2 多重签名的更简便办法，但它不那么适合 CoinSwap 。因为 ECDSA 的匿名集要大得多。今天所有地址都使用 ECDSA 签名，还没有使用 Schnorr 签名的。我们要等待 Schnorr 签名加入比特币，还要等待用户采用它。在隔离见证上，我们看到升级已经过了近 3 年了，隔离见证地址的采用率还是只有 60% ，这还是在隔离见证有可观的经济激励（手续费更便宜）的前提下。而用在单签名上的时候，Schnorr 还没有这种激励因素，因为 Schnorr 单签名的交易成本跟今天的 p2wpkh 是一样的，所以可以预期采用只会更慢。（当然，多签名交易会有激励因素，但绝大部分交易都是单签名的）。当 Schnorr 签名的采用开始增加时，CoinSwap 系统可以着手使用它，但从长期来看，我怀疑，还是使用 ECDSA 能够获得更大的匿名集。

（译者注：在作者参与的 [CoinSwap 规范](https://github.com/citadel-tech/Coinswap-Protocol-Specification)中，v2 协议已经采用 Taproot 地址和 MuSig2 。）

## 流动性市场

我们可以为 CoinSwap 创造出一个流动性市场，就像 JoinMarket 为 CoinJoin 做的那样。以我们上面的例子来说，Alice 将是一个 “吃单者”，而 Bob 将是一个 “挂单者” 。吃单者 Alice 支付一笔费用给挂单者 Bob ，以选择一次 CoinSwap 的数额以及时机。这将带来极好的用户体验，因为 Alice 可以为自己想要的任意数额、任意交易时机创建 CoinSwap 。当前，在 JoinMarket 上，创建 CoinJoin 的流动性规模不能超过 200 BTC ，我们可以预期在 CoinSwap 上也会有类似限制。

## 多笔交易的 CoinSwap ：避免数额关联

CoinSwap 容易因为数值关联而失去隐私效果：

```
AliceA (15 BTC) ----> CoinSwap AddressA ----> BobA (15 BTC)
BobB (15 BTC) ----> CoinSwap AddressB ----> AliceB (15 BTC)
```

这里的 `AliceA` 和 `AliceB` 都是 Alice 的地址。而 `BobA` 和 `BobB` 都是 Bob 的地址。如果敌手关注着 AliceA，就有可能通过在区块链上搜索另一笔数额接近于 15 BTC 的交易、发现 AliceB 而看穿这次 CoinSwap 。我们可以通过创建多笔交易的 CoinSwap 来打败这种数额关联攻击：

```
AliceA (15 BTC) ----> CoinSwap AddressA ----> BobA (15 BTC)

BobB (7 BTC) ----> CoinSwap AddressB ----> AliceB (7 BTC)
BobC (5 BTC) ----> CoinSwap AddressC ----> AliceC (5 BTC)
BobD (3 BTC) ----> CoinSwap AddressD ----> AliceD (3 BTC)
```

现在，在这种多交易的 CoinSwap 中，吃单人 Alice 给出了 15 BTC ，拿回了三个输出，它们的数额总和还是 15 BTC ，Alice 不会收到一个价值恰好是 15 BTC 的输出。

## 路由 CoinSwap 以避免单点信任

在最初的 CoinSwap 想法中，只有 Alice 和 Bob 两个参与者，所以当他们 CoinSwap 时，Bob 就将知道 Alice 的钱币来自哪里。也就是说，Bob 就成了 Alice 的隐私性的单点故障，Alice 必须信任 Bob 不是间谍。

为了分散以及去中心化这种信任，我们创造了 Alice 的支付会经过许多个 Bob 的 CoinSwap ：

```
AliceA ====> Bob ====> Charlie ====> Dennis ====> AliceB
```

这里的符号 `====>` 就意味着一次 CoinSwap 。在这种情形下，Alice 是一个流动性市场上的吃单人，所有其他人（Bob、Charlie、Dennis）都将是挂单人。只有 Alice 知道整个链条，而每一个挂单人都只知道所在位置的上一个和下一个地址。

具体做法是让 Alice 来代表其他挂单人处理关于 CoinSwap 的一切。这些挂单人彼此之间不会有 TCP 网络连接，只跟 Alice 有连接，而 Alice 会在他们之间转发与 CoinSwap 相关的信息。其他挂单人将不会知道发送给他们的钱币来自 Alice 自己或是 CoinSwap 路线上的前一个挂单人。

## 结合多交易与路由

路由和多交易必须结合起来。如果 Alice 拥有多个 UTXO（面额分别为 6 BTC 、8 BTC 和 1 BTC），那么顺理成章的：

```
         Alice
(6 BTC) (8 BTC) (1 BTC)
   |       |       |
   |       |       |
   v       v       v
          Bob
(5 BTC) (5 BTC) (5 BTC)
   |       |       |
   |       |       |
   v       v       v
        Charlie
(9 BTC) (5 BTC) (1 BTC)
   |       |       |
   |       |       |
   v       v       v
        Dennis
(7 BTC) (4 BTC) (4 BTC)
   |       |       |
   |       |       |
   v       v       v
         Alice
```

这里向下的箭头就表示一个 CoinSwap 哈希时间锁合约。每一跳豆使用多笔交易，从而没有哪个挂单人（Bob、Charlie、Dennis）能够使用数额关联来发现与他们没有直接关联的地址；不过，在每一跳，总价值都是 15 BTC。全部（3 个）挂单人必须串谋，才能跟踪这些比特币的源头和目的地。

如果 Alice 只有一个 UTXO，那么上述方法就依然受制于数额关联。最后的一位挂单人（例如 Dennis）将知道总的 CoinSwap 数额为 15 BTC，并且可以搜索区块链来发现 Alice 的那个 UTXO 。在这种情况下，Alice 必须使用一种分解策略：

```
                        Alice
                       (15 BTC)
                          |
                          |
                          v
                         Bob
                        /   \
                       /     \
           <-----------       ----------->
           |                             |
(2 BTC) (2 BTC) (2 BTC)        (3 BTC) (3 BTC) (3 BTC)
    |       |       |             |       |       |
    |       |       |             |       |       |
    v       v       v             v       v       v
        Charlie                       Dennis
(1 BTC) (2 BTC) (3 BTC)       (5 BTC) (3 BTC) (1 BTC)
    |       |       |             |       |       |
    |       |       |             |       |       |
    v       v       v             v       v       v
         Edward                          Fred
 (4 BTC) (1 BTC) (1 BTC)       (4 BTC) (2 BTC) (3 BTC)
    |       |       |             |       |       |
    |       |       |             |       |       |
    v       v       v             v       v       v
          Alice                         Alice
```

在这个图中，Alice 通过 CoinSwap 发送 15 BTC 给 Bob。Bob 发送 6 BTC 给 Charlie、发送剩余的 9 BTC 给 Dennis 。Charlie 和 Dennis 则与 Edward 和 Fred 运行 CoinSwap 。除了 Bob，没有任何一个挂单人知道参与 CoinSwap 的总价值（15 BTC），所以无法通过搜索区块链来追溯 Alice 的最初的 UTXO 。因为分解成了多笔交易，Bob 也无法通过最初发送的数额（6 BTC 和 9 BTC）来向前搜索。在这个案例中，至少需要 3 个挂单人串谋，才能知道钱币的来源和目的地。

另一种策略是分支合并，当 Alice 有两个以上的 UTXO、不想被人发现它们属于同一个人（因此不能在同一笔交易中花费）的时候，这种策略将会派上用场。

```
          Alice                         Alice
         (9 BTC)                       (6 BTC)
            |                             |
            |                             |
            v                             v
           Bob                         Charlie
 (4 BTC) (3 BTC) (2 BTC)       (1 BTC) (2 BTC) (3 BTC)
    |       |       |             |       |       |
    |       |       |             |       |       |
     \       \       \           /       /       /
      \       \       \         /       /       /
       \       \       \       /       /       /
        >------->-------\     /-------<-------<
                         \   /
                         Alice
                        (15 BTC)
```

在这这张图中，Alice 发送两个 UTXO（分别是 9 BTC 和 6 BTC）给两个挂单人，他们再转发回给 Alice 。因为这两个挂单人，所以它们几乎不可能被一起花费了。

这些复杂的经过转发的多笔交易，只是为最高的威胁模型准备的 —— 挂单人自己就是敌手。在现实中，绝大部分用户可能只需要一到两个中转就够了。

## 打破找零输出和钱包指纹线索

等面额输出风格的 CoinJoin 很容易泄露找零地址（除非它们被清扫起来、不设找零）。CoinSwap 没有这个缺点，所以它可以打破一些较弱的找零输出启发式分析【3】。

比如说 “地址复用”。如果一个地址被多次使用，那么它就很有可能是一个支付输出，而不是一个找零输出。在一个 CoinSwap 应用中，我们可以通过让挂单人以一定的概率、随机将找零发送到他们曾经用过的地址，来打破这种启发式分析。这会让启发式分析认为一个地址是找零地址（但实际上是支付地址）、以为一个地址是支付地址（实际上是找零），并且可能让一个区块链分析师将支付地址划分到挂单人自己的钱包集群中。

另一种重要的启发式分析是脚本类型线索。如果挂单人的输入全部都是 p2sh-p2wpkh 地址，而他们的支付地址也是 p2sh-p2wpkh 地址，那么挂单人可以按一定的概率将找零地址设为另一种类型（比如 p2wpkh），也能以类似的方式欺骗区块链分析。

## 忠诚押金

任何人都能进入 CoinSwap 市场作为挂单人，所以就有一种遭到 “分身攻击（sybil attacks）” 的危险，也就是一个敌手部署许许多多的挂单人机器人。如果吃单人 Alice 选中的挂单人都是由同一个人控制的机器人，那么这个人就能通过跟踪钱币的流向来消除 Alice 交易的匿名性。

一种解决办法是 “忠诚押金（fidelity bonds）”。这种机制要求人们牺牲一些比特币价值来获得一个密码学身份，也就是让这种身份难以获得。牺牲的方式应该能够向第三方证明。创建忠诚押金的一种办法是将一些比特币锁定在一个时间锁地址中，我们可以编程吃单人机器人、创造出让挂单人机器人发布忠诚押金的市场压力。这些忠诚押金可以由任何持有比特币的人匿名创建出来。

忠诚押金是一种无法伪造的真实牺牲，可以跟比特币挖矿背后的工作量证明相比。那么，一个分身攻击者若想成功，就不得不锁定大量比特币、锁定很长时间。我曾经为 JoinMarket 分析过忠诚押金【4】，使用较为贴近现实的数字，我计算出，攻破这样的系统将需要 55000 BTC（按撰文之时的价格是大约 5 亿美元）、在时间锁地址中锁定 6 个月。这是很大的数字，可以提供强大的分身攻击抗性。

### 谁先行动

忠诚押金也解决了 CoinSwap 中的 “谁先行动” 问题。

这个问题是：Alice 或者 Bob ，总要有一方先广播自己的注资交易，但如果另一方就是不行动，就会导致 Alice 或者 Bob 浪费时间和挖矿手续费，因为 TA 将不得不使用合约交易来取回自己的钱。这就是一种 DOS 攻击。如果一个恶意的 CoinSwap 参与者可以一直中止协议，那么 TA 可以无限期阻止一个诚实用户参与 CoinSwap 。忠诚押金通过让押金持有者后行动来解决这个问题。如果押金持有者会中止协议，那么他们的押金（身份）可以被诚实用户排除在后续的 CoinSwap 之外。这样一来，恶意的 CoinSwap 参与者必须在忠诚押金中牺牲许多价值，才能用虚假订单塞满订单簿。

举一个具体的例子：Alice 是吃单人，Bob 是挂单人。Bob 发布了一个忠诚押金，因此 Alice “先行动”，将她的钱币发送到她与 Bob 的一个 2-of-2 多签名地址。当 Bob 看到这笔交易得到确认，就要广播自己的那一笔交易到另一个 2-of-2 多签名地址中。如果 Bob 是恶意的，就此装死，那他确实能浪费 Alice 一些时间和金钱，但 Alice 将从此拒绝有 Bob 的忠诚押金参与的 CoinSwap 活动。

如果使用了忠诚押金依然有严重的 DOS 问题，那么可以让 Alice 在广播交易之前，向 Bob 请求一个 “DOS 证据”，就是一组数据，包含了交易、默克尔证据以及签名，充当一个合约：只要 Alice 先广播自己的注资交易，Bob 就承诺会广播自己的交易。如果 Alice 被 DOS 攻击了，那么她可以公开这个 DOS 证据。这个证据包含了足够多的信息，能够说服其他人真的发生了 DOS ，那么以后就没有人会跟 Bob 参与 CoinSwap 了（至少会分配某种形式的负面评分，以降低合作的概率）。我怀疑是不是有必要做到这一步，所以我没有探索这种想法，但参考文献中有更详细的文本【5】。

## 私钥移交

最初的 CoinSwap 想法涉及四笔交易 —— 两笔将资金存入多签名地址、两笔取出。我们可以用 “私钥移交”【6】做得更好。这里有一个洞见：一旦 CoinSwap 原像揭晓，Alice 就不必签名对方的多签名花费交易，相反，他们可以直接把自己的私钥交给对方。这样，另一方就知道了 2-of-2 多签名地址的两个密钥，可以单方面控制资金。虽然他们依然需要观察区块链、在对方广播哈希时间锁合约交易时作出反应。

这既可以节省区块，也能提高隐私性，因为钱币可以长期不花费，甚至永久不花费。在最初的 CoinSwap 协议中，区块链分析师总是能看到一笔注资交易确认之后马上出现一笔结算交易，这就会被当成一种指纹。

我们甚至可以走得更远一些，使用一种叫做 “SAS（紧凑得原子化互换）” 的方案【7】。这套方案使用 “适配器签名”【8】来产生类似于私钥移交的结果，但只有一方需要观察和响应区块链事件直至自己花费掉钱币。另一方只是获得自己的钱币的单方面控制权，无需观察和响应。

## PayJoin 与 CoinSwap

CoinSwap 可以跟 CoinJoin 相结合。在最初的 CoinSwap 协议中，Alice 可以用一笔普通的交易给 CoinSwap 地址打钱，同时花费她自己的多个输入：

```
AliceInputA (1 BTC) ----> CoinSwap Address (3 BTC)
AliceInputB (2 BTC)
```

这会泄露这几个输入都来自同一个人的信息。我们可以把这笔案例交易编程一笔 CoinJoin 交易，办法是加入 Bob 的输入。CoinJoin 需要交互，但因为 Alice 和 Bob 本来就需要交互（参与 CoinSwap 协议），所以让他们多做一些事来执行 CoinJoin 协议也不算太难。这笔 CoinJoin 交易将给 CoinSwap 地址注资，像这样：

```
AliceInputA (1 BTC) ----> CoinSwap Address (7 BTC)
AliceInputB (2 BTC)
BobInputA   (4 BTC)
```

Alice 和 Bob 的输入都在同一笔交易花费，这就打破了 “输入来源同一性” 假设。这种形式的 CoinJoin 与 PayJoin 协议或者 CoinJoinXT 协议极为相似。因为在这种设计的剩余部分中，协议没有任何特殊的模式，跟其它常规的比特币交易是无法区别的。

为了完成这一部分，挂单人 Bob 需要提供两个没有关联的 UTXO，一个用于 CoinSwap，另一个用于 CoinJoin 。

### 使用诱饵 UTXO 来防止泄露

如果任何吃单人 Alice 发起请求，挂单人 Bob 都会交出参与 CoinJoin 的输入，那么恶意的 Alice 就可以一直骚扰 Bob、在了解他的 UTXO 之后就叫停协议。恶意的 Alice 将知晓 Bob 所有的 UTXO ，在未来也将很容易通过观察这些 UTXO 的花费交易来消除 CoinSwap 的混淆效果。

为了抵御这种攻击，我们让 Bob 维护一个 “诱饵 UTXO” 清单：它们是 Bob 通过扫描近期的区块而发现的  UTXO 。在创建 CoinJoin 的时候，Bob 不会只发送自己的输入，还会发送 50 到 100 个不属于他的输入。 协议接续运行，Alice 必须部分签名许多的 CoinJoin 交易：Bob 发来多少个输入，Alice 就要签名多少笔交易，然后把这些交易都发回给 Bob 。然后，Bob 就能签名包含他的输入的交易并广播出去。如果 Alice 实际上是个间谍，那么将无法确切地知道哪些输入属于 Bob ，只是多知道了 100 个输入，其中绝大部分都不是 Bob 的。当 Alice 知道 Bob 真正的 UTXO 时，已经太晚了，因为 Bob 已经花出去了、Alice 已经锁定在 CoinSwap 协议中了，需要时间、挖矿手续费和 CoinSwap 费用才能取出自己的钱。

这种诱饵 UTXO 在最早的 PayJoin 设计中就已出现（2018 年）【9】【10】。

### 创建一个使用联盟公告牌的通信网络

当前，JoinMarket 使用公开的 IRC（互联网在线聊天室）网络来通信。它在很多方面都不能让人满意，我们可以做得更好。

我提议，可以由少量志愿者运行藏在 Tor 隐藏服务后面得 HTTP 服务端。他们的 URL 可以包含在 CoinSwap 软件中。可以称他们为 “公告牌服务器”。挂单人也是运行在隐藏服务后面的服务器，并且会连接到这些公开牌服务器以打广告、发布自己的 .onoin 地址。为了保护自己不受垃圾流量轰炸，挂单人必须先提供一份忠诚押金，才能在 HTTP 服务器上留言。

吃单人连接到所有这些 HTTP 公告牌，并下载所有已知的挂单人 .onoin 地址清单。他们连接到每一个挂单人，以获得具体参数，比如要求的 CoinSwap 费用、最大数额。这就像在 JoinMarket 里面下载订单簿。一旦吃单人选定自己要跟哪个挂单人运行 CoinSwap，他们就通过 .onion 地址直接跟这些挂单人通信，传输创建 CoinSwap 所需要的数据。

这些 HTTP 公告牌服务器运行起来很便宜，这也是必要的，因为他们是志愿者。这不需要很多带宽和硬盘空间，因为有忠诚押金的要求，他们能够得到很好的保护，不会被垃圾流量轰炸。整个系统可以容忍短暂的宕机，所以这些服务器也不需要非常可靠。容易想象志愿者们可以在树莓派上运行服务器。这些公告牌服务器有点像 `Bitcoin Core` 所用的帮助寻找 p2p 网络对等节点的 DNS 种子。如果志愿者们失去了兴趣或者小时了，那么社区用户可以找到新的志愿者、将他们的 URL 添加到默认列表中。

若想审查一个挂单人，*所有的* 公告牌服务器都必须联合起来，否则就不会成功。如果审查是大规模发生的（比如说，如果公告牌服务器只显示由他们自己运行的分身挂单人），那么吃单人们可以注意到所有忠诚押金的总价值下降了。

## CoinSwap 跟闪电网络有什么区别？

CoinSwap 和闪电网络有一些相似性，所以很自然会有人问：它们有什么区别？为什么我们已经有了闪电网络，还需要 CoinSwap 呢？

### CoinSwap 可以单方面采用，而且是链上的

我们知道一些中心化的交易所，因为合规理由而不支持所谓的 “隐私币”。我们也看到一些交易所屏蔽他们侦测到的 CoinJoin 交易【11】。（关于交易所是不是真的拒绝 CoinJoin 交易的输出，还有一些争论，但有一点是可以确定地：等面额输出地 CoinJoin 天然是可以观察到的）。有可能这些交易也会因为闪电网络的隐私特性而永远不支持它。

但这样的拒绝在 CoinSwap 上是不可能的，因为它完全是一种链上的技术。CoinSwap 用户把钱币发送到比特币地址，而不是支付给闪电发票。任何愿意使用比特币的人都能采用 CoinSwap 。并且因为 CoinSwap 交易可以做到跟普通交易无法区分，哪怕确认人们是不是得到了 CoinSwap 支付都是非常困难的。所以 CoinSwap 不是闪电网络的替代品，而是链上隐私性技术（比如等面额输出 CoinJoin，已在 JoinMarket、Wasabi Wallet 和 Samourai Wallet 中实现）的替代品。理想情况下，这种设计，一旦得到实现，就能进入许多已经开发出来的钱包软件，从而 CoinSwap 将是任何人都能用上的。

CoinSwap 的特性反过来也可以帮助闪电网络，因为那些搞审查的交易所无法出于侦测不到的隐私性技术而拒绝交易。当他们意识到这一点的时候，就不会再出于隐私性而拒绝支持闪电网络。

比特币也需要链上隐私性技术，否则，糟糕的隐私性将蔓延到 layer-2 方案中。

### 解决流动性的不同方式

闪电网络无法支持大额支付。在闪电网络中，通道中的流动性是稀缺资源；转发闪电支付的节点总要留心，不让支付用尽自己的流动性。当前，闪电网络的用户总要常常检查收款额度、支付额度和通道调平。甚至有一些服务商是专门出售闪电网络流动性的。

而我们这套 CoinSwap 设计用了截然不同的办法来解决这个流动性问题。因为 CoinSwap 的流动性市场类似于 JoinMarket，需要多少流动性都能满足。永远不需要担心耗尽通道的流动性，或者无法发现支付路径，因为所需要的流动性是在使用的前一刻，从流动性市场上买到的。

闪电网络还在起步阶段，流动性问题从一开始就存在。许多人信心满满，觉得流动性问题终将解决。但还是很难想象有一天闪电网络能可靠地转发价值 200 BTC 的支付到网络中的任意节点（而且这也不是闪电网络取得成功的必要条件），但在 JoinMarket 上，就在我撰写这篇文章的时候，就能创建出价值高达 200 BTC 的 CoinJoin 交易。可以预期在 CoinSwap 上也能支持这么大的数额。流动性市场作为一种解决方案，是确定能够工作的，并且已经运行了许多年了。

### 分身攻击抗性

CoinSwap 可以支持忠诚押金，并因此对分身工具有更强的抵抗能力。在前面的章节我们已经看到了，来自 JoinMarket 的贴近现实的数字，表明攻击者需要锁定价值数亿美元的比特币长达几个月时间，才能成功解除用户的匿名。

很难把它与闪电网络中的分身攻击的成本作比较，因为这样的攻击本身就难以分析。举个例子，攻击者需要说服用户在支付路径中包含攻击者的节点；也许他们能做到，但翻译成具体的数字则是困难的。不过，虽说如此，真正的成本很有可能远远小于 5 亿美元锁定几个月，因为闪电节点很容易建立，只需有一些硬件、投入资金建立支付通道就可以了，而 CoinSwap 的挂单人需要价值不菲的忠诚押金。

因为 CoinSwap 设计更难被分身攻击，它的隐私性在这一方面也就相应大得多。

## CoinSwap、PayJoin 和 PaySwap 又有什么区别？

PayJoin 也跟普通的比特币交易无法区分，那为什么我们不直接使用它呢？

答案是，威胁模型不同。PayJoin 的工作原理是让顾客和商家一起合作，来提高双方的隐私性。只要双方的敌手都是被动的区块链观察者，这种办法就有效。

如果一个用户的敌手就是商家，那 PayJoin 就失灵了。这种情况每天都在发生，比如说交易所就一直在监视自己的客户。但 CoinSwap 这时候就能派上用场，因为它不假设（或者说不要求）另一方是你的朋友。同样的论证也适用于 PaySwap 。

显然，PayJoin 和 PaySwap 都是非常有用的，但他们能够产生作用的环境不同。

## 结论

CoinSwap 是一种有前景的隐私性协议，因为它打破了交易图启发式分析，但它独木难支。为了创造一种真正隐私的交易系统、提升比特币的同质性，CoinSwap 必须与其他许多模块相结合：

- ECDSA -2P
- 流动性市场
- 跳转的 CoinSwap
- 多笔交易的 CoinSwap
- 打破找零输出启发式分析
- 忠诚押金
- 结合 Payjoin 与 CoinSwap
- 联盟化的公告牌，并使用忠诚押金来防止轰炸

CoinSwap 交易可以做得跟任何常规的比特币交易一样，没有可以区分的指纹。所以它们可以是隐形的。

我有志于开发这样的 CoinSwap 软件。它将是几乎完全去中心化的，所有人都可以免费使用。将设计公开，是为了获得审核。如果你希望帮助开发，我在 https://bitcoinprivacy.me/coinswap-donations 这里接受捐赠。

亦见比特币开发邮件组的讨论：https://lists.linuxfoundation.org/pipermail/bitcoin-dev/2020-May/017898.html 。以及 Reddit 论坛的讨论：[此处](https://www.reddit.com/r/Bitcoin/comments/gqb3ur/design_for_a_coinswap_implementation_for/) 以及 [另一处](https://www.reddit.com/r/Bitcoin/comments/gqt1zu/extensive_and_well_written_high_level_design_for/)。

## 参考文献

- [1] "CoinSwap: Transaction graph disjoint trustless trading" https://bitcointalk.org/index.php?topic=321228.0
- [2] http://diyhpl.us/wiki/transcripts/scalingbitcoin/tokyo-2018/scriptless-ecdsa/
- [3] https://en.bitcoin.it/wiki/Privacy#Change_address_detection
- [4] "Design for improving JoinMarket's resistance to sybil attacks using fidelity bonds" https://gist.github.com/chris-belcher/18ea0e6acdb885a2bfbdee43dcd6b5af/
- [5] [AdamISZ/CoinSwapCS#50](https://github.com/AdamISZ/CoinSwapCS/issues/50)
- [6] [AdamISZ/CoinSwapCS#53](https://github.com/AdamISZ/CoinSwapCS/issues/53)
- [7] https://lists.linuxfoundation.org/pipermail/bitcoin-dev/2020-May/017846.html
- [8] https://github.com/ElementsProject/scriptless-scripts/blob/master/md/atomic-swap.md
- [9] https://blockstream.com/2018/08/08/en-improving-privacy-using-pay-to-endpoint/ （[中文译本](https://www.btcstudy.org/2022/04/13/improving-privacy-using-pay-to-endpoint/)）
- [10] https://medium.com/@nopara73/pay-to-endpoint-56eb05d3cac6
- [11] https://cointelegraph.com/news/binance-returns-frozen-btc-after-user-promises-not-to-use-coinjoin

（完）