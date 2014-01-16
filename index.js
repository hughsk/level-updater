module.exports = function(db, updater) {
  var cache = {}

  function update(key, param, callback) {
    if (typeof param === 'function') {
      callback = param
      param = null
    }
    callback = callback || function(){}

    if (key in cache) {
      cache[key].ready.push(callback)
      cache[key].param.push(param)
      return
    }

    cache[key] = {
        param: [param]
      , ready: [callback]
    }

    db.get(key, function(err, current) {
      var ready = cache[key].ready
      var value = cache[key].param.reduce(function(current, param) {
        return updater(current, param, key)
      }, current)

      delete cache[key]

      db.put(key, value, function(err) {
        ready.map(function(cb) { return cb(err, value) })
      })
    })
  }

  return update
}
