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
      title: '类Linux OS',
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
      core_tech: 'Java',
      description: 'MIPS 5 段流水线CPU虚拟平台搭建.基于JAVA平台的Logisim虚拟仿真软件开展相关实验。\n完成单周期、多周期CPU的搭建\n构建能处理各类冲突的MIPS 5 段流水线CPU，包括中断异常和分支预测'
    }, {
      demo_link: 'http://gaohaoyang.github.io/ife/task/task0002/work/Gaohaoyang/task0002_1.html',
      img_link: 'http://ww3.sinaimg.cn/large/7011d6cfjw1f3b9tmyuh2j20au0aaaar.jpg',
      code_link: 'https://github.com/Gaohaoyang/ife/tree/master/task/task0002/work/Gaohaoyang',
      title: '处理兴趣爱好列表',
      core_tech: 'JavaScript',
      description: '对JavaScript正则表达式和字符串的练习。'
    }, {
      demo_link: 'http://gaohaoyang.github.io/ife/task/task0002/work/Gaohaoyang/index.html',
      img_link: 'http://7q5cdt.com1.z0.glb.clouddn.com/demo-demo-index.png',
      code_link: 'https://github.com/Gaohaoyang/ife/tree/master/task/task0002/work/Gaohaoyang',
      title: '百度前端学院 task0002 展示主页',
      core_tech: 'HTML CSS',
      description: '任务二的展示主页，里面包含五个小 demo。还有一篇相关的<a href="http://gaohaoyang.github.io/2015/04/22/baidu-ife-2-javascript/" target="_blank">日志。</a>'
    }, {
      demo_link: 'http://gaohaoyang.github.io/ife/task/task0001/work/Gaohaoyang/index.html',
      img_link: 'http://7q5cdt.com1.z0.glb.clouddn.com/Demo-blog-ife.jpg',
      code_link: 'https://github.com/Gaohaoyang/ife/tree/master/task/task0001/work/Gaohaoyang',
      title: '百度前端学院 task0001 个人博客',
      core_tech: 'HTML CSS',
      description: '完成百度前端学院的任务。深刻的理解了BFC、浮动、inline-block间距，多列布局等技术。还有一篇相关的<a href="http://gaohaoyang.github.io/2015/04/15/baidu-ife-1/" target="_blank">日志。</a>'
    }, {
      demo_link: 'https://codepen.io/haoyang/pen/jrvrQq',
      img_link: 'https://ooo.0o0.ooo/2016/11/24/5836d81f48cd2.png',
      code_link: 'https://codepen.io/haoyang/pen/jrvrQq',
      title: 'Fisher-Yates 洗牌算法动画',
      core_tech: 'JavaScript',
      description: 'Fisher-Yates 洗牌算法动画。算法详情见 <a href ="https://gaohaoyang.github.io/2016/10/16/shuffle-algorithm/">这里</a>。'
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
