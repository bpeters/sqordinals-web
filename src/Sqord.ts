export {};

declare global {
  var Q5: any;
}

let q5 = new Q5();

let lcg_index = 0;

let moveSteps = 0;
let moveStepsR = 0;
let moveSegments = 0;
let moveSegmentsR = 0;

let moveSteps2 = 0;
let moveStepsR2 = 0;
let moveSegments2 = 0;
let moveSegmentsR2 = 0;

function lcg() {
  const a = 1664525;
  const c = 1013904223;
  const m = Math.pow(2, 32); // 2^32
  lcg_index = (a * lcg_index + c) % m;
  return lcg_index / m; // Normalize to range [0, 1)
}

function generateRandomHex() {
  let result = '';
  const characters = 'abcdef0123456789';
  for (let i = 0; i < 64; i++) {
      result += characters.charAt(Math.floor(lcg() * characters.length));
  }
  lcg_index++
  return '0x' + result;
}

const makeSqord = (hash: any, isNext: boolean) => {
  let sqord: any = {
    hash,
    hashPairs: [],
  }

  for (let j = 0; j < 32; j++) {
    sqord.hashPairs.push(sqord.hash.slice(2 + (j * 2), 4 + (j * 2)));
  }

  sqord.decPairs = sqord.hashPairs.map((x: any) => parseInt(x, 16));
  sqord.seed = parseInt(sqord.hash.slice(0, 16), 16);
  sqord.color = 0;
  sqord.backgroundColor = 0;
  sqord.ht = 0;
  sqord.wt = 2;
  sqord.speed = ((sqord.decPairs[1] % 128) / 100) + 0.1;
  sqord.segments = q5.map(sqord.decPairs[26], 0, 255, 12, 20);
  sqord.startColor = sqord.decPairs[29];
  sqord.slinky = sqord.decPairs[31] < 35;
  sqord.pipe = sqord.decPairs[22] < 32;
  sqord.bold = sqord.decPairs[23] < 15;
  sqord.segmented = sqord.decPairs[24] < 30;
  sqord.fuzzy = sqord.pipe && !sqord.slinky;
  sqord.flipper = sqord.decPairs[5] < 15
  sqord.squared = sqord.decPairs[6] < 15;
  sqord.spread = sqord.decPairs[28] < 3 ? 0.5 : q5.map(sqord.decPairs[28], 0, 255, 5, 50);
  sqord.index = 0;
  sqord.steps = sqord.slinky ?
    (sqord.decPairs[17] % 100) :
    sqord.fuzzy ?
      (sqord.decPairs[17] % 2000) :
      (sqord.decPairs[17] % 400);

  if (isNext) {
    sqord.reverse = sqord1.reverse;
    sqord.amp = sqord1.amp;

    if (!sqord.reverse) {
      moveSegmentsR2 = q5.floor(sqord.segments);
      moveSegments2 = q5.floor(sqord.segments);
      moveStepsR2 = sqord.steps;
      moveSteps2 = sqord.steps;
    }
  } else {
    sqord.amp = ((sqord.decPairs[2] % 128) / 100);
    sqord.reverse = sqord.decPairs[30] < 128;
  }

  sqord.start = true;

  return sqord;
};

// add text string input to generateRandomHexSimple for same output
let sqord1 = makeSqord(generateRandomHexSimple(''), false);
let sqord2 = makeSqord(generateRandomHex(), true);
let stop = false;

// let infinite = true;
// let eraser = true;
// reverse = false;

q5.setup = function() {
  let portrait = q5.windowWidth < q5.windowHeight;
  q5.createCanvas(q5.windowWidth, q5.windowHeight);
  // q5.createCanvas(q5.windowWidth > q5.windowHeight * 3 / 2 ? q5.windowHeight * 3 / 2 : q5.windowWidth, q5.windowWidth > q5.windowHeight * 3 / 2 ? q5.windowHeight : q5.windowWidth * 2 / 3);
  q5.colorMode(q5.HSB, 255);
  q5.strokeWeight(q5.height/1200);
}

q5.windowResized = function() {
  q5.resizeCanvas(q5.windowWidth, q5.windowHeight);
}

