---
layout: blog
title:  "自己动手画 CPU《计算机组织与结构实验》（四）"
date:   2020-11-13 18:00:52 +0800
category: principle
---


* TOC
{:toc}

[配套慕课](https://www.icourse163.org/course/HUST-1205809816)

## 四、处理器设计实验

### 前置背景知识

![image-20201114110538633](/assets/blog_image/2020-11-13-hust-cpu-study_4/image-20201114110538633.png)

首先介绍**数据通路**

![image-20201114104952804](/assets/blog_image/2020-11-13-hust-cpu-study_4/image-20201114104952804.png)

**现代 CPU 多采用 专用通路**

- 共享通路(总线型)
  主要部件都连接在公共总线上,各部件间通过总线进行数据传输
  结构简单，实现容易 ,但并发性较差,需分时使用总线,效率低
- 专用通路
  并发度高，性能佳,设计复杂,成本高
  可以看作多总线结构

#### 介绍单总线、双总线、三总线数据通路

对指令

```assembly
ADD R0,R1
(R0)+(R1) -> R0
```

单总线

![image-20201114105521293](/assets/blog_image/2020-11-13-hust-cpu-study_4/image-20201114105521293.png)

双总线

![image-20201114105706866](/assets/blog_image/2020-11-13-hust-cpu-study_4/image-20201114105706866.png)

三总线 并发写入

![image-20201114105835266](/assets/blog_image/2020-11-13-hust-cpu-study_4/image-20201114105835266.png)

#### 数据通路 与 CPU 结构之间的关系

![image-20201114110109759](/assets/blog_image/2020-11-13-hust-cpu-study_4/image-20201114110109759.png)

左下角是互斥的控制信号，因此可见冲突性较大，并发度小

![image-20201114110033962](/assets/blog_image/2020-11-13-hust-cpu-study_4/image-20201114110033962.png)

多总线将 ALU 与 取指令 逻辑分开，因此可以并发执行。

![image-20201114110308476](/assets/blog_image/2020-11-13-hust-cpu-study_4/image-20201114110308476.png)

单周期 MIPS 要求一条指令需要在一个时钟周期内完成。

| REGISTER | NAME    | USAGE                                                        |
| -------- | ------- | ------------------------------------------------------------ |
| $0       | $zero   | 常量0(constant value 0)                                      |
| $1       | $at     | 保留给汇编器(Reserved for assembler)                         |
| $2-$3    | $v0-$v1 | 函数调用返回值(values for results and expression evaluation) |
| $4-$7    | $a0-$a3 | 函数调用参数(arguments)                                      |
| $8-$15   | $t0-$t7 | 暂时的(或随便用的)                                           |
| $16-$23  | $s0-$s7 | 保存的(或如果用，需要SAVE/RESTORE的)(saved)                  |
| $24-$25  | $t8-$t9 | 暂时的(或随便用的)                                           |
| $28      | $gp     | 全局指针(Global Pointer)                                     |
| $29      | $sp     | 堆栈指针(Stack Pointer)                                      |
| $30      | $fp     | 帧指针(Frame Pointer)                                        |
| $31      | $ra     | 返回地址(return address)                                     |

### 一、单周期 MIPS CPU设计

 实验内容

利用运算器实验，存储系统实验中构建的运算器、寄存器文件、存储系统等部件以及 Logisim 中其它功能部件，构建一个32位 MIPS CPU 单周期处理器。数据通路如下图所示：

![image-20201113180337561](/assets/blog_image/2020-11-13-hust-cpu-study_4/image-20201113180337561.png)

> 1) 立即数寻址（immediate addressing），操作数是位于指令自身中的常数。
>
> 2) 寄存器寻址（register addressing），操作数是寄存器。
>
> 3) 基址寻址(base addressing)或偏移寻址( displacement addressing），操作数在内存中，其地址是指令中基址寄存器和常数的和。
>
> 4) PC相对寻址（PC-relative addressing），地址是PC和指令中常数的和。
>
> 5) 伪直接寻址（pseudodirect addressing），跳转地址由指令中26位字段和PC高位相连而成。116硬件/软件接口　虽然我们把MIPS系统结构按32位地址描述，但是几乎所有的微处理器(包括MIPS)都能进行64位地址扩展(见附录E和2.18节)。这些扩展主要是针对大型程序的需要。指令集的扩展使得体系结构发展的同时，保持软件和下一代体系结构的向上兼容性。

 要求支持8条 MIPS 核心指令，最终设计实现的 MIPS 处理器能运行实验包中的冒泡排序测试程序 sort.asm，该程序自动在数据存储器0~15号字单元中写入16个数据，然后利用冒泡排序将数据升序排序，要求统计指令条数与 MARS 中的指令统计数目进行对比。

