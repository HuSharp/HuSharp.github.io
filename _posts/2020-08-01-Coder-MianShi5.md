---
layout: post
title:  "《程序员代码面试指南》（五）HashMap"
date:   2020-08-01 8:22:11 +0800
categories:  算法&DS
tags: 算法  数据结构
author: Hu#
typora-root-url: ..
---

* content
{:toc}
## 五、HashMap问题



### 1、设计RandomPool结构

【题目】 设计一种结构，在该结构中有如下三个功能：

```
insert(key)：将某个key加入到该结构，做到不重复加入。
delete(key)：将原本在结构中的某个key移除。 
getRandom()：等概率随机返回结构中的任何一个key。
```

【要求】 Insert、delete和getRandom方法的时间复杂度都是 O(1)

【解答】

采用两个map

```
public HashMap<String, Integer> map1;
public HashMap<Integer, String> map2;
```

如下图解释所示，map1 用于存放 key ，其value值表示第几个加入（为方便之后的等概率随机）

![QQ图片20200803084531](/assets/blog_image/2020-08-01-Coder-MianShi5/QQ图片20200803084531.jpg)

 1. 对于 insert  ，当map1 中不包含时，插入key, size++

    ```
    	public void insert(String key) {
    		if(!map1.containsKey(key)) {
    			map1.put(key, ++this.size);
    			map2.put(this.size, key);
    		}
    	}
    ```

	2. 对于 delete ，为确保之后等概率，需要将 删除那一条 与 最后一条进行 swap。swap 的形式是：将 key为序号 size（即最后一个）的那一条，取代为删除 key 的 序号，并将size--。map1 中也随即改变对应值的 value。——————详情见上图

    以确保 map2 中数字范围一直是 size

    ```
    public void delete(String key) {
    	if(map1.containsKey(key)) {
    		String last = map2.get(this.size);//获得最后一个
    		int deleteIndex = map1.get(key);// 获得删除的序号，需要赋给最后一个
    		map2.remove(this.size--); // map2让size--
    		// 并且需要改掉之前最后一个的index, 
    		// 或者说改掉 key（作为value） 对应index 的value
    		map2.put(deleteIndex, last);
    				
    		map1.remove(key);
    		map1.put(last, deleteIndex);
    	}
    }
    ```

	3. 由于删除一直是删除序号为size的那一行值，因此random便简单的随机取值就行。

    ```
    public String getRandom() {
    	int num = (int) ((Math.ceil(Math.random() * this.size)));// 取1~size
    	return map2.get(num);
    }
    ```



### 2、认识并查集结构

对于并查集，主要是两个操作—— find & union

现对于存储方式：

1. 首先考虑数组存储。如图，时间复杂度过于高![QQ图片20200808092909](/assets/blog_image/2020-08-01-Coder-MianShi5/QQ图片20200808092909.jpg)

2. 因此采用有向多叉树的方式。根节点作为代表节点，并用根节点标识集合大小（采用HashMap的方式）

   ```
   public static class UnionFindSet{
   	public HashMap<Node, Node> fatherMap;// key:child, value:father
   	public HashMap<Node, Integer> setSize;//每个代表节点代表集合大小
   }
   ```

   fatherMap：key:child, value:father ，对于根节点自己指向自己。

   因此寻找根节点只需判断——当前节点父节点是否等于自己即可

   1. 递归方式：

      ```
      	// 递归版本
      	private Node findHead(Node node) {
      		Node father = fatherMap.get(node);
      		if(father != node) {
      			father = findHead(node);
      		}
      		fatherMap.put(node, father); //将其node的father更新 
      		return father;
      	}
      ```

      **路径压缩**——**并在每次查询后将查询节点指向代表节点   O(lgn)-->O(1)**

      ![QQ图片20200808092929](/assets/blog_image/2020-08-01-Coder-MianShi5/QQ图片20200808092929.jpg)

   2. 非递归版本

      其思路是，对向上找的节点进行 stack 的存储，一旦找到了，分别将这些节点弹出，指向根节点，以达到路径压缩。

      ```
      	// 非递归版本
      	private Node findHeadUncur(Node node) {
      		Stack<Node> stack = new Stack<Node>();
      			
      		Node cur = node;
      		Node parent = fatherMap.get(cur);//获取当前parent
      			
      		while(cur != parent) {
      			stack.push(cur);
      			cur = parent;
      			parent = fatherMap.get(cur);
      		}// 至此 parent 为代表节点
      			
      		while(!stack.isEmpty()) {
      			fatherMap.put(stack.pop(), parent);//将其全部赋为parent
      		}
      			
      		return parent;
      	}
      ```

