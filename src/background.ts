// background-script.js
"use strict"
// const browser = chrome || browser
let domain
let cookiesList
let website
let tabID
let cookiesSent = false

const sendCookie = (cookies) => {
	browser.tabs.sendMessage(tabID, {cookies})
	if (cookies[0]) {
		cookiesSent = true
		const message = `Your ${website} ${cookies.length > 1 ? "cookies have" : "cookie has"} been successfully entered.`
		browser.notifications.create({type: "basic", message, title: "Phantombuster", iconUrl: "./img/icon_128x128.png"})
	}
}

const cookieChanged = (changeInfo) => {
	browser.cookies.getAll({ domain }).then((cookies) => {
		const retrievedCookies = cookiesList.map((name) => cookies.filter((el) => el.name === name)[0])
		if (retrievedCookies[0] && !cookiesSent) {
			browser.cookies.onChanged.removeListener(cookieChanged)
			sendCookie(retrievedCookies)
		}
	})
}

browser.runtime.onMessage.addListener((msg, sender, sendResponse) => {
	if (msg.opening) {
		browser.cookies.onChanged.addListener(cookieChanged)
	}
	if (msg.website) {
		cookiesSent = false
		website = msg.website
		browser.tabs.query({ active: true, currentWindow: true }, (currentTab) => {
				tabID = currentTab[0].id
		})
		domain = WEBSITEENUM[website].domain
		cookiesList = WEBSITEENUM[website].cookiesList
		browser.cookies.getAll({ domain }, (cookies) => {
			const retrievedCookies = cookiesList.map((name) => cookies.filter((el) => el.name === name)[0])
			sendCookie(retrievedCookies)
		})
	}
})
