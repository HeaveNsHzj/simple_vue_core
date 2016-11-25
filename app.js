

var express = require('express');
var app = express();


app.get('/', function(req, res) {
  res.sendFile(__dirname + '/index.html');
});
app.get('/step.html', function(req, res) {
  res.sendFile(__dirname + '/step.html');
});
app.use('/css', express.static(__dirname + '/css'));
app.use('/lib', express.static(__dirname + '/lib'));
app.use('/dist', express.static(__dirname + '/dist'));
app.use('/md', express.static(__dirname + '/md'));
var count = 5;
for (var i = 0; i < count; i++) {
  var key = 'step' + (i + 1);
  app.use('/' + key, express.static(__dirname + '/' + key));
}
app.listen(3001);
console.log('http server now listen to 3001');