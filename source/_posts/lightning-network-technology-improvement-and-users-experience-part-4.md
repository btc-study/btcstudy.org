---
title: '闪电网络：技术与用户体验（四）：收款码'
author: 'Anony'
date: '2024/02/27 17:46:55'
cover: ''
excerpt: '小小收款码有玄机'
categories:
- 闪电网络
tags:
- 闪电网络
---


> *作者：Anony*
> 
> *[前篇见此处](https://www.btcstudy.org/2024/02/23/lightning-network-technology-improvement-and-users-experience-part-3/)*

在上一篇文章中，我们了解到，在最初设想的闪电网络支付中，收款方应该向付款方发送一个 “闪电网络发票（invoice）”，使后者能够在闪电网络中找出收款方的位置并通过 HTLC 和中间节点送达支付。作为一段数据，闪电网络可以有各种各样的形式，它可以是一串字符，也可以编码成一个 QR 码。

在支付方和接收方能够面对面的情形中，将闪电发票编码成 QR 码会更加便利，而且跟当今用户习惯的互联网支付没有什么分别 —— 支付方拿出手机，打开闪电 App，然后扫描接收方的 QR 码，App 在后台处理之后，点击确认，完成支付。

但是，这样的 “收款码” 却有一个奇怪的特点：它只能用一次。闪电发票本质上是一次性的，一旦支付成功，或者超时失败，就不能再次使用。

对于做生意的商家来说，这有一点点麻烦，就是每次都必须为用户生成一个新的收款码，但还不算是不能接受。但是，对另一些场景来说，它就很不便利了。比如说：互联网打赏；熟人间的多次来回支付；捐赠。在这些场景中，让接收方手动一一为支付方生成并提供发票，要么在时机上不现实，要么在规模上不现实。

为了实现 “静态的收款码”，人们提出了许多方案。我们先来看第一种。

## Keysend

“Keysend” 的想法是：因为节点的 `node_id` 是不会改变的，而且在给出发票之后就会向支付方暴露，所以，可以用它来作为一个静态的端点。

具体来说，当一个支付方在知道接收方的 `node_id` 之后，想要再次给 TA 支付，又不便于获取发票时，就这样做：支付方自己生成一个秘密值，并计算出其哈希值；然后，将这个秘密值放在给接收方的支付转发消息中，同时，使用其哈希值来构造传递支付的 HTLC。当加密的消息被一跳一跳传递给接收者节点时，TA 会解密消息，然后知晓其中的秘密值，然后就可以像常规的闪电网络支付那样回传原像。（支付转发消息在闪电网络中传递的详情，请见[上一篇文章](https://www.btcstudy.org/2024/02/23/lightning-network-technology-improvement-and-users-experience-part-3/)。）这样一来，支付方无需接收方出示原像，就能在闪电网络中完成一次多跳支付。

Keysend 有许多有趣的用法。比如，你可以用它来实现对一些通道的内部余额的打探（probing）：发送方向接收方发送一次 Keysend，并要求接收方不要接收支付，而回传错误；当这样的支付逐步加大额度，从而在某一跳断开时，发送方也就知道了该通道在该方向上的余额。打探可以变成对隐私性的攻击，但是，也可以用来提前打探路径，从而避免支付失败。还有人尝试用 Keysend 来发送消息，也即借助闪电网络实现加密的即时通讯  <sup><a href="#note1" id="jump-1">1</a></sup>。

Keysend 还有一个优点：它完全不依赖其它协议，而只依赖闪电网络自身。

不过，作为一种支付，它还是有一个令人难以接受的缺点：它不能得到收据。由于用来构造 HTLC 的哈希值是由支付方自己指定的（而发票中的哈希值是由接收方指定的，并具有接收方的签名），他从一开始就知道这个哈希值背后的原像，所以，即使全部 HTLC 顺利结算，也不能认为自己得到了收据。

另一个同样不容小视的缺点是，如果以 `node_id` 来接收支付（比如在捐赠或打赏场景中），接收方的隐私会有非常大的缺陷。接收方的节点、通道、通道 UTXO，都会暴露。

当前，大多数闪电网络客户端都已经实现了 Keysend 的功能，不过，在运行的时候可能需要用户手动打开这个功能。

Keysend 的介绍还可见这篇文章 <sup><a href="#note2" id="jump-2">2</a></sup>。

> 在[上一篇文章](https://www.btcstudy.org/2024/02/23/lightning-network-technology-improvement-and-users-experience-part-3/#%E5%A4%9A%E8%B7%AF%E5%BE%84%E6%94%AF%E4%BB%98)中，我们介绍了一种叫做 “AMP（原子化多路径支付）” 的技术，并表示它其实更像一种 Keysend 方案。其中的缘由，在了解 Keysend 是什么之后，当不难理解。读者可以看看 Lighting Labs 为 AMP 编写的介绍 <sup><a href="#note3" id="jump-3">3</a></sup>，看看其特性与 Keysend 有多么相似。

## LNURL 与 Lightning Address

从 Keysend 的案例中我们可以知道，尽管发票令人觉得麻烦，却是不可或缺的一种东西，因为它可以让支付方获得收据（支付证据）。换言之，合理的方案应该是能够自动化地请求发票，而不是完全绕过发票（像 Keysend 那样）。

而这就需要一种方式，能够触达接收者节点、请求一个闪电发票，并且发票能恰当地回传到支付方处。

那么，如果接收者节点有一个可被外部访问的网络端点（比如，一个可以访问的网络域名或者 IP 地址），那么支付方就可以先访问这个网络端点、请求接收者的发票；获得发票之后，再启动常规的支付流程。

LNURL 就是在这个想法上产生的解决方案。接收者节点额外运行一个 LNURL 服务端，并将该服务端的网络端口（例如 `https://lnurliscool.com/receiver`）编码成一个 QR 码。然后，在支付中：

1. 接收者出示这个 QR 码；
2. 支付者使用支持 LNURL 协议的闪电 App 扫描这个 QR 码；
3. 支付者的闪电 App （LNURL 客户端）依据 QR 码中的访问 LNURL 服务端，请求一定数额的发票；
4. 接收者的 LNURL 服务端回复发票；
5. 支付者的闪电 App 根据发票，启动常规的闪电支付流程。

由于 QR 码所编码的不是发票，而是一个网络端口，当然可以是稳定不变的：支付者可以向服务端多次请求发票并发起支付。这种收款码的一种有趣的形式是 `XXXX@YY.com` 这样看起来像电子邮件地址的 “Lightning Address（闪电地址）” <sup><a href="#note4" id="jump-4">4</a></sup>，前缀是一个自定义的标识符，后缀则是 LNURL 服务端的域名。支付者的闪电 App 会根据 LNURL 规范 #16 <sup><a href="#note5" id="jump-5">5</a></sup>，组合出一个网络端口。

LNURL 是一套多特性的协议，除了上述特性（称为 “LNURL-Pay”）之外，还有：

- Auth（身份验证）特性，为一个闪电网络用户生成不同的公钥，作为登录不同网站的身份 <sup><a href="#note6" id="jump-6">6</a></sup>；
- Withdrawal（取款），在扫码之后可以获得支付（取款），而不是发起支付 <sup><a href="#note7" id="jump-7">7</a></sup>；（这就实现了 “付款码” 的功能）

到目前，规范基本上已经稳定下来了 <sup><a href="#note8" id="jump-8">8</a></sup>。你可以在他们的规范库中看到哪些钱包已经支持了 LNURL。

值得一提的是，在当前，你会发现，实现 LNURL 的钱包大多是托管钱包，它们会给每一个用户分配一个 Lightning Address，以允许使用 Lighting Address 收取支付，使用 LNURL 的其它功能更不在话下。但自主保管钱包往往只允许用户向 Lightning Address 发送支付，而不会为用户提供 Lightning Address。

其原因可能是，LNURL 自身其实并不解决用户的可访问性问题 —— 用户必须先有一个可访问的互联网端口，然后才能运行 LNURL 的服务端。为用户提供这样的互联网服务（“内网穿透”），超出了自主保管钱包的开发目标，也面临许多用户体验上的挑战 —— 最好的办法还是让有技能的用户在自己的设备上自主选择或搭建一些互联网服务。而托管钱包就不存在这些困扰，其用户并没有真实的闪电网络客户端，也没有复杂的网络问题要处理。

> 托管钱包，顾名思义，资金被托管在服务商处，只是用户可以使用这些名义余额来发起闪电支付。它在各个方面都更接近于如今大多数人接触到的互联网支付产品（比如支付宝、微信支付乃至 PayPal），体验也相似。但是，因为用户和服务商之间并没有真实的通道，因此也无法得到密码学和比特币网络的保护 —— 用户需要信任服务商。在使用这样的服务商时，用户无需考虑在线要求，也无需担心收支额度的问题，一切皆由服务商在后台处理。
>
> 自主保管钱包则依据我们系列第二篇中所述的原理开发出来，因此用户无需信任对手方。

不管怎么说，LNURL 代表了使用其它网络协议来改进闪电网络用户体验的尝试，这可以说是一种特性，也可以说是一种缺点，完全看你持有哪一种视角。因为使用的是额外的网络协议，它有巨大的开发空间。但因为利用了其它协议（而不是仅依赖于闪电网络本身），自主保管的闪电钱包无法直接运用其所有特性，尤其是移动端的用户，几乎只能在托管钱包上享受其所有特性。

接下来，我们进入一种仅依赖于闪电网络，但所实现的最终功能与 LNURL 非常相似的协议。

## BOLT12

如何能够仅依赖闪电网络，来提供网络触达、往返通信的功能呢？

在前面关于 Keysend 的介绍中，我们已经提过，我们可以通过用来传递支付的 “洋葱路由” 协议，向一个节点递送消息；消息就藏在给该节点的加密数据包中。在常规的、成功的支付中，接收者节点会回传一个原像，这个原像是一个 32 字节的随机数，并通过支付路径上各通道的更新，一路回传到支付者节点。而在专门为了传递消息的 Keysend 中，支付者可以在加密数据包中放置消息，并要求接收者节点回传错误（表示支付失败），支付路径上的各通道也会更新，但不返回原像。

如果，我是说如果 —— 如果 A 节点传给 B 节点的是一张发票呢？那么 B 节点就可以依据这个发票给 A 节点支付了！如果 A 节点传给 B 节点的是自身的位置信息呢？那么 B 节点就可以通过 Keysend 给 A 节点发送发票了！

这就是 “BOLT12 Offer” 协议背后的洞见。给定我们可以用闪电网络触达一个节点，自然就能在此基础上实现通讯。BOLT12 增加了一种数据格式，称为 “Offer（要约）”，还有一种叫做 `invoice_request` 的消息类型。

在支付场景中：

1. 接收方出示 Offer（作为收款码）；

2. 支付方根据 Offer 的信息向接收者节点发送 `invoice_request`，其中包含了愿意接受的支付条件以及 `reply_path（回复路径）`；
3. 接收方节点构造发票之后，通过 `reply_path` 发送给支付方节点；
4. 支付方节点根据发票，给接收方支付。

同理，Offer 也可以用于退款：要求退款的一方根据退款方的 Offer 发送发票，退款方就根据发票发起支付。当交互流程反过来（支付者出示 Offer，接收者发送发票）时，它就变成了一种 “付款码”。

由于 Offer 所提供的主要是自身位置的信息，以及其它一些跟支付条件有关的信息，但自身并不是发票，所以，它可以长期使用 —— 支付者可以多次向接收方请求发票。

在 2019 年刚刚提出的时候，BOLT12 就使用上述类似于 Keysend 的做法来传递消息。但随后就有开发者提出 <sup><a href="#note9" id="jump-9">9</a></sup>，这种 “messages-over-payments（通过转发支付的协议来转发消息）” 的做法有很大的开销，沿途的节点必须更新通道状态，还必须保存关于这些承诺交易的信息，而且在回传失败消息时还必须加以处理 —— 与其如此，还不如设计一套新的协议，让支持这种协议的闪电节点能够直接通信，这就是 “洋葱消息” 在闪电网络语境下的含义 <sup><a href="#note10" id="jump-10">10</a></sup>。

在使用洋葱消息之后，节点就可以直接转发消息，转发消息的节点也无需再记忆跟这些消息相关的信息。这也是上述 `reply_path` 的由来 —— 响应 Offer 的一方规划好从自身出发、触达 Offer 方然后再触达自身的环状路径，并将后半段路径放在 `reply_path` 中告诉 Offer 方。

在 2023 年 8 月 <sup><a href="#note11" id="jump-11">11</a></sup>，“洋葱消息” 合并进入了 BOLT7，这意味着以后所有的闪电节点客户端都会实现这种特性。而洋葱消息也会使用我们在[上一篇文章](https://www.btcstudy.org/2024/02/23/lightning-network-technology-improvement-and-users-experience-part-3/#%E8%B7%AF%E5%BE%84%E7%9B%B2%E5%8C%96)中介绍的 “盲化路径”。原本在原理上，BOLT12 是不依赖于盲化路径的，但如今在实现中，变成了需要盲化路径作为前置技术。不过，这也意味着，出示 Offer 的接收方将默认具有更好的隐私性。

BOLT12 尚未合并到 BOLT 中，但这个想法得到了大多数开发者的支持。关于 BOLT12 的特性，这个页面提供了基本的介绍 <sup><a href="#note12" id="jump-12">12</a></sup>。至于其起源和变革，Optech 的主题界面提供非常详尽的参考  <sup><a href="#note13" id="jump-13">13</a></sup>。

相比于 LNURL，BOLT12 最大的特点是，它可以在闪电网络协议内实现，而不需要依赖于其它网络协议和通讯方式。这有它的好处，但是，它也意味着要使用闪电网络中的资源。如今，因为洋葱消息的采用，其开销被进一步降低。我们有理由期望，BOLT12 会给我们带来用户体验的变革。届时，自主保管的钱包，也能提供收款码、付款码这样当前专属于（支持 LNURL 的）托管钱包的体验。

## 结语

在这篇文章中，我们介绍了实现可复用的闪电网络收款信息的尝试。最初的 Keysend 虽然直接，却无法提供支付证据。LNURL 有很大的灵活性，在自主保管的闪电钱包中却难以做到 “开箱即用”。而 BOLT12，通过利用闪电网络自身的特性，最有可能革新自主保管的闪电网络用户的体验。

（未完）

## 脚注

1.<a id="note1"> </a>https://www.btcstudy.org/2022/03/09/on-lightning-messaging-apps-emerge-as-growing-use-case/ <a href="#jump-1">↩</a>

2.<a id="note2"> </a>https://www.btcstudy.org/2022/01/14/technical-series-what-is-keysend/ <a href="#jump-2">↩</a>

3.<a id="note3"> </a>https://docs.lightning.engineering/lightning-network-tools/lnd/amp <a href="#jump-3">↩</a>

4.<a id="note4"> </a>https://www.btcstudy.org/2022/12/22/how-lightning-address-works/ <a href="#jump-4">↩</a>

5.<a id="note5"> </a>https://github.com/lnurl/luds/blob/luds/16.md <a href="#jump-5">↩</a>

6.<a id="note6"> </a>https://www.btcstudy.org/2022/11/30/lightning-authentication-lnurl-auth/ <a href="#jump-6">↩</a>

7.<a id="note7"> </a>https://www.btcstudy.org/2024/02/02/the-past-present-and-future-of-offline-payments/#LNURL-Withdraw <a href="#jump-7">↩</a>

8.<a id="note8"> </a>https://github.com/lnurl/luds <a href="#jump-8">↩</a>

9.<a id="note9"> </a>https://bitcoinops.org/en/newsletters/2020/02/26/#ln-direct-messages <a href="#jump-9">↩</a>

10.<a id="note10"> </a>https://bitcoinops.org/en/newsletters/2020/04/08/#onion-messages <a href="#jump-10">↩</a>

11.<a id="note11"> </a>https://bitcoinops.org/en/newsletters/2023/08/09/#bolts-759 <a href="#jump-11">↩</a>

12.<a id="note12"> </a>https://bolt12.org/ <a href="#jump-12">↩</a>

13.<a id="note13"> </a>https://bitcoinops.org/en/topics/offers/ <a href="#jump-13">↩</a>