import Future from 'funko/lib/future'
import inquirer from 'inquirer'

const prompt = options =>
	Future((reject, resolve) =>
		inquirer.prompt(options, result => resolve(result))
	)

export default prompt
