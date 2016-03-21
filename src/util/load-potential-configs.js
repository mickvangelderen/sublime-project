import all from 'funko/lib/future/all'
import readJsonFile from './read-json-file'
import map from 'funko/lib/map'
import mergeConfigs from './merge-configs'
import pipe from 'funko/lib/pipe'
import rejected from 'funko/lib/future/rejected'
import resolved from 'funko/lib/future/resolved'

const loadPotentialConfigs = (paths) => pipe([
	// [ FilePath ]
	map(path => 
		// FilePath
		readJsonFile('utf-8', path)
		// Future Error Object
		.chainLeft(error => error && error.code === 'ENOENT'
			? resolved({})
			: rejected(error)
		)
		// Future Error Object
	),
	// [ Future Error Object ]
	all,
	// Future Error [ Object ]
	map(mergeConfigs)
	// Future Error Object
])(paths)

export default loadPotentialConfigs
