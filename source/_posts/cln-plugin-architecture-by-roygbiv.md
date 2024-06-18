---
title: 'CLN 的插件架构'
author: 'roygbiv'
date: '2024/06/18 11:12:11'
cover: ''
excerpt: '插件架构让许多特性可以共存在 CLN 中'
tags:
- 开发
---


> *作者：roygbiv*
> 
> *来源：<https://www.roygbiv.guide/cln-plugin-architecture/>*



C-Lightning(CLN) 是一套软件，让你的电脑可以跟比特币的闪电网络通信 …… 它是一种闪电网络节点实现。CLN 的开发者制作了一种办法，让任何人都可以给自己的节点添加定制化的功能。提供定制化功能的软件就叫做 “插件”。

> 我在这篇文章中要告诉你的东西，全部都是从 Tony Aldon 的鸿篇巨制 [lnroom.live](https://lnroom.live/) 中学来的。

## 运行 CLN

首先，你要安装 CLN 软件。我建议从源代码开始编译。但所有的安装方法和指令都可以在这里[找到](https://github.com/ElementsProject/lightning#installation)。

> [Farscapian](https://www.roygbiv.guide/author/farscapian/) 已经用 ROYGBIV 软件让这一切都非常简单：这种 Docker 软件可以让你一键安装 Bitcoin Core 和 CLN。看看这份[说明书](https://github.com/farscapian/roygbiv-stack#readme)吧。

安装好了之后，你可以使用 `lightningd` 命令来启动节点。

> 译者注：一份中文的安装指南可见[这篇文章](https://www.btcstudy.org/2023/09/08/run-lightning-node-with-core-lightning-implement/)，其中的技巧适用于所有基于 Linux 的系统。

## RPC 方法

CLN 带有一个很棒的命令行工具，通过运行 `lighting-cli` 命令前缀就可以调用。使用它，你可以访问 CLN 暴露出的所有 JSON RPC 方法。

> JSON PRC 是一套协议，用于编码消息及协助客户端和服务端应用之间的通信。

事情从这里开始就变得有意思了。你可以在 CLN 节点上可以使用的许多 RPC 方法都来自插件。你可以在[这里](https://github.com/ElementsProject/lightning/tree/master/plugins)看到一份插件清单。还有一些由[社区开发的插件](https://github.com/lightningd/plugins)，你可以用来给自己的节点添加功能。

举个例子，`keysend` 是一种方法，可以用来发送不定数量的资金到另一个节点，只需知晓那个节点的公钥就行。Keysend 就是一个插件，可以在这里[看到](https://github.com/ElementsProject/lightning/blob/master/plugins/keysend.c)。

> 要了解如何使用定制化的插件，请看我的文章《[starting the prism plugin on your node](https://www.roygbiv.guide/cln-plugin-architecture/www.roygbiv.guide/starting-prism-plugin-on-your-node/)》。

## 插件如何工作

“插件可以用任何语言来编写，然后通过插件的 `stdin` 和 `stdout` 来跟 `lightningd` 通信。” —— [CLN 说明书](https://docs.corelightning.org/docs/a-day-in-the-life-of-a-plugin)

### Manifest

在启动一个插件之后，它就会通过 `getmanifest` 请求在 `lightingd` 中注册。这个请求会被发送给你的插件的标准输入端口（stdin），并预计会从该插件的标准输出端口（stdout）中收到一个回应。

`getmanifest` 请求看起来是这样的：

```json
{
  "jsonrpc": "2.0",
  "id": 86,
  "method": "getmanifest",
  "params": {
    "allow-deprecated-apis": false
  }
}
```

而来自程序的回应是这样的：

```json
{
    "jsonrpc": "2.0",
    "id": req_id,
    "result": {
        "dynamic": True,
        "options": [{
            "name": "foo_opt",
            "type": "string",
            "default": "bar",
            "description": "description"
        }],
        "rpcmethods": [{
            "name": "myplugin",
            "usage": "",
            "description": "description"
        }]
    }
}
```

### 初始化

在 `getmanifset` 之后，`lightningd` 会发送初始化请求。这个请求提供了关于本节点的重要信息，例如用来访问 RPC 方法的 `lightnign-dir`。

对 `init` 请求的预期回应是这样的：

```json
{
    "jsonrpc": "2.0",
    "id": req_id,
    "result": {}
}
```

> 要了解开发插件的细节，请看 Tony Aldon 的视频及文章《[Understand CLN Plugin mechanism with a Python example](https://lnroom.live/2023-03-28-live-0001-understand-cln-plugin-mechanism-with-a-python-example/)》。

### 输出及输出的通信

插件在 `lightningd` 中注册完成后，输入-输出 的循环就开始了。无论什么时候，只要调用插件中定义的方法，`lightingd` 就会给插件的 stdin 发送请求，然后从插件的 stdout 获得回应。

## 结论

插件是 CLN 后台程序中的一个子进程。CLN 中的许多开箱即用的功能都被制作成了插件，但任何用户都可以自由增加插件。

这个插件架构让许多特性可以共存在 CLN 中。这也是为什么我们决定将 BOLT12 prisms（棱镜支付）实现为一个 CLN 插件。

（完）

