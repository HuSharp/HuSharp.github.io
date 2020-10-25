---
layout: post
title:  "《程序员代码面试指南》（十）Morris 遍历二叉树：前序、中序、后序"
date:   2020-10-25 12:52:18 +0800
categories:  算法&DS
tags: 算法  数据结构
author: Hu#
typora-root-url: ..
---

* content
{:toc}
##  三、Morris 遍历

### 1、Morris 遍历的基本概念

> **Morris 遍历：时间复杂度 O(N)、额外空间复杂度 O(1)，N 为二叉树的节点个数。**
>
> **说明：和二叉树的遍历有关的最优解都是 Morris 遍历。**

 **分析：** 

Morris 遍历：对于有左子树的节点 current，会遍历到两次，否则只会遍历到一次。对于有左子树的节点，它会先让左子树的最右节点 mostRight 指向它，从而达到之后能从底层节点返回上层。

- 如果 mostRight 的右指针为空，说明是第一次到达 current，然后会让它指向 current；
- 如果 mostRight 的右指针指向 current ，说明这是第二次到达 current，current 的左子树已经遍历完了，该回到 current，开始遍历其右子树了。

![image-20201025135214030](/assets/blog_image/2020-10-25-Coder-Advanced3_Morris/image-20201025135214030.png)

1.递归版本本质如下：

	public static void preOrderRecur(Node head) {
			if(head == null)
				return;
		1、
		preOrderRecur(head.left);
		2、
		preOrderRecur(head.right);
		3、
	}
实际是**遍历每个点 3 次。**如上面代码所示的三次。

而 Morris 遍历的本质便是如此，若有左子树，那么 current，会遍历到两次，current 指示父节点 cur 的位置。

**具体步骤：**

1、如果 current 无左子树，current 向右移动【遍历其右子树】【无左子树，current 只会经过一次】；

2、如果 current 有左子树，找到 current 左子树上最右的节点 mostRight：

- 若 mostRight 的右指针指向 null【说明这是第一次来到 current 】，让 mostRight 的右指针指向 current 【那么之后就可以通过该指针返回 current 了】，current 向左移动【遍历左子树】；
- 若 mostRight 的右指针指向的是 current 【说明这是第二次来到 current，current 的左子树已经遍历完了】，让 mostRight 的右指针指向空，current 向右移动。

当指向 null 时停止。

 

























































































































































































