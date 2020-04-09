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

export const bWebsites = {
	Facebook: {match: "/facebook", name: "Facebook", websiteUrl: "https://www.facebook.com/", cookiesList: [{ name: "c_user", domain: ".facebook.com" }, { name: "xs", domain: ".facebook.com" }]},
	GitHub: {match: "/github", name: "GitHub", websiteUrl: "https://github.com/", cookiesList: [{ name: "user_session", domain: "github.com" }]},
	Instagram: {match: "/instagram", name: "Instagram", websiteUrl: "https://www.instagram.com/", cookiesList: [{ name: "sessionid", domain: ".instagram.com" }]},
	Intercom: {match: "/intercom", name: "Intercom", websiteUrl: "https://app.intercom.io", cookiesList: [{ name: "_intercom_session", domain: "app.intercom.io" }]},
	Quora: { match: "/quora", name: "Quora", websiteUrl: "https://quora.com", cookiesList: [ { name: "m-b", domain: ".quora.com" } ] },
	LinkedIn: {match: "/linkedin", name: "LinkedIn", websiteUrl: "https://www.linkedin.com/", cookiesList: [{ name: "li_at", domain: ".www.linkedin.com" }]},
	Medium: {match: "/medium", name: "Medium", websiteUrl: "https://www.medium.com", cookiesList: [{ name: "uid", domain: ".medium.com" }, { name: "sid", domain: ".medium.com" }]},
	Pinterest: { match: "/pinterest", name: "Pinterest", websiteUrl: "https://pinterest.com", cookiesList: [{ name: "_pinterest_sess", domain: ".pinterest.com" }] },
	ProductHunt: {match: "/product-hunt", name: "Product Hunt", websiteUrl: "https://www.producthunt.com", cookiesList: [{ name: "_producthunt_session_production", domain: ".producthunt.com" }]},
	Slack: {match: "/slack", name: "Slack", websiteUrl: "https://www.slack.com", cookiesList: [{ name: "d", domain: ".slack.com" }]},
	Twitter: {match: "/twitter", name: "Twitter", websiteUrl: "https://twitter.com/", cookiesList: [{ name: "auth_token", domain: ".twitter.com" }]},
	Uber: {match: "/uber", name: "Uber", websiteUrl: "https://riders.uber.com", cookiesList: [{ name: "csid", domain: ".riders.uber.com"}, { name: "sid", domain: ".uber.com" }]},
	Youtube: {match: "/youtube", name: "Youtube", websiteUrl: "https://www.youtube.com", cookiesList: [{ name: "HSID", domain: ".youtube.com" }, { name: "SID", domain: ".youtube.com"}, { name: "SSID", domain: ".youtube.com"}]},
}
