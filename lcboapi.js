var https = require('https');
var fs = require('fs');
module.exports = (function() {
  const DATA_FILEPATH = 'data/used_beers.txt';
  const BEER_API_PATH = '/products?store_id=511&q=beer&where_not=is_dead,is_discontinued';
  const AUTH_TOKEN = 'Token MDo5MDRjMTU0NC05MjU1LTExZTUtYjBkOS1kMzc3MTBkZTdhZDA6bDJMV0d0QTI5N0R1SWl3bGVMSmZwUE05cTFZdGxaUWZTU2FH';
  
  var options = {
    hostname: 'lcboapi.com',
    method: 'GET',
    headers:  {
      Authorization: AUTH_TOKEN,
    },
  };

  var beers = []; 
  var used_names = [];
  var requestPage = 0;

  fs.readFile(DATA_FILEPATH, 'utf-8', function(err, data) {
    if(err) {
      return console.log(err);
    }
    used_names = data.split('\n');
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
            return used_names.indexOf(item.name) < 0;
          });
          if(beers.length > 0) {
            var selected = beers.pop();
            used_names.push(selected.name);
            //remove any existing beers with the same name
            beers = beers.filter(function(item) {
              return used_names.indexOf(item.name) < 0;
            });
            fs.writeFile(DATA_FILEPATH, used_names.join('\n'), function(err) {
              if (err) {
                return console.log(err);
              }
              console.log('written');
            });
            //send the selected beer to the callback
            callback(selected);
          } else {
            getBeer(callback);
          }
        });
      }).on('error', function(e){
        console.log(e);
      });
    } else {
      var selected = beers.pop();
      used_names.push(selected.name);
        beers = beers.filter(function(item) {
        return used_names.indexOf(item.name) < 0;
      });
      fs.writeFile(DATA_FILEPATH, used_names.join('\n'), function(err) {
        if (err) {
          return console.log(err);
        }
        console.log('written');
      });
      callback(selected);
    }
  }

  return {
    getBeer: getBeer,
  }

})();