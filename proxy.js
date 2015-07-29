var env = require('node-env-file');
env(__dirname + '/.env');

var http = require('http');
var setup = require('proxy');

var server = setup(http.createServer());
server.listen(9090, function () {
  var port = server.address().port;
  console.log('HTTP(s) proxy server listening on port %d', port);
});
