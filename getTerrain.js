var ss =  require('./serverSettings');
var mf = require('./myFunctions');

const width = ss.mapX;
const height = ss.mapY;

class Rectangle {
  constructor(p1, p2) {
    this.p1 = p1;
    this.p2 = p2;
  }
}

//
function makeWalls(numberWalls, gapSize) {//gap size is the min distance between walls
  let step = gapSize;
  let possible = mf.range(0, width, step);
  let len = possible.length;
  
  //pick a bunch of random points on the map
  var points = Array(numberWalls).fill().map( function(){
    let ind = mf.rand(1, len-2);
    let ind2 = mf.rand(1, len-2);
    return [possible[ind] ,possible[ind2]];
  });

  var walls = [];
  points.forEach(point => {
    if(mf.rand(0,2)){//updown
      let ind = mf.rand(1, len-2);
      let p2x = point[0] + step;
      let p2y = possible[ind];
      let newRect = new Rectangle(point, [p2x,p2y]); 
      walls.push(newRect);
    }
    else{//right
      let ind = mf.rand(1, len-2);
      let p2x = possible[ind];
      let p2y = point[1] + step;
      let newRect = new Rectangle(point, [p2x,p2y]); 
      walls.push(newRect);
    }
  });
return walls;
}

module.exports = makeWalls(ss.numberWalls, 16);
