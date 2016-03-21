import curry from 'funko/lib/curry'

const project = curry(2, (keys, object) => 
	keys.reduce((o, k) => {
		if (typeof object[k] !== 'undefined') o[k] = object[k]
		return o
	}, {})
)

export default project
