---
layout: post
title:  " Leetcode Easy 100题计划（一）"
date:   2020-10-31 16:29:10 +0800
categories:  算法&DS
tags: 算法  数据结构
author: Hu#
typora-root-url: ..
---

* content
{:toc}


## 练个手

### 1、No.1 两数之和

【题目】

给定一个整数数组 `nums` 和一个目标值 `target`，请你在该数组中找出和为目标值的那 **两个** 整数，并返回他们的数组下标。

你可以假设每种输入只会对应一个答案。但是，数组中同一个元素不能使用两遍。

**示例:**

```
给定 nums = [2, 7, 11, 15], target = 9

因为 nums[0] + nums[1] = 2 + 7 = 9
所以返回 [0, 1]
```

【解析】

采用 HashMap  降低时间复杂度
遍历数组 nums，i 为当前下标，每个值都判断 map 中是否存在 target-nums[i] 的 key 值
如果存在则找到了两个值，如果不存在则将当前的 (nums[i],i) 存入 map 中，继续遍历直到找到为止
如果最终都没有结果则抛出异常。

代码实现

```java
class Solution {

	public int[] twoSum(int[] nums, int target) {
        Map<Integer, Integer> map = new HashMap<>();
        for (int i = 0; i < nums.length; i++) {
            if(map.containsKey(target - nums[i])) {
                return new int[]{map.get(target-nums[i]), i};
            }
            map.put(nums[i], i);
        }
        return null;
}  
```





### 2、No.7 整数反转

给出一个 32 位的有符号整数，你需要将这个整数中每位上的数字进行反转。

**示例 1:**

```
输入: 123
输出: 321
```

 **示例 2:**

```
输入: -123
输出: -321
```

**示例 3:**

```
输入: 1534236469
输出: 0
```

**注意:**

假设我们的环境只能存储得下 32 位的有符号整数，则其数值范围为 [−2^31, 2^31 − 1]。请根据这个假设，如果反转后整数溢出那么就返回 0。





代码实现

```java
class Solution {
    // 只能存储得下 32 位的有符号整数, 若翻转后溢出则输出 0 
    public int reverse(int x) {
        int res = 0;
        
        // (-123 % 10) = -3  (-123 / 10) = -12
        while(x != 0) {
            int tmp = x % 10;
            if(res > Integer.MAX_VALUE / 10 || (res == Integer.MAX_VALUE / 10 && tmp > Integer.MAX_VALUE % 10)) {
                return 0;
            }
            if(res < Integer.MIN_VALUE / 10 || (res == Integer.MIN_VALUE / 10 && tmp < Integer.MIN_VALUE % 10)) {
                return 0;
            }
            res = res * 10 + tmp;
        
            x = x / 10;
        }

        return res;
    }
}
```



### 3、No.9 回文数

【题目】

判断一个整数是否是回文数。回文数是指正序（从左向右）和倒序（从右向左）读都是一样的整数。

**示例 1:**

```
输入: 121
输出: true
```

**示例 2:**

```
输入: -121
输出: false
解释: 从左向右读, 为 -121 。 从右向左读, 为 121- 。因此它不是一个回文数。
```

【解析】

思路很简单，两种方法，

- 一个采用字符串方式，之前前后指针对比
- 一个采用数值方式，将回文串转换后进行数值对比

```java
    // 字符串方式
    public boolean isPalindrome_1(int x) {
        char[] xc = String.valueOf(x).toCharArray();
        int len = xc.length;

        for (int i = 0; i <= len / 2; i++) {
            int j = len - i - 1;
            if(xc[i] != xc[j]) 
                return false;
        }

        return true;
    }

    // 不转换为字符串
    // 那么就直接转换回文进行数值判断
    public boolean isPalindrome(int x) {
        if(x < 0) {
            return false;
        }

        int tmp = x;// 保存之前值
        int num = 0;
        while(x != 0) {
            num = num * 10 + x % 10;
            x /= 10;
        }
        return num == tmp;
    }
```



### 4、No.13 罗马数字转整数

【题目】

罗马数字包含以下七种字符: `I`， `V`， `X`， `L`，`C`，`D` 和 `M`。

```
字符          数值
I             1
V             5
X             10
L             50
C             100
D             500
M             1000
```

