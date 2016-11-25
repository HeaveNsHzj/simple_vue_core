
import { Observer } from './observer'
import { Watcher } from './watcher.js'
import { Vue as Vm } from './vm.js'
import Vue from 'vue'

let data = {
  name: 'Luna',
  phone: '18910008888',
  address: {
    province: '北京',
    city: '北京',
    street: ''
  }
}

var tpl = '<div id="demo">\
  <p>Name: {{ name }}</p>\
<p>address: {{ address }}</p>\
</div>';

var compiledTpl = Vue.compile(tpl);
var options = Object.assign({
  el: '#demo',
  data: data
}, compiledTpl)
window.vm = new Vm(options);
console.log(compiledTpl.render);
