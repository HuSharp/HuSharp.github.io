---
layout: post
title:  " fork exec wait exit探究"
date:   2020-11-18 19:51:16 +0800
categories:  Linux
tags: Linux 基础知识
author: Hu#
typora-root-url: ..
---

* content
{:toc}



[C 标准库 – stdio](https://www.runoob.com/cprogramming/c-standard-library-stdio-h.html) 

```c
int fclose(FILE *stream)
关闭流 stream。刷新所有的缓冲区。
void clearerr(FILE *stream)
清除给定流 stream 的文件结束和错误标识符。
int feof(FILE *stream)
测试给定流 stream 的文件结束标识符。
int ferror(FILE *stream)
测试给定流 stream 的错误标识符。
int fflush(FILE *stream)
刷新流 stream 的输出缓冲区。
int fgetpos(FILE *stream, fpos_t *pos)
获取流 stream 的当前文件位置，并把它写入到 pos。
FILE *fopen(const char *filename, const char *mode)
使用给定的模式 mode 打开 filename 所指向的文件。
size_t fread(void *ptr, size_t size, size_t nmemb, FILE *stream)
从给定流 stream 读取数据到 ptr 所指向的数组中。
FILE *freopen(const char *filename, const char *mode, FILE *stream)
    .....
```

*#include* <unistd.h> UNIX 系统服务

```c
ssize_t      read(int, void *, size_t); // 读取文件使用
int          unlink(const char *);
ssize_t      write(int, const void *, size_t); // 写文件
int          usleep(useconds_t); // 进程休眠，单位为微妙
unsigned     sleep(unsigned); // 进程休眠，单位为秒

int          access(const char *, int); // 获取文件的权限
unsigned     alarm(unsigned);
int          chdir(const char *);
int          chown(const char *, uid_t, gid_t);
int          close(int); // 关闭文件
size_t       confstr(int, char *, size_t);
void        _exit(int);
pid_t        fork(void);
```

*#include* <stdlib.h> 与环境的通信、内存管理

```c
// 内存管理
calloc 分配和零初始化数组
free 解除已分配内存块
malloc 分配内存块
realloc 重新分配内存块
// 环境
abort 中止当前进程
atexit 设置退出时执行的函数
at_quick_exit (C++11) 设置快速退出时执行的函数
exit 终止呼叫进程
getenv 获取环境字符串
quick_exit (C++11) 快速终止呼叫进程
system 执行系统命令
_Exit (C++11) 终止呼叫进程
```

[fork函数详解](https://blog.csdn.net/qq_22613757/article/details/83990563)

[fork()子进程与父进程的关系（继承了什么）](https://blog.csdn.net/qq_22613757/article/details/88770579)

## fork 的实现

需要复制哪些？

1、pcb 身份证

2、 程序体 即代码段数据段， 进程的实体

3、用户栈（局部变量所在处

4、内核栈——进入内核态时， 一方面需要用它来保存上下文

5、虚拟地址池

6、页表

最后将新进程加入到就绪队列中即可。







### Linux 中的 fork 和 exec

```
getppid() 指当前进程的父进程pid  
getpid() 指当前进程的pid,
fork() 指 fork 返回给当前进程的值  
```

fork()会产生一个和父进程完全相同的子进程，但子进程在此后会 exec 系统调用，**出于效率考虑，linux中引入了“写时拷贝”copy on  write技术，也就是只有进程空间的各段的内容要发生变化时，才会将父进程的内容复制一份给子进程。**在fork之后exec之前两个进程用的是相同的物理空间（内存区），子进程的代码段、数据段、堆栈都是指向父进程的物理空间，也就是说，两者的虚拟空间不同，但其对应的物理空间是同一个。**当父子进程中有更改相应段的行为发生时，再为子进程相应的段分配物理空间，**如果没有exec，内核会给子进程的数据段、堆栈段分配相应的物理空间（至此两者有各自的进程空间，互不影响），而代码段继续共享父进程的物理空间（两者的代码完全相同）。而如果有exec，由于两者执行的代码不同，子进程的代码段也会分配单独的物理空间。

```c
int main()
{
    pid_t pid = fork();
    int count = 0;

    char str[6] = "hello";
    if(pid == 0) {
        printf("I am child!\n");
        count++;
        printf("str:%x\n", (unsigned int)str);
        
    } else {
        sleep(2);
        printf("I am father!\n");
        count++;
        printf("str:%x\n", (unsigned int)str);
    }
    printf("count is : %d\n",count); 
}

// output
I am child!
str:62f96c22
count is : 1
I am father!
str:62f96c22
count is : 1
```

**具体过程如下**：

​	fork 子进程完全复制父进程的栈空间，也复制了页表，但没有复制物理页面，所以这时虚拟地址相同，物理地址也相同，但是**会把父子共享的页面标记为“只读”**（类似mmap的private的方式），那么父子进程一直对这个页面是同一个页面，直到其中任何一个进程要对共享的页面“写操作”，这时内核会分配一个物理页面给这个进程使用，同时修改页表。而把原来的只读页面标记为“可写”，留给另外一个进程使用。

这就是所谓的“写时复制”。

**fork出来子进程之后，父子进程哪个先调度呢？**

内核一般会先调度子进程，因为很多情况下子进程是要马上执行exec，会清空栈、堆 ... 这些和父进程共享的空间，加载新的代码段...，这就避免了“写时复制”拷贝共享页面的机会。如果父进程先调度很可能写共享页面，会产生“写时复制”的无用功。所以，一般是子进程先调度滴。

当然哪个进程先执行要看系统的进程调度策略。

> 执行printf函数的次数为2的一次方+2的2次方+ … … +2的n次方。
>
> 创建的子进程数为 2 的（N）次方 - 1.
>
> ![image-20201130102756953](/assets/blog_image/2020-11-18-fork-exec-wait-exit/image-20201130102756953.png)



### 总结：

假定父进程malloc的指针指向 0x12345678, fork  后，子进程中的指针也是指向0x12345678，但是这两个地址都是虚拟内存地址 （virtual memory)，经过内存地址转换后所对应的  物理地址是不一样的。所以两个进城中的这两个地址相互之间没有任何关系。
 （注1：在理解时，你可以认为fork后，这两个相同的虚拟地址指向的是不同的物理地址，这样方便理解父子进程之间的独立性）
 （注2：但实际上，linux为了提高 fork 的效率，采用了 copy-on-write  技术，fork后，这两个虚拟地址实际上指向相同的物理地址（内存页），只有任何一个进程试图修改这个虚拟地址里的内容前，两个虚拟地址才会指向不同的物理地址（新的物理地址的内容从原物理地址中复制得到）



## exec家族：

exec家族一共六个函数，分别是：

```
(1)int execl(const char *path, const char *arg, ......);
(2)int execle(const char *path, const char *arg, ...... , char * const envp[]);
(3)int execv(const char *path, char *const argv[]);
(4)int execve(const char *filename, char *const argv[], char *const envp[]);
(5)int execvp(const char *file, char * const argv[]);
(6)int execlp(const char *file, const char *arg, ......);

1234567
```

- 其中只有execve是真正意义上的系统调用，其它都是在此基础上经过包装的库函数。
- exec函数族的作用是根据指定的文件名找到可执行文件，并用它来取代调用进程的内容，换句话说，就是在调用进程内部执行一个可执行文件。这里的可执行文件既可以是二进制文件，也可以是任何Linux下可执行的脚本文件。
- 与一般情况不同，exec函数族的函数执行成功后不会返回，从原程序的调用点接着往下执行。因为调用进程的实体，包括代码段，数据段和堆栈等都已经被新的内容取代，只留下进程ID等一些表面上的信息仍保持原样，颇有些神似"三十六计"中的"金蝉脱壳"。看上去还是旧的躯壳，却已经注入了新的灵魂。只有调用失败了，它们才会返回一个-1。





## fork 与 vfork 区别

### vfork

1、函数功能：

**创建轻量级子进程**，vfork 与 fork 的功能基本相同。

2、两者区别：

  有以下两点区别：第一，vfork 函数创建的子进程不复制父进程的物理内存，也不拥有自己独立的内存映射，而是**与父进程共享全部地址空间**；第二，**vfork 函数会在创建子进程的同时挂起其父进程，直到子进程终止**，或**通过 exec 函数启动了另一个可执行程序**。 

3、函数典型用法

终止 vfork 函数创建的子进程，不要使用 return 语句，也不要调用 exit 函数，而要**调用 _exit 函数**，以避免对其父进程造成不利影响。

 **vfork 函数的典型用法**就是在所创建的子进程里直接调用 exec 函数启动另外一个进程取代其自身，这比调用 fork 函数完成同样的工作要快得多。



```cpp
pid_t pid  = vfork ();



if (pid == -1)



	perror ("vfork"), exit (1);



if (pid == 0)



	if (execl ("ls", "ls", "-l", NULL) == -1)



		perror ("execl"), _exit (1);
```

4、写时复制：

传统意义上的 fork 系统调用，必须把父进程地址空间中的内容一页一页地复制到子进程的地址空间中（代码区除外）。这无疑是十分漫长的过程（在系统内核看来）。

 而多数情况下的子进程其实只是想读一读父进程的数据，并不想改变什么。更有甚者，可能连读一读都觉得多余，比如直接通过 exec 函数启动另一个进程的情况。漫长的内核复制在这里显得笨拙毫无意义。

 写时复制以惰性优化的方式避免了内存复制所带来的系统开销。**在子进程创建伊始，并不复制父进程的物理内存，只复制它的内存映射表即可，父子进程共享同一个地址空间，直到子进程需要写这些数据时，再复制内存亦不为迟。**

 写时复制带来的好处是，子进程什么时候写就什么时候复制，写几页就复制几页，没有写的就不复制。惰性优化算法的核心思想就是尽一切可能将代价高昂的操作，推迟到非做不可的时候再做，而且最好局限在尽可能小的范围里。

 **现代版本的 fork 函数已经广泛采用了写时复制技术**，从这个意义上讲，vfork 函数的存在纯粹只是一个历史遗留的产物，尽管它的速度还是比 fork 要快一点（连内存映射表都不复制），但它的地位已远不如写时复制技术被应用到 fork 函数的实现中以前那么重要了。







## 实现的系统调用

   syscall_table[SYS_GETPID] = sys_getpid;

   syscall_table[SYS_WRITE] = sys_write;

   syscall_table[SYS_MALLOC] = sys_malloc;

   syscall_table[SYS_FREE] = sys_free;

   syscall_table[SYS_FORK] = sys_fork;

   syscall_table[SYS_READ] = sys_read;

   syscall_table[SYS_PUTCHAR] = sys_putchar;

   syscall_table[SYS_CLEAR]   = cls_screen;*// 位于 print.S*

   syscall_table[SYS_GETCWD]     = sys_getcwd;

   syscall_table[SYS_OPEN]       = sys_open;

   syscall_table[SYS_CLOSE]      = sys_close;

   syscall_table[SYS_LSEEK]    = sys_lseek;

   syscall_table[SYS_UNLINK]   = sys_unlink;

   syscall_table[SYS_MKDIR]    = sys_mkdir;

   syscall_table[SYS_OPENDIR]  = sys_opendir;

   syscall_table[SYS_CLOSEDIR]   = sys_closedir;

   syscall_table[SYS_CHDIR]    = sys_chdir;

   syscall_table[SYS_RMDIR]    = sys_rmdir;

   syscall_table[SYS_READDIR]  = sys_readdir;

   syscall_table[SYS_REWINDDIR]   = sys_rewinddir;

   syscall_table[SYS_STAT]  = sys_stat;

   syscall_table[SYS_PS]    = sys_ps;

   syscall_table[SYS_EXECV]    = sys_execv;





## 实现函数

uint32_t getpid(void);

uint32_t write(int32_t fd, const void* buf, uint32_t count);

void* malloc(uint32_t size);

void free(void* ptr);

int16_t fork(void);

int32_t read(int32_t fd, void* buf, uint32_t count);

void putchar(char char_asci);

void clear(void);

char* getcwd(char* buf, uint32_t size);

int32_t open(char* pathname, uint8_t flag);

int32_t close(int32_t fd);

int32_t lseek(int32_t fd, int32_t offset, uint8_t whence);

int32_t unlink(const char* pathname);

int32_t mkdir(const char* pathname);

struct dir* opendir(const char* name);

int32_t closedir(struct dir* dir);

int32_t rmdir(const char* pathname);

struct dir_entry* readdir(struct dir* dir);

void rewinddir(struct dir* dir);

int32_t stat(const char* path, struct file_attr* buf);

int32_t chdir(const char* path);

void ps(void);

int execv(const char* pathname, char** argv);







Linux 执行命令， 是 bash（或 shell ）先 fork 一个子进程， 然后调用 exec 去执行命令。（更严格的说， 这是外部命令被执行方式）



## CRT

C Run Time library

- 主要是初始化运行环境，在进入 main 函数前，为用户进程准备条件、传递参数等，待条件准备好之后，再调用用户进程的 main 函数，这样用户进程才能跑起来。
- 进行 call 来调用返回（有去有回
- 当用户进程结束后，CRT 还要负责回收用户进程的资源。（想一下，若是 main 函数运行完毕，到达边界，此时不返回，那么以下就没有固定代码执行，我们便也不知道处理器会执行到哪里去啦）。
- 返回后，CRT 调用系统调用 exit 或 _exit 进行返回，让用户进程陷入内核，回到 OS 手中
- 因此 CRT 才是用户进程的第一部分

如下 code，由于 ld 默认 _start 为链接器入口符号，

start.S

```asm
extern	 main
section .text
global _start
_start:
   ;下面这两个要和execv中load之后指定的寄存器一致
   push	 ebx	  ;压入argv
   push  ecx	  ;压入argc
   call  main
```

![image-20201130105602230](/assets/blog_image/2020-11-18-fork-exec-wait-exit/image-20201130105602230.png)



## exit 和 wait

[return 和 wait](https://blog.csdn.net/qq_29350001/article/details/53096908)

首先要明白，子进程的工作完成与否，需要向父进程报告。那么怎么报告呢？通过子进程的返回值体现,也就是 main 函数最后的 return 值。通常main的返回值是int型, 正确返回0。 

而若是进程进程还未到 return 就想半路退出呢？采用 exit 函数。

当进程 exit 结束后，将自己的**遗言**放在 pcb 中。进程 exit 后，大部分占用资源都会被回收，比如内存、页表...但是 pcb 不会，会在父进程调用 wait 后再由内核回收所占用的 1 页框内存。（相当于父进程通过 wait 给 子进程 exit 后**收尸**）



### exit ( ) 函数介绍

**函数原型：**

```
#include <stdlib.h>
void exit(int status)
```

**参数：**
status -- 返回给父进程的状态值。

**函数作用：**

关闭所有文件，终止正在执行的进程

**exit(0)表示正常退出，**
**exit(x)（x不为0）都表示异常退出**，这个x是返回给操作系统（包括UNIX,Linux,和MS DOS）的，以供其他程序使用。

通常情况下，程序成功执行完一个操作正常退出的时候会带有值 EXIT_SUCCESS。在这里，**EXIT_SUCCESS 是宏，它被定义为 0。**如果程序中存在一种错误情况，当您退出程序时，会带有状态值**EXIT_FAILURE，被定义为 1**。

```
标准C中有 EXIT_SUCCESS 和 EXIT_FAILURE 两个宏，位于 /usr/include/stdlib.h中
#define EXIT_FAILURE    1   /* Failing exit status.  */
#define EXIT_SUCCESS    0   /* Successful exit status.  */
```



#### **_exit 函数** 和 **exit 函数**

_exit() 函数：**直接使进程停止运行，**清除其使用的内存空间，并销毁其在内核中的各种数据结构;
exit()  函数：则在这些基础上作了一些包装（包括调用执行各终止处理程序，关闭所有标准I / O流等)），在执行退出之前加了若干道工序。
exit() 函数与 _exit() 函数最大的区别就在于 **exit() 函数在调用 exit 系统调用之前要检查文件的打开情况，**把文件缓冲区中的内容写回文件。

​	在Linux的标准函数库中，有一种被称作“**缓冲I/O（buffered I/O）**”的操作，其特征就是对应每一个打开的文件，在内存中都有一片缓冲区。
​	每次读文件时，会连续读出若干条记录，这样在下次读文件时就可以直接从内存的缓冲区中读取;同样，每次写文件时，也仅仅是写入内存中的缓冲区，等满足了一定的条件（如达到一定数量或遇到特定字符等，最典型的就是咱们的vim中使用的:w命令），再将缓冲区中的内容一次性写入文件。
这种技术大大增加了文件读写的速度，但也给咱们的编程带来了一些麻烦。比如有些数据你认为已经被写入到文件中，实际上因为没有满足特定的条件，它们还只是被保存在缓冲区内，**这时用_exit()函数直接将进程关闭掉，缓冲区中的数据就会丢失**。因此，若想保证数据的完整性，最好使用exit()函数。

![image-20201130112638412](/assets/blog_image/2020-11-18-fork-exec-wait-exit/image-20201130112638412.png)

### wait 函数

继续上面的 exit 函数，由于进程都是独立的空间，父子进程直接也是独立不可互相访问的，这就是与线程的区别！！！进程间要想通信，就必须靠内核！。**而父进程可以使用wait系列函数获取子进程退出状态**。

#### wait 函数功能

 1、阻塞父进程的运行，直到子进程终止再继续，停等同步。

 2、获取子进程的 PID 和终止状态，令父进程得知谁因何而死。

 3、为子进程收尸，防止大量僵尸进程耗费系统资源。



#### 孤儿进程

当父进程提前退出时，其所有的子进程还在运行，这些进程此时就被称为 **孤儿进程**， 这时候，所有的子进程都会被 init 进程收养，init 会成为这些进程的新父亲。这些子进程退出时，init 来进行**收尸**。

实例说明

```c
int main(void)
{
    int i = 0;
    printf("son/pa ppid pid  fpid\n");
    printf("\n");
    //ppid指当前进程的父进程pid
    //pid指当前进程的pid,
    //fpid指fork返回给当前进程的值

    pid_t fpid = fork();
    if (fpid == 0) {
        sleep(1);
        printf("child  %4d %4d %4d\n", getppid(), getpid(), fpid);
    } else {
        // exit(EXIT_FAILURE);
        printf("parent %4d %4d %4d\n", getppid(), getpid(), fpid);
    }

// output
son/pa ppid pid  fpid
parent 4273 29748 29749
 child     1 29749    0
```

子进程被暂停 3 秒，所以当父进程退出时，子进程仍然未退出，这样子进程即成为孤儿进程。根据输出结果可知，当**暂停 3 秒结束时，子进程的父进程变成了 1**，**即 init 进程**，又被称为孤儿进程。

发现 子进程此时被过继到 init 进程（ppid = 1）



#### 僵尸进程 zombie

当父进程派生出子进程后，没有调用 wait 来等待接收子进程的返回值，这时若有子进程 exit 退出，自然也就没有来接收返回值（父进程还在，不能过继给 init 进程，init 也不能帮子进程善后收尸）。因此没有人**收尸**，那么其 PCB 就不能释放。

Linux 中通过 ps 查看指令，stat 为 'Z' 就是僵尸进程。

问题根源在于父进程，可以通过 将 stat 为 'Z'  的进程的 ppid kill 掉就会过继给 init了。

demo

函数sleep的作用是让父进程休眠指定的秒数，在这10秒内，子进程已经退出，而父进程正忙着睡觉，不可能对它进行收集，这样，我们就能保持子进程 10秒 的僵尸状态。

```c
int main(void)
{
    int i = 0;
    printf("son/pa ppid pid  fpid\n");
    printf("\n");
    //ppid指当前进程的父进程pid
    //pid指当前进程的pid,
    //fpid指fork返回给当前进程的值

    pid_t fpid = fork();
    if (fpid == 0) {
        
        printf("child  %4d %4d %4d\n", getppid(), getpid(), fpid);
    } else {
        sleep(20);
        printf("parent %4d %4d %4d\n", getppid(), getpid(), fpid);
    }

    return 0;
}
```

![image-20201130122828846](/assets/blog_image/2020-11-18-fork-exec-wait-exit/image-20201130122828846.png)

```shell
ps -e -o ppid,stat | grep Z
```

上图可看到 31406 为僵尸进程







**1、父进程在创建若干子进程以后调用 wait 函数**

 若所有子进程都在运行，则阻塞，直至有子进程终止。

 若有一个子进程已终止，则返回该子进程的 PID 并通过 status 参数 （若非 NULL）输出其终止状态。

 若没有需要等待的子进程，**则返回 -1，置 error 为 ECHILD**。

















