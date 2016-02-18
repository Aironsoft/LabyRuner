var util = require('util'), EventEmitter = require('events').EventEmitter;

var Labyquest = module.exports = function () {

    
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



var Room = module.exports = function (name) {

    EventEmitter.call(this);// Инициализируем события

    this.name = name;
    var clients = this.clients = [] ///var clients = this.clients = []
    
    //this.addClient = function (client) {
    //    if (clients.length < 2)
    //        clients.push(client);
    //};
    
    this.hasPlace = function () {        
        return this.clients.length < 2;
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
 * Сделан ход
 */
Room.prototype.addClient = function (client) {
    if (this.clients.length < 2)
        this.clients.push(client);
}


//////////

var Point = function () // (rows, columns)
{
    //this.rows = rows;
    //this.columns = columns;
    
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


function mazeArray(rows, columns) {
    var arr = new Array();
    for (var i = 0; i < columns; i++) { //сначала задаются столбцы
        arr[i] = new Array();
        for (var j = 0; j < rows; j++) {
            arr[i][j] = new Cell(false);
        }
    }
    return arr;
}


Labyquest.prototype.GenerateMaze = function (rows, columns) {
    
    EventEmitter.call(this);// Инициализируем события
    
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
}