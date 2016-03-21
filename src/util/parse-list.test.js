/* eslint-env mocha */
import expect from 'must'
import parseList from './parse-list'
import relativePath from '../../test/relative-path'

describe(relativePath(__filename), () => {
	it('should export a function', () => {
		expect(parseList).to.be.a.function()
		expect(parseList('a b,c')).to.eql([ 'a', 'b', 'c' ])
	})
})
