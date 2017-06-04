angular.module('test', ['ngRoute']);

angular.module('test').config(['$locationProvider', function($locationProvider) {
	$locationProvider.hashPrefix('');
}]);

angular.module('test').config(function($routeProvider) {
	$routeProvider
	.when('/', {
		templateUrl: 'views/index.view.html',
		controller:  'indexController'
	})
	.when('/all', {
		templateUrl: 'views/all.view.html',
		controller:  'allController'
	})
	.when('/stations', {
		templateUrl: 'views/stations.view.html',
		controller:  'stationsController'
	})
	.when('/update', {
		templateUrl: 'views/update.view.html',
		controller:  'updateController'
	})
	.otherwise({
		redirectTo: '/'
	});
});