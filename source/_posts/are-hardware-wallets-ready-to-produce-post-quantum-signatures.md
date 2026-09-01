---
title: '硬件签名器准备好生成后量子签名了吗？'
author: 'Blockstream'
date: '2026/09/01 16:01:00'
cover: ''
excerpt: '人们担心现有的硬件签名器无法生成 PQ 签名，如今这种担心可以打消了'
tags:
- 签名器
---


> *作者：Blockstream*
> 
> *来源：<https://blog.blockstream.com/hardware-wallets-post-quantum-signatures/>*



**声明**：本研究不是为了给签名器排名或主张某一些好过另一些。在受试的签名器上，我们基于相同的 C 语言库运行了所有的基准测试【[1](https://github.com/BlockstreamResearch/shrincs-c?ref=blog.blockstream.com), [2](https://github.com/pq-code-package/slhdsa-c?ref=blog.blockstream.com), [3](https://github.com/XMSS/xmss-reference?ref=blog.blockstream.com)】（为每款签名器做了一些调整）；我们并不主张这个库是最优的或最高效的，它非常平庸。当然，这些签名器背后的团队对自家的产品有更深入的了解，也许能实现更好的结果。我们非常乐意分享任何能够超越我们的测试结果的技术和实现。不论如何，都要感谢这些签名器背后的团队，不遗余力地支持自主保管比特币。

**致谢**：我们衷心感谢 Jade 团队，尤其是 Rich Grambergs，为我们提供了一个开发者版本的 Jade Plus 签名器；感谢 Ledger 团队，以 Charles Guillemet 为代表，指导我们在 Ledger 上运行定制化的 app；SatoshiLabs 团队，他们的产品在非开发者版本上也能（几乎）无痛升级定制化的固件；还有 BitBox 团队，尤其是 Jad ，为我们提供了一个开发者版本的 BitBox02 Nova 签名器。感谢  Anastasiia Sapozhkova 和 Pavel Kravchenko 帮助我们获得一些开发者设备。最后，感谢 Jonas Nick、Mike Kudinov、Viktor Mashtaliar 和 Yaroslava Chopa，感谢你们的细致审核以及富有教益的反馈。

## 问题的现状

人们普遍担心，后量子（PQ）密码学在现有硬件签名器上难以实现，甚至无法实现。许多[访谈](https://x.com/MARAFoundation_/status/2064717212087116100?s=20&ref=blog.blockstream.com)、 [帖子](https://www.reddit.com/r/ledgerwallet/comments/1rwjt7j/is_ledger_quantum_ready_what_you_need_to_know/?ref=blog.blockstream.com)和 [文章](https://www.projecteleven.com/blog/hardware-wallets-the-post-quantum-upgrade-problem?ref=blog.blockstream.com)都提到了这个重要的课题。

我们还无法断言所有的 PQ 原语，因为目前只完成了一部分工作，但有一件事情是清楚的：**PQ 签名方案可以在所有流行的硬件签名器上运行**。

本文会通过真实设备上的实现和基准测试来证明这个结论。

*且将我们的观点表述得严谨一些：本文的主题是在设备上生成签名，仅限基于哈希函数的签名方案；本文与验证后量子固件无关（那是一个单独的问题，并不更简单），也不谈论基于格的签名方案（似乎[也可以做到](https://x.com/P3b7_/status/2074117513244229764?s=20&ref=blog.blockstream.com)）或基于同源的签名方案，我们以后会再测试。*

**前言**：一段时间以前，我们开始研究基于哈希函数的签名以及它们在比特币上的适用性。Blockstream Research（包括我们的有限参与）形成了大量有趣的成果：

- 《[为比特币考虑基于哈希函数的签名](https://eprint.iacr.org/2025/2203?ref=blog.blockstream.com)》
- [SHRINCS](https://delvingbitcoin.org/t/shrincs-324-byte-stateful-post-quantum-signatures-with-static-backups/2158?ref=blog.blockstream.com) 签名方案以及 [SHRIMPS](https://delvingbitcoin.org/t/shrimps-2-5-kb-post-quantum-signatures-across-multiple-stateful-devices/2355?ref=blog.blockstream.com) 签名方案，都在[我们的博客](https://blog.blockstream.com/op_checkshrincs-a-hash-based-signature-opcode-for-post-quantum-bitcoin/)中有所介绍
- SHRINCS 规范以及安全性证明 <sup><a href='#note1' id='jump-1-0'>1</a></sup>
- 第一款 [SHRINCS 验证器](https://github.com/BlockstreamResearch/shrincs-simplicity-verifier?ref=blog.blockstream.com)实现，以 Simplicity 编写，并已部署在 Liquid 网络上（有相应的 [C++](https://github.com/BlockstreamResearch/shrincs-cpp?ref=blog.blockstream.com) 和 [C](https://github.com/BlockstreamResearch/shrincs-c?ref=blog.blockstream.com) 语言实现）
- 用于挑选参数的[脚本](https://github.com/BlockstreamResearch/SPHINCS-Parameters?ref=blog.blockstream.com)和[可视化网站](https://blockstreamresearch.github.io/SPHINCS-Parameters/site/?ref=blog.blockstream.com)，在[这篇文章](https://blog.blockstream.com/searching-for-shrincs-parameters/)中有述（[中文译本](https://www.btcstudy.org/2026/08/17/searching-for-shrincs-parameters/)）

本文回答的是一个简单但根本的问题：现有的硬件签名器真的能够生成基于哈希函数的 PQ 签名吗？

令人惊讶，它们做得很好。

## 签名器和签名方案候选

我们测试了四款流行的硬件签名器，使用了对各个设备适用的基准测试实现：[Jade](https://github.com/DmitriiKJ/Jade/tree/hash_based_signatures?ref=blog.blockstream.com)、[Trezor](https://github.com/DmitriiKJ/trezor-firmware/tree/feature/shrincs?ref=blog.blockstream.com)、Ledger【[[7](https://github.com/DmitriiKJ/ledger_slh_dsa.git?ref=blog.blockstream.com), [8](https://github.com/DmitriiKJ/ledger_shrincs.git?ref=blog.blockstream.com), [9](https://github.com/DmitriiKJ/ledger-xmss?ref=blog.blockstream.com)】以及 [BitBox02](https://github.com/DmitriiKJ/bitbox02-firmware/tree/feature/hash-based-signatures?ref=blog.blockstream.com) ，并评估了五种基于哈希函数的签名方案：

1. 传统的**SLH-DSA -128s**（FIPS 205）：签名大小为 7856 字节，单个公钥可安全签名 2^64 次，无需跟踪状态的。这是 “最简单的” SLH-DSA 参数组合。
2. **SPHINCS+** 的一个缩减大小的变种： 签名大小为 5776 字节，单个公钥可安全签名 2^40 次，无需跟踪状态的。这是 SHRINCS 的无状态部分的优秀候选。
3. **UXMSS**（**SHRINCS-B** 的需状态部分）：签名大小为 [324+ 字节](https://delvingbitcoin.org/t/shrincs-324-byte-stateful-post-quantum-signatures-with-static-backups/2158?ref=blog.blockstream.com)、需要记忆状态（最小的 SHRINCS签名）。
4. **UXMSS**（**SHRINCS-L** 的需状态部分）：签名大小为1092+ 字节，取决于使用或不使用 “过度研磨”（Swn = 140/96） <sup><a href='#note2' id='jump-2-0'>2</a></sup>，需要跟踪状态（这就是我们已经[部署](https://delvingbitcoin.org/t/shrincs-324-byte-stateful-post-quantum-signatures-with-static-backups/2158/20?ref=blog.blockstream.com)在 Liquid 上的[验证器](https://github.com/BlockstreamResearch/shrincs-simplicity-verifier?ref=blog.blockstream.com)要验证的签名）。
5. **XMSS**：需要跟踪状态的签名，大小为 696 字节，单个公钥可以安全生成 2^10 个签名。

## 实现细节

如我们的声明所述，我们在所有的签名器测试了各签名方案的同一个 “普通的” 实现。一丝不苟的公平比较是很难做到的，因为这些签名器之间有许多区别：

- **运行代码的方式不同**。Ledger 可以通过其操作系统在安全芯片内部运行 app ，并调用操作系统的密码学函数（我们注意到系统调用的开销很大，因此决定在 app 内使用一个定制化的 SHA-256 实现来加快速度）。Jade 使用的一款通用的芯片。Trezor 和 BitBox02 在它们的主微控制器单元中运行定制化的固件；它们的安全芯片只保护 PIN 码和私钥，而签名数学运行在它们的主芯片中。
- **密码学原语不同**。 Jade 使用 `libwally`，它是对 `libsecp256k1` 及其哈希函数的封装；Trezor 使用自己的 `trezor-crypto`；BitBox02 也使用自己的库；Ledger 暴露了其 `cxlib` 调用。我们不得不将自己的参考实现库粘贴到各个设备已经提供的组件上，并且在一些地方，我们还会复用设备内部的哈希函数和字节序辅助工具，而不是我们的参考实现库，这也会带来一些差别。
- **工具链以及哈希函数的硬件实现不同**。
- **CPU 频率不同**。（从 70 MHz 到 240 Mhz）
- **数据传输时间不同**。


所以，很难在签名器之间实现公平的比较，但正如前文所说，我们的目的是证明所有这些签名器都能生成基于哈希函数的签名。

## 结果

下面的所有数字，都是在对应的操作执行 100 次之后取出的平均值。

### KeyGen <sup><a href='#note3' id='jump-3-0'>3</a></sup>

| KeyGen / 签名器       | Jade Plus      | Trezor Safe 3  | Ledger Nano gen5/s+ | BitBox02 Nova  |
| --------------------- | -------------- | -------------- | ------------------- | -------------- |
| **SLH-DSA-SHA2-128**  | 7.06 s         | 8.64 s         | 15.82 s             | 12.7 s         |
| **SPHINCS+ 2^40**     | （与上栏合并） | （与上栏合并） | （与上栏合并）      | （与上栏合并） |
| **UXMSS (SHRINCS-L)** | 1.81 s         | 2.35 s         | 6.1 s               | 3.3 s          |
| **UXMSS (SHRINCS-B)** | 18.87 s        | 22.8 s         | 40.18 s             | 28.8 s         |
| **XMSS 2^10**         | 57.78 s        | 75.64 s        | 117.85 s            | 79.5 s         |


如本表所示，SLH-DSA、SPHINCS +2^40 以及 SHRINCS-L ，在几乎所有设备上都是实用的。SHRINCS-B 实用了一个更大的 Winternitz 参数（w=256），并且在 KeyGen 操作期间需要构造出完整的带状态的树，因此增加了运行时间。XMSS 需要 1 分钟来生成密钥，但使用缓存技术，签名生成可以非常高效。

#### SigGen

| 签名 / Wallet                           | Jade Plus | Trezor Safe 3/5/7 | Ledger Nano gen5/s+ | BitBox02 Nova |
| --------------------------------------- | --------- | ----------------- | ------------------- | ------------- |
| **SLH-DSA-SHA2-128** (7856 B)           | 52.85 s   | 65.31 s           | 120.12 s            | 100.1 s       |
| **SPHINCS+ 2^40** (5776 B)              | 43.28 s   | 53.45 s           | 94.98 s             | 78.4 s        |
| **SHRINCS-L** (swn=96, 1092 B)          | 3.31 s    | 3.01 s            | 8.04 s              | 5.5 s         |
| **UXMSS (SHRINCS-L)** (swn=140, 1092 B) | 225.63 s  | 264.74 s          | 572.78 s            | 334.6 s       |
| **UXMSS (SHRINCS-B)** (324 B)           | 21.75 s   | 25.82 s           | 41.83 s             | 30.9 s        |
| **XMSS 2^10** (696 B)                   | 57.8 s    | 75.63 s           | 118.2 s             | 79.6 s        |

总结：

- SLH-DSA：签名需要大约 53 ~ 120 秒来生成。你觉得慢？还行吧。这显然不是完全做不到。 使用 2^40 签名次数参数的 **SPHINCS+** 会稍微快一点。
- **UXMSS（SHRINCS-B）**：需要花费 22 ~ 42 秒来生成。
- **UXMSS（SHRINCS-L）**：因为过度研磨，签名变得很慢 —— 从大约 226 秒到 573 秒不等。这是一种合理的取舍，如果我们想要显著降低验证复杂性的话。如果移除了过度研磨，签名时间将花费 3 秒多。
- **XMSS**：生成签名需要花费 58 ~ 118 秒，在冷模式下。跟 SLH-DSA 差不多，但可以通过缓存来有效加速（已超出本文的话题）。

## 总结

上面的表格假设每次用户生成签名时，都会从头重新计算一切（冷模式）。但基于哈希函数的签名带有一种结构，可以假设每次生成签名都会有大量的**重复工作**。那么显然可以追问：*“我们能够保存一些结果来节省未来的重复工作吗？”* 答案是可以；想了解更多细节，请看[这篇文章](https://conduition.io/code/fast-slh-dsa/?ref=blog.blockstream.com)。

在我们的下一篇文章中，我们会尝试定义实用性的边界，以及硬件签名器可以如何实现高效的缓存。敬请期待！

## 彩蛋。签名生成也可以有趣

我们不认为，花几分钟时间来生成签名，对于管理比特币来说是很大的麻烦。当然，如果能运算快一些，对于闪电网络来说是好的，但再强调一遍，使用带状态的签名和缓存，看起来都是可以接受的。

当然，花几分钟坐在那里干等，可能会有些无聊，所以我们建议，签名器制造商可以加入更大的屏幕，给用户找点乐子。在我们收集签名器、用于测试基于哈希函数的签名时，我们花了一些时间来把玩 Trezor Safe 7 。用户按下 “签名” 案件后，就会 …… 进入一个比特币赛车游戏（俄罗斯方块和国际象棋也可以；但吃豆人就真的需要更大的屏幕才能爽玩了 <sup><a href='#note4' id='jump-4-0'>4</a></sup>）。

![A Bitcoin racing game running on a Trezor Safe 7 while it generates a post-quantum signature](../images/are-hardware-wallets-ready-to-produce-post-quantum-signatures/racing-game.gif)

在设备内部，Safe 7 会在两个处理器之间切换：一个用于生成 PQ 签名，另一个显示游戏并处理用户的输入。它不支持多线程，只是不断切换处理器，所以，游戏运行越快，签名就会越慢。把游戏关掉，你就会得到上面的表格所示的运算时间。

我们内部开玩笑说，这样有一个很好的副作用，就是用户可以从玩游戏中采集一些熵。你不会从来没有通过乱甩鼠标、乱敲键盘来获得 “足够的” 熵吧（比如 [TrueCrypt](https://www.truecrypt.org/?ref=blog.blockstream.com) 或者近期的一次[隐私池的受信任启动仪式](https://ceremony.privacypools.com/?ref=blog.blockstream.com)）。基于哈希函数的签名依然需要随机化 —— 所以，请多多玩游戏吧。

但是，它并不是一种 “侧信道防御”。可以想象，额外的签名器活动（渲染道路、生成车辆并对用户的紧张操作作出反应）会拖慢签名速度并让攻击者感到困惑。但实际上，这没有什么效果 —— 在自身中添加噪声，只是一种较弱的防御措施，如【[10](https://link.springer.com/chapter/10.1007/3-540-48405-1_26?ref=blog.blockstream.com)】和【[11](https://link.springer.com/chapter/10.1007/978-3-540-24660-2_18?ref=blog.blockstream.com)】所支出的。真正的侧信道防御需要掩护【[10](https://link.springer.com/chapter/10.1007/3-540-48405-1_26?ref=blog.blockstream.com), [11](https://link.springer.com/chapter/10.1007/978-3-540-24660-2_18?ref=blog.blockstream.com), [12](https://eprint.iacr.org/2024/500?ref=blog.blockstream.com)】（将秘密值分割成随机的碎片，以消除关联）。

在我们运行基准测试和打磨这篇博客期间，我们发现了另一些有趣的例子【[13](https://x.com/Hannsek21/status/2074425013805969584?ref=blog.blockstream.com), [14](https://x.com/olkurbatov/status/2078083539694666150?s=20&ref=blog.blockstream.com)】，是带有足够大的屏幕的签名器可以做的！

## 结论

人们担心现有的硬件签名器无法生成 PQ 签名，如今这种担心可以打消了，至少对基于哈希函数的签名方案是如此。SLH-DSA 签名需要大约 1 分钟，而 SHRINCS 的带状态部分只需几秒，这是在人们今天就能买到的硬件签名器上。

剩下的问题已不是关于可行性的了，而是工程问题：优化、时延、缓存和哈希运算加速。

<p style="text-align:center">- - -</p>


1.<a id='note1'> </a>这套规范还在撰写中，尚未发布。 <a href='#jump-1-0'>↩</a>

2.<a id='note2'> </a>这个变种在叶子中使用 WOTS+C 一次性签名。除了减小签名体积以外，这种方法还允许我们用（更高的）签名生成的成本来换取（更小的）签名验证的复杂性。 <a href='#jump-2-0'>↩</a>

3.<a id='note3'> </a>注：完整的 SHRINCS 密钥生成流程是带状态签名方案的密钥和无状态签名方案的密钥的总和，所以总的运行时间是两者的和。<a href='#jump-3-0'>↩</a>

4.<a id='note4'> </a>需要额外的 20 ~ 30 KB 的 RAM 来运行游戏。 <a href='#jump-4-0'>↩</a>