import { Browser, UnkownObject } from "../shared/types"

export abstract class ConfigurationHandler {
	// Storing the browser object in the configuration class
	// It makes possible to directly communicate with background script
	protected browserRef: Browser

	constructor(browser: Browser) {
		this.browserRef = browser
	}

	// onMessage will receive all messages from the background script
	public abstract onMessage(message: UnkownObject): boolean

	// This method needs to implement logic to install the button
	// true means success, otherwise false
	public abstract installButton(): Promise<boolean>
}
