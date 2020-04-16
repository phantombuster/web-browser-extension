import { FromBackgroundRuntimeMessages } from "../../shared/messages"
import { Handler } from "./handler"
import { injectJs, injectJsFile } from "../../shared/inject"

export class All extends Handler {
	public detect() {
		return true
	}

	public onMessage(msg: FromBackgroundRuntimeMessages) {
		if (msg.injectCookies) {
			injectJs(`window.injectedSwitchCookiePrefix = "${msg.injectCookies.prefix}";`)
			injectJsFile("switchCookies.js")
		}
	}

	public async run() {
		return
	}

	public destroy() {
		return
	}
}
