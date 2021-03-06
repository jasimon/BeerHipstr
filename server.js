var express = require('express');
var lcboapi = require('./lcboapi.js');
var app = express();

app.use(express.static(__dirname+'/js'));
app.use(express.static(__dirname+'/css'));
app.use(express.static(__dirname+'/img'));

app.get('/', function(req, res) {
  res.sendFile(__dirname + "/index.html");
});

app.get('/beerme', function(req, res) {
  lcboapi.getBeer(function(beer, lastTen) {
    res.send({beer:beer, lastTen: lastTen});
  });
})

var server = app.listen(8080, function() {
  var host = server.address().address;
  var port = server.address().port;

  console.log('BeerHipstr web server listening at http://%s:%s', host, port);
});


