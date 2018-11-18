class ScopeEventTarget {
  $parent = null
  $$events = null

  constructor() {
  }

  $trigger(event, isAssign) {
    var isPropagation = true;
    if (!this.$$events) {
      return;
    }
    if (!this.$$events[event]) {
      return;
    }
    var listeners = this.$$events[event];
    var args = Array.prototype.slice.call(arguments, 1);
    for (var n in listeners) {
      var p = listeners[n].apply(this, args);
      if (!p && p !== undefined) {
        isPropagation = false;
      }
    }
    if (isPropagation && !isAssign) {
      this.$propagateEvent.apply(this.$parent, arguments);
    }
  }

  $propagateEvent(event) {
    if (this.$parent) {
      this.$parent.$trigger.apply(this.$parent, arguments);
    }
  }

  $on(event, listener) {
    this.$$events = this.$$events || {};
    var events = this.$$events;
    events[event] = events[event] || [];
    events[event].push(listener);
  }
}


exports.ScopeEventTarget = ScopeEventTarget