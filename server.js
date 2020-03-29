//var terrain = require(terrain.js);
var express = require('express');
var ss = require('./serverSettings');
var mf = require('./myFunctions');
var app = express();
var server = app.listen(3002);
//var gs = require('./public/gameSettings');
app.use(express.static('public'));

var p = console.log;//this is for debuging

//p('server is running');

//generate terain:
var terrain = require('./getTerrain');

var socket = require('socket.io');
var io = socket(server);

var heartRate = ss.heartRate;
setInterval(heartbeat, heartRate);

class Player {
    constructor(id, x, y, name, color, r) {
        this.r = r;
        this.c = color;
        this.name = name;
        this.id = id;
        this.x = x;
        this.y = y;
    }
}

var players = {};
var numPlayers = ()=> Object.keys(players).length;
function heartbeat(){
    data = {
    'players': players,
    //'walls': terrain
    };
    io.sockets.emit('heartbeat', data);
}

io.sockets.on('connection', newConnection);

function newConnection(socket){
    
    socket.on('joinRequest', playerJoined);//join request
    function playerJoined(data){//player color and name
        var newPlayer = new Player(socket.id, mf.rand(10,100), mf.rand(10,100), data.name, data.color, ss.playerSize);
        players[socket.id] = newPlayer;
        data = {'walls': terrain, 'id': socket.id,
                'x': newPlayer.x, 'y': newPlayer.y,
                'name': newPlayer.name, 'c': newPlayer.c
        };
        io.sockets.emit('joined', data);
        p('new connection ' + socket.id);
    }

    //tick by tick update function
    socket.on('playerUpdate', update);
    function update(data){
        let pid = data.id;
        if(pid == socket.id && players[pid]){
            players[pid].x = data.x;
            players[pid].y = data.y;    
        }
        //p(pid, px, py);
        //p(players[pid]);
    }

    socket.on('disconnect', disconnect); 
    function disconnect(){
        delete players[socket.id];
        p('disconnect:', socket.id, 'pcount: ', numPlayers());

    }

    
}
