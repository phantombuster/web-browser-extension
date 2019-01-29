console.log("coucou")
// console.log("l", document.querySelectorAll("div[data-alpaca-field-path=\"/sessionCookie\"] label").length)
// function myFunction() {
// 	if (!document.querySelector("#pbExtensionButton") && document.querySelector("div[data-alpaca-field-path=\"/sessionCookie\"] label")) {
// 		console.log("add1")
// 		const btn = document.createElement("BUTTON")
// 		btn.textContent = "Get cookie"
// 		btn.id = "pbExtensionButton"
// 		btn.style.backgroundColor="#35C2DB"
// 		document.querySelector("div[data-alpaca-field-path=\"/sessionCookie\"] label").appendChild(btn);
// 	} else {
// 		console.log("add2")
// 	}
//   }


// myFunction()

// document.querySelector(".launchButtonOptions").addEventListener("click", clickButton)
document.querySelectorAll(".launchButtonOptions").forEach(el => el.addEventListener("click", clickButton))

document.querySelector("#launchButtonModalSwitchEditor").addEventListener("click", clickButton)


function clickButton() {
	var checkExist = setInterval(function() {
		if (document.querySelector("div[data-alpaca-field-path*=\"/sessionCookie\"] label a")) {
			const apiLink = document.querySelector("div[data-alpaca-field-path*=\"/sessionCookie\"] label a").href

			let websiteName
			let websiteUrl
			if (apiLink.includes("/linkedin")) {
				websiteName = "LinkedIn"
				websiteUrl = "https://www.linkedin.com/"
			} else if (apiLink.includes("/twitter")) {
				websiteName = "Twitter"
				websiteUrl = "https://twitter.com/"
			} else if (apiLink.includes("/instagram")) {
				websiteName = "Instagram"
				websiteUrl = "https://www.instagram.com/"
			} else if (apiLink.includes("/facebook")) {
				websiteName = "Facebook"
				websiteUrl = "https://www.facebook.com/"
			}
			const btn = document.createElement("a")

			btn.setAttribute("href", websiteUrl)
			btn.setAttribute("target", "_blank")
			btn.textContent = "Get cookie from " + websiteName
			btn.id = "pbExtensionButton"
			btn.style.color = "white"
			btn.style.border = "none"
			btn.style.borderRadius = "12px"
			btn.style.backgroundColor="#35C2DB"
			btn.style.marginLeft = "5px"
			btn.style.padding = "4px"
			if (!document.querySelector("#pbExtensionButton")) {
				document.querySelector("div[data-alpaca-field-path*=\"/sessionCookie\"] label").appendChild(btn)
				if (document.querySelectorAll("div[data-alpaca-field-path*=\"/sessionCookie\"] label").length === 2) {
					document.querySelectorAll("div[data-alpaca-field-path*=\"/sessionCookie\"] label")[1].appendChild(btn.cloneNode(true))
				}
			}
		   clearInterval(checkExist)
		}
	 }, 100)
}

// chrome.runtime.onMessage.addListener(gotMessage)

// function gotMessage(message, sender, sendResponse) {
// 	console.log(message.txt)
// }