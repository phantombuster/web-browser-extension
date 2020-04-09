import { bWebsites as websites } from "../shared/websites"
import { processCookieStr, processSetCookieStr } from "../shared/cookies"
import { browser, Tabs, Cookies, WebRequest } from "webextension-polyfill-ts"

let domain: string
let cookiesList: Cookies.Cookie[] = []
let tabID: number
let cookiesSent = false
let website: string
let pbTab: Tabs.Tab
let tab: Tabs.Tab

let prefix: string = ""

const sendNotification = (title: string, message: string) => {
	browser.notifications.create({ type: "basic", message, title, iconUrl: "assets/buster-icon.png", }).catch((error: Error) => {
		console.error(error)
	})
}

const sendCookies = async (cookies: Cookies.Cookie[]) => {
	await browser.tabs.sendMessage(tabID, { websiteName: website, cookies })
	if (cookies[0]) {
		cookiesSent = true
	}
}

const cookieChanged = async () => {
	const cookies = await browser.cookies.getAll({ domain })

	console.log("domain:", domain)
	const retrievedCookies = cookiesList.map((cookie) => {
		const c = cookies.filter((el) => el.name === `${prefix}${cookie.name}` && el.domain === cookie.domain)[0]
		if (c && prefix.length > 0) {
			c.name = c.name.substring(prefix.length, c.name.length)
		}
		return c
	})
	console.log("retrievedCookies:", retrievedCookies)
	if (retrievedCookies[0] && !cookiesSent) {
		browser.cookies.onChanged.removeListener(cookieChanged)
		if (tab.id) {
			await browser.tabs.remove(tab.id)
		}
		if (pbTab) {
			console.log(pbTab)
			await browser.tabs.highlight({"tabs": pbTab.index})
		}
		await sendCookies(retrievedCookies)
	}
}

browser.runtime.onMessage.addListener(async (msg, sender) => {
	if (msg.opening) {
		console.log("opening")
		const tabs = await browser.tabs.query({ currentWindow: true, active: true })
		if (tabs.length > 0) {
			pbTab = tabs[0]
		}
		tab = await browser.tabs.create({})
		console.log(tab)

		if (tab.id) {

			const reserved = 10000000
			prefix = `pb_${Math.round((Math.random() * (Number.MAX_SAFE_INTEGER - reserved)) + reserved).toString()}_`

			browser.webRequest.onBeforeSendHeaders.addListener(
				(details) => {
					details.requestHeaders?.forEach((requestHeader) => {
						if (requestHeader.name.toLowerCase() === "cookie" && requestHeader.value) {
							// console.log(JSON.stringify(requestHeader.value.split("; "), null, "\t"))
							requestHeader.value = processCookieStr(requestHeader.value, prefix)
							// console.log(JSON.stringify(requestHeader.value.split("; "), null, "\t"))
							// console.log("----------")
						}
					})
					return {
						requestHeaders: details.requestHeaders
					}
				}, {
					urls: ["*://*/*"],
					tabId: tab.id,
				}, [
					"blocking",
					"requestHeaders",
					"extraHeaders" as WebRequest.OnBeforeSendHeadersOptions
				]
			)

			browser.webRequest.onHeadersReceived.addListener(
				(details) => {
					details.responseHeaders?.forEach((responseHeader) => {
						if (responseHeader.name.toLowerCase() === "set-cookie" && responseHeader.value) {
							// console.log(JSON.stringify(responseHeader.value.split("; "), null, "\t"))
							responseHeader.value = processSetCookieStr(responseHeader.value, prefix)
							// console.log(JSON.stringify(responseHeader.value.split("; "), null, "\t"))
							// console.log("----------")
						}
					})
					return {
						responseHeaders: details.responseHeaders
					}
				}, {
					urls: ["*://*/*"],
					tabId: tab.id,
				}, [
					"blocking",
					"responseHeaders",
					"extraHeaders" as WebRequest.OnHeadersReceivedOptions
				]
			)

			await browser.tabs.update(tab.id, {url: msg.opening})

			await browser.tabs.sendMessage(tab.id, { injectCookies: { prefix } })
		}

		browser.cookies.onChanged.addListener(cookieChanged)
	}
	if (msg.getCookies) {
		cookiesSent = false
		website = msg.websiteName as string
		tabID = sender?.tab?.id as number
		// @ts-ignore
		domain = websites[website].domain
		console.log(website, domain)
		// @ts-ignore
		cookiesList = websites[website].cookiesList
		const cookies = await browser.cookies.getAll({})
		console.log("cookies:", cookies)
		const retrievedCookies = cookiesList.map((cookie) => cookies.filter((el) => el.name === cookie.name && el.domain === cookie.domain)[0])
		console.log("retrievedCookies", retrievedCookies)
		if (msg.newSession) {
			await sendCookies([])
		} else {
			await sendCookies(retrievedCookies)
		}
	} else if (msg.notif) {
		sendNotification(msg.notif.title || "Phantombuster", msg.notif.message)
	}
})

browser.runtime.onInstalled.addListener(async () => {
	const isChrome = document.location.protocol.indexOf("chrome") > -1
	const tabs = await browser.tabs.query({ url: [ "*://*.phantombuster.com/*", "*://zapier.com/*" ] })
	for (const t of tabs) {
		if (isChrome) {
			await browser.tabs.reload(t.id as number)
		} else {
			await browser.tabs.sendMessage(t.id as number, { restart: "restart" })
		}
	}
})

browser.tabs.onUpdated.addListener(async (id, changeInfo, tabb) => {
	if (!tabb.url || (tabb.url.indexOf("phantombuster.com") < 0 && tabb.url.indexOf("zapier.com") < 0)) {
		return
	}
	if (changeInfo?.status === "complete") {
		await browser.tabs.sendMessage(id, { restart: "restart" })
	}
})
