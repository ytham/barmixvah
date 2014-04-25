# remapped [![Build Status](https://secure.travis-ci.org/tkellen/node-remapped.png?branch=master)](http://travis-ci.org/tkellen/node-remapped)
> Translate objects using dot notated mappings.

[![NPM](https://nodei.co/npm/remapped.png)](https://nodei.co/npm/remapped/)

```js
const remapped = require('remapped');

var source = {
  id: 1,
  name: 'tyler',
  age: 30,
  nested: {
    id: 1
  }
};

var mapping = {
  myId: 'id',
  myName: 'name',
  myAge: 'age',
  dotNotatedKey: 'nested.id',
  myArray: ['name', 'age', {objectAge: 'age'}],
  temp: {
    myNestedId: 'id'
  }
};

remapped(source, mapping); // {
                           //   myId: 1,
                           //   myName: 'tyler',
                           //   myAge: 30,
                           //   dotNotatedKey: 1,
                           //   myArray: ['tyler', 30, {objectAge: 30}],
                           //   temp: {
                           //     myNestedId: 1
                           //   }
                           // };
```

## Release History

* 2014-02-26 - v0.2.0 - use js-traverse
* 2014-02-26 - v0.1.0 - initial release
