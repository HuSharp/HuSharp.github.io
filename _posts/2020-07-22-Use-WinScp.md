---
layout: post
title:  "WinScp的安装（实现linux虚拟机和主机的文件传输）"
date:   2020-07-22 21:30:00 +0800
categories:  工具
tags: linux  虚拟机
author: Hu#
typora-root-url: ..
---

* content
{:toc}
## 背景

前提概要：由于琢磨老久的VBox下的Ubuntu32位不能安装增强功能，但又不想在vscode下代码提示下快乐code，于是决定整一个WinScp进行文件传输。

## 环境

 PC：windows
 PC软件：WinSCP
 虚拟机：Ubuntu

## Ubuntu配置

首先确认虚拟机的ssh服务是否已经开启

```
ps -e | grep ssh
```

如果只有ssh-agent那ssh-server还没有启动，需要/etc/init.d/ssh start，如果看到sshd那说明ssh-server已经启动了，如果启动不成功说明需要安装ssh服务：

```
sudo apt-get install sshd 或
sudo apt-get install openssh-server
```

安装后启动成功就可以了

```
service sshd start 或
/etc/init.d/ssh start
```

## VirtualBox配置

网卡个数需要关闭正在运行的Ubuntu才能设置
网卡1设置网络地址转换（默认）（在此模式下与PC同DNS）

![image-20200722213323731](/assets/blog_image/2020-07-22-Use-WinScp/image-20200722213323731.png)

网卡2设置仅主机（Host-Only）网络

![image-20200722213408301](/assets/blog_image/2020-07-22-Use-WinScp/image-20200722213408301.png)



## 网络通信

配置好后启动Ubuntu，终端输入：Ifconfig查看网络地址，第二个，也就是Host-Only中的ip地址，我们在PC端去ping

![image-20200722213525532](/assets/blog_image/2020-07-22-Use-WinScp/image-20200722213525532.png)

![image-20200722213537106](/assets/blog_image/2020-07-22-Use-WinScp/image-20200722213537106.png)

填写好对应信息

![image-20200722213637696](/assets/blog_image/2020-07-22-Use-WinScp/image-20200722213637696.png)

## 最终展示

![image-20200722213655639](/assets/blog_image/2020-07-22-Use-WinScp/image-20200722213655639.png)



## 一个问题：关于 登录root会显示如下情况

![image-20200722213856746](/assets/blog_image/2020-07-22-Use-WinScp/image-20200722213856746.png)

**1.需要修改ssh配置文件**：vim etc/ssh/sshd_config

在#PermitRootLogin without-password 此行下新增一行：

PermitRootLogin yes

![image-20200722213454406](/assets/blog_image/2020-07-22-Use-WinScp/image-20200722213454406.png)

2.重启ssh

```
service ssh restart
```

### 登录root展示：

![image-20200722214003520](/assets/blog_image/2020-07-22-Use-WinScp/image-20200722214003520.png)