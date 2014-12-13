var Scope = require('./lib/scope').Scope
var bindUtil = require('./lib/bind-util')
var bind = bindUtil.bind
var $ = require('jquery')
var relation = require('./lib/relation').relation


var controllers = {}

exports.controller = function (name, factory) {
  controllers[name] = factory
}

exports.startApp = function (app) {
  // $('body').find('[mk-controller]').each(function () {
  //   var node = $(this)
  //   var name = node.attr('mk-controller').trim()
    
  //   var $scope = new Scope()
  //   if(controllers[name]) {
  //     console.log('Controller init:', name)
  //     controllers[name].call({}, $scope)
  //     bind($scope, node)
  //   }
  //   else {
  //     console.warn('Warning: Controller', name, 'not found.')
  //   }
    
  // })

  // No router for now, go to the IndexController
  if(!app.IndexController) {
    throw new Error('FATAL: Cannot launch "application.IndexController", dying.')
  }

  var indexView = $('body').find('[mk-view="index"]')
  var indexControll = new app.IndexController()
  bind(indexControll, indexView)
}

exports.createApp = function () {
  return {}
}

exports.relation = relation

exports.registerBinding = bindUtil.registerBinding

// export modules

exports.Scope = require('./lib/scope').Scope
exports.ScopeGroup = require('./lib/scope-group').ScopeGroup
exports.ScopeEventTarget = require('./lib/scope-event-target').ScopeEventTarget
exports.bindUtil = require('./lib/bind-util')
exports.util = require('./lib/util')

exports.Controller = require('./controller')