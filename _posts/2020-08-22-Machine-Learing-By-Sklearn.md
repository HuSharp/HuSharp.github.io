---
layout: post
title:  "《Sklearn 与 TensorFlow 机器学习实用指南第二版》学习笔记（一）"
date:   2020-08-22 13:56:09 +0800
categories:  ML
tags: 机器学习
author: Hu#
typora-root-url: ..
---

* content
{:toc}
## 一、机器学习概论

### [机器学习系统的类型]

机器学习有多种类型，可以根据如下规则进行分类：

- 是否在人类监督下进行训练（监督，非监督，半监督和强化学习）
- 是否可以动态渐进学习（在线学习 vs 批量学习）
- 它们是否只是通过简单地比较新的数据点和已知的数据点，还是在训练数据中进行模式识别，以建立一个预测模型，就像科学家所做的那样（基于实例学习 vs 基于模型学习）

规则并不仅限于以上的，你可以将他们进行组合。例如，一个先进的垃圾邮件过滤器可以使用神经网络模型动态进行学习，用垃圾邮件和普通邮件进行训练。这就让它成了一个在线、基于模型、监督学习系统。

下面更仔细地学习这些规则。



三、分类

# 机器学习实战（从本地导入mnist数据集）

![在这里插入图片描述](https://img-blog.csdnimg.cn/20191229174124337.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQzMjAwNDk5,size_16,color_FFFFFF,t_70#pic_center)
 第三章这里总是报错，从本地导入好久也没有成功，在网上也搜索了好几天，成功了没有记录下来，在第八章降维中又用到了数据集，查了一下午，终于找到了解决方案，所以记录一下。

## 一、下载数据集

![在这里插入图片描述](https://img-blog.csdnimg.cn/20191229175643674.png#pic_center)
 链接：https://pan.baidu.com/s/1l75u54xnnrsRPRb9tOnUnA
 提取码：w9vb

## 二、新建文件夹

例如：
 1）
 随便选一个盘就好，新建datasets
 ![在这里插入图片描述](https://img-blog.csdnimg.cn/2019122917373540.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQzMjAwNDk5,size_16,color_FFFFFF,t_70#pic_center)
 2）
 在datasets中再新建一个mldata，一会代码中会用到
 ![在这里插入图片描述](https://img-blog.csdnimg.cn/20191229174230327.png#pic_center)
 3）
 将下载好的数据集放入文件夹
 ![在这里插入图片描述](https://img-blog.csdnimg.cn/2019122917445338.png#pic_center)
 万事俱备！

## 三、修改代码

原代码

```css
from sklearn.datasets import fetch_mldata
mnist = fetch_mldata('MNIST original'）
mnist
123
```

修改后的代码

```python
from sklearn.datasets import fetch_mldata
mnist = fetch_mldata('MNIST original',data_home = 'F:/python-study/datasets')
mnist
123
```

其中**data_home**是你刚刚新建的文件夹的绝对路径，当然相对路径也可以。

## 四、测试

测试结果：
 ![在这里插入图片描述](https://img-blog.csdnimg.cn/20191229175115421.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQzMjAwNDk5,size_16,color_FFFFFF,t_70#pic_center)
 原结果：

![在这里插入图片描述](https://img-blog.csdnimg.cn/2019122917531635.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQzMjAwNDk5,size_16,color_FFFFFF,t_70)

