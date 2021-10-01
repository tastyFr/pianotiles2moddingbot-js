const {performance} = require('perf_hooks');
const asTable = require('as-table');
const {MessageEmbed} = require('discord.js');
const {Command} = require('discord.js-commando');
const prettyMilliseconds = require('pretty-ms');
const {getNewBPM} = require('../../features/SongUtilities');

module.exports = class SpeedsCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'speeds',
      aliases: ['calcspeeds', 'calculatespeeds'],
      group: 'modding',
      memberName: 'speeds',
      clientPermissions: ['SEND_MESSAGES', 'EMBED_LINKS'],
      description: 'Calculate speeds per lap for any Piano Tiles 2 song.',
      examples: [
        'pt2::speeds <3rd part TPS> <laps> <any baseBeats> <any baseBeats> <any baseBeats>',
      ],
      args: [
        {
          key: 'TPS',
          prompt: 'type the TPS value to calculate.\n',
          type: 'float',
          validate: val => val > 0,
          default: '',
        },
        {
          key: 'laps',
          prompt: 'type how many laps should be calculated.\n',
          type: 'float',
          validate: val => val > 0,
          default: '',
        },
        {
          key: 'baseBeats',
          prompt: 'type the `baseBeats` value to calculate.\n',
          type: 'float',
          validate: val => val > 0,
          default: '',
          infinite: true,
        },
      ],
    });
  }

  async run(message, args) {
    const sendErrorMessage = errorMessage => {
      message.channel.stopTyping(true);

      return message.replyEmbed({
        title: `"${this.name}" error!`,
        color: [255, 0, 0],
        description: errorMessage,
      });
    };

    message.channel.startTyping(9999);
    const now = performance.now();

    try {
      const {baseBeats, TPS} = args;

      if (baseBeats.length === 3) {
        let bpm = TPS * 60 * baseBeats[2];
        let speeds = [];

        const arrSpeeds = [
          ['Lap', '1st part TPS', '2nd part TPS', '3rd part TPS'],
          ['1', '', '', TPS.toFixed(6)],
        ];

        if (!args.TPS) {
          sendErrorMessage('Enter TPS value!', message);
        } else if (!args.laps) {
          sendErrorMessage('Enter how many laps to calculate!', message);
        } else if (!args.baseBeats) {
          sendErrorMessage('Enter baseBeats values!', message);
        } else if (args.TPS && args.laps && args.baseBeats) {
          for (let i = 0; i < args.laps - 1; i += 1) {
            speeds.push(i + 1 + 1);

            bpm = getNewBPM(bpm, baseBeats[2], baseBeats[0], i >= 2);
            speeds.push((Number(bpm >>> 0) / baseBeats[0] / 60).toFixed(6));

            bpm = getNewBPM(bpm, baseBeats[0], baseBeats[1], i >= 2);
            speeds.push((Number(bpm >>> 0) / baseBeats[1] / 60).toFixed(6));

            bpm = getNewBPM(bpm, baseBeats[1], baseBeats[2], i >= 2);
            speeds.push((Number(bpm >>> 0) / baseBeats[2] / 60).toFixed(6));

            arrSpeeds.push(speeds);
            speeds = [];
          }

          let desc = `These are calculated using the real formula that PT2 uses:\n\`\`\`${asTable(
            arrSpeeds,
          )}\`\`\``;

          while (desc.length > 4096) {
            arrSpeeds.pop();

            desc = `These are calculated using the real formula that PT2 uses:\n\`\`\`${asTable(
              arrSpeeds,
            )}\`\`\``;
          }

          const elapsed = prettyMilliseconds(performance.now() - now, {
            secondsDecimalDigits: 0,
          });

          const embed = new MessageEmbed()
            .setTitle('Here are the calculated speeds:')
            .setColor(Math.floor(Math.random() * 0xffffff).toString(16))
            .setDescription(desc)
            .setFooter(`Execution time: ${elapsed}`);

          message.say(embed);
        }
      } else {
        sendErrorMessage('You need to have exactly three baseBeats!', message);
      }
    } catch (e) {
      sendErrorMessage(e.message, message);
    }

    message.channel.stopTyping(true);
  }
};