3. Union 函数

   采用 规模小的树的根节点指向 规模大的树的根节点

   先进行 find 操作找到根节点，每个根节点中储存的有该树大小

   ```
   	public void union(Node a, Node b) {
   		if(a==null || b==null)
   			return;
   			
   		Node aHead = findHead(a);
   		Node bHead = findHead(b);
   		if(aHead != bHead) {//不等于才需要合并
   			int aSetSize = setSize.get(aHead);
   			int bSetSize = setSize.get(bHead);
   				
   			if(aSetSize > bSetSize) {//便将b合并到a中
   				fatherMap.put(bHead, aHead);
   				setSize.put(aHead, aSetSize+bSetSize);
   			}else {
   				fatherMap.put(aHead, bHead);
   				setSize.put(bHead, aSetSize+bSetSize);
   			}
   		}
   	}
   ```

    



### 3、岛问题

【问题】

一个矩阵中只有0和1两种值，每个位置都可以和自己的上、下、左、右
四个位置相连，如果有一片1连在一起，这个部分叫做一个岛，求一个
矩阵中有多少个岛？
举例：

> 0 0 1 0 1 0
> 1 1 1 0 1 0
> 1 0 0 1 0 0
> 0 0 0 0 0 0

这个矩阵中有三个岛。

【解答】

**初阶思路**

对整个矩阵用 两个 for 循环嵌套进行遍历，若发现为 1 的，便利用感染函数对该块进行 1->2 并将岛的数量++；

```
	public static int countIslands(int[][] m) {
		if (m == null || m[0] == null) {
			return 0;
		}
		
		int M = m.length;
		int N = m[0].length;
		int res = 0;
		for (int i = 0; i < M; i++) {
			for (int j = 0; j < N; j++) {
				if(m[i][j] == 1) {
					res++;
					infect(m, i, j, M, N);
				}
			}
		}
		return res;
	}
```

感染函数的实现

```
	public static void infect(int[][] m, int i, int j, int M, int N) {
		if(i<0 || i>=M || j<0 || j>=N || m[i][j] != 1)//过边界
			return ;
		
		m[i][j] = 2; // 将 1 变为 2
		infect(m, i+1, j, M, N);
		infect(m, i-1, j, M, N);
		infect(m, i, j+1, M, N);
		infect(m, i, j-1, M, N);
	}
```



**进阶思路**——实现并行计算（多线程进行计算

需要解决问题：1.每个块如何遍历；2.所有块怎么合并

​					例如：![image-20200809091802771](/assets/blog_image/2020-08-01-Coder-MianShi5/image-20200809091802771.png)

​	现在划分为两个块，中间一个大块就变成了两个块

**【解决方案】**

1.首先对每个块进行之前一样的遍历，并标注每个块一个唯一的特征。如下图的A,B,C

![image-20200809091938235](/assets/blog_image/2020-08-01-Coder-MianShi5/image-20200809091938235.png)

2.现在对多个块进行合并，将连接在一起的块合并为一个集合，即采用并查集。每次合并集合时，对岛的总数量进行-1，若遍历时发现之前已经在一个并查集了，便跳过，岛数量不变。



### 4、认识位图 bitMap

【定义】

位图（Bitmap）是一种特殊的序列结构，可用以动态地表示由一组（无符号）整数构成的集合。其长度无限，且其中每个元素的取值均为布尔型（初始均为false），且每个元素用bit来表示，1——true；0——false；

支特的操作接口主要包括：

```
void set（int i）；//将第i位置为true（将整数i加入当前集合）
void clear（int i）；//将第i位置为false（从当前集合中删除整数1）
bool test（int i）；//测试第i位是否为true（判断整数i是否属于当前集合）
```

位图的构造函数：

```
public class BitMap {
	//char类型存储数字的时候，只占1个字节，也就是8位。
	private char[] bytes;//位图存放空间
	private int nbits;//容量为nbits
	
	public BitMap(int aNbits) {
		this.nbits = aNbits;
		this.bytes = new char[aNbits/8 + 1];
	}
}
```

方法实现：

1.set 方法：**异或**

```
	public void set(int k) {//将k位置设为true
		if(k > nbits)	return;
		int byteIndex = k/8;
		int bitIndex = k%8;
		
		bytes[byteIndex] |= (1<<bitIndex);//异或将指定位变为true
	}
```

2.get方法：**取与**

```
	public boolean get(int k) {//得到第k位的参数
		if(k > nbits)	return false;
		int byteIndex = k/8;
		int bitIndex = k%8;
		
		return (bytes[byteIndex] & (1<<bitIndex)) != 0;
	}
```

3.test 方法

```
	public static void test(int local, int len) {
		BitMap bitMap = new BitMap(100);
		bitMap.set(local);
		for (int i = 0; i < len; i++) {
			if(bitMap.get(i) == true)
				System.out.print("1");
			else {
				System.out.print("0");
			}
		}
		System.out.println();
	}
```

<img src="/assets/blog_image/2020-08-01-Coder-MianShi5/image-20200811094941235.png" alt="image-20200811094941235" style="zoom:200%;" />



