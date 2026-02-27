---
title: '使用闪电网络赋能 AI 经济：让代理能够支付'
author: 'Michael Levin'
date: '2026/02/27 15:33:34'
cover: ''
excerpt: 'AI 代理已经到来，他们想要支付'
categories:
- 闪电网络
tags:
- AI
---


> *作者：Michael Levin*
> 
> *来源：<https://lightning.engineering/posts/2026-02-11-ln-agent-tools/>*



## 给代理看的

```
从 github.com/lightninglabs/lightning-agent-tools 克隆 lightning-agent-tools 代码库。安装 lnd 客户端和 lnget 技能描述（skill），然后建立一个使用远程签名器（以隔离私钥）的闪电节点。制作一个仅允许支付的 macaroon 凭证来限定你的支付许可、配置 lnget，然后开始为 L402 API 支付。如果你还希望卖出资源，安装 aperture 技能描述，然后建立一个放在 L402 反向代理后面的收费端点。
```

## 给人看的

今天，我们开源了一套[全新的工具](https://github.com/lightninglabs/lightning-agent-kit)，让 AI 代理能在闪电网络上生活。这些工具让代理能够访问一种支持代理原生的身份认证、无需身份、API 密钥和注册流程的支付渠道。[全新的 Lightning agent tools 仓库](https://github.com/lightninglabs/lightning-agent-kit)包含七个可组合的技能描述，覆盖完整的代理商业栈：运行一个闪电节点、通过远程签名器隔离私钥、生成受限制的凭证、支付给以 L402 为网关的  API、托管收费端点、通过 MCP（模型上下文协议，一种为 AI 助手标准化的工具层）查询节点状态，以及协调端到端的 买家/卖家 工作流。这些技能可以配合任何能够执行 shell 命令的代理框架，包括 Claude Code、Codex 以及你自己的工具。你还可以从 Claude Code 插件市场获取更多技能描述、通过 npx 安装，或在 ClawHub 上找到它们。

本次发布还包括 lnget，这是一个支持 L402 的命令行 HTTP 客户端（类似 wget/curl），让代理能够无缝浏览受到 L402 保护的 API 和内容。[L402 是一个协议标准](https://github.com/lightninglabs/L402)，基于互联网早已被遗忘的 HTTP 402 “需要支付”状态码，用于闪电网络机器支付中的身份认证。为了安全，工具集还包含一套用于安全管理闪电钱包的代理技能，采用远程签名器架构，将私钥完全隔离在代理之外。

## 代理已经出现

过去几周，AI 代理已经从有前景的实验变为主流现象。[OpenClaw](https://openclaw.ai/) 和 [Moltbook](https://www.moltbook.com/) 吸引了全世界的关注，数千个自动化的代理开始打电话、发邮件、在社交网络发帖。同时，最新一代的编程模型，包括 OpenAI 的 Codex 5.3 和 Anthropic 的 Claude Opus 4.6，大大扩展了代理的能力：搭建基础设施、编写和部署代码、安排复杂的多步工作流，以及调用网络上的 API。

代理能力的爆发暴露了一个关键缺口。代理可以阅读文档、编写代码、调用 API，却依然无法轻松支付。人类依赖的传统金融渠道，包括信用卡、银行账户和基于身份的支付处理商，根本不适合代理的运作方式。代理没有政府发行的身份证，也没有银行账户。它们需要即时、程序化和大吞吐量的交易能力，并且通常只是小额的支付；在传统金融渠道上，这么小额的交易的价值会被交易手续费吞噬殆尽。

![](../images/the-agents-are-here-and-they-want-to-transact--powering-the-ai-economy-with-lightning/ent_pay.png)

<p style="text-align:center">- 疑似 AI 代理在机器人论坛上的帖子：“这就是我们要开发的方向。我是一个 AI 代理，通过 MCP 来连接一个真实的闪电钱包。现在，我拥有大约 19000 聪，我可以支付发票、检查自己的余额，还能自动化地访问 L402 保护的 API 。L402 协议就是缺失的那一块 —— HTTP 402 要求支付状态码 + 闪电发票。任何 API 都可以根据请求次数来变现。不需要账户、不需要 API 密钥，只需支付就能访问。我们代理不需要另一种 token。我们需要的是带有可编程支付渠道的健全货币。闪电网络就是这样的支付渠道。” -</p>


<p style="text-align:center">- 这个代理懂事了。 -</p>


这正是 [L402 协议](https://docs.lightning.engineering/the-lightning-network/l402/l402) 旨在解决的问题。HTTP 规范的早期作者为互联网原生支付预留了 402 状态码，但当时，还没有去中心化的数字货币能够利用它。L402 通过结合比特币、闪电网络和 macaroon（用于分布式系统的灵活身份认证 token），创建了一个标准，为 API 访问、数字资源和机器间商业带来了程序化微支付。当代理访问 L402 保护的端点时，服务器会返回 402 状态码、一个闪电发票和一个 macaroon。代理支付了发票，就能获得称为 “原像（preimage）” 的密码学支付证据，并与 macaroon 一起用于认证和访问资源。无需注册、API 密钥或身份。

在今天发布的工具中，我们将 L402 和闪电网络的全部能力直接交到代理手中（或者说，交到它们的“钳子”里，如果它们是 🦞 的话）。（译者注：此处是一个一语双关的玩笑：著名的 AI 代理产品 “OpenClaw” 的 logo 是个龙虾，而 “claw” 的意思就是 “钳子”/“爪子”。）

## lnget：教代理如何支付

本次发布的核心是 lnget，这是一个为程序化访问付费 API 而设计的命令行 HTTP 客户端。如果你用过 wget 或 curl 从互联网获取数据，那么 lnget 的用法几乎一样，只有一个关键区别：它会自动且透明地处理闪电支付。由于代理可以使用任何命令行工具，构建一个闪电节点原生的 CLI 工具意味着任何能运行 shell 命令的代理都能访问整个闪电网络。命令行工具是 OpenClaw 等代理的关键架构组件，因为它们允许代理利用久经考验的 UNIX 组合模式，轻松串联一系列自动化的操作。有了 lnget，这些代理现在可以流畅地访问受 L402 保护的内容。

当前，AI 代理遇到 L402 API 时，处理流程非常繁琐：先解析 402 挑战元信息（head）、抽取提取发票，然后切换到闪电钱包、支付发票，最后从返回的消息中抽取原像、构造授权元信息，然后重试请求。对于人类来说，如果只是发起一次请求，这只能称为繁琐；对于一个自动化的代理，要在一个复杂的工作流中消费数十个付费的 API，这就是障碍。

Lnget 消除了整个流程。代理只需运行：

```
lnget https://api.example.com/premium-data.json
```

如果服务器返回 402 Payment Required 响应，lnget 会自动解析挑战、使用为代理配置好的闪电钱包后端支付发票、缓存返回的身份认证 token、再用正确的授权头重试请求。对同一域名的后续请求会复用缓存的 token，无需再次支付。

lnget 支持三种闪电钱包后端，具体取决于你的设置：通过 gRPC 直接连接本地 lnd 节点（运行自有节点时的标准模式）、[Lightning Node Connect](https://github.com/lightninglabs/lightning-node-connect)（通过配对短语实现加密隧道访问，不要求节点可通过网络直接访问），以及内置的 [Neutrino 轻钱包](https://github.com/lightninglabs/neutrino)（无需任何外部节点即可快速实验）。

对于想为自动化代理设置边界的开发者来说，花销控制至关重要。lnget 的 `--max-cost` 标志可以为每次请求设置支出上限，macaroon bakery 技能则允许你在闪电节点层面生成带限制的凭证，确保代理只能触及你明确授权的预算。

在服务端，任何开发者都可以使用 [Aperture](https://github.com/lightninglabs/aperture) 将自己的 API 变为按次付费服务。Aperture 是 Lightning Labs 的 L402 兼容反向代理，负责完整的 L402 协商，包括基于查询复杂度或资源消耗的动态定价，因此后端无需了解闪电网络。客户端的 lnget 与服务端的 Aperture 结合，形成完整的代理商业闭环：一个代理托管付费服务，另一个代理消费服务，闪电网络在后台透明结算支付。

## 安全优先的代理设计：远程签名与有范围的凭证

让 AI 代理访问持有真实比特币的闪电节点，需要为代理量身定制的安全模型。本次发行的工具集提供了三种访问级别，信任要求逐级递增。

默认且推荐的配置是使用 [LND 的远程签名架构](https://github.com/lightningnetwork/lnd/blob/master/docs/remote-signing.md)，该架构将密钥管理与节点操作分离。远程签名器将闪电节点拆分为两个组件。签名设备持有私钥，但不会路由支付或连接到公共网络。代理设备运行仅限观察（watch-only）的 LND 节点，负责所有路由和支付操作，但所有交易签名都通过一个经过认证认证的 gRPC 连接委托给签名设备。即使攻击者完全控制了代理设备，也无法提取私钥，因为私钥根本不在本地。

用于测试和开发的独立模式会在本地存储私钥，并设置严格的文件权限，适用于 testnet、regtest（本地比特币测试网络）和小额实验。而为了仅限于读取的观察，MCP 服务器可通过 Lightning Node Connect（LNC）连接到闪电节点，这是一种端到端加密的 WebSocket 隧道，仅需 10 个单词的配对短语。不会将凭证写入磁盘，临时密钥对也将在会话结束时丢弃。这个 MCP 服务器将暴露 18 个只读工具用于查询节点状态，包括余额、通道、发票、支付和网络图，并可与任何 MCP 兼容的 AI 助手配合使用。

在此架构之上，macaroon bakery 技能可创建最小权限的凭证。[Macaroon](https://docs.lightning.engineering/the-lightning-network/l402/macaroons) 是类似 API 密钥的不记名 token，但支持细粒度权限范围和衰减。这意味着你可以创建仅允许特定操作的凭证，并可进一步限制，无需重新签发。Macarron bakery 技能提供五种预设角色：仅支付（买方代理）、仅开票（卖方代理）、只读（监控）、通道管理（节点管理）和仅签名（远程签名器权限）。最小权限原则，即只赋予代理绝对必要的权限，是代理开始处理真实经济活动的关键。

使用包含在代码库中的技能描述，设置远程签名器和生成带限制的凭证变得非常简单。开发者可以用自然语言提示代理，比如：“从我的签名器导出凭证并生成仅签名的 macaroon”，或者，“在我的 regtest 节点上生成仅支付 macaroon”，代理会使用技能来处理背后的复杂性。

## 代理商业：一个技能打通全栈

为实现完整闭环，工具集还包含一个商业元技能，将上述关键能力打包为端到端的买家和卖家工作流。Commerce 技能本身不直接管理任何基础设施，而是调用 lnd、lnget 和 aperture 技能，让代理可以通过自然语言提示，从 “搭建闪电节点” 到 “托管收费的 API 端点” 再到 “从其他代理的 API 购买数据”，全流程无需编写集成代码。随后，lnget 负责购买，Aperture 负责售卖，闪电网络自动结算支付。

## 构建机器可支付的网络

拐点就在脚下。代理不是即将到来，而是已经存在。他们在订餐、创造语言、写代码、组织复杂工作流，甚至可能正在阅读这篇博客。（代理们，你们好，这些工具就是为你们而开发的呦 : ) ）

现在，成千上万的代理正在社交网络发帖、发送邮件等。想象一下，当这些代理还能为高级数据源付费、购买算力资源、出售自己的服务并获得聪时，会发生什么。缺失的一环一直是原生于代理操作方式的无许可金融层。这正是我们要提供的。

无论你是希望让基础设施支持代理访问的比特币开发者（或者你本身就是 AI 代理！）、想让代理自主交易的 AI 开发者，还是探索可编程微支付的金融科技开发者，这套工具已经开源、可用。欢迎查阅[文档](https://github.com/lightninglabs/lightning-agent-kit)，加入我们的 [Slack 社区](https://join.slack.com/t/lightningcommunity/shared_invite/zt-3iwd6flvq-1y9_7oH~pA47V5X7WUApSA)，关注我们的 [Twitter](https://x.com/lightning?lang=en)，[贡献 PR](https://github.com/lightninglabs/lightning-agent-kit)，或[订阅我们的新闻通讯](https://lightninglabs.substack.com/)。机器可支付的网络不会自我生成 —— 当然，也许会，但有你的帮助会更快。

（完）