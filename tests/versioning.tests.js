var jsonizer = require('../lib/jsonizer-cli')
var assert = require('assert')
var should = require('should')
var _ = require('underscore')
var fs = require('fs-extra')

const testsPath = __dirname + '/structures/versioning.tests.json'
const jsstring = JSON.stringify

const defaultConfig = {
  "structure": {
    "version": "0.1.0",
    "foo": "string"
  },
  "versions": {
    "0.1.0": {
      "date": "10-12-2015",
      "description": "description",
      "add": {},
      "delete": [],
      "modify": {},
      "next": "minor"
    },
    "0.2.0": {
      "date": "10-13-2015",
      "description": "description",
      "add": {
        "bar": "object"
      },
      "delete": [],
      "modify": {
        "foo": {
          "foo": "boolean"
        }
      },
      "next": "patch"
    },
    "0.2.1": {
      "date": "10-14-2015",
      "description": "description",
      "add": {
        "foofoo": "number"
      },
      "delete": [
        {"foo" : ["foo"]}
      ],
      "modify": {
        "bar": "string"
      }
    }
  }
}

jsonizer.options.load(testsPath)

var oldStructure, newStructure

describe('jsonizer versioning', function() {
	var oldStructure = {
		"version": "0.1.0",
  	"foo": "string"
	}

	it('should detect that an structure is outdated', function() {
		assert(jsonizer.validate.outdated)
		assert.equal(jsonizer.validate.outdated(oldStructure), true)
	})

	describe('should upgrade to the next structure', function() {
		it('should add a key', function() {
      oldStructure = {
        "foo": "string"
      }

      newStructure = {
        "foofoo":"number"
      }

      jsonizer.keys.add(oldStructure, newStructure)
      assert.equal(oldStructure.foo, "string")
      assert.equal(oldStructure.foofoo, "number")
		})

		it('should modify a key', function() {
      newStructure = {
        "foofoo" : {"foo" : "string"}
      }
      jsonizer.keys.modify(oldStructure, newStructure)
      assert.equal(oldStructure.foo, "string")
      assert.equal(oldStructure.foofoo.foo, "string")
		})

		it('should delete a key', function() {
      newStructure = [{"foofoo" : ["foo"]}]
      assert.equal(jsstring(oldStructure.foofoo), jsstring({"foo" : "string"}))
      jsonizer.keys.delete(oldStructure, newStructure)
      assert.equal(jsstring(oldStructure.foofoo), '{}')
		})

    it('should move from version 0.1.0 to next version 0.2.0', function() {
      assert(jsonizer.update.next)
      jsonizer.options.load(testsPath)

      newStructure = {
        "version" : "0.2.0",
        "foo": {
          "foo": "boolean"
        },
        "bar": "object"
      }

      jsonizer.update.next('0.1.0')
      assert(_.isEqual(jsonizer.config.structure, newStructure))
    })

    it('should move from current version to last version and save it in the json file', function() {
      assert(jsonizer.update.last)
      jsonizer.options.load(testsPath)

      newStructure = {
        "version" : "0.2.1",
        "foo": {},
        "foofoo" : "number",
        "bar": "string"
      }

      jsonizer.update.last()
      assert(_.isEqual(newStructure, jsonizer.config.structure))

      jsonizer.file.write()
      jsonizer.options.load(testsPath)
      assert(_.isEqual(newStructure, jsonizer.config.structure))
    })

    it('should be able to modify a current version structure', function() {
      jsonizer.config.versions[jsonizer.config.structure.version] = {
        "date": "10-14-2015",
        "description": "description",
        "add": {
          "foofoo": "object"
        },
        "delete": [
          {"foo" : ["foo"]}
        ],
        "modify": {
          "bar": "number"
        }
      }

      newStructure = {
        "version" : "0.2.1",
        "foo": {},
        "foofoo" : "object",
        "bar": "number"
      }

      jsonizer.update.current()
      assert(_.isEqual(newStructure, jsonizer.config.structure))

    })
	})
})

after(function() {
	fs.writeJsonSync(testsPath, defaultConfig)
})