import { BACKEND_PORT } from './config.js';
// A helper you may want to use when uploading new images to the server.
import { fileToDataUrl, apiCallPost } from './helpers.js';

let globalToken = null;
let curChId = null;
let curUserId = null;

//////////////////////////////////////////////////////
// api calls // includes api get, post, put, delete //
//////////////////////////////////////////////////////

const apiCallDelete2 = (path, body, authed=false) => {
	return new Promise((callbackSuccess, callbackError) => {
		fetch(`http://localhost:5005/${path}`, {
			method: 'DELETE',
			body: JSON.stringify(body),
			headers: {
				'Content-type': 'application/json',
				'Authorization': authed ? `Bearer ${globalToken}` : undefined
			}
		})
		.then((response) => response.json())
		.then((body) => {
			if (body.error) {
				callbackError('Error!');
			} else {
				callbackSuccess(body);
			}
		});
	});
}

const apiCallGet2 = (path, body, authed=false) => {
	return new Promise((resolve, reject) => {
		fetch(`http://localhost:5005/${path}`, {
			method: 'GET',
			headers: {
				'Content-type': 'application/json',
				'Authorization': authed ? `Bearer ${globalToken}` : undefined
			}
		})
		.then((response) => response.json())
		.then((body) => {
			if (body.error) {
				reject('Error!');
			} else {
				resolve(body);
			}
		});
	});
}

const apiCallPost2 = (path, body, authed=false) => {
	return new Promise((callbackSuccess, callbackError) => {
		fetch(`http://localhost:5005/${path}`, {
			method: 'POST',
			body: JSON.stringify(body),
			headers: {
				'Content-type': 'application/json',
				'Authorization': authed ? `Bearer ${globalToken}` : undefined
			}
		})
		.then((response) => response.json())
		.then((body) => {
			if (body.error) {
				errorBox(body.error)
			} else {
				callbackSuccess(body);
			}
		});
	});
}

const apiCallPut2 = (path, body, authed=false) => {
	return new Promise((callbackSuccess, callbackError) => {
		fetch(`http://localhost:5005/${path}`, {
			method: 'PUT',
			body: JSON.stringify(body),
			headers: {
				'Content-type': 'application/json',
				'Authorization': authed ? `Bearer ${globalToken}` : undefined
			}
		})
		.then((response) => response.json())
		.then((body) => {
			if (body.error) {
				callbackError('Error!');
			} else {
				callbackSuccess(body);
			}
		});
	});
}


///////////////////////////////
// helper api call functions //
///////////////////////////////

function sendMsg(channelId, message) {
	apiCallPost2(`message/${channelId}` , {
		message: message,
	}, true)
}


function editMsg(channelId, messageId, message) {
	apiCallPut2(`message/${channelId}/${messageId}` , {
		message : message,
	}, true)
	.then(body => {
		loadChannel(curChId);
	})
} 

function deleteMsg(channelId, messageId) {
	apiCallDelete2(`message/${channelId}/${messageId}`, {}, true)
	.then(body => {
		loadChannel(curChId);
	})
}

function react(channelId, messageId, react) {
	apiCallPost2(`message/react/${channelId}/${messageId}`, {
		react : react,
	}, true)
	.then(body => {
		loadChannel(curChId);
	})
}

function unReact(channelId, messageId, react) {
	apiCallPost2(`message/unreact/${channelId}/${messageId}`, {
		react : react,
	}, true)
	.then(body => {
		loadChannel(curChId);
	})
}

function pin(channelId, messageId) {
	apiCallPost2(`message/pin/${channelId}/${messageId}`, {}, true)
	.then(body => {
		loadChannel(curChId);
	})
}

function unPin(channelId, messageId) {
	apiCallPost2(`message/unpin/${channelId}/${messageId}`, {}, true)
	.then(body => {
		loadChannel(curChId);
	})
}


///////////////////////
//navigate pageblocks//
///////////////////////

document.getElementById('back-to-dashboard').addEventListener('click', (e) => {
	showPage('dashboard');
})

document.getElementById('back-to-dashboard-from-create-ch').addEventListener('click', (e) => {
	showPage('dashboard');
})

document.getElementById('back-to-dashboard-from-profile').addEventListener('click', (e) => {
	showPage('dashboard');
})

document.getElementById('channel-submit').addEventListener('click', (e) => {
	showPage('channel');
})

document.getElementById('view-profile-btn').addEventListener('click', (e) => {
	showPage('profile')
})

////////////////
// load pages //
////////////////

