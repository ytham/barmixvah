var Galileo = require("../lib/galileo");
var board = new Galileo();

board.on("ready", function() {
  this.digitalRead(9, function(data) {
    console.log(9, data);
  });
});
