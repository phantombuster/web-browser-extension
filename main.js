const _browserMain = chrome || browser;
// let website
let websiteName;
let websiteUrl;
// create the Get Cookies button
const createButton = () => {
    const checkExist = setInterval(() => {
        if (document.querySelector("div[data-alpaca-field-path*=\"/sessionCookie\"] label a")) {
            const apiLink = document.querySelector("div[data-alpaca-field-path*=\"/sessionCookie\"] label a").getAttribute("href");
            for (const property in WEBSITEENUM) {
                if (apiLink.indexOf(WEBSITEENUM[property].match) > -1) {
                    website = property;
                    break;
                }
            }
            websiteName = WEBSITEENUM[website].name;
            websiteUrl = WEBSITEENUM[website].websiteUrl;
            const btn = document.createElement("BUTTON");
            btn.id = "pbExtensionButton";
            btn.classList.add("btn", "btn-xs", "pull-right");
            btn.onclick = openConnection;
            if (!document.querySelector("#pbExtensionButton")) {
                document.querySelector("div[data-alpaca-field-path*=\"/sessionCookie\"] label").appendChild(btn);
                document.querySelector("#pbExtensionButton").parentElement.style.display = "block";
            }
            enableButton();
            clearInterval(checkExist);
        }
    }, 100);
};
// send a message to background script
const sendMessage = (message) => {
    _browserMain.runtime.sendMessage(message);
};
const disableButton = (cookiesLength) => {
    document.querySelectorAll("#pbExtensionButton").forEach((el) => {
        el.classList.add("btn-success");
        el.classList.remove("btn-warning");
        el.setAttribute("disabled", "true");
        el.textContent = `${websiteName} Cookie${cookiesLength > 1 ? "s" : ""} successfully pasted!`;
    });
    listenInputChange();
};
const enableButton = () => {
    document.querySelectorAll("#pbExtensionButton").forEach((el) => {
        el.classList.add("btn-primary");
        el.classList.remove("btn-success");
        el.classList.remove("btn-warning");
        const cookieCount = document.querySelectorAll("div[data-alpaca-field-path*=\"/sessionCookie\"] input").length;
        el.textContent = `Get Cookie${cookieCount > 1 ? "s" : ""} from ${websiteName}`;
        el.removeAttribute("disabled");
    });
};
// send the website to background to query its cookies
const openConnection = () => {
    sendMessage({ website });
};
const listenInputChange = () => {
    document.querySelector("#pbExtensionButton").parentElement.parentElement.querySelector("input").addEventListener("input", inputChange);
};
const inputChange = (event) => {
    enableButton();
    event.target.removeEventListener("type", inputChange, true);
};
// fill the form with the correct cookie(s)
const setCookies = (cookies) => {
    for (let i = 0; i < cookies.length; i++) {
        const inputField = document.querySelectorAll("div[data-alpaca-field-path*=\"/sessionCookie\"] input")[i];
        inputField.value = cookies[i].value;
    }
    disableButton(cookies.length);
};
// listen to messages from background
_browserMain.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.cookies) {
        const cookies = message.cookies;
        if (cookies[0]) {
            setCookies(cookies);
        }
        else {
            document.querySelectorAll("#pbExtensionButton").forEach((el) => {
                el.classList.replace("btn-primary", "btn-warning");
                el.textContent = `Please log in to ${websiteName} to get your cookie`;
            });
            window.open(websiteUrl, "_blank");
            sendMessage({ opening: websiteName });
        }
    }
});
// add an event listener next to all launch buttons
document.querySelectorAll(".launchButtonOptions, #launchButtonModalSwitchEditor").forEach((el) => el.addEventListener("click", createButton));
//# sourceMappingURL=main.js.map