const showPage = (pageName) => {
	for (const page of document.querySelectorAll('.page-block')) {
		page.style.display = 'none';
	}
	document.getElementById(`page-${pageName}`).style.display = 'block';
	if (pageName === 'dashboard') {
		loadDashboard();
		getChannel();
	} else if (pageName === 'profile') {
		checkboxFunction()
		loadProfile()
	}
}

//loads dashboard
const loadDashboard = () => {
	apiCallGet2('channel', {}, true)
	.then(body => {
	
	});
	
};

//loads user profile
function loadProfile() {
	apiCallGet2(`user/${curUserId}`, {}, true)
	.then(body => {
		// console.log(body)
		const hideDetail = document.querySelectorAll(".hide-details")
			hideDetail.forEach(element => {
				element.style.display = 'block'
			});
		document.getElementById("profile-email").textContent = body.email
		document.getElementById("profile-name").textContent = body.name
		document.getElementById("profile-bio").textContent = body.bio

		//no bio set
		if (body.bio === null) {
			document.getElementById("profile-bio").textContent = 'no bio yet'
		}
		//default image when there is no profile image 
		if (body.image === null) {
			document.getElementById("profile-pic").setAttribute('src', './src/defaultprofilepic.png')
		} else {
			document.getElementById('profile-pic').setAttribute('src', body.image)
		}
	})
}

//loads user profile when a user clicks a profile from chat messages
function loadChatUserProfile(userId) {
	apiCallGet2(`user/${userId}`, {}, true)
	.then(body => {
		console.log(body)
		document.getElementById("profile-email").textContent = body.email
		document.getElementById("profile-name").textContent = body.name
		document.getElementById("profile-bio").textContent = body.bio

		//when the profile info user and the logged in user is not the same
		//hide buttons to edit information
		if (!(userId == curUserId)) {
			const hideDetail = document.querySelectorAll(".hide-details")
			console.log('hiding: ' + hideDetail.length)
			hideDetail.forEach(element => {
				element.style.display = 'none'
			});
		} else {
			const hideDetail = document.querySelectorAll(".hide-details")
			hideDetail.forEach(element => {
				element.style.display = 'block'
			});
		}

		//no bio set
		if (body.bio === null) {
			document.getElementById("profile-bio").textContent = 'no bio yet'
		}
		//when there is no profilepic, show default pic
		if (body.image === null) {
			document.getElementById("profile-pic").setAttribute('src', './src/defaultprofilepic.png')
		} else {
			console.log('setting image: ' + body.image)
			document.getElementById('profile-pic').setAttribute('src', body.image)
		}
	})
}

//////////////
// register //
//////////////

document.getElementById('register-submit').addEventListener('click', (e) => {
	const email = document.getElementById('register-email').value;
	const name = document.getElementById('register-name').value;
	const password = document.getElementById('register-password').value;
	const passwordConfirm = document.getElementById('register-password-confirm').value;
	//alert when passwords don't match
	if (password !== passwordConfirm) {
		alert('Passwords need to match');
	} else {
		apiCallPost2('auth/register', {
			email: email,
			name: name,
			password: password,
		})
		.then((body) => {
			const { token, userId } = body;
			globalToken = token;
			curUserId = userId;
			localStorage.setItem('token', token);
			showPage('dashboard');
		})
		.catch((msg) => {
			alert(msg);
		});
	}
});

///////////
// login //
///////////

document.getElementById('login-submit').addEventListener('click', (e) => {
	const email = document.getElementById('login-email').value;
	const password = document.getElementById('login-password').value;

	apiCallPost2('auth/login', {
		email: email,
		password: password,
	})
	.then((body) => {
		const { token, userId } = body;
		globalToken = token;
		curUserId = userId;
		localStorage.setItem('token', token);
		showPage('dashboard');
	})
	.catch((msg) => {
		alert(msg);
	});
});

////////////
// logout //
////////////

document.getElementById('logout').addEventListener('click', (e) => {
	apiCallPost2('auth/logout', {}, true)
	.then(() => {
		localStorage.removeItem('token');
		showPage('register');
	})
	.catch((msg) => {
		alert(msg);
	});
});

/////////////
// channel //
/////////////

