var debug = false;
var socket;
var gs = gameSettings;

var keyboard = new THREEx.KeyboardState();

if(debug){
  gs.lerpConst = .5;
  gs.zoomScale = 3;
  gs.speed = 2;
}

function rand(min,max){
  return Math.floor((Math.random() * max) + min);
}

function player(x, y, name, c){
  this.r = gs.playerSize;
	this.c = c;//color 
  this.name = name;
  //this.id = id;
  this.x = x;
  this.y = y;

  this.getData = ()=> {//ease of use function returning object data in json
    return{
      r: this.playerSize,
      c: this.c,//color
      name: this.name,
      //id: this.id,
      x: this.x,
      y: this.y
    }
  }//end getData
}

class MyPlayer {
  constructor(id,
     x = 0,
     y = 0,
     name = 0
     ){//end constructor
    this.x_dir = 0;
    this.y_dir = 0;
    this.input = [];
    this.client_has_input = false;
    this.c = gs.defaultColor;//this gets a random hex value in the color range
    this.name = name;
    this.id = id;
    this.x = x;
    this.y = y;
    this.marked = false;
    this.health = 200;
    this.canSpray = true;
    this.spray = [-1,-1];
    this.alive = true;
  }
}

function enterGame(){
  let name = input.value().substring(0,9);
  let color = '#'+(Math.random()*0xFFFFFF<<0).toString(16); 
  data = {'name': name, 'color': color};
	socket.emit('joinRequest', data);//join request

	greeting.remove();
	button.remove();
	input.remove();
	p2.remove();
}

function drawLeaderBoard(){
  var Table = document.getElementById("leaderboard");
  Table.innerHTML = "";
  scoreBoard.forEach((s)=>{
    let name = s[0];
    let score = s[1];
    let row = document.getElementById('leaderboard').insertRow(0);
    let cell = row.insertCell(0);
    cell.innerHTML = name + ': ' + score;
  });
}

function drawBlobs(blobs){
  fill(color('green'));
  blobs.forEach( (b) => {
    r = Math.floor((Math.random() * 30) + 3);
    ellipse(b.p1[0],b.p1[1],r,r);
    ellipse(b.p2[0],b.p2[1],r,r);
    //ellipse(b[0],b[1],r,r);//this line is for drawing blob at paper if paper is passed in params
  });
}

function drawField(){//draws the playing field aka boundery
  fill(255,255,255,50);
  //rect(0,0, gs.mapX, gs.mapY);
  rect(0,0, gs.mapX, gs.mapY);
  //rect(5, 5, 50, 50);
}

function drawWalls(walls){
  fill(color('green'));
  walls.forEach( (w) => {
    wleft = Math.min(w.p1[0], w.p2[0]);
    wright = Math.max(w.p1[0], w.p2[0]);
    wTop = Math.min(w.p1[1], w.p2[1]);
    wBottom = Math.max(w.p1[1], w.p2[1]);

    let rectW = Math.abs(w.p2[0] - w.p1[0]);
    let rectH = Math.abs(w.p2[1] - w.p1[1]);
    rect(wleft, wTop, rectW, rectH);
  });
}

function drawPlayerInfo(p){//p is a player
  textAlign(CENTER,CENTER);
  fill(255);
  textSize(p.r);
  let coords = '(' + p.x + ', ' + p.y + ')';
  text(coords, p.x, p.y + p.r + p.r);
}

