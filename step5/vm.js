
import { observe } from './observer'
import { createElement, patch } from './v-dom.js'
import { Watcher } from './watcher'

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
      Object.defineProperty(this, key, {
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

  /* 执行render,生成虚拟dom结点*/
  _render() {
    return this.$options.render.call(this, createElement)
  }
  /* 执行dom更新m*/
  _update(vnode) {
    const prevNode = this._vnode
    this._vnode = vnode
    if (!prevNode) {
      this.$el = patch(this.$el, vnode)
    } else {
      this.$el = patch(prevNode, vnode)
    }

    console.log(this.$el)
  }

}
Vue.prototype._h = createElement
Vue.prototype._s = function toString(val) {
  return val == null
    ? ''
    : typeof val === 'object'
           ? JSON.stringify(val, null, 2)
           : String(val)
}

