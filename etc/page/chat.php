<body data-page="chat" data-version="<?php echo $revision; ?>">
	<div class="connecting">
		<div class="lds-facebook"><div></div><div></div><div></div></div>
	</div>
	<div id="blackout"></div>
	<div class="popover" data-name="update">
		<div class="head">
			<div class="title">Update</div>
			<div class="icon action close" data-action="close"></div>
		</div>
		<div class="body">
			<div class="subtitle">An update is available. Please reload for the best possible experience.</div>
			<div class="button" data-action="reload">Reload</div>
		</div>
		<div class="response error"></div>
	</div>
	<div class="popover" data-name="newConversation">
		<div class="head">
			<div class="title">New Conversation</div>
			<div class="icon action close" data-action="close"></div>
		</div>
		<div class="body">
			<input class="tab" type="text" name="domain" placeholder="hnschat/">
			<input type="text" name="message" placeholder="Message">
			<div class="button" data-action="startConversation">Start Conversation</div>
		</div>
		<div class="response error"></div>
	</div>
	<div class="popover" data-name="syncSession">
		<div class="head">
			<div class="title">Sync Session</div>
			<div class="icon action close" data-action="close"></div>
		</div>
		<div class="body">
			<div class="subtitle">Use this QR code or link to sync your session to another browser.</div>
			<div id="qrcode"></div>
			<div class="group">
				<input readonly="readonly" class="copyable" type="text" name="syncLink">
				<div class="icon action clipboard" data-action="clipboard"></div>
			</div>
		</div>
	</div>
	<div class="popover" data-name="donate">
		<div class="head">
			<div class="title">Donate</div>
			<div class="icon action close" data-action="close"></div>
		</div>
		<div class="body">
			<div class="subtitle">If you enjoy using this free service, please consider donating.</div>
			<div class="group">
				<input readonly="readonly" class="copyable" type="text" name="donateAddress" value="hs1qf0cxy6ukhgjlmqfhe0tpw800t2tcul4s0szwqa">
				<div class="icon action clipboard" data-action="clipboard"></div>
			</div>
			<div class="center">&copy; <?php echo date("Y"); ?>&nbsp;<a href="https://eskimo.software" target="_blank">Eskimo Software</a></div>
		</div>
	</div>
	<div class="popover" data-name="pay">
		<div class="head">
			<div class="title">Send HNS</div>
			<div class="icon action close" data-action="close"></div>
		</div>
		<div class="body">
			<div class="loading flex shown">
				<div class="lds-facebook"><div></div><div></div><div></div></div>
			</div>
			<div class="content">
				<input type="hidden" name="address">
				<input type="text" name="hns" placeholder="0 HNS">
				<div class="button" data-action="sendPayment">Send with Bob Extension</div>
			</div>
			<div class="response error"></div>
		</div>
	</div>
	<div class="popover" data-name="settings">
		<div class="head">
			<div class="title">Settings</div>
			<div class="icon action close" data-action="close"></div>
		</div>
		<div class="body">
			<div class="setting">
				<div class="subtitle">Avatar URL</div>
				<input class="remote tab" type="text" name="avatar" placeholder="">
			</div>
			<div class="setting">
				<div class="subtitle">HNS Wallet Address</div>
				<input class="remote tab" type="text" name="address" placeholder="">
			</div>
			<div class="setting">
				<div class="subtitle">Chat Bubble Color</div>
				<input class="local color tab" type="color" name="bubbleBackground">
			</div>
			<div class="setting">
				<div class="subtitle">Self Chat Bubble Color</div>
				<input class="local color tab" type="color" name="bubbleSelfBackground">
			</div>
			<div class="setting">
				<div class="subtitle">Mention Chat Bubble Color</div>
				<input class="local color" type="color" name="bubbleMentionBackground">
			</div>
			<div class="setting">
				<div class="subtitle">Chat Display Mode</div>
				<select class="local" name="chatDisplayMode">
					<option value="normal">Normal</option>
					<option value="compact">Compact</option>
				</select>
			</div>
			<div class="setting">
				<div class="subtitle">Sync Session</div>
				<div class="center action link" data-action="syncSession">Show QR + Link</div>
			</div>
			<div class="button" data-action="saveSettings">Save</div>
		</div>
		<div class="response error"></div>
	</div>
	<div class="popover contextMenu" data-name="userContext">
		<div class="actions">
			<div class="action icon edit" data-action="editProfile"></div>
			<div class="action icon save" data-action="saveProfile"></div>
			<div class="action icon close" data-action="undoProfile"></div>
		</div>
		<div class="body">
			<ul>
				<li>
					<div class="pic"></div>
					<span class="user subtitle"></span>
					<div class="icon type"></div>
				</li>
				<li class="bio">
					<div class="title small">Bio</div>
					<div class="bioHolder">
						<div class="bio subtitle"></div>
						<div class="limit"></div>
					</div>
				</li>
				<li>
					<div class="title small">Joined</div>
					<span class="joined subtitle"></span>
				</li>
			</ul>
			<div class="separator"></div>
			<ul class="contextActions">
				<li class="action" data-action="newConversationWith">
					<div class="icon message"></div>
					<span>Message</span>
				</li>
				<li class="action" data-action="mentionUser">
					<div class="icon mention"></div>
					<span>Mention</span>
				</li>
				<li class="action" data-action="slapUser">
					<div class="icon fish"></div>
					<span>Slap</span>
				</li>
				<li class="action speaker" data-action="inviteVideo">
					<div class="icon voice"></div>
					<span>Speaker</span>
				</li>
			</ul>
		</div>
	</div>
	<div class="popover contextMenu" data-name="channelContext">
		<div class="body">
			<ul>
				<li>
					<span class="channel subtitle"></span>
				</li>
			</ul>
			<div class="separator"></div>
			<ul>
				<li class="action" data-action="switchConversation">
					<div class="icon view"></div>
					<span>View</span>
				</li>
			</ul>
		</div>
	</div>
	<div class="popover contextMenu" data-name="messageContext">
		<div class="body">
			<ul>
				<li class="action reply" data-action="reply">
					<div class="icon reply"></div>
					<span>Reply</span>
				</li>
				<li class="action emoji" data-action="emojis">
					<div class="icon emoji"></div>
					<span>React</span>
				</li>
				<li class="action pin" data-action="pinMessage">
					<div class="icon pin"></div>
					<span>Pin</span>
				</li>
				<li class="action delete error" data-action="deleteMessage">
					<div class="icon delete"></div>
					<span>Delete</span>
				</li>
			</ul>
		</div>
	</div>
	<div id="holder">
		<div class="header">
			<div class="left">
				<div class="icon menu"></div>
			</div>
			<div class="center">
				<div class="logo">
					<img draggable="false" src="/assets/img/handshake">
				</div>
				<div class="messageHeader">
					<table></table>
					<div class="pinnedMessage flex">
						<div class="icon pin"></div>
						<div class="message"></div>
						<div class="action icon delete" data-action="pinMessage"></div>
					</div>
				</div>
				<div class="end">
					<div id="me"></div>
					<div class="domains">
						<select></select>
					</div>
				</div>
			</div>
			<div class="right">
				<div class="icon users"></div>
			</div>
		</div>
		<div id="chats">
			<div id="conversations" class="sidebar">
				<div class="title">
					<div class="tabs">
						<div class="tab" data-tab="channels">Channels</div>
						<div class="tab" data-tab="pms">Private</div>
					</div>
					<div class="actionHolder">
						<div class="action icon compose" data-action="newConversation"></div>
					</div>
				</div>
				<div class="sections">
					<div class="section channels">
						<table></table>
					</div>
					<div class="section pms">
						<table></table>
					</div>
				</div>
				<div class="footer">
					<div class="action link" data-action="settings">Settings</div>
					<!-- <div class="action link" data-action="docs">Docs</div> -->
					<!-- <div class="action link" data-action="donate">Donate</div> -->
				</div>
			</div>
			<div class="content">
				<div class="pinnedMessage flex">
					<div class="icon pin"></div>
					<div class="message"></div>
					<div class="action icon delete" data-action="pinMessage"></div>
				</div>
				<div id="closeMenu"></div>
				<div id="videoInfo" class="flex">
					<div class="info">
						<div class="users"></div>
						<div class="title flex">
							<span>LIVE</span>
							<div class="icon audio"></div>
						</div>
						<div class="watching flex">
							<div class="watchers"></div>
						</div>
					</div>
					<div class="actions">
						<div class="link" data-action="viewVideo">Watch</div>
						<!-- <div class="link" data-action="startVideo">Stream</div> -->
						<div class="link" data-action="joinVideo">Join</div>
						<div class="link destructive" data-action="leaveVideo">Leave</div>
						<div class="link destructive" data-action="endVideo">End</div>
					</div>
				</div>
				<div id="videoContainer" class="flex">
					<div class="controls">
						<div class="button outline muted" data-action="toggleScreen">
							<div class="icon screen"></div>
						</div>
						<div class="button outline muted" data-action="toggleAudio">
							<div class="icon voice"></div>
						</div>
						<div class="button outline muted" data-action="toggleVideo">
							<div class="icon video"></div>
						</div>
						<div class="button outline muted" data-action="leaveVideo">
							<div class="icon leave"></div>
						</div>
					</div>
				</div>
				<div id="messageHolder">
					<div class="popover" id="completions" data-name="completions">
						<div class="head">
							<div class="title"></div>
							<div class="icon action close" data-action="close"></div>
						</div>
						<div class="body">
							<table class="list"></table>
						</div>
					</div>
					<div class="popover" id="react" data-name="react">
						<div class="head">
							<div class="title">
								<div class="tabs">
									<div class="tab" data-name="gifs">Gifs</div>
									<div class="tab" data-name="emojis">Emojis</div>
								</div>
							</div>
							<div class="icon action close" data-action="close"></div>
						</div>
						<div class="body">
							<div class="search">
								<input type="text" name="searchGifs" placeholder="Search Tenor">
								<input type="text" class="shown" name="searchEmojis" placeholder="Search Emojis">
							</div>
							<div class="grids">
								<div class="grid" data-type="gifs">
									<div class="section" data-type="categories"></div>
									<div class="section flex" data-type="gifs">
										<div class="column" data-column="0"></div>
										<div class="column" data-column="1"></div>
									</div>
								</div>
								<div class="grid shown" data-type="emojis"></div>
							</div>
						</div>
					</div>
					<div id="messages"></div>
					<div id="jumpToPresent" class="hidden">
						<div class="action" data-action="jumpToPresent">Jump To Present</div>
					</div>
					<div class="loading flex">
						<div class="lds-facebook"><div></div><div></div><div></div></div>
					</div>
				</div>
				<div class="inputContainer">
					<div id="typing" class="flex">
						<div class="message"></div>
					</div>
					<div id="replying" class="flex">
						<div class="message">Replying to <span class="name"></span></div>
						<div class="action icon remove" data-action="removeReply"></div>
					</div>
					<div id="attachments" class="flex"></div>
					<div class="inputHolder">
						<div class="input">
							<div class="action icon plus" data-action="file">
								<input id="file" type="file" name="file">
							</div>
							<div class="action icon pay" data-action="pay"></div>
							<div class="inputs">
								<textarea id="message" placeholder="Message"></textarea>
							</div>
							<div class="action icon gif big" data-action="gifs"></div>
							<div class="action icon emoji big" data-action="emojis"></div>
						</div>
						<div class="locked"></div>
					</div>
				</div>
			</div>
			<div id="users" class="sidebar">
				<div class="title">
					<div class="group normal">
						<div class="action icon search" data-action="searchUsers"></div>
						<div>Users</div>
					</div>
					<div class="group flex searching">
						<input type="text" name="search">
						<div class="action icon close" data-action="searchUsers"></div>
					</div>
					<div id="count"></div>
				</div>
				<div class="sections">
					<div class="section users">
						<table></table>
					</div>
				</div>
			</div>
		</div>
	</div>
	<div id="avatars"></div>
</body>