const _browser = chrome || browser;
let domain;
let cookiesList;
let website;
let tabID;
let cookiesSent = false;
const sendCookie = (cookies) => {
    _browser.tabs.sendMessage(tabID, { cookies });
    if (cookies[0]) {
        cookiesSent = true;
        const message = `Your ${website} ${cookies.length > 1 ? "cookies have" : "cookie has"} been successfully entered.`;
        // @ts-ignore
        _browser.notifications.create({ type: "basic", message, title: "Phantombuster", iconUrl: "./img/icon.png", silent: true });
    }
};
const cookieChanged = (changeInfo) => {
    _browser.cookies.getAll({ domain }, (cookies) => {
        console.log("domain:", domain);
        const retrievedCookies = cookiesList.map((cookie) => cookies.filter((el) => el.name === cookie.name && el.domain === cookie.domain)[0]);
        console.log("retrievedCookies:", retrievedCookies);
        if (retrievedCookies[0] && !cookiesSent) {
            _browser.cookies.onChanged.removeListener(cookieChanged);
            sendCookie(retrievedCookies);
        }
    });
};
_browser.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg.opening) {
        _browser.cookies.onChanged.addListener(cookieChanged);
    }
    if (msg.website) {
        cookiesSent = false;
        website = msg.website;
        tabID = sender.tab.id;
        domain = WEBSITEENUM[website].domain;
        cookiesList = WEBSITEENUM[website].cookiesList;
        _browser.cookies.getAll({}, (cookies) => {
            console.log("cookies:", cookies);
            const retrievedCookies = cookiesList.map((cookie) => cookies.filter((el) => el.name === cookie.name && el.domain === cookie.domain)[0]);
            console.log("retrievedCookies", retrievedCookies);
            sendCookie(retrievedCookies);
        });
    }
});

const createSheetButton = () => {
    const checkExist = setInterval(() => {
        if (document.querySelector("div[data-alpaca-field-path*=\"/spreadsheetUrl\"] label a")) {
			const sheetLink = document.createElement("a");
			sheetLink.id = "spreadsheetLink";
			sheetLink.textContent = "Create Google Spreadsheet";
			sheetLink.href = "https://docs.google.com/spreadsheets/u/0/create";
			sheetLink.setAttribute("target", "_blank");	
			sheetLink.classList.add("btn", "btn-xs", "pull-right", "btn-success", "btn-primary");
			document.querySelector("div[data-alpaca-field-path*=\"/spreadsheetUrl\"] label").appendChild(sheetLink);
			document.querySelector("#spreadsheetLink").parentElement.style.display = "block";
			clearInterval(checkExist);
        }
    }, 100);
};

// add an event listener next to all launch buttons
document.querySelectorAll(".launchButtonOptions, #launchButtonModalSwitchEditor").forEach((el) => el.addEventListener("click", createButton));
document.querySelectorAll(".launchButtonOptions, #launchButtonModalSwitchEditor").forEach((el) => el.addEventListener("click", createSheetButton));
//# sourceMappingURL=main.js.map