例如， 罗马数字 2 写做 `II` ，即为两个并列的 1。12 写做 `XII` ，即为 `X` + `II` 。 27 写做 `XXVII`, 即为 `XX` + `V` + `II` 。

通常情况下，罗马数字中小的数字在大的数字的右边。但也存在特例，例如 4 不写做 `IIII`，而是 `IV`。数字 1 在数字 5 的左边，所表示的数等于大数 5 减小数 1 得到的数值 4 。同样地，数字 9 表示为 `IX`。这个特殊的规则只适用于以下六种情况：

- `I` 可以放在 `V` (5) 和 `X` (10) 的左边，来表示 4 和 9。
- `X` 可以放在 `L` (50) 和 `C` (100) 的左边，来表示 40 和 90。 
- `C` 可以放在 `D` (500) 和 `M` (1000) 的左边，来表示 400 和 900。

给定一个罗马数字，将其转换成整数。输入确保在 1 到 3999 的范围内。

**示例 1:**

```
输入: "III"
输出: 3
```

**示例 2:**

```
输入: "IV"
输出: 4
```

**示例 3:**

```
输入: "MCMXCIV"
输出: 1994
解释: M = 1000, CM = 900, XC = 90, IV = 4.
```

 

代码实现

```java
    /*
    罗马数字由 I,V,X,L,C,D,M 构成；
    当小值在大值的左边，则减小值，如 IV=5-1=4；
    当小值在大值的右边，则加小值，如 VI=5+1=6；
            由上可知，右值永远为正，因此最后一位必然为正。
    */
    // 可以往后看多一位，对比当前位与后一位的大小关系，从而确定当前位是加还是减法。
    public int romanToInt(String s) {
        if(s == null || s.length() == 0) {
            return 0;
        } 
        
        int preNum = getValue(s.charAt(0)); 
        int res = 0;

        for (int i = 1; i < s.length(); i++) {
            int num = getValue(s.charAt(i));
            if(preNum < num) {
                res -= preNum;
            } else {
                res += preNum;
            }
            preNum = num;//更新 preNum
        }

        res += preNum;// 考虑到了s只有1位的特殊情况
        return res;
    }

    private int getValue(char ch) {
        switch(ch) {
            case 'I': return 1;
            case 'V': return 5;
            case 'X': return 10;
            case 'L': return 50;
            case 'C': return 100;
            case 'D': return 500;
            case 'M': return 1000;
            default: return 0;
        }
    }
```



### 5、No.14 最长公共前缀

【题目】

编写一个函数来查找字符串数组中的最长公共前缀。

如果不存在公共前缀，返回空字符串 `""`。

**示例 1:**

```
输入: ["flower","flow","flight"]
输出: "fl"
```

**示例 2:**

```
输入: ["dog","racecar","car"]
输出: ""
解释: 输入不存在公共前缀。
```

代码实现

```java
    public String longestCommonPrefix(String[] strs) {
        if(strs == null || strs.length == 0) {
            return "";
        }
        String res = strs[0];// res 保存最长公共前缀

        // 每一组进行对比
        for (int i = 1; i < strs.length; i++) {
            int j = 0;
            for (; j < res.length() && j < strs[i].length(); j++) {
                if(res.charAt(j) != strs[i].charAt(j)) {
                    break;
                }
            }
            res = res.substring(0, j);
            if(res.equals("")) 
                return res;
        }
        return res; 
    }
```





### 6、No.20 有效的括号

【题目】

给定一个只包括 `'('`，`')'`，`'{'`，`'}'`，`'['`，`']'` 的字符串，判断字符串是否有效。

有效字符串需满足：

1. 左括号必须用相同类型的右括号闭合。
2. 左括号必须以正确的顺序闭合。

注意空字符串可被认为是有效字符串。

**示例 1:**

```
输入: "([)]"
输出: false
```

**示例 2:**

```
输入: "{[]}"
输出: true
```

【解析】



代码实现

```java
class Solution {
    public boolean isValid(String s) {
        if(s == null || s.length() == 0) {
            return true;
        }
        if(s.length() % 2 != 0) {
            return false;
        }

        Stack<Character> stack = new Stack<>();
        stack.push('$');// 首先加一个预判符号， 用来作为 当栈为空时，遇到 ]}) 需要pop 的error情况
        for (Character c : s.toCharArray()) {
            if(map.containsKey(c)) {
                stack.push(c);
                continue;
            } 
            if(map.get(stack.peek()) == c) {
                stack.pop();
            } else {
                return false;
            }
        }
        
        return stack.peek() == '$';
    }

    private static final Map<Character, Character> map = new HashMap<>(){
        {put('(', ')');put('[', ']');put('{', '}');put('$', '$');}
    };
}
```





