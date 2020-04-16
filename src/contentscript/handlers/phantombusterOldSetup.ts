import { FromBackgroundRuntimeMessages } from "../../shared/messages"
import { getSpinner } from "../../shared/spinner"
import { IWebsite, WebsiteName, getWebsiteFromUrl } from "../../shared/websites"
import { Handler } from "./handler"
import { Cookies } from "webextension-polyfill-ts"

type IElement = {
	div: HTMLDivElement
	input: HTMLInputElement
	btn: HTMLButtonElement
}

type IFoundWebsite = {
	website: IWebsite
	login: boolean
	elements: IElement[]
}

type IFoundWebsites = {
	[key in WebsiteName]?: IFoundWebsite
}

export class PhantombusterOldSetup extends Handler {
	private _fastPoll = 100
	private _spinnerDelay = 1000
	private _hostRegex = RegExp("phantombuster\.(com|io)")
	private _pathnameRegex = RegExp("\/setup(?!\/step)")
	private _interval?: ReturnType<typeof setInterval>
	private _alpacaFieldSessionCookieDivSelector = "div[data-alpaca-field-path*=\"/sessionCookie\"]"
	private _alpacaFieldSessionCookieLabelASelector = "label a"
	private _alpacaFieldSessionCookieInputSelector = "input"
	private _getCookieButtonSelector = "button.pbExtensionButton"

	private _foundWebsites: IFoundWebsites = {}

	public detect = () => {
		/*
		 * When navigating to the new setup,
		 * the url is briefly the old one before redirecting
		 * to the new one, so this gives a false positive.
		 * But thats's ok because any timeout or interval
		 * created in run() should be stopped in detroy().
		*/
		return (
			this._hostRegex.test(window.location.host) &&
			this._pathnameRegex.test(window.location.pathname)
		)
	}

	public onMessage = (msg: FromBackgroundRuntimeMessages) => {
		if (msg.cookies) {
			this._onMessageCookies(msg.cookies.websiteName, msg.cookies.cookies, msg.cookies.newSession)
		}
	}

	public run = async () => {
		this._interval = setInterval(this._findAlpacaFieldSessionCookies, this._fastPoll)
	}

	public destroy = () => {
		if (this._interval) {
			clearInterval(this._interval)
		}
		const buttons = Array.from(document.querySelectorAll<HTMLButtonElement>(this._getCookieButtonSelector))
		for (const button of buttons) {
			button.remove()
		}
	}

	private _onMessageCookies = (websiteName: WebsiteName, cookies: Cookies.Cookie[], newSession = false) => {
		const foundWebsite = this._foundWebsites[websiteName]
		if (foundWebsite) {
			if (cookies.length === 0 || !cookies[0]) {
				this._websiteLogin(foundWebsite, newSession)
			} else {
				void this._fillInputs(foundWebsite, cookies)
			}
		}
	}

	private _websiteLogin = (foundWebsite: IFoundWebsite, newSession = false) => {
		foundWebsite.login = true
		for (const element of foundWebsite.elements) {
			element.btn.textContent = "Getting Cookie"
			element.btn.appendChild(getSpinner())
		}
		void this.sendMessage({ notif: { message: `Please log in to ${foundWebsite.website.name} to get your cookie` } })
		void this.sendMessage({
			newTab: {
				websiteName: foundWebsite.website.name,
				url: foundWebsite.website.url,
				newSession,
			}
		})
	}

	private _enableButton = (btn: HTMLButtonElement) => {
		btn.disabled = false
	}

	private _onInputChange = (elements: IElement[]) => {
		for (const element of elements) {
			this._enableButton(element.btn)
			element.btn.textContent = element.btn.getAttribute("originalTextContent")
			element.input.style.paddingRight = (element.btn.offsetWidth + 18).toString(10) + "px"
		}
	}

