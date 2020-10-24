---
layout: post
title:  "《程序员代码面试指南》（九）单调栈思想及其应用"
date:   2020-10-17 7:32:42 +0800
categories:  算法&DS
tags: 算法  数据结构
author: Hu#
typora-root-url: ..
---

* content
{:toc}


## 二、单调栈思想及其应用



### 1、单调栈结构

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





### 2、构造数组的 MaxTree

定义二叉树节点如下：

```
public class Node{
	public int value；
	public Node left；
	public Node right；
	
	public Node（int data）{
		this.value=data；
	}
}
```

一个数组的 MaxTree 定义如下。

- 数组必须没有重复元素。
- MaxTree 是一棵二叉树，数组的每一个值对应一个二叉树节点。
- 包括 MaxTree 树在内且在其中的每一棵子树上，值最大的节点都是树的头。
  给定一个没有重复元素的数组 arr ，写出生成这个数组的 MaxTree 的函数，要求如果数组长度为 N ，则时间复杂度为 O（N）、额外空间复杂度为 O（N）。

【解析】

#### 1.首先考虑堆排序方案，直接大根堆即可，建大根堆 O(N)



#### 2.现在采用单调栈的思路

以下列原则来建立这棵树：

- 每一个数的父节点是它左边第一个比它大的数和它右边第一个比它大的数中，**较小的那个**。
- 如果一个数左边没有比它大的数，右边也没有。也就是说，这个数是整个数组的最大值，那么这个教是 MaxTree 的头节点。
- 如果一个数只有一个比他大的数，那么父节点就是该点选择。

**证明如下：**

1. 通过这个方法，所有的数能生成一棵树，这棵树可能不是二叉树，**但肯定是一棵树**，而不是多棵树（森林）。
   我们知道，在数组中的所有数都不同，而一个较小的数肯定会以一个比自己大的数作为父节点，那么最终所有的数向上找都会找到数组中的最大值，所以它们会有一个共同的头。证明完毕。

2. 通过这个方法，所有的数最多都只有两个孩子。也就是说，**这棵树可以用二叉树表示，而不需要多叉树。**
   要想证明这个问题，只需证明任何一个数，在该数的单独一侧，其孩子数量都不可能超过1个即可。

   反证法：

   假设 a 这个数在单独一侧有 2 个孩子，不妨设在右侧。假设这两个孩子一个是 k1，另一个是k2，即

   ... a... k1....k2...

   因为 a 是 k1 和 k2 的父，所以 a>k1，a>k2。根据题意，k1 和 k2 不相等，所以 k1 和 k2 可以分出大小

   - 先假设 k1 是较小的， k2 是较大的（ k1 < k2 ）：
     那么 k1 可能会以 k2 为父节点，而绝对不会以 a 为父节点，因为根据我们的方法，每一个数的父节点是它左边第一个比它大的数和它右边第一个比它大的数中较小的那个，又有a > k2。

   - 再假设 k2 是较小的， k1 是较大的（ k1 > k2）：
     那么 k2 可能会以 k1 为父节点，也绝对不会以 a 为父节点，因为根据我们的方法，kl才可能是k2左边第一个遇到的比k2大的数，而绝对不会轮到a。

   - **总之，k1和k2肯定有一个不是a的孩子**。

   - 所以，任何一个数的单独一侧，其孩子数量都不可能超过 1 个，最多只会有 1 个。进而我们知道，任何一个数最多会有2个孩子，而不会有更多。

     证明完毕。
     





### 3、求最大矩阵的大小

【题目】

​	给定一个整型矩阵 map，其中的值只有 0 和 1 两种，求其中全是 1 的所有矩形区域中，最大的矩形区域里 1 的数量。

例如：

```
1   1   1   0
其中，最大的矩形区域有 3 个 1 ，所以返回 3。
再如：
1   0   1   1
1   1   1   1
1   1   1   0
其中，最大的矩形区域有6个1，所以返回6。
```

【分析】

#### 1、前置背景

首先考虑一个变式：**直方图中最大矩形面积的求解**

也是类似单调栈的思路

现如下图的一个直方图，竖轴表示直方图高度，横轴表示数组小标。

