var PORT = 8008;

var options = {
//    'log level': 0
};

var express = require('express');
var app = express();
var http = require('http');
var server = http.createServer(app);
var io = require('socket.io').listen(server, options);

server.listen(PORT);

app.use(express.static(__dirname + '/Labyrint'));
//app.use('/labyrint', express.static(__dirname + ''));

app.get('/', function (req, res) {
    res.sendfile(__dirname + '/index.html');
});



var laby = require('./models/Labyquest.js');//получение модели лабиринта
var Room = laby.Room;//получение модели комнаты
var Labyquest = laby.Labyquest;

var Maze = null;



var Point = function () // (rows, columns)
{
    this.X = -1;
    this.Y = -1;
}

var Point = function (x, y) // (rows, columns)
{    
    this.X = x;
    this.Y = y;
}


var Cell = function (is_blocked) {
    this.is_blocked = is_blocked;
    
    this.north = false;
    this.west = false;
    this.south = false;
    this.east = false;
    
    this.has_way = false;
}


var mazeArray = function (rows, columns) {
    var arr = new Array();
    for (var i = 0; i < columns; i++) { //сначала задаются столбцы
        arr[i] = new Array();
        for (var j = 0; j < rows; j++) {
            var cell = { is_blocked: false, north: false, west: false, south: false, east: false, has_way: false }
            arr[i][j] = cell;
        }
    }
    return arr;
}


var GenerateMaze = function (rows, columns) {
    
    var thisPoint = new Point();
    thisPoint.X = Math.round(Math.random() *( columns - 1));
    thisPoint.Y = Math.round(Math.random() *( rows - 1));
    //EventEmitter.call(this);// Инициализируем события
    
    var maze = mazeArray(rows, columns);
    
    
    
    /**
     Выбор направления
    **/
	this.nextCourse = function (selectedPoint) {
        var able_ways = new Array();
        
        if (selectedPoint.X > 0) {
            if (!maze[selectedPoint.X - 1][selectedPoint.Y].has_way) //если через ячейку слева не проложен путь
            {
                able_ways.push("west");
            }
        }
        
        if (selectedPoint.X < columns - 1) {
            if (!maze[selectedPoint.X + 1][selectedPoint.Y].has_way) //если через ячейку справа не проложен путь
            {
                able_ways.push("east");
            }
        }
        
        if (selectedPoint.Y > 0) {
            if (!maze[selectedPoint.X][selectedPoint.Y - 1].has_way) //если через ячейку сверху не проложен путь
            {
                able_ways.push("north");
            }
        }
        
        if (selectedPoint.Y < rows - 1) {
            if (!maze[selectedPoint.X][selectedPoint.Y + 1].has_way) //если через ячейку снизу не проложен путь
            {
                able_ways.push("south");
            }
        }
        
        if (able_ways.length > 0) {
            var r = Math.round(Math.random() * (able_ways.length - 1));//выбор направления к следующей доступной ячейке
            
            return able_ways[r];//вернуть направление
        }
        else { //если нет доступных для выбора ячеек
            return null;//
        }
    }

    
    var selectNewStartWay = 0;
    /**
     Поиск начала для новой ветки
    **/
    this.selectNewStart = function () {
        var np = null;
        switch (selectNewStartWay) {
            case 0:
                for (var i = 0; i < columns; i++) {
                    for (var j = 0; j < rows; j++) {
                        if (maze[i][j].has_way) { //если ячейка имеет путь
                            if (this.nextCourse(new Point(i, j)) != null) {    //и свободные клетки по соседству                            
                                var np = new Point();
                                np.X = i;
                                np.Y = j;
                            }
                        }
                    }
                }
                break;
            case 1:
                break;
            case 2:
                break;
            case 3:
                break;
        }
        
        return np;
    }
    
    
    /**
     Переход к следующей точке по направлению
    **/
    this.goToNextPoint = function () {
        switch (course) {
            case 'west':
                maze[thisPoint.X][thisPoint.Y].west = true; //прописывает в текущую, что движется на запад
                thisPoint.X -= 1; //переход в следующую клетку (на запад)
                maze[thisPoint.X][thisPoint.Y].east = true;//обратный путь
                maze[thisPoint.X][thisPoint.Y].has_way = true; //указать, что клетка, в которую совершён переход, имеет путь
                return;
            case 'east':
                maze[thisPoint.X][thisPoint.Y].east = true;
                thisPoint.X += 1;
                maze[thisPoint.X][thisPoint.Y].west = true;
                maze[thisPoint.X][thisPoint.Y].has_way = true;
                return;
            case 'north':
                maze[thisPoint.X][thisPoint.Y].north = true;
                thisPoint.Y -= 1;
                maze[thisPoint.X][thisPoint.Y].south = true;
                maze[thisPoint.X][thisPoint.Y].has_way = true;
                return;
            case 'south':
                maze[thisPoint.X][thisPoint.Y].south = true;
                thisPoint.Y += 1;
                maze[thisPoint.X][thisPoint.Y].north = true;
                maze[thisPoint.X][thisPoint.Y].has_way = true;
                return;
        }
    }
    
    
    maze[thisPoint.X][thisPoint.Y].has_way = true;
    
    
    while (thisPoint != null) {
        
        var course = this.nextCourse(thisPoint);
        while (course != null) {
            this.goToNextPoint();
            course = this.nextCourse(thisPoint);
        }
        
        thisPoint = this.selectNewStart();
    }
    
    return maze;
}


