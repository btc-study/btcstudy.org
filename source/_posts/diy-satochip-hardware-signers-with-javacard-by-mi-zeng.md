---
title: '基于 JavaCard 自制 Satochip 硬件签名器'
author: 'Mi Zeng'
date: '2026/10/02 15:24:51'
cover: ''
excerpt: '本文将提供一种以极低成本 DIY 卡片式硬件签名器的方法'
tags:
- 实践
---


> *作者：Mi Zeng*

在硬件签名器生态里，卡片式设备是一个很特别的存在。它们没有屏幕，没有电池，薄薄一张塞进钱包，外表和普通的银行卡、门禁卡几乎看不出区别。市面上这类成熟产品并不少见：25 欧元的 Satochip、28 美元的 Keycard、30 美元的 Tangem、69 美元的 CoolWallet Go、99 美元的 Arculus，还有 Coinkite 专为比特币设计的 TapSigner（28 美元）。

尽管各家在底层安全模型、多签策略与通信协议上各有取舍，但核心逻辑完全相通：将私钥派生与签名计算隔离在卡内的安全芯片中，自身不设电源，完全依赖外部手机的 NFC 射频场或电脑读卡器供电并通信。

本文将提供一种以极低成本 DIY 卡片式硬件签名器的方法，通过将开源的 Satochip 固件刷进一张空白的 JavaCard，最低只需要花二三十块人民币，你就能做出一张真正意义上的硬件签名器。

## JavaCard 与 Satochip 简介

JavaCard 本质上是**一台被封装进卡片里的微型安全计算机**。它拥有独立的处理器、内存（RAM）和闪存空间（Flash），并运行着轻量级的 Java Card 操作系统与 GlobalPlatform 管理平台。像本教程使用的这类面向金融安全的 JavaCard，其芯片通常属于高安全等级的微控制器（Secure Element），内部集成了独立的硬件密码学协处理器（支持硬件级 SHA、ECC、RSA 运算），能够在芯片内部独立完成高强度的私钥运算与离线签名。

如果用智能手机来类比，它们的关系非常相似：

* **智能手机**：芯片硬件 → 操作系统（如 Android）→ 各类独立 App
* **安全卡片**：安全芯片 → JavaCard 操作系统 → 各种小程序（Applet）

卡片平时处于休眠状态。当把它插入读卡器时，金属触点通过物理针脚直接供电，贴在手机上时通过 NFC 无线感应供电。通电激活后，外部设备通过一条条标准指令（APDU）与芯片通信。

我们买到的 “空白 JavaCard”，并不是物理意义上一无所有的白纸，而是出厂时芯片厂商已经刷好了操作系统和安全管理环境，只是里面还没部署具体的业务小程序。这张卡片既可以用来装载身份认证、支付、门禁应用，也可以安装一套密码学货币钱包。

