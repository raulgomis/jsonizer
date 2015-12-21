/*! https://github.com/jsonize v0.1.8 by elenatorro | MIT license */

;(function () {
  const fs = require('fs')
  const fse = require('fs-extra')
  const Acho = require('acho')

  var acho = Acho({color: true})
  var jsonize = require('./jsonize')

  var file = {
    read: function() {
      jsonize.config = fse.readJsonSync(jsonize.configPath, {throws: false})
      jsonize.set.config.current()
    },
    write: function() {
      fse.writeJsonSync(jsonize.configPath, jsonize.config, {throws: false})
      acho.success('Your config is saved')
      jsonize.set.config.current()
    },
    default: function(path) {
      fse.outputJSONSync(path, jsonize.config, {throws: false})
    }
  }

  var update = {
    current: function() {
      jsonize.file.read()
      jsonize.update.current()
    },
    last: function() {
      jsonize.file.read()
      jsonize.update.last()
      jsonize.init()
    }   
  }

  var options = {
    validate: function(structure) {
      jsonize.file.read()
      if (jsonize.validate(structure)) {
        acho.success('Your structure is valid!')
      } else {
        acho.error('Your structure is not valid!')
      }
    },

    default: function(path) {
      path = jsonize.configPath = path || 'jsonize.json'
      jsonize.set.config.default()
      jsonize.file.default(path)
    },

    load: function(path) {
      jsonize.configPath = path || 'jsonize.json'
      jsonize.file.read()
    },
    add: function(version, structure) {
      jsonize.options.load(jsonize.configPath)
      if (jsonize.set.version.new(version, structure)) {
        jsonize.file.write()
        return true
      }
      acho.error('Not possible to save your config')
      return false
    },
    show: function() {
      acho.info(JSON.stringify(jsonize))
    },
    update: update
  }


  jsonize.file = file
  jsonize.options = options

  module.exports = jsonize
}())