
import { Observer } from './observer'

let uid = 0;
var obj = {
  a: 1,
  b: 2,
  c: {
    name: 'Luna',
    id: uid++
  }
};

const ob = new Observer(obj);

obj.a = 10;

obj.c.name = 'Lina';

// 新添加的对象将被监控
obj.b = {
  name: 'Akasha',
  id: uid++
};
obj.b.name = 'Mirana';
