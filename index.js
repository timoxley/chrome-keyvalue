/**
 * Module dependencies
 */

var throttle = require('throttle')
var PREFIX = 'KeyValue'

module.exports = KeyValue

/**
 * KeyValue constructor. Give it a unique `name`.
 *
 * @param {String} name
 * @api public
 */

function KeyValue(name) {
  this.name = name
  this.type = 'sync'
  // in-memory cache for fast reads
  this._cache = {}
}

/**
 * Use `chrome.storage.local` instead of `chrome.storage.sync`.
 *
 * `chrome.storage.local` doesn't sync data to
 * this account on other machines.
 *
 * @api public
 */

KeyValue.prototype.useLocal = function() {
  this.type = 'local'
  return this
}

/**
 * Use `chrome.storage.sync` instead of `chrome.storage.local`. `chrome.storage.sync` is the default
 * and this method only exists for completeness.
 *
 * @api public
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
  this._load(function(err, mappings) {
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
 * @api public
 */

KeyValue.prototype.get = function(key, fn) {
  var self = this
  if (typeof self._cache[key] !== undefined) {
    return fn(null, self._cache[key])
  }
  self._load(function(err, values) {
    if (err) return fn(err)
    values = values || {}
    return fn(null, values[key])
  })
  return this
}

/**
 * Delete value associated with `key`
 *
 * @param {String}
 * @param {Function} fn
 * @api public
 */

KeyValue.prototype.del = function(key, fn) {
  return this._del(key, fn)
}


/**
 * Remove all values from this store.
 *
 * @param {Function} fn
 * @api public
 */

KeyValue.prototype.clear = function(fn) {
  this._cache = {}
  return this._clear(fn)
}

/**
 * Interface to `chrome.storage`, updates `chrome.storage` with removed key.
 *
 * @param key {String}
 * @param {Function} fn
 * @api private
 */

KeyValue.prototype._del = function(key, fn) {
  var self = this
  delete self._cache[key]
  fn(null)
  this._load(function(err, mappings) {
    if (err) return fn(err)
    delete mappings[key]
    self._set(mappings, function(err) {
    })
  })
}

/**
 * Interface to `chrome.storage`, clears all data
 * for this KeyValue instance
 *
 * @param {Function} fn
 * @api private
 */

KeyValue.prototype._clear = function(fn) {
  return chrome.storage[this.type].remove(this.getGlobalKey(), function(result) {
    if (chrome.runtime.lastError) return fn(chrome.runtime.lastError)
    fn(null, result)
  })
}

/**
 * Interface to `chrome.storage`, load hash for this KeyValue instance.
 *
 * @param {Function} fn
 * @api private
 */

KeyValue.prototype._load = function(fn) {
  var self = this
  return chrome.storage[this.type].get(this.getGlobalKey(), function(result) {
    if (chrome.runtime.lastError) return fn(chrome.runtime.lastError)
    fn(null, result[self.getGlobalKey()])
  })
}

/**
 * Wrapper around throttled __set call, to ensure all callbacks fire.
 *
 * @param {Object} payload
 * @param {Function} fn
 * @api private
 */

KeyValue.prototype._set = function(payload, fn) {
  this._queue = this._queue || []
  this._queue.push(fn)
  var self = this
  this.__set(payload, function(err, result) {
    var queue = self._queue
    self._queue = []
    queue.forEach(function(queuedFn) {
      queuedFn(err, result)
    })
  })
}

/**
 * Interface to `chrome.storage`, replace KeyValue's data with new `payload`.
 * throttled to prevent overloading `chrome.storage` `MAX_WRITE_OPERATIONS_PER_HOUR`
 *
 * @param {Object} payload
 * @param {Function} fn
 * @api private
 */

KeyValue.prototype.__set = throttle(function(payload, fn) {
  var self = this
  var wrapper = {}
  wrapper[self.getGlobalKey()] = payload
  chrome.storage[self.type].set(wrapper, function() {
    if (chrome.runtime.lastError) return fn(chrome.runtime.lastError)
    fn(null, payload)
  })
}, 100)

/**
 * Get key for current KeyValue instance's `chrome.storage`.
 *
 * @return {String}
 * @api private
 */

KeyValue.prototype.getGlobalKey = function() {
  if (!this.name) throw new Error('A name must be supplied to the KeyValue instance!')
  return PREFIX + ':' + this.name
}

