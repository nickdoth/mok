window.Scope = require('../lib/scope')

var $ = require('jquery')
var mk = require('..')


mk.controller('demo-form', function ($scope) {
  $scope.$declareScope({
    data : {
      name: '',
      defaultEmail: mk.relation(function () {
        return this.name + '@maple.com'
      }).to(['name'])
    },
    
    submit: function () {
      alert('This should be called on submit.')
      return false
    }
  })
})

$(document).ready(function () {
  mk.startApp()
})