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






var Point = function () // (rows, columns)
{
    //this.rows = rows;
    //this.columns = columns;
    
    this.X = -1;
    this.Y = -1;
}


var Cell = function (is_blocked) {
    this.is_blocked = is_blocked;
    
    this.north = false;
    this.west = false;
    this.south = false;
    this.east = false;
    
    this.has_way = false;
	
	//this.hasPlace = function () {        
    //    return this.clients.length < 2;
    //}
}


function mazeArray(rows, columns) {
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
    
    //EventEmitter.call(this);// Инициализируем события
    
    
    /**
     Выбор направления
    **/
	this.nextCourse = function () {
        var able_ways = new Array();
        
        if (thisPoint.X > 0) {
            if (!maze[thisPoint.X - 1][thisPoint.Y].has_way) //если через ячейку слева не проложен путь
            {
                //west_able = true;
                able_ways.push("west");
            }
        }
        
        if (thisPoint.X < columns - 1) {
            if (!maze[thisPoint.X + 1][thisPoint.Y].has_way) //если через ячейку справа не проложен путь
            {
                //east_able = true;
                able_ways.push("east");
            }
        }
        
        if (thisPoint.Y > 0) {
            if (!maze[thisPoint.X][thisPoint.Y - 1].has_way) //если через ячейку сверху не проложен путь
            {
                //north_able = true;
                able_ways.push("north");
            }
        }
        
        if (thisPoint.Y < rows - 1) {
            if (!maze[thisPoint.X][thisPoint.Y + 1].has_way) //если через ячейку снизу не проложен путь
            {
                //south_able = true;
                able_ways.push("south");
            }
        }
        
        if (able_ways.length > 0) {
            var r = Math.round(Math.random() * able_ways.length);//выбор направления к следующей доступной ячейке
            
            return able_ways[r];//вернуть направление
        }
        else { //если нет доступных для выбора ячеек
            return null;//
        }
    }
    
    
    /**
     Переход к следующей точке по направлению
    **/
    this.goToNextPoint = function () {
        switch (course) {
            case 'west':
                thisPoint.X -= 1;
                maze[thisPoint.X][thisPoint.Y].west = true;
                maze[thisPoint.X][thisPoint.Y].has_way = true;
                return;
            case 'east':
                thisPoint.X += 1;
                maze[thisPoint.X][thisPoint.Y].east = true;
                maze[thisPoint.X][thisPoint.Y].has_way = true;
                return;
            case 'north':
                thisPoint.Y -= 1;
                maze[thisPoint.X][thisPoint.Y].north = true;
                maze[thisPoint.X][thisPoint.Y].has_way = true;
                return;
            case 'south':
                thisPoint.Y += 1;
                maze[thisPoint.X][thisPoint.Y].south = true;
                maze[thisPoint.X][thisPoint.Y].has_way = true;
                return;
        }
    }
    
    
    
    var maze = mazeArray(rows, columns);
    
    var thisPoint = new Point();
    thisPoint.X = Math.round(Math.random() * columns);
    thisPoint.Y = Math.round(Math.random() * rows);
    
    maze[thisPoint.X][thisPoint.Y].has_way = true;
    
    var course = this.nextCourse();
    
    while (course != null) {
        this.goToNextPoint();
        course = this.nextCourse();
    }
    
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




var Point = function () // (rows, columns)
{
    //this.rows = rows;
    //this.columns = columns;
    
    this.X = -1;
    this.Y = -1;
}


var Cell = function (is_blocked) {
    this.is_blocked = is_blocked;
    
    this.north = false;
    this.west = false;
    this.south = false;
    this.east = false;
    
    this.has_way = false;
	
	//this.hasPlace = function () {        
    //    return this.clients.length < 2;
    //}
}


function mazeArray(rows, columns) {
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
    
    //EventEmitter.call(this);// Инициализируем события
    
    
    
    /**
     Выбор направления
    **/
	this.nextCourse = function () {
        var able_ways = new Array();
        
        if (thisPoint.X > 0) {
            if (!maze[thisPoint.X - 1][thisPoint.Y].has_way) //если через ячейку слева не проложен путь
            {
                //west_able = true;
                able_ways.push("west");
            }
        }
        
        if (thisPoint.X < columns - 1) {
            if (!maze[thisPoint.X + 1][thisPoint.Y].has_way) //если через ячейку справа не проложен путь
            {
                //east_able = true;
                able_ways.push("east");
            }
        }
        
        if (thisPoint.Y > 0) {
            if (!maze[thisPoint.X][thisPoint.Y - 1].has_way) //если через ячейку сверху не проложен путь
            {
                //north_able = true;
                able_ways.push("north");
            }
        }
        
        if (thisPoint.Y < rows - 1) {
            if (!maze[thisPoint.X][thisPoint.Y + 1].has_way) //если через ячейку снизу не проложен путь
            {
                //south_able = true;
                able_ways.push("south");
            }
        }
        
        if (able_ways.length > 0) {
            var r = Math.round(Math.random() * able_ways.length);//выбор направления к следующей доступной ячейке
            
            return able_ways[r];//вернуть направление
        }
        else { //если нет доступных для выбора ячеек
            return null;//
        }
    }
    
    
    /**
     Переход к следующей точке по направлению
    **/
    this.goToNextPoint = function () {
        switch (course) {
            case 'west':
                thisPoint.X -= 1;
                maze[thisPoint.X][thisPoint.Y].west = true;
                maze[thisPoint.X][thisPoint.Y].has_way = true;
                return;
            case 'east':
                thisPoint.X += 1;
                maze[thisPoint.X][thisPoint.Y].east = true;
                maze[thisPoint.X][thisPoint.Y].has_way = true;
                return;
            case 'north':
                thisPoint.Y -= 1;
                maze[thisPoint.X][thisPoint.Y].north = true;
                maze[thisPoint.X][thisPoint.Y].has_way = true;
                return;
            case 'south':
                thisPoint.Y += 1;
                maze[thisPoint.X][thisPoint.Y].south = true;
                maze[thisPoint.X][thisPoint.Y].has_way = true;
                return;
        }
    }
    
    
    
    var maze = mazeArray(rows, columns);
    
    var thisPoint = new Point();
    thisPoint.X = Math.round(Math.random() * columns);
    thisPoint.Y = Math.round(Math.random() * rows);
    
    maze[thisPoint.X][thisPoint.Y].has_way = true;
    
    var course = this.nextCourse();
    
    while (course != null) {
        this.goToNextPoint();
        course = this.nextCourse();
    }
    
    return maze;
}




io.sockets.on('connection', function (client) {
    
    if (Game.users === undefined)
        Game.users = [];
    else if (Game.users.indexOf(client) == -1)//если такого игрока нет в списке
        Game.users.push(client);//добавляем нового игрока
    
    
    client.on('req_room', function () {
        
        //Game.start();
        if (Game.incompleateRoom == null)  //* if (Game.incompleateRoom ==- null)
            Game.incompleateRoom = new Room("комната" + (Math.round(Math.random() * 10000)));

        Game.incompleateRoom.addClient(client);
        client.join(Game.incompleateRoom.name);
        
        client.emit('room', Game.incompleateRoom.name);
        
        if (Game.rooms == undefined)
            Game.rooms = [];
        Game.rooms[client.id] = Game.incompleateRoom;
        
        console.log("client id=" + client.id + "  incompleateRoom.name=" + Game.incompleateRoom.name);
        
        //если в неполной комнате не осталось свободных мест
        if (!Game.incompleateRoom.hasPlace()) {
            console.log("has no place");
            io.sockets.in(Game.incompleateRoom.name).emit('compleate_room', '');//послать всем участникам комнаты сообщение, что их комната заполнена
            
            var Maze = GenerateMaze(7, 7);//генерация лабиринта
            io.sockets.in(Game.incompleateRoom.name).emit('maze', Maze);
            console.log("Лабиринт "+ Maze+ "передан");

            Game.incompleateRoom = null;//и отметить, что неполной комнаты нет
            
        }
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

    //client.on('message', function (message) {
    //    try {
    //        client.emit('message', message);
    //        client.broadcast.emit('message', message);
    //    } catch (e) {
    //        userId = Game.users.indexOf(client);
    //        if (userId != -1)
    //            delete Game.users[userId];
    //        console.log(e);
    //        client.disconnect();
    //    }
    //});

});
