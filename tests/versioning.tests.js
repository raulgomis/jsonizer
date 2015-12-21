var jsonize = require('../lib/jsonize-cli')
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

jsonize.options.load(testsPath)

var oldStructure, newStructure

describe('jsonize versioning', function() {
	var oldStructure = {
		"version": "0.1.0",
  	"foo": "string"
	}

	it('should detect that an structure is outdated', function() {
		assert(jsonize.validate.outdated)
		assert.equal(jsonize.validate.outdated(oldStructure), true)
	})

	describe('should upgrade to the next structure', function() {
		it('should add a key', function() {
      oldStructure = {
        "foo": "string"
      }

      newStructure = {
        "foofoo":"number"
      }

      jsonize.keys.add(oldStructure, newStructure)
      assert.equal(oldStructure.foo, "string")
      assert.equal(oldStructure.foofoo, "number")
		})

		it('should modify a key', function() {
      newStructure = {
        "foofoo" : {"foo" : "string"}
      }
      jsonize.keys.modify(oldStructure, newStructure)
      assert.equal(oldStructure.foo, "string")
      assert.equal(oldStructure.foofoo.foo, "string")
		})

		it('should delete a key', function() {
      newStructure = [{"foofoo" : ["foo"]}]
      assert.equal(jsstring(oldStructure.foofoo), jsstring({"foo" : "string"}))
      jsonize.keys.delete(oldStructure, newStructure)
      assert.equal(jsstring(oldStructure.foofoo), '{}')
		})

    it('should move from version 0.1.0 to next version 0.2.0', function() {
      assert(jsonize.update.next)
      jsonize.options.load(testsPath)

      newStructure = {
        "version" : "0.2.0",
        "foo": {
          "foo": "boolean"
        },
        "bar": "object"
      }

      jsonize.update.next('0.1.0')
      assert(_.isEqual(jsonize.config.structure, newStructure))
    })

    it('should move from current version to last version and save it in the json file', function() {
      assert(jsonize.update.last)
      jsonize.options.load(testsPath)

      newStructure = {
        "version" : "0.2.1",
        "foo": {},
        "foofoo" : "number",
        "bar": "string"
      }

      jsonize.update.last()
      assert(_.isEqual(newStructure, jsonize.config.structure))

      jsonize.file.write()
      jsonize.options.load(testsPath)
      assert(_.isEqual(newStructure, jsonize.config.structure))
    })

    it('should be able to modify a current version structure', function() {
      jsonize.config.versions[jsonize.config.structure.version] = {
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

      jsonize.update.current()
      assert(_.isEqual(newStructure, jsonize.config.structure))

    })
	})
})

after(function() {
	fs.writeJsonSync(testsPath, defaultConfig)
})