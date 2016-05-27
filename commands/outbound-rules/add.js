'use strict'

let cli = require('heroku-cli-util')
let co = require('co')

function * run (context, heroku) {
  let lib = require('../../lib/outbound-rules')(heroku)
  let space = context.flags.space
  let ruleset = yield lib.getRules(space)
  ruleset.rules = ruleset.rules || []
  ruleset.rules.push({action: 'allow', source: context.args.source})
  ruleset = yield lib.putRules(space, ruleset)
  cli.log(`Added ${cli.color.cyan.bold(context.args.source)} to trusted IP ranges on ${cli.color.cyan.bold(space)}`)
  cli.warn('It may take a few moments for the changes to take effect.')
}

module.exports = {
  topic: 'outbound-rules',
  command: 'add',
  description: 'Add outbound rules to a Private Space',
  help: `
Uses CIDR notation.

Example:
  $ heroku outbound-rules:add --space my-space --dest 192.168.2.0/24 --protocol tcp --port 80
  Added 192.168.0.1/24 to the outbound rules on my-space
  `,
  needsApp: false,
  needsAuth: true,
  args: [],
  flags: [
    {name: 'space', char: 's', hasValue: true, description: 'space to add rule to'},
    {name: 'confirm', hasValue: true, description: 'set to space name to bypass confirm prompt'},
    {name: 'dest', hasValue: true, description: 'target CIDR block Dynos are allowed to communicate with'},
    {name: 'protocol', hasValue: true, description: 'the protocol Dynos are allowed to use when communicating with hosts in destination CIDR block'},
    {name: 'port', hasValue: true, description: 'the port Dynos are allowed to use when communicating with hosts in destination CIDR block'}
  ],
  run: cli.command(co.wrap(run))
}
