---
title: 'TLUV 限制条款操作码简介'
author: 'Anthony Towns'
date: '2023/06/29 17:13:44'
cover: ''
excerpt: '用改变 taproot 树的办法来 “更新” 一个 UTXO'
tags:
- covenant
---


> *作者：Anthony Towns*
> 
> *来源：<https://lists.linuxfoundation.org/pipermail/bitcoin-dev/2021-September/019419.html>*



几年前，我曾心血来潮 [0] ，幻想了如何让这地球上的每一个人都能以最 去中心化/免信任 的办法用上比特币，还不需要扩大区块空间。它有点荒谬，而且可能还不靠谱；除了需要现在所有的提议（taproot、ANYPREVOUT、CTV、eltoo、通道工厂）都得到实现之外，它还需要一种限制条款操作码 [1] 。我想出了一种我认为很适合 taproot 的东西，但无法想象除了用在我那荒谬的方案里面，还能用在别的地方。所以我搁置了这个想法。

但最近 [2] ，Greg Maxwell 给我发邮件，提到了他自己对一种限制条款操作码的大胆想法；事实证明，这基本上就是对相同想法的重新实现，只不过具有更好的功能、更合适的名字以及更合理的应用场景。而且，有了他的启发，我认为现在我也搞清楚了如何用这种限制条款操作码来实现一种基本的 “保险柜” 合约，所以让这个想法被更多人知晓应该是有价值的。

我将分成两封邮件来讨论这中想法。这篇邮件是一个概述，后面一封邮件会深入一些实现上的复杂性。

基本的想法是思考用改变 taproot 树的办法来 “更新” 一个 UTXO 。

你应该想起来了，一个 taproot 地址是由一个内部公钥（P）以及一棵脚本默克尔树（S）通过公式 `Q = P + H(P, S) * G` 组合而成的，最终的脚本公钥是 Q 。在使用某一个脚本来花费这个输出时，你需要在 “控制块” 中提供这个默克尔叶子 —— 包含了你想使用的脚本 —— 的路径。Taproot 的 BIP 给出了一个带有 5 个脚本，形式为 `((A,B), ((C,D), E))` 的案例 [3]  ；假如你想使用 E 来花费这个输出，你需要揭开一个由两个哈希值组成的路径，一个是 `(AB)` ，一个是 `(CD)`，然后你就可以揭示脚本 E，并通过满足脚本 E 来花费这个输出。

由此，我们可以相对容易地设想，基于当前正在花费的输入，通过下述的某一些或全部操作，创建出一个新的 taproot 地址：

- 更新内部公钥（即由 P 变成 P' ，其中 `P' = P + X`）
- 修剪默克尔路径（例如，移除 `CD`）
- 移除你正在使用的脚本（即 `E`）
- 在这个默克尔路径的末端加入一个新步骤（例如 `F`）

一旦你完成了这些操作，你就可以通过解析更新后的默克尔路径计算出一个新的默克尔根（例如 ` S' = MerkleRootFor(AB,F, H_TapLeaf(E))`)，然后基于这个新的默克尔根和新的内部公钥，计算出一个新的脚本公钥（`Q' = P' + H(P', S')`）。

所以，这里的想法是，只需要一种新的操作码 “TAPLEAF_UPDATE_VERIFY（TLUV）” 就可以做到这些事；TLUV 有三个输入：一个用来指定如何更新内部公钥（即为 `X`），一个用来指定默克尔路径的新步骤（F），还有一个指定是否要移除当前的脚本 以及/或者 移除多少个默克尔路径步骤。然后，这个操作码会计算出相匹配的脚本公钥，并验证跟当前的输入相对应的输出使用了这个新的脚本公钥。

如果没有办法来验证新的 UTXO 是否保留了旧 UTXO 中的比特币，那这样的功能是无用的，所以还需要一种新的操作码 `IN_OUT_AMOUNT` ，它会将两个东西推入栈中：来自当前输入的数额，以及对应输出的数额，然后预期使用 TLUV 操作码的人会使用一些数学操作码，来验证合理比例的资金被保留在了使用新脚本公钥的输出中。

这里有两个案例，展示了你可以如何使用这个功能。

第一个是一种基础的保险柜。这里的想法是，资金最终由一个冷钱包私钥（COLD）来保护，这个私钥不方便拿到，但在防盗方面做到了最好。为了让日常的转账更加方便，还可以使用一个热钱包私钥（HOT），这个私钥更容易被盗。保险柜设计限制了这个热私钥每 D 个区块只能取出至多 L 个聪，所以，如果热私钥被盗，你最多只会丢失 L 聪，而且有 D 个区块的时间可以使用你的冷钱包私钥，将资金转走以防止进一步的资金流失。

