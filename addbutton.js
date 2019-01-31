
console.log("Phantombuster Extension Loaded")
const _browser = chrome || browser
let website
// create the Get Cookies button
const createButton = () => {
	const checkExist = setInterval(() => {
		if (document.querySelector("div[data-alpaca-field-path*=\"/sessionCookie\"] label a")) {
			const apiLink = document.querySelector("div[data-alpaca-field-path*=\"/sessionCookie\"] label a").href
			if (apiLink.includes("/linkedin")) {
				website = "LinkedIn"
			} else if (apiLink.includes("/twitter")) {
				website = "Twitter"
			} else if (apiLink.includes("/instagram")) {
				website = "Instagram"
			} else if (apiLink.includes("/facebook")) {
				website = "Facebook"
			} else if (apiLink.includes("/product-hunt")) {
				website = "ProductHunt"
			}
			websiteName = WebsiteEnum[website].name
			websiteUrl = WebsiteEnum[website].websiteUrl

			const btn = document.createElement("BUTTON")
			btn.textContent = `Get cookie${websiteName === "Facebook" ? "s" : ""} from ${websiteName}`
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
	_browser.runtime.sendMessage(message)
}

// send the website to background to query its cookies
const openConnection = () => {
	console.log("opening Connection")
	sendMessage({website})
}

// fill the form with the correct cookie(s)
const setCookies = (cookies) => {
	document.querySelector("div[data-alpaca-field-path*=\"/sessionCookie\"] input").value = cookies[0].value
	if (websiteName === "Facebook") {
		document.querySelectorAll("div[data-alpaca-field-path*=\"/sessionCookie\"] input")[1].value = cookies[1].value
	}
	document.querySelectorAll("#pbExtensionButton").forEach(el => {
		el.classList.add("button-success")
		if (el.classList.contains("button-failure")) {
			el.classList.remove("button-failure")
		}
		el.textContent = `${websiteName} Cookie${websiteName === "Facebook" ? "s" : ""} successfully pasted!`
	})
}

// listen to messages from background
_browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
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

