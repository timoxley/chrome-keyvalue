var ITERATIONS = 300

var KeyValue = require('chrome-keyvalue')
var Batch = require('component-batch')

var kv = undefined

function iterate(fn, done) {
	var batch = new Batch()
	for (var i = 0; i < ITERATIONS; i++) {
		batch.push(fn)
	}
	return batch.end(done)
}

beforeEach(function() {
	kv = new KeyValue('performance')
})

afterEach(function(done) {
	kv.clear(done)
})


function rand() {
	return Math.floor(Math.random() * 1000)
}

describe('set performance', function() {
	it('sets same key quickly', function(done) {
		iterate(function(next) {
			kv.set('tim', {
				name: 'Tim'
			}, next)
		}, done)
	})
	it('sets different keys quickly', function(done) {
		iterate(function(next) {
			kv.set('tim' + rand(), {
				name: 'Tim'
			}, next)
		}, done)
	})

})

describe('get performance', function() {
	beforeEach(function(done) {
		var count = 0
		iterate(function(next) {
			kv.set('tim' + count++, {
				name: 'Tim'
			}, next)
		}, done)
	})

	it('gets same item quickly', function(done) {
		iterate(function(next) {
			kv.get('tim0', next)
		}, done)
	})

	it('gets different items quickly', function(done) {
		var count = 0
		iterate(function(next) {
			kv.get('tim' + count++, next)
		}, done)
	})
})
