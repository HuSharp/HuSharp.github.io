---
layout: post
title:  "Android Studio导入Github资源"
date:   2020-02-12 20:37:54 +0800
categories:  工具
tags: Android
author: Hu#
typora-root-url: ..
---

* content
{:toc}
由于本人蒟蒻，想要从 GitHub 中膜拜一下各位大佬的源码，但苦于浪费了一下午来摸索咋导入，现干脆写下一篇最终成功了的方法，也方便自己回头看。

===================================================//这是分割线
**1，下好GitHub资源:**
	*1.下载好这个世界最大的男性交友平台~~GayHub~~ Github桌面版*
![Github桌面版](https://img-blog.csdnimg.cn/20200212200853516.png)
	*2.点击网页中下图的Open in Desktop*
![在这里插入图片描述](https://img-blog.csdnimg.cn/20200212200952961.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3dlaXhpbl80NDIyMzY0Ng==,size_16,color_FFFFFF,t_70)
	*3.点Clone，如果被墙的话，那就经过一段漫长的等待吧....*
![在这里插入图片描述](https://img-blog.csdnimg.cn/20200212200913379.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3dlaXhpbl80NDIyMzY0Ng==,size_16,color_FFFFFF,t_70)
**2.重头戏——改变下载的相关参数**

   *1.以此zip文件为例，先解压*
![在这里插入图片描述](https://img-blog.csdnimg.cn/20200212201433939.png)
*2.关注一下几个文件（重点）*
```
1.build.gradle——设置Android Gradle 构建工具版本
2.app/build.gradle——设置你项目的compileSdkVersion、buildToolsVersion和targetSdkVersion
3.gradle/wrapper/gradle-wrapper.properties——设置gradle的版本
4.local.properties——设置你的AndroidSDK存放路径
```
3.在Android Studio中File-new-New Project
目的是建立一个新的空项目，来得到你的电脑中以上四个文件中的具体参数
如，建立一个名叫ActivityTest项目，得到以下很平常的文件夹，然后对照打开Github中下载下来的文件，进入以上提到的四个文件中（我是用Sublime打开的，没有安装文本编辑器的童鞋可以用记事本）
**用新建project中参数——(替代)——>Github中参数**
![在这里插入图片描述](https://img-blog.csdnimg.cn/20200212202024138.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3dlaXhpbl80NDIyMzY0Ng==,size_16,color_FFFFFF,t_70)
4.具体给出我的几个参数

```
1.------build.gradle
dependencies {
    classpath 'com.android.tools.build:gradle:3.5.3'
}

2.------local.properties
sdk.dir=C\:\\Users\\lxcx\\AppData\\Local\\Android\\Sdk

3.------app/build.gradle
    compileSdkVersion 29
    buildToolsVersion "29.0.2"
    targetSdkVersion 29
    
4.------gradle/wrapper/gradle-wrapper.properties
distributionUrl=https\://services.gradle.org/distributions/gradle-5.4.1-all.zip

```
**3.现在就开始快乐导入吧**
	*1.在新建项目界面中，点击File-New-Import Module*
![在这里插入图片描述](https://img-blog.csdnimg.cn/20200212203509744.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3dlaXhpbl80NDIyMzY0Ng==,size_16,color_FFFFFF,t_70)
*2.如图*
![在这里插入图片描述](https://img-blog.csdnimg.cn/20200212203604700.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3dlaXhpbl80NDIyMzY0Ng==,size_16,color_FFFFFF,t_70)
*3.如图*
![在这里插入图片描述](https://img-blog.csdnimg.cn/20200212203628808.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3dlaXhpbl80NDIyMzY0Ng==,size_16,color_FFFFFF,t_70)

然后就开始快乐的学习吧~
=================================================End全剧终