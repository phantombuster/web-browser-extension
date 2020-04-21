import { FromBackgroundRuntimeMessages } from "../../shared/messages"
// import { getSpinner } from "../../shared/spinner"
import { IWebsite, WebsiteName, getWebsiteInString } from "../../shared/websites"
import { injectFunction } from "../../shared/inject"
import { Handler } from "./handler"
import { Cookies } from "webextension-polyfill-ts"

interface IElement {
	labelName: string
	div: HTMLDivElement
	labelDiv: HTMLDivElement
	codeMirrorDiv: HTMLDivElement
	codeMirrorDivClass: string
	inputListener?: (event: Event) => void
	btn: HTMLButtonElement
}

interface IFoundWebsite {
	website: IWebsite
	login: boolean
	elements: IElement[]
}

type IFoundWebsites = {
	[key in WebsiteName]?: IFoundWebsite
}

export class ZapierCustomizeLaunch extends Handler {
	private _fastPoll = 100
	private _spinnerDelay = 1000
	private _hostRegex = RegExp("zapier\.com$")
	private _pathnameRegex = RegExp("\/app\/editor\/\\d+\/nodes\/\\d+\/fields")
	private _mainInterval?: ReturnType<typeof setInterval>
	private _phantomSelectInterval?: ReturnType<typeof setInterval>
	private _waitBlurInterval?: ReturnType<typeof setInterval>
	private _customizeLaunchPhantomNameSpanSelector = "div[class*=\"-FieldsForm\"] div[class*=\"-Dropdown\"] button span"
	private _customizeLaunchSessionCookieDivXpath = "//fieldset//div[contains(@class, '-FieldsForm') and contains(.//span, 'Session Cookie')]/div"
	private _customizeLaunchSessionCookieLabelDivSelector = "div[class*=\"-Field__revealWrapper\"]"
	private _customizeLaunchSessionCookieLabelSpanSelector = "span[class*=\"-FieldsForm__label\"]"
	private _customizeLaunchSessionCookieCodeMirrorDivSelector = "div[class*=\"-FieldsForm\"]"
	private _getCookieButtonClass = "pbExtensionZapierCookieButton"

	private _foundWebsites: IFoundWebsites = {}

	public detect = () => {
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
		this._mainInterval = setInterval(this._findCustomizeLaunchFieldSessionCookies, this._fastPoll)
		this._watchPhantomSelect()
	}

	public destroy = () => {
		if (this._mainInterval) {
			clearInterval(this._mainInterval)
		}
		const buttons = Array.from(document.querySelectorAll<HTMLButtonElement>(`.${this._getCookieButtonClass}`))
		for (const button of buttons) {
			button.remove()
		}
	}

	private _waitWhileBlur = () => {
		if (!this._waitBlurInterval) {
			this._waitBlurInterval = setInterval(async () => {
				const el = document.querySelector("div.flowform")
				if (el && !el.classList.contains("loading-needs")) {
					await this.sendMessage({ restartMe: true })
					if (this._waitBlurInterval) {
						clearInterval(this._waitBlurInterval)
					}
				}
			}, this._fastPoll)
		}
	}

	private _watchPhantomSelect = () => {
		if (!this._phantomSelectInterval) {
			this._phantomSelectInterval = setInterval(() => {
				const floatingMenu = document.querySelector("div[class*=\"FloatingMenu\"]")
				if (floatingMenu) {
					floatingMenu.addEventListener("click", this._waitWhileBlur)
				}
			}, this._fastPoll)
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
			element.btn.textContent = `Please log in to ${foundWebsite.website.name}`
			// element.btn.classList.add("pr-10")
			// element.btn.appendChild(getSpinner())
		}
		void this.sendMessage({ notif: { message: `Please log in to ${foundWebsite.website.name}` } })
		void this.sendMessage({
			newTab: {
				websiteName: foundWebsite.website.name,
				url: foundWebsite.website.url,
				newSession,
			}
		})
	}

	private _onInputChange = (elements: IElement[]) => {
		for (const element of elements) {
			element.btn.disabled = false
			element.btn.textContent = element.btn.getAttribute("originalTextContent")
		}
	}

	private _fillInputs = async (foundWebsite: IFoundWebsite, cookies: Cookies.Cookie[]) => {
		if (foundWebsite.login) {
			await new Promise((resolve) => setTimeout(resolve, this._spinnerDelay))
			foundWebsite.login = false
		}
		for (const i in cookies) {
			if (cookies[i] && foundWebsite.elements[i]) {
				foundWebsite.elements[i].btn.textContent = `Connected to ${foundWebsite.website.name}`
				foundWebsite.elements[i].btn.disabled = true

				injectFunction(injectFillInputFunction, [foundWebsite.elements[i].codeMirrorDivClass, cookies[i].value])

				if (foundWebsite.elements[i].inputListener) {
					foundWebsite.elements[i].codeMirrorDiv.querySelector("textarea")?.removeEventListener("input", foundWebsite.elements[i].inputListener!)
				}
				if (!foundWebsite.elements[i].inputListener) {
					foundWebsite.elements[i].inputListener = () => { this._onInputChange(foundWebsite.elements) }
				}
				foundWebsite.elements[i].codeMirrorDiv.querySelector("textarea")?.addEventListener("input", foundWebsite.elements[i].inputListener!)
			}
		}
		void this.sendMessage({ notif: { message: `Your Phantom is now connected to ${foundWebsite.website.name}` } })
	}

