'use strict';

let nock     = require('nock');
let cmd      = require('../../../commands/whitelist/add');

describe('spaces:whitelist:add', function() {
  beforeEach(() => cli.mockConsole());

  it('adds a CIDR entry to the whitelist', function() {
    let api = nock('https://api.heroku.com:443')
    .get('/spaces/my-space/inbound-ruleset')
    .reply(200,
           {
             default_action: 'allow',
             created_by: 'dickeyxxx',
             rules: [
               {source: '128.0.0.1/20', action: 'allow'},
             ]
           }
          )
    .put('/spaces/my-space/inbound-ruleset', {
      default_action: 'allow',
      created_by: 'dickeyxxx',
      rules: [
        {source: '128.0.0.1/20', action: 'allow'},
        {source: '127.0.0.1/20', action: 'allow'},
      ]
    })
    .reply(200, {rules: []});
    return cmd.run({args: {source: '127.0.0.1/20'}, flags: {space: 'my-space'}})
    .then(() => api.done());
  });
});
