//var terrain = require(terrain.js);
var express = require('express');
var ss = require('./serverSettings');
var mf = require('./myFunctions');
var app = express();
var server = app.listen(3000);
//var gs = require('./public/gameSettings');
app.use(express.static('public'));

var p = console.log;//this is for debuging

//p('server is running');

//generate terain:
var terrain = require('./getTerrain');
var papers = Array(ss.numberPaper).fill().map( (_,idx)=>{
    return [mf.rand(0, ss.mapX),mf.rand(0, ss.mapY), idx];
  });

var socket = require('socket.io');
var io = socket(server);


var squirtSpeed = 50;
var heartRate = ss.heartRate;
setInterval(heartbeat, heartRate);
setInterval(dropSlime, heartRate);//squirtSpeed

class Player {
    constructor(id, x, y, name, color, r) {
        this.score = 0;
        this.r = r;
        this.c = color;
        this.name = name;
        this.id = id;
        this.x = x;
        this.y = y;
        this.marked = false;
    }
}



var players = {};
var scores = {};
var numPlayers = ()=> Object.keys(players).length;
var slime = {};
var sprays = {};
var slimeLength = 50;//TODO add this to gs later

function dropSlime(){//this function is called every x seconds
    Object.keys(players).forEach( (key) => {
        let p = players[key];
        slime[ [p.x,p.y, p.id] ] = slimeLength;
    });
    Object.keys(slime).forEach((key)=>{
        s = slime[key];
        s -= 1;
        if(s == 0){
            delete slime[key];
        }
        else{
            slime[key] = s;
        }
    });
}

function heartbeat(){
    data = {
    'players': players,
    'papers': papers,
    //'scores': scores,
    'slime': slime,
    'spray': sprays
    };
    io.sockets.emit('heartbeat', data);
}

io.sockets.on('connection', newConnection);

function newConnection(socket){
    
    socket.on('joinRequest', playerJoined);//join request
    function playerJoined(data){//player color and name
        var newPlayer = new Player(socket.id, mf.rand(10,100), mf.rand(10,100), data.name, data.color, ss.playerSize);
        players[socket.id] = newPlayer;
        data = {'walls': terrain, 'papers': papers,
                'id': socket.id,
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
        if(pid == socket.id && players[pid]){//if the player id is the socket sending, and pid is valid
            players[pid].x = data.x;
            players[pid].y = data.y;
            players[pid].marked = data.marked;
            if(data.spray[0] != -1){
                sprays[pid] = data.spray;
            } 
        }
        //p(pid, px, py);
        //p(players[pid]);
    }

    socket.on('scored', scored);
    function scored(data){
        console.log('scored');
        players[socket.id].score += 1;
        newPaper = [mf.rand(0, ss.mapX),mf.rand(0, ss.mapY),data.paperid]
        papers[data.paperid] = newPaper;
    }
    
    socket.on('deleteSpray', deleteSpray);
    function deleteSpray(data){
        delete sprays[data.sprayId];
    }

    var sprayHealedDict = {};
    socket.on('healed', healed);
    function healed(data){//if this function is called it's a given that the player is on a spray that's not his
        let healer = players[data.healer];
        let healed = players[socket.id];
        if(healed && healer && !sprayHealedDict[healer.id]){//if we haven't set up the
            sprayHealedDict[healer.id] = [];
        }//assume list must then be set up
        
        if(healed && healer && !(sprayHealedDict[healer.id].find(id => id == healed.id)) ){//he is not in the list yet so has not been healed
            players[data.healer].score += 15;
            sprayHealedDict[healer.id].push(healed.id);
            listHealed = sprayHealedDict[healer.id];
            listHealed.push(healed.id);
            console.log(sprayHealedDict);
            p(healer.name +' healed ' + healed.name);
        }
    }

    socket.on('disconnect', disconnect); 
    function disconnect(){
        io.sockets.emit('playerDeath', socket.id);
        delete players[socket.id];
        p('disconnect:', socket.id, 'pcount: ', numPlayers());

    }

    
}
