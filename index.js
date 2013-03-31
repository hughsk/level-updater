module.exports = function(db) {
  var cache = {}

  function inc(key, val, callback) {
    callback = callback || function(){}

    if (key in cache) {
      cache[key].ready.push(callback)
      cache[key].value += val
      return
    }

    cache[key] = {
        value: val
      , ready: [callback]
    }

    db.get(key, function(err, current) {
      var ready = cache[key].ready

      current = current | 0
      current += cache[key].value
      delete cache[key]

      db.put(key, current, function(err) {
        ready.map(function(cb) { return cb(err) })
      })
    })
  }

  return inc
}
