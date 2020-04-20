export const extensionWebsiteDomains = [
	"phantombuster.com",
	"zapier.com",
	// "facebook.com",
	// "github.com",
	// "instagram.com",
	// "intercom.io",
	// "linkedin.com",
	// "medium.com",
	// "producthunt.com",
	// "slack.com",
	// "twitter.com",
	// "uber.com",
	// "youtube.com",
	// "quora.com",
	// "pinterest.com",
]

export type WebsiteName = "Facebook" | "GitHub" | "Instagram" | "Intercom" | "Quora" | "LinkedIn" | "Medium" | "Pinterest" | "Product Hunt" | "Slack" | "Twitter" | "Uber" | "Youtube"

export interface IWebsite {
	match: string
	name: WebsiteName
	url: string
	cookies: {
		name: string
		domain: string
	}[]
}

export const websites: IWebsite[] = [
	{
		name: "Facebook",
		match: "/facebook",
		url: "https://www.facebook.com/",
		cookies: [
			{ name: "c_user", domain: ".facebook.com" },
			{ name: "xs", domain: ".facebook.com" }
		]
	}, {
		name: "GitHub",
		match: "/github",
		url: "https://github.com/",
		cookies: [
			{ name: "user_session", domain: "github.com" }
		]
	}, {
		name: "Instagram",
		match: "/instagram",
		url: "https://www.instagram.com/",
		cookies: [
			{ name: "sessionid", domain: ".instagram.com" }
		]
	}, {
		name: "Intercom",
		match: "/intercom",
		url: "https://app.intercom.io",
		cookies: [
			{ name: "_intercom_session", domain: "app.intercom.io" }
		]
	}, {
		name: "Quora",
		match: "/quora",
		url: "https://quora.com",
		cookies: [
			{ name: "m-b", domain: ".quora.com" }
		]
	}, {
		name: "LinkedIn",
		match: "/linkedin",
		url: "https://www.linkedin.com/",
		cookies: [
			{ name: "li_at", domain: ".www.linkedin.com" }
		]
	}, {
		name: "Medium",
		match: "/medium",
		url: "https://www.medium.com",
		cookies: [
			{ name: "uid", domain: ".medium.com" },
			{ name: "sid", domain: ".medium.com" }
		]
	}, {
		name: "Pinterest",
		match: "/pinterest",
		url: "https://pinterest.com",
		cookies: [
			{ name: "_pinterest_sess", domain: ".pinterest.com" }
		]
	}, {
		name: "Product Hunt",
		match: "/product-hunt",
		url: "https://www.producthunt.com",
		cookies: [
			{ name: "_producthunt_session_production", domain: ".producthunt.com" }
		]
	}, {
		name: "Slack",
		match: "/slack",
		url: "https://www.slack.com",
		cookies: [
			{ name: "d", domain: ".slack.com" }
		]
	}, {
		name: "Twitter",
		match: "/twitter",
		url: "https://twitter.com/",
		cookies: [
			{ name: "auth_token", domain: ".twitter.com" }
		]
	}, {
		name: "Uber",
		match: "/uber",
		url: "https://riders.uber.com",
		cookies: [
			{ name: "csid", domain: ".riders.uber.com"},
			{ name: "sid", domain: ".uber.com" }
		]
	}, {
		name: "Youtube",
		match: "/youtube",
		url: "https://www.youtube.com",
		cookies: [
			{ name: "HSID", domain: ".youtube.com" },
			{ name: "SID", domain: ".youtube.com"},
			{ name: "SSID", domain: ".youtube.com"}
		]
	},
]

export const getWebsiteFromUrl = (url: string) => {
	const matchingWebsites = websites.filter((website) => url.toLowerCase().indexOf(website.match.toLowerCase()) > -1)
	if (matchingWebsites.length === 1) {
		return matchingWebsites[0]
	}
	return null
}

export const getWebsiteFromName = (name: WebsiteName) => {
	const matchingWebsites = websites.filter((website) => website.name === name)
	if (matchingWebsites.length === 1) {
		return matchingWebsites[0]
	}
	return null
}

export const getWebsiteInString = (name: string) => {
	const matchingWebsites = websites.filter((website) => name.toLowerCase().indexOf(website.name.toLowerCase()) > -1 )
	if (matchingWebsites.length === 1) {
		return matchingWebsites[0]
	}
	return null
}
