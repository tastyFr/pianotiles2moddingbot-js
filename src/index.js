require('dotenv').config();

const {readdirSync, unlinkSync} = require('fs');

const {join} = require('path');

const {CommandoClient, FriendlyError} = require('discord.js-commando');

const {keepAlive} = require('./server');

// Cleanup temporary files from a temp folder.
readdirSync(join(__dirname, '..', 'temp')).forEach(file => unlinkSync(join(__dirname, '..', 'temp', file)));

const client = new CommandoClient({
  commandPrefix: process.env.PREFIX,
  owner: '241874942436704258',
  disableMentions: 'all',
});

client.registry

  .registerDefaultTypes()

  .registerGroups([
    ['util', 'Utility Commands'],
    ['modding', 'Modding Commands'],
  ])

  .registerDefaultCommands({
    help: false,
    commandState: false,
    prefix: false,
    ping: false,
    eval: false,
    unknownCommand: false,
  })

  .registerCommandsIn(join(__dirname, 'commands'));

client

  .on('rateLimit', console.warn)

  .on('error', console.error)

  .on('warn', console.warn)

  .on('debug', console.log)

  .on('ready', () => {
    console.log(
      'Client ready; logged in as %s#%s (%s)',
      client.user.username,
      client.user.discriminator,
      client.user.id,
    );

    client.user.setActivity({
      type: 'WATCHING',
      name: `for ${client.commandPrefix}`,
    });
  })

  .on('disconnect', () => {
    console.warn('Disconnected!');
  })

  .on('reconnecting', () => {
    console.warn('Reconnecting...');
  })

  .on('commandError', (cmd, err) => {
    if (err instanceof FriendlyError) {
      return;
    }

    console.error(`Error in command ${cmd.groupID}:${cmd.memberName}`, err);
  })

  .on('commandBlocked', (msg, reason) => {
    if (msg.command) {
      const command = `${msg.command.groupID}:${msg.command.memberName}`;
      console.log(`Command ${command} blocked; ${reason}`);
    } else {
      console.log(`Command blocked; ${reason}`);
    }
  });

keepAlive();

client.login(process.env.DISCORD_TOKEN);