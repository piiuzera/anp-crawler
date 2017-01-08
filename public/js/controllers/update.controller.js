angular.module('test').controller('updateController', function($scope, dataService) {
	$scope.updateData = function() {
		dataService.updateData().then(function(res) {
			$scope.success = res.data.message;
			$('button').button('reset');
		}, function(ex) {
			$scope.error = ex.data.message;
			$('button').button('reset');
		});
	};
});