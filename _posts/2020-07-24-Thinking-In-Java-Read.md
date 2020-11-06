---
layout: post
title:  "《Java编程思想》读书笔记"
date:   2020-07-24 14:10:00 +0800
categories:  Java
tags: java  编程语言
author: Hu#
typora-root-url: ..
---

* content
{:toc}




# 《Java编程思想》读书笔记



## 第一章：对象导论

- 将衍生累的对象当作基础类的对象来对待，把子类的类型当作父类类型来处理的操作叫做upcasting向上转型。
- final，static，private和构造方法是静态绑定在创建类是就被初始化。而动态绑定的典型发生在父类和子类的转换声明之下：比如：Parent p = new Children();而p.show()方法则先在子类中找对应的方法如果没有就调用父类方法。此为动态绑定。
- 类创建者，把类中最内部最脆弱的部分隐藏起来，可以避免让客户端程序员使用而产生bug。
- 所有类都继承自单一的基类，这个类是Object.叫做单根继承。这对于垃圾的回收可以提高很大的效率。
- 用引用来操作对象，引用相当于遥控器，对象相当于电视机。没有电视机，遥控器也可以独立存在比如 String s;
- java的基本类型数据直接存放到堆栈中。堆栈的存储更高效。基本类型的所占存储空间不变型是Java语言可移植的原因之一。
- 类的成员变量先声明，什么时候用什么时候初始化，而局部变量要直接初始化然后用。
- boolean没有明确的大小。仅定义能够取true或者false.
- BigInteger可以存储任意精度的int数据。BigDecimal可以存储任意精度小数。
- java主要目标之一是安全性。
- .net平台相当于JVM，JAVA程序的软件平台和JAVA类库，C#和JAVA有很多类似之处。



## 第二章：一切都是对象

### 二、基本类型

`p26`
 基本数据类型在没有初始化的时候会获得一个默认值。

| 基本数据类型 | 默认值 |  大小  | 包装器类  |
| :----------: | :----: | :----: | --------- |
|   boolean    | false  | 未确定 | Boolean   |
|     char     |  null  | 16bits | Character |
|     byte     |   0    | 8bits  | Byte      |
|    short     |   0    | 16bits | Short     |
|     int      |   0    | 32bits | Integer   |
|    float     |   0f   | 32bits | Float     |
|     long     |   0L   | 64bits | Long      |
|    double    |   0d   | 64bits | Double    |

 *tip1:String不是基本数据类型*
 *tip2:上面的初始默认值并不适用于方法内部变量。其默认初始化值未知。当使用未初始化的变量编译器会返回错误*



## 第三章：操作符

### 一、别名现象

`p40`
 当两个变量包含的是同一个引用时，修改其中一个变量的值另一个变量的值也同时改变。记住new出来的对象的=赋值都是只传递引用。
 *Tip:减少为对象赋值。*

```java
class T{
	int i;
}

public class Assigment {

	public static void main(String[] args) {
		T t1 = new T();
		T t2 = new T();
		t1.i = 5;
		t2.i = 8;
		t1 = t2;
		t1.i = 10000;
		System.out.println(t2.i);
	}

}
//10000
```

### 二、位操作

1. 与，或，异或，非 `&,|,^,~`

2. **移位操作符**：
    $<<$:操作数向左移动，低位补0；
    $>>$:操作数向右移动，(1)符号为正时，高位补0，(2)符号为负时，高位补1；
    $>>>$:**无符号右移操作符**（java独有操作符），操作数向右移动，高位统一补0。
    char，byte，short进行移位操作时先会转成 int 类型，即32位。得到的结果也为 int 型。

### 三、截尾和舍入

将float或double转型为整数值时，总是对数字进行截尾，不会进行四舍五入。如果想要得到舍入的结果可以使用 Math.round()

```java
        public static void main(String[] args) {
            double d = 1.7d;
            int i = (int)d;
            System.out.println(i);            
            System.out.println(Math.round(d));
        }
    	//1
    	//2
```





## 第四章：控制执行流程

标签...

但是我觉着也不要搞标签这种骚操作。。。。



## 第五章：初始化与清理

1.this() 调用构造器，但不能调用两个构造器，且 this() 语句必须放在最前面

```
    test(char x){
        this();
        // this(1); //error!
    }
```

2.static 就是没有 this 

3.所有的变量都会在任何方法（包括构造器）被调用之前得到初始化。

4.[执行顺序](https://www.cnblogs.com/timetellu/p/11619158.html)大致分类：

- 1.静态属性，静态方法声明，静态块。
- 2.动态属性，普通方法声明，构造块。
- 3.构造方法。

```
enum A{
    HAPPY, PPY, AHA,
}

class B {
    static {
        System.out.println("B_static");
    }
    public B() {
        System.out.println("BBB");
    }
}
public class test {
    static {
        System.out.println("main_static");
        System.out.println(A.AHA);
        new B();
    }
    public static void main(String[] args) {
        System.out.println("main start");
    }
}
```

输出为

```
main_static
AHA
B_static
BBB
main start
```

[一道阿里笔试题的解析](https://blog.csdn.net/hyl713/article/details/11925071)

值得注意的是 **main是否第一句先执行** 

　　Java程序运行时，第一件事情就是试图访问main方法，因为main相等于程序的入口，如果没有main方法，程序将无法启动，main方法更是占一个独立的线程，找到main方法后，是不是就会执行mian方法块里的第一句话呢？

　　答：不是

​		因为main方法虽然是一个特殊的静态方法，但是**还是静态方法**，此时**JVM会加载main方法所在的类，试图找到类中其他静态部分**，即首先会找main方法所在的类。

比如

```java
public class test {
    static {
        System.out.println("静态块");
    }
    public test(String str) {
        System.out.println(str);
    }

    public static void main(String args[]) {
        test t = new test("init");
    }
}
```

输出为

```
静态块
init
```

