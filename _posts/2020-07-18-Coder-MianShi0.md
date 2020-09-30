---
layout: post
title:  "《程序员代码面试指南》（零）排序大汇总"
date:   2020-07-18 14:43:12 +0800
categories:  算法&DS
tags: 算法  数据结构
author: Hu#
typora-root-url: ..
---

* content
{:toc}


# 排序大汇总

![image-20200904210328226](/assets/blog_image/2020-07-18-Coder-MianShi0/image-20200904210328226.png)

## 一、基于比较的排序

### 1、冒泡排序

时间复杂度O(N^2)，额外空间复杂度O(1)

冒泡排序只会操作相邻的两个数据。每次冒泡操作都会对相邻的两个元素进行比较，看是否满足大小关系要求。如果不满足就让它俩互换。一次冒泡会让至少一个元素移动到它应该在的位置，重复 n 次，就完成了 n 个数据的排序工作。

![image-20200901093823865](/assets/blog_image/2020-07-18-Coder-MianShi0/image-20200901093823865.png)

还可以进行优化：。当某次冒泡操作已经没有数据交换时，说明已经达到完全有序，不用再继续执行后续的冒泡操作。我这里还有另外一个例子，这里面给 6 个元素排序，只需要 4 次冒泡操作就可以了。

![image-20200901094002382](/assets/blog_image/2020-07-18-Coder-MianShi0/image-20200901094002382.png)

```
	public static void bubbleSort(int[] arr) {
		if (arr == null || arr.length < 2) {
			return;
		}
		boolean flag = false;// 标志此时是否还有排序
		for (int end = arr.length - 1; end > 0; end--) {
			flag = false;
			for (int i = 0; i < end; i++)
				if (arr[i] > arr[i + 1]) {
					swap(arr, i, i + 1);
					flag = true;
				}
			if (!flag)
				break;
		}
	}
```

**第一，冒泡排序是原地排序算法吗？**

冒泡的过程只涉及相邻数据的交换操作，只需要常量级的临时空间，所以它的空间复杂度为 O(1)，是一个原地排序算法。

**第二，冒泡排序是稳定的排序算法吗？**

在冒泡排序中，只有交换才可以改变两个元素的前后顺序。为了保证冒泡排序算法的稳定性，**当有相邻的两个元素大小相等的时候，我们不做交换**，相同大小的数据在排序前后不会改变顺序，所以冒泡排序是稳定的排序算法。

**第三，冒泡排序的时间复杂度是多少？**

最好情况下，要排序的数据已经是有序的了，我们只需要进行一次冒泡操作，就可以结束了，所以最好情况时间复杂度是 O(n)。而最坏的情况是，要排序的数据刚好是倒序排列的，我们需要进行 n 次冒泡操作，所以最坏情况时间复杂度为 O(n2)。



### 2、选择排序

时间复杂度O(N^2)，额外空间复杂度O(1)

选择排序每次会从未排序区间中找到最小的元素，将其放到已排序区间的末尾。

![image-20200901094639406](/assets/blog_image/2020-07-18-Coder-MianShi0/image-20200901094639406.png)

```
	public static void selectionSort(int[] arr) {
		if(arr == null || arr.length < 2) {
			return;
		}

		for (int i = 0; i < arr.length - 1; i++) {
			int minIndex = i;
			for (int j = i+1; j < arr.length; j++) {
				minIndex = (arr[j] < arr[minIndex]) ? j : minIndex; 
			}
			swap(arr, minIndex, i);
		}
	}
```

选择排序空间复杂度为 O(1)，是一种原地排序算法。选择排序的最好情况时间复杂度、最坏情况和平均情况时间复杂度都为 O(n2)。

那选择排序是稳定的排序算法吗？

​	答案是否定的，选择排序是一种不稳定的排序算法。从我前面画的那张图中，你可以看出来，选择排序每次都要找剩余未排序元素中的最小值，并和前面的元素交换位置，这样破坏了稳定性。

比如 5，8，5，2，9 这样一组数据，使用选择排序算法来排序的话，第一次找到最小元素 2，与第一个 5 交换位置，**那第一个 5 和中间的 5 顺序就变了**，所以就不稳定了。正是因此，相对于冒泡排序和插入排序，选择排序就稍微逊色了。





