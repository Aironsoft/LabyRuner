$(document).ready(function () {
    var socket = io.connect('http://localhost:8008');
    var name = 'Игрок_' + (Math.round(Math.random() * 10000));
    var messages = $("#messages");
    var message_txt = null;
    var room = null;    
    var Maze = null;
    var player = null;
    var enemy = null;
    var idPrefix = "id"
    var downButton = 0;
    var width = 7;
    var height = 7;

    
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
        
        var l = '<div class="grid"></div>';

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

        var maze = $("#maze");
        maze
                        .addClass("large")// добавим этой копии класс newElement
                        .append(l)
                        .scrollTop(messages[0].scrollHeight);
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
        socket.emit('req_room', '');
        msg_system('Соединение...');
    });
    
    socket.on('connect', function () {
               
    });
    
    
    
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
        msg_system('Лабиринт получен');
        buildMaze(data);
    });
    
    //координаты игрока
    socket.on('self_spawn', function (data) {
        player = data;
        msg_system('spawn self');
        onMoveUpdate(null, data);
    });
    
    //координаты врага
    socket.on('enemy_spawn', function (data) {
        enemy = data;
        msg_system('spawn self');
        onMoveUpdate(null, data);
    });
    
    
   
    //координаты игроков
    socket.on('self_move', function (data) {
        onMoveUpdate(player, data);
        player = data;
    });
    
    //координаты игроков
    socket.on('enemy_move', function (data) {
        onMoveUpdate(enemy, data);
        enemy = data
    });

    
    // Статистика
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
        var dx=0, dy=0;
        switch ( downButton ) { 
            case 37:
                if (verify(-1, 0, player))
                    dx = -1;
                break;
            case 38:
                if (verify(0, -1, player))
                    dy = -1;
                break;
            case 39:
                if (verify(1, 0, player))
                    dx = 1;
                break;
            case 40:
                if (verify(0, 1, player))
                    dy = 1;
                break;
            default: break;

        }
        if (dx || dy) {
            sendMove(player["x"] + dy, player["y"] + dx);
            setTimeout(buttonDownIteration, 100);
        }

    }
    
    function verify(dx, dy, data) {
        var x = data["x"] + dx;
        var y = data["y"] + dy;
        var res = 0 <= x && x < width && 0 <= y && y < height
        cell = Maze[data["x"]][data["y"]];
        return res;// && (dx > 0 && cell.east || dx < 0 && cell.west || dy > 0 && cell.south || dy < 0 && cell.north);
    }
    
    function sendMove(x, y){
        socket.emit("moving", { 'x': x, 'y': y });
    }

    
    
    function safe(str) {
        return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }

    function onMoveUpdate(oldPosition, newPosition) {
        


        var cell = null;
        var newClassNames = "";
        var classNames;
         
        if (oldPosition) {
            classNames = (cell = $('#' + idPrefix + oldPosition['x'] + 'x' + oldPosition['y']))
            .attr("class")
            .split(' ');
        
            classNames.filter(function (elem) {return (elem && elem !== 'cursor'); });
        
            cell.attr('class', classNames.join(" "));
        }
        classNames = (cell = $('#' + idPrefix + newPosition['x'] + 'x' + newPosition['y']))
        .attr("class") 
        .split(' ');
        classNames.filter(function (elem) { return (elem && elem !== 'cursor'); });
        classNames.push("cursor");
        
        cell.attr('class', classNames.join(" "));

    }

});