const {execFile} = require('child_process');
const {createWriteStream, unlink, existsSync} = require('fs');
const https = require('https');
const {join, parse} = require('path');
const {performance} = require('perf_hooks');
const {Command} = require('discord.js-commando');
const prettyMilliseconds = require('pretty-ms');

module.exports = class MidiQuantizeCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'midiquantize',
      aliases: ['mq'],
      group: 'modding',
      memberName: 'midiquantize',
      clientPermissions: ['SEND_MESSAGES', 'ATTACH_FILES'],
      description: `Quantizes note events and removes broken chords on each track in a MIDI File.

\`<tick>\` - Length (in ticks)
After quantization all note lengths will be multiples of this argument's value.
If if sets to 5, after quantization all note lengths will be either 5, 10, 15, 20, 25 and so on.

You can also use these templates, so the program will calculate the tick based on MIDI's TPQN:
\`\`\`
sixth-step  quarter-step  third-step  half-step  step
sixth-beat  quarter-beat  third-beat  half-beat  beat\`\`\`

\`(BPM)\` - tempo for the output file in beats per minute (default = 120)
—
(Credits to **Volian0** for [midiquantize](https://github.com/Volian0/midiquantize) source code!)`,
      examples: ['pt2::midiquantize *MIDI File* <tick> (BPM)'],
      args: [
        {
          key: 'tick',
          prompt: 'type the valid tick.\n',
          type: 'string',
        },
        {
          key: 'BPM value',
          prompt: 'type your valid BPM value.\n',
          type: 'float',
          default: 120,
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

    let attachment = '';

    try {
      const now = performance.now();

      attachment = message.attachments.first().url;

      const file = createWriteStream(
        join(__dirname, '..', '..', '..', 'temp', `${Date.now()}.mid`),
        {highWaterMark: 65536},
      );

      message.channel.startTyping(9999);

      https
        .get(attachment, response => {
          response.pipe(file).on('finish', () => {
            let output = '';
            let errorMessage = '';

            const getErrorMessage = () => {
              output = output.split(/\r|\n/).filter(text => text);
              return (
                `\`\`\`${output[output.length - 1]}\`\`\``
                || `\`\`\`Unknown error has occurred!

Either no reason or this command cannot process large MIDI file!\`\`\``
              );
            };

            const newFileName = `${parse(attachment).name}_NEW.mid`;
            const newFilePath = join(
              __dirname,
              '..',
              '..',
              '..',
              'temp',
              newFileName,
            );

            execFile(
              join(
                __dirname,
                '..',
                '..',
                'features',
                'executables',
                'midiquantize',
              ),

              [
                file.path,
                newFilePath,
                Object.values(args)[0],
                Object.values(args)[1],
                '-f',
              ],

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
                cleanup(file, newFilePath);
              } else {
                message.reply(`\n\nExecution time: ${elapsed}`);

                message
                  .say({files: [newFilePath]})
                  .then(() => {
                    cleanup(file, newFilePath);
                  })
                  .catch(err => {
                    sendErrorMessage(
                      'Couldn\'t send file to Discord server. The bot doesn\'t have `ATTACH_FILES` perms enabled.',
                      message,
                    );
                    cleanup(file, newFilePath);
                    throw err;
                  });
              }
            });
          });
        })

        .on('error', () => {
          sendErrorMessage('There was an error parsing MIDI file!', message);
        });

      return;
    } catch (e) {
      if (e.message === 'Cannot read property \'url\' of undefined') {
        sendErrorMessage('You must send a MIDI file!', message);
        return;
      }

      sendErrorMessage(e.message, message);
    }

    function cleanup(file, newFilePath) {
      unlink(file.path, err => {
        if (err) {
          sendErrorMessage(
            'Couldn\'t delete file from temporary folder. Contact `tastyFr#3429`.',
            message,
          );
          throw err;
        }
      });
      if (existsSync(newFilePath)) {
        unlink(newFilePath, err => {
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