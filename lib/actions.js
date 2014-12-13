var $ = require('jquery')
var scopes = require('./scope')
var Scope = scopes.Scope
var bindUtil = require('./bind-util')

// default binding actions

exports.click = function (qKey, $scope, node) {
  node.on('click', function () {
    $scope.$call(qKey)
  })
}

exports.typing = function (qKey, $scope, node) {
  node.on('keydown', function (e) {
    setTimeout(function () {
      $scope.$set(qKey, $(e.target).val())
    }, 0)
  })

  node.on('change', function (e) {
    setTimeout(function () {
      $scope.$set(qKey, $(e.target).val())
    }, 0)
  })

  $scope.$on('update', function (fullKey, key, $target) {
    if(qKey !== fullKey) {
      return
    }
    node.val($target[key].toString())
  })

  // trigger update event on ready
  $scope.$triggerUpdate(qKey)
}

exports.change = function (qKey, $scope, node) {
  node.on('change', function (e) {
    setTimeout(function () {
      $scope.$set(qKey, $(e.target).val())
    }, 0)
  })

  $scope.$on('update', function (fullKey, key, $target) {
    if(qKey !== fullKey) {
      return
    }
    node.val($target[key].toString())
  })

  // trigger update event on ready
  $scope.$triggerUpdate(qKey)
}

exports.submit = function (qKey, $scope, node) {
  node.on('submit', function () {
    return $scope.$get(qKey).call(node)
  })
}

exports.text = function (qKey, $scope, node) {
  $scope.$on('update', function (fullKey, key, $target) {
    if(qKey !== fullKey) {
      return
    }
    console.log('Text updating', fullKey, key, $target)
    node.html($target[key].toString())
  })

  // trigger update event on ready
  $scope.$triggerUpdate(qKey)
}

exports.autofocus = function (qKey, $scope, node) {
  setTimeout(function () {
    node.focus()
  }, 10)
}


// block-level actions

exports.with = function (qKey, $scope, node) {
  // Clear all parent handlers
  node.on('scope-lookup', function (event, askScope) {
    console.log('captured action by "with"', event.target)
    askScope($scope[qKey])
    event.stopPropagation()
  })

  // exports.bind($scope[qKey], node)
}



exports.repeat = function (qKey, $scope, node) {
  node.on('scope-lookup', function (event, askScope) {
    console.log('captured action', event.target)
    askScope($scope[qKey])
    event.stopPropagation()
  })

  // console.log($scope, qKey)
  var group = $scope.$get(qKey)
  console.log('jQ', $)
  var child = $(node.children()[0]).remove()
  var proto = child.clone()
  var parent = node

  // child.data('removed', true)

  console.log($scope)
  group.forEach(function (item) {
    forEach_bind(parent, proto, item)
  })

  group.$on('group-add', function (index, item, $group) {
    forEach_bind(parent, proto, item)
  })

  group.$on('group-remove', function (index, item, $group) {
    console.log('onremove', index, item, $group)
    parent.children().each(function () {
      var itemNode = $(this)
      if(itemNode.data('bind-data') === item) {
        itemNode.remove()
        return false
      }
    })
  })

  group.$on('group-remove-all', function ($group) {
    console.log('onremoveall', $group)
    parent.children().each(function () {
      var itemNode = $(this)
      itemNode.remove()
    })
  })

}


// Helper functions

function forEach_bind(parent, proto, item) {
  var itemNode = proto.clone()
  parent.append(itemNode)

  // exports.bindScopeLookup(itemNode, item)
  bindUtil.bind(item, itemNode)

  itemNode.data('bind-data', item)
}