const {MessageEmbed} = require('discord.js');
const {Command} = require('discord.js-commando');

module.exports = class HelpCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'help',
      aliases: ['commands', 'command-list', 'cmds'],
      group: 'util',
      memberName: 'help',
      clientPermissions: ['SEND_MESSAGES', 'EMBED_LINKS'],
      description:
        'Displays a list of available commands, or detailed information for a specific command.',
      examples: ['pt2::help ping'],
      guarded: true,
      args: [
        {
          key: 'command',
          prompt: 'which command would you like to view the help for?',
          type: 'command',
          default: '',
        },
      ],
    });
  }

  run(message, {command}) {
    const {commandPrefix} = message.guild;
    const randomColor = Math.floor(Math.random() * 0xFFFFFF).toString(16);

    if (!command) {
      const embed = new MessageEmbed()
        .setTitle('Commands:')
        .setColor(randomColor)
        .setFooter(
          `To get information on a specific command, type "${commandPrefix}help [command name]".`,
        );

      [...this.client.registry.groups.values()].forEach(group => {
        const commandsListText = group.commands
          .map(cmd => `\`${cmd.name}\``)
          .join(', ');

        embed.addField(`${group.name}:`, commandsListText);
      });

      return message.say({
        embed,
      });
    }

    const embed = new MessageEmbed()
      .setTitle(`${commandPrefix}${command.name} info`)
      .setColor(randomColor)
      .addField('Description:', command.description)
      .addField('Category:', command.group.name)
      .addField('Usage:', `\`${commandPrefix}${command.name}\``);

    if (command.aliases && command.aliases.length > 0) {
      const commandAliasesText = command.aliases
        .map(alias => `\`${alias}\``)
        .join(', ');

      embed.addField('Aliases:', commandAliasesText);
    }

    if (command.examples && command.examples.length > 0) {
      const examplesText = command.examples
        .map(example => `\`${example}\``)
        .join(', ');

      embed.addField('Examples:', examplesText);
    }

    if (command.clientPermissions && command.clientPermissions.length > 0) {
      const commandPermsText = command.clientPermissions
        .map(perm => `\`${perm}\``)
        .join(', ');

      embed.addField('Permissions needed:', commandPermsText);
    }

    return message.say({
      embed,
    });
  }
};