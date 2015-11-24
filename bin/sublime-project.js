#!/usr/bin/env node
'use strict';

var _debug = require('debug');

var _debug2 = _interopRequireDefault(_debug);

var _child_process = require('child_process');

var _child_process2 = _interopRequireDefault(_child_process);

var _commander = require('commander');

var _commander2 = _interopRequireDefault(_commander);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _mkdirp = require('mkdirp');

var _mkdirp2 = _interopRequireDefault(_mkdirp);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _package = require('../package.json');

var _package2 = _interopRequireDefault(_package);

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_bluebird2.default.promisifyAll(_fs2.default);
var mkdirpAsync = _bluebird2.default.promisify(_mkdirp2.default);

function parseBoolean(value) {
	return (/^\s*true|yes|1|enabled\s*$/.test(value)
	);
}

_commander2.default.version(_package2.default.version).usage('[path]')
// .option('-i --interactive [value]', 'Ask to confirm the filename when automatically detected (default: true).', parseBoolean, true)
// .option('-f --force [value]', 'Overwrite any existing files (default: false).', parseBoolean, false)
.option('-o --open [value]', 'Open Sublime Text after creating the project file (default: true).', parseBoolean, true).option('-d --debug [value]', 'Print debug messages.').parse(process.argv);

if (_commander2.default.debug) {
	if (_commander2.default.debug === true) _commander2.default.debug = '*';
	_debug2.default.enable(_commander2.default.debug);
}

var dbg = (0, _debug2.default)('sublime-project');

// Determine the directory.
function determinePath(args) {
	if (args.length === 0) {
		// No path argument provided.
		dbg('Defaulting to working directory: ' + process.cwd());
		return { directory: process.cwd() };
	}

	// Path argument was provided.
	var providedPath = args.shift();
	if (/(\\|\/)$/.test(providedPath)) {
		// Passed a directory.
		dbg('Passed a directory path: ' + _path2.default.resolve(providedPath));
		return { directory: _path2.default.resolve(providedPath) };
	} else {
		// Passed a filename.
		dbg('Passed a file path: ' + _path2.default.resolve(providedPath));
		return {
			directory: _path2.default.resolve(_path2.default.dirname(providedPath)),
			filename: _path2.default.basename(providedPath, '.sublime-project')
		};
	}
}

function ensureDirectory(directory) {
	return _fs2.default.statAsync(directory).then(function (stat) {
		if (!stat.isDirectory()) throw new Error(directory + ' is not a directory.');
		return false;
	}, function () {
		dbg('Creating directory ' + directory);
		return mkdirpAsync(directory).then(function () {
			return true;
		});
	});
}

var context = determinePath(_commander2.default.args);

ensureDirectory(context.directory).then(function (created) {
	if (context.filename) return context.filename;
	if (created) return context.directory.split(_path2.default.sep).pop();
	return _bluebird2.default.any([getName('bower.json'), getName('package.json')]).catch(function () {
		return context.directory.split(_path2.default.sep).pop();
	});
	function getName(filename) {
		return _fs2.default.readFileAsync(_path2.default.resolve(context.directory, filename)).then(JSON.parse).then(function (data) {
			return data.name;
		}).then(function (name) {
			return dbg('Using project name ' + name + ' from ' + filename), name;
		});
	}
}).then(function (filename) {
	context.filename = filename;
	context.path = _path2.default.resolve(context.directory, context.filename + '.sublime-project');
	dbg('Checking if ' + context.path + ' exists...');
	return _fs2.default.statAsync(context.path);
}).then(function (stat) {
	// Project file already exists.
	if (!stat.isFile()) throw new Error(context.path + ' is not a file.');
}, function () {
	// Write the project file.
	dbg('Writing new sublime-project file to ' + context.path + '...');
	return _fs2.default.writeFileAsync(context.path, JSON.stringify({
		folders: [{
			follow_symlinks: true,
			path: ".",
			file_exclude_patterns: [],
			folder_exclude_patterns: []
		}]
	}, null, 2));
}).then(function () {
	if (_commander2.default.open) {
		dbg('Opening Sublime Text...');
		_child_process2.default.exec('subl --project "' + context.path + '"');
	}
}).catch(function (error) {
	console.error(error, error.stack);
});