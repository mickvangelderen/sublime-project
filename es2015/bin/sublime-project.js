#!/usr/bin/env node

import debug from 'debug'
import childProcess from 'child_process'
import commander from 'commander'
import fs from 'fs'
import mkdirp from 'mkdirp'
import path from 'path'
import pkg from '../package.json'
import Promise from 'bluebird'

Promise.promisifyAll(fs)
const mkdirpAsync = Promise.promisify(mkdirp)

function parseBoolean(value) {
	return /^\s*true|yes|1|enabled\s*$/.test(value)
}

commander
	.version(pkg.version)
	.usage('[path]')
	// .option('-i --interactive [value]', 'Ask to confirm the filename when automatically detected (default: true).', parseBoolean, true)
	// .option('-f --force [value]', 'Overwrite any existing files (default: false).', parseBoolean, false)
	.option('-o --open [value]', 'Open Sublime Text after creating the project file (default: true).', parseBoolean, true)
	.option('-d --debug [value]', 'Print debug messages.')
	.parse(process.argv)

if (commander.debug) {
	if (commander.debug === true) commander.debug = '*'
	debug.enable(commander.debug)
}

const dbg = debug('sublime-project')

// Determine the directory.
function determinePath(args) {
	if (args.length === 0) {
		// No path argument provided.
		dbg('Defaulting to working directory: ' + process.cwd())
		return { directory: process.cwd() }
	}

	// Path argument was provided.
	const providedPath = args.shift()
	if (/(\\|\/)$/.test(providedPath)) {
		// Passed a directory.
		dbg('Passed a directory path: ' + path.resolve(providedPath))
		return { directory: path.resolve(providedPath) }
	} else {
		// Passed a filename.
		dbg('Passed a file path: ' + path.resolve(providedPath))
		return {
			directory: path.resolve(path.dirname(providedPath)),
			filename: path.basename(providedPath, '.sublime-project')
		}
	}
}

function ensureDirectory(directory) {
	return fs.statAsync(directory)
	.then(stat => {
		if (!stat.isDirectory()) throw new Error(directory + ' is not a directory.')
		return false
	}, () => {
		dbg('Creating directory ' + directory)
		return mkdirpAsync(directory).then(() => true)
	})
}

const context = determinePath(commander.args)

ensureDirectory(context.directory)
.then(created => {
	if (context.filename) return context.filename
	if (created) return context.directory.split(path.sep).pop()
	return Promise.any([ getName('bower.json'), getName('package.json') ])
		.catch(() => context.directory.split(path.sep).pop())
	function getName(filename) {
		return fs.readFileAsync(path.resolve(context.directory, filename))
			.then(JSON.parse)
			.then(data => data.name)
			.then(name => (dbg('Using project name ' + name + ' from ' + filename), name))
	}
})
.then(filename => {
	context.filename = filename
	context.path = path.resolve(context.directory, context.filename + '.sublime-project')
	dbg('Checking if ' + context.path + ' exists...')
	return fs.statAsync(context.path)
})
.then(stat => {
	// Project file already exists.
	if (!stat.isFile()) throw new Error(context.path  + ' is not a file.')
}, () => {
	// Write the project file.
	dbg('Writing new sublime-project file to ' + context.path + '...')
	return fs.writeFileAsync(context.path, JSON.stringify({
		folders: [{
			follow_symlinks: true,
			path: ".",
			file_exclude_patterns: [],
			folder_exclude_patterns: []
		}]
	}, null, 2))
})
.then(() => {
	if (commander.open) {
		dbg('Opening Sublime Text...')
		childProcess.exec('subl --project "' + context.path + '"')
	}
})
.catch(error => {
	console.error(error, error.stack)
})
