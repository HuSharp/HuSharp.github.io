---
layout: post
title:  "《Java编程思想》读书笔记（二）"
date:   2020-11-16 10:25:27 +0800
categories:  Java
tags: java  编程语言
author: Hu#
typora-root-url: ..
---

* content
{:toc}






## 第十一章：持有对象

### 11.1、各个容器

![image-20201116102605838](/assets/blog_image/2020-11-16-Thinking-In-Java-Read2/image-20201116102605838.png)

`p220`

#### 1、List

- `Arraylist`： `Object[]`数组
- `Vector`：`Object[]`数组
- `LinkedList`： 双向链表(JDK1.6 之前为循环链表，JDK1.7 取消了循环)

##### 1、Arraylist 与 LinkedList 区别?

- 都可自动扩容。
- `ArrayList`底层是**数组结构**，即连续存储空间，所以读取元素快。因可自动扩容，所以可以把`ArrayList`当作“**可自动扩充自身尺寸的数组**”看待。
- ` LinkedList `是**链表结构**，所以插入元素快。 
  - `LinkedList`具有能够直接实现**栈**（Stack）的所有功能的方法，因此可以直接将LinkedList作为栈使用。
  - `LinkdedList`也提供了支持**队列**（Queue）行为的方法，并且实现了Queue接口，所以也可以用作Queue。

#### 2、Set

- `HashSet`（无序，唯一）: 基于 `HashMap` 实现的，底层采用 `HashMap` 来保存元素
- `LinkedHashSet`：`LinkedHashSet` 是 `HashSet` 的子类，并且其内部是通过 `LinkedHashMap` 来实现的。有点类似于我们之前说的 `LinkedHashMap` 其内部是基于 `HashMap` 实现一样，不过还是有一点点区别的
- `TreeSet`（有序，唯一）： 红黑树(自平衡的排序二叉树)

#####  HashSet TreeSet LinkedHashSet

 通用点：Hash开头的容器都是通过Hash值来查找数据，所以特点是无序但速度快;

HashSet 是 Set 接口的主要实现类 ，HashSet 的底层是 HashMap，线程不安全的，可以存储 null 值；

LinkedHashSet 是 HashSet 的子类，能够按照添加的顺序遍历；

TreeSet 底层使用红黑树，能够按照添加元素的顺序进行遍历，排序的方式有自然排序和定制排序。



##### HashSet 如何检查重复值？

当你把对象加入`HashSet`时，HashSet 会先计算对象的`hashcode`值来判断对象加入的位置，同时也会与其他加入的对象的 hashcode 值作比较，如果没有相符的 hashcode，HashSet 会假设对象没有重复出现。但是如果发现有相同 hashcode 值的对象，这时会调用`equals()`方法来检查 hashcode 相等的对象是否真的相同。如果两者相同，HashSet 就不会让加入操作成功。

##### ==与 equals 的区别

对于基本类型来说，== 比较的是值是否相等；

对于引用类型来说，== 比较的是两个引用是否指向同一个对象地址（两者在内存中存放的地址（堆内存地址）是否指向同一个地方）；

对于引用类型（包括包装类型）来说，equals 如果没有被重写，对比它们的地址是否相等；如果 equals()方法被重写（例如 String），则比较的是地址里的内容。





#### 3、Map

