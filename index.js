var Scope = require('./lib/scope').Scope
var bindUtil = require('./lib/bind-util')
var bind = bindUtil.bind
var $ = require('jquery')
var relation = require('./lib/relation').relation


var controllers = {}

exports.controller = function (name, factory) {
  controllers[name] = factory
}

exports.startApp = function () {
  $('body').find('[mk-controller]').each(function () {
    var node = $(this)
    var name = node.attr('mk-controller').trim()
    
    var $scope = new Scope()
    if(controllers[name]) {
      console.log('Controller init:', name)
      controllers[name].call({}, $scope)
      bind($scope, node)
    }
    else {
      console.warn('Warning: Controller', name, 'not found.')
    }
    
  })
}

exports.relation = relation

exports.registerBinding = bindUtil.registerBinding