import { ConfigurationHandler } from "./handler"
import { UnkownObject } from "../shared/types"

export class Alpaca extends ConfigurationHandler {

	public onMessage(_message: UnkownObject) {
		return true
	}

	public async installButton() {
		return true
	}
}
