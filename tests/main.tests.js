var jsonizer = require('../lib/jsonizer-cli')
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

describe('jsonizer library', function() {
	it('should be defined', function() {
		assert(jsonizer)
	})
	it('should be able to set version to be the current version', function() {
		assert(jsonizer.set)
		assert(jsonizer.set.version)
		assert(jsonizer.set.version.current)
		jsonizer.set.version.current('0.0.1')
		assert.equal(jsonizer.config.structure.version, '0.0.1')
	})
	
	it('should be able to set the config path', function() {
		jsonizer.options.load(testsPath)
		assert(jsonizer.set.config)
		assert(jsonizer.configPath)
		assert(jsonizer.configPath, testsPath)
	})
	
	describe('reading from config path', function() {
		it('should be able to get config file from config path', function() {
			assert(jsonizer.file)
			assert(jsonizer.file.read)
			jsonizer.file.read()
			assert.equal(jsonizer.config.structure.version, '0.1.0')
		})

		it('should be able to get a structure for certain version', function() {
			assert(jsonizer.get.version)
			var version = {
		      "date" : '10-12-2015',
		      "description" : "description",
		      "add": {},
		      "delete": {},
		      "modify": {}
		    }

			assert.equal(jsonizer.get.version('0.3.0'), false)
			assert.equal(jsstring(jsonizer.get.version('0.1.0')), jsstring(version))
		})
	})

	describe('validating the configuration', function() {
		it('should be able to detect valid/invalid a version configuration', function() {
			assert(jsonizer.validate)
			assert(jsonizer.validate.version)
			assert.equal(jsonizer.validate.version(jsonizer.get.version('0.1.0')), true)
			assert.equal(jsonizer.validate.version({'invalid':'structure'}), false)
		})
	})

	describe('writing new version structures', function() {
		it('should add a new version structure if this structure is valid and the version did not exist', function() {
			assert(jsonizer.set.version.new)
			assert.equal(jsonizer.set.version.new('minor', {}), false)
			assert.equal(jsonizer.set.version.new('minor', {'invalid':'structure'}), false)
			var version = {
		      "date" : '10-12-2015',
		      "description" : "description",
		      "add": {},
		      "delete": {},
		      "modify": {}
		    }
			assert.equal(jsonizer.set.version.new('minor', version), true)
			jsonizer.file.write()
			assert.equal(jsonizer.config.structure.version, '0.2.0')

			var currentFile = fs.readJsonSync(jsonizer.configPath)
			assert.equal(Object.keys(currentFile.versions).length, 2)
			assert.equal(currentFile.versions['0.1.0'].next, 'minor')
		})
	})
})

after(function() {
	fs.writeJsonSync(testsPath, defaultConfig)
})