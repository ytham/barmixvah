var Galileo = require("../lib/galileo");
var sinon = require("sinon");
var title = "Not Implemented";

exports[title] = {};

[
  "pulseIn",
  "pulseOut",
  "queryPinState",
  "sendI2CWriteRequest",
  "sendI2CReadRequest",
  "sendI2CConfig",
  "_sendOneWireRequest",
  "_sendOneWireSearch",
  "sendOneWireWriteAndRead",
  "sendOneWireDelay",
  "sendOneWireDelay",
  "sendOneWireReset",
  "sendOneWireRead",
  "sendOneWireSearch",
  "sendOneWireAlarmsSearch",
  "sendOneWireConfig",
  "stepperConfig",
  "stepperStep"
].forEach(function(method) {
  exports[title][method] = function(test) {
    test.expect(2);
    test.ok(Galileo.prototype[method]);
    test.throws(function() {
      Galileo.prototype[method].call({});
    });
    test.done();
  };
});
