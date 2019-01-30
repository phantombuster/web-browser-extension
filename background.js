// background-script.js
"use strict";
// console.log("window:", window)
const _browser = chrome || browser
let domain, cookiesName
let retrievedCookies
let tabID
// function onError(error) {
//   console.error(`Error: ${error}`);
// }

// function sendMessageToTabs(tabs) {
//   for (let tab of tabs) {
//     chrome.tabs.sendMessage(
//       tab.id,
//       {greeting: "Hi from background script"}
//     ).then(response => {
//       console.log("Message from the content script:");
//       console.log(response.response);
//     }).catch(onError);
//   }
// }

// _browser.browserAction.onClicked.addListener(() => {
//   _browser.tabs.query({
//     currentWindow: true,
//     active: true
//   }).then(sendMessageToTabs).catch(onError);
// });

// function handleClick() {
//     console.log("do something.");
//     // If you want to something with the content, you will need a content script and messaging
// }

// _browser.browserAction.onClicked.addListener(handleClick);

_browser.runtime.onConnect.addListener(connected)

function _getCurrentTab(callback){ //Take a callback
    _browser.tabs.query({active:true, currentWindow:true},function(tab){
        callback(tab); //call the callback with argument
    });
};

function displayTab(tab) { //define your callback function
	console.log("currentTab:", tab);
	return tab
 };

//  _getCurrentTab(_displayTab); //invoke the function with the callback function reference

function connected(port) {
	console.log("listening connection")
	console.assert(port.name == "phantombusterCookie");
	port.onMessage.addListener(function(msg) {
		console.log("msgbg:", msg)
		
		if (msg.websiteName) {
			const websiteName = msg.websiteName
			cookiesName = msg.cookiesName
			_browser.tabs.query({
				active: true,
				currentWindow: true
			}, function (currentTab) {
				tabID = currentTab[0].id
				console.log("tabID = ", tabID)
		})
			console.log("retrieving cookie for ", websiteName)
			switch(websiteName) {
				case "LinkedIn":
					domain = ".twitter.com"
					break
				case "Facebook":
					domain = ".facebook.com"
					break
				case "Twitter":
					domain = ".twitter.com"
					break
				case "Instagram":
					domain = ".instagram.com"
					break
			}
			_browser.cookies.getAll({
				domain
			  }, function (cookies) {
					retrievedCookies = cookiesName.map(name => cookies.filter(el => el.name === name)[0])
					port.postMessage({retrievedCookies})
			  })
		}
		if (msg.opening) {
			_browser.cookies.onChanged.addListener(cookieChanged)
			port.postMessage({opened: true})
		}
	})
}

function promiseQuery(options){
	return new Promise(function(resolve,reject){
	  _browser.tabs.query(options, resolve);
	});
}

function cookieChanged(changeInfo) {
	// console.log("cookie changed:", changeInfo)
	// console.log("domain Changed:", domain)
	_browser.cookies.getAll({
		domain
	  }, async function (cookies) {
		  retrievedCookies = cookiesName.map(name => cookies.filter(el => el.name === name)[0])
		  if (retrievedCookies[0]) {
			console.log("retrievedCookiesChanged", retrievedCookies[0])
			console.log("tabID is still", tabID)
			_browser.cookies.onChanged.removeListener(cookieChanged)
			const allTabs = await promiseQuery({}).then(function (tabs) {
				return tabs
			})
			console.log("alltab:", allTabs)
			const pbTab = allTabs.filter(el => el.id === tabID)
			console.log("pbtab:", pbTab)
			// _browser.tabs.query({active: true, currentWindow: true}, function(tabs) {
			_browser.tabs.sendMessage(tabID, {retrievedCookies}, function(response) {
				  console.log("rsvp");
				})
			//   })
			// _browser.runtime.sendMessage({retrievedCookies})
		}
		// port.postMessage({retrievedCookies});
		// port.postMessage({allCookies: cookies})
	  })
	// _browser.cookies.getAll({
	// 	evt.target.domain
	//   }, function (cookies) {
	// 	  const retrievedCookies = cookiesName.map(name => cookies.filter(el => el.name === name)[0])
	// 	for (var i = 0; i < cookies.length; i++) {
	// 	  console.log("bgC:", cookies[i])
	// 	}
	//   })
}
// var dataTempStorage = [];

// _browser.runtime.onMessage.addListener(function (request, sender, sendResponse) {
// 	console.log("mkt1", request)
// 	chrome.cookies.getAll({
// 		domain: ".twitter.com"
// 	  }, function (cookies) {
// 		for (var i = 0; i < cookies.length; i++) {
// 		  console.log(cookies[i])
// 		}
// 	  });
//     if (request.setdata) {
//         dataTempStorage = request.setdata;
// 		console.log("mkt2")

//         _browser.tabs.create({
//             'url': _browser.extension.getURL('newpage.html')
//         })
//     }

//     if (request == "getdata") {
// 		sendResponse({data: dataTempStorage});
// 		console.log("mkt3")

// 	}
// })