为了使用 TLUV 建立这样的保险柜，你要构造一个使用 COLD 作为内部公钥的 taproot 输出，并使用一个表达了以下条件的脚本：

- 交易通过 HOT 来签名
- `<D> CSV` —— 即每两次花费之间都要有个时间间隔
- 如果输入的数额小于 L + 粉尘限制，那就终结，保险柜可以清空
- 反则，输出的数额必须至少是 `输入的数额 - L`，并使用 TLUV 检查输出的脚本公钥没有改变

所以，在通过热钱包花费时，在上一次花费过去了 D 个区块之后，你最多也只能花费 L 聪；但是，如果你有冷钱包，你就可以任意花费。

你也可以将这个方案延展呈一个两步骤的花费协议：第一步，需要用热钱包表示 “在 D 个区块中，允许花费至多 L 聪”；仅在此之后，你才能使用热钱包实际花费资金。在这种需求下，你要提供一个使用 COLD 作为内部公钥、将使用两个脚本的 taproot 脚本公钥。第一个 “释放” 脚本指定：

- 交易通过 HOT 来签名
- 输出的数额大于或等于输入的数额
- 使用 TLUV 来检查：
  - 输出的脚本公钥的内部公钥不变（仍为 COLD）
  - 默克尔路径修剪了一个元素
  - 当前的脚本依然包含在内
  - 默克尔路径增加了一个新的步骤，要么是 H_LOCKED、要么 H_AVAILABLE（取决于见证脚本信息提供的是 0 还是 1）（这两个哈希值所对应的脚本内容见下文）

另一个脚本要么是 “LOCKED” 脚本（等同于是 “OP_RETURN”）。要么是 “AVAILABLE” 脚本，它指定了：

- 交易通过 HOT 来签名
- `<D> CSV` —— 在上一次花费（即使用上文的 “释放” 脚本）之后要等待一段时间
- 如果输入的数额小于 L，终结，保险柜可以清空
- 否则，输出的数额必须至少是 `输入的数额 - L`，并通过 TLUV 来检查输出的脚本公钥的内部公钥不变、保留当前的默克尔路径、抛弃当前的脚本，然后添加 H_LOCKED 作为新步骤

这里的 H_LOCKED 和 H_AVAILABLE，只是对应的 `Locker` 脚本和 `AVAILABLE` 脚本的  TapLeaf 哈希值。

我认为，后面这种装置跟 Bryan Bishop 在几年前提出的设计 [4] 是一样的，更好的地方在于它是完全递归的，所以允许取款数额变化，而不是只能固定为 L（因为它不依赖于预先签名的交易），而且总的来说似乎更加简单。

第二种方案是允许一个 UTXO 代表一群人的、汇集在一起的资金。这里的想法是，只要你周围的每个人都在你身边，你们就可以使用 taproot 密钥路径在资金池内部移动资金，或者使用一笔交易和大家的签名对外发起支付。但是，密钥路径花费，只有在每个人都可以在线签名的前提下才能用 —— 如果有人离线了，或者弄丢了私钥，那该怎么办呢？为此，我们需要设置脚本路径，让人们可以在其他人都消失的情况下，也能拿回自己的资金。为此，我们要给每个参与者设置脚本，例如，这是给 Alice 的脚本：

- 交易由 Alice 签名
- 输出的数额必须至少是输入的数额减去 Alice 的余额
- 必须通过 TLUV 检查：
  - 输出的内部公钥是旧的内部公钥减去 Alice 的公钥
  - 当前正在执行的脚本会从默克尔路径中抛弃
  - 除此之外没有移除或添加额外的步骤

这里的巧妙之处在于，如果池中有许多参与者，那么基础某一些人使用了逃生舱，池也会继续运行 —— 剩余的参与者依然可以使用密钥路径来花费，而且他们每人都可以拿着自己的余额通过自己的脚本路径退出。如果每个人都决定退出，那么最后一个花费剩余资金的人可以直接使用密钥路径。

相比于使用非池化资金的链上交易，这种 UTXO 更加高效和隐私：只需一笔一个输入、一个输出的交易，就可以确认池内的任意数量的转账，而且不会在链上泄露谁 正在支付/正在收款 的信息，也不会暴露支付额。至于对外支付，链上信息也不会暴露是哪一个成员正在发送资金，而且只需一个签名就足以让多个成员对多个目的地发送资金。主要的约束在于，你需要池中的每个人都在线，以通过密钥路径来签名，这对于多少人能一起共享一个池子而不崩溃设置了一个实用性上的限制。

