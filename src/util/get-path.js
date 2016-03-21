import { join } from 'path'

function getPath({ folderPath, fileName }) {
	return join(folderPath, fileName)
}

export default getPath