//create channel
document.getElementById('create-channel-button').addEventListener('click', (event) => {
	createChannel();
});
function createChannel() {
	const channelNameInput = document.getElementById('channel-name');
	const channelDescriptionInput = document.getElementById('channel-description');
	const channelPrivacySelect = document.getElementById('channel-privacy');
	
	const name = channelNameInput.value;
	const description = channelDescriptionInput.value;
	let privacy = channelPrivacySelect.value;

	//check privacy settings
	if (privacy === 'private') {
		privacy = true;
	} else {
		privacy = false;
	}

	apiCallPost2('channel', {
		name: name,
		private: privacy,
		description: description,
	}, true)
	.then((body) => {
		getChannel();
		showPage('dashboard')
	})
}

//get lists of channels and displays them 
function getChannel() {
	apiCallGet2('channel', {}, true)
	.then(body => {
		const publicDiv = document.getElementById('public-ch-list')
		const privateDiv = document.getElementById('private-ch-list')

		publicDiv.textContent = ''
		privateDiv.textContent = ''

		//loops through existing channels
		for(let i = 0; i < body.channels.length; i++) {
			//when the channel is public
			if(!body.channels[i]["private"]) {
				//get channel name
				const nameDiv = document.createElement('div');
				const name = body.channels[i]['name']
				nameDiv.textContent = 'channel name: ' + name 
				nameDiv.style.fontSize = '25px'
				nameDiv.style.fontWeight = "bold"

				//get channel id
				const idDiv = document.createElement('div');
				const id = body.channels[i]['id']
				idDiv.textContent =  'channel id: ' + id
				idDiv.style.fontStyle = "italic"
				idDiv.style.marginBottom = '10px'

				//make a div that contains name & id
				const superParentDiv = document.createElement('div');
				superParentDiv.style.display = 'flex'
				superParentDiv.style.flexDirection = 'column'

				//when user hovers mouse on the div, opacity changes
				const parentDiv = document.createElement('div');
				parentDiv.style.display = 'flex'
				parentDiv.style.flexDirection = 'column'
				parentDiv.appendChild(nameDiv)
				parentDiv.appendChild(idDiv)
				parentDiv.addEventListener('mouseover', () => {
					parentDiv.style.opacity = 0.5;
				})
				parentDiv.addEventListener('mouseout', () => {
					parentDiv.style.opacity = 1.0;
				})
				parentDiv.style.cursor = "pointer";
				publicDiv.appendChild(superParentDiv);

				parentDiv.addEventListener('click', () => {
					curChId = id;
					loadChannel(id);
				})

				superParentDiv.appendChild(parentDiv)

				//if user is in the channel, shows leave button
				if (validMember(curUserId, body.channels[i].members)) {
					const btnDiv = document.createElement('div')
					const leaveBtn = document.createElement('button')
					btnDiv.appendChild(leaveBtn)
					btnDiv.style.marginBottom = '10px'
					btnDiv.style.marginTop = '10px'
					publicDiv.appendChild(btnDiv)
					leaveBtn.innerHTML = "leave"
					//click on leave
					leaveBtn.addEventListener('click', () => {
						apiCallPost2(`channel/${body.channels[i].id}/leave`, {}, true)
						.then(() => {
							alert('you left the channel. bye!')
							showPage('dashboard')
						})
					})
					leaveBtn.style.width = '70px'
					leaveBtn.classList.add('btn')
					leaveBtn.classList.add('btn-danger')
					superParentDiv.appendChild(btnDiv)
				//if user is not a member of channel, show join button
				} else {
					const btnDiv = document.createElement('div')
					const joinBtn = document.createElement('button')
					btnDiv.appendChild(joinBtn)
					btnDiv.style.marginBottom = '10px'
					btnDiv.style.marginTop = '10px'
					publicDiv.appendChild(btnDiv)
					joinBtn.innerHTML = "join";
					joinBtn.addEventListener('click', () => {
						apiCallPost2(`channel/${body.channels[i].id}/join`, {}, true)
						.then(() => {
							alert('welcome aboard!')
							curChId = body.channels[i].id
							loadChannel(body.channels[i].id)
						})
					})
					joinBtn.style.width = '70px'
					joinBtn.classList.add('btn')
					joinBtn.classList.add('btn-success')
					superParentDiv.appendChild(joinBtn)
				}
				superParentDiv.classList.add('round-border')
				superParentDiv.classList.add('round-border-padding')
			//if channel is private
			} else {
				//if user is not a member, don't show any channels
				if (!validMember(curUserId, body.channels[i].members)) {
					continue;
				}
				//if user is a member of a private channel
				//get channel name
				const nameDiv = document.createElement('div');
				const name = body.channels[i]['name']
				nameDiv.textContent = 'channel name: ' + name 
				nameDiv.style.fontSize = '25px'
				nameDiv.style.fontWeight = "bold"

				//get channel id
				const idDiv = document.createElement('div');
				const id = body.channels[i]['id']
				idDiv.textContent =  'channel id: ' + id
				idDiv.style.fontStyle = "italic"
				idDiv.style.marginBottom = '10px'

				//create div which includes both name & id
				const superParentDiv = document.createElement('div');
				superParentDiv.style.display = 'flex'
				superParentDiv.style.flexDirection = 'column'

				//when user hovers on the div, opacity changes
				const parentDiv = document.createElement('div');
				parentDiv.style.display = 'flex'
				parentDiv.style.flexDirection = 'column'
				parentDiv.appendChild(nameDiv)
				parentDiv.appendChild(idDiv)
				parentDiv.style.paddingBottom = '10px'
				parentDiv.addEventListener('mouseover', () => {
					parentDiv.style.opacity = 0.5;
				})
				parentDiv.addEventListener('mouseout', () => {
					parentDiv.style.opacity = 1.0;
				})
				parentDiv.style.cursor = "pointer";
				privateDiv.appendChild(superParentDiv);

				//click on channel
				parentDiv.addEventListener('click', () => {
					curChId = id
					loadChannel(id);
				})

				superParentDiv.appendChild(parentDiv)

				//leave button 
				const btnDiv = document.createElement('div')
				const leaveBtn = document.createElement('button')
				btnDiv.appendChild(leaveBtn)
				btnDiv.style.marginBottom = '10px'
				btnDiv.style.marginTop = '10px'
				privateDiv.appendChild(btnDiv)
				leaveBtn.innerHTML = "leave"
				leaveBtn.addEventListener('click', () => {
					apiCallPost2(`channel/${body.channels[i].id}/leave`, {}, true)
					.then(() => {
						alert('you left the channel. bye!')
						showPage('dashboard')
					})
				})
				leaveBtn.style.width = '70px'
				leaveBtn.classList.add('btn')
				leaveBtn.classList.add('btn-danger')
				superParentDiv.appendChild(btnDiv)
				superParentDiv.classList.add('round-border')
				superParentDiv.classList.add('round-border-padding')
			}
		}
	})
}

