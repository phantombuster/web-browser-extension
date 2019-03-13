// list of websites to get cookies from
const WEBSITEENUM = {
	Facebook: {match: "/facebook", name: "Facebook", domain: ".facebook.com", websiteUrl: "https://www.facebook.com/", cookiesList: [{ name: "c_user", domain: ".facebook.com" }, { name: "xs", domain: ".facebook.com" }]},
	Instagram: {match: "/instagram", name: "Instagram", domain: ".instagram.com", websiteUrl: "https://www.instagram.com/", cookiesList: [{ name: "sessionid", domain: ".instagram.com" }]},
	LinkedIn: {match: "/linkedin", name: "LinkedIn", domain: ".linkedin.com", websiteUrl: "https://www.linkedin.com/", cookiesList: [{ name: "li_at", domain: ".www.linkedin.com" }]},
	Medium: {match: "/medium", name: "Medium", domain: ".medium.com", websiteUrl: "https://www.medium.com", cookiesList: [{ name: "uid", domain: ".medium.com" }, { name: "sid", domain: ".medium.com" }]},
	ProductHunt: {match: "/product-hunt", name: "Product Hunt", domain: ".producthunt.com", websiteUrl: "https://www.producthunt.com", cookiesList: [{ name: "_producthunt_session_production", domain: ".producthunt.com" }]},
	Slack: {match: "/slack", name: "Slack", domain: ".slack.com", websiteUrl: "https://www.slack.com", cookiesList: [{ name: "d", domain: ".slack.com" }]},
	Twitter: {match: "/twitter", name: "Twitter", domain: ".twitter.com", websiteUrl: "https://twitter.com/", cookiesList: [{ name: "auth_token", domain: ".twitter.com" }]},
	Uber: {match: "/uber", name: "Uber", domain: ".uber.com", websiteUrl: "https://riders.uber.com", cookiesList: [{ name: "csid", domain: ".riders.uber.com"}, { name: "sid", domain: ".uber.com" }]},
	Youtube: {match: "/youtube", name: "Youtube", domain: ".youtube.com", websiteUrl: "https://www.youtube.com", cookiesList: [{ name: "HSID", domain: ".youtube.com" }, { name: "SID", domain: ".youtube.com"}, { name: "SSID", domain: ".youtube.com"}]},
}
