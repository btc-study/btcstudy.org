---
title: '如何搭配 Bitcoin Core 使用 Electrum 个人服务器和钱包'
author: 'Anony'
date: '2022/07/12 23:19:50'
cover: ''
excerpt: '更便利的钱包，且不牺牲隐私性'
tags:
- 实践
---


> *作者：Anony*
>
> *2024 年 10 月 29 日重大更新：重新梳理了表述；将过往的历史增补信息汇入文章主体；增补了一个章节，并增加了附录。*



本文是[这份在树莓派上安装比特币节点的教程](https://www.btcstudy.org/2021/11/08/how-to-run-a-bitcoin-full-node-and-lightning-node-on-a-raspberry-pi/)的续篇，旨在帮助读者安装 [Electrum 个人服务器](https://github.com/chris-belcher/electrum-personal-server)（Electrum Personal Server，EPS）并使用 [Electrum 钱包](https://electrum.org/#home)（Electrum Wallet）。

本指南的操作目标是将 EPS 与比特币节点安装在同一设备（比如树莓派或专门的节点设备）上，而将 Electrum 钱包安装在另一台设备（假设是 Windows 系统的个人电脑）上。第五章专门解释了如何用 “SSH 隧道” 在两台设备间通信。

本指南考虑过的另一种 设备-软件 组合是：将比特币节点放在树莓派上，而将 EPS 和 Electrum 钱包一起放在另一台设备中。如果两台设备总在同一网络内部使用，将不再需要使用第五章所述的技巧。附录 2 提供了必要的信息。

从最终效果以及实现难度来看，两种组合的差别并不大。文章的主要内容对这两种组合的搭建也都是有用的。

## 一. 为什么要使用 Electrum 钱包和 EPS？

总的来说，我们使用 Electrum 钱包是为了**它的功能性，以及它的用户体验**。

- 相比于其它钱包，Electrum 钱包的功能性非常出色。Electrum 钱包支持：
  - 多签名功能
  - 硬件钱包
  - 基于 microSD 卡的 Air-gapped 体验
    - 在线的 Electrum 钱包只负责构造交易，因此无需保存私钥；而运行在离线设备上的 Electrum 钱包软件负责签名；microSD 卡或 U 盘负责则两台设备间传输数据。
  - 独立的闪电钱包实现
  - 但是，到目前为止（2024 年 9 月），Electrum 钱包还不支持 [Taproot 地址](https://www.btcstudy.org/2022/10/15/bitcoin-address-formats-and-performance-comparison/)。
- 而相比于 Bitcoin Core 自带的钱包模块，Electrum 钱包的用户体验更加友好。
  - Electrum 钱包支持助记词标准，可以用有序词组的形式来保存主私钥。而 Bitcoin Core 钱包模块不支持。
    - 但请注意，Electrum 钱包的助记词标准是[独立](https://www.btcstudy.org/2021/10/23/what-types-of-mnemonic-seeds-are-used-in-bitcoin/)的，不同于 BIP39 助记词标准。

此外，Electrum 钱包也是完全**开源**的。

最重要的是，Electrum 允许用户指定服务端（后端）（为钱包提供必要的信息并完成网络通信动作）。你既可以使用 Electrum 钱包团队的节点作为服务端，也可以使用自己的节点作为服务端，还可以使用别人的节点。这在最大程度上减少了**单点故障**，并给了用户对自己的信息的**更强控制权**。

不过，既然我们要当一个硬核的比特币爱好者，那当然要使用自己的节点。因为使用自己的节点可以更好地保证隐私性，你可以直接把交易发送到网络中，不需要假手他人；当你在区块链上扫描地址，也不会因为借用了别人的节点而被发现你可能在使用哪些地址。

也正因此，我们要学习安装 EPS。因为 Electrum 钱包无法直接跟 Bitcoin Core 通信，它需要借助 EPS。也就是说，实际上，**Electrum 钱包是跟 EPS 通信，而 EPS 跟 Bitcoin Core 通信，实现完整的功能**。

运行 EPS 也有额外的一些好处：它不仅可以作为 Electrum 钱包的后端，也可以作为 [Blue Wallet 手机钱包](https://bluewallet.io/)、[Sparrow 桌面钱包](https://sparrowwallet.com/)、[Trezor 硬件钱包套件 Trezor Suite](https://www.btcstudy.org/2022/04/04/connecting-your-wallet-to-a-full-node/) 的后端，它也是最流行的个人钱包服务后端。

不过，到目前为止，EPS 还不支持扫描 Taproot 地址，也不支持用[描述符](https://www.btcstudy.org/2023/04/08/state-of-the-art-for-bitcoin-wallet-backups/)来扫描地址。

## 二. 参考文档

跟上一篇教程一样，我们会先列出最有帮助的文档，并在具体章节中写明它们的参考价值。这些文档有：

- 【1】Electrum 个人服务器的 Github 代码库介绍页（英文）：https://github.com/chris-belcher/electrum-personal-server#readme
  - 这个介绍页本身就是一份安装和配置的教程，还列出了一些可能有用的教程的清单。
- 【2】如何安装你自己的比特币节点，Electrum 钱包和服务器（英文）：https://curiosityoverflow.xyz/posts/bitcoin-electrum-wallet/
- 【3】手把手教你在树莓派上安装 Bitcoin Core、Electrum 个人服务器和 Electrum 钱包（英文）：https://armantheparman.medium.com/complete-instructions-bitcoin-core-and-electrum-personal-server-electrum-wallet-on-a-raspberry-a35a3d83a772
  - 这篇文章的 “Edit EPS config file（编辑 EPS 配置文件）” 可以帮助我们解决一个配置中的大难题。

## 三. 安装 Electrum 钱包

这一部分操作分为三步：下载并安装 Electrum 钱包；初始化设置；生成私钥并获得公钥。

### 下载并安装 Electrum 钱包

先从 [Electrum 钱包下载页](https://electrum.org/#download)下载安装文件，请根据你希望安装 Electrum 钱包的设备的系统选择安装文件。本教程假设读者会在 Windows 系统中安装，但 Electrum 钱包也提供 Linux 版本。（如果你使用 Linux 版本，那么你可以将 Bitcoin Core、EPS 和 Electrum 钱包都安装在同一台设备上。）

为确保软件的安全性，请使用 gpg 验证签名。验证签名的一般化教程可见[上一篇教程的附录](https://www.btcstudy.org/2021/11/08/how-to-run-a-bitcoin-full-node-and-lightning-node-on-a-raspberry-pi/#B-%E9%AA%8C%E8%AF%81%E8%87%AA%E5%B7%B1%E4%B8%8B%E8%BD%BD%E7%9A%84%E8%BD%AF%E4%BB%B6)；[Bitcoin Wiki 的 Electrum 页面](https://en.bitcoin.it/wiki/Electrum)也提供了验证签名的教程。

> 使用 gpg 验证签名时，请确保签名文件的前缀和被签名的文件的文件名一致，如果被签名文件的名字是 ` electrum.exe ` ，则签名文件的名字应该是 ` electrum.exe.asc ` 。从下载页中得到的签名文件的前缀与安装文件的名字不一致，会导致无法校验。

下载好安装文件后，打开以 `.exe` 为后缀的安装文件就可以正常安装 Electrum 钱包。安装好之后，可以在系统搜索框内输入 “Electrum” 从而打开软件；也可以在其安装位置查找 `electrum-<版本号>.exe`，用该文件打开软件。

### 初始化配置

为了避免 Electrum 钱包在启动时默认连入 Electrum 团队提供的节点，我们需要将 Electrum 设置成离线运行。

- 如果你使用的是 Windows 系统或其它具有图形界面的系统，请正常打开软件。它会弹出如下界面来询问你是否让它自动选择服务器。请取消 “自动选择服务器” 的选项，并在 “服务器” 框内输入 ` 127.0.0.1:50002 ` 。在后续运行中，Electrum 钱包将向该地址发送数据请求，以获得必要的数据。推荐使用 `50002`，因为该端口也是 EPS 的默认监听端口：
  ![image-20220712101432449](../images/setting-up-electrum-personal-server-and-electrum-wallet-working-with-bitcoin-core/image-20220712101432449.png)
- 如果你要使用命令行来运行 Electrum 钱包，请为命令加上  ` --server localhost:50002:s ` 参数，最好再加上  ` --offline ` 参数（参考【1】）。或者你可以直接编写 Electrum 钱包的配置文件（参考【2】）
- 最不济，你可以先把电脑的互联网连接完全断开，再运行 Electrum 钱包。

### 生成私钥并获得公钥

完成网络设置后，Electrum 会引导你生成一个新的钱包。因为 Electrum 钱包的功能非常全面，它支持你生成新的钱包、导入旧的钱包、生成多签名钱包、配合硬件钱包使用，等等。这里为了方便，我们直接生成一个新的钱包。请在遇到下面这个界面时选择 “创建一个新的密语种子”。它将为你生成一套 12 个词的助记词：

![image-20220712103518790](../images/setting-up-electrum-personal-server-and-electrum-wallet-working-with-bitcoin-core/image-20220712103518790.png)

> 再次强调钱包使用的基本原则：如果你没有备份一个钱包，就不要向它控制的地址转入资金！

生成好了以后，我们执行最后一步：获得该钱包的 “扩展公钥”，该 “扩展公钥” 用来让 EPS 扫描区块链和监听交易。在 Electrum 钱包的菜单中点击 “钱包”，选择 “信息”，它将告诉你钱包的类型，闪电网络节点 ID 等等，复制 “扩展公钥” 框中的内容并保存起来。扩展公钥是以  ` xpub ` 、 ` ypub ` 或  ` zpub ` 开头的字符串。**注意，不要向他人暴露你的扩展公钥，这会让别人可以知道你所有的地址以及这些地址上的交易！**

## 四. 安装及配置 EPS 

本节的目标是在 Linux 系统（假设是 Raspberry OS，树莓派操作系统）上安装及配置 EPS。

下文将涉及命令行操作。如果你还不熟悉，可以参阅[上一份指南](https://www.btcstudy.org/2021/11/08/how-to-run-a-bitcoin-full-node-and-lightning-node-on-a-raspberry-pi/#%E5%88%9D%E5%A7%8B%E5%8C%96%E7%B3%BB%E7%BB%9F)。

### Python 编程语言

首先，我们要确保系统已安装了合适版本的 Python 编程语言（EPS 就是用 Python 开发的）。

下文所推荐安装的 EPS 为 0.2.4 版本，已确认无法在 Python 3.12 版本下工作。在参照以下流程之前，请先检查 EPS 的版本，使用更新的版本。

如果没有新版本，则在命令行窗口运行以下命令，检查本地的 python 版本：

```
python --version
```

如果你在使用 Python 3.12 版本，请考虑使用 [pyenv](https://github.com/pyenv/pyenv)，该软件可以帮你在系统中安装多个 Python 版本。请在参照附录 1 安装好 pyenv 之后，再回到这里继续阅读指南。

### 下载 EPS

接下来，我们用命令行下载 EPS：

```bash
wget https://github.com/chris-belcher/electrum-personal-server/archive/refs/tags/eps-v0.2.4.tar.gz
tar -xvf eps-v0.2.4.tar.gz
cd /home/<你的用户名>/electrum-personal-server-eps-v0.2.4/
```

我们分步讲解这几条命令的作用：

- 第一条命令 ` wget ` 是下载 EPS 的压缩包。
  - 这里使用的网址会下载 EPS 0.2.4 版本。如果你发现 EPS 有新版本，可以替换成新版本的下载地址，或手动下载到自己希望存放的位置。
- 第二条命令 ` tar ` 则是使用 tar 软件来解开压缩包。
- 第三条命令 ` cd ` 是进入到 EPS 的代码文件夹。注意，这条命令无法原样复制，你需要把  ` <你的用户名> ` 改成你树莓派的用户名。

### 自签名证书

由于 EPS 0.2.4 版本的 SSL 证书已在 2023 年 3 月过期，其它应用将无法与之建立正常的网络连接。因此，我们需要参考[这份 Issue](https://github.com/chris-belcher/electrum-personal-server/issues/286) 来更新 SSL 证书。简述如下：

第一步：（假设我们已在 EPS 的代码文件夹内）移动到证书相关的目录，备份老的证书并在目标文件夹内删除老证书：

```
cd ./electrumpersonalserver/certs
cp -r ../certs ../certs_backup
rm cert.*
```

第二步：生成自签名的证书：

```
openssl genrsa -des3 -passout pass:<password> -out server.pass.key 2048
openssl rsa -passin pass:<password> -in server.pass.key -out cert.key
rm server.pass.key
openssl req -new -key cert.key -out cert.csr
openssl x509 -req -days 1825 -in cert.csr -signkey cert.key -out cert.crt
openssl x509 -enddate -in cert.crt
```

第一行指令是在生成私钥。**注意，这里的口令（password）必须长于 4 位，短于 1300 位**。

第二行是生成公钥。后面是移除私钥、生成证书请求以及签名证书。注意，在生成证书请求时，它可能要求你填入地区、组织名、用户名一类的信息，并无特别大的意义，但似乎不应一个都不填。最后一行是为证书添加 5 年的使用时间。

运行完这些命令之后，自签名的证书就生成好了。

> 重要提醒：
>
> 如果你曾依据本指南的一个较老的版本成功运行过 EPS、并且使用 Electrum 钱包成功连接过，那么，在给 EPS 更新完证书之后，你的 Electrum 钱包可能会无法连接 EPS。
>
> 这是因为：如果你此前成功连接过，则 Electrum 钱包会根据 IP 地址记录 EPS 的证书。但如今 EPS 的证书已经改变，两者就无法匹配了。因此，我们需要手动删除 Electrum 钱包存储的旧证书。
>
> 如果你在使用 Windows 系统，证书的目录在：
>
> ```
> C:\Users\<你的用户名>\AppData\Roaming\Electrum\certs
> ```
>
> 找出以你连接 EPS 时使用的 IP 地址为用户名的文件（在我们这里是 `127.0.0.1`），将它删除。
>
> 然后便可重试使用 Electrum 钱包连接 EPS。

### 安装并配置 EPS

接下来，我们要回到 EPS 代码文件夹（`electrum-personal-server-eps-v0.2.4`）中，运行以下命令：

```
pip3 install --user .
cp config.ini_sample config.ini
bitcoin-cli createwallet <任意名称> true
```

- 第一行命令是安装 EPS 为一个可以在命令行中直接调用的软件。
- 第二行命令将一个案例文件的内容存放到新建的文件 `config.ini` 中。
- 第三行是在 Bitcoin Core 中新建一个空钱包，以供 EPS 调用 Bitcoin Core 内部的功能。

然后，我们要编辑  ` coinfig.ini `  文件。可以直接在文档管理器中以图形界面打开。编辑的要点如下：

- 文件里面包括注释的内容很多，看起来可能很烦人。但如果你不需要配置相应的参数，就保持原样不要动它。**请不要删去方括号（`  []`）框起来的部分！**
- 我们需要配置的部分有： ` [master-public-keys] ` 、 ` [bitcoin-rpc] ` 、 ` [electrum-server] ` 。
- 在 ` [master-public-keys] ` 部分， ` #any_name_works ` 下面一行，输入你在 Electrum 钱包中得到的扩展公钥： ` <随便什么名字> = <你的扩展公钥> ` 
  - 如果你有多个扩展公钥，可以分行输入，使用不同的名字就互不影响
- 在 ` [bitcoin-rpc] ` 部分，在  ` datadir =  ` 前面加上  ` # ` ，将它注释掉，然后将  ` #rpc_user = ` 和  ` #rpc_password = ` 前面的  ` #  ` 删去，在后面填上你在  ` bitcoin.conf ` 配置文件中相应的值。
  - 这一大串文字是什么意思呢？它主要解决的是你的 EPS 如何跟 Bitcoin Core 程序通信的问题。要么使用  ` datadir `  参数，填入 Bitcoin Core 的数据目录，EPS 会到该目录去寻找一个  ` .cookie ` 文件来获得 Bitcoin Core 的相关参数（这需要保持后文的  ` rpc ` 参数的注释符号）；要么使用 ` rpc ` 方法，这就需要把  ` datadir ` 参数注释掉。
  - 但是，如[上一篇教程](https://www.btcstudy.org/2021/11/08/how-to-run-a-bitcoin-full-node-and-lightning-node-on-a-raspberry-pi/#%E9%85%8D%E7%BD%AE%E6%AF%94%E7%89%B9%E5%B8%81)所述，我们将 Bitcoin Core 的运行参数写成了一个配置文档，这使得其数据目录里面根本不会产生  ` .cookie ` 文件，EPS 也将无法运行。因此我们要注释掉 ` datadir ` 参数，使用  ` rpc ` 方法。RPC 方法的用户名和口令，请在自己的 Bitcoin Core 配置文件里面找，找到后复制过来即可。如果你阅读了[上一篇教程](https://www.btcstudy.org/2021/11/08/how-to-run-a-bitcoin-full-node-and-lightning-node-on-a-raspberry-pi/#%E9%85%8D%E7%BD%AE%E6%AF%94%E7%89%B9%E5%B8%81)，这应该不是什么难事。
  - 如果你没有为 Bitcoin Core 编写过配置文件，比如你用的是  ` bitcoin-qt ` 而不是  ` bitcoind ` ，那么，是可以通过在  ` datadir ` 参数中填入目录来让 EPS 工作的。
  - 请一定保持 ` rpc_user ` 和  ` rpc_password ` 这两个参数的名称不变，不然会出错（中间的 ` _ ` 不能删去）。
- 在 ` [bitcoin-rpc] ` 部分， ` wallet_filename = ` 后填入你使用 ` bitcoin-cli createwallet ` 生成钱包时所用的名称。
  - 这个钱包实际上变成了 EPS 调用 Bitcoin Core 钱包组件的一个端口。请不要为这个钱包设置口令，不然你启动 EPS 时将需要把口令也附上；又因为它没有口令的保护，请不要真的使用这个钱包。我们使用 Electrum 钱包就好。
-  ` [bitcoin-rpc] ` 的其余部分是跟资源消耗量有关的参数，比如多久在网络中查询一次新交易之类的。如果你可以看懂配置文件中的注释，可以自己调一下，但不是非调不可。
- 在 ` [electrum-server] ` 部分中，将  ` broadcast_method ` 的值改为 ` own-node ` ，这将保证 EPS 只会通过你的比特币节点来跟比特币网络通信。
  - 这个参数也事关 EPS 使用 Internet 还是洋葱网络来跟外界通信。笔者没有专门了解过洋葱网络在当前网络环境下的可用性，也没有设置过 Bitcoin Core 使用洋葱网络。如果想要设置使用洋葱网络，读者还需自己做点功课。

至此，EPS 的配置文件就编辑完成了。我们使用命令行来启动 EPS。

```bash
electrum-personal-server config.ini
```

如果你的命令行窗口在 EPS 目录内，你可以直接使用上面这条命令。否则你可能需要：

```bash
electrum-personal-server /home/<你的用户名>/electrum-personal-server-eps-v0.2.4/config.ini
```

理论上，EPS 现在能够正常启动了，你将能够在命令行窗口内看到 EPS 的启动信息和捐赠地址。

## 五. Electrum 钱包与 EPS 的通信

如第一章所述，在我们的三个软件中，EPS 负责与 Bitcoin Core 通信，以取得所需比特币地址的交易历史；而 Electrum 钱包与 EPS 通信，将这些历史展现给用户，并协助用户构造和签名交易。

在上一章中，我们解决了 EPS 与 Bitcoin Core 通信的问题。并且，由于两者位于同一台设备上，这相对比较容易理解。但是，位于两台不同的设备，Electrum 钱包与 EPS 如何通信呢？

这就需要用到一种叫做 “SSH 隧道” 的技术。

“[SSH](https://www.ssh.com/academy/ssh)” 是 “Secure Shell” 的缩写，其主要用途就是建立安全的网络通信。在实践中，SSH 常常用于设备的远程登录和控制。在[上一篇指南](https://www.btcstudy.org/2021/11/08/how-to-run-a-bitcoin-full-node-and-lightning-node-on-a-raspberry-pi/#%E5%88%9D%E5%A7%8B%E5%8C%96%E7%B3%BB%E7%BB%9F)中，我们也简单提到了使用 SSH 来控制同一内网中的树莓派电脑的方法。

SSH 隧道则更进一步，可以将对本设备某个网络端口的访问，传递到目标设备的某个网络端口。从而，目标设备上的服务，也可以为本地软件所使用。

简单来说，我们让 Electrum 钱包以本地的某个端口为服务端，但使用 SSH 隧道，将对该端口的数据请求都传递给运行 EPS 的设备（树莓派），然后，正常运行的 EPS 就可以收到数据请求并返回数据。

假定我们的桌面设备（运行 Electrum 钱包）和树莓派（运行 EPS）处在同一内网中（比如使用同一 WiFi，或连接到同一个路由器），则我们可以在桌面设备的 “命令提示符（CMD）” 或 “Powershell” 命令行界面内，使用如下命令，建立 SSH 隧道：

```shell
ssh <你的树莓派的用户名>@<你的树莓派的网络地址，如 192.168.1.105> -N -L 50002:localhost:50002
```

这里的 `50002:localhost:50002`，前一个 `50002` 表示本地要被转发的端口，而后一个 `50002` 表示目标设备接收请求的端口。实际上，前者是 Electrum 钱包要与之通信的本地端口；而后者是 EPS 要监听的端口；只不过两者的编号都恰好是 `50002`。也可以自定义别的端口，只是在软件中要有相应的配置。

该命令会要求你提供所用的树莓派用户的口令（password）。输入正确的口令并按下回车之后，隧道就将建立。正常的运行会留下一个闪烁的输入指针（`|`），不正常的运行就会出现报错信息。如果报错表示拒绝连接，请参考上一章、检查 EPS 的工作情形。

> 如果你无法成功建立隧道，请检查：
>
> - 你的树莓派是否开启了 SSH 功能
> - 你的桌面设备是否安装了 SSH 功能

> **实用及安全的建议**：
>
> 如果你觉得总是输入口令很麻烦、不安全，那么 SSH 支持 “无口令登录”。原理是让本地设备生成一对公私钥，并将公钥上传到目标设备，在发起 SSH 连接时指定该私钥。目标设备会通过公钥来检查签名、完成身份验证，从而省去口令验证。配置好公钥后可以禁用口令登录。
>
> 这一方式不仅更加方便，也更加安全。但超出了本文的范围，因此不细述。感兴趣的读者可以搜索 “SSH 技巧”。

> SSH 并不仅仅支持内网内的远程控制。实际上，只要你能通过一个 IP 地址访问到目标设备，就可以发起远程登录和控制。


现在，我们启动 Electrum 钱包，在钱包的主界面，你可以看到右下角出现绿色小点，左下角显示你的余额：

![image-20220712231135243](../images/setting-up-electrum-personal-server-and-electrum-wallet-working-with-bitcoin-core/image-20220712231135243.png)

需要提醒的是，在 Electrum 钱包工作期间，需要保持 EPS 的命令行窗口，该命令行窗口关闭会使 EPS 停止运行。

## 结语

至此，我们已经配置好了 Electrum 个人服务器并使之搭配 Bitcoin Core 来运行。有了 EPS，我们可以将它作为我们的 Electrum 钱包的服务端，从而最大限度保证我们的隐私性。EPS 还可以服务其它钱包软件。Electrum 钱包内也可以生成多个钱包，为使它工作，只需将其扩展公钥填入 EPS 的配置文件即可。

## 附录 1. Pyenv 与多版本 Python

### 在树莓派上安装 Pyenv

在命令行窗口运行以下命令：

```bash
sudo apt update; sudo apt install build-essential libssl-dev zlib1g-dev \
libbz2-dev libreadline-dev libsqlite3-dev curl git \
libncursesw5-dev xz-utils tk-dev libxml2-dev libxmlsec1-dev libffi-dev liblzma-dev
```

这是为 Pyenv 软件安装依赖。然后，运行 Pyenv 自动安装器：

```bash
curl https://pyenv.run | bash
```

安装完成后，窗口会出现一段信息，包含以下字样：

```bash
export PYENV_ROOT="$HOME/.pyenv"
[[ -d $PYENV_ROOT/bin ]] && export PATH="$PYENV_ROOT/bin:$PATH"
eval "$(pyenv init -)"
```

复制上述信息，并输入以下命令：

```bash
sudo nano ~/.bashrc
```

该命令会打开 `.bashrc` 的编辑界面。在文件的底部，粘贴上述信息，保存后退出。这是为了将 Pyenv 添加到环境目录中。

重启环境：

```
source ~/.bashrc
```

然后运行：

```
pyenv versions
```

如果安装成功，程序会输出系统内已安装好的 Python 版本，例如：

```
* system (set by /home/pi/.pyenv/version)
```

### 安装 Python 3.11.10

运行命令：

```
pyenv install 3.11.10
```

运行完之后，使用命令 `pyenv versions` 检查效果。如果安全不成功，回到上一节，确保自己安装了所有依赖。

### 创建虚拟环境并运行

运行以下命令：

```bash
pyenv shell 3.11.10
mkdir py311
python -m venv ./py311
```

- 第一行的作用是将当前执行环境的 Python 语言改为 3.11.10 版本。
- 第二行的作用是创建一个名为 “py311” 的新文件夹。
- 第三行的作用是在 “py311” 文件夹内创造一个属于 Python 3.11.10 的 “虚拟环境”。该环境将独立于系统，有自身的 Python 版本和软件库。

运行完成后，关闭当前的命令行窗口，开启一个新的命令行窗口，并运行如下命令：

```bash
cd ./py311
source ./bin/activate
```

第一行是为了移动到 “py311” 文件夹内，第二行是为了启动虚拟环境。启动之后，命令行前面会多一串字符：`(py311)`。

请在该命令行窗口内，继续[下载、安装和配置 EPS](#下载-EPS)。这会将 EPS 变成依赖于该虚拟环境的软件，从而不受系统 Python 语言的影响。

注意：

1. 在安装 EPS 时，安装命令 `pip3 install --user .` 需要改成 `pip3 install .`。
2. 此后，每当你尝试重新运行 EPS，都需要先激活虚拟环境 `source ~/py311/bin/activate`，然后再运行 EPS ：`electrum-personal-server config.ini`

## 附录 2. 设备-软件 组合

本指南一直假设读者有这样的设备安排：一台独立的设备（比如树莓派），安装 Linux 操作系统，用于运行比特币节点（比如 Bitcoin Core 软件）；一台个人电脑，安装 Windows 操作系统，用于使用更面向普通用户（而非开发者）、也不需要全时运行的软件。

在这种假设之下，本指南的主体指导读者将 EPS 放在独立设备上、将 Electrum 钱包放在个人电脑上。

但是，的确可能存在别的组合，例如：全部装在 Linux 操作系统下；或，全部装在 Windows 系统下。

出于许多理由，笔者依然认为，使用一台独立的低功耗设备来运行比特币节点，是有意义的。因此，本指南额外关注另一种组合：将 Bitcoin Core 放在独立设备上，但让 EPS 和 Electrum 钱包在个人电脑上运行。

这种组合有一些好处，也有一些缺点：

- 假设个人电脑与独立设备总是在同一内网中运行，就不再需要使用第五章所述的 SSH 隧道。因为，EPS 在内网中访问 Bitcoin Core 时，不再需要 SSH。
  - 但如果两者并不总在同一内网中，则依然需要使用 SSH 隧道，来解决 EPS 与 Bitcoin Core 的通信问题。
- 缺点是，EPS 难以做到全时运行。在需要使用时才重新打开，可能面临等待。
  - 本指南的主体并没有给出让 EPS 全时运行的方法。只是，当 EPS 和 Bitcoin Core 在同一台全时运行的设备上工作时，原理上，这是可以做到的：你需要懂得如何[编写并运行 Linux 服务](https://www.ruanyifeng.com/blog/2016/03/systemd-tutorial-commands.html)。但如果 EPS 本身运行在一个不太可能全时工作的设备上，在原理上也就做不到了。
  - 不过，EPS 的运行本身还是挺快的。如果不需要重新扫描区块链，这等待不会太久。

以下是你可能需要了解的技能，它们都跟在 Windows 系统中安装和配置 EPS 有关，请在阅读下文后跳转到相应的章节继续：

### 在 Winows 系统中安装 pyenv-win

Python 3.12 版本无法运行 EPS 。请通过 pyenv-win 为你的 Windows 系统安装其它版本的 python。

在 Windows 系统中打开 “Powershell” 命令行窗口，运行以下命令，安装 pyenv-win：

```
Invoke-WebRequest -UseBasicParsing -Uri "https://raw.githubusercontent.com/pyenv-win/pyenv-win/master/pyenv-win/install-pyenv-win.ps1" -OutFile "./install-pyenv-win.ps1"; &"./install-pyenv-win.ps1"
```

然后你便可以继续安装[不同版本的 python 语言](#安装-Python-3.11.10)（跳转到附录 1）。在需要下载 EPS 时请回到此处。

### 下载 Windows 版本的 EPS

请在 [EPS 的下载页面](https://github.com/chris-belcher/electrum-personal-server/releases)下载适合 Windows 操作系统的安装文件，例如 `electrum-personal-server-windows-release-v0.2.4.zip`。

`.zip` 是一种压缩文件，将其中的内容解压到你指定的目录之后，你就得到了 EPS 的代码文件夹。

请继续为 EPS 生成[自签名证书](#自签名证书)。在需要编写 EPS 的 `config.ini` 时回到此处。

### 配置 EPS 与 Bitcoin Core 的通信

在编写 EPS 的配置文件 `config.ini` 时，由于 EPS 和 Bitcoin Core 位于不同设备上，需要在 `[bitcoin-rpc]` 下面，令：

```
host = <你的运行 Bitcoin Core 的设备，比如树莓派，在内网中的网络地址，例如 192.168.1.105>
```

其余配置请继续参照[本指南主体的描述](#安装并配置 EPS)。

### Electrum 钱包与 EPS 的通信

由于两者位于同一设备上，在 Electrum 钱包中只需将服务器地址设为 `127.0.0.1：50002`，便可直接与 EPS 连接，不再需要额外配置。

（完）