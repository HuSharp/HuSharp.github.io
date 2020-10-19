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





### 3、单调栈结构

【题目】

  给定一个不含有重复值的数组 arr，找到每一个 i 位置左边和右边离 i 位置最近且值比 arr[i] 小的位置。返回所有位置相应的信息。 -1 表示没有。

**输入**

```
7
3 4 1 5 6 2 7
```

**输出**

```
-1 2
0 2
-1 -1
2 5
3 5
2 -1
5 -1
```

【分析】

#### 1、没有重复元素（低级）

经典解即为遍历找左边的最小值，右边的最小值，为O(n^2)

现讨论 O(N) 解法。

​	准备一个栈，记为 stack ，栈中放的元素是数组的位置，开始时 stack 为空。如果找到每一个i 位置左边和右边离 i 位置最近且值比 arr[i] 小的位置，那么需要让 **stack 从栈顶到栈底**的位置所代表的值是**严格递减**的。
​	下面用例子来展示单调栈的使用和求解流程

- 初始时 arr = { 3,4,1,5,6,2,7,7}。stack 从栈顶到栈底为：{}；

- 遍历到 arr[0] = 3，发现 **栈为空**，就直接放入 0 位置。从栈顶到栈底为：{ 0位置(值是3)};

- 遍历到 arr[1] = 4，发现直接放入 1 位置，不会破坏 stack 从栈顶到栈底的位置所代表的值是严格递减的，那么直接放入

- 遍历到 arr[2] = 1，发现直接放入 2位置（值是1），会破坏从栈顶到栈底的位置所代表的值是严格递减的，所以从 stack 栈顶开始弹出位置。如果 x 位置被弹出，在栈中位于 x 位量下面的位置，就是 x 位置左边离位置最近且值比 arr[x] 小的位置; 当前由于小于 x 的位置值而将 x 弹出的位置，就是 x 位置右边离位置最近且值比 arr[x] 小的位置。同理继续上述过程，直至到达遍历末尾。

  ![image-20201019151927924](/assets/blog_image/2020-10-17-Coder-Advanced1/image-20201019151927924.png)

- 当遍历阶段结束后，即栈中还有值时，进行 pop 操作。每一个 pop 出的值 x ， x 位置右边满足条件位置 填上 -1 （表示已经没有，其右边都比它大），左边填上栈中其下面的位置。
- 直到栈中只剩下最后一个值，那么其左右都为 -1。



**现在证明在单调栈中，为何可以弹出时进行判断。**

​	假设 stack 当前栈顶位置是 x ，值是 5；x下面是 i 位置，值是 1。当前遍历到 j 位置，值是4。如下图所示，请注意整个数组中是没有重复值的。

![image-20201019152836005](/assets/blog_image/2020-10-17-Coder-Advanced1/image-20201019152836005.png)

​	当前来到 j 位置，但是 x 位置已经在栈中，所以 x 位置肯定在 j 位置的左边：····5（x 位置）····· 1（j 位置）。如果在 5 和 1 之间存在小于 5 的数，那么没等遍历到当前的 1，x位置（值是 5 ）就已经被弹出了，轮不到当前位置的 1 来让 x 位置的5弹出，所以 5 和 1 之间的数要么没有，要么是比 5 大，所以x 位置右边离位置最近且值比 arr[x] 小的位置一定为 当前的 j 位置所对应的 1。

​	同理，下面为 i 位置的对应的值 1 也满足 x 的左边条件。

因此：每个元素进栈一次，出栈一次，时间复杂度为 O(N)。

**注意：**以上为低级版本，即输入数组中没有重复元素。

```java
        public static int[][] getNearLessNoRepeat(int[] arr) {
            int[][] res = new int[arr.length][2];// 结果返回数组
    
            Stack<Integer> stack = new Stack<>();
            for (int i = 0; i < arr.length; i++) {
                while (!stack.isEmpty() && arr[stack.peek()] > arr[i]) {
                    int cur = stack.pop();
                    int leftLessIndex = stack.isEmpty() ? -1 : stack.peek();
                    res[cur][0] = leftLessIndex;
                    res[cur][1] = i;
                }
                stack.push(i);
            }
    
            // 至此已经遍历完毕，进行栈中弹出
            while (!stack.isEmpty()) {
                int cur = stack.pop();
                int leftLessIndex = stack.isEmpty() ? -1 : stack.peek();
                res[cur][0] = leftLessIndex;
                res[cur][1] = -1;
            }
    
            return res;
        }
```



#### 2、有重复元素（进阶）

将栈中存放思路稍微改一下

将遇到栈中的相等值时，一起存储（采用链表结构即可）。

![image-20201019155739768](/assets/blog_image/2020-10-17-Coder-Advanced1/image-20201019155739768.png)

为什么可以遇到？因为若上面是比 3 大的值，遇到 3 会弹出，直至遇到相等的 3。

```java
    public static int[][] getNearLessRepeat(int[] arr) {
        int[][] res = new int[arr.length][2];// 结果返回数组

        Stack<List<Integer>> stack = new Stack<>();
        for (int i = 0; i < arr.length; i++) {
            while (!stack.isEmpty() && arr[stack.peek().get(0)] > arr[i]) {
                List<Integer> curPop = stack.pop();
                int leftLessIndex = stack.isEmpty() ? -1 : stack.peek().get(stack.peek().size() - 1);
                for (Integer cur : curPop) {
                    res[cur][0] = leftLessIndex;
                    res[cur][1] = i;
                }
            }
            // 现在讨论入栈
            if(!stack.isEmpty() && arr[stack.peek().get(0)] == arr[i]) {//说明之前就已经存在
                stack.peek().add(Integer.valueOf(i));
            } else { // 之前不存在
                List<Integer> pushList = new ArrayList<>();
                pushList.add(Integer.valueOf(i));
                stack.push(pushList);
            }
        }

        // 至此已经遍历完毕，进行栈中弹出
        while (!stack.isEmpty()) {
            List<Integer> curPop = stack.pop();
            int leftLessIndex = stack.isEmpty() ? -1 : stack.peek().get(stack.peek().size() - 1);
            for (Integer cur : curPop) {
                res[cur][0] = leftLessIndex;
                res[cur][1] = -1;
            }
        }

        return res;
    }
```































































