---
layout: post
title:  " Leetcode Easy 100题计划（一）"
date:   2020-10-31 16:29:10 +0800
categories:  算法&DS
tags: 算法  数据结构
author: Hu#
typora-root-url: ..
---

* content
{:toc}




### 1、No1.两数之和

【题目】

给定一个整数数组 `nums` 和一个目标值 `target`，请你在该数组中找出和为目标值的那 **两个** 整数，并返回他们的数组下标。

你可以假设每种输入只会对应一个答案。但是，数组中同一个元素不能使用两遍。

**示例:**

```
给定 nums = [2, 7, 11, 15], target = 9

因为 nums[0] + nums[1] = 2 + 7 = 9
所以返回 [0, 1]
```

【解析】

采用 HashMap  降低时间复杂度
遍历数组 nums，i 为当前下标，每个值都判断 map 中是否存在 target-nums[i] 的 key 值
如果存在则找到了两个值，如果不存在则将当前的 (nums[i],i) 存入 map 中，继续遍历直到找到为止
如果最终都没有结果则抛出异常。

代码实现

```java
class Solution {

	public int[] twoSum(int[] nums, int target) {
        Map<Integer, Integer> map = new HashMap<>();
        for (int i = 0; i < nums.length; i++) {
            if(map.containsKey(target - nums[i])) {
                return new int[]{map.get(target-nums[i]), i};
            }
            map.put(nums[i], i);
        }
        return null;
}  
```





### 2、No.7 整数反转

给出一个 32 位的有符号整数，你需要将这个整数中每位上的数字进行反转。

**示例 1:**

```
输入: 123
输出: 321
```

 **示例 2:**

```
输入: -123
输出: -321
```

**示例 3:**

```
输入: 1534236469
输出: 0
```

**注意:**

假设我们的环境只能存储得下 32 位的有符号整数，则其数值范围为 [−2^31, 2^31 − 1]。请根据这个假设，如果反转后整数溢出那么就返回 0。





代码实现

```java
class Solution {
    // 只能存储得下 32 位的有符号整数, 若翻转后溢出则输出 0 
    public int reverse(int x) {
        int res = 0;
        
        // (-123 % 10) = -3  (-123 / 10) = -12
        while(x != 0) {
            int tmp = x % 10;
            if(res > Integer.MAX_VALUE / 10 || (res == Integer.MAX_VALUE / 10 && tmp > Integer.MAX_VALUE % 10)) {
                return 0;
            }
            if(res < Integer.MIN_VALUE / 10 || (res == Integer.MIN_VALUE / 10 && tmp < Integer.MIN_VALUE % 10)) {
                return 0;
            }
            res = res * 10 + tmp;
        
            x = x / 10;
        }

        return res;
    }
}
```



### 3、No.9回文数

【题目】

判断一个整数是否是回文数。回文数是指正序（从左向右）和倒序（从右向左）读都是一样的整数。

**示例 1:**

```
输入: 121
输出: true
```

**示例 2:**

```
输入: -121
输出: false
解释: 从左向右读, 为 -121 。 从右向左读, 为 121- 。因此它不是一个回文数。
```

【解析】

思路很简单，两种方法，

- 一个采用字符串方式，之前前后指针对比
- 一个采用数值方式，将回文串转换后进行数值对比

```java
    // 字符串方式
    public boolean isPalindrome_1(int x) {
        char[] xc = String.valueOf(x).toCharArray();
        int len = xc.length;

        for (int i = 0; i <= len / 2; i++) {
            int j = len - i - 1;
            if(xc[i] != xc[j]) 
                return false;
        }

        return true;
    }

    // 不转换为字符串
    // 那么就直接转换回文进行数值判断
    public boolean isPalindrome(int x) {
        if(x < 0) {
            return false;
        }

        int tmp = x;// 保存之前值
        int num = 0;
        while(x != 0) {
            num = num * 10 + x % 10;
            x /= 10;
        }
        return num == tmp;
    }
```

