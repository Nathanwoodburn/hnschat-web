<?php
	$json = json_decode(file_get_contents(__DIR__."/config.json"), true);
	foreach ($json as $key => $value) {
		$GLOBALS[$key] = $value;
	}
?>