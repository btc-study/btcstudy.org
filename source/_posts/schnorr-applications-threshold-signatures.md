---
title: 'Schnorr 签名系列：门限签名'
author: 'Nadav Kohen'
date: '2021/12/08 15:22:42'
cover: '../images/schnorr-applications-musig/security_flat_logo_orange.png'
excerpt: '门限签名的用途以及两种构造 Schnorr 门限签名的方法'
tags:
- 密码学
---


> *作者：Nadav Kohen*
>
> *来源：<https://suredbits.com/schnorr-applications-threshold-signatures/>*
>
> *[前篇中文译本](https://www.btcstudy.org/2021/12/06/schnorr-applications-batch-verification/)*



今天的 Suredbits Schnorr 签名系列，我们会开始讲解门限签名方案！我们会介绍门限签名的几种用途，然后提出三种构造门限签名的方法，每一种都有自己的优缺点。最后一种（可能也是最让人激动的一种）门限签名实现是 FROST，将使用一篇博客的篇幅来讲解，所以，也请期待下一篇文章。

<details><summary><strong>Schnorr 签名系列</strong></summary>
<a hef="https://suredbits.com/introduction-to-schnorr-signatures/">What are Schnorr Signatures – Introduction</a><br>
<a href="https://suredbits.com/schnorr-security-part-1-schnorr-id-protocol/">Schnorr Signature Security: Part 1 – Schnorr ID Protocol</a><br>
<a href="https://suredbits.com/schnorr-security-part-2-from-id-to-signature/">Schnorr Signature Security: Part 2 – From IDs to Signatures</a><br>
<a href="https://suredbits.com/schnorr-applications-musig/">Schnorr Multi-Signatures – MuSig</a><br>
<a href="https://suredbits.com/schnorr-applications-scriptless-scripts/">Scriptless Scripts – Adaptor Signatures</a><br>
<a href="https://suredbits.com/schnorr-applications-batch-verification/">Batch Verification</a><br>
<a href="https://suredbits.com/schnorr-applications-threshold-signatures/">Schnorr Threshold Sigantures</a><br>
<a href="https://suredbits.com/schnorr-applications-frost/">Flexible Round-Optimized Schnorr Threshold – FROST</a><br>
<a href="https://suredbits.com/schnorr-applications-blind-signatures/">Schnorr Blind Signatures</a><br>
<a href="https://suredbits.com/the-taproot-upgrade/">Taproot Upgrade – Activating Schnorr</a>
</details><br>

门限签名是这样一类签名方案：n 个参与者共有一把密钥（就像 [MuSig](https://suredbits.com/schnorr-applications-musig/) 多签名方案），但只需其中任意 t 个参与者合作，即可为这个共有密钥生成有效的签名。我们把这样的方案叫做 t-n 签名方案（在比特币的世界里面大家也经常使用 m-n 的表述）。大多数比特币爱好者都知道这个概念和属于，因为比特币有一个内置的门限签名方案，就是脚本编程语言中的 OP_CHECKMULTISIGNATURE 操作码。

但是，这个操作码会把所有参与者的公钥和阈值要求都在链上公开，那么，像往常一样，我们希望把我们合约的所有细节都隐藏起来，在链上只公开一个公钥和签名。并且，结果跟普通的单公钥支付越像越好。

在研究可以达成这个目标的两种办法之前，我们先来看看门限签名的一些强大的用法。

## 用途

大体上，门限签名的用法可以分为三类（当然也不是那么泾渭分明的）：

1. 由控制资金的（也许可信的）外部实体组成的联盟
2. 由控制资金的内部人组成的联盟
3. 由内部人和外部人共同组成的联盟

除了我们下面要讨论的，门限签名还有很多用法，我只希望下面的讨论能给读者一些门限签名用法的印象，让读者有兴趣读完剩下的部分。

### **托管**

上面的第一个类别可以不严谨地称为 “托管” 场景，既包括字面意义上的托管，也包括其它形式的比如侧链。

门限签名一直被认为是在需要信任的方案中提高安全性、抵御腐败和勾结的最简单的方法。举个例子，如果某个合约的参与者希望把他们合约的强制执行权交给被信任的外部实体，那显然交给一个 t-n 的团队会比交给单一一个主体要好。因为贿赂的成本显著上升了，攻击者不是只腐化一个主体就行，必须能贿赂 t 个托管方。更进一步地，t < n 也很有用，即使某些托管方联系不上了（例如，被政府关停了）或者不配合（例如被黑了），合约也仍然是安全的。可以从门限签名方案中受益的托管解决方案包括：[Smart Contracts Unchained](https://zmnscpxj.github.io/bitcoin/unchained.html)、[谨慎日志合约（DLC）](https://suredbits.com/schnorr-applications-scriptless-scripts/)，等等。

另一个不那么像托管、但我会松散地把它归入这一类的是侧链（比如 Liquid），它需要你信任某个联盟（以门限控制结构联结的团体），你在主链上给他们发送资金、在链下（咳咳，比特币的链下）收到侧链 token。资金也可以从侧链上取回到主链上，前提是联盟里有足够数量的成员保持诚实。

### **密钥管理**

托管场景的相反方向，可以概括地称为 “密钥管理” 场景。也就是一个人要使用多个密钥来保护自己的资金。你可能会奇怪，谁会有这种需要呢，但答案就跟我们喜欢有门限结构的托管方、不喜欢单一一个托管方，很相似。如果你用 t-n 的门限方案来保管自己的资金（通常是 2-3 或者 3-5），那么即使你的某个（或者某一些）密钥被盗取或者弄丢了，你也不会丢失资金！只要你仍然拥有 t 个密钥即可。这种方案，在你的某些密钥以极为安全且相互隔离的办法保管时，极为有用。举个例子，你可以使用一个冷密钥、一个交给安全公司的密钥、和三个热密钥（一个放在家里、一个放在办公室，还有一个放在手机上）。这个 3-5 的方案，在你掌控所有 3 个热密钥的时候能正常花费资金，而即使你弄丢了一部分密钥，只要你还有一个热密钥，你就可以安全地把资金转移。

这样的密钥关岭方案，对交互式协议比如闪电网络来说，也是有用的。未来，闪电节点可能会保管一大笔资金，那时候只用保管在一个地方的一把私钥（还必须是在线的）来控制全部资金，也是不安全的。，而门限方案，就像上面说的那样，可以让闪电节点更加安全。

### **集体资金**

最后一种值得一说的的用途是集体资金。比如，夫妻共同拥有的资金可以存入一个 “共同账户”（虽然对于大多数情形来说，MuSig 已经能胜任了），或者一个控制支出的委员会，需要 t-n 的成员参与才能授权使用资金。

## 使用 MuSig + Taproot 来实现

实现门限签名有很多种办法，有一种我们已经讨论过了。回到 [MuSig 那篇博客](https://suredbits.com/schnorr-applications-musig/)（[中文译本](https://www.btcstudy.org/2021/11/29/schnorr-applications-musig/)），我们已经讲到了 Taproot 可以让输出包含一棵隐藏的支付条件树。所以，举个例子，如果我们希望在 Alice、Bob、Carol 之间以公钥 A、B、C 形成一个 2-3 的门限签名输出，但又希望这个输出看起来就像一个普通的单公钥输出，我们可以把下面三个条件都放到这棵树上：

- MuSig(Alice, Bob)
- MuSig(Alice, Carol)
- MuSig(Bob, Carol)

而这个输出实质上就成了一个 2-3 的门限输出！

这个方案的好处在于它是完全非交互的，意思是 Alice、Bob 和 Carol 无需为了构造这个输出而交换信息。而它的主要缺点在于，在花费的时候，这个输出跟普通的单公钥花费还是有区别的，因为必须公开有这棵树（但不需要公开树的全部内容）。有两个小的缓解措施，一个是你可以把 3-3 的 MuSig 公钥放在树的顶端，这样如果你们三个一致同意花费，就无需公开这棵树，交易看起来跟普通的非合约支付没有区别。另外，你也可以把上面三种情形中最有可能的一种放在树的根部，而另外两种隐藏在树上，这样，只要树的顶端情形中的双方一致决花费，就无需公开这个树（因此也无需公开另外两种情形）。

这个方案另外的一大缺点是，需要添加到树上的条件的数量会随着参与者数量的增加变得非常多，而且 t 越接近 n 的 1/2，情形就越明显。例如，2-3 门限签名有 3 种情形，3-5 有 10 种情形，4-7 有 35 种情形，5-9 有 126 种情形，而且这个序列会呈指数级增长，所以 13-25 有 520 0300 种情形！这就意味着以其中一种情形花费时需提供的默克尔证明有 23 个哈希值那么长！对于大部分情形来说这都不是一个问题，因为我们假设实在一个小规模的团体中使用多数决的门限签名，但如果涉及到很多密钥，这可能是一种低效而且隐私性很差的方法。

## 使用 MuSig-DN + 适配器签名来实现

另一种最近才提出的、在托管场景中实现门限签名的方法是运用是[适配器签名](https://suredbits.com/schnorr-applications-scriptless-scripts/)（[中文译本](https://www.btcstudy.org/2021/12/02/schnorr-applications-scriptless-scripts/)）以及来自 [MuSig-DN](https://eprint.iacr.org/2020/1057) 的核心构造 —— 伪随机函数（PRF）和相应的非交互式零知识（NIZK）证明系统。别担心，我不会在这里讲解它们两个的细节，你只需要知道，从 MuSig-DN 的论文中，我们知道了如何构造一个可验证的加密函数（Verifiable Encryption function） VEnc(x, E)，它会返回用公钥 E 加密 x 的结果（所以只有 E 对应私钥的主人可以解密它），以及一个零知识证明，证明当 E 对应私钥的主人解密这个数值时会得到 `x * G` 的私钥。我们管它叫可验证的加密函数，是因为它是一个教秘函数，同时密文只需使用公开信息（公钥）来验证。

有了这个函数（以及相应的解密函数 VDec(VEnc(x, E), e) = x），我们就能像我在 PTLC 系列博客的 “[单调访问结构](https://suredbits.com/payment-points-monotone-access-structures/)” 那一篇里说的那样，构造 “OR 点（OR Point）”。即，如果我像构造一个支付条件，要么公钥 A 的标量公开、要么公钥 B 的标量公开（这是一种点时间锁合约，比如 A 和 B 可以是一个断言机的签名点），即可花费资金，那我可以给出一个适配器签名点，其适配点是一个随机的点 X；然后我用两个点作为公钥来加密 X 的标量 x：c1 = VEnc(x, A)， c2 = VEnc(x, B)；随后我再把这两个加密值发送给我的交易对手。那么，无论我的对手知道 a 还是 b，都可以解密出 x，然后我的适配器签名就可以通过 x 来补完。

说得再准确一点，考虑一个简单的托管合约，Alice 想给 Bob 支付，只要后者为她提供一项服务。双方都信任 Erin 作为公平的仲裁者，但 Eric 现在不知道他们结成了这样一个合约。Alice 把自己发到了一个他和 Bob 的 MuSig 输出里面，并向 Bob 提供了一个向 Bob 支付资金的适配器签名（而 Bob 也向 Alice 提供了一个普通的签名，该交易会在一段时间之后把资金发回给 Bob）。这个适配器签名的适配点是 X，Alice 先生成了 x，然后使用公钥 A 和 E 来可验证地加密 x，然后把两个加密值都发给了 Bob。

Bob 提供了服务之后，他向 Alice 要求支付。如果 Alice 是个爽快人，她可以向 Bob 揭示 a，使后者能解密出 x 并使用它来补完 Alice 的适配器签名并拿走资金。不然，Bob 可以向 Erin 请求仲裁，Erin 既可以决定站在 Alice 一边，也可以站在 Bob 一边，如果使后者，Erin 可以把 e 给 Bob，这样 Bob 就可以解密出 x 并拿走资金。

这第二种方案不需要在缔结合约时与托管方交互，但在参与方之间需要比 MuSig + Taproot 方案更多的加护。这个方案的另一个不利之处在于，它只支持单向的支付；但这也不像它听起来的那么差，因为多方可以自动在不同方向上建立多个单向支付来跨越这个限制。这种方案（除了可以兼容闪电网络以外）的好处是，它最终呈现在链上的交易也跟普通的单公钥支付没有区别，也不需要用到 Taproot 魔法！

要了解这种方案的更多细节，请看 Jonas Nick 的[这篇 Gist](https://gist.github.com/jonasnick/d413c80ad18f2d775a75316e7c3c797b)。

我们现在已经知道门限签名方案可以用在哪里，以及两种实现门限签名的方法了，但即使如此，也还有很多可以讨论的。在下一篇文章，我们会探究 FROST，灵活的最优轮次 Schnorr 门限签名！你可以认为这是把 MuSig 延伸到了门限签名中，但细节有很多，都在下一篇文章，敬请期待！

（完）