import all from 'funko/lib/future/all'
import getPath from '../util/get-path'
import loadAutoConfigs from '../util/load-auto-configs'
import loadCliConfig from '../util/load-cli-config'
import loadPotentialNames from '../util/load-potential-names'
import map from 'funko/lib/map'
import openProject from '../util/open-project'
import pipe from 'funko/lib/pipe'
import reduce from 'funko/lib/reduce'
import rejected from 'funko/lib/future/rejected'
import resolved from 'funko/lib/future/resolved'
import stat from 'funko-fs/lib/stat'
import toProjectFileName from '../util/to-project-file-name'

export default function(options) {
	return loadCliConfig(options)
	.chain(loadAutoConfigs)
	.chain(determineFileName)
	.chain(openProject)
}

function determineFileName(options) {
	return options.fileName
		? resolved(options)
		: loadPotentialNames(options)
		.chain(findExistingCandidates)
		.chain(fileName => {
			if (fileName) {
				options.fileName = fileName
				return resolved(options)
			} else {
				return rejected(new Error('Unable to find a project to open. Specify a path or different strategies.'))
			}
		})
}

function findExistingCandidates(candidates) {
	return pipe([
		map(({ folderPath, projectName }) => {
			const fileName = toProjectFileName(projectName)
			return stat(getPath({ folderPath, fileName }))
			.chainBoth(
				error => error && error.code === 'ENOENT'
					? resolved(null)
					: rejected(error),
				stat => stat.isFile()
					? resolved(fileName)
					: resolved(null)
			)
		}),
		// [ Future Error null|FileName ]
		all,
		// Future Error [ null|FileName ]
		map(
			// [ null | FileName ]
			reduce(
				(found, next) => found ? found : next
			, null)
			// null | FileName
		)
		// Future Error null | FileName
	])(candidates)
}
