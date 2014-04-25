this.interval = setImmediate(function move() {

  console.log(Date.now());


  this.interval = setImmediate(move);
}.bind(this));