/**
 Генерация массива позиций в лабиринте
 **/
var coordsArray = function (rows, columns) {
    var arr = new Array();
    for (var i = 0; i < columns; i++) { //сначала задаются столбцы
        arr[i] = new Array();
        for (var j = 0; j < rows; j++) {
            arr[i][j] = null;
        }
    }
    return arr;
}


var Client = function (socket){
    
    this.name = null;
    this.socket = socket;
    this.room = null;
    this.color = null;
    this.X = -1;
    this.Y = -1;

    
}

var ClientCopy = function (client) {
    var copy = { name: client.name, socket:client.soket, room: client.room, color: client.color, X: client.X, Y: client.Y }
    return copy;
}




var countGames = 0, countPlayers = [], Game = new Labyquest();
Game.rooms = {};
Game.users = [];


/////




io.sockets.on('connection', function (socket) {
    
    if (Game.users === undefined)
        Game.users = [];
    
    var client = new Client(socket);

    if (Game.users.indexOf(socket) == -1)//если такого игрока нет в списке
        Game.users.push(socket);//добавляем нового игрока
    
    
    

    
     socket.emit('body', '<div id="nameInput"> Введите имя игрока' +
            '<input type="text" name="nick_name" id="nick_name">' +
            '<button type="button" id="nickNameButton" onclick="sendNickName()">OK</button>' +
            '<div id="message_txt"></div>' +
            '</div>');
    
    
    
    var getRoomsForSelect = function() {
        var result = '';
        for (i = 0; i < Game.rooms.length; i++) {
            result += '<option class=' + Game.rooms[i].name + '>' + 
                Game.rooms[i].name + ',  игроков ' + Game.rooms[i].users.length +'/' + Game.rooms[i].MaxClientCount + 
                '</option>';
        }
        return result
    }
    
    socket.on('nick_name', function (name) {
        client.name = name;
    });
    
    socket.on('select_room', function () {
        
        socket.emit('body', '<div id="roomSelection"> Выберите комнату' +
            '<select type="text" name="select_room" id="select_room">' +
            getRoomsForSelect() 
            + '</select>' +
            '<button type="button" onclick = "sendJoinRoom()">Присоединиться</button>' +
            '<button type="button" onclick = "createNewRoom()">Создать комнату</button>' +
            '<div id="message_txt"></div>' +
            '</div>');

    });
    
    socket.on('new_room', function (room) {
        var newRoom = Game.rooms[room.name] = new Room(room.name);
        newRoom.MaxClientCount = room.MaxClients;
        joinRoom(room.name);
    });
    
    var joinRoom = function (room_name) {
        var room = Game.rooms[room_name];
        room.addClient(client);
        client.color = '#' + (Math.random() * 0xFFFFFF << 0).toString(16);
        client.room = room_name
        socket.join(room_name);
        Game.rooms[socket.id] = room;
        
    }
    
    socket.on('join_room', joinRoom );
    
    socket.on('start_game', function () {
        var room = Game.rooms[socket.id];
        
        if (room.Maze == null || room.Maze == undefined) {
            room.Maze = GenerateMaze(40, 40);//генерация лабиринта
            room.Positions = coordsArray(40, 40);//массив позиций в лабиринте
            console.log("Лабиринт создан");
        }
        
        io.sockets.in(room.name).emit('body',laby.startGameContent);
        io.sockets.in(room.name).emit('start_game', '');//послать всем участникам комнаты сообщение, что их комната заполнена
        io.sockets.in(room.name).emit('maze', room.Maze);
        console.log("Лабиринт передан");
        
        //Game.incompleateRoom.ObjectDict = {};
        
        for (var i = 0; i < room.clients.length; i++) { //каждый клиент данной комнаты
            
            var x, y;

            do {
                x = Math.round(Math.random() * (room.Maze.length - 1));
                y = Math.round(Math.random() * (room.Maze[0].length - 1));
            } while (room.Positions[x][y] != null);

            room.clients[i].X = x;
            room.clients[i].Y = y;
            
            room.Positions[x][y] = ClientCopy(room.clients[i]);//помещается в случайное место лабиринта
            room.ObjectDict[room.clients[i].name] = ClientCopy(room.clients[i]);//записывает игрока в словарь объектов
        }
        
        io.sockets.in(room.name).emit('positions', room.Positions);
        console.log("Позиции " + room.Positions + " переданы");
        
        io.sockets.in(room.name).emit('objects', room.ObjectDict);
        console.log("Объекты " + room.ObjectDict + " переданы");
    });

    
    
    socket.on('moving', function (data) {
        
        if (Game.rooms[data.roomName] == undefined)
            return;
        
        var room = Game.rooms[data.roomName];
        var dx = 0, dy = 0;
        
        var obj = room.ObjectDict[data.name];

        switch (data.course) { 
            case "w":
                dx = -1;
                break;
            case "n":
                dy -= 1;
                break;
            case "e":
                dx += 1;
                break;
            case "s":
                dy += 1;
                break;
        }
        console.log("dx = " + dx);

        if (room.Positions[obj.X + dx][obj.Y + dy] == null)//если ячейка лабиринта, в которую запрашивается перемещение, пуста
        {
            console.log("Место для движения "+ data.course+" свободно");
            
            io.sockets.in(room .name).emit('moving', { name: data.name, x: obj.X+ dx, y: obj.Y+dy })

            var posObj = room .Positions[obj.X][obj.Y];
            posObj.X = obj.X + dx;
            posObj.Y = obj.Y + dy;
            room .Positions[posObj.X][posObj.Y] = posObj;
            room .Positions[obj.X][obj.Y] = null;

            obj.X += dx;
            obj.Y += dy;
        }
        else {
            console.log("Место для движения " + data.course + " занято");
            console.log(room .Positions[obj.X + dx][obj.Y + dy]);
            console.log(obj);
        }
            

        //var room = Game.rooms[client.id];

        //client.coords = data;
        
        //client.emit('self_move', data);
        //client.broadcast.in(Game.rooms[client.id].name).emit('enemy_move', data);

    });

    socket.on('message', function (message) {//если от клиента пришло сообщение
        try {
            io.sockets.in(Game.rooms[socket.id].name).emit('message', message);//отправить это сообщение всем членам его комнаты
          //  client.broadcast.emit('message', message); //отправить всем, кроме отправителя
        }
        catch (e) {
            //если пользователь уходит, то удалить его из списка
            userId = Game.users.indexOf(socket);
            if (userId != -1)
                delete Game.users[userId];

            console.log(e);
            client.disconnect();
        }
    });
    
    
    io.sockets.emit('stats', [
        'Всего игр: ' + countGames,
        'Уникальных игроков: ' + Object.keys(countPlayers).length,
        'Сейчас игр: ' + Object.keys(Game.rooms).length,
        'Сейчас играет: ' + Object.keys(Game.users).length
    ]);

});
