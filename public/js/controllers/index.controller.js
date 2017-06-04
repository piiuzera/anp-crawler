angular.module('test')
	.controller('indexController', ['$scope',
		function($scope) {

			$scope.disciplina = {};

			$scope.alunos = [];

			var _init = function() {
				$scope.disciplina.nome 		= 'Banco de Dados 2';
				$scope.disciplina.professor = 'Humberto Mosrri';

				$scope.alunos.push("Gabriel Barbosa");
				$scope.alunos.push("Luiz Paulo da Silva");
				$scope.alunos.push("Matheus Neiva Amaro");
				$scope.alunos.push("Matheus Velloso");
				$scope.alunos.push("Tharyck Gusmão");
			};

			$scope.Init = _init;
}]);