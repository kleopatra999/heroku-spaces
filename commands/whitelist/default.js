'use strict';

let cli = require('heroku-cli-util');
let co  = require('co');
let lib = require('../../lib/whitelist');

function* run(context, heroku) {
  let space = context.args.space;
  yield cli.confirmApp(space, context.flags.confirm, `Destructive Action\nThis command will affect the space ${cli.color.bold.red(space)}`);
  let whitelist = yield heroku.request({
    path:    `/spaces/${space}/inbound-ruleset`,
    headers: {Accept: 'application/vnd.heroku+json; version=3.dogwood'},
  });
  whitelist.default_action = context.args['[allow|deny]'];
  whitelist = yield heroku.request({
    method:  'PUT',
    path:    `/spaces/${space}/inbound-ruleset`,
    body:    whitelist,
    headers: {Accept: 'application/vnd.heroku+json; version=3.dogwood'},
  });
  lib.display(whitelist);
  cli.warn('It may take a few moments for the changes to take effect.');
}

module.exports = {
  topic: 'spaces',
  command: 'whitelist:default',
  description: 'sets the default action for a spaces inbound ruleset/whitelist',
  help: `
The default action only applies to a whitelist with no sources.

Example:
  $ heroku spaces:whitelist:default my-space deny
  `,
  needsApp: false,
  needsAuth: true,
  args: [{name: 'space'}, {name: '[allow|deny]'}],
  flags: [
    {name: 'confirm', hasValue: true, description: 'set to space name to bypass confirm prompt'},
  ],
  run: cli.command(co.wrap(run))
};
