import { extensionWebsiteDomains, WebsiteName, getWebsiteFromName } from "../shared/websites"
import { processCookieStr, processSetCookieStr } from "../shared/cookies"
import { browser, Tabs, WebRequest, Runtime, Cookies } from "webextension-polyfill-ts"
import { FromContentScriptRuntimeMessages, FromBackgroundRuntimeMessages } from "../shared/messages"

const isChrome = () => {
	return document.location.protocol.indexOf("chrome") !== -1
}

// Only global here.
// Used to keep track of callback functions for changed cookie listeners
// and store found cookies while watching for the changes.
const cookieChangedListeners: {
	[key: string]: {
		fn: (changeInfo: Cookies.OnChangedChangeInfoType) => Promise<void>
		matching: Cookies.Cookie[]
	}
} = {}

const getListenerKey = (websiteName: WebsiteName, tab: Tabs.Tab, senderTab: Tabs.Tab, prefix: string) => {
	return `${websiteName}_${tab.id}_${senderTab.id}_${prefix}`
}

// Chrome takes one extra option to the headers listeners that is not present in the webextension spec
// and Firefox throws if we give it that extra option.
// So here we have no choice but to make a special case for chrome and cast the 'extraHeaders' option.
const onBeforeSendHeadersExtraInfoSpec: WebRequest.OnBeforeSendHeadersOptions[] = [ "blocking", "requestHeaders" ]
const onHeadersReceivedExtraInfoSpec: WebRequest.OnHeadersReceivedOptions[] = [ "blocking", "responseHeaders" ]
if (isChrome()) {
	onBeforeSendHeadersExtraInfoSpec.push("extraHeaders" as WebRequest.OnBeforeSendHeadersOptions)
	onHeadersReceivedExtraInfoSpec.push("extraHeaders" as WebRequest.OnHeadersReceivedOptions)
}

// Function to be used to send message instead of browser.tabs.sendMessage()
const sendMessage = async (tabId: number, msg: FromBackgroundRuntimeMessages) => {
	// console.log("Message sent", msg)
	// tslint:disable-next-line:ban
	await browser.tabs.sendMessage(tabId, msg)
}

// Function to be used to send notifications instead of browser.notifications.create()
const sendNotification = (title: string, message: string) => {
	// tslint:disable-next-line:ban
	browser.notifications.create({ type: "basic", message, title, iconUrl: "assets/buster-icon.png", }).catch((error: Error) => {
		console.error(error)
	})
}

// Here we attach an a listener to each tab url change to (re)start the extension if the domain matches
// the list of domains where we want the extension to run content scripts.
browser.tabs.onUpdated.addListener(async (id, changeInfo, tab) => {
	if (tab.url && extensionWebsiteDomains.some(v => tab.url!.includes(v)) && changeInfo.status === "complete") {
		await sendMessage(id, { restart: true })
	}
})

// At the extension installation or update (or browser update) we reload/restart on each tab matching the list
// of domains where we want the extension to run content scripts
browser.runtime.onInstalled.addListener(async () => {
	const tabs = await browser.tabs.query({ url: extensionWebsiteDomains.map((url) => `*://*.${url}/*`) })
	for (const t of tabs) {
		if (t.id) {
			if (isChrome()) { // Google chrome does not (re)install content scripts so we need to do a full reload of the tab
				await browser.tabs.reload(t.id)
			} else { // Firefox (re)installs content scripts directly so we just need to send the "restart" message
				await sendMessage(t.id, { restart: true })
			}
		}
	}
})

// If we are on chrome, and we want either to open a new tab or get cookies,
// we need to request permissions for the host.
const requestHostPermissions = async (websiteName: WebsiteName) => {
	const host = getWebsiteFromName(websiteName)?.host
	if (host && isChrome()) {
		return browser.permissions.request({
			origins: [host]
		})
	} else {
		// If not on chrome (firefox) we already have permissions for all hosts
		return true
	}
}

// Here we receive messages from the content scripts
browser.runtime.onMessage.addListener(async (msg: FromContentScriptRuntimeMessages, sender: Runtime.MessageSender) => {
	// console.log("Message received", msg)
	if (msg.newTab && sender.tab) {
		const gotPermission = await requestHostPermissions(msg.newTab.websiteName)
		if (gotPermission) {
			await newTab(msg.newTab.websiteName, msg.newTab.url, msg.newTab.newSession, sender.tab)
		}
	} else if (msg.getCookies && sender.tab) {
		const gotPermission = await requestHostPermissions(msg.getCookies.websiteName)
		if (gotPermission) {
			await getCookies(msg.getCookies.websiteName, msg.getCookies.newSession, sender.tab)
		}
	} else if (msg.notif) {
		sendNotification(msg.notif.title || "Phantombuster", msg.notif.message)
	} else if (msg.restartMe && sender.tab && sender.tab.id) {
		await sendMessage(sender.tab.id, { restart: true })
	}
})

