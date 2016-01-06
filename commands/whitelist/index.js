'use strict';

let cli = require('heroku-cli-util');
let co  = require('co');

function displayJSON (whitelist) {
  cli.log(JSON.stringify(whitelist, null, 2));
}

function* run(context, heroku) {
  let lib = require('../../lib/whitelist')(heroku);
  let space = context.flags.space || context.args.space;
  if (!space) throw new Error('Space name required.\nUSAGE: heroku spaces:whitelist my-space');
  let whitelist = yield lib.getWhitelist(space);
  if (context.flags.json) displayJSON(whitelist);
  else lib.displayWhitelist(whitelist);
}

module.exports = {
  topic: 'spaces',
  command: 'whitelist',
  description: 'list inbound connection whitelist',
  needsApp: false,
  needsAuth: true,
  args: [{name: 'space', optional: true, hidden: true}],
  flags: [
    {name: 'space', char: 's', hasValue: true, description: 'space to get whitelist from'},
    {name: 'json', description: 'output in json format'},
  ],
  run: cli.command(co.wrap(run))
};
