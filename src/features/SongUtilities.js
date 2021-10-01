const _ = require('lodash');

let totalDurations = [];
let partTracks = [];
let lengths = [];
let allWarnings = [];
let Q = 0;
let doubles = 0;
let combos = 0;
let slides = 0;
let bursts = 0;
let noOfParts = 0;

// eslint-disable-next-line complexity
const getNote = note => {
  switch (note) {
  case 'c5':
  case 'b4':
  case '#a4':
  case 'a4':
  case '#g4':
  case 'g4':
  case '#f4':
  case 'f4':
  case 'e4':
  case '#d4':
  case 'd4':
  case '#c4':
  case 'c4':
  case 'b3':
  case '#a3':
  case 'a3':
  case '#g3':
  case 'g3':
  case '#f3':
  case 'f3':
  case 'e3':
  case '#d3':
  case 'd3':
  case '#c3':
  case 'c3':
  case 'b2':
  case '#a2':
  case 'a2':
  case '#g2':
  case 'g2':
  case '#f2':
  case 'f2':
  case 'e2':
  case '#d2':
  case 'd2':
  case '#c2':
  case 'c2':
  case 'b1':
  case '#a1':
  case 'a1':
  case '#g1':
  case 'g1':
  case '#f1':
  case 'f1':
  case 'e1':
  case '#d1':
  case 'd1':
  case '#c1':
  case 'c1':
  case 'b':
  case '#a':
  case 'a':
  case '#g':
  case 'g':
  case '#f':
  case 'f':
  case 'e':
  case '#d':
  case 'd':
  case '#c':
  case 'c':
  case 'B-1':
  case '#A-1':
  case 'A-1':
  case '#G-1':
  case 'G-1':
  case '#F-1':
  case 'F-1':
  case 'E-1':
  case '#D-1':
  case 'D-1':
  case '#C-1':
  case 'C-1':
  case 'B-2':
  case '#A-2':
  case 'A-2':
  case '#G-2':
  case 'G-2':
  case '#F-2':
  case 'F-2':
  case 'E-2':
  case '#D-2':
  case 'D-2':
  case '#C-2':
  case 'C-2':
  case 'B-3':
  case '#A-3':
  case 'A-3':
    return 7;

  case 'mute':
  case 'empty':
    return 1;

  default:
    return 0;
  }
};

// eslint-disable-next-line complexity
const getLength = (n = '', mode = 0) => {
  let delay = 0;

  if (mode) {
    for (let i = 0; i < n.length; i += 1) {
      switch (n[i]) {
      case 'Q':
        delay += 256 * Q;
        break;

      case 'R':
        delay += 128 * Q;
        break;

      case 'S':
        delay += 64 * Q;
        break;

      case 'T':
        delay += 32 * Q;
        break;

      case 'U':
        delay += 16 * Q;
        break;

      case 'V':
        delay += 8 * Q;
        break;

      case 'W':
        delay += 4 * Q;
        break;

      case 'X':
        delay += 2 * Q;
        break;

      case 'Y':
        delay += Number(Q);
        break;

      default:
        return 0;
      }
    }
  } else {
    for (let i = 0; i < n.length; i += 1) {
      switch (n[i]) {
      case 'H':
        delay += 256 * Q;
        break;

      case 'I':
        delay += 128 * Q;
        break;

      case 'J':
        delay += 64 * Q;
        break;

      case 'K':
        delay += 32 * Q;
        break;

      case 'L':
        delay += 16 * Q;
        break;

      case 'M':
        delay += 8 * Q;
        break;

      case 'N':
        delay += 4 * Q;
        break;

      case 'O':
        delay += 2 * Q;
        break;

      case 'P':
        delay += Number(Q);
        break;

      default:
        return 0;
      }
    }
  }

  return delay;
};

