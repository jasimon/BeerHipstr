var express = require('express');
var https = require('https');
var fs = require('fs');
var app = express();

const DATA_FILEPATH = 'data/used_beers.txt';

var options = {
  hostname: 'lcboapi.com',
  path: '/products?store_id=511&q=beer&where_not=is_dead,is_discontinued',
  method: 'GET',
  headers:  {
    Authorization: 'Token MDo5MDRjMTU0NC05MjU1LTExZTUtYjBkOS1kMzc3MTBkZTdhZDA6bDJMV0d0QTI5N0R1SWl3bGVMSmZwUE05cTFZdGxaUWZTU2FH',
  },
};

var beers = []; 
var used_ids = [];

fs.readFile(DATA_FILEPATH, 'utf-8', function(err, data) {
  if(err) {
    return console.log(err);
  }
  console.log(data);
  used_ids = data.split('\n').map(function(item) {
    return parseInt(item);
  });
  console.log(used_ids);
});

var req = https.get(options, function(response) {
  var output = '';
  response.on('data', function(chunk) {
    output += chunk;
  });

  response.on('end', function(chunk) {
    var data = JSON.parse(output);
    beers = data.result.filter(function(item) {
      console.log(used_ids.indexOf(item.id))
      return used_ids.indexOf(item.id) < 0;
    });

    console.log(beers[0]);
    used_ids.push(beers[0].id);
    fs.writeFile(DATA_FILEPATH, used_ids.join('\n'), function(err) {
      if (err) {
        return console.log(err);
      }
      console.log('written');
    })
  });


}).on('error', function(e){
  console.log(e);
});

