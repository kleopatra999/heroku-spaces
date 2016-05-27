'use strict'

let cli = require('heroku-cli-util')

module.exports = function (heroku) {
  function getOutboundRules (space) {
    return heroku.request({
      path: `/spaces/${space}/outbound-ruleset`,
      headers: {Accept: 'application/vnd.heroku+json; version=3.dogwood'}
    })
  }

  function putOutboundRules (space, ruleset) {
    return heroku.request({
      method: 'PUT',
      path: `/spaces/${space}/outbound-ruleset`,
      body: ruleset,
      headers: {Accept: 'application/vnd.heroku+json; version=3.dogwood'}
    })
  }

  function displayRules (space, ruleset) {
    if (ruleset.rules.length > 0) {
      cli.styledHeader('Outbound Rules')
      display(ruleset.rules)
    } else {
      cli.styledHeader(`${space} has no Outbound Rules. Your Dynos cannot communicate with hosts outside of ${space}.`)
    }
  }

  function display (rules) {
    var f = function(p) {
      var n = p
      return p.toString()
    }
    cli.table(rules, {
      columns: [
        {key: 'target', label: 'Destination'},
        {key: 'from_port', label: 'From Port', format: from_port => f(from_port)},
        {key: 'to_port', label: 'To Port'},
        {key: 'protocol', label: 'Protocol'}
      ]
    })
  }

  return {
    getOutboundRules,
    putOutboundRules,
    displayRules
  }
}