q5.draw = function() {
  q5.background(0);

  const prepareSqord = (sqord: any) => {
    sqord.ht = q5.map(sqord.decPairs[27], 0, 255, 3, 4);
    sqord.color = 0;
    sqord.div = Math.floor(q5.map(Math.round(sqord.decPairs[24]), 0, 230, 3, 20));
    q5.translate((q5.width / 2) - (q5.width / sqord.wt / 2), q5.height / 2);

    return sqord;
  }

  // sqord1 = prepareSqord(sqord1);
  sqord2 = prepareSqord(sqord2);

  // if (infinite && abs(index) > speed * (flipper ? 10 : 1000)) {
  //   updateHash();
  // }

  const handleSteps = (j: any, i: any, sqord: any) => {
    let t = i / sqord.steps;

    let x = q5.curvePoint(
      q5.width / sqord.segments / sqord.wt * j,
      q5.width / sqord.segments / sqord.wt * (j + 1),
      q5.width / sqord.segments / sqord.wt * (j + 2),
      q5.width / sqord.segments / sqord.wt * (j + 3),
      t
    );

    let y = q5.curvePoint(
      q5.map(sqord.decPairs[j], 0, 255, -q5.height / sqord.ht, q5.height / sqord.ht) * sqord.amp,
      q5.map(sqord.decPairs[j + 1], 0, 255, -q5.height / sqord.ht, q5.height / sqord.ht) * sqord.amp,
      q5.map(sqord.decPairs[j + 2], 0, 255, -q5.height / sqord.ht, q5.height / sqord.ht) * sqord.amp,
      q5.map(sqord.decPairs[j + 3], 0, 255, -q5.height / sqord.ht, q5.height / sqord.ht) * sqord.amp,
      t
    );

    let hue = sqord.reverse ?
      255 - (((sqord.color / sqord.spread) + sqord.startColor + sqord.index) % 255) :
      (((sqord.color / sqord.spread) + sqord.startColor) + sqord.index) % 255;

    if (sqord.fuzzy) {
      q5.noStroke();
      q5.fill(hue, 255, 255, 20);
      let fuzzX = x + q5.map(rnd(sqord), 0, 1, 0, q5.height / 10);
      let fuzzY = y + q5.map(rnd(sqord), 0, 1, 0, q5.height / 10);
      if (q5.dist(x, y, fuzzX, fuzzY) < q5.height / 11.5) {
        if (sqord.squared) {
          q5.square(fuzzX, fuzzY, q5.map(rnd(sqord), 0, 1, q5.height / 160, q5.height / 16));
        } else {
          q5.circle(fuzzX, fuzzY, q5.map(rnd(sqord), 0, 1, q5.height / 160, q5.height / 16));
        }
      }
    } else {
      if (sqord.slinky && sqord.pipe) {
        if (i == 0 || i == (sqord.steps) - 1) {
          q5.fill(0);
        } else {
          q5.noFill();
        }
        q5.stroke(0);

        if (sqord.squared) {
          q5.square(x, y, (q5.height / 7))
        } else {
          q5.circle(x, y, (q5.height / 7))
        }
      }

      if (sqord.slinky) {
        if (i == 0 || i == (sqord.steps) - 1) {
          q5.fill(hue, 255, 255);
        } else {
          q5.noFill();
        }
        q5.stroke(hue, 255, 255);
      } else {
        q5.noStroke();
        q5.fill(hue, 255, 255);
      }

      if (sqord.squared) {
        q5.square(x, y, sqord.bold && !sqord.slinky ? q5.height / 5 : q5.height / 13);
      } else {
        q5.circle(x, y, sqord.bold && !sqord.slinky ? q5.height / 5 : q5.height / 13);
      }

      if (sqord.segmented && !sqord.slinky && !sqord.bold) {
        if (i % sqord.div === 0 || i == 0 || i == (sqord.steps) - 1) {
          q5.noStroke();
          q5.fill(sqord.decPairs[25]);

          if (sqord.squared) {
            q5.square(x, y, q5.height / 12);
          } else {
            q5.circle(x, y, q5.height / 12);
          }
        }
      }
    }
  };

  if (!sqord2.start) {
    for (let j = moveSegments; j < (sqord2.segments - moveSegmentsR - 1); j++) {
      let dSteps = 0;
      let dStepsR = 0;

      if (j === moveSegments) {
        dSteps = moveSteps;
      }

      if (j === q5.floor(sqord2.segments) - moveSegmentsR - 1) {
        dStepsR = moveStepsR;
      }

      for (let i = dSteps; i <= (sqord2.steps - dStepsR); i++) {
        handleSteps(j, i, sqord2);
        sqord2.color++;
      }

      sqord2.seed = parseInt(sqord2.hash.slice(0, 16), 16);
    }

    if (q5.floor(q5.abs(sqord2.index)) % 1 === 0 && !stop) {
      if (sqord2.reverse) {
        moveSteps++;
      } else {
        moveStepsR++
      }
    }

    if (sqord2.reverse && moveSteps === sqord2.steps) {
      moveSegments++;
      moveSteps = 0;
    }

    if (!sqord2.reverse && moveStepsR === sqord2.steps) {
      moveSegmentsR++;
      moveStepsR = 0;
    }

    if (sqord2.reverse && moveSegments === q5.floor(sqord2.segments)) {
      sqord2 = makeSqord(generateRandomHex(), true);
      moveSegmentsR2 = q5.floor(sqord2.segments);
      moveSegments2 = q5.floor(sqord2.segments);
      moveStepsR2 = sqord2.steps;
      moveSteps2 = sqord2.steps;
      sqord2.reverse = false;
      sqord2.start = true;

    } else if (!sqord2.reverse && moveSegmentsR === q5.floor(sqord2.segments)) { 
      sqord2 = makeSqord(generateRandomHex(), true);
      moveSegmentsR2 = 0;
      moveSegments2 = 0;
      moveStepsR2 = 0;
      moveSteps2 = 0;
      sqord2.reverse = true;
      sqord2.start = true;
    }
  }

  if (sqord2.start) {
    for (let j = moveSegmentsR2; j < moveSegments2; j++) {
      let dSteps = 0;
      let dStepsR = 0;

      if (!sqord2.reverse) {
        if (j > moveSegmentsR2) {
          dStepsR = 0;
        } else {
          dStepsR = moveStepsR2;
        }

        dSteps = moveSteps2;
      } else {
        if (j === moveSegments2 - 1) {
          dSteps = moveSteps2;
        } else {
          dSteps = sqord2.steps;
        }
      }

      for (let i = dStepsR; i <= dSteps; i++) {
        handleSteps(j, i, sqord2);
        sqord2.color++;
      }

      sqord2.seed = parseInt(sqord2.hash.slice(0, 16), 16);
    }

    if (q5.floor(q5.abs(sqord2.index)) % 1 === 0 && !stop) {
      if (sqord2.reverse) {
        if (moveSegments2 < sqord2.segments) {
          moveSteps2++;
        }
      } else {
        if (moveSegmentsR2 >= 0) {
          moveStepsR2--;
        }
      }
    }

    if (sqord2.reverse && moveSteps2 === sqord2.steps && moveSegments2 < sqord2.segments) {
      moveSegments2++;
      moveSteps2 = 0;
    }

    if (!sqord2.reverse && moveStepsR2 === 0 && moveSegmentsR2 >= 0) {
      moveSegmentsR2--;
      moveStepsR2 = sqord2.steps;
    }

    if (!sqord2.pause && sqord2.reverse && moveSegments2 === q5.floor(sqord2.segments)) {
      sqord2.pause = true;

      setTimeout(() => {
        moveSteps = 0;
        moveStepsR = 0;
        moveSegments = 0;
        moveSegmentsR = 0;
        sqord2.reverse = false
        sqord2.start = false;
        sqord2.pause = false;
      }, 10000);
    } else if (!sqord2.pause && !sqord2.reverse && moveSegmentsR2 === 0) {
      sqord2.pause = true;

      setTimeout(() => {
        moveSteps = 0;
        moveStepsR = 0;
        moveSegments = 0;
        moveSegmentsR = 0;
        sqord2.reverse = true
        sqord2.start = false;
        sqord2.pause = false;
      }, 10000);
    }
  }

  // sqord1.index = sqord1.reverse ? (sqord1.index - sqord1.speed) : sqord1.index + sqord1.speed;
  sqord2.index = sqord2.reverse ? (sqord2.index - sqord2.speed) : sqord2.index + sqord2.speed;
}

