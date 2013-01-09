var KeyValue = require('keyvalue')
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
