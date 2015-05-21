'use strict';
var net = require('net');
var float = require('./float');
var consts = require('./consts');
var HOST = consts.HOST;
var PORT = consts.PORT;

var client = new net.Socket();
client.connect(PORT, HOST, function() {

    console.log('CONNECTED TO: ' + HOST + ':' + PORT);

});
// Add a 'data' event handler for the client socket
// data is what the server sent to this socket
client.on('data', function(data) {
  var tests = data.toString().split(' ');
  client.write('received');

  var errors = [];
  for (let i = 0; i < tests.length; i += 2) {
    let f = float.fromHex(tests[i]);
    let sqrtF = float.fromHex(tests[i + 1]);

    if (Math.sqrt(f) !== sqrtF) {
      // console.log('wrong', tests[i], tests[i+1]);
      errors.push(tests[i], tests[i+1]);
    }
  }
  if (errors.length > 0) {
    client.write(errors.join(' '));
  }
});

// Add a 'close' event handler for the client socket
client.on('close', function() {
    console.log('Connection closed');
});
