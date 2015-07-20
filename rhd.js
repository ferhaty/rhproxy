// rhd.js - Reverse HTTP Daemon

var http = require('http'),
    httpProxy = require('http-proxy');

var config = require('config');

var proxy = httpProxy.createProxyServer({});

var server = http.createServer(function(req, res) {

  // TODO route request to a pool of brokers
  proxy.web(req, res, { target: 'http://127.0.0.1:9090' });
});

proxy.on('error', function (err, req, res) {
  res.writeHead(500, {
      'Content-Type': 'text/plain'
    });

    res.end('Something went wrong');
    console.log("Something went wrong.");
});

var listenPort = config.get('server.listen_port');
server.listen(listenPort);

console.log("listening on port " + listenPort)
