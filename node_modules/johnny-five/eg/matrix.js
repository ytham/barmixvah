function Matrix() {

  this.values = [0, 1, 2, 3];

  this.valueOf = function() {
    return 1;
  };
}


var a = new Matrix();
var b = new Matrix();

console.log(a + b);
