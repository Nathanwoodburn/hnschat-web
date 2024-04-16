<?php
	include "includes.php";

	// ACTIVATE NEW CHANNELS
	$getChannels = sql("SELECT * FROM `channels` WHERE `tx` IS NOT NULL AND `activated` = 0 AND `hidden` = 1");
	if ($getChannels) {
		foreach ($getChannels as $key => $data) {
			$verify = verifyTransaction($data["tx"], $data["fee"]);

			if ($verify) {
				sql("UPDATE `channels` SET `activated` = 1, `hidden` = 0 WHERE `id` = ?", [$data["id"]]);
			}
		}
	}

	// FIND REGISTRY FOR SLD GATED COMMUNITIES
	$getChannels = sql("SELECT * FROM `channels` WHERE `public` = 0 AND `hidden` = 0 AND `registry` IS NULL");
	foreach ($getChannels as $key => $data) {
		$tld = $data["name"];

		$staked = isNameStaked($tld);
		if ($staked) {
			sql("UPDATE `channels` SET `registry` = ? WHERE `ai` = ?", [$staked, $data["ai"]]);
		}
	}

	// FETCH AVATARS
	$getUsers = sql("SELECT * FROM `domains` WHERE `claimed` = 1 AND `locked` = 0 AND `deleted` = 0 ORDER BY `ai` DESC");
	foreach ($getUsers as $key => $data) {
		$avatar = fetchAvatar($data["domain"]);
		$avatarFile = $GLOBALS["path"]."/etc/avatars/".$data["id"];

		$tld = tldForDomain($data["domain"]);
		if ($tld && in_array($tld, getStakedNames())) {
			if ($data["avatar"]) {
				$avatar = $data["avatar"];
			}
		}

		if ($avatar) {
			$response = getContentsWithCode($avatar);

			if (validImageWithoutFetch($response["data"])) {
				if ($response["code"] == 200) {
					sql("UPDATE `domains` SET `avatar` = ? WHERE `id` = ?", [$avatar, $data["id"]]);

					$newSize = strlen($response["data"]);
					if (file_exists($avatarFile)) {
						$currentSize = filesize($avatarFile);
					}

					if (!@$currentSize || (int)$newSize !== (int)$currentSize) {
						file_put_contents($avatarFile, $response["data"]);
					}
				}
			}
		}
	}
?>