const {execFile} = require('child_process');
const {createWriteStream, unlink} = require('fs');
const https = require('https');
const {join} = require('path');
const {performance} = require('perf_hooks');
const {Command} = require('discord.js-commando');
const prettyMilliseconds = require('pretty-ms');

module.exports = class MidiInfoCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'midiinfo',
      aliases: ['mi'],
      group: 'modding',
      memberName: 'midiinfo',
      clientPermissions: ['SEND_MESSAGES', 'EMBED_LINKS'],
      description: 'Self-explanatory.',
      examples: ['pt2::midiinfo *MIDI File*'],
    });
  }

  run(message, _args) {
    const sendErrorMessage = errorMessage => {
      message.channel.stopTyping(true);

      return message.replyEmbed({
        title: `"${this.name}" error!`,
        color: [255, 0, 0],
        description: errorMessage,
      });
    };

    let attachment = '';

    try {
      const now = performance.now();

      attachment = message.attachments.first().url;

      const file = createWriteStream(join(__dirname, '..', '..', '..', 'temp', `${Date.now()}.mid`));

      https
        .get(attachment, response => {
          response.pipe(file);

          let output = '';
          let errorMessage = '';

          const getErrorMessage = () => {
            output = output.split(/\r|\n/).filter(text => text);
            return (
              output[output.length - 1]
              || `\`\`\`Unknown error has occurred!

Either no reason or this command cannot process large MIDI file!\`\`\``
            );
          };

          execFile(
            join(__dirname, '..', '..', 'features', 'executables', 'midiinfo'),

            [file.path],

            (error, stdout) => {
              output = String(stdout);

              if (error) {
                errorMessage = String(error);
                console.error(errorMessage);
              }
            },
          ).on('close', () => {
            const elapsed = prettyMilliseconds(performance.now() - now, {
              secondsDecimalDigits: 0,
            });

            message.channel.stopTyping(true);

            if (errorMessage) {
              sendErrorMessage(getErrorMessage(), message);
            } else {
              const embed = {
                color: Math.floor(Math.random() * 0xffffff).toString(16),
                fields: [],
                footer: {
                  text: `Execution time: ${elapsed}`,
                },
              };

              const json = JSON.parse(output);

              Object.getOwnPropertyNames(json).forEach((propertyName, val) => {
                embed.fields.push({
                  name: propertyName,
                  value:
                    propertyName === 'Notes:'
                      ? Number(Object.values(json)[val]).toLocaleString()
                      : Object.values(json)[val],
                });
              });

              message.replyEmbed(embed);
              cleanup(file.path);
            }
          });
        })

        .on('error', () => {
          sendErrorMessage('There was an error parsing MIDI file!', message);
          cleanup(file.path);
        });

      return;
    } catch (e) {
      if (e.message === 'Cannot read property \'url\' of undefined') {
        sendErrorMessage('You must send a MIDI file!', message);
        return;
      }

      sendErrorMessage(e.message, message);
    }

    function cleanup(file) {
      unlink(file, err => {
        if (err) {
          sendErrorMessage('Couldn\'t delete file from temporary folder. Contact `tastyFr#3429`.', message);
          throw err;
        }
      });
    }
  }
};