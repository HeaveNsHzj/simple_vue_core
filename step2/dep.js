
export class Dep {
  constructor () {
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
