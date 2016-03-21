/* eslint-disable no-console */
import clean from './commands/clean'
import commander from 'commander'
import init from './commands/init'
import log from './util/log'
import mergeConfigs from './util/merge-configs'
import open from './commands/open'
import parseAlwaysAskNever from './util/parse-always-ask-never'
import parseList from './util/parse-list'
import project from './util/project'
import { basename } from 'path'
import { dirname } from 'path'
import { resolve } from 'path'
import { version } from '../package.json'

commander
	.version(version)
	.option('-c, --config-path <path>', 'Use a specified config file (default: none).')

commander
	.command('init [path]')
	.description('Create a sublime-project file.')
	.option('-f --force <value>', 'Overwrite file when it already exists (default: ask).', parseAlwaysAskNever)
	.option('-o --open <value>', 'Open project afterwards (default: always).', parseAlwaysAskNever)
	.option('-s --strategies <list>', 'Specify the strategies to use and in what order when determining the project name (default: "package.json folder-name").', parseList)
	.action(initAction)

commander
	.command('open [path]')
	.description('Open a sublime-project file.')
	.option('-s --strategies <list>', 'Specify the strategies to use and in what order when determining the project name (default: "package.json folder-name").', parseList)
	.action(openAction)

commander
	.command('clean')
	.description('Remove references to deleted projects.')
	.option('--sublime-text-data-folder <path>', 'Specify the user data folder path of Sublime Text.', parseList)
	.action(cleanAction)

commander.parse(process.argv)

if (commander.args.length === 0) commander.help()

function initAction(path, commander) {
	if (arguments.length > 2) throw new Error('Received too many arguments')

	const defaults = {
		force: 'ask',
		open: 'always',
		strategies: [ 'package.json', 'bower.json', 'folder-name' ]
	}

	const context = path
		? /[\\/]$/.test(path)
			? { folderPath: resolve(path) }
			: {
				folderPath: resolve(dirname(path)),
				fileName: `${basename(path, '.sublime-project')}.sublime-project`
			}
		: { folderPath: process.cwd() }

	const options = mergeConfigs([
		defaults,
		context,
		project([
			'configPath'
		], commander.parent || commander),
		project([
			'force',
			'open',
			'strategies'
		], commander)
	])

	init(options)
	.fork(log.error, () => {})
}

function openAction(path, commander) {
	if (arguments.length > 2) throw new Error('Received too many arguments')

	const defaults = {
		strategies: [ 'package.json', 'bower.json', 'folder-name' ]
	}

	const context = path
		? /[\\/]$/.test(path)
			? { folderPath: resolve(path) }
			: {
				folderPath: resolve(dirname(path)),
				fileName: `${basename(path, '.sublime-project')}.sublime-project`
			}
		: { folderPath: process.cwd() }

	const options = mergeConfigs([
		defaults,
		context,
		project([
			'configPath'
		], commander.parent || commander),
		project([
			'strategies'
		], commander)
	])

	open(options)
	.fork(log.error, () => {})
}

function cleanAction(commander) {
	clean(commander)
}
