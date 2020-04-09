import { WebsiteName } from "./websites"

type FromBackgroundRuntimeMessages = {
	restart?: boolean
	websiteName?: WebsiteName
	cookies?: {
		name: string
		value: string
	}[]
	injectCookies?: {
		prefix: string
	}
}

type FromContentScriptRuntimeMessages = {
	getCookies?: boolean
	websiteName?: WebsiteName
	newSession?: true

	opening?: string
	notif? : {
		title?: string
		message: string
	}
}

export { FromBackgroundRuntimeMessages, FromContentScriptRuntimeMessages }
