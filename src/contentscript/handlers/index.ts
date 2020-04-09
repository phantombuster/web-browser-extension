import { HandlerClass } from "./handler"
import { Phantombuster } from "./phantombuster"
import { PhantombusterOldSetup } from "./phantombusterOldSetup"
import { PhantombusterNewSetup } from "./phantombusterNewSetup"
import { Zapier } from "./zapier"
import { All } from "./all"

export const handlers: HandlerClass[] = [
	Phantombuster,
	PhantombusterOldSetup,
	PhantombusterNewSetup,
	Zapier,
	All,
]
export { Handler } from "./handler"
