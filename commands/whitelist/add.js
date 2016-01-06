'use strict';

let cli = require('heroku-cli-util');
let co  = require('co');

function* run (context, heroku) {
  let lib = require('../../lib/whitelist')(heroku);
  let space = context.flags.space;
  let whitelist = yield lib.getWhitelist(space);
  whitelist.rules = whitelist.rules || [];
  if (whitelist.rules.find(rs => rs.source === context.flags.source)) throw new Error(`A rule already exists for ${context.flags.source}.`);
  if (whitelist.rules.length === 0) yield cli.confirmApp(space, context.flags.confirm, `Traffic from everywhere except ${cli.color.red(context.flags.source)} will be able to access apps in this space.`);
  whitelist.rules.push({action: 'allow', source: context.flags.source});
  whitelist = yield lib.putWhitelist(space, whitelist);
  lib.displayWhitelist(whitelist);
  cli.warn('It may take a few moments for the changes to take effect.');
}

module.exports = {
  topic: 'spaces',
  command: 'whitelist:add',
  description: 'add rule to inbound whitelist',
  help: `
The default action only applies to a whitelist with no sources.
Uses CIDR notation.

Example:
  $ heroku spaces:whitelist:add --space my-space 192.168.2.0/24
  Source          Action
  ──────────────  ──────
  192.168.0.1/24  allow
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
