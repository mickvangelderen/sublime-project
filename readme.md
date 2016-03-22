# Usage guide

This guide is for people who want to use NODE_PACKAGE_SKELETON_NAME. 

Other guides:
* [Development guide](development.md)

## Install

Use sublime-project as a command line tool by installing it globally:

```
npm install --global sublime-project
```

## Usage

Check out the available commands by running:

### init

The main purpose of `sublime-project init` is to create a `project-name.sublime-project` file. You can specify a path and name for the project, let it overwrite existing projects and immediately open the project if you so desire. 

### open

The command `sublime-project open` lets you open a sublime project. It will use the specified strategies to determine location of the project file.

### clean

If you've ever wanted to remove references to removed projects from your recent projects list, `sublime-project clean` does just that. It will try to find the right Session.sublime_session file and remove paths in `workspaces.recent_projects` that do not exist on the file system. 

## Configuration

You can of course configure the behaviour of sublime-project by passing command line options. However, the same options can also be specified in configuration files (except for the `--config-path` option for obvious reasons).

### Configuration files

Create a file called `sublime-project.config.json` in the current working directory or any parent directory. All discovered config files are merged. The following is an example of what a config file could look like:

```json
{
    "templatePath": "/absolute/path/to/template.js"
}
```

Check [`sublime-project.config.json`](examples/sublime-project.config.json) for a more elaborate example.

### Project templates

You can customize the contents of created `.sublime-project` files. It requires you to write a javascript file that exports a function. You need to specify the path in a `sublime-project.config.json` file or as a command line option. An example template looks like this:

```js
module.exports = function() {
    return {
        folders: [
            {
                follow_symlinks: true,
                path: '.'
            }
        ]
    }
}
```

Check [`template.js`](examples/template.js) for a more elaborate example.

## Thanks

This project uses [node-package-skeleton](https://github.com/mickvangelderen/node-package-skeleton) as a starting point for package development. 
>>>>>>> skeleton/master
