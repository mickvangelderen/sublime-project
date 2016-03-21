function parseAlwaysAskNever(value) {
	if (/^(always|ask|never)$/.test(value)) return value
	throw new Error(`Invalid value for option, expected always|ask|never but got ${value}.`)
}

export default parseAlwaysAskNever
