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


# 《Java编程思想》读书笔记（二）



## 第十一章：持有对象

### 11.1、各个容器

`p220`
 ArrayList LinkedList 都是按插入顺序存放数据
 ArrayList在随机访问速度上比较快，而LinkedList在插入和删除数据比较有优势，具有Queue，Stack的特性。
 HashSet TreeSet LinkedHashSet
 HashMap TreeMap LinkedHashMap
 通用点：Hash开头的容器都是通过Hash值来查找数据，所以特点是无序但速度快;
 Tree开头的容器都会将存入的数据进行升序排列；
 Linked则是按插入的顺序进行排序。
 （后面17章会介绍其原理）

![image-20201116102605838](/assets/blog_image/2020-11-16-Thinking-In-Java-Read2/image-20201116102605838.png)