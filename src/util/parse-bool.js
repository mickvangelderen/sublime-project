function parseBool(value) {
	return /^\s*t|true|y|yes|1|on|enabled\s*$/.test(value)
}

export default parseBool
