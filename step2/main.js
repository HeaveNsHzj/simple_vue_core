
import { Observer } from './observer'
import { Dep } from './dep'

var dep = new Dep();
var sub1 = {
  update: function () {
    console.log('update sub1...')
  }
}
var sub2 = {
  update: function() {
    console.log('update sub2...')
  }
}

dep.addSub(sub1);
dep.addSub(sub2);

dep.notify();

dep.removeSub(sub1);
dep.notify();
