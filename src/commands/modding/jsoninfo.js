const https = require('https');
const {parse} = require('path');
const {performance} = require('perf_hooks');
const {Command} = require('discord.js-commando');
const prettyMilliseconds = require('pretty-ms');
const SongUtilities = require('../../features/SongUtilities');

const compareSpeeds = ({speeds}, diffNumber) => {
  speeds.forEach(speed => {
    const newSpeed = speed.replace(/`/g, '');

    if (parseFloat(newSpeed) >= 0) {
      diffNumber += 1;
    }

    if (parseFloat(newSpeed) >= 4) {
      diffNumber += 1;
    }

    if (parseFloat(newSpeed) >= 4.7) {
      diffNumber += 1;
    }

    if (parseFloat(newSpeed) >= 6) {
      diffNumber += 1;
    }

    if (parseFloat(newSpeed) >= 6.7) {
      diffNumber += 1;
    }

    if (parseFloat(newSpeed) >= 8.4) {
      diffNumber += 3;
    }

    if (parseFloat(newSpeed) >= 9.8) {
      diffNumber += 2;
    }

    if (parseFloat(newSpeed) >= 10.5) {
      diffNumber += 2;
    }

    if (parseFloat(newSpeed) >= 12.5) {
      diffNumber += 2;
    }
  });
  return diffNumber;
};

const getDiffText = (diffNumber, diff, diffColor) => {
  if (diffNumber >= 0 && diffNumber < 4) {
    diff = 'Very Easy';
    diffColor = [0, 255, 255];
  } else if (diffNumber >= 4 && diffNumber < 7) {
    diff = 'Easy';
    diffColor = [0, 255, 0];
  } else if (diffNumber >= 7 && diffNumber < 10) {
    diff = 'Easy/Medium';
    diffColor = [157, 255, 28];
  } else if (diffNumber >= 10 && diffNumber < 13) {
    diff = 'Medium';
    diffColor = [255, 255, 0];
  } else if (diffNumber >= 13 && diffNumber < 16) {
    diff = 'Hard';
    diffColor = [255, 0, 0];
  } else if (diffNumber >= 16 && diffNumber < 19) {
    diff = 'Very Hard';
    diffColor = [153, 0, 0];
  } else if (diffNumber >= 19 && diffNumber < 22) {
    diff = 'Extreme';
    diffColor = [153, 0, 255];
  } else if (diffNumber >= 22 && diffNumber < 25) {
    diff = 'Legendary';
    diffColor = [0, 0, 255];
  } else if (diffNumber >= 25) {
    diff = '(?)';
    diffColor = [217, 224, 248];
  }

  return {diff, diffColor};
};

const compareDoubleTiles = ({numberOfDoubles}, diffNumber) => {
  if (numberOfDoubles >= 200) {
    diffNumber += 1;
  }

  if (numberOfDoubles >= 400) {
    diffNumber += 1;
  }

  if (numberOfDoubles >= 800) {
    diffNumber += 1;
  }

  if (numberOfDoubles >= 1200) {
    diffNumber += 1;
  }

  return diffNumber;
};

module.exports = class JSONInfoCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'jsoninfo',
      aliases: ['ji', 'songinfo', 'si'],
      group: 'modding',
      memberName: 'jsoninfo',
      clientPermissions: ['SEND_MESSAGES', 'EMBED_LINKS'],
      description:
        'Checks the Piano Tiles 2 song (.JSON), and then returns the information.',
      examples: ['pt2::jsoninfo *PT2 Song in JSON* (bpm) (bpm) (...etc)'],
      args: [
        {
          key: 'BPMs',
          prompt: 'type the BPM values to check for errors.\n',
          type: 'float',
          validate: val => val > 0,
          default: '',
          infinite: true,
        },
      ],
    });
  }

  run(message, ...args) {
    const sendErrorMessage = errorMessage => {
      message.channel.stopTyping(true);
      return message.replyEmbed({
        title: `"${this.name}" error!`,
        color: [255, 0, 0],
        description: errorMessage,
      });
    };

    message.channel.startTyping(9999);

    function process(data, songName, now) {
      SongUtilities.checkErrors(data, args[0].BPMs)
        .then(result => {
          let diffNumber = 0;
          let diff = '';
          let diffColor = [];

          diffNumber = compareSpeeds(result, diffNumber);

          diffNumber = compareDoubleTiles(result, diffNumber);

          if (result.duration >= 3600 && result.numberOfDoubles >= 200) {
            diffNumber += 1;
          }

          if (result.numberOfParts === 3) {
            const baseBeats = result.baseBeats.map(baseBeat =>
              baseBeat.replace(/`/g, ''),
            );
            let bpm = args[0].BPMs[2];
            let speeds = [];
            const arrSpeeds = [];

            for (let i = 0; i < args.laps - 1; i += 1) {
              bpm = SongUtilities.getNewBPM(
                bpm,
                baseBeats[2],
                baseBeats[0],
                i >= 2,
              );
              speeds.push((+(bpm >>> 0) / baseBeats[0] / 60).toFixed(6));

              bpm = SongUtilities.getNewBPM(
                bpm,
                baseBeats[0],
                baseBeats[1],
                i >= 2,
              );
              speeds.push((+(bpm >>> 0) / baseBeats[1] / 60).toFixed(6));

              bpm = SongUtilities.getNewBPM(
                bpm,
                baseBeats[1],
                baseBeats[2],
                i >= 2,
              );
              speeds.push((+(bpm >>> 0) / baseBeats[2] / 60).toFixed(6));

              arrSpeeds.push(speeds);
              speeds = [];
            }

            for (let i = 0; i < arrSpeeds.length; i += 1) {
              const j = i < 2 ? 2 : 0;

              for (let k = 0; k < j; k += 1) {
                if (parseFloat(arrSpeeds[i][k]) >= 10.5) {
                  diffNumber += 1;
                }
              }
            }
          }

          if (diffNumber >= 25) {
            diffNumber = 25;
          }

          ({diff, diffColor} = getDiffText(diffNumber, diff, diffColor));

          const tilesInfo = [
            `Double tiles: **${result.numberOfDoubles}**`,
            `Combo tiles: **${result.numberOfCombos}**`,
            `Slide tiles: **${result.numberOfSlides}**`,
            `Burst tiles: **${result.numberOfBursts}**`,
          ];

          message.channel.stopTyping(true);

          if (result.warnings) {
            message.replyEmbed({
              color: [255, 255, 0],
              title: 'WARNINGS:',
              description: result.warnings,
            });
          }

          const embed = {
            color: Math.floor(Math.random() * 0xffffff).toString(16),
            fields: [
              {
                name: 'Title:',
                value: songName,
              },
            ],
          };

          if (result.numberOfParts === 3) {
            embed.color = diffColor;

            const durationText = prettyMilliseconds(result.duration, {
              secondsDecimalDigits: 0,
            });

            embed.fields.push(
              {
                name: 'Points per round:',
                value: result.score,
                inline: true,
              },
              {
                name: '3-crown points:',
                value: result.score * 3,
                inline: true,
              },
              {
                name: 'Duration:',
                value: durationText,
              },
              {
                name: 'Speeds:',
                value: result.speeds.join(', '),
              },
            );
          }

          embed.fields.push(
            {
              name: 'baseBeats:',
              value: result.baseBeats.join(', '),
              inline: true,
            },
            {
              name: 'Tiles info:',
              value: tilesInfo.join('\n'),
            },
          );

          if (result.numberOfParts === 3) {
            embed.color = diffColor;

            embed.fields.push({
              name: 'Calculated difficulty:',
              value: `**${diff}**`,
            });

            embed.fields.push({
              name: 'Difficulty rating based on calculation:',
              value: `**${parseFloat(
                ((diffNumber / 25) * 10).toFixed(1),
              )} of 10**`,
            });
          }

          const elapsed = prettyMilliseconds(performance.now() - now, {
            secondsDecimalDigits: 0,
          });

          embed.footer = {
            text: `Execution time: ${elapsed}`,
          };

          if (result.warnings) {
            message.say({embed});
          } else {
            message.replyEmbed(embed);
          }
        })
        .catch(err => {
          sendErrorMessage(err.message, message);
        });
    }

    let attachment = '';

    try {
      const now = performance.now();

      attachment = message.attachments.first().url;

      const songName = parse(attachment)
        .name.replace(/[_\s]+/g, ' ')
        .trim();

      https
        .get(attachment, response => {
          let data = '';

          response.on('data', chunks => {
            data += chunks;
          });

          response.on('end', async () => {
            const fileSize = data.length;

            if (fileSize >= 50000) {
              message.say(
                `**WARNING:** File is ${(
                  fileSize / 1024
                ).toFixed()}kb! This will take a while, so please be patient!`,
              );
            }

            process(data, songName, now);
          });
        })
        .on('error', () => {
          sendErrorMessage(
            'There was an error getting the data from JSON!',
            message,
          );
        });
      return;
    } catch (e) {
      if (e.message === 'Cannot read property \'url\' of undefined') {
        sendErrorMessage('You must send a JSON file!', message);
        return;
      }

      sendErrorMessage(e.message, message);
    }
  }
};