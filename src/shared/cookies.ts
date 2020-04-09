export const processCookieStr = (cookiesStr: string, prefix: string) => {
	const cookieStrList = cookiesStr.split("; ")
	const newStrList: string[] = []

	for (const cookieStr of cookieStrList) {
		if (cookieStr.startsWith(prefix)) {
			newStrList.push(cookieStr.substring(prefix.length, cookieStr.length))
		}
	}
	return newStrList.join("; ")
}

export const processSetCookieStr = (str: string, prefix: string) => {
	return prefix + str
}
