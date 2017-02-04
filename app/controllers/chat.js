/**
 * Created by frederickmacgregor on 11/01/2017.
 */
"use strict";

var Watson = require('./watsonChat'),
    Attack = require('./attack.controller'),
    GameServer = require('./game_server.server.js');

var messages = [

];

module.exports = function(io, client) {

    socket.emit('existing messages', {messages: messages});


    socket.on('new message', function (data) {
        console.log('new message data', data);
        // we tell the client to execute 'new message'

        if(data.message.includes('watson') || data.message.includes('Watson')){
            console.log('watson question detected');
            Watson.passToWatson({text: data.message, context: null}, function(err, result){
                var msgs;
                if (result.raw.intents[0].intent === 'missedevents'){
                    console.log('missed events intent');
                    var player = GameServer.getPlayerEntity(socket.username);
                    var dateFrom = new Date();
                    dateFrom.setTime(dateFrom.getTime() - 3600000*4);
                    Attack.getRecentAttacks({
                        dateFrom : dateFrom,
                        username: socket.username,
                        gameId : data.gameId
                    },function(err, result){
                        if(err){
                            return console.log(err);
                        }

                        if(result.length){
                            console.log('result: ', result);
                            msgs = Attack.formatAsMessages(result, socket.username);
                            console.log('emitting messages all messages', msgs);
                            socket.emit('all messages', {messages:msgs});
                        }else{
                            socket.emit('new message', {username: 'Watson', message: "Nothing relvant to you has occured, " + socket.username});
                        }

                    } );

                }else{
                    io.emit('new message', {message: result.chatResponse, username: 'Watson', context: result.context});
                }
            });
        }

        messages.push({username: socket.username,
            message: data.message});
        socket.broadcast.emit('new message', {
            username: socket.username,
            message: data.message
        });
    });

    // when the client emits 'add user', this listens and executes


    // when the client emits 'typing', we broadcast it to others
    socket.on('typing', function () {
        socket.broadcast.emit('typing', {
            username: socket.username
        });
    });

    // when the client emits 'stop typing', we broadcast it to others
    socket.on('stop typing', function () {
        socket.broadcast.emit('stop typing', {
            username: socket.username
        });
    });

    socket.on('chat opened', function(){
        console.log('chat opened');
        socket.emit('all messages', {messages: messages})
    });

};