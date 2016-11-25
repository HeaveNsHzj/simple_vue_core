
import { Observer } from './observer'
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
  console.log(`watcher1: Name changed from "${oldName}" to "${name}"`)
});

let watcher2 = new Watcher(data, 'address.city', function(city, oldCity) {
  console.log(`watcher2: City changed from "${oldCity}" to "${city}"`)
});

let watcher3 = new Watcher(data, function() {
  return `My name is ${this.name}, come from ${this.address.city}`
}, function(greeting, oldGreeting) {
  console.log(`watcher3: Greeting changed from "${oldGreeting}" to "${greeting}"`)
});

let watcher4 = new Watcher(data, function() {
  return this.address
}, function(addr, oldAddr) {
  console.log(`watcher4: address changed from "${JSON.stringify(oldAddr)}"
   to "${JSON.stringify(addr)}"`)
})

data.name = 'Lina';

data.address.city = "上海";

window.data = data;
