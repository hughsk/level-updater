# level-updater [![Build Status](https://secure.travis-ci.org/hughsk/level-updater.png?branch=master)](http://travis-ci.org/hughsk/level-updater)

Pseudo-atomic update methods for
[levelup](http://github.com/rvagg/node-levelup). Started out as
[level-inc](http://github.com/hughsk/level-inc), but this is more useful.

Why? If you're making a lot of changes dependent on the current value of a
key, you'll find the gap between a `get` and a `put` becomes important:

``` javascript
for (var i = 0; i < 100; i += 1) {
  db.get('a-key', function(err, val) {
    val = parseInt(val || 0, 10)
    val += 1

    db.put('a-key', val)
  })
}
```

The above example will probably result in `a-key` being set to 1 and staying
there. `level-updater` keeps track of overlapping calls like this and handles
them cleanly for you.

## Installation ##

``` bash
npm install level-updater
```

## Usage ##

**require('level-updater')(db, updater)(key, [param], [callback])**

When initializing:

* `db` is the levelup instance to plug into.
* `updater` is the method used to update each time a value is hit.

And for each call:

* `key` is the key to update.
* `param` is an optional parameter for passing to `updater`.
* `callback` is called after the new value has been stored in the database.

Take this example for incrementing numbers:

``` javascript
var db = require('levelup')(__dirname + '/db')
var update = require('level-updater')
var counter = 0

db.inc = update(db, function(value, param, key) {
  return (value | 0) + param
})

for (var i = 0; i < 200; i += 1) {
  db.inc('some-key', 10, function() {
    counter += 1
    if (counter !== 200) return
    db.get('some-key', function(err, val) {
      // val === "2000"
    })
  })
}
```

And this for merging JSON objects:

``` javascript
var db = require('levelup')(__dirname + '/db')
var update = require('level-updater', {
  valueEncoding: 'json'
})

db.merge = update(db, function(original, merger) {
  return Object.keys(param).reduce(function(current, key) {
    current[key] = param[key]
    return current
  }, value || {})
})

db.merge('doc', { hello: 'world' })
db.merge('doc', { lorem: 'ipsum' }, function(err) {
  db.get('doc', function(err, val) {
    // val === { hello: 'world', lorem: 'ipsum' }
  })
})
```
