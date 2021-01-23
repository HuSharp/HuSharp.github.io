---
layout: post
title:  "汇编实验"
date:   2019-11-23 18:13:28 +0800
categories:  汇编
tags: 汇编 基础知识
author: Hu#
typora-root-url: ..
---

* content
{:toc}
**目录**

第1章  绪论	..2
1.1  学习概况	2
1.2  项目背景和具体要求	2
1.2.1  项目背景	2
1.2.2  具体要求	2
第2章  程序设计	3
2.1  设计思路（程序一）	3
2.1.1  设计主模块	3
2.1.2  主要函数概括	4
        2.1.3  源代码	5
        2.1.4  结果展示	12
        2.1.5  结语	12
2.2  设计思路（程序二）	13
2.2.1  设计主模块	13
2.2.2  主要函数概括	14
        2.2.3  源代码(横向输出)	16
        2.2.4  源代码(竖向输出)	22
        2.2.5  结果展示	28
        2.2.6  结语	28
		
结束语	29
参考文献	30







**第1章  绪论**

**1.1	学习概况**
	本学期完成了《汇编语言程序设计》这门课程，对微机系统结构和80系列指令系统有了一些理解，大致掌握了汇编语言程序设计的基本方法和技巧。
	汇编语言是面向机器的低级语言，通过学习汇编语言，才能真正理解计算机的工作原理和工作过程，才能深入地了解高级语言的一些概念。应用汇编语言，程序员可以直接操纵计算机的硬件，用汇编语言，才能编写出运行速度快、占有空间小的高效程序。即便是在高级语言功能非常强大的今天，一些程序设计语言不断被淘汰，新的优秀的编程语言不断出现，汇编语言仍然处于重要地位，发挥着它的重要作用，并且不能由其它语言所替代。
	汇编语言的重要性毋庸置疑，因此我认真完成老师布置的两个程序设计，并做好程序设计报告，总结在实验中所遇到的困难，以及学习汇编所得到的收获。
	所需完成项目一为输出1-100000以内的素数，项目二为输出斐波拉契前50项，这要注意运用汇编语言程序设计的知识，进一步理解和掌握较复杂程序的设计方法，掌握子程序结构的设计和用户界面的设计。
**1.2  项目背景和具体要求**
 *1.2.1  项目背景*
（1）.	质数(prime number)又称素数，有无限个。一个大于1的自然数，除了1和它本身外，不能被其他自然数整除，换句话说就是该数除了1和它本身以外不再有其他的因数;否则称为合数。根据算术基本定理，每一个比1大的整数，要么本身是一个质数，要么可以写成一系列质数的乘积;而且如果不考虑这些质数在乘积中的顺序，那么写出来的形式是唯一的。最小的质数是2。且目前为止，人们未找到一个公式可求出所有质数。
（2）.	斐波那契数列，又称黄金分割数列，指的是这样一个数列：0、1、1、2、3、5、8、13、21、34、……在数学上，斐波纳契数列以如下被以递归的方法定义：F（0）=0，F（1）=1，F（n）=F(n-1)+F(n-2)（n≥2，n∈N*）在现代物理、准晶体结构、化学等领域，斐波纳契数列都有直接的应用，
 *1.2.2  具体要求*
（1）.	输出1-100000以内质数 
（2）.	输出斐波拉契前50项
（3）.	熟悉汇编语言循环结构，熟悉开发工具MASM
（4）.	程序采用子程序结构，注意结构清晰；
（5）.	友好清晰的用户界面，能识别输入错误并控制错误的修改。      





**2.1设计思路**
*2.1.1  设计主模块*
	   2.1.1.1 主模块main
		main模块首先根据从Next模块中转换得到的查找范围EBX的内容从2开始检查，从小到大依次让查找范围内的所有数除以比它小而大于等于2的所有数，如果不能除尽的话则是素数，在屏幕上打印此查找范围内的所有素数。

 



*2.1.2  主要函数概括*
2.1.1.2  print模块
若以“xxxx”的格式打印素数，则需要将素数除权值1000、100、10、1后的商依次输出即可，需要考虑当前素数除以权值的商是否为零，且是否是输出的第一位，例如“  103”的第一位的空格及第三位的0。


