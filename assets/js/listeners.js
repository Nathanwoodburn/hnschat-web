export class listeners {
	constructor(app) {
		this.gifTimer;
		this.lastGifSearch = 0;

		this.longPress = 0;
		this.longPressTimer;

		$(window).on("focus", e => {
			app.isActive = true;
			app.ui.markUnread(app.conversation, false);
		});

		$(document).on("mouseenter", e => {
		    app.isActive = true;
		    app.ui.markUnread(app.conversation, false);
		});

		$(window).on("blur", e => {
			app.isActive = false;
		});

		$(document).on("mouseleave", e => {
		    app.isActive = false;
		});

		$(document).on("keydown", e => {
			if (app.isKey(e, 27)) {
				e.preventDefault();
				
				if (app.ui.undoProfileIfNeeded()) {
					return;
				}

				if (app.ui.removeReplyingIfNeeded()) {
					return;
				}

				if (app.ui.removePopoverIfNeeded()) {
					return;
				}
			}

			app.ui.preventTabIfNeeded(e);
			app.ui.focusInputIfNeeded(e);
		});

		$("html").on("click", "#blackout", (e) => {
			if (!this.longPress) {
				app.ui.close();
			}
		});

		$("html").on("click", "#closeMenu", () => {
			app.ui.closeMenusIfNeeded();
		});

		$("html").on("click", "#conversations .tabs .tab", e => {
			app.tab = $(e.target).data("tab");
			app.ui.setConversationTab();
		});

		$("html").on("change", ".header .domains select", e => {
			app.typing = false;

			let domain = $(e.target).val();

			if (domain == "manageDomains") {
				app.ui.openURL("/id");
			}
			else {
				app.changeDomain(domain);
			}
		});

		$("html").on("click", "#conversations tr", e => {
			app.typing = false;

			let row = e.target.closest("tr");
			let conversation = $(row).data("id");
			
			if (conversation == app.conversation || app.loadingMessages) {
				app.ui.closeMenusIfNeeded();
				return;
			}

			app.changeConversation(conversation);
			localStorage.setItem("conversation", conversation);
		});

		$("#messageHolder").on("scroll", e => {
			this.longPress = 0;
			clearTimeout(this.longPressTimer);

			let messageHolder = $(e.target);
			if (app.loadingMessages) {
				return;
			}

			let height = messageHolder.outerHeight();
			let scrollTop = messageHolder[0].scrollTop;
			let scrollHeight = messageHolder[0].scrollHeight - messageHolder.height();

			if ((scrollHeight - height) == 0) {
				return;
			}

			let calc = Math.floor(scrollHeight + scrollTop);
			if (calc <= 1) {
				let firstMessage = $("#messages > .messageRow[data-id]").first();
				let firstMessageID = firstMessage.data("id");
				if (firstMessageID) {
					let options = {
						before: firstMessageID
					}
					app.getMessages(options);
				}
			}
			else if (calc == scrollHeight) {
				app.ui.fetchNewMessages();
			}
		});

		$("html").on("keydown", "textarea#message", e => {
			let target = $(e.target);

			let key = app.key(e);

			if ($("#completions.shown").length) {
				switch (key) {
					case 38:
					case 40:
						e.preventDefault();
						break;

					case 9:
					case 13:
						e.preventDefault();
						$("#completions tr.active").click();
						return;
				}
			}

			switch (key) {
				case 9:
					app.ui.tabComplete();
					break;
					
				case 38:
				case 40:
				case 27:
					return;
			}

			if (target.val() && target.val()[0] !== "/" && e.key.length == 1) {
				app.lastTyped = app.time();
			}

			if (app.isKey(e, 13) && !e.shiftKey) {
				e.preventDefault();

				let data;
				let attachments = $("#attachments .attachment");
				if (attachments.find(".uploading").length) {
					return;
				}

				$.each(attachments, (k, attachment) => {
					let id = $(attachment).data("id");
					data = {
						hnschat: 1,
						attachment: id
					};
					app.sendMessage(app.conversation, JSON.stringify(data));
				});

				let value = target.val().trim();
				app.ui.clear("input");
				$("#attachments").empty();
				app.ui.showOrHideAttachments();

				let replaced = app.replaceCompletions(value);
				if (replaced.length) {
					if (replaced[0] == "/") {
						replaced = replaced.substring(1);
						let split = replaced.split(" ");
						let command = split.shift();
						let rest = split.join(" ");

						switch (command) {
							case "me":
								data = {
									hnschat: 1,
									action: rest
								};
								app.sendMessage(app.conversation, JSON.stringify(data));
								break;

							case "shrug":
								data = {
									hnschat: 1,
									message: "¯\\_(ツ)_/¯"
								};
								app.sendMessage(app.conversation, JSON.stringify(data));
								break;

							case "fancy":
								data = {
									hnschat: 1,
									message: rest,
									style: command
								};
								app.sendMessage(app.conversation, JSON.stringify(data));
								break;

							case "confetti":
								data = {
									hnschat: 1,
									message: rest,
									effect: command
								};
								app.sendMessage(app.conversation, JSON.stringify(data));
								break;

							case "slap":
								data = {
									hnschat: 1,
									action: `slaps ${rest} around a bit with a large trout`
								};
								app.sendMessage(app.conversation, JSON.stringify(data));
								break;

							default:
								break;
						}
					}
					else {
						data = {
							hnschat: 1,
							message: replaced
						};
						app.sendMessage(app.conversation, JSON.stringify(data));
					}
				}
			}

			app.ui.sizeInput();
		});

		$("html").on("input paste keyup focus click", "textarea#message", e => {
			let key = app.key(e);

			switch (key) {
				case 13:
					return;

				case 27:
					app.ui.close();
					return;

				case 38:
				case 40:
					e.preventDefault();
					app.ui.updateSelectedCompletion(key);
					return;
			}

			switch (key) {
				case 16:
				case 17:
				case 18:
				case 20:
				case 91:
				case 93:
					break;

				default:
					app.ui.updateCompletions();
					break;
			}
			
			app.ui.sizeInput();
		});

		$("html").on("click", "#completions tr", e => {
			let target = $(e.target).closest("tr");

			$("#completions tr").removeClass("active");
			target.addClass("active");

			let completion = target.find(".title").html();
			if (target.hasClass("user")) {
				completion = `@${completion}/`;
			}
			else {
				completion = `#${completion}`;
			}

			let input = $("textarea#message");
			let text = input.val();
			let words = text.split(" ");
			let position = input[0].selectionStart;
			let word = app.ui.wordForPosition(text, position);
			let before = words[word];
			words[word] = `${completion} `;

			let newPosition = 0;
			for (let i = 0; i < words.length; i++) {
				newPosition += words[i].length;

				if (i == word) {
					newPosition += i;
					break;
				}
			}

			let replaced = words.join(" ");
			input.val(replaced);
			app.ui.setCaretPosition(input[0], newPosition);
			app.ui.close();
		});

		$("html").on("click", ".action, .button, .link", e => {
			let target = $(e.target);

			if ($("body").hasClass("touching")) {
				return;
			}

			target.parent().find(".response").html('');
			target.parent().parent().find(".response").html('');

			if (target.hasClass("disabled")) {
				return;
			}
			target.addClass("disabled");

			let action = target.data("action");

			var sender,context;
			var data;
			var id,domain,sld,tld,message,name;

			switch (action) {
				case "scanQR":
					app.ui.scanQR();
					app.ui.popover("qr");
					app.ui.enableTarget(target);
					break;

				case "reply":
					context = target.closest(".contextMenu");
					if (context.length) {
						app.replying = {
							message: context.data("id"),
							sender: context.data("sender"),
						}
					}
					else {
						app.replying = {
							message: target.closest(".messageRow").data("id"),
							sender: target.closest(".messageRow").data("sender"),
						}
					}

					app.ui.close();
					app.ui.updateReplying();
					$(".input #message").focus();
					app.ui.enableTarget(target);
					break;

				case "removeReply":
					app.replying = null;
					app.ui.updateReplying();
					app.ui.enableTarget(target);
					break;

				case "donate":
				case "syncSession":
					app.ui.popover(action);
					app.ui.enableTarget(target);
					break;

				case "replayEffect":
					app.ui.handleEffect(target.data("effect")).then(() => {
						app.ui.enableTarget(target);
					});
					break;

				case "settings":
					$(".popover[data-name=settings] input[name=bubbleBackground]").val(app.ui.css.getPropertyValue("--bubbleBackground").trim());
					$(".popover[data-name=settings] input[name=bubbleSelfBackground]").val(app.ui.css.getPropertyValue("--bubbleSelfBackground").trim());
					$(".popover[data-name=settings] input[name=bubbleMentionBackground]").val(app.ui.css.getPropertyValue("--bubbleMentionBackground").trim());
					if (app.settings.chatDisplayMode) {
						$(".popover[data-name=settings] select[name=chatDisplayMode]").val(app.settings.chatDisplayMode);
					}
					app.ui.popover(action);
					app.ui.enableTarget(target);
					break;

				case "docs":
					app.ui.openURL("https://docs.hns.chat", { newTab: true });
					app.ui.enableTarget(target);
					break;

				case "pay":
					let conversation = app.pmForID(app.conversation);
					app.ws.send(`GETADDRESS ${app.otherUser(conversation.users)}`);
					app.ui.popover(action);
					app.ui.enableTarget(target);
					break;

				case "sendPayment":
					let address = target.parent().find("input[name=address]").val();
					let amount = target.parent().find("input[name=hns]").val().replace(/[^0-9.]/g, '');
					app.sendPayment(address, amount).then(r => {
						if (r.message) {
							let data = {
								type: action,
								message: `Error: ${r.message}`
							}
							app.ui.errorResponse(data);
						}
						else if (r.hash) {
							let data = {
								hnschat: 1,
								payment: r.hash,
								amount: amount
							}
							app.sendMessage(app.conversation, JSON.stringify(data));
							app.ui.close();
						}
						app.ui.enableTarget(target);
					});
					break;

				case "newConversation":
					if (!app.userForID(app.domain).locked) {
						app.ui.popover(action);
					}
					app.ui.enableTarget(target);
					break;

				case "newConversationWith":
					id = target.closest(".contextMenu").data("id");
					name = app.userForID(id).domain;
					let puny = `${app.ui.toUnicode(name)}/`;
					$(`.popover[data-name=newConversation] input[name=domain]`).val(puny);
					app.ui.popover("newConversation");
					app.ui.enableTarget(target);
					break;

				case "mentionUser":
					id = target.closest(".contextMenu").data("id");
					name = `@${app.userForID(id).domain}/`;
					let text = $("#message").val();
					text = `${text}${name} `;
					$("#message").val(text);
					app.ui.close();
					app.ui.closeMenusIfNeeded();
					app.ui.enableTarget(target);
					$("#message").focus();
					break;

				case "slapUser":
					id = target.closest(".contextMenu").data("id");
					name = `@${app.userForID(id).domain}/`;
					message = app.replaceCompletions(`slaps ${name} around a bit with a large trout`);
					data = {
						hnschat: 1,
						action: message
					};
					app.sendMessage(app.conversation, JSON.stringify(data));
					app.ui.close();
					app.ui.closeMenusIfNeeded();
					app.ui.enableTarget(target);
					$("#message").focus();
					break;

				case "switchConversation":
					id = target.closest(".contextMenu").data("id");
					$(`#conversations tr[data-id=${id}]`).click();
					app.ui.close();
					app.ui.enableTarget(target);
					break;

				case "startConversation":
					domain = target.parent().find("input[name=domain]").val().trim();
					domain = app.rtrim(domain, "/").trim();
					domain = app.userForName(domain).domain;
					message = target.parent().find("input[name=message]").val();

					if (message.length) {
						app.queued.push({
							domain: domain,
							message: message
						});

						data = {
							domain: domain
						}
						app.ws.send(`PM ${JSON.stringify(data)}`);
					}
					else {
						data = {
							type: action,
							message: "Please enter a message.",
						}
						app.ui.errorResponse(data);
					}
					app.ui.enableTarget(target);
					break;

				case "clipboard":
					app.ui.copyToClipboard(target);
					app.ui.enableTarget(target);
					break;

				case "gifs":
				case "emojis":
					context = target.closest(".contextMenu");
					if (context.length) {
						sender = context.data("id");
					}
					else {
						sender = target.closest(".messageRow").data("id");
					}
					
					app.ui.setupReactView(e, sender);
					app.ui.popover("react");
					app.ui.enableTarget(target);
					break;

				case "createSLD":
					e.newTab = true;
					app.ui.openURL("/id");
					app.ui.enableTarget(target);
					break;

				case "purchaseSLD":
					e.newTab = true;
					app.ui.openURL(target.data("link"), e);
					app.ui.enableTarget(target);
					break;

				case "switchName":
					domain = target.data("id");
					app.changeDomain(domain);
					break;

				case "newDomain":
					app.ui.showSection("addDomain");
					app.ui.enableTarget(target);
					break;

				case "addDomain":
					app.varo.auth().then(auth => {
						if (auth.success) {
							let data = {
								request: auth.data.request
							};
							app.ws.send(`ADDDOMAIN ${JSON.stringify(data)}`);
						}
						app.ui.enableTarget(target);
					});
					break;

				case "verifyDomain":
					app.varo.auth().then(auth => {
						if (auth.success) {
							let data = {
								id: target.closest(".domain").data("id"),
								request: auth.data.request
							};
							app.ws.send(`VERIFYDOMAIN ${JSON.stringify(data)}`);
						}
						app.ui.enableTarget(target);
					});
					break;

				case "addSLD":
					sld = target.parent().find("input[name=sld]").val();
					tld = target.parent().find("select[name=tld]").val();
					data = {
						sld: sld,
						tld: tld
					}
					app.ws.send(`ADDSLD ${JSON.stringify(data)}`);
					break;

				case "deleteDomain":
					domain = target.closest(".domain").data("id");
					data = {
						id: domain
					};
					app.ws.send(`DELETEDOMAIN ${JSON.stringify(data)}`);
					break;

				case "manageDomains":
					app.ui.showSection("manageDomains");
					app.ui.enableTarget(target);
					break;

				case "deleteMessage":
					message = target.closest(".contextMenu").data("id");
					data = {
						id: message
					}
					app.ws.send(`DELETEMESSAGE ${JSON.stringify(data)}`);
					app.ui.close();
					app.ui.enableTarget(target);
					break;

				case "pinMessage":
					message = target.closest(".contextMenu").data("id");
					data = {
						conversation: app.conversation,
						id: message
					}
					app.ws.send(`PINMESSAGE ${JSON.stringify(data)}`);
					app.ui.close();
					app.ui.enableTarget(target);
					break;

				case "searchUsers":
					if (target.hasClass("close")) {
						app.ui.searchUsers(false);
					}
					else {
						app.ui.searchUsers(true);
					}
					app.ui.enableTarget(target);
					break;

				case "saveSettings":
					let fields = $(".popover[data-name=settings] .local");
					$.each(fields, (k, field) => {
						let name = $(field).attr("name");
						let val = $(field).val();
						app.settings[name] = val;
					});
					localStorage.setItem("settings", JSON.stringify(app.settings));
					app.loadSettings();

					data = {
						action: "saveSettings",
						domain: app.domain,
						settings: {}
					}

					fields = $(".popover[data-name=settings] input.remote");
					$.each(fields, (k, field) => {
						let name = $(field).attr("name");
						let val = $(field).val();
						data.settings[name] = val;
					});

					data.settings = JSON.stringify(data.settings);

					app.api(data).then(r => {
						if (r.success) {
							if (r.avatar) {
								delete app.avatars[app.domain];
								app.userForID(app.domain).avatar = r.avatar;
								$(`.favicon.loaded[data-id=${app.domain}]`).removeClass("loaded");
								app.ui.updateAvatars();
								app.ws.send(`SAVEDSETTINGS`);
							}
							app.ui.close();
						}
						else {
							data = {
								type: action,
								message: r.message,
							}
							app.ui.errorResponse(data);
						}

						app.ui.enableTarget(target);
					});
					break;

				case "file":
					$("#file")[0].click();
					app.ui.enableTarget(target);
					break;

				case "removeAttachment":
					let attachment = target.parent().parent();
					attachment.remove();
					app.ui.showOrHideAttachments();
					data = {
						id: attachment.data("id")
					}
					app.ws.send(`DELETEATTACHMENT ${JSON.stringify(data)}`);
					break;

				case "editProfile":
					app.ui.editProfile();
					app.ui.enableTarget(target);
					break;

				case "saveProfile":
					app.ui.saveProfile();
					app.ui.enableTarget(target);
					break;

				case "undoProfile":
					app.ui.undoProfile();
					app.ui.enableTarget(target);
					break;

				case "close":
					app.ui.close();
					app.ui.enableTarget(target);
					break;

				case "reload":
					window.location.reload();
					break;

				case "startVideo":
				case "joinVideo":
					app.channelForID(app.conversation).watching = true;
					data = {
						conversation: app.conversation
					}
					if (app.channelForID(app.conversation).video) {
						app.ws.send(`JOINVIDEO ${JSON.stringify(data)}`);
					}
					else {
						app.ws.send(`STARTVIDEO ${JSON.stringify(data)}`);
					}
					app.ui.enableTarget(target);
					break;

				case "inviteVideo":
					id = target.closest(".contextMenu").data("id");

					data = {
						conversation: app.conversation,
						user: id
					}
					app.ws.send(`INVITEVIDEO ${JSON.stringify(data)}`);
					app.ui.close();
					app.ui.closeMenusIfNeeded();
					app.ui.enableTarget(target);
					break;

				case "leaveVideo":
					if (Object.keys(app.channelForID(app.conversation).videoUsers).includes(app.domain)) {
						app.stream.unpublish();
					}
					else {
						app.channelForID(app.conversation).watching = false;
						app.stream.close();
						app.ui.showVideoIfNeeded();
					}
					data = {
						conversation: app.conversation
					}
					app.ws.send(`LEAVEVIDEO ${JSON.stringify(data)}`);
					app.ui.enableTarget(target);
					break;

				case "endVideo":
					if (Object.keys(app.channelForID(app.conversation).videoUsers).includes(app.domain)) {
						app.stream.unpublish();
					}
					data = {
						conversation: app.conversation
					}
					app.ws.send(`ENDVIDEO ${JSON.stringify(data)}`);
					app.ui.enableTarget(target);
					break;

				case "toggleVideo":
					app.stream.mute("video", !$(".controls .button[data-action=toggleVideo]").hasClass("muted"));
					data = {
						conversation: app.conversation
					}
					app.ws.send(`MUTEVIDEO ${JSON.stringify(data)}`);
					app.ui.enableTarget(target);
					break;

				case "toggleAudio":
					app.stream.mute("audio", !$(".controls .button[data-action=toggleAudio]").hasClass("muted"));
					data = {
						conversation: app.conversation
					}
					app.ws.send(`MUTEAUDIO ${JSON.stringify(data)}`);
					app.ui.enableTarget(target);
					break;

				case "toggleScreen":
					app.stream.toggleScreen();
					app.ui.enableTarget(target);
					break;

				case "viewVideo":
					data = {
						conversation: app.conversation
					}
					app.ws.send(`VIEWVIDEO ${JSON.stringify(data)}`);
					app.ui.enableTarget(target);
					break;

				default:
					app.ui.enableTarget(target);
					break;
			}
		});

		$("html").on("keyup", ".popover[data-name=react] input", e => {
			if (app.isKey(e, 27)) {
				e.preventDefault();
				return;
			}

			let query = $(e.currentTarget).val().replace(/[^a-zA-Z0-9]/gi, '').toLowerCase();
			if (query) {
				let emo = $(".popover[data-name=react] .section:not([data-name=Search]) .emoji");
				let matches = emo.filter((k, em) => {
					let aliases = $(em).data("aliases");

					$.each(aliases, (k, alias) => {
						aliases[k] = alias.replace(/[^a-zA-Z0-9]/gi, '').toLowerCase();
					});

					return aliases.join("|").includes(query);
				});

				$(".popover[data-name=react] .grid .section[data-name=Search] .emojis").empty();
				$.each(matches, (k, match) => {
					let clone = match.cloneNode(true);
					$(".popover[data-name=react] .grid .section[data-name=Search] .emojis").append(clone);
				});

				$(".popover[data-name=react] .grid .section").addClass("hidden");
				$(".popover[data-name=react] .grid .section[data-name=Search]").removeClass("hidden");
			}
			else {
				$(".popover[data-name=react] .grid .section").removeClass("hidden");
				$(".popover[data-name=react] .grid .section[data-name=Search]").addClass("hidden");
			}
		});

		$("html").on("click", ".popover[data-name=react] .emoji", e => {
			let sender = $(".popover[data-name=react]").data("sender");
			let emoji = $(e.currentTarget);
			let em = emoji.html();

			if (sender.length) {
				let reacting = $(".messageRow .hover.visible").closest(".messageRow").data("id");
				app.ui.close();
				let data = {
					conversation: app.conversation,
					message: reacting,
					reaction: em
				};
				app.ws.send(`REACT ${JSON.stringify(data)}`);
			}
			else {
				let field = $(".input #message");
				let current = field.val();
				let split = Array.from(current);
				let position = field[0].selectionStart;
				let added = app.replaceRange(current, position, position, em);
				field.val(added);
				app.ui.close();
				$(".input #message").focus();
				app.ui.setCaretPosition(field[0], position + em.length);
			}
		});

		$("html").on("click", ".reaction", e => {
			let target = $(e.currentTarget);
			let reacting = target.closest(".messageRow").data("id");
			let em = target.data("reaction");

			let data = {
				conversation: app.conversation,
				message: reacting,
				reaction: em
			};
			app.ws.send(`REACT ${JSON.stringify(data)}`);
		});

		$("html").on("click", "#react .tab", e => {
			let target = $(e.target);
			let name = target.data("name");
			app.ui.switchReactTab(name);
		});

		$("html").on("click", "#react .category", e => {
			let target = $(e.target);
			let term = target.data("term");
			$("#react input[name=searchGifs]").val(term);
			app.ui.searchGifs(term);
		});

		$("html").on("input", "#react input[name=searchGifs]", e => {
			let target = $(e.target);
			let value = target.val().trim();
			
			clearInterval(this.gifTimer);
			this.lastGifSearch = app.time();
			this.gifTimer = setInterval(() => {
				let timeSince = app.time() - this.lastGifSearch;
				if (timeSince >= 1) {
					app.ui.searchGifs(value);
					clearInterval(this.gifTimer);
				}
			}, 100);
		});

		$("html").on("click", "#react .gif", e => {
			let target = $(e.target);
			let gif = target.data("full");

			let data = {
				hnschat: 1,
				attachment: gif
			};
			app.sendMessage(app.conversation, JSON.stringify(data));
			app.ui.close();
		});

		$("html").on("click", e => {
			let target = $(e.currentTarget);
		});

		$("html").on("click", "#users .user, .messageRow .user, .messageRow .favicon, .inline.nick, .header .favicon, .inline.channel, .cam table .user, .screen table .user, #videoInfo .avatar > div", e => {
			let target = $(e.currentTarget);

			if (!app.userForID(app.domain).locked) {
				app.ui.handleRightClick(e, target);
			}
		});

		$("html").on("input paste keydown focus click", ".contextMenu[data-name=userContext] .bioHolder .bio", e => {
			app.ui.updateBioLimit(e);
		});

		$(window).on("contextmenu", e => {
			let target = $(e.target);

			if (["INPUT", "TEXTAREA", "A"].includes(target.prop("tagName")) || target.hasClass("body") || (target.hasClass("inline") && !(target.hasClass("nick") || target.hasClass("channel")))) {
				return;
			}
			else {
				e.preventDefault();

				app.ui.handleRightClick(e, target);
			}
		});

		$("html").on("touchstart", ".messageRow", e => {
			let target = $(e.target);
			if (!(target.hasClass("messageRow") || target.hasClass("message") || target.hasClass("body") || target.hasClass("main") || target.hasClass("msg") || target.hasClass("hover"))) {
				return;
			}

			$("body").addClass("touching");
			this.longPress = e.timeStamp;
			this.longPressTimer = setTimeout(() => {
				app.ui.handleRightClick(e, target);
			}, 500);
		});

		$("html").on("touchcancel", ".messageRow", e => {
			$("body").removeClass("touching");
			this.longPress = 0;
			clearTimeout(this.longPressTimer);
		});

		$("html").on("touchend", ".messageRow", e => {
			if ($("#blackout").hasClass("shown")) {
				setTimeout(() => {
					this.longPress = 0;
					clearTimeout(this.longPressTimer);
					$("body").removeClass("touching");
				}, 500);
			}

			let duration = e.timeStamp - this.longPress;
			if (duration < 500) {
				this.longPress = 0;
				clearTimeout(this.longPressTimer);
				$("body").removeClass("touching");
			}
		});

		$("html").on("click", ".header .icon.menu", e => {
			if ($("#conversations").hasClass("showing")) {
				$("body").removeClass("menu");
				$("#conversations").removeClass("showing");
			}
			else {
				if ($("#users").hasClass("showing")) {
					$("body").removeClass("menu");
					$("#users").removeClass("showing")
				}
				$("body").addClass("menu");
				$("#conversations").addClass("showing");
			}
		});

		$("html").on("click", ".header .icon.users", e => {
			if ($("#holder[data-type=pms]").length) {
				return;
			}

			if ($("#users").hasClass("showing")) {
				$("body").removeClass("menu");
				$("#users").removeClass("showing");
			}
			else {
				if ($("#conversations").hasClass("showing")) {
					$("body").removeClass("menu");
					$("#conversations").removeClass("showing")
				}
				$("body").addClass("menu");
				$("#users").addClass("showing");
			}
		});

		$("html").on("keyup", "input", e => {
			if (app.isKey(e, 13)) {
				let target = $(e.target);
				let submit = target.parent().find(".button").last();
				if (!submit.length) {
					submit = target.closest(".section").find(".button").last();
				}
				submit.click();
			}
		});

		$("html").on("keydown", "input[name=hns]", e => {
			let key = e.key;
			let keyCode = app.key(e);
			let match = key.match(/[a-z ]/g);
			if (match && !(e.shiftKey || e.metaKey || e.ctrlKey) && !(keyCode >= 37 && keyCode <= 40)) {
				e.preventDefault();
			}
		});

		$("html").on("keyup", "#users input[name=search]", e => {
			if (app.isKey(e, 27)) {
				app.ui.searchUsers(false);
			}
			else {
				let target = $(e.target);
				let value = target.val().trim();
				app.ui.queryUsers(value);
			}
		});

		$("html").on("change", "#file", e => {
			let file = $(e.currentTarget)[0].files[0];

			if (file) {
				let url = URL.createObjectURL(file);
				let attachment = $(`
					<div class="attachment" style="background-image: url(${url})">
						<div class="removeHolder">
							<div class="icon action remove" data-action="removeAttachment"></div>
						</div>
						<div class="uploading lds-spinner"><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div></div>
					</div>
				`);
				$("#attachments").append(attachment);
				app.ui.showOrHideAttachments();

				let data = new FormData;
			    data.append("file", file);
			    data.append("key", app.session);
				app.upload(data, attachment).then(r => {
					attachment.find(".uploading").remove();

					if (r.success) {
						attachment.attr("data-id", r.id);
					}
					else {
						alert(r.message);
						attachment.remove();
					}

					app.ui.showOrHideAttachments();
					$("#message").focus();
				});
			}
		});

		$("html").on("input paste keydown focus click", ".popover[data-name=settings] input.color", e => {
			let target = $(e.currentTarget);
			let name = `--${target.attr("name")}`;
			let value = target.val();
			app.ui.root.style.setProperty(name, value);
		});

		$("html").on("change", ".popover[data-name=settings] select[name=chatDisplayMode]", e => {
			let target = $(e.target);
			let value = target.val();
			app.ui.chatDisplayMode(value);
		});

		$("html").on("click", ".messageRow .reply .body", e => {
			let target = $(e.target);
			let message = target.closest(".reply").data("id");
			app.ui.gotoMessage(message);
		});

		$("html").on("click", ".pinnedMessage", e => {
			let target = $(e.target);
			if (target.hasClass("delete")) {
				return;
			}
			let message = app.channelForID(app.conversation).pinned;
			app.ui.gotoMessage(message);
		});

		$("html").on("click", "#jumpToPresent", e => {
			app.ui.setInThePast(false);
			app.ui.clear("messages");
			app.ui.messagesLoading(true);
			app.getMessages();
		});

		$(window).on("message", e => {
			if (e.originalEvent.data) {
				switch (e.originalEvent.data) {
					case "handlePush":
						app.handlePush();
						break;

					case "mobileApp":
						localStorage.setItem("mobile", true);
						break;
				}
			}
		});
	}
}