declare var browser: typeof chrome
const _browserMain = chrome || browser

/* tslint:disable-next-line:interface-over-type-literal */
type IObject = { [key: string]: unknown }

// @ts-ignore
let website: string
let websiteName: string
let websiteUrl: string

const removeFieldsBtn = "div[class*=\"extra-fields__remove\"] button"
const zapierDropdownSelector = "div.fm-field-type-fields fieldset.fm-fields div[role=listbox]"
const zapierExtensionId = "button[id*=\"zapierPbExtension\"]"
const zapierLoginPromptId = "button[id*=\"zapierPbExtensionLogin\"]"

const EXT_ID = "pbExtensionButton"
const FAST_POLL = 100
const DEF_POLL	= 500
const CUSTOM_POLL = 2500

const isV2InputPage = (): boolean => {
	try {
		return (new URL(window.location.toString())).pathname.indexOf("/setup") > -1
	} catch (err) {
		return false
	}
}

const isPhantombusterUserLoggedAs = (): boolean => {
	const loggedAsAttributeKey = "data-logged-as"
	const bodyLoggedAsAttribute = document.body.getAttribute(loggedAsAttributeKey)
	const rootElement = document.querySelector("div#root > div")
	const isRootElementLoggedAs = rootElement ? rootElement.getAttribute(loggedAsAttributeKey) : ""
	return !!bodyLoggedAsAttribute || !!isRootElementLoggedAs
}

const isPhantombusterPage = (): boolean => window.location.host.indexOf("phantombuster") > -1

const setExtensionLoadProof = () => {
	if (isPhantombusterPage()) {
		document.body.setAttribute("data-pb-extension", "true")
	}
}

const isPhantombusterStepSetupPage = (): boolean => isPhantombusterPage() && window.location.pathname.indexOf("/setup/step") > -1

const isZapierPage = (): boolean => {
	try {
		return (new URL(window.location.toString())).hostname.indexOf("zapier") > -1
	} catch (err) {
		return false
	}
}

const waitUntilZapierBoot = () => {
	const idleBoot = setInterval(() => {
		if (document.querySelector("div[role=listbox]")) {
			clearInterval(idleBoot)
			if (document.querySelector("fieldset[class*=\"Fields\"]")) {
				setTimeout(createZapierButton, DEF_POLL)
			}
			buildListeners()
		}
	}, FAST_POLL)
}

const waitWhileBlur = () => {
	const blurIdle = setInterval(() => {
		const el = document.querySelector("div.flowform")
		if (el && !el.classList.contains("loading-needs")) {
			clearInterval(blurIdle)
			setTimeout(createZapierButton, DEF_POLL)
		}
	}, FAST_POLL)
}

const buildListeners = () => {
	const idle = setInterval(() => {
		if (document.querySelector("div.choices-container")) {
			document.querySelector("div.choices-container").addEventListener("click", waitWhileBlur)
			clearInterval(idle)
		}
	}, FAST_POLL)
}

const parentUntils = (el: HTMLElement, selector: string): HTMLElement|null => {
	if (el.classList.contains(selector)) {
		return el
	}
	if (el.tagName.toLowerCase() === "body") {
		return null
	}
	return parentUntils(el.parentElement, selector)
}

const setWebsite = (api: string, zapier = false) => {
	for (const property in WEBSITEENUM) {
		if (zapier) {
			if (api.toLowerCase().indexOf(WEBSITEENUM[property].name.toLowerCase()) > -1) {
				website = property
				break
			}
		} else {
			if (api.toLowerCase().indexOf(WEBSITEENUM[property].match.toLowerCase()) > -1) {
				website = property
				break
			}
		}
	}
}

const getPredefinedCSS = () => isV2InputPage() ? [ "btn", "btn-sm", "bg-teal-2", "pull-right" ] : [ "btn", "btn-xs", "pull-right" ]

const setSelectListenerIfNeeded = (el?: HTMLSelectElement, networksCount?: number) => {
	if (el && !el.onchange && networksCount > 1) {
		el.onchange = refreshBtn
	}
}