### 3、插入排序

时间复杂度O(N^2)，额外空间复杂度O(1)

​	首先，我们将数组中的数据分为两个区间，**已排序区间**和**未排序区间**。初始已排序区间只有一个元素，就是数组的第一个元素。插入算法的核心思想是取未排序区间中的元素，在已排序区间中找到合适的插入位置将其插入，并保证已排序区间数据一直有序。重复这个过程，直到未排序区间中元素为空，算法结束。

​	当我们需要将一个数据 a 插入到已排序区间时，需要**拿 a 与已排序区间的元素依次比较大小**，找到合适的插入位置。找到插入点之后，我们还需要将插入点之后的元素顺序往后移动一位，这样才能腾出位置给元素 a 插入。——此过程可以类似为：不断将当前元素与上一个元素递归作比较。要是不满足情况，便continue

![image-20200901100932224](/assets/blog_image/2020-07-18-Coder-MianShi0/image-20200901100932224.png)

```
	public static void insertionSort(int[] arr) {
		if(arr == null || arr.length<2)
			return;
		// 0 - i-1 已经有序 
		for (int i = 1; i < arr.length; i++) {
			for (int j = i-1; j >= 0 && arr[j+1] < arr[j]; j--) {
				swap(arr, j, j+1);
			}
		}
	}
```

**第一，插入排序是原地排序算法吗？**

从实现过程可以很明显地看出，插入排序算法的运行并不需要额外的存储空间，所以空间复杂度是 O(1)，也就是说，这是一个原地排序算法。

**第二，插入排序是稳定的排序算法吗？**

在插入排序中，对于值相同的元素，我们可以选择将后面出现的元素，插入到前面出现元素的后面，这样就可以保持原有的前后顺序不变，所以插入排序是稳定的排序算法。

**第三，插入排序的时间复杂度是多少？**

如果要排序的数据已经是有序的，我们并不需要搬移任何数据。如果我们从尾到头在有序数据组里面查找插入位置，每次只需要比较一个数据就能确定插入的位置。所以这种情况下，最好是时间复杂度为 O(n)。注意，这里是**从尾到头遍历已经有序的数据**。

如果数组是倒序的，每次插入都相当于在数组的第一个位置插入新的数据，所以需要移动大量的数据，所以最坏情况时间复杂度为 O(n2)。

还记得我们在数组中插入一个数据的平均时间复杂度是多少吗？没错，是 O(n)。所以，对于插入排序来说，每次插入操作都相当于在数组中插入一个数据，循环执行 n 次插入操作，所以平均时间复杂度为 O(n2)。

**因此插入排序是和数据状况有关的，而冒泡和选择与数据状况无关。**



### 4、归并排序

时间复杂度O(N*logN)，额外空间复杂度O(N)

如果要排序一个数组，我们先把数组从中间分成前后两部分，然后对前后两部分分别排序，再将排好序的两部分合并在一起，这样整个数组就都有序了。

![image-20200901103513498](/assets/blog_image/2020-07-18-Coder-MianShi0/image-20200901103513498.png)

​	我们申请一个临时数组 tmp，大小与 A[p…r] 相同。我们用两个游标 i 和 j，分别指向 A[p…q] 和 A[q+1…r] 的第一个元素。比较这两个元素  A[i] 和 A[j]，如果 A[i]<=A[j]，我们就把 A[i] 放入到临时数组 tmp，并且 i 后移一位，否则将 A[j]  放入到数组 tmp，j 后移一位。

​	继续上述比较过程，直到其中一个子数组中的所有数据都放入临时数组中，再把另一个数组中的数据依次加入到临时数组的末尾，这个时候，临时数组中存储的就是两个子数组合并之后的结果了。最后**再把临时数组 tmp 中的数据拷贝**到原数组 A[p…r] 中。

![image-20200901103626533](/assets/blog_image/2020-07-18-Coder-MianShi0/image-20200901103626533.png)

