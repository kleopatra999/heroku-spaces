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

  function lined (rules) {
    var count = 0
    var lined = []
    for (var i = 0, len = rules.length; i < len; i++) {
      lined.push({
        line: i+1,
        target: rules[i].target,
        from_port: rules[i].from_port,
        to_port: rules[i].to_port,
        target: rules[i].target,
        protocol: rules[i].protocol
      })
    }

    return lined
  }

  function display (rules) {
    var f = function(p) {
      var n = p
      return p.toString()
    }

    cli.table(lined(rules), {
      columns: [
        {key: 'line', label: 'Rule Number'},
        {key: 'target', label: 'Destination'},
        {key: 'from_port', label: 'From Port', format: from_port => f(from_port)},
        {key: 'to_port', label: 'To Port'},
        {key: 'protocol', label: 'Protocol'}
      ]
    })
  }

  function parsePorts (p) {
    if (p == "-1") {
      return [0,65535]
    }

    if (p != null) {
      var ports = p.split('..')
      if (ports.length > 1) {
        return [ports[0] | 0, ports[1] | 0]
      } else {
        return [ports[0] | 0, ports[0] | 0]
      }
    } else {
      return []
    }
  }

  return {
    getOutboundRules,
    putOutboundRules,
    displayRules,
    parsePorts
  }
}