//get details of channels and loads the corresponding channel page
function loadChannel(channelId) {
	apiCallGet2(`channel/${channelId}` , {}, true)
	.then(body => {
		const invBtn = document.getElementById('inv-ppl-btn')
		invBtn.addEventListener('click', () => {
			inviteFunction(channelId)
		}, { once: true })

		//grab details
		document.getElementById("ch-info-name").textContent = body.name
		document.getElementById("ch-info-desc").textContent = body.description
		const dateTime = new Date(body.createdAt)
		document.getElementById("ch-info-timestamp").textContent = dateTime.toString().substring(0, 21)
		document.getElementById("ch-info-creator").textContent = body.creator
		const msgParentDiv = document.getElementById('display-msg')
		msgParentDiv.innerHTML = ''
	
		//get user name
		apiCallGet2(`user/${body.creator}`, {}, true)
		.then(body => {
			document.getElementById("ch-info-creator").textContent = body.name
		})

		//check privacy 
		if (body.private === false) {
			document.getElementById("ch-info-priv").textContent = 'public'
		} else {
			document.getElementById("ch-info-priv").textContent = 'private'
		}

		//if there is no name
		if (body.name === '') {
			document.getElementById("ch-info-name").textContent = 'no name yet'
		}
		//if there is no description
		if (body.description === '') {
			document.getElementById("ch-info-desc").textContent = 'no description yet'
		}

		//display pinned messages & messages
		const pinnedMsgDiv = document.getElementById('ch-pinned-msg')
		pinnedMsgDiv.textContent = ''
		collectPinnedMsg(channelId, 0, pinnedMsgDiv)
		collectMsg(channelId, 0, msgParentDiv)
	})
	.then((body) => showPage('singleChannel'));
}

//edit and update channel name 
document.getElementById('edit-ch-name-button').addEventListener('click', ()=> changeChName(curChId));
function changeChName(channelId) {
	//grab values
	const originalDesc = document.getElementById('ch-info-desc').value
	const updatedName = document.getElementById('edit-ch-name').value
	document.getElementById('ch-info-name').innerHTML = updatedName
	document.getElementById('edit-ch-name').value = ''

	apiCallPut2(`channel/${channelId}` , {
		name: updatedName,
		description: originalDesc,
	}, true)
	.then(body => {
		// console.log('channel name changed!')
		alert('The name of the channel has been successfully changed')
		loadChannel(curChId);

	})
}

