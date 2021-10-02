const {execFile} = require('child_process');
const {createWriteStream, existsSync, unlink} = require('fs');
const https = require('https');
const path = require('path');
const {performance} = require('perf_hooks');
const {Command} = require('discord.js-commando');
const prettyMilliseconds = require('pretty-ms');

module.exports = class Json2MidiCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'json2midi',
      aliases: ['j2m'],
      group: 'modding',
      memberName: 'json2midi',
      clientPermissions: ['SEND_MESSAGES', 'EMBED_LINKS', 'ATTACH_FILES'],
      description: `Converts Piano Tiles 2 song (.JSON) to MIDI file.

(Credits to **Volian0** for [json2midi](https://github.com/Volian0/json2midi) source code!)`,
      examples: ['pt2::json2midi *JSON File* <bpm> <baseBeats> ... ...'],
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

    let attachment = '';

    try {
      const now = performance.now();

      attachment = message.attachments.first().url;

      const songName = path
        .parse(attachment)
        .name.replace(/[_\s]+/g, ' ')
        .trim();

      const file = createWriteStream(`../${songName}.json`, {
        highWaterMark: 65536,
      });

      https
        .get(attachment, response => {
          response.pipe(file).on('finish', () => {
            let output = '';
            let errorMessage = '';

            const getErrorMessage = () => {
              output = output.split(/\r|\n/).filter(text => text);
              return output[output.length - 1];
            };

            execFile(
              path.join(
                __dirname,
                '..',
                '..',
                'features',
                'executables',
                'json2midi',
              ),

              [file.path, ...args.split(' ')],

              (error, stdout) => {
                output = String(stdout);

                if (error) {
                  const noArgs
                    = Array(args).length === 0
                      ? '\n\nTry typing <bpm> <baseBeats> ... ...'
                      : '';
                  errorMessage
                    = output.lastIndexOf('std::exception') > 0
                      ? `Couldn't convert into MIDI file! (std::exception)${noArgs}`
                      : getErrorMessage();
                }
              },
            ).on('close', () => {
              const midiFile = file.path.replace(
                new RegExp(`${path.extname(file.path)}$`),
                '.mid',
              );

              if (errorMessage) {
                sendErrorMessage(`\`\`\`${errorMessage}\`\`\``, message);

                cleanup(file.path);
                cleanup(midiFile);
              } else {
                const elapsed = prettyMilliseconds(performance.now() - now, {
                  secondsDecimalDigits: 0,
                });

                if (existsSync(midiFile)) {
                  message.channel.stopTyping(true);

                  if (output) {
                    message.replyEmbed({
                      title: 'WARNINGS:',
                      color: Math.floor(Math.random() * 0xffffff).toString(16),
                      description: `\`\`\`${output}\`\`\``,
                      footer: `Execution time: ${elapsed}`,
                    });
                    message.say({
                      files: [midiFile],
                    });
                  } else {
                    message
                      .reply(`\n\nExecution time: ${elapsed}`, {
                        files: [midiFile],
                      })
                      .then(() => {
                        cleanup(file.path);
                        cleanup(midiFile);
                      });
                  }
                } else {
                  sendErrorMessage(`\`\`\`${output}\`\`\``, message);
                }
              }
            });
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

    function cleanup(midiFile) {
      if (existsSync(midiFile)) {
        unlink(midiFile, err => {
          if (err) {
            sendErrorMessage(
              'Couldn\'t delete file from temporary folder. Contact `tastyFr#3429`.',
              message,
            );
            throw err;
          }
        });
      }
    }
  }
};