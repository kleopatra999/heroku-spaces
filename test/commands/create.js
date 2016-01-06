'use strict';

let nock     = require('nock');
let cmd      = require('../../commands/create');
let expect   = require('chai').expect;

let now = new Date();

describe('spaces:create', function() {
  beforeEach(() => cli.mockConsole());

  it('creates a space', function() {
    let api = nock('https://api.heroku.com:443')
      .post('/spaces', {
        name: 'my-space',
        organization: 'my-org',
        region: 'my-region',
      })
      .reply(201,
        {name: 'my-space', organization: {name: 'my-org'}, region: {name: 'my-region'}, state: 'enabled', created_at: now}
      );
    return cmd.run({flags: {space: 'my-space', org: 'my-org', region: 'my-region'}})
    .then(() => expect(cli.stdout).to.equal(
`=== my-space
Organization: my-org
Region:       my-region
State:        enabled
Created at:   ${now.toISOString()}
`))
.then(() => api.done());
  });
});