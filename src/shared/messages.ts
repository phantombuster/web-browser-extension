import { WebsiteName } from "./websites"
import { Cookies } from "webextension-polyfill-ts"

type FromBackgroundRuntimeMessages = {
	restart?: boolean

	cookies?: {
		websiteName: WebsiteName
		cookies: Cookies.Cookie[]
		newSession?: boolean
	}

	injectCookies?: {
		prefix: string
	}
}

type FromContentScriptRuntimeMessages = {
	getCookies?: {
		websiteName: WebsiteName
		newSession: boolean
	}

	newTab?: {
		websiteName: WebsiteName
		url: string
		newSession: boolean
	}

	notif? : {
		title?: string
		message: string
	}
}

export { FromBackgroundRuntimeMessages, FromContentScriptRuntimeMessages }
