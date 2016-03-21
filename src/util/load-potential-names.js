import all from 'funko/lib/future/all'
import filter from 'funko/lib/filter'
import foldersUpToRoot from './folders-up-to-root'
import identity from 'funko/lib/identity'
import map from 'funko/lib/map'
import pipe from 'funko/lib/pipe'
import readJsonFile from './read-json-file'
import reduce from 'funko/lib/reduce'
import rejected from 'funko/lib/future/rejected'
import resolved from 'funko/lib/future/resolved'
import { basename } from 'path'
import { join } from 'path'

function loadPotentialNames({ folderPath, strategies }) {
	return all(
		strategies
		// [ String ]
		.map(strategyName => {
			if (strategyName === 'folder-name') {
				const projectName = basename(folderPath)
				return resolved([ {
					projectName,
					folderPath,
					strategyName,
					strategyPath: folderPath
				} ])
			}
			if (/\.json$/.test(strategyName)) {
				return loadPotentialJsonNames(folderPath, strategyName)
			}
		})
		// [ Future Error [ Object ] ]
	)
	// Future Error [ [ Object ] ]
	.map(
		// [ [ Object ] ]
		reduce((acc, list) => acc.concat(list), [])
		// [ Object ]
	)
	// Future Error [ Object ]
}

function loadPotentialJsonNames(folderPath, strategyName) {
	return pipe([
		// FolderPath
		foldersUpToRoot,
		// [ FolderPath ]
		map(folder => {
			const strategyPath = join(folder, strategyName)
			
			return readJsonFile('utf-8', strategyPath)
			// Future Error Buffer
			.chainBoth(
				error => error && error.code === 'ENOENT'
					? resolved(null)
					: rejected(error),
				config => resolved(config && config.name
					? ({
						projectName: config.name,
						folderPath,
						strategyName,
						strategyPath
					})
					: null
				)
			)
			// Future Error null|Object
		}),
		// [ Future Error null|Object ]
		all,
		// Future Error [ null|Object ]
		map(filter(identity))
		// Future Error [ Object ]
	])(folderPath)
}

export default loadPotentialNames
