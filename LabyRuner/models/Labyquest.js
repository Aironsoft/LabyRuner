var util = require('util'), EventEmitter = require('events').EventEmitter;

var Labyquest = module.exports = function () {

    //this.games = [];// Массив [id игры = объект игры]
    
    this.users = [];// Массив [подключённых пользователей = id игры]
    
    this.free = [];// Массив пользователей, ожидающих оппонентов для начало игры
    
    // Размеры поля
    this.x = 30;
    this.y = 30;
    
    this.maxSize=100;
    this.minSise=5

    // Время на игру (минуты)
    this.stepsToWin = 4;
    

    /////
    this.rooms = {};//по socket.id возвращает комнату
    
    this.unfullRooms = {};//по room.name возвращает комнату
    this.fullRooms = {};//по room.name возвращает комнату
    
    this.incompleateRoom = null;

    //this.generateMaze = function (rows, columns) {
    //    return GenerateMaze(rows, columns);
    //}
}
util.inherits(Labyquest, EventEmitter);



var Room = module.exports = function (name) {

    EventEmitter.call(this);// Инициализируем события
    
    //this.isRunning = false;
    this.isBuilded = false;
    
    this.remainingTime=180;
    
    this.Maze = null;
    this.Positions = [];//позиции игроков и предметов в лабиринте //служит для проверки, занята ли ячейка лабиринта
    this.ObjectDict = {};//словарь объектов //по названию объекта возвращает объект с его координатами и прочей хренью
    //this.TeleportDict = {};//словарь телепортов //по названию телепорта возвращает телепорт с его координатами и прочей хренью
    
    this.PlacesPos = [];
    this.Portals = [];
    this.Commands = [];//по названию команды игроков возвращает её численность

    this.MinClientCounts=2;//минимальное количество клиентов для начала игры
    this.MaxClientCounts=8;//максимальное количество клиентов в комнате

    this.name = name;
    var clients = this.clients = {};  // clients[client.id]=client
    //this.maxCommandCount=0;//численность самой большой команды
    
    
    //this.addClient = function (client) {
    //    if (clients.length < 2)
    //        clients.push(client);
    //};
    
    this.hasMinClients = function () {        
        return Object.keys(this.clients).length >= this.MinClientCounts;
    }
    
    this.hasFreePlace = function () {        
        return Object.keys(this.clients).length < this.MaxClientCounts;
    }
}
util.inherits(Room, EventEmitter);


/**
 * Запускаем игру
 */
Labyquest.prototype.start = function () {
    
    if (this.incompleateRoom === null)
        this.incompleateRoom = new Room("комната" + (Math.round(Math.random() * 10000)));
    
}


/**
 * Добавляет клиента в комнату
 */
Room.prototype.addClient = function (client) {
    if (Object.keys(this.clients).length < this.MaxClientCounts)
        this.clients[client.id]=client;
}


/**
 * Выбирает команду для игрока
 *
 */
Room.prototype.gamerAllocation = function (gamer) {
    if(this.Commands.length==0)//если массив комманд пуст, то добавить две пустых команды
    {
        this.Commands[0]={id: 0, name: "Красная", command: 0, type: "cp", count: 0, score: 0, X: -1, Y: -1 };
        this.Commands[1]={id: 1, name: "Зелёная", command: 1, type: "cp", count: 0, score: 0, X: -1, Y: -1 };
    }
    
    if(gamer.command>=0)
        this.Commands[gamer.command].count--;
    
    var selectedCommand=-1;
    var minCount=this.MaxClientCounts;
    for(var i=0; i<this.Commands.length; i++)
    {
        if(this.Commands[i].count<minCount)
        {
            minCount=this.Commands[i].count;
            selectedCommand=i;
        }
    }
    
    this.Commands[selectedCommand].count++;
    
    return selectedCommand;
}


//////////

var Point = function () // (rows, columns)
{
    this.X = -1;
    this.Y = -1;
}
util.inherits(Point, EventEmitter);


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
util.inherits(Cell, EventEmitter);


//function mazeArray(rows, columns) {
//    var arr = new Array();
//    for (var i = 0; i < columns; i++) { //сначала задаются столбцы
//        arr[i] = new Array();
//        for (var j = 0; j < rows; j++)
//            var cell = { is_blocked: false, north: false, west: false, south: false, east: false, has_way: false};
//            arr[i][j] = cell;
//        }
//    }
//    return arr;
//}


//Labyquest.prototype.GenerateMaze = function (rows, columns) {
    
//    EventEmitter.call(this);// Инициализируем события
//}