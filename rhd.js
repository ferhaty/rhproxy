// rhd.js - Reverse HTTP Daemon

var http = require('http'),
    httpProxy = require('http-proxy');
var net = require('net');
var config = require('config');
var sys = require ('sys');

var brokers = [];

var proxy = httpProxy.createProxyServer({});

var server = http.createServer(function(req, res) {

  // TODO route request to a pool of brokers
  proxy.web(req, res, { target: 'http://127.0.0.1:9090' });
});

proxy.on('error', function (err, req, res) {
  res.writeHead(500, {
      'Content-Type': 'text/plain'
    });

    res.end('something went wrong');
    sys.log('[server]: something went wrong.');
});

var listenPort = config.get('server.listen_port');
server.listen(listenPort);

sys.log('[server]: listening on port ' + listenPort)

function createBroker(port){

  brokers[port] = net.createServer(function(client) {
    sys.log('[broker %d]: client connected', port);
    client.on('end', function() {
      sys.log('[broker %d]: client disconnected', port);
    });
    client.write('hello\r\n');
    client.pipe(client);
  });

  brokers[port].listen(port, function() {
    sys.log('[broker: %d]: listening on port %d', port, port);
  });

}

var range_start = config.get('brokers.range_start');
var range_end = config.get('brokers.range_end');

for(var port=range_start;port<=range_end;port++){
  createBroker(port);
}
