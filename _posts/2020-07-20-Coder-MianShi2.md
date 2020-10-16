---
layout: post
title:  "《程序员代码面试指南》（二）数组和矩阵"
date:   2020-07-22 11:21:00 +0800
categories:  算法&DS
tags: 算法  数据结构
author: Hu#
typora-root-url: ..
---

* content
{:toc}
## 二、数组和矩阵问题

### 1、转圈打印矩阵

【题目】
给定一个整型矩阵matrix，请按照转圈的方式打印它。
例如：

```
1  2  3  4 
5  6  7  8 
9  10  11  12 
13 14  15  16
```

打印结果为：1，2，3，4，8，12，16，15，14，13，9，5，6，7，11，10

【要求】
额外空间复杂度为O（1）。

【解答】

介绍一种矩阵处理思想：

**矩阵分圈处理**。在矩阵中用左上角的坐标（tR，tC）和右下角的坐标（dR，dC）就可以表示一个子矩阵，比如，题目中的矩阵，当（tR，tC）=（0，0）、（dR，dC）=（3，3）时，表示的子矩阵就是整个矩阵，那么这个子矩阵最外层的部分如下：

```
1  2  3  4 
5        8 
9        12 
13 14 15 16
```

将矩阵按照层次转圈打印，如最外圈就是 从 1 开始顺时针到 5，此时进入内部圈，按照相同方法进行打印。

值得注意的是：

1. 进入内层圈是 左下角++ 右上角--，直到 左下角超过右上角 终止。

   ```
   while(topR <= botR && topC <= botC) {
   			printEdge(matrix, topR++, topC++, botR--, botC--);
   		}
   ```

2. 最后一步可为一行或者一列

   ```
   	if(topR == botR) {// 表示为在一行
   		for (int i = topC; i <= botC; i++) {
   			System.out.print(matrix[topR][i] + " ");
   		}
   	}else if(topC == botC) {// 表示为在一列
   		for (int i = topR; i <= botR; i++) {
   			System.out.print(matrix[i][topC] + " ");
   		}
   	}else {// 至此说明可以画出一个矩形 按照上右下左打出
   		...
   	}
   ```





### 2、将正方形顺时针旋转 90度

【题目】
给定一个 NXN 的矩阵matrix，把这个矩阵调整成顺时针转动90°后的形式。
例如：

```
1  2  3  4 
5  6  7  8 
9  10  11  12 
13 14  15  16
```

顺时针转动90°后为：

```
13  9  5  1
14  10 6  2
15  1  17 3
16  12 8  4
```

【要求】
额外空间复杂度为O（1）。

【解答】

这里仍使用分圈处理的方式。

对于每一圈，比如外圈采用顺（逆）时针交换位置的方式

<img src="/assets/blog_image/2020-07-20-Coder-MianShi2/QQ图片20200723093107.jpg" alt="QQ图片20200723093107" style="zoom: 67%;" />

只需要使用一个变量进行暂存即可；

```
int times = botC - topC;
		int temp = 0;
		for (int i = 0; i != times; i++) {
			temp = matrix[topR][topC+i];//将第一个点存好
			matrix[topR][topC+i] = matrix[botR-i][topC];// 4 -> 1
			matrix[botR-i][topC] = matrix[botR][botC-i];// 3 -> 4
			matrix[botR][botC-i] = matrix[topR+i][botC];// 2 -> 3
			matrix[topR+i][botC] = temp;
		}
```

且对于一行或者一列，其中间必然为中心点，按照上述函数进行交换即可。





### 3、“之”字形打印矩阵

【题目】 给定一个矩阵matrix，按照“之”字形的方式打印这
个矩阵，例如：

```
1  2  3  4 
5  6  7  8 
9  10  11  12 
```

“之”字形打印的结果为：1，2，5，9，6，3，4，7，10，11，8，12
【要求】 额外空间复杂度为O(1)。

【解答】

![QQ图片20200724070951](/assets/blog_image/2020-07-20-Coder-MianShi2/QQ图片20200724070951.jpg)

安放两个指针，A向右运动，到界后向下；B向下运动，到界后向右。并每次调节打印方向。

