// Controller Class

var Scope = require('./lib/scope').Scope
var mkUtil = require('./lib/util')

function Controller () {
	Scope.call(this)
}

mkUtil.inherit(Controller, Scope)

Controller.Extend = mkUtil.ExtendHelper

module.exports = Controller