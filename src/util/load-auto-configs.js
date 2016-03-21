import foldersUpToRoot from './folders-up-to-root'
import loadPotentialConfigs from './load-potential-configs'
import mergeConfigs from './merge-configs'
import { join } from 'path'

function loadAutoConfigs(options) {
	return loadPotentialConfigs(
		foldersUpToRoot(options.folderPath)
		.reverse()
		.map(folder => join(folder, 'sublime-project.config.json'))
	)
	.map(newOptions => mergeConfigs([ newOptions, options ]))
}

export default loadAutoConfigs
