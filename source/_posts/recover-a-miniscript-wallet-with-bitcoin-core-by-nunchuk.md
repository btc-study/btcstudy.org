---
title: '在 Bitcoin Core 中复原一个 Miniscript 钱包'
author: 'Nunchuk'
date: '2025/11/18 11:59:26'
cover: ''
excerpt: '如何在 Bitcoin Core 中复原和花费一个 Miniscript 钱包'
tags:
- Miniscript
- 描述符
---


> *作者：Nunchuk*
> 
> *来源：<https://nunchuk.io/blog/miniscript-wallet-recovery>*



![Miniscript_recovery_header_30317936a1](../images/recover-a-miniscript-wallet-with-bitcoin-core-by-nunchuk/Miniscript_recovery_header_30317936a1.webp)

`Nunchuk` 软件钱包建立在公开的标准和可以互操作的数据格式上，这意味着，你使用 `Nunchuk` 软件建立的钱包总是可以在其它开源的比特币工具上复原出来，也包括在 [Bitcoin Core](https://bitcoincore.org/) 软件上。本指南解释了如何在 `Bitcoin Core` 中（使用它的 “描述符” 和 “ PSBT ” 特性）复原和花费一个 Miniscript 钱包（译者注：指在建立过程中使用了 Miniscript 编程语言的钱包；在创建完成后，这样的钱包的描述符将带有 Miniscript 代码）。

Bitcoin Core 从 V24 开始就添加了基础的 Miniscript 支持，允许复原在 `Nunchuk` 中建立的高级钱包策略，比如多签名和时间锁脚本。V29 以及更高的版本提升了 Miniscript 处理和描述符钱包，所以，本指南更推荐使用 V29 以及更高版本。

## 概述：两种复原方法

取决于你选择如何签名自己的交易，这里有两种复原方法：

1. **基于硬件签名器的复原（推荐）**：使用你的硬件签名器来复原和安全签名交易。私钥绝不离开你的设备。

2. **基于种子词的复原（仅使用软件）**：在 Bitcoin Core 中直接使用你的钱包种子词或者密钥备份。这需要获得你的钱包中的密钥的 `xprv`（拓展私钥）、用它替换掉你的钱包描述符中对应密钥的 `xpub`（拓展公钥）字符。出于安全性，**请仅在断网和空气隔离（air-gapped）的设备上操作**。

   > 编者注：此处的 “空气隔离” 应指与无任何与联网设备的连接，不论有线或无线。
   >
   > “拓展公钥” 和 “拓展私钥” 并不是指的某一个 公钥/私钥，它是一种格式，用于描述一棵 BIP32 层级式确定性派生密钥树上的一个密钥。拓展 公钥/私钥 包含了这个 公钥/私钥 的许多信息，比如，它是如何派生出来的（派生路径）、它从哪里派生而来（根源密钥指纹），以及如何用它派生子密钥。

## 你需要什么

- 你的钱包的种子词或者硬件签名器（注意，你的钱包可能用到了多个密钥，因此，需要的这些密钥材料可能不止一套）。请确保你的硬件签名器支持 Miniscript 。
- 你在 `Nunchuk` 中获得的钱包配置文件（“ BSMS ” 格式的文件或者描述符文本）
- `Bitcoin Core` 24.0 以上的版本（推荐 29.0 以上的版本）
- （仅为硬件签名器复原方法所需）`HWI`（硬件钱包接口）：要求允许 `Bitcoin Core` 与硬件签名器通信。详见《[HWI 安装指南](https://hwi.readthedocs.io/en/latest/usage/installation.html)》。
- （仅为种子词复原方法所需）一个 “BIP-39 转主密钥” 转换器（比如 [Ian Coleman 的 BIP39 工具](https://github.com/iancoleman/bip39/releases)），务必仅在断网环境下使用。

**要求总结**

| **钱包类型** | **需要的材料**                                               |
| ------------ | ------------------------------------------------------------ |
| 单签名钱包   | 一个种子词或者签名器                                         |
| 多签名钱包   | 能够满足钱包阈值要求数量的 种子词/签名器（比如，若要复原 2-of-3 多签名钱包，任意两个不同密钥的 种子词/签名器 就可满足要求） |
| Miniscript   | 满足 Miniscript 花费要求数量的 种子词/签名器                 |

## 步骤 1：安装 `Bitcoin Core` 并同步比特币区块链

先安装 `Bitcoin Core` 并确保你的节点已经完全同步了区块链，然后才能继续。

```
bitcoind -daemon
```

> 编者注：此为安装好 `Bitcoin Core` 之后，在命令行环境中启动 `Bitcoin Core` 并要求后台运行的命令。在 Windows 系统中，可通过 `Terminal`（终端）进入这样的命令行环境；但是，较老版本的 `Bitcoin Core` 在 Windows 系统中可能无法后台运行，为此，可直接输入以下命令，按下回车执行：
>
> ```
> bitcoind
> ```
>
> 如果你不习惯命令行环境，也可以运行 `Bitcoin Core` 的图形界面。在图形界面中，也可以使用 “控制台” 菜单来输入指南中提到的命令（无需前面的 `bitcoin-cli`）。

用以下命令检查同步状态：

```
bitcoin-cli getblockchaininfo
```

> 编者注：如果以非后台模式运行，这意味着你需要打开一个新的命令行环境窗口来输入以上命令。

等待出现 `"initialblockdownload": false` 这样的字样（表示同步完成）。

## 步骤 2：（仅限种子词复原方法）获得私钥

如果你准备使用硬件签名器复原方法（建议），请跳到 “步骤 3 ” 。

如果你要执行仅使用软件的复原方法，你必须先获得跟你的钱包有关的密钥的托管私钥（`xprv`）。这是必要的，因为 `Bitcoin Core` 的描述符钱包并不直接支持 BIP-39 种子词；它需要拓展密钥（`xpub` 或者 `xprv`）。

> **安全警告**：本节所述的流程会导致你的私钥暴露。强烈建议在一台断网而且空气隔离的电脑上执行。绝对不要在任何联网的工具上输入你的种子词或者私钥！

这个过程需要使用一种断网的派生工具，比如 [Ian Coleman 的 BIP39 工具](https://github.com/iancoleman/bip39/releases)。请确保你下载和使用的是离线版本。

### A. 定位你的派生路径

首先，观察你的钱包配置文件，找出你需要复原的密钥的派生路径。或者，在描述符内寻找密钥的来源信息。

例如：

```
[a3b12f34/48h/0h/0h/2h]xpub6DT5...
```

这样的文字，就表明这个拓展公钥（`xpub`）是由指纹为 `a3b12f34` 的主公钥经过 `m/48'/0'/0'/2'` 的派生路径派生出来的。

*注意，字符 `h` 或者 `'` 表明它用到了 “硬化的派生路径”；Ian Coleman 的 BIP39 工具仅支持使用硬化派生路径。*（编者注：在 BIP-32 层级式确定性密钥派生方法中，常规派生可以仅使用父公钥来派生子公钥；但硬化派生路径则必须有父私钥的参与，才能派生硬化的子公钥）。

### B. 获得密钥材料

这一步骤的具体操作取决于你的备份形式：

**标准的 BIP39 种子词**

如果你还持有 12 词或者 24 词的种子词，它就可以作为你的根源密钥材料。

**TAPSIGNER 备份**

“ Tapsigner ”不使用 BIP39 种子词。你必须从备份文件中抽取出根源主私钥 `xprv`。

- 找出由 Tapsigner 提供的加密备份文件。
- 找出备份口令（印在 Tapsigner 卡片的背面）。
- 使用备份口令解密备份文件。
- 解密出来的数据就包含所需的 `xprv...` 字符串。

要了解解密 Tapsigner 备份文件的详细指令，请看《 [Tapsigner 新手指南](https://nunchuk.io/start#tapsigner-backup)》。

### C. 派生出钱包具体使用的私钥

现在，使用离线的派生工具（比如前述的 Ian Coleman 的 BIP39 工具）来计算钱包具体用到的 `xprv` 子私钥。

1. 打开离线工具。
2. 输入你的根源密钥材料：
   - **如果你用的是种子词**：在 “ BIP39 Mnemonic ” 输入框输入你的 12 词或者 24 词种子词。
   - **如果你用的 Tapsigner（根密钥 xprv）**：复制你抽取出来的根密钥 xprv 字符串到 “ BIP32 Root Key ” 输入框（注意，要保证 “ BIP39 Mnemonic ” 输入框是空的。）
3. 移动到 “ Derivation Path ”部分，选择 BIP32 标签。
4. 将你在 “步骤 A ” 中得到的 “派生路径”（比如 `m/48'/0'/0'/2'`）输入 “ BIP32 Derivation Path ” 输入框中。
5. 最终，“ BIP32 Extended Private Key ”输出框会显示派生出来的 xprv ，这就是你在 “步骤 3 ” 中需要的东西。

![large_bip39_1_92c2e64c91](../images/recover-a-miniscript-wallet-with-bitcoin-core-by-nunchuk/large_bip39_1_92c2e64c91.png)

![large_bip39_2_023af2e34b](../images/recover-a-miniscript-wallet-with-bitcoin-core-by-nunchuk/large_bip39_2_023af2e34b.png)

## 步骤 3：审核及准备你的钱包描述符

打开你的 `Nunchuk` 钱包配置文件并找出你想要复原的钱包的描述符。

### 处理钱包配置文件格式

- 如果你的配置文件是 [BSMS（比特币安全多签名装置）格式](https://github.com/bitcoin/bips/blob/master/bip-0129.mediawiki)，你将在文件的第二行找到钱包描述符（或者，如果你使用了加密模式，则是第三行）。
- 如果你的配置文件直接是描述符格式，那么文件的所有内容就是你的钱包描述符。

对于 Miniscript 钱包，`Nunchuk` 使用了 “多路径的描述符”（以 `/<0;1>/*` 结尾），这也是 `Bitcoin Core` 直接支持的形式。在这种形式下，单个描述符就同时涵盖了收款地址（0）和找零地址（1）。

描述符案例：

```
wsh(and_v(v:pkh([a3b12f34/84h/1h/0h]xpub6DT5.../<0;1>/*),older(1000)))#checksum
```

### 导入的准备工作

取决于你使用的复原方法，你要准备不同的事项：

- **基于硬件签名器的复原方法**：直接使用钱包描述符，无需改动。
- **基于种子词的复原方法**：将钱包描述符中的各 `xpub`（拓展公钥）替换成你在 “步骤 2 ” 中得到的对应密钥的 `xprv`（拓展私钥）。 确保钱包来源信息（方括号中的部分，比如 `[a3b12f34/84h/1h/0h]`）保持不变。

### 关于检验和的重要提醒（仅限种子词复原法）

只要你修改了描述符（例如，将 `xpub` 替换成了对应的 `xprv`），那么最初的描述符的校验码（checksum）就失效了。而在导入描述符的时候，`Bitcoin Core` 要求描述符的校验码是有效的。

使用 `Bitcoin Core` 为修改后的描述符计算新的校验码（例如）：

```
bitcoin-cli getdescriptorinfo "wsh(and_v(v:pkh([a3b12f34/84h/1h/0h]xprvA1amWrohy…/<0;1>/*),older(1000)))"
```

结果是：

```
{
  "descriptor": "wsh...",
  "checksum": "#NEW_CHECKSUM",
  "isrange": true,
  "issolvable": true,
  "hasprivatekeys": true
}
```

输出的 `"checksum"` 字段就包含了新的校验码。将这个新的校验码替换到修改后的描述符中。

带有新的校验码的修改后的描述符：

```
"wsh(and_v(v:pkh([a3b12f34/84h/1h/0h]xprvA1amWrohy…/<0;1>/*),older(1000)))#NEW_CHECKSUM"
```

## 步骤 4：创建和导入钱包

使用准备好的描述符，向 `Bitcoin Core` 创建和导入你的钱包。首先，创建一个空的、基于描述符的钱包。

- 若使用基于硬件的复原方法，请创建一个 “仅观察钱包”（`disable_private_keys=true`）：

  ```
  bitcoin-cli createwallet "my_recovered_wallet" true true "" false true
  ```

- 若基于种子词，请创建一个标准钱包（`disable_private_keys=false`）

  ```
  bitcoin-cli createwallet "my_recovered_wallet" false true "" false true
  ```

  > 编者注：命令中以双引号包起来的部分 `"my_recovered_wallet"` 是给这个新钱包的命名，可以自由修改。

输出是：

```
{
  "name": "my_recovered_wallet",
  "warning": "Empty string given as passphrase, wallet will not be encrypted.\nWallet is an experimental descriptor wallet"
}
```

然后，就导入钱包描述符。因为我们使用了一个带有范围的描述符（`/<0;1>/*`），所以只需要导入一次就够了。

```
bitcoin-cli -rpcwallet=my_recovered_wallet importdescriptors "[{\"desc\":\"WALLET_DESCRIPTOR_WITH_CHECKSUM\", \"timestamp\":\"now\", \"active\":true}]"
```

> 编者注：`"WALLET_DESCRIPTOR_WITH_CHECKSUM\"` 部分要替换成你在 “步骤 3 ” 中最终得到的描述符。

输出：

```
[
  {
    "success": true,
    "warnings": [
      "Not all private keys provided. Some wallet functionality may return unexpected errors"
    ]
  }
]
```

*注：如果你导入的描述符还带有 `xpub`，比如你使用的是硬件签名器复原法，则出现 “ `Not all private keys provided` （并未提供钱包内所有密钥的私钥）” 的警告是意料之中的；但如果你导入的描述符只有 `xprv`，则应该不会出现这样的警告。*

验证你的钱包已经正确导入，而且软件所生成的地址与你预期的一致：

```
bitcoin-cli -rpcwallet=my_recovered_wallet listdescriptors
bitcoin-cli -rpcwallet=my_recovered_wallet getbalance
bitcoin-cli -rpcwallet=my_recovered_wallet getnewaddress
```

> 编者注：`-rpcwallet=` 后面应使用你给钱包的命名。第一条命令是列出该钱包的描述符；第二条命令是了解该钱包的余额；第三条命令则是生成一个新的地址。

## 步骤 5：创建、签名和广播一笔交易

现在，你的钱包激活了，你可以创建一笔交易来花费资金了。

> 编者注：在确保你的钱包已经正确导入之后，也可以通过图形界面来加载钱包和使用它，这样更加简单，也更不容易出错。

### 创建一个 PSBT（待签名的比特币交易）

```
bitcoin-cli -rpcwallet=my_recovered_wallet walletcreatefundedpsbt '[]' \
'{"bc1qdestinationaddress...":0.001}' 0 '{"fee_rate":2.0}'
```

输出：

```
{
  "psbt": "cHNidP8BAH0CAAAAA...",
  "fee": 0.00000324,
  "changepos": 1
}
```

这就创建好了可以签名的 PSBT（在 `"psbt"` 字段中出现的字符串就是）。

### 可选：从一个带有时间锁的花费路径花费

如果你的 Miniscript 花费策略包含了时间锁条件，比如 `older(n)` 或者 `after(n)`，在创建交易时，你必须满足这些条件。

**绝对时间锁 —— `after(n)`（BIP-65）**

绝对时间锁会阻止在某个 区块高度/时间点 到来之前的花费动作。你必须将交易的 `locktime` 字段设置为大于等于 `n` 的数值。

- **区块**：如果 `n < 500,000,000` ，这个时间锁会被解释为由区块高度定义。
  - 例如，`after(840000)` 表明资金只能在高度 840000 及以后的区块中花费。
- **时间点**：如果 `n ≥ 500,000,000`，这个数值会被解释为一个 Unix 时间戳。
  - 例如，`after(1893456000)` 表明资金只能在 2030 年 1 月 1 日之后花费。

如果要从带有绝对时间锁的路径中花费（例如，将交易的 `lncoktime` 设置为 `1893542400` —— 2023 年 1 月 2 日的 0 时 0 分 0 秒，GTM+0 时间）：

```
bitcoin-cli -rpcwallet=my_recovered_wallet walletcreatefundedpsbt '[]' \
'{"bc1qdestinationaddress...":0.001}' 1893542400 '{"fee_rate":2.0}'
```

你可以这样检查区块高度：

```
bitcoin-cli getblockcount
```

**相对时间锁 —— `older(n)`（BIP-68）**

相对时间锁会限制一个 UTXO 在到达特定年龄之前被花掉。所需的 `n` 必须在输入的 `sequence` 字段编码。

`n` 的含义也取决于其数值大小：

- **区块**：如果 `n < 0x40000000`（十进制下是 `1073741824`），那就解释为区块数量。每 1 数字单位 = 1 个区块（而一个区块的生产时间大概是 10 分钟）。
  - 例如，`older(1000)` 就表示，一个 UTXO 必须在其得到区块确认（生成）之后，经过 1000 个区块（大约 1 周），才能花费。
- **时间**：如果 `n ≥ 0x40000000`，那就解释为时间长度。每 1 数字单位 = 512 秒（大约是 8.5 分钟）。
  - 例如：`older(1073741854)` 意味着一个 UTXO 在其诞生的 30 个时间单位之后才能花费（30 * 512 秒 ~= 4 小时 15 分钟）。

若要花费带有相对时间锁的路径：

1. 确保 UTXO 的年龄已经满足要求。

2. 在创建 PSBT 时，在具体输入的 `sequence` 字段包含所需的 `n`。这需要手动指定输入。

   ```
   bitcoin-cli -rpcwallet=my_recovered_wallet walletcreatefundedpsbt \
     '[{"txid":"<txid>","vout":0,"sequence":n}]' \
     '{"bc1qdestinationaddress...":0.001}' 0 '{"fee_rate":2.0}'
   ```

如果你太早尝试花费，这笔交易会被网络拒绝，故障码是这样的：

```
non-BIP68-final (code 64)
```

*注：使用时间锁分支是可选的。只有你的钱包脚本（或者说你的 Miniscript 花费策略）要求的时候，才需要在创建交易时包含这些参数。*

### 签名 PSBT

取决于你的复原方法：

**选项 1：使用硬件签名器签名（推荐）**

确保已经安装好了 `HWI` 。连接你的硬件签名器到运行 `Bitcoin Core` 的电脑。如果你的设备有 PIN 码或者口令，你可能需要先解锁设备。使用下列命令来列出所有已经连接且解锁的硬件签名器：

```
hwi enumerate
```

输出：

```
[{"type": "coldcard", "model": "coldcard", "label": null, "path": "1-4:1.3", "needs_pin_sent": false, "needs_passphrase_sent": false}]
```

*注意：`HWI` 主要支持带有 USB 连接的硬件签名器。Tapsigner 使用 NFC，所以无法连接到 `HWI` 。如果你的签名条件依赖于一个 Tapsigner ，你可以[将 Tapsigner 的私钥导入一个 Coldcard 签名器](https://coldcard.com/docs/master-seed/#import-from-tapsigner-to-coldcard)，然后使用 Coldcard 连接 HWI 来签名。*

**Miniscript 登记和固件**

有些硬件签名器会要求先在设备中登记 Miniscript 钱包，然后才能用来签名交易。此外，你可能需要升级签名设备的固件到支持 Miniscript 的版本。看看硬件制造商的手册吧。

**案例：在 Coldcard (Mk4 Q) 签名器中登记一个 Miniscript 钱包**

1. **升级固件**：确保你的设备固件支持 Miniscript（[Coldcard 最新固件](https://coldcard.com/downloads/edge)）
2. **准备 MicroSD 卡**：使用 FAT12 或者 FAT32 文件系统格式化一个 microSD 卡（最大支持 32 GB）。
3. **导出描述符**：将最初的钱包描述符（没有任何修改的版本）保存为一个 `.txt` 文件，然后复制这个文件到 microSD 卡。
4. **导入 Coldcard**：
   - 将 microSD 卡插入你的 Coldcard 。
   - 在 Coldcard 中，选择 `Settings` > `Miniscript` > `Import` 。
   - 选择 “ (1) to import the Miniscript wallet file from the SD Card（从 SD 卡导入 Miniscript 钱包文件）”。

**签名交易**

在已经连接电脑的设备上签名 PSBT 。将以下命令中的 `<device_type>`（设备类型）替换成你在上文的 `hwi enumerate` 命令中得到结果（例如 `coldcard`、`jade`、`ledger`），将 `<psbt_string>` 替换成你在前面步骤中生成的 PSBT 。

```
hwi --device-type <device_type> signtx <psbt_string>
```

结果：

```
{
  "psbt": "cHNidP8BAH0CAAAAAT+..."
}
```

如果你使用的是多签名钱包，或者多密钥的 Miniscript 花费条件，你就要重复上述步骤，直到攒够签名数量：每使用一个签名器完成签名（生成一个新的 PSBT），就将这个新的 PSBT 传递给下一个签名器。

*注意：如果你无法按顺序签名（也即，每一个签名器都独立签名原始的 PSBT，而不是经过上一个签名器签名的 PSBT ），你可以将包含不同签名的 PSBT 都收集起来，使用下列命令合并成一个最终的 PSBT* ：

```
bitcoin-cli combinepsbt '["psbt1","psbt2"]'
```

**选项 2：使用 Bitcoin Core 来签名（基于种子词的方法）**

如果你向 `Bitcoin Core` 直接导入了私钥（`xprv`）（将下列命令中的 `<psbt_string>` 替换成你在一开始创建的 PSBT）：

```
bitcoin-cli -rpcwallet=my_recovered_wallet walletprocesspsbt "<psbt_string>"
```

输出：

```
{
  "psbt": "cHNidP8BAH0CAAAAAT+...",
  "complete": true
}
```

### 敲定交易并广播

一旦你的 PSBT 到了完成阶段（`"complete"` 字段的数值是 `true`），你就可以敲定它并抽取出交易的十六进制形式：

```
bitcoin-cli -rpcwallet=my_recovered_wallet finalizepsbt "<signed_psbt>"
```

结果：

```
{
  "hex": "02000000000101...",
  "complete": true
}
```

最后，广播这个十六进制形式的交易（即上面结果 `"hex"` 字段的数值）到网络中：

```
bitcoin-cli sendrawtransaction "<raw_transaction_hex>"
```

输出（交易 ID）：

```
b91276af8b6f5ede632aadfb87bf8a9209a43d0a030396cd0c4629a1ec92b87a
```

## 步骤 6：清理

在确认复原成功、钱包中的资金都已经成功转出之后，应该安全地删除你的临时钱包和文件，尤其是你使用了基于种子词的复原方法的话。

首先，在 `Bitcoin Core` 中卸载钱包：

```
bitcoin-cli -rpcwallet=my_recovered_wallet unloadwallet
```

然后，你可以移除这个钱包的目录：

```
rm -rf ~/.bitcoin/wallets/my_recovered_wallet
```

> 编者注：上面这条命令主要用于 Linux 系统。在 Windows 系统中，你可以找出钱包文件的目录并手动删除。

（完）