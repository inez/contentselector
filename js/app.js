var createDocumentFromHtmlUsingDomParser = function ( html ) {
	// IE doesn't like empty strings
	html = html || '<body></body>';

	try {
		var newDocument = new DOMParser().parseFromString( html, 'text/html' );
		if ( newDocument ) {
			return newDocument;
		}
	} catch ( e ) { }
};

var getElement = function(element) {
	var typeofAttribute = element.getAttribute('typeof');
	if ( typeofAttribute && typeofAttribute === 'mw:Transclusion' ) {
		return {
			type: 'template',
			name: $(element).data('mw').parts[0].template.target.href
		};
	} else if ( typeofAttribute && typeofAttribute.indexOf('mw:Image') === 0 ) {
		return {
			type: 'image',
			name: typeofAttribute,
			content: element.outerHTML
		};
	} else if ( typeofAttribute && typeofAttribute.indexOf('mw:Extension') === 0 ) {
		return {
			type: 'extension',
			name: typeofAttribute
		};
	} else if ( element.nodeName === 'UL' || element.nodeName === 'OL' ) {
		return {
			type: 'list',
			content: element.outerHTML
		};
	} else if ( element.nodeName === 'P' ) {
		return {
			type: 'paragraph',
			content: element.outerHTML
		};
	} else if (
		element.nodeName === 'H1' ||
		element.nodeName === 'H2' ||
		element.nodeName === 'H3' ||
		element.nodeName === 'H4' ||
		element.nodeName === 'H5' ||
		element.nodeName === 'H6'
	) {
		return {
			type: 'heading',
			content: element.outerHTML
		};
	} else {
		return {
			type: 'ignore'
		};
	}
};

///

var app = angular.module('ngContentSelector', ['ngRoute', 'ngSanitize']);

app.controller('ProjectListController', function($scope, $route, $routeParams, $location, myService) {
	$scope.projects = [];
	myService.getProjects().then(function(projects) {
		for(var index in projects) {
			$scope.projects.push({
				id: index,
				name: projects[index].name,
				domain: projects[index].domain,
				articles: projects[index].articles,
			});
		}
	});
	$scope.getXML = function(project) {
		var articles = [];		

		for(var i = 0; i < project.articles.length; i++) {
			var htmlDOM = [];
			var article = project.articles[i];
			var doc = createDocumentFromHtmlUsingDomParser(article.content);
			for(var index in article.selected) {
				var element = doc.body.children[index];
				$(element).find('[typeof="mw:Extension/ref"]').remove();
				htmlDOM.push(element.outerHTML);
			}
			articles.push({
				htmldom: htmlDOM.join("\n\n"),
				title: article.title,
				oldid: article.oldid
			});
		}
		var $form = $('<form action="http://public.inez.wikia-dev.com/contentselector/proxy.php?mode=multi" method="POST"></form>');
		$('<input name="articles" type="hidden"/>').val(JSON.stringify(articles)).appendTo($form);
		$('<input name="domain" type="hidden"/>').val(project.domain).appendTo($form);
		$form.submit();
	};

});

app.controller('ProjectCreateController', function($scope, $route, $routeParams, $location, myService) {
	$scope.creating = false;
	$scope.name = null;
	$scope.domain = 'callofduty.wikia.com';
	$scope.articles = 'Origins\nLilith_Swann\nReese';
	$scope.create = function() {
		if ( $scope.creating === true ) {
			return;
		}
		$scope.creating = true;
		myService
			.createProject($scope.name, $scope.domain, $scope.articles)
			.then(
				function() {
					$scope.creating = false;
					$location.path('/');
				},
				function(err) {
					alert(err);
				}
			);
	};
});

app.controller('ProjectEditController', function($scope, $route, $routeParams, $location, $routeParams, myService) {
	myService.getProject($routeParams.projectId).then(function(data) {
		$scope.articles = data.articles;
		$scope.domain = data.domain;
		$scope.index = 0;
	});

	$scope.prev = function() { $scope.index--; };
	$scope.next = function() { $scope.index++; };

	$scope.$watch('articles', setElements);
	$scope.$watch('index', setElements);

	$scope.click = function(element, e) {
		if ( element.selected ) {
			myService.unselect($routeParams.projectId, $scope.index, $scope.elements.indexOf(element));
			element.selected = false;
			$scope.elements.indexOf(element).selected = false;
			delete $scope.articles[$scope.index].selected[$scope.elements.indexOf(element)];
		} else {
			myService.select($routeParams.projectId, $scope.index, $scope.elements.indexOf(element));
			element.selected = true;
			if ( !$scope.articles[$scope.index].selected ) {
				$scope.articles[$scope.index].selected = {};
			}
			$scope.articles[$scope.index].selected[$scope.elements.indexOf(element)] = true;
		}
		generateWikitext();
		e.preventDefault();
	};

	$scope.mouseover = function(element, $element) {
	};

	function generateWikitext() {
		function countWords(str) {
			return str.trim().split(/\s+/).length;
		}
		var count = 0;
		for(var index in $scope.articles[$scope.index].selected) {
			var text = $($scope.elements[index].element).text();
			count += countWords(text);
		}

		$scope.wordCount = count;
		return;
		var htmlDOM = [];
		for(var index in $scope.articles[$scope.index].selected) {
			htmlDOM.push($scope.elements[index].element.outerHTML);
		}
		myService.getWikitext(
			$scope.domain,
			$scope.articles[$scope.index].title,
			$scope.articles[$scope.index].oldid,
			htmlDOM.join("\n\n")
		).then(function(data) {
			$scope.wt = data.wt;
		});
	}

	function setElements() {
		if(!$scope.articles) {
			return null;
		}
		$scope.elements = [];
		var article = $scope.articles[$scope.index];
		var selected = article.selected || [];
		var doc = createDocumentFromHtmlUsingDomParser(article.content);
		for ( var i = 0; i < doc.body.children.length; i++ ) {
			var child = document.importNode(doc.body.children[i], true);
			var element = getElement(child);
			element.selected = i in selected;
			element.element = child;
			$scope.elements.push(element);
		}
		generateWikitext();
	}
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
		.when('/Project/Edit/:projectId', {
			templateUrl: '/templates/ProjectEdit.html',
			controller: 'ProjectEditController'
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