window.Scope = require('../lib/scope').Scope

var $ = require('jquery')
var mk = require('..')


mk.controller('demo-form', function ($scope) {
  $scope.$declareScope({
    data : {
      name: '',
      defaultEmail: mk.relation(function () {
        return this.name + '@domain.com'
      }).to(['name']),
      queries: [
        { name: 'Jack', email: 'jack@domain.com' },
        { name: 'Tony', email: 'tony@domain.com' }
      ]
    },
    
    submit: function () {
      alert('This should be called on submit.')
      return false
    },

    add: function () {
      this.data.queries.push({ name: this.data.name, email: this.data.defaultEmail })
    }
  })

  window.demoScope = $scope
})

$(document).ready(function () {
  mk.startApp()
})