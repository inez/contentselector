var app = angular.module('ngContentSelector', ['ngRoute']);

app.controller('ProjectListController', function($scope, $route, $routeParams, $location) {
	$scope.projects = localStorage.getItem('projects') || [];
});

app.controller('ProjectCreateController', function($scope, $route, $routeParams, $location, myService) {
	$scope.creating = false;
	$scope.name = null;
	$scope.domain = 'callofduty.wikia.com';
	$scope.articles = '1\n2\n3';
	$scope.create = function() {
		if ( $scope.creating === true ) {
			return;
		}
		$scope.creating = true;
		myService
			.createProject($scope.name, $scope.domain, $scope.articles)
			.then(function() {
				$scope.creating = false;
				console.log('Project created');
			});
	};
});

app.config(function($routeProvider, $locationProvider) {
	$routeProvider
		.when('/Project/List', {
			templateUrl: '/templates/ProjectList.html',
			controller: 'ProjectListController'
 		})
		.when('/Project/Create', {
			templateUrl: '/templates/ProjectCreate.html',
			controller: 'ProjectCreateController'
 		})
		.otherwise({
			redirectTo: '/Project/List'
		});

	// configure html5 to get links working on jsfiddle
	$locationProvider.html5Mode({
		enabled: true,
		requireBase: false
	});
});