---
layout: post
title:  "《程序员代码面试指南》（八）图问题"
date:   2020-08-14 9:22:21 +0800
categories:  算法&DS
tags: 算法  数据结构
author: Hu#
typora-root-url: ..
---

* content
{:toc}


## 图问题

### 1、邻接矩阵和邻接表法

图最直观的一种存储方法就是，**邻接矩阵**（Adjacency Matrix）。

邻接矩阵的底层依赖一个二维数组。对于无向图来说，如果顶点 i 与顶点 j 之间有边，我们就将 A[i][j] 和 A[j][i] 标记为 1；对于有向图来说，如果顶点 i 到顶点 j  之间，有一条箭头从顶点 i 指向顶点 j 的边，那我们就将 A[i][j] 标记为 1。同理，如果有一条箭头从顶点 j 指向顶点 i  的边，我们就将 A[j][i] 标记为 1。对于带权图，数组中就存储相应的权重。

![image-20200903100714333](/assets/blog_image/2020-08-13-Coder-MianShi8/image-20200903100714333.png)

求解最短路径问题时会提到一个[Floyd-Warshall 算法](https://zh.wikipedia.org/wiki/Floyd-Warshall算法)，就是利用矩阵循环相乘若干次得到结果。

**邻接表**：

每个顶点对应一条链表，链表中存储的是与这个顶点相连接的其他顶点。另外我需要说明一下，图中画的是一个有向图的邻接表存储方式，每个顶点对应的链表里面，存储的是指向的顶点。对于无向图来说，也是类似的，不过，每个顶点的链表中存储的，是跟这个顶点有边相连的顶点。

![image-20200903100934171](/assets/blog_image/2020-08-13-Coder-MianShi8/image-20200903100934171.png)

邻接矩阵存储起来比较浪费空间，但是使用起来比较节省时间。相反，邻接表存储起来比较节省空间，但是使用起来就比较耗时间。

如果链过长，为了提高查找效率，我们可以将链表换成其他更加高效的数据结构，比如平衡二叉查找树等。



### 2、Node 结构

```java
public class Node {
	public int value;
	public int in; // 入度 
	public int out; // 出度
	public ArrayList<Node> nexts;// 邻居节点 默认该 Node 为 from的情况下
	public ArrayList<Edge> edges;// 以该节点为 from 的边

	public Node(int value) {
		this.value = value;
		in = 0;
		out = 0;
		nexts = new ArrayList<>();
		edges = new ArrayList<>();
	}
}
```



### 3、Edge 结构

```java
public class Edge {
	public int weight;
	public Node from;
	public Node to;

	public Edge(int weight, Node from, Node to) {
		this.weight = weight;
		this.from = from;
		this.to = to;
	}
}
```



### 4、图结构

利用 HashMap 和 HashSet 来存储

```java
public class Graph {
	public HashMap<Integer, Node> nodes;// key 为点的编号
	public HashSet<Edge> edges;
	
	public Graph() {
		nodes = new HashMap<>();
		edges = new HashSet<>();
	}
}
```



### 5、图的生成

```java
public class GraphGenerator {
	public static Graph createGraph(Integer[][] matrix) {
		Graph graph = new Graph();
		
		// 格式为 ： { [weight, from, to] ,
		//			  [weight, from, to] ,
		//			  [weight, from, to] }
		for (int i = 0; i < matrix.length; i++) {
			Integer weight = matrix[i][0];
			Integer from = matrix[i][1];
			Integer to = matrix[i][2];
			
			// 不存在时，就创立新节点
			if(!graph.nodes.containsKey(from))
				graph.nodes.put(from, new Node(from));
			if(!graph.nodes.containsKey(to))
				graph.nodes.put(to, new Node(to));
			
			// 创立新边
			Node fromNode = graph.nodes.get(from);
			Node toNode = graph.nodes.get(to);
			Edge newEdge = new Edge(weight, fromNode, toNode);
			
			// 各个参数调整
			fromNode.out++;
			toNode.in++;
			fromNode.nexts.add(toNode);
			fromNode.edges.add(newEdge);
			graph.edges.add(newEdge);
		}
		return graph;
	}
}
```



### 6、BFS  宽度优先遍历  队列

- 1，利用**队列**实现 
- 2，从源节点开始依次按照宽度进队列，然后弹出 
- 3，每弹出一个点，把该节点所有没有进过队列的邻接点放入队列 
- 4，直到队列变空
- ![image-20200903104408562](/assets/blog_image/2020-08-13-Coder-MianShi8/image-20200903104408562.png)

```java
	public static void bfs(Node node) {
		if(node == null) {
			return;
		}

		// 用于存储当前访问的点周边点
		Queue<Node> queue = new LinkedList<>();
		// 用于表示点是否访问过
		HashSet<Node> set = new HashSet<>();
		queue.add(node);
		set.add(node);

		while (!queue.isEmpty()) {
			Node cur = queue.poll();
			System.out.println(cur.value);
			// 通过 nexts 找到 cur 的周边点 加入到队列中
			for (Node next : cur.nexts) {
				if(!set.contains(next)) {// 判断是否访问过
					set.add(next);
					queue.add(next);
				}
			}
		} 
	}
```

BFS 不需要整张图的结构，只需要 Node 结构就可。

时间复杂度分析：

​	最坏情况下，终止顶点 t 离起始顶点 s  很远，需要遍历完整个图才能找到。这个时候，每个顶点都要进出一遍队列，每个边也都会被访问一次，所以，广度优先搜索的时间复杂度是  O(V+E)，其中，V 表示顶点的个数，E 表示边的个数。当然，对于一个连通图来说，也就是说一个图中的所有顶点都是连通的，E 肯定要大于等于  V-1，所以，广度优先搜索的时间复杂度也可以简写为 O(E)。



#### BFS的一个小应用：

​	**如何找出社交网络中某个用户的三度好友关系？**

​	社交网络可以用图来表示。这个问题就非常适合用图的广度优先搜索算法来解决，因为广度优先搜索是层层往外推进的。首先，遍历与起始顶点最近的一层顶点，也就是用户的一度好友，然后再遍历与用户距离的边数为 2 的顶点，也就是二度好友关系，以及与用户距离的边数为 3 的顶点，也就是三度好友关系。

​	我们只需要稍加改造一下广度优先搜索代码，用一个数组来记录每个顶点与起始顶点的距离，非常容易就可以找出三度好友关系。



### 7、DFS 深度优先遍历  栈

- 1，利用**栈**实现 
- 2，从源节点开始把节点按照深度放入栈，然后弹出 
- 3，每弹出一个点，把该节点 和 下一个没有进过栈的邻接点放入栈 ，
- 4，直到栈变空
- ![image-20200903104606450](/assets/blog_image/2020-08-13-Coder-MianShi8/image-20200903104606450.png)

```java
	public static void dfs(Node node) {
		if (node == null) {
			return;
		}

		// 将该点所有 next 都压入
		Stack<Node> stack = new Stack<>();
		// 用于存放已经访问过的
		HashSet<Node> set = new HashSet<Node>();

		stack.push(node);
		set.add(node);
		System.out.println(node.value);

		// 弹出栈顶节点，对该点 next 进行遍历，若存在 next 将后代未访问过的一个放进来。
		// 每次压入未访问节点前，先将其 from 点再次压入（先前栈顶弹出）
		while (!stack.isEmpty()) {
			Node cur = stack.pop();
			for (Node next : cur.nexts) {
				if(!set.contains(next)) {
					stack.push(cur);
					stack.push(next);
					set.add(next);
					System.out.println(next.value + " ");
					break;
				}
			}
		}

	}
```

​	每条边最多会被访问两次，一次是遍历，一次是回退。所以，图上的深度优先搜索算法的时间复杂度是 O(E)，E 表示边的个数。



### 8、拓扑排序

​	**概念**：我们在穿衣服的时候都有一定的顺序，我们可以把这种顺序想成，衣服与衣服之间有一定的依赖关系。比如说，你必须先穿袜子才能穿鞋，先穿内裤才能穿秋裤。假设我们现在有八件衣服要穿，它们之间的两两依赖关系我们已经很清楚了，那如何安排一个穿衣序列，能够满足所有的两两之间的依赖关系？

​	这就是个拓扑排序问题。

![image-20200903104945654](/assets/blog_image/2020-08-13-Coder-MianShi8/image-20200903104945654.png)

​	抽象为数据结构即为：如果 a 先于 b 执行，也就是说 b 依赖于 a，那么就在顶点 a 和顶点 b 之间，构建一条从 a 指向 b  的边。而且，这个图不仅要是有向图，还要是一个**有向无环图**，也就是不能存在像 a->b->c->a  这样的循环依赖关系。因为图中一旦出现环，拓扑排序就无法工作了。实际上，拓扑排序本身就是基于有向无环图的一个算法。

​	实现思路：找入度为0点，删掉入度为0点时，会出现新的入度为0点。

​	利用一个 HashMap 记录各个点的入度。
​	利用一个队列来储存 拓扑排序的选择，先进先出。

```java
	// directed graph and no loop
	// 找入度为0点，删掉入度为0点时，会出现新的入度为0点
	public static List<Node> sortedTopology(Graph graph) {
		// 利用一个 HashMap 记录各个点的入度
		HashMap<Node, Integer> inMap = new HashMap<>();
		// 利用一个队列来储存 拓扑排序的选择，先进先出
		Queue<Node> zeroInqQueue = new LinkedList<>();

		// graph 中的 node 是以 HashMap 存储的，key 为编号，values 为 Node 
		for (Node nodes : graph.nodes.values()) {
			inMap.put(nodes, nodes.in);
			if(nodes.in == 0) {
				zeroInqQueue.add(nodes);
			}
		}

		List<Node> result = new LinkedList<>();
		// 不断弹出入度为 0 的点，并将与之相关的点 - 1
		while (!zeroInqQueue.isEmpty()) {
			Node cur = zeroInqQueue.poll();
			result.add(cur);
			for (Node next : cur.nexts) {
				inMap.put(next, inMap.get(next)-1);
				if(inMap.get(next) == 0) {
					zeroInqQueue.add(next);
				}
			}
		}

		return result;
	}
```





### 9、最小生成树 Kruskal & Prim

首先需明白，两个算法都是适用于**无向图**

#### 1.Kruskal 算法  O(ElgE)

按照**边**来贪心

首先理解并查集 

![image-20200903145749152](/assets/blog_image/2020-08-13-Coder-MianShi8/image-20200903145749152.png)

```java
public static Set<Edge> kruskalMST(Graph graph) {
		// 首先搞出并查集
		UnionFind unionFind = new UnionFind(); 
		unionFind.makeSets(graph.nodes.values());//按照每个点的值生成集合
		// 按照小根堆生成边的堆
		PriorityQueue<Edge> priorityQueue = new PriorityQueue<Edge>(new EdgeComparator());
		// 将每一条边按照权重进入小根堆，方便取出堆顶
		for (Edge edge : graph.edges) {
			priorityQueue.add(edge);
		}
		// 最终返回一个集合
		Set<Edge> result = new HashSet<Edge>();
		// 贪心策略，每次取最小权重
		while(!priorityQueue.isEmpty()) {
			Edge cur = priorityQueue.poll();
			// 加入后不是环，就加入，并将加入点和之前点的 集合合并
			if(!unionFind.isSameSet(cur.from, cur.to)) {
				result.add(cur);
				unionFind.union(cur.from, cur.to);
			}
		}
		return result;
	}
```

小根堆按照 边的权重进行排序

```java
	public static class EdgeComparator implements Comparator<Edge> {
		@Override
		public int compare(Edge o1, Edge o2) {
			return o1.weight - o2.weight;
		}		
	}
```



 Kruskal 用并查集，Prim 用Set

![image-20200903132356769](/assets/blog_image/2020-08-13-Coder-MianShi8/image-20200903132356769.png)



#### 2.Prim算法

​	按照**点**考察，对每次访问新的点，将以其为 from 的边，且其 to 点也还未访问到，加入到 小根堆 中，贪心选取最小的边。

​		不用并查集 因为 Prim采用的是一个set ，让没进来过的进来。而不是Kruskal算法的要将两个

```java
	public static Set<Edge> primMST(Graph graph) {
		PriorityQueue<Edge> priorityQueue = new PriorityQueue<Edge>(new EdgeComparator());
		HashSet<Node> set = new HashSet<Node>();// 用于作为已访问点的集合
		Set<Edge> result = new HashSet<Edge>();
		
		// for循环是为了可能是多个不连通图
		// 若只有一个连通图 则不需要 for 循环，因为 Prim 是对一个点的扩散
		for (Node node : graph.nodes.values()) { 
			if(!set.contains(node)) {
				set.add(node);
				// 并且对于该点的每条边 进行小根堆的加取
				for (Edge edge : node.edges) {
					priorityQueue.add(edge);
				}
				
				while(!priorityQueue.isEmpty()) {
					Edge edge = priorityQueue.poll();
					Node toNode = edge.to;
					
				 	// 如果对于最短边的 to，set还不包含to点，便加到个set中
					if(!set.contains(toNode)) {
						set.add(toNode);
						result.add(edge);
						// 并将新出现的边 加入到小根堆中
						for (Edge edge2 : toNode.edges) {
							priorityQueue.add(edge2);
						}
					}
				}
			}
		}
		return result;
	}
```



### 10、最短路径算法

#### 1、Dijkstra 算法

**单源最短路径算法**：采用 堆 实现（因为 Java 提供的优先级队列，没有暴露更新数据的接口，所以我们需要重新实现一个 ）

NodeHeap 即为实现的堆

addOrUpdateOrIgnore 是对点进行更新

- 若未进过，便加入 add，即堆的 InsertHeap 函数
- 若还在里面，便进行更新。从下往上堆化，重新符合堆的定义。时间复杂度 O(logn)。
- 若之前在，现在不在了，便忽视

isEmpty 函数

popMinDistance 函数：每次推出堆顶函数

对于整个 main 函数

我们从优先级队列中取出 dist 最小的顶点 record，然后考察这个顶点可达的所有顶点（代码中的 nextVertex）。如果  record 的 dist 值加上 record 与 nextVertex 之间边的权重 w 小于 nextVertex 当前的  dist 值，也就是说，存在另一条更短的路径，它经过 record 到达 nextVertex。那我们就把 nextVertex 的  dist 更新为 record 的 dist 值加上 w。然后，我们把 nextVertex  加入到优先级队列中。重复这个过程，直到找到终止顶点 t 或者队列为空。

```java
    public static HashMap<Node, Integer> dijkstra2(Node head, int size) {
        NodeHeap nodeHeap = new NodeHeap(size);
        // 增加 更新 或者忽视
        nodeHeap.addOrUpdateOrIgnore(head, 0);
        HashMap<Node, Integer> result = new HashMap<>();
        while(!nodeHeap.isEmpty()) {
            NodeRecord record = nodeHeap.popMinDistance();
            Node cur = record.node;
            int distance = record.distance;
            // 对该点的每一个邻接点，进行加入
            for (Edge edge : cur.edges){
                nodeHeap.addOrUpdateOrIgnore(edge.to, edge.weight + distance);
            }
            result.put(cur, distance);
        }
        return result;
    }
```

现展示最为重要的 addOrUpdateOrIgnore 函数

```java
        public void addOrUpdateOrIgnore(Node node, int distance) {
            // 进入过堆，且现在还在堆中
            if(inHeap(node)) {
                distanceMap.put(node, Math.min(distanceMap.get(node), distance));
                insertHeapify(node, heapIndexMap.get(node));
            }
            // 从未进过堆
            // 放入到堆的最后一个位置，insert，从下至上
            if(!isEntered(node)) {
                nodes[heapSize] = node;
                heapIndexMap.put(node, heapSize);
                distanceMap.put(node, distance);
                insertHeapify(node, heapSize++);
            }
        }
```

以及 pop 函数的实现，采用与堆中最后一个元素进行交换。

```java
        public NodeRecord popMinDistance() {
            NodeRecord nodeRecord = new NodeRecord(nodes[0], distanceMap.get(nodes[0]));
            swap(0, heapSize - 1);
            // 将 pop 点置为 -1, 表示之前在，现在不在 
            heapIndexMap.put(nodes[heapSize - 1], -1);
            distanceMap.remove(nodes[heapSize - 1]);
            nodes[heapSize - 1] = null;
            heapify(0, --heapSize);
            return nodeRecord;
        }
        
   // 写入一个 Node 类 用于记录该点与它的distance      
   public static class NodeRecord {
        public Node node;
        public int distance;

        public NodeRecord(Node node, int distance) {
            this.node = node;
            this.distance = distance;
        }
    }
```

​	值得注意的是：对于那种之前在，后来弹出了的点，采用还记录在 Heap 中，但是将其距离记为 -1 ，用来表示区别。









