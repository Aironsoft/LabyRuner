var PORT = 8008;

var options = {
//    'log level': 0
};

var express = require('express');
var app = express();
var http = require('http');
var server = http.createServer(app);
var io = require('socket.io').listen(server, options);
var rooms = {}
var incompleateRoom = null

function Room(name) {
    this.name = name;
    var clients = this.clients = []
    this.addClient = function (client) {
        if (clients.length < 2)
            clients.push(client);
    };

    this.hasPlace = function () {
       
        return this.clients.length < 2;
    }

}


server.listen(PORT);

app.use('/static', express.static(__dirname + '/static'));

app.get('/', function (req, res) {
    res.sendfile(__dirname + '/index.html');
});


io.sockets.on('connection', function (client) {
    client.on('req_room', function () {

        if (incompleateRoom === null)
            incompleateRoom = new Room("комната" + (Math.round(Math.random() * 10000)));
        incompleateRoom.addClient(client);
        client.join(incompleateRoom.name);

        client.emit('room', incompleateRoom.name);

        rooms[client.id] = incompleateRoom;

        console.log("client id=" + client.id + "  incompleateRoom.name=" + incompleateRoom.name);
        if (!incompleateRoom.hasPlace()) {
            console.log("has no place");
            io.sockets.in(incompleateRoom.name).emit('compleate_room', '');
            incompleateRoom = null;
            
        }

       
        
    });

    client.on('message', function (message) {
        try {
            io.sockets.in(rooms[client.id].name).emit('message', message);
          //  client.broadcast.emit('message', message);
        } catch (e) {
            console.log(e);
            client.disconnect();
        }
    });
});