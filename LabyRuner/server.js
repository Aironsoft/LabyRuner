//
// # SimpleServer
//
// A simple chat server using Socket.IO, Express, and Async.
//
var http = require('http');
var path = require('path');

var async = require('async');
var socketio = require('socket.io');
var express = require('express');

//
// ## SimpleServer `SimpleServer(obj)`
//
// Creates a new instance of SimpleServer with the following options:
//  * `port` - The HTTP port to listen on. If `process.env.PORT` is set, _it overrides this value_.
//
var router = express();
var server = http.createServer(router);
var io = socketio.listen(server);

router.use(express.static(path.resolve(__dirname, 'client')));
var messages = [];
var sockets = [];


var Labyquest = require('./models/Labyquest.js');//получение модели лабиринта
var Room = require('./models/Labyquest.js');//получение модели комнаты
var countGames = 0, countPlayers = [], Game = new Labyquest();
Game.rooms = [];
Game.users = [];
var runes = ["Fi", "Re", "Gu", "Ne"];


/////

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
            var cell = { is_blocked: false, north: false, west: false, south: false, east: false, has_way: false };
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
                                np = new Point();
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
    var client = {name: null, type: "player", life: 100, scores: 0, room: null, client: null, color: null, X: -1, Y: -1 };
    return client;
}

var ClientCopy = function (client) {
    var copy = { name: client.name, type: client.type, life: client.life, scores: client.scores, room: client.room, color: client.color, X: client.X, Y: client.Y };
    return copy;
}

var GenerateObject = function () {
    var r = Math.round(Math.random() *( runes.length - 1));
    var rune = runes[r];
    var object = {name: "Руна"+ (Math.round(Math.random() * 10000)), type: "rune", value: rune, color: null, X: -1, Y: -1 };
    return object;
}

/////



