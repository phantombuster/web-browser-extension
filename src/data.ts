// list of websites to get cookies from
const WEBSITEENUM = {
	LinkedIn: {match: "/linkedin", name: "LinkedIn", domain: ".linkedin.com", websiteUrl: "https://www.linkedin.com/", cookiesList: ["li_at"]},
	Twitter: {match: "/twitter", name: "Twitter", domain: ".twitter.com", websiteUrl: "https://twitter.com/", cookiesList: ["auth_token"]},
	Instagram: {match: "/instagram", name: "Instagram", domain: ".instagram.com", websiteUrl: "https://www.instagram.com/", cookiesList: ["sessionid"]},
	Facebook: {match: "/facebook", name: "Facebook", domain: ".facebook.com", websiteUrl: "https://www.facebook.com/", cookiesList: ["c_user", "xs"]},
	ProductHunt: {match: "/product-hunt", name: "Product Hunt", domain: ".producthunt.com", websiteUrl: "https://www.producthunt.com", cookiesList: ["_producthunt_session_production"]},
	Medium: {match: "/medium", name: "Medium", domain: ".medium.com", websiteUrl: "https://www.medium.com", cookiesList: ["uid", "sid"]},
	Youtube: {match: "/youtube", name: "Youtube", domain: ".youtube.com", websiteUrl: "https://www.youtube.com", cookiesList: ["HSID", "SID", "SSID"]},
	Slack: {match: "/slack", name: "Slack", domain: ".slack.com", websiteUrl: "https://www.slack.com", cookiesList: ["d"]},
}
