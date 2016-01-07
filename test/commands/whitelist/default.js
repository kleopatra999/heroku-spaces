'use strict';

let nock     = require('nock');
let cmd      = require('../../../commands/whitelist/default');

describe('spaces:whitelist:default', function() {
  beforeEach(() => cli.mockConsole());

  it('sets the whitelist default action to deny', function() {
    let api = nock('https://api.heroku.com:443')
    .get('/spaces/my-space/inbound-ruleset')
    .reply(200,
           {
             default_action: 'allow',
             created_by: 'dickeyxxx',
             rules: [
               {source: '127.0.0.1/20', action: 'allow'},
             ]
           }
          )
    .put('/spaces/my-space/inbound-ruleset', {
      default_action: 'deny',
      created_by: 'dickeyxxx',
      rules: [
        {source: '127.0.0.1/20', action: 'allow'},
      ]
    })
    .reply(200, {rules: []});
    return cmd.run({args: {default: 'deny'}, flags: {space: 'my-space', confirm: 'my-space'}})
    .then(() => api.done());
  });
});
