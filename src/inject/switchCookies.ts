import { processCookieStr, processSetCookieStr } from "../shared/cookies"

declare global {
	// tslint:disable-next-line:interface-name
	interface Window {
		injectedSwitchCookiePrefix: string
	}
}

const documentCookie = Object.getOwnPropertyDescriptor(document, "cookie")
const cookieGetter = documentCookie?.get
const cookieSetter = documentCookie?.set

if (cookieGetter && cookieSetter && window.injectedSwitchCookiePrefix) {
	console.log("pouet")
	Object.defineProperty(document, "cookie", {
		get: () => processCookieStr(cookieGetter(), window.injectedSwitchCookiePrefix),
		set: (cookieString) => cookieSetter(processSetCookieStr(cookieString, window.injectedSwitchCookiePrefix)),
	})
}