io.on('connection', function (socket) {
    
    if (Game.users === undefined)
        Game.users = [];
    else if (Game.users.indexOf(socket) == -1)//если такого игрока нет в списке
        Game.users.push(socket);//добавляем нового игрока
    
    socket.on('req_room', function (client_name) {
        
        //Game.start();
        if (Game.incompleateRoom == null)  //* if (Game.incompleateRoom ==- null)
            Game.incompleateRoom = new Room("комната" + (Math.round(Math.random() * 10000)));
        
        var clnt = Client();
        
        if(client_name!=null) {
            clnt.name = client_name;
        }
        else {
            clnt.name = 'Игрок_' + (Math.round(Math.random() * 10000));
        }
        clnt.color = '#' + (Math.random() * 0xFFFFFF << 0).toString(16);//создаётся случайный цвет для игрока
        clnt.room = Game.incompleateRoom.name;
        clnt.client = socket;
        
        socket.me = clnt;

        Game.incompleateRoom.addClient(socket);
        socket.join(Game.incompleateRoom.name);
        
        socket.emit('room', Game.incompleateRoom.name);
        
        if (Game.rooms == undefined)
            Game.rooms = {};
        Game.rooms[socket.id] = Game.incompleateRoom;
        
        console.log("client id=" + socket.id + "  incompleateRoom.name=" + Game.incompleateRoom.name);
        
        //если в неполной комнате не осталось свободных мест
        if (!Game.incompleateRoom.hasPlace()) {
            console.log("has no place");
            io.sockets.in(Game.incompleateRoom.name).emit('compleate_room', '');//послать всем участникам комнаты сообщение, что их комната заполнена
            
            
            if (Game.rooms[socket.id].Maze == null || Game.rooms[socket.id].Maze == undefined) {
                Game.rooms[socket.id].Maze = GenerateMaze(10, 10);//генерация лабиринта
                Game.rooms[socket.id].Positions = coordsArray(10, 10);//массив позиций в лабиринте
                console.log("Лабиринт создан");
            }
            io.sockets.in(Game.incompleateRoom.name).emit('maze', Game.rooms[socket.id].Maze);
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
                Game.incompleateRoom.ObjectDict[Game.incompleateRoom.clients[i].me.name] = ClientCopy(Game.incompleateRoom.clients[i].me);//записывает игрока в словарь объектов
            }

            io.sockets.in(Game.incompleateRoom.name).emit('positions', Game.incompleateRoom.Positions);
            console.log("Позиции " + Game.incompleateRoom.Positions + " переданы");
            
            io.sockets.in(Game.incompleateRoom.name).emit('objects', Game.incompleateRoom.ObjectDict);
            console.log("Объекты " + Game.incompleateRoom.ObjectDict + " переданы");


            Game.incompleateRoom = null;//и отметить, что неполной комнаты нет
            
        }
    });
    
    socket.on('moving', function (data) {
        
        if (Game.rooms[socket.id] == undefined)
            return;

        var dx = 0, dy = 0;
        
        var obj = Game.rooms[socket.id].ObjectDict[data.name];
        if (obj == undefined)
            return;

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

        if(obj.X + dx>-1 && obj.X + dx<Game.rooms[socket.id].Maze.length && obj.Y + dy>-1 && obj.Y + dy<Game.rooms[socket.id].Maze[0].length)
        {
            if (Game.rooms[socket.id].Positions[obj.X + dx][obj.Y + dy] == null)//если ячейка лабиринта, в которую запрашивается перемещение, пуста
            {
                console.log("Место для движения "+ data.course+" свободно");
                
                io.sockets.in(Game.rooms[socket.id].name).emit('moving', { name: data.name, dx: dx, dy: dy }); //имя и вектор сдвига // { name: data.name, x: obj.X+ dx, y: obj.Y+dy });
    
                var posObj = Game.rooms[socket.id].Positions[obj.X][obj.Y];//старое значение объекта из старой позиции
                posObj.X = obj.X + dx;
                posObj.Y = obj.Y + dy;
                Game.rooms[socket.id].Positions[posObj.X][posObj.Y] = posObj;
                Game.rooms[socket.id].Positions[obj.X][obj.Y] = null;
    
                obj.X += dx;
                obj.Y += dy;
            }
            else {
                var forwardObj = Game.rooms[socket.id].Positions[obj.X + dx][obj.Y + dy];//объект, стоящий на пути
                if(forwardObj.type=="rune") //если это руна мешает проходу
                {
                    io.sockets.in(Game.rooms[socket.id].name).emit('moving', { name: data.name, dx: dx, dy: dy }); //имя и вектор сдвига игрока
        
                    io.sockets.in(Game.rooms[socket.id].name).emit('destroy', forwardObj.name); //указать игрокам имя объекта для уничтожения
        
                    io.sockets.in(Game.rooms[socket.id].name).emit('score', { name: data.name, ds: 10 }); //на сколько изменилось количество очков игрока
                    
                    var posObj = Game.rooms[socket.id].Positions[obj.X][obj.Y];//старое значение объекта из старой позиции
                    posObj.X = obj.X + dx;
                    posObj.Y = obj.Y + dy;
                    Game.rooms[socket.id].Positions[posObj.X][posObj.Y] = posObj;
                    Game.rooms[socket.id].Positions[obj.X][obj.Y] = null;
        
                    obj.X += dx;
                    obj.Y += dy;
                }
                else
                {
                    console.log("Место для движения " + data.course + " занято");
                    console.log(Game.rooms[socket.id].Positions[obj.X + dx][obj.Y + dy]);
                    console.log(obj);
                }
            }
        }
        else
        {
            console.log("Шаг за пределы " + obj + " "+data.course);
        }

    });
    
    
    socket.on('wantspawn', function () {//если от клиента пришло сообщение о необходимости что-нибудь создать
        if(Game.rooms[socket.id]==undefined)
            return;
    
        if(Game.rooms[socket.id].Maze==null)
            return;
    
        var maxX=Game.rooms[socket.id].Maze.length;
        var maxY=Game.rooms[socket.id].Maze[0].length;
    
        var x = Math.round(Math.random() * (maxX - 1));
        var y = Math.round(Math.random() * (maxY - 1));
        
        if (Game.rooms[socket.id].Positions[x][y] == null)
        {
            var object = GenerateObject();
            object.X=x;
            object.Y=y;
            
            Game.rooms[socket.id].Positions[x][y]=object;
            Game.rooms[socket.id].ObjectDict[object.name] = object;
            
            io.sockets.in(Game.rooms[socket.id].name).emit('spawn', object);//отправить это сообщение всем членам его комнаты
        }
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
            socket.disconnect();
        }
    });
    
    socket.on('out', function (data) {//от клиента пришло сообщение о покидании комнаты
        if(Game.rooms[socket.id]==undefined)
            return;
    
        if(Game.rooms[socket.id].name==data.room) {
            io.sockets.in(Game.rooms[socket.id].name).emit('destroy', data.name); //указать игрокам имя объекта для уничтожения
            
            var obj = Game.rooms[socket.id].ObjectDict[data.name];
            if(obj!=undefined) {
                Game.rooms[socket.id].Positions[obj.X][obj.Y] = null;//удалить объект из массива позиций
                delete Game.rooms[socket.id].ObjectDict[data.name];//удалить объект из словаря объектов
                //Game.rooms[socket.id].ObjectDict.Remove(data.name);//удалить объект из словаря объектов
            }
        }
    });
    
    ////////////
    
    messages.forEach(function (data) {
      socket.emit('message', data);
    });

    sockets.push(socket);

    socket.on('disconnect', function () {
      sockets.splice(sockets.indexOf(socket), 1);
      updateRoster();
    });

    socket.on('message', function (msg) {
      var text = String(msg || '');

      if (!text)
        return;

      socket.get('name', function (err, name) {
        var data = {
          name: name,
          text: text
        };

        broadcast('message', data);
        messages.push(data);
      });
    });

    socket.on('identify', function (name) {
      socket.set('name', String(name || 'Anonymous'), function (err) {
        updateRoster();
      });
    });
  });

function updateRoster() {
  async.map(
    sockets,
    function (socket, callback) {
      socket.get('name', callback);
    },
    function (err, names) {
      broadcast('roster', names);
    }
  );
}

function broadcast(event, data) {
  sockets.forEach(function (socket) {
    socket.emit(event, data);
  });
}

server.listen(process.env.PORT || 3000, process.env.IP || "0.0.0.0", function(){
  var addr = server.address();
  console.log("Chat server listening at", addr.address + ":" + addr.port);
});
