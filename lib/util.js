var scopes = require('./scope')

/**
 * Util
 *
 * @module util
 **/

/**
 * Extend Helper for scope objects
 *
 * @return {Class} SubClass
 * @param {Object} Prototype
 **/
exports.ExtendHelper = function (proto) {
	var Super = this

	function SubClass () {
		Super.call(this)
		SubClass.prototype.init &&
		typeof SubClass.prototype.init === 'function' &&
		SubClass.prototype.init.apply(this, arguments)
	}

	exports.inherit(SubClass, Super)

	for (var n in proto) {
		if(!proto.hasOwnProperty(n)) {
			continue
		}
		scopes.Scope.prototype.$declareProperty.call(SubClass.prototype, n, proto[n])
	}

	return SubClass
}

/**
 * Normal inherit
 *
 * @param {Class} SubClass
 * @param {Class} Super SuperClass
 **/
exports.inherit = function (SubClass, Super) {
	SubClass.prototype = Object.create(Super.prototype)
	SubClass.prototype.__super = SubClass.prototype.__super__ = Super
	SubClass.prototype.constructor = SubClass
}