//edit and update channel description
document.getElementById('edit-ch-desc-button').addEventListener('click', ()=> changeChDesc(curChId));
function changeChDesc(channelId) {
	//grab values
	const originalName = document.getElementById('ch-info-name').value
	const updatedDesc = document.getElementById('edit-ch-desc').value
	document.getElementById('ch-info-desc').innerHTML = updatedDesc
	document.getElementById('edit-ch-desc').value = ''

	apiCallPut2(`channel/${channelId}` , {
		name: originalName,
		description: updatedDesc,
	}, true)
	.then(body => {
		alert('The description of the channel has been successfully changed')
		loadChannel(curChId);

	})
}

//invite users to channels
const invBtn = document.getElementById('inv-btn')
invBtn.addEventListener('click', () => {
	const modalBody = document.getElementById('inv-ppl')
	modalBody.innerHTML = ''
	apiCallGet2('user', {}, true)
	.then(body => {
		//loop through users
		for (let i = 0; i < body.users.length; i++) {
			const userDiv = document.createElement('div')
			userDiv.style.display = 'flex'

			//create check box with users' id
			const checkBox = document.createElement('input')
			checkBox.type = 'checkbox'
			checkBox.value = body.users[i].id
			checkBox.name = 'ppl-check'
			checkBox.id = body.users[i].id
			checkBox.style.marginRight = '10px'
			userDiv.appendChild(checkBox)

			//get the id and replace it by users' name
			apiCallGet2(`user/${body.users[i].id}`, {}, true)
			.then(body => {
				const nameDisplayDiv = document.createElement('div')
				nameDisplayDiv.innerText = body.name
				userDiv.appendChild(nameDisplayDiv)
				modalBody.appendChild(userDiv)
			})
		}

	})
})

//invite users to current channel
const inviteFunction = (channelId) => {
	const checkedBoxes = document.querySelectorAll('input[name=ppl-check]:checked');
	for (let i = 0; i < checkedBoxes.length; i++) {
		apiCallPost2(`channel/${channelId}/invite`, {
			userId: parseInt(checkedBoxes[i].value)
		}, true)
		.then(body => {
			console.log('invited to channel ' + channelId)
		})
	}
	showPage('dashboard')
}


//////////////
// messages //
//////////////

//get lists of messages
function getMsg(channelId, start) {
	return new Promise((resolve, reject) => {
		fetch((`http://localhost:5005/message/${channelId}?start=${start}`), {
			method: 'GET',
			headers: {
				'Content-type': 'application/json',
				'Authorization': true ? `Bearer ${globalToken}` : undefined
			}
		})
		.then((response) => response.json())
		.then((body) => {
			if (body.error) {
				reject('Error!')
			} else {
				resolve(body)
			}
		})
	})
}