const getCookies = async (websiteName: WebsiteName, newSession: boolean, senderTab: Tabs.Tab) => {
	if (senderTab.id) {
		if (newSession) {
			await sendMessage(senderTab.id, {
				cookies: {
					websiteName,
					cookies: [],
					newSession,
				}
			})
		} else {
			const cookiesList = getWebsiteFromName(websiteName)?.cookies
			if (cookiesList) {
				const cookies = await browser.cookies.getAll({})
				const matchingCookies = cookiesList.map((cookie) => cookies.filter((c) => c.name === cookie.name && c.domain === cookie.domain)[0])

				// Whether cookies have been found or not, we send the result to the content script.
				// The content script handles the empty|null|undefined array of cookies and asks the user to log in.
				await sendMessage(senderTab.id, {
					cookies: {
						websiteName,
						cookies: matchingCookies,
					}
				})
			}
		}
	}
}

const getRandomPrefix = () => {
	const reserved = 10000000
	return `pb_${Math.round((Math.random() * (Number.MAX_SAFE_INTEGER - reserved)) + reserved).toString()}_`
}

const newTab = async (websiteName: WebsiteName, url: string, newSession: boolean, senderTab: Tabs.Tab) => {
	const tab = await browser.tabs.create({})
	let prefix = ""

	if (tab.id && newSession) {
		// Here we want the user to login to a new session without logging out from another
		// so we replace the "Set-Cookies" and "Cookies" headers on incoming and outgoing requests
		// by prefixing the cookies by a unique string and removing thoses that do not start
		// with this prefix.
		// The listneners must be set before the page starts to load, thats why we first load a blank tab,
		// then set-up the listeners, and finally load the website.
		prefix = getRandomPrefix()

		browser.webRequest.onBeforeSendHeaders.addListener(
			(details) => {
				details.requestHeaders?.forEach((requestHeader) => {
					if (requestHeader.name.toLowerCase() === "cookie" && requestHeader.value) {
						requestHeader.value = processCookieStr(requestHeader.value, prefix)
					}
				})
				return {
					requestHeaders: details.requestHeaders
				}
			}, {
				urls: ["*://*/*"],
				tabId: tab.id,
			}, onBeforeSendHeadersExtraInfoSpec
		)

		browser.webRequest.onHeadersReceived.addListener(
			(details) => {
				details.responseHeaders?.forEach((responseHeader) => {
					if (responseHeader.name.toLowerCase() === "set-cookie" && responseHeader.value) {
						responseHeader.value = processSetCookieStr(responseHeader.value, prefix)
					}
				})
				return {
					responseHeaders: details.responseHeaders
				}
			}, {
				urls: ["*://*/*"],
				tabId: tab.id,
			}, onHeadersReceivedExtraInfoSpec
		)
	}

	await browser.tabs.update(tab.id, {url})

	/*browser.tabs.onUpdated.addListener(async (tabId, changeInfo) => {
		if (tabId === tab.id && changeInfo.status === "complete") {
			await new Promise((resolve) => setTimeout(() => resolve(), 1000))
			await browser.tabs.sendMessage(tab.id, { injectCookies: { prefix } })
		}
	})*/

	// We need to store the listeners' callbacks in a global to be able to unregister/delete them later
	const listenerKey = getListenerKey(websiteName, tab, senderTab, prefix)
	cookieChangedListeners[listenerKey] = { matching: [], fn: (changeInfo) => cookieChanged(changeInfo, websiteName, tab, senderTab, prefix) }
	browser.cookies.onChanged.addListener(cookieChangedListeners[listenerKey].fn)
}

const cookieChanged = async (changeInfo: Cookies.OnChangedChangeInfoType, websiteName: WebsiteName, tab: Tabs.Tab, senderTab: Tabs.Tab, prefix: string) => {
	if (changeInfo.removed === true) {
		return
	}

	const listenerKey = getListenerKey(websiteName, tab, senderTab, prefix)
	const cookiesList = getWebsiteFromName(websiteName)?.cookies
	if (cookiesList && senderTab.id) {
		const matchingCookie = cookiesList.filter((cookie) => changeInfo.cookie.name === `${prefix}${cookie.name}` && changeInfo.cookie.domain === cookie.domain )
		if (matchingCookie.length > 0) { // One cookie we want has been found
			if (prefix.length > 0) {
				// We remove its prefix
				changeInfo.cookie.name = changeInfo.cookie.name.substring(prefix.length, changeInfo.cookie.name.length)
			}
			cookieChangedListeners[listenerKey].matching.push(changeInfo.cookie)
			if (cookiesList.length === cookieChangedListeners[listenerKey].matching.length) { // All wanted cookies for this website have been found
				browser.cookies.onChanged.removeListener(cookieChangedListeners[listenerKey].fn)

				// We put the found cookies in the order defined in 'websites' because
				// on the old alpaca form the fields have to be in the same order (no way to know which is which)
				const matchingCookies = cookiesList.map((cookie) => cookieChangedListeners[listenerKey].matching.filter((c) => c.name === cookie.name)[0])
				delete cookieChangedListeners[listenerKey]

				if (tab.id) {
					// We delete the 'login' tab
					await browser.tabs.remove(tab.id)
				}
				// We focus on the Phantombuster tab
				await browser.tabs.highlight({"tabs": senderTab.index})
				await sendMessage(senderTab.id, {
					cookies: {
						websiteName,
						cookies: matchingCookies,
					}
				})
			}
		}
	}
}

// opens phantombuster in a new tab when clicking on the extension icon
browser.browserAction.onClicked.addListener(async (_tab) => {
	await browser.tabs.create({ url: "https://phantombuster.com" })
})
