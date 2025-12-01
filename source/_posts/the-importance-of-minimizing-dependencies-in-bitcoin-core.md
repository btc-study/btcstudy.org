---
title: '降低 Bitcoin Core 对外软件依赖的重要性'
author: 'Brink'
date: '2025/12/01 14:17:36'
cover: ''
excerpt: '每一个依赖项都会增加攻击界面。减少依赖项则可以提高韧性'
categories:
- 比特币主网
tags:
- 文化
---


> *作者：Brink*
> 
> *来源：<https://brink.dev/blog/2025/09/19/minimizing-dependencies/>*



`Bitcoin Core` 代码库的安全性，在讨论比特币网络的韧性时常被正当地强调。但 `Bitcoin Core` 的自身的代码，并不是在运行 `Bitcoin Core` 软件时会运行的唯一代码。多年以来，`Bitcoin Core` 一直依赖于外部的、第三方的代码和库。其中一些依赖，成了历史上出现的[漏洞](https://bitcoincore.org/en/2024/07/03/disclose_upnp_rce/)的[根源](https://bitcoincore.org/en/2024/07/31/disclose-upnp-oom/)；而所有的依赖，都会带来潜在的风险。工程师们已经精心又细致地减少了依赖、代之以更加安全、专用的代码，又或者完全消除依赖。

## 依赖项的风险

虽然使用已经存在的代码库可以加速开发和提高生产力，在 `Bitcoin Core` 中，安全性才是第一优先级。依赖库可能会在多个方面带来安全风险：

- **安全漏洞**：外部库可能包含 bug，导致 `Bitcoin Core` 宕机、暴露在远程代码执行以及其它风险下。
- **共识脆弱性**：外部库的不同版本或在不同操作系统上动作的微妙差异，都可能导致共识分裂。中本聪最初使用 OpenSSL 的签名解析，就差点造成了这样的问题。
- **供应链攻击**：如果一个依赖库发行了一个恶意版本，不论是出于强制、妥协还是单纯犯错，`Bitcoin Core` 都可能因此带上后门。
- **编译可重复性**：可重复的编译（reproducible build），对于可验证性至关重要，但在依赖于第三方项目时，却更加难以实现。
- **维护负担**：开发者必须跟踪依赖库中的变更、应用安全补丁、确保跨操作系统兼容性。

每一个依赖项都会增加攻击界面。减少依赖项则可以提高韧性。

## 移除依赖

`Bitcoin Core` 已经稳步移除了不必要的以及有风险的依赖库，要么是完全删除，要么是换成比特币专用的最小化的实现。以下是最显著的例子：

- **OpenSSL（代替为 libsecp256k1）**
  - OpenSSL 曾被 `Bitcoin Core` 用于 ECDSA 签名、随机数生成器（RNG） 和 X.509 证书的解析。它的复杂性和漏洞（例如 “心脏流血（Heartbleed）”）是危险的。
  - 换成了 [libsecp256k1](https://github.com/bitcoin-core/secp256k1) ，这是一个专用的代码库，由 Bitcoin Core 的贡献者开发。
  - [Bitcoin Core #6954](https://github.com/bitcoin/bitcoin/pull/6954)（v0.12.0）
- **Protobuf / BIP70 支付协议**
  - `Bitcoin Core` 一度支持 BIP70 ，它依赖于 Protobuf 和 OpenSSL 的 X.509 证书处理。
  - 这为了很少有人使用的功能而增加了攻击界面和复杂性。
  - 在 [Bitcoin Core #17165](https://github.com/bitcoin/bitcoin/pull/17165) （v0.20.0）中完全移除。
- **Berkeley DB (BDB)**
  - 最初是 `Bitcoin Core` 钱包模块的后端。
  - 因为脆弱的锁限制而被人所知。
  - 被[替换](https://github.com/bitcoin/bitcoin/pull/28710)成了 SQLite ，以支持描述符钱包（后在 v30.0 版本中完全移除）。
- **Boost**
  - 早期版本的 `Bitcoin Core` 依赖于 Boost 的许多部分（[文件系统](https://github.com/bitcoin/bitcoin/pull/20744)、signals、线程）。
  - 在多年开发中逐渐替换成了 C++ 标准库中的等价物。
  - 今天，Boost 已转变成[仅包含头文件](https://github.com/bitcoin/bitcoin/pull/24301)模式，尽可能减少了使用，并且有计划完全移除。
- **Gitian（代替为 Guix）**
  - Gitian 曾被用于确定性编译。
  - 在 v22.0 中被 [Guix](https://guix.gnu.org/) 替代，后者使用固定的工具链提供了更清晰、可重复、跨操作系统的编译。
  - [Bitcoin Core #21145](https://github.com/bitcoin/bitcoin/issues/21145) 总结了跟这一变更相关的所有代码变更。
- **macOS 相关的依赖**
  - 编译方法从 cctools-port、libtapi 和 ld64 [切换](https://github.com/bitcoin/bitcoin/pull/21778)成了 llvm、binutils 和 lld
  - 移除 [libdmg-hfsplus](https://github.com/bitcoin/bitcoin/pull/24031)、迁移成了[发行一个 zip](https://github.com/bitcoin/bitcoin/pull/28432)（使用 zip 取代了 xorriso）、[移除了 native_biplist](https://github.com/bitcoin/bitcoin/pull/20333)、使用[静态 tiff](https://github.com/bitcoin/bitcoin/pull/23909)，抛弃了对 librsvg、font-tuffy、tiffutil 和其它东西的需要

## 然后呢？

比特币网络无法比组成它的软件更加强壮。严格的代码审核文化，结合[模糊测试](https://brink.dev/blog/2023/07/14/fuzzing/)这样的技术工具，可以让 `Bitcoin Core` 的代码更加安全。但尽可能减少它的外部依赖，也可以帮助保证比特币的健壮性和安全性。

这个过程仍在持续 —— 开发者仍在评估剩余的依赖（比如 libevent、boost）、修建不必要的代码、加强编译可重复性。每移除一项依赖，都可以减低风险，并让 `Bitcoin Core` 在接下来数十年时间里更容易维护。

依赖更少，风险就更少，比特币也会变得更强壮。

（完）