---
title: '十字路口的密码学：道德责任，密码朋克运动与机构'
author: 'Eric Blair'
date: '2024/07/02 16:18:40'
cover: ''
excerpt: '探讨了密码学工作和道德责任与政治行动主义的交叉点'
categories:
- 密码朋克
tags:
---


> *作者：Eric Blair*
>
> *来源：<https://eprint.iacr.org/2024/970.pdf>*
>
> *译者：Kurt Pan*



本文受《密码朋克宣言》和 Phillip Rogaway 对密码学的道德特征分析的启发，探讨了密码学工作和道德责任与政治行动主义（political activism）的交叉点。讨论涵盖了密码学发展的历史背景、密码朋克意识形态的哲学基础，以及大规模监控和隐私问题带来的当代挑战。通过研究这些方面，本文呼吁重新致力于开发优先考虑人权和公共物品的密码学解决方案。

<p style="text-align:center">- - -</p>

## 引言

密码学长期以来一直是确保通信安全和保护隐私的工具。然而其作用已然超出了技术实现的范畴，涵盖了重要的政治和道德维度。由 Eric Hughes 于 1993 年撰写的《密码朋克宣言》[7] 强调了密码学固有的政治本质，并提倡将其用作确保隐私和个人自由的手段。同样，Phillip Rogaway 的工作 [10] 强调了密码学家的道德责任，特别是在大规模监视和社会影响的背景之下。

根本上看，密码学可以被视为大众保护自己的一种“武装”手段。 1993 年的宣言和 Rogaway 的工作强调了两个关键点：对政府的不信任和对集体数据的保护。这一观点在 David Chaum 的想法中得到了呼应，他提出了一种依靠强加密来保护隐私的交易模型。尽管距离这些想法首次提出已经过去了 40 多年，但保护社会免遭信息滥用的梦想仍然遥不可及。正如 Chaum 警告的：

> “计算机化正在剥夺个人监督和控制关于其自身的信息的使用方式的能力。 （...）正在为一个档案社会奠定基础，在这个社会中，计算机可用于根据普通消费者交易中收集的数据推断其个人的生活方式、习惯、行踪和关系”[5]。

现实中，我们已经走向了不同的方向。今天，我们依靠这些数据来简化和改善我们的生活。此外，我们愿意提供这些数据，以使设备“更智能”，更适合我们的需求。一方面，这让我们有更多时间专注于其他任务，例如开发先进的人工智能技术。另一方面，我们也忘记了密码学为何必要的本质以及最初的梦想是什么。

从以隐私为中心的观点转向为了方便而拥抱数据共享的观点凸显了一个重大的道德困境。虽然技术进步让生活变得更加轻松，但也增加了创造出一个监控社会的风险。旨在赋予个人权力并保护他们的隐私的密码朋克精神似乎与当今实践并不一致。为了调和这些差异，密码学家和隐私倡导者必须重新点燃密码学的最初愿景——不仅将其作为一种寻求便利的工具，而且要将其作为一种维护隐私、自主和抵御不受控的监控的手段。

范式的另一个转变涉及密码学和安那其主义之间的联系。正如最初的密码安那其主义宣言中所阐述的那样，安那其主义的思想和密码学的使用是紧密地交织在一起的。从本质上讲，密码学被视为推进安那其主义原则的工具。安那其主义反对一切形式的权威并呼吁废除机构，在密码技术中找到了天然的盟友。

在某些方面，现代密码学实践继续挑战着机构权威。然而，这里存在一个悖论：虽然密码学旨在抵制中心化控制，但其开发和实现往往都是由专家决定的，并由大型科技公司和机构资助。这在安那其主义的去中心化理想与强大实体驱动的密码学创新现实之间造成了一种张力。为了真正尊重密码朋克和安那其主义的愿景，必须找到开发和部署密码学工具的方法，使得这些工具可以赋予个体权力，同时抵制任何形式的权力整合。

我们的社区还存在一个关于知识中心化的讽刺悖论。深受喜爱的 IACR（国际密码学研究协会）的政策和座右铭之一是在全世界传播知识。原始而纯粹的想法是很棒；然而，在过程中的某个地方，这个理念变质了。考虑非营利组织的目的。这里强调 “**非营利**”一词。然而，在每次 IACR 会议上，最先展示的一张幻灯片都是“我们拥有稳健的财务状况”。有趣的是，对于一个想要透明度的协会来说，除了参加会议之外，很难找到有关其“财务”的数据。此外，每年我们看到会议注册费和基金金额都在增加，而最初分享知识的目标似乎更加遥远了，或者只是一个乌托邦。