```
	public static void mergeSortBegin(int[] arr) {
		if(arr == null || arr.length < 2)
			return;
		
		mergeSort(arr, 0, arr.length-1);
	}
	
	private static void mergeSort(int[] arr, int L, int R) {
		if(L == R)
			return;
		
		int mid = ((R - L)>>1) + L;
		mergeSort(arr, L, mid);
		mergeSort(arr, mid+1, R);
		
		merge(arr, L ,mid, R);
	}
	
	private static void merge(int[] arr, int L, int mid, int R) {
		int[] mergeArr = new int[R-L+1];
		int i = L;
		int j = mid+1;
		
		int pos = 0;
		while (i<=mid && j<=R) {
			mergeArr[pos++] = arr[i]<arr[j]?arr[i++]:arr[j++];
		}

		// 最多有一个越界
		while(i <= mid) {
			mergeArr[pos++] = arr[i++];
		}
		while(j <= R) {
			mergeArr[pos++] = arr[j++];
		}
		// 最后再进行辅助数组的赋值
		for (pos = 0;  pos < mergeArr.length; pos++) {
			arr[L+pos] = mergeArr[pos];
		}
		
	}
```

T(N) = 2T(N/2) + O(N)

归代码的空间复杂度并不能像时间复杂度那样累加。尽管每次合并操作都需要申请额外的内存空间，但在合并完成之后，临时开辟的内存空间就被释放掉了。在任意时刻，CPU 只会有一个函数在执行，也就只会有一个临时的内存空间在使用。临时内存空间最大也不会超过 n 个数据的大小，所以空间复杂度是 O(n).

​	即可以搞一个全局数组，一直用就行。



### 5、归并排序的应用：小和问题

#### 小和问题

​	在一个数组中，每一个数左边比当前数小的数累加起来，叫做这个数组的小和。求一个数组的小和。

```
	例子：  [1,3,4,2,5]
1左边比1小的数，没有；
3左边比3小的数，1；
4左边比4小的数，1、3；
2左边比2小的数，1；
5左边比5小的数，1、3、4、2；
所以小和为1+1+3+1+1+3+4+2=16
```

归并思想：将左右小和加起来

```
	public static int smallNumSum(int[] arr, int L, int R) {
		if(L == R)
			return 0;
		
		int mid = ((R-L)>>1) + L;//取中点
		
		return smallNumSum(arr, L, mid) + 
				smallNumSum(arr, mid+1, R) + 
				mergeNum(arr, L, mid, R);
	}
```

可用归并排序思想，改合并处代码即可

```
	while(i<=mid && j<=r) {
			res += arr[i]<arr[j] ? arr[i]*(r-j+1) : 0;
			mergeHelp[pos++] = arr[i]<arr[j]?arr[i++]:arr[j++];//选小值
		}
```

实则为对归并时，左边的进行遍历，找到左边数组中，每一个元素，右边都有多少个比他大（r - j + 1 ) 。因为在合成之后，组内是不会再需要比较的。

![image-20200901111346999](/assets/blog_image/2020-07-18-Coder-MianShi0/image-20200901111346999.png)





### 6、快排引入：荷兰国旗问题

给定一个数组arr，和一个数num，请把小于num的数放在数组的左边，等于num的数放在数组的中间，大于num的数放在数组的右边。
	要求 额外空间复杂度O(1)，时间复杂度O(N)

利用左边界和右边界，左边界表示小于 pivot 的区域，右边界表示大于 pivot 区域，初始大小都为 -1。用 cur 指针依次指向进行判断。

```
    // p 指示所需分割的数
    public static int[] partition(int[] arr, int l, int r, int p) {
        int less = l - 1;
        int more = r + 1;
        int cur = l;
        while(cur < more) {
            if(arr[cur] < p) {// less++换来的数必然是 < p 的，因此可换
                // 当前数和小于区域进行交换，小于区域增加 1 个，当前数指向下一个
                swap(arr, ++less, cur++);
            } else if (arr[cur] > p) {// more--换来的数不知道情况
                // 当前数和大于区域交换，大于区域减少 1 个，当前数不动，
                swap(arr, cur, --more);
            } else {
                cur++;
            }
        }
        
        return new int[] {less+1, more-1};
    }
```

