import { WEBSITEENUM } from "../shared/websites"

declare var browser: typeof chrome
const _browser = chrome || browser
let domain: string
let cookiesList: chrome.cookies.Cookie[]
let tabID: number
let cookiesSent = false

const sendNotification = (title: string, message: string) => {
	_browser.notifications.create({ type: "basic", message, title, iconUrl: "./img/icon.png", silent: true } as NotificationOptions)
}

const sendCookie = (cookies: chrome.cookies.Cookie[], silence = false) => {
	_browser.tabs.sendMessage(tabID, {cookies})
	if (cookies[0]) {
		cookiesSent = true
		if (!silence) {
			const message = `Your ${cookies.length > 1 ? "cookies have" : "cookie has"} been successfully entered.`
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

// TODO: remove thos ugly ts-ignore
_browser.runtime.onMessage.addListener((msg, sender, _sendResponse) => {
	if (msg.opening) {
		_browser.cookies.onChanged.addListener(cookieChanged)
	}
	if (msg.website) {
		cookiesSent = false
		const website = msg.website as string
		const canSendNotif = msg.silence
		tabID = sender?.tab?.id as number
		// @ts-ignore
		domain = WEBSITEENUM[website].domain
		// @ts-ignore
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

// The extension will relaunch whenever it was first install or an update
_browser.runtime.onInstalled.addListener(() => {
	const isChrome = document.location.protocol.indexOf("chrome") > -1
	// only send signals to phantombuster & zapier pages
	_browser.tabs.query({ url: [ "*://*.phantombuster.com/*", "*://zapier.com/*" ] }, (tabs) => {
		for (const t of tabs) {
			if (isChrome) {
				_browser.tabs.reload(t.id as number)
			} else {
				_browser.tabs.sendMessage(t.id as number, { restart: "restart" })
			}
		}
	})
})

// redirecting to phantombuster.com when clicking on main icon
_browser.browserAction.onClicked.addListener((_tab) => _browser.tabs.update({ url: "https://phantombuster.com" }))

_browser.tabs.onUpdated.addListener((id, changeInfo, tab) => {
	// Only monitor Phantombuster & Zapier tabs
	if (!tab.url || (tab.url.indexOf("phantombuster.com") < 0 && tab.url.indexOf("zapier.com") < 0)) {
		return
	}
	if (changeInfo?.status === "complete") {
		_browser.tabs.sendMessage(id, { restart: "restart" })
	}
})

