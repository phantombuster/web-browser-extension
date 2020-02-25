import * as puppeteer from "puppeteer"
import * as path from "path"
import * as dotenv from "dotenv"
import { assert, expect } from "chai"

interface ITestEnv extends NodeJS.ProcessEnv {
	ZAPIER_SESSION?: string
	ZAP_APIS_LIST?: string
	TWITTER_COOKIE?: string
	UID_COOKIE?: string
	SID_COOKIE?: string
}

dotenv.config()

const { ZAPIER_SESSION, ZAP_APIS_LIST, TWITTER_COOKIE, UID_COOKIE, SID_COOKIE }: ITestEnv = process.env
const blacklist = ZAP_APIS_LIST ? ZAP_APIS_LIST.split(",") : []

let browser: puppeteer.Browser

const TIMEOUT = 300000
const EXT_PATH = path.resolve("./")

const bootBrowser = async (): Promise<puppeteer.Page> => {
	browser = await puppeteer.launch({
		headless: false,
		args: [
			`--disable-extensions-except=${EXT_PATH}`,
			`--load-extension=${EXT_PATH}`,
		],
	})
	const page = await browser.newPage()
	await page.setViewport({ width: 1280, height: 800 })
	await page.setCookie({
		name: "zapsession",
		value: ZAPIER_SESSION,
		domain: "zapier.com",
		httpOnly: true,
		secure: true,
	})

	if (TWITTER_COOKIE) {
		await page.setCookie({
			name: "auth_token",
			value: TWITTER_COOKIE,
			domain: ".twitter.com",
			httpOnly: true,
			secure: true,
		})
	}

	if (UID_COOKIE && SID_COOKIE) {
		await page.setCookie({
			name: "uid",
			value: UID_COOKIE,
			domain: ".medium.com",
			httpOnly: true,
			secure: true,
		}, {
			name: "sid",
			value: SID_COOKIE,
			domain: ".medium.com",
			httpOnly: true,
			secure: true,
		})
	}

	return page
}

const removeZapDrafts = async (page: puppeteer.Page): Promise<boolean> => {
	const checkboxSel = "div.select-box"
	const choiceSel = "div.choices-container"
	const draftChoiceSel = `${choiceSel} li.choice:nth-of-type(2) a`
	const trashSel = "div[class*=\"toolbar-col--actions\"] button"

	try {
		await page.goto("https://zapier.com/app/zaps")
		await page.waitForSelector(checkboxSel, { visible: true })
		await page.click(checkboxSel)
		await page.waitForSelector(choiceSel, { visible: true })
		await page.click(draftChoiceSel)
		await page.waitForFunction((sel) => !document.querySelector(sel), {}, draftChoiceSel)
		await page.click(trashSel)
		await page.waitForSelector("div.react-portal-modal", { visible: true })
		await page.click("div.react-portal-modal button:nth-of-type(2)")
	} catch (err) {
		return false
	}
	return true
}

const checkZapLogin = async (page: puppeteer.Page): Promise<boolean> => {
	const sel = "a[href*=\"/app/editor\"]"
	try {
		await page.goto("https://zapier.com")
		await page.waitForSelector(sel, { timeout: 30000, visible: true })
		await page.click(sel)
		await page.waitForNavigation(({ waitUntil: "load" }))
		await page.waitForFunction(() => !!document.querySelector("div#app section[aria-label=\"toolbar\"]"))
	} catch (err) {
		return false
	}
	return true
}

const selectPhantombusterApp = async (page: puppeteer.Page): Promise<boolean> => {
	const trigger = "div.flow-detail-steps div:not([aria-haspopup])[role=button][aria-expanded=false]"
	const appSel = "div.flow-detail-steps div[aria-expanded=\"true\"] > div:nth-of-type(2) div[role=\"presentation\"] input"
	const nextSel = "div.flow-detail-steps div[aria-expanded=\"true\"] > div:nth-of-type(2) div[role=\"presentation\"] button[aria-disabled=false]"
	try {
		await page.waitForSelector(trigger, { visible: true })
		await page.click(trigger)
		await page.waitForSelector(appSel, { visible: true })
		await page.evaluate((sel) => {
			const el = document.querySelector(sel)
			if (el) {
				el.scrollIntoView()
			}
		}, appSel)
		await page.type(appSel, "Phantombuster", { delay: 50 })
		await page.click("div[role=menuitem]")
		await page.waitForFunction((sel: string) => {
			const el = document.querySelector(sel)
			// @ts-ignore
			return el ? !el.disabled : false
		}, {}, nextSel)
		await page.click(nextSel)
		await page.waitForResponse((r) => r.url().indexOf("/graphql") > -1, { timeout: 15000 })
	} catch (err) {
		return false
	}
	return true
}

