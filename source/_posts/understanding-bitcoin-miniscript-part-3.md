---
title: '理解比特币 Miniscript（三）：解析与分析'
author: 'benma'
date: '2023/03/29 14:14:13'
cover: ''
excerpt: '如何分析代码的正确性、如何创建收款地址'
categories:
- 比特币主网
tags:
- Miniscript
- 开发
---


> *作者：benma*
>
> *来源：<https://shiftcrypto.ch/blog/understanding-bitcoin-miniscript-part-3/>*
>
> *本文为 “理解比特币脚本” 系列的第三篇。前篇见[此处](https://www.btcstudy.org/2023/03/22/understanding-bitcoin-miniscript-part-2/)。*



![Understanding Bitcoin Miniscript - Part III](../images/understanding-bitcoin-miniscript-part-3/nodes-1.jpg)

在本系列的[上一篇文章](https://shiftcrypto.ch/blog/understanding-bitcoin-miniscript-part-2/)中，我们介绍了 Miniscript 是什么，以及它如何映射成 Bitcoin Script。

要在细节上理解 Miniscript 的工作原理，看一种它的实现案例 —— 包括如何分析代码的正确性、如何创建收款地址以及如何花费资金 —— 会有所帮助。

那么，我们来了解和编写一种 Go 语言的实现。

我们将始终以 https://bitcoin.sipa.be/miniscript/ 为参考，因为它包含了所有 Miniscript 片段的详述和特性。

每一个章节的顶部和底部都会包含一个跳到 Go 在线运行环境的链接，你可以在那里运行代码、检查结果以及修补它。

简而言之，我们将把一段 Miniscript 转化成一个[抽象语法树](https://en.wikipedia.org/wiki/Abstract_syntax_tree)（AST），然后执行一系列的树转换和树遍历，以执行正确性分析、创建对应的 Bitcoin Script、创建收款地址，等等。

**声明：下文中的实现没有经过审核和测试。请不要用在生产环境中。它只能用于教学目的。**

## 第一步：转化成抽象语法树

[点击这里，在 Go 在线环境中运行代码](https://go.dev/play/p/5cvol49tupG)

Miniscript 表达式很简单，也容易转化成一棵 [AST](https://en.wikipedia.org/wiki/Abstract_syntax_tree)。不像 数学/代数 表达式，Miniscript 表达式不包含任何中置操作符（infix operator）、分组圆括号，而且圆括号仅用来包围片段的参数。因此，它是易于表达也易于解析的。

我们来定义所需的 AST：

```go
// AST 是用来表示一个 Miniscript 表达式的抽象语法树。
type AST struct {
	wrappers   string
	identifier string
	args       []*AST
}
```

像 `or_b` 这样的标识符将被存储在 `identifier` 字段中。如有任何封装器，例如 `ascd:X`，封装其都会被分离，然后存储在 `wrappers` 字段中。最后，片段的参数将递归存储在 `args` 中。

为了将一个表达式转化成一棵树，我们需要老旧而可靠的堆栈数据结构：

```go
type stack struct {
	elements []*AST
}

func (s *stack) push(element *AST) {
	s.elements = append(s.elements, element)
}

func (s *stack) pop() *AST {
	if len(s.elements) == 0 {
		return nil
	}
	top := s.elements[len(s.elements)-1]
	s.elements = s.elements[:len(s.elements)-1]
	return top
}

func (s *stack) top() *AST {
	if len(s.elements) == 0 {
		return nil
	}
	return s.elements[len(s.elements)-1]
}

func (s *stack) size() int {
	return len(s.elements)
}
```

为了将表达式使用堆栈转化成一棵树，我们先将一个表达式拆分成以圆括号和逗号分割的部分。不走运的是，Go 标准库里面没有线程的函数，所以我让 ChatGPT 给我写了一段代码，而且很成功：

```go
/ - 使用 ChatGPT 编写。
// splitString 函数使用 separator 作为分割元素单元，将一个字数串
// 基于多种 separator 分割成字符串切片。它也将
// 把输出切片中的空元素移除。
func splitString(s string, isSeparator func(c rune) bool) []string {
	// Create a slice to hold the substrings
	substrs := make([]string, 0)

	// Set the initial index to zero
	i := 0

	// Iterate over the characters in the string
	for i < len(s) {
		// Find the index of the first separator in the string
		j := strings.IndexFunc(s[i:], isSeparator)
		if j == -1 {
			// If no separator was found, append the remaining substring and return
			substrs = append(substrs, s[i:])
			return substrs
		}
		j += i
		// If a separator was found, append the substring before it
		if j > i {
			substrs = append(substrs, s[i:j])
		}

		// Append the separator as a separate element
		substrs = append(substrs, s[j:j+1])
		i = j + 1
	}
	return substrs
}
```

一个快速的单元测试，确认了这段代码是能工作的：

```go
func TestSplitString(t *testing.T) {
	separators := func(c rune) bool {
		return c == '(' || c == ')' || c == ','
	}

	require.Equal(t, []string{}, splitString("", separators))
	require.Equal(t, []string{"0"}, splitString("0", separators))
	require.Equal(t, []string{"0", ")", "(", "1", "("}, splitString("0)(1(", separators))
	require.Equal(t,
		[]string{"or_b", "(", "pk", "(", "key_1", ")", ",", "s:pk", "(", "key_2", ")", ")"},
		splitString("or_b(pk(key_1),s:pk(key_2))", separators))
}
```

我们已经准备好遍历这些碎片和 圆括号/逗号，然后建立一棵表达式树了。

无论什么时候，只要见到标识符（圆括号和逗号以外的任何东西），我们就把标识符推入栈中，它将成为它所有的子参数的父节点。无论什么时候，只要遇到逗号或者后圆括号，我们就知道这表示参数的结尾，所以我们从参数从堆栈中弹出，加入到父节点中。一些无效的序列会被明确排除，例如 “()” 和 “(”，它们不会是有效的 miniscript。

```go
func createAST(miniscript string) (*AST, error) {
	tokens := splitString(miniscript, func(c rune) bool {
		return c == '(' || c == ')' || c == ','
	})

	if len(tokens) > 0 {
		first, last := tokens[0], tokens[len(tokens)-1]
		if first == "(" || first == ")" || first == "," || last == "(" || last == "," {
			return nil, errors.New("invalid first or last character")
		}
	}

	// Build abstract syntax tree.
	var stack stack
	for i, token := range tokens {
		switch token {
		case "(":
			// Exclude invalid sequences, which cannot appear in valid miniscripts: "((", ")(", ",(".
			if i > 0 && (tokens[i-1] == "(" || tokens[i-1] == ")" || tokens[i-1] == ",") {
				return nil, fmt.Errorf("the sequence %s%s is invalid", tokens[i-1], token)
			}
		case ",", ")":
			// End of a function argument - take the argument and add it to the parent's argument
			// list. If there is no parent, the expression is unbalanced, e.g. `f(X))``.
			//
			// Exclude invalid sequences, which cannot appear in valid miniscripts: "(,", "()", ",,", ",)".
			if i > 0 && (tokens[i-1] == "(" || tokens[i-1] == ",") {
				return nil, fmt.Errorf("the sequence %s%s is invalid", tokens[i-1], token)
			}

			arg := stack.pop()
			parent := stack.top()
			if arg == nil || parent == nil {
				return nil, errors.New("unbalanced")
			}
			parent.args = append(parent.args, arg)
		default:
			if i > 0 && tokens[i-1] == ")" {
				return nil, fmt.Errorf("the sequence %s%s is invalid", tokens[i-1], token)
			}

			// Split wrappers from identifier if they exist, e.g. in "dv:older", "dv" are wrappers
			// and "older" is the identifier.
			wrappers, identifier, found := strings.Cut(token, ":")
			if !found {
				// No colon => Cut returns `identifier, ""`, not `"", identifier"`.
				wrappers, identifier = identifier, wrappers
			} else if wrappers == "" {
				return nil, fmt.Errorf("no wrappers found before colon before identifier: %s", identifier)
			} else if identifier == "" {
				return nil, fmt.Errorf("no identifier found after colon after wrappers: %s", wrappers)
			}

			stack.push(&AST{wrappers: wrappers, identifier: identifier})
		}
	}
	if stack.size() != 1 {
		return nil, errors.New("unbalanced")
	}
	return stack.top(), nil
}
Let's also add a function to draw the tree, so we can visualize it more easily:

func (a *AST) drawTree(w io.Writer, indent string) {
	if a.wrappers != "" {
		fmt.Fprintf(w, "%s:", a.wrappers)
	}
	fmt.Fprint(w, a.identifier)
	fmt.Fprintln(w)
	for i, arg := range a.args {
		mark := ""
		delim := ""
		if i == len(a.args)-1 {
			mark = "└──"
		} else {
			mark = "├──"
			delim = "|"
		}
		fmt.Fprintf(w, "%s%s", indent, mark)
		arg.drawTree(w,
			indent+delim+strings.Repeat(" ", len([]rune(arg.identifier))+len([]rune(mark))-1-len(delim)))
	}
}

func (a *AST) DrawTree() string {
	var b strings.Builder
	a.drawTree(&b, "")
	return b.String()
}
```

我们用一个复杂的表达式来试一下：

```go
func main() {
	node, err := createAST("andor(pk(key_remote),or_i(and_v(v:pkh(key_local),hash160(H)),older(1008)),pk(key_revocation))")
	if err != nil {
		panic(err)
	}
	fmt.Println(node.DrawTree())
}
```

成功！输出是这样的：

```
andor
├──pk
|   └──key_remote
├──or_i
|     ├──and_v
|     |      ├──v:pkh
|     |      |    └──key_local
|     |      └──hash160
|     |               └──H
|     └──older
|            └──1008
└──pk
    └──key_revocation
```

当然，解析器还没有检查过，所以 `unknownFragment(foo,bar)` 这样的表达式也能被转化成 AST：

```
unknownFragment
├──foo
└──bar
```

[点击此处，在线上 Go 环境中运行代码](https://go.dev/play/p/5cvol49tupG)

## 第二步：检查片段和参数号

[点击此处，在线上 Go 环境中运行代码](https://go.dev/play/p/G395mI5kd_u)

作为多次树遍历的第一步，我们要作第一种容易的检查：树上的每一个片段标识符都是有效的吗？每一种都有正确的参数号码？

根据[规范](https://bitcoin.sipa.be/miniscript/)，所有的片段排列如下：

```go
const (
	// 所有的片段标识符

	f_0         = "0"         // 0
	f_1         = "1"         // 1
	f_pk_k      = "pk_k"      // pk_k(key)
	f_pk_h      = "pk_h"      // pk_h(key)
	f_pk        = "pk"        // pk(key) = c:pk_k(key)
	f_pkh       = "pkh"       // pkh(key) = c:pk_h(key)
	f_sha256    = "sha256"    // sha256(h)
	f_ripemd160 = "ripemd160" // ripemd160(h)
	f_hash256   = "hash256"   // hash256(h)
	f_hash160   = "hash160"   // hash160(h)
	f_older     = "older"     // older(n)
	f_after     = "after"     // after(n)
	f_andor     = "andor"     // andor(X,Y,Z)
	f_and_v     = "and_v"     // and_v(X,Y)
	f_and_b     = "and_b"     // and_b(X,Y)
	f_and_n     = "and_n"     // and_n(X,Y) = andor(X,Y,0)
	f_or_b      = "or_b"      // or_b(X,Z)
	f_or_c      = "or_c"      // or_c(X,Z)
	f_or_d      = "or_d"      // or_d(X,Z)
	f_or_i      = "or_i"      // or_i(X,Z)
	f_thresh    = "thresh"    // thresh(k,X1,...,Xn)
	f_multi     = "multi"     // multi(k,key1,...,keyn)
)
```

`older`、`after`、`thresh` 和 `multi` 的第一个参数都是数字。在我们需要解析它、检查它是不是一个有效的数字时，我们要将它转化成一个数字并存储在我们的 AST 中，以备后续使用。因此，我们给 AST 增加一个新的字段：

```go
// AST is the abstract syntax tree representing a Miniscript expression.
type AST struct {
	wrappers   string
	identifier string
	// 在标识符预计是个数字时解析出来的整数。
	// 比如 older/after/multi/thresh 的第一个参数。否则不使用
	num uint64
	args       []*AST
}
```

我们也需要一种函数，可以递归地遍历整棵树，然后给每一个 Miniscript 表达式/子表达式 使用一个函数。这种转化函数可以修改一个节点，或者直接将它替换成一个新节点，这对最后一个阶段的解析是有用的：

```go
func (a *AST) apply(f func(*AST) (*AST, error)) (*AST, error) {
	for i, arg := range a.args {
		// 我们并不递归进入不是 Miniscript 表达式的参数：
		// key/hash 标量以及 older/after/multi/thresh 的数值参数。
		switch a.identifier {
		case f_pk_k, f_pk_h, f_pk, f_pkh,
			f_sha256, f_hash256, f_ripemd160, f_hash160,
			f_older, f_after, f_multi:
			// 这些函数的变量都不是 Miniscript 表达式，只是
			// 变量（或者说具体的指定）或者数字。
			continue
		case f_thresh:
			// 第一个参数是一个数字，其它的参数是子表达式，
			// 就是我们想要遍历的东西，所以我们只跳过第一个参数。
			if i == 0 {
				continue
			}
		}

		new, err := arg.apply(f)
		if err != nil {
			return nil, err
		}
		a.args[i] = new
	}
	return f(a)
}
```

案例：

```go
node, _ := createAST("andor(pk(key_remote),or_i(and_v(v:pkh(key_local),hash160(H)),older(1008)),pk(key_revocation))")
node.apply(func(node *AST) (*AST, error) {
		fmt.Println("Visiting node:", node.identifier)
		return node, nil
	})
```

输出：

```
Visiting node: pk
Visiting node: pkh
Visiting node: hash160
Visiting node: and_v
Visiting node: older
Visiting node: or_i
Visiting node: pk
Visiting node: andor
```

现在，我们加入一个 Parse 函数，它会创建 AST 并连续应用转化函数，其中第一种转化函数就是片段和参数检查器：

```go
func Parse(miniscript string) (*AST, error) {
	node, err := createAST(miniscript)
	if err != nil {
		return nil, err
	}
	for _, transform := range []func(*AST) (*AST, error){
		argCheck,
		// More stages to come
	} {
		node, err = node.apply(transform)
		if err != nil {
			return nil, err
		}
	}
	return node, nil
}
```

这个 `argCheck` 函数会对树的每一个节点使用，而且我们可以简单枚举所有的有效片段标识符，来执行这种基础检查：

```go
// argCheck 会检查每一个标识符都是一种已知的 Miniscript 标识符，并且
// 具有正确数量的参数，例如 `andor(X,Y,Z)` 必须有三个参数，等等。
func argCheck(node *AST) (*AST, error) {
	// Helper function to check that this node has a specific number of arguments.
	expectArgs := func(num int) error {
		if len(node.args) != num {
			return fmt.Errorf("%s expects %d arguments, got %d", node.identifier, num, len(node.args))
		}
		return nil
	}
	switch node.identifier {
	case f_0, f_1:
		if err := expectArgs(0); err != nil {
			return nil, err
		}
	case f_pk_k, f_pk_h, f_pk, f_pkh, f_sha256, f_ripemd160, f_hash256, f_hash160:
		if err := expectArgs(1); err != nil {
			return nil, err
		}
		if len(node.args[0].args) > 0 {
			return nil, fmt.Errorf("argument of %s must not contain subexpressions", node.identifier)
		}
	case f_older, f_after:
		if err := expectArgs(1); err != nil {
			return nil, err
		}
		_n := node.args[0]
		if len(_n.args) > 0 {
			return nil, fmt.Errorf("argument of %s must not contain subexpressions", node.identifier)
		}
		n, err := strconv.ParseUint(_n.identifier, 10, 64)
		if err != nil {
			return nil, fmt.Errorf(
				"%s(k) => k must be an unsigned integer, but got: %s", node.identifier, _n.identifier)
		}
		_n.num = n
		if n < 1 || n >= (1<<31) {
			return nil, fmt.Errorf("%s(n) -> n must 1 ≤ n < 2^31, but got: %s", node.identifier, _n.identifier)
		}
	case f_andor:
		if err := expectArgs(3); err != nil {
			return nil, err
		}
	case f_and_v, f_and_b, f_and_n, f_or_b, f_or_c, f_or_d, f_or_i:
		if err := expectArgs(2); err != nil {
			return nil, err
		}
	case f_thresh, f_multi:
		if len(node.args) < 2 {
			return nil, fmt.Errorf("%s must have at least two arguments", node.identifier)
		}
		_k := node.args[0]
		if len(_k.args) > 0 {
			return nil, fmt.Errorf("argument of %s must not contain subexpressions", node.identifier)
		}
		k, err := strconv.ParseUint(_k.identifier, 10, 64)
		if err != nil {
			return nil, fmt.Errorf(
				"%s(k, ...) => k must be an integer, but got: %s", node.identifier, _k.identifier)
		}
		_k.num = k
		numSubs := len(node.args) - 1
		if k < 1 || k > uint64(numSubs) {
			return nil, fmt.Errorf(
				"%s(k) -> k must 1 ≤ k ≤ n, but got: %s", node.identifier, _k.identifier)
		}
		if node.identifier == f_multi {
			// 一个 multisig 可以拥有的最大公钥数量。
			const multisigMaxKeys = 20
			if numSubs > multisigMaxKeys {
				return nil, fmt.Errorf("number of multisig keys cannot exceed %d", multisigMaxKeys)
			}
			// Multisig 的密钥是一种变量，无法拥有子表达式。
			for _, arg := range node.args {
				if len(arg.args) > 0 {
					return nil, fmt.Errorf("arguments of %s must not contain subexpressions", node.identifier)
				}
			}
		}
	default:
		return nil, fmt.Errorf("unrecognized identifier: %s", node.identifier)
	}
	return node, nil
}
```

有了这些检查，我们已经可以排除大部分的无效 Miniscript 了。我们来看一些案例：

```go
func main() {
	for _, expr := range []string{
		"invalid",
		"pk(key1,tooManyArgs)",
		"pk(key1(0))",
		"and_v(0)",
		"after(notANumber)",
		"after(-1)",
		"multi(0,k1)",
		"multi(2,k1)",
		"multi(1,k1,k2,k3,k4,k5,k6,k7,k8,k9,k10,k11,k12,k13,k14,k15,k16,k17,k18,k19,k20,k21)",
	} {
		_, err := Parse(expr)
		fmt.Println(expr, " -- ", err)
	}
}
```

输出：

```
invalid  --  unrecognized identifier: invalid
pk(key1,tooManyArgs)  --  pk expects 1 arguments, got 2
pk(key1(0))  --  argument of pk must not contain subexpressions
and_v(0)  --  and_v expects 2 arguments, got 1
after(notANumber)  --  after(k) => k must be an unsigned integer, but got: notANumber
after(-1)  --  after(k) => k must be an unsigned integer, but got: -1
multi(0,k1)  --  multi(k) -> k must 1 ≤ k ≤ n, but got: 0
multi(2,k1)  --  multi(k) -> k must 1 ≤ k ≤ n, but got: 2
multi(1,k1,k2,k3,k4,k5,k6,k7,k8,k9,k10,k11,k12,k13,k14,k15,k16,k17,k18,k19,k20,k21)  --  number of multisig keys cannot exceed 20
```

[点击此处，在线上 Go 环境中运行代码](https://go.dev/play/p/G395mI5kd_u)

## 第三步：展开封装器

[点击此处，在线上 Go 环境中运行代码](https://go.dev/play/p/2R2S9ZEty-B)

每一个片段都可以被封装器封起来，封装器使用冒号 “:” 表明。例子来自[此处](https://bitcoin.sipa.be/miniscript/:)。

`dv:older(144)` 表示 d: 封装器应用在了 v: 封装器上，而 v: 封装器用来封装参数为 144 区块的 `older` 片段。

在解析器的下一个阶段，我们希望同时对封装器操作，因为它们的动作跟普通的片段一样：它们可以映射成 Bitcoin Script，也有自己的正确性规则，等等。一句话，`dv:older(144)` 就只是 `d(v(older(144)))` 的语法糖。

在这个案例中，我们希望将 AST 从这样：

```
dv:older
└──144
```

变成这样：

```
d
└──v
   └──older
          └──144
```

为了执行这种转化，我们要把这个函数加入转化列表。注意，我们按反序迭代封装器中的字母，因为它们是从右到左使用的。

```go
// expandWrappers 应用在封装器（引号以前的字母）上，例如 `ascd:X` =>
// `a(s(c(d(X))))`.
func expandWrappers(node *AST) (*AST, error) {
	const allWrappers = "asctdvjnlu"

	wrappers := []rune(node.wrappers)
	node.wrappers = ""
	for i := len(wrappers) - 1; i >= 0; i-- {
		wrapper := wrappers[i]
		if !strings.ContainsRune(allWrappers, wrapper) {
			return nil, fmt.Errorf("unknown wrapper: %s", string(wrapper))
		}
		node = &AST{identifier: string(wrapper), args: []*AST{node}}
	}
	return node, nil
}
```

[点击此处，在线上 Go 环境中运行代码](https://go.dev/play/p/2R2S9ZEty-B)

## 第四步：解开糖衣

[点击此处，在线上 Go 环境中运行代码](https://go.dev/play/p/W8VAwipFvue)

Miniscript 定义了 6 种语法糖。如果一个 Miniscript 片段包含了下列等式的坐标的表达式，那么这些表达式可以换成等号右边的表达式。为了节约在后续阶段处理这 6 种片段的功夫，我们添加一种去除糖衣的转化函数，替代这些表达式。

替代关系如下：

```
pk(key) = c:pk_k(key)
pkh(key) = c:pk_h(key)
and_n(X,Y) = andor(X,Y,0)
t:X = and_v(X,1)
l:X = or_i(0,X)
u:X = or_i(X,0)
```

现在，我们恰好可以使用我们一开始在封装器片段中定义的标识符，来扩充这个列表：

```go
const (
	// [...]
	f_wrap_a    = "a"         // a:X
	f_wrap_s    = "s"         // s:X
	f_wrap_c    = "c"         // c:X
	f_wrap_d    = "d"         // d:X
	f_wrap_v    = "v"         // v:X
	f_wrap_j    = "j"         // j:X
	f_wrap_n    = "n"         // n:X
	f_wrap_t    = "t"         // t:X = and_v(X,1)
	f_wrap_l    = "l"         // l:X = or_i(0,X)
	f_wrap_u    = "u"         // u:X = or_i(X,0))
)
```

转化函数将变成这样：

```go
// desugar 使用最终的形式替换了语法糖
func desugar(node *AST) (*AST, error) {
	switch node.identifier {
	case f_pk: // pk(key) = c:pk_k(key)
		return &AST{
			identifier: f_wrap_c,
			args: []*AST{
				{
					identifier: f_pk_k,
					args:       node.args,
				},
			},
		}, nil
	case f_pkh: // pkh(key) = c:pk_h(key)
		return &AST{
			identifier: f_wrap_c,
			args: []*AST{
				{
					identifier: f_pk_h,
					args:       node.args,
				},
			},
		}, nil
	case f_and_n: // and_n(X,Y) = andor(X,Y,0)
		return &AST{
			identifier: f_andor,
			args: []*AST{
				node.args[0],
				node.args[1],
				{identifier: f_0},
			},
		}, nil
	case f_wrap_t: // t:X = and_v(X,1)
		return &AST{
			identifier: f_and_v,
			args: []*AST{
				node.args[0],
				{identifier: f_1},
			},
		}, nil
	case f_wrap_l: // l:X = or_i(0,X)
		return &AST{
			identifier: f_or_i,
			args: []*AST{
				{identifier: f_0},
				node.args[0],
			},
		}, nil
	case f_wrap_u: // u:X = or_i(X,0)
		return &AST{
			identifier: f_or_i,
			args: []*AST{
				node.args[0],
				{identifier: f_0},
			},
		}, nil
	}

	return node, nil
}
```

我们尝试所有这些方法，并运用视觉检查：

```go
func main() {
	for _, expr := range []string{
		"pk(key)",
		"pkh(key)",
		"and_n(pk(key),sha256(H))",
		"tv:pk(key)",
		"l:pk(key)",
		"u:pk(key)",
	} {
		node, err := Parse(expr)
		if err != nil {
			panic(err)
		}
		fmt.Printf("Tree for \"%v\"\n", expr)
		fmt.Println(node.DrawTree())
	}
}
```

从下面的输出可知，去除糖衣的函数奏效了：

```
Tree for "pk(key)"
c
└──pk_k
      └──key

Tree for "pkh(key)"
c
└──pk_h
      └──key

Tree for "and_n(pk(key),sha256(H))"
andor
├──c
|  └──pk_k
|        └──key
├──sha256
|       └──H
└──0

Tree for "tv:pk(key)"
and_v
├──v
|  └──c
|     └──pk_k
|           └──key
└──1

Tree for "l:pk(key)"
or_i
├──0
└──c
   └──pk_k
         └──key

Tree for "u:pk(key)"
or_i
├──c
|  └──pk_k
|        └──key
└──0
```

[点击此处，在线上 Go 环境中运行代码](https://go.dev/play/p/W8VAwipFvue)

## 第五步：类型检查

[点击此处，在线上 Go 环境中运行代码](https://go.dev/play/p/Lv9uAvZqlZw)

并非所有片段都能相互组合：有些组合无法产生有效的比特币脚本和有效的见证数据。

但是，因为 Miniscript 表达式和片段是充分结构化、层级式的，所以我们容易静态分析一段 Miniscript 表达式是否在所有条件下都有效。

举个例子，`or_b(pk(key1),pk(key2))` 和 `or_b(v:pk(key1),v:pk(key2))` 不是有效的组合，但 `or_b(pk(key1),s:pk(key2))` 是有效的。

根据 [Miniscript 规范](https://bitcoin.sipa.be/miniscript/)，每一种片段都可能是四种基础类型  `B`、`V`、`K` 和 `W` 之一；每一种片段都可以有额外的类型特性（`z`、`o`、`n`、`d` 和 `u`）。

元件片段（不能包含任何子表达式的片段）拥有固定的基础类型和固定的类型特性。举个例子，哈希函数片段 `sha256(h)` 会被转化成比特币脚本 `SIZE <32> EQUALVERIFY SHA256 <h> EQUAL`，可以使用见证数据 `<32 byte preimage>` 来满足（其中的数值满足 `sha256(preimage)=h`），它的类型为 `Bondu`，意思是：

- `B`：成功时，向堆栈推入非零值；失败时推入准确的 0 值。消耗栈顶的元素（如果有的话）。
- `o`：消耗一个对战元素（在这个例子中就是那个原像）
- `n`：非零属性 —— 不能用 0 来满足。`sha256(h)` 的正确原像必须是 32 字节长，所以无法是 0。
- `d`：可以无条件地避开。在 `sha256()` 这个例子中，任何 32 字节但并非真正原像的数据都是无效的，这总是可以构造出来的。注意，非 32 字节的值不是有效的避开，因为它会在 `EQUALVERIFY` 的时候导致脚本执行终止，而不是继续执行。
- `u`：在满足的时候，会向堆栈推入 1。

基本的类型和类型属性是精心定义的，以保证组合出来的片段的正确性。这些属性可以根据脚本和见证数据的推理，分配给每一种片段。类似地，对于包含子表达式的片段，例如 `and_b(X,Y)`，你可以分析 `X` 和 `Y` 必须满足什么样类型，以及 `and_b(X,Y)` 自身必须具备什么样的衍生类型和属性。幸运的是，Miniscript 的作者已经完成了这部分工作，而且已经在[规范](https://bitcoin.sipa.be/miniscript/)中记录了正确性表格。

顶层的片段必须具备类型 `B`，否则这个片段就是无效的。

我们使用基本的类型和类型属性来扩充我们的 AST：

```go
type basicType string

const (
	typeB basicType = "B"
	typeV basicType = "V"
	typeK basicType = "K"
	typeW basicType = "W"
)

type properties struct {
	// Basic type properties
	z, o, n, d, u bool
}

func (p properties) String() string {
	s := strings.Builder{}
	if p.z {
		s.WriteRune('z')
	}
	if p.o {
		s.WriteRune('o')
	}
	if p.n {
		s.WriteRune('n')
	}
	if p.d {
		s.WriteRune('d')
	}
	if p.u {
		s.WriteRune('u')
	}
	return s.String()
}

// AST is the abstract syntax tree representing a Miniscript expression.
type AST struct {
	basicType  basicType
	props      properties
	wrappers   string
	identifier string
	// Parsed integer for when identifer is a expected to be a number, i.e. the first argument of
	// older/after/multi/thresh. Otherwise unused.
	num uint64
	args      []*AST
}

// typeRepr returns the basic type (B, V, K or W) followed by all type properties.
func (a *AST) typeRepr() string {
	return fmt.Sprintf("%s%s", a.basicType, a.props)
}
```

然后，我们加入另一个函数来遍历整棵树。这个函数将检查子表达式的类型要求，并根据规范的正确性表格设定类型和类型属性。

由于这个函数非常长，我们就仅展示它处理少数片段的简缩版本，仅演示它是如何工作的。片段类型既跟元件有关，也跟参数有关。它根据规范中的表格直接编码类型规则。举个例子，为使 `s:X` 是有效的，`X` 必须是类型 `Bo`；而整个片段将具有类型 `W`，并获得 `X` 的 `d` 和 `u` 属性。

你可以在[线上环境](https://go.dev/play/p/Lv9uAvZqlZw)中看到和运行能够处理每一种片段的完整版本。

```go
// expectBasicType is a helper function to check that this node has a specific type.
func (a *AST) expectBasicType(typ basicType) error {
	if a.basicType != typ {
		return fmt.Errorf("expression `%s` expected to have type %s, but is type %s",
			a.identifier, typ, a.basicType)
	}
	return nil
}

func typeCheck(node *AST) (*AST, error) {
	switch node.identifier {
	case f_0:
		node.basicType = typeB
		node.props.z = true
		node.props.u = true
		node.props.d = true
	// [...]
	case f_pk_k:
		node.basicType = typeK
		node.props.o = true
		node.props.n = true
		node.props.d = true
		node.props.u = true
	// [...]
	case f_or_d:
		_x, _z := node.args[0], node.args[1]
		if err := _x.expectBasicType(typeB); err != nil {
			return nil, err
		}
		if !_x.props.d || !_x.props.u {
			return nil, fmt.Errorf(
				"wrong properties on `%s`, the first argument of `%s`", _x.identifier, node.identifier)
		}
		if err := _z.expectBasicType(typeB); err != nil {
			return nil, err
		}
		node.basicType = typeB
		node.props.z = _x.props.z && _z.props.z
		node.props.o = _x.props.o && _z.props.z
		node.props.d = _z.props.d
		node.props.u = _z.props.u
	// [...]
	case f_wrap_s:
		_x := node.args[0]
		if err := _x.expectBasicType(typeB); err != nil {
			return nil, err
		}
		if !_x.props.o {
			return nil, fmt.Errorf(
				"wrong properties on `%s`, the first argument of `%s`", _x.identifier, node.identifier)
		}
		node.props.d = _x.props.d
		node.props.u = _x.props.u
	// [...]
	}
	return node, nil
}
```

现在，我们已经推导出了所有的类型和类型属性，我们也需要将顶层表达式必须具有类型 `B` 的检查加入最终检查中：

```go
func Parse(miniscript string) (*AST, error) {
	node, err := createAST(miniscript)
	if err != nil {
		return nil, err
	}
	for _, transform := range []func(*AST) (*AST, error){
		argCheck,
		expandWrappers,
		desugar,
		typeCheck,
		// More stages to come
	} {
		node, err = node.apply(transform)
		if err != nil {
			return nil, err
		}
	}
	// Top-level expression must be of type "B".
	if err := node.expectBasicType(typeB); err != nil {
		return nil, err
	}
	return node, nil
}
```

我们用有效和无效的 Miniscript 片段来检验一下：

```go
func main() {
	expr := "or_b(pk(key1),s:pk(key2))"
	node, err := Parse(expr)
	if err == nil {
		fmt.Println("miniscript valid:", expr)
		fmt.Println(node.DrawTree())
	}
	for _, expr := range []string{"pk_k(key)", "or_b(pk(key1),pk(key2))"} {
		_, err = Parse(expr)
		fmt.Println("miniscript invalid:", expr, "-", err)
	}
}
```

成功！输出是这样的：

```
miniscript valid: or_b(pk(key1),s:pk(key2))
or_b [Bdu]
├──c [Bondu]
|  └──pk_k [Kondu]
|        └──key1
└──s [Wdu]
   └──c [Bondu]
      └──pk_k [Kondu]
            └──key2

miniscript invalid: pk_k(key) - expression `pk_k` expected to have type B, but is type K
miniscript invalid: or_b(pk(key1),pk(key2)) - expression `c` expected to have type W, but is type B
```

（我们修改了 `draw()` 函数，以在每个片段旁边展示其类型。）

[点击此处，在线上 Go 环境中运行代码](https://go.dev/play/p/Lv9uAvZqlZw)

## 第六步：产生比特币脚本

我们还没有实现能够拒绝所有无效 Miniscript 片段的检查，但现在，可以实验一下用它来生成比特币脚本了。

[规范](https://bitcoin.sipa.be/miniscript/)中的转换表定义了 Miniscript 碎片如何映射成比特币脚本。举个例子，`and_b(X, Y)` 映射成 `[X] [Y] BOOLAND`，等等。

我们会先制作一个函数，它会创建一个可以直接阅读的脚本的字符串表示，就像那张转换表一样。这换我们容易制作出原型并消除 bug，因为你可以容易检查输出。实际的脚本是一串字节，我们后面会实现的。

我们加入这个函数，根据转换表将每一种片段映射成脚本：

```go
func scriptStr(node *AST) string {
	switch node.identifier {
	case f_0, f_1:
		return node.identifier
	case f_pk_k:
		return fmt.Sprintf("<%s>", node.args[0].identifier)
	case f_pk_h:
		return fmt.Sprintf("DUP HASH160 <HASH160(%s)> EQUALVERIFY", node.args[0].identifier)
	case f_older:
		return fmt.Sprintf("<%s> CHECKSEQUENCEVERIFY", node.args[0].identifier)
	case f_after:
		return fmt.Sprintf("<%s> CHECKLOCKTIMEVERIFY", node.args[0].identifier)
	case f_sha256, f_hash256, f_ripemd160, f_hash160:
		return fmt.Sprintf(
			"SIZE <32> EQUALVERIFY %s <%s> EQUAL",
			strings.ToUpper(node.identifier),
			node.args[0].identifier)
	case f_andor:
		return fmt.Sprintf("%s NOTIF %s ELSE %s ENDIF",
			scriptStr(node.args[0]),
			scriptStr(node.args[2]),
			scriptStr(node.args[1]),
		)
	case f_and_v:
		return fmt.Sprintf("%s %s",
			scriptStr(node.args[0]),
			scriptStr(node.args[1]))
	case f_and_b:
		return fmt.Sprintf("%s %s BOOLAND",
			scriptStr(node.args[0]),
			scriptStr(node.args[1]),
		)
	case f_or_b:
		return fmt.Sprintf("%s %s BOOLOR",
			scriptStr(node.args[0]),
			scriptStr(node.args[1]),
		)
	case f_or_c:
		return fmt.Sprintf("%s NOTIF %s ENDIF",
			scriptStr(node.args[0]),
			scriptStr(node.args[1]),
		)
	case f_or_d:
		return fmt.Sprintf("%s IFDUP NOTIF %s ENDIF",
			scriptStr(node.args[0]),
			scriptStr(node.args[1]),
		)
	case f_or_i:
		return fmt.Sprintf("IF %s ELSE %s ENDIF",
			scriptStr(node.args[0]),
			scriptStr(node.args[1]),
		)
	case f_thresh:
		s := []string{}
		for i := 1; i < len(node.args); i++ {
			s = append(s, scriptStr(node.args[i]))
			if i > 1 {
				s = append(s, "ADD")
			}
		}

		s = append(s, node.args[0].identifier)
		s = append(s, "EQUAL")
		return strings.Join(s, " ")
	case f_multi:
		s := []string{node.args[0].identifier}
		for _, arg := range node.args[1:] {
			s = append(s, fmt.Sprintf("<%s>", arg.identifier))
		}
		s = append(s, fmt.Sprint(len(node.args)-1))
		s = append(s, "CHECKMULTISIG")
		return strings.Join(s, " ")
	case f_wrap_a:
		return fmt.Sprintf("TOALTSTACK %s FROMALTSTACK", scriptStr(node.args[0]))
	case f_wrap_s:
		return fmt.Sprintf("SWAP %s", scriptStr(node.args[0]))
	case f_wrap_c:
		return fmt.Sprintf("%s CHECKSIG",
			scriptStr(node.args[0]))
	case f_wrap_d:
		return fmt.Sprintf("DUP IF %s ENDIF",
			scriptStr(node.args[0]))
	case f_wrap_v:
		return fmt.Sprintf("%s VERIFY", scriptStr(node.args[0]))
	case f_wrap_j:
		return fmt.Sprintf("SIZE 0NOTEQUAL IF %s ENDIF",
			scriptStr(node.args[0]))
	case f_wrap_n:
		return fmt.Sprintf("%s 0NOTEQUAL",
			scriptStr(node.args[0]))
	default:
		return "<unknown>"
	}
}
```

试一试：

[在线上环境中运行](https://go.dev/play/p/MDqSTYvBB9p)

```go
func main() {
	node, err := Parse("or_d(pk(pubkey1),and_v(v:pk(pubkey2),older(52560)))")
	if err != nil {
		panic(err)
	}
	fmt.Println(scriptStr(node))
}
```

输出：

```
<pubkey1> CHECKSIG IFDUP NOTIF <pubkey2> CHECKSIG VERIFY <52560> CHECKSEQUENCEVERIFY ENDIF
```

这是正确的，但还有一处需要优化。`v:X` 封装器会映射成 `[X] VERIFY`。操作符 `EQUALVERIFY`、`CHECKSIGVERIFY` 和 `CHECKMULTISIGVERIFY` 分别是 `EQUAL VERIFY`、`CHECKSIG VERIFY` 和 `CHECKMULTISIG VERIFY` 的缩写，所以在上述脚本中，`CHECKSIG VERIFY` 应该被缩写成 `CHECKSIGVERITY`，以在脚本中节省一个字节。

如果在 `v:X` 中，`[X]` 的最后一个操作符是 `EQUAL`/`CHECKSIG`/`CHECKMULTISIG`，可以替换成 `VERITY` 版本。

因为 `X` 可以是任意的表达式，我们需要另一次树遍历来确定每个片段的最后一个操作符是否是上述三者之一。

我们把这个属性加入属性结构体中：

```go
type properties struct {
	// Basic type properties
	z, o, n, d, u bool

	// Check if the rightmost script byte produced by this node is OP_EQUAL, OP_CHECKSIG or
	// OP_CHECKMULTISIG.
	//
	// If so, it can be be converted into the VERIFY version if an ancestor is the verify wrapper
	// `v`, i.e. OP_EQUALVERIFY, OP_CHECKSIGVERIFY and OP_CHECKMULTISIGVERIFY instead of using two
	// opcodes, e.g. `OP_EQUAL OP_VERIFY`.
	canCollapseVerify bool
}
```

而且，这个函数为每一个片段设置了这个字段，我们需要添加到转化函数列表中：

```go
func canCollapseVerify(node *AST) (*AST, error) {
	switch node.identifier {
	case f_sha256, f_ripemd160, f_hash256, f_hash160, f_thresh, f_multi, f_wrap_c:
		node.props.canCollapseVerify = true
	case f_and_v:
		node.props.canCollapseVerify = node.args[1].props.canCollapseVerify
	case f_wrap_s:
		node.props.canCollapseVerify = node.args[0].props.canCollapseVerify
	}
	return node, nil
}
```

`and_v` 片段和 `s-` 封装器是仅有的可以把子表达式作为结尾的可组合片段：`and_v(X,Y) => [X] [Y]` 和 `s:X => SWAP [X]`，所以，它们会直接获得来自子节点的特性。脚本中的哈希片段和 `thresh`/`multi`/`c` 最终都会以 `EQUAL`/`CHECKSIG`/`CHECKMULTISIG` 结尾，例如 `c:X => [X] CHECKSIG`。这些是将被分解为这些操作符的 `VERIFY` 版本的候选。

然后，我们可以修改我们的`scriptStr` 函数，在允许的时候使用操作符的 `VERIFY` 版本。为了简洁，我们只在下面展示了两种情形。你可以在[这个网站](https://go.dev/play/p/8vgjWXV3CJ1)上看到和运行完整的版本。

```go
// collapseVerify is true if the `v` wrapper (VERIFY wrapper) is an ancestor of the node. If so, the
// two opcodes `OP_CHECKSIG VERIFY` can be collapsed into one opcode `OP_CHECKSIGVERIFY` (same for
// OP_EQUAL and OP_CHECKMULTISIG).
func scriptStr(node *AST, collapseVerify bool) string {
	switch node.identifier {
 	// [...]
	case f_wrap_c:
		opVerify := "CHECKSIG"
		if node.props.canCollapseVerify && collapseVerify {
			opVerify = "CHECKSIGVERIFY"
		}
		return fmt.Sprintf("%s %s",
			scriptStr(node.args[0], collapseVerify),
			opVerify,
		)
 	// [...]
	case f_wrap_v:
		s := scriptStr(node.args[0], true)
		if !node.args[0].props.canCollapseVerify {
			s += " VERIFY"
		}
		return s

}
```

使用修改后的函数运行程序，你会得到这样的输出：

```
<pubkey1> CHECKSIG IFDUP NOTIF <pubkey2> CHECKSIGVERIFY <52560> CHECKSEQUENCEVERIFY ENDIF
```

成功将 `CHECKSIG VERITY` 简化为 `CHECKSIGVERIFY`。

## 第七步：生成收款地址

[点击此处，在线上 Go 环境中运行代码](https://go.dev/play/p/KOW8OcfGspY)

在上一个接种，我们为比特币脚本创建了一个可读的表示。为了生成一个 P2WSH 地址，我们需要开发出实际的、作为字节序列的脚本，然后编码成一个地址。

为此，我们先要将公钥和哈希值变量替换成真实的公钥和哈希值。我们为 AST 增加一个新的字段：`value`。

```go
type AST struct {
	// [...]
	identifier string
	// For key arguments, this will be the 33 bytes compressed pubkey.
	// For hash arguments, this will be the 32 bytes (sha256, hash256) or 20 bytes (ripemd160, hash160) hash.
	value []byte
	args  []*AST
}
```

现在，我们可以增加一个新的函数 `ApplyVars`，它会将 Miniscript 表达式中的所有变量都替换成真实的数值。调用者可以提供一个回调函数来提供这些数值。

Miniscript 也指明公钥不可重复（可以简化脚本的分析），所以我们要检查复制。

```go
// ApplyVars replaces key and hash values in the miniscript.
//
// The callback should return `nil, nil` if the variable is unknown. In this case, the identifier
// itself will be parsed as the value (hex-encoded pubkey, hex-encoded hash value).
func (a *AST) ApplyVars(lookupVar func(identifier string) ([]byte, error)) error {
	// Set of all pubkeys to check for duplicates
	allPubKeys := map[string]struct{}{}

	_, err := a.apply(func(node *AST) (*AST, error) {
		switch node.identifier {
		case f_pk_k, f_pk_h, f_multi:
			var keyArgs []*AST
			if node.identifier == f_multi {
				keyArgs = node.args[1:]
			} else {
				keyArgs = node.args[:1]
			}
			for _, arg := range keyArgs {
				key, err := lookupVar(arg.identifier)
				if err != nil {
					return nil, err
				}
				if key == nil {
					// If the key was not a variable, assume it's the key value directly encoded as
					// hex.
					key, err = hex.DecodeString(arg.identifier)
					if err != nil {
						return nil, err
					}
				}
				if len(key) != pubKeyLen {
					return nil, fmt.Errorf("pubkey argument of %s expected to be of size %d, but got %d",
						node.identifier, pubKeyLen, len(key))
				}

				pubKeyHex := hex.EncodeToString(key)
				if _, ok := allPubKeys[pubKeyHex]; ok {
					return nil, fmt.Errorf(
						"duplicate key found at %s (key=%s, arg identifier=%s)",
						node.identifier, pubKeyHex, arg.identifier)
				}
				allPubKeys[pubKeyHex] = struct{}{}

				arg.value = key
			}
		case f_sha256, f_hash256, f_ripemd160, f_hash160:
			arg := node.args[0]
			hashLen := map[string]int{
				f_sha256:    32,
				f_hash256:   32,
				f_ripemd160: 20,
				f_hash160:   20,
			}[node.identifier]
			hashValue, err := lookupVar(arg.identifier)
			if err != nil {
				return nil, err
			}
			if hashValue == nil {
				// If the hash value was not a variable, assume it's the hash value directly encoded
				// as hex.
				hashValue, err = hex.DecodeString(node.args[0].identifier)
				if err != nil {
					return nil, err
				}
			}
			if len(hashValue) != hashLen {
				return nil, fmt.Errorf("%s len must be %d, got %d", node.identifier, hashLen, len(hashValue))
			}
			arg.value = hashValue
		}
		return node, nil
	})
	return err
}
```

看看它的实际情况：

```go
func main() {
	node, err := Parse("or_d(pk(pubkey1),and_v(v:pk(pubkey2),older(52560)))")
	if err != nil {
		panic(err)
	}
	unhex := func(s string) []byte {
		b, _ := hex.DecodeString(s)
		return b
	}

	// Two arbitrary pubkeys.
	_, pubKey1 := btcec.PrivKeyFromBytes(
		unhex("2c3931f593f26037a8b8bf837363831b18bbfb91a712dd9d862db5b9b06dc5df"))
	_, pubKey2 := btcec.PrivKeyFromBytes(
		unhex("f902f94da618721e516d0a2a2666e2ec37079aaa184ee5a2c00c835c5121b3eb"))

	err = node.ApplyVars(func(identifier string) ([]byte, error) {
		switch identifier {
		case "pubkey1":
			return pubKey1.SerializeCompressed(), nil
		case "pubkey2":
			return pubKey2.SerializeCompressed(), nil
		}
		return nil, nil
	})
	if err != nil {
		panic(err)
	}
	fmt.Println(node.DrawTree())
}
```

输出，公钥已成功替换：

```
or_d [B]
├──c [Bonduv]
|  └──pk_k [Kondu]
|        └──pubkey1 [03469d685c3445e83ee6e3cfb30382795c249c91955523c25f484d69379c7a7d6f]
└──and_v [Bon]
       ├──v [Von]
       |  └──c [Bonduv]
       |     └──pk_k [Kondu]
       |           └──pubkey2 [03ba991cc359438fdd8cf43e3cf7894f90cf4d0e040314a6bba82963fa77b7a434]
       └──older [Bz]
              └──52560
```

（我们修改 `drawTree()` 函数，以在每个变量旁边显示实际数值。）

有了这个绝妙的 [btcd](https://github.com/btcsuite/btcd) 库的帮助，我们现在可以构建出实际的脚本了。它看起来非常像上面的 `scriptStr()`，但将它编码成了一个字节串，关注于将整数和数据推入堆栈的实际问题。我们在这里使用了一个缩减版本。完整版本可见[这个网站](https://go.dev/play/p/KOW8OcfGspY)。

```go
// Script creates the witness script from a parsed miniscript.
func (a *AST) Script() ([]byte, error) {
	b := txscript.NewScriptBuilder()
	if err := buildScript(a, b, false); err != nil {
		return nil, err
	}
	return b.Script()
}

// collapseVerify is true if the `v` wrapper (VERIFY wrapper) is an ancestor of the node. If so, the
// two opcodes `OP_CHECKSIG VERIFY` can be collapsed into one opcode `OP_CHECKSIGVERIFY` (same for
// OP_EQUAL and OP_CHECKMULTISIGVERIFY).
func buildScript(node *AST, b *txscript.ScriptBuilder, collapseVerify bool) error {
	switch node.identifier {
	case f_0:
		b.AddOp(txscript.OP_FALSE)
	case f_1:
		b.AddOp(txscript.OP_TRUE)
	case f_pk_h:
		arg := node.args[0]
		key := arg.value
		if key == nil {
			return fmt.Errorf("empty key for %s (%s)", node.identifier, arg.identifier)
		}
		b.AddOp(txscript.OP_DUP)
		b.AddOp(txscript.OP_HASH160)
		b.AddData(btcutil.Hash160(key))
		b.AddOp(txscript.OP_EQUALVERIFY)
	case f_older:
		b.AddInt64(int64(node.args[0].num))
		b.AddOp(txscript.OP_CHECKSEQUENCEVERIFY)
	case f_after:
		b.AddInt64(int64(node.args[0].num))
		b.AddOp(txscript.OP_CHECKLOCKTIMEVERIFY)
	case f_and_b:
		if err := buildScript(node.args[0], b, collapseVerify); err != nil {
			return err
		}
		if err := buildScript(node.args[1], b, collapseVerify); err != nil {
			return err
		}
		b.AddOp(txscript.OP_BOOLAND)
	case f_wrap_c:
		if err := buildScript(node.args[0], b, collapseVerify); err != nil {
			return err
		}
		if node.props.canCollapseVerify && collapseVerify {
			b.AddOp(txscript.OP_CHECKSIGVERIFY)
		} else {
			b.AddOp(txscript.OP_CHECKSIG)
		}
	case f_wrap_v:
		if err := buildScript(node.args[0], b, true); err != nil {
			return err
		}
		if !node.args[0].props.canCollapseVerify {
			b.AddOp(txscript.OP_VERIFY)
		}
	// More cases [...]
	default:
		return fmt.Errorf("unknown identifier: %s", node.identifier)
	}
	return nil
}
```

运行它吧：

```go
func main() {
	// [...]
	script, err := node.Script()
	if err != nil {
		panic(err)
	}
	fmt.Println("Script", hex.EncodeToString(script))
}
```

输出：

```
Script 2103469d685c3445e83ee6e3cfb30382795c249c91955523c25f484d69379c7a7d6fac73642103ba991cc359438fdd8cf43e3cf7894f90cf4d0e040314a6bba82963fa77b7a434ad0350cd00b268
```

根据 [BIP141](https://github.com/bitcoin/bips/blob/master/bip-0141.mediawiki) 和 [BIP173](https://github.com/bitcoin/bips/blob/master/bip-0173.mediawiki)，P2WSH 地址应该是 `0 <sha256(script)>` 的 bech32 编码，其中 `0` 表示隔离见证版本 0。我们将使用这个 btcd 库来帮助我们创建地址：

```go
addr, err := btcutil.NewAddressWitnessScriptHash(chainhash.HashB(script), &chaincfg.TestNet3Params)
if err != nil {
   	panic(err)
}
fmt.Println("Address:", addr.String())
```

我们的测试网收款地址准备好了：

```
Address: tb1q4q3cw0mausmamm7n7fn2phh0fpca4n0vmkc7rdh6hxnkz9rd8l0qcpefrj
```

这个地址收到的资金将使用花费条件 `or_d(pk(pubkey1),and_v(v:pk(pubkey2),older(52560)))` 锁定，即，公钥 1 可以随时花费；公钥 2 可以在资金进入这个地址的 52560 个区块（大约一年）后花费。

[点击此处，在线上 Go 环境中运行代码](https://go.dev/play/p/KOW8OcfGspY)

## 结论

评论是，我们已经创建了一个 Miniscript 代码库，可以解析 Miniscript 表达式并执行类型检查，并生成收款地址。

还有很多情形需要考虑。在下一篇文章中，我们将学习如何根据 Miniscript 表达式生成见证数据，从而可以花费资金；如何保证 Miniscript 遵守比特币的共识以及标准，例如脚本的体积和操作符限制。

如果你希望这个系列继续，请在 Twitter 上告诉我：[@_benma_](https://twitter.com/_benma_)。

