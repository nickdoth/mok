var Scope = require('../lib/scope').Scope

var $ = require('jquery')
var mk = require('..')
var Controller = require('../controller')

class Person extends Scope {
  constructor(name, email) {
    super({ name: name, email: email });
  }

  remove() {
    this.$parent.remove(this);
  }
}


var app = mk.createApp()
app.Person = Person

app.IndexController = Controller.Extend({
  data : {
    name: '',
    defaultEmail: mk.relation(function () {
      return this.name.toLowerCase() + '@domain.com'
    }).to(['name']),
    queries: [
      new Person('Jack', 'jack@domain.com'),
      new Person('Tony', 'tony@domain.com')
    ]
  },
  
  submit: function () {
    alert('This should be called on submit.')
    return false
  },

  add: function () {
    this.data.queries.push( new Person(this.data.name, this.data.defaultEmail) )
  }
})

  
  // window.demoScope = $scope


$(document).ready(function () {
  mk.startApp(app)
})