// eslint-disable-next-line complexity
const parseTrack = (score = '', fullJson = '', partNum = 0, trkNum = 0) => {
  const trackLength = [];
  const warnings = [];
  const allNotes = [];
  let mode = 0;
  let double = 0;
  let combo = 0;
  let slide = 0;
  let notes = [];
  let slideLengths = [];
  let data = score;
  let strTile = '';
  let unclosedTile = false;
  let unclosedCurly = '';
  let err = '';

  if (/[\n\r]/.test(data)) {
    data = data.replace(/[\n\r]/g, '');
    warnings.push(
      'Piano Tiles 2 doesn\'t support line breaks! (`\\r` and `\\n`)',
    );
  }

  const commaMissing
    = (data.endsWith(']')
      || data.endsWith('}')
      || data.endsWith('>')
      || data.endsWith('Q')
      || data.endsWith('R')
      || data.endsWith('S')
      || data.endsWith('T')
      || data.endsWith('U')
      || data.endsWith('V')
      || data.endsWith('W')
      || data.endsWith('X')
      || data.endsWith('Y'))
    && (!data.endsWith(',') || !data.endsWith(';'));

  if (data) {
    if (commaMissing) {
      warnings.push(
        `**[PART ${partNum}]:** Track ${trkNum} doesn't end with , or ;`,
      );
      data += ',';
    }
  } else if (trkNum === 1) {
    throw new Error('Track empty!');
  }

  for (let i = 0; i < data.length; i += 1) {
    const pos = fullJson.indexOf(score) + i;

    if (data[i] === '.') {
      if (mode === 2) {
        mode = 1;
      } else {
        err = `Unexpected ${data[i]} at position ${pos}`;
        throw new Error(err);
      }
    } else if (data[i] === '~' || data[i] === '$') {
      if (mode === 2) {
        mode = 1;
      } else {
        err = `Unexpected ${data[i]} at position ${pos}`;
        throw new Error(err);
      }

      notes.push(2);
    } else if (data[i] === '@') {
      if (mode === 2) {
        mode = 1;
      } else {
        err = `Unexpected ${data[i]} at position ${pos}`;
        throw new Error(err);
      }

      notes.push(3);
    } else if (data[i] === '%') {
      if (mode === 2) {
        mode = 1;
      } else {
        err = `Unexpected ${data[i]} at position ${pos}`;
        throw new Error(err);
      }

      notes.push(4);
    } else if (data[i] === '!') {
      if (mode === 2) {
        mode = 1;
      } else {
        err = `Unexpected ${data[i]} at position ${pos}`;
        throw new Error(err);
      }

      notes.push(5);
    } else if (data[i] === '^' || data[i] === '&') {
      if (mode === 2) {
        mode = 1;
      } else {
        err = `Unexpected ${data[i]} at position ${pos}`;
        throw new Error(err);
      }

      notes.push(6);
    } else if (data[i] === '(') {
      if (mode === 0) {
        mode = 1;
      } else {
        err = `Unexpected ${data[i]} at position ${pos}`;
        throw new Error(err);
      }
    } else if (data[i] === ')') {
      if (mode === 2) {
        mode = 3;
      } else {
        err = `Unexpected ${data[i]} at position ${pos}`;
        throw new Error(err);
      }
    } else if (data[i] === '[') {
      if (mode === 3) {
        mode = 4;
      } else {
        err = `Unexpected ${data[i]} at position ${pos}`;
        throw new Error(err);
      }
    } else if (data[i] === ']') {
      if (mode === 6) {
        mode = 5;
      } else {
        err = `Unexpected ${data[i]} at position ${pos}`;
        throw new Error(err);
      }
    } else if (data[i] === ',' || data[i] === ';') {
      if (mode === 5) {
        mode = 0;
      } else if (mode === 0) {
        warnings.push(`Duplicated , or ; at positon ${pos}`);
      } else {
        err = `Unexpected ${data[i]} at position ${pos}`;
        throw new Error(err);
      }
    } else {
      if (data[i] === ' ') {
        warnings.push(
          `**[PART ${partNum}]:** Track ${trkNum} has space at position ${pos}`,
        );
        continue;
      }

      if (data[i] === '{' && mode === 5) {
        if (!unclosedCurly) {
          unclosedCurly += data[i];
        }

        continue;
      }

      if (unclosedCurly) {
        if (data[i] >= 0 && data[i] <= 9) {
          unclosedCurly += data[i];
          continue;
        } else if (data[i] !== '}') {
          err = `Unexpected ${unclosedCurly} at position ${
            fullJson.indexOf(score) + data.indexOf(unclosedCurly)
          }`;
          throw new Error(err);
        }
      }

      if (data[i] === '}' && mode === 5) {
        if (unclosedCurly) {
          unclosedCurly = '';
        }

        continue;
      }

      if (data[i] >= 0 && data[i] <= 9 && mode === 0) {
        strTile += data[i];
        if (!unclosedTile) {
          unclosedTile = true;
        }

        continue;
      }

      if (data[i] === '<' && mode === 0) {
        strTile += data[i];
        continue;
      }

      if (strTile) {
        switch (strTile) {
        case '2<':
          strTile = '';
          break;

        case '3<':
          if (!combo) {
            combo = 1;
          }

          strTile = '';
          break;

        case '5<':
          if (!double) {
            double = 1;
          }

          strTile = '';
          break;

        case '6<':
          strTile = '';
          break;

        case '7<':
        case '8<':
          if (!slide) {
            slide = 1;
          }

          strTile = '';
          break;

        case '9<':
          strTile = '';
          break;

        case '10<':
          strTile = '';
          break;

        default:
          err = `Unexpected ${strTile} at position ${
            fullJson.indexOf(score) + data.indexOf(strTile)
          }`;
          throw new Error(err);
        }
      }

      if (data[i] === '>' && mode === 5) {
        if (unclosedTile) {
          unclosedTile = false;
        }

        if (combo) {
          combo = 0;
        }

        if (double === 2) {
          double = 0;
        }

        if (slide) {
          allNotes.push([1, slideLengths.reduce((a, b) => a + b, 0)]);
          slideLengths = [];
          slide = 0;
        }

        continue;
      }

      let temp = '';

      for (;;) {
        temp += data[i];
        i += 1;

        if (
          i === data.length - 1
          || data[i] === '.'
          || data[i] === '('
          || data[i] === ')'
          || data[i] === '~'
          || data[i] === '['
          || data[i] === ']'
          || data[i] === ','
          || data[i] === ';'
          || data[i] === '<'
          || data[i] === '>'
          || data[i] === '@'
          || data[i] === '%'
          || data[i] === '!'
          || data[i] === '$'
          || data[i] === '^'
          || data[i] === '&'
        ) {
          i -= 1;
          break;
        }
      }

      const note = getNote(temp);
      const length = getLength(temp, 0);
      const rest = getLength(temp, 1);

      if (note) {
        if (mode === 0) {
          mode = 3;
        } else if (mode === 1) {
          mode = 2;
        } else {
          throw new Error('There was an unknown error parsing note!');
        }

        if (note !== 1) {
          notes.push(note);
        }
      } else if (length) {
        if (mode === 4) {
          mode = 6;
        } else {
          throw new Error('There was an unknown error parsing note length!');
        }

        trackLength.push(length);

        if (!combo && !double && !slide) {
          allNotes.push([1, length]);
        } else if (combo === 1) {
          allNotes.push([2, 0]);
        } else if (double === 1) {
          allNotes.push([1, 0]);
          double = 2;
        } else if (slide === 1) {
          slideLengths.push(length);
        }

        const tuplets = notes.filter(x => x === 2).length;
        const arp1 = notes.filter(x => x === 3).length;
        const arp2 = notes.filter(x => x === 4).length;
        const arp3 = notes.filter(x => x === 5).length;
        const ornament = notes.filter(x => x === 6).length;

        if (
          (tuplets > 0 ? 1 : 0)
            + (arp1 > 0 ? 1 : 0)
            + (arp2 > 0 ? 1 : 0)
            + (arp3 > 0 ? 1 : 0)
            + (ornament > 0 ? 1 : 0)
            > 1
          || ornament > 1
        ) {
          throw new Error(`Mixed operators at positon ${pos}`);
        }

        let delay = 0;

        if (arp1) {
          if (arp1 === 1) {
            delay = length / 10;
          } else {
            delay = length / (10 * (arp1 - 1));
          }

          if (delay > length) {
            throw new Error(`Fatal error with @ at positon ${pos}`);
          }
        } else if (arp2) {
          delay = (3 * length) / (10 * arp2);

          if (delay > length) {
            throw new Error(`Fatal error with % at positon ${pos}`);
          }
        } else if (arp3) {
          delay = (3 * length) / (20 * arp3);

          if (delay > length) {
            throw new Error(`Fatal error with ! at positon ${pos}`);
          }
        } else if (ornament) {
          if (
            notes.length !== 3
            || Number(notes[1]) !== 6
            || Number(notes[0]) < 6
            || Number(notes[2]) < 6
          ) {
            throw new Error(
              `There was a problem with ornament at positon ${pos}`,
            );
          }
        }

        notes = [];
      } else if (rest) {
        if (mode === 0) {
          trackLength.push(rest);

          if (!combo && !double && !slide) {
            allNotes.push([0, rest]);
          } else if (combo === 1) {
            allNotes.push([2, 0]);
          } else if (double === 1) {
            allNotes.push([1, 0]);
            double = 2;
          } else if (slide === 1) {
            slideLengths.push(rest);
          }

          mode = 5;
        } else if (mode === 1) {
          warnings.push(
            `Rest "${temp}" at position ${pos} is inside the parenthesis! You should convert it into 'mute'.`,
          );
          mode = 2;
        } else {
          throw new Error('There was an unknown error parsing rest!');
        }
      } else {
        throw new Error(`Couldn't parse "${temp}" at position ${pos}`);
      }
    }
  }

  if (mode !== 0 && mode !== 5) {
    throw new Error('There was an unknown error checking track!');
  }

  if (unclosedTile && strTile) {
    const pos = fullJson.indexOf(score) + data.indexOf(strTile);
    throw new Error(`Unclosed tile! (Position ${pos})`);
  }

  if (unclosedCurly) {
    const pos = fullJson.indexOf(score) + data.indexOf(unclosedCurly);
    throw new Error(`Unclosed curly bracket! (Position ${pos})`);
  }

  partTracks.push({
    scores: allNotes,
  });
  lengths.push(trackLength.reduce((a, b) => a + b, 0));
  allWarnings.push(...warnings);

  if (trkNum === 1) {
    combos = (data.match(/3</g) ?? []).length;
    doubles = (data.match(/5</g) ?? []).length;
    slides = (data.match(/[78]</g) ?? []).length;
    bursts = (data.match(/10</g) ?? []).length;
  }
};

