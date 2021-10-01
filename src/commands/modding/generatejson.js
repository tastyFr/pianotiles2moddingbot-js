const {writeFile, unlink} = require('fs');
const {join} = require('path');
const {Command} = require('discord.js-commando');

module.exports = class GenerateJsonCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'generatejson',
      aliases: ['gen'],
      group: 'modding',
      memberName: 'generatejson',
      description: 'Generates a template for your Piano Tiles 2 song in JSON.',
      clientPermissions: ['SEND_MESSAGES', 'ATTACH_FILES'],
      examples: [
        'pt2::generatejson <Speed in TPS> <baseBeats> ... ... (Format JSON? [true/false]) (Optional Filename)',
      ],
      args: [
        {
          key: 'first TPS value',
          prompt: 'type the TPS value for your song.\n',
          type: 'float',
          validate: val => val >= 0,
        },
        {
          key: 'first "baseBeats" value',
          prompt: 'type the "baseBeats" value for your song.\n',
          type: 'float',
          validate: val => val >= 0,
        },
        {
          key: 'second TPS value',
          prompt: 'type the TPS value for your song.\n',
          type: 'float',
          validate: val => val >= 0,
        },
        {
          key: 'second "baseBeats" value',
          prompt: 'type the "baseBeats" value for your song.\n',
          type: 'float',
          validate: val => val >= 0,
        },
        {
          key: 'third TPS value',
          prompt: 'type the TPS value for your song.\n',
          type: 'float',
          validate: val => val >= 0,
        },
        {
          key: 'third "baseBeats" value',
          prompt: 'type the "baseBeats" value for your song.\n',
          type: 'float',
          validate: val => val >= 0,
        },
        {
          key: 'format flag',
          prompt: 'type `true` or `false` for formatting.\n',
          type: 'boolean',
          default: false,
        },
        {
          key: 'optional filename',
          prompt: 'type the valid name for your song.\n',
          type: 'string',
          default: '',
        },
      ],
    });
  }

  run(message, args) {
    const sendErrorMessage = errorMessage => {
      message.channel.stopTyping(true);
      return message.replyEmbed({
        title: `"${this.name}" error!`,
        color: [255, 0, 0],
        description: errorMessage,
      });
    };

    message.channel.startTyping(9999);

    const JSON_ = {
      baseBpm: 0,
      musics: [
        {
          id: 1,
          bpm: 0,
          baseBeats: 0,
          scores: ['', ''],
        },
        {
          id: 2,
          bpm: 0,
          baseBeats: 0,
          scores: ['', ''],
        },
        {
          id: 3,
          bpm: 0,
          baseBeats: 0,
          scores: ['', ''],
        },
      ],
    };

    const tps1 = Number(Object.values(args)[0]);
    const bb1 = Number(Object.values(args)[1]);
    JSON_.baseBpm = tps1 * 60 * bb1;
    JSON_.musics[0].bpm = tps1 * 60 * bb1;
    JSON_.musics[0].baseBeats = bb1;

    const tps2 = Number(Object.values(args)[2]);
    const bb2 = Number(Object.values(args)[3]);
    JSON_.musics[1].bpm = tps2 * 60 * bb2;
    JSON_.musics[1].baseBeats = bb2;

    const tps3 = Number(Object.values(args)[4]);
    const bb3 = Number(Object.values(args)[5]);
    JSON_.musics[2].bpm = tps3 * 60 * bb3;
    JSON_.musics[2].baseBeats = bb3;

    const fileName
      = String(Object.values(args)[7]).length > 0
        ? String(`${Object.values(args)[7]}.json`)
        : `Generated_${Date.now()}.json`;

    const filePath = join(__dirname, '..', '..', '..', 'temp', fileName);

    const doFormat = Boolean(Object.values(args)[6]);

    const song
      = doFormat === true
        ? JSON.stringify(JSON_, null, 4)
        : JSON.stringify(JSON_);

    writeFile(filePath, song, 'utf8', err => {
      if (err) {
        sendErrorMessage(
          'Couldn\'t write file to temporary folder. Contact `tastyFr#3429`.',
          message,
        );
        throw err;
      }

      message.channel.stopTyping(true);
      message
        .reply({files: [filePath]})
        .then(() => {
          unlink(filePath, err => {
            if (err) {
              sendErrorMessage(
                'Couldn\'t remove file from temporary folder. Contact `tastyFr#3429`.',
                message,
              );
              throw err;
            }
          });
        })
        .catch(err => {
          sendErrorMessage(
            'Couldn\'t send file to Discord server. Contact `tastyFr#3429`.',
            message,
          );
          throw err;
        });
    });
  }
};