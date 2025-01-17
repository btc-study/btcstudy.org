---
title: '使用单向支付通道的 ecash 铸币厂：无节点的闪电钱包'
author: 'lukechilds'
date: '2024/12/04 09:25:19'
cover: ''
excerpt: '用户的余额保管在一个免信任的积分合约中，可以随时在链下换成 ecash token'
tags:
- Ecash
---


> *作者：lukechilds*
> 
> *来源：<https://gist.github.com/lukechilds/307341239beac72c9d8cfe3198f9bfff>*



## 概述

本提议介绍了一种自主保管的积分系统，可以安装在现有的 ecash 铸币厂的前置位置。用户的余额保管在一个免信任的积分合约中，可以随时（比如在支付的时候）在链下换成 ecash token。托管的风险仅存在于支付还在处理中的时候，通常来说只有几秒钟，而且只有当前被转移的数额处在这种风险下。用户的余额总是自主保管的，如果铸币厂消失或拒绝合作，用户可以单方面退出，在链上取回自己的积分。

这套协议在当前的比特币上就可以实现，无需软分叉或任何新的操作码。实际上，它不需要任何操作码。整个协议几乎完全是链下的，所有可能执行这个免信任积分合约的办法都会导致一个 MuSig2  taproot 密钥路径花费，不需要用到 Bitcoin Script。

## 问题

一种标准的用户流程是，用户收到工资之后，就把每个月要花的钱存到一个 ecash 铸币厂，然后逐渐从铸币厂发起小额支付。这个货币流动过程很大程度上是单向的，除了工资以外，终端用户很少收到钱。

如果一个用户每天要支付 4 笔价值 10 美元的交易，那么一个月就要发起 120 笔交易，总价值是 1200 美元。他们可以在月初向某个 ecash 铸币厂存入价值 1200 美元的资金，然后在一个月里自由花费。这个系统很有意义，因为它将每个月 120 笔经济交易压缩成了 1 笔链上交易。

缺点在于，这种效率提升伴随着巨大的风险。所有的余额都托管在铸币厂，用户需要信任他们不会盗取资金。如果一个铸币厂有 1000 名用户是这么做的，那么这个铸币厂就托管着总计 120 万美元的资金。如果铸币厂的运营者认为他们可以卷款跑路，这已经是很可观的数额。即使铸币厂运营者是正派人，攻击者也可能会盯上他。

## 解决方案

与其让铸币厂来保管余额，不如把资金存放在用户与铸币厂之间的一个免信任的积分合约中。这些积分是自主保管的，而且用户和铸币厂都可以单方面退出合约，无需对方的协助。积分可以在链下即时交付给铸币厂、换取 ecash token 。仅在支付时，积分才用来交换 ecash token ，而且这些 ecash token 也会立即被花掉。虽然托管风险依然存在，但仅在处理支付时才存在（通常在几秒内，支付就完成了），而且只有用在交易中的价值才有风险。

这种免信任的积分系统可以用 Spillman 支付通道（一种单向支付通道）来实现。Spillman 通道从未流行起来，因为它有两个重大缺点：它是单向的，而且会在预定的时间内失灵。然而，这却非常适合我们这个应用场景，这两个缺点都不算什么。因为在这个用途中，用户主要是花钱，而不是收款，所以资金只能单向流动就不是问题。而且，用户本来就需要每个月向铸币厂存入一笔钱，所以换成只能存活一个月的通道也不会让体验更差。

既然这些缺点没法阻碍我们，Spillman 通道的好处就非常明显。对于用户来说，不需要运行节点、没有在线要求、没有复杂的状态备份需求，也不需要管理收款额度。用户只需要把钱存进一个通道；把预签名的交易发送给铸币厂，就可以通过通道来支付了。

在本协议中，我们提出了 Spillman 通道的一个新变种，利用比特币的新功能来提升隐私性和效率。我们将 Spillman 通道实现为：任何可能的花费条件都可以通过一个 MuSig2 taproot 密钥花费路径来满足。缺点是，支付的时候需要双方交互；但是，因为发行 ecash token 本身就需要跟铸币厂交互，所以这不会增加太多复杂性。

## 协议

