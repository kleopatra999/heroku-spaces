'use strict';

let cli = require('heroku-cli-util');
let co  = require('co');

function* run (context, heroku) {
  let lib = require('../../lib/trusted-ips')(heroku);
  let space = context.flags.space;
  let rules = yield lib.getRules(space);
  rules.rules = rules.rules || [];
  if (rules.rules.length === 0) throw new Error('No IP ranges are configured. Nothing to do.');
  let originalLength = rules.rules.length;
  rules.rules = rules.rules.filter(r => r.source !== context.args.source);
  if (rules.rules.length === originalLength) throw new Error(`No IP range matching ${context.args.source} was found.`);
  if (rules.rules.length === 0) {
    yield cli.confirmApp(
      space,
      context.flags.confirm,
      `You are removing the last trusted IP range. Web traffic from any source will not able to access apps in this space.`);
  }
  rules = yield lib.putRules(space, rules);
  lib.displayRules(space, rules);
  cli.warn('It may take a few moments for the changes to take effect.');
}

module.exports = {
  topic: 'trusted-ips',
  command: 'remove',
  description: 'Remove a ranges from the list of trusted IP ranges',
  help: `
Uses CIDR notation.

Example:
  $ heroku trusted-ips:remove --space my-space 192.168.2.0/24
  Removed 192.168.2.0/24 from trusted IP ranges on my-space
  `,
  needsApp: false,
  needsAuth: true,
  args: [
    {name: 'source'},
  ],
  flags: [
    {name: 'space', hasValue: true, optional: false, description: 'space to remove rule from'},
    {name: 'confirm', hasValue: true, description: 'set to space name to bypass confirm prompt'},
  ],
  run: cli.command(co.wrap(run))
};
