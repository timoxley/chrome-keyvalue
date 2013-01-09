var throttle = require('throttle')

module.exports = KeyValue

/**
 * KeyValue constructor.
 *
 * @param {String} name
 */

function KeyValue(name) {
  this.name = name
  this.type = 'sync'
  // in-memory cache for fast reads
  this._cache = {}
}

/**
 * Use storage.local instead of storage.sync.
 *
 * Storage.local doesn't sync data to
 * this account on other machines.
 */

KeyValue.prototype.useLocal = function() {
  this.type = 'local'
  return this
}

/**
 * Use local storage instead of local. storage.sync is the default
 * and this method only exists for completeness.
 *
 */

KeyValue.prototype.useSync = function() {
  this.type = 'sync'
  return this
}

/**
 * Set `key` to `value`.
 *
 * @param {String} key
 * @param {Mixed} value
 * @param {Function} fn
 * @api private
 */

KeyValue.prototype.set = function(key, value, fn) {
  var self = this
  if (self._cache[key] === value) {
    return fn(null, value)
  }

  self._cache[key] = value
  this._get(function(err, mappings) {
    if (err) return fn(err)
    mappings = mappings || {}
    mappings[key] = value
    self._set(mappings, function(err, result) {
      if (err) return fn(err)
      return fn(err, value)
    })
  })
  return this
}

/**
 * Get value associated with `key`.
 *
 * @param {String} key
 * @param {Function} fn
 * @api private
 */

KeyValue.prototype.get = function(key, fn) {
  var self = this
  if (typeof self._cache[key] !== undefined) {
    return fn(null, self._cache[key])
  }
  self._get(function(err, values) {
    if (err) return fn(err)
    values = values || {}
    return fn(null, values[key])
  })
  return this
}

KeyValue.prototype.del = function(key, fn) {
  return this._del(key, fn)
}


KeyValue.prototype.clear = function(fn) {
  return this._clear(fn)
}

KeyValue.prototype._del = function(key, fn) {
  var self = this
  delete self._cache[key]
  fn(null)
  this._get(function(err, mappings) {
    if (err) return fn(err)
    delete mappings[key]
    self._set(mappings, function(err) {
    })
  })
}

KeyValue.prototype._clear = function(fn) {
  return chrome.storage[this.type].remove(this.getGlobalKey(), function(result) {
    if (chrome.runtime.lastError) return fn(chrome.runtime.lastError)
    fn(null, result)
  })
}

KeyValue.prototype._get = function(fn) {
  var self = this
  return chrome.storage[this.type].get(this.getGlobalKey(), function(result) {
    if (chrome.runtime.lastError) return fn(chrome.runtime.lastError)
    fn(null, result[self.getGlobalKey()])
  })
}
KeyValue.prototype._set = function(payload, fn) {
  this._queue = this._queue || []
  this._queue.push(fn)
  var self = this
  this.__set(payload, function(err, result) {
    self._queue.forEach(function(queuedFn) {
      queuedFn(err, result)
    })
  })
}
KeyValue.prototype.__set = throttle(function(payload, fn) {
  var self = this
  var wrapper = {}
  wrapper[self.getGlobalKey()] = payload
  chrome.storage[self.type].set(wrapper, function() {
    if (chrome.runtime.lastError) return fn(chrome.runtime.lastError)
    fn(null, payload)
  })
}, 100)

var PREFIX = 'KeyValue'
KeyValue.prototype.getGlobalKey = function() {
  if (!this.name) throw new Error('A name must be supplied to the KeyValue instance!')
  return PREFIX + ':' + this.name
}

