/*eslint-env node */
'use strict';
var net = require('net');
var Long = require('long');
var float = require('./float');
var consts = require('./consts');
var HOST = consts.HOST;
var PORT = consts.PORT;
var sqrt = Math.sqrt;

var NUM_TESTS_PER_CHUNK = consts.NUM_TESTS_PER_CHUNK;
var INTERVAL = 1000;
var MAX_NUM = Long.fromString(float.INF_HEX, false, 16);

// Create a server instance, and chain the listen function to it
// The function passed to net.createServer() becomes the event handler for the 'connection' event
// The sock object the callback function receives UNIQUE for each connection
net.createServer((sock) => {
    var timeout;

    // We have a connection - a socket object is assigned to the connection automatically
    console.log('CONNECTED: ' + sock.remoteAddress + ':' + sock.remotePort);

    // Add a 'data' event handler to this instance of socket
    sock.on('data', (data) => {

        console.log('DATA ' + sock.remoteAddress + ': ' + data);
        // Write the data back to the socket, the client will receive it as data from the server
        sock.write('You said "' + data + '"');

    });

    // Add a 'close' event handler to this instance of socket
    sock.on('close', () => {
        console.log('CLOSED: ' + sock.remoteAddress + ' ' + sock.remotePort);
        clearTimeout(timeout);
    });


    // n is long
    // sends an array of hex strings eg [x, sqrt(x), x+1, sqrt(x+1)...] to client
    function generateTests(n) {
      let tests = [];
      for (let i = 0; i < NUM_TESTS_PER_CHUNK; i++) {
        if (n.add(i).greaterThan(MAX_NUM)) {
            return;
        }

        let h = n.add(i).toString(16);
        let f = float.fromHex(h);

        tests.push(h, float.toHex(sqrt(f)));
      }

      sock.write(JSON.stringify(tests));

      // console.log(tests);
      if (n.lessThanOrEqual(MAX_NUM)) {
        timeout = setTimeout(generateTests.bind(null, n.add(NUM_TESTS_PER_CHUNK)), INTERVAL);
      }
    }

    generateTests(Long.UZERO);

}).listen(PORT, HOST);

console.log('Server listening on ' + HOST + ':' + PORT);

