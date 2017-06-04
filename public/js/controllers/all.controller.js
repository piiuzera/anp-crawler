angular.module('test').controller('allController', function($scope, dataService) {
	dataService.getData().then(function(res) {
		$scope.data = res.data;
	});

	$scope.getData = function() {
		dataService.getData().then(function(res) {
			$scope.data = res.data;
		});
	};
});