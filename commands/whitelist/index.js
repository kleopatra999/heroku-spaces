'use strict';

let cli = require('heroku-cli-util');
let co  = require('co');
let lib = require('../../lib/whitelist');

function displayJSON (whitelist) {
  cli.log(JSON.stringify(whitelist, null, 2));
}

function* run(context, heroku) {
  let space = context.args.space;
  let whitelist = yield heroku.request({
    path: `/spaces/${space}/inbound-ruleset`,
    headers: {Accept: 'application/vnd.heroku+json; version=3.dogwood'},
  });
  if (context.flags.json) displayJSON(whitelist);
  else lib.display(whitelist);
}

module.exports = {
  topic: 'spaces',
  command: 'whitelist',
  description: 'list inbound connection whitelist for a space',
  needsApp: false,
  needsAuth: true,
  args: [{name: 'space'}],
  flags: [
    {name: 'json', description: 'output in json format'},
  ],
  run: cli.command(co.wrap(run))
};
