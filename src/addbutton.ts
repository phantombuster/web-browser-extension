
console.log("Phantombuster Extension Loaded")
// const browser = chrome || browser
let websiteName
let websiteUrl
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
			const cookieCount = document.querySelectorAll("div[data-alpaca-field-path*=\"/sessionCookie\"] input").length
			const btn = document.createElement("BUTTON")
			btn.textContent = `Get Cookie${cookieCount > 1 ? "s" : ""} from ${websiteName}`
			btn.id = "pbExtensionButton"
			btn.classList.add("button-default")
			btn.onclick = openConnection
			if (!document.querySelector("#pbExtensionButton")) {
				document.querySelector("div[data-alpaca-field-path*=\"/sessionCookie\"] label").appendChild(btn)
			}
		   clearInterval(checkExist)
		}
	}, 100)
}

// send a message to background script
const sendMessage = (message) => {
	browser.runtime.sendMessage(message)
}

// send the website to background to query its cookies
const openConnection = () => {
	console.log("opening Connection")
	sendMessage({website})
}

// fill the form with the correct cookie(s)
const setCookies = (cookies) => {
	for (let i = 0; i < cookies.length; i++) {
		document.querySelectorAll("div[data-alpaca-field-path*=\"/sessionCookie\"] input")[i].setAttribute("value", cookies[i].value)
	}
	document.querySelectorAll("#pbExtensionButton").forEach(el => {
		el.classList.add("button-success")
		if (el.classList.contains("button-failure")) {
			el.classList.remove("button-failure")
		}
		el.textContent = `${websiteName} Cookie${cookies.length > 1 ? "s" : ""} successfully pasted!`
	})
}

// listen to messages from background
browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
	console.log("Message received:", message)
	if (message.opened) {
		console.log("We've opened the page.")
	}
	if (message.cookies) {
		const cookies = message.cookies
		if (cookies[0]) {
			console.log("Received cookies:", cookies[0])
			setCookies(cookies)
		} else {
			console.log("No cookies found!")
			document.querySelectorAll("#pbExtensionButton").forEach(el => {
				el.classList.replace("button-default", "button-failure")
				el.textContent = `Please log in to ${websiteName} to get your cookie`
			})
			window.open(websiteUrl, '_blank')
			sendMessage({opening: websiteName})
		}
	}
})

// add an event listener next to all launch buttons
document.querySelectorAll(".launchButtonOptions, #launchButtonModalSwitchEditor").forEach(el => el.addEventListener("click", createButton))

