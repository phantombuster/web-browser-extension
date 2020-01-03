// list of websites to get cookies from
const WEBSITEENUM = {
    Facebook: { match: "/facebook", name: "Facebook", websiteUrl: "https://www.facebook.com/", cookiesList: [{ name: "c_user", domain: ".facebook.com" }, { name: "xs", domain: ".facebook.com" }] },
    GitHub: { match: "/github", name: "GitHub", websiteUrl: "https://github.com/", cookiesList: [{ name: "user_session", domain: "github.com" }] },
    Instagram: { match: "/instagram", name: "Instagram", domain: ".instagram.com", websiteUrl: "https://www.instagram.com/", cookiesList: [{ name: "sessionid", domain: ".instagram.com" }] },
    Intercom: { match: "/intercom", name: "Intercom", websiteUrl: "https://app.intercom.io", cookiesList: [{ name: "_intercom_session", domain: "app.intercom.io" }] },
    Quora: { match: "/quora", name: "Quora", websiteUrl: "https://quora.com", cookiesList: [{ name: "m-b", domain: ".quora.com" }] },
    LinkedIn: { match: "/linkedin", name: "LinkedIn", websiteUrl: "https://www.linkedin.com/", cookiesList: [{ name: "li_at", domain: ".www.linkedin.com" }] },
    Medium: { match: "/medium", name: "Medium", websiteUrl: "https://www.medium.com", cookiesList: [{ name: "uid", domain: ".medium.com" }, { name: "sid", domain: ".medium.com" }] },
    ProductHunt: { match: "/product-hunt", name: "Product Hunt", websiteUrl: "https://www.producthunt.com", cookiesList: [{ name: "_producthunt_session_production", domain: ".producthunt.com" }] },
    Slack: { match: "/slack", name: "Slack", websiteUrl: "https://www.slack.com", cookiesList: [{ name: "d", domain: ".slack.com" }] },
    Twitter: { match: "/twitter", name: "Twitter", websiteUrl: "https://twitter.com/", cookiesList: [{ name: "auth_token", domain: ".twitter.com" }] },
    Uber: { match: "/uber", name: "Uber", websiteUrl: "https://riders.uber.com", cookiesList: [{ name: "csid", domain: ".riders.uber.com" }, { name: "sid", domain: ".uber.com" }] },
    Youtube: { match: "/youtube", name: "Youtube", websiteUrl: "https://www.youtube.com", cookiesList: [{ name: "HSID", domain: ".youtube.com" }, { name: "SID", domain: ".youtube.com" }, { name: "SSID", domain: ".youtube.com" }] },
};
//# sourceMappingURL=data.js.map