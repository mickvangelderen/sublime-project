import Future from 'funko/lib/future'
import { exec } from 'child_process'
import getPath from './get-path'

function openProject(options) {
	return Future((reject, resolve) =>
		exec(`subl --project "${getPath(options)}"`, 
			(error, stdout, stderr) => error
				? reject(error)
				: resolve({ stdout, stderr })
		)
	)
}

export default openProject
