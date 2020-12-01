---
layout: post
title:  "关于 Qt 的 Kit 引入"
date:   2019-12-04 19:55:28 +0800
categories:  工具
tags: Qt c++
author: Hu#
typora-root-url: ..
---

* content
{:toc}
最近课设是关于某某系统做交互界面，了解到Qt
便记录一下遇到的相关阻碍以及解决办法
1，关于Unable to create a debugging engine
打开工具-选项 发现Kit是下图这样
![在这里插入图片描述](https://img-blog.csdnimg.cn/20191204194637627.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3dlaXhpbl80NDIyMzY0Ng==,size_16,color_FFFFFF,t_70))
![在这里插入图片描述](https://img-blog.csdnimg.cn/20191204194440154.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3dlaXhpbl80NDIyMzY0Ng==,size_16,color_FFFFFF,t_70)![在这里插入图片描述](https://img-blog.csdnimg.cn/20191204194101535.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3dlaXhpbl80NDIyMzY0Ng==,size_16,color_FFFFFF,t_70)
现在成了这样~
![在这里插入图片描述](https://img-blog.csdnimg.cn/20191204195349260.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3dlaXhpbl80NDIyMzY0Ng==,size_16,color_FFFFFF,t_70)
Over~~
![在这里插入图片描述](https://img-blog.csdnimg.cn/20191204195505142.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3dlaXhpbl80NDIyMzY0Ng==,size_16,color_FFFFFF,t_70)