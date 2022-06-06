---
title: 'Spacechain：永续单向锚定的侧链'
author: 'Ruben Somsen'
date: '2021/11/10 12:44:08'
cover: '../images/21-million-bitcoins-to-rule-all-sidechains-the-perpetual-one-way-peg/JcZ1A8QYsoL'
excerpt: '可以实验新技术，又无需发行新的投机资产'
tags:
- Layer-2
- Spacechain
---


> *作者：Ruben Somsen*
> 
> *来源：<https://medium.com/@RubenSomsen/21-million-bitcoins-to-rule-all-sidechains-the-perpetual-one-way-peg-96cb2f8ac302>*



目前区块链领域存在一个显著而巨大的激励问题。使用新的链和技术来实验新功能是有价值的，但要想创造新的链，每条链都需要自己的币（token）。但是，一旦涉及币，就不可避免被人类的贪婪追逐，即使初衷善良的项目，也可能会变成投机的泡沫。我在这里提议的，是一种以让新的实验性的链与比特币区块链连锁的方案，而且它能很大程度上排除投机的力量。缺点就是，它不可能像比特币一样充当价值储藏手段。

回到 2014 年，一个实验性的领域是去中心化的双向锚定[侧链](https://blockstream.com/sidechains.pdf)。如果可以免信任地在两条链之间转移资金，那么比特币的 2100 万限制就可以作为一个基础层，支持所有可能的实验。这个想法一度被认为是可以通过使用 SPV（简易支付验证）证明来实现的，但很快因为不安全而被放弃 <sup>1</sup>。也许在未来，零知识证明可以可靠地提供这个功能，但至少在今天，我们知道的最接近这个目标的是 [Drivechain](http://www.drivechain.info/)（一个有点保守的想法，保守在仍然重度依赖矿工的激励和用户激活的软分叉）和联盟侧链（例如 [Liquid](https://blockstream.com/liquid/) 和 [Statechain](https://medium.com/@RubenSomsen/statechains-non-custodial-off-chain-bitcoin-transfer-1ae4845a4a39)）。

这使我们开始考虑单向锚定的想法 —— 为了在另一条链上收到 token，你要烧掉比特币。烧掉一个比特币就能得到一个 token（维持 2100 万的上限），但反向操作是做不到的。有一些项目已经这么做过了（例如 [Counterparty](https://blockstream.info/address/1CounterpartyXXXXXXXXXXXXXXXUWLpVr)），但他们只允许烧掉一段时间，这段时间过了以后，投机活动仍会猖獗。而我的提议的，是 *一种永续的单向锚定*（P1WP），也就是用户可以随时迁移到另一条链上 <sup>2</sup>。

![img](../images/21-million-bitcoins-to-rule-all-sidechains-the-perpetual-one-way-peg/JcZ1A8QYsoL)

<p style="text-align:center">- 就像《指环王》中的 Sam 说的：“弗罗多先生……世界上有一些美好的东西，值得你<strong>烧掉自己的比特币</strong>” -</p>

从价值的角度看，需要注意的主要事项是，它让比特币变成更好的投机资产，因为你总是能把比特币换成别的资产（但别的资产就换不成比特币）。即使有人觉得这些新的 P1WP 侧链中有某一个比比特币要好，逻辑上来说，TA 仍然应优先持有比特币。这就意味着投机新的资产变成没意思的事情 <sup>3</sup>，而比特币的网络效应也得益维持，因为新技术能在这些侧链上开发。

如果一个新的侧链表现优异，越来越多人会想烧掉自己的币 <sup>4</sup>。如果某个侧链因做的不好而消亡，也只会影响到用了这条链的无畏（或无知）的人。他们是烧掉了手上的比特币，换成了实际上没有用处的 token。关键在于，不管是哪一种情形，比特币的持有者的处境都只会变得更好 —— 别人烧掉了自己的比特币，他们手上的比特币价值就提升了。

但是，谁会想烧掉自己的比特币呢？只有一个理由：TA 急需某种币来支付交易手续费。这种币反映了对侧链的区块空间的市场需求。你可以认为比特币是一个果园而这种币是苹果。你只有饿的时候才会买苹果（需要区块空间的时候），不会因为你觉得下周有人愿意为苹果出更高的价格而买。苹果没有什么价值储藏效果。如果你想投机苹果的期货，你可以直接投资果园（比特币）。

![img](../images/21-million-bitcoins-to-rule-all-sidechains-the-perpetual-one-way-peg/76rvy4JZpzJ)

没法把币转回到比特币区块链上来（虽然你可以跟其他人交换），本质上也意味着侧链 token 永远无法称为有吸引力的价值贮藏手段，但 **所有其它应用场景都会成为可能**，无需再引入另一种高度投机性的资产。想象一下带有隐私特性的染色币（colored coin）（可以实现双向的比特币联盟链）、实验性的智能合约特性、DAO、DeFi，以及所有你喜欢的热词。

讽刺的是，P1WP 实际上实现了以太坊在启动时用过的一个著名而又误导性的营销口号：它只是一种 “gas”，不会与比特币的价值储藏地位竞争 <sup>5</sup>。

虽然 P1WP 使用自己独立的共识算法来运行一条侧链，直接使用 “盲化合并挖矿”（Blind Merged Mining，BMM）会有很好的效果，因为这是另一种将它与比特币同步绑定的机制 <sup>6</sup>。BMM 本质上是将挖矿外包给了比特币矿工而不要求他们验证 BMM 区块。任何人都可以创建 BMM 区块，并通过支付普通比特币交易的手续费来让比特币矿工打包。因为它会将 BMM 区块中所有的手续费都支付给矿工，它提高了比特币网络的 PoW 安全性。我将 BMM 带到比特币网络的完整功能设计可见[此处](https://gist.github.com/RubenSomsen/5e4be6d18e5fa526b17d8b34906b16a5)。

大体就是如此。如果你的链不想做价值储藏，那就不需要那么多设计。你也不需要发行一种新的投机资产 —— 你所需的，只是永续的单向挂钩。

有任何的想法和观点，欢迎加入我们的 [Twitter](https://twitter.com/SomsenRuben/status/1246053126601191425) 和 [Reddit](https://www.reddit.com/r/Bitcoin/comments/fupf03/fully_decentralized_sidechains_for_bitcoin_via/) 讨论。

![img](../images/21-million-bitcoins-to-rule-all-sidechains-the-perpetual-one-way-peg/tTq3zZIwimP)

<p style="text-align:center">- 你觉得他是决心满满，还是因为嘴里进了沙子想哭呢？我看不出来 -</p>

## 脚注

1. 普遍存在的一个问题是， 51% 的矿工联合可以创建一个假的 SPV 证明并拿走所有的钱。如果侧链的安全性不高但又储存了许多的币，这会成为很严重的问题。
2. Adam Back 在 2013 年就[有了这个想法](https://sourceforge.net/p/bitcoin/mailman/message/31519067/)。注意，永续锚定的意思是，父链必须持续得到验证、为通过燃烧发行的新币提供证据。SPV 证明也是一种选择，但没有那么安全。
3. 如果太多比特币被烧掉，或许需求低落，侧链 token 价值低于比特币是有可能的。相应地，如果需求回来了，token 的价值也会回到与比特币持平。这个过程仍然可以投机。
4. 虽然概率极低，但新的侧链变得非常流行、以至于所有人都迁移过去、让它变成一个选择进入的硬分叉，也是有可能的。
5. 先看完这篇文章，再看脚注下方的图片。
6. 理论上有个问题，如果比特币区块链在某次燃烧后重组，token 会因为没有背书而发生通胀。BMM 就解决了这个问题，因为比特币区块链的重组会导致 BMM 链也重组。
7. 因为区块奖励会不断减少、区块空间市场需要源源不断的收入，为矿工床在获得高手续费收入的方式可能会被证明是至关重要的。

![img](../images/21-million-bitcoins-to-rule-all-sidechains-the-perpetual-one-way-peg/LGirYVv2gA4)

<p style="text-align:center">- 以太坊基金会的想法是对的，只不过在执行上 “投机失败”。 -</p>

（完）
