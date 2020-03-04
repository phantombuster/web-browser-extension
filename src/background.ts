// background-script.js
declare var browser: typeof chrome
const _browser = chrome || browser
let domain
let cookiesList
let tabID
let cookiesSent = false

const sendNotification = (title: string, message: string) => {
	_browser.notifications.create({ type: "basic", message, title, iconUrl: "./img/icon.png", silent: true } as NotificationOptions)
}

const sendCookie = (cookies, silence = false) => {
	_browser.tabs.sendMessage(tabID, {cookies})
	if (cookies[0]) {
		cookiesSent = true
		if (!silence) {
			const message = `Your ${website} ${cookies.length > 1 ? "cookies have" : "cookie has"} been successfully entered.`
			// @ts-ignore
			_browser.notifications.create({type: "basic", message, title: "Phantombuster", iconUrl: "./img/icon.png", silent: true})
		}
	}
}

const cookieChanged = () => {
	_browser.cookies.getAll({ domain }, (cookies) => {
		console.log("domain:", domain)
		const retrievedCookies = cookiesList.map((cookie) => cookies.filter((el) => el.name === cookie.name && el.domain === cookie.domain)[0])
		console.log("retrievedCookies:", retrievedCookies)
		if (retrievedCookies[0] && !cookiesSent) {
			_browser.cookies.onChanged.removeListener(cookieChanged)
			sendCookie(retrievedCookies)
		}
	})
}

_browser.runtime.onMessage.addListener((msg, sender, _sendResponse) => {
	if (msg.opening) {
		_browser.cookies.onChanged.addListener(cookieChanged)
	}
	if (msg.website) {
		cookiesSent = false
		website = msg.website
		const canSendNotif = msg.silence
		tabID = sender.tab.id
		domain = WEBSITEENUM[website].domain
		cookiesList = WEBSITEENUM[website].cookiesList
		_browser.cookies.getAll({}, (cookies) => {
			console.log("cookies:", cookies)
			const retrievedCookies = cookiesList.map((cookie) => cookies.filter((el) => el.name === cookie.name && el.domain === cookie.domain)[0])
			console.log("retrievedCookies", retrievedCookies)
			sendCookie(retrievedCookies, canSendNotif)
		})
	} else if (msg.notif) {
		const { title, message } = msg.notif
		sendNotification(title, message)
	}
})

_browser.runtime.onInstalled.addListener((info) => {
	console.log(info)
	// The extension will relaunch whenever it was first install or an update
	_browser.tabs.query({}, (tabs) => {
		for (const t of tabs) {
			_browser.tabs.sendMessage(t.id, { restart: "restart" })
		}
	})
})

// redirecting to phantombuster.com when clicking on main icon
_browser.browserAction.onClicked.addListener((_tab) => _browser.tabs.update({ url: "https://phantombuster.com" }))

_browser.tabs.onUpdated.addListener((id, changeInfo) => {
	if (changeInfo.status && changeInfo.status === "complete") {
		_browser.tabs.sendMessage(id, { restart: "restart" })
	}
})
