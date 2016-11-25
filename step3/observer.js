
import { Dep } from './dep.js';

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

export function observe(obj) {
  if (!obj || typeof obj != 'object') {
    return
  }
  if (obj.hasOwnProperty('__ob__') && obj.__ob__ instanceof Observer) {
    return obj.__ob__
  }
  return new Observer(obj)
}