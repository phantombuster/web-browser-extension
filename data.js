// list of websites to get cookies from
const WebsiteEnum = {
	LinkedIn: {name: "LinkedIn", domain: ".linkedin.com", websiteUrl: "https://www.linkedin.com/", cookiesList: ["li_at"]},
	Twitter: {name: "Twitter", domain: ".twitter.com", websiteUrl: "https://twitter.com/", cookiesList: ["auth_token"]},
	Instagram: {name: "Instagram", domain: ".instagram.com", websiteUrl: "https://www.instagram.com/", cookiesList: ["sessionid"]},
	Facebook: {name: "Facebook", domain: ".facebook.com", websiteUrl: "https://www.facebook.com/", cookiesList: ["c_user", "xs"]},
	ProductHunt: {name: "Product Hunt", domain: ".producthunt.com", websiteUrl: "https://www.producthunt.com", cookiesList: ["_producthunt_session_production"]}
}