![image-20200902084108532](/assets/blog_image/2020-07-18-Coder-MianShi0/image-20200902084108532.png)





### 7、快排 

利用荷兰国旗问题思路，递归调用 partition 函数，将左右也递归进行划分。

pivot 就取当前数组的最后一个，因此大于区域需要进行向前移动一位。划分完之后，将 pivot 放回 小于区域/大于区域的边界处。

```
	public static void quickSort(int[] arr, int l, int r) {
		if(l < r) {
			// 第一行先忽略（属于随机快排改善 
			swap(arr, l + (int)(Math.random() * (r-l+1)), r);
			int[] p = partition(arr, l ,r);//p[0]是第一个位置
			quickSort(arr, l, p[0]-1);
			quickSort(arr, p[1]+1, r);
		}
	}
	
	// 最右侧为pivot 
	public static int[] partition(int[] arr, int l, int r) {
		int i = l-1;
		int j = r;
		int pos = l;//指示当前位置
		while(pos < j) {
			if(arr[pos] < arr[r]) {
				swap(arr, pos++, ++i);
			}else if (arr[pos] > arr[r]) {
				swap(arr, pos, --j);
			}else {
				pos++;
			}
		}
		swap(arr, j, r);//交换pivot到等于区域
		
		//返回等于范围
		return new int[] {i+1, j};
	}
```

快排的时间复杂度也是 O(nlogn)。

```
T(1) = C；   n=1 时，只需要常量级的执行时间，所以表示为 C。
T(n) = 2*T(n/2) + n； n>1
```

但是存在一个问题：若是总拿最后一个数遍历，那么会受数组数据状况的影响。比如 1 2 3 4 5 6，那么就退化为 O(n^2)。也就是说小于和大于规模相差较大。

因此改进为：**随机快排**——即每次不取最后一个数，而是取随机数。

```
swap(arr, l + (int)(Math.random() * (r-l+1)), r);
```

快排空间复杂度（随机快排）：O(logN)：

此时分析经典快排：需要保存边界划分点。在递归时，比如下图此时需要用到三个划分点（递归前函数还在栈中保存着）。断点最差为 O(N)个 1 2 3 4 5，最好为 O(logN) 

<img src="/assets/blog_image/2020-07-18-Coder-MianShi0/image-20200901125323184.png" alt="image-20200901125323184" style="zoom:50%;" />

### 归并排序比不上快排原因：

​	归并排序算法是一种在任何情况下时间复杂度都比较稳定的排序算法，这也使它存在致命的缺点，即归并排序不是原地排序算法，空间复杂度比较高，是 O(n)。正因为此，它也没有快排应用广泛。

​	

### 8、堆排序

1. 大根堆的概念：在树中任意一棵树中，顶点都是最大值。

   堆的构成：

   1.自上而下的上滤：

   ![image-20200903163315226](/assets/blog_image/2020-07-18-Coder-MianShi0/image-20200903163315226.png)

   2.自下而上的下滤：对内部节点进行下滤 从 n/2-1 到根节点

   ![image-20200903163748062](/assets/blog_image/2020-07-18-Coder-MianShi0/image-20200903163748062.png)

   ​	越靠近底层节点数越多，因此第一种方法与深度相关，第二种方法与高度相关，因此第一种时间复杂度高。

2. **构成方法**：采用数组形式，当前节点索引为 i ，那么其父节点为 (i-1)/2 取下整。

   从 0 开始对数组进行遍历，递归与其父节点进行比较交换。

   当跳到 0 位置时，即在原地结束

   所以形成二叉树的时间复杂度为 O(log1 + log2 + log3...+ logN) = O(N)

   

3. 堆的往上走

   ```
   	// 堆的构造
   	public static void heapInsert(int[] arr, int index) {
   		while(arr[index] > arr[(index-1)/2]) {//和父亲比
   			swap(arr, index, (index-1)/2);
   			index = (index-1)/2;
   		}
   	}
   ```

