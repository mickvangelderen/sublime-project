/* eslint-env mocha */
import expect from 'must'
import cli from './cli'
import relativePath from '../test/relative-path'

describe(relativePath(__filename), () => {
	it('should export a function', () => {
		expect(cli).to.be.a.function()
	})
})
