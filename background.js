// background-script.js
"use strict";
const _browser = chrome || browser
let domain, cookiesList
let tabID

const CookiesListEnum = {
	LinkedIn: {domain: ".linkedin.com", cookiesList: ["li_at"]},
	Twitter: {domain: ".twitter.com", cookiesList: ["auth_token"]},
	Instagram: {domain: ".instagram.com", cookiesList: ["sessionid"]},
	Facebook: {domain: ".facebook.com", cookiesList: ["c_user", "xs"]}
}

const sendCookie = (cookies) => {
	_browser.tabs.sendMessage(tabID, {cookies})
}

const cookieChanged = (changeInfo) => {
	_browser.cookies.getAll({ domain }, (cookies) => {
		const retrievedCookies = cookiesList.map(name => cookies.filter(el => el.name === name)[0])
		if (retrievedCookies[0]) {
			console.log("retrievedCookiesChanged", retrievedCookies[0])
			console.log("tabID is still", tabID)
			_browser.cookies.onChanged.removeListener(cookieChanged)
			sendCookie(retrievedCookies)
		}
	})
}

_browser.runtime.onMessage.addListener((msg, sender, sendResponse) => {
	if (msg.opening) {
		_browser.cookies.onChanged.addListener(cookieChanged)
	}
	if (msg.websiteName) {
		const websiteName = msg.websiteName
		_browser.tabs.query({ active: true, currentWindow: true }, (currentTab) => {
				tabID = currentTab[0].id
				console.log("tabID = ", tabID)
		})
		domain = CookiesListEnum[websiteName].domain
		cookiesList = CookiesListEnum[websiteName].cookiesList
		_browser.cookies.getAll({ domain }, (cookies) => {
			const retrievedCookies = cookiesList.map(name => cookies.filter(el => el.name === name)[0])
			console.log("retrivedCookiesbeforesending:", retrievedCookies)
			sendCookie(retrievedCookies)
		})
	}
})