// eslint-disable-next-line complexity
const checkBaseBeats = parsedBaseBeats => {
  switch (parsedBaseBeats) {
  case 15:
    Q = 1;
    break;

  case 7.5:
    Q = 2;
    break;

  case 5:
    Q = 3;
    break;

  case 3.75:
    Q = 4;
    break;

  case 3:
    Q = 5;
    break;

  case 2.5:
    Q = 6;
    break;

  case 1.875:
    Q = 8;
    break;

  case 1.5:
    Q = 10;
    break;

  case 1.25:
    Q = 12;
    break;

  case 1:
    Q = 15;
    break;

  case 0.9375:
    Q = 16;
    break;

  case 0.75:
    Q = 20;
    break;

  case 0.625:
    Q = 24;
    break;

  case 0.5:
    Q = 30;
    break;

  case 0.46875:
    Q = 32;
    break;

  case 0.375:
    Q = 40;
    break;

  case 0.3125:
    Q = 48;
    break;

  case 0.25:
    Q = 60;
    break;

  case 0.234375:
    Q = 64;
    break;

  case 0.1875:
    Q = 80;
    break;

  case 0.15625:
    Q = 96;
    break;

  case 0.125:
    Q = 120;
    break;

  case 0.1171875:
    Q = 128;
    break;

  case 0.09375:
    Q = 160;
    break;

  case 0.078125:
    Q = 192;
    break;

  case 0.0625:
    Q = 240;
    break;

  case 0.05859375:
    Q = 256;
    break;

  case 0.046875:
    Q = 320;
    break;

  case 0.0390625:
    Q = 384;
    break;

  case 0.03125:
    Q = 480;
    break;

  case 0.029296875:
    Q = 512;
    break;

  case 0.0234375:
    Q = 640;
    break;

  case 0.01953125:
    Q = 768;
    break;

  case 0.015625:
    Q = 960;
    break;

  default:
    throw new Error('Wrong baseBeats value!');
  }
};

