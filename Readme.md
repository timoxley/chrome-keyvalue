
# chrome-keyvalue

  Simple Key/Value storage atop chrome.storage. For Chrome extensions.

## Rationale

Default `chrome.storage` api is a pain to deal with when it comes to
things like updating or removing specific values in hashes, since you
can only save or load a whole hash at a time.

I believe this is by design as the use-case it was designed for was
probably simply saving and loading a user's settings for an extension.
This is fine for most use-cases, but if you are programmatically storing
a collection of items that changes over time, then this lib
should prove more convenient.

## Installation

    $ component install timoxley/chrome-keyvalue

## Example

```js
var assert = require('assert')
var KeyValue = require('chrome-keyvalue')

// create a new instance for 'users'
var kv = new KeyValue('users')

kv.set('tim', { // save a user
	name: 'Tim',
	age: 27
}, function(err, val) {
	assert.ifError(err)
	assert.equal(val.name, 'Tim')

	// get the record we just saved
	kv.get('tim', function(err, val) {
		assert.ifError(err)
		assert.equal(val.name, 'Tim')
		assert.equal(val.age, 27)
		done()
	})
})

```

## API

  - [KeyValue()](#keyvalue)
  - [KeyValue.useLocal()](#keyvalueuselocal)
  - [KeyValue.useSync()](#keyvalueusesync)
  - [KeyValue.get()](#keyvaluegetkeystringfnfunction)
  - [KeyValue.del()](#keyvaluedelstringfnfunction)
  - [KeyValue.clear()](#keyvalueclearfnfunction)

## KeyValue()

  KeyValue constructor. Give it a unique `name`.

## KeyValue.useLocal()

  Use `chrome.storage.local` instead of `chrome.storage.sync`.

  `chrome.storage.local` doesn't sync data to
  this account on other machines.

## KeyValue.useSync()

  Use `chrome.storage.sync` instead of `chrome.storage.local`. `chrome.storage.sync` is the default
  and this method only exists for completeness.

## KeyValue.get(key:String, fn:Function)

  Get value associated with `key`.

## KeyValue.del(:String, fn:Function)

  Delete value associated with `key`

## KeyValue.clear(fn:Function)

  Remove all values from this store.

## License

  MIT
