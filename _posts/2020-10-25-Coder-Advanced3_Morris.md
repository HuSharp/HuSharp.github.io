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

----------------------------------------------

**具体步骤：**

1、如果 current 无左子树，current 向右移动【遍历其右子树】【无左子树，current 只会经过一次】；

2、如果 current 有左子树，找到 current 左子树上最右的节点 mostRight：

- 若 mostRight 的右指针指向 null【说明这是第一次来到 current 】，让 mostRight 的右指针指向 current 【那么之后就可以通过该指针返回 current 了】，current 向左移动【遍历左子树】；
- 若 mostRight 的右指针指向的是 current 【说明这是第二次来到 current，current 的左子树已经遍历完了】，让 mostRight 的右指针指向空，current 向右移动。

当指向 null 时停止。

---------------------------------

### 2. Morris 遍历本质探究。

现在需要得到先序、中序、后序的遍历方法，首先进行 Morris 遍历本质探究

1.递归版本本质如下：

	public static void preOrderRecur(Node head) {
		if(head == null)
			return;
		1、sysout
		preOrderRecur(head.left);
		2、sysout
		preOrderRecur(head.right);
		3、sysout
	}
实际是**遍历每个点 3 次。**如上面代码所示的三次。

- 且先序则是将打印放在第一次到达
- 中序是第二次到达
- 后序是第三次到达

Morris 的本质和递归版本大致相当，忽略掉第三次回到该节点

1. 若有左子树，那么 current，会遍历到两次；

   即下方代码的两次

   ```
   1、
   preOrderRecur(head.left);
   2、
   preOrderRecur(head.right);
   ```
   对于任何一个能够到达两次的节点 Y ，在第一次达到Y之后，cur 都会先去 Y 的左子树转一圈，然后会第二次来到Y，接下来 cur 要么跑到 Y 的右子树上，要么就返回上级。

2. 若没有左子树，只会到达一次。

   ```
   2、
   preOrderRecur(head.right);
   ```

   对于任何一个只能到达一次的节点 X ，接下来 cur 要么跑到 X 的右子树上，要么就返回上级。

- 那么对于任何一个能够到达两次的节点 Y ，是**如何知道此时的 cur 是第一次来到 Y 还是第二次来到 Y 呢**？
  - 如果 Y 的左子树上的最右节点的右指针（mostRight.right）是指向 null 的，那么此时 cur 就是第一次到达 Y ；
  - 如果 mostRight.right 是指向 Y 的，那么此时 cur 就是第二次到达 Y。
  - 值得注意的是，当第二次到达 Y 点时，Y 的左子树所有节点都已经遍历完毕。

这就是 Moris 遍历和 Moris 序 的实质。可以根据 Moris序 进一步加工出先序、中序和后序。

### **3.那么 Morris 咋实现呢？**

#### 1.先序： 

将打印放在 Morris 遍历中第一次到达即可。

对于 cur 只能到达一次的节点，直接打印即可

对于 cur 可以到达两次的节点，cur 第一次到达时打印，第二次不打印

```java
    // 先序实现
    public static void morrisPreprint(Node head) {
      	...
        while (cur != null) {//cur 不为空时，遍历继续
            mostRight = cur.left;
            if(mostRight != null) {
                // 首先找到最右节点
                // 至于 后面的判断，是由于第二次遍历到该点时，是指向cur的
                while (mostRight.right != null && mostRight.right != cur) {
                    mostRight = mostRight.right;
                }
                // 至此，mostRight 为左子树中最右节点
                if(mostRight.right == null) { // 此时表示第一次到达该点
                    System.out.print(cur.value + " ");
                    mostRight.right = cur;// 让其指向 cur
                    cur = cur.left;// current 向左移动【遍历左子树】
                    continue;
                } else { // 第二次遍历到，那么再改此点朝向从 cur 到 null
                    mostRight.right = null;
                }
            } else {//当前节点没有左子树,那么就只有一次到达该点机会，直接打印即可
                System.out.print(cur.value + " ");
            }
            // 若左孩子为空，直接跳到此处
            // 即直接向右孩子移动
            cur = cur.right;
        }
    }
```

#### 2.中序

对于 cur 只能到达一次的节点，直接打印即可

对于 cur 可以到达两次的节点，cur 第一次到达时不打印，第二次到达打印