//collect messages
function collectMsg(channelId, startIndex, msgParentDiv) {
	//get messages
	getMsg(channelId, startIndex)
		.then(body => {
			//collect every 25 messages
			if (body.messages.length === 25) {
				collectMsg(channelId, startIndex += 25, msgParentDiv)
			}

			//create divs for each message
			for(let j = 0; j < body.messages.length; j++) {
				const msgChildDiv = document.createElement('div')
				msgChildDiv.style.borderBottom = 'solid 1px black'

				// msg sender
				const msgSenderDiv = document.createElement('div')
				msgSenderDiv.addEventListener('click', () => {
					showChatUserProfilePage(body.messages[j]['sender']);
				})
				apiCallGet2(`user/${body.messages[j]['sender']}`, {}, true)
				.then(body => {
					msgSenderDiv.innerHTML += body.name
				})
				msgSenderDiv.style.fontWeight = 'bold'
				msgSenderDiv.style.fontSize = '25px'
				msgChildDiv.appendChild(msgSenderDiv)

				// msg sender profile pic
				const msgSenderProfileDiv = document.createElement('div')
				const profilePic = document.createElement("img");
				apiCallGet2(`user/${body.messages[j]['sender']}`, {}, true)
				.then(body => {
					//if user didnt set profile pic, set as defualt pic
					if (body.image === '' || body.image === null) {
						profilePic.setAttribute("src", "./src/defaultprofilepic.png");
					} else {
						profilePic.setAttribute("src", body.image);
					}
				})
				profilePic.setAttribute("height", "20px");
				profilePic.setAttribute("width", "20px");
				profilePic.setAttribute("alt", "Profile pic of user");
				profilePic.style.borderRadius = '15px'
				profilePic.style.width = '40px'
				profilePic.style.height = '40px'

				msgSenderProfileDiv.appendChild(profilePic)
				msgChildDiv.appendChild(msgSenderProfileDiv)

				// msg sent time
				const msgTimeDiv = document.createElement('div')
				const dateTime = new Date(body.messages[j]['sentAt'])
				msgTimeDiv.innerHTML += dateTime.toString().substring(0, 21)
				msgTimeDiv.style.fontStyle = 'italic'
				msgTimeDiv.style.fontSize = '15px'
				msgChildDiv.appendChild(msgTimeDiv)

				// msg content
				const msgMsgDiv = document.createElement('div')
				msgMsgDiv.innerHTML += body.messages[j]['message']
				msgMsgDiv.style.fontSize = '20px'
				msgChildDiv.appendChild(msgMsgDiv)
				msgChildDiv.style.marginBottom = '10px'

				// pin or unpin
				// if pinned, show unpin button
				if (body.messages[j]['pinned']) {
					const unpinnedBtn = document.createElement('button')
					unpinnedBtn.textContent = 'unpin'
					unpinnedBtn.classList.add('btn')
					unpinnedBtn.classList.add('btn-danger')
					
					
					msgChildDiv.appendChild(unpinnedBtn)
					unpinnedBtn.addEventListener('click', () => {
						unPin(curChId, body.messages[j]['id'])
					})
				//if unpinned, show pin button
				} else {
					const pinnedBtn = document.createElement('button')
					pinnedBtn.textContent = 'pin'
					pinnedBtn.classList.add('btn')
					pinnedBtn.classList.add('btn-success')
					msgChildDiv.appendChild(pinnedBtn)
					pinnedBtn.addEventListener('click', () => {
						pin(curChId, body.messages[j]['id'])
					})
				}

				//react
				const reactionDiv = document.createElement('div')
				reactionDiv.textContent = 'react: '
				reactionDiv.style.display = 'flex'

				//react angry 
				const angryBtn = document.createElement('button')
				angryBtn.textContent = '😡'
				angryBtn.addEventListener('click', () => {
					react(curChId, body.messages[j]['id'], "angry")
					alert('You have reacted 😡 to the msg: ' + body.messages[j]['message'])
				})
				reactionDiv.appendChild(angryBtn)

				//react happy
				const happyBtn = document.createElement('button')
				happyBtn.textContent = '😊'
				happyBtn.addEventListener('click', () => {
					react(curChId, body.messages[j]['id'], "happy")
					alert('You have reacted 😊 to the msg: ' + body.messages[j]['message'])
				})
				reactionDiv.appendChild(happyBtn)

				//react korea
				const koreanBtn = document.createElement('button')
				koreanBtn.textContent = '🇰🇷'
				koreanBtn.addEventListener('click', () => {
					react(curChId, body.messages[j]['id'], "feelsKoreanMan")
					alert('You have reacted 🇰🇷 to the msg: ' + body.messages[j]['message'])
				})
				reactionDiv.appendChild(koreanBtn)

				msgChildDiv.appendChild(reactionDiv)

				//unreact
				const unreactionDiv = document.createElement('div')
				unreactionDiv.textContent = 'unreact: '
				unreactionDiv.style.display = 'flex'

				//unreact angry
				const angryBtn2 = document.createElement('button')
				angryBtn2.textContent = '😡'
				angryBtn2.addEventListener('click', () => {
					unReact(curChId, body.messages[j]['id'], "angry")
					alert('You have unreacted 😡 to the msg: ' + body.messages[j]['message'])
				})
				unreactionDiv.appendChild(angryBtn2)

				//unreact happy
				const happyBtn2 = document.createElement('button')
				happyBtn2.textContent = '😊'
				happyBtn2.addEventListener('click', () => {
					unReact(curChId, body.messages[j]['id'], "happy")
					alert('You have unreacted 😊 to the msg: ' + body.messages[j]['message'])
				})
				unreactionDiv.appendChild(happyBtn2)

				//unreact korea
				const koreanBtn2 = document.createElement('button')
				koreanBtn2.textContent = '🇰🇷'
				koreanBtn2.addEventListener('click', () => {
					unReact(curChId, body.messages[j]['id'], "feelsKoreanMan")
					alert('You have unreacted 🇰🇷 to the msg: ' + body.messages[j]['message'])
				})
				unreactionDiv.appendChild(koreanBtn2)

				msgChildDiv.appendChild(unreactionDiv)

				//enable user to edit their own message
				//check if current user id is the same as sender id
				if (curUserId === body.messages[j]['sender']) {
					const msgBtnDiv = document.createElement('div')
					msgBtnDiv.style.display = 'flex'

					//edit message
					const editBtn = document.createElement('button')
					editBtn.textContent = 'edit'
					editBtn.setAttribute("class", "btn btn-secondary")
					editBtn.addEventListener('click', () => {
						let userEditMsgInput = prompt("Type in your new edited message")
						//cannt edit when empty or white space
						if (userEditMsgInput === null || userEditMsgInput === '' || userEditMsgInput.trim().length === 0) {
							alert('Cannot contain only white space or be empty')
						//cannt edit to same message
						} else if (userEditMsgInput === body.messages[j]['message']) {
							alert('same existing message')
						//else edit
						}else {
							editMsg(curChId, body.messages[j]['id'], userEditMsgInput)
							alert('Success')
						}
					})

					//delete message
					const deleteBtn = document.createElement('button')
					deleteBtn.textContent = 'delete'
					deleteBtn.setAttribute("class", "btn btn-danger")
					deleteBtn.addEventListener('click', () => {
						deleteMsg(curChId, body.messages[j]['id'])
					})

					msgBtnDiv.appendChild(editBtn)
					msgBtnDiv.appendChild(deleteBtn)

					msgChildDiv.appendChild(msgBtnDiv)
				}
				msgParentDiv.appendChild(msgChildDiv)
			}
		})
}

