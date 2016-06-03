'use strict'

let cli = require('heroku-cli-util')
let co = require('co')

function * run (context, heroku) {
  let lib = require('../../lib/outbound-rules')(heroku)
  let space = context.flags.space
  let ruleset = yield lib.getOutboundRules(space)
  ruleset.rules = ruleset.rules || []
  let ports = yield lib.parsePorts(context.flags.port)
  ruleset.rules.push({
    target: context.flags.dest,
    from_port: ports[0],
    to_port: ports[1] || ports[0],
    protocol: context.flags.protocol})
  ruleset = yield lib.putOutboundRules(space, ruleset)
  cli.log(`Added rule to the Outbound Rules of ${cli.color.cyan.bold(space)}`)
  cli.warn('Modifying the Outbound Rules may break Add-ons for Apps in this Private Space')
}

module.exports = {
  topic: 'outbound-rules',
  command: 'add',
  description: 'Add outbound rules to a Private Space',
  help: `
The destination flag uses CIDR notation.

Example:
  $ heroku outbound-rules:add --space my-space --dest 192.168.2.0/24 --protocol tcp --port 80
  Added 192.168.0.1/24 to the outbound rules on my-space

Example with port range:
  $ heroku outbound-rules:add --space my-space --dest 192.168.2.0/24 --protocol tcp --port 80-100
  Added 192.168.0.1/24 to the outbound rules on my-space

Example opening up everything
  $ heroku outbound-rules:add --space my-space --dest 0.0.0.0/0 --protocol any --port any
  Added 0.0.0.0/0 to the outbound rules on my-space
  `,
  needsApp: false,
  needsAuth: true,
  args: [],
  flags: [
    {name: 'space', char: 's', hasValue: true, description: 'space to add rule to'},
    {name: 'confirm', hasValue: true, description: 'set to space name to bypass confirm prompt'},
    {name: 'dest', hasValue: true, description: 'target CIDR block dynos are allowed to communicate with'},
    {name: 'protocol', hasValue: true, description: 'the protocol dynos are allowed to use when communicating with hosts in destination CIDR block. Valid protocols are "tcp", "udp", "icmp", "0-255" and "any".'},
    {name: 'port', hasValue: true, description: 'the port dynos are allowed to use when communicating with hosts in destination CIDR block. Accepts a range in `<lowest port>-<highest port>` format. 0 is the minimum. The maximum port allowed for ICMP traffic is 255, otherwise the maximum is 65535.'}
  ],
  run: cli.command(co.wrap(run))
}
