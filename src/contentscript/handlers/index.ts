import { HandlerClass } from "./handler"
import { Phantombuster } from "./phantombuster"
import { PhantombusterOldSetup } from "./phantombusterOldSetup"
import { PhantombusterNewSetup } from "./phantombusterNewSetup"
import { ZapierCustomizeLaunch } from "./zapierCustomizeLaunch"
import { All } from "./all"

export const handlers: HandlerClass[] = [
	Phantombuster,
	PhantombusterOldSetup,
	PhantombusterNewSetup,
	ZapierCustomizeLaunch,
	All,
]
export { Handler } from "./handler"