![image-20201113180401322](/assets/blog_image/2020-11-13-hust-cpu-study_4/image-20201113180401322.png)

**电路框架**

| 信号     | 输入/输出 | 位宽 | 功能描述                 |
| -------- | --------- | ---- | ------------------------ |
| CLK      | 输入      | 1    | 时钟信号                 |
| PC       | 输出      | 32   | 程序寄存器的值           |
| IR       | 输出      | 32   | 当前指令字               |
| RegWrite | 输出      | 1    | 寄存器文件写使能控制信号 |
| RDin     | 输出      | 32   | 寄存器文件写入端口的数据 |
| MemWrite | 输出      | 1    | 存储器写使能控制信号     |
| MDin     | 输出      | 32   | 存储器写入端口的数据\|   |

完成设计后，加载 sort.hex 程序，测试排序功能。

Mem[PC++] -> IR 即 PC++ 是每次加上一条指令的长度。32 位，因此此处为 PC + 4。

1、首先完成 PC 的 +4。是由于 32 位 MIPS 机中所有指令字长均为 4 字节，每条指令在存储器中占用 4 字节的存储单元。而 **PC 中存放的地址是 字节地址**（PC为 32 位，即存放一个表明 一个字节 的地址）。

![image-20201114104004327](/assets/blog_image/2020-11-13-hust-cpu-study_4/image-20201114104004327.png)

而**指令存储器存放的是 字地址**。因此要取出低两位。而长度为 10 位（ROM 定下的），因此取 2-11 位。

R型（Register）指的是寄存器型，I型（Immediate）指的是立即数型，J型（Jump）指的是无条件转移型。

现在对于各个指令进行分析

#### 1、R 型

**1、add 指令**

- **无间址周期**

