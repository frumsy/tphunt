function a2O(arr) {
  var rv = {};
  for (var i = 0; i < arr.length; ++i)
    rv[arr[i]] = 0;
  return rv;
}

function range(start, end, step = 1) {
  const len = Math.floor((end - start) / step) + 1;
  return Array(len).fill().map((_, idx) => start + (idx * step));
}

function paper(id, x, y){
  this.id = id;
  this.x = x;
  this.y = y;
}

function rand(min, max){
  return Math.floor((Math.random() * max) + min);
}
    //copies a 2d vector like object from one to another
    function pos(a) { return {x:a.x,y:a.y}; };
    //Add a 2d vector with another one and return the resulting vector
    function v_add(a,b) { return { x:(a.x+b.x).fixed(), y:(a.y+b.y).fixed() }; };
    //Subtract a 2d vector with another one and return the resulting vector
    function v_sub(a,b) { return { x:(a.x-b.x).fixed(),y:(a.y-b.y).fixed() }; };
    //Multiply a 2d vector with a scalar value and return the resulting vector
    function v_mul_scalar(a,b) { return {x: (a.x*b).fixed() , y:(a.y*b).fixed() }; };
    //For the server, we need to cancel the setTimeout that the polyfill creates
    function stop_update() {  window.cancelAnimationFrame( this.updateid );  };
    //Simple linear interpolation
    function lerp(p, n, t) { var _t = Number(t); _t = (Math.max(0, Math.min(1, _t))).fixed(); return (p + _t * (n - p)).fixed(); };
    //Simple linear interpolation between 2 vectors
    function v_lerp(v,tv,t) { return { x: this.lerp(v.x, tv.x, t), y:this.lerp(v.y, tv.y, t) }; };

module.exports.range = range;
module.exports.rand = rand;
module.exports.a2O = a2O;
module.exports.pos = pos;
module.exports.v_add = v_add;
module.exports.v_sub = v_sub;
module.exports.v_mul_scalar = v_mul_scalar;
module.exports.stop_update = stop_update;
module.exports.lerp = lerp;
module.exports.v_lerp = v_lerp;