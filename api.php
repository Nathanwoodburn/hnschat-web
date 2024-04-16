<?php
	include "etc/includes.php";

	$json = file_get_contents('php://input');
	$data = json_decode($json, true);

	if (!$data) {
		$data = $_GET;
	}

	if (!@$data["action"]) {
		die();
	}

	$output = [
		"success" => true,
		"fields" => []
	];

	foreach ($data as $key => $value) {
		if (!is_array($data[$key])) {
			$data[$key] = trim($value, ". ".chr(194).chr(160).PHP_EOL);
		}
	}

	switch ($data["action"]) {
		case "setPublicKey":
		case "getPublicKey":
		case "saveSettings":
		case "getGifCategories":
		case "searchGifs":
		case "pushToken":
		case "getMessage":
			if ($data["session"]) {
				$keyValid = @sql("SELECT * FROM `sessions` WHERE `id` = ?", [$data["session"]]);
				if (!$keyValid) {
					error("Invalid key.");
				}
			}
			else {
				error("Missing key.");
			}
			break;
	}

	switch ($data["action"]) {
		case "checkName":
			if (!activeDomainForName($data["domain"])) {
				error("The domain provided isn't available to message.");
			}
			break;

		case "startSession":
			$code = "V2-".generateCode("session");
			sql("INSERT INTO `sessions` (id) VALUES (?)", [$code]);
			$output["session"] = $code;
			break;
			
		case "setPublicKey":
			$insert = sql("UPDATE `sessions` SET `pubkey` = ? WHERE `id` = ? AND `pubkey` IS NULL", [$data["pubkey"], $data["session"]]);
			break;

		case "getPublicKey":
			$key = @sql("SELECT `pubkey` FROM `sessions` WHERE `id` = ?", [$data["session"]])[0]["pubkey"];
			$output["pubkey"] = $key;
			break;

		case "getAddress":
			$address = @sql("SELECT `address` FROM `domains` WHERE `id` = ?", [$data["domain"]])[0];
			if ($address["address"]) {
				$output["address"] = $address["address"];
			}
			break;

		case "saveSettings":
			$settings = json_decode($data["settings"], true);
			
			$domainInfo = domainForID($data["domain"]);
			$tld = tldForDomain($domainInfo["domain"]);

			if (@$settings["avatar"]) {
				if (in_array($tld, getStakedNames())) {
					$settings["avatar"] = trim($settings["avatar"]);

					if (!validImage($settings["avatar"])) {
						error("The Avatar URL provided isn't a valid image.");
					}

					sql("UPDATE `domains` SET `avatar` = ? WHERE `id` = ? AND `session` = ?", [$settings["avatar"], $data["domain"], $data["session"]]);

					$output["avatar"] = $settings["avatar"];
				}
				else {
					error("Only SLD's of staked TLD's can set an Avatar here.");
				}
			}

			if (@$settings["address"]) {
				if (in_array($tld, getStakedHIP2Names())) {
					$settings["address"] = trim($settings["address"]);
					
					if (!validateAddress($settings["address"])) {
						error("The HNS Address provided isn't valid.");
					}

					sql("UPDATE `domains` SET `address` = ? WHERE `id` = ? AND `session` = ?", [$settings["address"], $data["domain"], $data["session"]]);
				}
				else {
					error("Only SLD's of certain staked TLD's can set an address here.");
				}
			}
			break;

		case "getMetaTags":
			$checkCache = @sql("SELECT `id`, `link`, `title`, `description`, `image`, `video` FROM `previews` WHERE `link` = ?", [$data["url"]])[0];
			if ($checkCache) {
				unset($checkCache["link"]);

				foreach ($checkCache as $key => $value) {
					if (!$value) {
						unset($checkCache[$key]);
					}
				}

				$tags = $checkCache;
			}
			else {
				$tags = fetchMetaTags($data["url"]);
			}
			
			if (@$tags["id"]) {
				if (@$tags["title"]) {
					$output["tags"] = $tags;
				}

				if (@$output["tags"]["image"]) {
					$output["tags"]["image"] = "/preview/".$tags["id"];
				}

				if (@$output["tags"]["description"]) {
					$output["tags"]["description"] = $output["tags"]["description"];
				}
			}
			break;

		case "getGifCategories":
			$categories = [];
			$getGifs = file_get_contents("https://tenor.googleapis.com/v2/categories?key=".$GLOBALS["tenorKey"]."&client_key=HNSChat&limit=20");
			$json = json_decode($getGifs, true);

			if (@$json["tags"]) {
				foreach ($json["tags"] as $key => $tag) {
					$categories[] = [
						"term" => @$tag["searchterm"],
						"gif" => @$tag["image"]
					];
				}
			}

			$output["categories"] = $categories;
			break;

		case "searchGifs":
			if (@$data["query"]) {
				$gifs = [];
				$getGifs = file_get_contents("https://tenor.googleapis.com/v2/search?q=".urlencode($data["query"])."&key=".$GLOBALS["tenorKey"]."&client_key=HNSChat&limit=100");
				$json = json_decode($getGifs, true);

				if (@$json["results"]) {
					foreach ($json["results"] as $key => $gif) {
						$gifs[] = [
							"id" => @$gif["id"],
							"preview" => @$gif["media_formats"]["tinygif"]["url"],
							"full" => @$gif["media_formats"]["gif"]["url"],
							"width" => @$gif["media_formats"]["gif"]["dims"][0],
							"height" => @$gif["media_formats"]["gif"]["dims"][1],
						];
					}
				}

				$output["gifs"] = $gifs;
			}
			break;

		case "getMessage":
			$message = @sql("SELECT * FROM `messages` WHERE `id` = ?", [$data["id"]])[0];
			if ($message) {
				$domain = domainForID($data["domain"]);
				$channel = channelForID($message["conversation"]);
				if ($channel) {
					if ($channel["public"] || ($domain["tld"] == $channel["name"])) {
						$output = [
							"success" => true,
							"id" => $message["id"],
							"time" => $message["time"],
							"conversation" => $message["conversation"],
							"user" => $message["user"],
							"message" => $message["message"],
							"reactions" => $message["reactions"],
						];

						if (@$message["reply"]) {
							$output["reply"] = true;
							$output["replying"] = $message["replying"];
						}
					}
				}
			}
			break;

		case "pushToken":
			if (preg_match("/^ExponentPushToken\[.+?\]$/", $data["token"])) {
				$exists = @sql("SELECT JSON_CONTAINS(`push`, JSON_QUOTE(?), '$') AS `exists` FROM `sessions` WHERE `id` = ?", [$data["token"], $data["session"]])[0]["exists"];
				if (!$exists) {
					sql("UPDATE `sessions` SET `push` = JSON_ARRAY_APPEND(`push`, '$', ?) WHERE `id` = ?", [$data["token"], $data["session"]]);
				}
			}
			break;
		
		default:
			$output["message"] = "Unknown function.";
			$output["success"] = false;
			break;
	}

	end:
	if (@$output["fields"] && @count($output["fields"])) {
		$output["fields"] = array_unique($output["fields"]);
		$output["success"] = false;
	}
	else {
		unset($output["fields"]);
	}

	die(json_encode($output));
?>
