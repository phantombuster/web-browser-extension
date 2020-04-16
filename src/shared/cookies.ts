export const processCookieStr = (cookiesStr: string, prefix: string) => {
	const cookieStrList = cookiesStr.split("; ")
	const newStrList = []

	for (const cookieStr of cookieStrList) {
		if (cookieStr.startsWith(prefix)) {
			newStrList.push(cookieStr.substring(prefix.length, cookieStr.length))
		}
	}
	return newStrList.join("; ")
}

export const processSetCookieStr = (str: string, prefix: string) => {
	const cookieStrList = str.split("\n")
	const newStrList = []

	for (const setCookie of cookieStrList) {
		newStrList.push(`${prefix}${setCookie}`)
	}
	return newStrList.join("\n")
}
