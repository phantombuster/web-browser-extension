declare var browser: typeof chrome
const _browserMain = chrome || browser
// @ts-ignore
let website
let websiteName
let websiteUrl

const zapierDropdownSelector = "div.fm-field-type-fields fieldset.fm-fields div[role=listbox]"
const zapierExtensionId = "button[id*=\"zapierPbExtension\"]"

const waitUntilZapierBoot = () => {
	const idleBoot = setInterval(() => {
		if (document.querySelector("div[role=listbox] .select-arrow")) {
			clearInterval(idleBoot)
			buildListeners()
		}
	}, 100)
}

const waitWhileBlur = () => {
	const blurIdle = setInterval(() => {
		const el = document.querySelector("div.flowform")
		if (el && !el.classList.contains("loading-needs")) {
			clearInterval(blurIdle)
			createZapierButton()
		}
	}, 100)
}

const buildListeners = () => {
	const idle = setInterval(() => {
		if (document.querySelector("div.choices-container")) {
			// document.querySelector("div.choices-container").addEventListener("click", createZapierButton)
			document.querySelector("div.choices-container").addEventListener("click", waitWhileBlur)
			clearInterval(idle)
		}
	}, 100)
}

const parentUntils = (el: HTMLElement, selector: string) => {
	if (el.classList.contains(selector)) {
		return el
	}
	if (el.tagName.toLowerCase() === "body") {
		return null
	}
	return parentUntils(el.parentElement, selector)
}

const createZapierButton = () => {
	const detectButton = setInterval(() => {
		const injectBtnLocation = "fieldset.fm-fields.child-fields-group"
		const btnSels = "button[id*=\"zapierPbExtension\"]"
		if (document.querySelector(zapierDropdownSelector)) {
			website = null
			let apiName = document.querySelector(zapierDropdownSelector).textContent.trim()
			apiName = apiName.split(" ").shift()
			for (const property in WEBSITEENUM) {
				if (apiName.match(property)) {
					website = property
					break
				}
			}
			// We need to remove all existing buttons when a dropdown element is selected
			document.querySelectorAll(btnSels).forEach((el: HTMLElement) => el.remove())
			// No need to continue when the user select a custom script
			if (!website) {
				return
			}
			websiteName = WEBSITEENUM[website].name
			websiteUrl = WEBSITEENUM[website].websiteUrl
			openConnection()
			buildListeners()
			clearInterval(detectButton)
		}
	})
}

// create the Get Cookies button
const createButton = () => {
	const checkExist = setInterval(() => {
		if (document.querySelector("div[data-alpaca-field-path*=\"/sessionCookie\"] label a")) {
			const apiLink = document.querySelector("div[data-alpaca-field-path*=\"/sessionCookie\"] label a").getAttribute("href")
			for (const property in WEBSITEENUM) {
				if (apiLink.indexOf(WEBSITEENUM[property].match) > -1) {
					website = property
					break
				}
			}
			websiteName = WEBSITEENUM[website].name
			websiteUrl = WEBSITEENUM[website].websiteUrl
			const btn = document.createElement("BUTTON")
			btn.id = "pbExtensionButton"
			btn.classList.add("btn", "btn-xs", "pull-right")
			btn.onclick = openConnection
			if (!document.querySelector("#pbExtensionButton")) {
				document.querySelector("div[data-alpaca-field-path*=\"/sessionCookie\"] label").appendChild(btn)
				document.querySelector("#pbExtensionButton").parentElement.style.display = "block"
			}
			enableButton()
			clearInterval(checkExist)
		}
	}, 100)
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
	}, 100)
}

// send a message to background script
const sendMessage = (message) => {
	_browserMain.runtime.sendMessage(message)
}

const disableButton = (cookiesLength) => {
	document.querySelectorAll("#pbExtensionButton").forEach((el) => {
		el.classList.add("btn-success")
		el.classList.remove("btn-warning")
		el.setAttribute("disabled", "true")
		el.textContent = `${websiteName} Cookie${cookiesLength > 1 ? "s" : ""} successfully pasted!`
	})
	listenInputChange()
}

const enableButton = () => {
	document.querySelectorAll("#pbExtensionButton").forEach((el) => {
		el.classList.add("btn-primary")
		el.classList.remove("btn-success")
		el.classList.remove("btn-warning")
		const cookieCount = document.querySelectorAll("div[data-alpaca-field-path*=\"/sessionCookie\"] input").length
		el.textContent = `Get Cookie${cookieCount > 1 ? "s" : ""} from ${websiteName}`
		el.removeAttribute("disabled")
	})
}

