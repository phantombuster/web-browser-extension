declare var browser: typeof chrome
const _browserMain = chrome || browser
// @ts-ignore
let website
let websiteName
let websiteUrl

const zapierDropdownSelector = "div.fm-field-type-fields fieldset.fm-fields div[role=listbox]"
const zapierExtensionId = "#zapierPbExtension"

const _contains = (sel: string, text: string) => Array.from(document.querySelectorAll(sel)).filter((el) => el.textContent.indexOf(text) > -1)

const setCodeMirrorValue = (idx: number, value: string) => {
	const el = document.querySelectorAll(".CodeMirror")
	if (el[idx]) {
		// @ts-ignore
		console.log(idx, "\t", el.CodeMirror)
		// @ts-ignore
		el[idx].CodeMirror.doc.setValue(value)
	}
}

const parentUntils = (el: HTMLElement|Element, selector: string): HTMLElement|null => {
	if (el.classList.contains(selector)) {
		return el as HTMLElement
	}
	if (el.tagName.toLowerCase() === "body") {
		return null
	}
	return parentUntils(el.parentElement, selector)
}

const waitUntilZapierBoot = () => {
	const idleBoot = setInterval(() => {
		if (document.querySelector("div[role=listbox] .select-arrow")) {
			buildListeners()
		}
	}, 100)
}

const buildListeners = () => {
	const idle = setInterval(() => {
		if (document.querySelector("div.choices-container")) {
			document.querySelector("div.choices-container").addEventListener("click", createZapierButton)
			clearInterval(idle)
		}
	}, 100)
}

const createZapierButton = () => {
	const detectButton = setInterval(() => {
		const injectBtnLocation = "fieldset.fm-fields.child-fields-group"
		const btnId = "zapierPbExtension"
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
			// No need to continue when the user select a custom script
			if (!website) {
				const btnPresent = document.querySelector(`#${btnId}`)
				if (btnPresent) {
					btnPresent.remove()
				}
				return
			}
			websiteName = WEBSITEENUM[website].name
			websiteUrl = WEBSITEENUM[website].websiteUrl
			// Only inject the button when Zapier configuration loading isn't present in the page
			if (!document.querySelector(`#${btnId}`) && document.querySelector(injectBtnLocation)) {
				const zapBtn: HTMLElement = document.createElement("button")
				zapBtn.id = btnId
				zapBtn.classList.add("toggle-switch")
				zapBtn.style.position = "absolute"
				zapBtn.style.top = "5%"
				zapBtn.style.right = "5%"
				zapBtn.style.width = "auto"
				zapBtn.style.height = "auto"
				zapBtn.style.background = "#35C2DB"
				zapBtn.style.color = "#FFF"
				zapBtn.onclick = openConnection
				document.querySelector(injectBtnLocation).appendChild(zapBtn)
				zapBtn.parentElement.style.position = "relative"
			}
			buildZapierBtnText()
			buildListeners()
			clearInterval(detectButton)
		}
	})
}

const buildZapierBtnText = () => {
	document.querySelectorAll("#zapierPbExtension").forEach((el: HTMLElement) => {
		const cookieCount = WEBSITEENUM[website].cookiesList.length
		el.textContent = `Get cookie${cookieCount > 1 ? "s" : "" } from ${websiteName}`
		el.removeAttribute("disabled")
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
	sendMessage({website})
}

const listenInputChange = () => {
	document.querySelector("#pbExtensionButton").parentElement.parentElement.querySelector("input").addEventListener("input", inputChange)
}

const inputChange = (event) => {
	enableButton()
	event.target.removeEventListener("type", inputChange, true)
}

// fill the form with the correct cookie(s)
const setCookies = (cookies) => {
	const isZapier = document.location.hostname.indexOf("zapier.com") > -1

	if (isZapier) {
		const list = WEBSITEENUM[website].cookiesList
		let i = 0
		for (const one of list) {
			sendMessage({ zapierExecute: { idx: i, value: cookies[i].value } })
			// runOnce(setCodeMirrorValue, i, cookies[i].value)
			// setCodeMirrorValue(i, list[i].value)
			// const els = _contains("div.fm-label label", one.name)
			// if (els.length) {
			// const el = els.shift()
			// const target = parentUntils(el as Element, "fm-field")
			// if (target) {
					// debugger
					// const tmp: HTMLElement = target.querySelector(".CodeMirror")
					// @ts-ignore
					// tmp.CodeMirror.doc.setValue(cookies[i].value)
			// }
			// }
			i++
		}
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
			if (isZapier) {
				console.log(message)
			}
			document.querySelectorAll(isZapier ? zapierExtensionId : "#pbextensionbutton").forEach((el) => {
				if (isZapier) {
					// ...
				} else {
					el.classList.replace("btn-primary", "btn-warning")
				}
				el.textContent = `please log in to ${websiteName} to get your cookie`
			})
			window.open(websiteUrl, "_blank")
			sendMessage({opening: websiteName})
		}
	}
})

// add an event listener next to all launch buttons
document.querySelectorAll(".launchButtonOptions, #launchButtonModalSwitchEditor").forEach((el) => el.addEventListener("click", createButton))
document.querySelectorAll(".launchButtonOptions, #launchButtonModalSwitchEditor").forEach((el) => el.addEventListener("click", createSheetButton))
// Need to wait until Zapier shows elements...
waitUntilZapierBoot()
