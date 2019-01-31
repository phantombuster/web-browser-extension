// background-script.js
"use strict"
// const browser = chrome || browser
let domain
let cookiesList
let tabID

const COOKIESLISTENUM = {
	LinkedIn: {domain: ".linkedin.com", cookiesList: ["li_at"]},
	Twitter: {domain: ".twitter.com", cookiesList: ["auth_token"]},
	Instagram: {domain: ".instagram.com", cookiesList: ["sessionid"]},
	Facebook: {domain: ".facebook.com", cookiesList: ["c_user", "xs"]},
}

const sendCookie = (cookies) => {
	browser.tabs.sendMessage(tabID, {cookies})
}

const cookieChanged = (changeInfo) => {
	browser.cookies.getAll({ domain }).then((cookies) => {
		const retrievedCookies = cookiesList.map((name) => cookies.filter((el) => el.name === name)[0])
		if (retrievedCookies[0]) {
			console.log("retrievedCookiesChanged", retrievedCookies[0])
			console.log("tabID is still", tabID)
			browser.cookies.onChanged.removeListener(cookieChanged)
			sendCookie(retrievedCookies)
		}
	})
}

browser.runtime.onMessage.addListener((msg) => {
	if (msg.opening) {
		browser.cookies.onChanged.addListener(cookieChanged)
	}
	if (msg.websiteName) {
		const websiteName = msg.websiteName
		browser.tabs.query({ active: true, currentWindow: true }).then((currentTab) => {
				tabID = currentTab[0].id
				console.log("tabID = ", tabID)
		})
		domain = COOKIESLISTENUM[websiteName].domain
		cookiesList = COOKIESLISTENUM[websiteName].cookiesList
		browser.cookies.getAll({ domain }).then((cookies) => {
			const retrievedCookies = cookiesList.map((name) => cookies.filter((el) => el.name === name)[0])
			console.log("retrivedCookiesbeforesending:", retrievedCookies)
			sendCookie(retrievedCookies)
		})
	}
})
