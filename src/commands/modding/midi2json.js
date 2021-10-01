const {execFile} = require('child_process');
const {createWriteStream, existsSync, renameSync, unlink} = require('fs');
const https = require('https');
const {join} = require('path');
const {performance} = require('perf_hooks');
const {Command} = require('discord.js-commando');
const prettyMilliseconds = require('pretty-ms');

module.exports = class Midi2JsonCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'midi2json',
      aliases: ['m2j'],
      group: 'modding',
      memberName: 'midi2json',
      clientPermissions: ['SEND_MESSAGES', 'EMBED_LINKS', 'ATTACH_FILES'],
      description: `Converts MIDI file into a Piano Tiles 2 code.

\`<Q tick>\` - MIDI tick for Q
\`<DT track>\` - MIDI track number for double tiles (\`5<>\`)
\`<DT tick>\` - MIDI tick for double tiles
\`<IR track>\` - Ignore rests (\`Q-Y\`) on track number

(Credits to **Volian0** for [midi2json](https://github.com/Volian0/midi2json) source code!)`,
      examples: [
        'pt2::midi2json *MIDI File* <Q tick> <DT track> <DT tick> <IR track>',
      ],
      args: [
        {
          key: 'Q tick',
          prompt: 'type the MIDI tick value for Q.\n',
          type: 'float',
        },
        {
          key: 'DT track',
          prompt:
            'type the track number to put double tiles on. Type `0` to disable.\n',
          type: 'float',
        },
        {
          key: 'DT tick',
          prompt:
            'type the MIDI tick value for double tiles. Type `0` to disable.\n',
          type: 'float',
        },
        {
          key: 'IR track',
          prompt:
            'type the MIDI track number to disable rests on. Type `0` to disable.\n',
          type: 'float',
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

      const file = createWriteStream(`../${Date.now()}.mid`, {
        highWaterMark: 65536,
      });

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

          execFile(
            join(__dirname, '..', '..', 'features', 'executables', 'midi2json'),

            [
              file.path,
              args['Q tick'],
              args['DT track'],
              args['DT track'],
              args['IR track'],
            ],

            (error, stdout) => {
              output = String(stdout);

              if (error) {
                errorMessage = String(error);
              }
            },
          ).on('close', () => {
            const newName = `Generated_${Date.now()}.txt`;

            if (existsSync('log.txt')) {
              renameSync('log.txt', newName);
            }

            if (errorMessage) {
              sendErrorMessage(`\`\`\`${getErrorMessage()}\`\`\``, message);

              cleanup(newName);
            } else {
              const elapsed = prettyMilliseconds(performance.now() - now, {
                secondsDecimalDigits: 0,
              });

              if (existsSync(newName)) {
                message.channel.stopTyping(true);

                message
                  .reply(
                    `\n\nExecution time: ${elapsed}\n\`\`\`${output}\`\`\``,
                    {
                      files: [newName],
                    },
                  )
                  .then(() => cleanup(newName));
              } else if (output.endsWith('Bad MIDI data input\n')) {
                sendErrorMessage('```Not a valid MIDI file.```', message);
              } else {
                sendErrorMessage(`\`\`\`${output}\`\`\``, message);
              }
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

    function cleanup(newName) {
      if (existsSync(newName)) {
        unlink(newName, err => {
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