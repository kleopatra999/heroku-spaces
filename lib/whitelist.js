'use strict';

let cli = require('heroku-cli-util');

module.exports = function (heroku) {
  function getWhitelist (space) {
    return heroku.request({
      path:    `/spaces/${space}/inbound-ruleset`,
      headers: {Accept: 'application/vnd.heroku+json; version=3.dogwood'},
    });
  }

  function putWhitelist (space, whitelist) {
    return heroku.request({
      method:  'PUT',
      path:    `/spaces/${space}/inbound-ruleset`,
      body:    whitelist,
      headers: {Accept: 'application/vnd.heroku+json; version=3.dogwood'},
    });
  }

  function displayWhitelist (whitelist) {
    cli.table(whitelist.rules, {
      columns: [
        {key: 'source', label: 'Source'},
        {key: 'action', label: 'Action'},
      ]
    });
    cli.styledObject({
      Version: whitelist.version,
      'Default action': whitelist.default_action,
      'Created at': whitelist.created_at,
      'Created by': whitelist.created_by,
    });
  }


  return {
    getWhitelist,
    putWhitelist,
    displayWhitelist,
  };
};
