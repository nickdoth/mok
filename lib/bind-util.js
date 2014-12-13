// Bind helper functions
/**
 * @module bind-util
 **/

var $ = require('jquery')
var actions = require('./actions')

// var filters = bindings.filters

/**
 * Bind scopes/controllers with views/templates
 *
 * @return void
 * @param {Scope} $scope Scope or controller scope
 * @param {JQuery} viewNode View
 * @author nd
 **/
exports.bind = function ($scope, viewNode) {
  viewNode = $(viewNode)

  viewNode.on('scope-lookup', function (event, askScope) {
    askScope($scope)
    event.stopPropagation()
  })
  // 
  viewNode.find('[mk-action]').each(function () {
    var childNode = $(this)
    exports.bindElement(childNode)
  })
}

/**
 * Bind DOM element with specified action(s)
 *
 * @return void
 * @param {JQuery} node DOM node
 * @author nd
 **/
exports.bindElement = function (node) {
    if(!node.attr('mk-action')) { 
      console.warn('Warning: mk-action not found on:', node)
      return
    }
    var actions = parseActions(node.attr('mk-action'))

    for(var handle in actions) {
      if(!actions.hasOwnProperty(handle)) {
        continue
      }

      exports.handleAction(handle, actions[handle], node)
    }

    node.data('isBinding', true)
  
}

/**
 * Parse actions from DOM attribute ("mk-action")
 *
 * @return void
 * @param {string} str Action attribute
 * @private
 * @author nd
 **/
function parseActions (str) {
  var a = str.split(';')
  var actions = {}

  for(var n in a) {
    var action = a[n].split(':')
    actions[action[0].trim()] = action[1].trim()
  }

  return actions
}


/**
 * Apply actions' handlers on DOM node
 * It will trigger 'scope-lookup' event on the DOM tree in order to find out the current context scope
 *
 * @return void
 * @param {string} action Action Name
 * @param {string} qKey Qualified Key Name (or限定键名) of $scope
 * @param {JQuery} node DOM Node
 * @author nd
 **/
exports.handleAction = function (action, qKey, node) {
  node.trigger('scope-lookup', [function ($scope) {
    console.log('scope looked up:', action, qKey, $scope)
    if($scope) {
      actions[action].call({}, qKey, $scope, node)
    }
    else {
      console.warn('Warning: No scope binding found on node:', node)
      return
    }
  }])
}

/**
 * Action register
 *
 * @return void
 * @param {string} name Action Name
 * @param {Function} handler Action Handler
 * @author nd
 **/
exports.registerAction = function (name, handler) {
  actions[name] = handler
}


/**
 * Bind scope-lookup event on DOM node
 * Once the function call, all the children of **node** will get **$scope** as their context scope
 * when they trigger 'scope-lookup' event
 *
 * @return void
 * @param {JQuery} node DOM Node
 * @param {Scope} $scope Scope
 * @author nd
 **/
exports.bindScopeLookup = function (node, $scope) {
  node.on('scope-lookup', function (event, askScope) {
    askScope($scope)
    event.stopPropagation()
  })
}