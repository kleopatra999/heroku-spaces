'use strict'

let cli = require('heroku-cli-util')
let co = require('co')

function * run (context, heroku) {
  let lib = require('../../lib/outbound-rules')(heroku)
  let space = context.flags.space
  let rules = yield lib.getOutboundRules(space)
  rules.rules = rules.rules || []
  if (rules.rules.length === 0) throw new Error('No Outbound Rules configured. Nothing to do.')
  if (rules.rules.length === originalLength) throw new Error(`No IP range matching ${context.args.source} was found.`)
  rules = yield lib.putRules(space, rules)
  cli.log(`Removed ${cli.color.cyan.bold(context.args)} from Outbound Rules on ${cli.color.cyan.bold(space)}`)
  cli.warn('It may take a few moments for the changes to take effect.')
}

module.exports = {
  topic: 'outbound-rules',
  command: 'remove',
  description: 'Remove a Rules from the list of Outbound Rules',
  help: `
Example:
  $ heroku outbound-rules:remove --space my-space 4
  Removed 192.168.2.0/24 from trusted IP ranges on my-space
  `,
  needsApp: false,
  needsAuth: true,
  args: [
    {name: 'rulenumber'}
  ],
  flags: [
    {name: 'space', hasValue: true, optional: false, description: 'space to remove rule from'},
    {name: 'confirm', hasValue: true, description: 'set to space name to bypass confirm prompt'}
  ],
  run: cli.command(co.wrap(run))
}
