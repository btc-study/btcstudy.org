---
title: '闪电发票（invoice）与 LNURL'
author: 'LND'
date: '2022/01/07 12:24:33'
cover: ''
excerpt: '学习如何辨别、解码和创建闪电网络发票'
categories:
- 闪电网络
tags:
- 闪电网络
---


> *作者：LND*
> 
> *来源：<https://docs.lightning.engineering/the-lightning-network/lightning-overview/understanding-lightning-invoices>*



（译者注：闪电网络的 invoice 用于请求支付，支付的接收方通过 invoice 向发起方提供必要的信息，以协助支付。可以理解为支付软件中常用的 “收款码”。）

闪电网络发票（Lightning invoice）是由 [BOLT 11 标准](https://github.com/lightningnetwork/lightning-rfc/blob/master/11-payment-encoding.md)定义的对象。“BOLT” 是 “Basis of Lightning Technology（闪电网络技术基础）” 的缩写，覆盖了闪电网络的所有技术规范。BOLT 规范是让各个实现既能独立运作，又能形成同一个网络并彼此交互的关键。因此，只要遵循这个规范，任何客户端和工具创建的闪电发票都可以被其它实现理解。

## 闪电发票的案例

```json
lnbc20m1pvjluezpp5qqqsyqcyq5rqwzqfqqqsyqcyq5rqwzqfqqqsyqcyq5rqwzqfqypqhp58yjmdan79s6qqdhdzgynm4zwqd5d7xmw5fk98klysy043l2ahrqsfpp3qjmp7lwpagxun9pygexvgpjdc4jdj85fr9yq20q82gphp2nflc7jtzrcazrra7wwgzxqc8u7754cdlpfrmccae92qgzqvzq2ps8pqqqqqqpqqqqq9qqqvpeuqafqxu92d8lr6fvg0r5gv0heeeqgcrqlnm6jhphu9y00rrhy4grqszsvpcgpy9qqqqqqgqqqqq7qqzqj9n4evl6mr5aj9f58zp6fyjzup6ywn3x6sk8akg5v4tgn2q8g4fhx05wf6juaxu9760yp46454gpg5mtzgerlzezqcqvjnhjh8z3g2qqdhhwkj
```

## URI 方案

闪电发票可能会以 `lightning:` 为前缀，表示成超链接，软件可以此支付发票。理想情况下，搭配 URI 方案，如果你在网络上点击了一个闪电网络链接，你的浏览器或操作系统会引导你选择闪电网络钱包并给这个发票支付。

## 闪电发票

闪电发票包含了一段可以理解的信息和一段数据。

### 大小写敏感

闪电发票跟其它 bech32 编码的字符串一样，通常全部都是小写。不过，如果在二维码中只编码大写字符，将有非常大的空间效率提升，这就是为什么你可能经常遇到大写的闪电发票。闪电发票二维码只解码为大写字符可能也是这个原因。

### 前缀

闪电发票以闪电网络的缩写 `ln` 为开头。这遵循了 [BIP173](https://github.com/bitcoin/bips/blob/master/bip-0173.mediawiki) 为原生隔离见证地址设计的两字母代号，比如  ` bc ` 表示比特币地址， ` tb ` 表示测试网比特币地址， ` bs ` 是比特币 signet 地址， ` bcrt ` 表示比特币支付请求。因为闪电发票也是 [Bech32](https://github.com/bitcoin/bips/blob/master/bip-0173.mediawiki) 编码的，所以它也需要在末尾加入合适的校验和。

### 数额

前缀后面的就是数额。虽然标准的闪电发票会包含一个数额，也可以创建不带数额的发票。闪电发票的单位是 bitcoin，而不是 satoshi（聪）。为了降低发票的体积（发票需要在节点间路由），数额后面往往有一个乘数。举个例子，一聪在闪电发票中将表示为  ` 10n ` ，一百聪将表示为 ` 1u ` ，而十万聪将表示为 ` 10p ` 。

| 单位      | 乘数  | 聪      |
| --------- | ----- | ------- |
| m (milli) | 0.001 | 100,000 |
| u (micro) | 1E-06 | 100     |
| n (nano)  | 1E-09 | 0.1     |
| p (pico)  | 1E-12 | 0.0001  |

前缀和数额是可以直接看懂的，所以懂行的用户可以立即辨认出这是一个闪电发泼，并推断出数额的大小。

### 时间戳

数据部分的第一部分就是一个 unix 的时间戳。

### 标签

有许多标签来表示额外的数据。其中一些是必需的，但也有一些是支付的接收方可选添加的。

- `p` (1)：256 比特的 SHA256 支付哈希值。后面，该哈希值的原像将被揭开，作为支付流程的一部分，也可以用作支付证明（译者注：此哈希值用于哈希时间锁）。
- `s` (16)：一个 256 比特的秘密值，用来防止转发交易的节点探测支付的接收方。
- `d` (13)：备注，可添加对支付目的的简短描述，以 UTF-8 编码，例如 “1 cup of coffee” 或者 “一杯咖啡”。如果并未设置这个字段，则必须使用标签 h。
- `n` (19)：可在此处包含接收节点的 33 字节的公钥。
- `h` (23)：如果 d 的空间不公，可以在此处包含更长描述的哈希值。至于完整的描述如何沟通，则不在此处定义。
- `x` (6)：以秒为单位的支付超时时间。
- `c` (24)：路由中最后一个 HTLC 的最小 CLTV 超时时间（min_final_cltv_expiry）。一般默认为 18。
- `f` (9)：可在此处包含一个备用的链上地址，应对闪电支付失败的情形（无论什么原因）。
- `r` (3)：可在此处包含一条乃至多条记录，在隐私路由中包含额外的路由信息。这些路由线索包括： 
  - 公钥（264 位）
- 简短的通道 id（64 位）
  - fee_base_msat（32 位，大端序）
- fee_proportional_millionths（32 位，大端序）
  - CLTV 超时 delta，（16 位大端序）
- ` 9 ` (5)：一个或多个 5 字节的数值，包含接收该支付所需的特性

### 签名

最后，发票将包含一个签名。这个签名应是发票中包含的公钥的签名。

## LNURL

闪电网络 URL（LNURL），是一套闪电支付者和接收方[的交互标准提议](https://github.com/fiatjaf/lnurl-rfc)。

简而言之，一个 LNURL 是一个 bech32 编码的 url，其前缀是 lnrl。闪电钱包可以解码这个 url，连接这个 url，等到传回一个 json 对象的进一步指令，指令中最明显的是一个定义这个 lnurl 行为的标签。

LNURL 最常用于初始化钱包和创建静态的支付链接。

## 闪电发票解码

你可以使用命令 ` lncli decodepayreq ` 来解码任意闪电发票、了解其含义。

上文的那个例子，解码结果为：

```json
{
    "destination": "03e7156ae33b0a208d0744199163177e909e80176e55d97a2f221ede0f934dd9ad",
    "payment_hash": "0001020304050607080900010203040506070809000102030405060708090102",
    "num_satoshis": "2000000",
    "timestamp": "1496314658",
    "expiry": "3600",
    "description": "",
    "description_hash": "3925b6f67e2c340036ed12093dd44e0368df1b6ea26c53dbe4811f58fd5db8c1",
    "fallback_addr": "1RustyRX2oai4EYYDpQGWvEL62BBGqN9T",
    "cltv_expiry": "9",
    "route_hints": [
        {
            "hop_hints": [
                {
                    "node_id": "029e03a901b85534ff1e92c43c74431f7ce72046060fcf7a95c37e148f78c77255",
                    "chan_id": "72623859790382856",
                    "fee_base_msat": 1,
                    "fee_proportional_millionths": 20,
                    "cltv_expiry_delta": 3
                },
                {
                    "node_id": "039e03a901b85534ff1e92c43c74431f7ce72046060fcf7a95c37e148f78c77255",
                    "chan_id": "217304205466536202",
                    "fee_base_msat": 2,
                    "fee_proportional_millionths": 30,
                    "cltv_expiry_delta": 4
                }
            ]
        }
    ],
    "payment_addr": null,
    "num_msat": "2000000000",
    "features": {
    }
}
```

## 延伸阅读

[BIP173 定义的 BECH32 编码方式](https://github.com/bitcoin/bips/blob/master/bip-0173.mediawiki)

[BOLT11 规范和案例](https://github.com/lightningnetwork/lightning-rfc/blob/master/11-payment-encoding.md)

[实现案例](https://github.com/rustyrussell/lightning-payencode)

[解码闪电发票的工具](https://bitcoincore.tech/apps/bolt11-ui/index.html)

（完）

