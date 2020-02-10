import * as puppeteer from "puppeteer"
import * as path from "path"
import { assert, expect } from "chai"
import * as dotenv from "dotenv"
import { URL } from "url"

interface IAgentOutput {
	id: string
	name: string
	script: string
	scriptOrgName: string
}

interface ITestEnv extends NodeJS.ProcessEnv {
	PB_SESSION?: string
	PB_ORGNAME?: string
	PB_APIS_BACKLIST?: string
}

dotenv.config()

const { PB_SESSION, PB_APIS_BACKLIST, PB_ORGNAME }: ITestEnv = process.env

const blacklist = PB_APIS_BACKLIST ? PB_APIS_BACKLIST.split(",") : []
const testCandidates: IAgentOutput[] = []

let browser: puppeteer.Browser
let page: puppeteer.Page

const TIMEOUT = 300000
const EXT_PATH = path.resolve("./")

const bootBrowser = async () => {
	browser = await puppeteer.launch({
		headless: false,
		args: [
			`--disable-extensions-except=${EXT_PATH}`,
			`--load-extension=${EXT_PATH}`,
		],
	})
	page = await browser.newPage()
	await page.setCookie({
		name: "session",
		value: PB_SESSION,
		domain: "api.phantombuster.com",
	})
}

const getAllPhantomsFromCurrentOrg = () => {
	const org = localStorage["pb:currentOrgId"]
	return new Promise((resolve, reject) => {
		fetch("https://api.phantombuster.com/api/v2/agents/fetch-all?exclude=modules", {
			credentials: "include",
			headers: { "x-phantombuster-org": org },
			method: "GET",
			mode: "cors",
		})
			.then((d) => {
				if (!d.ok) {
					return reject(d.statusText)
				}
				d.json().then((j) => resolve(j))
			})
			.catch(reject)
	})
}

const fillTestCandidates = async (_page: puppeteer.Page): Promise<IAgentOutput[]> => {
	const res = []
	let phantoms = await _page.evaluate(getAllPhantomsFromCurrentOrg) as IAgentOutput[]
	phantoms = phantoms.filter((p) => p.scriptOrgName === PB_ORGNAME)

	for (const phantom of phantoms) {
		const idx = blacklist.findIndex((el) => !!phantom.script.toLowerCase().match(el.toLowerCase()))
		if (idx < 0) {
			res.push(phantom)
		}
	}
	return res
}

const gotoSpecificOrg = (org: string) => {
	const el = document.querySelector("div[analyticsid=\"navMenu\"]")
	if (!el) {
		throw Error("No navbar found")
	}
	const orgs = document.querySelectorAll<HTMLLIElement>("li[data-id]")
	const idx = Array.from(orgs).findIndex((li) => li.textContent.toLowerCase() === org.toLowerCase())
	if (idx > -1) {
		orgs.item(idx).click()
		return
	}
	throw new Error(`No ${org} org found`)
}

const checkPBLogin = async (_page: puppeteer.Page): Promise<boolean> => {
	const baseSel = "div[analyticsid=\"navMenu\"]"
	const myPhantomSel = "a[analyticsid=\"navMyPhantomsLink\"]"
	await _page.goto("https://phantombuster.com")
	try {
		await _page.waitForSelector(baseSel, { visible: true })
		const name = await _page.evaluate((sel) => {
			const el = document.querySelector(`${sel} > div:first-of-type span`)
			if (sel) {
				return el.textContent
			}
			throw new Error("Can't determine if login was successful on Phantombuster")
		}, baseSel)
		console.log("Connected as %s!", name)
		await page.click(baseSel)
		await page.evaluate(gotoSpecificOrg, PB_ORGNAME)
		await page.waitForSelector("div.phantom-card,div.social-card", { visible: true })
		await page.click(myPhantomSel)
		await page.waitForSelector("div.phantom-card", { visible: true })
		console.log("In \"My Phantoms\" page")
	} catch (err) {
		// tslint:disable-next-line: no-console
		console.error("Error while PB login procedure: %s", err.message || err)
		return false
	}
	return true
}

const gotoAgent = async (_page: puppeteer.Page, agent: IAgentOutput): Promise<boolean> => {
	const getNetworkFromExtButton = () => {
		const el = document.querySelector("#pbExtensionButton")
		if (!el) {
			throw new Error("No extension button found")
		}
		const txt = el.textContent
		return txt.split(" ").pop().trim().toLowerCase()
	}

	let navUrl: string

	try {
		const tmp = new URL(_page.url())
		tmp.pathname += `/${agent.id}/setup`
		navUrl = tmp.toString()
	} catch (err) {
		return false
	}

	try {
		await page.goto(navUrl)
		await _page.waitForSelector("div#alpaca-form,div#brace-editor", { visible: true })
		const isJSON = await _page.$("div#brace-editor")
		if (!!isJSON) {
			const switchSel = "li[analyticsid=\"agentSetupInputEditorSwitchLink\"]"
			await _page.click("svg.dropdown")
			await _page.waitForSelector(switchSel, { visible: true })
			await _page.click(switchSel)
		}
		await _page.waitForSelector("#pbExtensionButton", { visible: true })
		const network = await page.evaluate(getNetworkFromExtButton)
		assert(agent.script.toLowerCase().indexOf(network) > -1, `Extension gives cookies from ${network} for ${agent.script}`)
	} catch (err) {
		return false
	}
	await page.goBack()
	return true
}

describe("Phantombuster cookies extension E2E tests", async function() {
	this.timeout(TIMEOUT)
	/* tslint:disable:next-line: only-arrow-functions */
	before(async function() { return bootBrowser() })

	it("should have initialized puppeteer & connect into a PB account", async () => {
		expect(browser).to.not.eq(null)
		expect(page).to.not.eq(null)
		const isLoggedIn = await checkPBLogin(page)
		assert(isLoggedIn === true, "not logged in Phantombuster")
	})

	it("should have at least one Phantom to test in the current Phantombuster Org", async () => {
		assert(testCandidates.length === 0, "Clean testCandidates variables before testing Phantoms")
		testCandidates.push(...await fillTestCandidates(page))
		assert(testCandidates.length > 0, "At least ONE Phantom is required to continue tests")
	})

	it("should open & test Phantoms with successful result", async () => {
		console.log("Testing %d Phantoms", testCandidates.length)
		let i = 1
		for (const test of testCandidates) {
			console.log("[%d] Testing %s/%s", i, test.name, test.script)
			const isValid = await gotoAgent(page, test)
			assert(isValid === true, `Failure with agent ${test.name}`)
			i++
		}
	})

	after(async function() {
		await page.close()
		await browser.close()
	})
})
