# Installation

```
npm install -g sublime-project
```

# Usage

```
sublime-project --help

  Usage: sublime-project [path]

  Options:

    -h, --help          output usage information
    -V, --version       output the version number
    -o --open [value]   Open Sublime Text after creating the project file (default: true).
    -d --debug [value]  Print debug messages.
```

If you pass a path that ends with either a `/` or a `\`, sublime-project treats the path as a directory. It will try to create or open a project inside the path you provide. 

When you do not pass a path, sublime-project uses the current working directory. 

When sublime-project is working with a directory path, it will try to look up the project name in `package.json` and `bower.json`. Otherwise it will default to the name of the directory. 

If the `subl` command is available in your operating systems default terminal, sublime-project will attempt to open the created or already existing .sublime-project file. You can disable this behaviour by passing `--open false`. 

# Code

The source lives in the `es2015` directory and is transpiled using Babel. To work on this project you can use `npm run build` to build and `npm run watch` to build whenever you change a file in `es2015/`. 