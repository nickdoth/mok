/**
 * Scope object
 */
var Relation = require('./relation').Relation
var ScopeEventTarget = require('./scope-event-target').ScopeEventTarget
var ScopeGroup = require('./scope-group').ScopeGroup


function Scope (d) {
  if (!(this instanceof Scope)) {
    return new Scope(d)
  }

  if(d) {
    this.$declareScope(d)
  }

  this.$on('update', function (keyFullName, key, $target) {
    this.$propagateEvent('update', this.$scopeName + '.' + keyFullName, key, $target)
    return false
  })
}

var $scope = Scope.prototype = new ScopeEventTarget()

$scope.$declareScope = function (d) {
  for (var n in d) {
    if(!d.hasOwnProperty(n)) {
      continue
    }
    

    if (d[n] instanceof Function) {
      this[n] = d[n]
    }
    else if (d[n] instanceof Relation) {
      this.$declareRelator( n, d[n] )
    }
    else if (d[n] instanceof Array) {
      var $childScope = new ScopeGroup(d[n])
      $childScope.$parent = this
      $childScope.$scopeName = n
      this.$declareProperty( n, $childScope )
    }
    else if (typeof d[n] === 'object') {
      var $childScope = new Scope(d[n])
      $childScope.$parent = this
      $childScope.$scopeName = n
      this.$declareProperty( n, $childScope )
    }
    else {
      this.$declareProperty( n, d[n] )
    }

  }
}

$scope.$declareProperty = function (valKey, value) {
  this.$primitive = this.$primitive || {}
  this.$primitive[valKey] = value

  Object.defineProperty(this, valKey, {
    get: function () {
      return this.$primitive[valKey]
    },
    set: function (_val) {
      if(_val === this.$primitive[valKey]) {
        return
      }

      this.$primitive[valKey] = _val

      this.$trigger('update', valKey, valKey, this)
      
    }
  })
}

$scope.$declareRelator = function (valKey, relation) {
  Object.defineProperty(this, valKey, {
    get: function () {
      return relation.getter.call(this)
    },
    set: function (_val) {
      if(!relation.setter) {
        return
      }

      relation.setter.call(this, _val)
      this.$trigger('update', valKey, valKey, this)
    }
  })

  this.$on('update', function (fullKey, key, $target) {
    for(var n in relation.to) {
      if(relation.to[n] === fullKey) {
        this.$trigger('update', valKey, valKey, this)
        break
      }
    }   
  })

}

$scope.$pset = function (key, value) {
  this.$primitive[key] = value
}

$scope.$pget = function (key) {
  return this.$primitive[key]
}

$scope.$get = function (fullKey) {
  if(!fullKey) { return this }
  var parts = fullKey.trim().split('.')
  var child = this

  for(var i = 0; i < parts.length; i++) {
    if(child[ parts[i] ]) {
      child = child[ parts[i] ]
    }
    else {
      return undefined
    }
  }
  return child
}

$scope.$set = function (fullKey, value) {
  var parts = fullKey.trim().split('.')
  var key = parts.pop()
  var parent = this

  for(var i = 0; i < parts.length; i++) {
    if(parent[ parts[i] ]) {
      parent = parent[ parts[i] ]
    }
    else {
      break
    }
  }

  parent[key] = value
}

$scope.$triggerUpdate = function (fullKey) {
  this.$trigger('update', fullKey, fullKey.split('.').pop(), this)
}

$scope.$call = function (key) {
  var $thatScope = this.$get(exports.parentKey(key))
  console.log($thatScope)
  var args = Array.prototype.slice.call(arguments, 1)
  return this.$get(key).apply($thatScope, args)
}

$scope.$scopeName = null
$scope.$primitive = null



exports.createScope = Scope
exports.Scope = Scope

exports.parentKey = function (key) {
  var parts = key.split('.')
  parts.pop()

  if(!parts.length) {
    return ''
  }
  else {
    return parts.join('.')
  }
}