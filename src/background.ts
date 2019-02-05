// background-script.js
"use strict"

interface IBrowser {

}

const _browser = chrome || browser
const
// const _browser = browser
let domain
let cookiesList
let website
let tabID
let cookiesSent = false

// const sendCookie = (cookies) => {
// 	_browser.tabs.sendMessage(tabID, {cookies})
// 	if (cookies[0]) {
// 		cookiesSent = true
// 		const message = `Your ${website} ${cookies.length > 1 ? "cookies have" : "cookie has"} been successfully entered.`
// 		_browser.notifications.create({type: "basic", message, title: "Phantombuster", iconUrl: "./img/icon_128x128.png"})
// 	}
// }

// const cookieChanged = (changeInfo) => {
// 	_browser.cookies.getAll({ domain }).then((cookies) => {
// 		const retrievedCookies = cookiesList.map((name) => cookies.filter((el) => el.name === name)[0])
// 		if (retrievedCookies[0] && !cookiesSent) {
// 			_browser.cookies.onChanged.removeListener(cookieChanged)
// 			sendCookie(retrievedCookies)
// 		}
// 	})
// }

	// (property) addListener: ((callback: (message: any, sender: browser.runtime.MessageSender, sendResponse: (response?: any) => void) => boolean | void | Promise<any>) => void) |
	//                         ((callback: (message: any, sender: chrome .runtime.MessageSender, sendResponse: (response: any) => void) => void) => void)

_browser.runtime.onMessage

_browser.runtime.onMessage.addListener((
	message: string,
	sender: browser.runtime.MessageSender|chrome.runtime.MessageSender,
	sendResponse: (response: string) => void | (response?: any) => void
) => {
	console.log(message, sender, sendResponse)
})

// _browser.runtime.onMessage.addListener((msg, sender, sendResponse) => {
	// if (msg.opening) {
	// 	_browser.cookies.onChanged.addListener(cookieChanged)
	// }
	// if (msg.website) {
	// 	cookiesSent = false
	// 	website = msg.website
	// 	_browser.tabs.query({ active: true, currentWindow: true }, (currentTab) => {
	// 		tabID = currentTab[0].id
	// 	})
	// 	domain = WEBSITEENUM[website].domain
	// 	cookiesList = WEBSITEENUM[website].cookiesList
	// 	_browser.cookies.getAll({ domain }, (cookies) => {
	// 		const retrievedCookies = cookiesList.map((name) => cookies.filter((el) => el.name === name)[0])
	// 		sendCookie(retrievedCookies)
	// 	})
	// }
})
