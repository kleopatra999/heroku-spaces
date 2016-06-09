// -*- mode: js; js-indent-level: 2; -*-
'use strict'
let cli = require('heroku-cli-util')
let co = require('co')
let info = require('./info')
let wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

function * run (context, heroku) {
  let spaceName = context.flags.space || context.args.space
  if (!spaceName) throw new Error('Space name required.\nUSAGE: heroku spaces:wait my-space')

  let now = new Date()
  let timeout = context.flags.timeout || 10
  let deadline = new Date(now.getTime() + timeout * 60 * 1000)

  let spinner = new cli.Spinner({text: `Waiting for space ${cli.color.green(spaceName)} to allocate...`})
  spinner.start()

  let space = yield heroku.get(`/spaces/${spaceName}`)
  while (space.state !== 'allocated') {
    if ((new Date()).getTime() > deadline) {
      throw new Error('Timeout waiting for space to become allocated.')
    }
    yield wait(30 * 1000)
    space = yield heroku.get(`/spaces/${spaceName}`)
  }
  space.outbound_ips = yield heroku.get(`/spaces/${spaceName}/nat`)

  spinner.stop('done')

  cli.log()
  info.render(space)
}

module.exports = {
  topic: 'spaces',
  command: 'wait',
  description: 'wait for a space to be created',
  needsAuth: true,
  args: [{name: 'space', optional: true, hidden: true}],
  flags: [
    {name: 'space', char: 's', hasValue: true, description: 'space to get info of'},
    {name: 'json', description: 'output in json format'},
    {name: 'timeout', char: 't', hasValue: true, description: 'maximum number of minutes to wait'}
  ],
  run: cli.command(co.wrap(run))
}
