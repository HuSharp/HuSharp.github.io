---
layout: post
title:  "《程序员代码面试指南》（一）栈和队列"
date:   2020-07-20 8:21:00 +0800
categories:  算法&DS
tags: 算法  数据结构
author: Hu#
typora-root-url: ..
---

* content
{:toc}

## 一、栈和队列

### 1.设计一个有 getMin 功能的栈

实现一个特殊的栈，在实现栈的基本功能的基础上，再实现返回栈中最小元素的操作。

【要求】

1．pop、push、getMin操作的时间复杂度都是O(1)。
2．设计的栈类型可以使用现成的栈结构。

【解答】

​	法一：

​	1.push ：安放两个栈data栈 & Min栈，data 用于基本操作， min 用于存储每一步最小值，若没有 Min 的栈顶小，则不存入。

​	注意！记住相等时也要压入

```
if(help.isEmpty() || pushNum <= help.peek())
	help.push(pushNum);
```

![image-20200720083434202](/assets/blog_image/2020-07-20-Coder-MianShi1/image-20200720083434202.png)

​	2.pop： 在 data 栈 pop 时，和 MIn 栈顶进行判断，若 data 的 pop 数据大于Min栈顶时，MIn 栈顶不进行修改，若等于曾将栈顶一并弹出。

​	3. getmin： 直接查询 Min 栈顶



​	法二：

​	与法一最大的区别就是，若没有 Min 栈顶小，则重复存入。

![image-20200720091650863](/assets/blog_image/2020-07-20-Coder-MianShi1/image-20200720091650863.png)

**对比：** 法一 Min 进行push 时省空间，但弹出时稍微费时间（需要判断是否为最小值）；而 法二直接弹出当前值即可，但是在 push 时需要进行判断大小。



### 2.如何仅用队列结构实现栈结构？如何仅用栈结构实现队列结构？

#### 1.两个栈实现队列

1. add： 加入到 push 栈

 	2. poll：将 push 栈中**全部**元素倒入 pop 栈
 	3. **倒入规则：pop栈不全部为空时，不能倒入； 倒入时要全部倒入**

![image-20200720143405446](/assets/blog_image/2020-07-20-Coder-MianShi1/image-20200720143405446.png)

#### 2.两个队列实现栈

![image-20200720145215397](/assets/blog_image/2020-07-20-Coder-MianShi1/image-20200720145215397.png)

1. push：放入 data 队列中
2. pop：将 data 除队尾数字全部依次放到 help 队列中，将队尾取出作为 pop 元素，并将 help 与 data 交换引用。

```java
	public void swap() {
		Queue<Integer> temp = help;
		help = data;
		data = temp;
	}
```



### 3.如何仅用递归函数和栈操作逆序一个栈

【题目】
一个栈依次压入1、2、3、4、5，那么从栈顶到栈底分别为5、4、3、2、1。将这个栈转置后，从栈顶到栈底为1、2、3、4、5，也就是实现栈中元素的逆序，但是只能用递归函数来实现，不能用其他数据结构。

【解答】

1. 要想实现对栈的逆序递归，需要将栈底元素取出并递归调用，当栈取完时 return。并在递归返回时开始压栈到另一个栈中。

 	2. 对于栈底元素的取出，需要实现一个递归函数 getAndRemoveElement ；
 	3. 因此 共要实现两个递归函数

```java
	// 1. 利用递归函数将栈底元素返回并输出
	public static int getAndRemoveStack(Stack<Integer> data) {
		int res = data.pop();// 需要移除
		if(data.isEmpty())
			return res;
		else {
			int last = getAndRemoveStack(data);// 传递返回值
			data.push(res);
			return last;// 需要将last返回传递到开始函数
		}
	}
```

​									![image-20200801163012287](/assets/blog_image/2020-07-20-Coder-MianShi1/image-20200801163012287.png)	

