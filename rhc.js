// rhc.js - Reverse HTTP Client

var config = require('config');
var tunnel = require('tunnel');
var sys = require('sys');

var proxyHost = config.get('proxy.host');
var proxyPort = config.get('proxy.port');
var proxyUser = config.get('proxy.user');
var proxyPass = config.get('proxy.password');

function createClient(port){
    var gateway = config.get('brokers.gateway');

    sys.log('connecting to %s:%d', gateway, port);

    // TODO persistent connection through tunnel/proxy
}

sys.log('proxy enabled... tunneling http requests through %s %d', proxyHost, proxyPort);

var tunnelingAgent = tunnel.httpOverHttp({
  maxSockets: 20, // Defaults to 5

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
