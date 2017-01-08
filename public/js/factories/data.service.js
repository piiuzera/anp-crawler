angular.module('test').factory('dataService', function($http) {
	var _getData = function() {
		return $http.get('/data');
	};

	var _updateData = function() {
		return $http.get('/update');
	}

	return {
		getData:    _getData,
		updateData: _updateData
	};
});