const buildPhantombusterButton = (): HTMLButtonElement => {
	const el = document.createElement("button")
	el.id = EXT_ID
	const style = getPredefinedCSS()
	if (isV2InputPage()) {
		Object.assign(el.style, { borderRadius: "20px", color: "#FFF", marginBottom: "2px" })
	}

	el.onclick = openConnection
	el.classList.add(...style)
	if (isPhantombusterStepSetupPage()) {
		el.type = "button"
		el.classList.remove("btn-sm")
		Object.assign(el.style, { float: "right" })
	}
	return el
}

/* END UTILS */

const createZapierButton = () => {
	const detectButton = setInterval(() => {
		const injectBtnLocation = "fieldset[class*=\"Fields\"]"
		const btnSels = zapierExtensionId
		const rmFieldsEl = document.querySelector(removeFieldsBtn)
		if (rmFieldsEl) {
			rmFieldsEl.addEventListener("click", createZapierButton)
		}
		if (document.querySelector(zapierDropdownSelector) && document.querySelector(injectBtnLocation)) {
			website = null
			const apiName = document.querySelector(zapierDropdownSelector).textContent.trim()
			setWebsite(apiName, true)
			// We need to remove all existing buttons when a dropdown element is selected
			document.querySelectorAll<HTMLElement>(btnSels).forEach((el) => el.remove())
			buildListeners()
			// No need to continue when the user select a custom script
			if (!website) {
				clearInterval(detectButton)
				return
			}
			websiteName = WEBSITEENUM[website].name
			websiteUrl = WEBSITEENUM[website].websiteUrl
			openConnection()
			clearInterval(detectButton)
		}
	}, FAST_POLL)
}

// create the Get Cookies button
const createButton = () => {
	const checkExist = setInterval(() => {
		const sel = "div[data-alpaca-field-path*=\"/sessionCookie\"]:not([style*=\"display: none\"]) label a"
		const stepSel = "div[id*=\"formField-sessionCookie\"]"
		const cookiesFieldsSelectors = "div[data-alpaca-field-path*=\"/sessionCookie\"]"
		const select: HTMLSelectElement = document.querySelector("div[data-alpaca-field-path] select")
		const networksCount: number = document.querySelectorAll(cookiesFieldsSelectors).length
		// Don't overwrite onchange, we don't want to break the page
		setSelectListenerIfNeeded(select, networksCount)

		if (document.querySelector(sel)) {
			const apiLink = document.querySelector(sel).getAttribute("href")
			setWebsite(apiLink)
			// No need to continue when no website were found
			if (!website) {
				return clearInterval(checkExist)
			}
			websiteName = WEBSITEENUM[website].name
			websiteUrl = WEBSITEENUM[website].websiteUrl
			const btn = buildPhantombusterButton()
			if (!document.querySelector(`#${EXT_ID}`)) {
				document.querySelector("div[data-alpaca-field-path*=\"/sessionCookie\"]:not([style*=\"display: none\"]) label").appendChild(btn)
				document.querySelector(`#${EXT_ID}`).parentElement.style.display = "block"
			}
			enableButton()
			clearInterval(checkExist)
		} else if (document.querySelector(stepSel)) {
			if (document.querySelector(`#${EXT_ID}`)) {
				return clearInterval(checkExist)
			}
			const cookies = Array.from(document.querySelectorAll<HTMLDivElement>(stepSel))
			const networks = Array.from(new Set(cookies.map((el) => el.getAttribute("data-field-info"))))
			// Don't go any further if there are more than 1 network
			// We won't determine which one to use
			if (networks.length > 1) {
				clearInterval(checkExist)
			}
			const network = networks[0].toLowerCase()
			const btn = buildPhantombusterButton()
			setWebsite(network, true)
			if (!website) {
				clearInterval(checkExist)
			}
			websiteName = WEBSITEENUM[website].name
			websiteUrl = WEBSITEENUM[website].websiteUrl
			cookies[0].style.display = "block"
			cookies[0].prepend(btn)
			enableButton()
			clearInterval(checkExist)
		}
	}, FAST_POLL)
}

const refreshBtn = () => {
	const extensionBtn = document.querySelector<HTMLElement>(`#${EXT_ID}`)
	if (!extensionBtn) {
		return
	}
	const root = parentUntils(extensionBtn, "form-group")
	const idleChangeTimer = setInterval(() => {
		const el = getComputedStyle(root)
		if (el.display === "none") {
			clearInterval(idleChangeTimer)
			extensionBtn.parentNode.removeChild(extensionBtn)
			createButton()
		}
	}, DEF_POLL)
}

