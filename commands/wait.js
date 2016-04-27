// -*- mode: js; js-indent-level: 2; -*-
'use strict'
let cli = require('heroku-cli-util')
let co = require('co')
let wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

function remaining (from, to) {
  let secs = Math.floor(to / 1000 - from / 1000)
  let mins = Math.floor(secs / 60)
  let hours = Math.floor(mins / 60)
  if (hours > 0) return `${hours}h ${mins % 60}m`
  if (mins > 0) return `${mins}m ${secs % 60}s`
  if (secs > 0) return `${secs}s`
  return ''
}

function wait_text (deadline) {
  let remaining_text = remaining( (new Date()).getTime(), deadline)
  return `Waiting ${remaining_text} for space... `
}

function * run (context, heroku) {
  let lib = require('../lib/spaces')()
  let spaceName = context.flags.space || context.args.space
  if (!spaceName) throw new Error('Space name required.\nUSAGE: heroku spaces:wait my-space')

  let now = new Date()
  let timeout = context.flags.timeout || 10
  let deadline = new Date(now.getTime() + timeout*60*1000)

  let spinner = new cli.Spinner({text: wait_text(deadline)})
  spinner.start()

  let space = yield heroku.get(`/spaces/${spaceName}`)
  while (space.state !== 'allocated') {
    if ((new Date()).getTime() > deadline) {
      throw new Error('Timeout waiting for space to become allocated.')
    }
    spinner.update(wait_text(deadline));
    yield wait(30*1000)
    space = yield heroku.get(`/spaces/${spaceName}`)
  }

  spinner.stop()
  cli.log("Space created.")
  space.outbound_ips = yield heroku.get(`/spaces/${spaceName}/nat`)

  if (context.flags.json) {
    cli.log(JSON.stringify(space, null, 2))
  } else {
    cli.styledHeader(space.name)
    cli.styledObject({
      ID: space.id,
      Organization: space.organization.name,
      Region: space.region.name,
      State: space.state,
      'Outbound IPs': lib.displayNat(space.outbound_ips),
      'Created at': space.created_at
    }, ['ID', 'Organization', 'Region', 'State', 'Outbound IPs', 'Created at'])
  }
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