### 7、No.21 合并两个有序链表

将两个升序链表合并为一个新的 **升序** 链表并返回。新链表是通过拼接给定的两个链表的所有节点组成的。

**示例：**

```
输入：1->2->4, 1->3->4
输出：1->1->2->3->4->4
```

之前普通解法，很好理解，直接判等

```java
class Solution {
    public ListNode mergeTwoLists(ListNode l1, ListNode l2) {
        ListNode prehead = new ListNode(-1);
        ListNode prev = prehead;

        while(l1!=null && l2!=null){
            if(l1.val <= l2.val) {
            	prev.next = l1;
            	l1 = l1.next;
            }else {
				prev.next = l2;
				l2 = l2.next;
			}
            prev = prev.next;
        }

        if(l1==null)
        	prev.next = l2;
        else {
			prev.next = l1;
		}
        return prehead.next;
    }
}
```

递归版本

标签：链表、递归
这道题可以使用递归实现，新链表也不需要构造新节点，我们下面列举递归三个要素
终止条件：两条链表分别名为 l1 和 l2，当 l1 为空或 l2 为空时结束
返回值：每一层调用都返回排序好的链表头
本级递归内容：如果 l1 的 val 值更小，则将 l1.next 与排序好的链表头相接，l2 同理
O(m+n)O(m+n)O(m+n)，mmm 为 l1的长度，nnn 为 l2 的长度

```java
class Solution {
    public ListNode mergeTwoLists(ListNode l1, ListNode l2) {
        if(l1 == null) {
            return l2;
        }
        if(l2 == null) {
            return l1;
        }

        if(l1.val < l2.val) {
            l1.next = mergeTwoLists(l1.next, l2);
            return l1;
        } else {
            l2.next = mergeTwoLists(l1, l2.next);
            return l2;
        }
    }
}
```





### 8、No.26 删除排序数组重复元素