### 5、布隆过滤器

【题目】
不安全网页的黑名单包含100亿个黑名单网页，每个网页的URL最多占用64B。现在想要实现一种网页过滤系统，可以根据网页的URL判断该网页是否在黑名单上，请设计该系统

【要求】
1.该系统允许有万分之一以下的判断失误率。
2.使用的额外空间不要超过30GB。

【解答】

​	如果把黑名单中所有的URL通过数据库或哈希表保存下来，就可以对每条URL进行查询，但是每个URL有64B，数量是100亿个，所以至少需要640GB的空间，不满足要求2。
​	如果面试者遇到网页黑名单系统、垃圾邮件过滤系统、爬虫的网址判重系统等题目，又看到系统容忍一定程度的失误率，但是对空间要求比较严格，那么很可能是面试官希望面试者具备布隆过滤器的知识。一个布隆过滤器精确地代表一个集合，并可以精确判断一个元素是否在集合中。注意，只是精确代表和精确判断，到底有多精确呢？则完全在于你具体的设计，但想做到完全正确是不可能的。布隆过滤器的优势就在于使用很少的空间就可以将准确率做到很高的程度，该结构由Burton Howard Bloom于1970年提出。

​	因此采用位图进行过滤：

![QQ图片20200811100558](/assets/blog_image/2020-08-01-Coder-MianShi5/QQ图片20200811100558.jpg)

**因此失误率与bitMap的长度成反比**

![QQ图片20200811101320](/assets/blog_image/2020-08-01-Coder-MianShi5/QQ图片20200811101320.jpg)





### 6、一致性哈希

【题目】
	工程师常使用服务器集群来设计和实现数据缓存，以下是常见的策略：

1. 无论是添加、查询还是删除数据，都先将数据的id通过哈希函数转换成一个哈希值，记为key。
2. 如果目前机器有N台，则计算key%N的值，这个值就是该数据所属的机器编号，无论是添加、删除还是查询操作，都只在这台机器上进行。请分析这种缓存策略可能带来的问题，并提出改进的方案。

【解答】

#### 1、一致性哈希实现思路（基础版）

​	**面临问题：**题目中描述的缓存策略的潜在问题是如果增加或删除机器时（ N 变化）代价会很高，所有的数据都不得不根据 id 重新计算一遍哈希值，并将哈希值对新的机器数进行取模操作，然后进行大规模的数据迁移。

​	**解决方案**，下面介绍一下**一致性哈希算法**，这是一种很好的数据缓存设计方案。我们假设数据的id通过哈希函数转换成的哈希值范围是2^32，也就是0-（2^32)-1的数字空间中。现在我们可以将这些数字头尾相连，想象成一个闭合的环形，那么一个数据id在计算出哈希值之后认为对应到环中的一个位置上，如图6-3所示。
​	接下来想象有三台机器也处在这样一个环中，这三台机器在环中的位置根据机器id计算出的哈希值来决定。那么一条数据如何确定归属哪台机器呢？首先把该数据的id用哈希函数算出哈希值，并映射到环中的相应位置，然后**顺时针找寻离这个位置最近的机器**，那台机器就是该数据的归属，如图6-4所示。

![image-20200811101841828](/assets/blog_image/2020-08-01-Coder-MianShi5/image-20200811101841828.png)

​	**实现方法：**

> 现存在多个机器，如 m1,m2,m3，现在对其 hash 后得到的值组成一个**有序数组**，假设为 [m1, m3, m2]， 现在加入数据时 对于数据求 hash 后**顺时针距离最近**的机器则为放入机器。

​	在图6-4中，data1 根据其id计算出的哈希值为key1，顺时针的第一台机器是machine2，所以datal归属machine2；同理，data2归属machine3，data3 和 data4都归属machinel。
​	假设有两台机器（ml、m2）和三个数据（datal、data2、data3），数据和机器在环中的结构如下图左所示。如果此时想加入新的机器m3，同时算出机器m3的 id 在ml与m2右半侧的环中，那么发生的变化如下图右所示。

​	即将 m3 和 m1 之间原本属于 m2 的数据移到 m3 中。删除同理

![](/assets/blog_image/2020-08-01-Coder-MianShi5/image-20200811103635306.png)

#### 2、一致性哈希实现负载均衡（采用虚拟节点技术

现在又面临一个问题——机器负载不均时的处理。如果机器较少，很有可能造成机器在整个环上的分布不均匀，从而导致机器之间的负载不均衡，如下图所示的两台机器，ml可能比m2面临更大的负载。

![image-20200811103943671](/assets/blog_image/2020-08-01-Coder-MianShi5/image-20200811103943671.png)

**解决方案：**现在将各个机器虚拟为多个节点：如 m1 分为： m1-1, m1-2, m1-3....m1-1000; 然后将这些节点按照之前的步骤类比为一个机器，这样均衡的平衡性就好多了。