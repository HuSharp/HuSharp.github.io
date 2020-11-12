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

4.[执行顺序(此blog讲的极其透彻)](https://www.cnblogs.com/timetellu/p/11619158.html)大致分类：

　   1、父类的静态变量和静态块赋值（按照声明顺序）
　　2、自身的静态变量和静态块赋值（按照声明顺序）
　　3、main 方法
　　3、父类的成员变量和块赋值（按照声明顺序）
　　4、父类构造器赋值
　　5、自身成员变量和块赋值（按照声明顺序）
　　6、自身构造器赋值
　　7、静态方法，实例方法只有在调用的时候才会去执行

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

​		因为main方法虽然是一个特殊的静态方法，但是**还是静态方法**，此时**JVM会加载main方法所在的类，试图找到类中其他静态部分**，即首先会找main方法所在的类中上面的静态方法、静态块。

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





## 第六章：访问权限控制

### 6.1、Java解释器的运行过程：

- 首先，找出环境变量CLASSPATH，用作查找.class文件的根目录。
- 然后，从根目录开始，解释器获取包的名称并将句点替换成反斜杠（于是，package net.mrliuli.training 就变为 net\mrliuli\training 或 net/mrluli/training 或其他，这一切取决于操作系统）以从CLASSPATH根中获取一个相对路径。
- 将CLASSPATH根目录与上面获取的相对路径相连接得到一个绝对路径，用来查找.class文件。

> Sun 将Java2中的JDK改造得更聪明了一些。在安装后你会发现，即使你未设立CLASSPATH，你也可以编译并运行基本的Java程序。

### 6.2、类的访问权限的一些限制

- 同一个.java文件，**只能有一个与文件同名的public类，可以有其它非public类**；
- 同一个package内的不同文件中的类，可以互相访问。
- 不同 package 中的类，如需访问，需要使用全限定名，如 biz.superalloy.MyClass 或通过 import 把 biz.superalloy 包引进来；

> Java中private、protected、public和default的区别

1. public：

   具有最大的访问权限，可以访问任何一个在 classpath 下的类、接口、异常等。它往往用于对外的情况，也就是对象或类对外的一种接口的形式。

2. protected：

   主要的作用就是用来保护子类的。它的含义在于**子类可以用它修饰的成员**，其他的不可以，它相当于传递给子类的一种**继承**的东西。

3. default：

   有时候也称为 friendly，它是针对**本包访问**而设计的，任何处于本包下的类、接口、异常等，都可以相互访问，即使是父类没有用 protected 修饰的成员也可以。

4. private：

   访问权限仅限于**类的内部**，是一种封装的体现，例如，大多数成员变量都是修饰符为private的，它们不希望被其他任何外部的类访问。

![image-20201108213636651](/assets/blog_image/2020-07-24-Thinking-In-Java-Read/image-20201108213636651.png)



## 第七章：复用类

### 7.1、构造函数调用顺序

`p130`
 构造函数总是从基类开始。

```java
class Insert{
	Insert(){
		System.out.println("Insert");
	}	
}

public class Beetle extends Insert{	
	Beetle(){
		System.out.println("Beetle");
	}

	public static void main(String[] args) {		
		Beetle b = new Beetle();
	}
}
//Insert
//Beetle
```

值得注意的是，若是基类为带参数的构造器，那么必须要 super 和 参数列表 来显式调用：

```java
class BoardGame {
  BoardGame(int i) {
    System.out.println("BoardGame constructor");
  }
}

public class Chess extends BoardGame {
  Chess() {
    super(11);//!!!!
    System.out.println("Chess constructor");
  }
  public static void main(String[] args) {
    Chess x = new Chess();
  }
}
//BoardGame constructor
//Chess constructor
```

如果没有在 **BoardGame** 构造函数中调用基类构造函数，编译器就会报错找不到 `Game()` 的构造函数。此外，对基类构造函数的调用必须是派生类构造函数中的第一个操作。(如果你写错了，编译器会提醒你。)

### 7.2、继承、组合和代理

讲的 8 错的 [Blog](https://qingmiaogu.blog.csdn.net/article/details/84846290?utm_medium=distribute.pc_relevant.none-task-blog-BlogCommendFromMachineLearnPai2-3.compare&depth_1-utm_source=distribute.pc_relevant.none-task-blog-BlogCommendFromMachineLearnPai2-3.compare)

​	组合和继承都允许在新类中放置子对象（组合是显式的，而继承是隐式的）。

​	当你想在新类中包含一个已有类的功能时，使用组合，而非继承。也就是说，在新类中嵌入一个对象（通常是私有的），以实现其功能。新类的使用者看到的是你所定义的新类的接口，而非嵌入对象的接口。

​	有时让类的用户直接访问到新类中的组合成分是有意义的。只需将成员对象声明为 **public** 即可（可以把这当作“半委托”的一种）。成员对象隐藏了具体实现，所以这是安全的。当用户知道你正在组装一组部件时，会使得接口更加容易理解。

使用继承时，使用一个现有类并开发出它的新版本。通常这意味着使用一个通用类，并为了某个特殊需求将其特殊化。

稍微思考下，你就会发现，用一个交通工具对象来组成一部车是毫无意义的——车不包含交通工具，它就是一个交通工具。可以说车有轮胎、玻璃、门等，这就是组合关系。**这种 “is-a（是一个）” 的关系是用继承来表达的，而 “has-a （有一个）“的关系则用组合来表达。**

尽量少用 继承， 用之前问问自己， 是否必须使用向上转型，若必须，那么继承是必要的，否则，好好考虑一下。

### 7.3、多个重载方法都会被继承

```java
class Homer {
  char doh(char c) {
    System.out.println("doh(char)");
    return 'd';
  }
  float doh(float f) {
    System.out.println("doh(float)");
    return 1.0f;
  }
}
class Bart extends Homer {
  void doh(int m) {
    System.out.println("doh(Milhouse)");
  }
}

public class Hide {
  public static void main(String[] args) {
    Bart b = new Bart();
    b.doh(1);
    b.doh('x');
    b.doh(1.0f);
  }
}
```



### 7.4、final

基本类型变量应用final关键字时，将向编译器告之此变量是恒定不变的，即它是**编译期常量**。这样编译器可在编译时执行计算式，从而减轻了运行时负担（**提高效率**）。编译期常量**在定义（声明）时必须对其赋值**（声明时也可以不赋（此时叫**空白final**），但必须在构造器中赋值，所以**final域在使用前总是被初始化**。）。final常量常与`static`一起使用，**强调只有一份**。

**1.引用不变，对象中的域可变**

final int id = 1; // 基本类型，不可改变
 final Object obj = new Object(); // 则引用不可改变，但 obj里面的属性可以改变！ 							

```
final StringBuilder sb=new StringBuilder("a");

//下面这行代码会报错
sb=new StringBuilder("b");

//而这行代码是可以运行的
sb.append("b");
```

由此可以说明，被final修饰之后，是引用变量的值不可变，而这个引用所指向的对象是可以改变的。

可以自己写个类，只读的，不让别人改，那不就是彻底的final了吗

2.带有恒定初始值的 **final** **static** 基本变量（即编译时常量）命名全部使用大写，单词之间用下划线分隔

> public static final int VALUE_THREE = 39;

**VALUE_THREE** 是一种更加典型的常量定义的方式：**public** 意味着可以在包外访问，**static** 强调只有一个，**final** 说明是一个常量。

3.`final`方法： 

- **锁定方法**，以防任何继承类修改它的含义。这是出于设计的考虑。

`final`和`private`关键字 

- **类中所有的`private`方法都隐式地指定为是`final`的**。由于无法取用`private`方法，所以也就无法覆盖它。
- 派生类中试图“覆盖”父类中一个`private`方法（隐含是`final`的），似乎奏效，**编译器不会出错**，但实际上只是在派生类中生成了**一个新的方法**，此时并没有覆盖父类的`private`方法。

4.`final`类

  final类表明对该类的设计**永不需要变动**，或者出于安全的考虑，你**不希望它有子类**。因为final类禁止继承，所以**final类中所有的方法都隐式指定为是final的**，因为无法覆盖它们。在final类中可以给方法添加final修饰词，但这不会增添任何意义。







## 第八章：多 态

### 8.1、向上转型与后期绑定

**后期绑定**，就是在运行时根据对象的类型进行绑定**。**后期绑定也叫做**动态绑定或运行时绑定****。如果一种语言想实现后期绑定，就必须具有某种机制，以便在运行时能判断对象的类型，从而调用恰当的方法。也就是说，编译器一直不知道对象的类型，但是**方法调用机制能找到正确的方法体**，并加以调用。后期绑定机制随编程语言的不同而有所不同，但是只要想一下就会得知，不管怎样都**必须在对象中安置某种“类型信息”**。

代码中的修改不会破坏程序中其他不应受到影响的部分。换句话说，多态是一项“将改变的事物与不变的事物分离”的重要技术。

如下面 demo 可知，基类的 happy （未进行多态方法）仍然可以进行调用。

```java
class  b{
    public void draw() {
        System.out.println("A is drawing");
    }

    public void happy() {
        System.out.println("A is happying");
    }
}

public class Test_2 extends b{
    public void draw() {
        System.out.println("Test2 is drawing");
    }
    public static void main(String[] args) {
        b b = new Test_2();
        b.draw();
        b.happy();
    }
}
// Test2 is drawing
// A is happying
```



### 8.2、多态缺陷

`p156`
 **缺陷1：只有非private方法才可以被覆盖.**

```java
public class PrivateOverride {
    private void f() {
        System.out.println("private f()");
    }

    public static void main(String[] args) {
        PrivateOverride po = new Derived();
        po.f();
    }
}

class Derived extends PrivateOverride {
    public void f() {
        System.out.println("public f()");
    }
}

// private f()
```

为了清晰起见，派生类中的方法名采用与基类中 **private** 方法名不同的命名。

如果使用了 `@Override` 注解，就能检测出问题：

```java
public class PrivateOverride2 {
    private void f() {
        System.out.println("private f()");
    }

    public static void main(String[] args) {
        PrivateOverride2 po = new Derived2();
        po.f();
    }
}

class Derived2 extends PrivateOverride2 {
    @Override
    public void f() {
        System.out.println("public f()");
    }
}
// 报错：must override or implement a supertype method
```

 **缺陷2：如果一个方法是静态(static)的，它的行为就不具有多态性：**

```java
public class PrivateOverride2 {
    public static void f() {
        System.out.println("private f()");
    }

    public static void main(String[] args) {
        PrivateOverride2 po = new Derived2();
        po.f();
    }
}

class Derived2 extends PrivateOverride2 {
    public static void f() {
        System.out.println("public f()");
    }
}
// "private f()
```





### 8.3、构造器调用

![image-20201109195747856](/assets/blog_image/2020-07-24-Thinking-In-Java-Read/image-20201109195747856.png)

```java
// output
Meal()
Lunch()
Bread()
Cheese()
Sandwich()
```

从创建 **Sandwich** 对象的输出中可以看出对象的构造器调用顺序如下：

1. 基类构造器被调用。这个步骤被递归地重复，这样一来类层次的顶级父类会被最先构造，然后是它的派生类，以此类推，直到最底层的派生类。
2. 按声明顺序初始化成员。
3. 调用派生类构造器的方法体。

上面代码首先是调用 main 方法，进行 new Sandwich()， 然后对 Sandwich 类进行 init。

### 8.4、向下转型

```java
class Test_1{
    public void draw() {
        System.out.println("Test_1 is drawing");
    }
}

public class Test_2 extends b{
    public void draw() {
        System.out.println("Test_2 is drawing");
    }
    public void happy() {
        System.out.println("Test_2 is happying");
    }
    public static void main(String[] args) {
        Test_1 tests[] =  {
            new Test_1(),
            new Test_2(),
        };
        tests[0].draw();
        // 以下注释代码不能运行
        ((Test_2)tests[1]).happy();    // true!
        // ((Test_2)tests[0]).happy();// error!
    }
}
```

尝试向下转型：如果转型为正确的类型，就转型成功。否则，就会得到 ClassCastException 异常。





## 第九章：接口

### 9.1、 interface

接口可以包含域，且**隐式地是`static` 和 `final`**的，显然，接口中的域不能是**空final**，**这些域不是接口的一部分，它们存储在该 接口的静态存储区域内**。

关键字`interface`前可以添加`public`修饰符，不加默认是包访问权限，**接口的方法默认都是`public`的**。

```java
public interface Test {
    void a(int a);
}
class  b implements Test{
    @Override
    public void a(int a) {
    }
}
```

### 抽象类和接口

尤其是在 Java 8 引入 **default** 方法之后，选择用抽象类还是用接口变得更加令人困惑。下表做了明确的区分：

| 特性                 | 接口                                                       | 抽象类                                   |
| -------------------- | ---------------------------------------------------------- | ---------------------------------------- |
| 组合                 | 新类可以组合多个接口                                       | 只能继承单一抽象类                       |
| 状态                 | 不能包含属性（除了静态属性，不支持对象状态）               | 可以包含属性，非抽象方法可能引用这些属性 |
| 默认方法 和 抽象方法 | 不需要在子类中实现默认方法。默认方法可以引用其他接口的方法 | 必须在子类中实现抽象方法                 |
| 构造器               | 没有构造器                                                 | 可以有构造器                             |
| 可见性               | 隐式 **public**                                            | 可以是 **protected** 或友元              |

抽象类仍然是一个类，在创建新类时只能继承它一个。而创建类的过程中可以实现多个接口。

有一条实际经验：尽可能地抽象。因此，更倾向使用接口而不是抽象类。只有当必要时才使用抽象类。除非必须使用，否则不要用接口和抽象类。大多数时候，普通类已经做得很好，如果不行的话，再移动到接口或抽象类中。



### 9.2、多继承

```java
class  b extends Test_5 implements Test_3, Test_4{
    @Override
    public void a(int a) {}
}
interface Test_3 {
    void a(int a);
}
interface Test_4 {
    void b(int a);
}
class Test_5 {
    public void b(int a) {
        System.out.println();
    }   
}

public class Test_2 extends b{
    public static void main(String[] args) {
        b bb = new B();
        bb.b(10);
    }
}
```

1、需要将具体类 extends 放在前面，后面跟着接口 interface

2、实现多重继承时要注意不能实现签名或返回类型不同的接口方法，尽量避免这种同名情况。

如上 demo， Test_5 和 Test_4 中有同名的 b 函数，当 b 类不实现该函数时，会自动得到 继承基类 Test_5 的函数。

 

### 9.3、通过继承扩展接口

```java
interface M{
    void menace();
    void kill();
}

interface Danger{
    void menace(int s);
    void kill();
}

interface Vampire extends Danger,M{

}
```

Vampire 中使用的语法仅适用于接口继承。通常来说，**extends** 只能用于单一类，但是在构建接口时可以引用多个基类接口。注意到，接口名之间用逗号分隔。



### 9.4、几个模式   ---------不懂-----------

**策略模式**

` p182 `

去商店去买东西，可以选择不同的出行方式但都能达到买东西的目的，这种选择模式就是策略模式。
把出行方式抽象为一个接口，实现公交车，自行车，走路，出租车等实例，最后自己决定使用哪种方式。

策略模式：定义一系列的算法,把每一个算法封装起来,  并且使它们可相互替换。本模式使得算法可独立于使用它的客户而变化。也称为政策模式(Policy)。策略模式把对象本身和运算规则区分开来，其功能非常强大，因为这个设计模式本身的核心思想就是面向对象编程的多形性的思想。
环境类(Context):用一个ConcreteStrategy对象来配置。维护一个对Strategy对象的引用。可定义一个接口来让Strategy访问它的数据。
抽象策略类(Strategy):定义所有支持的算法的公共接口。 Context使用这个接口来调用某ConcreteStrategy定义的算法。
具体策略类(ConcreteStrategy):以Strategy接口实现某具体算法。


**适配器模式**

`p183`
 将一个类的接口转换成客户希望的另外一个接口。Adapter模式使得原本由于接口不兼容而不能一起工作的那些类可以在一起工作。
 在Android中常用到的各种Adapter就是用的适配器模式思想。

**工厂模式**

`p187`
 工厂模式主要用以下几种形态：

1. 简单工厂（Simple Factory）: 主要代码由一个Factory管理，每添加一个产品都需要在factory类中修改代码；
2. 工厂方法（Factory Method）:一种产品对应一个工厂，增加一种产品就同时增加一个工厂；
3. 抽象工厂（Abstract Factory）:通常用于多种产品且每种都有不同型号的情况下，针对型号建立工厂，每个工厂只生产该型号的产品。















































































