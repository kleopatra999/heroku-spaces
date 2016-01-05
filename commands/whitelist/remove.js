'use strict';

let cli = require('heroku-cli-util');
let co  = require('co');

function* run (context, heroku) {
  let lib = require('../../lib/whitelist')(heroku);
  let space = context.flags.space;
  let whitelist = yield lib.getWhitelist(space);
  whitelist.rules = whitelist.rules || [];
  if (whitelist.rules.length === 0) throw new Error('No rules exist. Nothing to do.');
  let originalLength = whitelist.rules.length;
  whitelist.rules = whitelist.rules.filter(r => r.source !== context.flags.source);
  if (whitelist.rules.length === originalLength) throw new Error(`No rule matching ${context.flags.source} was found.`);
  if (whitelist.rules.length === 0) {
    yield cli.confirmApp(
      space,
      context.flags.confirm,
      `You are removing the last whitelisted source and the default action is ${cli.color.red(whitelist.default_action)}.
Traffic from any source will ${whitelist.default_action === 'allow' ? 'be' : 'not'} able to access the apps in this space.`);
  }
  whitelist = yield lib.putWhitelist(space, whitelist);
  lib.displayWhitelist(whitelist);
  cli.warn('It may take a few moments for the changes to take effect.');
}

module.exports = {
  topic: 'spaces',
  command: 'whitelist:remove',
  description: 'remove rule from inbound whitelist',
  help: `
Example:
  $ heroku spaces:whitelist:remove --space my-space 192.168.2.0/24
  Source          Action
  ──────────────  ──────
  Created at:     2016-01-06T05:20:46Z
  Created by:     jeff@heroku.com
  Default action: allow
  `,
  needsApp: false,
  needsAuth: true,
  flags: [
    {name: 'space', char: 's', hasValue: true, description: 'space to add rule to'},
    {name: 'source', hasValue: true, description: 'source of inbound requests in CIDR notation'},
    {name: 'confirm', hasValue: true, description: 'set to space name to bypass confirm prompt'},
  ],
  run: cli.command(co.wrap(run))
};
