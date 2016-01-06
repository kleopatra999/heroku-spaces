'use strict';

exports.topic = {
  name: 'spaces',
  description: 'manage heroku private spaces',
};

exports.commands = [
  require('./commands'),
  require('./commands/create'),
  require('./commands/destroy'),
  require('./commands/info'),
  require('./commands/rename'),
  require('./commands/whitelist'),
  require('./commands/whitelist/add'),
  require('./commands/whitelist/default'),
  require('./commands/whitelist/remove'),
];