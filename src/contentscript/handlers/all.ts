import { FromBackgroundRuntimeMessages } from "../../shared/messages"
import { Handler } from "./handler"
import { injectJs, injectJsFile } from "../../shared/inject"

export class All extends Handler {
	public detect() {
		console.log("coucouuuuuuuuuuuuu")
		return true
	}

	public onMessage(msg: FromBackgroundRuntimeMessages) {
			console.log("pouiiiiiiiiiiiiiiiiiit", msg)
		if (msg.injectCookies) {
			console.log("poueeeeeeeeeeeeeeeeeeeeeet")
			injectJs(`window.injectedSwitchCookiePrefix = ${msg.injectCookies.prefix};`)
			injectJs("alert('pouet');")
			injectJsFile("switchCookies.js")
		}
	}

	public async run() {
		console.log("hellloooooooooooooooooooo")
		return
	}

	public destroy() {
		return
	}
}
