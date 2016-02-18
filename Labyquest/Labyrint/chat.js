$(document).ready(function () {
    var socket = io.connect('http://localhost:8008');
    var name = 'Игрок_' + (Math.round(Math.random() * 10000));
    var messages = $("#messages");
    var message_txt = null;
    var room = null;    
    var Maze = null;

    
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
    
    
    function safe(str) {
        return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }
});