直说吧，我们就是利用早期的安那其主义、知名教授和构造密码学的有趣时光，在学术努力的幌子下简单地构建了一个蒙面的公司。这种背离密码朋克和安那其主义愿景基本原则的转变表明，有必要回归到密码学发展的源头——确保它仍然是赋予个体权力并保护隐私免受各种形式的中心化和控制的工具。

在本文中，我们的目标是提出一种密码学的全面的社会观点以及多年来使密码学进步成为可能的实体。我们将探讨密码学的道德伦理责任、密码学所影响的社会运动的起源以及当前密码学的发展轨迹。一个重点将是追溯密码学的历史重要性以及它是如何塑造我们社会的各个方面的。通过研究这些要素，我们希望能够更深入地了解密码学在现代世界中的多方面作用。

## 密码学的历史背景及其影响
最初，密码学被定义为数学和计算机科学的一个分支，专注于开发加密和解密通信的技术。然而今天，密码学的范畴已然显著扩大。虽然现代密码学仍然植根于数学，但它也涉及计算机科学、电子工程、物理学和其他几个学科。因此，**现代密码学**更全面的定义是：“密码学是致力于数字安全研究的多学科领域，旨在提供确保通信安全的工具。”

密码学的发展受到其在战时通信中的使用及其向数字安全应用的演变的深刻影响。一些重要的历史里程碑包括：

- **第二次世界大战和 Enigma 机**：密码学在军事通信中的使用以及盟军的破解凸显了密码学工作的双重性质，既是安全工具，也是敌手的目标。

- **公钥密码学的出现**：20 世纪 70 年代公钥密码系统的引入彻底改变了安全通信，为现代密码学的实践奠定了基础。

-  **Shor算法和素数因式分解**：发展能够破解已在全球部署的现代公钥密码学的量子算法。

密码学在第二次世界大战期间取得了重大进展，这段时期的密码学和密码分析活动非常活跃。这一时期密码分析的成功彰显了严格分析的重要性以及加密方法中存在漏洞的可能性。

随着计算机行业的发展以及私有部门对安全硬件和软件需求的增长，对加密技术（最初被归类为战争设备）的国内使用和出口的限制性法规已经过时。持续的技术进步需要最先进的安全措施[6]。对数据收集和过时的法规的不信任，一起导致了对加密技术的倡导，这既成为一个市场的必需品，又成为了一种对日益增长的监控系统的抵制形式。

20 世纪 90 年代中期，随着 Shor 算法的发展，密码学领域取得了重大科学突破。这种量子算法高效地解决了整数分解和离散对数等问题，这些问题构成了 RSA 和 ECC 等许多经典密码系统的基础。Shor 算法的出现刺激了后量子密码学的发展，其目标是构造能够抵御量子攻击的密码算法。这已成为一个重要的研究领域，因为未来量子计算机的潜在实现可能会破坏当前密码系统的安全性。确保向抗量子加密方法的过渡对于维持后量子时代数字通信的完整性和安全性至关重要。

NIST（美国国家标准及技术研究所）和 ISO（国际标准化组织）等标准化机构在密码学标准的开发和采用方面发挥了至关重要的作用，确保了不同系统和应用之间的互操作性和安全性。这些标准提供了安全实现密码学算法和协议的指南，这对于保护各个领域的敏感信息至关重要。

密码学现在是区块链、数字货币、安全聊天应用和物联网 (IoT) 等现代技术的基础。例如，区块链技术依赖密码学哈希和数字签名来确保交易的完整性和真实性。同样的，Signal 和 WhatsApp 等聊天应用中的端到端加密可确保只有目标收件人才能阅读消息。

该领域还必须不断发展以应对各种密码攻击，包括侧信道攻击、暴力枚举攻击和复杂的密码分析技术。研究者也不断开发新的防御技术和密码原语，以增强数字系统的安全性并防范这些不断演变的威胁。

展望未来，密码学研究的新兴趋势包括同态加密的进步，其允许在不解密的情况下对加密数据进行计算；零知识证明，可以验证一个陈述而不泄露除了该陈述为真之外的任何信息；量子密钥分发，利用量子力学原理安全地分发密码学密钥。

