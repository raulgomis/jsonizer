/*! https://github.com/jsonizer v0.1.8 by elenatorro | MIT license */

;(function () {
  const fs = require('fs');
  const fse = require('fs-extra');
  const Acho = require('acho');

  var acho = Acho({ color: true });
  var jsonizer = require('./jsonizer');

  var file = {
    read: function () {
      jsonizer.config = fse.readJsonSync(jsonizer.configPath, { throws: false });
      jsonizer.set.config.current();
    },
    write: function () {
      fse.writeJsonSync(jsonizer.configPath, jsonizer.config, { throws: false });
      acho.success('Your config is saved');
      jsonizer.set.config.current();
    },
    default: function (path) {
      fse.outputJSONSync(path, jsonizer.config, { throws: false });
    }
  };

  var update = {
    current: function () {
      jsonizer.file.read();
      jsonizer.update.current();
    },
    last: function () {
      jsonizer.file.read();
      jsonizer.update.last();
      jsonizer.init();
    }
  };

  var options = {
    validate: function (structure) {
      jsonizer.file.read();
      if (jsonizer.validate(structure)) {
        acho.success('Your structure is valid!');
      } else {
        acho.error('Your structure is not valid!');
      }
    },

    default: function (path) {
      path = jsonizer.configPath = path || 'jsonizer.json';
      jsonizer.set.config.default();
      jsonizer.file.default(path);
    },

    load: function (path) {
      jsonizer.configPath = path || 'jsonizer.json';
      jsonizer.file.read();
    },
    add: function (version, structure) {
      jsonizer.options.load(jsonizer.configPath);
      if (jsonizer.set.version.new(version, structure)) {
        jsonizer.file.write();
        return true;
      }
      acho.error('Not possible to save your config');
      return false;
    },
    show: function () {
      acho.info(JSON.stringify(jsonizer));
    },
    update: update
  };

  jsonizer.file = file;
  jsonizer.options = options;

  module.exports = jsonizer;
})();