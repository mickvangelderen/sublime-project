import all from 'funko/lib/future/all'
import clone from 'clone'
import deepEqual from 'deep-equal'
import filter from 'funko/lib/filter'
import identity from 'funko/lib/identity'
import map from 'funko/lib/map'
import pipe from 'funko/lib/pipe'
import prompt from '../util/prompt'
import readJsonFile from '../util/read-json-file'
import rejected from 'funko/lib/future/rejected'
import resolved from 'funko/lib/future/resolved'
import stat from 'funko-fs/lib/stat'
import writeFile from 'funko-fs/lib/write-file'
import { homedir } from 'os'
import { join } from 'path'
import { type } from 'os'

export default function(options) {

	const home = homedir()

	const folders = {
		'Windows NT': [
			`${home}\AppData\Roaming\Sublime Text 2\Settings`,
			`${home}\AppData\Roaming\Sublime Text 2\Local`,
			`${home}\AppData\Roaming\Sublime Text 3\Settings`,
			`${home}\AppData\Roaming\Sublime Text 3\Local`,
			`C:\Program Files\Sublime Text 2\Data\Settings`,
			`C:\Program Files\Sublime Text 2\Data\Local`,
			`C:\Program Files\Sublime Text 3\Data\Settings`,
			`C:\Program Files\Sublime Text 3\Data\Local`
		],
		'Darwin': [
			`${home}/Library/Application Support/Sublime Text 2/Settings`,
			`${home}/Library/Application Support/Sublime Text 3/Local`
		],
		'Linux': [
			`${home}/.config/sublime-text-2/Settings`,
			`${home}/.config/sublime-text-2/Local`,
			`${home}/.config/sublime-text-3/Settings`,
			`${home}/.config/sublime-text-3/Local`
		]
	}

	const candidates = folders[type()]
		|| Object.keys(folders)
		.map(type => folders[type])
		.reduce((li, st) => li.concat(st), [])

	if (options.dataFolder) candidates.push(options.dataFolder)

	return pipe([
		// [ FolderPath ]
		map(folder => {
			// FolderPath
			const path = join(folder, 'Session.sublime_session')
			return readJsonFile('utf-8', path)
			// Future Error Object
			.chainBoth(
				error => error && error.code === 'ENOENT'
					? resolved({ path, contents: null, status: 'does-not-exist' })
					: rejected(error),
				contents => resolved({ path, contents, status: 'exists' })
			)
			.chain(cleanContents)
			// Future Error { path, contents, status }
			.chain(({ path, contents, status }) => status === 'changed'
				? maybePromptClose(options)
				.chain(() => writeFile('utf-8', path, JSON.stringify(contents, null, '\t')))
				.map(() => ({ path, contents, status }))
				: resolved({ path, contents, status })
			)
		}),
		// [ Future Error null|{ path, contents, status } ]
		all,
		// Future Error [ null|{ path, contents, status } ]
		map(filter(identity))
	])(candidates)
	// Future Error [ ]
}

function cleanContents({ path, contents, status }) {
	if (status === 'does-not-exist') return resolved({ path, contents, status })
	if (!(contents && contents.workspaces && contents.workspaces.recent_workspaces)) return resolved({ path, contents, status: 'no-changes' })

	return pipe([
		// [ FilePath ]
		map(path =>
			stat(path)
			.chainBoth(
				error => error && error.code === 'ENOENT'
					? resolved(null)
					: rejected(error),
				() => resolved(path)
			)
		),
		// [ Future Error null|Filepath ]
		all,
		// Future Error [ null|FilePath ]
		map(pipe([
			// [ null|FilePath ]
			filter(identity),
			// [ FilePath ]
			recent_workspaces => {
				if (deepEqual(recent_workspaces, contents.workspaces.recent_workspaces)) {
					return { path, contents, status: 'no-changes' }
				} else {
					const c = clone(contents)
					c.workspaces.recent_workspaces = recent_workspaces
					return { path, contents: c, status: 'changed' }
				}
			}
			// { path, contents, status }
		]))
		// Future Error { path, contents, status }
	])(contents.workspaces.recent_workspaces)
	// Future Error [ { path, contents, status } ]
}

function maybePromptClose(options) {
	return options.reminder
		? prompt([
			{
				type: 'input',
				name: 'closed',
				message: 'Please ensure Sublime Text is not running!'
			}
		])
		: resolved()
}
