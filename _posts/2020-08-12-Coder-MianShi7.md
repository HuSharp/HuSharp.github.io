---
layout: post
title:  "《程序员代码面试指南》（七）贪心问题"
date:   2020-08-12 10:12:51 +0800
categories:  算法&DS
tags: 算法  数据结构
author: Hu#
typora-root-url: ..
---

* content
{:toc}


## 贪心问题

### 1、最小代价问题

【题目】

​	 一块金条切成两半，是需要花费和长度数值一样的铜板的。比如长度为20的金条，不管切成长度多大的两半，都要花费20个铜板。一群人想整分整块金条，怎么分最省铜板？
​	例如，给定数组 {10，20，30} ，代表一共三个人，整块金条长度为 10+20+30=60.金条要分成10，20，30三个部分。如果，先把长度60的金条分成10和50，花费60；再把长度50的金条分成20和30，花费50；一共花费110铜板。
但是如果，先把长度60的金条分成30和30，花费60；再把长度30金条分成10和20，花费30一共花费90铜板。
​	输入一个数组，返回分割的最小代价。

【解答】

类似哈夫曼编码。求最小代价

用一个小根堆，将堆中每次 poll 出两个，并将得出的值再次放入堆中。

```java
	public static int lessMoney(int[] arr) {
		PriorityQueue<Integer> pQ = new PriorityQueue<Integer>();
		for (int i = 0; i < arr.length; i++) {
			pQ.add(arr[i]);
		}
		int sum = 0;
		int cur = 0;
		while(pQ.size() > 1) {//每次取两个
			cur = pQ.poll() + pQ.poll();
			sum += cur;
			pQ.add(cur);
		}
		return sum;
	}
```

![image-20200902164610669](/assets/blog_image/2020-08-12-Coder-MianShi7/image-20200902164610669.png)





### 2、项目收益最大化

【题目】

输入： 

```
参数1，正数数组costs 
参数2，正数数组profits 
参数3，正数k 
参数4，正数m
```

costs[i] 表示 i 号项目的花费 profits[i] 表示 i 号项目在扣除花费之后还能挣到的钱(利润) k表示你不能并行、只能串行的最多做 k 个项目 m 表示你初始的资金。
	说明：你每做完一个项目，马上获得的收益，可以支持你去做下一个 项目。
输出： 你最后获得的最大钱数。

【解答】

  先用一个小根堆存放各个项目，按照 costs 进行排序。然后循环将 小根堆中小于 W （即所拥有的资金数）的不断弹出到大根堆中。

  用一个大根堆，按照 prof 进行排序，存放的是 costs 小于当前资金的项目。弹出堆顶获取收益，更新 W 值，继续弹出小根堆中满足条件元素，直到大根堆为空（弹出次数上限为 k)，小根堆不能弹出为止。

```java
	public static int findMaximizedCapital(int k, int W, int[] Profits, int[] Capital) {
		ProjectByGreedy[] projects = new ProjectByGreedy[Profits.length];
		for (int i = 0; i < Profits.length; i++) {
			projects[i] = new ProjectByGreedy(Profits[i], Capital[i]);
		}
		
		PriorityQueue<ProjectByGreedy> minCostQ = new PriorityQueue<>(new MinCostComparator());
		PriorityQueue<ProjectByGreedy> maxProfQ = new PriorityQueue<>(new MaxProfitComparator());
		
		// 加入到小根堆中
		for (int i = 0; i < projects.length; i++) {
			minCostQ.add(projects[i]);
		}
		// 做
		for (int i = 0; i < k; i++) {
			while(!minCostQ.isEmpty() && minCostQ.peek().cost <= W) {
				maxProfQ.add(minCostQ.poll());
			}
			if(maxProfQ.isEmpty()) {// 没项目可做了
				return W;
			}
			W += maxProfQ.poll().prof;
		}
		return W;
	}
```





### 3、会议室选取

【题目】

一些项目要占用一个会议室宣讲，会议室不能同时容纳两个项目的宣讲。给你每一个项目开始的时间和结束的时间(给你一个数组，里面是一个个具体的项目)，你来安排宣讲的日程，要求会议室进行的宣讲的场次最多。返回这个最多的宣讲场次。

【解答】

​	按照早结束的进行排序

```java
	public static int bestArrange(Program[] programs, int cur) {
		Arrays.sort(programs, new ProgramComparator());
		int result = 0;
		
		for (int i = 0; i < programs.length; i++) {
			if(cur <= programs[i].start) {// 在end时间最早的项目中，选满足start的
				result++;
				cur = programs[i].end;
			}
		}
		return result;
	}
	
		// 按照 end 时间来排序
	public static class ProgramComparator implements Comparator<Program> {
		@Override
		public int compare(Program o1, Program o2) {
			return o1.end - o2.end;
		}
	}
```