//send message
document.getElementById('send-btn').addEventListener('click', () => {
	const message = document.getElementById('ch-msg-input')
	//empty or white spaces cannot be sent
	if (message.value === '' || message.value.trim().length === 0) {
		alert('Cannot contain only white space or be empty')
		message.value = ''
	//else send
	} else {
		sendMsg(curChId, message.value)
		message.value = ''
	}
	loadChannel(curChId)
})

//collect pin messagess
function collectPinnedMsg(channelId, startIndex, msgParentDiv) {
	getMsg(channelId, startIndex)
	.then (body => {
		if (body.messages.length === 25) {
			collectPinnedMsg(channelId, startIndex += 25, msgParentDiv)
		}

		for (let j = 0; j < body.messages.length; j++) {
			if (!body.messages[j]['pinned']) {
				continue;
			}
			const msgChildDiv = document.createElement('div')
			msgChildDiv.style.border = 'solid black 1px'

			// msg sender
			const msgSenderDiv = document.createElement('div')
			msgSenderDiv.addEventListener('click', () => {
				showChatUserProfilePage(body.messages[j]['sender']);
			})
			apiCallGet2(`user/${body.messages[j]['sender']}`, {}, true)
			.then(body => {
				msgSenderDiv.innerHTML += body.name
			})
			msgSenderDiv.style.fontWeight = 'bold'
			msgChildDiv.appendChild(msgSenderDiv)

			// msg sender profile pic
			const msgSenderProfileDiv = document.createElement('div')
			const profilePic = document.createElement("img");
			apiCallGet2(`user/${body.messages[j]['sender']}`, {}, true)
			.then(body => {
				if (body.image === '' || body.image === null) {
					profilePic.setAttribute("src", "./src/defaultprofilepic.png");
				} else {
					profilePic.setAttribute("src", body.image);
				}
			})
			profilePic.setAttribute("height", "20px");
			profilePic.setAttribute("width", "20px");
			profilePic.setAttribute("alt", "Profile pic of user");
			profilePic.style.borderRadius = '15px'
			msgSenderProfileDiv.appendChild(profilePic)
			msgChildDiv.appendChild(msgSenderProfileDiv)

			// msg sent time
			const msgTimeDiv = document.createElement('div')
			const dateTime = new Date(body.messages[j]['sentAt'])
			msgTimeDiv.innerHTML += dateTime.toString().substring(0,21)
			msgTimeDiv.style.fontStyle = 'italic'
			msgTimeDiv.style.fontSize = '8px'
			msgChildDiv.appendChild(msgTimeDiv)

			// msg content
			const msgMsgDiv = document.createElement('div')
			msgMsgDiv.innerHTML += body.messages[j]['message']
			msgChildDiv.appendChild(msgMsgDiv)
			msgChildDiv.style.marginBottom = '10px'

			msgParentDiv.appendChild(msgChildDiv)
		}
	})
}


