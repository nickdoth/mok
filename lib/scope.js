var Relation = require('./relation')

module.exports = Scope

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

var $scope = Scope.prototype

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
    else if (typeof d[n] === 'object') {
      var $childScope = new Scope(d[n])
      $childScope.$parent = this
      $childScope.$scopeName = n
      this.$declarePoperty( n, $childScope )
    }
    else {
      this.$declarePoperty( n, d[n] )
    }

  }
}

$scope.$declarePoperty = function (valKey, value) {
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

// properties

$scope.$parent = null
$scope.$scopeName = null
$scope.$primitive = null


// events

$scope.$$events = null

$scope.$trigger = function (event) {
  var isPropagation = true
  if(!this.$$events) {
    return
  }
  if(!this.$$events[event]) {
    return
  }

  var listeners = this.$$events[event]
  console.log(listeners)
  var args = Array.prototype.slice.call(arguments, 1)
  for(var n in listeners) {
    var p = listeners[n].apply(this, args)
    if(!p && p !== undefined) {
      isPropagation = false
    }
  }

  if(isPropagation) {
    this.$propagateEvent.apply(this.$parent, arguments)
  }
}

$scope.$propagateEvent = function (event) {
  if(this.$parent) {
    this.$parent.$trigger.apply(this.$parent, arguments)
  }
}

$scope.$on = function (event, listener) {
  this.$$events = this.$$events || {}
  var events = this.$$events

  events[event] = events[event] || []

  events[event].push(listener)
}