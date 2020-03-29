/*function terrain(){
function toObject(arr) {
    var rv = {};
    for (var i = 0; i < arr.length; ++i)
      rv[arr[i]] = 0;
    return rv;
  }
  
  function range(start, end, step = 1) {
    const len = Math.floor((end - start) / step) + 1;
    return Array(len).fill().map((_, idx) => start + (idx * step));
  }
  
  function rand(min, max){
    return Math.floor((Math.random() * max) + min);
  }
  
  const width = (2**10)-1;
  const height = width;
  
  class Rectangle {
    constructor(p1, p2) {
      this.p1 = p1;
      this.p2 = p2;
    }
  }
  
  function drawWalls(walls){
    fill(color('green'));
    //console.log(walls);
    walls.forEach( w => {
      let x1 = w.p1[0];
      let y1 = w.p1[1];
  
      let rectW = Math.abs(w.p2[0] - w.p1[0]);
      let rectH = Math.abs(w.p2[1] - w.p1[1]);
      rect(x1,y1, rectW, rectH);
    });
    //ellipse(50, 50, 80, 80);
  }
  
    let step = 16;
    let possible = range(0, width, step);
    //console.log(possible);
    let len = possible.length;
    
    let number_walls = 20;
    
    //pick a bunch of random points on the map
    var points = Array(number_walls).fill().map( function(){
      let ind = rand(1, len-2);
      let ind2 = rand(1, len-2);
      //console.log("poss:", possible[ind]);
      return [possible[ind] ,possible[ind2]];
    });
    
   //var points = Array(number_walls).fill().map( ()=> [rand(0,width/5),rand(0,width/5)]);
    
    //console.log(points);
    //ind2 = rand(0, len-1);
    walls = [];
    points.forEach(point => {
      if(rand(0,2)){//updown
        let ind = rand(1, len-2);
        let p2x = point[0] + step;
        let p2y = possible[ind];
        let newRect = new Rectangle(point, [p2x,p2y]); 
        walls.push(newRect);
      }
      else{//right
        let ind = rand(1, len-2);
        let p2x = possible[ind];
        let p2y = point[1] + step;
        let newRect = new Rectangle(point, [p2x,p2y]); 
        walls.push(newRect);
      }
    //drawWalls(walls);
    //console.log(walls);
    });
  
  function drawRect(p1, p2)
  {
    return 0;
  }
      
}
*/