var util = require('util'), EventEmitter = require('events').EventEmitter;

var Labyquest = module.exports.Labyquest = function () {

    
    //this.games = [];// Массив [id игры = объект игры]
    
    this.users = [];// Массив [подключённых пользователей = id игры]
    
    this.free = [];// Массив пользователей, ожидающих оппонентов для начало игры
    
    // Размеры поля
    this.x = 30;
    this.y = 30;

    // Время на игру (минуты)
    this.stepsToWin = 4;
    

    /////
    this.rooms = {};
    this.incompleateRoom = null;

    //this.generateMaze = function (rows, columns) {
    //    return GenerateMaze(rows, columns);
    //}
}
util.inherits(Labyquest, EventEmitter);



var Room = module.exports.Room = function (name) {

    EventEmitter.call(this);// Инициализируем события
    

    this.Maze = null;
    this.Positions = [];//позиции игроков и предметов в лабиринте //служит для проверки, занята ли ячейка лабиринта
    this.ObjectDict = {};//словарь объектов //по названию объекта возвращает объект с его координатами и прочей хренью
    this.MaxClientCount = 20;
    this.name = name;
    this.clients = [] ///var clients = this.clients = []
    
    //this.addClient = function (client) {
    //    if (clients.length < 2)
    //        clients.push(client);
    //};
    
    this.hasPlace = function () {        
        return this.clients.length < this.MaxClientCount;
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
    if (this.clients.length < 2)
        this.clients.push(client);
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


module.exports.startGameContent = ' <div class="me-field" id="mazefield"> '+
'        < div class="maze" id="maze"></div></div>'+
'<div class="me-field" id="me-field">'+

'<div class="right-panel">'+
'<div class="demo">'+
'<a class="permalink" href="http://www.itlessons.info/nodejs/simple-chat-with-nodejs-and-socket-io/">← cсылка на статью</a>'+

'<h1>LabyQuest</h1>'+

'<button id="reload">Новая игра</button>'+
'<div id="stats" class="ui-widget" valign="top"></div>'+
'<hr />'+

'<table>'+
'<tr>'+
'<td id="board" class="ui-widget" valign="top">'+
'<div id="masked" class="ui-widget-shadow ui-corner-all ui-widget-overlay"></div>'+
'<div id="timerpanel">'+
'Время до конца хода:'+
'<span id="timer">15</span> сек.'+
'</div>'+
'<table class="ui-widget ui-corner-all" cellpadding="0" cellspacing="0" align="left" id="board-table"></table>'+
'</td>'+
'</tr>'+
'</table>'+

'<div class="chat">'+
'<div class="messages" id="messages"></div>'+

'<div class="panel">'+
'<span class="nick"></span>'+
'<input type="text" name="message_text" id="message_text">'+
'<button type="button" id="message_btn">Отправить</button>'+
'</div>'+
'</div>'+
'</div>'+
'</div>'+

'</div>'