- `HashMap`： JDK1.8 之前 HashMap 由数组+链表组成的，数组是 HashMap  的主体，链表则是主要为了解决哈希冲突而存在的（“拉链法”解决冲突）。JDK1.8 以后在解决哈希冲突时有了较大的变化，当链表长度大于阈值（默认为 8）（将链表转换成红黑树前会判断，如果当前数组的长度小于  64，那么会选择先进行数组扩容，而不是转换为红黑树）时，将链表转化为红黑树，以减少搜索时间
- `LinkedHashMap`： `LinkedHashMap` 继承自 `HashMap`，所以它的底层仍然是基于拉链式散列结构即由数组和链表或红黑树组成。另外，`LinkedHashMap` 在上面结构的基础上，增加了一条双向链表，使得上面的结构可以保持键值对的插入顺序。同时通过对链表进行相应的操作，实现了访问顺序相关逻辑。详细可以查看：[《LinkedHashMap 源码详细分析（JDK1.8）》](https://www.imooc.com/article/22931)
- `Hashtable`： 数组+链表组成的，数组是 HashMap 的主体，链表则是主要为了解决哈希冲突而存在的
- `TreeMap`： 红黑树（自平衡的排序二叉树）

##### HashMap 和 Hashtable 的区别

1. **线程是否安全：** HashMap 是非线程安全的，HashTable 是线程安全的,因为 HashTable 内部的方法基本都经过`synchronized` 修饰。（如果你要保证线程安全的话就使用 **ConcurrentHashMap** 吧！）；
2. **效率：** 因为线程安全的问题，HashMap 要比 HashTable 效率高一点。另外，HashTable 基本被淘汰，不要在代码中使用它；
3. **对 Null key 和 Null value 的支持：** HashMap 可以存储 null 的 key 和 value，但 null 作为键只能有一个，null 作为值可以有多个；HashTable 不允许有 null 键和 null 值，否则会抛出 NullPointerException。
4. **初始容量大小和每次扩充容量大小的不同 ：** ① 创建时如果不指定容量初始值，Hashtable 默认的初始大小为 11，之后每次扩充，容量变为原来的 2n+1。HashMap  默认的初始化大小为 16。之后每次扩充，容量变为原来的 2 倍。② 创建时如果给定了容量初始值，那么 Hashtable  会直接使用你给定的大小，而 HashMap 会将其扩充为 2 的幂次方大小（HashMap 中的`tableSizeFor()`方法保证，)。也就是说 HashMap 总是使用 2 的幂作为哈希表的大小。
5. **底层数据结构：** JDK1.8 以后的 HashMap 在解决哈希冲突时有了较大的变化，当链表长度大于阈值（默认为  8）（将链表转换成红黑树前会判断，如果当前数组的长度小于  64，那么会选择先进行数组扩容，而不是转换为红黑树）时，将链表转化为红黑树，以减少搜索时间。Hashtable 没有这样的机制。



#### Arrays.asList()

Arrays.asList()在平时开发中还是比较常见的，我们可以使用它将一个数组转换为一个 List 集合。

```
String[] myArray = { "Apple", "Banana", "Orange" }；
List<String> myList = Arrays.asList(myArray);
//上面两个语句等价于下面一条语句
List<String> myList = Arrays.asList("Apple","Banana", "Orange");
```

![image-20201119001023932](/assets/blog_image/2020-11-16-Thinking-In-Java-Read2/image-20201119001023932.png)



#### 4、栈 

通常可以使用 LinkedList 来代表实现 Stack 的功能

即直接 用 

#### 5、队列 & 优先队列

`p236 `  
Queue 先进先出
同样可以使用 LinkedList 来实现功能，由于其实现了 Queue 接口，可以将其向上转型。

```java
Queue<Integer> queue = new LinkedList<Integer>();
```

`p237`  
PriorityQueue 
简单来说就是具有排序功能的队列，下一个弹出的元素是在队列中优先级最高的一个。使用 Comparator 比较器来进行比较。

可以设置小根堆大根堆

```java
        PriorityQueue<Integer> queue = new PriorityQueue<>(new Comparator<Integer>(){

            @Override
            public int compare(Integer o1, Integer o2) {
                return o1 - o2;
            }
            
        });
```



### 11.2、迭代器

#### 1、迭代器 Iterator 是什么？

```java
public interface Iterator<E> {
    //集合中是否还有元素
    boolean hasNext();
    //获得集合中的下一个元素
    E next();
    ......
}
```

**`Iterator` 对象**称为迭代器（设计模式的一种），集合自带 iterator() 方法。

`p226`
 迭代器具有以下特性：
 1）创建代价小
 2）单向移动
 3）next()获取下一个对象，hasNext()判断是否具有下一个对象，remove()移除当前对象。

**（ListIterator 作为 List 特有的迭代器，具有双向移动功能，其对应方法为 hasPrevious(), previous()）**

```java
    public static void main(String[] args) {
        List<Integer> list = new LinkedList<>();
        Random rand = new Random(100);
        for (int i = 0; i < 100; i++) {
            list.add(rand.nextInt(20));
        }
        display(list.iterator());
    }

    private static void display(Iterator<Integer> it) {
        HashMap<Integer, Integer> map = new HashMap<>();
        while(it.hasNext()) {
            Integer i = it.next();
            if(map.containsKey(i)) {
                map.put(i, map.get(i)+1);
            } else {
                map.put(i, 1);
            }
        }
        System.out.println(map.toString());
    } 
// output:{0=5, 2=4, 3=3, 4=2, 5=5, 6=7, 7=3, 8=10, 9=1, 10=3, 11=8, 12=8, 13=8, 14=7, 15=5, 16=5, 17=4, 18=4, 19=8}   
```





