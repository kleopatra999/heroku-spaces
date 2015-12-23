require 'heroku/api/whitelist'
class Heroku::Command::Whitelist < Heroku::Command::Base

  # whitelist
  #
  # displays inbound connection whitelist for space.
  #
  # --space SPACE   # name of space
  #
  def index
    require_argument! :space
    validate_arguments!

    whitelist = api.get_whitelist(options[:space]).body
    style whitelist
  end

  # whitelist:default [allow|deny]
  #
  # sets the default action for a spaces inbound ruleset/whitelist
  #
  # --space SPACE # name of space
  def default
    default = extract_default_arg!
    require_argument! :space
    validate_arguments!

    return unless confirm
    whitelist = api.get_whitelist(options[:space]).body
    whitelist[:default_action] = default

    new_whitelist = api.put_whitelist(options[:space], whitelist).body

    style new_whitelist
    display_delay
  end

  # whitelist:add --space SPACE --source SOURCE
  #
  # Adds rules to the inbound ruleset/whitelist.
  #
  # --space SPACE # name of space
  # --source SOURCE # source of inbound requests in CIDR notation.
  def add
    require_argument! :space
    require_argument! :source
    validate_arguments!

    whitelist = api.get_whitelist(options[:space]).body
    rules = whitelist.fetch(:rules, [])
    exists = rules.find {|rs| rs[:source] == options[:source]}
    if exists
      display("A rule already exists for #{options[:source]}")
      exit(1)
    end

    new_rule = {action: 'allow', source: options[:source]}
    rules << new_rule
    whitelist[:rules] = rules

    new_whitelist = api.put_whitelist(options[:space], whitelist).body
    style new_whitelist

    display_delay
  end

  # whitelist:remove --space SPACE --source SOURCE
  #
  # Removes rules from the inbound ruleset/whitelist.
  #
  # --space SPACE # name of space
  # --source SOURCE # source of inbound requests in CIDR notation.
  def remove
    require_argument! :space
    require_argument! :source
    validate_arguments!

    whitelist = api.get_whitelist(options[:space]).body
    rules = whitelist.fetch(:rules, [])
    exists = rules.delete_if {|rs| rs[:source] == options[:source]}
    if exists
      whitelist[:rules] = rules
      new_whitelist = api.put_whitelist(options[:space], whitelist).body
      style new_whitelist
      display_delay
    else
      display("A rule already match #{options[:source]} was not found")
      exit(1)
    end
  end

  private

  def extract_default_arg!
    default = shift_argument
    if default.nil?
      Heroku::Command.run(current_command, ['--help'])
      exit(1)
    end
    default
  end

  def require_argument!(arg)
    return if options.key?(arg)
    output_with_bang("An argument for \"--#{arg.to_s }\" must be provided.")
    Heroku::Command.run(current_command, ['--help'])
    exit(1)
  end

  def for_display(whitelist)
    {
      'Version'    => whitelist['version'],
      'Rules'      => style_rules(whitelist['rules']),
      'Created By' => whitelist['created_by'],
      'Created At' => whitelist['created_at'],
    }
  end

  def style(whitelist)
    styled_header("DEFAULT ACTION: #{whitelist['default_action']}")
    keys = []
    keys << 'Version'
    keys << 'Created By'
    keys << 'Created At'
    styled_hash(for_display(whitelist), keys)
  end

  def style_rules(rules)
    return unless rules.size > 0
    cols = ['Source', 'Action']
    display_table(rules.map{|r| {'Source'=>r["source"], 'Action' => r["action"]}}, cols, cols)
  end

  def display_delay
    display("\nIt may take a few moments for the changes to take effect.")
  end
end