// send the website to background to query its cookies
const openConnection = () => {
	const isZapier = document.location.hostname.indexOf("zapier.com") > -1
	sendMessage({website, silence: !!isZapier })
}

const listenInputChange = () => {
	document.querySelector("#pbExtensionButton").parentElement.parentElement.querySelector("input").addEventListener("input", inputChange)
}

const inputChange = (event) => {
	enableButton()
	event.target.removeEventListener("type", inputChange, true)
}

const buildCopyButton = (id: string, cookieName: string, cookieValue: string): HTMLElement => {
	const res = document.createElement("button")
	res.id = id
	res.classList.add("toggle-switch")
	res.style.position = "relative"
	res.style.right = "0"
	res.style.width = "auto"
	res.style.height = "auto"
	res.style.background = "#35C2DB"
	res.style.color = "#FFF"
	res.textContent = `Copy ${cookieName} cookie`
	res.addEventListener("click", () => {
		let tmp = res.querySelector("input")
		const sel = document.getSelection()
		const range = document.createRange()
		if (!tmp) {
			tmp = document.createElement("input")
			tmp.style.position = "absolute"
			tmp.style.opacity = "0"
			tmp.setAttribute("value", cookieValue)
			tmp.textContent = cookieValue
			res.appendChild(tmp)
		}
		tmp.select()
		range.selectNode(tmp)
		range.selectNodeContents(tmp)
		sel.addRange(range)
		const er = document.execCommand("copy", true)
		if (!er) {
			// @ts-ignore
			navigator.clipboard.writeText(tmp.value)
		}
		sel.removeAllRanges()
		sel.empty()
	})
	return res
}

// fill the form with the correct cookie(s)
const setCookies = (cookies) => {
	const isZapier = document.location.hostname.indexOf("zapier.com") > -1

	if (isZapier) {
		const injectBtnLocation = "fieldset.fm-fields.child-fields-group"
		const btnId = "zapierPbExtension"
		let i = 0
		for (const cookie of cookies) {
			const labels = Array.from(document.querySelectorAll(`${injectBtnLocation} label`))
				.filter((el: HTMLElement) => el.textContent.trim().toLowerCase().indexOf(cookie.name) > -1) as HTMLElement[]
			const btn = buildCopyButton(`${btnId}${i}`, cookie.name, cookie.value)
			if (labels.length < 1) {
				document.querySelector(`${injectBtnLocation} .fm-field:first-of-type .fm-label`).appendChild(btn)
			} else {
				const injectLocation = parentUntils(labels.shift(), "fm-label")
				injectLocation.appendChild(btn)
			}
			i++
		}
		// buildCookiesPopUp(cookies)

	} else {
		for (let i = 0; i < cookies.length; i++) {
			const inputField = document.querySelectorAll("div[data-alpaca-field-path*=\"/sessionCookie\"] input")[i] as HTMLInputElement
			inputField.value = cookies[i].value
		}
		disableButton(cookies.length)
	}
}

// listen to messages from background
_browserMain.runtime.onMessage.addListener((message, sender, sendResponse) => {
	const isZapier = document.location.hostname.indexOf("zapier.com") > -1
	if (message.cookies) {
		const cookies = message.cookies
		if (cookies[0]) {
			setCookies(cookies)
		} else {
			document.querySelectorAll(isZapier ? zapierExtensionId : "#pbextensionbutton").forEach((el) => {
				if (isZapier) {
					// TODO: handle this case
				} else {
					el.classList.replace("btn-primary", "btn-warning")
				}
				el.textContent = `please log in to ${websiteName} to get your cookie`
			})
			window.open(websiteUrl, "_blank")
			sendMessage({opening: websiteName })
		}
	}
})

// add an event listener next to all launch buttons
document.querySelectorAll(".launchButtonOptions, #launchButtonModalSwitchEditor").forEach((el) => el.addEventListener("click", createButton))
document.querySelectorAll(".launchButtonOptions, #launchButtonModalSwitchEditor").forEach((el) => el.addEventListener("click", createSheetButton))
// Need to wait until Zapier shows elements...
waitUntilZapierBoot()