const createSheetButton = () => {
	const checkExist2 = setInterval(() => {
		if (document.querySelector("div[data-alpaca-field-path*=\"/spreadsheetUrl\"] label a")) {
			if (!document.querySelector("#spreadsheetLink")) {
				const sheetLink = document.createElement("a")
				sheetLink.id = "spreadsheetLink"
				sheetLink.textContent = "Create Google Spreadsheet"
				sheetLink.href = "https://docs.google.com/spreadsheets/u/0/create"
				sheetLink.setAttribute("target", "_blank")
				sheetLink.classList.add("btn", "btn-xs", "pull-right", "btn-success", "btn-primary")
				document.querySelector("div[data-alpaca-field-path*=\"/spreadsheetUrl\"] label").appendChild(sheetLink)
				document.querySelector("#spreadsheetLink").parentElement.style.display = "block"
			}
			clearInterval(checkExist2)
		}
	}, FAST_POLL)
}

// send a message to background script
const sendMessage = (message: IObject) => {
	try {
		_browserMain.runtime.sendMessage(message)
	} catch (err) {
		try {
			const port = _browserMain.runtime.connect()
			port.postMessage(message)
		} catch (err) {
			// ...
		}
	}
}

const disableButton = (cookiesLength: number) => {
	document.querySelectorAll(`#${EXT_ID}`).forEach((el) => {
		el.classList.add("btn-success")
		el.classList.remove("btn-warning")
		el.setAttribute("disabled", "true")
		el.textContent = `${websiteName} Cookie${cookiesLength > 1 ? "s" : ""} successfully pasted!`
	})
	listenInputChange()
}

const enableButton = () => {
	document.querySelectorAll(`#${EXT_ID}`).forEach((el) => {
		if (!isV2InputPage()) {
			el.classList.add("btn-primary")
		}
		el.classList.remove("btn-success", "btn-warning")
		const cookieCount = document.querySelectorAll("div[data-alpaca-field-path*=\"/sessionCookie\"]:not([style*=\"display: none\"]) input").length
		el.textContent = `Get Cookie${cookieCount > 1 ? "s" : ""} from ${websiteName}`
		el.removeAttribute("disabled")
	})
}

// send the website to background to query its cookies
const openConnection = () => sendMessage({website, silence: !!isZapierPage() })

const listenInputChange = () => document.querySelector(`#${EXT_ID} ~ input`).addEventListener("input", inputChange)

const inputChange = (event: Event) => {
	enableButton()
	event.target.removeEventListener("type", inputChange, !isPhantombusterStepSetupPage())
}

const displayLogin = () => {
	document.querySelectorAll<HTMLElement>(isZapierPage() ? zapierExtensionId : `#${EXT_ID}`).forEach((el) => {
		if (isZapierPage()) {
			Object.assign(el.style, { background: "#DC3545", borderColor: "#DC3545" })
		} else {
			el.classList.replace("btn-primary", "btn-warning")
		}
		el.textContent = `please log in to ${websiteName} to get your cookie`
	})
}

const displayLoginOnZapier = () => {
	if (document.querySelector(zapierLoginPromptId)) {
		return
	}
	const DEF_CSS = { position: "relative", right: 0, width: "auto", height: "auto", background: "#35C2DB", color: "#FFF" }
	const injectBtnLocation = "fieldset.fm-fields.child-fields-group .fm-field:first-of-type .fm-label"
	const el = document.createElement("button")

	el.textContent = `Please log into ${websiteName} to get your cookie`
	Object.assign(el.style, DEF_CSS)
	el.id = "zapierPbExtensionLogin"
	el.onclick = openConnection

	const entrypoint = document.querySelector(injectBtnLocation)
	if (entrypoint) {
		entrypoint.appendChild(el)
	}
}

