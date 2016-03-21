var path = require('path')

module.exports = function(options) {
	const folderName = path.basename(options.folderPath)
	return {
		folders: [
			{
				follow_symlinks: true,
				path: '.',
				file_exclude_patterns: [],
				folder_exclude_patterns: [
					`${folderName}/lib`,
					`${folderName}/node_modules`
				]
			}
		]
	}
}
