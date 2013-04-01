var test = require('tape')
  , levelup = require('levelup')

var db = levelup(__dirname + '/testdb', {
  valueEncoding: 'json'
})

// Load up #inc
db.inc = require('./')(db, function(value, param) {
  return (value | 0) + param
})

db.merge = require('./')(db, function(value, param) {
  return Object.keys(param).reduce(function(current, key) {
    current[key] = param[key]
    return current
  }, value || {})
})

// Delete old test keys
db.batch([
    'a'
  , 'b'
  , 'c'
].map(function(key) {
  return { type: 'del', key: key }
}), function(err) {
  if (err) throw err

  test('Can fill in for level-inc', function(t) {
    t.plan(2)

    var times = 0

    for (var i = 0; i < 100; i += 1) {
      db.inc('b', 5, done)
    }

    function done(err) {
      if (err) throw err
      times += 1
      if (times < 100) return

      db.get('b', function(err, val) {
        t.ok(!err)
        t.equal(val, 500)
      })
    }
  })

  test('Merge example', function(t) {
    t.plan(2)

    var obj, times = 0, expected = {}

    for (var i = 0; i < 100; i += 1) {
      obj = {}
      obj[i] = i + 1
      expected[i] = i + 1
      db.merge('c', obj, done)
    }

    function done(err) {
      if (err) throw err
      times += 1
      if (times < 100) return
      db.get('c', function(err, actual) {
        t.ok(!err)
        t.deepEqual(actual, expected)
      })
    }
  })
})
