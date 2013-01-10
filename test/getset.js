var KeyValue = require('chrome-keyvalue')
var assert = require('timoxley-assert')

var kv = undefined

mocha.globals('schemaTypes')

beforeEach(function() {
  kv = new KeyValue('testing')
})

afterEach(function(done) {
  chrome.storage[kv.type].remove(kv.getGlobalKey(), function() {
    done()
  })
})

it('can set and get', function(done) {
  kv.set('tim', {
    name: 'Tim'
  }, function(err, val) {
    assert.ifError(err)
    assert.equal(val.name, 'Tim')
    kv.get('tim', function(err, val) {
      assert.ifError(err)
      assert.equal(val.name, 'Tim')
      done()
    })
  })
})

describe('setting multiple items', function() {
  it('executes all callbacks', function(done) {
    var count = 0
    var next = function(err) {
      assert.ifError(err)
      if (++count === 2) setTimeout(function() {done()}, 0)
      if (count > 2) throw new Error('Called too many times')
    }

    kv.set('tim', {
      name: 'Tim'
    }, next)
    kv.set('bob', {
      name: 'Bob'
    }, next)
  })
})

describe('.get', function() {
  it('returns undefined if no value for key', function() {
    kv.get('bob', function(err, value) {
      assert.ifError(err)
      assert.strictEqual(value, undefined)
    })
  })
})

describe('.del', function() {
  it('can delete items', function(done) {
    kv.set('tim', {
      name: 'Tim'
    }, function(err, val) {
      assert.ifError(err)
      kv.del('tim', function(err, value) {
        assert.ifError(err)
        kv.get('tim', function(err, value) {
          assert.ifError(err)
          assert.strictEqual(value, undefined)
          done()
        })
      })
    })
  })
})

describe('.clear', function() {
  beforeEach(function(done) {
    kv.set('tim', {
      name: 'Tim'
    }, done)
  })
  it('removes all items', function(done) {
    kv.clear(function(err) {
      assert.ifError(err)
      kv.get('tim', function(err, value) {
        assert.ifError(err)
        assert.strictEqual(value, undefined)
        done()
      })
    })
  })
})