	private _fillInputs = async (foundWebsite: IFoundWebsite, cookies: Cookies.Cookie[]) => {
		if (foundWebsite.login) {
			await new Promise((resolve) => setTimeout(resolve, this._spinnerDelay))
		}
		for (const i in cookies) {
			if (cookies[i] && foundWebsite.elements[i]) {
				foundWebsite.elements[i].btn.textContent = "Cookie Pasted"
				foundWebsite.elements[i].input.style.paddingRight = (foundWebsite.elements[i].btn.offsetWidth + 18).toString(10) + "px"
				foundWebsite.elements[i].input.value = cookies[i].value
				foundWebsite.elements[i].btn.disabled = true
				foundWebsite.elements[i].input.addEventListener("input", () => { this._onInputChange(foundWebsite.elements) })
			}
		}
		void this.sendMessage({ notif: { message: `Your ${foundWebsite.website.name} cookie${(cookies.length > 1) ? "s have" : " has"} been pasted` } })
	}

	private _createGetCookieBtn(website: IWebsite) {
		const el = document.createElement("button")
		el.className = "pbExtensionButton btn"
		// Hardcoded styles because Alpaca imposes its bootstrap style over our pb2-css classes
		el.style.backgroundColor = "#173f53"
		el.style.color = "#ffffff"
		el.style.fontWeight = "700"
		el.style.fontSize = ".875em"
		el.style.padding = ".4rem 2rem"
		el.style.display = "block"
		el.style.position = "absolute"
		el.style.right = "4px"
		el.style.top = "28px"
		el.textContent = `Get ${website.name} Cookie`
		el.setAttribute("analyticsid", "agentSetupLegacyInputGetcookieBtn")
		el.setAttribute("analyticsval1", website.name)

		if (document.querySelector<HTMLDivElement>("body > #root > div")?.dataset.loggedAs === "true") {
			el.disabled = true
		} else {
			el.onclick = (event: MouseEvent) => {
				void this.sendMessage({
					getCookies: {
						websiteName: website.name,
						newSession: event.shiftKey,
					}
				})
			}
		}

		return el
	}

	private _handleAlpacaFieldDiv = (alpacaFieldDiv: HTMLDivElement) => {
		const alpacaFieldLabelA = alpacaFieldDiv?.querySelector<HTMLAnchorElement>(this._alpacaFieldSessionCookieLabelASelector)
		const alpacaFieldInput = alpacaFieldDiv?.querySelector<HTMLInputElement>(this._alpacaFieldSessionCookieInputSelector)

		if (alpacaFieldLabelA && alpacaFieldInput) {
			const elemHref = alpacaFieldLabelA.getAttribute("href")
			if (!elemHref) {
				return
			}
			const foundWebsite = getWebsiteFromUrl(elemHref)
			if (!foundWebsite) {
				return
			}
			const btn = this._createGetCookieBtn(foundWebsite)
			const elements = { div: alpacaFieldDiv, input: alpacaFieldInput, btn }

			if (!this._foundWebsites[foundWebsite.name]) {
				this._foundWebsites[foundWebsite.name] = { website: foundWebsite, login: false, elements: [elements] }
			} else {
				this._foundWebsites[foundWebsite.name]!.elements.push(elements)
			}
		}
	}

	private _findAlpacaFieldSessionCookies = () => {
		const alpacaFieldDivs = Array.from(document.querySelectorAll<HTMLDivElement>(this._alpacaFieldSessionCookieDivSelector))

		if (this._interval && alpacaFieldDivs.length) {
			clearInterval(this._interval)
		} else {
			return
		}

		for (const alpacaFieldDiv of alpacaFieldDivs) {
			this._handleAlpacaFieldDiv(alpacaFieldDiv)
		}

		for (const foundWebsite of Object.values(this._foundWebsites)) {
			if (foundWebsite) {
				for (const elements of foundWebsite.elements) {
					if (foundWebsite.elements.length > 1) {
						elements.btn.textContent += "s"
					}
					elements.btn.setAttribute("originalTextContent", elements.btn.textContent!)

					elements.div.style.position = "relative"
					elements.div.insertBefore(elements.btn, elements.input)
					elements.input.style.paddingRight = ((elements.btn.offsetWidth || 200) + 18).toString(10) + "px"
				}
			}
		}
	}
}
