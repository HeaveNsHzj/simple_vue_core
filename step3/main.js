
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
dep.notify(); //name changed...

data.address.city = "上海";
dep.notify();
