<!DOCTYPE html>
<!--[if IE 9]><html class="lt-ie10" lang="en" > <![endif]-->
<html class="no-js" lang="en" >
<head>
	<meta charset="utf-8">
	<!-- If you delete this meta tag World War Z will become a reality -->
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<!-- If you are using the CSS version, only link these 2 files, you may add app.css to use for your overrides if you like -->
	<link rel="stylesheet" href="/foundation-5.5.2/css/normalize.css">
	<link rel="stylesheet" href="/foundation-5.5.2/css/foundation.min.css">
	<script src="//www.parsecdn.com/js/parse-1.5.0.min.js"></script>
	<script src="https://cdn.firebase.com/js/client/2.2.7/firebase.js"></script>
	<script src="/foundation-5.5.2/js/vendor/modernizr.js"></script>
    <script src="/foundation-5.5.2/js/vendor/jquery.js"></script>
	<script src="/foundation-5.5.2/js/foundation.min.js"></script>
	<script src="/js/angular.min.js"></script>
	<script src="/js/angular-route.min.js"></script>
	<script src="/js/angular-sanitize.min.js"></script>
	<script src="/js/app.js"></script>
	<script src="/js/myService.js"></script>
	<style>
	.content-container a {
		cursor: default;
	}
	.selected {
		background-color: yellow;
	}
	</style>
</head>
<body ng-app="ngContentSelector">
	<br/>
	<div class="row">
		<div class="small-12 columns">
			<div ng-view></div>
		</div>
	</div>
</body>
</html>