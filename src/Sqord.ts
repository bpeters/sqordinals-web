import { SHA256 } from 'crypto-js';

export {};

declare global {
  var Q5: any;
  var GIF: any;
  interface Window { hash: string; set: number; }
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

let recording = false;

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

function isSHA256Hash(str: string) {
  const sha256Regex = /^0x[a-f0-9]{64}$/i;
  return sha256Regex.test(str);
}

setInterval(() => {
  if (sqord2 && window.newHash && window.seed) {
    lcg_index = 0;

    moveSteps = 0;
    moveStepsR = 0;
    moveSegments = 0;
    moveSegmentsR = 0;
    moveSteps2 = 0;
    moveStepsR2 = 0;
    moveSegments2 = 0;
    moveSegmentsR2 = 0;

    sqord2 = makeSqord(generateRandomHexSimple(window.newHash), false);
    window.set = 0;
    console.log(sqord2.hash);
    sqord2.pause = false;
    window.seed = false;
  }

  if (sqord2 && window.isPause && !sqord2.changing) {
    sqord2.pause = true;
  }

  if (sqord2 && window.isPause === false && !sqord2.changing) {
    sqord2.pause = false;
  }

  if (window.record && !recording) {
    recorder.start();
    recording = true;
  }

  if (!window.record && recording) {
    recorder.stop();
    recording = false;
  }
}, 300);

const makeSqord = (hash: any, isNext: boolean) => {
  let sqord: any = {
    hash,
    hashPairs: [],
  }

  if (!isNext) {
    window.hash = hash;
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
  sqord.slinky = sqord.decPairs[31] < 30;
  sqord.pipe = sqord.decPairs[22] < 30;
  sqord.bold = sqord.decPairs[23] < 15;
  sqord.segmented = sqord.decPairs[24] < 30;
  sqord.fuzzy = sqord.pipe && !sqord.slinky;
  sqord.flipper = sqord.decPairs[5] < 15;
  sqord.familia = sqord.decPairs[4] < 15;
  sqord.flowers = sqord.decPairs[3] < 15;
  sqord.creepy = sqord.decPairs[7] < 15;
  sqord.dodge = sqord.decPairs[8] < 15;
  sqord.squared = sqord.decPairs[6] < 15;
  sqord.spread = sqord.decPairs[28] < 15 ? 0.5 : q5.map(sqord.decPairs[28], 0, 255, 5, 50);
  sqord.index = 0;
  sqord.pause = false;
  sqord.steps = sqord.slinky ?
    ((sqord.decPairs[17] % 100) + 1) :
    sqord.fuzzy ?
      ((sqord.decPairs[17] % 2000) + 1) :
      ((sqord.decPairs[17] % 400) + 1);

  if (isNext) {
    sqord.reverse = sqord2.reverse;
    sqord.amp = sqord2.amp;
    sqord.flipper = sqord2.flipper;
    sqord.familia = sqord2.familia;

    if (sqord.familia) {
      sqord.startColor = sqord2.startColor;
      sqord.slinky = sqord2.slinky;
      sqord.pipe = sqord2.pipe;
      sqord.bold = sqord2.bold;
      sqord.segmented = sqord2.segmented;
      sqord.fuzzy = sqord2.fuzzy;
    }
  } else {
    sqord.amp = ((sqord.decPairs[2] % 128) / 100);
    sqord.reverse = sqord.decPairs[30] < 128;
  }

  if (!sqord.reverse) {
    moveSegmentsR2 = q5.floor(sqord.segments);
    moveSegments2 = q5.floor(sqord.segments);
    moveStepsR2 = sqord.steps;
    moveSteps2 = sqord.steps;
  }

  sqord.start = true;

  return sqord;
};

// add text string input to generateRandomHexSimple for same output
let sqord2 = makeSqord(generateRandomHexSimple(''), false);
console.log(sqord2.hash);
let stop = false;
let canvas: any;
let chunks: any = []; // Here we will save all video data
let stream: any;
let recorder: any;

q5.setup = function() {
  canvas = q5.createCanvas(q5.windowWidth, q5.windowHeight);
  q5.colorMode(q5.HSB, 360);
  q5.strokeWeight(q5.height/1200);

  window.set = 0


  stream = canvas.captureStream(30);
  recorder = new MediaRecorder(stream);

  recorder.ondataavailable = function(e: any) {
    chunks.push(e.data);
  };

  recorder.onstop = function(e: any) {
    let blob = new Blob(chunks, { 'type' : 'video/webm' });
    chunks = [];
    let videoURL = URL.createObjectURL(blob);

    var a = document.createElement("a");

    // Set the href and download attributes of the anchor
    a.href = videoURL;
    a.download = 'sqordinal.webm';

    // Append the anchor into the body. The user will not see this in the document
    document.body.appendChild(a);

    // Simulate click on the anchor, then remove it
    a.click();
    document.body.removeChild(a);
  };
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

  sqord2 = prepareSqord(sqord2);

  const handleSteps = (j: any, i: any, sqord: any) => {
    let t = i / sqord.steps;

    if (sqord.flowers) {
      t = 1
    }

    let x1 = q5.width / sqord.segments / sqord.wt * j;
    let x2 = q5.width / sqord.segments / sqord.wt * (j + 1);
    let x3 = q5.width / sqord.segments / sqord.wt * (j + 2);
    let x4 = q5.width / sqord.segments / sqord.wt * (j + 3);
    let y1 = q5.map(sqord.decPairs[j], 0, 255, -q5.height / sqord.ht, q5.height / sqord.ht) * sqord.amp;
    let y2 = q5.map(sqord.decPairs[j + 1], 0, 255, -q5.height / sqord.ht, q5.height / sqord.ht) * sqord.amp;
    let y3 = q5.map(sqord.decPairs[j + 2], 0, 255, -q5.height / sqord.ht, q5.height / sqord.ht) * sqord.amp;
    let y4 = q5.map(sqord.decPairs[j + 3], 0, 255, -q5.height / sqord.ht, q5.height / sqord.ht) * sqord.amp;

    let x = q5.curvePoint(x1, x2, x3, x4, t);
    let y = q5.curvePoint(y1, y2, y3, y4, t);

    if (sqord.creepy) {
      let u = 1 - t;
      let tt = t * t;
      let uu = u * u;
      let uuu = uu * u;
      let ttt = tt * t;

      x = uuu * x1 + 3 * uu * t * x2 + 3 * u * tt * x3 + ttt * x4;
      y = uuu * y1 + 3 * uu * t * y2 + 3 * u * tt * y3 + ttt * y4;
    }
  
    if (sqord.flowers) {
      let x0 = q5.curvePoint(x1, x2, x3, x4, 0);
      let y0 = q5.curvePoint(y1, y2, y3, y4, 0);

      q5.beginShape();

      q5.quadraticVertex(x, y, x0, y0);

      q5.endShape();
    }

    let hue = sqord.reverse ?
      360 - (((sqord.color / sqord.spread) + sqord.startColor + q5.abs(sqord.index)) % 360) :
      (((sqord.color / sqord.spread) + sqord.startColor) + q5.abs(sqord.index)) % 360;

    if (sqord.fuzzy) {
      q5.noStroke();
      q5.fill(hue, 255, 255, 20);
      let fuzzX = x + q5.map(rnd(sqord), 0, 1, 0, q5.height / 10);
      let fuzzY = y + q5.map(rnd(sqord), 0, 1, 0, q5.height / 10);

      if (q5.dist(x, y, fuzzX, fuzzY) < q5.height / 10) {
        if (sqord.squared) {
          q5.square(fuzzX, fuzzY, q5.map(rnd(sqord), 0, 1, q5.height / 160, q5.height / 16));
        } else {
          q5.circle(fuzzX, fuzzY, q5.map(rnd(sqord), 0, 1, q5.height / 160, q5.height / 16));
        }
      }
    } else {
      if (sqord.slinky && sqord.pipe) {
        if (i === 0 || i === (sqord.steps) - 1) {
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
        if (i === 0 || i === (sqord.steps) - 1) {
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
        if (i % sqord.div === 0 || i === 0 || i === (sqord.steps) - 1) {
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

  if (sqord2.flipper) {
    for (let j = 0; j < (sqord2.segments - 1); j++) {
      for (let i = 0; i <= (sqord2.steps); i++) {
        handleSteps(j, i, sqord2);
        sqord2.color++;
      }

      sqord2.seed = parseInt(sqord2.hash.slice(0, 16), 16);
    };

    sqord2.index = sqord2.reverse ? (sqord2.index - sqord2.speed) : sqord2.index + sqord2.speed;

    if (!sqord2.pause && q5.abs(sqord2.index) > sqord2.speed * 15) {
      sqord2 = makeSqord(generateRandomHex(), true);
      window.set++;
      console.log(sqord2.hash);
    }
  }

  if (!sqord2.start && !sqord2.flipper) {
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

      sqord2.index = sqord2.reverse ? (sqord2.index - sqord2.speed) : sqord2.index + sqord2.speed;
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
      window.set++;
      console.log(sqord2.hash);
      moveSegmentsR2 = q5.floor(sqord2.segments);
      moveSegments2 = q5.floor(sqord2.segments);
      moveStepsR2 = sqord2.steps;
      moveSteps2 = sqord2.steps;
      sqord2.reverse = false;
      sqord2.start = true;

    } else if (!sqord2.reverse && moveSegmentsR === q5.floor(sqord2.segments)) { 
      sqord2 = makeSqord(generateRandomHex(), true);
      window.set++;
      console.log(sqord2.hash);
      moveSegmentsR2 = 0;
      moveSegments2 = 0;
      moveStepsR2 = 0;
      moveSteps2 = 0;
      sqord2.reverse = true;
      sqord2.start = true;
    }
  }

  if (sqord2.start && !sqord2.flipper) {
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

      sqord2.index = sqord2.reverse ? (sqord2.index - sqord2.speed) : sqord2.index + sqord2.speed;
    }

    if (sqord2.reverse && moveSteps2 === sqord2.steps && moveSegments2 < sqord2.segments) {
      moveSegments2++;
      moveSteps2 = 0;
    }

    if (!sqord2.reverse && moveStepsR2 === 0 && moveSegmentsR2 >= 0) {
      moveSegmentsR2--;
      moveStepsR2 = sqord2.steps;
    }

    if (!sqord2.pause && sqord2.reverse && moveSegments2 >= q5.floor(sqord2.segments)) {
      sqord2.pause = true;
      sqord2.changing = true;

      setTimeout(() => {
        moveSteps = 0;
        moveStepsR = 0;
        moveSegments = 0;
        moveSegmentsR = 0;
        if (!sqord2.dodge) {
          sqord2.reverse = false
        }
        sqord2.start = false;
        sqord2.pause = false;
        sqord2.changing = false;
      }, 10000);
    } else if (!sqord2.pause && !sqord2.reverse && moveSegmentsR2 <= 0) {
      sqord2.pause = true;
      sqord2.changing = true;

      setTimeout(() => {
        moveSteps = 0;
        moveStepsR = 0;
        moveSegments = 0;
        moveSegmentsR = 0;
        if (!sqord2.dodge) {
          sqord2.reverse = true;
        }
        sqord2.start = false;
        sqord2.pause = false;
        sqord2.changing = false;
      }, 10000);
    }
  }
}

function rnd(sqord: any) {
  sqord.seed ^= sqord.seed << 13;
  sqord.seed ^= sqord.seed >> 17;
  sqord.seed ^= sqord.seed << 5;
  return (((sqord.seed < 0) ? ~sqord.seed + 1 : sqord.seed) % 1000) / 1000;
}

function generateRandomHexSimple(input: any) {
  if (isSHA256Hash(input)) {
    lcg_index = hashToNumber(input);
    return input;
  } else {
    let result = '';
    const characters = 'abcdef0123456789';
    for (let i = 0; i < 64; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
  
    if (!input) {
      lcg_index = hashToNumber('0x' + result)
      return '0x' + result
    } else {
      let hash = input;
  
      if (!hash.startsWith('0x') || hash.length !== 66) {
        hash = pseudoHash(input);
      }

      console.log(hash)
  
      lcg_index = hashToNumber(hash);
      return hash;
    }
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
  const hash = SHA256(s);
  return `0x${hash.toString()}`
}

