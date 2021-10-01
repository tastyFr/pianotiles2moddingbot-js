const {Command} = require('discord.js-commando');

module.exports = class PingCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'ping',
      group: 'util',
      memberName: 'ping',
      description: 'Checks the bot\'s ping to the Discord server.',
      throttling: {
        usages: 5,
        duration: 10,
      },
    });
  }

  async run(msg) {
    const pingMsg = await msg.say('Pinging...');

    const roundTrip
      = (pingMsg.editedTimestamp || pingMsg.createdTimestamp)
      - (msg.editedTimestamp || msg.createdTimestamp);

    const heartbeatPing = this.client.ws.ping
      ? `The heartbeat ping is **${Math.round(this.client.ws.ping)}ms**.`
      : '';

    return pingMsg.edit(
      `Pong! The message round-trip took **${roundTrip}ms**. ${heartbeatPing}`,
    );
  }
};