4. 堆的往下走

   需要将该节点**下沉**至相应位置。

   ```
   	// heapSize表示界 选出 index节点 与 其孩子最大值
   	public static void heapify(int[] arr, int index, int heapSize) {
   		int left = index * 2 + 1;
   		while(left < heapSize) {
   			// 选出 儿子 最大值  && 需要判断右孩子越界
   			int largest = left + 1 < heapSize && 
   						  arr[left] < arr[left+1]
   							?  left +1 
   							: left;
   			// 和当前index 进行判断
   			largest = arr[largest] > arr[index] ? largest : index;
   			if(largest == index)
   				break;//说明已经下降到值的最低点了
   			swap(arr, index, largest); // 至此 index 还未找到最低点
   			index = largest;
   			left = index * 2 + 1;
   		}
   	}
   ```

   

5. 堆的应用

   现一个水流不断输出数字，需要随时给出中位数。

   **思路**：采用两个堆，一个大根堆，一个小根堆，第一个数进大根堆，之后的数先与大根堆堆顶进行判断，判断是进大根堆还是小根堆——要是 <= 大根堆堆顶才进大根堆，否则进小根堆。并在进入之后，进行两个堆的 heapSize 的比较。时刻保持两个堆的差值在 1 以内——比如要是大根堆的 heapSIze 此时比 小根堆 多 2，那么便弹出大根堆堆顶，放入小根堆。那么就保证通过两个堆顶便能得到中位数。

   **弹出堆堆顶思路**——即 **减堆思路**：将堆顶元素与堆中最后一个元素，即索引为 HeapSize - 1 元素进行交换，再对堆进行 heapify，并将 heapsize--。

   

6. **堆排序**

   采用上滤 O(nlogN)

   ![image-20200902093031097](/assets/blog_image/2020-07-18-Coder-MianShi0/image-20200902093031097.png)

   ```
   	public static void heapSort(int[] arr) {
   		if(arr == null || arr.length < 2)
   			return;
   		//先插入
   		for (int i = 0; i < arr.length; i++) { 
   			heapInsert(arr, i);
   		}
   		// 不断进行调整
   		int heapSize = arr.length;
   		while (heapSize > 0) {
   			swap(arr, --heapSize, 0);
   			heapify(arr, 0, heapSize);
   		}
   	} 
   ```





### 9、稳定性汇总

指的是：相等的值会不会因为排序算法被打乱

1. **冒泡**：保证遇到相等的值不冒泡

2. **插入**：在插入过程中遇到相等的便停止

3. **选择：**不能实现稳定性。比如 5 5 5 5 1 2 3，在排序时，首先将第一个 5 与 1 交换，那么便打乱了稳定性。

4. **归并：**在merge时，相等时先拷贝左区域的值

5. **快排：**不能做到稳定性。因为分区的过程涉及交换操作，如果数组中有两个相同的元素，比如序列 6，8，7，6，3，5，9，4，在经过第一次分区操作之后，两个 6 的相对先后顺序就会改变。所以，快速排序并不是一个稳定的排序算法。

6. **堆排：**4 和 5 发生交换后，也不满足稳定性

   ![image-20200902094025940](/assets/blog_image/2020-07-18-Coder-MianShi0/image-20200902094025940.png)



快排的稳定性扩展：01stable sort



## 二、非基于比较的排序

桶排序、计数排序、基数排序。因为这些排序算法的时间复杂度是线性的，所以我们把这类排序算法叫作**线性排序**（Linear sort）。之所以能做到线性的时间复杂度，主要原因是，这三个算法是非基于比较的排序算法，都不涉及元素之间的比较操作。但是对要排序的数据要求很苛刻。

时间复杂度O(N), 空间复杂度 O(N)

### 1、桶排序

​	桶排序，顾名思义，会用到“桶”，核心思想是将要排序的数据分到几个有序的桶里，每个桶里的数据再单独进行排序。桶内排完序之后，再把每个桶里的数据按照顺序依次取出，组成的序列就是有序的了。