// q5.touchStarted = function() {
//   stop = !stop;
// }

// q5.mouseClicked = function () {
//   stop = !stop;
// }

function rnd(sqord: any) {
  sqord.seed ^= sqord.seed << 13;
  sqord.seed ^= sqord.seed >> 17;
  sqord.seed ^= sqord.seed << 5;
  return (((sqord.seed < 0) ? ~sqord.seed + 1 : sqord.seed) % 1000) / 1000;
}

function generateRandomHexSimple(input: any) {
  let result = '';
  const characters = 'abcdef0123456789';
  for (let i = 0; i < 64; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }

  if (!input) {
    lcg_index = Math.random()
    return '0x' + result
  } else {
    const hash = pseudoHash(input);
    lcg_index = hashToNumber(hash);
    return hash;
  }
}

function hashToNumber(hash: any) {
  if (hash.startsWith('0x')) {
    hash = hash.substring(2);
  }
  let bigInt = parseInt(hash.substring(0, 16), 16);
  let number = bigInt / 0xffffffffffffffff;

  return number;
}

function pseudoHash(s: any) {
  let h = '';
  for (let i = 0; i < 64; i++) {
    let charCode = Math.abs(s.charCodeAt(i % s.length));
    h += (charCode % 16).toString(16);
  }
  return h;
}
