import { browser } from "webextension-polyfill-ts"

const headElement = (document.head || document.documentElement)

export const injectJsFile = (fileName: string) => {
	const s = document.createElement("script")
	s.src = browser.extension.getURL(fileName)
	headElement.insertBefore(s, headElement.firstElementChild)
}

export const injectJs = (content: string) => {
	const s = document.createElement("script")
	s.textContent = content
	headElement.insertBefore(s, headElement.firstElementChild)
}

export const injectFunction = (func: (vals: string[]) => void, vals: string[]) => {
	const s = document.createElement("script")
	s.textContent = `(${func})(${JSON.stringify(vals)});`
	headElement.insertBefore(s, headElement.firstElementChild)
}
