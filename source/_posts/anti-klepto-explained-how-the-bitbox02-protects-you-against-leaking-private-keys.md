---
title: 'Anti-klepto 签名协议详解'
author: 'benma'
date: '2026/11/04 11:18:35'
cover: ''
excerpt: 'Anti-klepto 是防范 nonce 隐蔽信道攻击的保护措施。'
tags:
- 签名器
---


> *作者：benma*
>
> *来源：<https://blog.bitbox.swiss/en/anti-klepto-explained-protection-against-leaking-private-keys/>*
>
> *原标题为：“Anti-klepto：BitBox02 如何保护你不泄露私钥”。原文出版于 2021 年。*

“Anti-klepto” 是防范 “*nonce 隐蔽信道攻击* ” 的保护措施。

## Anti-klepto 的作用是什么？

BitBox02 这样的硬件签名器，会创建 “*数字签名* ” 来授权你的交易。它们使用 *私钥* 来生成签名。如果不知道正确的私钥，就无法为一个公钥伪造签名（因此也无法盗窃用该公钥锁定的资金）。而一个签名的数学结构还包含了一个 *nonce* ，它是硬件签名器可以自由选定的一个随机数。

恶意的硬件签名器可以通过操纵这些 nonce，在成型的签名中泄露私钥。因为签名是交易的一部分，会永久记录在公开的区块链上，远程的攻击者可以读取它们、重构出私钥，获得受害者的资金的控制权。

