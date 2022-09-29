---
title: '比特币交易的生命周期'
author: 'glozow'
date: '2022/09/27 14:24:57'
cover: ''
excerpt: '它游过交易池、穿过 P2P 网络，最后在成千上万的比特币节点的区块数据库中找到了一个家'
categories:
- 比特币主网
tags:
- 交易池
- 开发
- 比特币
---


> *作者：glozow*
> 
> *来源：<https://github.com/glozow/bitcoin-notes/blob/master/transaction-lifecycle.md>*



## 交易的创建

### 什么是 “比特币交易”？

许多人会认为比特币的交易（Bitcoin transactions）就像金融交易，代表着支付方和接收方的一次交换。但在这里，我们将把比特币网络理解成一台分布式的状态机（distributed state machine），其状态（主要是）：

- 当前可以使用的资金（也就是未花费的交易输出，缩写为 “UTXO”）的集合，每一项资金都注明了其数额，并带有其花费条件的承诺
- 凝聚了最多工作量的链的顶端

而交易就是一次原子化的状态变更（atomic state change），重新分发现有的资金，或者说铸造出新的资金。

比特币网络的节点会周期性地处理以区块形式成批次的、有顺序的状态变更；节点会根据一套预定义的公式协议来决定是否要接受一个区块。因此，比特币区块链就是一个抗篡改的[交易日志](https://en.wikipedia.org/wiki/Transaction_log)，或者说激励，可以由比特币网络的节点下载、验证并用于重建出当前的状态。在一笔交易被纳入某个区块（即得到区块 “确认”）、区块被整个网络接受之前，这笔交易就只是对状态变更的一次提议。

一笔比特币[交易](https://github.com/bitcoin/bitcoin/blob/master/src/primitives/transaction.h#L259)由下列元素组成：

- [输出](https://github.com/bitcoin/bitcoin/blob/master/src/primitives/transaction.h#L128)，表明这笔交易将创建 什么样的资金；
- [输入](https://github.com/bitcoin/bitcoin/blob/master/src/primitives/transaction.h#L65)，每一个都指向由以前的交易所创建的一个 UTXO；
- 用来满足被花费的 UTXO 的花费条件的数据，例如签名
- 元数据

### 通过 Bitcoin Core 钱包模块创建交易

创建比特币交易的过程并不需要在节点内完成。举个例子，用户可以在其它的钱包软件 以及/或者 在完全离线的状态下创建交易，然后将交易通过 [` sendrawtransaction `](https://developer.bitcoin.org/reference/rpc/sendrawtransaction.html) RPC 发送到 Bitcoin Core 节点。

Bitcoin Core 的钱包模块允许用户创建不同程度的定制化交易。步骤大体如下：

1. 支付的接收者提供一个接收支付的[发票或者说地址](https://en.bitcoin.it/wiki/Invoice_address)；这个地址承诺了花费条件。这可以帮助钱包创建[输出](https://github.com/bitcoin/bitcoin/blob/1a369f006fd0bec373b95001ed84b480e852f191/src/outputtype.h#L23-L26)，输出就代表了支付。
2. 钱包根据用户的输入、查询节点所获得的预先配置的默认选项、用户偏好、历史区块和当前交易池的情形，估计手续费并确定输出的类型。
3. 通过从钱包可用的 [UTXO 集合](https://github.com/bitcoin/bitcoin/blob/1a369f006fd0bec373b95001ed84b480e852f191/src/wallet/spend.cpp#L67)中选出合适的输入，为交易 [“充值”](https://github.com/bitcoin/bitcoin/blob/1a369f006fd0bec373b95001ed84b480e852f191/src/wallet/spend.cpp#L373)。交易[可能会也可能不会](https://github.com/bitcoin/bitcoin/blob/1a369f006fd0bec373b95001ed84b480e852f191/src/wallet/spend.cpp#L767-L778)包含找零输出。
4. 为么一个输出添加签名和其它数据的组合，以满足它们所对应的输出的花费条件。这个过程包含许多步骤，取决于签名验证的方式以及生成签名的私钥存储的方式。

### 子交易

对于一笔交易来说，子交易就是花费其输出的交易。子交易可以在一笔交易获得 txid（交易索引号）之后立即创建 —— 甚至不必等交易获得签名；闪电网络正是利用这种特性来开启状态通道，双方都不用担心资金锁入多签名合约后因为对方不配合而无法退出。

一笔交易在确认之前就可以拥有子交易和孙子交易，这是可能的 —— 也很常见。理论上，用户可以为一笔交易创建 1000 代子交易，也可以创建使用相同输出的多个子交易（这些交易是相互竞争的，或者说相互 “重复花费”）。用户可以创建多少交易是没有限制的，因为这些交易只是对状态变更的提议，在它们被打包到某个区块之前，什么都不会发生。

## 验证并发送到交易池

无论交易来自哪里，要想一个节点广播这笔交易到网络中，这笔交易就得先被节点的交易池（[mempool](https://doxygen.bitcoincore.org/class_c_tx_mem_pool.html)）接受。交易池就是未确认交易的缓存，是为矿工从中挑选出手续费率最高的交易、打包到区块中而设计的。但是，即使是不挖矿的节点，缓存未确认交易对加速区块转发、提高验证速度、协助交易转发和运行手续费率估计都是有用的。

点对点的交易转发对网络的抗审查性、隐私和隐私性都有贡献。我们可以设想一种简单的系统，其中用户都直接向矿工提交交易，这就类似于许多软件服务：用户只能访问由少数公司的服务器托管的网站。但是，在这个假想的系统中，矿工 —— 延伸开去，也包括可以向矿工施加法律压力的政府和阻止 —— 可以轻易辨别出交易的起源并审查用户。

在比特币网络中，我们希望任何节点都能广播交易、无需特别的许可，也无需高得离谱的手续费。运行一个全节点（并启用所有的隐私设置）应该是可以做到、可以负担的，即使在交易量高涨的时期。这不是容易做到的事，因为一个免信任的网络设计得让任何诚实得节点都能参与，本身就会让交易得验证引擎暴露在恶意对等节点的 DoS 攻击之下。恶意的节点可以创建非常便宜的虚假交易（既是在经济价值上微小，也是在计算成本上低廉），以此攻击诚实节点，毕竟，交易的创建没有工作量证明要求。

### 交易池验证

为资源有限的交易池选出最好的交易，会遇上取舍：是要乐观地验证候选交易、找出手续费率最高的，还是要保护节点免于 DoS 攻击？因此，在共识规则之外，我们还应用了一系列的验证规则，称为 “交易池对策（policy）”。

我们会将交易的验证按以下几种不同的角度分类：

- 共识规则 vs. 交易池对策：也可以理解为强制的和非强制的检查。这两套规则不是互斥的，但我们会努力区分两者
- 脚本的 vs. 非脚本的：[脚本](https://en.bitcoin.it/wiki/Script)指的是用来指定和满足花费条件的指令和数据。我们区别两者是因为脚本的检查（具体来说，签名的验证）是交易验证中计算量最大的部分。
- 带语境的 vs. 无语境的：“语境” 指的是我们对当前状态（表示为 “[ChainState](https://github.com/bitcoin/bitcoin/blob/1a369f006fd0bec373b95001ed84b480e852f191/src/validation.h#L566)”）的知识。带语境的检查可能要求对当前区块高度或 UTXO 集合的知识，而无语境的检查只需要交易本身。我们也需要查询交易池，以验证花费未确认交易的交易，或者与交易池中已有的另一笔交易相冲突的交易。

**无语境的非脚本检查**

Bitcoin Core 的交易池验证从非脚本检查（有时候称为 “[PreChecks](https://github.com/bitcoin/bitcoin/blob/1a369f006fd0bec373b95001ed84b480e852f191/src/validation.cpp#L541)”，正是我们的检查所调用的函数的名称）开始。

作为一种防守策略，节点会从无语境的 以及/或者 易于检查的部分开始。这里是一些例子：

- 没有输出尝试发送[小于 0 或者大于 2100 万 BTC](https://github.com/bitcoin/bitcoin/blob/1a369f006fd0bec373b95001ed84b480e852f191/src/consensus/tx_check.cpp#L25-L27)。
- 交易[不是一笔 coinbase 交易](https://github.com/bitcoin/bitcoin/blob/1a369f006fd0bec373b95001ed84b480e852f191/src/validation.cpp#L568)，因为区块之外无法存在任何 coinbase 交易。
- 交易的 [“重量” 不超过 400000 单位](https://github.com/bitcoin/bitcoin/blob/1a369f006fd0bec373b95001ed84b480e852f191/src/policy/policy.cpp#L88)。这么大体积的交易可能在共识上是有效的，但会占据太多的交易池空间。如果我们允许这样的交易进入交易池，攻击者可以尝试使用体积非常大但永远不会被挖出的交易来塞爆我们的交易池。

**带语境的非脚本检查**

带语境非脚本检查中最明显的部分可能就是为了[确保输入是可用的](https://github.com/bitcoin/bitcoin/blob/1a369f006fd0bec373b95001ed84b480e852f191/src/validation.cpp#L641-L662)，无论是找出它在链状态中，还是发现它是交易池内交易的一个未花费的输出。Bitcoin Core 不会遍历整条区块链（存储在硬盘中的整条区块链有几百 GB），而是会包括现在可用的[资金](https://github.com/bitcoin/bitcoin/blob/1a369f006fd0bec373b95001ed84b480e852f191/src/coins.h#L30)的一个[分层缓存](https://github.com/bitcoin/bitcoin/blob/1a369f006fd0bec373b95001ed84b480e852f191/src/validation.h#L517-L541)（几个 GB，大部分都可以存储在内存里）。为了让整个过程更加高效，如果一笔交易被交易池接受了，在交易池验证期间从硬盘中找出的资金记录会存[储在内存中](https://github.com/bitcoin/bitcoin/blob/1a369f006fd0bec373b95001ed84b480e852f191/src/validation.cpp#L1116-L1124)。

时间锁也在此时检查 —— 节点会获取过往区块的中值时间（[BIP113](https://github.com/bitcoin/bips/blob/master/bip-0113.mediawiki)）以及/或者 在当前的链状态的区块高度，以检查交易的 [` nlockTime `](https://doxygen.bitcoincore.org/class_c_transaction.html#a54d5948c11f499b28276eab6bbfdf0c5) 和输入的  [` nSequence `](https://doxygen.bitcoincore.org/class_c_tx_in.html#a635deeaf3ca4e8b3e1a97054607211b9) 。

**“带语境的” 脚本检查**

交易的[脚本检查](https://doxygen.bitcoincore.org/validation_8cpp.html#a6a96a3e1e6818904fdd5f51553b7ea60)实际上是孤立的、无语境的；每个输入的 [` scriptSig ` ](https://doxygen.bitcoincore.org/class_c_tx_in.html#aba540fd902366210a6ad6cd9a18fe763)（脚本签名）和 [ ` witness ` ](https://github.com/bitcoin/bips/blob/master/bip-0141.mediawiki#specification)，跟[相应的 UTXO](https://github.com/bitcoin/bitcoin/blob/1a369f006fd0bec373b95001ed84b480e852f191/src/validation.cpp#L1469) 的 [ ` scriptPubKey ` ](https://doxygen.bitcoincore.org/class_c_tx_out.html#a25bf3f2f4befb22a6a0be45784fe57e2)（脚本公钥）配对之后，会被输进[脚本解释器](https://doxygen.bitcoincore.org/interpreter_8h.html)，然后验证，不会用到连状态。脚本解释器只会基于传输进去的参数，对一系列的操作码和数据求值。

而传输进入脚本解释器中的 “语境”，是一组[脚本验证标签](https://github.com/bitcoin/bitcoin/blob/1a369f006fd0bec373b95001ed84b480e852f191/src/script/interpreter.h#L42-L143)，指明了在脚本验证中应该使用什么规则。举个例子， ` OP_CHECKEQUENCEVERIFY ` 操作码是使用 ` OP_NOP3 ` [重新定义](https://github.com/bitcoin/bips/blob/master/bip-0112.mediawiki)的。而脚本验证标签 ` SCRIPT_VERIFY_CHECKSEQUENCEVERIFY ` 会指示脚本解释器，是将操作码 ` 0xb2 ` [解释](https://github.com/bitcoin/bitcoin/blob/1a369f006fd0bec373b95001ed84b480e852f191/src/script/interpreter.cpp#L587)为要求[检查](https://github.com/bitcoin/bitcoin/blob/1a369f006fd0bec373b95001ed84b480e852f191/src/script/interpreter.cpp#L1760)输入的 ` nSequence ` 字段大于栈顶数值，还是解释为无操作。从 BIP112 的激活高度开始，节点会在共识脚本检查中，将 ` SCRIPT_VERIFY_CHECKSEQUENCEVERIFY=1 ` [输进](https://github.com/bitcoin/bitcoin/blob/1a369f006fd0bec373b95001ed84b480e852f191/src/validation.cpp#L1695-L1697)脚本解释器。

**无语境的签名和脚本检查**

交易池验证执行两组脚本检查：[ ` PolicyScriptChecks ` ](https://github.com/bitcoin/bitcoin/blob/1a369f006fd0bec373b95001ed84b480e852f191/src/validation.cpp#L917) 和 [ ` ConsensusScriptChecks ` ](https://github.com/bitcoin/bitcoin/blob/1a369f006fd0bec373b95001ed84b480e852f191/src/validation.cpp#L943) 。前者使用 [共识规则和对策标签](https://doxygen.bitcoincore.org/policy_8h.html#ab28027bf27efcdd6535a13175a89ca5a) [运行脚本解释器](https://github.com/bitcoin/bitcoin/blob/1a369f006fd0bec373b95001ed84b480e852f191/src/validation.cpp#L926)并且（如果通过的话）在签[名缓存器](https://github.com/bitcoin/bitcoin/blob/d67330d11245b11fbdd5e2dd5343ee451186931e/src/script/sigcache.cpp#L21-L26)中缓存签名结果。后者[仅使用共识规则标签](https://github.com/bitcoin/bitcoin/blob/1a369f006fd0bec373b95001ed84b480e852f191/src/validation.cpp#L965)运行脚本解释器，并[缓存完整的验证结果](https://github.com/bitcoin/bitcoin/blob/1a369f006fd0bec373b95001ed84b480e852f191/src/validation.cpp#L1490)，以 wtxid 和脚本验证标签来标记。如果在当前的区块与该交易未来上链的区块之间有新的共识规则激活，这个缓存的结果就会失效，不过，根据脚本验证标签，这是很容易检查出来的。

举个例子，在 taproot 规则在共识中激活之前，它们已经在交易池对策中了（对策中包含 ` SCRIPT_VERIFY_TAPROOT ` ，但它不是一个共识脚本验证标签）；节点不会转发和接受无法通过在 taproot 规则下无效的版本 1 交易进入交易池，即使这些交易还谈不上违反任何共识规则。所有的脚本检查都会不使用  ` SCRIPT_VERIFY_TAPROOT ` 而缓存起来。在 taproot 激活之后，节点看到一笔以前有效的交易，会发现缓存记录的脚本验证标签跟当前的共识标签不匹配，所以节点会为这笔交易重新运行脚本检查。

脚本验证中最耗费计算的就是签名验证（在脚本中以 ` OP_CHECKSIG ` 这样的操作吗指定），这一点不会因为语境的改变而改变。为了避免节点重复工作，在每一次脚本检查的最开始，交易的部分会被[序列化、运行哈希计算，然后存储](https://github.com/bitcoin/bitcoin/blob/1a369f006fd0bec373b95001ed84b480e852f191/src/script/interpreter.cpp#L1423)在一个 [ ` PrecomputedTransactionData ` ](https://doxygen.bitcoincore.org/struct_precomputed_transaction_data.html) 结构体中，用于签名验证。这对拥有多个输入 以及/或者 多个签名的交易来说是特别有用的。此外， ` PolicyScriptChecks ` 的缓存结果可以立即用在 ` ConsensusScriptChecks ` 中；我们几乎绝对不需要重复验证同一个签名！

### 提交到交易池

交易池中的每一条[记录](https://doxygen.bitcoincore.org/class_c_tx_mem_pool_entry.html)都包含一笔交易以及多个元数据，例如收到这笔交易的时间、它的手续费（用于更快的检索）、满足其时间锁所需的区块高度 以及/或者 时间，以及指向其交易池内的祖先和后代的指针（如果有的话）。

交易池的大部分用于跟踪一笔交易在交易池内的祖先（父母、父母的父母，等等）以及后代（子女、子女的子女，等等）以及它们的总手续费。仅当其父母存在时，一笔交易才是有效的：父母交易未被挖出之前，一笔交易是无法挖出的。相应地，如果一笔交易从交易池中逐出，其后代也会被逐出。

因此，一笔交易的实质手续费率，不仅仅是其手续费除以其重量，还是其自身及其所有祖先的总手续费除以总重量。在交易池被填满时，这个信息也要被考虑，以决定逐出哪些交易（同样基于手续费率）。当然，所有这些信息都可以实时计算出来，但构造一个区块是非常花时间的，所以交易池可选择缓存这些信息，而不是花更多的时间重新计算。你可以想象，交易的家族 DAG 可能会变得非常复杂，而且正是资源耗尽的一个原因，所以交易池对策的一个部分，正是限制单体交易的联通性。

一笔交易被添加到交易池是一个事件（event），[ ` ValidationInterface ` ](https://doxygen.bitcoincore.org/class_c_validation_interface.html) 的客户端可能[会被提醒](https://github.com/bitcoin/bitcoin/blob/1a369f006fd0bec373b95001ed84b480e852f191/src/validation.cpp#L1046)，如果客户端订阅了 ` TransactionAddedToMempool() ` 事件的话。如果这笔交易正是这个钱包感兴趣的（例如，是发送或者接收一笔支付），它会[提醒](https://github.com/bitcoin/bitcoin/blob/1a369f006fd0bec373b95001ed84b480e852f191/src/wallet/wallet.cpp#L1187)钱包：这笔交易已经添加到了交易池中。

## P2P 交易转发

一个参与了交易转发的节点会公告其交易池中的所有交易。交易转发的目标是将候选进入区块的所有交易在合理的时间内传播给网络中的所有节点，同时尽力隐藏交易的起源地以及本地交易池的具体内容。我们认为，几秒钟的时延是可以接受的，只要能帮助隐藏一些信息、避免冗余的交易消息阻塞网络。

技术上来说，比特币的 P2P 协议制定了交易时使用  ` tx ` 消息来沟通的。大部分节点都使用三段式的对话来转发消息：

1. 发送者发送一条  [` inv `（Invertory）]() 消息，使用 txid 或者 wtxid 公布新的交易。
2. 节点[管理](https://doxygen.bitcoincore.org/class_tx_request_tracker.html)来自对等节点的多条交易公布消息，以确定这些交易是否是自己感兴趣的，以及向哪个节点请求。为请求一笔交易，节点会发送一条 [ ` getdata ` ](https://github.com/bitcoin/bitcoin/blob/1a369f006fd0bec373b95001ed84b480e852f191/src/protocol.h#L97-100) 消息给某个对等节点，带有一个使用 txid 或者 wtxid 来指定的交易清单。
3. 发送者通过在 ` tx ` 消息中携带完整的交易，[回复给发起 ` getdata ` 的对等节点](https://github.com/bitcoin/bitcoin/blob/1a369f006fd0bec373b95001ed84b480e852f191/src/net_processing.cpp#L1876-L1906)。

### 交易的公告与广播

为在交易转发中保护隐私性，我们特别希望隐匿一笔交易的起源地（网络地址）。我们也不希望对等节点能够侦测我们的交易池的实际内容、知晓一笔交易在何时进入我们的交易池（这是一种能够用来跟踪交易传播路径的信息）。对每一个对等节点，节点都会以[随机的时间间隔](https://github.com/bitcoin/bitcoin/blob/1a369f006fd0bec373b95001ed84b480e852f191/src/net_processing.cpp#L4584-L4588)发送一批交易公告（使用泊松定时器，对出站对等节点是 2 秒的平均间隔，对入站对等连接是平均 5 秒的间隔）。这降低了对等节点通过  ` getdata ` 来侦测我们何时接收到某笔交易的精确度。

如果交易的传播因为某些原因而失败，就可能需要重新广播 —— 失败的原因既有可能是审查，也可能是单纯的虚假的网络故障。我们可能会认为重新广播是交易所有者的节点的责任，但特殊对待自己的交易会造成隐私泄露。所以 Bitcoin Core 节点会跟踪[“未广播的” 交易](https://doxygen.bitcoincore.org/class_c_tx_mem_pool.html#a3df5ff43adfe0f407daa6fdef8965ba8)的集合、协助 *所有* 交易的广播初始化，并周期性地重新广播它们，直到对等节点发来对这些交易的  ` getdata ` 请求。

## 交易的请求和下载

因为一个节点一般会有多个对等节点，它可能会收到对同一笔交易的多条公告。为了避免浪费带宽，节点在请求一笔交易时一次只会向一个对等节点请求。当然，请求可能会失败。被请求的对等节点可能已经从交易池中逐出了这笔交易，或者花了太长的时间来响应，甚至可能关闭连接、回复垃圾信息。恶意的节点可能还会尝试利用交易请求逻辑中的错误来审查或阻止交易向矿工广播。在这些情形中，节点必须记得公告了同一笔交易的其它对等节点，以便重新请求。

所以，节点不会立即使用  ` getdate ` 响应发来的交易 ` inv ` 消息，而是会[存储收到的所有公告消息](https://github.com/bitcoin/bitcoin/blob/1a369f006fd0bec373b95001ed84b480e852f191/src/net_processing.cpp#L2859)，使用 txid/wtxid 标记并组成一批，然后基于连接的类型和对每一个节点的正在处理中的请求，向最优的对等节点请求交易数据。节点会[偏向于](https://github.com/bitcoin/bitcoin/blob/1a369f006fd0bec373b95001ed84b480e852f191/src/net_processing.cpp#L1053-L1066)从手动连接、出站连接和使用 [wtxid relay](https://github.com/bitcoin/bips/blob/master/bip-0339.mediawiki) 的对等节点下载数据。如果最新收到的公告消息来自非偏好节点，节点会等待一段时间，看偏好的对等节点是否会公告同一笔消息，然后再发送下载请求。

### 孤儿交易

节点有时候会收到花费看起来不存在的输出的交易。可能这笔交易的输入就是不存在，但也有可能是这个节点还没收到这笔交易的父母交易，因为交易并不保证是按顺序传播的。因为没有办法分辨到底是哪一种情形，节点的乐观做法是从来源节点处请求未知的父母交易，并将这笔交易在[孤儿交易池](https://doxygen.bitcoincore.org/txorphanage_8h.html)中存储一段时间。

## 打包进入区块

数字签名可以表示一个私钥的主人同意花费这笔钱，但资金不会立即转移，要等到整个网络共识这笔资金已经发送了才行。比特币的共识协议要求交易被打包进入一个带有有效工作量证明解的区块中，并且这个区块要被共识为凝聚最多工作量的链的一部分（交易的效果才会实际发生）。

### 挖矿

矿工得到前一个区块的哈希值之后，就可以开始挖掘下一个区块。创建一个新区块的过程差不多是这样的：

1. 矿工调用 Bitcoin Core 的 PRC [ ` getblocktemplate ` ](https://developer.bitcoin.org/reference/rpc/getblocktemplate.html) ，从交易池中找出最优的一组交易（需要满足区块的[重量和签名操作数量限制](https://github.com/bitcoin/bitcoin/blob/7fcf53f7b4524572d1d0c9a5fdc388e87eb02416/src/consensus/consensus.h#L14-L17)）。这会产生一个 [*区块模板*](https://github.com/bitcoin/bips/blob/master/bip-0022.mediawiki)，包含了一组在共识上有效的交易和区块头，只是没有工作量证明的 nonce。
2. 矿工使用区块模板来给其它硬件（专用的 ASIC、云端的计算机实例、由矿池成员运行的节点，等）分派工作任务，这些硬件将在 nonce 空间内搜索并执行暴力哈希运算。一般意义上的 “挖矿”  值的就是这个专门的步骤：哈希同一个区块的不同版本（例如，带有不同的 nonce 值），直到区块的哈希值符合比特币网络的难度目标。
3. 如果找出了一个工作量证明解，矿工就调用 [ ` submitblock ` ](https://developer.bitcoin.org/reference/rpc/submitblock.html)，将区块发送给自己的节点，然后广播出去。

### 区块转发

发现新区块后，区块传播的速度对网络的去中心化是[至为关键](https://podcast.chaincode.com/2020/03/12/matt-corallo-6.html)的。决定传播速度的一部分是区块转发的速度（以两个对等节点间的时延计），另一部分则使区块的验证速度。

一个区块可能包含几 MB 的交易，所以洪泛式（flooding）传播区块可能会造成网络流量的巨大峰值。我们还知道，保存着一个交易池的节点一般已经看到被传播的区块中的[绝大部分](https://www.youtube.com/watch?v=EHIuuKCm53o)交易。这表明我们应该使用类似于交易转发的  ` inv ` / ` getdata ` 对话，只将数据发送给需要的节点，但这将极大地延长区块传播的时延。

比特币的 P2P 协议指定了几种不同的方式来传播区块，每个节点一般都使用某一种组合。对等节点会在初次建立连接的时候沟通使用哪一种区块转发方法。

- 区块头优先同步：从 v0.10 开始，Bitcoin Core 节点会[优先同步区块头](https://github.com/bitcoin/bitcoin/pull/4468)，乐观地接受 80 字节的区块头以建构他们的区块链（技术上来说应该是区块树，因为分叉、过期的区块和无效的区块都有可能出现）。在验证完区块头之后，接收节点可以请求剩余的[区块](https://github.com/bitcoin/bitcoin/blob/1a369f006fd0bec373b95001ed84b480e852f191/src/net_processing.cpp#L2093)数据。
-  ` inv ` / ` getdata ` 对话：非常类似于交易转发的对话。区块公告使用 ` inv ` 消息发布，然后对等节点使用 ` getdata ` 和哈希值来请求区块。
- 致密区块：[BIP152](https://github.com/bitcoin/bips/blob/master/bip-0152.mediawiki) 致密区块仅包含区块头、预先填充的 coinbase 交易、所有其它交易的短 id（shortid）。如果接收者不理解一个短 id，它可能会通过 ` getblocktxn ` 来[请求](https://github.com/bitcoin/bitcoin/blob/1a369f006fd0bec373b95001ed84b480e852f191/src/net_processing.cpp#L3434)这笔交易。
  - 节点可以在  ` inv ` / ` getdata ` 会话中请求致密区块，然后执行区块头验证。
  - 此外，Bitcoin Core 节点最多可以选出 3 个对等节点作为 “高速致密区块对等节点”，允许这些对等节点直接发送致密区块，不需要发送宣布消息并等待请求。作为高速致密区块对等节点的节点还将进一步加快节奏 —— 只要收到有效的 PoW 解，就立即转发，不会等待区块内的所有交易验证完成。

### 区块验证

想要完整地验证新区块，节点只需要查询他们的 UTXO 集、知晓当前的共识规则。因为共识规则依赖于区块高度和时间（两者都有可能在链重组时 “倒拨”），每个区块的这些参数都会在验证前重新计算。无论区块交易在之前是否已经验证过并被交易池接受，节点会检查区块层面的共识规则（例如，[总签名操作数](https://github.com/bitcoin/bitcoin/blob/9df1906091f84d9a3a2e953a0424a88e0931ea33/src/validation.cpp#L1935)、[重复交易](https://github.com/bitcoin/bitcoin/blob/9df1906091f84d9a3a2e953a0424a88e0931ea33/src/validation.cpp#L1778-L1866)、[时间戳](https://github.com/bitcoin/bitcoin/blob/9df1906091f84d9a3a2e953a0424a88e0931ea33/src/validation.cpp#L3172-L3179)、[witness 承诺](https://github.com/bitcoin/bitcoin/blob/9df1906091f84d9a3a2e953a0424a88e0931ea33/src/validation.cpp#L3229-L3255)、[区块补贴数量](https://github.com/bitcoin/bitcoin/blob/9df1906091f84d9a3a2e953a0424a88e0931ea33/src/validation.cpp#L1965-L1969)）以及交易层面的共识规则（例如，输入是否可用、时间锁、[输入的脚本](https://github.com/bitcoin/bitcoin/blob/9df1906091f84d9a3a2e953a0424a88e0931ea33/src/validation.cpp#L1946)）。

前面已经提到，脚本检查是开销很大的。区块验证中的脚本检查是并行化的，并且利用了脚本缓存。对每个输入的检查都添加到一个[工作队列](https://github.com/bitcoin/bitcoin/blob/9df1906091f84d9a3a2e953a0424a88e0931ea33/src/validation.cpp#L1887)中，在主验证线程处理其它事情的时候，委托给另一组线程。虽然出错是很罕见的 —— 为一个无效的区块创造一个有效的工作量证明是极为昂贵的 —— 任何一笔交易出现共识错误都会作废整个区块，而且不会有任何状态变更会保留下来 —— 只有所有线程都成功完结（整个区块的所有交易都通过验证）才会保存状态变更。如果节点遇上了一笔交易，在得到区块前就已经验证过，并且期间没有共识规则变更，并且脚本缓存也还没从交易的记录中逐出，则会直接使用[脚本缓存](https://github.com/bitcoin/bitcoin/blob/1a369f006fd0bec373b95001ed84b480e852f191/src/validation.cpp#L1419-L1430)！

## 共识之后

一笔交易被包含进一个带有有效工作量证明的区块，并且该区块被整个网络接受之后，我们就说这笔交易 “被确认了”，而且我们可以认为资金的转移已经完成了。随着更多有效工作量证明区块接在包含了这笔交易的区块后面，这笔交易也被认为有了更多 *区块确认*，我们也有理由认为钱货两讫了。

### 交易的终局性

使用后续的工作量 —— 一般使用区块确认的数量作为量化标准 —— 来衡量一笔交易的 *终局性*，是有道理的，因为它代表着整个网络创建并接受一条与该交易所在的链相竞争的链的概率。

攻击者可能有意尝试，我们也可以根据做这件事的经济成本来衡量交易的安全性。你可以想象，攻击的成本会随着区块难度的升高而变得更加昂贵，因为挖出一个区块需要的工作量增加了；网络的哈希率升高，攻击成本也会升高，因为攻击者必须跟网络中的其他人竞争（或者贿赂他们），以创建一条带有更多工作量证明的链。

这也意味着，我们应该将交易的价值纳入对终局性的度量中；安全性在根本上是经济选。如果我几个区块前收到了价值 1 亿美元的交易，我不会马上跳起来，因为发送者尝试通过挖掘（或者贿赂矿工来挖掘）更多工作量的链、回滚这笔交易是有利可图的。

### 状态变更以及持久化到硬盘

因为历史区块数据不会经常用到，而且非常大，它会存储在硬盘中，仅在需要时才读取。节点会保存一套[索引](https://doxygen.bitcoincore.org/class_c_block_index.html)，以通过哈希值快速找出这些区块在硬盘上的存储问题。此外，节点还要为重组作准备 —— 要是发现了一条新的、带有更多工作量的链，现在收到的这个区块就会变成过时区块，当前对 UTXO 集合的变更也需要撤销。因此，每个区块都有一组对应的 [undo 数据](https://doxygen.bitcoincore.org/class_c_block_undo.html)。

区块和 undo 数据会持久化保存在硬盘的  ` blocks/ ` 目录下，每一个 ` blkNNNNN.bat ` 文件都会存储原始的区块数据，而相应的 undo 数据会存储在同一目录下的一个 ` revNNNNN.bat ` 文件中。如果节点运营者为历史区块配置了硬盘空间上限，这个过程会按照老区块先出的原则[自动修剪区块](https://github.com/bitcoin/bitcoin/pull/5863)，以满足这个限制。

虽然 UTXO 集合相对较小（比起区块链来说），但也并不总是能够放到内存中。节点对可用资金的视野，是以从输出点（[outpoint](https://github.com/bitcoin/bitcoin/blob/774a4f517cf63df345e6a4852cc0b135b0a9ab76/src/primitives/transaction.h#L26)）到[资金](https://github.com/bitcoin/bitcoin/blob/774a4f517cf63df345e6a4852cc0b135b0a9ab76/src/coins.h#L30)的 [分层](https://github.com/bitcoin/bitcoin/blob/21438d55d553ae5bf3be7c0d4431aaf136db6c6b/src/validation.h#L505) [映射](https://github.com/bitcoin/bitcoin/blob/21438d55d553ae5bf3be7c0d4431aaf136db6c6b/src/coins.h#L157) 来实现的。每一个验证环节（既包括对基于当前链顶端的新区块的[区块验证](https://github.com/bitcoin/bitcoin/blob/6312b8370c5d3d9fb12eab992e3a32176d68f006/src/validation.cpp#L2380)，也包基于当前的链状态和交易池状态对未确认[交易的验证](https://github.com/bitcoin/bitcoin/blob/6312b8370c5d3d9fb12eab992e3a32176d68f006/src/validation.cpp#L427)），都会创建一个临时的状态视野，并刷新它到合适的视野中。

### 钱包更新

Bitcoin Core 的钱包模块会跟踪收到和发出的交易，并通过[实现](https://github.com/bitcoin/bitcoin/blob/1a369f006fd0bec373b95001ed84b480e852f191/src/wallet/wallet.cpp#L1187-L1265)节点的 [ ` ValidationInterface ` ](https://github.com/bitcoin/bitcoin/blob/3d9cdb16897bf5f5eed525fd3fbc07e57dbe5f54/src/validationinterface.h#L63-L177) 来订阅重大事件。对钱包来说，最有用的信息是[自己的哪一些资金](https://github.com/bitcoin/bitcoin/blob/1a369f006fd0bec373b95001ed84b480e852f191/src/wallet/wallet.cpp#L1296-L1330)是可用的、它们有多大的可能继续保持可用状态（以交易及其发送者得到区块确认的[数量](https://github.com/bitcoin/bitcoin/blob/55a156fca08713b020aafef91f40df8ce4bc3cae/src/wallet/spend.h#L25)来衡量）。一个 UTXO 如果是由本钱包所发起的交易创造的、并且该交易位于最多工作量的区块链的 100 个区块深处，这个 UTXO 会被认为是非常安全的。另一方面，如果一个刚确认的交易，跟另一笔向本钱包发送资金的交易相冲突，那么这些资金的 “深度” 就是 -1，而且[不会被认为](https://github.com/bitcoin/bitcoin/blob/1a369f006fd0bec373b95001ed84b480e852f191/src/wallet/spend.cpp#L94)是一个可靠的资金来源。

## 结论

在一笔交易的生命结束的时候，它会删除一些并添加另一些 UTXO 到网络状态中，并在区块链上增加一条记录，并协助两个比特币用户之间的价值转移，无论他们身处何地。

它可以用许多种形式来表示：原始的 16 进制字符串、一系列的 TCP 包、一个钱包的可能支付，以及资金缓存中一系列被花掉和加上的资金。

在一笔交易的旅途中，它（还有你，亲爱的读者）游过交易池、穿过 P2P 网络，最后在成千上万的比特币节点的区块数据库中找到了一个家。**请原谅我这突如其来的浪漫**。

（完）