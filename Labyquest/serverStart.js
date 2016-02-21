var PORT = 8008;

var options = {
//    'log level': 0
};

var express = require('express');
var app = express();
var http = require('http');
var server = http.createServer(app);
var io = require('socket.io').listen(server, options);

var Labyquest = require('./models/Labyquest.js');//получение модели лабиринта
var Room = require('./models/Labyquest.js');//получение модели комнаты

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


var Client = function (){
    var client = {name: null, room: null, client: null, color: null, X: -1, Y: -1 }
    return client;
}

var ClientCopy = function (client) {
    var copy = { name: client.name, room: client.room, color: client.color, X: client.X, Y: client.Y }
    return copy;
}



server.listen(PORT);

app.use('/static', express.static(__dirname + '/static'));

app.get('/', function (req, res) {
    res.sendfile(__dirname + '/index.html');
});


var countGames = 0, countPlayers = [], Game = new Labyquest();
Game.rooms = [];
Game.users = [];


/////


io.sockets.on('connection', function (client) {
    
    if (Game.users === undefined)
        Game.users = [];
    else if (Game.users.indexOf(client) == -1)//если такого игрока нет в списке
        Game.users.push(client);//добавляем нового игрока
    
    
    client.on('req_room', function (client_name) {
        
        //Game.start();
        if (Game.incompleateRoom == null)  //* if (Game.incompleateRoom ==- null)
            Game.incompleateRoom = new Room("комната" + (Math.round(Math.random() * 10000)));
        
        var clnt = Client();
        clnt.name = client_name;
        clnt.color = '#' + (Math.random() * 0xFFFFFF << 0).toString(16);//создаётся случайный цвет для игрока
        clnt.room = Game.incompleateRoom.name;
        clnt.client = client;
        
        client.me = clnt;

        Game.incompleateRoom.addClient(client);
        client.join(Game.incompleateRoom.name);
        
        client.emit('room', Game.incompleateRoom.name);
        
        if (Game.rooms == undefined)
            Game.rooms = {};
        Game.rooms[client.id] = Game.incompleateRoom;
        
        console.log("client id=" + client.id + "  incompleateRoom.name=" + Game.incompleateRoom.name);
        
        //если в неполной комнате не осталось свободных мест
        if (!Game.incompleateRoom.hasPlace()) {
            console.log("has no place");
            io.sockets.in(Game.incompleateRoom.name).emit('compleate_room', '');//послать всем участникам комнаты сообщение, что их комната заполнена
            
            
            if (Game.rooms[client.id].Maze == null || Game.rooms[client.id].Maze == undefined) {
                Game.rooms[client.id].Maze = GenerateMaze(40, 40);//генерация лабиринта
                Game.rooms[client.id].Positions = coordsArray(40, 40);//массив позиций в лабиринте
                console.log("Лабиринт создан");
            }
            io.sockets.in(Game.incompleateRoom.name).emit('maze', Game.rooms[client.id].Maze);
            console.log("Лабиринт передан");
            
            //Game.incompleateRoom.ObjectDict = {};

            for (var i = 0; i < Game.incompleateRoom.clients.length; i++) { //каждый клиент данной комнаты
                var x = Math.round(Math.random() * (Game.incompleateRoom.Maze.length - 1));
                var y = Math.round(Math.random() * (Game.incompleateRoom.Maze[0].length - 1));

                while (Game.incompleateRoom.Positions[x][y] != null) {
                    x = Math.round(Math.random() * (Game.incompleateRoom.Maze.length - 1));
                    y = Math.round(Math.random() * (Game.incompleateRoom.Maze[0].length - 1));
                }

                Game.incompleateRoom.clients[i].me.X = x;
                Game.incompleateRoom.clients[i].me.Y = y;
                
                Game.incompleateRoom.Positions[x][y] = ClientCopy(Game.incompleateRoom.clients[i].me);//помещается в случайное место лабиринта
                Game.incompleateRoom.ObjectDict[Game.incompleateRoom.clients[i].me.name] = ClientCopy(Game.incompleateRoom.clients[i].me);;//записывает игрока в словарь объектов
            }

            io.sockets.in(Game.incompleateRoom.name).emit('positions', Game.incompleateRoom.Positions);
            console.log("Позиции " + Game.incompleateRoom.Positions + " переданы");
            
            io.sockets.in(Game.incompleateRoom.name).emit('objects', Game.incompleateRoom.ObjectDict);
            console.log("Объекты " + Game.incompleateRoom.ObjectDict + " переданы");


            Game.incompleateRoom = null;//и отметить, что неполной комнаты нет
            
        }
    });
    
    client.on('moving', function (data) {
        
        var obj = Game.rooms[client.id].ObjectDict[data.name];
        var newPos = new Point(obj.X, obj.Y);
        
        console.log("newPos = " + newPos);

        switch (data.course) { 
            case "w":
                newPos.X -= 1;
            case "n":
                newPos.Y -= 1;
            case "e":
                newPos.X += 1;
            case "s":
                newPos.Y += 1;
        }

        if (Game.rooms[client.id].Positions[newPos.X][newPos.Y] == null)//если ячейка лабиринта, в которую запрашивается перемещение, пуста
        {
            console.log("Место для движения "+ data.course+" свободно");
            
            io.sockets.in(Game.rooms[client.id].name).emit('moving', { name: data.name, x: newPos.X, y: newPos.Y })

            var posObj = Game.rooms[client.id].Positions[obj.X][obj.Y];
            posObj.X = newPos.X;
            posObj.Y = newPos.Y;
            Game.rooms[client.id].Positions[newPos.X][newPos.Y] = posObj;
            Game.rooms[client.id].Positions[obj.X][obj.Y] = null;

            obj.X = newPos.X;
            obj.Y = newPos.Y;
        }
        else {
            console.log("Место для движения занято");
        }
            

        //var room = Game.rooms[client.id];

        //client.coords = data;
        
        //client.emit('self_move', data);
        //client.broadcast.in(Game.rooms[client.id].name).emit('enemy_move', data);

    });

    client.on('message', function (message) {//если от клиента пришло сообщение
        try {
            io.sockets.in(Game.rooms[client.id].name).emit('message', message);//отправить это сообщение всем членам его комнаты
          //  client.broadcast.emit('message', message); //отправить всем, кроме отправителя
        }
        catch (e) {
            //если пользователь уходит, то удалить его из списка
            userId = Game.users.indexOf(client);
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
