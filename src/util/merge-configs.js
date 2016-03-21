const mergeConfigs = configs =>
	configs.reduce((generic, detail) => Object.assign(generic, detail), {})

export default mergeConfigs