function drawPlayers(players){
  Object.keys(players).forEach( (key) => {
     let p = players[key];
       fill(p.c);
       ellipse(p.x, p.y, p.r, p.r);
       //draw players name
       textAlign(CENTER,CENTER);
       fill(255);
       textSize(p.r);
       text(p.name, p.x, p.y + p.r);
       debug && drawPlayerInfo(players[key]);
    });
}

  //return vector from base to mouse position
  function getMouseVector(base){
    let screenMouse = createVector(mouseX, mouseY);//relative to screen
    let mousePos = screenMouse.sub(base);//relative to base
    return mousePos;
  }

  function spray(player){
    let sprayDist = 15;
    sprayDir = [player.x_dir*sprayDist,player.y_dir*sprayDist];
    //console.log(sprayDir);
    myPlayer.spray = [player.x + sprayDir[0], player.y + sprayDir[1], new Date().getTime()];

    //if I want to base it off mouse but glitchy
    // let mapCenter = createVector(windowWidth/2, windowHeight/2);
    // //let mouseVec = getMouseVector(mapCenter);
    // //let playerVec = createVector(player.x, player.y);
    // //let sprayVector = mouseVec.add(playerVec);
    // let playerVec = createVector(player.x +16, player.y +16);
    // let mouseVec = getMouseVector(mapCenter);
    // ellipse(mouseVec.x,mouseVec.y, 33,33);
    // //ellipse(player.x,player.y, 33,33);
    // line(mouseVec.x,mouseVec.y, playerVec.x,playerVec.y);
    // let sprayVector = mouseVec.sub(playerVec);
    
    // let  sprayDistance = 1;
    // sprayVector.setMag(sprayDistance);
    // sprayLocation = sprayVector; 
  }

function joinscreen() {
  //Dashboard items for main pagef
  greeting = createElement('p', 'Welcome to the tphunt');
  greeting.addClass('greet');
  greeting.center();

  p2 = createElement('p', 'Enter your Alias to Begin');
  p2.addClass('desc');
  p2.position(width * 1.8 - p2.width >> 1, height/1.2 - p2.height >> 1);

  input = createInput();
  input.position(width-input.width >> 1, height*1.1-input.height >> 1);

  button = createButton('Enter');
  button.position(width - button.width >> 1, height * 1.2 - button.height >> 1);
  button.mousePressed(enterGame);
}

var walls = [];
var players = {};
var sprays = {};
var slime = {};
var papers = {};
var scoreBoard = [];

var myPlayer = new MyPlayer(id = 0);//my player is different from player because it has data about movement that needs to be applied

var paper_loadImg;// = loadImage(paperPath)

function sortScores(){//ps is players
  // Create items array
  var items = Object.keys(players).map(function(key) {
    return [players[key].name, players[key].score];
  });

  // Sort the array based on the second element
  items.sort(function(first, second) {
    return first[1] - second[1];
  });
  return items;
}

function preload(){
  let paperPath = "./paper.png";
  paper_loadImg = loadImage(paperPath);
}

function setup() {
  socket = io.connect('http://localhost:3000');
  //socket = io.connect('http://45.79.149.119:3000/');

	createCanvas(windowWidth, windowHeight);
  joinscreen();
  
  socket.on('heartbeat', function(data){
    //there may be new players in data so we map over data.players
    Object.keys(data.players).forEach( (key) =>{
    if(players[key]){//if the player exists
      let newX = lerp(players[key].x, data.players[key].x, gs.lerpConst);
      let newY =  lerp(players[key].y, data.players[key].y, gs.lerpConst);
      players[key] = data.players[key];
      players[key].x = newX;//lerp
      players[key].y = newY;     
      players[key].score = data.players[key].score;
      //console.log(newX, newY);
      //console.log('p',players[key]);
    }
    else{
      players[key] = data.players[key];//new player
    }
      //check if the player exists already
    });
    scoreBoard = sortScores();//add players score to score board
    //players = data.players;
    papers = data.papers;
    slime = data.slime;
    sprays = data.spray;
    //console.log(sprays);
    //console.log("hb slime:",slime);
  });

  socket.on('joined', function(data){//initialize player this may not be your player
    if(socket.id == data.id){
    myPlayer = new MyPlayer(data.id, data.x, data.y, data.name, data.c);
    }
    walls = data.walls;
    //papers = data.papers;
    console.log('you joined the game');  
  });

  socket.on('playerDeath', (pid)=>{
    delete players[pid];
    console.log(pid)
  //io.sockets.emit('playerDeath', {'playerid:': socket.id});
  });

  socket.on('disconnect', function(data){
    console.log(data);
  });

}

