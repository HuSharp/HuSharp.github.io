---
layout: post
title:  "洛谷 P1996 约瑟夫问题"
date:   2019-12-04 19:55:28 +0800
categories:  算法&DS
tags: 算法  数据结构
author: Hu#
typora-root-url: ..
---

* content
{:toc}


这个题目应是让我们采用双向链表进行模拟
当然可以采用queue<int>a进行模拟，但是为了能巩固链表知识，
决定记录一下
要练列表的本蒟蒻感谢这位大神@Mickey_snow
大神当年的洛谷账号https://www.luogu.com.cn/user/78371#problem


```
typedef struct list
{
	int ID;
	list* next = NULL;
	list* front = NULL;
}*List;
```
不能在结构体中用List front = NULL;(禁止套娃....

其中ID代表这个人的编号，输出时使用，另外两个指针分别指向上一个和下一个人，不过我们先要对其初始化。 使用两个变量n, m来分别存储总人数和出局的数，然后让链表之间互相链接，最后首尾相连。


下一步是进行链表初始化

```

	//初始化链表
	for (int i = 1; i < n-1; i++)
	{
		a[i].ID = i + 1;
		a[i].front = &a[i - 1];
		a[i].next = &a[i + 1];
	}
	a[0].ID = 1;
	a[0].front = &a[n - 1];
	a[0].next = &a[1];

	a[n - 1].ID = n ;
	a[n - 1].front = &a[n - 2];
	a[n - 1].next = &a[0];
```

链表初始化完成之后，我们可以使用一个结构体指针now来表示我们现在模拟到哪一个人了。

List flag = &a[0]; //指向目前报数的人的指针

最后，我们需要考虑怎么删除链表当中的某一项，将now->front的next更改为now->next，然后now->next的front更改为now->front就可以了。我们使用一个函数实现这一过程。

```
void output(List num)
{
	num = num->front;
	num->next = num->next->next;

	num = num->next;
	num->front = num->front->front;
}
```

贴上全部代码------------------------------------------
```c
#include<iostream>
using namespace std;

typedef struct list
{
	int ID;
	list* next = NULL;
	list* front = NULL;
}*List;

list a[100];

void output(List num)
{
	num = num->front;
	num->next = num->next->next;

	num = num->next;
	num->front = num->front->front;
}

int main()
{
	List flag = &a[0];

	int m, n;
	cin >> n >> m;

	int flagNum = 1;

	//初始化链表
	for (int i = 1; i < n-1; i++)
	{
		a[i].ID = i + 1;
		a[i].front = &a[i - 1];
		a[i].next = &a[i + 1];
	}
	a[0].ID = 1;
	a[0].front = &a[n - 1];
	a[0].next = &a[1];

	a[n - 1].ID = n ;
	a[n - 1].front = &a[n - 2];
	a[n - 1].next = &a[0];
	
	//操作
	while (n > 0)
	{
		if (flagNum == m)
		{
			cout << flag->ID << ' ';
			output(flag);
			flagNum = 1;
			n--;
			flag = flag->next;
		}
		else
		{
			flagNum++;
			flag = flag->next;
		}
	}

	cout << endl;
	return 0;
}
```

方法2：队列

若是使用链表，这题的复杂程度无疑大大上升了，其实，我们完全用不着那么麻烦，一个个地报数，可以想象成一个队列，将所有的元素压进队列
在进行循环（直到队列为空为止） 首先你要知道：
队列只可以在head删除，那么这就要求我们只要这个人经过判断并且不会被剔除，那么就必须把他排在队尾；
若这个人正好被剔除，那先输出他，再踢除。


```c
#include<iostream>
#include<queue>
using namespace std;

queue<int>a;

int main()
{
	int m, n;
	cin >> n >> m;

	int flag = 1;


	for (int i = 1; i <= n; i++)
		a.push(i);

	while (!a.empty())
	{
		if (flag == m)
		{
			cout << a.front() << ' ';
			a.pop();
			flag = 1;
		}
		else
		{
			flag++;
			a.push(a.front());
			a.pop();
		}
		
	}
}
```