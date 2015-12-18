'use strict'

let cli = require('heroku-cli-util');
let co = require('co');

function* run(context, heroku) {
    let spaces = yield heroku.request({path: `/spaces/${context.flags.space}`});
    console.log(spaces);
}

module.exports = {
  topic: 'spaces',
  description: 'show info about a space',
  command: 'info',
  needsApp: false,
  needsAuth: true,
  default: false,
  flags: [
    {name: 'space', char: 'space', hasValue: true, optional: false}
  ],
  run: cli.command(co.wrap(run))
};
