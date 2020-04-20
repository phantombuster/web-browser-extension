import "./contentscript.sass"
import { browser } from "webextension-polyfill-ts"
import { FromBackgroundRuntimeMessages } from "../shared/messages"
import { handlers, Handler } from "./handlers"

const runtimeMessagesListener = (detectedHandlers: Handler[]) => {
	const backgroundListener = (msg: FromBackgroundRuntimeMessages) => {
		// console.log("Message received", msg)
		if (msg.restart) {
			browser.runtime.onMessage.removeListener(backgroundListener)
			for (const handler of detectedHandlers) {
				handler.destroy()
			}
			return main()
		} else {
			for (const handler of detectedHandlers) {
				handler.onMessage(msg)
			}
		}
	}
	browser.runtime.onMessage.addListener(backgroundListener)
}

const main = () => {
	const detectedHandlers: Handler[] = []

	for (const handler of handlers) {
		const h = new handler()
		if (h.detect()) {
			detectedHandlers.push(h)
		}
	}
	runtimeMessagesListener(detectedHandlers)
	for (const handler of detectedHandlers) {
		handler.destroy()
		handler.run().catch((e) => console.error(e))
	}
}

main()
