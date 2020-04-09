import { FromBackgroundRuntimeMessages } from "../../shared/messages"
import { Handler } from "./handler"

export class Zapier extends Handler {
	private _hostRegex = RegExp("zapier\.com$")

	public detect() {
		return this._hostRegex.test(window.location.host)
	}

	public onMessage(_msg: FromBackgroundRuntimeMessages) {
		return
	}

	public async run() {
		alert("zapier")
		return
	}

	public destroy() {
		return
	}
}
