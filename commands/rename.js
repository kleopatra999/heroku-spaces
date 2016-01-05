'use strict';

let cli = require('heroku-cli-util');
let co  = require('co');

function* run(context, heroku) {
  let request = heroku.request({
    method:  'PATCH',
    path:    `/spaces/${context.flags.from}`,
    body:    {name: context.flags.to},
  });
  yield cli.action(`Renaming space from ${cli.color.cyan(context.flags.from)} to ${cli.color.green(context.flags.to)}`, request);
}

module.exports = {
  topic: '_spaces',
  command: 'rename',
  description: 'renames a space',
  help: `
Example:

  $ heroku spaces:rename --from old-space-name --to new-space-name
  Renaming space old-space-name to new-space-name... done
`,
  needsApp: false,
  needsAuth: true,
  flags: [
    {name: 'from', hasValue: true, required: true, description: 'current name of space'},
    {name: 'to',   hasValue: true, required: true, description: 'desired name of space'},
  ],
  run: cli.command(co.wrap(run))
};
