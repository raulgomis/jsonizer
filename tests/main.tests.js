var jsonize = require('../lib/jsonize-cli')
var assert = require('assert')
var should = require('should')
var fs = require('fs-extra')

const testsPath = __dirname + '/structures/main.tests.json'
const jsstring = JSON.stringify

const defaultConfig = {
  "structure" : {
  	"version": "0.1.0",
  	"foo": "string"
  },
  "versions": {
    "0.1.0": {
      "date" : '10-12-2015',
      "description" : "description",
      "add": {},
      "delete": {},
      "modify": {}
    }
  }
}

describe('jsonize library', function() {
	it('should be defined', function() {
		assert(jsonize)
	})
	it('should be able to set version to be the current version', function() {
		assert(jsonize.set)
		assert(jsonize.set.version)
		assert(jsonize.set.version.current)
		jsonize.set.version.current('0.0.1')
		assert.equal(jsonize.config.structure.version, '0.0.1')
	})
	
	it('should be able to set the config path', function() {
		jsonize.options.load(testsPath)
		assert(jsonize.set.config)
		assert(jsonize.configPath)
		assert(jsonize.configPath, testsPath)
	})
	
	describe('reading from config path', function() {
		it('should be able to get config file from config path', function() {
			assert(jsonize.file)
			assert(jsonize.file.read)
			jsonize.file.read()
			assert.equal(jsonize.config.structure.version, '0.1.0')
		})

		it('should be able to get a structure for certain version', function() {
			assert(jsonize.get.version)
			var version = {
		      "date" : '10-12-2015',
		      "description" : "description",
		      "add": {},
		      "delete": {},
		      "modify": {}
		    }

			assert.equal(jsonize.get.version('0.3.0'), false)
			assert.equal(jsstring(jsonize.get.version('0.1.0')), jsstring(version))
		})
	})

	describe('validating the configuration', function() {
		it('should be able to detect valid/invalid a version configuration', function() {
			assert(jsonize.validate)
			assert(jsonize.validate.version)
			assert.equal(jsonize.validate.version(jsonize.get.version('0.1.0')), true)
			assert.equal(jsonize.validate.version({'invalid':'structure'}), false)
		})
	})

	describe('writing new version structures', function() {
		it('should add a new version structure if this structure is valid and the version did not exist', function() {
			assert(jsonize.set.version.new)
			assert.equal(jsonize.set.version.new('minor', {}), false)
			assert.equal(jsonize.set.version.new('minor', {'invalid':'structure'}), false)
			var version = {
		      "date" : '10-12-2015',
		      "description" : "description",
		      "add": {},
		      "delete": {},
		      "modify": {}
		    }
			assert.equal(jsonize.set.version.new('minor', version), true)
			jsonize.file.write()
			assert.equal(jsonize.config.structure.version, '0.2.0')

			var currentFile = fs.readJsonSync(jsonize.configPath)
			assert.equal(Object.keys(currentFile.versions).length, 2)
			assert.equal(currentFile.versions['0.1.0'].next, 'minor')
		})
	})
})

after(function() {
	fs.writeJsonSync(testsPath, defaultConfig)
})