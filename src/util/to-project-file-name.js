import { basename } from 'path'

function toProjectFileName(projectName) {
	return `${basename(projectName, '.sublime-project')}.sublime-project`
}

export default toProjectFileName
