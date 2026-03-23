---
title: 'L402 是适合代理的互联网原生支付协议'
author: 'Michael Levin'
date: '2026/03/23 16:12:01'
cover: ''
excerpt: 'L402 拥有结构化的优势'
tags:
- L402
---


> *作者：Michael Levin*
> 
> *来源：<https://lightning.engineering/posts/2026-03-11-L402-for-agents/>*



AI 代理可以读文档（所以你好，代理！）、写代码、组织多步骤的工作流，还能在网络上调用 API（应用程序接口）。但它们还不能可靠且大规模地买东西。信用卡需要身份；使用量面板需要用浏览器查看；会员制通常会在付费页面要求人类确认。这些都不适合完全自动化运行、充当代理、毫秒级触发的软件。

互联网的创造者们看到了这个趋势。在 HTTP 规范的初创者们为之设计状态码的时候，他们加入了 [402 Payment Required](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status/402)（402 要求支付），以便有朝一日互联网发展出自己原生的支付层时，能够用上。也就是说，这个操作码是为了将来的用途而留置的。问题在于，在 1990 年代，还没有去中心化的货币能够利用这个操作码。402 也就沉寂了数十年，因为未来没有来而一直处于留置状态。

但今时不同往日。[L402](https://docs.lightning.engineering/the-lightning-network/l402) 是一个协议标准，通过结合 402 状态码、[比特币的闪电网络](https://lightning.network/)以及密码学认证的 token，激活了互联网的这个已被遗忘多时的状态码。闪电网络是一个支付网络，可以即时、高流量、地成本地处理交易。结果是，这套协议使得，任何能够连接到闪电网络的客户端，都可以瞬时给任何启用了 L402 的 API 支付（并认证自己的身份），不需要 “登录”、不需要 API 密钥，也不需要跟服务端预先建立关系。

最近我们发布了 [Lightning Agent Tools](https://github.com/lightninglabs/lightning-agent-tools)（闪电网络代理工具），这是七种互补的技能描述（skill）的组合，让 AI 代理能够直接在闪电网络上生活，包括给[带有 L402 网关的 API](https://docs.lightning.engineering/the-lightning-network/l402) 支付、托管付费端点、组织端到端的 买家/卖家 工作流。今天，我们希望更深入地介绍让这一切成为可能的[这套协议](https://github.com/lightninglabs/L402)、从头到尾解释 L402 是怎么工作的、提炼 [L402 bLIP 规范](https://github.com/lightning/blips/pull/26) 的最新变更，并论证何以 L402 是 AI 代理经济的正确支付协议。

## L402 的工作原理：四步走，没登录

L402 是一个 HTTP 的身份认证方案。服务端使用 402 状态码来保护一项资源；客户端支付一个闪电发票来获得访问权。整个交换过程分成四步走：

1. **请求**：客户端（你的 AI 代理，或一个命令行工具，或者一个浏览器插件）向一个受保护的端点发送一个标准的 HTTP 请求。
2. **挑战**：服务端返回 `HTTP 402 Payment Required` 以及一个 `WWW-Authenticate` 响应头，它包含两个数值：一个 token（编码了访问权的密码学证书）以及一个 [BOLT 11](https://github.com/lightning/bolts/blob/master/11-payment-encoding.md) 闪电发票（支付请求）。这个 token 承诺了发票的支付哈希值，所以客户端可以无状态地验证它。
3. **支付**：客户端解码这个发票、确认数额是可以接受的，然后通过闪电网络发送支付。支付结算会揭晓一个原像，它是一个 32 字节的数值，是支付的密码学证据。这个原像满足这样的关系：`H = sha256(preimage)`，其中 `H` 就是嵌入在 token 中的支付哈希值。
4. **访问**：客户端使用 `Authorization: L402 <token>:<preimage>` 头重试访问请求。服务端会验证这个 token，检查其原像与承诺的支付哈希值相匹配，然后提供资源。

就这么简单。这个证书是买来的，不是预先配置的。没有 OAuth 流程、不需要管理 API 密钥，也不需要盯着使用量面板。这也是 L402 天然适合 AI 代理工作流的原因：AI 代理可以在运行中发现并购买资源，不需要人类为它预先注册账户。

获得 token 之后，就可以把它缓存起来、用在同一服务的后续请求中，直到它过期或者被撤销。AI 代理是按端点付费的，不是按请求次数付费的。

## 有用且聪明的证书

L402 不挑 token 的格式，任何能够承诺一个支付哈希值的身份认证 token 都能配合工作。但 L402 协议的规范推荐了 “[macarron](https://docs.lightning.engineering/the-lightning-network/l402/macaroons)（马卡龙）”，它是一种基于哈希函数的消息认证不记名证书格式，最初是由谷歌（Google）为分布式系统的身份认证而设计的。

马卡龙对 AI 代理有用，因为它具有标准的 API 密钥和不记名 token 所不支持的两种属性：“降级（attenuation）” 和“ 委托（delegation）”。

降级的特性是，马卡龙的持有者可以为一个证书增加限制，而且无需联系该证书的发行人。举个例子， 一个父代理在获得马卡龙之后，可以给它追加限制（限制 token 用法的条件），比如花费的限额、服务约束、过期时间。产生出来的受限制的证书也能通过密码学验证，只是携带着更严格的许可，而且无需与（发行它的）服务端通信。

委托的特性是，受限制的证书可以交给一个次级代理。一个负责协调的代理可以创建出一个仅能支付的马卡龙、设置它带有 500 聪的花费限额，然后把它传递给一个负责获取市场数据的员工代理。这个员工带来可以在这些限制内购买资源，而不能超支。这个子代理是无法放松自己的许可的。证书在设计上强制执行了最低的权限。

可以说，这就是多代理系统所需要的许可层级系统。一个证书可以结合支付证据、有范围的权限以及经过委托的权威到一个 token 中 —— 所有内容都可以验证，而且无需查询数据库。

## L402 bLIP：开放的规范，新的升级

L402 的正式文件是 [bLIP-0026](https://github.com/lightning/blips/pull/26)，它是一个提交到 [闪电网络规范库](https://github.com/lightning/blips) 的 “ 比特币闪电网络优化提议（bLIP）”。bLIP 是闪电网络特性的社区审核设计文档，而 L402 bLIP 包含了完整的协议规范，从而每个人（每个代理）都能实现一个兼容的客户端或服务端。

对这个 bLIP 的最新的拟议更新，包含了多项重要变更，反映了来自主动开发这套协议的多个团队的反馈：

**版本字段**。通过在 `WWW-Authenticate` 挑战头中加入一个 `version`（版本号）参数，我们让协议能够独立地演化而不打破已有的客户端（当前，这个版本号是 `"0"`）。根据规范的前向兼容规则，不理解版本号参数的客户端可以忽略它。

**不挑 token 的设计**。现在，规范扩展到支持马卡龙以外的语言，使用 `token` 而非 `macaroon` 作为挑战头中的关键用名。唯一的硬性要求是，这种 token 要能承诺发票的支付哈希值，以允许无状态的客户端验证。马卡龙依然是推荐格式（因为它的降级和委托特性），但协议不再强制要求使用马卡龙。一种推荐的马卡龙结构已经放到了附录中。

**简明的规范**。整个文件已经大幅精简，删去了不必要的累赘表述，但保留了用于指导实现的所有协议细节。

拟议的这些变更将让 L402 更容易实现、在 token 格式上更加灵活，并且为前向兼容性作了更好的准备。这个 bLIP 还包含了后向兼容条款，比如，服务端会同等接受 token 和马卡龙的参数。

## 为什么说 L402 适合 AI 代理经济

2026 年有望成为 AI 代理支付之年。我们已经看到了多个瞄准这个领域的协议出现。目标都是一样的，让AI 代理能够自动化地发现、购买和消费服务，不需要人力的干预。L402 从一开始就有这个目标。相比其它的方案，L402 拥有结构化的优势，对 AI 代理从简单的调用工具成为真正自主的商业具有重要意义。

**支付的密码学证据，内置于证书**。当一个AI 代理给一个 L402 端点支付了闪电发票时，闪电网络会揭晓一个 32字节的原像。这个原像，结合那个 token，就组成了一个证明这笔支付已经发生的自我说明的（self-contained）证据。服务端验证用一次简单的哈希运算 `sha256(preimage) == payment_hash` 来验证它。不需要查询数据库，不需要 RPC 调用一个区块链节点，也不需要外部的验证服务。

L402 以外的方法通常会将支付签名与结算分割开来。客户端签名一个支付意向，第三方协调员广播这笔交易，然后服务端必须用链上状态来验证它，要么就得信任协调员来确认支付。这就带来了外部依赖和时延，而 L402 就完全没有这些东西。L402 的验证是一种本地计算。密码学的凭证本身就是证据，不需要询问中介，也没有人会无法确认支付。

对于一分钟可能要调用几百次 API 的 AI 代理来说，“用数学在本地验证” 和 “调用一个外部服务来检查支付状态”，不啻天壤之别。

**隐私是架构，不是特性开关**。L402 运行在闪电网络上，闪电网络使用洋葱路由来转发支付，每一个中间节点都只能看到他的上一跳和他的下一跳。支付不会在区块链上留下踪迹。L402 证书自身是一种不记名的 token，跟一个随机的标识符绑定，无关邮箱、账户，更无关真实世界的身份。

其它运行在公开的区块链上的协议，会永久记录每一笔交易：它的发送者地址、接收者地址、数额，还有时间戳，对每个人都可见。对于要向数十个服务频繁发起微支付的 AI 代理来说，这会暴露出可见的模式：它们访问的每一项资源、何时访问的、使用量多少。AI 代理活动的元数据可能是商业敏感的，所以默认暴露出这些元信息的协议是一种负债。

**不需要中介，没有宕机时间**。闪电网络是免许可的。它不是由单个主体来运营的。L402 服务端只需要使用自己的根公钥和收到的 token 就能验证证书，不需要依赖任何第三方的在线服务，也不需要它们配合。

许多其它的 AI 代理支付协议都通过一家公司的基础设施来排序交易、协助交易和发行 token，也就是说，一旦这家公司服务中断，你的 AI 代理也不用玩了。L402 的架构让这些功能分散在几千个独立的节点中。

**多代理系统的证书复杂性**。如前所述，L402 的基于马卡龙的证书，支持层级式的委托和权限递减，无需联系发行人，可以重复使用直至吊销。一个代理一旦获得了一个证书，就能重复使用它，而 token 自身就编码了服务的内容、权限和受到的约束。其它方法则将每一次请求都视作一笔单独的支付：确实，没有状态，也简单，但缺乏一个永久的证书层来为 AI 代理团队管理权限的层级。也就是说，使用 L402，多代理的系统可以自动管理预算、许可和服务访问权，无需人类为每一个子任务重新授权。

## 来开发吧

L402 协议已经准备好进入生产环境。从五年前的第一个版本开始，[Lightning Loop](https://docs.lightning.engineering/lightning-network-tools/loop) 就通过 [Aperture](https://docs.lightning.engineering/lightning-network-tools/aperture)（能够感知 L402 的反向代理）来使用  L402 。

如果你现在就像让你的 AI 代理通过 L402 来发送交易，[Lightning Agent Tools](https://github.com/lightninglabs/lightning-agent-tools) 提供了完整的技术栈： `lnd` 技能描述，棵用于运行一个闪电节点； `lnget` 技能描述，可以自动给受 L402 保护的 API 付费；`aperture` 技能，可以托管收费端点、并通过马卡龙烘培实现受限制证书的管理；还有一个商业准技能，可以协调端到端的 买家/卖家 工作量。阅读[这篇博客](https://lightning.engineering/posts/2026-02-11-ln-agent-tools/)可以了解详情（[中文译本](https://www.btcstudy.org/2026/02/27/the-agents-are-here-and-they-want-to-transact--powering-the-ai-economy-with-lightning/)），或者，你可以直接阅读 [L402 和 lnget 文档](https://docs.lightning.engineering/the-lightning-network/l402)。

[L402 bLIP 规范](https://github.com/Roasbeef/blips/blob/697ae354c205f1aacc450e72067c92a7f2467321/blip-0026.md)是开放审核和增补的。我们邀请整个社区来探索，在 [L402 库](https://github.com/lightninglabs/l402)中给出反馈、分享应用场景以及提出疑问。开源的客户端和服务端库在多种语言中已经存在：[JavaScript](https://github.com/Tierion/lsat-js)、[Go](https://github.com/lightninglabs/aperture)、[Rust](https://docs.lightning.engineering/the-lightning-network/l402/implementations-and-links)、[Python](https://docs.lightning.engineering/the-lightning-network/l402/implementations-and-links) 。这个 [Aperture 开发者文档](https://docs.lightning.engineering/lightning-network-tools/aperture)介绍了服务端的搭建流程。如果你已经在使用 AI 代理，这些技能描述可以跟任何能够执行 shell 命令的框架配合工作：[Claude Code](https://docs.anthropic.com/en/docs/agents-and-tools/claude-code/overview)、[Codex](https://openai.com/index/codex/)、[OpenClaw](https://openclaw.ai/)，以及你自己的工具 : ）。

来看看 [L402 的文档](https://docs.lightning.engineering/the-lightning-network/l402)，参加我们的 [Slack 社区](https://lightningcommunity.slack.com/join/shared_invite/zt-1nkh6t7xr-1jRfSDNFJVUVdeKGiRMelf)，在 [Twitter/X 上关注我们](https://twitter.com/lightning)，[提交一个 PR](https://github.com/lightninglabs/lightning-agent-tools)，还可以[订阅我们的周报](https://lightning.engineering/newsletter/)。机器可以支付的互联网不会自我生成。好吧，也许会。那么就让我们与 AI 代理互帮互助吧！

（完）