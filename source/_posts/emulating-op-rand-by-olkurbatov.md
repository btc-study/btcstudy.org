---
title: '模拟 OP_RAND'
author: 'olkurbatov'
date: '2025/03/03 17:58:35'
cover: ''
excerpt: '零知识证据的一种应用'
tags:
- 密码学
mathjax: true
---


> *作者：olkurbatov*
> 
> *来源：<https://delvingbitcoin.org/t/emulating-op-rand/1409>*



我们提出了一种方法，可通过交易对手方之间的一种免信任的交互式游戏，在比特币上模拟 OP_RAND 操作码。游戏的结果是概率性的，并且不允许任何一方欺诈，也不允许在任何一个步骤中影响自己的胜率。协议可以让外部参与者分辨不出，也不需要比特币协议和脚本的升级。我们将用一个简单的 **Thimbles 游戏** 来演示这套协议是怎么工作的，并提供关于可以使用上述方法的应用的初步思考。

## 引言

比特币脚本自身并不允许置入随机性，因此也不允许基于随机性来构造支付流。所以，在下列假设下，“*Alice 和 Bob 各出 5 BTC，如果硬币是反面， Bob 就可以拿走所有钱* ” 这样的流程是无法实现的：

1. 交易无法在确认的时刻从某处派生（或者说取得）随机性
2. 比特币脚本不能检查区块，也不能读取过去和未来的交易
3. 双方都可以在每一个操作码处理完成后得到相同的堆栈状态
4. 无法控制 ECDSA 和 Schnorr 签名的确定性
5. 比特币不支持 OP_RAND 操作码 

上述所有限制，导致我们无法找到允许抓取随机性并用来操作比特币的免信任方法。我们提出了一种通过两方交互式协议来实现它的绑法，并展示了这些特性可以用在以比特币为赌注的 thimbles 游戏中。

## 预备知识

$\mathbb{G}$ 是一个阶数为素数 $p$ 的循环群，$G \in \mathbb{G} $ 是该群的生成元。

$a \in \mathbb{F}_p$ 是一个标量值，而 $A \in \mathbb{G} $ 是一个属于该群的元素。

$\mathsf{hash}_p(m) \rightarrow h\in \mathbb{F}_p$ 是密码学哈希函数，取任意的消息 $m$ 为输入，返回域元素 $h$ 。

$\mathsf{hash}_{160}(P) \rightarrow \mathsf{addr}\in \mathcal{A}$ 是一个函数，对公钥作连续的 SHA-256 和 Ripemd160 运算，输出一个有效的比特币地址。

我们为如下关系定义证据 $\pi$：$\mathcal{R} = \{(w;x) \in \mathcal{W} \times \mathcal{X}: \phi_1(w,x), \phi_2(w,x) , \dots, \phi_m(w,x)\}$，其中 $w$ 是一个见证数据，而 $x$ 是一个公开数据，而 $\phi_1(w,x), \phi_2(w,x) , \dots, \phi_m(w,x)$ 是一组必须同时证明的关系。

我们定义具有 $n$ 个输入和 $m$ 个输出的一笔比特币交易为 $\mathsf{TX}\{(\mathsf{id, i, proof})^{(n)};(\mathsf{a BTC, cond})^{(m)}\}$，其中 $\mathsf{id}$ 是前序交易的哈希值，$i$ 是输出的索引号，$\mathsf{proof}$ 是花费交易所需的一组数据；$a$ 是输出中的资金数量，$\mathsf{cond}$ 是脚本公钥条件。例如，P2PKH 输入需要 $\mathsf{proof} \leftarrow \langle \mathsf{PK}, \sigma\rangle$ 和 $\mathsf{cond}\leftarrow \langle$ OP_DUP, OP_HASH160, $\mathsf{addr}$, OP_EQUALVERIFY, OP_CHECKSIG $\rangle$ 。在使用 P2PKH 时，我们将简化上述条件记号为简单的 $\mathsf{addr}$ 。

## 椭圆曲线点限制条款

首先，我们来看看如何在两个对手方之间实现具备下列条件的交易：“仅在交易的第一个输出被花费之后，才能花费交易的第二个输出”。以往，人们认为这可以用一个哈希所合约来做到，然而，（1）这是可识别的；（2）它无法帮助我们实现最终的游戏。

**算法 1**：创建在另一个输出被花费之后才能花费的条件式输出。

**条件**：Alice 和 Bob 各自存入 1 BTC 。Bob 只有在 Alice 花掉自己的 1 BTC 之后，才能花费自己的 1 BTC。Bob 的公钥 $P_b$ 是可以提前知道的。

**流程**：

1. Alice 生成：

$ sk_a \leftarrow \mathbb{F}_b $

$ P_a = sk_a G $

$ addr_a = \mathsf{hash}_{160}(P_a) $

$ C = \mathsf{hash}_{p}(P_a).G $


并为以下关系生成一个证据 $\pi_c$：

$ \mathcal{R}_c = \{P_a;\mathsf{addr}_a,C,G:\mathsf{hash}_{160}(P_a) \rightarrow \mathsf{addr}_a \and \mathsf{hash}_{p}(P_a).G \rightarrow C\} $

2. Bob 收到证据 $\pi_c$ 之后，取出 $C$ 并计算：

