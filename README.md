#jsonize

Keep your JSON structures versioned

[![Build Status](https://travis-ci.org/elenatorro/jsonize.svg)](https://travis-ci.org/elenatorro/jsonize)
[![Coverage Status](https://coveralls.io/repos/elenatorro/jsonize/badge.svg?branch=master&service=github)](https://coveralls.io/github/elenatorro/jsonize?branch=master)
[![Dependency Status](https://david-dm.org/elenatorro/jsonize/master.svg)](https://david-dm.org/elenatorro/jsonize/master)
[![devDependency Status](https://david-dm.org/elenatorro/jsonize/master/dev-status.svg)](https://david-dm.org/elenatorro/jsonize/master#info=devDependencies)
---

##Problem: 

* You are working with jsons to structure your content (for instance, default settings for your web application stored in the localstorage).
* You modify this structure, but the old structure saved in localstorage breaks the functionality of your web application.
* You have to modify manually the saved structure, or delete it in order to generate the new structure

##Solution:

* You create different versions of your data structure.
* Everytime you create a new version, you save it in a configuration file (.json)
* If you have an old version stored, jsonize updates your stored data to fit the new version (or new versions)

##Documentation:
(under construction)

###Download

```
$ npm install json-ize (--save-dev)
``` 

###Import

```
var jsonize = require('jsonize')
``` 

###Configuration

```
jsonize.init()
``` 
It creates a jsonize.json file with the default minimum configuration in the same path. If you pass a path to your config file, jsonize will use that configuration.

```
jsonize.init('mypath/myconfig.json')
``` 

Default minimum configuration:

    
```
{
  "structure": {
    "version": "0.1.0"
  },
  "versions": {
    "0.1.0": {
      "date": "2015-12-11T11:56:36.848Z", //date in ISOString format
      "description": "",
      "add": {},
      "delete": [],
      "modify": {}
    }
  }
}
``` 


###Usage

* You receive a data structure. This data structure must have a version field

```
// 'loadedStructure' contains the data you had stored
jsonize.set.structure(loadedStructure)
//loadedStructure is saved in the config structure
jsonize.update.last()
//update the structure to the last version in the config file
``` 

jsonize.update.last always updates the current last version also, so you can modify structure changes without creating a new version.
It also works recursively, so if your stored structure was 0.1.0 and last version is 0.3.0, but there was a version 0.2.0, it will update from 0.1.0 to 0.2.0 and then to 0.3.0.

* You want to create a new version

You can do it by using:

```
jsonize.set.new(structure, version) 
```

Where 'version' follows [semver syntax](https://github.com/npm/node-semver)

When adding a new version, the previous version should look like:

```
  "versions": {
    "0.1.0": {
      "date": "2015-12-11T11:56:36.848Z", //date in ISOString format
      "description": "",
      "add": {},
      "delete": [],
      "modify": {},
      "next":"patch"
    },
    "0.1.1": {
      "date": "2015-12-11T11:56:36.848Z", //date in ISOString format
      "description": "",
      "add": {},
      "delete": [],
      "modify": {}
    }
  }
```

As you can see, I added the attribute 'next' to the previous version, which contains the semver syntax that will be used to know the next version structure.


###Tests

To execute the tests, run:

```
$ npm test
```