与闪电模式（例如包含了多个参与者的 eltoo 通道工厂）相比，我们这种模式的缺点在于，如果更新后的状态不在链上得到确认，它所包含的转账就无法敲定，不过，也有好处，包括如果某个成员单方面退出，不会揭晓还在池内的任何其他人的状态（而在一个 eltoo 通道工厂中，可能会揭晓此刻其他每个人的通道的余额）。

这样的东西的一个更简单的应用场景可能是给一个合伙企业（joint venture）注资 —— 假设你要加入一些更资深的比特币人、一起购买一个岛屿、建立一个城堡，那么你们可以每人出资 20 BTC，形成这个池化的 UTXO，为几个月后的购买作好准备，但你还希望确认，如果事情不能成功，你还能重新拿回你的资金。所以你可以加入上面这样的脚本，允许你单方面撤出你的资金，但添加一个 CLTV（绝对时间锁）条件，以阻止任何人在收购的结果出来之前退出。如果收购顺利，你们可以集体通过密钥路径转移资金；如果不顺利，你们也还又可能通过密钥路径拿回资金，但如果更恶劣的事情发生，你依然可以通过脚本路径直接取回你的 20 BTC。

我认为，这一种递归限制条款设计在概念上有一个好处：它自动地将密钥路径作为一种逃生机制 —— 而不是非得手动建立一种机制、承担它因为某些 bug 而无法工作、让资金永远锁在限制条款中的风险。这个逃生路径是免费的、易于使用的，而且，在一切都顺利时，还是花费资金的最优方法。（当然，你可以将内部公钥设置呈 NUMS 点，然后搬起石头砸自己的脚）。

我认为，这种方法有两方面的局限性值得一提：

一，它无法调整它看不见的默克尔树区域中的脚本 —— 我没有看到有什么特别高效的方法，所有也许最好还是将这件事留给通过密钥路径来协商的人们，这样的修改天然是隐私而且高效的，因为细节都留在链下。

二，它并不能提供让 UTXO 们 “互动” 的方法，这对自动化的做市商 [5] 来说是有用有趣的东西，但可能只对致力于支持多种资产类型的链来说有趣，但对比特币来说并不直接有用。另一方面，也许将它与 CTV 结构就足以解决这个问题，尤其如果传递给 CTV 的哈希值是通过 脚本/CAT/等等 构建的话。

（我认为，这里所描述的一切，都可以使用 CAT 和 CHECKSIGFROMSTACK 提议（加上 64 比特的数学操作码以及访问内部公钥的某种办法）模拟出来，为这个功能引入专门的操作码的用意在于，比起更加通用的操作码，专用的操作码可以让这个特性更容易正确使用，而且，假设它真的可以获得广泛的应用场景，专用的操作码在钱包中也会更便宜和高效，而且节点也更容易验证。）

<p style="text-align:center">- - -</p>


[0] https://gist.github.com/ajtowns/dc9a59cf0a200bd1f9e6fb569f76f7a0

[1] 粗糙地说，这里的意思是，如果有 90 亿人要使用比特币，但每个区块只能包含大约 1000 笔交易，那么你就需要让每一个 UTXO 都代表大量的人。这意味着你需要一种办法，让 UTXO 内的资金可以高效地花费；考虑到让许多人一直在线似乎是不现实的，你需要引入一些信任因素；但为了保持尽可能地 去中心化/免信任性，我们想要一种办法来限制所需引入的信任程度。这就是需要限制条款的地方。

[2] 这个 “最近” 因为新冠病毒流行二有所调整，或者说，是以比特币的共识变更所需的时间为尺度的。https://mobile.twitter.com/ajtowns/status/1385091604357124100

[3] https://github.com/bitcoin/bips/blob/master/bip-0341.mediawiki#Constructing_and_spending_Taproot_outputs

[4] https://lists.linuxfoundation.org/pipermail/bitcoin-dev/2019-August/017231.html

[5] 自动化做市商背后的观念是，你建立一个脚本，表示 “如果你存入 f(x) 数量的 USDT，你就可以从我这里取出 x BTC；或者，如果你存入 x 数量的 BTC，你就可以从我这里取出 g(x) 数量的 USDT”。这里的 f(x)/x 给出了买价，而且 f(x) > g(x) 就意味着你可以获得利润。指定一种限制条款，将 BTC UTXO 的价值变化（+/- x）跟 USDT UTXO 的价值变化（+ f(x) / - g(x)）关联起来，就足以支持这种应用场景，但 TLUV 不能提供这样的关联。