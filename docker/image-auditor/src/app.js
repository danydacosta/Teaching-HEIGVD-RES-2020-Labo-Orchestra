const dgram = require('dgram');
const moment = require('moment');
const net = require('net');

const musicianList = new Map(); // Store musicians

// -------------------- UDP service --------------------
const udpPort = 1666;
const multiCastGroup = '239.255.10.5';
const s = dgram.createSocket('udp4');

s.bind(udpPort, function() {
    console.log("Joining multicast group");
    s.addMembership(multiCastGroup);
});

s.on('message',function(msg, source) {
    console.log("Datagramme reçu");
    var jsonMusicianData = JSON.parse(msg);

    musicianList.set(jsonMusicianData.uuid, {instrument: jsonMusicianData.instrument, lastActive: jsonMusicianData.issued_at});

});



// -------------------- TCP service --------------------
const tcpServer = net.createServer();
const tcpPort = 2205;
const deadSeconds = 5; // Time in second since when a musician is considered "dead"

tcpServer.on('listening', function() {
   console.log("TCP server listening on port " + tcpPort);
});

tcpServer.on('connection', function (clientSocket) {
    var outputMusicians = [];

    musicianList.forEach((value, key, map) => {
        if (moment(value.lastActive, moment.ISO_8601) >= moment().subtract(deadSeconds, 'seconds')) {
            outputMusicians.push({uuid: key, instrument: value.instrument, activeSince: value.lastActive});
        } else { // Musician is too old, deleting
            map.delete(key);
        }
    });

    // Write output to client and close
    clientSocket.write(JSON.stringify(outputMusicians));
    clientSocket.destroy();
});

tcpServer.listen(tcpPort);