​	如果要排序的数据有 n 个，我们把它们均匀地划分到 m 个桶内，每个桶里就有 k=n/m 个元素。每个桶内部使用快速排序，时间复杂度为 O(k * logk)。m 个桶排序的时间复杂度就是 O(m * k * logk)，因为 k=n/m，所以整个桶排序的时间复杂度就是  O(n*log(n/m))。当桶的个数 m 接近数据个数 n 时，log(n/m) 就是一个非常小的常量，这个时候桶排序的时间复杂度接近  O(n)。

### 2、桶排序应用

![image-20200902100332703](/assets/blog_image/2020-07-18-Coder-MianShi0/image-20200902100332703.png)

首先遍历整个数组，找到 min 和 max 值，

将 min 放到 0 桶中，将 max 放到 N 桶中。这样至少存在一个空桶。桶的划分采用 max - min 值 / N。

比如，有 9 个数：min 为 0，max 为 99，那么就用 10 个 桶。桶 0 包含 0-9，桶 1 包含 10-19...桶 9 包含 90-99。

对每个桶记录min 和 max。计算每个非空桶的 min 和 上一个最近非空桶 max 的差值。最大差值必定来自不同桶，因为**最起码**来自空桶两侧。也有可能两个相邻的桶差值大于空桶两侧。

```
	public static int maxGap(int[] arr) {
		if(arr == null || arr.length < 2){
			return 0;
		}
		
		int len = arr.length;
		int max = Integer.MIN_VALUE;
		int min = Integer.MAX_VALUE;
		 // 更新 max 和 min
		for (int i = 0; i < len; i++) {
			if(arr[i] < min)
				min = arr[i];
			if(arr[i] > max)
				max = arr[i];
		}
		if(min == max)
			return 0; 
		
		boolean[] hasNum = new boolean[len + 1];
		int[] maxs = new int[len + 1];
		int[] mins = new int[len + 1]; 
		
		int nowBucket = 0;
		for (int i = 0; i < len; i++) {
			nowBucket = bucket(arr[i], len, min, max);
			maxs[nowBucket] = hasNum[i] ? Math.max(arr[i], maxs[nowBucket]) : arr[i];
			mins[nowBucket] = hasNum[i] ? Math.min(arr[i], maxs[nowBucket]) : arr[i];
			hasNum[nowBucket] = true;
		}
		
		int res = 0;
		int lastMax = maxs[0];//初始为前一个的最小值
		for (int i = 1; i <= len; i++) {
			if(hasNum[i]) {
				res = Math.max(res, mins[i] - lastMax);
				lastMax = maxs[i];
			}
		}
		
		return res;
	}
	
	// 知道该数来自哪个桶
	public static int bucket(int num, int len, int min, int max) {
		return ((num-min)*len / (max-min));
	}
```



### 3、计数排序

​	**计数排序其实是桶排序的一种特殊情况**。当要排序的 n 个数据，所处的范围并不大的时候，比如最大值是 k，我们就可以把数据划分成 k 个桶。每个桶内的数据值都是相同的，省掉了桶内排序的时间。

​	通过 count 数组记录 各个数据的出现次数，然后通过 accum 数组进行累加，从而得到各个数字的区间范围。

​	比如 E 出现 2次，前一个数据 D 的 accum 为 5，因此 E 的区间范围即为 [5, 7]

![image-20200903230615536](/assets/blog_image/2020-07-18-Coder-MianShi0/image-20200903230615536.png)

![image-20200903230634343](/assets/blog_image/2020-07-18-Coder-MianShi0/image-20200903230634343.png)

​	计数排序只能用在数据范围不大的场景中，如果数据范围 k 比要排序的数据 n 大很多，就不适合用 计数排序了。而且，计数排序只能给非负整数排序，如果要排序的数据是其他类型的，要将其在不改变相对大小的情况下，转化为非负整数。





### 4、基数排序（Radix sort）

![image-20200904000728999](/assets/blog_image/2020-07-18-Coder-MianShi0/image-20200904000728999.png)

​	我们再来看这样一个排序问题。假设我们有 10 万个手机号码，希望将这 10 万个手机号码从小到大排序，你有什么比较快速的排序方法呢？

​	我们之前讲的快排，时间复杂度可以做到 O(nlogn)，还有更高效的排序算法吗？桶排序、计数排序能派上用场吗？手机号码有 11  位，范围太大，显然不适合用这两种排序算法。针对这个排序问题，有没有时间复杂度是 O(n) 的算法呢？现在我就来介绍一种新的排序算法，**基数排序**。

