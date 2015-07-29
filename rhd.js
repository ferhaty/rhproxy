// rhd.js - Reverse HTTP Daemon

var http = require('http'),
    httpProxy = require('http-proxy');
var net = require('net');
var config = require('config');
var sys = require ('sys');

var brokers = [];
var serverClients = [];
var brokerClients = [];

var listenPort = config.get('server.listen_port');

var server = net.createServer(function(serverClient) {
  sys.log('[server]: client connected');
  serverClients.push(serverClient);

  var brokerConnection = net.createConnection(5900);
  brokerConnection.pipe(serverClient);
  serverClient.pipe(brokerConnection);

  serverClient.on('end', function() {
    serverClients.splice(serverClients.indexOf(serverClient), 1);
    sys.log('[server]: client disconnected', port);
  });

  serverClient.on('data', function(data){
    broadcast(5900, data, serverClient);
  });

});

server.listen(listenPort, function(){
  sys.log('[server]: listening on port ' + listenPort);
});

function createBroker(port){

  brokerClients[port] = [];
  brokers[port] = net.createServer(function(client) {
    sys.log('[broker %d]: client connected', port);
    brokerClients[port].push(client);
    client.on('end', function() {
      brokerClients[port].splice(brokerClients[port].indexOf(client), 1);
      sys.log('[broker %d]: client disconnected', port);
    });

    client.on('data', function(data){
      broadcast(port, data, client);
    });

  });

  brokers[port].on('data', function(data){
    sys.log('got %s from client', data);
  });

  brokers[port].listen(port, function() {
    sys.log('[broker: %d]: listening on port %d', port, port);
  });

}

function broadcast(port, message, sender) {
  sys.log('broadcasting %s to clients on port %d', message.toString().substring(0,40) + '...', port);
   brokerClients[port].forEach(function (client) {
     // Don't want to send it to sender
     if (client === sender) return;
     client.write(message);
   });
 }

var range_start = config.get('brokers.range_start');
var range_end = config.get('brokers.range_end');

for(var port=range_start;port<=range_end;port++){
  createBroker(port);
}
