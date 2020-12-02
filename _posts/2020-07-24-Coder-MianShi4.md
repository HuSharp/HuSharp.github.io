---
layout: post
title:  "《程序员代码面试指南》（四）二叉树问题"
date:   2020-07-24 10:40:00 +0800
categories:  算法&DS
tags: 算法  数据结构
author: Hu#
typora-root-url: ..
---

* content
{:toc}
## 四、二叉树问题

### 1、实现二叉树的先序、中序、后序遍历，包括递归方式和非递归

方式

1）递归版本

​	先序 中序 后序的区别在于——在遍历点第几次（每个点都会遍历3次）打印

```
1.先序
	public static void preOrderRecur(Node head) {
		if(head == null)
			return;
		
		System.out.print(head.value + " ");
		preOrderRecur(head.left);
		preOrderRecur(head.right);
	}
	
2.中序
		inOrderRecur(head.left);
		System.out.print(head.value + " ");
		inOrderRecur(head.right);
3.后序
		posOrderRecur(head.left);
		posOrderRecur(head.right);
		System.out.print(head.value + " ");
```

2）非递归

1. **先序**

   1.申请一个新的栈，记为stack。然后将头节点head压入stack中。
   2.从stack中弹出栈顶节点，记为cur，然后打印cur节点的值，再将节点cur的右孩子（不为空的话）先压入stack中，最后将cur的左孩子（不为空的话）压入stack中。（先右后左，因为打印是先左后右）
   3.不断重复步骤2，直到stack为空，全部过程结束。

   ```
   public static void preOrderUnRecur(Node head) {
   		System.out.print("pre-UnRecurOrder:");
   		if(head != null) {
   			Stack<Node> stack = new Stack<Node>();
   			stack.add(head); // 压入头结点
   			Node cur = head;;
   			while(!stack.isEmpty()) {
   				cur = stack.pop();//当前弹出节点
   				System.out.print(cur.value + " ");
   				if(cur.right != null)
   					stack.push(cur.right);
   				if(cur.left != null)
   					stack.push(cur.left);
   			}
   		}
   		System.out.println();
   	}
   ```