	private _createGetCookieBtn(website: IWebsite) {
		const el = document.createElement("button")
		el.className = this._getCookieButtonClass
		el.type = "button"
		el.textContent = `Connet to ${website.name}`
		el.setAttribute("analyticsid", "agentSetupStepsInputGetcookieBtn")
		el.setAttribute("analyticsval1", website.name)

		el.onclick = (event: MouseEvent) => {
			void this.sendMessage({
				getCookies: {
					websiteName: website.name,
					newSession: event.shiftKey,
				}
			})
		}

		return el
	}

	private _handleCustomizeLaunchFieldDiv = (customizeLaunchDiv: HTMLDivElement, foundWebsite: IWebsite, index: number) => {
		const customizeLaunchLabelDiv = customizeLaunchDiv.querySelector<HTMLDivElement>(this._customizeLaunchSessionCookieLabelDivSelector)
		const customizeLaunchLabelSpan = customizeLaunchDiv.querySelector<HTMLSpanElement>(this._customizeLaunchSessionCookieLabelSpanSelector)
		const customizeLaunchCodeMirrorDiv = customizeLaunchDiv.querySelector<HTMLDivElement>(this._customizeLaunchSessionCookieCodeMirrorDivSelector)

		if (customizeLaunchLabelDiv && customizeLaunchCodeMirrorDiv && customizeLaunchLabelSpan && customizeLaunchLabelSpan.textContent) {
			const labelName = customizeLaunchLabelSpan.textContent
			const btn = this._createGetCookieBtn(foundWebsite)

			const codeMirrorDivClass = `pbExtensionCodeMirrorDivClass${index.toString()}`
			customizeLaunchCodeMirrorDiv.classList.add(codeMirrorDivClass)
			const elements = { labelName, div: customizeLaunchDiv, labelDiv: customizeLaunchLabelDiv, codeMirrorDiv: customizeLaunchCodeMirrorDiv, codeMirrorDivClass, btn }

			if (!this._foundWebsites[foundWebsite.name]) {
				this._foundWebsites[foundWebsite.name] = { website: foundWebsite, login: false, elements: [elements] }
			} else {
				this._foundWebsites[foundWebsite.name]!.elements.push(elements)
			}
		}
	}

	private _getCustomizeLaunchDivs = () => {
		const customizeLaunchDivs = []
		const query = document.evaluate(this._customizeLaunchSessionCookieDivXpath, document, null, XPathResult.ORDERED_NODE_ITERATOR_TYPE, null )
		let element
		do {
			element = query.iterateNext() as HTMLDivElement
			if (element) {
				customizeLaunchDivs.push(element)
			}
		} while (element)
		return customizeLaunchDivs
	}

	private _findWebsite = () => {
		let website
		const customizeLaunchPhantomNameSpan = document.querySelector<HTMLSpanElement>(this._customizeLaunchPhantomNameSpanSelector)
		if (customizeLaunchPhantomNameSpan && customizeLaunchPhantomNameSpan.textContent) {
			website = getWebsiteInString(customizeLaunchPhantomNameSpan.textContent)
		}
		return website
	}

	private _findCustomizeLaunchFieldSessionCookies = () => {
		const customizeLaunchDivs = this._getCustomizeLaunchDivs()
		const website = this._findWebsite()

		if (this._mainInterval && customizeLaunchDivs.length && website) {
			clearInterval(this._mainInterval)
		} else {
			return
		}

		let i = 0
		for (const customizeLaunchDiv of customizeLaunchDivs) {
			this._handleCustomizeLaunchFieldDiv(customizeLaunchDiv, website, i++)
		}

		for (const foundWebsite of Object.values(this._foundWebsites)) {
			if (foundWebsite) {
				for (const elements of foundWebsite.elements) {
					// if (foundWebsite.elements.length > 1) {
					//	elements.btn.textContent += "s"
					// }
					elements.btn.setAttribute("originalTextContent", elements.btn.textContent!)
					elements.div.parentNode?.insertBefore(elements.btn, elements.div.nextSibling)
				}
			}
		}
	}
}

interface ICodeMirrorDiv extends HTMLDivElement {
	CodeMirror?: {
		setValue: (value: string) => void
	}
}

const injectFillInputFunction = (values: string[]) => {
	const codeMirrorDivClass= values[0]
	const cookieValue= values[1]

	const codeMirrorDiv = document.querySelector<HTMLDivElement>(`.${codeMirrorDivClass}`)

	if (codeMirrorDiv) {
		codeMirrorDiv.querySelector<HTMLDivElement>("div[class*=\"Input\"] div")?.focus()
		codeMirrorDiv.querySelector<ICodeMirrorDiv>(".CodeMirror")?.CodeMirror?.setValue(cookieValue)
	}
}
