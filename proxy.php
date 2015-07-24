<?php

function getWT($domain, $articleName, $oldid, $htmldom) {
	$url = "http://" . $domain . "/api.php";
	$post_fields = Array(
	    'format' => 'json',
	    'uselang' => 'en',
	    'action' => 'visualeditor',
	    'paction' => 'serialize',
	    'page' => $articleName,
	    'oldid' => $oldid,
	    'html' => $htmldom
	);
	$ch = curl_init($url);
	curl_setopt($ch, CURLOPT_URL, $url);
	curl_setopt($ch, CURLOPT_RETURNTRANSFER,true);
	curl_setopt($ch, CURLOPT_HEADER, false); 
	curl_setopt($ch, CURLOPT_POST, 1);
	curl_setopt($ch, CURLOPT_HTTPHEADER, array('Content-Type: application/x-www-form-urlencoded'));
	curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($post_fields));     
	$response = json_decode(curl_exec($ch));
	return $response->visualeditor->content;
}

if ( $_GET['mode'] === 'single' ) {
	$domain = $_POST['domain'];
	$articleName = $_POST['articleName'];
	$oldid = $_POST['oldid'];
	$htmldom = $_POST['htmldom'];
	$wt = getWT($domain, $articleName, $oldid, $htmldom);
	header('Content-Type: application/json');
	echo json_encode(Array('wt' => $wt));
} else if ( $_GET['mode'] === 'multi' ) {
	$domain = $_POST['domain'];
	$articles = json_decode($_POST['articles'], true);
	for($i = 0; $i < count($articles); $i++) {
		if ( strlen ( trim ( $articles[$i]['htmldom'] ) ) > 0 ) {
			$articles[$i]['wt'] = getWT($domain, $articles[$i]['title'], $articles[$i]['oldid'], $articles[$i]['htmldom']);
		} else {
			$articles[$i]['wt'] = '';
		}
		unset($articles[$i]['htmldom']);
	}
	$xml = '<mediawiki xml:lang="en">';
	for($i = 0; $i < count($articles); $i++) {
		if ( strlen ( trim ( $articles[$i]['wt'] ) ) > 0 ) { 
			$xml .= '<page>';
			$xml .= '<title>' . $articles[$i]['title'] . '</title>';
			$xml .= '<revision>';
			$xml .= '<timestamp>' . date("Y-m-d\TH:i:sO") . '</timestamp><contributor><ip>10.0.0.1</ip></contributor><comment>hey</comment>';
			$xml .= '<text xml:space="preserve">' . htmlspecialchars(trim($articles[$i]['wt'])) . '</text>';
			$xml .= '</revision>';
			$xml .= '</page>';
		}
	}
	$xml .= '</mediawiki>';
	header('Content-type: text/xml');
	header('Content-disposition: attachment; filename="articles.xml"');
	echo $xml;
}