const getPoints = (length, songBaseBeats, midBaseBeats) => {
  const tileLength = (length * (0.03125 / songBaseBeats)) / midBaseBeats;
  let m = tileLength % 1;

  if (tileLength === 1 && m === 0) {
    m = 0;
  } else if (tileLength < 1.5 && tileLength > 1) {
    m = 1;
  } else if (tileLength < 2 && tileLength >= 1.5) {
    m = 2;
  }

  if (tileLength === 2) {
    m = 1;
  } else if (tileLength > 2 && m < 0.5) {
    m = 1;
  } else if ((tileLength > 2 && m >= 0.5) || (tileLength > 2 && m < 1)) {
    m = 2;
  }

  return Math.trunc(tileLength) + m;
};

const hasProperty = (JSON_, propertyName) =>
  Boolean(Object.prototype.hasOwnProperty.call(JSON_, propertyName));

const Messages = {
  BASEBPM_MISSING: '"baseBpm" in JSON file is missing!',
  BASEBPM_INVALID: '"baseBpm" in JSON file is not a number!',

  FIRST_START_VALUE_INVALID:
    'JSON: First element in "start" inside "audition" is not a number.',
  SECOND_START_VALUE_INVALID:
    'JSON: Second element in "start" inside "audition" is not a number.',

  START_OBJECT_INVALID:
    'JSON: "start" inside "audition" object is not an array!',
  START_OBJECT_MISSING: 'JSON: "start" inside "audition" object is missing!',

  FIRST_END_VALUE_INVALID:
    'JSON: First element in "end" inside "audition" is not a number.',
  SECOND_END_VALUE_INVALID:
    'JSON: Second element in "end" inside "audition" is not a number.',

  END_OBJECT_INVALID: 'JSON: "end" inside "audition" object is not an array!',
  END_OBJECT_MISSING: 'JSON: "end" inside "audition" object is missing!',

  AUDITION_OBJECT_INVALID: '"audition" in JSON file is not an object!',

  TYPEOF_MUSICS_INVALID: '"musics" is not an array!',

  MISSING_SONG_PARTS: 'Song must have exactly **three parts or greater!**',

  ID_VALUE_INVALID: '"id" value is not a number!',
  ID_VALUE_IN_WRONG_ORDER: (x, y) =>
    `Expected "id" value to be ${x}, but got ${y}`,
  ID_MISSING: '"id" is missing!',

  BPM_VALUE_INVALID: '"bpm" value is not a number!',
  BPM_VALUE_IS_ZERO: '"bpm" value must be greater than 0!',
  BPM_MISSING:
    '"bpm" is missing!\n\nTry typing `pt2::jsoninfo 120 120 (...etc)`',

  BASEBEATS_INVALID: '"baseBeats" value is not a number!',
  BASEBEATS_MISSING: '"baseBeats" is missing!',

  SCORES_INVALID: '"scores" is not an array!',
  SCORES_NOT_EQUAL: '"scores" aren\'t equal to number of "instruments"!',

  TRACK_EMPTY: 'No tracks.',
  TRACK_TYPE_INVALID: x => `Incorrect track type: '${x}'`,
  TRACK_ERROR_MESSAGE: (x, y) => `Track ${x}: ${y}`,
  TRACK_TOO_SHORT: (x, y, z) =>
    `**[PART ${x}]:** Track ${y} is shorter than the first track (${z} ticks)`,
  TRACK_TOO_LONG: (x, y, z) =>
    `**[PART ${x}]:** Track ${y} is too long (${z} ticks)`,

  INVALID_INSTRUMENT: x => `Instrument ${x} is not a string type!`,
  INSTRUMENT_NO_NAME: (x, y) => `**[PART ${x}]:** Instrument ${y} has no name!`,
  TYPEOF_INSTRUMENTS_INVALID: '"instruments" is not an array!',

  TYPEOF_ALTERNATIVE_INVALID: x =>
    `Alternative instrument ${x} is not a string type!`,
  TYPEOF_ALTERNATIVES_INVALID: '"alternatives" is not an array!',

  PART_ERROR_MESSAGE: (x, y) => `**[PART ${x}]:** ${y}`,
};

