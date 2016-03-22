var path = require('path')

/*
For node projects I like to exclude generated or downloaded folders. However, 
sometimes I have a nested folder with the same name that I would like to see. 
Sublime Text matches the folder_exclude_patterns on the absolute folder paths.
To exclude a directory relative to the project root we can specify the absolute
path but that makes the file more difficult to read for humans. As a compromise
we can specify a "unique enough" path, for example "project-folder/lib". This 
keeps the sublime-project file maintainable by hand. 
*/

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
