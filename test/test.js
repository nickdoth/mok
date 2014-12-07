window.Scope = require('../lib/scope').Scope

var $ = require('jquery')
var mk = require('..')


mk.controller('demo-form', function ($scope) {
  $scope.$declareScope({
    data : {
      name: '',
      defaultEmail: mk.relation(function () {
        return this.name + '@maple.com'
      }).to(['name']),
      queries: [
        { id: 1, value: 'foo' },
        { id: 2, value: 'bar' }
      ]
    },
    
    submit: function () {
      alert('This should be called on submit.')
      return false
    }
  })

  window.demoScope = $scope
})

$(document).ready(function () {
  mk.startApp()
})