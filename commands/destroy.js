'use strict';

let cli = require('heroku-cli-util');
let co  = require('co');

function* run(context, heroku) {
  let space = context.args.space;
  yield cli.confirmApp(space, context.flags.confirm, `Destructive Action\nThis command will affect the space ${cli.color.bold.red(space)}`);
  let request = heroku.delete(`/spaces/${space}`);
  yield cli.action(`Destroying space ${cli.color.cyan(space)}`, request);
}

module.exports = {
  topic: '_spaces',
  command: 'destroy',
  description: 'destroy a space',
  help: `
Example:

  $ heroku spaces:destroy my-space
  Destroying my-space... done
`,
  needsApp: false,
  needsAuth: true,
  args: [{name: 'space'}],
  flags: [
    {name: 'confirm', hasValue: true, description: 'set to space name to bypass confirm prompt'},
  ],
  run: cli.command(co.wrap(run))
};