![image-20201023123136276](/assets/blog_image/2020-10-17-Coder-Advanced1/image-20201023123136276.png)

现进行步骤讨论：（利用一个从底到顶大小由小到大排列的栈）

1.入栈 0-> 4 ，现要入栈 1->3 时发现不满足，因此弹出结算。由下图可知：此时由 0->4 的高度可取得的最大矩形为 1 * 4 = 4。（值得注意的是，此时矩形底边长度的判断取决于和迫使其 pop 出元素的距离）。即此时为 (1 - (-1) - 1)

![image-20201023123234330](/assets/blog_image/2020-10-17-Coder-Advanced1/image-20201023123234330.png)

2.现在入栈 1->3 .同理易知 由 1->3 的高度可取得的最大矩形为 2 * 3 = 6

![image-20201023123621482](/assets/blog_image/2020-10-17-Coder-Advanced1/image-20201023123621482.png)

3.现在依次入栈 2、 3、4，发现都能入栈。因此最后一个也已经入栈。现在开始对栈内元素进行判断：首先弹出 4->6，同理易知 由 4->6 的高度可取得的最大矩形为 1 * 6 = 6

![image-20201023123820930](/assets/blog_image/2020-10-17-Coder-Advanced1/image-20201023123820930.png)

4.弹出 3->5，同理易知 由 3->5 的高度可取得的最大矩形为 2 * 5 = 10

![image-20201023123900653](/assets/blog_image/2020-10-17-Coder-Advanced1/image-20201023123900653.png)

5.最后弹出 2->2，同理易知 由 2->2 的高度可取得的最大矩形为 5 * 2 = 10

![image-20201023124113583](/assets/blog_image/2020-10-17-Coder-Advanced1/image-20201023124113583.png)

最后取的最大值为10.

上述代码实现为

```java
    public static int maxRecFromBottom(int[] height) {
        if(height == null || height.length == 0) {
            return 0;
        }

        int maxArea = 0;
        // 栈需要从小到大进行排列
        Stack<Integer> stack = new Stack<>();
        // 首先对每个点进行入栈
        for (int i = 0; i < height.length; i++) {
            while(stack.isEmpty() || height[stack.peek()] > height[i]) {
                int cur = stack.pop();// 进行清算
                // 计算该点的 最大矩形
                int left = stack.isEmpty()? -1 : stack.peek();
                int curArea = (i - left - 1) * height[cur];
                maxArea = Math.max(maxArea, curArea);
            }
            // 至此当前点开始入栈
            stack.push(i);
        }

        // 至此全部点都已经入栈，进行栈内数据判断
        while (!stack.isEmpty()) {
            int cur = stack.pop();
            int left = stack.isEmpty()? -1 : stack.peek();
            int curArea = (height.length - left - 1) * height[cur];
            maxArea = Math.max(maxArea, curArea);
        }

        return maxArea;
    }
```



#### 2、回到原题

现在再考虑原题，将以上思路代入即可。

现在若矩阵为下所示

```
1   0   1   1
1   1   1   1
1   1   1   0
```

那么将矩阵类比为直方图。将以每一行为单独考虑，将每一列数值构成的直方图作为该行的值。取max。

即此时为 

```
0：  1	0	1	1    O(m)
1：	2	1	2	2	 O(m)
2：	3  	2  	3  	0	 O(m)
```