### 11.3、 Collection 和 Iterator

  在Java中，`Collection`是描述所有序列容器的共性的根接口，它可能会被 认为是一个“附属接口”，即因为要表示其他若干个接口的共性而出现的接口。而在标准C++类库中并没有其容器的任何公共基类——容器之间的所有共性都是**通过迭代器达成的**。Java将两种方法绑定到了一起，因为实现`Collection`就意味着需要提供`iterator()`方法。



### 11.4、 容器的元素类型

- **泛型之前**的容器不能持有基本类型元素，显然数组是可以的。但是有了泛型，容器就可以指定并检查它们所持有对象的类型，并且有了**自动包装机制**，容器**看起来还能够持有基本类型**。
- 在Java中，**任何基本类型都不能作为类型参数**。因此**不能创建`ArrayList<int>` 或 `HashMap<int, int>`之类的东西**。但是可以利用自动包装机制和基本类型的包装器来解决，**自动包装机制将自动地实现`int` 到 `Integer`的双向转换**：

```java
public class ListOfInt{
    public static void main(String[] args){
        // 编译错误：意外的类型
        // List<int> li = new ArrayList<int>();
        // Map<int, Interger> m = new HashMap<int, Integer>();
        List<Integer> li = new ArrayList<Integer>();
        for(int i = 0; i < 5; i++){
            li.add(i);      // int --> Integer
        }
        for(int i : li){    // Integer --> int
            System.out.print(i + " ");
        }
    }
}/* Output:
0 1 2 3 4
*/
```



### 11.5、 Include

![image-20201119235020512](/assets/blog_image/2020-11-16-Thinking-In-Java-Read2/image-20201119235020512.png)

虚线框表示接口，实线框表示普通的（具体的）类。带有空心箭头的虚线表示特定的类实现了一个接口。实心箭头表示某个类可以生成箭头指向的类的对象。例如，任何 **Collection** 都可以生成 **Iterator** ， **List** 可以生成 **ListIterator** （也能生成普通的 **Iterator** ，因为 **List** 继承自 **Collection** ）。





## 第十三章：字符串

### 13.1 不可变字符串

  **String对象是不可变的**。String 类中每个看起来会修改 String 值的方法，实际上都是创建了一个**全新**的String 对象，以包含修改后的字符串内容。而最初的 String 对象则丝毫未动。

```java
public class Immutable { 
    public static String upcase(String s) { 
        return s.toUpperCase(); 
    } 
    public static void main(String[] args) { 
        String q = "howdy";
        System.out.println(q); // howdy 
        String qq = upcase(q); 
        System.out.println(qq); // HOWDY 
        System.out.println(q); // howdy 
    } 
} 
/* Output: 
howdy
HOWDY 
howdy
*/ 
```

当把 `q` 传递给 `upcase()` 方法时，实际传递的是引用的一个拷贝。其实，每当把 String 对象作为方法的参数时，都会复制一份引用，而该引用所指向的对象其实一直待在单一的物理位置上，从未动过。

回到 `upcase()` 的定义，传入其中的引用有了名字 `s`，只有 `upcase()` 运行的时候，局部引用 `s` 才存在。一旦 `upcase()` 运行结束，`s` 就消失了。当然了，`upcase()` 的返回值，其实是最终结果的引用。这足以说明，`upcase()` 返回的引用已经指向了一个新的对象，而 `q` 仍然在原来的位置。



### 13.2 重载“+”与 StringBuilder

- 用于 String 的 “**+**” 与 “**+=**” 是 Java 中**仅有的两个重载过的运算符**，**Java不允许程序员重载任何运算符**（但其实Java语言比C++更容易实现运算符的重载）。
- String的不可变性带来了一定的**效率问题**，比如String的“+”运算，每“+”一次都会生成一个新的String对象。**Java编译器一般会自动优化，但不同情况下，优化的程度不够**。





### StringBuilder 和 StringBuilder 

`StringBuilder` 提供了丰富而全面的方法，包括 `insert()`、`replace()`、`substring()`，甚至还有`reverse()`，但是最常用的还是 `append()` 和 `toString()`，还有 `delete()`，

