$(document).ready(function () {
    var socket = io.connect('http://localhost:8008');
    var name = 'Игрок_' + (Math.round(Math.random() * 10000));
    var messages = $("#messages");
    var body = $("body");
    var mazefield = $("#mazefield");
    var meField = $("#me-field")
    var maze = null;
    var message_txt = null;
    var cellSideSize = 1;//размер стороны ячейки
    var room = null;    
    var Maze = null;
    var Positions = null;//положения объектов в лабиринте
    var ObjectDict = {};//словарь объектов //по названию объекта возвращает объект с его координатами и прочей хренью
    var Me = null;
    var me = null;
    var enemy = null;
    var idPrefix = "id"
    var downButton = 0;
    var width = 0;
    var height = 0;

    
    $('.chat .nick').text(name);
    
    function msg(nick, message) {
        var m = '<div class="msg">' +
                        '<span class="user">' + safe(nick) + ':</span> ' 
                        + safe(message) +
                        '</div>';
        messages
                        .append(m)
                        .scrollTop(messages[0].scrollHeight);
    }
    
    function msg_system(message) {
        var m = '<div class="msg system">' + safe(message) + '</div>';
        messages
                        .append(m)
                        .scrollTop(messages[0].scrollHeight);
    }
    
    
    function buildMaze(data) {
        
        height = data.length
        width = data[0].length

        var m = '<div class="msg system">'+data.length + '</div>';
        
        var l = '<div class="grid" id="grid"></div>';

        for (var i = 0; i < data.length; i++) { //сначала задаются строки
            
            var row = '<div class="row" id="row_' + i + '">';

            for (var j = 0; j < data[0].length; j++) {
                var cell = '<div id="'+ idPrefix + j + "x" + i + '" class="cell'; //* class="cell
                if (data[i][j].has_way)
                    cell += ' in';
                if (data[i][j].north)
                    cell += ' n';
                if (data[i][j].west)
                    cell += ' w';
                if (data[i][j].south)
                    cell += ' s';
                if (data[i][j].east)
                    cell += ' e';
                
                cell += '"></div>';

                row += cell;
            }

            row += '</div>'

            l += row;
        }

        maze = $("#maze");
        maze
                        .addClass("large")// добавим этой копии класс newElement
                        .append(l)
                        .scrollTop(messages[0].scrollHeight);
    }
    
    
    function quickMoveMe()
    {
        $("#mazefield").animate({ 'left': Me.posX - Me.X * cellSideSize, 'top': Me.posY - Me.Y * cellSideSize }, 50, function () { });//сдвиг лабиринта для его правильной позиции относительно позиции игрока
    }
    
    function stepMoveMe() {
        $("#mazefield").animate({ 'left': Me.posX - Me.X * cellSideSize, 'top': Me.posY - Me.Y * cellSideSize }, 500, function () { });//сдвиг лабиринта для его правильной позиции относительно позиции игрока
    }
    
    function stepMoveObject(name, X, Y) {
        $("#"+ name).animate({ 'left': X * cellSideSize, 'top': Y * cellSideSize }, 500, function () { });//сдвиг объекта относительно лабиринта
    }

    
    function createMe() {
        var l = '<div class="me" id="me" margin-left="46vmax">';
        l += '<div class="ball" background-color="'+Me.color+'"></div>'
        l += '</div>'
        meField
            .append(l);
        var m = $("#me");
        Me.posX = m[0].offsetLeft;
        Me.posY = m[0].offsetTop;

        cellSideSize = $("#row_0")[0].clientWidth;
        
        quickMoveMe();
    }
    
    function createObject(object) {
        var l = '<div class="object" id="'+ object.name+'">';
        l += '<div class="ball" background-color="' + object.color + '"></div>'
        l += '</div>'
        mazefield
            .append(l);
        var o = $("#"+ object.name);
        o[0].offsetLeft= object.X * cellSideSize;
        o[0].offsetTop = object.Y * cellSideSize;
    }

    
    function buildObjects(data) {
        for ( var key in data) {
            if (key == name) {
                Me = data[key];
                createMe();
            }
            else {
                createObject(data[key]);
            }
        }
        Positions[Me.X][Me.Y] = null;//удалить себя из массива позиций
        ObjectDict.Remove(Me.name);//удалить себя из словаря объектов
    }



    
    socket.on('stats', function (arr) {
        var stats = $('#stats');
        stats.find('div').not('.turn').remove();
        //for (val in arr) {
        //    stats.prepend($('<div/>').attr('class', 'ui-state-hover ui-corner-all').html(arr[val]));
        //}
        
        var m = '<div class="msg">' +
                    '<span class="user">' + arr[0] + '.</span> ' 
                        + arr[1] + '.</span> ' 
                        + arr[2] + '.</span> ' 
                        + arr[3] + '.' 
                        + '</div>';
        stats
                    .append(m)
    });

    
    socket.on('connecting', function () {
        socket.emit('req_room', name);
        msg_system('Соединение...');
    });
    
    //socket.on('connect', function () {
               
    //});
    
    
    
    socket.on('message', function (data) {
        msg(data.name, data.message);
        message_txt.focus();
    });
    
    socket.on('room', function (data) {
        room = data;
        msg_system('Вы подключены к комнате «'+ room +'»!');
    });
    
    socket.on('compleate_room', function (data) {
        msg_system('Соединение установлено!');
        
        $('#chatDiv').append(' <div class="panel">' +
                '<span class="nick"></span> <input type="text" name="message_text" id="message_text">' +
                '<button type="button" id="message_btn">Отправить</button>' +
                '</div>').scrollTop(messages[0].scrollHeight);
        
        message_txt = $("#message_text");
        
        $("#message_btn").click(function () {
            var text = $("#message_text").val();
            if (text.length <= 0)
                return;
            message_txt.val("");
            socket.emit("message", { message: text, name: name });
        });
                                
    });
    
    
    //Получен лабиринт
    socket.on('maze', function (data) {
        Maze = data;
        Maze.w = Maze.length;//ширина лабиринта
        Maze.l = Maze[0].length;//длина лабиринта
        msg_system('Лабиринт получен');
        buildMaze(data);
    });
    
    //Получены позиции
    socket.on('positions', function (data) {
        Positions = data;
        msg_system('Позиции получены');
        //buildObjects(data);
    });
    
    //Объекты позиции
    socket.on('objects', function (data) {
        ObjectDict = data;
        msg_system('Объекты получены');
        buildObjects(data);
    });
    
    
    //От сервера пришло движение объекта
    socket.on('moving', function (data) {
        if (data.name == Me.name) { //если пришло собственное движение
            msg_system('Пришло своё движение x='+ data.x+' y='+ data.y);
            Me.X = data.x;
            Me.Y = data.y;
            stepMoveMe();
        }
        else {
            var obj = ObjectDict[data.name];
            Positions[data.x][data.y] = Positions[obj.x][obj.y];
            Positions[obj.x][obj.y] = null;
            obj.x = data.x;
            obj.y = data.y;
            stepMoveObject(data.name, data.x, data.y)
        }
    });

    
    // Статистика
    socket.on('stats', function (arr) {
        var stats = $('#stats');
        stats.find('div').not('.turn').remove();
    
        var m = '<div class="msg">' +
                    '<span class="user">' + arr[0] + '.</span> ' 
                        + arr[1] + '.</span> ' 
                        + arr[2] + '.</span> ' 
                        + arr[3] + '.'
                        + '</div>';
        stats
                    .append(m)
    });
    
    $(document).keyup(function (e) {
        if (e.keyCode === downButton) {
            downButton = 0;
        }
        
    });
    
    $(document).keydown(function (e) {
        if (e.keyCode <= 40 && e.keyCode >= 37) {
            downButton = e.keyCode;
        }
        buttonDownIteration();
    });
    
   
    
    function buttonDownIteration() {
        
        if (!downButton)
            return;
        //var dx = 0, dy = 0;
        var course = null;//направление движения

        switch ( downButton ) { 
            case 37:
                course = "w";
                break;
            case 38:
                course = "n";
                break;
            case 39:
                course = "e";
                break;
            case 40:
                course = "s";
                break;
            default: break;

        }
        if (verifyStep(course)) {
            msg_system('Отправлено своё движение');
            socket.emit("moving", { name: Me.name, course: course });
            setTimeout(buttonDownIteration, 200);
        }

    }
    
    function verifyStep(course) {
        switch (course) { 
            case "w":
                return Maze[Me.X][Me.Y].west;
            case "n":
                return Maze[Me.X][Me.Y].north;
            case "e":
                return Maze[Me.X][Me.Y].east;
            case "s":
                return Maze[Me.X][Me.Y].south;
        }
        return false;
    }

    
    function safe(str) {
        return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }

});