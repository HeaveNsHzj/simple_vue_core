
## Vue 2.0数据更新机制

### 内容

本文试图从代码实现层面上讲`vm.msg = "Vue"`到dom更新这个过程发生了什么事。

### Vue整体流程
盗用VUE官网的图:
![image](http://cn.vuejs.org/images/data.png)

上图可以看出来Data的getter/setter是整个流程的起点, 那这里的getter/setter指的是什么呢?

### Object.defineProperty(obj, key, descriptor)
具体定义参见[MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/defineProperty)

```js
var obj = {};
var b = {};
var c = 1;
Object.defineProperty(obj, 'a', {
  configurable: true,
  enumerable: true,
  get: function() {
    console.log('get a');
    return b;
  },
  set: function(newVal){
      console.log('set a')
      b = newVal
  }
});

Object.defineProperty(b, 'b', {
  configurable: true,
  enumerable: true,
  get: function() {
    console.log('get b');
    return c;
  },
  set: function(newVal) {
      console.log('set b')
      c = newVal;
  }
});

obj.a.b;// 'get a'  'get b'
obj.a.b = 2; // 'get a' 'set b'
```

### Observer

运用上面Object.defineProperty的getter/setter的，我们就能在`vm.msg = "Vue";`这句代码执行的时候得到通知。利用这个特性，我们可以实现一个监听器Observer, 用来监听一个对象上所有属性的赋值操作，不考虑数组，代码如下：

```js
export class Observer {
  constructor(value) {
    this.value = value
    // 标记value已被Observer监控
    Object.defineProperty(value, '__ob__', {
      value: this,
      enumerable: false,
      configurable: true,
      writable: true
    })
    this.walk(value)
  }

  walk (obj) {
    const keys = Object.keys(obj)
    for (let i = 0; i < keys.length; i++) {
      defineReactive(obj, keys[i], obj[keys[i]])
    }
  }
}

export function defineReactive(obj, key, value) {

  Object.defineProperty(obj, key, {
    configurable: true,
    enumerable: true,
    get: () => {
      return value
    },
    set: (newValue) => {
      if (newValue === value) {
        return
      }
      value = newValue
      //todo 数据变化通知
    }
  })
}
```

上面的代码我们通过调用`new Observer(obj)`就能实现对obj现有key上赋值时，能感知数据变化。
但是还有一个问题，只能监听obj上第一层数据的变化，我们修改一下defineReactive让它也能够监听嵌套对象。

```js

export function defineReactive(obj, key, value) {
  let childOb = observe(value)
  Object.defineProperty(obj, key, {
    configurable: true,
    enumerable: true,
    get: () => {
      return value
    },
    set: (newValue) => {
      if (newValue !== value) {
        //todo 数据变化通知
        console.log(`value change from ${value} to ${newValue}`)
      }
      value = newValue
      // 新的值可能是一个对象, 我们需要
      childOb = observe(newValue)
    }
  })
}
export function observe(obj) {
  if (!obj || typeof obj != 'object') {
    return
  }
  if (obj.hasOwnProperty('__ob__') && obj.__ob__ instanceof Observer) {
    return obj.__ob__
  }
  return new Observer(obj)
}

```

测试：<a href="step.html?step=1" target="_blank">step1</a>

### pub/sub

上一节Observer中，我们已经可以监听到对象的属性变化，接下来我们要做的就是把这个数据变化通知给其他模块。pub/sub似乎是一个比较好的选择。先来看一下Pub实现：

```js
export class Dep {
  constuctor() {
    this.subs = []
  }

  addSub(sub) {
    this.subs.push(sub)
  }

  removeSub(sub) {
    let index = this.subs.findIndex(s => s === sub);
    if (index > -1) {
      this.subs.splice(index, 1)
    }
  }

  notify() {
    this.subs.forEach((sub) => sub.update())
  }
}
```
我们修改下defineReactive, 加上pub代码

```js
export function defineReactive(obj, key, value) {
  let childOb = observe(value)
  let dep = new Dep()

  Object.defineProperty(obj, key, {
    configurable: true,
    enumerable: true,
    get: () => {
      return value
    },
    set: (newValue) => {
      if (newValue === value) return

      value = newValue
      // 新的值可能是一个对象, 我们需要对新对象进行监控
      childOb = observe(newValue)

      dep.notify()
    }
  })
}
```
测试: <a href="step.html?step=2">step2</a>
接下来，考虑sub的实现。考虑下面几种Vue用法：

`<p>{{ msg }}</p>`, 
 `vm.$watch('msg', function(newVal, oldVal){ })`, 
 `new Vue(data: { width: 10, height: 10},
 computed: { area: function() { return this.x * this.y })}`
 
 共同的一个特点就是监听vm上的属性变化时，回调一些方法。参与的角色有：vue实例对象vm，expressionOrFn代表vm上的数据，回调callback。我们需要一个类把三者结合起来，在sub接受到update通知时执行callback, vue中使用的是Watcher类。

### Watcher
简单版Watcher只需要实现几个功能：获取expressionOrFn中返回数据的get函数，一个响应数据变化的update方法，一个value值来保存当前值，用于比较update前后数据是否产生变化。

```js
 export class Watcher {
  constructor(vm, expOrFn, cb) {
    this.vm = vm
    this.cb = cb
    if (typeof expOrFn == 'function') {
      this.getter = expOrFn
    } else {
      this.getter = parsePath(expOrFn)
    }
    this.value = this.get()
  }

  get() {
    return  this.getter.call(this.vm, this.vm)
  }

  update() {
    this.run()
  }

  run() {
    const oldValue = this.value
    const value = this.get()
    this.value = value
    if (oldValue !== this.value) {
      this.cb.call(this.vm, value, oldValue)
    }
  }
}

/**
 * Parse simple path.
 */
const bailRE = /[^\w.$]/
export function parsePath (path: string): any {
  if (bailRE.test(path)) {
    return
  } else {
    const segments = path.split('.')
    return function (obj) {
      for (let i = 0; i < segments.length; i++) {
        if (!obj) return
        obj = obj[segments[i]]
      }
      return obj
    }
  }
}
```
上面代码把expOrFn统一成getter函数，执行时这个函数this和参数都指向vm, 因为我们的数据都是从vm获取的。 parsePath只是把"a.b.c" -> ['a', 'b', 'c'], 对应vm的数据就是vm['a']['b']['c']。

我们来看看watcher测试:

```js
import { Watcher } from './watcher.js'
import { Dep } from './dep.js'

let data = {
  name: 'Luna',
  phone: '18910008888',
  address: {
    province: '北京',
    city: '北京',
    street: ''
  }
}

let watcher1 = new Watcher(data, 'name', function(name, oldName) {
  console.log(`Name changed from "${oldName}" to "${name}"`)
});

let watcher2 = new Watcher(data, 'address.city', function(city, oldCity) {
  console.log(`City changed from "${oldCity}" to "${city}"`)
});

let watcher3 = new Watcher(data, function() {
  return `My name is ${this.name}, come from ${this.address.city}`
}, function(greeting, oldGreeting) {
  console.log(`Greeting changed from "${oldGreeting}" to "${greeting}"`)
});

let dep = new Dep();
dep.addSub(watcher1);
dep.addSub(watcher2);
dep.addSub(watcher3);

dep.notify(); //不变触发callback 因为名字没变

data.name = 'Lina';
dep.notify(); //watcher1 watcher3 callback

data.address.city = "上海";
dep.notify(); // watcher2 watcher3 callback
```
测试: <a href="step.html?step=3">step3</a>
可以从上面的代码看出来，watcher1只依赖于name的变化， watcher2只依赖address.city变化, watcher3依赖name和address.city的变化，所以上面的dep添加三个watcher, 总会有没有变化的watcher update，造成浪费，得想一个机制来让watcher在他关心的数据变化才调update。

我们在watcher计算expOrFn的值时，对依赖的vm数据必然会触发getter方法，比如上面的watcher1,
expOrFn在watcher中处理后，就变成了`function expGetter(vm) { const segments = ['name']; let ret = vm[segments[0]]; return ret]}`, 这个expGetter在执行时会触发vm.name descriptor的get方法。这里大家认真思考一下，考虑expOrFn，只要在执行时依赖的数据必然需要读取，需要读取就会触发getter, vue就巧妙的利用这一点，在get中执行dep.addSub(watcher)。

### 依赖收集
根据上面的结论我们改写一下defineReactive代码，为了知道当前是哪个Watcher触发的getter操作，还需要一变量来保存当前的watcher, vue选择在Dep上加一个静态变量target来标记当前的watcher
代码如下: 

```js
export function defineReactive(obj, key, value) {
  let childOb = observe(value)
  let dep = new Dep()

  Object.defineProperty(obj, key, {
    configurable: true,
    enumerable: true,
    get: () => {
      /*---------------*/  
      if (Dep.target) {
        dep.addSub(Dep.target)
      }
      return value
    },
    set: (newValue) => {
      if (newValue === value) return
      value = newValue
      // 新的值可能是一个对象, 我们需要对新对象进行监控
      childOb = observe(newValue)
      
      dep.notify()
    }
  })
}
export class Watcher {
  // 略去重复代码...
  get() {
     Dep.target = this
     const value = this.getter.call(this.vm, this.vm)
     Dep.target = null
     return value
  }
}
Dep.target = null
```
这里边还有一个问题，watcher expOrFn里也可能会创建watcher，这样就存在watcher嵌套，vue引入targetStack来解决这个问题。
上面的代码Watcher改一下:

```js
export class Watcher {
  // 略去重复代码...
  get() {
     pushTarget(this)
     const value = this.getter.call(this.vm, this.vm)
     popTarget()
     return value
  }
}
Dep.target = null;
const targetStack = []

function pushTarget(target) {
  if (Dep.target) targetStack.push(Dep.target)
  Dep.target = target
}

function popTarget() {
  Dep.target = targetStack.pop()
}

```
到这里我们已经基本上把从data ---> pub/sub ----> watcher 都串连起来了，我们写个例子整体回顾一下：

```js
// 复用上一步的代码，只不过这次我们加上Observer，不用自己定义dep
import { Observer } from './Observer'
import { Watcher } from './watcher.js'

let data = {
  name: 'Luna',
  phone: '18910008888',
  address: {
    province: '北京',
    city: '北京',
    street: ''
  }
}

let ob = new Observer(data);

let watcher1 = new Watcher(data, 'name', function(name, oldName) {
  console.log(`Name changed from "${oldName}" to "${name}"`)
});

let watcher2 = new Watcher(data, 'address.city', function(city, oldCity) {
  console.log(`City changed from "${oldCity}" to "${city}"`)
});

let watcher3 = new Watcher(data, function() {
  return `My name is ${this.name}, come from ${this.address.city}`
}, function(greeting, oldGreeting) {
  console.log(`Greeting changed from "${oldGreeting}" to "${greeting}"`)
});


data.name = 'Lina';

data.address.city = "上海";
```
测试: <a href="step.html?step=4">step4</a>

### 回顾
![image](http://cn.vuejs.org/images/data.png)
前面我们已经讲过了上图的右半部分，从Observer利用Data的getter收集watcher依赖，在setter中通知watcher，watcher会执行update方法。
回到右边部分，vue在生成实例时，会new一个Watcher, expOrFn参数中执行更新ui，执行render方法。

### virtual dom

现在github搜virtual dom会出现好多virtual dom的实现，vue选择的也是一个叫snabbdom的virtual dom库。关于virtual dom的介绍这里就不多做介绍了，virtual dom利用JS模拟dom树，在内存中比较模拟dom的差异，最后把差异应用到真正的DOM树上。

继续上面的我们写好的代码，我们也利用snabbdom实现一个类似Vue的类，把我们的数据更新到dom中。

首先我们引入snabbdom `npm install --save snabbdom`,

```js
// @file v-dom.js 方便引用snabbdom的createElement patch方法
import { init } from 'snabbdom'
import classes from 'snabbdom/modules/class'
import style from 'snabbdom/modules/style'
import prop from 'snabbdom/modules/props'
import events from 'snabbdom/modules/eventlisteners'
import h from 'snabbdom/h'

export const createElement = h 
export const patch = init([classes, style, prop, events])//比较dom差异，并应用到真实dom中

```

### 简化版Vue类

只考虑最简单的vue参数配置，一个el表示vue要挂载的dom结点，data表示数据。Vue中这么调用:

```js
new Vue({
   el: "#demo",
   data: {
     name: 'Luna',
     phone: '18910008888',
     address: {
       province: '北京',
       city: '北京',
       street: ''
     }
  }
})
```

再看看Vue类至少应该包含哪些方法：首先data要被observer，并挂载到this上（因为我们访问name都是this.name）`_initData`,然后要有一个watcher来监听数据变化时更新ui `_watcher`，ui渲染 `_render` 方法，数据更新回调`_update`方法,

``` js
import { createElement, patch } from './v-dom.js'

export class Vue {
  constructor(options) {
    this.$options = options
    this.$el = document.querySelector(options.el)
    this._vnode = null //保存上一次渲染出来的虚拟dom结点
    this._init()
  }
  _init() {
    this._initData()

    this._watcher = new Watcher(this, ()=> {
      this._update(this._render())
    })
  }
  // observer(data), 并挂载到this上
  _initData() {
    let options = this.$options
    let data = options.data || {}
    if (typeof data == 'function') {
      data = data.call(this)
    }
    this._data = data;
    let keys = Object.keys(data);
    keys.forEach((key) => {
      Object.defineProperty(vm, key, {
        configurable: true,
        enumerable: true,
        get: () => data[key],
        set: (val) => {
          data[key] = val
        }
      });
    })
    observe(data)
  }
  
  /* 执行render,生成虚拟dom结点 */
  _render() {
    return this.$options.render.call(this, createElement)
  }
  /* 执行dom diff 更新 */
  _update(vnode) {
    const prevNode = this._vnode
    this._vnode = vnode
    if (!prevNode) {
      this.$el = patch(this.$el, vnode)
    } else {
      this.$el = patch(prevNode, vnode)
    }
  }
}

```
上面的代码我们并没有处理html模板的问题。

vue自己实现了一个compile的接口，把模板如:

&lt;div id="app">{{ msg }}&lt;/div>

转化成virtual dom识别的render函数, 这里边大多是字符串处理，正则表达式，语法解析等，为了简单我们直接用Vue.compile转化出来的结果作为render函数：

```js
Vue.compile('<div id="demo"><p>Name: {{ name }}</p><p>address: {{ address }}</p></div>')
```
得到：

```js
res = {
  render: function() {
   with(this){return _h('div',{attrs:{"id":"demo"}},
   [
     _h('p',["Name: "+_s(name)]),
     _h('p',["address: "+_s(address)
   ])])}
},
staticRenderFns: []
}
```
staticRenderFns是Vue针对模板渲染的优化，把完全静态的dom节点标记出来，优化dom diff的性能,
这里先忽略。生成的render方法依赖两个方法` _h`和`_s`, _h是创建dom结点, _s是把变量转成字符串。

Vue中还有`_n`-->转成数字, `_e`-->返回空结点，`_q`判断相等, `_i`数组处理, `_m` `_o`处理静态结点。

在Vue的prototype加上_h和_s:

```js
Vue.prototype._h = createElement /* snabbdom/h */
Vue.prototype._s = function toString(val) {
  return val == null
    ? ''
    : typeof val === 'object'
           ? JSON.stringify(val, null, 2)
           : String(val)
}

```
运行一下看看效果: <a href="step.html?step=5">step5</a>


### 其他
本文只为了讲清楚整个流程，observer模块并没有涉及数组的监听，实际上vue为了方便处理数组，把能够改变当前数据的方法：'push','pop','shift','unshift','splice','sort','reverse'都重写了。

还有就是模板处理细节、Vue.prototype.$set、Watcher的高级用法(lazy, deep等)。

最后上面的实现中Watcher的update方法是同步执行的，Vue是把Watcher更新添加到一个的队列中，异步执行watcher的run方法。