/////////////
// profile //
/////////////

//edit self's name
document.getElementById('edit-profile-name-button').addEventListener('click', ()=>changeProfileName())
function changeProfileName() {
	const updatedProfileName = document.getElementById('edit-profile-name').value


	document.getElementById('profile-name').innerHTML = updatedProfileName
	document.getElementById('edit-profile-name').value = ''

	apiCallPut2('user', {
		name: updatedProfileName,
	}, true)
	.then(body => {
		alert('The name of the profile has been successfully changed')
		showPage('profile')
	})
}

//edit self's bio
document.getElementById('edit-profile-bio-button').addEventListener('click', ()=>changeProfileBio())
function changeProfileBio() {
	const origianlProfileBio = document.getElementById('profile-bio').innerHTML
	const updatedProfileBio = document.getElementById('edit-profile-bio').value
	// console.log(origianlProfileBio)
	document.getElementById('profile-bio').innerHTML = updatedProfileBio
	document.getElementById('edit-profile-bio').value = ''

	apiCallPut2('user', {
		bio: updatedProfileBio,
	}, true)
	.then(body => {
		alert('The bio of the profile has been successfully changed')
		showPage('profile')
	})
}

//edit self's email
document.getElementById('edit-profile-email-button').addEventListener('click', ()=>changeProfileEmail())
function changeProfileEmail() {
	const updatedProfileEmail = document.getElementById('edit-profile-email').value
	document.getElementById('profile-email').innerHTML = updatedProfileEmail
	document.getElementById('edit-profile-email').value = ''

	apiCallPut2('user', {
		email: updatedProfileEmail,
	}, true)
	.then(body => {
		alert('The email of the profile has been successfully changed')
		showPage('profile')
	})
}

//edit self's pw
document.getElementById('edit-profile-pw-button').addEventListener('click', ()=>changeProfilePw())
function changeProfilePw() {
	const origianlProfilePw = document.getElementById('profile-pw').innerHTML
	const updatedProfilePw = document.getElementById('myInput').value

	document.getElementById('myInput').value = ''

	apiCallPut2('user', {
		password: updatedProfilePw,
	}, true)
	.then(body => {
		alert('The password of the profile has been successfully changed')
		showPage('profile')
	})
}

//edit self's profile pic
document.getElementById('edit-profile-pic-button').addEventListener('click', ()=>changeProfilePic())
function changeProfilePic() {
	const updatedProfilePic =document.querySelector('input[type="file"]').files[0];
	fileToDataUrl(updatedProfilePic).then((data) => {
		apiCallPut2('user', {
			image: data,
		}, true)
		.then(body => {
			alert('The picture of the profile has been successfully changed')
			showPage('profile')
		})
	})
}

//shows user profile on chat
function showChatUserProfilePage(userid) {
	for (const page of document.querySelectorAll('.page-block')) {
		page.style.display = 'none';
	}
	document.getElementById(`page-profile`).style.display = 'block';
	loadChatUserProfile(userid)
}

////////////////////////////
// other helper functions //
////////////////////////////

//checkbox when inviting users (selecting users)
function checkboxFunction() {
	const checkbox = document.getElementById('showpwd')
	checkbox.addEventListener('change', () => {
		console.log('checkbox clicked')
		showPwd()
	})
}

//when editing password, function to show/hide pwd
function showPwd() {
	const x = document.getElementById("myInput");
	if (x.type === "password") {
	  x.type = "text";
	} else {
	  x.type = "password";
	}
}

//error box which is closable by x 
function errorBox(errorMsg) {
	const modal = document.getElementById("myModal");
	const span = document.getElementsByClassName("close")[0];
	const errortext = document.getElementById('modal-txt')
	errortext.textContent = errorMsg
	modal.style.display = "block";
	span.onclick = function() {
		modal.style.display = "none";
	}
}

//check if user is a member
function validMember (userId, members) {
	let validMember = false;
	for (let i = 0; i < members.length ; i++) {
		if (userId == members[i]) {
			validMember = true;
			break;
		}
	}
	return validMember;
}

for (const redirect of document.querySelectorAll('.redirect')) {
	const newPage = redirect.getAttribute('redirect');
	redirect.addEventListener('click', () => {
		showPage(newPage);
	});
}

const localStorageToken = localStorage.getItem('token');
if (localStorageToken !== null) {
	globalToken = localStorageToken;
}

if (globalToken === null) {
	showPage('register');
} else {
	showPage('dashboard');
}
