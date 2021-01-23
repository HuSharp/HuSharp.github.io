---
layout: post
title:  " 二分查找探究思考 "
date:   2020-12-23 22:11:17 +0800
categories:  算法&DS
tags: 算法  数据结构
author: Hu#
typora-root-url: ..
---

* content
{:toc}




早就想把二分查找进行一下总结，那便说干就干吧！

参考文章

[二分查找死循环探究](https://blog.csdn.net/weixin_43232955/article/details/107520092?utm_medium=distribute.pc_relevant.none-task-blog-OPENSEARCH-2.control&depth_1-utm_source=distribute.pc_relevant.none-task-blog-OPENSEARCH-2.control)



### while 


剖析一下二分法的 while 是否带有 = 的区别：

#### 1、` while (left <= right) `

```java
public int search(int[] nums, int target) {
    int left = 0, right = nums.length - 1;
    while (left <= right) {
        int mid = left + ((right - left) >> 1);
        if (nums[mid] == target)
            return mid;
        if (target < nums[mid])
            right = mid - 1;
        else
            left = mid + 1;
    }
    return -1;
}
```



#### 2、` while (left < right) `

法二其实是排除法，排除掉不会存在的区间，留下存在的区间（最后一个区间为 1 ）

```java
// mid 划分到左侧 
public int search(int[] nums, int target) {
    int left = 0, right = nums.length - 1;
    while (left < right) {
        int mid = left + ((right - left) >> 1);
        if (nums[mid] == target)
            return mid;
        if (target < nums[mid])
            right = mid;
        else
            left = mid + 1;
    }

    return nums[left] == target ? left : -1;
}

或者
// mid 划分到右侧    
public int search(int[] nums, int target) {
    int left = 0, right = nums.length - 1;
    while (left < right) {
        int mid = left + ((right - left  + 1) >> 1);
        if (nums[mid] == target)
            return mid;
        if (target < nums[mid])
            right = mid - 1;
        else
            left = mid;
    }

    return nums[left] == target ? left : -1;
}
```

注意是 right = mid 而非 left = mid！

- right = mid 和 left = mid + 1 和 int mid = left + (right - left) / 2; 一定是配对出现的；
- right = mid - 1 和 left = mid 和 int mid = left + (right - left + 1) / 2; 一定是配对出现的。上取整

> ### 关于上下取整
>
> - mid 被分到左边区间
>
>   ![image-20201223181406301](./assets/blog_image/2020-12-23-Binary-Search-Think/image-20201223181406301.png)
>
>   这个时候区间被分为两部分：[left, mid] 与 [mid + 1, right]，对应设置边界的代码为 right = mid 和 left = mid + 1;
>
> - mid 被分到右边区间
>
>   ![image-20201223181425070](./assets/blog_image/2020-12-23-Binary-Search-Think/image-20201223181425070.png)
>
>   这个时候区间被分为两部分： [left, mid - 1] 与 [mid, right]，对应设置边界的代码为 right = mid - 1 和 left = mid。
>
>   注意：这种情况下，当搜索区间里只剩下两个元素的时候，一定要将取中间数的行为改成上取整，也就是在括号里加 1。
>
>   
>
>   ![image-20201223184333591](./assets/blog_image/2020-12-23-Binary-Search-Think/image-20201223184333591.png)
>
>   - 这是因为 [left, right] 区间里只剩下两个元素的时候，如果是取中间数 mid 是下取整，一旦进入 left = mid 这个分支，区间就不会再缩小，下一轮搜索的区间还是 [left, right] ，下一次循环取 mid 还是看到了 left ，由于逻辑和上一轮循环一样，因此搜索区间不会缩小，就这样一直下去，这是一个死循环。
>
>   解决方案也很简单，在最后一次循环的时候，把取中间数的时候修改为上取整。那么是不是要做一次判断，什么时候到了最后一轮循环呢？没有必要，整个循环体内，上取整就可以了。这个结论很重要，希望大家能够理解这里上取整的原因。**根据循环体里，中位数被分到哪个区间，来决定取中间数的时候是否上取整。**







#### 有何不同？

**1、 <=，和 < 结束的临界值是什么**

- **`<=`：right == left - 1**
- **`<`：right == left **

- 当法一在 left == right ，左边界和右边界重合的时候，区间里只有 1 个元素时候，二分查找的逻辑还需要继续下去；
- 而法二在 left == right 重合的时候就退出了循环，这一点表示区间里只剩下一个元素的时候，有可能这个元素就是我们要找的那个元素。

while(left <= right)的终止条件是 left == right + 1，写成区间的形式就是 [right + 1, right]，或者带个具体的数字进去 [3, 2]，可见这时候搜索区间为空，因为没有数字既大于等于 3 又小于等于 2 的吧。所以这时候 while 循环终止是正确的，直接返回 -1 即可。

while(left < right)的终止条件是 left == right，写成区间的形式就是 [right, right]，或者带个具体的数字进去 [2, 2]，这时候搜索区间非空，还有一个数 2，但此时 while 循环终止了。也就是说这区间 [2, 2] 被漏掉了，索引 2 没有被搜索，如果这时候直接返回 -1 就可能出现错误。

当然，如果你非要用 while(left < right) 也可以，我们已经知道了出错的原因，就打个补丁好了：

```java
//...
while(left < right) {
    // ...
}
return nums[left] == target ? left : -1;
```

2、何时用哪一个？

- 如果这个二分查找的问题比较简单，在输入数组里不同元素的个数只有 1 个，使用思路 1 ，在循环体内查找这个元素；
- 如果这个二分查找的问题比较复杂，要你找一个可能在数组里不存在，或者是找边界这样的问题，使用思路 2 ，在循环体内排除一定不存在目标元素的区间会更简单一些。







## 变式

变体一：**查找第一个值等于给定值的元素**

```java

```



