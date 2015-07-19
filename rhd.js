// rhd.js - Reverse HTTP Daemon

var http = require('http'),
    httpProxy = require('http-proxy');

var proxy = httpProxy.createProxyServer({});

var server = http.createServer(function(req, res) {

  // TODO route request to a pool of brokers
  proxy.web(req, res, { target: 'http://127.0.0.1:9090' });
});

console.log("listening on port 8080")

proxy.on('error', function (err, req, res) {
  res.writeHead(500, {
      'Content-Type': 'text/plain'
    });

    res.end('Something went wrong');
    console.log("Something went wrong.");
});

server.listen(8080);
