'use strict';

let cli = require('heroku-cli-util');
let co  = require('co');

function* run(context, heroku) {
  let lib = require('../../lib/whitelist')(heroku);
  let space = context.flags.space;
  yield cli.confirmApp(space, context.flags.confirm, `Destructive Action\nThis command will affect the space ${cli.color.bold.red(space)}`);
  let whitelist = yield lib.getWhitelist(space);
  whitelist.default_action = context.args['default'];
  whitelist = yield lib.putWhitelist(space, whitelist);
  lib.displayWhitelist(whitelist);
  cli.warn('It may take a few moments for the changes to take effect.');
}

module.exports = {
  topic: 'spaces',
  command: 'whitelist:default',
  description: 'sets default action',
  usage: 'spaces:whitelist:default -s my-space [allow|deny]',
  help: `
The default action only applies to a whitelist with no sources.
It may take a few moments for the changes to take effect.

Example:
  $ heroku spaces:whitelist:default --space my-space deny
  Source  Action
  ──────  ──────
  Created at:     2016-01-06T04:42:12Z
  Created by:     jeff@heroku.com
  Default action: deny
  `,
  needsApp: false,
  needsAuth: true,
  args: [{name: 'default'}],
  flags: [
    {name: 'space', char: 's', hasValue: true, description: 'space to set default action of'},
    {name: 'confirm', hasValue: true, description: 'set to space name to bypass confirm prompt'},
  ],
  run: cli.command(co.wrap(run))
};