```
public static void printDiagonal(int[][] matrix, int eastUpR, int eastUpC, 
									int westBotR, int westBotC, boolean up) {
		if(up) {//说明自下向上
			while(westBotR != eastUpR-1) {
				System.out.print(matrix[westBotR--][westBotC++] + " ");
			}
		}else {// 自上而下
			while(eastUpR != westBotR+1) {
				System.out.print(matrix[eastUpR++][eastUpC--] + " ");
			}
		}
	}
```





### 4、在行列都排好序的矩阵中找数

【题目】
给定一个有NxM的整型矩阵matrix和一个整数K，matrix的每一行和每一列都是排好序的。实现一个函数，判断K是否在matrix中。
例如：

```
0 1 2 5
2 3 4 7
4 4 4 8
5 7 7 9
```

如果K为7，返回true；如果K为6，返回false。

【要求】
时间复杂度为O（N+M），额外空间复杂度为O（1）。

【解答】

从右上到左下（也可以从左下开始，即逆过程）。从最后 1 列第 1 个开始，K < cur 就向左（必然不在下方），K > cur 就向下。

![QQ图片20200724073622](/assets/blog_image/2020-07-20-Coder-MianShi2/QQ图片20200724073622.jpg)

```
// 从右上到左下
		while(eastUpR != matrix.length || eastUpC != -1) {
			if(matrix[eastUpR][eastUpC] == value) {
				System.out.println(eastUpR + " " + eastUpC);
				return true;
			}
			else if (matrix[eastUpR][eastUpC] > value) {
				eastUpC--;
			}else {
				eastUpR++;
			}
		}
```



### 5、数组的 partition 问题

【题目】

  给定一个有序数组arr，调整arr使得这个数组的左半部分[1,n+12][1, \frac{n+1}{2}][1,2n+1]没有重复元素且升序，而不用保证右部分是否有序 

  例如，arr = [1, 2, 2, 2, 3, 3, 4, 5, 6, 6, 7, 7, 8, 8, 8, 9]，调整之后arr=[1, 2, 3, 4, 5, 6, 7, 8, 9, .....]。 

https://www.nowcoder.com/practice/0d65e18ca5784ae68577d9591df23033?tpId=101&&tqId=33105&rp=1&ru=/ta/programmer-code-interview-guide&qru=/ta/programmer-code-interview-guide/question-ranking

   [要求]  

   时间复杂度为O(n)，空间复杂度为O(1)

输入描述:

```
第一行一个整数N。表示数组长度。
接下来一行N个整数，表示数组内元素
```

输出描述:

```
输出N个整数为答案数组
```

【示例】

输入

```
16
1 2 2 2 3 3 4 5 6 6 7 7 8 8 8 9
```

输出

```
1 2 3 4 5 6 7 8 9 6 2 7 2 8 8 3
```

【解析】

采用荷兰国旗问题思路。只不过只考虑左侧 left 排序。

1. 生成变量 small，含义是在 arr[0.small] 上都是无重复元素且升序的。也就是说，small 是这个区域最后的位置，初始时 small0，这个区域记为A。
2. 生成变量 big ，利用big 做从左到右的遍历，在 arr[small + l.]上是不保证没有重复元素且升序的区域， big 是这个区域最后的位置，初始时 =1，这个区域记为B。

3. big 向右移动（++）。因为数组整体有序，所以如果 arr[ big ] != arr[small]，说明当前数arr[ big ] 应该加入到 A 区域里，所以交换 arr[small+1] 和 arr[ big ]，此时A的区域增加一个数（small++）：如果arr[ big ] = arr[small]，说明当前数ar[ big ]的值之前已经加入到A区域，此时不用再加入。
4. 重复步骤3，直到所有的数遍历完。

```
    public static void leftUnique(int[] arr) {
        int small = 0;
        int big = 1;

        while(big != arr.length) {
            if(arr[small] != arr[big]) {
                swap(arr, ++small, big++);
            } else {
                big++;
            }
        }
    }
```



变式

参考荷兰国旗问题

http://husharp.today/2020/07/18/Coder-MianShi0/