免信任的积分合约是用户与铸币厂的一个 2-of-2 MuSig2 多签名装置。用户为合约提供可供自己花费 1 个月的资金，但暂不广播这笔注资交易。然后，用户创建一笔退款交易，将合约内所有的余额转回给资金，但该笔退款交易的 `nLockTime` （绝对时间锁）表示的时间是一个月之后。然后，退款交易要由用户和铸币厂一起签名。这就是用户的单方面退出交易。退款交易签好名之后，用户就可以安全地广播注资交易了。注资交易得到区块确认之后，这个免信任的积分合约就激活了，而且用户在该铸币厂中有了可供一个月消费的资金，以积分的形式。

要通过铸币厂发起一笔支付的时候，用户必须将免信任的积分换成需要信任的 ecash token。用户创建一笔新的交易，花费注资交易，将铸币厂要求的积分数量发给铸币厂，并将合约中剩余的资金发回给自身。用户会创建一个 musig 碎片签名，并发送给铸币厂；铸币厂用自己的碎片签名聚合之后，就可以得到一个有效的签名。铸币厂不会讲自己的碎片签名（或者说有效的签名交易）回传给用户。这就是铸币厂的单向退出交易，凭此，他们可以随时免信任地执行积分合约。现在，铸币厂给这个用户增记相同数额的 ecash token。这些 token 是有托管风险的，但用户可以立即花掉它们，恢复完全自主保管状态（剩余的余额都存放在免信任的积分合约中）。

下一次用户要发起支付的时候，就如法炮制，创建一笔新的交易，同样花费注资交易，从而替代旧的那笔交易。新交易会给铸币厂支付上一次的数额加上这一次的数额。因为每一次状态更新都为铸币厂形成一笔新的单向退出交易，并且新交易总是比旧交易更有价值，铸币厂只需要保存最新的单向退出交易就可以了，不需要管理复杂的状态。

到月末的时候，这个免信任的积分合约可以展期到下一个月、同时注入更多积分。用户和铸币厂一起签名，花费注资交易，给铸币厂支付已经用掉的积分，并将剩余的余额注入一个新的合约中，供下一个月使用。用户可以为这笔交易增加新的输入，从而为新合约注入更多积分。最终，每个月只有一笔链上交易，这笔交易既为下一个月注入新的积分，又给铸币厂支付用户在上一个月已经花掉的积分。

执行这个免信任积分合约的所有方式 —— 单向退出、合作退出、合作延期 —— 都只是 musig 密钥路径话费，只会留下非常少的链上足迹。任何形式的合约执行都不会用到脚本路径，所以链上观察者不会从合约中看出任何东西。

### **离开这种免信任的积分合约**

双方还可以随时合作式退出这种合约。铸币厂可以随时用最新的状态单方面退出。用户只能在合约失灵后单方面退出。重要的是，如果合约不是合作式关闭的，铸币厂就必须在合约失灵之前单方面退出，否则用户可以单方面退出、将合约中的所有资金都拿回来。

## 进一步的思考

### 隐私性影响

ecsah 最棒的地方之一在于它提供的近乎完美的隐私性。而获得这种隐私性的部分原因在于你在铸币厂中静默的时间。如果你使用这套协议给同一个铸币厂中的用户支付，你就能保持隐私性。然而，如果你使用这套协议给一个铸币厂之外的闪电发票支付，你就无法继承 ecash 的隐私特性。你依然能够获得良好的链上隐私性和闪电网络中的发送者隐私性。不过，铸币厂要对 进入铸币厂的 积分-token 互换、离开铸币厂的 token-闪电支付 互换 执行时序和数额分析是很容易的。从铸币厂操作者的角度看，你并没有隐私性。

不过，这可以通过在铸币厂内持有少量托管的 ecash token 来解决。举例来说，在免信任积分合约中持有大约 95% 的余额，而以 ecash token 形式持有 5% 的余额，就可以模糊数额之间的关系、打破 进入/离开 铸币厂的 时间/数额 关联。你可以恢复 ecash 的绝佳隐私性，仅仅暴露 5% 的余额在托管风险中。有趣的地方在于，这是用户可以配置的。用户可以基于自己对 隐私性/托管风险 的偏好，自己调整这个比例。

