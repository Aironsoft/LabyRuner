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
Game.rooms = {};
Game.users = [];
Game.unfullRooms = {};
Game.fullRooms = {};
var runes = ["Fi", "Re", "Gu", "Ne"];


/////

var Point = function () // (rows, columns)
{
    this.X = -1;
    this.Y = -1;
};

var Point = function (x, y) // (rows, columns)
{    
    this.X = x;
    this.Y = y;
};


var Cell = function (is_blocked) {
    this.is_blocked = is_blocked;
    
    this.north = false;
    this.west = false;
    this.south = false;
    this.east = false;
    
    this.has_way = false;
};


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
};


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
};


var Client = function (){
    var client = {name: null, type: "player", command: -1, life: 100, scores: 0,
            socketID: null, room: null, client: null, color: null, X: -1, Y: -1 };
    return client;
};

var ClientCopy = function (client) {
    var copy = { name: client.name, type: client.type, command: client.command, life: client.life, scores: client.scores,
            burden: client.burden, room: client.room, color: client.color, X: client.X, Y: client.Y };
    return copy;
};

var GenerateObject = function () {
    var r = Math.round(Math.random() *( runes.length - 1));
    var rune = runes[r];
    var object = {name: "Руна"+ (Math.round(Math.random() * 10000)), type: "rune", value: rune, color: null, X: -1, Y: -1 };
    return object;
};

var GenerateCrystals = function (rows, columns, PlacesPos, ObjectDict) {    // , ObjectDict , PlacesPos , Positions
    
    var commandsCount=2;
    //var crystals=[];
    //Crystals=[];
    
    var crystallCount=rows*columns/160;
    if(crystallCount<4)
        crystallCount=4;
    
    for(var j = 0; j < commandsCount; j++)
    {
        for(var i = 0; i < crystallCount; i++)
        {
            var X = Math.round(Math.random() *( columns - 1));
            var Y = Math.round(Math.random() *( rows - 1));
            
            if(PlacesPos[X][Y]==null)
            {
                var crystal = {name: "Кристал"+ (Math.round(Math.random() * 10000)), type: "crystal", command: j, taker: null, color: null, X: X, Y: Y };
                ObjectDict[crystal.name]=crystal;
                //Crystals.push(crystal);
                
                PlacesPos[X][Y]=crystal;
            }
            else
            {
                i--;
            }
        }
    }
};

var GeneratePortals = function (rows, columns, PlacesPos) //
{
    var portals = [];
    
    var portalsCount=rows*columns/200;
    if(portalsCount<2)
        portalsCount=2;
    
    for(var i = 0; i < portalsCount; i++)
    {
        var X = Math.round(Math.random() *( columns - 1));
        var Y = Math.round(Math.random() *( rows - 1));
        
        if(PlacesPos[X][Y]==null)
        {
            var portal = {name: "Портал"+ (Math.round(Math.random() * 10000)), type: "portal", color: null, X: X, Y: Y };
            portals.push(portal);
        }
        else
        {
            i--;
        }
    }
    
    return portals;
};

var GenerateCommandPoints = function (rows, columns, PlacesPos, Commands)
{
    //var commandPoints = new Array();
    
    for(var i = 0; i < Commands.length; i++) //создание командных точек по количеству команд
    {
        var X = Math.round(Math.random() *( columns - 1));
        var Y = Math.round(Math.random() *( rows - 1));
        
        if(PlacesPos[X][Y]==null)
        {
            //var cp = {name: "Командная точка"+ (Math.round(Math.random() * 10000)), type: "cp", color: null, X: X, Y: Y };
            Commands[i].X=X;
            Commands[i].Y=Y;
            
            PlacesPos[X][Y]=Commands[i];
            //commandPoints.push(cp);
        }
        else
        {
            i--;
        }
    }
    
    //return commandPoints;
};


