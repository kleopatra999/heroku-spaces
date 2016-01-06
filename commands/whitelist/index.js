'use strict';

let cli = require('heroku-cli-util');
let co  = require('co');

function displayJSON (whitelist) {
  cli.log(JSON.stringify(whitelist, null, 2));
}

function* run(context, heroku) {
  let lib = require('../../lib/whitelist')(heroku);
  let space = context.args.space;
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
  args: [{name: 'space'}],
  flags: [
    {name: 'json', description: 'output in json format'},
  ],
  run: cli.command(co.wrap(run))
};
