import { FromBackgroundRuntimeMessages } from "../../shared/messages"
import { Handler } from "./handler"

export class PhantombusterNewSetup extends Handler {
	private _hostRegex = RegExp("phantombuster\.(com|io)")
	private _pathnameRegex = RegExp("\/setup\/step")

	public detect() {
		return (
			this._hostRegex.test(window.location.host) &&
			this._pathnameRegex.test(window.location.pathname)
		)
	}

	public onMessage(_msg: FromBackgroundRuntimeMessages) {
		return
	}

	public async run() {
		return
	}

	public destroy() {
		return
	}
}