*2.1.3 源代码展示*

```
;========================================
.386
assume cs:code

;========================================
code segment use16

start:
    mov eax,2
Next:
	mov ecx,eax
	mov ebx,2	;循环判断参数从2开始 

Judge:	
		mov eax,ecx
		cmp ebx,eax	;只能除1和本身，即为素数
		;只能除1和本身，即为素数
		jz Print
	;jz TiaoPrint
	

	mov edx,0
	div ebx		;dx是余数，ax是商
	;pop ax
	cmp edx,0	
	jz Border	;!=0  即 继续循环
	
	inc ebx		;除到400还没有跳出去，是素数
	cmp bx,100
	;jz AddAddPrint
	jz Print

	jmp Judge

;===================================

Border:	
	mov eax,ecx
	cmp eax,100000
	jz Exit
	
	inc eax
	jmp Next	;继续循环判断

;========================

Print:;对bx到达400还未除尽进行判断	
	mov eax,ecx
	
	cmp eax,100000
	jnb HighTen
	cmp eax,10000
	jnb HighGeWei
	cmp ax,1000
	jnb OverThousand	;ax>=1000
	cmp ax,100
	jnb OverHundred	;1000>ax>=100
	cmp ax,10
	jnb Overten	;100>ax>=10
	
	jmp GeWei	;将个位数ASCII码转化显示数字

;====================================

HighTen:
	mov edx,0	;数字转为字符串 30h即48
	mov ebx,100000
	div ebx
	mov ebx,edx
	mov dx,ax
	add dl,30h
	mov ah,2h
	int 21h		
	mov eax,ebx

HighGeWei:
	;mov dl,al
	mov edx,0	;数字转为字符串 30h即48
	mov ebx,10000
	div ebx
	mov ebx,edx
	mov dx,ax
	add dl,30h
	mov ah,2h
	int 21h		
	mov eax,ebx

;================================================

OverThousand:;AX>=1000
	mov edx,0
	mov ebx,1000
	div ebx		;dx是余数，ax是商
	mov bx,dx
	mov dl,al
	add dl,30h
	mov ah,2h
	int 21h;输出千位数
	mov ax,bx	;传到下一个
	
OverHundred:	
	mov bl,100
    div bl
    mov bl,ah 
   	mov dl,al	;ah为余数， al为商
    add dl,30h
  	mov ah,2h
   	int 21h;输出百位数
   	mov al,bl;传到下一个
   	mov ah,0	;将商归零
	
Overten:
	mov bl,10
	div bl	;ah为余数， al为商
	mov bl,ah
	mov dl,al
	add dl,30h
	mov ah,2h
	int 21h
	mov al,bl
	mov ah,0

GeWei:
	mov dl,al
	add dl,30h	;数字转为字符串 30h即48
	mov ah,2h
	int 21h

	mov dl,20h	;加空格
	mov ah,2h
	int 21h
	jmp Border
	
;============================================

Exit:	
	mov ax,4c00h
	int 21h	
;============================================
code ends
end start
;=============================================

```





*2.1.4  结果展示*
1.开始过程


