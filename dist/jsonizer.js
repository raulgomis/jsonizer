/*! https://github.com/jsonizer v0.1.8 by elenatorro | MIT license */

(function (factory) {
  "use strict";

  if (typeof define === "function" && define.amd) {
    define(factory);
  } else if (typeof module != "undefined" && typeof module.exports != "undefined") {
    module.exports = factory();
  } else if (typeof Package !== "undefined") {
    jsonizer = factory(); // export for Meteor.js
  } else {
      /* jshint sub:true */
      window["jsonizer"] = factory();
    }
})(function () {
  const _ = require('underscore');
  const semver = require('semver');

  var jsonizer = {};

  var set = {
    version: {
      new: function (version, structure) {
        structure = structure || {
          "date": new Date().toISOString(),
          "description": "New structure"
        };
        if (jsonizer.validate.version(structure)) {
          version = version || "major";
          jsonizer.set.semver(version);
          jsonizer.set.version.structure(semver.inc(jsonizer.config.structure.version, version), structure);
          return true;
        }
        return false;
      },
      structure: function (version, structure) {
        structure.date = new Date().toISOString();
        jsonizer.config.versions[version] = structure;
        jsonizer.set.version.current(version);
      },
      current: function (version) {
        jsonizer.config.structure.version = version || jsonizer.config.structure.version;
      }
    },
    data: function (data) {
      data = data || '{}';
      jsonizer.data = JSON.parse(data);
    },
    semver: function (version) {
      jsonizer.config.versions[jsonizer.config.structure.version].next = version;
    },
    structure: function (structure) {
      jsonizer.config.structure = structure;
    },
    config: {
      data: function (data, config) {
        jsonizer.set.config.current(config);
        jsonizer.set.data(data);
      },
      current: function (config) {
        jsonizer.config = config || jsonizer.config;
        jsonizer.set.version.current(jsonizer.config.structure.version);
      },
      default: function () {
        jsonizer.config = {
          "structure": {
            "version": "0.1.0"
          },
          "versions": {
            "0.1.0": {
              "date": new Date().toISOString(),
              "description": "",
              "add": {},
              "delete": [],
              "modify": {}
            }
          }
        };
      }
    }
  };

  var get = {
    version: function (version) {
      return jsonizer.config.versions[version] || false;
    }
  };

  var keys = {
    add: function (oldStructure, newStructure) {
      for (var key in _.omit(newStructure, 'version')) {
        oldStructure[key] = newStructure[key];
      }
    },

    modify: function (oldStructure, newStructure) {
      jsonizer.keys.add(oldStructure, newStructure);
    },

    delete: function (oldStructure, newStructure) {
      newStructure.forEach(function (key) {
        if (typeof key === 'object') {
          for (var childKey in key) {
            jsonizer.keys.delete(oldStructure[childKey], key[childKey]);
          }
        } else {
          delete oldStructure[key];
        }
      });
    }
  };

  var update = {
    variables: function (oldStructure, newStructure) {
      jsonizer.keys.add(oldStructure, newStructure.add);
      jsonizer.keys.modify(oldStructure, newStructure.modify);
      jsonizer.keys.delete(oldStructure, newStructure.delete);
    },
    next: function (version) {
      jsonizer.update.variables(jsonizer.config.structure, jsonizer.next(version, jsonizer.config.versions[version]));
    },

    current: function () {
      jsonizer.update.variables(jsonizer.config.structure, jsonizer.config.versions[jsonizer.config.structure.version]);
      jsonizer.set.version.current();
    },

    last: function () {
      if (jsonizer.config.versions[jsonizer.config.structure.version].next) {
        jsonizer.update.next(jsonizer.config.structure.version);
        jsonizer.update.last();
      } else {
        jsonizer.update.current();
      }
    }
  };

  var validate = {
    version: function (structure) {
      structure = structure || jsonizer.config.structure;
      return structure.date != null && structure.description != null;
    },
    outdated: function (structure) {
      return semver.gt(jsonizer.config.structure.version, structure.version);
    }
  };

  function next(version, versionStructure) {
    var next = semver.inc(version, versionStructure.next);
    jsonizer.set.version.current(next);
    return jsonizer.config.versions[next];
  }

  function init(config, data) {
    jsonizer.set.config.data(config, data);
  }

  jsonizer = {
    init: init,
    set: set,
    get: get,
    validate: validate,
    update: update,
    next: next,
    keys: keys
  };

  return jsonizer;
});