每一行为 O(m）， 因此最后和为 O(m * n)。

```java
    public static int maxRecSize(int[][] map) {
        if(map == null || map.length == 0 || map[0].length == 0) {
            return 0;
        }

        int maxArea = 0;
        int[] height = new int[map[0].length];// 对每一行进行高度判断
        for (int i = 0; i < map.length; i++) {
            for (int j = 0; j < map[0].length; j++) {
                height[j] = map[i][j] == 0? 0 : height[j]+1;
            }
            // 每一行进行判断
            maxArea = Math.max(maxRecFromBottom(height), maxArea);
        }
        return maxArea;
    }
```



### 4、可见山峰问题

【题目】

一个不含有负数的数组可以代表一圈环形山，每个位置的值代表山的高度。比如，{3,1,2,4,5} 、 {4,5,3,1,2} 或 {1,2,4,5,3} 都代表同样结构的环形山。 3->1->2->4->5->3  方向叫作 next 方向（逆时针），3->5->4->2->1->3 方向叫作 last 方向（顺时针），如图所示。

![image-20201024103922721](/assets/blog_image/2020-10-17-Coder-Advanced2_SingleStack/image-20201024103922721.png)

山峰 A 和山峰 B 能够相互看见的条件为：

1．如果 A 和 B 是同一座山，认为不能相互看见。

2．如果 A 和 B 是不同的山，并且在环中相邻，认为可以相互看见。比如图1-8 中，相邻的山峰对有(1,2)(2,4)(4,5)(3,5)(1,3)。

3．如果 A 和 B 是不同的山，并且在环中不相邻，假设两座山高度的最小值为 min 。如果 A 通过next 方向到B 的途中没有高度比min  大的山峰，或者 A 通过last 方向到 B 的途中没有高度比 min 大的山峰，认为 A 和 B 可以相互看见。比如图中，高度为 3  的山和高度为 4 的山，两座山的高度最小值为 3。3 从 last 方向走向 4，中途会遇见 5，所以 last 方向走不通；3 从 next  方向走向4，中途会遇见1 和 2，但是都不大于两座山高度的最小值 3，所以 next 方向可以走通。  

有一个能走通就认为可以相互看见。再如，高度为 2 的山和高度 为5 的山，两个方向上都走不通，所以不能相互看见。图中所有在环中不相邻，并且能看见的山峰对有(2,3)、(3,4)。给定一个不含有负数且没有重复值的数组 arr，**请返回有多少对山峰能够相互看见**。

**进阶问题：给定一个不含有负数但可能含有重复值的数组 arr，返回有多少对山峰能够相互看见。**

【分析】

#### 1、原问题：时间复杂度 O(1) 的解。

如果数组中所有的数字都不一样，可见山峰对的数量可以由简单公式得到：

- 环形结构中只有1 座山峰时，可见山峰对的数量为 0；
- 环形结构中只有2 座山峰时，可见山峰对的数量为1。这都是显而易见的。
- **当环形结构中有 i 座山峰时（i > 2），可见山峰对的数量为 2 × i - 3**。下面给出证明。

​    我们**只用高度小的山峰去找高度大的山峰，而永远不用高度大的山峰去找高度小的山峰【精髓】**。比如题目描述中的例子，从 2 出发按照“小找大”原则，会找到 (2,3) 和 (2,4)，但是不去尝试 2 能不能看到 1，因为这是“大找小”，而不是“小找大”。(1,2) 这一对可见山峰不会错过，因为从 1  出发按照“小找大”原则找的时候会找到这一对。**从每一个位置出发，都按照“小找大”原则找到山峰对的数量，就是总的可见山峰对数量。**

![image-20201024103922721](/assets/blog_image/2020-10-22-Coder-Advanced2_SingleStack/image-20201024103922721.png)

​	如下图，因为 i 座山峰高度不一样，必然在环中存在唯一的最大值和唯一的次大值（第二大的值）。x 是除了最高值和次高值之外的任何一座山峰，所以 x 在 last 方向上必存在第一个高度比它大的节点，x 在 next  方向上也必存在第一个高度比它大的节点，所以从 x出发能找到且只能找到 2 对。

![image-20201024111004333](/assets/blog_image/2020-10-22-Coder-Advanced2_SingleStack/image-20201024111004333.png)

​	除了最大值和次大值之外还剩 **i - 2** 个节点，这 i - 2 个节点每一个都能找到 2 对，所以一共有 (i - 2) * 2 对，**还有 1 对，就是次大值能够看见最大值这对。所以一共是 2 ** *** i - 3 对。** 

#### 2、现在开始进阶问题思考

如何输出所有对的数组。（采用单调栈）





1、首先遍历一次环形山结构，找到最大值的位置，**如果最大值不只一个，找哪一个最大值都行**。准备一个栈，栈中放 stack，栈中包含**元素及元素目前重复了多少个**；

2、求一个数左边（逆时针方向）离它最近的比它大的数，右边（顺时针）离它最近的比它大的数，然后他们就能和该数组成可见山峰对。栈中按从栈底到栈顶由大到小的顺序放入，不满足就弹出栈顶元素，说明找到了栈顶元素的可见山峰，然后计算可见山峰对；

- 可见山峰对 = 栈顶元素之间组成的（重复） + （栈顶元素 ，让它弹出的那个数 ）+（栈顶元素，压着的那个数 ）组成的可见山峰
- 弹出记录为 (X, K)
- 若 K ==  1，那么 产生 2  对
- 若  K  > 2 ， 那么产生  C(2,K) + 2\*K 对（公式，直接用即可）。
- **这是由于 K  >  2，那么中间的重复元素都能互相两对看到。即为 C(2,K)。**

3、清算栈中剩下的

- 第一阶段： 栈里的元素大于两个，那么每弹出一个元素，则有 C(2, K) + 2 * K 对；

- 第二阶段： 栈里的元素等于 2 个： 

  1. 最大值有 >= 2个，则每一个依然能找到 2 对可见山峰。那么弹出该元素，有 C(2, K) +  2 * K 

  ![image-20201024160923368](/assets/blog_image/2020-10-22-Coder-Advanced2_SingleStack/image-20201024160923368.png)

  2. 最大值只有一个，那么不同高度组成的可见山峰只能一个一对。（构成环），因此为 ：C(2, K) + 1 * K

     ![image-20201024161123903](/assets/blog_image/2020-10-22-Coder-Advanced2_SingleStack/image-20201024161123903.png)

  

- 第三阶段： 只剩下最大值了，则可见山峰只能是在最大值之间 C(2, K)；若 K == 1，产生 0 对。 

```java
    // 用于存放每个山峰的高度和个数
    public static class Pair {
        public int value;
        public int times;

        public Pair(int value) {
            this.value = value;
            this.times = 1;
        }
    }

    // 判断环形数组的坐标函数
    public static int nextIndex(int size, int i) {
        return i < (size-1) ? (i+1) : 0;
    }

    // 清算每一个值时，其 C(2,K) 
    public static long getInternelSum(int k) {
        return k == 1? 0 : (k * (k-1))/ 2;
    }

    public static long communications(int[] arr) {
        if(arr == null || arr.length < 2) {
            return 0;
        }

        int size = arr.length;
        int maxIndex = 0;

        for (int i = 0; i < arr.length; i++) {
            maxIndex = (arr[i] > arr[maxIndex]) ? i : maxIndex;
        }
        int value = arr[maxIndex];
        int index = nextIndex(arr.length, maxIndex);

        // 栈按照栈底到栈顶，从大到小的顺序（最大值在最下面）
        Stack<Pair> stack = new Stack<>();
        // 首先先从最大值开始压入
        stack.push(new Pair(value));
        // 返回值
        int res = 0;
        // 开始遍历环形数组
        while (index != maxIndex) {
            value = arr[index];
            while(!stack.isEmpty() && stack.peek().value < value) {
                int times = stack.pop().times;
                res += getInternelSum(times) + 2 * times;
            }
            // 至此需要压栈,压栈分为两种情况：
            // 1. 值相等, 直接 + times
            // 2. 不等，落在上面
            if(value == stack.peek().value) {//值相等
                stack.peek().times++;
            } else {//值不等
                stack.push(new Pair(value));
            }
            // index 指向下一个
            index = nextIndex(size, index);
        }
        // 至此 开始清算
        // 清算分为三种情况：
        // 1、倒数第三行往上
        // 2、倒数第二行
        // 3、最后一行 
        while (!stack.isEmpty()) {
            int times = stack.pop().times;
            res += getInternelSum(times);// 首先先都加上 C(2,K)
            if(!stack.isEmpty()) {//倒数第二行三行
                res += times;
                if(stack.size() > 1) {// 倒数第三行
                    res += times;
                } else {// 倒数第二行
                    res += stack.peek().times > 1 ? times : 0;
                }
            }// 至此继续循环，倒数第一行在开始便完成加法，直接退出即可
        }

        return res;
    }

```



























































































































































































































 