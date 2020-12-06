---
layout: post
title:  "《程序员代码面试指南》（三）链表问题"
date:   2020-07-24 8:40:00 +0800
categories:  算法&DS
tags: 算法  数据结构
author: Hu#
typora-root-url: ..
---

* toc
{:toc}

## 三、链表问题

### 1、反转单向和双向链表

【题目】 分别实现反转单向链表和反转双向链表的函数。
【要求】 如果链表长度为N，时间复杂度要求为O(N)，额外空间
复杂度要求为O(1)

----------

【解答】

1. **单向链表**

   共需要三个指针进行 swap：cur（head），pre，next

   1. 先保存 cur 的 next 到 next 指针
   2. 将 cur 的 next 指向 pre（pre初始为null）
   3. pre 指向当前指针，head 指向 next 指针（移到下一个）

   ```java
   public static Node reverseList(Node head) {
   		Node pre = null; 
   		Node next = null;
   		
   		while(head != null) {
   			next = head.next;
   			head.next = pre;
   			pre = head;
   			head = next;
   		}
   		return pre;
   	}
   ```

2. **双向链表**

   共需要三个指针进行swap：cur（head），pre，next

   1. 先保存cur的next到next指针
   2. 将cur的next指向pre（pre初始为null），cur的last指向next
   3. pre指向当前指针，head指向next指针（移到下一个）

   即比单向链表的swap多一个将last指向next

   ```java
   public static DoubleNode reverseList(DoubleNode head) {
   		DoubleNode pre = null; 
   		DoubleNode next = null;
   		
   		while(head != null) {
   			next = head.next;
   			head.next = pre;
   			head.last = next;
   			pre = head;
   			head = next;
   		}
   		return pre;
   	}
   ```





### 2、判断一个链表是否为回文结构

​	【题目】 给定一个链表的头节点head，请判断该链表是否为回文结构。 例如： 1->2->1，返回true。 1->2->2->1，返回true。15->6->15，返回true。 1->2->3，返回false。
​	进阶： 如果链表长度为N，时间复杂度达到O(N)，**额外空间复杂度达到O(1)**。

-------

​	【解答】

共有三种方法，难度依次增加：

**法一：**全部遍历存储到栈 ， 利用栈来逆向对比。

```java
		// 先全部存入栈中
		while(head != null) {
			stack.push(head);
			head = head.next;
		}
		head = p;
		// 再逆向对比
		while(head != null) {
			if(stack.pop().value != head.value)
				return false;
			head = head.next;
		}
```

**法二：**利用快慢指针， 到达中点后，开始逆向压栈对比

与法一本质一样，还是压栈进行对比，不过只压入右半部分的栈。

```java
		while(fast != null && fast.next != null) {
			fast = fast.next.next;
			slow = slow.next;
		}// 至此 位于对称轴两侧或者对称轴上
		// 现将右侧压栈
		while(slow != null) {
			stack.push(slow);
			slow = slow.next;
		}
		... 之后就是进行对比
```

**法三：**不采用其他数据结构，巧妙利用几个变量进行翻转，以满足进阶要求的空间O(1)。

步骤：

1. 将右半部分进行翻转
2. 再从两头同时比较节点 value ，直到中间点
   3. 将链表恢复成之前样子

![image-20200725085916329](/assets/blog_image/2020-07-24-Coder-MianShi3/image-20200725085916329.png)

代码实现如下：

1. 先通过法二的快慢指针时 fast 指针到达中部

2. 使 fast 指针指向右部第一个，slow 指针（此时即中间点）指向 null 

   ```java
   fast = slow.next;//右部第一个
   slow.next = null;  // mid -> null
   ```

3. 对右部进行翻转（详情见第一题单链表的翻转）

   ```java
   		Node temp = null;//暂存节点
   		// 对右部进行翻转
   		while(fast != null) {
   			temp = fast.next; //temp为next
   			fast.next = slow; // slow为pre
   			slow = fast;
   			fast = temp;
   		}// 至此已经翻转完毕，fast指向最右
   		temp = slow; //保存最右节点
   ```

4. 现对回文进行验证

   ```java
   		fast = head; // fast指向第一个	
   		boolean res = true;
   		while(fast != null && slow != null) {
   			if(fast.value !=  slow.value) {
   				res = false;//不能直接return ， 因为还需要对链表右侧进行恢复
   			}
   			fast = fast.next;
   			slow = slow.next;
   		}//至此说明满足回文
   ```

5. 进行恢复

   ```java
   		slow = temp.next; // 倒数第二个
   		temp.next = null; // 指向null
   		while(slow != null) {//由于中点指向null
   			fast = slow.next; //暂存
   			slow.next = temp;
   			temp = slow;
   			slow = fast;
   		}
   ```

   



