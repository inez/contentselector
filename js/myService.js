var myFirebaseRef = new Firebase("https://contentselector.firebaseio.com/");

app.factory('myService', function($q) {
	console.log('myService');
	return {
		unselect: function(projectId, articleIndex, elementIndex) {
			var ref = new Firebase("https://contentselector.firebaseio.com/projects/"+projectId+"/articles/"+articleIndex+"/selected/"+elementIndex);
			ref.remove();
		},
		select: function(projectId, articleIndex, elementIndex) {
			var ref = new Firebase("https://contentselector.firebaseio.com/projects/"+projectId+"/articles/"+articleIndex+"/selected/"+elementIndex);
			ref.set(true);
		},
		getProject: function(projectId) {
			return $q(function(resolve, reject) {
				new Firebase("https://contentselector.firebaseio.com/projects/"+projectId).once('value', function(snap) {
					var data = snap.val();
					var reqs = [];
					for(var i = 0; i < data.articles.length; i++) {
						reqs.push(
							$.getJSON(
								'http://' + data.domain + '/api.php?format=json&uselang=en&action=visualeditor&paction=parse&page=' + data.articles[i]['title'] + '&oldid=' + data.articles[i]['oldid'] + '&callback=?'
							)
						);
					}
					$.when.apply($, reqs)
						.then(function () {
							if ( ! arguments[0][0] ) {
								arguments = [arguments];
							}
							for(var i = 0; i < arguments.length; i++) {
								data.articles[i].content = arguments[i][0].visualeditor.content;
							}
							resolve(data);
					})
					.fail( function() {
						reject('Something went wrong. Talk to Inez.');
					});
				});
			});
		},
		getProjects: function() {
			return $q(function(resolve, reject) {
				var projectsRef = myFirebaseRef.child("projects");
				projectsRef.on("value", function(snapshot) {
					resolve(snapshot.val());
				});
			});
		},
		getWikitext: function(domain, articleName, oldid, htmldom) {
			return $q(function(resolve, reject) {
				$.post(
					'http://public.inez.wikia-dev.com/contentselector/proxy.php?mode=single',
					{
						domain: domain,
						articleName: articleName,
						oldid: oldid,
						htmldom: htmldom
					}
				).done(
					resolve
				);
			});
		},
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
						var projectsRef = myFirebaseRef.child("projects");
						var project = {
							name: name || '',
							domain: domain,
							articles: []
						};
						if ( ! arguments[0][0] ) {
							arguments = [arguments];
						}
						for(var i = 0; i < arguments.length; i++) {
							project.articles.push({
								title: articlesNames[i],
  								content: arguments[i][0].visualeditor.content,
  								oldid: arguments[i][0].visualeditor.oldid,
  								selected: []
							});
						}
						projectsRef.push(project);
						resolve();
					})
					.fail( function() {
						reject('Something went wrong. Talk to Inez.');
					});
			});
		}
	};
});