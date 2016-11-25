/**
 * Created by huangzhongjian on 16/11/11.
 */


var fs = require('fs');

var content = fs.readFileSync('/Users/huangzhongjian/Downloads/数据/export_all.csv').toString();

var rows = content.split(/(?:\r|\n)+/g);
console.log(rows.length)
var after = rows.slice(1).map(function(row, index) {
    var arr = row.split(',');
    var id = arr.pop();
    arr.unshift(id);
    return arr.join(',')

});

fs.writeFileSync('/Users/huangzhongjian/Downloads/kec_api.csv', after.join('\r\n'));