```java
    // 中序
    public static void morrisInprint(Node head) {
		...
        while (cur != null) {//cur 不为空时，遍历继续
            mostRight = cur.left;
            if(mostRight != null) {
                // 首先找到最右节点
                // 至于 后面的判断，是由于第二次遍历到该点时，是指向cur的
                while (mostRight.right != null && mostRight.right != cur) {
                    mostRight = mostRight.right;
                }
                // 至此，mostRight 为左子树中最右节点
                if(mostRight.right == null) { // 此时表示第一次到达该点
                    mostRight.right = cur;// 让其指向 cur
                    cur = cur.left;// current 向左移动【遍历左子树】
                    continue;
                } else { // 第二次遍历到，那么再改此点朝向从 cur 到 null
                    mostRight.right = null;
                }
            } 
            // 将 Morris 中序放到处理完之后进行打印
            // 若有左子树，那么访问完左子树后开始
            // 若没有左子树，那么就是直接在右子树之前打印了
            System.out.print(cur.value + " ");
            // 若左孩子为空，直接跳到此处
            // 即直接向右孩子移动
            cur = cur.right;
        }
    }
```

#### 3.后序

因为之前递归的实现，是在第三次访问的时候进行 print ，但是 Morris 遍历没有第三次访问。

后序只关心能回到自己两次的节点。

- 对于 cur 只能到达一次的节点，直接跳过即可

- 对于 cur 可以到达两次的节点：

  1、第二次遍历到的时候，**逆序打印当前节点左子树的右边界**；

  2、遍历全部完成后，最后**逆序打印整棵树的右边界**。

  <img src="/assets/blog_image/2020-10-25-Coder-Advanced3_Morris/image-20201028132502444.png" alt="image-20201028132502444" style="zoom:67%;" />

```java
// 后序打印
    public static void morrisPosPrint(Node head) {
        if(head == null){
            return;
        }
        Node cur = head;
        // 最右节点
        Node mostRight = null;
        
        // 对每个节点进行遍历
        while (cur != null) {
            mostRight = cur.left;
            if(mostRight != null){// 如果存在左子树
                // 首先找到最右节点
                // 至于第二个判断，是由于第二次遍历会指向 cur 
                while(mostRight.right != null && mostRight.right != cur) {
                    mostRight = mostRight.right;
                }
                // 至此为左子树最右节点
                if(mostRight.right == null) {//表示第一次访问
                    mostRight.right = cur;
                    cur = cur.left;// 继续向左
                    continue;
                } else {//说明是第二次,那么改为指向 null 即可
                    mostRight.right = null;
                    // 逆序打印 cur 点的左子树右边界
                    reversePrintEdge(cur.left);
                }
            }
            // 若左孩子为空
            cur = cur.right;// 那么直接访问该节点的右子树
        }
        // 最后逆序打印整棵树的右边界
        reversePrintEdge(head);
    }
```

对于其中的 reversePrintEdge 逆序打印该点的右边界函数

![image-20201028134238108](/assets/blog_image/2020-10-25-Coder-Advanced3_Morris/image-20201028134238108.png)

```java
    // 逆序打印该点的右边界
    public static void reversePrintEdge(Node head) {
        Node tail = reverse(head);// 得到尾指针，即为 最右点
        Node cur = tail;// 将从尾指针开始打印
        while(cur != null) {
            System.out.print(cur.value + " ");
            cur = cur.right;
        }
        // 此时再将其反转
        reverse(tail);
    }
```

类似单链表的逆序，只不过单链表中的节点next，此处为 right 。

![image-20201028134254291](/assets/blog_image/2020-10-25-Coder-Advanced3_Morris/image-20201028134254291.png)

```java
    public static Node reverse(Node from) {
        Node pre = null;
        Node next = null;
        while(from != null) {// 此处from不等于 null，是由于转换为 next 后，最后一个为 null
            next = from.right;
            from.right = pre;
            pre = from;
            from = next;
        }

        return pre;
    }
```





### 3.现证明 时间复杂度为 O(N)

![image-20201028135100883](/assets/blog_image/2020-10-25-Coder-Advanced3_Morris/image-20201028135100883.png)

由之前过程可知，每次到达一个有左子树的节点，都要遍历这个节点左子树的右边界

根据 Morris 遍历的过程，所有需要遍历的右边界如下：

- 到达节点 1 两次，每次遍历其左子树的右边界：2->5->11
- 到达节点 2 两次，每次遍历其左子树的右边界：4->9 
- 到达节点 3 两次，每次遍历其左子树的右边界：6->13
- 到达节点 4 两次，每次遍历其左子树的右边界：8
- 到达节点 5 两次，每次遍历其左子树的右边界：10
- 到达节点 6 两次，每次遍历其左子树的右边界：12
- 到达节点 7 两次，每次遍历其左子树的右边界：14
- 可以看出，所有右边界的所有节点数量为 O(N) ，每条右边界都遍历两次，那么遍历所有节点左子树右边界的总代价为 O(N)。因此，Morris 遍历的时间复杂度还是 O(N)。

至此！Morris 遍历得以完成！二叉树神级方法完成！



































































































































































