var $ = require('jquery')
var scopes = require('./scope')
var Scope = scopes.Scope


// var filters = bindings.filters

exports.bind = function ($scope, parentNode) {
  parentNode = $(parentNode)

  parentNode.on('scope-lookup', function (event, askScope) {
    askScope($scope)
    event.stopPropagation()
  })
  // 
  parentNode.find('[mk-action]').each(function () {
    var node = $(this)
    exports.bindElement(node)
  })
}

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

      exports.handleBinding(handle, actions[handle], node)
    }

    node.data('isBinding', true)
  
}

function parseActions (str) {
  var a = str.split(',')
  var actions = {}

  for(var n in a) {
    var action = a[n].split(':')
    actions[action[0].trim()] = action[1].trim()
  }

  return actions
}



exports.handleBinding = function (handle, actionKey, node) {
  node.trigger('scope-lookup', [function ($scope) {
    console.log('scope looked up:', handle, actionKey, $scope)
    if($scope) {
      handlers[handle].call({}, actionKey, $scope, node)
    }
    else {
      console.warn('Warning: No scope binding found on node:', node)
      return
    }
  }])
}

exports.registerBinding = function (name, handler) {
  handlers[name] = handler
}



// default binding handlers
var handlers = exports.handlers = {
  'click': function (actionKey, $scope, node) {
    node.on('click', function () {
      $scope.$call(actionKey)
    })
  },
  'typing': function (actionKey, $scope, node) {
    node.on('keydown', function (e) {
      setTimeout(function () {
        $scope.$set(actionKey, $(e.target).val())
      }, 0)
    })

    node.on('change', function (e) {
      setTimeout(function () {
        $scope.$set(actionKey, $(e.target).val())
      }, 0)
    })

    $scope.$on('update', function (fullKey, key, $target) {
      if(actionKey !== fullKey) {
        return
      }
      node.val($target[key].toString())
    })

    // trigger update event on ready
    $scope.$triggerUpdate(actionKey)
  },
  'change': function (actionKey, $scope, node) {
    node.on('change', function (e) {
      setTimeout(function () {
        $scope.$set(actionKey, $(e.target).val())
      }, 0)
    })

    $scope.$on('update', function (fullKey, key, $target) {
      if(actionKey !== fullKey) {
        return
      }
      node.val($target[key].toString())
    })

    // trigger update event on ready
    $scope.$triggerUpdate(actionKey)
  },
  'submit': function (actionKey, $scope, node) {
    node.on('submit', function () {
      return $scope.$get(actionKey).call(node)
    })
  },
  'text': function (actionKey, $scope, node) {
    $scope.$on('update', function (fullKey, key, $target) {
      if(actionKey !== fullKey) {
        return
      }

      node.html($target[key].toString())
    })

    // trigger update event on ready
    $scope.$triggerUpdate(actionKey)
  },

  // block-level actions

  'with': function (actionKey, $scope, node) {
    // Clear all parent handlers
    node.on('scope-lookup', function (event, askScope) {
      console.log('captured action by "with"', event.target)
      askScope($scope[actionKey])
      event.stopPropagation()
    })

    // exports.bind($scope[actionKey], node)
  },


  'repeat': function (actionKey, $scope, node) {
    node.on('scope-lookup', function (event, askScope) {
      console.log('captured action', event.target)
      askScope($scope[actionKey])
      event.stopPropagation()
    })

    // console.log($scope, actionKey)
    var group = $scope.$get(actionKey)
    var child = $(node.children()[0]).remove()
    var proto = child.clone()
    var parent = node

    // child.data('removed', true)

    console.log($scope)
    group.forEach(function (item) {
      forEach_bind(parent, proto, item)
    })

    group.$on('group-add', function (idnex, item, $group) {
      forEach_bind(parent, proto, item)
    })

    group.$on('group-remove', function (idnex, item, $group) {
      console.log('onremove')
      parent.children().each(function () {
        var itemNode = $(this)
        if(itemNode.data('bind-data') === item) {
          itemNode.remove()
          return false
        }
      })
    })

  }

}


function forEach_bind(parent, proto, item) {
  var itemNode = proto.clone()
  parent.append(itemNode)

  // exports.bindScopeLookup(itemNode, item)
  exports.bind(item, itemNode)

  itemNode.data('bind-data', item)
}



exports.bindScopeLookup = function (node, $scope) {
  node.on('scope-lookup', function (event, askScope) {
    askScope($scope)
    event.stopPropagation()
  })
}