### 密码朋克宣言：一个政治宣言
在《密码朋克：数字时代的隐私与安全》一书中[3]， Anderson 从新的哲学角度解决了有关密码朋克运动的道德伦理和宣言的几个问题。这本书相对较新，且对密码朋克运动的道德伦理采用了现代方法。

> “然而，密码朋克哲学不仅涉及安全和隐私的政治。从根本上说，密码朋克的世界观从根本上来说是规范性的，意即其建立在关于人和机构 *应该做什么* 以及社会 *应该是什么样* 的主张之上。” [3]

这段引文使我们能够将其与安那其主义运动联系起来，甚至推断密码朋克哲学可以被视为一种安那其主义的数字迭代。可以与巴枯宁的早期作品进行类比，其中呼应了类似的社会规范主张：

> “我们坚信，没有社会主义的自由就是特权和不公正，没有自由的社会主义就是奴役和野蛮。” [4]

这两段话都强调了社会应该如何构建以及平衡自由与正义的重要性的基本信念。Anderson的密码朋克哲学强调数字隐私和安全，而巴枯宁的安那其主义则强调社会自由和平等的必要性。它们共同反映了指导社会理想的规范原则的共同愿景。这给密码朋克运动提出了一个自然的问题：“这就是数字社会的指南吗？”

如前所述，我们必须认识到“现实”世界和“数字”世界之间的区别正变得越来越模糊。因此，另一个相关问题是：“我们是否应该更新对密码学构造的看法以反映这种统一的现实？”

《密码朋克宣言》认为密码学是数字时代保护隐私和促进个人自由的基本工具。宣言的主要原则包括：

-  **隐私作为一项基本权利**：主张隐私对于自由社会至关重要，个人必须有办法保护其个人信息。这种隐私权被视为其他公民自由的基石，强调没有隐私，其他自由就会受到严重损害。
- **去中心化和个体赋权**：强调去中心化系统和通过高强度密码学为个体赋权的重要性。去中心化对于防止中心化实体滥用权力至关重要，从而产生更具弹性和公平的数字生态系统。
- **行动主义和实际应用**：鼓励行动主义者开发和部署密码学工具，以对抗政府和企业的监视。这种行动主义植根于这样一种信念，即实用的技术解决方案对于维护数字时代的自由是必要的，而在数字时代，仅靠立法措施可能是不够的。

在数字现实和物理现实交织在一起的现代世界，《密码朋克宣言》的原则比以往任何时候都更加重要。密码学不仅仅是一种保护信息的工具，而且是确保个人主权和抵抗压迫结构的基本要素。随着技术的不断发展，宣言对隐私、去中心化和积极行动主义的呼吁为建立公平公正的数字社会提供了一种关键的框架。

### 密码学家的道德责任
Phillip Rogaway 在他的论文《密码学工作的道德特征》[10] 中认为，密码学研究不是价值中立的，密码学家道德上有责任考虑其工作的社会和政治影响。他提出了几个要点：

- **道德责任**：密码学家应该认识到他们的道德责任以及他们的工作对社会产生的影响。
- **历史背景**：密码学的发展与政府和军事利益密切相关，特别是在监视和情报收集方面。
- **监视和控制**：现代密码学工作通常间接支持监视和控制系统，这可能与隐私和公民自由的价值观相冲突。
- **公共物品**：密码学家应该致力于为公共物品做出贡献，开发保护个人隐私和抵制独裁主义的技术。
- **政治参与**：Rogaway 鼓励密码学家参与政治并考虑其研究更广泛的社会影响。

Rogaway主张密码学进行一次范式转变，倡导研究者采取更具社会意识的方法。这不仅需要关注技术方面，还需要积极参与有关其工作的道德和政治层面的讨论。

尽管 Rogaway 的文章颇具影响力，但密码学学术中的道德挑战几乎没有改变。其中包括国际密码学研究协会（IACR），该协会仍然缺乏正式的道德指导准则。

密码学本质上是多学科的——但无论其是植根于数学、计算机科学还是工程学， 都引发了人们对其道德基础的质疑。Karst 和 Slegers [8] 强调了提供密码学教育的各部门之间道德的多元融合，强调了共有的道德标准的必要性。

相比之下，一些部门比其他部门表现出更明确的道德框架。例如，计算机协会 (ACM) 维护了详细的道德和职业行为准则，包括有关诚实、隐私和社会贡献的准则 [1]。而美国数学会 (AMS) 和美国数学协会 (MAA) 则提供了关于道德行为的更普遍的指引 [2,9]。事实上，我们可以说，职业准则只是简单地（而且非常模糊地）触及了与道德相关的问题：

