var scopes = require('./scope')
var ScopeEventTarget = require('./scope-event-target').ScopeEventTarget

// console.warn(Scope, require('./scope'))
// window.ss = [Scope, require('./scope')]

function ScopeGroup (arr) {
	if(!(this instanceof ScopeGroup)) {

	}

	this.$arr = []
	this.$init(arr)

	this.$on('update', function (keyFullName, key, $target) {
		this.$propagateEvent('update', this.$scopeName + '.' + keyFullName, key, $target)
		return false
	})

	Object.defineProperty(this, 'length', {
		get: function () {
			return this.$arr.length
		}
	})
}

var $group = ScopeGroup.prototype = new ScopeEventTarget()

$group.$init = function (arr) {
	for(var i = 0; i < arr.length; i++) {
		this.$arr.push(wrapItem(arr[i], this))
	}
}



$group.push = function (value) {
	var arrKey = '[' + this.length + ']'

	var item = wrapItem(value, this)
	this.$arr.push(item)
	this.$trigger('group-add', this.length, item, this)
	// this.$trigger('update', arrKey, arrKey, this)
}

$group.shift = function () {
	this.$trigger('group-remove', 0, this.$arr.shift(), this)
}

$group.item = function (i, value) {
	if(i >= this.length) {
		return
	}
	// set
	if(value !== undefined) {
		this.$arr[i] = value
		var arrKey = '[' + i + ']'
		this.$trigger('update', arrKey, arrKey, this)
	}
	//get
	else {
		return this.$arr[i]
	}
}

$group.indexOf = function (obj) {
	for(var i = 0; i < this.$arr.length; i++) {
		if(this.$arr[i] === obj) {
			return i
		}
	}

	return -1
}

$group.forEach = function (handler) {
	for(var i = 0; i < this.$arr.length; i++) {
		handler.call(this, this.$arr[i])
	}
}

$group.remove = function (obj) {
	var index = this.indexOf(obj)
	this.$trigger('group-remove', index, this.$arr.slice(index)[0], this)
}

$group.removeAll = function () {
	while(this.$arr.shift()) { }
	this.$trigger('group-remove-all', this)
}

exports.ScopeGroup = ScopeGroup
exports.createScopeGroup = ScopeGroup


function wrapItem (value, self) {
	var ret = null
	console.log('Group wrapping item', value)
	if(value instanceof Array) {
		ret = new ScopeGroup(value)
		ret.$parent = self
	}
	else if (value instanceof scopes.Scope) {
		console.log('scope don`t need wrapping')
		ret = value
		ret.$parent = self
	}
	else if (typeof value === 'object') {
		ret = new scopes.Scope(value)
		ret.$parent = self
	}
	else {
		ret = value
	}

	return ret
}