我们可以让主机软件（比如 [BitBoxApp](https://bitbox.swiss/app/)）可证地为 nonce 贡献随机性，来防止这种操纵发生，从而缓解攻击的可能性。

这种攻击在两个方面尤其可怕：

- 即使你在一个完全安全的环境下验证交易的所有细节，并使用完全 “<a href="https://en.wikipedia.org/wiki/Air_gap_(networking)">空气隔离</a>” 的装置来签名交易，你也依然没有保证；除非启用了 anti-klepto 这样的协议。
- 这种攻击完全不涉及电脑和手机（这些主机设备）。哪怕你的硬件签名器所连接的电脑和手机完全没问题，也一样能奏效。 

而 anti-klepto 协议可以阻止这种攻击，办法是让你的电脑或手机钱包软件来检查 检查 签名

## 为什么这能派上用场呢？

我们是 “<a href="https://en.wikipedia.org/wiki/Defense_in_depth_(computing)">深度防御</a>” 和 “别信任、去验证！” 信条的忠诚信徒。

为了提高透明性、减少用户需要的对设备**供应链**的信任因素，我们持续推出特性和工具链来帮助你验证你拿到的 BitBox02 设备（及其生成的种子）的完整性和安全性，比如说：

- 只有经过 Shift Crypto 公司签名过的固件才能运行在 BitBox02 上。
- 每一款兼容的电脑和手机钱包软件都会自动执行见证检查（正品检查），已保证连接的 BitBox02 设备是由 Shift 出厂的，然后才能解锁设备。
- 我们所有的代码都是开源的，包括 [BitBox02 固件](https://github.com/digitalbitbox/bitbox02-firmware/) 和 [BitBoxApp](https://github.com/digitalbitbox/bitbox-wallet-app/)，还有我们供给第三方钱包集成的库。
- 你可以从我们发布的源代码编译出固件，从而验证我们发布的固件二进制文件跟源代码是一致的。要了解编译指令，请看我们关于 “[可复现编译](https://github.com/digitalbitbox/bitbox02-firmware/tree/master/releases#reproducible-builds)” 的指南。
- 你可以配置 BitBox02 先在屏幕上显示即将执行的固件的校验和，然后再执行它，从而在另一环节验证它跟正式发布的版本一致。
- 从 01.2021 Monte Rosa 版本开始，你可以手动生成种子，不依赖 BitBox02 的随机数生成器，比如你可以摇骰子。请看我们的 “[摇出你的比特币种子词](https://blog.bitbox.swiss/en/roll-the-dice-generate-your-own-seed/)”。

Anti-klepto 协议是这张清单上的最新条目。跟其它特性一样，它能提高供应链攻击的代价和精力。

操纵种子词的生成，以及，在 nonce 隐蔽信道中泄露种子词，可能是执行大规模攻击的最高效办法。这两个问题都在我们最新的 01.2021 Monte Rosa 版本中得到了解决。

## 极简背景知识：私钥与公钥

在比特币钱包中，用作私钥的就是一个很大的数字，非常大，以至于靠猜是猜不出来的，比如说：

92193805913277071008055984303319191614197341949664602874511898854633635443214

每个私钥都有一个对应的 *公钥*，公钥又会转化成钱包中的比特币地址。发送到某个地址的资金只能用对应的私钥来花费。光知晓一个公钥，并不能知晓关于其背后的私钥的任何事情。

如今，比特币钱包的工作模式已经不再是逐个生成私钥并保存起来，而是只保存一个 *种子*，用这个种子 钱包来按需要派生出子密钥（私钥和公钥）。这个种子，就是你在初始化 BitBox02 时要备份到你的 microSD 卡中、或者用 24 词的形式写在纸上的东西。

从一个私钥计算出其公钥的共识是 `公钥 = 私钥 × G` ，这里的 `G` 是一个预先确定的数值。

从技术上来说，公钥们形成了一个数学上说的 “群”，在这个群中，加法有自己的含义（乘法的含义也由此而来）。如果你想了解更多，这个播客系列 “[椭圆曲线密码学：通用介绍](https://andrea.corbellini.name/2015/05/17/elliptic-curve-cryptography-a-gentle-introduction/)” 是非常好的读物。

只不过，在这里，除法是做不到的（不然你就可以从公钥反算私钥了！）。除此之外，绝大部分常用的数学原理在这里也成立。分配律这样的数学原理依然成立：`(a + b) x G = a x G + b x G` 。这个原理使得钱包软件可以防止 nonce 隐蔽信道攻击，我们后面就会看到。

## Nonce 隐蔽信道攻击

电子签名中有一部分叫做 “nonce”。一个 nonce 就跟一个私钥一样，但它是每当要生成签名的时候就随机生成一个。跟任何私钥一样，它也有对应的公钥 `nonce x G` 。这个公钥是签名的一部分，最终也会永远记录在区块链上（因为签名会放在交易中）。

因为在使用随机 nonce 时有许多陷阱，所以绝大部分钱包实现都已经切换成了使用 “[ *确定性的* nonces](https://tools.ietf.org/html/rfc6979)”。这样就不依赖于随机数生成器了，而是通过对 私钥、待签名的消息（以及可选的额外数据） 运行[哈希](https://en.wikipedia.org/wiki/Cryptographic_hash_function)运算来得出一个 nonce 。不幸的是，光看这样一个 nonce ，你是无法分辨它是随机采集出来、还是确定性生成的，当然也无法看出它是不是恶意的 nonce 隐蔽信道攻击。

一个恶意的硬件签名器如果想抽取出其中的钱包种子 —— 再说一次，钱包中的所有其它私钥都是从这个种子生成的 —— 它只需要将种子词的一部分编码在 nonce 公钥中，这个 nonce 公钥因为是交易签名的一部分，会永久记录在区块链上。当出现在链上的恶意签名积累到一定数量之后，攻击者就能从中拼凑出你的种子。

恶意硬件签名器的障碍有：

- 它需要尝试许许多多不同的随机 nonce，才能让 nonce 公钥展现出特定的模式。因为这个过程比较慢， 恶意硬件签名器一次往往只能影响整个签名的很少几个字节。
- 签名还需要包含某种隐蔽的记号，这样攻击者才能在扫描区块链时分辨出来（并保证只有他自己能分辨出来）。

结果是，只靠一个签名是无法泄露种子词的，需要多个。取决于方法和环境，几十个签名足以泄露整个种子。

## 防范措施：anti-klepto 协议

通过限制硬件签名器自由选择 nonce 的能力，就能挫败这种攻击。为此，BitBoxApp（或其它能跟 BitBox02 搭配使用的软件）会要求硬件签名器先自己选出一个内部 nonce，但在最终用于签名的 nonce  中，还必须添加一个由软件选择的 nonce 。

整个协议按以下步骤执行，并且每当生成签名都要这样做。

请注意，我这里说的是协议的一个简化版本，为的是解释这个概念。完整的协议、所有的细节，其说明跟代码实现放在一起，可以在[此处](https://github.com/ElementsProject/secp256k1-zkp/blob/ed69ea79b429beae4260917e08fe60317d38ee8d/include/secp256k1_ecdsa_s2c.h#L100-L155)找到。

看：

硬件签名器先要承诺自己意图使用的 nonce ，办法是将 nonce 公钥（记为“设备 nonce 公钥”）发送给主机钱包软件：

`设备 nonce 公钥 = 设备 nonce x G`

把这个值发送给主机钱包软件，硬件签名器后面就无法再变换设备 nonce 了。

主机钱包软件自己随机采集一个 nonce，记为 “`hostNonce`（主机 nonce）”，将它发送给硬件签名器。

硬件签名器使用结合 nonce `nonce = deviceNonce + hostNonce` 来生成最终的签名。放在签名中的最终 nonce 公钥是：

`nonce x G = (设备 nonce + 主机 nonce) x G`

主机钱包软件可以通过检查下列等式，来验证自己的那一部分 nonce 输入被使用了、出现在了最终 nonce 公钥中：

`nonce x G = 设备 nonce x G + 主机 nonce x G `（分配律）

也即：`nonce x G = 设备 nonce 公钥 + 主机 nonce x G `

只需使用早前收到的 `deviceNoncePublicKey` ，主机钱包软件就能完成验证。如果验证失败，主机钱包软件会放弃操作、不广播这笔交易，防止设备隐蔽地泄露任何秘密。

这里面有一些细节，为了得到正确的实现，是非常重要的：

- 在释放最初的 nonce 公钥之前，不能让硬件签名器拿到主机 nonce，不然的话，它就依然完全有机会操控最终的 nonce 。主机钱包软件必须保证这一点。
- 硬件签名器不能为两个不同的主机 nonce 使用相同的设备 nonce，否则，私钥会立即泄露给主机钱包软件。所以，办法是让主机先给设备发送设备 nonce 的一个哈希值承诺。有了这个承诺，设备就能基于主机 nonce 来创建不同的 nonce 。

## 发布

[Jonas Nick](https://nickler.ninja/) 最早为 Schnorr 签名实现了这套 anti-klepto 协议。基于这个实现，我为 ECDSA 签名做出了同样效果的实现，并在 secp256k1 代码库中打开了一个 [PR](https://github.com/bitcoin-core/secp256k1/pull/637) 。ECDSA 签名方案是当前在比特币（以及其它许多山寨币）上服役的方案，所以支持它是让 anti-klepto 协议能够推向真实应用场景的前提。

我们在 BitBox02 的 9.4.0 版固件发布了对这套协议的支持（[01.2021 Monte Rosa update](https://blog.bitbox.swiss/en/bitbox-1-2021-monte-rosa-update/) ）。BitBoxApp 从 4.25 版本开始，为 BitBox02 贡献 nonce 并验证其被用到了比特币交易或莱特币交易的签名中。在未来的版本中，还会支持 anti-klepto 协议用于以太坊交易的签名，以及用于使用比特币或以太坊公钥来签名消息。 未来，我们可能会强制执行这套协议（需要升级固件）。

我们所有的 BitBox02 开源软件库都已经升级为支持 anti-klepto 协议。也就是说，在支持使用 BitBox02 的第三方钱包，比如 HWI、Electrum、MyEtherWallet 等等中，都会自动获得支持。

## 为开源协作欢呼

尤为感谢 [Stepan Snigirev](https://twitter.com/StepanSnigirev) 关注到了这个问题，并在他的[博客文章](https://medium.com/cryptoadvance/hardware-wallets-can-be-hacked-but-this-is-fine-a6156bbd199)中给了这个话题一个很好的解释。这篇文章是我为 BitBox02 和其它硬件签名器开发可以进入生产场景的 anti-klepto 协议实现的重要动机。

BitBox02 依赖于开源的 [secp256k1](https://github.com/bitcoin-core/secp256k1/) 密码学代码库，它也是驱动 `Bitcoin Core` 全节点和钱包的密码学库。

非常感谢 Jonas Nick，他慷慨地审核了我的实现的多版迭代。由于 Jonas 忙于 [BIP - Schnorr](https://github.com/bitcoin/bips/blob/master/bip-0340.mediawiki)、[MuSig2](https://medium.com/blockstream/musig2-simple-two-round-schnorr-multisignatures-bf9582e99295) 以及其它有趣的项目，这个过程一度暂停。感谢 [Andrew Poelstra](https://github.com/apoelstra) 接手我的工作，看护它直至最终[合并到 secp256k1-zkp](https://github.com/ElementsProject/secp256k1-zkp/pull/111) 代码库。同样感谢 [Tim Ruffing](https://github.com/real-or-random) 提供了额外的审核。

我的工作的一大好处在于，它是开源的，成为了一个经过严格审核的代码库的一部分，所以可以用在任何地方。我们期待其它硬件签名器采用这套协议。Blockstream 已经宣布为他们刚刚发布的 Jade 硬件签名器添加了支持。

## 有用的资料

- [bitcointalk.org/index.php?topic=893898.msg9841502#msg9841502](https://bitcointalk.org/index.php?topic=893898.msg9841502#msg9841502)
- [lists.linuxfoundation.org/pipermail/bitcoin-dev/2020-March/017667.html](https://lists.linuxfoundation.org/pipermail/bitcoin-dev/2020-March/017667.html)
- [medium.com/cryptoadvance/hardware-wallets-can-be-hacked-but-this-is-fine-a6156bbd199](https://medium.com/cryptoadvance/hardware-wallets-can-be-hacked-but-this-is-fine-a6156bbd199)
- [andrea.corbellini.name/2015/05/17/elliptic-curve-cryptography-a-gentle-introduction/](https://andrea.corbellini.name/2015/05/17/elliptic-curve-cryptography-a-gentle-introduction/)

（完）