//можно ли из данной ячейки переместиться в указанную сторону
var MayMove = function(cell, course)
{
    switch(course)
    {
        case "n":
            if(cell.north)
                return true;
            break;
        case "w":
            if(cell.west)
                return true;
            break;
        case "s":
            if(cell.south)
                return true;
            break;
        case "e":
            if(cell.east)
                return true;
            break;
    }
    return false;
};


/////



io.on('connection', function (socket) {
    
    socket.on('req_room', function (client_name) { //от клиента пришёл запрос на присоединение к комнате
        
        var clnt = Client();
        
        // if(client_name!=null) {
            clnt.name = client_name;
        // }
        // else {
        //     clnt.name = 'Игрок_' + (Math.round(Math.random() * 10000));
        // }
        
        clnt.color = '#' + (Math.random() * 0xFFFFFF << 0).toString(16);//создаётся случайный цвет для игрока
        clnt.client = socket;
        
        socket.me = clnt;
        
        if (Game.users === undefined)
            Game.users = [];
        else if (Game.users[clnt.name] == undefined)//если такого игрока нет в списке
            Game.users[clnt.name]=socket;//добавляем нового игрока
        
        var room=null;//комната игрока
        
        //Game.start();
        if (Game.incompleateRoom == null)  //если нет комнаты с недобором
        {
            var keys=Object.keys(Game.unfullRooms); //массив ключей словаря незаполненных комнат
            var unfullRoomsCount=keys.length;//количество незаполненных комнат
            if(unfullRoomsCount>0)
            {
                var r = Math.round(Math.random() * (unfullRoomsCount-1));//выбор идентификатора случайного ключа
                room=Game.unfullRooms[keys[r]]; //выбор комнаты из списка незаполненных по случайному ключу
            }
            else //если незаполненных комнат нет
            {
                Game.incompleateRoom = new Room("комната" + (Math.round(Math.random() * 10000)));
                room=Game.incompleateRoom;
            }
        }
        else //если есть незаполненная комната
        {
            room = Game.incompleateRoom;
        }
        
        
        room.addClient(socket); //->
        socket.join(room.name);
        Game.rooms[socket.id] = room; //<-
        socket.me.room = room.name;
        
        socket.emit('room', room.name);
        
        
        console.log("client id=" + socket.id + "  incompleateRoom.name=" + room.name);
        
        //если в неполной комнате заполнено минимальное количество мест
        if (room.hasMinClients()) {
            
            if(room.isBuilded)//если комната построена  //room.hasFreePlace &&  в комнате остались свободные места и она
            {
                // лабиринт, позиции и объекты отправляются лишь данному клиенту
                socket.emit('maze', room.Maze);
                socket.emit('positions', room.Positions);
                socket.emit('objects', room.ObjectDict);
                // socket.emit('teleports', room.TeleportDict);
                socket.emit('portals', room.Portals);
                socket.emit('commands',  room.Commands);
                
                var x = Math.round(Math.random() * (room.Maze.length - 1));
                var y = Math.round(Math.random() * (room.Maze[0].length - 1));
                
                while (room.Positions[x][y] != null) {
                    x = Math.round(Math.random() * (room.Maze.length - 1));
                    y = Math.round(Math.random() * (room.Maze[0].length - 1));
                }

                socket.me.X = x;
                socket.me.Y = y;
                
                room.Positions[x][y] = ClientCopy(socket.me);//помещается в случайное место лабиринта
                room.ObjectDict[socket.me.name] = ClientCopy(socket.me);//записывает игрока в словарь объектов
                    
                io.sockets.in(room.name).emit('spawn', ClientCopy(socket.me));//отправить это сообщение всем членам его комнаты (отправление данного игрока)
                
                return;
            }
            else //если комната не построена
            {
                io.sockets.in(room.name).emit('compleate_room', '');//послать всем участникам комнаты сообщение, что их комната заполнена
                
                var sz=5;
                if (room.Maze == null || room.Maze == undefined) {
                    room.Maze = GenerateMaze(sz, sz);//генерация лабиринта
                    room.Positions = coordsArray(sz, sz);//массив позиций в лабиринте
                    console.log("Лабиринт создан");
                }
                io.sockets.in(room.name).emit('maze', room.Maze);
                
                room.PlacesPos=coordsArray(room.Maze.length, room.Maze[0].length);//массив мест в лабиринте;
                room.Portals = GeneratePortals(room.Maze.length, room.Maze[0].length, room.PlacesPos);//генерация порталов
                for(var i=0; i<room.Portals.length; i++)
                {
                    room.PlacesPos[room.Portals[i].X][room.Portals[i].Y]=room.Portals[i]; //добавление телепортов в позиции мест
                }
                
                GenerateCrystals(room.Maze.length, room.Maze[0].length, room.PlacesPos, room.ObjectDict);//генерация кристаллов // , room.ObjectDict , room.Positions
                //room.Commands
                
                console.log("Лабиринт передан");
    
                for ( var key in room.clients) { //размещение клиентов
                    var x = Math.round(Math.random() * (room.Maze.length - 1));
                    var y = Math.round(Math.random() * (room.Maze[0].length - 1));
    
                    while (room.Positions[x][y] != null) {
                        x = Math.round(Math.random() * (room.Maze.length - 1));
                        y = Math.round(Math.random() * (room.Maze[0].length - 1));
                    }
    
                    room.clients[key].me.X = x;
                    room.clients[key].me.Y = y;
                    
                    room.clients[key].me.command=room.gamerAllocation(room.clients[key].me);
                    
                    room.Positions[x][y] = ClientCopy(room.clients[key].me);//помещается в случайное место лабиринта
                    room.ObjectDict[room.clients[key].me.name] = ClientCopy(room.clients[key].me);//записывает игрока в словарь объектов
                }
                
                GenerateCommandPoints(room.Maze.length, room.Maze[0].length, room.PlacesPos, room.Commands);//выбор позиций командных точек
                
                io.sockets.in(room.name).emit('portals',  room.Portals);
                console.log("Порталы " + room.Portals + " переданы");
                
                io.sockets.in(room.name).emit('commands',  room.Commands);
                console.log("Команды " + room.Commands + " переданы");
    
                io.sockets.in(room.name).emit('positions', room.Positions);
                console.log("Позиции " + room.Positions + " переданы");
                
                io.sockets.in(room.name).emit('objects', room.ObjectDict);
                console.log("Объекты " + room.ObjectDict + " переданы");
                
                room.isBuilded = true;//отметить, что комната построена
                
                Game.unfullRooms[room.name]=room;//поместить текущую комнату в список неполных
                Game.incompleateRoom = null;//и отметить, что неполной комнаты нет
            }
            
        }
    });
    
    socket.on('move', function (data) {
        
        if (Game.rooms[socket.id] == undefined) //если комната не определена, то выйти
        {
            var room=Game.rooms[Game.users[data.name].id];//комната игрока
            socket.me=Game.rooms[Game.users[data.name].id].ObjectDict[data.name];//Game.users[data.name];
            Game.users[data.name].id=socket.id;
            socket.me.id=socket.id;
            room.addClient(socket);
            socket.join(room.name);
            Game.rooms[socket.id] = room;
            
             io.sockets.in(Game.rooms[socket.id].name).emit('moving', { name: data.name, x: socket.me.X, y: socket.me.Y, aim: null, num: null });
            //socket.id=Game.users[data.name].id;
            return;
        }

        var dx = 0, dy = 0;
        
        var Obj = Game.rooms[socket.id].ObjectDict[data.name]; //объект, который движется
        if (Obj == undefined)
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
        
        if(Obj.X + dx>-1 && Obj.X + dx<Game.rooms[socket.id].Maze.length && Obj.Y + dy>-1 && Obj.Y + dy<Game.rooms[socket.id].Maze[0].length)
        {
            if(MayMove(Game.rooms[socket.id].Maze[Obj.X][Obj.Y], data.course))  //если ячейка лабиринта имеет путь в указанную сторону и ход не выходит за пределы
            {
                if (Game.rooms[socket.id].Positions[Obj.X + dx][Obj.Y + dy] == null || Game.rooms[socket.id].Positions[Obj.X + dx][Obj.Y + dy] == undefined)
                //если ячейка лабиринта, в которую запрашивается перемещение, пуста
                {
                    console.log("Место для движения "+ data.course+" свободно");
                    
                    if( Game.rooms[socket.id].PlacesPos[Obj.X+dx][Obj.Y+dy]==null) //если следующая ячейка - это не место
                    {
                        console.log("moving "+Game.rooms[socket.id].Positions[Obj.X + dx][Obj.Y + dy]);
                        io.sockets.in(Game.rooms[socket.id].name).emit('moving', { name: data.name, x: Obj.X+dx, y: Obj.Y+dy, aim: null, num: null }); //имя и вектор сдвига // { name: data.name, x: obj.X+ dx, y: obj.Y+dy });
            
                        console.log("obj.X="+ Obj.X+" obj.Y="+Obj.Y);
                        var posObj = Game.rooms[socket.id].Positions[Obj.X][Obj.Y];//старое значение объекта из старой позиции
                        
                        if(posObj==null)
                            posObj=ClientCopy(Obj);
                        
                        posObj.X = Obj.X + dx;
                        posObj.Y = Obj.Y + dy;
                        Game.rooms[socket.id].Positions[posObj.X][posObj.Y] = posObj;
                        Game.rooms[socket.id].Positions[Obj.X][Obj.Y] = null;
                        
                        if(posObj!==Obj)
                        {
                            Obj.X += dx;
                            Obj.Y += dy;
                        }
                    }
                    else //если следующая ячейка - это место
                    {
                        if(Game.rooms[socket.id].PlacesPos[Obj.X+dx][Obj.Y+dy].type=="portal") //если игрок сходил на портал
                        {
                            var portNum = Math.round(Math.random() * (Game.rooms[socket.id].Portals.length-1));
                            var aim="portal";
                            
                            if(Game.rooms[socket.id].Portals[portNum].X==Obj.X+dx && Game.rooms[socket.id].Portals[portNum].Y ==Obj.Y+dy)
                            {
                                portNum=null;
                                aim=null;
                            }
                            
                            io.sockets.in(Game.rooms[socket.id].name).emit('moving', { name: data.name, x: Obj.X+dx, y: Obj.Y+dy, aim: aim, num: portNum}); //имя и вектор 
                            console.log("portal "+Game.rooms[socket.id].Positions[Obj.X + dx][Obj.Y + dy]);
                            
                            Game.rooms[socket.id].Positions[Obj.X][Obj.Y] = null;
                            Obj.X += dx;
                            Obj.Y += dy;
                            
                            Game.rooms[socket.id].Positions[Obj.X][Obj.Y]=ClientCopy(Obj);
                        }
                        else if(Game.rooms[socket.id].PlacesPos[Obj.X+dx][Obj.Y+dy].type=="cp") //если игрок сходил на коммандную точку
                        {
                            var aim=null;
                            if(Game.rooms[socket.id].PlacesPos[Obj.X+dx][Obj.Y+dy].command==Obj.command) //если эта командная точка команды игрока
                                aim="cp";
                            
                            io.sockets.in(Game.rooms[socket.id].name).emit('moving', { name: data.name, x: Obj.X+dx, y: Obj.Y+dy, aim: aim}); //имя и вектор // {X:Obj.X, Y:Obj.Y}
                            console.log("cp "+Game.rooms[socket.id].Positions[Obj.X + dx][Obj.Y + dy]);
                            
                            Game.rooms[socket.id].Positions[Obj.X][Obj.Y] = null;
                            Obj.X += dx;
                            Obj.Y += dy;
                            
                            Game.rooms[socket.id].Positions[Obj.X][Obj.Y]=ClientCopy(Obj);
                        }
                        else if(Game.rooms[socket.id].PlacesPos[Obj.X+dx][Obj.Y+dy].type=="crystal") //если игрок сходил на кристалл
                        {
                            var aim="crystal";
                            var aimName=Game.rooms[socket.id].PlacesPos[Obj.X+dx][Obj.Y+dy].name;
                            
                            if(Game.rooms[socket.id].PlacesPos[Obj.X+dx][Obj.Y+dy].taker!=null || (Obj.burden!=null))//если этот кристалл уже кто-то поднял или игрок уже что-то несёт
                            {
                                aimName=null;
                                aim=null;
                            }
                            else if(Game.rooms[socket.id].PlacesPos[Obj.X][Obj.Y]!=null) // //если игрок сходил с кристалла
                            {
                                if(Game.rooms[socket.id].PlacesPos[Obj.X][Obj.Y].type=="crystal")
                                {
                                    aimName=null;
                                    aim=null;
                                }
                            }
                            
                            io.sockets.in(Game.rooms[socket.id].name).emit('moving', { name: data.name, x: Obj.X+dx, y: Obj.Y+dy, aim: aim, num: aimName}); //имя и вектор 
                            console.log("crystal "+Game.rooms[socket.id].Positions[Obj.X + dx][Obj.Y + dy]);
                            
                            Game.rooms[socket.id].Positions[Obj.X][Obj.Y] = null;
                            Obj.X += dx;
                            Obj.Y += dy;
                            
                            Game.rooms[socket.id].Positions[Obj.X][Obj.Y]=ClientCopy(Obj);
                        }
                    }
                }
                else { //если следующая ячейка занята
                    var forwardObj = Game.rooms[socket.id].Positions[Obj.X + dx][Obj.Y + dy];//объект, стоящий на пути
                    
                    var subObj=Game.rooms[socket.id].ObjectDict[forwardObj.name];
                    if(subObj!=forwardObj)
                    {
                        if(subObj!=null && subObj!=undefined)
                        {
                            if(subObj.type!="player")
                                delete Game.rooms[socket.id].ObjectDict[forwardObj.name];
                        }
                        forwardObj=null;
                        
                        socket.emit('moving', { name: data.name, x: Obj.X, y: Obj.Y });//отправить клиенту нулевой шаг
                        console.log("Исправление " + Obj.X + dx+ ' '+Obj.Y + dy + " "+data.course);
                        return;
                    }
                    
                    var aimNum = null;
                    var aim=null;
                    if( Game.rooms[socket.id].PlacesPos[Obj.X+dx][Obj.Y+dy]!=null) //если следующая ячейка - это место
                    {
                        if(Game.rooms[socket.id].PlacesPos[Obj.X+dx][Obj.Y+dy].type=="portal") //если игрок сходил на портал
                        {
                            aimNum = Math.round(Math.random() * (Game.rooms[socket.id].Portals.length-1));
                            aim="portal";
                            
                            if(Game.rooms[socket.id].Portals[aimNum].X==Obj.X+dx && Game.rooms[socket.id].Portals[aimNum].Y ==Obj.Y+dy)
                            {
                                aimNum=null;
                                aim=null;
                            }
                        }
                    }
                    
                    if(forwardObj.type=="rune") //если это руна мешает проходу
                    {
                        io.sockets.in(Game.rooms[socket.id].name).emit('moving', { name: data.name, x: Obj.X+dx, y: Obj.Y+dy, aim: aim, num: aimNum }); //имя и вектор сдвига игрока
                        
                        delete Game.rooms[socket.id].ObjectDict[forwardObj.name];//удалить уничтожаемый объект из словаря объектов
                        io.sockets.in(Game.rooms[socket.id].name).emit('destroy', forwardObj.name); //указать игрокам имя объекта для уничтожения
            
                        io.sockets.in(Game.rooms[socket.id].name).emit('score', { name: data.name, ds: 10 }); //на сколько изменилось количество очков игрока
                        
                        Game.rooms[socket.id].Positions[Obj.X][Obj.Y] = null;
                        Obj.X += dx;
                        Obj.Y += dy;
                        
                        Game.rooms[socket.id].Positions[Obj.X][Obj.Y]=ClientCopy(Obj);
                    }
                    else if(forwardObj.type=="crystal") //если на следующей ячейке кристалл
                    {
                        io.sockets.in(Game.rooms[socket.id].name).emit('moving', { name: data.name, x: Obj.X+dx, y: Obj.Y+dy, aim: aim, num: aimNum }); //имя и вектор сдвига игрока
                        
                        delete Game.rooms[socket.id].ObjectDict[forwardObj.name];//удалить уничтожаемый объект из словаря объектов
                        io.sockets.in(Game.rooms[socket.id].name).emit('destroy', forwardObj.name); //указать игрокам имя объекта для уничтожения
            
                        io.sockets.in(Game.rooms[socket.id].name).emit('score', { name: data.name, ds: 10 }); //на сколько изменилось количество очков игрока
                        
                        Game.rooms[socket.id].Positions[Obj.X][Obj.Y] = null;
                        Obj.X += dx;
                        Obj.Y += dy;
                        
                        Game.rooms[socket.id].Positions[Obj.X][Obj.Y]=ClientCopy(Obj);
                    }
                    else
                    {
                        socket.emit('moving', { name: data.name, x: Obj.X, y: Obj.Y });//отправить клиенту нулевой шаг
                        console.log("Место для движения " + data.course + " занято");
                        console.log(Game.rooms[socket.id].Positions[Obj.X + dx][Obj.Y + dy]);
                        console.log(Obj);
                    }
                }
        
            }
            else
            {
                socket.emit('moving', { name: data.name, x: Obj.X, y: Obj.Y });//отправить клиенту нулевой шаг
                console.log("Нет пути " + Game.rooms[socket.id].Positions[Obj.X][Obj.Y] + " "+data.course);
            }
        }
        else
        {
            socket.emit('moving', { name: data.name, x: Obj.X, y: Obj.Y });//отправить клиенту нулевой шаг
            console.log("Шаг за пределы " + Obj.X+ ' '+Obj.Y + " "+data.course);
        }

    });
    
    socket.on('portate', function (data) {
        
        if (Game.rooms[socket.id] == undefined) //если комната не определена, то выйти
        {
            return;
        }
        
        var Obj = Game.rooms[socket.id].ObjectDict[data.name];
        
        var portal = Game.rooms[socket.id].Portals[data.num];
        
        if(Obj.X!=portal.X || Obj.Y!=portal.Y)
        {
            //Game.rooms[socket.id].Positions[portal.X][portal.Y] = Obj;
            Game.rooms[socket.id].Positions[Obj.X][Obj.Y] = null;
            Obj.X = portal.X;
            Obj.Y = portal.Y;
            
            if(Game.rooms[socket.id].Positions[Obj.X][Obj.Y]!=null)//если портал, на который перемещается игрок, не пуст
            {
                if(Game.rooms[socket.id].Positions[Obj.X][Obj.Y].type=="rune") //если целевой телепорт занят руной
                {
                    delete Game.rooms[socket.id].ObjectDict[Game.rooms[socket.id].Positions[Obj.X][Obj.Y].name];//удалить объект на телепорте из словаря объектов
                    io.sockets.in(Game.rooms[socket.id].name).emit('destroy', Game.rooms[socket.id].Positions[Obj.X][Obj.Y].name); //указать игрокам имя объекта для уничтожения
                    io.sockets.in(Game.rooms[socket.id].name).emit('score', { name: Obj.name, ds: 10 }); //на сколько изменилось количество очков игрока
                }
            }
            
            Game.rooms[socket.id].Positions[Obj.X][Obj.Y]=ClientCopy(Obj);
            
            io.sockets.in(Game.rooms[socket.id].name).emit('porting', { name: data.name, x: portal.X, y: portal.Y });
            console.log("Porting "+Obj.X +' '+Obj.Y);
        }
    });
    
    socket.on('take', function (data) {
        
        if (Game.rooms[socket.id] == undefined) //если комната не определена, то выйти
        {
            return;
        }
        
        Game.rooms[socket.id].ObjectDict[data.obj].taker=data.name;
        Game.rooms[socket.id].ObjectDict[data.name].burden=data.obj;
        
        io.sockets.in(Game.rooms[socket.id].name).emit('taking', { name: data.name, objname: data.obj });
        console.log("Taking "+data.obj);
    });
    
    // поместить кристалл в командную точку
    socket.on('deposit', function (name) {
        
        if (Game.rooms[socket.id] == undefined) //если комната не определена, то выйти
        {
            return;
        }
        
        var burdenName=Game.rooms[socket.id].ObjectDict[name].burden;
        if(burdenName!=null)//если игрок что-то нёс
        {
            var burden= Game.rooms[socket.id].ObjectDict[burdenName];
            
            var score=300;
            if(burden.command!=Game.rooms[socket.id].ObjectDict[name].command) //если игрок взял кристалл другой команды
            {
                score/=2; //уменьшить вдвое очки за кристалл
            }
        
            io.sockets.in(Game.rooms[socket.id].name).emit('deposition', { name: name, burden: burdenName });
            console.log("Deposition "+burden);
            
            io.sockets.in(Game.rooms[socket.id].name).emit('score', { name: name, ds: score }); //на сколько изменилось количество очков игрока
            
            Game.rooms[socket.id].ObjectDict[name].burden=null;//у игрока больше нет ноши
            
            Game.rooms[socket.id].PlacesPos[burden.X][burden.Y] = null;
            delete Game.rooms[socket.id].ObjectDict[burdenName];
        }
    });
    
    
    // //для синхронизации положения объекта с сервером
    // socket.on('syncpos', function (data) {
        
    //     if (Game.rooms[socket.id] == undefined) //если комната не определена, то выйти
    //     {
    //         return;
    //     }
        
    //     var syncObj = Game.rooms[socket.id].ObjectDict[data.name];
        
    //     if(syncObj.X!=data.x && syncObj.Y!=data.y)
    //     {
    //         Game.rooms[socket.id].Positions[syncObj.X][syncObj.Y] = null;
    //         Game.rooms[socket.id].Positions[data.X][data.Y] = syncObj;
    //         syncObj.X=data.X;
    //         syncObj.Y=data.Y;
        
    //         io.sockets.in(Game.rooms[socket.id].name).emit('syncing', { name: data.name, x: data.X, y: data.Y });
    //     }
    // });
    
    
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
            var userId = Game.users.indexOf(socket);
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
                
                if(obj.type=="player") {
                    if(obj.burden!=null)//если игрок что-то нёс
                    {
                        var burdenName=obj.burden;
                        var burden = Game.rooms[socket.id].ObjectDict[burdenName];
                        //var takerName = burden.taker;
                        
                        var X = obj.X;
                        var Y = obj.Y;
                        while( Game.rooms[socket.id].PlacesPos[X][Y]!=null)
                        {
                            X = Math.round(Math.random() *( Game.rooms[socket.id].Maze.length - 1));
                            Y = Math.round(Math.random() *( Game.rooms[socket.id].Maze[0].length - 1));
                        }
                        io.sockets.in(Game.rooms[socket.id].name).emit('putting', { burden: burdenName, X: X, Y: Y });
                        
                        Game.rooms[socket.id].PlacesPos[burden.X][burden.Y] = null;
                        burden.X = X;
                        burden.Y = Y;
                        Game.rooms[socket.id].PlacesPos[burden.X][burden.Y]=ClientCopy(burden);
                        
                        console.log("Putting "+data.obj);
                    }
                    
                    delete Game.rooms[socket.id].clients[socket.id];//удалить объект из списка клиентов в комнате
                     
                    if (!Game.rooms[socket.id].hasMinClients()) {  //если в неполной комнате не заполнено минимальное количество мест
                        Game.incompleateRoom=Game.rooms[socket.id];
                    }
                }
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
