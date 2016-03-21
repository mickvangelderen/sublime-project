import curry from 'funko/lib/curry'
import readFile from 'funko-fs/lib/read-file'
import wrapCatchable from 'funko/lib/future/wrap-catchable'

const readJsonFile = curry(2, (options, path) =>
	// FilePath
	readFile(options, path)
	// Future Error Buffer
	.chain(
		wrapCatchable(buffer => JSON.parse(buffer))
	)
	// Future Error Object
)

export default readJsonFile
