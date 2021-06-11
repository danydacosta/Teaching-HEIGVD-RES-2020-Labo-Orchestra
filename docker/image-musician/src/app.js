var dgram = require('dgram');
const { v4: uuidv4 } = require('uuid');

var dayjs = require('dayjs')

// Récupérer l'instrument passé en argument
if(process.argv[2] == null) {
    console.log("Error : an instrument must be specified!")
    return
}

const instrumentSound = new Map()
instrumentSound.set("piano", "ti-ta-ti")
instrumentSound.set("trumpet", "pouet")
instrumentSound.set("flute", "trulu")
instrumentSound.set("violin", "gzi-gzi")
instrumentSound.set("drum", "boum-boum")

var instrument = process.argv[2]
var sound = instrumentSound.get(instrument)

// Vérifier que l'instrument soit un instrument correct
if(sound == null) {
    console.log("Error : unknown instrument!")
    return
}

// Génération du uuid du musicien
var uuid = uuidv4();

var basePayload = {
    "uuid" : uuid,
    "instrument" : instrument,
    "sound" : sound
}

// Envoi du datagramme UDP
var sock = dgram.createSocket("udp4")
var addr = '239.255.10.5' // multicast address
var port = 1666

// Emission toutes les secondes
setInterval(sendSoundNotification, 1000)

function sendSoundNotification() {
    // Ajouter le temps au payload
    var payload = { ...basePayload, "issued_at" : dayjs()}
    var json = JSON.stringify(payload);
    var message = Buffer.from(json);

    sock.send(message, 0, message.length, port, addr, function (err, bytes) {
        console.log("Sent payload:", json, "on port", sock.address().port)
    });
}
