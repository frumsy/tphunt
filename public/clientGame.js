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

function joinscreen() {
  //Dashboard items for main page
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
      let lerpNum = gs.lerpConst;
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
  var x_dir = 0;
  var y_dir = 0;
  var input = [];
  client_has_input = false;
  
  if(keyboard.pressed('A') || keyboard.pressed('left')) {
    x_dir = -1;
    input.push('l');
    //console.log("left");
  } //left
  
  if(keyboard.pressed('D') || keyboard.pressed('right')) {
    x_dir = 1;

    input.push('r');
    //console.log("right");
  } //right
  
  if(keyboard.pressed('S') || keyboard.pressed('down')) {
    y_dir = 1;
    input.push('d');
    //console.log("down");
  } //down
  
  if(keyboard.pressed('W') || keyboard.pressed('up')) {
    y_dir = -1;
    input.push('u');
    //console.log("up");
  } //up

  let speed = gs.speed;
  myPlayer.x += x_dir*speed;
  myPlayer.y += y_dir*speed;
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
  wallCollisions(myPlayer);
  paperCollisions(myPlayer);
  
  var data = {
    	x: myPlayer.x,
    	y: myPlayer.y,
      id: myPlayer.id,
  }
  //console.log(data);
  socket.emit('playerUpdate', data);
}

function btw(p, low, high){
  return p > low && p < high;
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
    if(Math.abs(w.p1[0] - player.x) < 10 && Math.abs(w.p1[1] - player.y) < 10){
      this.window.location.reload(false);
      console.log('hit-----');
    }
    if(Math.abs(w.p2[0] - player.x) < 10 && Math.abs(w.p2[1] - player.y) < 10){
      this.window.location.reload(false);
      console.log('hit');
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
      else if(btw(myPlayer.x + pr, wright, wright+error)){//coming from the right
        myPlayer.x = wright + pr;
      }
    }
    
    if(btw(myPlayer.x, wleft, wright)){//within wall x
      if(btw(myPlayer.y + pr, wTop, wTop+error)){//coming from the top going down
        myPlayer.y = wTop - pr;
      }
      else if(btw(myPlayer.y + pr, wBottom, wBottom+error)){
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



function drawAll(){
  drawBlobs(walls);
  drawWalls(walls);
  debug && drawField();//draws the area you are allowed to play in
  drawPapers();
  drawSlime();
  drawPlayers(players);
  drawLeaderBoard();
}


//draw is actually an update function and drawFunc is where drawing is done
function draw() {  
  background(33,35,42);
  playerInput();
  movePlayers();//move player must be called before drawing and colliding with static object such as walls Otherwise the walls would move respective to the player
  followPlayer(myPlayer);
  drawAll();

  getFrameRate(30);
}