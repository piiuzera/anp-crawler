angular.module('test').controller('stationsController', function($scope, dataService) {
	dataService.getData().then(function(res) {
		$scope.data = res.data;
	});

	$scope.getData = function() {
		dataService.getData().then(function(res) {
			$scope.data = res.data;
		});
	};
});