```java
	// 2. 将每次栈底元素压回栈
	public static void reverse(Stack<Integer> stack) {
		if(stack.isEmpty())
			return;
		else {
			int last = getAndRemoveElement(stack);
			reverse(stack);
			stack.push(last);
		}
	}
```

![image-20200801163030102](/assets/blog_image/2020-07-20-Coder-MianShi1/image-20200801163030102.png)





### 4.猫狗队列

【题目】

 宠物、狗和猫的类如下：

```java
public class Pet { private String type;
	public Pet(String type) { this.type = type; }
	public String getPetType() { return this.type; }
}
public class Dog extends Pet { public Dog() { super("dog"); } }
public class Cat extends Pet { public Cat() { super("cat"); } }
```

实现一种狗猫队列的结构，要求如下： 
	用户可以调用add方法将cat类或dog类的实例放入队列中； 
	用户可以调用pollAll方法，将队列中所有的实例按照进队列的先后顺序依次弹出； 
	用户可以调用pollDog方法，将队列中dog类的实例按照进队列的先后顺序依次弹出； 
	用户可以调用pollCat方法，将队列中cat类的实例按照进队列的先后顺序依次弹出； 
	用户可以调用isEmpty方法，检查队列中是否还有dog或cat的实例；
	用户可以调用isDogEmpty方法，检查队列中是否有dog类的实例； 
	用户可以调用isCatEmpty方法，检查队列中是否有cat类的实例。

【解答】

主要强调以下问题：

1. 不能采用：cat队列只放cat实例，dog队列只放dog实例，再**用一个总队列放所有的实例**。
   错误原因：cat、dog以及总队列的更新问题。

2. 本题实现将不同的实例盖上**时间戳**的方法，但是**又不能改变用户本身的类**，所以定义一个新的类。

   ```java
   public static class PetEnter{
   	private Pet pet;
   	private int count;//时间戳记录次序
   		
   	public PetEnter(Pet pet, int count) {
   		this.pet = pet;
   		this.count = count;
   	}
   }
   ```

3. 并采用两个队列，一个 cat 一个 dog， 存放的类是新类（包含类型和时间戳）。

4. 当按照实际顺序取出时，因为 dogQ 的队列头表示所有dog实例中最早进队列的实例，同时 catQ 的队列头表示所有的cat实例中最早进队列的实例。则比较这两个队列头的时间戳，谁更早，就弹出谁。

   ```java
   public Pet pollAll() {
   	if(!catQ.isEmpty() && !dogQ.isEmpty()) {
   		if(catQ.poll().count < dogQ.poll().count) {//poll出时间戳小的
   			return catQ.poll().getPet();
   		}else {
   			return dogQ.poll().getPet();
   		}
   	}//至此必定有一个为空
   	else if (!dogQ.isEmpty()) {
   		return dogQ.poll().getPet();
   	}else if (!catQ.isEmpty()) {
   		return catQ.poll().getPet();
   	}else {
   		throw new RuntimeException("error! two queue are empty!");
   	}
   }
   ```




### 5.用一个栈实现另一个栈的排序

【题目】
一个栈中元素的类型为整型，现在想将该栈从顶到底按从大到小的顺序排序，只许申请一个栈。
除此之外，可以申请新的变量，但不能申请额外的数据结构。如何完成排序？

【解答】

采用一个help栈，由于最终是自顶向下从大到小，那么应该在help栈中是自顶向下从小到大，因此，在每次stack的pop操作时，先将pop值存到cur变量中，再将cur与help栈顶比较（help为空时压入）

1. 若 cur > help.peek 值，那么弹出peek 循环比较；

 	2. 若 cur <= help.peek 值，那么直接压入 help 栈中；

```java
public static void sortStackByStack(Stack<Integer> stack) {
		Stack<Integer> help = new Stack<Integer>();
		while(!stack.isEmpty()) {
			int cur = stack.pop();
			while(!help.isEmpty() && help.peek() < cur) {
				stack.push(help.pop());
			}
			help.push(cur);
		}
		while(!help.isEmpty()) {
			stack.push(help.pop());
		}
	}
```


