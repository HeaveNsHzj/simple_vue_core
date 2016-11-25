
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
    return this.getter.call(this.vm, this.vm)
  }

  update() {
    this.run()
  }

  run() {
    const oldValue = this.value
    const value = this.get()
    this.value = value
    if (oldValue !== value) {
      this.cb.call(this.vm, value, oldValue)
    }
  }
}

/**
 * Parse simple path.
 */
const bailRE = /[^\w.$]/
export function parsePath (path) {
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
