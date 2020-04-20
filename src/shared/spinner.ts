export const getSpinner = () => {
	const svgSpinner = document.createElement("div")
	svgSpinner.className = "absolute spinner btn-spinner"
	svgSpinner.innerHTML = "<svg style=\"width: 23px; height: 23px; margin-right: 1px; opacity: 0.7\"><path fill=\"#A4B9BB\" fill-rule=\"evenodd\" d=\"M13.52 6.114c0 .41-.13.754-.394 1.031-.264.278-.59.416-.98.416s-.716-.138-.98-.416a1.44 1.44 0 0 1-.395-1.031c0-.41.132-.754.395-1.031.264-.278.59-.416.98-.416s.716.138.98.416c.263.277.395.62.395 1.031zm-2.062 9.408c.39 0 .716.139.98.416.264.277.395.621.395 1.031 0 .41-.131.754-.395 1.032-.264.277-.59.416-.98.416s-.716-.139-.98-.416a1.44 1.44 0 0 1-.395-1.032c0-.41.132-.754.396-1.031.263-.277.59-.416.98-.416zm6.875-3.618c0 .41-.131.753-.395 1.03-.264.278-.59.417-.98.417s-.716-.139-.98-.416a1.44 1.44 0 0 1-.395-1.031c0-.41.132-.754.396-1.032.263-.277.59-.416.98-.416.389 0 .715.139.979.416.264.278.395.621.395 1.032zm-11 0c0 .41-.131.753-.395 1.03-.264.278-.59.417-.98.417s-.716-.139-.98-.416a1.44 1.44 0 0 1-.395-1.031c0-.41.132-.754.396-1.032.263-.277.59-.416.98-.416.389 0 .715.139.979.416.264.278.395.621.395 1.032zm0-5.79c.367 0 .688.139.963.416.275.278.412.615.412 1.013 0 .398-.137.742-.412 1.032-.275.289-.602.434-.98.434s-.699-.145-.962-.434a1.48 1.48 0 0 1-.396-1.032c0-.398.132-.735.396-1.013.263-.277.59-.416.98-.416zm8.25 7.96c.39 0 .716.145.98.435.264.29.395.633.395 1.031 0 .398-.131.736-.395 1.013a1.278 1.278 0 0 1-.962.416c-.379 0-.705-.138-.98-.416a1.385 1.385 0 0 1-.413-1.013c0-.398.138-.742.413-1.031.275-.29.596-.434.962-.434zm-8.25 0c.367 0 .688.145.963.435.275.29.412.633.412 1.031 0 .398-.137.736-.412 1.013a1.333 1.333 0 0 1-.98.416c-.378 0-.699-.138-.962-.416a1.417 1.417 0 0 1-.396-1.013c0-.398.132-.742.396-1.031.263-.29.59-.434.98-.434z\"/></svg>"
	return svgSpinner
}