const parseJSON = (data, ...args) => {
  const JSON_ = String(data);
  const arraySpeeds = [];
  const allBaseBeats = [];
  const trackLengths = [];
  const allPoints = [0, 0, 0];
  const firstTracks = [];
  const songData = {
    parts: [],
  };
  let durationInSeconds = 0;
  let pointsPerRound = 0;
  let JSONData = {};

  try {
    JSONData = JSON.parse(JSON_);
  } catch (err) {
    throw new Error(err.message);
  }

  if (!hasProperty(JSONData, 'baseBpm')) {
    throw new Error(Messages.BASEBPM_MISSING);
  } else if (typeof JSONData.baseBpm !== 'number') {
    throw new Error(Messages.BASEBPM_INVALID);
  }

  checkMusics();

  if (hasProperty(JSONData, 'audition')) {
    if (JSONData.audition.constructor === Object) {
      if (hasProperty(JSONData.audition, 'start')) {
        if (Array.isArray(JSONData.audition.start)) {
          if (typeof JSONData.audition.start[0] !== 'number') {
            throw new Error(Messages.FIRST_START_VALUE_INVALID);
          }

          if (typeof JSONData.audition.start[1] !== 'number') {
            throw new Error(Messages.SECOND_START_VALUE_INVALID);
          }
        } else if (JSONData.audition.start !== null) {
          throw new Error(Messages.START_OBJECT_INVALID);
        }
      } else {
        allWarnings.push(Messages.START_OBJECT_MISSING);
      }

      if (hasProperty(JSONData.audition, 'end')) {
        if (Array.isArray(JSONData.audition.end)) {
          if (typeof JSONData.audition.end[0] !== 'number') {
            throw new Error(Messages.FIRST_END_VALUE_INVALID);
          }

          if (typeof JSONData.audition.end[1] !== 'number') {
            throw new Error(Messages.SECOND_END_VALUE_INVALID);
          }
        } else if (JSONData.audition.end !== null) {
          throw new Error(Messages.END_OBJECT_INVALID);
        }
      } else {
        allWarnings.push(Messages.END_OBJECT_MISSING);
      }
    } else {
      throw new Error(Messages.AUDITION_OBJECT_INVALID);
    }
  }

  const warningsText = [];

  if (allWarnings.length > 0) {
    allWarnings = allWarnings.map(warning => `- ${warning}`);
    warningsText.push(...allWarnings);
  }

  const result = {
    warnings: warningsText.join('\n'),
    speeds: arraySpeeds,
    baseBeats: allBaseBeats,
    numberOfDoubles: doubles,
    numberOfCombos: combos,
    numberOfSlides: slides,
    numberOfBursts: bursts,
    score: pointsPerRound,
    duration: durationInSeconds,
    numberOfParts: noOfParts,
  };

  totalDurations = [];
  partTracks = [];
  lengths = [];
  allWarnings = [];
  Q = 0;
  doubles = 0;
  combos = 0;
  slides = 0;
  bursts = 0;
  return result;

  function checkMusics() {
    if (hasProperty(JSONData, 'musics')) {
      const arrMusics = JSONData.musics;
      noOfParts = arrMusics.length;

      if (!Array.isArray(arrMusics)) {
        throw new Error(Messages.TYPEOF_MUSICS_INVALID);
      } else if (arrMusics.length < 3) {
        throw new Error(Messages.MISSING_SONG_PARTS);
      } else {
        let songBpm = 0.0;
        let songBaseBeats = 0.0;
        let partN = 1;
        const id = [];
        arrMusics.forEach(part => {
          try {
            let scoreId = 0;
            let trackN = 1;
            const tracks = part.scores;
            id.push(tracks);

            if (hasProperty(part, 'id')) {
              scoreId = part.id;

              if (typeof scoreId !== 'number') {
                throw new Error(Messages.ID_VALUE_INVALID);
              } else if (scoreId !== partN) {
                throw new Error(
                  // eslint-disable-next-line new-cap
                  Messages.ID_VALUE_IN_WRONG_ORDER(partN, scoreId),
                );
              }
            } else {
              throw new Error(Messages.ID_MISSING);
            }

            if (hasProperty(part, 'bpm')) {
              songBpm = part.bpm;

              if (typeof songBpm !== 'number') {
                throw new Error(Messages.BPM_VALUE_INVALID);
              } else if (songBpm <= 0) {
                throw new Error(Messages.BPM_VALUE_IS_ZERO);
              }
            } else {
              if (!args.length) {
                throw new Error(Messages.BPM_MISSING);
              }

              songBpm = args[0];
              args.shift();
            }

            if (hasProperty(part, 'baseBeats')) {
              songBaseBeats = part.baseBeats;

              if (typeof songBaseBeats !== 'number') {
                throw new Error(Messages.BASEBEATS_INVALID);
              }
            } else {
              throw new Error(Messages.BASEBEATS_MISSING);
            }

            checkBaseBeats(songBaseBeats);
            arraySpeeds.push(
              `\`${(songBpm / songBaseBeats / 60).toFixed(6)}\``,
            );
            allBaseBeats.push(`\`${songBaseBeats}\``);

            if (!Array.isArray(tracks)) {
              throw new Error(Messages.SCORES_INVALID);
            }

            if (!tracks.length) {
              throw new Error(Messages.TRACK_EMPTY);
            }

            tracks.forEach(currentTrack => {
              const track = currentTrack;

              try {
                if (typeof track !== 'string') {
                  // eslint-disable-next-line new-cap
                  throw new Error(Messages.TRACK_TYPE_INVALID(typeof track));
                }

                parseTrack(track, JSON_, partN, trackN);

                if (trackN === 1) {
                  firstTracks.push(track);
                }
              } catch (err) {
                throw new Error(
                  // eslint-disable-next-line new-cap
                  Messages.TRACK_ERROR_MESSAGE(trackN, err.message),
                );
              }

              if (trackN === tracks.length) {
                trackLengths.push(lengths);
                songData.parts.push({
                  tracks: partTracks,
                });
                lengths = [];
                partTracks = [];
              }

              trackN += 1;
            });
            trackLengths.forEach(length => {
              length.forEach((currentLength, num) => {
                const diff = Number(length[0]) - Number(currentLength);

                if (diff > 0) {
                  allWarnings.push(
                    // eslint-disable-next-line new-cap
                    Messages.TRACK_TOO_SHORT(partN, num + 1, diff),
                  );
                } else if (diff < 0) {
                  allWarnings.push(
                    // eslint-disable-next-line new-cap
                    Messages.TRACK_TOO_LONG(partN, num + 1, diff),
                  );
                }
              });
              trackLengths.shift();
            });

            if (hasProperty(part, 'instruments')) {
              if (Array.isArray(part.instruments)) {
                if (part.scores > part.instruments.length) {
                  throw new Error(Messages.SCORES_NOT_EQUAL);
                }

                let instNum = 0;
                part.instruments.forEach(inst => {
                  if (typeof inst !== 'string') {
                    // eslint-disable-next-line new-cap
                    throw new Error(Messages.INVALID_INSTRUMENT(instNum + 1));
                  }

                  if (!inst && typeof part.scores[instNum] !== 'undefined') {
                    allWarnings.push(
                      // eslint-disable-next-line new-cap
                      Messages.INSTRUMENT_NO_NAME(partN, instNum + 1),
                    );
                  }

                  instNum += 1;
                });
              } else {
                throw new Error(Messages.TYPEOF_INSTRUMENTS_INVALID);
              }
            }

            if (hasProperty(part, 'alternatives')) {
              if (Array.isArray(part.alternatives)) {
                let altNum = 0;
                part.alternatives.forEach(inst => {
                  if (typeof inst !== 'string' && inst !== null) {
                    throw new Error(
                      // eslint-disable-next-line new-cap
                      Messages.TYPEOF_ALTERNATIVE_INVALID(altNum + 1),
                    );
                  }

                  altNum += 1;
                });
              } else {
                throw new Error(Messages.TYPEOF_ALTERNATIVES_INVALID);
              }
            }
          } catch (err) {
            // eslint-disable-next-line new-cap
            throw new Error(Messages.PART_ERROR_MESSAGE(partN, err.message));
          }

          partN += 1;
        });
        songData.parts.forEach(({tracks}) => {
          tracks[0].scores.forEach(score => {
            if (score[0] === 1 && score[1] > 0) {
              allPoints[1] += getPoints(score[1], songBaseBeats, Q);
            } else if (score[0] === 1 && score[1] === 0) {
              allPoints[0] += 4;
            } else if (score[0] === 2 && score[1] === 0) {
              allPoints[0] += 1;
            }
          });
        });
        const allBgPoints = firstTracks.map((firstTrack, i) => {
          let firstTrackBg = firstTrack
            .replace(/;/g, ',')
            .replace(/,,/g, ',')
            .replace(/empty|mute|[\d!#$%&().@A-G[\]a-g{|}~^-]/g, '')
            .replace(/[<>]/g, '|')
            .replace(/P/g, 'P'.repeat(1))
            .replace(/O/g, 'P'.repeat(2))
            .replace(/N/g, 'P'.repeat(4))
            .replace(/M/g, 'P'.repeat(8))
            .replace(/L/g, 'P'.repeat(16))
            .replace(/K/g, 'P'.repeat(32))
            .replace(/J/g, 'P'.repeat(64))
            .replace(/I/g, 'P'.repeat(128))
            .replace(/H/g, 'P'.repeat(256))
            .replace(/Y/g, 'Y'.repeat(1))
            .replace(/X/g, 'Y'.repeat(2))
            .replace(/W/g, 'Y'.repeat(4))
            .replace(/V/g, 'Y'.repeat(8))
            .replace(/U/g, 'Y'.repeat(16))
            .replace(/T/g, 'Y'.repeat(32))
            .replace(/S/g, 'Y'.repeat(64))
            .replace(/R/g, 'Y'.repeat(128))
            .replace(/Q/g, 'Y'.repeat(256))
            .split('|');

          for (let j = 1; j < firstTrackBg.length; j += 2) {
            firstTrackBg[j] = firstTrackBg[j].replace(/Y/g, 'P');
            firstTrackBg[j] = firstTrackBg[j].replace(/,/g, '');
          }

          firstTrackBg = firstTrackBg.join('');
          firstTrackBg = firstTrackBg.split(',').filter(r => r);

          for (let j = 1; j < id[i].length; j += 1) {
            let newId = id[i][j]
              .replace(/;/g, ',')
              .replace(/,,/g, ',')
              .replace(/empty|mute|[\d!#$%&().<>@A-G[\]a-g{|}~^-]/g, '')
              .replace(/,,/g, ',')
              .replace(/P/g, 'P'.repeat(1))
              .replace(/O/g, 'P'.repeat(2))
              .replace(/N/g, 'P'.repeat(4))
              .replace(/M/g, 'P'.repeat(8))
              .replace(/L/g, 'P'.repeat(16))
              .replace(/K/g, 'P'.repeat(32))
              .replace(/J/g, 'P'.repeat(64))
              .replace(/I/g, 'P'.repeat(128))
              .replace(/H/g, 'P'.repeat(256))
              .replace(/Y/g, 'Y'.repeat(1))
              .replace(/X/g, 'Y'.repeat(2))
              .replace(/W/g, 'Y'.repeat(4))
              .replace(/V/g, 'Y'.repeat(8))
              .replace(/U/g, 'Y'.repeat(16))
              .replace(/T/g, 'Y'.repeat(32))
              .replace(/S/g, 'Y'.repeat(64))
              .replace(/R/g, 'Y'.repeat(128))
              .replace(/Q/g, 'Y'.repeat(256))
              .split(',');

            for (let k = 0; k < newId.length; k += 1) {
              newId[k] = newId[k].replace(/Y/g, '0,');

              if (newId[k].indexOf('P') === 0) {
                newId[k] = newId[k].replace(/P/g, '0,');
                newId[k] = `1,${newId[k].substring(2)}`;
              }
            }

            newId = newId.join('');
            newId = newId.split(',');

            for (let k = 0; k < newId.length; k += 1) {
              newId[k] = Number(newId[k]);

              if (Number.isNaN(newId[k])) {
                newId[k] = 0;
              }
            }

            id[i][j] = newId;
          }

          id[i].shift();

          let idBg = _.unzipWith(id[i], _.add);

          for (let j = 0; j < idBg.length; j += 1) {
            if (idBg[j] > 0) {
              idBg[j] = 1;
            }
          }

          idBg = idBg.join('');

          for (let j = 0; j < firstTrackBg.length; j += 1) {
            if (firstTrackBg[j].includes('Y')) {
              firstTrackBg[j] = `|${firstTrackBg[j]}|`;
            }
          }

          firstTrackBg = firstTrackBg.join('');
          firstTrackBg = firstTrackBg.replace(/\|\|/g, '|');
          firstTrackBg = firstTrackBg.split('|');
          const array = [];

          for (let j = 0; j < firstTrackBg.length; j += 1) {
            const k = firstTrackBg[j].length;
            firstTrackBg[j] = firstTrackBg[j].replace(/P/g, '2');
            firstTrackBg[j] = firstTrackBg[j].replace(/Y/g, '0');
            idBg = `${idBg.substring(0, k)},${idBg.substring(k)}`;
            idBg = idBg.split(',');
            array.push(idBg[0]);
            idBg = idBg[1];
          }

          for (let j = 0; j < firstTrackBg.length; j += 1) {
            if (firstTrackBg[j].includes('2')) {
              firstTrackBg[j] = firstTrackBg[j].replace(/2/g, '');
            } else if (
              firstTrackBg[j].includes('0')
              && array[j].includes('1')
            ) {
              firstTrackBg[j] = firstTrackBg[j].replace(/0/g, 'P');
            } else {
              firstTrackBg[j] = '';
            }
          }

          const firstTrackBgNew = firstTrackBg.map(({length}) =>
            getPoints(length, songBaseBeats, 1),
          );
          firstTrackBg = firstTrackBgNew;
          let normalFirstTrackCalc = 0;

          for (let j = 0; j < firstTrackBg.length; j += 1) {
            normalFirstTrackCalc += firstTrackBg[j];
          }

          return normalFirstTrackCalc;
        });
        allPoints[2] = allBgPoints.reduce((a, b) => a + b, 0);
        pointsPerRound = allPoints.reduce((a, b) => a + b, 0).toFixed();
        totalDurations.push(
          ...[].concat(
            firstTracks.map(t => {
              const p = t
                .replace(/empty|mute|[\d!#$%&(),.;<>@A-G[\]a-g{}~^-]/g, '')
                .replace(/Q/g, 'RR')
                .replace(/R/g, 'SS')
                .replace(/S/g, 'TT')
                .replace(/T/g, 'UU')
                .replace(/U/g, 'VV')
                .replace(/V/g, 'WW')
                .replace(/W/g, 'XX')
                .replace(/X/g, 'YY')
                .replace(/Y/g, 'P')
                .replace(/H/g, 'II')
                .replace(/I/g, 'JJ')
                .replace(/J/g, 'KK')
                .replace(/K/g, 'LL')
                .replace(/L/g, 'MM')
                .replace(/M/g, 'NN')
                .replace(/N/g, 'OO')
                .replace(/O/g, 'PP');
              return (p.match(/P/g) || []).length;
            }),
          ),
        );
        durationInSeconds
          = totalDurations
            .map((n, i) => {
              const baseBeat = parseFloat(allBaseBeats[i].replace(/`/g, ''));
              const speed = parseFloat(arraySpeeds[i].replace(/`/g, ''));
              return (n * (0.03125 / baseBeat)) / speed;
            })
            .reduce((a, b) => a + b, 0) * 1000;
      }
    } else {
      throw new Error('"musics" in JSON file is missing!');
    }
  }
};

const getNewBPM = (
  currentBpm,
  currentBaseBeats,
  nextBaseBeats,
  reachedThreeCrowns,
) => {
  const f32 = new Float32Array(11);
  let int1 = 0;
  let int2 = currentBpm;
  f32[10] = currentBaseBeats;
  f32[9] = Number(int2 >>> 0);
  int1 = Number(f32[9]);
  f32[8] = int1 / Number(f32[10]);
  f32[7] = Number(f32[8]) - (reachedThreeCrowns ? 130 : 100);
  f32[6] = Number(f32[7]) * Math.fround(0.001);
  f32[5] = Math.fround(1.3) - Number(f32[6]);
  f32[4] = Number(f32[8]) / 60;
  int1
    = Number(f32[5]) < Math.fround(1.04) ? Math.fround(1.04) : Number(f32[5]);
  f32[3] = int1;
  int1 = Number(f32[4]);
  f32[2] = int1 * Number(f32[3]);
  f32[1] = Number(f32[2]) * 60;
  f32[0] = Number(f32[1]) * nextBaseBeats;
  int1 = Number(f32[0]);
  int2 = ~~int1;
  int1 = Number(int2 | 0);
  return int1;
};

exports.checkErrors = (data, args) =>
  new Promise((resolve, reject) => {
    try {
      resolve(parseJSON(data, ...args));
    } catch (err) {
      reject(err);
    }
  });

exports.getNewBPM = getNewBPM;