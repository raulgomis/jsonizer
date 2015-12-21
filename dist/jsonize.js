/*! https://github.com/jsonize v0.1.8 by elenatorro | MIT license */

(function (factory) {
  "use strict";

  if (typeof define === "function" && define.amd) {
    define(factory);
  } else if (typeof module != "undefined" && typeof module.exports != "undefined") {
    module.exports = factory();
  } else if (typeof Package !== "undefined") {
    jsonize = factory(); // export for Meteor.js
  } else {
      /* jshint sub:true */
      window["jsonize"] = factory();
    }
})(function () {
  const _ = require('underscore');
  const semver = require('semver');

  var jsonize = {};

  var set = {
    version: {
      new: function (version, structure) {
        structure = structure || {
          "date": new Date().toISOString(),
          "description": "New structure"
        };
        if (jsonize.validate.version(structure)) {
          version = version || "major";
          jsonize.set.semver(version);
          jsonize.set.version.structure(semver.inc(jsonize.config.structure.version, version), structure);
          return true;
        }
        return false;
      },
      structure: function (version, structure) {
        structure.date = new Date().toISOString();
        jsonize.config.versions[version] = structure;
        jsonize.set.version.current(version);
      },
      current: function (version) {
        jsonize.config.structure.version = version || jsonize.config.structure.version;
      }
    },
    data: function (data) {
      data = data || '{}';
      jsonize.data = JSON.parse(data);
    },
    semver: function (version) {
      jsonize.config.versions[jsonize.config.structure.version].next = version;
    },
    structure: function (structure) {
      jsonize.config.structure = structure;
    },
    config: {
      data: function (data, config) {
        jsonize.set.config.current(config);
        jsonize.set.data(data);
      },
      current: function (config) {
        jsonize.config = config || jsonize.config;
        jsonize.set.version.current(jsonize.config.structure.version);
      },
      default: function () {
        jsonize.config = {
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
      return jsonize.config.versions[version] || false;
    }
  };

  var keys = {
    add: function (oldStructure, newStructure) {
      for (var key in _.omit(newStructure, 'version')) {
        oldStructure[key] = newStructure[key];
      }
    },

    modify: function (oldStructure, newStructure) {
      jsonize.keys.add(oldStructure, newStructure);
    },

    delete: function (oldStructure, newStructure) {
      newStructure.forEach(function (key) {
        if (typeof key === 'object') {
          for (var childKey in key) {
            jsonize.keys.delete(oldStructure[childKey], key[childKey]);
          }
        } else {
          delete oldStructure[key];
        }
      });
    }
  };

  var update = {
    variables: function (oldStructure, newStructure) {
      jsonize.keys.add(oldStructure, newStructure.add);
      jsonize.keys.modify(oldStructure, newStructure.modify);
      jsonize.keys.delete(oldStructure, newStructure.delete);
    },
    next: function (version) {
      jsonize.update.variables(jsonize.config.structure, jsonize.next(version, jsonize.config.versions[version]));
    },

    current: function () {
      jsonize.update.variables(jsonize.config.structure, jsonize.config.versions[jsonize.config.structure.version]);
      jsonize.set.version.current();
    },

    last: function () {
      if (jsonize.config.versions[jsonize.config.structure.version].next) {
        jsonize.update.next(jsonize.config.structure.version);
        jsonize.update.last();
      } else {
        jsonize.update.current();
      }
    }
  };

  var validate = {
    version: function (structure) {
      structure = structure || jsonize.config.structure;
      return structure.date != null && structure.description != null;
    },
    outdated: function (structure) {
      return semver.gt(jsonize.config.structure.version, structure.version);
    }
  };

  function next(version, versionStructure) {
    var next = semver.inc(version, versionStructure.next);
    jsonize.set.version.current(next);
    return jsonize.config.versions[next];
  }

  function init(config, data) {
    jsonize.set.config.data(config, data);
  }

  jsonize = {
    init: init,
    set: set,
    get: get,
    validate: validate,
    update: update,
    next: next,
    keys: keys
  };

  return jsonize;
});