### 3、将单向链表按某值划分成左边小、中间相等、右边大的形式

【题目】 给定一个单向链表的头节点head，节点的值类型是整型，再给定一个整数 pivot 。实现一个调整链表的函数，将链表调整为左部分都是值小于 pivot 的节点，中间部分都是值等于 pivot 的节点，右部分都是值大于 pivot的节点。除这个要求外，对调整后的节点顺序没有更多的要求。 例如：链表9->0->4->5->1，pivot=3。 调整后链表可以是1->0->4->9->5，也可以是0->1->9->5->4。总之，满 足左部分都是小于3的节点，中间部分都是等于3的节点（本例中这个部分为空），右部分都是大于3的节点即可。对某部分内部的节点顺序不做要求。

**进阶：**
在原问题的要求之上再增加如下两个要求。

- 在左、中、右三个部分的内部也做顺序要求，要求每部分里的节点从左到右的顺序与原链表中节点的先后次序一致。（即保持稳定性）
  		例如：链表9->0->4->5->1，pivot=3。调整后的链表是0->1->9->4->5。在满足原问题要求的同时，左部分节点从左到右为0、1。在原链表中也是先出现0，后出现1；中间部分在本例中为空，不再讨论；右部分节点从左到右为9、4、5。在原链表中也是先出现9，然后出现4，最后出现5。
- 如果链表长度为N，时间复杂度请达到O（N），额外空间复杂度请达到O（l）。

------

【解答】

1. **普通方法**：即荷兰国旗问题。（详见之前内容）

   ```java
   public static void arrPartition(Node[] arr, int pivot) {
   		int small = -1;
   		int big = arr.length;
   		int index = 0;//指向当前点
   		while(index != big) {
   			if(arr[index].value < pivot)
   				swap(arr, ++small, index++);
   			else if (arr[index].value > pivot) {
   				swap(arr, --big, index);// 不一定转换过来的比pivot 大
   			}else {
   				index++;
   			}
   		}	
   	}
   ```

2. **进阶方法**：

   1. 将原链表中的所有节点依次划分为**三个链表**，三个链表分别为smal代表左部分，equal代表中间部分，big代表右部分。
   2. 将small、equal和big三个链表重新串起来即可。
   3. 整个过程需要特别注意对null节点的判断和处理。

   ```java
   		if(head.value < pivot) {// 加入进左部分链表
   			if(sH == null) { // sH表示small的Head
   				sH = head;
   				sT = head;
   			}else { // 不为空就加入到后面
   				sT.next = head;
   				sT = sT.next;
   			}
   		}else if (head.value == pivot) { // 中间部分
   			...	
   		} else { // 右部分
   			...
   ```

   至此 已经将各个链表做好，现在需要将其串起来

   ```java
   		if(sT != null) { // small 和 equal 链接
   			sT.next = eH;
   			eT = eT == null ? sT : eT;
   		}
   		if (eT != null) { // equal 和 big 链接
   			eT.next = bH;
   		}
   		return sH != null ? sH : eH !=null ? eH :bH; 
   ```





### 4、两个单链表相交的一系列问题

【题目】 

​	在本题中，单链表可能有环，也可能无环。给定两个单链表的头节点 head1和head2，这两个链表可能相交，也可能不相交。请实现一个函数， 如果两个链表相交，请返回相交的第一个节点；如果不相交，返回null 即可。 

【要求】

​	如果链表 1 的长度为N，链表 2 的长度为M，时间复杂度请达到 O(N+M)，额外
空间复杂度请达到O(1)。

【解答】

​	首先，若不要求复杂度，此题可以采用 Map 来存放已有点，在每次存放点时，都进行判断，若之前已经存在，则说明相交。

​	但是由于此题要求空间复杂度O(1)，因此需要进行很多思考。

​	本题可以拆分成三个子问题，每个问题都可以作为一道独立的算法题，具体如下。

问题一：如何判断一个链表**是否有环**，如果有，则返回第一个进入环的节点，没有则返回null。
问题二：如何判断两个**无环链表是否相交**，相交则返回第一个相交节点，不相交则返回null。
问题三：如何判断两个**有环链表是否相交**，相交则返回第一个相交节点，不相交则返回null。
	注意：如果一个链表有环，另外一个链表无环，它们是不可能相交的，直接返回null。
下面逐一分析每个问题。

1. #### 是否有环 

   利用快慢指针进行判断，最终返回节点

   ```java
   	public static Node getLoopNode(Node head) {
   		if (head == null || head.next == null || head.next.next == null) 
   			return null;
   		
   		Node fast = head.next.next;
   		Node slow = head.next; // 利用快慢指针
   		while(fast != slow) {
   			if(fast.next == null || fast.next.next == null) {//至此到结尾，即无环
   				return null;
   			}
   			fast = fast.next.next;
   			slow = slow.next;
   		}// 至此 说明有环
   		slow = head;
   		while(slow != fast) {
   			slow = slow.next;
   			fast = fast.next;
   		}
   		return fast;
   	}
   ```

