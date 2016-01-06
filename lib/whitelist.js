'use strict';

let cli = require('heroku-cli-util');

module.exports.display = function (whitelist) {
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
};
