// Scope object
// qKey - Qualified Key Name (限定键名)

var Relation = require('./relation').Relation
var ScopeEventTarget = require('./scope-event-target').ScopeEventTarget
var ScopeGroup
var ExtendHelper = require('./util').ExtendHelper

/**
 * @module scope
 **/
/**
 * Scope Object Constructor
 *
 * @class Scope
 * @extends ScopeEventTarget
 * @constructor
 * @return {Scope} new Scope Object
 * @param {Object} d Declaration
 * @author nd
 **/
class Scope extends ScopeEventTarget {
  constructor(d) {
    // if (!(this instanceof Scope)) {
    //   return new Scope(d);
    // }
    super();
    if (d) {
      this.$declareProperties(d);
    }
    this.$on('update', function (qKey, key, $target) {
      this.$propagateEvent('update', this.$scopeName + '.' + qKey, key, $target);
      return false;
    });
  }
  /**
   * Declare several properties in the scope
   *
   * @return void
   * @param {Object} d Declaration
   * @author nd
   **/
  $declareProperties(d) {
    for (var n in d) {
      if (!d.hasOwnProperty(n)) {
        continue;
      }
      this.$declareProperty(n, d[n]);
    }
  }
  /**
   * Declare a property in the scope
   *
   * @return void
   * @param {string} prop Property Name
   * @param {any} value Property Value
   * @author nd
   **/
  $declareProperty(prop, value) {
    var scope = this;
    if (value instanceof Function) {
      scope[prop] = value;
    }
    else if (value instanceof Relation) {
      scope.$declareRelator(prop, value);
    }
    else if (value instanceof Scope) {
      var $childScope = value;
      $childScope.$parent = scope;
      $childScope.$scopeName = prop;
      scope.$declareAccessor(prop, $childScope);
    }
    else if (value instanceof Array) {
      var $childScope = new ScopeGroup(value);
      $childScope.$parent = scope;
      $childScope.$scopeName = prop;
      scope.$declareAccessor(prop, $childScope);
    }
    else if (typeof value === 'object') {
      var $childScope = new Scope(value);
      $childScope.$parent = scope;
      $childScope.$scopeName = prop;
      scope.$declareAccessor(prop, $childScope);
    }
    else {
      scope.$declareAccessor(prop, value);
    }
  }
  /**
   * Declare a normal accessor in the scope.
   * This method will be called by this.$declareProperty
   *
   * @return void
   * @param {string} valKey Property Name
   * @param {any} value Property Value
   * @private
   * @author nd
   **/
  $declareAccessor(valKey, value) {
    this.$primitive = this.$primitive || {};
    this.$primitive[valKey] = value;
    Object.defineProperty(this, valKey, {
      get: function () {
        return this.$primitive[valKey];
      },
      set: function (_val) {
        if (_val === this.$primitive[valKey]) {
          return;
        }
        this.$primitive[valKey] = _val;
        this.$trigger('update', valKey, valKey, this);
      }
    });
  }
  /**
   * Declare a relator in the scope.
   * This method will be called by this.$declareProperty
   *
   * @return void
   * @param {string} valKey Property Name
   * @param {Relation} relation Relation Property
   * @private
   * @author nd
   **/
  $declareRelator(valKey, relation) {
    Object.defineProperty(this, valKey, {
      get: function () {
        return relation.getter.call(this);
      },
      set: function (_val) {
        if (!relation.setter) {
          return;
        }
        relation.setter.call(this, _val);
        this.$trigger('update', valKey, valKey, this);
      }
    });
    this.$on('update', function (qKey, key, $target) {
      for (var n in relation.to) {
        if (relation.to[n] === qKey) {
          this.$trigger('update', valKey, valKey, this);
          break;
        }
      }
    });
  }
  /**
   * Directly set a primitive value.
   * Use this carefully
   *
   * @return void
   * @param {string} key Property Name
   * @param {any} value Property Value
   * @author nd
   **/
  $pset(key, value) {
    this.$primitive[key] = value;
  }
  /**
   * Directly get a primitive value.
   * Use this carefully
   *
   * @return value
   * @param {string} key Property Name
   * @author nd
   **/
  $pget(key) {
    return this.$primitive[key];
  }
  /**
   * Query value via Qualified Key.
   *
   * @return value
   * @param {string} qKey Property Name
   * @author nd
   **/
  $get(qKey) {
    console.log('$get', qKey);
    if (!qKey) {
      return this;
    }
    var parts = qKey.trim().split('.');
    var child = this;
    for (var i = 0; i < parts.length; i++) {
      if (child[parts[i]]) {
        child = child[parts[i]];
      }
      else {
        return undefined;
      }
    }
    return child;
  }
  /**
   * Set value via Qualified Key
   *
   * @return value
   * @param {string} qKey Property Name
   * @param {any} value Property Value
   * @author nd
   **/
  $set(qKey, value) {
    var parts = qKey.trim().split('.');
    var key = parts.pop();
    var parent = this;
    for (var i = 0; i < parts.length; i++) {
      if (parent[parts[i]]) {
        parent = parent[parts[i]];
      }
      else {
        break;
      }
    }
    parent[key] = value;
  }
  /**
   * Easier way to trigger update event
   *
   * @return value
   * @param {string} qKey Property Qualified Key Name
   * @author nd
   **/
  $triggerUpdate(qKey) {
    this.$trigger('update', qKey, qKey.split('.').pop(), this);
  }
  /**
   * Call a function using Qualified Key
   *
   * @return Anything
   * @param {string} key Property Qualified Key Name
   * @author nd
   **/
  $call(key) {
    var $thatScope = this.$get(exports.parentKey(key));
    console.log('Calling', key, $thatScope);
    var args = Array.prototype.slice.call(arguments, 1);
    return this.$get(key).apply($thatScope, args);
  }
}

var $scope = Scope.prototype = new ScopeEventTarget()












Scope.prototype.$scopeName = null
// Scope.prototype.$primitive = null


Scope.Extend = ExtendHelper

exports.createScope = Scope
exports.Scope = Scope

/**
 * Get the parent key of a key
 * 
 * @return parentKey
 * @param {string} Key Name
 * @author nd
 **/
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

/**
 * Define a property that is unenumerable.
 * 
 * @return parentKey
 * @param {Object} Owner Object
 * @param {string} Property Name
 * @param {any} Property Value
 * @private
 * @author nd
 **/
function hidden (object, prop, value) {
  Object.defineProperty(object, prop, {
    value: value,
    enumerable: false,
    writable: false
  })
}



ScopeGroup = require('./scope-group').ScopeGroup