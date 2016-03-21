import { dirname } from 'path'

function foldersUpToRoot(folderPath) {
	const folders = [ folderPath ]
	let parent
	while ((parent = dirname(folderPath)) !== folderPath) {
		folderPath = parent	
		folders.push(folderPath)
	}
	return folders
}

export default foldersUpToRoot
