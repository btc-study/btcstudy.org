---
title: 'Bitcoin Core 28.0 交易池特性钱包集成指南'
author: 'Gregory Sanders'
date: '2025/01/07 18:15:56'
cover: ''
excerpt: '介绍这些新特性以及单项或集体使用它们的方法'
categories:
- 比特币主网
tags:
- 开发
- 交易池
---


> *作者：Gregory Sanders*
> 
> *来源：<https://bitcoinops.org/en/bitcoin-core-28-wallet-integration-guide/>*



[Bitcoin Core 28.0](https://github.com/bitcoin/bitcoin/releases/tag/v28.0) 包含了一些新的 P2P 和交易池条款[特性](https://github.com/bitcoin/bitcoin/blob/master/doc/release-notes/release-notes-28.0.md)，可能对一些钱包和交易类型有用。Gregory Sanders 给出了一份概要的指南，介绍了这些新特性以及单项或集体使用它们的方法。

## 一父一子（1P1C）交易包转发

在 Bitcoin Core 28.0 以前，每一笔交易都必须达到或者超过一个节点的交易池动态最低费率，才能进入这个节点的交易池。这个数值（最低费率）大体上会随着交易的拥塞而上涨和回落，从而为交易的传播创造一个浮动的地板价格。这一机制，给处理预签名交易且无法签名[替代交易](https://bitcoinops.org/en/topics/replace-by-fee/)的钱包带来了极大的困难，因为它们将不得不预测：当这笔预签名的交易需要确认的时候，交易传播的地板价会变成什么样。即便是几分钟之后的情形，也难以预测；如果时间跨度超过几个月，那显然是不可能的。

“[交易包转发](https://bitcoinops.org/en/topics/package-relay/)” 是一项人们梦寐以求的功能，可以缓解这种交易因为缺乏手续费追加能力而无法得到确认的风险。一旦得到合理的开发并在网络中广泛部署，交易池转发将允许钱包开发者通过另一笔相关的交易来为某一笔交易支付手续费，从而，低手续费的祖先交易也可以进入交易池。

Bitcoin Core 28.0 为包含一笔父交易和一笔子交易的交易包（“1P1C”）实现了交易包转发的一种受限制的变种。1P1C 允许一笔父交易进入交易池，无论该父交易是否达到了交易池的动态最低费率，只要一笔子交易在为它应用简单的 “[子为父偿（CPFP）](https://bitcoinops.org/en/topics/cpfp/)” 手续费追加。如果子交易还有额外的未确认父交易，那么这些交易都不会在 1P1C 的规则下得到转发。这种限制极大地简化了实现，并允许交易池的其他设计（比如 “[族群交易池](https://bitcoinops.org/en/topics/cluster-mempool/)”）得到应用，同时依然能满足大量的应用场景。

除非交易的版本是 “[TRUC 交易](https://bitcoinops.org/en/topics/version-3-transaction-relay/)”（详见下文），在 1P1C 规则下传播的交易依然必须满足 *静态的* 每一虚拟字节支付 1 聪的费率下限。

关于这项特性的最后一个警告是，本版本的传播保证也是受限的。如果一个 Bitcoin Core 节点连接到了一个足够强硬的敌手，敌手可以打破父子交易对的传播。交易包转发的额外补强措施，作为一个[项目](https://github.com/bitcoin/bitcoin/issues/27463)，还在继续开发。

通用的交易包转发留待未来实现，并且需要得到来自受限的交易包转发及其在网络中被采用的信息。

此处是在一个 regtest 环境中建立一个演示 1P1C 转发的钱包的命令：

```
bitcoin-cli -regtest createwallet test
{
  "name": "test"
}
```

```
# 获得一个自己给自己支付的地址
bitcoin-cli -regtest -rpcwallet=test getnewaddress
bcrt1qqzv3ekkueheseddqge3mqdcukse6p9d5yuqxv3
```

```
# 创建一笔费率低于最低转发费率（“minrelay”）的交易
bitcoin-cli -regtest -rpcwallet=test -generate 101
{
[
...
]
}

bitcoin-cli -regtest -rpcwallet=test listunspent
[
  {
    "txid": "49ea7a01bcba744bd82ecea3e36c4ee9a994f010508a28a09df38f652e74643b",
    "vout": 0,
    ...
    "amount": 50.00000000,
    ...
  }
]

# 交易池的 minfee 和 minrelay 设成了相同的值，以便于测试这一功能
# 我们将使用 TRUC 交易类型，以允许零费率交易并要求 1P1C 转发。
# 启用完全 RBF（Fullrbf），这也是 28.0 的默认值。
bitcoin-cli -regtest getmempoolinfo
{
  "loaded": true,
  ...
  "mempoolminfee": 0.00001000,
  "minrelaytxfee": 0.00001000,
  ...
  “fullrbf”: true,
}

# 先将交易的版本号设为 2
bitcoin-cli -regtest createrawtransaction '[{"txid": "49ea7a01bcba744bd82ecea3e36c4ee9a994f010508a28a09df38f652e74643b", "vout": 0}]' '[{"bcrt1qqzv3ekkueheseddqge3mqdcukse6p9d5yuqxv3": "50.00000000"}]'

02000000013b64742e658ff39da0288a5010f094a9e94e6ce3a3ce2ed84b74babc017aea490000000000fdffffff01f90295000000000016001400991cdadccdf30cb5a04663b0371cb433a095b400000000

# 再将开头的 02 换成 03，也即 TRUC 交易的版本号
03000000013b64742e658ff39da0288a5010f094a9e94e6ce3a3ce2ed84b74babc017aea490000000000fdffffff01f90295000000000016001400991cdadccdf30cb5a04663b0371cb433a095b400000000

# 签名并发送
bitcoin-cli -regtest -rpcwallet=test signrawtransactionwithwallet 03000000013b64742e658ff39da0288a5010f094a9e94e6ce3a3ce2ed84b74babc017aea490000000000fdffffff01f90295000000000016001400991cdadccdf30cb5a04663b0371cb433a095b400000000
{
  "hex": "030000000001013b64742e658ff39da0288a5010f094a9e94e6ce3a3ce2ed84b74babc017aea490000000000fdffffff01f90295000000000016001400991cdadccdf30cb5a04663b0371cb433a095b40247304402200a82f2fd8aa5f32cdfd9540209ccfc36a95eea21518ede1c3787561c8fb7269702207a258e6f027ce156271879c38628ad9b3425b83c33d8cd95fb20dd3c567fdff70121030af1fadce80bcb8ba614634bc82c71eea2ed87a5692d3127766cc896cef1bdb100000000",
  "complete": true
}

bitcoin-cli -regtest sendrawtransaction 030000000001013b64742e658ff39da0288a5010f094a9e94e6ce3a3ce2ed84b74babc017aea490000000000fdffffff01f90295000000000016001400991cdadccdf30cb5a04663b0371cb433a095b40247304402200a82f2fd8aa5f32cdfd9540209ccfc36a95eea21518ede1c3787561c8fb7269702207a258e6f027ce156271879c38628ad9b3425b83c33d8cd95fb20dd3c567fdff70121030af1fadce80bcb8ba614634bc82c71eea2ed87a5692d3127766cc896cef1bdb100000000

error code: -26
error message:
min relay fee not met, 0 < 110

# 我们需要使用这个输出的交易包转发和 CPFP
bitcoin-cli -regtest decoderawtransaction 030000000001013b64742e658ff39da0288a5010f094a9e94e6ce3a3ce2ed84b74babc017aea490000000000fdffffff01f90295000000000016001400991cdadccdf30cb5a04663b0371cb433a095b40247304402200a82f2fd8aa5f32cdfd9540209ccfc36a95eea21518ede1c3787561c8fb7269702207a258e6f027ce156271879c38628ad9b3425b83c33d8cd95fb20dd3c567fdff70121030af1fadce80bcb8ba614634bc82c71eea2ed87a5692d3127766cc896cef1bdb100000000

{
  "txid": "bf9164db69d216da4af6d9c720a0cec6d7e0bafb1702fdf8c2cd5606101576de",
  "hash": "7d855ffbd8bc17892e28f3f326d0e4919d35c27a7370f5d9f9ce538e93a347cf",
  "version": 3,
  "size": 191,
  "vsize": 110,
  ...
  "vout": [
    ...
    "scriptPubKey": {
      "hex": "001400991cdadccdf30cb5a04663b0371cb433a095b4",
    ...
}

# 从输出中扣减掉为 CPFP 准备的手续费
bitcoin-cli -regtest createrawtransaction '[{"txid": "bf9164db69d216da4af6d9c720a0cec6d7e0bafb1702fdf8c2cd5606101576de", "vout": 0}]' '[{"bcrt1qqzv3ekkueheseddqge3mqdcukse6p9d5yuqxv3": "49.99994375"}]'
0200000001de7615100656cdc2f8fd0217fbbae0d7c6cea020c7d9f64ada16d269db6491bf0000000000fdffffff0100ed94000000000016001400991cdadccdf30cb5a04663b0371cb433a095b400000000

# 签名 TRUC 变体并发送（作为一个 1P1C 交易包）
bitcoin-cli -regtest -rpcwallet=test signrawtransactionwithwallet 0300000001de7615100656cdc2f8fd0217fbbae0d7c6cea020c7d9f64ada16d269db6491bf0000000000fdffffff0100ed94000000000016001400991cdadccdf30cb5a04663b0371cb433a095b400000000 '[{"txid": "bf9164db69d216da4af6d9c720a0cec6d7e0bafb1702fdf8c2cd5606101576de", "vout": 0, "scriptPubKey": "001400991cdadccdf30cb5a04663b0371cb433a095b4", "amount": "50.00000000"}]'
{
  "hex": "03000000000101de7615100656cdc2f8fd0217fbbae0d7c6cea020c7d9f64ada16d269db6491bf0000000000fdffffff0100ed94000000000016001400991cdadccdf30cb5a04663b0371cb433a095b4024730440220685a6d76db97b2c27950f267b70d606f1864002ff6b4617cd2e29afd5ddfac83022037be8bb2ebe8194b4263f16a634e5c00a5f6c4eef0968d12994ed66dcf15b9ac0121020797cc343a24dfe49c7ee9b94bf3daaf15308d8c12e3f0f7e102b95ee55f939f00000000",
  "complete": true
}

bitcoin-cli -regtest -rpcwallet=test submitpackage '["030000000001013b64742e658ff39da0288a5010f094a9e94e6ce3a3ce2ed84b74babc017aea490000000000fdffffff01f90295000000000016001400991cdadccdf30cb5a04663b0371cb433a095b40247304402200a82f2fd8aa5f32cdfd9540209ccfc36a95eea21518ede1c3787561c8fb7269702207a258e6f027ce156271879c38628ad9b3425b83c33d8cd95fb20dd3c567fdff70121030af1fadce80bcb8ba614634bc82c71eea2ed87a5692d3127766cc896cef1bdb100000000", "03000000000101de7615100656cdc2f8fd0217fbbae0d7c6cea020c7d9f64ada16d269db6491bf0000000000fdffffff0100ed94000000000016001400991cdadccdf30cb5a04663b0371cb433a095b4024730440220685a6d76db97b2c27950f267b70d606f1864002ff6b4617cd2e29afd5ddfac83022037be8bb2ebe8194b4263f16a634e5c00a5f6c4eef0968d12994ed66dcf15b9ac0121020797cc343a24dfe49c7ee9b94bf3daaf15308d8c12e3f0f7e102b95ee55f939f00000000"]'
{
  "package_msg": "success",
  "tx-results": {
    "7d855ffbd8bc17892e28f3f326d0e4919d35c27a7370f5d9f9ce538e93a347cf": {
      "txid": "bf9164db69d216da4af6d9c720a0cec6d7e0bafb1702fdf8c2cd5606101576de",
      "vsize": 110,
      "fees": {
        "base": 0.00000000,
        "effective-feerate": 0.00025568,
        "effective-includes": [
          "7d855ffbd8bc17892e28f3f326d0e4919d35c27a7370f5d9f9ce538e93a347cf",
          "4333b3d2eea820373262c7ffb768028bc82f99f47839349722eb60c58cd65b55"
        ]
      }
    },
    "4333b3d2eea820373262c7ffb768028bc82f99f47839349722eb60c58cd65b55": {
      "txid": "6c2f4dec614c138703f33e6a5c215112bad4cf79593e9757105e09b09bf3e2de",
      "vsize": 110,
      "fees": {
        "base": 0.00005625,
        "effective-feerate": 0.00025568,
        "effective-includes": [
          "7d855ffbd8bc17892e28f3f326d0e4919d35c27a7370f5d9f9ce538e93a347cf",
          "4333b3d2eea820373262c7ffb768028bc82f99f47839349722eb60c58cd65b55"
        ]
      }
    }
  },
  "replaced-transactions": [
  ]
}
```

这个 1P1C 交易包进入了本地的交易池，实质费率是 25.568 聪/vB，虽然其中的父交易的费率低于最低转发费率。成功！

## TRUC 交易

“确认前拓扑受限的（TRUC）” 交易也叫 “v3 交易”，是一种新的、可选的[交易池条款](https://bitcoinops.org/en/blog/waiting-for-confirmation/)，旨在允许可靠的交易手续费替换（RBF）、缓解跟手续费相关的交易[钉死](https://bitcoinops.org/en/topics/transaction-pinning/)攻击以及交易包限制钉死攻击。它的核心理念是：**虽然许多特性并不适合所有交易，但我们可以为内部拓扑受到限制的交易包实现它们**。TRUC 创造了一种以拓扑上的限制为代价、选择性进入这些更健壮的条款的方法。

简而言之，一笔 TRUC 交易就是一笔 nVersion 字段的值为 3 的交易，并且，其交易单体不能超过 10 kvB、其仅有的一笔子交易也是 TRUC 交易且体积不得超过 1kvB。TRUC 交易不能花费未确认且非 TRUC 的交易，反之也如此（未确认且非 TRUC 的交易也不能花费 TRUC 交易）。所有 TRUC 交易也都被认为选择性使用 RBF，不论是否在交易中表达了 [BIP125 信号](https://github.com/bitcoin/bips/blob/master/bip-0125.mediawiki)。如果另一笔不冲突的 TRUC 子交易被添加到了父 TRUC 交易，该交易会被当成跟原本的子交易[冲突](https://bitcoinops.org/en/topics/kindred-replace-by-fee/)，然后适用通常的 RBF 替换规则，包括手续费率检查和总手续费检查。

TRUC 交易也允许是 0 手续费的，因为子交易足以为整个交易包追加手续费。

这种受限制的拓扑也恰好在 1P1C 转发范式内，如果所有版本的预签名交易都是 TRUC 交易的话，就不必管交易的对手方做什么。

TRUC 支付是可以替换的，所以，任何携带了不完全属于交易者的输入的交易都是可以被重复花费的。换句话说，收取 TRUC 的零确认支付是在安全性上不如收取非 TRUC 的零确认支付。

## 1P1C 拓扑的交易包 RBF

有时候，1P1C 交易包中的父交易会跟交易池内的交易相冲突。在这笔父交易的多个版本都得到了预签名的时候，可能就会出现这种情况。以往，这笔新的父交易会在 RBF 规则下被单独考虑，并且，如果手续费太低的话，就会被抛弃。

而使用 1P1C 拓扑交易包 RBF，这个新的子交易也会被纳入 RBF 检查的考量，这就允许钱包开发者通过 P2P 网络获得可靠的 1P1C 交易包传播，无论哪个版本的交易曾经进入交易池。

注意，目前，冲突交易的单体和 1P1C 交易包都不能有别的依赖。否则，替代交易会被拒绝。这样的族群的冲突可能有任意多个。在未来，当我们实现族群交易池的时候，这条规则会被放松。

继续我们前面的 1P1C 案例，我们准备对已有的这个 1P1C 交易包执行一次交易包 RBF，这一次将使用一笔非 TRUC 的交易包：

```
# 父子交易对
bitcoin-cli -regtest getrawmempool
[
  "bf9164db69d216da4af6d9c720a0cec6d7e0bafb1702fdf8c2cd5606101576de",
  "6c2f4dec614c138703f33e6a5c215112bad4cf79593e9757105e09b09bf3e2de"
]

# 使用一个新的 v2 1P1C 交易包来重复花费上述父交易 
# 新交易包中的父交易的手续费率超过最低转发费率，但不足以 RBF 原交易包
bitcoin-cli -regtest createrawtransaction '[{"txid": "49ea7a01bcba744bd82ecea3e36c4ee9a994f010508a28a09df38f652e74643b", "vout": 0}]' '[{"bcrt1qqzv3ekkueheseddqge3mqdcukse6p9d5yuqxv3": "49.99999"}]'

02000000013b64742e658ff39da0288a5010f094a9e94e6ce3a3ce2ed84b74babc017aea490000000000fdffffff0111ff94000000000016001400991cdadccdf30cb5a04663b0371cb433a095b400000000

# 签名并发送（将遭遇失败）
bitcoin-cli -regtest -rpcwallet=test signrawtransactionwithwallet 02000000013b64742e658ff39da0288a5010f094a9e94e6ce3a3ce2ed84b74babc017aea490000000000fdffffff0111ff94000000000016001400991cdadccdf30cb5a04663b0371cb433a095b400000000
{
  "hex": "020000000001013b64742e658ff39da0288a5010f094a9e94e6ce3a3ce2ed84b74babc017aea490000000000fdffffff0111ff94000000000016001400991cdadccdf30cb5a04663b0371cb433a095b4024730440220488d98ad79495276bb4cdda4d7c62292043e185fa705d505c7dceef76c4b61d30220567243245416a9dd3b76f3d94bfd749e0915929226ba079ec918f6675cbfa3950121030af1fadce80bcb8ba614634bc82c71eea2ed87a5692d3127766cc896cef1bdb100000000",
  "complete": true
}

bitcoin-cli -regtest sendrawtransaction 020000000001013b64742e658ff39da0288a5010f094a9e94e6ce3a3ce2ed84b74babc017aea490000000000fdffffff0111ff94000000000016001400991cdadccdf30cb5a04663b0371cb433a095b4024730440220488d98ad79495276bb4cdda4d7c62292043e185fa705d505c7dceef76c4b61d30220567243245416a9dd3b76f3d94bfd749e0915929226ba079ec918f6675cbfa3950121030af1fadce80bcb8ba614634bc82c71eea2ed87a5692d3127766cc896cef1bdb100000000

error code: -26
error message:
insufficient fee, rejecting replacement f17146d87a029cb04777256fc0382c637a31b2375f3981df0fb498b9e44ceb59, less fees than conflicting txs; 0.00001 < 0.00005625

# 通过子交易，向新的交易包注入更多手续费，以打败旧的交易包
bitcoin-cli -regtest createrawtransaction '[{"txid": "f17146d87a029cb04777256fc0382c637a31b2375f3981df0fb498b9e44ceb59", "vout": 0}]' '[{"bcrt1qqzv3ekkueheseddqge3mqdcukse6p9d5yuqxv3": "49.99234375"}]'

020000000159eb4ce4b998b40fdf81395f37b2317a632c38c06f257747b09c027ad84671f10000000000fdffffff01405489000000000016001400991cdadccdf30cb5a04663b0371cb433a095b400000000

# 签名并发送（新的交易包）
bitcoin-cli -regtest -rpcwallet=test signrawtransactionwithwallet 020000000159eb4ce4b998b40fdf81395f37b2317a632c38c06f257747b09c027ad84671f10000000000fdffffff01405489000000000016001400991cdadccdf30cb5a04663b0371cb433a095b400000000 '[{"txid": "f17146d87a029cb04777256fc0382c637a31b2375f3981df0fb498b9e44ceb59", "vout": 0, "scriptPubKey": "001400991cdadccdf30cb5a04663b0371cb433a095b4", "amount": "49.99999"}]'
{
  "hex": "0200000000010159eb4ce4b998b40fdf81395f37b2317a632c38c06f257747b09c027ad84671f10000000000fdffffff01405489000000000016001400991cdadccdf30cb5a04663b0371cb433a095b40247304402205d086fa617bdbf5a3df3a15cc9a927ad884c714d46d9ef6762ad2fa6a259740c022032c60b4fe5d533d990489c27dc3283d8b3999b97f6c12986ac8159b92cb6de820121020797cc343a24dfe49c7ee9b94bf3daaf15308d8c12e3f0f7e102b95ee55f939f00000000",
  "complete": true
}

bitcoin-cli -regtest -rpcwallet=test submitpackage '["020000000001013b64742e658ff39da0288a5010f094a9e94e6ce3a3ce2ed84b74babc017aea490000000000fdffffff0111ff94000000000016001400991cdadccdf30cb5a04663b0371cb433a095b4024730440220488d98ad79495276bb4cdda4d7c62292043e185fa705d505c7dceef76c4b61d30220567243245416a9dd3b76f3d94bfd749e0915929226ba079ec918f6675cbfa3950121030af1fadce80bcb8ba614634bc82c71eea2ed87a5692d3127766cc896cef1bdb100000000", "0200000000010159eb4ce4b998b40fdf81395f37b2317a632c38c06f257747b09c027ad84671f10000000000fdffffff01405489000000000016001400991cdadccdf30cb5a04663b0371cb433a095b40247304402205d086fa617bdbf5a3df3a15cc9a927ad884c714d46d9ef6762ad2fa6a259740c022032c60b4fe5d533d990489c27dc3283d8b3999b97f6c12986ac8159b92cb6de820121020797cc343a24dfe49c7ee9b94bf3daaf15308d8c12e3f0f7e102b95ee55f939f00000000"]'
{
  "package_msg": "success",
  "tx-results": {
    "fe15d23f59537d12cddf510616397b639a7b91ba2f846c64533e847e53d7c313": {
      "txid": "f17146d87a029cb04777256fc0382c637a31b2375f3981df0fb498b9e44ceb59",
      "vsize": 110,
      "fees": {
        "base": 0.00001000,
        "effective-feerate": 0.03480113,
        "effective-includes": [
          "fe15d23f59537d12cddf510616397b639a7b91ba2f846c64533e847e53d7c313",
          "256cebd037963d77b2692cdc33ee36ee0b0944e6b9486a6aaad0792daa0f677c"
        ]
      }
    },
    "256cebd037963d77b2692cdc33ee36ee0b0944e6b9486a6aaad0792daa0f677c": {
      "txid": "858fe07b01bc7c1c1dda50ba16a33b164c0bc03d0eff8f9546558c088e087f60",
      "vsize": 110,
      "fees": {
        "base": 0.00764625,
        "effective-feerate": 0.03480113,
        "effective-includes": [
          "fe15d23f59537d12cddf510616397b639a7b91ba2f846c64533e847e53d7c313",
          "256cebd037963d77b2692cdc33ee36ee0b0944e6b9486a6aaad0792daa0f677c"
        ]
      }
    }
  },
  "replaced-transactions": [
    "bf9164db69d216da4af6d9c720a0cec6d7e0bafb1702fdf8c2cd5606101576de",
    "6c2f4dec614c138703f33e6a5c215112bad4cf79593e9757105e09b09bf3e2de"
  ]
}

```

## 支付到锚点（P2A）

“[锚点输出](https://bitcoinops.org/en/topics/anchor-outputs/)” 可以定义为一种输出，父交易携带它的唯一目的就是允许子交易通过 CPFP 来为父交易追加手续费。因为这样的输出并非支付，它们是低价值的，面额接近于 “粉尘数额”，而且会被立即花掉。

Bitcoin Core 28.0 添加了一种新的输出脚本类型 “[支付到锚点（P2A）](https://bitcoinops.org/en/topics/ephemeral-anchors/)”，允许使用一种优化的 “无密钥” 锚点。这种输出的脚本是 “OP_1 <4e73>”，花费它不需要任何见证数据，这意味着需要为它支付的手续费会比现有的锚点输出更小。它也允许任何人凭它来创建用于 CPFP 的子交易。

P2A 可以独立于 TRUC 交易和 1P1C 交易包来使用。一笔带有 P2A 输出但没有子交易的交易也可以得到广播，只不过这种输出很容易被花掉。类似地，交易包和 TRUC 交易也不是必须使用 P2A 输出。

这种新的输出的粉尘面额下限是 240 聪。携带低于这个面额的 P2A 输出的交易不会得到传播，即使它们在交易包中被花费，因为交易包条款依然完全实施[粉尘](https://bitcoinops.org/en/topics/uneconomical-outputs/)面额限制。虽然这个提议曾经跟 “临时粉尘” 提议相关联，但现在已经不是这样了。

创建和花费 P2A 的案例：

```
# Regtest 上的 P2A 地址是 “bcrt1pfeesnyr2tx”，主网上的 P2A 地址是 “bc1pfeessrawgf”
bitcoin-cli -regtest getaddressinfo bcrt1pfeesnyr2tx
{
  "address": "bcrt1pfeesnyr2tx",
  "scriptPubKey": "51024e73",
  "ismine": false,
  "solvable": false,
  "iswatchonly": false,
  "isscript": true,
  "iswitness": true,
  "ischange": false,
  "labels": [
  ]
}

# 这是一种隔离见证输出，类型为 “anchor”
bitcoin-cli -regtest decodescript 51024e73
{
  "asm": "1 29518",
  "desc": "addr(bcrt1pfeesnyr2tx)#swxgse0y",
  "address": "bcrt1pfeesnyr2tx",
  "type": "anchor"
}

# P2WPKH 和 P2S 输出的最低面额
bitcoin-cli -regtest createrawtransaction '[{"txid": "49ea7a01bcba744bd82ecea3e36c4ee9a994f010508a28a09df38f652e74643b", "vout": 0}]' '[{"bcrt1qqzv3ekkueheseddqge3mqdcukse6p9d5yuqxv3": "0.00000294"}, {"bcrt1pfeesnyr2tx": "0.00000240"}]'
02000000013b64742e658ff39da0288a5010f094a9e94e6ce3a3ce2ed84b74babc017aea490000000000fdffffff02260100000000000016001400991cdadccdf30cb5a04663b0371cb433a095b4f0000000000000000451024e7300000000

# 签名和发送带有 P2A 输出的交易
bitcoin-cli -regtest -rpcwallet=test signrawtransactionwithwallet 02000000013b64742e658ff39da0288a5010f094a9e94e6ce3a3ce2ed84b74babc017aea490000000000fdffffff02260100000000000016001400991cdadccdf30cb5a04663b0371cb433a095b4f0000000000000000451024e7300000000
{
  "hex": "020000000001013b64742e658ff39da0288a5010f094a9e94e6ce3a3ce2ed84b74babc017aea490000000000fdffffff02260100000000000016001400991cdadccdf30cb5a04663b0371cb433a095b4f0000000000000000451024e7302473044022002c7e756b15135a3c0a061df893a857b42572fd816e41d3768511437baaeee4102200c51fcce1e5afd69a28c2d48a74fd5e58b280b7aa2f967460673f6959ab565e80121030af1fadce80bcb8ba614634bc82c71eea2ed87a5692d3127766cc896cef1bdb100000000",
  "complete": true

# 关闭健全费用检查
bitcoin-cli -regtest -rpcwallet=test sendrawtransaction 020000000001013b64742e658ff39da0288a5010f094a9e94e6ce3a3ce2ed84b74babc017aea490000000000fdffffff02260100000000000016001400991cdadccdf30cb5a04663b0371cb433a095b4f0000000000000000451024e7302473044022002c7e756b15135a3c0a061df893a857b42572fd816e41d3768511437baaeee4102200c51fcce1e5afd69a28c2d48a74fd5e58b280b7aa2f967460673f6959ab565e80121030af1fadce80bcb8ba614634bc82c71eea2ed87a5692d3127766cc896cef1bdb100000000 "0"
fdee3b6a5354f31ce32242db10eb9ee66017e939ea87db0c39332262a41a424b

# 替换前一个交易包
bitcoin-cli -regtest getrawmempool
[
  "fdee3b6a5354f31ce32242db10eb9ee66017e939ea87db0c39332262a41a424b"
]

# 对子交易，将价值都变成手续费；让 65vbyte 大小的交易使用 OP_RETURN 输出，以避免 tx-size-small 错误
bitcoin-cli -regtest createrawtransaction '[{"txid": "fdee3b6a5354f31ce32242db10eb9ee66017e939ea87db0c39332262a41a424b", "vout": 1}]' '[{"data": "feeeee"}]'
02000000014b421aa4622233390cdb87ea39e91760e69eeb10db4222e31cf354536a3beefd0100000000fdffffff010000000000000000056a03feeeee00000000

# 不需要签名；这是一种不需要见证数据的隔离见证输出
bitcoin-cli -regtest -rpcwallet=test sendrawtransaction 02000000014b421aa4622233390cdb87ea39e91760e69eeb10db4222e31cf354536a3beefd0100000000fdffffff010000000000000000056a03feeeee00000000
8d092b61ef3c1a58c24915671b91fbc6a89962912264afabc071a4dbfd1a484e

```

## 用户指引

以下不再是更新公告式的特性说明，而会介绍一些常见的钱包模式，以及它们如何能从这些更新中获益，不论钱包是否主动升级。

### 简单支付

支付者面临的一个问题是，无法保证支付交易的接收者不能创建一个任意长的交易链条、从而将支付交易钉死在交易池中；因此也无法有把握地运行 RBF。如果用户希望有更加可预测的 RBF 行为，一种办法是选择性进入 TRUC 交易。即使是接收支付，也可以通过一笔最大可达 1kvB 的子交易（花费正在等待确认的支付）来可靠地追加手续费。

如果采用这种技术，钱包软件应该：

- 将交易版本号设为 3
- 仅使用已经得到确认的输出
- 保持交易体积在 10kvB 以下（与非 TRUC 交易所面临的 100 kvB 限制不同）
  - 这个更严格的限制依然支持稍微大一些的批量支付
  - 如果钱包没有别的选择，只能花费一个未确认的输入，那么这个输入必须来自一笔 TRUC 交易，并且这笔新交易的体积要低于 1kvB

### Coinjoin

在 [coinjoin](https://bitcoinops.org/en/topics/coinjoin/) 场景中，人们关注的是隐私性，但 coinjoin 交易本身并没有隐藏起来的需要，因此，为 coinjoin 交易使用 TRUC 交易可能是有价值的。一笔 coinjoin 交易可能因为费率不够而无法进入区块链，从而需要手续费追加。

还可以跟 TRUC 交易一道，加入 P2A 输入，从而允许另一个钱包（比如瞭望塔）单独为交易支付手续费。

如果其他参与者也想花费自己的未确认的 coinjoin 交易输出，可能就会发生 “TRUC 亲属驱逐”。亲属交易驱逐可以保持 TRUC 的拓扑限制，但允许发生更高费率的 CPFP —— 新的子交易可以 “替代” 旧的子交易，无需花费相同的输入（译者注：此处的 “替代” 打双引号是因为这两笔子交易本身并非冲突交易，它们并没有花费相同的输入，只是因为 TRUC 只允许一个子交易，才会不能共存）。因此，coinjoin 交易的所有参与者都总是能够 CPFP coinjoin 交易。

警告：一笔 coinjoin 交易的参与者依然可以通过重复花费自己在 coinjoin 交易中的输入来挫败 coinjoin 交易（只需付出微小的经济代价）；要反击，就需要 coinjoin 交易 RBF 掉攻击者的第一笔交易。

### 闪电网络

在商店网络协议中生成的交易有几种主要的类型：

1. 注资交易：单方注资或双方注资的交易，用于建立合约。对及时确认相对不敏感。
2. 承诺交易：承诺一条支付通道的最新状态。这些交易是不对称的，而且当前双方需要一笔 “update_fee” 消息来更新将注资输出中的多少价值变成手续费。这里的手续费必须足以将最新版本的承诺交易传播到矿工的交易池。
3. 与 HTLC 相关的预签名交易。

使用 1P1C 转发和交易包 RBF，更新后的 Bitcoin Core 节点可以极大低提高闪电网络的安全性。闪电通道的单方面关闭可以通过低于交易池最低费率的承诺交易来实现，也可以跟另一个低费率、无法立即进入区块的承诺交易包相冲突。

为了最大限度利用这一升级，钱包和后端应该集成 Bitcoin Core 的 RPC 命令 **submitpackage** ：

```
bitcoin-cli submitpackage ‘[“<commitment_tx_hex>”, “<anchor_spend_hex>”]’
```

钱包实现应该让自己的软件集成这个命令，并使用这个命令来发送承诺交易以及一笔花费锚点输出的子交易，以保证这个交易包能以合适的费率到达矿工的交易池。

注意：如果你发送的是一个包含单个父交易和多个子交易的交易包，命令依然会返回 “成功”，但这样的交易包无法在（本次更新的） 1P1C 交易包转发条款下转发。

如果有足够多的节点升级到支持这些特性，闪电网络协议可能会升级为抛弃 “update_fee” 消息 —— 这一消息本身也是多年来网络手续费暴涨期间、许多通道不必要地强制关闭的源头。移除这种消息之后，承诺交易可以设置为静态的 1 聪/vB 费率。使用 TRUC 交易，我们可以保证，相互竞争的承诺交易及其花费锚点输出的子交易可以在网络中相互 RBF；而且，如果同一笔承诺交易有相互竞争的输出花费子交易，RBF 依然可以发生，无论被花费的是哪个输出。TRUC 交易可以是 0 费率的，允许进一步降低规范的复杂性。有了 TRUC 亲属驱逐，我们也可以抛弃长达 1 区块的 CSV 锁定时间，因为我们已经不再需要担心哪个未确认的输出会被花费，只要每一方都至少可以花费一个输出。

使用 TRUC + P2A 输出，我们可以将承诺交易当前的两个锚点输出减少为一个无密钥的锚点，从而降低对区块空间的使用。无密钥锚点不需要进入公钥，花费起来也不需要签名，可以进一步降低对区块空间的使用。手续费追加也可以外包给没有私钥的其他代理人。锚点也可以由双方共享密钥材料的一个输出组成，而不使用 P2A，代价则是在良性的单方关闭场景中占用更多 vbyte。

在实现一些高级特性，比如 “通道拼接” 时，也可以追求类似的策略，以降低 RBF 钉死攻击风险。举个例子，一笔体积小于 1 kvB 的 TRUC 通道拼接交易，可以 CPFP 另一条通道的单方关闭交易，而追加手续费的用户也无需担心 RBF 钉死攻击。后续的手续费追加可以通过连续替代这笔通道拼接交易来实现。代价则是在通道拼接期间暴露 TRUC 交易类型。

如你所见，这些更新后的特性可以避免许多复杂性并节约空间占用，只要每一笔交易都符合 1P1C 范式。

### Ark

并非所有交易都符合 1P1C 范式。一个主要的例子就是 [Ark](https://bitcoinops.org/en/topics/ark/) 输出，它承诺的是一棵由预签名的（或者被限制条款锁定的）交易组成的树；这棵树可以使一个共享 UTXO 的内部状态完全展开。

如果一个 Ark 服务供应商（ASP）离线了，或不处理某一笔交易，用户可以选择单方面退出，那么这名用户需要提交一系列的交易，以展开自己在交易树上的分支。这需要 O(logn) 笔交易。如果其他用户也在同一时间尝试离开这棵树，导致超过了交易池的限制，或产生了相互冲突的交易但都不足以及时进入区块，问题就会变得更加复杂。如果单方退出的相关交易经过了特别长的时间窗口都没有得到区块确认，这个 APS 就可以单方面取走这棵交易树上的所有资金、导致用户资金损失。

理想情况下，一棵 Ark 树的单方面退出应该是这样的：

1. 发布从树根（Ark 输出）到最底层的虚拟 UTXO（vUTXO）的完整默克尔分支
2. 构成分支的每一笔交易都是 0 费率的，以避免手续费预测以及提前确认由谁来支付手续费
3. 最终的叶子交易有一个 0 价值的锚点，并被单方退出的用户所花费，从而为整个默克尔分支 CPFP 支付手续费，让整个默克尔分支可以进入矿工的交易池然后进入区块

为了塑造这样的理想情形，我们还缺少一些东西：

1. 通用的交易包转发。当前，我们还没有方法，能在这个 P2P 网络中可靠地转发由 0 费率交易构成的交易链条。
2. 如果太多分支以较低费率发布，某些用户可能无法及时发布自己的分支，因为已有的发布已经触及了后代交易的数量限制。这可能会变成灾难，如果 Ark 的参与者数量变得很大，就像理想化的 Ark 使用场景中那样。
3. 我们需要通用的亲属驱逐。而且当前，还不能为无价值的锚定支持  0 价值的输出。

反过来，我们可以尝试将所需的交易结构尽可能放进 1P1C 范式中，代价是一些额外的手续费。所有的 Ark 树交易（从树根开始），都设为 TRUC 交易，并添加一个最小价值的 P2A 输出。

当一个用户决定单方面从一棵 Ark 树退出，这名用户需要发布根交易以及花费其 P2A 输出、追加手续费的交易，然后等待确认。一旦根交易得到确认，就发布他们在默克尔分支上的下一笔交易，以及花费其 P2A 输出、追加手续费的交易（然后等待确认）。以此类推，直到发布整个默克尔分支、从 Ark 树中安全地取回自己的资金。同一棵 Ark 树的其他用户可能恶意或者以外地提交相同的交易、并使用太低的费率，但亲属驱逐保证了，在每一步中，低于 1kvB 的诚实子交易总是能 RBF 相互竞争的子交易，既不需要锁定所有其它输出，也不需要设置多个锚点输出。

假设交易树的形式是二叉树，相比理想化的 Ark，第一位退出的用户需要多占用接近 100% 的 vbyte；如果是完全展开整棵树，则需要多占用大约 50% 的 vbyte。如果是四叉树，展开整棵树可以降低到只多占用大约 25% 的 vbyte。

### 闪电通道拼接

其它类型的拓扑也出现在更高级的闪电网络构造中，可能需要一些工作来匹配 1P1C 交易包转发。

闪电网络中的 “[通道拼接](https://bitcoinops.org/en/topics/splicing/)” 是一种新兴的标准操作，而且已经被使用了。每一次拼接都会花费原有的注资输出、将合约中的资金重新存入一个新的注资输出，并为两个注资输出准备相同的预签名承诺交易链条。在拼接交易还未确认的时候，基于原注资输出和通道状态和新注资输出的通道状态是同时签名和追踪的。

会超出 1P1C 范式的一个例子是这样的：

1. Alice 和 Bob 为一条通道注资。
2. Alice *拼出* 一些资金给一个由 Carol 控制的链上资金，Carol 正在使用一组冷密钥，所以无法 CPFP。而这笔拼接交易就在那里等待确认等了几个驾驽车。
3. Bob 的节点离线了，或出于什么原因强制关闭了通道。
4. 费率的暴涨（可能又有什么 token 发售了），将这笔拼接交易的确认进一步推迟。

Alice 希望给 Caol 的链上支付尽快发生，所以她不会拿没有发生拼接的承诺交易上联。这意味着，拼接交易 -> 承诺交易 -> 锚点花费变成了需要传播的交易包。

反过来，让我们看看怎么把它放进 1P1C 范式中，同时减少不必要的空间占用。闪电钱包可以为一笔链上支付运行两次（而不是一次）通道拼接，那么这两笔拼接交易就会相互冲突。其中一个版本使用由费率估算器选出的相对保守的费率，而另一个版本可以包含一个 240 聪的 P2A 输出（或者 0 聪的 P2A 输出，在有了 “[临时锚点](https://bitcoinops.org/en/topics/ephemeral-anchors/)” 之后）。

首先，广播没有锚点的拼接交易。

如果没有发生费率暴涨，该交易会得到确认，然后 Alice 可以按需继续强制关闭通道，就像正常情形。

如果手续费市场突发变化，导致第一笔拼接交易等待了太长时间，那么就广播带有锚点的拼接交易以及花费锚点的子交易（作为 1P1C 交易包），从而使用交易包 RBF 替代掉第一笔拼接交易。这一手续费追加将让给 Carol 的支付得到确认，然后 Alice 可以按需继续强制关闭通道。

拼接交易的更多副本可以使用多种费率水平，但要提醒的是，每多一个副本，就需要多一组承诺交易的签名，以及对承诺交易中给出的 HTLC（offered HTLC） 的签名。

（完）