> “MAA 要求董事、管理人员、会员、受 MAA 报酬的人员和贡献时间的人员以及所有员工在履行职责和责任时遵守高标准的商业和个人道德。” [9]

> “当数学工作可能影响公众健康、安全或公共福利时，数学家有责任在必要时向雇主和公众披露其工作的影响。” [2]

值得注意的是，工业与应用数学学会 (SIAM) 缺乏正式的道德规范。另一个重要的密码学机构 IACR 尽管专注于密码学，但同样缺乏全面的道德声明。鉴于密码学与政治和社会问题的深刻交集，这一差距令人震惊。

#### 伦理道德的哲学讨论

由于其哲学本质和文献中的不同解释，我们难以定义何为伦理学。伦理学涉及道德、价值观、行为的正确与错误以及指导个人或集体行为的原则等问题。它研究什么构成了好的行为和坏的行为，个人在各种情况下应该如何行动，以及道德判断背后的原因[11]。

作为一个植根于数学和计算机科学的社区，密码学社区重视定义的精确性和严格的推理。然而，道德推理提供了一条通向更形式化定义的途径。它包括构造由合理论据和结论支持的论点，旨在实现准确性和逻辑连贯性。

> “我们的道德思维应该有两个相辅相成的目标：正确行事，以及能够用完美的推理来支持我们的观点。我们想要真相，无论是我们对问题提出的最初假设还是最终得出的结论。但我们也想确保我们的观点得到充分的理由的支持。这为良好的道德推理提供了两个判据：第一，我们必须避免错误的信念，第二，我们的道德思维逻辑必须严密、无错误。” [11，第1章第10页]

关于密码学工作道德的争论围绕在增进技术能力和解决此类进步的道德后果之间的平衡。密码学家必须应对复杂的道德领域，他们的工作既可以保护个人隐私，又可以实现监控。密码工作的道德特征需要一种反思性的方法，考虑密码工具和技术是如何影响社会规范和价值观的。这场辩论不仅是学术性的，而且具有现实世界的影响，影响政策决策并会塑造数字时代隐私和安全的未来。解决这些道德问题需要技术专家、伦理学家、政策制定者和公众之间持续对话，以确保密码学的进步与更广泛的社会利益相一致。

换句话说，该领域缺乏行为准则和道德规范可能会损害其未来的发展，特别是当它吸引了更多来自不同背景和年龄的科学家时。我们不能假设每个人都会内在地遵守该领域的道德准则。然而，建立明确的道德准则可以确保学术协会的声明更加准确和一致，使其章程与更广泛的科学诚信和道德原则保持一致。

### 密码学、安那其主义和未来
正如第三节提到的，密码朋克宣言和安那其主义表现出显著的相似之处。密码学和安那其主义之间的关系*植根于它们对隐私、个人自由和对抵制中心化控制的共同重视*。关键的交叉点包括：

- **隐私和个人自治**：安那其主义者主张个人自治和个人隐私，反对国家或其他中心化权威机构进行任何形式的控制或监视。密码学技术使个人能够在数字时代维护自己的隐私和自主权。
- **抵制中心化控制**：安那其主义反对中心化控制和等级结构，主张去中心化和自愿结社。密码学通过在不依赖中心化机构的情况下实现安全的点对点通信和交易来支持去中心化系统。
- **赋予个体权力**：安那其主义者旨在通过拆除压迫性制度并实现自治和互助来赋予个体权力。密码学工具使个体能够保护自己的数据和通信，使其能够控制自己的数字存在和交互。
- **匿名和假名**：匿名可以是安那其主义者保护自己免受国家镇压并组织起来而不用担心报复的一种策略。 Tor 和匿名密码货币等密码技术提供匿名性和假名性，允许个体在不泄露身份的情况下进行操作。
- **哲学基础**：安那其主义的哲学基础包括对个体自由、非强迫和对权威的怀疑的坚定信念。密码朋克运动倡导使用密码学来实现隐私和安全，具有相似的哲学价值观。
- **历史背景**：纵观历史，安那其主义者经常使用秘密通信方法来避免被发现和镇压。现代密码技术的发展部分是出于保护个体和群体免受专制政权侵害的愿望。