![无间址周期](https://lyxf2000-1259802619.cos.ap-beijing.myqcloud.com/20200210124601.png)

为 R 型指令， 建立过程如下

![image-20201116160122062](/assets/blog_image/2020-11-13-hust-cpu-study_4/image-20201116160122062.png)

**2、SLT指令**

如果R2的值小于R3，那么设置R1的值为1，否则设置R1的值为0  SLT R1,R2,R3

![SLT指令](https://lyxf2000-1259802619.cos.ap-beijing.myqcloud.com/20200210124531.png)

若为 STL， 那么会在 ALU 进行运算，由于 单周期控制器的 MemToReg（写入寄存器的数据来自存储器即 LW 指令特有） 会为 0 ，因此选择 ALU 判断后的结果，写入到 Din，即 R[rd] 中

![image-20201116162636099](/assets/blog_image/2020-11-13-hust-cpu-study_4/image-20201116162636099.png)

#### 2、I 型

**1、addi 指令**

ADDI  把一个寄存器的内容加上一个立即数  ADDI R1,R2,#3

- **无间址周期**

![无间址周期](https://lyxf2000-1259802619.cos.ap-beijing.myqcloud.com/20200210124545.png)

为 I 型指令，而立即数为 16 位，因此需要扩展

**扩展选择符号扩展**

addi $s1, $s2, 100 ---->>>  $s1 = $s2 + 100

![image-20201116163736464](/assets/blog_image/2020-11-13-hust-cpu-study_4/image-20201116163736464.png)

**2、LW**

**从存储器中**读取一个字的数据到寄存器中  LW R1, 0(R2)

MIPS 的仿存指令属于 I 型指令，访存地址 等于 变址寄存器 $rs 的值 加上 16 位立即数。

- **基址寻址**

![基址寻址](https://lyxf2000-1259802619.cos.ap-beijing.myqcloud.com/20200210124413.png)

![image-20201116163812207](/assets/blog_image/2020-11-13-hust-cpu-study_4/image-20201116163812207.png)

而 MemToReg 用于选择是否是从存储器中读出。

![image-20201116162636099](/assets/blog_image/2020-11-13-hust-cpu-study_4/image-20201116162636099.png)

**3、SW**

把一个字的数据从寄存器存储到存储器中  SW R1, 0(R2)

- **基址寻址**

![](https://lyxf2000-1259802619.cos.ap-beijing.myqcloud.com/20200210124423.png)

![image-20201116164109047](/assets/blog_image/2020-11-13-hust-cpu-study_4/image-20201116164109047.png)

实现如图

![image-20201116164516605](/assets/blog_image/2020-11-13-hust-cpu-study_4/image-20201116164516605.png)

**3、Beq**

数据跳转指令，标志寄存器中Z标志位等于零时, 跳转到BEQ后标签处

- **PC相对寻址**

![image-20201116165002779](/assets/blog_image/2020-11-13-hust-cpu-study_4/image-20201116165002779.png)

![image-20201116165011352](/assets/blog_image/2020-11-13-hust-cpu-study_4/image-20201116165011352.png)

> Q:  此处为何要移位？
>
> A:  立即数中的地址表示是**按字来算**的，对于按字节编址的存储器来说（1字->4字节）需要乘4
>  当然如果你的存储器是按字编址就不需要乘4或左移2位了

![image-20201116175812867](/assets/blog_image/2020-11-13-hust-cpu-study_4/image-20201116175812867.png)

**4、bne** 

数据跳转指令，标志寄存器中Z标志位不等于零时, 跳转到BNE后标签处

![](https://lyxf2000-1259802619.cos.ap-beijing.myqcloud.com/20200210124522.png)

**5、Bne**

同理，取反就行

![image-20201116170235192](/assets/blog_image/2020-11-13-hust-cpu-study_4/image-20201116170235192.png)

#### 3、Syscall

- **无间址周期**

![](https://lyxf2000-1259802619.cos.ap-beijing.myqcloud.com/20200210124633.png)

由于此处作用为 **停机信号**，且 **单周期布线控制器** 专门有一个引脚为 Halt，因此直接调用即可，连接至 PC 的使能信号处。

![image-20201116170819620](/assets/blog_image/2020-11-13-hust-cpu-study_4/image-20201116170819620.png)

 补充一点，这里的停机是靠位于左上方的计数器，计算周期数。在计数器中设置最大值为224，当周期达到224时即可停机。

电路实现如下

![image-20201116183929700](/assets/blog_image/2020-11-13-hust-cpu-study_4/image-20201116183929700.png)

一定要记住！！！！

- 16->32 扩展选择符号扩展
- 将上面的 PC、IR...啥的进行连接，方便检测。

### 二、单周期硬布线控制器

![image-20201116162940783](/assets/blog_image/2020-11-13-hust-cpu-study_4/image-20201116162940783.png)

该实验只涉及 8 条核心的 MIPS 指令。而这 8 条MIPS指令的指令字段已经在附件中给出（关于MIPS指令字段可参考我另一篇关于单总线定长&变长的博客   [biubiu传送门](http://husharp.today/2020/10/19/hust-cpu-study_3/#2mips-ram%E8%AE%BE%E8%AE%A1)  ），并且电路底部文字也给出了关于*SYSCALL*的提示，因此，这部分只需根据相应的*OP*和*FUNC*字段进行简单地逻辑比较就可实现。

电路实现如下

![image-20201116174057681](/assets/blog_image/2020-11-13-hust-cpu-study_4/image-20201116174057681.png)

且打开存储器，发现完成排序

![image-20201116232156005](/assets/blog_image/2020-11-13-hust-cpu-study_4/image-20201116232156005.png)

MIPS 寄存器文件中 0 号寄存器的值恒零

[寄存器看这篇文章](http://husharp.today/2020/10/19/hust-cpu-study_3/#2mips-ram%E8%AE%BE%E8%AE%A1)

### 三、MIPS 微程序 CPU 设计

![image-20201118195644099](/assets/blog_image/2020-11-13-hust-cpu-study_4/image-20201118195644099.png)
![image-20201118195630789](/assets/blog_image/2020-11-13-hust-cpu-study_4/image-20201118195630789.png)
![image-20201118200536417](/assets/blog_image/2020-11-13-hust-cpu-study_4/image-20201118200536417.png)
![image-20201118200046464](/assets/blog_image/2020-11-13-hust-cpu-study_4/image-20201118200046464.png)