[Satochip](https://satochip.io/) 就是比利时公司 Satochip S.R.L. 出品的一套开源卡片式硬件签名方案，遵循 AGPLv3 开源协议。它的核心就是一个运行在 JavaCard 里的钱包小程序（Applet），固件安装包格式为 `.cap`。官方不仅公开了全部代码，还在官网提供了专门的 [DIY 指南](https://satochip.io/build-your-own-satochip-hardware-wallet/)与兼容[白卡](https://satochip.io/product/card-for-diy-project/)。

我们要做的事很简单：挑选一张兼容的空白 JavaCard，用工具把这个 `.cap` 固件刷进芯片，就能以极低的成本做出一张硬件签名卡。听起来很不错。不过在开始进入 DIY 流程之前，你需要提前了解以下这些安全妥协与固有局限：

- **正式版固件长期停滞**。Satochip Applet 最近的正式版本是 2021 年 9 月发布的 v0.12。之后的 v0.14 和 v0.15 一直标着预发布（Pre-release），Taproot 需要的 Schnorr 签名，还有 Nostr 和 MuSig2 这些新功能，都只在预发布版里。这意味着使用正式版固件就用不了 Taproot 地址。
- **预编译 CAP 缺少独立签名验证**。如果你看过其他硬件签名器的 DIY 教程，应该记得其中有一步是验证开发者的签名。Satochip 官方 Release 页面直接提供预编译的 `.cap` 文件，目前没有附带独立的签名或官方校验哈希文件。因此无法对下载的二进制文件单独执行开发者签名验证（对安全要求极高的用户，可以考虑自行编译）。
- **卡上没有独立屏幕**。交易的收款地址、转账金额与找零明细，你只能在电脑或手机屏幕上查看，卡片本身无法提供物理的核对界面。这意味着你必须完全相信屏幕上传递给你的信息是真实的。卡片无法像带屏幕的设备那样，为你提供 “所见即所签” 的最后一道物理防线。
- **助记词依赖外部生成**。Satochip 不在卡片内部自己生成助记词。初次使用时，助记词是由电脑上的钱包软件生成的，或者由你自己手动在键盘上敲进去的。这带来了两层安全妥协：第一，密钥生成的随机性（熵源）完全取决于外部软件，而非卡里的安全芯片；第二，在生成或敲入的那一瞬间，电脑是接触过明文助记词的。相比于大多数助记词 “自始至终绝不接触联网设备” 的硬件签名器，这种方案的信任假设明显更大。

如果这些问题你都能接受，那么，让我们来看看如何 DIY 一张 Satochip 吧。

## 物料与成本

制作一张 Satochip，你需要准备以下硬件。

- **一张兼容的 JavaCard**
  - 市面上的 JavaCard 通常分为三种形态，购买时请仔细分辨：
    * **纯接触式卡**：卡面只有金属触点，内部无天线。只能插在电脑读卡器里用，无法在手机上用 NFC 签名；
    * **纯非接触式卡（纯 NFC）**：卡面无外露金属触点，完全依赖无线感应。无法插入接触式读卡器，但可直接配合后文的 Android 手机 NFC 方案进行刷入与日常签名；
    * **双界面卡（最推荐）**：卡面既有金属触点，内部又封装了射频天线。这是最推荐的形态 —— 初次刷写时走金属触点插槽更加稳定可靠；日常使用时既能插电脑读卡器，又能贴在手机背面通过 NFC 碰一碰签名。
  - **规范与算法要求**：卡片需支持 **JavaCard 3.0.4+** 规范（Satochip v0.12 正式版即基于此环境编译），并具备可用的 GlobalPlatform 内容管理环境。同时芯片必须支持椭圆曲线算法 `secp256k1`，明确支持 `ALG_SHA_512` 和 `ALG_EC_SVDP_DH_PLAIN_XY` 两种密码学算法常量。
  - **推荐型号与避坑**：目前社区测试最充分的是 NXP JCOP4 P71 系列中的 J3R110、**J3R180**（最推荐），以及 JCOP3 P60 的 J3H145。经笔者测试，新款的 J3R452 也同样适合。选购时应选择空白卡或 SECID 版本。需要注意，同样叫 J3R180 的卡存在不同配置，部分 EMV 或 NoECC 版本缺少 Satochip 所需算法，下单前务必向卖家核对具体密码学配置，不能仅凭 “J3R180” 这个型号判断兼容性。
  - **参考成本**：在中国大陆的网购平台购买这类空白 JavaCard，单张成本通常在 20～30 元人民币左右。
  - **务必索取出厂管理密钥**：下单时**务必向卖家索取该批次卡片的出厂管理密钥**（三把密钥：`Kenc`、`Kmac`、`Kdek`）。安全芯片出厂默认锁定，没有这三把密钥就无法通过安全通道认证，卡片将无法安装任何程序。
- **一个 USB 智能卡读卡器**
  - 标准的接触式智能卡读卡器即可。硬件需符合 **PC/SC**、**CCID** 和 **ISO/IEC 7816** 规范，并支持 **T=0 或 T=1** 传输协议。最典型且普及的是 ACS ACR39U 系列，根据款式的不同，价格在人民币几十块钱到一百出头不等。第三方社区教程特别指出常见的 ACS ACR122U 读卡器在刷写时极不稳定、有刷坏卡片的风险，请避开。
  - *提示：如果你的 JavaCard 具备 NFC 功能，且手头有一台支持 NFC 的 Android 手机，也可以完全省去购买 USB 读卡器，直接参考后文介绍的 “Android 手机 NFC 刷入方案”。对于第一次操作，本文仍以电脑 + 接触式读卡器作为标准主流程。*
- **一台电脑**
  - 本文以 macOS 为操作环境，Windows 用户可直接参考 [3rdIteration 的 Satochip-DIY 教程](https://github.com/3rdIteration/Satochip-DIY) 以及 [Satochip 官方 DIY 教程](https://satochip.io/build-your-own-satochip-hardware-wallet/)。Windows 下的核心刷写流程与本文一致，主要区别在于终端环境、路径和少量命令写法。

## 软件环境搭建

在烧录之前，我们需要准备两样软件工具：运行环境 Java，以及智能卡管理工具 GlobalPlatformPro。

### 1. 安装 Java（JDK 17 LTS）

GlobalPlatformPro 是基于 Java 开发的命令行程序，官方明确要求系统需具备 **JDK 17 LTS 或更高版本**。

为了避免各种奇怪的运行时兼容问题，推荐直接安装社区最主流的免费开源版本 **Eclipse Temurin JDK 17**：

* 访问 Adoptium 官方页面（https://adoptium.net/temurin/releases）；
* 版本选择 `JDK17 - LTS`，按照自己的操作系统选择对应的版本。

下载安装包后按默认流程安装。安装完成后打开 macOS 的 “终端”（Terminal），输入命令检查：

```bash
java -version
```

如果终端返回了类似 `openjdk version "17.0.x"` 以及 `Temurin` 的字样，说明 Java 运行环境已经配置就绪。

### 2. 下载 GlobalPlatformPro 与 Satochip 固件

接下来准备烧录所需的文件。

* **GlobalPlatformPro（gp.jar）**
  GlobalPlatformPro（下文简称 `gp`）是 Martin Paljak 维护的开源命令行工具，往 JavaCard 里装程序、删程序都靠它。在 [官网](https://javacard.pro/globalplatform/) 上下载 `gp.jar`。注意：`gp.jar` 是一个自包含的可执行 Java 归档文件，不需要在系统里点安装，下下来直接由 Java 调用。
* **Satochip Applet（.cap 文件）**
  这是真正要写进芯片里的钱包应用。前往 [Satochip 官方的 Applet 仓库](https://github.com/Toporin/SatochipApplet/releases/tag/v0.12)，下载稳定版本的 `.cap` 文件（本教程用到的是 `SatoChip-0.12-05.cap`）。

为了避免路径混乱，建议在系统的 “下载” 目录下建立一个独立的工作文件夹：

```bash
mkdir -p ~/Downloads/satochip-diy
```

把刚才下载好的 `gp.jar` 和 `SatoChip-0.12-05.cap`（文件名视具体版本而定）一并放进这个目录中。

在终端中切入工作目录：

```bash
cd ~/Downloads/satochip-diy
ls
```

确认两个文件都在当前目录下。接着试运行一次 GlobalPlatformPro：

```bash
java -jar gp.jar
```

若终端打印出了 GlobalPlatformPro 的参数帮助列表，而不是报错找不到 jar 文件或找不到 Java，基础环境就算全部打通了。

## 刷入固件

现在，工作文件夹里应该有 `gp.jar` 和 `SatoChip-0.12-05.cap` 两个文件。下面的命令都在这个文件夹里运行，而且请一条一条地运行，看清结果再往下走。

### 第一步：连通读卡器与探针检测

把 USB 智能卡读卡器接在电脑上，按照读卡器外壳上的插卡标识方向，将空白 JavaCard 插入读卡器槽到底，确保芯片金属触点与内部触点正确接触。

在终端执行：

```bash
java -jar gp.jar -r
```

`-r` 即 `--reader`，当不指定具体读卡器名称时，会自动列出当前系统识别到的所有读卡器硬件。如果系统驱动和读卡器正常工作，终端会清晰列出检测到的设备名称，比如：

```text
ACS ACR39U ICC Reader ...
```

如果在这一步卡住或者返回空白，说明操作系统还没有识别读卡器，先换个 USB 接口或排查读卡器连接，不要盲目往下走。

### 第二步：导入卡片管理密钥

JavaCard 是极度注重权限控制的设备，任何人插上卡都不能直接往里面写程序。要想在卡内安装或删除 Applet，必须先通过 GlobalPlatform 规范的安全认证。这套认证依赖三把管理员对称密钥：

* `Kenc`（加密通道密钥）
* `Kmac`（消息完整性认证密钥）
* `Kdek`（敏感数据解密密钥）

在 GlobalPlatformPro 中分别对应环境变量 `GP_KEY_ENC`、`GP_KEY_MAC`、`GP_KEY_DEK`。

在终端中，将卖家提供给你的这三把密钥以环境变量的形式导出：

```bash
export GP_KEY_ENC='你的Kenc内容'
export GP_KEY_MAC='你的Kmac内容'
export GP_KEY_DEK='你的Kdek内容'
```

*注意：单引号的作用是确保变量内容被 Shell 原样接收。复制粘贴时请务必仔细，**切勿在单引号内夹带任何前导或尾随空格**，十六进制字符串中混入空格会导致解析失败。*

导出后，运行以下命令直接打印这三个变量的值进行人工肉眼复核，确认变量已成功写入且内容完整：

```bash
echo "ENC: $GP_KEY_ENC"
echo "MAC: $GP_KEY_MAC"
echo "DEK: $GP_KEY_DEK"
```

**注意：切勿随意猜测或盲目尝试密钥！**  部分卡片内部设有极其严格的认证失败计数限制。一旦连续使用错误密钥耗尽重试次数，卡片管理功能就会触发不可逆锁定。因此，请务必使用卡片卖家提供的确切密钥。

### 第三步：卡片状态预检

在正式刷入固件前，先执行一次探卡命令读取芯片现状：

```bash
java -jar gp.jar -l
```

`-l` 即 List（列出卡片内容）。如果管理密钥正确，终端会列出卡片当前的信息。不用被复杂的十六进制长串吓到，只要看到输出中包含 **`OP_READY`**，就说明密钥匹配、卡片通信正常，处于可安装状态：

```text
ISD: A000000151000000 (OP_READY)
...
PKG: ... (LOADED)
```

*（注：下方列出的几个 `PKG` 为卡片出厂预装的基础包，切勿随意删除。）*

**若报错处理**：如果出现 `Card cryptogram invalid` 或 `Authentication failed`，说明密钥错误。**请立即停手，切勿盲目重复尝试**，回头检查导出的三把密钥字符是否有误。

### 第四步：正式安装 Satochip Applet

预检确认无误后，就可以执行安装命令了：

```bash
java -jar gp.jar -install SatoChip-0.12-05.cap
```

### 第五步：验证安装结果与状态确认

命令执行完毕且没有报错后，再次运行探卡命令：

```bash
java -jar gp.jar -l
```

对比上一次的输出，如果安装成功，列表中会多出非常关键的两个条目（APP 与 PKG）：

```text
APP: 5361746F4368697000 (SELECTABLE)
     Parent:   A000000151000000
     From:     5361746F43686970

PKG: 5361746F43686970 (LOADED)
     Parent:   A000000151000000
     Version:  0.1
     Applet:   5361746F4368697000
```

这两个条目意味着钱包固件已经成功就位：

- 名字 `5361746F43686970` 转成 ASCII 码就是 `SatoChip`；
- 只要同时出现 **LOADED**（已加载）和 **SELECTABLE**（可调用），就说明 Applet 已成功安装并就绪。

至此，硬件层面的制作全部完成。

### 第六步：清理会话环境变量

安装完成后，养成良好的终端安全习惯，把刚才临时写入环境变量的管理密钥注销掉：

```bash
unset GP_KEY_ENC GP_KEY_MAC GP_KEY_DEK
```

输入 `env | grep GP_KEY` 确认屏幕无任何输出，即可退出终端。

## 可选方案：直接使用 Android 手机通过 NFC 刷入固件

只要你的 JavaCard 拥有 NFC 功能，且手头有一台支持 NFC 的 Android 手机，现在还有一种更快捷、完全不需要电脑和读卡器的方法：直接使用手机通过 NFC 刷入。

硬件安全厂商 Dangerous Things 在 2026 年 9 月正式推出了 [**GlobalPlatform Mobile**](https://forum.dangerousthings.com/t/globalplatform-mobile-app/28697)（[Google Play 链接](https://play.google.com/store/apps/details?id=com.dangerousthings.gpmobile)）。它将 GlobalPlatform 智能卡管理工具搬到了 Android 手机上，通过手机背面的 NFC 射频场给卡片无源供电，无需配置 Java 运行环境，直接在手机上就能完成读写卡、管理密钥以及安装 CAP 固件。

### 1. 使用条件
* 一台支持 NFC 的 Android 手机，并安装好 GlobalPlatform Mobile
* 一张具备 NFC 功能的兼容 JavaCard（只有金属触点、不带天线的纯接触式卡无法使用此方案）
* 卡片正确的出厂管理密钥（`Kenc`、`Kmac`、`Kdek`）

### 2. 操作步骤
1. 打开 GlobalPlatform Mobile，将卡片紧贴在手机背面的 NFC 感应区，App 会读取卡片的芯片出厂信息；
2. 输入卡片的出厂管理密钥（`Kenc`、`Kmac`、`Kdek`）进行认证并建立安全通道；
3. 认证成功后进入卡片管理界面（此时可以查看卡内已安装应用与剩余空间），点击 `Install applet`。GlobalPlatform Mobile 的内置列表中已经提供 Satochip，可以直接选择安装。需要注意的是，该版本由 Dangerous Things 的 `flexsecure-applets` 构建体系重新编译，其构建系统会加入额外的版本查询 APDU，因此二进制文件不一定与 Satochip 官方 Release 中的 CAP 完全一致。若希望与本文电脑刷写方案使用同一来源的官方 CAP，也可以选择 `Install from file`，手动安装预先从 `Toporin/SatochipApplet` 官方 Release 下载的 `.cap` 文件；
4. 选定安装后，全程保持卡片紧贴手机背面感应区不要晃动，App 会显示写入进度条，直到提示安装完成。

## 初始化与使用提醒

刷完的卡只是装好了程序，里面既没有 PIN 码，也没有助记词，接下来要用钱包软件初始化它。下面以 Sparrow 为例介绍一下初始化的流程。

1. 下载 1.8.0 或更新版本的 Sparrow。把卡插进读卡器，再打开 Sparrow。
2. 点 File 菜单里的 New Wallet，给钱包起个名字。
3. 在 Keystores 下面选 Connect Hardware Wallet，点 Scan，识别出 Satochip 以后点 Import Keystore。
4. 设置 PIN 码（4 到 16 个字符），再点一次 Import Keystore，重复输入一遍 PIN 码，然后点 Initialize。
5. 输入你的助记词，或者点 Generate New 生成一套新的，再点 Import Keystore。
6. 把助记词抄下来备份好，最后点 Apply。请注意，Satochip 不会把私钥导出芯片，初始化完成以后，你没有办法再从卡里读出助记词。因此，请务必在初始化时抄好助记词。

你也可以通过其他配套软件完成类似的流程，比如官方的 Satochip Connect 软件、定制版 Electrum（Electrum-Satochip）等（需要注意原版 Electrum 官方客户端并未内置 Satochip 驱动）。在往里面存入真正的比特币，投入实际使用之前，请先在测试网上走一遍完整的流程，从收款到签名发出一笔交易，确认没问题再考虑放入资金。在那之前，也不要把其他钱包里存有资产的助记词导入这张卡。

### 客户端提示 “非官方卡” 并不代表失败

在后续连接 Satochip 官方钱包工具时，软件可能会提示 “无法验证卡片真伪”。这是预料之中的现象 —— 因为只有官方出厂的卡片才自带官方签发的设备证书。DIY 卡缺少这套出厂证书，但**并不影响核心离线签名功能的正常使用**。只要卡片硬件可靠、固件来源纯净，就可以放心使用。

### 公共管理密钥的潜在隐患

对于自行购买的空白 JavaCard ，商家通常会给整批卡设置一套公开统一的默认管理密钥。

对于 DIY 玩家来说，这极大方便了初次刷卡；但这也意味着，如果这张卡遗失，任何懂一点智能卡技术的攻击者，只要用这套默认 Key 连接卡片，就能通过 GlobalPlatform 接口破坏卡片的可用性，甚至悄悄刷入恶意的替换应用后再把卡还给你，诱导你泄露资产（但在没有漏洞的前提下，他们无法直接读出原 Applet 内部封存的私钥）。

因此，如果你打算长期把这张卡作为主力签名设备，建议进一步去了解 GlobalPlatform 的进阶指令，把这三把出厂管理密钥更改为你个人独有的私有随机密钥。不过请注意：修改管理密钥属于高风险操作，错误的 Key 更新、遗失新 Key 或触发卡片的认证失败限制，都可能导致后续失去 GlobalPlatform 管理权限，严重时无法继续管理卡片。新手建议在充分理解相关协议后再去尝试。

## 结语

到这里，一张空白的 JavaCard 就已经成功配置为可用的 Satochip 硬件签名器。

需要客观看待的是，由于卡片本身没有独立屏幕，无法在物理硬件层面对交易细节进行独立核验，因此并不建议直接将其用作大额资产的单签冷存储设备。但如果将它用于日常小额资金的硬件签名，或是配合手机钱包、其它硬件签名器组建多签名钱包，充当其中一把密钥，Satochip 都是一个性价比极高且方便的选择。

只要清楚它的安全边界并善用其便携特性，这枚低成本的自制卡片，就能成为你私钥安全管理中一块轻便、灵活而实用的拼图。

（完）
