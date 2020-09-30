---
layout: post
title:  "《操作系统真象还原》学习笔记（一）"
date:   2020-07-24 22:15:02 +0800
categories:  Os
tags: linux  操作系统
author: Hu#
typora-root-url: ..
---

* content
{:toc}
## 一、MBR主引导记录的编写

第一条指令：f000:fff0

第二条指令：jmpf 0xf000:e05b ——BIOS开始地方

![image-20200724223912682](/assets/blog_image/2020-07-24-Os-MakeByBook/image-20200724223912682.png)

mbr：512字节，结尾为0x55,0xaa，放在0盘0道1扇区（即磁盘第一个扇区）

7c00h的由来：32kb减去分配1kb给512字节的mbr