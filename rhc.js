// rhc.js - Reverse HTTP Client

var config = require('config');
var tunnel = require('tunnel');
var sys = require('sys');
var util = require('util');
var net = require('net');

var proxyHost = config.get('proxy.host');
var proxyPort = config.get('proxy.port');
var proxyUser = config.get('proxy.user');
var proxyPass = config.get('proxy.password');
var gateway = config.get('brokers.gateway');

var brokerClients = [];
var proxyClients = [];

function createClient(port){
    var proxyAuth = new Buffer(proxyUser + ':' + proxyPass).toString('base64');

    sys.log('connecting to %s:%d', gateway, port);

    // TODO persistent connection through tunnel/proxy to gateway
    // https://www.ietf.org/rfc/rfc2817.txt (5.2 Requesting a Tunnel with CONNECT)

    var tunnelCommand = util.format(
      'CONNECT %s:%d HTTP/1.1\r\n' +
      'Host: %s:%d\r\n' +
      'Proxy-Authorization: Basic %s\r\n' +
      'Connection: Keep-Alive\r\n\r\n', gateway, port, gateway, port, proxyAuth);

    // connect to the broker through the proxy and pipe data back to the proxy
    brokerClients[port] = new net.Socket();
    proxyClients[port] = new net.Socket();

    brokerClients[port].on('error', function(error){
      sys.log('[brokerclient]: error %s', error);
    });

    proxyClients[port].on('error', function(error){
      sys.log('[proxyclient]: error %s', error);
    });

    proxyClients[port].on('data', function(proxyData){
      sys.log('[proxyclient]: data %s', proxyData.toString().substring(0,40) + '...');
    });

    brokerClients[port].on('data', function(brokerData){
      sys.log('[brokerclient]: data %s', brokerData.toString().substring(0,40) + '...');

      if(brokerData.toString().indexOf('HTTP/1.1 200 Connection established') > -1){
        sys.log('[brokerclient]: connection established');
        proxyClients[port].connect(proxyPort, proxyHost, function(){
          sys.log('[proxyclient]: connected to the proxy %s on port %d', proxyHost, proxyPort);
        });

        brokerClients[port].pipe(proxyClients[port]);
        proxyClients[port].pipe(brokerClients[port]);
      }
    });

    proxyClients[port].on('close', function(){
      sys.log('[proxyclient]: connection closed');
    });

    brokerClients[port].on('close', function(){
      sys.log('[brokerclient]: connection closed');
    });

    brokerClients[port].connect(proxyPort, proxyHost, function(){
      sys.log('[brokerclient]: connected to the proxy %s on port %d', proxyHost, proxyPort);
      sys.log('[brokerclient]: connecting to the broker %s', tunnelCommand);
      brokerClients[port].write(tunnelCommand);
    });

    sys.log('piping data client <-> proxy <-> gateway');

}

sys.log('proxy enabled... tunneling http requests through %s %d', proxyHost, proxyPort);

sys.log('connecting to brokers');

var range_start = config.get('brokers.range_start');
var range_end = config.get('brokers.range_end');

for(var port=range_start;port<=range_end;port++){
  createClient(port);
}
