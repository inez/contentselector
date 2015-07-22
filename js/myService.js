Parse.initialize(
	"tUzPhzVVSBUf3MvyddveJxCX6BFLlvoCxHzeSIWE",
	"dSfexZgyttz19OmpbfglQvS8SWzBuaGB3sJqcTTR"
);

var ProjectObject = Parse.Object.extend("ProjectObject");

app.factory('myService', function($q) {
	return {
		createProject: function(name, domain, articles) {
			return $q(function(resolve, reject) {
				var articlesNames = articles.split('\n');
				var reqs = [];
				for(var i = 0; i < articlesNames.length; i++) {
					var articleName = articlesNames[i];
					reqs.push(
						$.getJSON(
							'http://' + domain + '/api.php?format=json&uselang=en&action=visualeditor&paction=parse&page=' + articleName + '&callback=?'
						)
					);
				}
				$.when.apply($, reqs)
				.then(function () {
					console.log(arguments);
				})
				.fail( function() {
					alert('Something went wrong. Talk to Inez.');
				});
			});
		}
	};
});