2. **中序**

   中序遍历是  左侧链 + 右子树（结合ds来理解）
    --->先访问顶点，但是先输出的是最左侧链点，因此要采用LIFO即 栈

   ![img](/assets/blog_image/2020-07-24-Coder-MianShi4/RW_YQB%$JIUC{249%1[9X.png)

   ```
   
   	public static void inOrderUnRecur(Node head) {
   		System.out.print("in-UnRecurOrder: ");
   		
   		if(head != null) {
   			Stack<Node> stack = new Stack<Node>();
   			Node cur = head;
   			while(!stack.isEmpty() || cur != null) {
   				if(cur != null) {// 左子链向下
   					stack.push(cur);
   					cur = cur.left;
   				}else {// 已经到达最左子链处，应当进入右子树，再遍历其左子链
   					cur = stack.pop(); // pop出当前最左子链值（为父节点），访右子树
   					System.out.print(cur.value + " ");
   					cur = cur.right;
   				}
   			}
   		}
   		System.out.println();
   	}
   ```

   

3. **后序**

   后序 1 --->>>
   由于是左右中， 而先序是中左右（极其容易）那么就直接套得中右左，
   再将其得到 中左右 时压到另一个栈中，再最终出栈打印 得到后序遍历

   ```
   	public static void posOrderUnRecur1(Node head) {
   		System.out.print("pos-UnRecurOrder:");
   		if(head != null) {
   			Stack<Node> stack = new Stack<Node>();
   			Stack<Node> stack2 = new Stack<Node>();
   			stack.add(head);
   			Node cur = head;;
   			while(!stack.isEmpty()) {
   				cur = stack.pop();
   				stack2.push(cur); // 将先序遍历时每次输出的值压入 stack2 中
   				if(cur.left != null) // 由于是中右左，因此需要先压入左，再压入右
   					stack.push(cur.left);
   				if(cur.right != null)
   					stack.push(cur.right);
   			}
   			while(!stack2.isEmpty()) {
   				System.out.print(stack2.pop().value + " ");
   			}
   		}
   		System.out.println();
   	}
   ```

----



### 2、如何直观的打印一颗二叉树

【题目】
二叉树可以用常规的三种遍历结果来描述其结构，但是不够直观，尤其是二又树中有重复值的时候，仅通过三种遍历的结果来构造二叉树的真实结构更是难上加难，有时则根本不可能。给定一棵二叉树的头节点head，已知二叉树节点值的类型为32位整型，请实现一个打印二叉树的函数，可以直观地展示树的形状，也便于画出真实的结构。

【解答】

设计展示形状如图

![image-20200728092752757](/assets/blog_image/2020-07-24-Coder-MianShi4/image-20200728092752757.png)

**1.解释形状含义**：

​	首先，二叉树大概的样子是把打印结果顺时针旋转90°，接下来，如果一个节点打印结果的前缀与后缀都有“H”（比如“H1H”），说明这个节点是头节点，当然就不存在父节点。如果一个节点打印结果的前缀与后缀都有“v”，表示父节点在该节点所在列的前一列，在该节点所在行的下方，并且是离该节点最近的节点。比如图3-5中的“v3v”、“v66v”，父节点分别为“HIH”、“v3v”。如果一个节点打印结果的前缀与后缀都有“^”，表示父节点在该节点所在行的上方，并且是离该节点最近的节点。比如，“^-222222222^”、父节点为“HIH””。

**2.规定节点打印时占用的统一长度：**

​	我们必须规定一个节点在打印时到底占多长。试想一下，如果有些节点的值本身的长度很短，比如“1”、“2” 等，而有些节点的值本身的长度很长，比如“43323232”、“78787237”等，那么如果不规定一个统一的长度，在打印一个长短值交替的二叉树时必然会出现格式对不齐的问题，进而产生歧义。在Java中，整型值占用长度最长的值是 Integer.MIN_VALUE（即-2147483648），占用的长度为11，加上前缀和后缀（“H”、“v”或“^”）之后占用长度为13。为了在打印之后更好地区分，再把前面加上两个空格，后面加上两个空格，总共占用长度为17。也就是说，**长度为17的空间必然可以放下任何一个32位整数**，同时样式还不错。至此，我们约定，打印每一个节点的时候，必须让每一个节点在打印时占用长度都为17，如果不足，前后都用空格补齐。比如节点值为8，假设这个节点加上“v”作为前后缀，那么实质内容为“v8v”，长度才为3，在打印时在“v8v”的前面补7个空格，后面也补7个空格，让总长度为17。再如节点值为66，假设这个节点加上“v”作为前后缀，那么实质内容为“v66v”，长度才为4，在打印在“v66v”的前面补6个空格，后面补7个空格，让总长度为17。
​	总之，如果长度不足，前后贴上几乎数量相等的空格来补齐。

**3.代码实现**

​	采用类似中序遍历的递归方法，不过由于顶层为右子树，因此需要先打印右子树。打印右子树时，需要前后缀加上"v" 

 1. 介绍 调节统一长度的函数

    ```
    	String value = to + head.value + to;// to 为 "H" / "v" / "^"
    	int lenL = (len-value.length()) / 2; 	// 左侧取下整
    	int lenR = len-lenL-value.length();		// 右侧取上整
    	value = getSpace(lenL) + value + getSpace(lenR);//现为节点长度
    		
    getspace函数 用于获取空格数
    	public static String getSpace(int len) {
    		StringBuffer sb = new StringBuffer();
    		for (int i = 0; i < len; i++) {
    			sb.append(" ");
    		}
    		return sb.toString();
    	}
    ```

	2. 打印函数

    ```
    	主函数先输出
    		System.out.println("Binary tree:");
    		printInOrder(head, 0, "H", 17);	// 规定len始终为17，头结点为 HxxxH
    	// 先打印右子树
    	public static void printInOrder(Node head, int height, String to, int len) {
    		if(head == null)
    			return;
    		
    		printInOrder(head.right, height+1, "v", len);
    		
    		String value = to + head.value + to;
    		int lenL = (len-value.length()) / 2;
    		int lenR = len-lenL-value.length();		
    		value = getSpace(lenL) + value + getSpace(lenR);//现为节点长度
    		
    		// 现需要对层数进行判断
    		// 需要注意的是，每层前面的空格也应该调整
    		System.out.println(getSpace(len*height) + value);
    		
    		printInOrder(head.left, height+1, "^", len);
    	}
    ```

    



### 3、在二叉树中找到一个节点的后继节点

【题目】现在有一种新的二叉树节点类型如下：

```
	public static class Node {
		public int value;
		public Node left;
		public Node right;
		public Node parent;
	}
```

​	该结构比普通二叉树节点结构多了一个指向父节点的parent指针。假设有一 棵Node类型的节点组成的二叉树，树中每个节点的parent指针都正确地指向自己的父节点，头节点的parent指向null。只给一个在二叉树中的某个节点 node，请实现返回node的后继节点的函数。在二
叉树的中序遍历的序列中， node的下一个节点叫作node的后继节点。

【题解】

​	最优解法不必遍历所有的节点如果node节点和node后继节点之间的实际距离为L，最优解法只用走过L个节点，时间复杂度为O（L），额外空间复杂度为O（1）。接下来详细说明最优解法是如何找到node的后继节点的。

![image-20200729081141965](/assets/blog_image/2020-07-24-Coder-MianShi4/image-20200729081141965.png)

​	**情况1**：如果node有右子树，那么后继节点就是**右子树上最左边的节点**。
​	**情况2**：如果node没有右子树，

1. 那么先看node是不是node父节点的左孩子，如果是左孩子，那么此时node的父节点就是node的后继节点；

   ​	例如，上图所示的二叉树中，当node为节点7时，节点7的父节点是节点8，同时节点7是节点8的左孩子，此时节点8就是节点7的后继节点。

2. 如果是右孩子，就向上寻找node的后继节点，假设向上移动到的节点记为s，s的父节点记为p，如果发现s是p的左孩子，那么节点p就是node节点的后继节点，否则就一直向上移动。————>>> 向上遍历，找到一个点，该点为该点父节点的左子树

   ​	再如，题目所示的二叉树中，当node为节点5时，节点5的父节点是节点4，但是节点5是节点4的右孩子，所以向上寻找node的后继节点。当向上移动到节点4，节点4的父节点是节点3，但是节点4还是节点3的右孩子，继续向上移动。当向上移动到节点3时，节点3的父节点是节点6，此时终于发现节点3是节点6的左孩子，移动停止，节点6就是node（节点5）的后继节点。

   **情况3**：如果在情况2中一直向上寻找，都移动到空节点时还是没有发现node的后继节点，说明node根本不存在后继节点。

   ```
   	public static Node getSuccessorNode(Node node) {
   		if(node == null)
   			return null;
   		if(node.right != null)
   			return getLeftMost(node.right);// 去得到该右子树的最左节点
   		// 至此 说明不含右子树，应当对该节点的父节点进行判断
   		// 主要分为两种情况
   		// 1. 该节点为父节点的左子树，则其父亲为其后继
   		Node parent = node.parent;
   		if(parent.left == node)
   			return parent;
   		// 2. 该节点为父节点的右子树，向上遍历，找到一个点，其为该点父节点的左子树
   		while(parent != null && parent.left != node) {// 不满足则向上直到头结点
   			node = parent;
   			parent = node.parent;
   		}
   		return parent;
   	}
   ```

而对于前驱而言，与后继大致相反，进行对应更改即可。



### 4、介绍二叉树的序列化和反序列化

【题目】
二叉树被记录成文件的过程叫作二叉树的序列化，通过文件内容重建原来二叉树的过程叫作二叉树的反序列化。给定一棵二叉树的头节点head，并已知二叉树节点值的类型为32位整型。请设计一种二叉树序列化和反序列化的方案，并用代码实现。

【解答】

#### 1.序列化

​	首先假设序列化的结果字符串为str，初始时str = "”。先序遍历二叉树，如果遇到null节点，就在 str 的末尾加上“#！”，“#” 表示这个节点为空，节点值不存在，“！”表示一个值的结束；如果遇到不为空的节点，假设节点值为3，就在 str 的末尾加上“3！”。比如左图所示的二叉树。
根据上文的描述，先序遍历序列化，最后的结果字符串str为：12!3!#!#!#!.。

![image-20200729083924358](/assets/blog_image/2020-07-24-Coder-MianShi4/image-20200729083924358.png)

​	为什么在每一个节点值的后面都要加上“！”呢？因为如果不标记一个值的结束，最后产生的结果会有歧义，如上图所示。

​	如果不在一个值结束时加入特殊字符，那么上图两侧的先序遍历序列化结果都是123###。也就是说，生成的字符串并不代表唯一的树。

```
	// 先序序列化
	// 加上 #！是为了区分 1 1 1
	// 加上！ 是为了区分 12 3和 1 23
	public static String serialByPre(Node head) {
		if(head == null)
			return "#!";
		String res = head.value + "!";
		res += serialByPre(head.left);
		res += serialByPre(head.right);
		
		return res;
	}
```

#### 2.反序列化(按队列进行恢复)

​	接下来介绍如何通过先序遍历序列化的结果字符串str，重构二叉树的过程，即反序列化。把结果字符串str变成字符串类型的数组，记为 values，数组代表一棵二叉树先序遍历的节点顺序。例如，str="12！3！#！#！#！”，生成的values为[“12"，"3”，“#"”，”#”，“#”]，然后用values[0..4]按照先序遍历的顺序建立整棵树。

1. 遇到“12"，生成节点值为12的节点（head），然后用values[l.4]建立节点12的左子树。
2. 遇到“3”，生成节点值为3的节点，它是节点12的左孩子，然后用values[2.4]建立节点3的左子树。
3. 遇到“#”，生成null节点，它是节点3的左孩子，该节点为nul，所以这个节点没有后续建立子树的过程。回到节点3后，用values[3.4]建立节点3的右子树。
4. 遇到“#”，生成null节点，它是节点3的右孩子，该节点为null，所以这个节点没有后续建立子树的过程。回到节点3后，再回到节点1，用values[4]建立节点1的右子树。
5. 遇到“#”，生成null节点，它是节点l的右孩子，该节点为null，所以这个节点没有后续建立子树的过程。整个过程结束。

```
	public static Node reconByPreString(String preStr) {
		String[] strs = preStr.split("!");
		Queue<String> queue = new LinkedList<String>();
		for (int i = 0; i < strs.length; i++) {
			queue.offer(strs[i]);
		}
		return reconPreOrder(queue);
	}

	public static Node reconPreOrder(Queue<String> queue) {
		String value = queue.poll();
		if(value.equals("#"))
			return null;
		Node head = new Node(Integer.valueOf(value));
		head.left = reconPreOrder(queue);
		head.right = reconPreOrder(queue);
		return head;
	}
```

递归对当前节点的左子树和右子树进行重构即可。



#### 3.层次序列化 （按照队列实现）

```
    // 层次序列化 用队列即可
    public static String serializeByLevelOrder(Node[] nodes, int root) {

        int n = nodes.length;
        if (n < 1) {
            return "#!";
        }
        String res = "";
        Node head = nodes[root];
        Queue<Node> queue = new LinkedList<>();

        queue.offer(head);
        while(!queue.isEmpty()) {
            Node cur = queue.poll();
            if(cur != null) {
                res += (cur.value+"!");
                queue.offer(cur.left);
                queue.offer(cur.right);
            } else {
                res += "#!";
            }
        }

        return res;
    }
```



#### 结果展示

![image-20200729084640277](/assets/blog_image/2020-07-24-Coder-MianShi4/image-20200729084640277.png)





### 5、判断二叉树是否为平衡二叉树

【题目】
	平衡二叉树的性质为：要么是一棵空树，要么任何一个节点的左右子树高度差的绝对值不超过1。给定一棵二叉树的头节点head，判断这棵二叉树是否为平衡二叉树。

【要求】
	如果二叉树的节点数为N，要求时间复杂度为O（N）。

【解答】

​	解法的整体过程为二叉树的后序遍历，对任何一个节点node来说，先遍历node的左子树，遍历过程中收集两个信息，node的左子树是否为平衡二叉树，node的左子树最深到哪一层记为1H。

​	如果发现node的左子树不是平衡二叉树，退出遍历过程；如果node的左子树是平衡二叉树，再遍历node的右子树，遍历过程中再收集两个信息，node的右子树是否为平衡二叉树，node的右子树最深到哪一层记为rH。

​	如果发现node的右子树不是平衡二叉树，退出遍历过程；如果node的右子树也是平衡二叉树，就看IH和rH差的绝对值是否大于1，如果大于1，说明已经发现整棵树不是平衡二叉树，如果不大于1，则返回H和rH较大的一个。

​	判断的全部过程请参看如下代码中的isBalance方法。在递归函数 getHeight中，一旦发现不符合平衡二叉树的性质，递归过程会迅速退出，此时返回什么根本不重要。boolean]
res长度为1，其功能相当于一个全局的boolean变量。

```
	public static class ReturnData{
		public boolean isB;
		public int h;
		
		public ReturnData(boolean isB, int h) {
			this.isB = isB;
			this.h = h;
		}
	}
	
	// 树形DT
	public static ReturnData process(Node head) {
		if(head == null)
			return new ReturnData(false, 0);
		
		ReturnData leftData = process(head.left);
		if(!leftData.isB)
			return new ReturnData(false, 0);
		ReturnData rightData = process(head.right);
		if(!rightData.isB)
			return new ReturnData(false, 0);
		// 至此需要判断高度差
		if(Math.abs(leftData.h - rightData.h) > 1)
			return new ReturnData(false, 0);
		
		return new ReturnData(true, Math.max(leftData.h, rightData.h)+1);
	
```



### 6、判断一棵树是否是搜索二叉树、判断一棵树是否是完全二叉树

1. 判断一棵二又树是否是搜索二叉树，只要改写一个二叉树**中序遍历**，在遍历的过程中看节点值是否都是递增的即可，将输出时与下一个进行大小判断。

   ```
   	public static boolean isBST(Node head) {
   		if(head == null)
   			return true;
   		
   		Stack<Node> stack = new Stack<Code_07_IsBSTAndCBT.Node>();
   		Node cur = head;
   		while(!stack.isEmpty() || cur != null) {
   			if(cur != null) {
   				stack.push(cur);
   				cur = cur.left;
   			}else {
   				cur = stack.pop();
   				if(!stack.isEmpty() && cur.value > stack.peek().value)
   					return false;
   				cur = cur.right;
   			}
   		}
   		return true;
   	}
   ```

2. 判断一棵二又树是否是完全二叉树，依据以下标准会使判断过程变得简单且易实现：
   1.按层遍历二叉树，从每层的左边向右边依次遍历所有的节点。

   ​		—— 按层遍历  采用队列弹出队首时，先吃进左孩子，再吃进右孩子

   2.如果当前节点有右孩子，但没有左孩子，直接返回false。
   3.如果当前节点并不是左右孩子全有，**那之后的节点必须都为叶节点**，否则返回false。
   4.遍历过程中如果不返回false，遍历结束后返回true。

   ```
   	public static boolean isCBT(Node head) {
   		if(head == null)
   			return true;
   		Queue<Node> queue = new LinkedList<Node>();
   		queue.offer(head);
   		Node left = null;
   		Node right = null;
   		
   		// 当并不是左右孩子都有时（即有左没右，或者左右都无时），之后遇到的应该都为叶节点
   		boolean leaf = false;// 判断叶子节点的开启
   		
   		while(!queue.isEmpty()) {
   			head = queue.poll();
   			left = head.left;
   			right = head.right;
   			if(right!=null && left==null) // 有右孩子无左孩子 返回错误
   				return false;
   			if(leaf &&(left!=null || right!=null)) // 开启叶节点，但还有
   				return false;
   			// 开启叶子节点的判断
   			if(left != null)
   				queue.offer(left);
   			if(right != null)
   				queue.offer(right);
   			// 由于不可能为有右孩子无左孩子（前面已经判断
   			if(left==null || right==null)
   				leaf = true;
   		}
   		return true;
   	}
   ```

   







### 7、已知一棵完全二叉树，求其节点的个数

【要求】 

​	时间复杂度低于O(N)，N为这棵树的节点个数

【解答】

​	由于要求低于O(N)，那么必然不是遍历所有节点，而是采用一种奇妙的方法——每层遍历一个节点-->右子树的最左边界进行判断，即O(lgN*lgN)。具体过程如下：

1. 如果head-null，说明是空树，直接返回0。

2. 如果不是空树，就求树的高度，求法是找到树的最左节点看能到哪一层，层数记为h。

3. 这一步是求解的主要逻辑，也是一个递归过程记为bs（node，level ，h），node表示当前节点，**level 表示node所在的层数**，h表示整棵树的层数是始终不变的(全局变量)。bs（node，level ，h）的返回值表示以node为头的完全二叉树的节点数是多少。初始时node为头节点head，level 为1，因为head在第1层，一共有h层始终不变。那么这个递归的过程可以用两个例子来说明。

   ```
   	// 返回以node为头结点的节点个数
   	// h为全局变量，表示所有深度
   	public static int bs(Node node, int level, int h) {
   		if(level == h)
   			return 1;//最后一层为1个
   		
   		if(mostLeftLevel(node.right, level+1) == h)// 说明左子树为满二叉树
   			return ((1<<(h-level)) + bs(node.right, level+1, h));
   		else {// 说明右子树为 少一层次的满二叉树
   			return ((1<<(h-level-1)) + bs(node.left, level+1, h));
   		}
   	}
   ```

   1. **左子树为满二叉树**

      ![image-20200802095243441](/assets/blog_image/2020-07-24-Coder-MianShi4/image-20200802095243441.png)

      找到node右子树的最左节点，发现它能到达最后一层，即h==4层。此时说明node的整棵左子树都是满二叉树，并且层数为 h-level 层，一棵层数为h-level 的满二叉树，其节点数为2^(h-level )-1个。如果加上node节点自己，那么节点数为2^（h-level ）-1+1==2（h-level ）个。此时如果再知道node右子树的节点数，那么以node为头的完全二叉树上到底有多少个节点就求出来了。那么node右子树的节点数到底是多少呢？就是bs（node.right，1+level ，h）的结果，递归去求即可。最后整体返回2^（h-level ）+bs（node.right，I+level ，h）。

    2. **左子树不为满二叉树**

       ![image-20200802095813716](/assets/blog_image/2020-07-24-Coder-MianShi4/image-20200802095813716.png)

       

       ​	找到node右子树的最左节点，如果像图3-51的例子一样，发现它没有到达最后一层，说明node的**整棵右子树都是满二又树**，并且层数为h-level-1层，一棵层数为h-level-1的满二叉树，其节点数为2*level-1个。如果加上node节点自己，那么节点数为2^（h-level-1）-1+1==2（h-level-1）个。
       ​	此时如果再知道node左子树的节点数，那么以node为头的完全二叉树上到底有多少个节点就求出来了。node左子树的节点数到底是多少呢？就是bs（node.left，level+1，h）的结果，递归去求即可，最后整体返回2^（h-level-1）+bs（node.left，level+1，h）。

       ```
       	// 判断左边界高度
       	public static int mostLeftLevel(Node head, int level) {
       		while(head != null) {
       			level++;
       			head = head.left;
       		}
       		return level-1;
       	}
       ```

       



