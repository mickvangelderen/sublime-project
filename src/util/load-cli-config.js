import mergeConfigs from './merge-configs'
import readJsonFile from './read-json-file'
import resolved from 'funko/lib/future/resolved'

function loadCliConfig(options) {
	return options.configPath
		? readJsonFile('utf-8', options.configPath)
		.map(newOptions => mergeConfigs([ newOptions, options ]))
		: resolved(options)
}

export default loadCliConfig