function playerInput(){
  if(myPlayer.id == 0){
    return false;
  }
  else{
  //This takes input from the client and keeps a record,
  //It also sends the input information to the server immediately
  //as it is pressed. It also tags each input with a sequence number.
  myPlayer.x_dir = 0;
  myPlayer.y_dir = 0;
  var input = [];
  client_has_input = false;
  
  if(keyboard.pressed('A') || keyboard.pressed('left')) {
    myPlayer.x_dir = -1;
    input.push('l');
    //console.log("left");
  } //left
  
  if(keyboard.pressed('D') || keyboard.pressed('right')) {
    myPlayer.x_dir = 1;

    input.push('r');
    //console.log("right");
  } //right
  
  if(keyboard.pressed('S') || keyboard.pressed('down')) {
    myPlayer.y_dir = 1;
    input.push('d');
    //console.log("down");
  } //down
  
  if(keyboard.pressed('W') || keyboard.pressed('up')) {
    myPlayer.y_dir = -1;
    input.push('u');
    //console.log("up");
  } //up

  if(keyboard.pressed('F') && myPlayer.canSpray) {
    spray(myPlayer);
    myPlayer.canSpray = false;
  } 

  let speed = gs.speed;
  myPlayer.x += myPlayer.x_dir*speed;
  myPlayer.y += myPlayer.y_dir*speed;
  myPlayer.x = constrain(myPlayer.x, 0+gs.playerSize/2, gs.mapX);
  myPlayer.y = constrain(myPlayer.y, 0+gs.playerSize/2, gs.mapY);
  }
}

//camera follows player and zooms in on player
function followPlayer(player){
  let zoomScale = gs.zoomScale;
  scale(zoomScale);
  let divBy = 2*zoomScale;
  let playerX = -player.x + windowWidth/divBy;
  let playerY = -player.y + windowHeight/divBy;
  let playerVec = createVector(playerX, playerY);

  translate(playerVec);
  //translations.add(playerVec);
}

//this function may be doing too many things at once. TODO: refactor into two functions?
function movePlayers(){
  //Goes through each of the player to send information to the server
  for(var i = players.length-1; i>=0; i--){
      move(players[i]);//function that moves a specific player
    //players[i].constrain
  }

  blobCollisions(myPlayer);
  slimeCollisions(myPlayer);
  wallCollisions(myPlayer);
  paperCollisions(myPlayer);
  sprayCollisions(myPlayer);

  //this is where I start to kill the player if marked
  if(myPlayer.marked){
    myPlayer.health -= 1;
  }
  if(myPlayer.health <= 0){
    console.log('reload');
    kill();
  }
  
  //updateSprays();

  var data = {
    	x: myPlayer.x,
    	y: myPlayer.y,
      id: myPlayer.id,
      marked: myPlayer.marked,
      spray: myPlayer.spray
  }
  //console.log(data);
  socket.emit('playerUpdate', data);
}

function btw(p, low, high){
  return p > low && p < high;
}

function kill(){
  if(myPlayer.alive){
    myPlayer.alive = false;
    this.window.location.reload(false); 
  }
}

function paperCollisions(player){
  Object.keys(papers).some( (key) =>{
    if(Math.abs(papers[key][0] - player.x) < 10 && Math.abs(papers[key][1] - player.y) < 10){
      console.log('you scored!');
      socket.emit('scored', {'paperid': papers[key][2]})
      return papers[key][2]; 
    }
  });
}

function blobCollisions(player){
  walls.forEach( (w) => {
    if(Math.abs(w.p1[0] - player.x) < 10 && Math.abs(w.p1[1] - player.y) < 10){//this is for the first point on the wall
      kill();
      console.log('hit-----');
    }
    if(Math.abs(w.p2[0] - player.x) < 10 && Math.abs(w.p2[1] - player.y) < 10){//this is for the second point on the wall
      kill();
      console.log('hit');
    }
  });
}

function sprayCollisions(player){
  Object.keys(sprays).some( (key) =>{
      if(Math.abs(sprays[key][0] - player.x) < 10 && Math.abs(sprays[key][1]- player.y) < 10){//check for the collision
        console.log('SPAYED');
        if(myPlayer.marked && key != myPlayer.id){
          //console.log('healed by ' + player[key].n + ' spray');
          socket.emit('healed', {'healer': key});
        }
        myPlayer.marked = false;
        return myPlayer.marked;
      }
  });
}

