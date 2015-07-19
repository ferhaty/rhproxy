var http = require('http'),
    httpProxy = require('http-proxy');

var proxy = httpProxy.createProxyServer({});

var server = http.createServer(function(req, res) {

  // TODO route request to a pool of brokers
  proxy.web(req, res, { target: 'http://127.0.0.1:9090' });
});

console.log("listening on port 8080")
server.listen(8080);
