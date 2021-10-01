const {execFile} = require('child_process');
const {createWriteStream, unlink, existsSync} = require('fs');
const https = require('https');
const {join, parse} = require('path');
const {performance} = require('perf_hooks');
const {Command} = require('discord.js-commando');
const prettyMilliseconds = require('pretty-ms');

module.exports = class MidiAlignCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'midialign',
      aliases: ['ma'],
      group: 'modding',
      memberName: 'midialign',
      clientPermissions: ['SEND_MESSAGES', 'ATTACH_FILES'],
      description: `Changes the tempo of a MIDI file whilst maintaining the original playback speed.

(Credits to **Volian0** for [midialign](https://github.com/Volian0/midialign) source code!)`,
      examples: ['pt2::midialign *MIDI File* <desired BPM>'],
      args: [
        {
          key: 'desired BPM value',
          prompt: 'type your desired BPM value.\n',
          type: 'float',
          validate: val => val >= 10,
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
      );

      https
        .get(attachment, response => {
          response.pipe(file);

          let output = '';
          let errorMessage = '';

          const getErrorMessage = () => {
            output = output.split(/\r|\n/).filter(text => text);
            return (
              output[output.length - 1]
              || `\`\`\`Unknown error has occurred!\`\`\`

Either no reason or this command cannot process large MIDI file!`
            );
          };

          const newFileName = `${parse(attachment).name}_${
            Object.values(args)[0]
          }BPM.mid`;
          const newFilePath = join(
            __dirname,
            '..',
            '..',
            '..',
            'temp',
            newFileName,
          );

          execFile(
            join(__dirname, '..', '..', 'features', 'executables', 'midialign'),

            [file.path, Object.values(args)[0], newFilePath],

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