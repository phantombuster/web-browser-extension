console.log("coucou")
const _browser = chrome || browser
let websiteName, websiteUrl, cookiesName

document.querySelectorAll(".launchButtonOptions, #launchButtonModalSwitchEditor").forEach(el => el.addEventListener("click", clickButton))

function clickButton() {
	var checkExist = setInterval(function() {
		if (document.querySelector("div[data-alpaca-field-path*=\"/sessionCookie\"] label a")) {
			const apiLink = document.querySelector("div[data-alpaca-field-path*=\"/sessionCookie\"] label a").href
			if (apiLink.includes("/linkedin")) {
				websiteName = "LinkedIn"
				websiteUrl = "https://www.linkedin.com/"
				cookiesName = ["li_at"]
			} else if (apiLink.includes("/twitter")) {
				websiteName = "Twitter"
				websiteUrl = "https://twitter.com/"
				cookiesName = ["auth_token"]
			} else if (apiLink.includes("/instagram")) {
				websiteName = "Instagram"
				websiteUrl = "https://www.instagram.com/"
				cookiesName = ["sessionid"]
			} else if (apiLink.includes("/facebook")) {
				websiteName = "Facebook"
				websiteUrl = "https://www.facebook.com/"
				cookiesName = ["c_user", "xs"]
			}
			const btn = document.createElement("BUTTON")

			// btn.setAttribute("href", websiteUrl)
			// btn.setAttribute("target", "_blank")
			btn.textContent = `Get cookie${websiteName === "Facebook" ? "s" : ""} from ${websiteName}`
			btn.id = "pbExtensionButton"
			btn.style.color = "white"
			btn.style.border = "none"
			btn.style.borderRadius = "12px"
			btn.style.backgroundColor ="#35C2DB"
			btn.style.marginLeft = "5px"
			btn.style.padding = "4px"
			btn.onclick = openConnection
			if (!document.querySelector("#pbExtensionButton")) {
				document.querySelector("div[data-alpaca-field-path*=\"/sessionCookie\"] label").appendChild(btn)
				// if (document.querySelectorAll("div[data-alpaca-field-path*=\"/sessionCookie\"] label").length === 2) {
				// 	document.querySelectorAll("div[data-alpaca-field-path*=\"/sessionCookie\"] label")[1].appendChild(btn.cloneNode(true))
				// }
			}
		   clearInterval(checkExist)
		}
	 }, 100)
}


function openConnection() {
	console.log("opening Connection")
	var port = _browser.runtime.connect({name: "phantombusterCookie"});
	port.postMessage({websiteName, cookiesName});
	port.onMessage.addListener(function(msg) {
		console.log("Message received: ", msg)
		if (msg.retrievedCookies) {
			const cookies = msg.retrievedCookies
			// console.log("retrieved cookie1 = ", cookies)
			console.log("retrieved cookie3= ", cookies[0])
			if (cookies[0]) {
				setCookies(cookies)
			} else {
				document.querySelectorAll("#pbExtensionButton").forEach(el => el.style.backgroundColor ="#8B0000")
				window.open(websiteUrl, '_blank')
				port.postMessage({opening: websiteName})
			}
		}
		if (msg.opened) {
			console.log("We've opened the page")
		}
		// if (msg.okies) {
		// 	for (let cookie of msg.okies) {
		// 		console.log("cookie: ", cookie)
		// 	}
		// }
	})

}

const setCookies = (cookies) => {
	document.querySelector("div[data-alpaca-field-path*=\"/sessionCookie\"] input").value = cookies[0].value
	if (websiteName === "Facebook") {
		document.querySelectorAll("div[data-alpaca-field-path*=\"/sessionCookie\"] input")[1].value = cookies[1].value
	}
	document.querySelectorAll("#pbExtensionButton").forEach(el => el.style.backgroundColor ="#00b200")
}

_browser.runtime.onMessage.addListener(
	function(cookies, sender, sendResponse) {
		console.log("newCookies", cookies)
		setCookies(cookies.retrievedCookies)
	})

// function setCookies (cookies) {
// 	console.log("retrieved cookie3= ", cookies[0])
// 	if (cookies[0]) {
// 		document.querySelector("div[data-alpaca-field-path*=\"/sessionCookie\"] input").value = cookies[0].value
// 		if (websiteName === "Facebook") {
// 			document.querySelectorAll("div[data-alpaca-field-path*=\"/sessionCookie\"] input")[1].value = cookies[1].value
// 		}
// 		document.querySelectorAll("#pbExtensionButton").forEach(el => el.style.backgroundColor ="#00b200")
// 	} else {
// 		document.querySelectorAll("#pbExtensionButton").forEach(el => el.style.backgroundColor ="#8B0000")
// 		window.open(websiteUrl, '_blank');
// 		port.postMessage({opening: websiteName})
// 	}
// }