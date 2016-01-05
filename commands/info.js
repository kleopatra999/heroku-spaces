'use strict';

let cli = require('heroku-cli-util');
let co  = require('co');

function displayNat (nat) {
  if (nat.state !== 'enabled') return nat.state;
  return nat.sources.join(', ');
}

function* run(context, heroku) {
  let space = yield heroku.get(`/spaces/${context.args.space}`);
  if (space.state === 'allocated') {
    space.outbound_ips = yield heroku.get(`/spaces/${context.args.space}/nat`);
  }
  if (context.flags.json) {
    cli.log(JSON.stringify(space, null, 2));
  } else {
    cli.styledHeader(space.name);
    cli.styledObject({
      ID:              space.id,
      Organization:    space.organization.name,
      Region:          space.region.name,
      State:           space.state,
      'Outbound IPs':  displayNat(space.outbound_ips),
      'Created at':    space.created_at,
    }, ['ID', 'Organization', 'Region', 'State', 'Outbound IPs', 'Created at']);
  }
}

module.exports = {
  topic: '_spaces',
  command: 'info',
  description: 'show info about a space',
  needsAuth: true,
  args: [{name: 'space'}],
  flags: [
    {name: 'json', description: 'output in json format'},
  ],
  run: cli.command(co.wrap(run))
};