### 无法免信任收款

这套协议开启了免信任支付的体验，但没有带来免信任的收款体验。如前文标准使用流程部分所述，收款可能不是许多用户经常要做的事，所以可能不是一个问题。用户可以直接收取托管的 ecash token，然后优先花掉它们（推迟动用积分）。

以前文为例，如果一个用户每天需要支付 4 笔价值 10 美元的交易，那么一个月最多需要 1200 美元以供花费。如果他的其中一笔支付收到了退款，那么就只暴露了 10 美元在托管风险下（占所有余额的 0.8%），并且只会暴露 1/4 天的时间（很快他就会有机会把钱花掉）。

### 延伸成免信任收款

可以在相反方向复制这套协议，从而启用免信任的收款体验，不过，我认为这过于复杂了，而且出于已经解释过的原因，这是不必要的。可能这对希望通过 ecash 铸币厂来收款的商户来说是有意义的。这样，铸币厂就会成为用户和商家之间的，快速、小额、信任最小化的支付中心。

你可以设置一个从铸币厂到商家的一个反向的免信任积分通道。这时候，是由铸币厂向商家开启一条 Spillman 通道。在这种反向构造中，铸币厂必须提前给商家提供预期的流动性，并向商家收费。商家需要信任铸币厂不会盗走正在处理中的支付，然而，一旦支付到达，余额就是自主保管的；而且，如果铸币厂不合作，商家可以单方面退出合约、取走资金。如果商家在合约失灵之前忘了关闭或者延期，铸币厂可以偷走一个月内收到的支付。

因为这种反向构造的额外复杂性，我认为与商家直接使用闪电通道相比并没有明显的优势。

### 流动性

本协议不会给铸币厂施加额外的流动性要求。如果一个铸币厂已经有许多托管用户和非托管用户，随着这些用户断断续续添加积分和花费积分，铸币厂不太可能遇到流动性问题。不过，如果大量非托管用户突然到来，并且都尝试通过闪电网络支付大量资金，就有可能耗尽铸币厂的闪电支付能力。

请注意，这时候铸币厂是没法用部分准备金方案的，它必须具有足够多的资金来处理用户的取款需求，只是铸币厂的一部分资金放在了积分合约中。如果资金离开铸币厂，铸币厂可能需要关闭一些积分合约，来兑付其他用户的取款。因为跟用户关闭合约很麻烦，铸币厂可以通过准备额外的灵活资金，来避免这种需要；或者，可以将闪电支付外包给一个第三方，然后按月结算。

### 合约过期

一份合约存续的时间长度是任意的。我们提议一个月，只是为了跟每月支付薪水的典型会计模式保持一致。不过，这就意味着，每个月都需要一笔链上交易来保证合约开启，即使积分合约中还有大量余额。过期时间可以拉长到一年，这样一年内合约都能保持开启。不过，这样也有缺点，如果铸币厂不愿意合作，用户的资金就会被锁定，最长可达一年。可能这是一个合理的取舍，因为在当前的信任模式（托管模式）下，如果铸币厂不合作，所有资金都会丢失。锁定一年时间依然是明显的提升。

## 致谢

感谢 [@tiero](https://github.com/tiero) 和 [@ArkLabsHQ](https://github.com/ArkLabsHQ) 团队对 Spillman 通道在 Ark 中的作用的[研究](https://arkdev.info/blog/bitcoin-virtual-channels/)，这项研究引导我得出本协议的理念。

感谢 [@moonsettler](https://github.com/moonsettler) 和他尝试使用基于积分的 ecash 解决相同问题的[研究](https://gist.github.com/moonsettler/42b588fa97a1da3ac0adea0dd16dadf2)，帮助我连接起了所有碎片。

感谢 [@tiero](https://github.com/tiero)、[@robinlinus](https://github.com/robinlinus)、[@stevenroose](https://github.com/stevenroose)、[@kukks](https://github.com/kukks)、[@mayankchhabra](https://github.com/mayankchhabra)、[@nmfretz](https://github.com/nmfretz) 和 [@gandlafbtc](https://github.com/gandlafbtc) 花时间阅读这份提议并给我反馈。

（完）