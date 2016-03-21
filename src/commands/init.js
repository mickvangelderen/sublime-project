import getPath from '../util/get-path'
import group from 'funko/lib/group'
import loadAutoConfigs from '../util/load-auto-configs'
import loadCliConfig from '../util/load-cli-config'
import loadPotentialNames from '../util/load-potential-names'
import mkdirp from 'funko-fs/lib/mkdirp'
import openProject from '../util/open-project'
import prompt from '../util/prompt'
import rejected from 'funko/lib/future/rejected'
import resolved from 'funko/lib/future/resolved'
import stat from 'funko-fs/lib/stat'
import toProjectFileName from '../util/to-project-file-name'
import writeFile from 'funko-fs/lib/write-file'
import { basename } from 'path'

export default function(options) {
	return loadCliConfig(options)
	.chain(loadAutoConfigs)
	.chain(determineFileName)
	.chain(maybeWriteProjectFile)
	.chain(maybeOpenProject)
}

function determineFileName(options) {
	return options.fileName
		? resolved(options)
		: loadPotentialNames(options)
		.chain(promptCandidates)
		.map(fileName => {
			options.fileName = fileName
			return options
		})
}

function maybeWriteProjectFile(options) {
	const path = getPath(options)
	
	return mkdirp(null, options.folderPath)
	.chain(() => stat(path))
	.chainBoth(
		error => error && error.code === 'ENOENT'
			? writeProjectFile(options)
			: rejected(error),
		stat => stat.isFile()
			? maybeOverWriteProjectFile(options)
			: rejected(new Error(`${path} does not point to a file.`))
	)
}

function maybeOverWriteProjectFile(options) {
	switch(options.force) {
	case 'always':
		return writeProjectFile(options)
	case 'never':
		return resolved(options)
	default:
		return promptOverwrite(getPath(options))
		.chain(overwrite => overwrite
			? writeProjectFile(options)
			: resolved(options)
		)
	}
}

function writeProjectFile(options) {
	const path = getPath(options)

	const settings = options.templatePath
		? require(options.templatePath)(options)
		: {
			folders: [
				{
					follow_symlinks: true,
					path: '.',
					file_exclude_patterns: [],
					folder_exclude_patterns: []
				}
			]
		}

	const contents = typeof settings === 'string'
		? settings
		: JSON.stringify(settings, null, 2)
	
	return writeFile('utf-8', path, contents)
	.map(() => options)
}

function maybeOpenProject(options) {
	switch(options.open) {
	case 'always':
		return openProject(options)
	case 'never':
		return resolved(options)
	default:
		return promptOpen(getPath(options))
		.chain(open => open
			? openProject(options)
			: resolved(options)
		)
	}
}

function promptCandidates(candidates) {
	const nameToCandidates = group(candidate => candidate.projectName, candidates)
	const choices = Object.keys(nameToCandidates)
	.map(projectName => {
		const candidate = nameToCandidates[projectName][0]
		return {
			name: `${projectName} (from ${candidate.strategyName})`,
			short: projectName,
			value: toProjectFileName(projectName)
		}
	})

	switch (choices.length) {
	case 0:
		return promptProjectName()
	case 1:
		return prompt([
			{
				type: 'confirm',
				name: 'use',
				message: `Would you like to use ${choices[0].short} as the project name?`
			}
		])
		.chain(result => result.use
			? resolved(choices[0].value)
			: promptProjectName()
		)
	default:
		return prompt([
			{
				type: 'list',
				name: 'fileName',
				message: 'Which name would you like to use?',
				choices: choices.concat([
					{
						name: `Something else entirely`,
						short: `Something else entirely`,
						value: null
					}
				])
			}
		])
		.chain(result => result.fileName
			? resolved(result.fileName)
			: promptProjectName()
		)
	}
}

function promptProjectName() {
	return prompt([
		{ type: 'input', name: 'fileName', message: 'Please enter the desired project name:' }
	])
	.map(result => `${basename(result.fileName, '.sublime-project')}.sublime-project`)
}

function promptOverwrite(path) {
	return prompt([
		{
			type: 'confirm',
			name: 'overwrite',
			message: `Would you like to overwrite ${path}?`,
			default: false
		}
	]).map(result => result.overwrite)
}

function promptOpen(path) {
	return prompt([
		{
			type: 'confirm',
			name: 'open',
			message: `Would you like to open ${path}?`,
			default: true
		}
	]).map(result => result.open)
}