const buildCopyButton = (id: string, cookieName: string, cookieValue: string): HTMLElement => {
	const FLOOR = 10
	const DEF_TXT = `Copy ${cookieName} cookie`
	const DEF_POS = `999${Math.floor(Math.random() * Math.floor(FLOOR))}px`
	const DEF_CSS = { position: "relative", right: 0, width: "auto", height: "auto", background: "#35C2DB", color: "#FFF" }
	const res = document.createElement("button")
	res.id = id
	res.classList.add("toggle-switch")
	Object.assign(res.style, DEF_CSS)
	res.textContent = DEF_TXT
	res.addEventListener("click", () => {
		let tmp = res.querySelector("input")
		const sel = document.getSelection()
		const range = document.createRange()
		if (!tmp) {
			tmp = document.createElement("input")
			Object.assign(tmp.style, { position: "absolute", opacity: 0, top: DEF_POS, right: DEF_POS })
			tmp.setAttribute("value", cookieValue)
			tmp.textContent = cookieValue
			res.appendChild(tmp)
		}
		tmp.parentElement.style.background = "#35C2DB"
		tmp.select()
		range.selectNode(tmp)
		range.selectNodeContents(tmp)
		sel.addRange(range)
		const er = document.execCommand("copy", true)
		if (!er) {
			// @ts-ignore
			navigator.clipboard.writeText(tmp.value)
		}
		sendMessage({ notif: { title: "Phantombuster", message: `Your ${cookieName} is copied in the clipboard` } })
		Object.assign(res.style, DEF_CSS, { background: "#5CB85C" })
		res.textContent = `${cookieName} copied in the clipboard!`
		setTimeout(() => {
			Object.assign(res.style, DEF_CSS)
			res.textContent = DEF_TXT
		}, CUSTOM_POLL)
		sel.removeAllRanges()
		sel.empty()
	})
	return res
}

// fill the form with the correct cookie(s)
const setCookies = (cookies) => {
	if (isZapierPage()) {
		const injectBtnLocation = "fieldset.fm-fields.child-fields-group"
		const btnId = "zapierPbExtension"
		let i = 0
		for (const cookie of cookies) {
			const loginPrompt = document.querySelector(zapierExtensionId)
			if (loginPrompt) {
				loginPrompt.parentElement.removeChild(loginPrompt)
			}
			const labels = Array.from(document.querySelectorAll<HTMLElement>(`${injectBtnLocation} label`))
				.filter((el) => el.textContent.trim().toLowerCase().indexOf(cookie.name) > -1)
			const btn = buildCopyButton(`${btnId}${i}`, cookie.name, cookie.value)
			if (labels.length < 1) {
				document.querySelector(`${injectBtnLocation} .fm-field:first-of-type .fm-label`).appendChild(btn)
			} else {
				const injectLocation = parentUntils(labels.shift(), "fm-label")
				injectLocation.appendChild(btn)
			}
			i++
		}
	} else {
		const sel = isPhantombusterStepSetupPage() ? "div[data-field-info] input" : "div[data-alpaca-field-path*=\"/sessionCookie\"]:not([style*=\"display: none\"]) input"
		for (let i = 0; i < cookies.length; i++) {
			const inputField = document.querySelectorAll<HTMLInputElement>(sel)[i]
			inputField.value = cookies[i].value
			// We need to send an event to the react element handler to prevent an auto reset
			if (isPhantombusterStepSetupPage()) {
				inputField.dispatchEvent(new Event("input", { bubbles: true }))
			}
		}
		disableButton(cookies.length)
	}
}

// listen to messages from background
_browserMain.runtime.onMessage.addListener((message) => {
	if (message.cookies) {
		const cookies = message.cookies
		if (cookies[0]) {
			setCookies(cookies)
		} else {
			isZapierPage() ? displayLoginOnZapier() : displayLogin()
			window.open(websiteUrl, "_blank")
			sendMessage({opening: websiteName })
		}
	}

	if (message.restart) {
		if (isV2InputPage()) {
			setExtensionLoadProof()
			createButton()
		} else {
			createZapierButton()
		}
	}
})

const main = () => {
	setExtensionLoadProof()
	// no need to continue if the current user is in logged as state
	if (isPhantombusterUserLoggedAs()) {
		return
	}
	// add an event listener next to all launch buttons
	document.querySelectorAll(".launchButtonOptions, #launchButtonModalSwitchEditor").forEach((el) => el.addEventListener("click", createButton))
	document.querySelectorAll(".launchButtonOptions, #launchButtonModalSwitchEditor").forEach((el) => el.addEventListener("click", createSheetButton))
	// Need to wait until Zapier shows elements...
	if (isZapierPage()) {
		waitUntilZapierBoot()
	}
}

main()