const selectPhantombusterAccount = async (page: puppeteer.Page): Promise<boolean> => {
	const accountSel = "div.flow-detail-steps div[aria-expanded=\"true\"] > div:nth-of-type(2) div[role=\"presentation\"]"
	// last element is to add an auth so we need to select the last before this element
	const keySel = `${accountSel} ul li:nth-last-of-type(2)`
	try {
		await page.waitForSelector(`${accountSel} div[role=none]`, { visible: true })
		await page.click(`${accountSel} div[role=none]`)
		await page.waitForFunction((sel) => !!document.querySelector(sel), { }, keySel)
		await page.click(keySel)
		await page.waitForResponse((r) => r.url().indexOf("https://zapier.com/api/v3/auths/") > -1)
		await page.waitForFunction(() => {
			const sel = "div.flow-detail-steps div[aria-expanded=\"true\"] > div:nth-of-type(2) div[role=\"presentation\"] button"
			const el = document.querySelector(sel)
			if (el) {
				return el.getAttribute("aria-disabled") === "false"
			}
			return false
		})
	} catch (err) {
		console.log(err)
		return false
	}
	return true
}

const getPhantomChoice = (baseSel: string, phantomName: string): number|null => {
	const sel = `${baseSel} div.choices-container ul li.choice`
	const nameSel = "span.choice-label span span"
	const idx = Array.from(document.querySelectorAll(sel)).findIndex((el) => {
		const tmp = el.querySelector(nameSel)
		if (tmp && tmp.textContent) {
			return tmp.textContent.trim() === phantomName
		}
		return false
	})
	return idx < 0 ? null : idx
}

const testOnePhantom = async (page: puppeteer.Page, phantom: string, firstUse = false): Promise<boolean> => {
	const baseSel = "div.flow-detail-steps div[aria-expanded=\"true\"] > div:nth-of-type(2) div[role=\"presentation\"]"
	const nextSel = `${baseSel} button[aria-disabled=false]`
	const mainSel = `${baseSel} div.flowform`
	const ddSel = `${mainSel} fieldset:first-of-type div[role=listbox] div`
	const phantomDropdown = `${mainSel} fieldset:first-of-type div[role=listbox]`
	const OK = 200

	try {
		if (firstUse) {
			await page.click(nextSel)
			await page.waitForSelector(mainSel, { visible: true })
		}
		await page.waitForSelector(`${baseSel} fieldset:first-of-type div[role=listbox]`, { visible: true })
		await page.click(ddSel)
		await page.waitForSelector(`${ddSel} input`, { visible: true })
		await page.type(`${ddSel} input`, phantom)
		// await page.waitForResponse((r) => r.url().indexOf("/samples/list_api?") > -1)
		const choice = await page.evaluate(getPhantomChoice, phantomDropdown, phantom)
		assert(typeof choice === "number", `We can't find the ${phantom} with the current Phantombuster API key`)
		await page.click(`${phantomDropdown} ul li.choice:nth-of-type(${choice + 1}) a`)
		const r = await page.waitForResponse((resp) => resp.url().indexOf("/needs") > -1)
		assert(r.status() === OK, `We can't find the ${phantom} configuration schema`)
		await Promise.all([
			page.waitForSelector(`${mainSel} fieldset.child-fields-group`, { visible: true }),
			page.waitForSelector("button[id*=\"zapierPbExtension\"]", { visible: true }),
		])
	} catch (err) {
		console.log(err)
		return false
	}
	return true
}

describe("Cookies extension E2E tests on Zapier", async function() {
	this.timeout(TIMEOUT)
	let page: puppeteer.Page

	/* tslint:disable:next-line: only-arrow-functions */
	before(async function() {
		page = await bootBrowser()
		return
	})

	it("should have initialized puppeteer & logged in Zapier", async () => {
		expect(browser).to.not.eq(null)
		expect(page).to.not.eq(null)
		const isLoggedIn = await checkZapLogin(page)
		assert(isLoggedIn === true, "Not logged in Zapier")
	})

	it("should have selected Phantombuster app in the new Zap", async () => {
		const res = await selectPhantombusterApp(page)
		assert(res === true, "Phantombuster is not selected in Zap configuration")
	})

	it("should select the correct Phantombuster key", async () => {
		const res = await selectPhantombusterAccount(page)
		assert(res === true, "No Phantombuster accounts selected")
	})

	it("should test all Phantoms availables", async () => {
		let firstUse = true
		let i = 1
		for (const phantom of blacklist) {
			console.log("[%d] %s", i, phantom)
			const res = await testOnePhantom(page, phantom, firstUse)
			assert(res === true, `Test failed for ${phantom}`)
			firstUse = false
			i++
		}
	})

	after(async function() {
		const res = await removeZapDrafts(page)
		assert(res === true, "Drafted Zaps weren't removed")
		await page.close()
		await browser.close()
	})
})