2. #### 两个无环链表是否相交的判断

   1. 链表1从头节点开始，走到最后一个节点（不是结束），统计链表1的长度记为len1，同时记录链表1的最后一个节点记为end2。
   2. 链表2从头节点开始，走到最后一个节点（不是结束），统计链表2的长度记为len2，同时记录链表2的最后一个节点记为end2。
   3. 如果end1 ！= end2，说明两个链表不相交，返回null 即可；如果end-=end2，说明两个链表相交，进入步骤4来找寻**第一个相交节点**。
   4. 如果链表1比较长，链表1就先走len1-len2步；如果链表2比较长，链表2就先走len2-len1步。然后两个链表一起走，一起走的过程中，两个链表第一次走到一起的那个节点，就是第一个相交的节点。

   ```java
   	// 两个无环链表相交
   	public static Node noLoop(Node head1, Node head2) {
   		if(head1 == null || head2 == null)
   			 return null;
   		
   		Node cur1 = head1;
   		Node cur2 = head2;
   		int len1 = 0;
   		int len2 = 0;
   		while(cur1.next != null) {
   			len1++;
   			cur1 = cur1.next;
   		}
   		while(cur2.next != null) {
   			len2++;
   			cur2 = cur2.next;
   		}
   		
   		if(cur1 != cur2) {// 不相等说明不相交
   			return null;
   		}
   		// 至此说明相交，需要返回相交点，将长的那一个链表先走
   		int n = Math.abs(len1-len2); // 取差值
   		cur1 = head1;
   		cur2 = head2;
   		if(len1 > len2) {// 让head1先走
   			while(n!=0) {
   				n--;
   				cur1 = cur1.next;
   			}
   		}else {
   			while(n!=0) {
   				n--;
   				cur2 = cur2.next;
   			}
   		}// 至此再开始同时走
   		while(cur1 != cur2) {
   			cur1 = cur1.next;
   			cur2 = cur2.next;
   		}// 至此到达相交点
   			
   		return cur1;
   	}
   ```

3. #### 两个有环链表的判断

   主要分为两种情况：

   1. loop1 == loop2  说明必然相交，但相交的第一个节点不一定为 loop ，如图

      ![image-20200726094748708](/assets/blog_image/2020-07-24-Coder-MianShi3/image-20200726094748708.png)

   2. loop1 != loop2 此时也分为两种情况

      ​							![image-20200726094748708](/assets/blog_image/2020-07-24-Coder-MianShi3/image-20200726094748708.png)												![image-20200726094756277](/assets/blog_image/2020-07-24-Coder-MianShi3/image-20200726094756277.png)

      因此需要让 loop1 进行循环，若是能遍历到 loop2 则说明为情况 2 ，此时返回 loop1 或者 loop2 都算正确。

      ```java
      	// 两个有环链表相交
      	public static Node bothLoop(Node head1, Node loop1, Node head2, Node loop2) {
      		Node cur1 = head1;
      		Node cur2 = head2;
      		
      		// 首先判断loop是否相等，相等必然相交，但是相交点不一定为loop
      		if(loop1 == loop2) {// 结尾处是loop 且从两链表从同一点进入环
      			// 因此与noLoop方法一致, 只不过结尾是 loop点
      			int len1 = 0;	int len2 = 0;
      			while(cur1 != loop1) {
      				len1++;	cur1 = cur1.next;
      			}
      			while(cur2 != loop2) {
      				len2++;	cur2 = cur2.next;
      			}
      			
      			// 将长的那一个链表先走
      			int n = Math.abs(len1-len2); // 取差值
      			cur1 = head1;
      			cur2 = head2;
      			if(len1 > len2) {// 让head1先走
      				while(n!=0) {
      					n--;
      					cur1 = cur1.next;
      				}
      			}else {
      				while(n!=0) {
      					n--;
      					cur2 = cur2.next;
      				}
      			}// 至此再开始同时走
      			while(cur1 != cur2) {
      				cur1 = cur1.next;
      				cur2 = cur2.next;
      			}// 至此到达相交点
      				
      			return cur1; 
      		}else {// 至此loop1 不等于 loop2
      			cur1 = loop1.next;
      			while(cur1 != loop1) {//对loop1绕一圈
      				if(cur1 == loop2)
      					return loop1;// 返回loop2也一样
      				cur1 = cur1.next;
      			}//至此说明没有相交
      			return null;
      		}
      	}
      ```

      