`StringBuilder `是 Java SE5 引入的，在这之前用的是 `StringBuffer`。后者是线程安全的，因此开销也会大些。使用 `StringBuilder` 进行字符串操作更快一点。







## 第十六章：数 组



`Arrays.deepToString()`静态方法专门用来打印多维数组。

### 16.2 粗糙数组

粗糙数组是指，多维数组里，同一层次的子数组，长度可以不相同。专业的说：数组中构成的矩阵的每个向量都可以具有任意的长度。C++里应该是没有粗糙数组的。

```java
public class test {
    public static void main(String[] args) {
        int[][] c = new int[][]{
                {1},
                {2, 3},
                {4, 5, 6},
        };
    }
}
```



### 16.3 Arrays 实用功能

java.util.Arrays有一套用于数组的static实用方法。

- equals()：比较两个数组是否相等,两个数组内容相同，且数组大小也相同才返回 true。
- fill()：用一个值填充整个一维数组。
- sort()：对数组进行排序, 基本类型用快速排序，针对对象用稳定归并排序。
- binarySearch()：在排好序中的数组中进行二分查找，找到元素则返回元素的索引，否则返回负数。数组中若包含重复元素，无法确保找到的是哪一个。
- toString()：产生数组的 String 表示
- hashCode()：产生数组的散列码
- asList()：由数组得到一个list, 但是这个 List 的实现类是 java.util.Arrays.ArrayList这个类(而不是java.util.ArrayList)，它的内部保存了数组的引用，修改了数组的值，list的值也会改变。对list做add、remove操作会抛出UnsupportedOperationException异常, 因为它本质还是一个大小不可变的数组。
   System.arraycopy()：比for循环更高效的数组复制方法，它是浅拷贝，如果复制对象数组，只会复制对象的引用。
   对于元素不是基本类型的对象，用equals()和sort()方法时，需重写元素的equals()方法和实现Comparable接口。

### 具体分析

#### 1、System.arraycopy()

由源码易知作用为：

从 src 源数组的 srcPos 位置开始复制 length 个元素过去，复制到 dest 目标数组的 destPos 位置到 destPos + length - 1 位置。

```
    /* @param      src      the source array.
     * @param      srcPos   starting position in the source array.
     * @param      dest     the destination array.
     * @param      destPos  starting position in the destination data.
     * @param      length   the number of array elements to be copied.
     * @throws     IndexOutOfBoundsException  if copying would cause
     *             access of data outside array bounds.
     * @throws     ArrayStoreException  if an element in the {@code src}
     *             array could not be stored into the {@code dest} array
     *             because of a type mismatch.
     * @throws     NullPointerException if either {@code src} or
     *             {@code dest} is {@code null}.
     */
    @HotSpotIntrinsicCandidate
    public static native void arraycopy(Object src,  int  srcPos,
                                        Object dest, int destPos,
                                        int length);
```

​		两个数组的元素类型 component type 必须是相同的确切类型，即使自动拆装箱在这里也不好使，就算一个数组元素类型为 int ，另一个为 Integer ，也会报错 ArrayStoreException 。
​		另外需要注意，数组的元素类型如果是 reference component type 引用类型，那么复制过去的只是一个引用，即没有发生引用指向的对象的拷贝。



#### 2、equals

```java
    public static boolean equals(int[] a, int[] a2) {
        if (a==a2)
            return true;
        if (a==null || a2==null)
            return false;

        int length = a.length;
        if (a2.length != length)
            return false;

        return ArraysSupport.mismatch(a, a2, length) < 0;
    }
```

- `if (a==a2) return true;`这里，如果两个引用指向的同一个数组，或者两个引用都为null，那么直接返回true。
- `if (a==null || a2==null) return false;`如果只是有一个为null，那么返回false。
- 剩下的逻辑就是依次判断长度，长度一样后，就依次判断各个元素是否一样。





#### 3、toString

Arrays提供了一个toString()方法，直接把一个数组，转换为字符串，这样方便观察数组的内容 											

```
public class HelloWorld {
    public static void main(String[] args) {
        int a[] = new int[] { 18, 62, 68, 82, 65, 9 };
        String content = Arrays.toString(a);
        System.out.println(content);
 
    }
}
```



#### 4、binarySearch()

调用二分查找之前，必须保证数组已经有序，不然返回结果未定义。如果 key 在数组有多个，那么不能保证找到的是哪个 key。





























































