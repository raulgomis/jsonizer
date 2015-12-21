var jsonizer = require('../lib/jsonizer-cli')
var assert = require('assert')
var should = require('should')
var _ = require('underscore')
var fs = require('fs-extra')

const testsPath =  './jsonizer.json'
const jsstring = JSON.stringify

describe('jsonizer configuration', function() {
	it('should create a new configuration by default if it does not exist', function() {
		assert(jsonizer.options.default)
		jsonizer.options.default()
		var defaultConfig = fs.readJsonSync(testsPath);
		assert.equal(defaultConfig.structure.version, '0.1.0')
		assert(_.isEqual(defaultConfig.structure, {"version": "0.1.0"}))
		assert(defaultConfig.versions['0.1.0'].date)
		assert.equal(defaultConfig.versions['0.1.0'].description, "")
	})
})