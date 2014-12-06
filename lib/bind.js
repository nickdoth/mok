var $ = require('jquery')
var bindings = require('./bindings')
// var filters = bindings.filters

module.exports = function ($scope, parentNode) {
	parentNode = $(parentNode)

	bindExtensions($scope, parentNode)

	// $scope.$on('update', function (fullKey, key, $target) {
	// 	parentNode.find('[mk-bind="' + fullKey +'"]').html(filters[key]($target[key]))
	// })
	
}

function bindExtensions ($scope, parentNode) {
	parentNode.find('[mk-action]').each(function () {
		var node = $(this)
		var actions = parseActions(node.attr('mk-action'))

		for(var handle in actions) {
			if(!actions.hasOwnProperty(handle)) {
				continue
			}

			bindings.handleBinding(handle, actions[handle], $scope, node)
		}
	})
}

function parseActions(str) {
	var a = str.split(',')
	var actions = {}

	for(var n in a) {
		var action = a[n].split(':')
		actions[action[0].trim()] = action[1].trim()
	}

	return actions
}