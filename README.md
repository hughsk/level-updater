# level-inc [![Build Status](https://secure.travis-ci.org/hughsk/level-inc.png?branch=master)](http://travis-ci.org/hughsk/level-inc)

An increment call for [levelup](http://github.com/rvagg/node-levelup).

Why? Because if you're counting up a lot, the gap between a `get` and a `put`
becomes important:

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
there. `level-inc` keeps track of overlapping calls like this and handles them
cleanly.

## Installation ##

``` bash
npm install level-inc
```

## Usage ##

**require('level-inc')(db)(key, amount, callback)**

``` javascript
var db = require('levelup')(__dirname + '/db')
var inc = require('level-inc')(db)
var counter = 0

db.inc = inc

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