​	刚刚这个问题里有这样的规律：假设要比较两个手机号码 a，b 的大小，如果在前面几位中，a 手机号码已经比 b 手机号码大了，那后面的几位就不用看了。

​	借助稳定排序算法，这里有一个巧妙的实现思路。还记得我们第 11  节中，在阐述排序算法的稳定性的时候举的订单的例子吗？我们这里也可以借助相同的处理思路，先按照最后一位来排序手机号码，然后，再按照倒数第二位重新排序，以此类推，最后按照第一位重新排序。经过 11 次排序之后，手机号码就都有序了。

​	手机号码稍微有点长，画图比较不容易看清楚，我用字符串排序的例子，画了一张基数排序的过程分解图，你可以看下。

![img](/assets/blog_image/2020-07-18-Coder-MianShi0/df0cdbb73bd19a2d69a52c54d8b9fc0c.jpg)

​	注意，这里按照每位来排序的**排序算法要是稳定的**，否则这个实现思路就是不正确的。因为如果是非稳定排序算法，那最后一次排序只会考虑最高位的大小顺序，完全不管其他位的大小关系，那么低位的排序就完全没有意义了。

​	根据每一位来排序，我们可以**用刚讲过的桶排序或者计数排序**，它们的时间复杂度可以做到 O(n)。如果要排序的数据有 k 位，那我们就需要 k 次桶排序或者计数排序，总的时间复杂度是 O(k*n)。当 k  不大的时候，比如手机号码排序的例子，k 最大就是 11，所以基数排序的时间复杂度就近似于 O(n)。

​	实际上，有时候要排序的数据并不都是等长的，比如我们排序牛津字典中的 20 万个英文单词，最短的只有 1 个字母，最长的我特意去查了下，有 45 个字母，中文翻译是尘肺病。对于这种不等长的数据，基数排序还适用吗？

实际上，**我们可以把所有的单词补齐到相同长度，位数不够的可以在后面补“0”**，因为根据ASCII 值，所有字母都大于“0”，所以补“0”不会影响到原有的大小顺序。这样就可以继续用基数排序了。

我来总结一下，**基数排序对要排序的数据是有要求的，需要可以分割出独立的“位”来比较，而且位之间有递进的关系，如果 a 数据的高位比 b  数据大，那剩下的低位就不用比较了。除此之外，每一位的数据范围不能太大，要可以用线性排序算法来排序，否则，基数排序的时间复杂度就无法做到 O(n) 了**。

```
public class RadixSorter {
    public static void radixSort(int[] arr) {
        if(arr == null || arr.length < 2) {
            return;
        }
        // 选出最大的数字
        int max = Integer.MIN_VALUE;
        for (int i = 0; i < arr.length; i++) {
            max = Math.max(max, arr[i]);
        }
        
        // 按照各个位数进行排序
        for (int i = 1; max / i > 0; i *= 10) {
            countingSort(arr, i);
        }
    }

    /**
     * 计数排序-对数组按照"某个位数"进行排序
     *
     * @param arr
     * @param exp 指数
     */
    public static void countingSort(int[] arr, int exp) {
        if(arr.length <= 1) {
            return;
        }

        // 计算每个元素的个数
        int[] c = new int[10];
        for (int i = 0; i < arr.length; i++) {
            c[(arr[i] / exp) % 10]++;// 取下一位在某号桶中
        }
        // 计算排序后的位置
        // 通过上一个桶，得到自己的区间
        for (int i = 0; i < c.length; i++) {
            c[i] += c[i - 1];
        }
        //临时数组 ， 存储排序之后的结果
        int[] tmp = new int[arr.length];
        for (int i = arr.length; i >= 0; i--) {
            tmp[c[(arr[i] / 10) % 10] - 1] = arr[i];
            c[(arr[i] / 10) % 10]--;   
        }
        
        for (int i = 0; i < arr.length; i++) {
            arr[i] = tmp[i];
        }
    }

}
```

























