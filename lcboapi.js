var https = require('https');
var fs = require('fs');
module.exports = (function() {
  const DATA_FILEPATH = 'data/used_beers.txt';
  const BEER_API_PATH = '/products?store_id=511&q=beer&where_not=is_dead,is_discontinued';
  
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
  var requestPage = 0;

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

  function getBeer(callback) {
    if (beers.length == 0) {
      requestPage++;
      options.path = BEER_API_PATH + '&page=' + requestPage;
      console.log(options.path);
      var req = https.get(options, function(response) {
        var output = '';
        response.on('data', function(chunk) {
          output += chunk;
        });

        response.on('end', function(chunk) {
          var data = JSON.parse(output);
          beers = data.result.filter(function(item) {
            return used_ids.indexOf(item.id) < 0;
          });
          if(beers.length > 0) {
            var selected = beers.pop();
            callback(selected);
            used_ids.push(selected.id);
            fs.writeFile(DATA_FILEPATH, used_ids.join('\n'), function(err) {
              if (err) {
                return console.log(err);
              }
              console.log('written');
            });
          } else {
            getBeer(callback);
          }
        });
      }).on('error', function(e){
        console.log(e);
      });
    } else {
      var selected = beers.pop();
      callback(selected);
      used_ids.push(selected.id);
      fs.writeFile(DATA_FILEPATH, used_ids.join('\n'), function(err) {
        if (err) {
          return console.log(err);
        }
        console.log('written');
      });
    }
   
  }

  return {
    getBeer: getBeer,
  }

})();