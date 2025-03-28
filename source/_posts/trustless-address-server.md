---
title: '免信任的地址服务器'
author: 'Ruben Somsen'
date: '2022/10/09 11:31:17'
cover: ''
excerpt: '外包地址的发放工作以避免地址复用'
tags:
- 开发
---


> *作者：Ruben Somsen*
> 
> *来源：<https://gist.github.com/RubenSomsen/960ae7eb52b79cc826d5b6eaa61291f6>*



在 [bitcoin-dev 邮件组](https://lists.linuxfoundation.org/pipermail/bitcoin-dev/2022-September/020952.html)中也有讨论。

## 引言

防止地址复用一般来说需要跟支付的接收方交互，以便获得一个全新的地址（每次支付都需要）。人们提出了许多协议来避免这种交互需要，例如 BIP47 <sup><a href="#note1" id="jump-1">1</a></sup> 和 “静默支付”<sup><a href="#note2" id="jump-2">2</a></sup>，但它们都有自己的缺点。

一种似乎没有被好好探讨的可能性是将交互的工作外包出去。BTCPay Server <sup><a href="#note3" id="jump-3">3</a></sup> 就是这样的例子。发送者跟一个服务端交互，服务端代表接收方，交出一个从某个 xpub 公钥推导出来的地址。接收方控制着服务端，因此也信任服务端不会给出错误的地址。

## 外包与恶意公钥

今天的绝大部分轻客户端都已经控制着用户的 xpub（奇怪的是甚至连支持 BIP47 的轻客户端也这样），所以似乎可以合理认为交互可以外包出去了。但是，这不像你运行自己的服务器，第三方的服务器 *可以* 给出恶意的地址（即：属于别人而不属于你的公钥）。

这个问题的解决方案是身份。只要发送者知道代表接收者身份的一个公钥，接收者就可以给从自己的 xpub 中推导出来的地址签名 <sup><a href="#note4" id="jump-4">4</a></sup>。这样一来，发送者就可以知道自己从服务端收到的地址真的属于接收者了。

## 空缺限制

还有一个很大的问题没有解决，就是空缺限制（gap limit）<sup><a href="#note5" id="jump-5">5</a></sup>。如果一个敌手不断重复向服务器请求地址、但并不使用这些地址，这有可能在两个用过的地址之间造成一大片没有用过的地址。这是一个问题，因为从备份中恢复钱包时，软件遇到足够大的未使用地址序列时就会停止搜索。不幸的是，这个问题没有完美的解决方案，但也有一些缓解措施。

在发送者希望发起第一笔支付时，他们需要为获得一个地址付出一些代价（输入验证码、通过闪电网络支付一笔钱、燃烧证明 <sup><a href="#note6" id="jump-6">6</a></sup>，等等）。如果发送者不在乎（或者甚至希望）自己的支付跟接收者关联起来，接收者可以交出一个新的 xpub <sup><a href="#note7" id="jump-7">7</a></sup>（而不是一个地址），以便发送方重复支付。如果用户不希望支付被关联起来，服务端可以在每一次成功支付后向支付方发放一个盲化的 ecash <sup><a href="#note8" id="jump-8">8</a></sup> token，让发送方可以支付到另一个地址。

另一种缓解措施是要求发送者在得到地址之前向服务端透露自己即将发起的交易 <sup><a href="#note9" id="jump-9">9</a></sup>（对用户更加友好，但实现起来更复杂）。这不是隐私性的降级，因为服务端可能已经知道了这些信息。如果交易最终没有发送，日后任何重用相同输入的尝试都会要么被（暂时地）列入黑名单，要么得到之前已经给过的相同地址 <sup><a href="#note10" id="jump-10">10</a></sup>。

如果尽了这些努力，还是在无意中触发了空缺限制，接收者可能必须得到指引，以保证在发出新地址之前能够收到一笔支付来结束这一连串的空缺。另一种办法是在发生这种情况时放弃隐私性，不过似乎是不明智的。

## 应用场景

这套协议对这样的用户来说应该是有用的： a）希望使用轻客户端的用户；b）接受因为向第三方给出自己的 xpub 而带来的隐私性降级），以及 c）希望不用交互即可接收支付。任何一个条件不满足，都会找到其它更好的选择 <sup><a href="#note11" id="jump-11">11</a></sup>。最后，需要提醒的是，为了实现空缺限制策略，这种协议会在发送者一端引入更多的摩擦。

### 脚注

1.<a id="note1"> </a>BIP47：https://github.com/bitcoin/bips/blob/master/bip-0047.mediawiki  <a href="#jump-1">↩</a>

2.<a id="note2"> </a>静默支付：https://gist.github.com/RubenSomsen/c43b79517e7cb701ebf77eec6dbb46b8 <a href="#jump-2">↩</a>

3.<a id="note3"> </a>BTCPay Server：https://btcpayserver.org/ <a href="#jump-3">↩</a>

4.<a id="note4"> </a>具体来说，这可以是对一个默克尔根的签名，这样就最小化了接收方需要发送给服务端的数据量，而服务端可以从同一个 xpub 中生成同一棵默克尔树，并将默克尔证明交给发送者。叶子的顺序需要随机化，这样发送者就无法知道接收者已经得到了多少支付。 <a href="#jump-4">↩</a>

5.<a id="note5"> </a>空缺限制：https://bitcoin.stackexchange.com/questions/111534/bitcoin-address-gap-limit <a href="#jump-5">↩</a>

6.<a id="note6"> </a>高效的燃烧证明：https://lists.linuxfoundation.org/pipermail/bitcoin-dev/2022-July/020746.html <a href="#jump-6">↩</a>

7.<a id="note7"> </a>Xpub 分享：https://gist.github.com/RubenSomsen/c43b79517e7cb701ebf77eec6dbb46b8#xpub-sharing <a href="#jump-7">↩</a>

8.<a id="note8"> </a>盲化的 ecash：https://gist.github.com/RubenSomsen/be7a4760dd4596d06963d67baf140406 <a href="#jump-8">↩</a>

9.<a id="note9"> </a>差不多等于是签好名但不完整的交易，缺失了输出地址 <a href="#jump-9">↩</a>

10.<a id="note10"> </a>请想象极端情形，例如，第一次出现了两个输入，但都未被使用，但后来的两笔交易各用了其中一个输入。 <a href="#jump-10">↩</a>

11.<a id="note11"> </a>协议考量：https://twitter.com/SomsenRuben/status/1530096037414707200 <a href="#jump-11">↩</a>

（完）