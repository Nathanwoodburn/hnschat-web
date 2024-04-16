<?php
	include "etc/includes.php";

	if (@$_GET["invite"]) { ?>
		<script type="text/javascript">
			var invite = "<?php echo htmlspecialchars(addslashes($_GET["invite"])); ?>";
		</script>
	<?php
	}
?>
<!DOCTYPE html>
<html>
<head>
	<?php include "etc/head.php"; ?>
</head>
<body data-page="id">
	<div id="blackout"></div>
	<div class="popover" data-name="qr">
		<div class="head">
			<div class="title">Sync QR</div>
			<div class="icon action close" data-action="close"></div>
		</div>
		<div class="body">
			<div class="loading flex shown">
				<div class="lds-facebook"><div></div><div></div><div></div></div>
				<canvas id="frame"></canvas>
			</div>
			<video id="camera" autoplay playsinline></video>
		</div>
		<div class="response error"></div>
	</div>
	<div class="form" id="id">
		<a href="/">
			<div class="logo">
				<img draggable="false" src="/assets/img/handshake">
				<span>Chat</span>
			</div>
		</a>
		<div class="section loading shown">
			<div class="loading flex shown">
				<div class="lds-facebook"><div></div><div></div><div></div></div>
			</div>
		</div>
		<div class="section" id="manageDomains">
			<div class="domains"></div>
			<div class="button" data-action="newDomain">Add Domain</div>
			<div class="button" data-action="scanQR">Scan Sync QR</div>
			<a href="/" id="startChatting" class="hidden">Start Chatting</a>
		</div>
		<div class="section" id="addDomain">
			<div class="button varo" data-action="addDomain">Authenticate with Varo Auth</div>
			<div class="or varo">OR</div>
			<div class="group">
				<input type="text" name="sld" placeholder="Create a name">
				<input type="text" name="dot" placeholder="." class="transparent" disabled>
				<select name="tld"></select>
				<input type="hidden" name="invite">
			</div>
			<div class="button" data-action="addSLD">Continue</div>
			<div class="response error"></div>
			<div class="link" data-action="manageDomains">Manage Domains</div>
		</div>
		<div class="section" id="verifyOptions">
			<input type="hidden" name="domain">
			<div class="title">How would you like to verify?</div><div id="code"></div>
			<div class="button" data-action="verifyDomainWithTXT">Verify with TXT Record</div>
			<div class="button" data-action="verifyDomainWithBob">Verify with Bob Extension</div>
			<div class="button" data-action="verifyDomainWithMetaMask">Verify with MetaMask</div>
			<div class="response error"></div>
		</div>
		<div class="section" id="verifyDomain">
			<input type="hidden" name="domain">
			<div class="title">Please create a TXT record with the following value: </div><div id="code"></div>
			<div class="button" data-action="verifyDomain">Verify</div>
			<div class="response error"></div>
		</div>
		<div class="section" id="startChatting">
			<div class="title">You're all set!</div>
			<div class="button" data-action="startChatting">Start Chatting</div>
		</div>
	</div>
</body>
</html>