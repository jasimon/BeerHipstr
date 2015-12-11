var https = require('https');
var fs = require('fs');
var Q = require('q');
module.exports = (function() {
  const DATA_FILEPATH = 'data/used_beers.txt';
  const BEER_API_PATH = '/products?store_id=511&q=beer&where_not=is_dead,is_discontinued';
  const INVENTORY_API_PATH_START = '/stores/511/products/';
  const INVENTORY_API_PATH_END = '/inventory';
  const AUTH_TOKEN = 'Token MDo5MDRjMTU0NC05MjU1LTExZTUtYjBkOS1kMzc3MTBkZTdhZDA6bDJMV0d0QTI5N0R1SWl3bGVMSmZwUE05cTFZdGxaUWZTU2FH';
  const PER_PAGE = 20; //Default from API
  
  var options = {
    hostname: 'lcboapi.com',
    method: 'GET',
    headers:  {
      Authorization: AUTH_TOKEN,
    },
  };

  var beers = []; 
  var beers_in_stock = [];
  var used_names = [];
  var requestPage = 0;

  fs.readFile(DATA_FILEPATH, 'utf-8', function(err, data) {
    if(err) {
      return console.log(err);
    }
    used_names = data.split('\n').filter(function(row) {
      return row !== '';
    }).map(function(row) {
      return {name: row.split(',')[0], date:parseInt(row.split(',')[1]) }
    });
  });

  function getBeer(callback) {
    if (beers_in_stock.length == 0) {
      requestPage++;
      options.path = BEER_API_PATH + '&page=' + requestPage;
      https.get(options, function(response) {
        var output = '';
        response.on('data', function(chunk) {
          output += chunk;
        });

        response.on('end', function(chunk) {
          var data = JSON.parse(output);
          beers = data.result.filter(function(item) {
            var matches = used_names.filter(function(row) {
              return row.name === item.name;
            });
            return matches.length === 0;
          });
          if(beers.length > 0) {
            
          checkQuantity()
            .then(function() {
              callback(selectBeer(), used_names.slice(-10).reverse());
            }, function(err) {
              if (err === "ERR_NO_MATCHES") {
                getBeer(callback);
              }
            });
          } else {
            getBeer(callback);
          }
        });
      }).on('error', function(e){
        console.log(e);
      });
    } else {
      callback(selectBeer(), used_names.slice(-10).reverse());
    }
  }

  function selectBeer() {
    var selected = beers_in_stock.pop();
    used_names.push({name: selected.name, date:new Date().getTime()});
    //remove any existing beers with the same name
    beers_in_stock = beers_in_stock.filter(function(item) {
      var matches = used_names.filter(function(row) {
        return row.name === item.name;
      });
      return matches.length === 0;
    });
    var namesString = used_names.reduce(function(prev, curr) {
      return prev + curr.name + ',' + curr.date + '\n';
    }, '');
    fs.writeFile(DATA_FILEPATH, namesString, function(err) {
      if (err) {
        return console.log(err);
      }
      console.log('Wrote names to file');
    });
    //send the selected beer to the callback
    return selected;

  }

  function checkQuantity() {
      //use promises so the first one that has stock is returned
      var deferred = Q.defer();
      var failCount = 0;
      beers.forEach(function(item) {
      options.path = INVENTORY_API_PATH_START + item.id + INVENTORY_API_PATH_END;
      https.get(options, function(response) {
        var output = '';
        response.on('data', function(chunk) {
          output += chunk;
        });

        response.on('end', function(chunk) {
          var resp = JSON.parse(output);
          if (resp.result.quantity > 0) {
            beers_in_stock.push(item);
            //no guaranteed order but will only resolve once
            deferred.resolve();
          } else {
            failCount++;
            if (failCount == beers.length) {
              deferred.reject('ERR_NO_MATCHES');
            }
          }
        })
      }).on('error', function(e) {
        console.log(e);
        deferred.reject(e);
      })

    });
    return deferred.promise;
  }

  return {
    getBeer: getBeer,
  }

})();