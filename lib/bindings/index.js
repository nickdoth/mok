var $ = require('jquery')

exports.handleBinding = function (handle, actionKey, $scope, node) {
	handlers[handle].call({}, actionKey, $scope, node)
}

exports.registerBinding = function (name, handler) {
	handlers[name] = handler
}

// default binding handlers
var handlers = exports.handlers = {
	'click': function (actionKey, $scope, node) {
		node.on('click', function () {
			$scope.$get(actionKey).call(node)
		})
	},
	'value': function (actionKey, $scope, node) {
		node.on('keydown', function (e) {
			setTimeout(function () {
				$scope.$set(actionKey, $(e.target).val())
			}, 0)
		})

		$scope.$on('update', function (fullKey, key, $target) {
			if(actionKey !== fullKey) {
				return
			}
			node.val($target[key].toString())
		})
	},
	'submit': function (actionKey, $scope, node) {
		node.on('submit', function () {
			return $scope.$get(actionKey).call(node)
		})
	},
	'text': function (actionKey, $scope, node) {
		$scope.$on('update', function (fullKey, key, $target) {
			if(actionKey !== fullKey) {
				return
			}

			node.html($target[key].toString())
		})
	}
}
