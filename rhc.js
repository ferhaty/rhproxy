// rhc.js - Reverse HTTP Client

var config = require('config');
var tunnel = require('tunnel');
var sys = require('sys');
var util = require('util');

var proxyHost = config.get('proxy.host');
var proxyPort = config.get('proxy.port');
var proxyUser = config.get('proxy.user');
var proxyPass = config.get('proxy.password');
var gateway = config.get('brokers.gateway');

var clients = [];

function createClient(port){
    var gateway = config.get('brokers.gateway');
    var proxyAuth = new Buffer(proxyUser + ':' + proxyPass).toString('base64');

    sys.log('connecting to %s:%d', gateway, port);
    sys.log('proxy auth: %s', proxyAuth);

    // TODO persistent connection through tunnel/proxy to gateway
    // https://www.ietf.org/rfc/rfc2817.txt (5.2 Requesting a Tunnel with CONNECT)

    var tunnelCommand = util.format(
      'CONNECT %s:%d HTTP/1.1\r\n' +
      'Host: %s:%d\r\n' +
      'Proxy-Authorization: Basic %s\r\n', gateway, port, gateway, port, proxyAuth);
}

sys.log('proxy enabled... tunneling http requests through %s %d', proxyHost, proxyPort);

var tunnelingAgent = tunnel.httpOverHttp({
  maxSockets: 50,

  proxy: { // Proxy settings
    host: proxyHost,
    port: proxyPort,
    //localAddress: localAddress,
    proxyAuth: proxyUser + ':' + proxyPass,
    headers: {
      'User-Agent': 'Node'
    }
  }
});

sys.log('connecting to brokers');

var range_start = config.get('brokers.range_start');
var range_end = config.get('brokers.range_end');

for(var port=range_start;port<=range_end;port++){
  createClient(port);
}
