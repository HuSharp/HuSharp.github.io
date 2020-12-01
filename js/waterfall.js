/* jshint asi:true */
//先等图片都加载完成
//再执行布局函数

/**
 * 执行主函数
 * @param  {[type]} function( [description]
 * @return {[type]}           [description]
 */
(function() {

  /**
     * 内容JSON
     */
  var demoContent = [
   {
      demo_link: 'https://github.com/HuSharp/HuSharp_Os',
      img_link: '',
      code_link: 'https://github.com/HuSharp/HuSharp_Os',
      title: '小型类 Linux OS',
      core_tech: 'C & 汇编',
      description: '跟着《操作系统真象还原》在bochs上实现一个简单的操作系统，\n主要内容有：编写 MBR 主引导记录、保护模式实现、中断、内存管理系统、线程、输入输出系统、用户进程、编写硬盘驱动程序、文件系统、系统交互等核心技术。'
    }, {
      demo_link: 'https://github.com/HuSharp/Unix-Linux_Programming',
      img_link: 'http://ww2.sinaimg.cn/large/7011d6cfjw1f3ba04okoqj20eq093wh1.jpg',
      code_link: 'https://github.com/HuSharp/Unix-Linux_Programming',
      title: 'Unix-Linux_Programming',
      core_tech: 'C',
      description: 'code implement by reading understanding-unix-programming'
    }, {
      demo_link: 'http://gaohaoyang.github.io/ife/task/task0002/work/Gaohaoyang/task0002_2.html',
      img_link: 'http://ww4.sinaimg.cn/large/7011d6cfjw1f3b9w6xpz5j20ae02pgm3.jpg',
      code_link: 'https://github.com/Gaohaoyang/ife/tree/master/task/task0002/work/Gaohaoyang',
      title: 'MIPS 5 段流水线CPU虚拟平台搭建',
      core_tech: '数电、计组',
      description: 'MIPS 5 段流水线CPU虚拟平台搭建.基于JAVA平台的Logisim虚拟仿真软件开展相关实验。\n完成单周期、多周期CPU的搭建\n构建能处理各类冲突的MIPS 5 段流水线CPU，包括中断异常和分支预测'
    }, {
      demo_link: 'http://gaohaoyang.github.io/ife/task/task0002/work/Gaohaoyang/task0002_1.html',
      img_link: 'http://ww3.sinaimg.cn/large/7011d6cfjw1f3b9tmyuh2j20au0aaaar.jpg',
      code_link: 'https://github.com/Gaohaoyang/ife/tree/master/task/task0002/work/Gaohaoyang',
      title: '清华uCoreOS lab实现与资料收集',
      core_tech: 'C/C++，汇编',
      description: '掌握OS基本概念：看在线课程，能理解OS原理与概念；看在线实验指导书并分析源码，能理解labcodes_answer的labs运行结果\n掌握OS设计实现：在1的基础上，能够通过编程完成labcodes的8个lab实验中的基本练习和实验报告\n掌握OS核心功能：在2的基础上，能够通过编程完成labcodes的8个lab实验中的challenge练习\n掌握OS科学研究：在3的基础上，能够通过阅读论文、设计、编程、实验评价等过程来完成课程设计（大实验）\n'
    }

  ];

  contentInit(demoContent) //内容初始化
  waitImgsLoad() //等待图片加载，并执行布局初始化
}());

/**
 * 内容初始化
 * @return {[type]} [description]
 */
function contentInit(content) {
  // var htmlArr = [];
  // for (var i = 0; i < content.length; i++) {
  //     htmlArr.push('<div class="grid-item">')
  //     htmlArr.push('<a class="a-img" href="'+content[i].demo_link+'">')
  //     htmlArr.push('<img src="'+content[i].img_link+'">')
  //     htmlArr.push('</a>')
  //     htmlArr.push('<h3 class="demo-title">')
  //     htmlArr.push('<a href="'+content[i].demo_link+'">'+content[i].title+'</a>')
  //     htmlArr.push('</h3>')
  //     htmlArr.push('<p>主要技术：'+content[i].core_tech+'</p>')
  //     htmlArr.push('<p>'+content[i].description)
  //     htmlArr.push('<a href="'+content[i].code_link+'">源代码 <i class="fa fa-code" aria-hidden="true"></i></a>')
  //     htmlArr.push('</p>')
  //     htmlArr.push('</div>')
  // }
  // var htmlStr = htmlArr.join('')
  var htmlStr = ''
  for (var i = 0; i < content.length; i++) {
    htmlStr += '<div class="grid-item">' + '   <a class="a-img" href="' + content[i].demo_link + '">' + '       <img src="' + content[i].img_link + '">' + '   </a>' + '   <h3 class="demo-title">' + '       <a href="' + content[i].demo_link + '">' + content[i].title + '</a>' + '   </h3>' + '   <p>主要技术：' + content[i].core_tech + '</p>' + '   <p>' + content[i].description + '       <a href="' + content[i].code_link + '">源代码 <i class="fa fa-code" aria-hidden="true"></i></a>' + '   </p>' + '</div>'
  }
  var grid = document.querySelector('.grid')
  grid.insertAdjacentHTML('afterbegin', htmlStr)
}

/**
 * 等待图片加载
 * @return {[type]} [description]
 */
function waitImgsLoad() {
  var imgs = document.querySelectorAll('.grid img')
  var totalImgs = imgs.length
  var count = 0
  //console.log(imgs)
  for (var i = 0; i < totalImgs; i++) {
    if (imgs[i].complete) {
      //console.log('complete');
      count++
    } else {
      imgs[i].onload = function() {
        // alert('onload')
        count++
        //console.log('onload' + count)
        if (count == totalImgs) {
          //console.log('onload---bbbbbbbb')
          initGrid()
        }
      }
    }
  }
  if (count == totalImgs) {
    //console.log('---bbbbbbbb')
    initGrid()
  }
}

/**
 * 初始化栅格布局
 * @return {[type]} [description]
 */
function initGrid() {
  var msnry = new Masonry('.grid', {
    // options
    itemSelector: '.grid-item',
    columnWidth: 250,
    isFitWidth: true,
    gutter: 20
  })
}