从这些关键点来看，密码学显然是实现各种安那其主义目标的关键工具。密码学方法是为了满足安那其主义框架内的特定需求而定制的，例如确保安全的通信信道、保护活动人士的身份以及促进去中心化协作。通过实现私密且安全的交互，密码学可以帮助安那其主义者抵御监控并维护操作安全。这种技术赋能使得安那其主义原则的实际应用成为可能，营造一种环境，使去中心化和志愿的协会能够在没有外部干扰的情况下蓬勃发展。

然而，近年来，曾经支撑密码货币发展的价值观似乎已经被对经济利益的关注所掩盖。密码货币的兴起虽然最初符合去中心化和财务自治的理想，但现在已经日益受到投机利益和盈利动机的主导。这种向货币化的转变可能会损坏密码学的道德基础，转移走人们对其保护隐私和赋予个体权力的潜力的注意力。社区必须记住密码朋克所阐述的原始价值观，并努力平衡创新与道德考量，确保对利润的追求不会掩盖对隐私和个体自由的承诺。

自引入 Diffie-Hellman 密钥交换协议以来，密码学发生了重大变化。最初，密码学是一个高度学术和科学的领域，专注于理论进步和知识追求。然而，随着时间的推移，它已经发展成为一个商业领域，公司利用密码技术来开发和销售产品。这种商业化已将焦点从学术探索转向市场驱动的解决方案，通常将利润置于最初指导该领域的道德和科学价值观之上。对于密码学界来说，恢复其学术根源并重申其对科学严谨性和道德责任的承诺至关重要。我们需要重新关注密码学的几个关键学术方面。虽然标准化流程和安全实现很重要，但它们是否应该消耗我们所有的注意力？探索新的攻击和开发替代密码方案就不应有未来吗？

密码学和安那其主义的交叉揭示了它们在隐私、个体自由和抵制中心化控制等核心价值观方面的深刻一致性。通过详细探索这些联系，我们可以更好地理解密码技术在推进这些原则和解决出现的道德挑战方面的作用。技术专家、伦理学家和活动家之间的持续对话与合作对于确保密码学进步有助于建立更自由、更公正的社会至关重要。

另一个关键点是我们领域内学术焦点与“非营利”概念之间的距离越来越大。我们的首要目标不应该是知识的进步吗？我们什么时候失去了焦点并让大型科技公司主导了我们的会议？例如，一个没有大量资金的学生如何负担得起在苏黎世这样的城市参加会议，注册费约为 450 欧元，再加上酒店和旅行费用？虽然津贴提供了部分解决方案，但选择更便宜的地点以允许更广泛的参与不是更好吗？我们什么时候变得如此精英主义以至于无法在不太知名但更经济的城市举办会议？这种向高成本场所的转变限制了可访问性和包容性，这与学术和科学探索的基本价值观背道而驰。

## 参考文献
1. ACM. Acm code of ethics and professional conduct.
2. American Mathematical Society (AMS). Ethical guidelines of the american mathematical society.
http://www.ams.org/about-us/governance/policy-statements/sec-ethics, 2024. [Online; accessed 10May-2024].
3. Patrick D Anderson. Cypherpunk ethics: Radical ethics for the digital age. Routledge, 2022.
4. Mikhail Bakunin. Federalism, socialism, anti-theologism. Bakunin on Anarchy: Selected Works by the
Activist-Founder of World Anarchism, pages 102–147, 1867.
5. David Chaum. Security without identification: Transaction systems to make big brother obsolete.
Communications of the ACM, 28(10):1030–1044, 1985.
6. Whitfield Diffie and Susan Landau. Privacy on the Line: The Politics of Wiretapping and Encryption.
MIT Press, 2001.
7. Eric Hughes. A cypherpunk’s manifesto, 1993.
8. Nathaniel Karst and Rosa Slegers. Cryptography in context: co-teaching ethics and mathematics.
PRIMUS, 29(9):1039–1059, 2019.
9. Mathematical Association of America (MAA). Welcoming environment, code of ethics, and whistleblower policy. http://www.maa.org/about-maa/policies-and-procedures/welcoming-environment-codeof-ethics-and-whistleblower-policy, 2024. [Online; accessed 10-May-2024].
10. Phillip Rogaway. The moral character of cryptographic work, 2015.
11. Russ Shafer-Landau. The fundamentals of ethics. Oxford University Press, 4 edition, 2018.