![在这里插入图片描述](https://img-blog.csdnimg.cn/20200213100854648.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3dlaXhpbl80NDIyMzY0Ng==,size_16,color_FFFFFF,t_70)
2.中间过程


 ![在这里插入图片描述](https://img-blog.csdnimg.cn/20200213100908237.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3dlaXhpbl80NDIyMzY0Ng==,size_16,color_FFFFFF,t_70)


3.最后结果

![在这里插入图片描述](https://img-blog.csdnimg.cn/20200213100931337.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3dlaXhpbl80NDIyMzY0Ng==,size_16,color_FFFFFF,t_70)
*2.1.5  结语*
	第一个小程序到此便完成了。这个小系统基本上完成了课程设计的要求，能进行十万以内的质数计算和显示，但也有一些局限，比如说界面并不是很好看，今后在这方面还需要做相应的改进。
	
;=================================================这是分割线

**2.2.2  主要函数概括**
	1.斐波拉契函数压栈
	2.transform出栈进行值的交换
	3.按位输出

2.2.3  源代码(横向输出)

```
;===================================
assume cs:code,ds:data
;===================================

data segment
X		db	0		;记录位数
Y		db	0		;判断进位
STRING1	db	10	dup('0'),'1'	;STRING1 用于存放当前值
STRING2	db	10	dup('0'),'1'	;STRING2 用于存放上一个值
cr_lf	db	13,10,36
data ends

;===================================

stack segment
	db	128	dup('0')
stack ends

;================================

code segment
start:
	mov ax,data
	mov ds,ax
  
  	jmp Judge

;========================================

Judge:
	inc X
	cmp X,2
	jle	output_1	;将前两个先输出
	cmp X,49
	jz Exit
	call fibo

;========================================

;走完fibo后 直接output_1	
output_1:
	call output
	jmp Judge
;========================================  
;========================================       

Exit:    
	mov ax,4c00h
	int 21h

;========================================
;========================================       

cm_lf:
	lea dx,cr_lf	;13 是回车、10 是换行。
	mov ah,9		;显示模块
	int 21h
	
	ret

;=====================================	

fibo:
	mov si,10
	mov cx,11
		
again:
	mov al,STRING1[si]
	and al,0fh	;将低位置零
	mov ah,STRING2[si]	
	and ah,0fh	;将高位置零
	add al,ah	
	add al,Y
	cmp al,10
	jb Below_10
	;进位 
	mov Y,1
	mov ah,0
	mov al,al
	mov dl,10
	div dl
	mov al,ah	;al是商 ah是余数
	mov ah,0
	push ax	;将11位压栈
	dec si
	loop again

;========================

Below_10: 
	mov Y,0
	mov ah,0
	push ax
	dec si
	loop again
;=====================================

;将栈中ax输出到STRING中
	mov cx,11
	mov si,0
	
transform:
	pop ax
	mov dl,STRING1[si]
	mov STRING2[si],dl	;si+11存储上一个值
	mov STRING1[si],al		;si存储当前值
	inc si
	loop transform
	
	ret       

;========================================
output:
	mov si,0
	mov cx,11
	
output_string:
	mov dl,STRING1[si]
	add dl,30h
	mov ah,2h
	int 21h
	inc si
	loop output_string

output_ret:	
	;call cm_lf
	mov ah,2
	mov dl,32
	int 21h	
	ret  
;=========================================
;========================================
code ends
end start
```













2.2.4  源代码(竖向输出)

```
;===================================
assume cs:code,ds:data
;===================================
data segment
X		db	0		;记录位数
Y		db	0		;判断进位
STRING1	db	10	dup('0'),'1'	;STRING1 用于存放当前值
STRING2	db	10	dup('0'),'1'	;STRING2 用于存放上一个值
cr_lf	db	13,10,36
data ends
;===================================
stack segment
	db	128	dup('0')
stack ends
;================================
code segment
start:
	mov ax,data
	mov ds,ax
  
  	jmp Judge
;========================================
Judge:
	inc X
	cmp X,2
	jle	output_1	;将前两个先输出
	cmp X,51
	jz Exit
	call fibo
;========================================
;走完fibo后 直接output_1	
output_1:
	call output
	jmp Judge
;========================================  
;========================================       
Exit:    
	mov ax,4c00h
	int 21h
;========================================
;========================================       
cm_lf:
	lea dx,cr_lf	;13 是回车、10 是换行。
	mov ah,9		;显示模块
	int 21h
	
	ret
;=====================================	
fibo:
	mov si,10
	mov cx,11
		
again:
	mov al,STRING1[si]
	and al,0fh	;将低位置零
	mov ah,STRING2[si]	
	and ah,0fh	;将高位置零
	add al,ah	
	add al,Y
	cmp al,10
	jb Below_10
	;进位 
	mov Y,1
	mov ah,0
	mov al,al
	mov dl,10
	div dl
	mov al,ah	;al是商 ah是余数
	mov ah,0
	push ax	;将11位压栈
	dec si
	loop again
;========================
Below_10: 
	mov Y,0
	mov ah,0
	push ax
	dec si
	loop again
;=====================================
;将栈中ax输出到STRING中
	mov cx,11
	mov si,0
	
transform:
	pop ax
	mov dl,STRING1[si]
	mov STRING2[si],dl	;si+11存储上一个值
	mov STRING1[si],al		;si存储当前值
	inc si
	loop transform
	
	ret       
;========================================
output:
	mov si,0
	mov cx,11
	
output_string:
	mov dl,STRING1[si]
	add dl,30h
	mov ah,2h
	int 21h
	inc si
	loop output_string

output_ret:	
	call cm_lf	
	ret  
;=========================================
;========================================
code ends
end start
```









2.2.5  结果展示
	1.横向全部输出

![在这里插入图片描述](https://img-blog.csdnimg.cn/20200213100623107.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3dlaXhpbl80NDIyMzY0Ng==,size_16,color_FFFFFF,t_70)
2.竖向全部输出
 ![在这里插入图片描述](https://img-blog.csdnimg.cn/20200213100706483.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3dlaXhpbl80NDIyMzY0Ng==,size_16,color_FFFFFF,t_70)

*2.2.6  结语*
	第二个小程序到此便完成了。这个小系统基本上完成了课程设计的要求，能进行斐波拉契前50项的计算和显示，但也有一些局限，比如说界面并不是很好看，今后在这方面还需要做相应的改进。



**结束语**

在接触汇编语言之后，我一开始有一种畏难感，感到汇编语言并不是很容易就可以弄懂的。相比较以前学过的高级语言如C、C++等，电脑等于在迁就人的思维方式，但学汇编，人却必须要去迁就电脑的思维方式，要设身处地地用电脑的角度去思考问题，这就是我们学习汇编语言时遇到的最大的障碍。
通过本次课程设计，进一步巩固了我对masm编译环境的认识，而且对之前所学的课本知识有了进一步的了解和认知，本来感觉对课本知识掌握的不错，但这次课程设计让我发现自己并没有对汇编语言设计有一个很好的了解，对子程序还有很多DOS功能调用掌握的并不好，以至于很多东西都要翻书查找相关内容，重新学习，才能做好程序。
在编译过程中，难免会出现了很多意想不到的各种逻辑，语法，运行上的错误从而得不到正确的结果，特别是在跳转发生是寄存器内容的变化方面需要进行细致的处理，稍有不留心就会出现错误，遇到这些错误时，我们一定要耐心调试，才能够发现其中的错误。
在汇编语言程序设计中，因为是基于底层的语言，有各种跳转语句和控制语句，因此进行程序设计时，我们一定要养成规划程序的总体机构的好习惯，画出程序执行流程图，根据每个功能的分布情况，形成了程序的框架设计，总之通过这次课程设计，我认识到平时应该多练习编写经典程序，只有这样才能熟练掌握汇编语言，因为编写程序时会遇到各种编译，运行错误，这些都是我们在平常的书本学习遇不到的问题，毕竟遇到问题才能解决问题，才能让我们的水平有质的提升。
要学好汇编语言，实验是必不可少的环节。我们深有体会：书上的程序都能看懂，基本原理也都明白，但是在自己亲手编写程序时，却无从下手，甚至连第一句该怎么写都不知道。通过实验，可以在很大程度上加深印象。在书上看程序，一切都是理所当然，十分顺利，而自己动手，才会真正发现自己的不足之处。程序的编写在Masm中进行即可，掌握debug的使用对实验是有很大帮助的。











**参考文献**

[1] 雷向东,雷振阳,龙军. 汇编语言程序设计[M].长沙:中南出版社,2019(1):8.
[2] 王爽. 汇编语言[M].北京:清华大学出版社,2013(1):9
[3] 沈美明,温冬婵. IBM-PC汇编语言程序设计[M]. 北京:清华大学出版社,2001(1):4.
[4] CSDN论坛博客文章