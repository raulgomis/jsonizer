#!/usr/bin/env node
;(function () {
  var jsonizer = require('../lib/jsonizer-cli')
  var fs = require('fs')
  var fse = require('fs-extra')

  var input = {
    operation: process.argv[2],
    arguments: process.argv.splice(3)
  }
  var log = console.log

  var main = function () {
    if (!input.operation) {
      log('Error: jsonizer requires an operation ')
      log('Try `jsonizer --help` for more information.')
      return process.exit(1)
    }

    /* Help */
    if (/^(?:-h|--help|undefined)$/.test(input.operation)) {
      log([
        '\nUsage:\n',
        '\tjsonizer load',
        '\tjsonizer validate',
        '\tjsonizer add',
        '\tjsonizer show'
      ].join('\n'))
      return process.exit(1)
    }

    /* Version */
    if (/^(?:-v|--version)$/.test(input.operation)) {
      return process.exit(1)
    }

    var result
    try {
      jsonizer.options[input.operation](input.arguments[0])
    } catch(error) {
      log(error.message + '\n')
      log('Error: failed to %s.', input.operation)
      log(
        '\nStack trace using jsonizer@%s:\n',
         jsonizer.version
      )
      log(error.stack)
      return process.exit(1)
    }
    return process.exit(0)
  }

  main()
}())