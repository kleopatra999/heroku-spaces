'use strict';

let cli = require('heroku-cli-util');
let co = require('co');

function* run(context, heroku) {
  let request = heroku.request({
    method: 'POST',
    path: '/spaces',
    body: {
      name: context.args.name,
      organization: context.flags.org,
      channel_name: context.flags.channel,
      region: context.flags.region,
    }
  });
  let space = yield cli.action(`Creating space ${cli.color.green(context.args.name)} in organization ${cli.color.cyan(context.flags.org)}`, request);
  cli.styledHeader(space.name);
  cli.styledObject({
    ID:              space.id,
    Organization:    space.organization.name,
    Region:          space.region.name,
    State:           space.state,
    'Created at':    space.created_at,
  }, ['ID', 'Organization', 'Region', 'State', 'Created at']);
}

module.exports = {
  topic: '_spaces',
  command: 'create',
  description: 'create a new space',
  help: `
Example:

  $ heroku spaces:create my-space --org my-org --region oregon
  Creating space my-space in organization my-org... done
  === my-space
  ID:           e7b99e37-69b3-4475-ad47-a5cc5d75fd9f
  Organization: my-org
  Region:       oregon
  State:        allocating
  Created at:   2016-01-06T03:23:13Z
  `,
  needsApp: false,
  needsAuth: true,
  args: [{name: 'name'}],
  flags: [
    {name: 'org', char: 'o', required: true, hasValue: true, description: 'organization name'},
    {name: 'channel', hasValue: true, hidden: true},
    {name: 'region', description: 'region name'},
  ],
  run: cli.command(co.wrap(run))
};
