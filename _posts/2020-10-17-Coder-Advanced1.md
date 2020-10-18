---
layout: post
title:  "《程序员代码面试指南》（九）进阶班（一）"
date:   2020-10-17 7:32:42 +0800
categories:  算法&DS
tags: 算法  数据结构
author: Hu#
typora-root-url: ..
---

* content
{:toc}


### 1、生成窗口最大值数组

【题目】

​	有一个整型数组 arr 和一个大小为 w 的窗口从数组的最左边滑到最右边，窗口每次向右边滑一个位置。
​	例如，数组为[4，3，5，4，3，3，6，7]，窗口大小为3时：

```
[4 3 5] 4 3 3 6 7        窗口中最大值为5
4 [3 5 4] 3 3 6 7        窗口中最大值为5
4 3 [5 4 3] 3 6 7        窗口中最大值为5
4 3 5 [4 3 3] 6 7        窗口中最大值为4
4 3 5 4 [3 3 6] 7        窗口中最大值为6
4 3 5 4 3 [3 6 7]        窗口中最大值为7

输出的结果为{5 5 5 4 6 7}
```

如果数组长度为 n，窗口大小为 w ，则一共产生 n-w+1 个窗口的最大值。

【解析】

​	本题的关键在于利用双端队列来实现窗口最大值的更新。首先生成双端队列 qmax ，**qmax中存放数组arr中的下标**。

- 假设遍历到arr[i]，qmax的**放入规则**为：
  1.如果 qmax 为空，直接把下标 i 放进 qmax ，放入过程结束。
  2.如果 qmax 不为空，取出当前 qmax 队尾存放的下标，假设为 j。
  	1）如果 arr[i] > arr[i]，直接把下标 i 放进qmax的队尾，放入过程结束。
  	2）如果 arr[j] <= arr[i]，把 j 从 qmax 中弹出，继续 qmax 的放入规则。
- 假设遍历到 arr[i]，qmax的**弹出规则**为：
  如果 qmax 队头的下标等于 i-w，说明当前 qmax 队头的下标已过期，弹出当前对头的下标即可。

**注意点：**

1.对于**放入规则**—— arr[j] <= arr[i]，把 j 从 qmax 中弹出，继续 qmax 的放入规则，原理是为何？

因为后面来的数字不仅比前面的数字大，还比前面的数字后删除（窗口 L 的移动是从左到右），因此前面被删除的数字已经没有机会再成为最大值了，删除即可。

 2.只存下标，而不是存值：

当 为 5 4 5 3 5 时，放入时不好判断删除的是哪个下标 5 。

【代码实现】

首先需要明白，java 中 Linkedlist 为双向链表。

```java
	public static int[] getMaxWindowsArr(int[] arr, int w) {
		if (arr == null || arr.length < w || w < 1) {
			return null;
		}
		// 双向链表
		LinkedList<Integer> qmax = new LinkedList<>();
		int[] res = new int[arr.length - w + 1];

		int index = 0;// 记录 res 数组当前值，即 第几个窗口
		// 遍历每一个点
		for (int i = 0; i < arr.length; i++) {
			// 即上文所说的放入规则（从后加入）
			while(!qmax.isEmpty() && arr[qmax.peekLast()] <= arr[i]) {
				qmax.pollLast();
			}
			qmax.addLast(i);
			// 判断此时是否形成窗口
			// 以及 判断此时最大值是否已经过期
			if(qmax.peekFirst() == i - w) {
				qmax.pollFirst();
			}
			// 若是形成窗口，便记录每次的最大值
			if(i >= w-1) {
				res[index++] = arr[qmax.peekFirst()]; 
			}
		}
		return res;
	}
```



### 2、最大值减去最小值小于或等于num的子数组数量

【题目】

给定数组arr和整数num，共返回有多少个子数组满足如下情况：
max（arr[i..j]）-min（arr[i..j]）<=num max（arr[i..j]）表示子数组arr[i..j]中的最大值，min（arr[i..j]）表示子数组arr[i..j]中的最小值。

子数组指的是连续数组。

【要求】
如果数组长度为N，请实现时间复杂度为0（N）的解法。

【解析】

初始想法：O(n^3)

```
列举 
0-0   0-1   0-2   .... 0-N
1-1	  1-2	1-3	  ...1-N-1
...
O(n^2)

遍历验证每一个数组是否满足
所以为 O(n^3)
```

 首先性质的了解：

`当一个数组已经满足时，他的子数组必然会满足。`

max - min 都已经满足 <= num，子数组只有可能 max 越小， min 越大，所以必然满足

同理， `当一个数组不满足时，他的子数组必然不满足`

依照上述两条推理，得出以下方法。

1、首先取 L 为 0， R 从 0 开始，一直向右边走，知道找到不满足的情况（R 向右边走的时候，采用窗口思想——即用双向链表存储 max 与 min，[至于 min 的判断按照 max 反过来即可]）。设此时不满足的 R 指向 X。（每次 res++ 记录满足个数）

2、现在将 L 从 0 变为 1，按照步骤 1 来进行循环，一直到 L 指向最后位置。

```java
	public static int getNum(int[] arr, int num) {
        if (arr == null || arr.length == 0 || num < 0) {
            return 0;
        }
        int res = 0;// 记录个数
        LinkedList<Integer> qmax = new LinkedList<>();
        LinkedList<Integer> qmin = new LinkedList<>();

        // L 从 0 开始
        int L = 0;
        int R = 0;
        while (L < arr.length) {
            while (R < arr.length) {
                // 大值队列
                while (!qmax.isEmpty() && arr[qmax.peekLast()] <= arr[R]) {
                    qmax.pollLast();
                }
                qmax.addLast(R);
                // 小值队列
                while(!qmin.isEmpty() && arr[qmin.peekLast()] >= arr[R]) {
                    qmin.pollLast();
                }
                qmin.addLast(R);
                if(arr[qmax.peekFirst()] - arr[qmin.peekFirst()] > num) {
                    break;
                }
				R++;
            }
            if(qmax.peekFirst() == L) {
                qmax.pollFirst();
            }
            if(qmin.peekFirst() == L) {
                
                qmin.pollFirst();
            }
            res += R- L;
			L++;
        }

        return res;
    }
```

值得注意的是此处

```
res += R- L;
```

是每次 R 走到头之后再加上中间的个数，而非放在每次的 R++ 后面，因为 R 一直是向前走的，并不会遍历每次的 res 个数。

L 与 R 一直前进直到 arr.length 因此时间复杂度为 O(n)





































































































