import "./contentscript.sass"
// import { WEBSITEENUM } from "../shared/websites"
import { PageUtils, PageKind } from "../shared/utils"
import { Browser, UnkownObject } from "../shared/types"
import { Alpaca, ConfigurationHandler } from "../handlers"

declare var browser: Browser
const browserMain = chrome || browser

const installRuntimeListener = (browserRef: Browser, handler: ConfigurationHandler) => {
	const backgroundListener = async (msg: UnkownObject) => {
		if (msg.restart) {
			browserRef.runtime.onMessage.removeListener(backgroundListener)
			return main()
		} else {
			handler.onMessage(msg)
		}
	}
	browserRef.runtime.onMessage.addListener(backgroundListener)
}

const main = () => {
	PageUtils.setExtensionLoadProof()

	if (PageUtils.isPhantombusterUserLoggedAs()) {
		return
	}

	const kind = PageUtils.getCurrentPageKind()
	let handler
	switch (kind) {
		case PageKind.ALPACA:
			console.log("Alpaca found!")
			handler = new Alpaca(browserMain)
			break
		case PageKind.STEP_SETUP:
			console.log("Step Setup found!")
			break
		case PageKind.ZAPIER:
			console.log("Alpaca found!")
			break
		default:
			// tslint:disable:next-line: no-console
			console.error("Unknown kind of page")
			return
	}
	installRuntimeListener(browserMain, handler as ConfigurationHandler)
	handler?.installButton()
}

main()