$ \mathsf{addr}_b = \mathsf{hash}_{160}(P_b + C) $

3. Bob 创建一笔交易并发送给 Alice：

$$
\mathsf{TX}_1\{(\mathsf{prev}_A, i_A, -), (\mathsf{prev}_B, i_B, \sigma_B(\mathsf{TX}_1));(1BTC, \mathsf{addr}_a),(1BTC, \mathsf{addr}_b)\}
$$

4. Alice 也签名这笔交易，并广播到网络中：

$$
\mathsf{TX}_1\{(\mathsf{prev}_A, i_A, \sigma_A(\mathsf{TX}_1)), (\mathsf{prev}_B, i_B, \sigma_B(\mathsf{TX}_1));(1BTC, \mathsf{addr}_a),(1BTC, \mathsf{addr}_b)\}
$$

如果 Alice 想要花费自己的输出，她就需要创建这样一笔交易，并公开一个公钥 $P_a$ 及其签名：

$ \mathsf{TX}_2\{(\mathsf{TX}_1,1, \langle P_a, \sigma_{P_a}(\mathsf{TX}_2) \rangle);(1 BTC, \mathsf{addr}_{a'})\} $

在该交易公开的时候，Bob 可以抽取出 $P_a$ 并复原 $\mathsf{hash}_p(P_a)$ 的值。然后，第二个输出的私钥就可以计算出来：$sk = \mathsf{hash}_p(P_a) + sk_b$（只有 Bob 知道 $sk_b$），而且 Bob 可以构造出关联着公钥 $P_b + C$ 及其地址的签名。

$ \mathsf{TX}_3\{(\mathsf{TX}_1,2, \langle P_b + C, \sigma_{P_b + C}(\mathsf{TX}_3) \rangle);(1 BTC, \mathsf{addr}_{b'})\} $

（译者注：考察这里的上下文，Alice 给 Bob 的证据是一种 “零知识证据”，Bob 只知道 Alice 拥有这样一个值，但并不能从证据中知道这个值是什么。）

这样，我们就构造出了模拟随机性和我们的 thimbles 游戏的第一部分。我们要指出的是，在上述例子中，如果 Alice 不花费自己的输出、不公开 $P_a$，Bob 就无法复原出第二个输出的私钥，也就无法花费它。如果我们需要提供在一段时间后花费这些输出的能力（比如说，如果游戏一直没开始），我们可以像支付通道构造那样 —— 将资金锁定到多签名输出中，然后创建一笔可以在一段时间后花费它的交易。

## OP_RAND 模拟协议

我们提出了一种在交易的两方之间通过交互式协议模拟 OP_RAND 操作码的方法。引入挑战者 $\mathcal{C}$ 和接受者 $\mathcal{A}$ 的角色，然后我们可以这样定义模拟 OP_RAND 的协议：

1. $\mathcal{C}$ 和 $\mathcal{A}$ 各有自己的密钥对 $\langle sk_{\mathcal{C}}, P_{\mathcal{C}}\rangle$ 和 $\langle sk_{\mathcal{A}}, P_{\mathcal{A}}\rangle$ 。只有 $P_{\mathcal{C}}$ 的值是公开的。
2. $\mathcal{C}$ 生成一组随机数值 $a_1, a_2,\dots, a_n$，然后为它们创建一个一级承诺：$A_i = a_iG, i\in[1, n]$
3. $\mathcal{C}$ 选出其中一个承诺 $A_i$，将它跟自己的公钥组装起来：$R_{\mathcal{C}} = P_{\mathcal{C}}+A_x$，然后仅发布该值的哈希值：$\mathsf{hash}(R_C)$
4. $\mathcal{C}$ 创建二级承诺 $h_i = \mathsf{hash}(A_i), i \in[1,n]$ 以及三级承诺 $H_i = h_iG, i \in[1,n]$
5. $\mathcal{C}$ 创建一个证据 $\pi_a$ ，证明所有三级承诺都是正确推导的，然后其中一个一级承诺会跟 $P_{\mathcal{C}}$ 相结合
6. $\mathcal{C}$ 给 $\mathcal{A}$ 发送这组三级承诺，并提供证据 $\pi_a$ 
7. $\mathcal{A}$ 验证证据 $\pi_a$，然后选择其中一个三级承诺 $H_y$ 跟自己的 $P_A$ 组装在一起。然后，$\mathcal{A}$ 发送该值 $R_{\mathcal{A}}=P_{\mathcal{A}}+H_y$ 和哈希值 $\mathsf{hash}(R_{\mathcal{A}})$
8. $\mathcal{A}$ 创建一个证据 $\pi_r$，证明其中一个三级证据会跟 $P_{\mathcal{A}}$ 相结合，然后发送给 $\mathcal{C}$。此外，该证据也表明了对 $P_{\mathcal{A}}$ 的离散对数的知识。
9. $\mathcal{C}$ 验证证据 $\pi_r$，如果该证据有效，就发布 $R_{\mathcal{C}}$
10. $\mathcal{A}$ 计算 $A_x = R_{\mathcal{C}}-P_{\mathcal{C}}$
11. 如果 $\mathsf{hash}(A_x)\cdot G = H_y$，$\mathcal{A}$ 就胜出。否则 Alice 输。

## Thimbles 游戏作为一个例子

（略）