给定一个排序数组，你需要在**[ 原地](http://baike.baidu.com/item/原地算法)** 删除重复出现的元素，使得每个元素只出现一次，返回移除后数组的新长度。

不要使用额外的数组空间，你必须在 **[原地 ](https://baike.baidu.com/item/原地算法)修改输入数组** 并在使用 O(1) 额外空间的条件下完成。

 **示例**

```
给定 nums = [0,0,1,1,1,2,2,3,3,4],

函数应该返回新的长度 5, 并且原数组 nums 的前五个元素被修改为 0, 1, 2, 3, 4。

你不需要考虑数组中超出新长度后面的元素。
```

**说明:**

为什么返回数值是整数，但输出的答案是数组呢?

请注意，输入数组是以**「引用」**方式传递的，这意味着在函数里修改输入数组对于调用者是可见的。

你可以想象内部操作如下:

```
// nums 是以“引用”方式传递的。也就是说，不对实参做任何拷贝
int len = removeDuplicates(nums);

// 在函数里修改输入数组对于调用者是可见的。
// 根据你的函数返回的长度, 它会打印出数组中该长度范围内的所有元素。
for (int i = 0; i < len; i++) {
    print(nums[i]);
}
```

【解析】

这题也很简单，用快慢指针即可。

```java
class Solution {
    public int removeDuplicates(int[] nums) {
        if(nums == null || nums.length == 0) {
            return 0;
        }
        int len = 1;
        for (int i = 0; i < nums.length - 1; i++) {
            if(nums[i] != nums[i+1]) {// 复制只会出现在不相等时候
                nums[len++] = nums[i+1];
            } else {
                continue;
            }
        }// 至此得到不重复元素个数
        return len;
    }
}
```





### 9、No.27 移除元素

【题目】

给你一个数组 *nums* 和一个值 *val*，你需要 **[原地](https://baike.baidu.com/item/原地算法)** 移除所有数值等于 *val* 的元素，并返回移除后数组的新长度。

不要使用额外的数组空间，你必须仅使用 O(1) 额外空间并 **[原地 ](https://baike.baidu.com/item/原地算法)修改输入数组**。

元素的顺序可以改变。你不需要考虑数组中超出新长度后面的元素。

**示例 :**

```
给定 nums = [3,2,2,3], val = 3,

函数应该返回新的长度 2, 并且 nums 中的前两个元素均为 2。

你不需要考虑数组中超出新长度后面的元素。
```

采用类似荷兰国旗问题想法，设置一个右边界，将从左边遍历与 val 相等的元素交换到右边界右侧。最终返回右边界位置。

```java
    public int removeElement(int[] nums, int val) {

        int pos = nums.length;// 指示去除最远位置
        
        int i = 0;
        while(i != pos) {
            if(nums[i] != val) {
                i++;
            } else {//至此 说明相等
                swap(nums, i, pos-1);
                pos--;
            }
        }
        return pos;
    }
```



### 10、No.28 实现 [strStr()](https://baike.baidu.com/item/strstr/811469) 函数。

给定一个 haystack 字符串和一个 needle 字符串，在 haystack 字符串中找出 needle 字符串出现的第一个位置 (从0开始)。如果不存在，则返回 **-1**。

**示例 1:**

```
输入: haystack = "hello", needle = "ll"
输出: 2
```

**示例 2:**

```
输入: haystack = "aaaaa", needle = "bba"
输出: -1
```

**说明:**

当 `needle` 是空字符串时，我们应当返回什么值呢？这是一个在面试中很好的问题。

对于本题而言，当 `needle` 是空字符串时我们应当返回 0 。这与C语言的 [strstr()](https://baike.baidu.com/item/strstr/811469) 以及 Java的 [indexOf()](https://docs.oracle.com/javase/7/docs/api/java/lang/String.html#indexOf(java.lang.String)) 定义相符。

KMP解法，详情见之前写下的 blog ——  [字符串问题](http://husharp.today/2020/08/02/Coder-MianShi6/)



### 11、No.35 搜索插入位置

就是二分查找 ...没啥好说的。



### 12、No.38 外观数列

给定一个正整数 `n` ，输出外观数列的第 `n` 项。

「外观数列」是一个整数序列，从数字 1 开始，序列中的每一项都是对前一项的描述。

你可以将其视作是由递归公式定义的数字字符串序列：

- `countAndSay(1) = "1"`
- `countAndSay(n)` 是对 `countAndSay(n-1)` 的描述，然后转换成另一个数字字符串。

前五项如下：

```
1.     1
2.     11
3.     21
4.     1211
5.     111221
第一项是数字 1 
描述前一项，这个数是 1 即 “ 一 个 1 ”，记作 "11"
描述前一项，这个数是 11 即 “ 二 个 1 ” ，记作 "21"
描述前一项，这个数是 21 即 “ 一 个 2 + 一 个 1 ” ，记作 "1211"
描述前一项，这个数是 1211 即 “ 一 个 1 + 一 个 2 + 二 个 1 ” ，记作 "111221"
```

要 **描述** 一个数字字符串，首先要将字符串分割为 **最小** 数量的组，每个组都由连续的最多 **相同字符** 组成。然后对于每个组，先描述字符的数量，然后描述字符，形成一个描述组。要将描述转换为数字字符串，先将每组中的字符数量用数字替换，再将所有描述组连接起来。

【解析】

**法一、采用双指针 + 递归**。由于每次结果来源于上一次，明显可以采用递归。

双指针指的是：（类似 No.26 删除重复元素），将 left 指向每次不等的第一个数， pos 按顺序遍历每一个，值得注意的是：每次遇到新的数时，需要将 left 指向该新数。且上一个数重复次数，即为当前left  和 之前 left 的距离。

```java
        for (int left = 0; left < sc.length; left++) {
            if(sc[pos] != sc[left]) {
                str +=  String.valueOf(left - pos) +  String.valueOf(sc[pos]);
                pos = left;// 现在指向下一个不等的数
            }// 相等 则向前
        } 
```

且由于最后一组相等的数据还没有加起来，所以需要单独加起来。

**法二、迭代版本**

首先定义

- 变量 pre 记录前一项，初始化为空字符串；
- 定义变量 cur 记录当前项，初始化为 '1'（第一项为 1）；

定义双指针 start， end 均指向序列项的头部，这里用于统计元素出现的次数；
由于给定的  n ≥ 1 ，这里由第 2 项开始逐项对前一项进行描述（注意，要将 cur 赋值给 pre，并初始化 cur 为空字符串，重新拼接得到当前项）：

- 从左往右遍历 pre，当元素相同时，移动 end 指针，直至元素不相同时，那么此时 end-start 就是相同元素的个数，而 start 指针指向的元素就是重复的元素，进行拼接，cur += str(end-start)+pre[start]。
- 此时要让 start 指向 end 所在的位置，开始记录下个元素出现的次数；
- 重复上面的步骤，直至 end 指针到达序列项尾部，便可得到当前项。

逐项对前面一项描述开始时，都应该重置 start、end 指针指向序列项头部，同时应将 cur 赋值给 pre，初始化 cur，也就是前面注意部分所说的内容（可结合代码理解）。然后，再次重复第三个步骤。



代码实现如下

递归版本

```java
    public String countAndSay(int n) {
        if(n == 1) {
            return "1";
        }

        String str = countAndSay(n-1);
        char[] sc = str.toCharArray();// 将上一个函数得到的字符串， 来转换为字符数组

        str = "";// 置为 空
        
        // 采用双指针， 当不等时， 便进行加入。
        int pos = 0;
        for (int left = 0; left < sc.length; left++) {
            if(sc[pos] != sc[left]) {
                str +=  String.valueOf(left - pos) +  String.valueOf(sc[pos]);
                pos = left;// 现在指向下一个不等的数
            }// 相等 则向前
        } 
        // 再将最后一个加起来
        str += String.valueOf(sc.length - pos) + String.valueOf(sc[sc.length-1]);
        
        return str;
    }
```

迭代版本

```java
    // 迭代版本
    public String countAndSay(int n) {
        StringBuffer cur = new StringBuffer("1");// cur 作为当前得到的 str
        StringBuffer pre = new StringBuffer("1");// pre 作为上一个得到的 str
    
        for (int i = 1; i < n; i++) {// 第 0 个为 "1", 所以从第 1 个开始
            pre = cur;// 先将 pre 赋为 上一个的 cur
            cur = new StringBuffer();

            int start = 0, end = 0;
            while(end < pre.length()) {// 遍历每一个
                while(end < pre.length() && pre.charAt(start) == pre.charAt(end)) {
                    end++;
                }
                cur = cur.append(String.valueOf(end-start)).append(pre.charAt(start));
                start = end;// 指示新数据
            }
        }
        return cur.toString();
    }
```

对比两段代码的循环 如下：

```java
 /************     1    *************/
	int pos = 0;
 	for (int left = 0; left < sc.length; left++) {
            if(sc[pos] != sc[left]) {
                str +=  String.valueOf(left - pos) +  String.valueOf(sc[pos]);
                pos = left;// 现在指向下一个不等的数
            }// 相等 则向前
        } 
        // 再将最后一个加起来
	str += String.valueOf(sc.length - pos) + String.valueOf(sc[sc.length-1]);
  /************     2    *************/
	int start = 0, end = 0;
	while(end < pre.length()) {// 遍历每一个
		while(end < pre.length() && pre.charAt(start) == pre.charAt(end)) {
			end++;
        }
		cur = cur.append(Integer.toString(end-start)).append(pre.charAt(start));
		start = end;// 指示新数据
		}
	}
```

第一个需要加上最后一个， 第二个不需要。

这是由于 法一 采用不等的时候才相加，而 法二是浏览完便相加。若为 1 2 3 4 4 ，那么 最后的 4 4 法一并不会加起来，而法二无论值是多少都会加。





### 13、No.53 最大子序列和

给定一个整数数组 `nums` ，找到一个具有最大和的连续子数组（子数组最少包含一个元素），返回其最大和。

**示例:**

```
输入: [-2,1,-3,4,-1,2,1,-5,4]
输出: 6
解释: 连续子数组 [4,-1,2,1] 的和最大，为 6。
```

【分析】

**法一：**

主要参考此 [博客](https://mp.weixin.qq.com/s?__biz=MzAxODQxMDM0Mw==&mid=2247485355&idx=1&sn=17a59704a657b4880dffb54c40ad730e&chksm=9bd7f9a3aca070b53c3f74c9d0a1074ae1e615699fd3b977b8134d486106e62fb28cdf59cb52&scene=178&cur_album_id=1318881141113536512#rd) 。晕 真的惭愧，之前看了九章 DP 算法课，竟然遇到了还是没想法...果然还是当时刷题没跟上啊...哎，加油吧。

之前的思路一般是 dp 方程为：

**`nums[0..i]`中的「最大的子数组和」为`dp[i]`**。如果这样定义的话，整个`nums`数组的「最大子数组和」就是`dp[n-1]`。

那么如何找状态转移方程呢？按照数学归纳法，假设我们知道了`dp[i-1]`，如何推导出`dp[i]`呢？

**实际上是不行的，因为子数组一定是连续的，按照我们当前`dp`数组定义，并不能保证`nums[0..i]`中的最大子数组与`nums[i+1]`是相邻的**，也就没办法从`dp[i]`推导出`dp[i+1]`。

所以并不能得到 dp 的转移方程。

换个思路，**以`nums[i]`为结尾的「最大子数组和」为`dp[i]`**。

那么此时，`dp[i]`有两种「选择」，要么与前面的相邻子数组连接，形成一个和更大的子数组；要么不与前面的子数组连接，自成一派，自己作为一个子数组。二者选 Max。

```
// 要么自成一派，要么和前面的子数组合并
dp[i] = Math.max(nums[i], nums[i] + dp[i - 1]);
```

因此最终代码实现为

```java
    public int maxSubArray(int[] nums) {
        if(nums == null || nums.length < 1) {
            return 0;
        }
        // dp[i] 表示 nums[i] 结尾 的最大子数组
        int[] dp = new int[nums.length];

        // 第一个自然为自身
        dp[0] = nums[0];
        for (int i = 1; i < dp.length; i++) {
            // 要么自成一派， 要么加上前面最大的子数组
            dp[i] = Math.max(nums[i], dp[i-1] + nums[i]);
        }

        // 遍历所有 dp
        int res = Integer.MIN_VALUE; 
        for (int i = 0; i < dp.length; i++) {
            res = Math.max(res, dp[i]);
        }
        return res;
    }
```

**法二：**

思路差不多，对每一个值进行遍历，采用一个 sum 来记录当前值 nums[i] 之前的增益。

- sum > 0 ，那么就会是对 当前值的增益，加上
- sum < 0 ，那么 sum 对结果无增益效果，需要舍弃，则 sum 直接更新为当前遍历数字

res 通过 Max 来保存每次增益后的最大值。

```java
    public int maxSubArray(int[] nums) {
        if(nums == null || nums.length < 1) {
            return 0;
        }

        int res = nums[0];// 比较得到最终值
        int sum = 0;//记录和
        for (int i = 0; i < nums.length; i++) {
            if(sum > 0) {
                sum += nums[i];
            } else {
                sum = nums[i];
            }
            res = Math.max(res, sum);
        }
        return res;
    }
```



### 14、No.58 最后一个单词长度

给定一个仅包含大小写字母和空格 ' ' 的字符串 s，返回其最后一个单词的长度。如果字符串从左向右滚动显示，那么最后一个单词就是最后出现的单词。

如果不存在最后一个单词，请返回 0 。

说明：一个单词是指仅由字母组成、不包含任何空格字符的 最大子字符串。

----------

没啥好说的， 注意边界情况："a   " 最后可能有空格，即可。



### 15、No.66 加一

给定一个由**整数**组成的**非空**数组所表示的非负整数，在该数的基础上加一。

最高位数字存放在数组的首位， 数组中每个元素只存储**单个**数字。

你可以假设除了整数 0 之外，这个整数不会以零开头。

```
输入: [1,2,3]
输出: [1,2,4]
解释: 输入数组表示数字 123。
```

没啥好说的，，进行优化如下：

且不用全部循环，直接判断该位是否进位，进位就继续，没进位就跳出返回。

对待全进位：直接长度加一，第一个数初始化为1，后面的不管，默认为0。

```
    public int[] plusOne(int[] digits) {
        if(digits == null || digits.length == 0) {
            return null;
        }

        // 直接判断有没有进位， 没有进位就跳出， 不用再循环
        for (int i = digits.length-1; i > -1; i--) {
            digits[i]++; 
            digits[i] %= 10;
            if(digits[i] != 0) {
                return digits;
            }
        }
        // 至此还没跳出， 说明是全进位 999 -> 1000
        digits = new int[digits.length + 1];
        digits[0] = 1;
        return digits;
    }
```





-----------------------------

## Stack

### No.150 逆波兰表达式

