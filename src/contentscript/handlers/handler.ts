import { FromBackgroundRuntimeMessages, FromContentScriptRuntimeMessages } from "../../shared/messages"
import { browser } from "webextension-polyfill-ts"

export type HandlerClass = new () => Handler

export abstract class Handler {
	protected sendMessage = async (msg: FromContentScriptRuntimeMessages) => {
		console.log("Message sent", msg)
		try {
			// tslint:disable-next-line:ban
			await browser.runtime.sendMessage(msg)
		} catch (err) {
			try {
				const port = browser.runtime.connect()
				port.postMessage(msg)
			} catch (err) {
				console.error("Could not send message", msg)
			}
		}
	}

	public abstract detect(): boolean
	public abstract onMessage(msg: FromBackgroundRuntimeMessages): void
	public abstract run(): Promise<void>
	public abstract destroy(): void
}