function slimeCollisions(player){
  Object.keys(slime).some( (key) =>{
    let vals = key.split(',');
    if(vals[2] != player.id){
      if(Math.abs(vals[0] - player.x) < 10 && Math.abs(vals[1] - player.y) < 10){
        //console.log('hit slime ' + vals[2]);
        myPlayer.marked = true;
      }
    }
  });
}

function wallCollisions(players){
  let pr = gs.playerSize/2;//players radius
  let error = 5;//error is used to account for things like network lag or anything not accounted for and make sure the player doesn't go past the bound 
  walls.forEach( (w) => {
    wleft = Math.min(w.p1[0], w.p2[0]);
    wright = Math.max(w.p1[0], w.p2[0]);
    wTop = Math.min(w.p1[1], w.p2[1]);
    wBottom = Math.max(w.p1[1], w.p2[1]);

    if(btw(myPlayer.y, wTop, wBottom)){//within wall y
      if(btw(myPlayer.x + pr, wleft, wleft+error)){//coming from the left
        myPlayer.x = wleft - pr;
      }
      else if(btw(myPlayer.x, wright, wright+error)){//coming from the right
        myPlayer.x = wright + pr;
      }
    }
    
    if(btw(myPlayer.x, wleft, wright)){//within wall x
      if(btw(myPlayer.y + pr, wTop, wTop+error)){//coming from the top going down
        myPlayer.y = wTop - pr;
      }
      else if(btw(myPlayer.y, wBottom, wBottom+error)){
        myPlayer.y = wBottom + pr;
      }
    }

  });
}

//draws the paper
function drawPapers(){
  Object.keys(papers).forEach( (key) =>{
    //factor by which we move the image to allign with hitbox:
    let moveFactor = 8; 
    image(paper_loadImg, papers[key][0] - moveFactor, papers[key][1]- moveFactor);//image is 16 by 16
    //ellipse(papers[key][0], papers[key][1], 16, 16);
  });
}

function drawSlime(){
  Object.keys(slime).forEach( (key)=>{
    noStroke();
    fill(color('green'));
    pos = key.split(',');
    ellipse(pos[0],pos[1], 8, 8);
    stroke(1);
  });
}

function drawSpray(){
  //console.log('spray:', sprays); //{id: [coord, time]}
  Object.keys(sprays).forEach((key)=>{
    let dt = (new Date().getTime()-sprays[key][2]);
    //console.log(dt);
    if( dt < 2000 ){//
      ellipse(sprays[key][0], sprays[key][1], 20, 20);
    }
    else{//delete the spray
      if(sprays[key]){
        socket.emit('deleteSpray', {'sprayId': key})
        //console.log("before:", sprays[key]);
        delete sprays[key];//this doesn't delete it from server
        
        //console.log('after:',sprays[key]);
        if(key == myPlayer.id){//if the delete spray way mine
          myPlayer.spray = [-1,-1];//
          myPlayer.canSpray = true;
        }
      }
    }
    //ellipse(sprays[key][0][1],sprays[key][0][1], 20, 20);
  });
}

function drawAll(){
  drawSpray();
  drawBlobs(walls);
  drawWalls(walls);
  debug && drawField();//draws the area you are allowed to play in
  drawPapers();
  drawSlime();
  drawPlayers(players);
  drawLeaderBoard();
}


function test(c){
  //strokeWeight(10);
  fill(c);
  let divBy = 2*gs.zoomScale;
  let mx = -mouseX + windowWidth/divBy;
  let my = -mouseY + windowHeight/divBy;

  original = createVector(myPlayer.x, myPlayer.y);
  line(myPlayer.x, myPlayer.y, mouseX, mouseY);
  ellipse(mouseX, mouseY,40,40);
  //console.log(myPlayer.x,myPlayer.y, mouseX, mouseY);
}

//draw is actually an update function and drawFunc is where drawing is done
function draw() {  
  background(33,35,42);
  //test(color('green'));
  followPlayer(myPlayer);
  //test(color('black'));
  playerInput();
  movePlayers();//move player must be called before drawing and colliding with static object such as walls Otherwise the walls would move respective to the player
  drawAll();

  getFrameRate(30);
}