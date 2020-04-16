import { processCookieStr, processSetCookieStr } from "../shared/cookies"

declare global {
	// tslint:disable-next-line:interface-name
	interface Window {
		injectedSwitchCookiePrefix: string
	}
}

const documentCookie = Object.getOwnPropertyDescriptor(Document.prototype, "cookie") || Object.getOwnPropertyDescriptor(HTMLDocument.prototype, "cookie")
const cookieGetter = documentCookie?.get
const cookieSetter = documentCookie?.set

if (cookieGetter && cookieSetter && window.injectedSwitchCookiePrefix) {
	Object.defineProperty(document, "cookie", {
		get: () => processCookieStr(cookieGetter(), window.injectedSwitchCookiePrefix),
		set: (cookieString) => cookieSetter(processSetCookieStr(cookieString, window.injectedSwitchCookiePrefix)),
	})
}
