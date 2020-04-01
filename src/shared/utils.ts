export enum PageKind {
	UNKNOWN,
	ALPACA,
	STEP_SETUP,
	ZAPIER,
}

export class PageUtils {

	static isZapierPage() {
		return window.location.host.indexOf("zapier") > -1
	}

	static isPhantombusterPage() {
		return window.location.host.indexOf("phantombuster") > -1
	}

	static isPhantombusterStepSetupPage() {
		return PageUtils.isPhantombusterPage() && window.location.pathname.indexOf("/setup/step") > -1
	}

	static isPhantombusterAlpacaSetup() {
		return PageUtils.isPhantombusterPage() && window.location.pathname.indexOf("/setup") > -1
	}

	static isPhantombusterUserLoggedAs() {
		const loggedAsAttributeKey = "data-logged-as"
		const bodyLoggedAsAttribute = document.body.getAttribute(loggedAsAttributeKey)
		const rootElement = document.querySelector("div#root > div")
		const isRootElementLoggedAs = rootElement ? rootElement.getAttribute(loggedAsAttributeKey) : ""
		return !!bodyLoggedAsAttribute || !!isRootElementLoggedAs
	}

	static setExtensionLoadProof() {
		if (PageUtils.isPhantombusterPage()) {
			document.body.setAttribute("data-pb-extension", "true")
		}
	}

	static getCurrentPageKind(): PageKind {
		if (this.isZapierPage()) {
			return PageKind.ZAPIER
		}

		if (PageUtils.isPhantombusterPage()) {
			return PageUtils.isPhantombusterStepSetupPage() ? PageKind.STEP_SETUP : PageKind.ALPACA
		}
		return PageKind.UNKNOWN
	}
}
