const getobject = require('getobject');
const traverse = require('traverse');

module.exports = function (source, mapping) {
  return traverse(mapping).map(function (item) {
    if (typeof item === 'string') {
      this.update(getobject.get(source, item));
    }
  });
};
