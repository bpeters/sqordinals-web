import { useEffect, useRef } from "react"
import _ from 'lodash';
import {
  VStack,
} from "@chakra-ui/react"

declare global {
  var Q5: any;
}

function lcg(sqord: any) {
  const a = 1664525;
  const c = 1013904223;
  const m = Math.pow(2, 32); // 2^32
  sqord.lcg_index = (a * sqord.lcg_index + c) % m;
  const result = sqord.lcg_index / m;

  return  result;
}

function generateRandomHex(sqord: any) {
  let result = '';
  const characters = 'abcdef0123456789';
  for (let i = 0; i < 64; i++) {
    result += characters.charAt(Math.floor(lcg(sqord) * characters.length));
  }
  sqord.lcg_index++
  window.set++;
  sqord.hash = '0x' + result;
  return sqord;
}

function hashToNumber(hash: any) {
  if (hash.startsWith('0x')) {
    hash = hash.substring(2);
  }
  let bigInt = parseInt(hash.substring(0, 16), 16);
  let number = bigInt / 0xffffffffffffffff;

  return number;
}

const makeSqord = (hash: any, isNext: boolean, sqord2: any, p: any) => {
  let sqord: any = {
    hash: sqord2 ? sqord2.hash : hash,
    hashPairs: [],
  }

  if (!sqord2) {
    sqord.lcg_index = hashToNumber(sqord.hash);
  } else {
    sqord.lcg_index = sqord2.lcg_index;
  }

  sqord.moveSteps = 0;
  sqord.moveStepsR = 0;
  sqord.moveSegments = 0;
  sqord.moveSegmentsR = 0;
  sqord.moveSteps2 = 0;
  sqord.moveStepsR2 = 0;
  sqord.moveSegments2 = 0;
  sqord.moveSegmentsR2 = 0;

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
  sqord.segments = p.map(sqord.decPairs[26], 0, 255, 12, 20);
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
  sqord.spread = sqord.decPairs[28] < 15 ? 0.5 : p.map(sqord.decPairs[28], 0, 255, 5, 50);
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
      sqord.flowers = sqord2.flowers;
      sqord.squared = sqord2.squared;
      sqord.creepy = sqord2.creepy;
      sqord.dodge = sqord2.creepy;
    }
  } else {
    sqord.amp = ((sqord.decPairs[2] % 128) / 100);
    sqord.reverse = sqord.decPairs[30] < 128;
  }

  if (!sqord.reverse) {
    sqord.moveSegmentsR2 = p.floor(sqord.segments);
    sqord.moveSegments2 = p.floor(sqord.segments);
    sqord.moveStepsR2 = sqord.steps;
    sqord.moveSteps2 = sqord.steps;
  }

  sqord.start = true;
  sqord.stop = false;

  return sqord;
};

function rnd(sqord: any) {
  sqord.seed ^= sqord.seed << 13;
  sqord.seed ^= sqord.seed >> 17;
  sqord.seed ^= sqord.seed << 5;
  return (((sqord.seed < 0) ? ~sqord.seed + 1 : sqord.seed) % 1000) / 1000;
}

let cleanup = false;

export const Sqordinal = ({ seed, setCanvas, set, isPause }: any) => {
  const mySet: any = useRef();
  const myCanvas: any = useRef();
  const myP5: any = useRef();
  const mySqord: any = useRef();

  useEffect(() => {
    if (mySet.current && mySet.current !== set) {
      window.set = 0;
      mySqord.current = makeSqord(seed.hash, false, null, myP5.current);
  
      if (set > 0) {
        for (let i = 1; i <= set; i++) {
          mySqord.current = makeSqord('', true, generateRandomHex(mySqord.current), myP5.current);
        }
      }

      mySqord.current.pause = isPause;
    }
  }, [set]);

  useEffect(() => {
    if (mySqord.current) {
      mySqord.current.pause = isPause;
    }
  }, [isPause]);

  useEffect(() => {
    if (!myP5.current && seed) {

      myP5.current = new Q5();

      const p = myP5.current;

      mySqord.current = makeSqord(seed.hash, false, null, p);

      window.set = 0;
      mySet.current = set;

      if (parseInt(set, 10) > 0) {
        for (let i = 1; i <= parseInt(set, 10); i++) {
          mySqord.current = makeSqord('', true, generateRandomHex(mySqord.current), p);
        }
      }

      mySqord.current.pause = isPause;

      p.setup = function () {
        myCanvas.current = p.createCanvas(p.windowWidth, p.windowHeight);

        setCanvas(myCanvas.current);

        myCanvas.current.ontouchstart = () => {};
        myCanvas.current.ontouchmove = () => {};
        myCanvas.current.ontouchend = () => {};

        p.colorMode(p.HSB, 360);
        p.strokeWeight(p.height / 1200);
        p.pixelDensity(3);
      };

      p.draw = function () {
        p.background(0);

        const prepareSqord = (s: any) => {
          s.ht = p.map(s.decPairs[27], 0, 255, 3, 4);
          s.color = 0;
          s.div = Math.floor(p.map(Math.round(s.decPairs[24]), 0, 230, 3, 20));
          p.translate((p.width / 2) - (p.width / s.wt / 2), p.height / 2);
      
          return s;
        }
      
        mySqord.current = prepareSqord(mySqord.current);

        const handleSteps = (j: any, i: any, sqord: any) => {
          let t = i / sqord.steps;
      
          if (sqord.flowers) {
            t = 1
          }

          let x1 = p.width / sqord.segments / sqord.wt * j;
          let x2 = p.width / sqord.segments / sqord.wt * (j + 1);
          let x3 = p.width / sqord.segments / sqord.wt * (j + 2);
          let x4 = p.width / sqord.segments / sqord.wt * (j + 3);
          let y1 = p.map(sqord.decPairs[j], 0, 255, -p.height / sqord.ht, p.height / sqord.ht) * sqord.amp;
          let y2 = p.map(sqord.decPairs[j + 1], 0, 255, -p.height / sqord.ht, p.height / sqord.ht) * sqord.amp;
          let y3 = p.map(sqord.decPairs[j + 2], 0, 255, -p.height / sqord.ht, p.height / sqord.ht) * sqord.amp;
          let y4 = p.map(sqord.decPairs[j + 3], 0, 255, -p.height / sqord.ht, p.height / sqord.ht) * sqord.amp;
      
          let x = p.curvePoint(x1, x2, x3, x4, t);
          let y = p.curvePoint(y1, y2, y3, y4, t);
      
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
            let x0 = p.curvePoint(x1, x2, x3, x4, 0);
            let y0 = p.curvePoint(y1, y2, y3, y4, 0);
      
            p.beginShape();
      
            p.quadraticVertex(x, y, x0, y0);
      
            p.endShape();
          }
      
          let hue = sqord.reverse ?
            360 - (((sqord.color / sqord.spread) + sqord.startColor + p.abs(sqord.index)) % 360) :
            (((sqord.color / sqord.spread) + sqord.startColor) + p.abs(sqord.index)) % 360;
      
          if (sqord.fuzzy) {
            p.noStroke();
            p.fill(hue, 255, 255, 20);
            let fuzzX = x + p.map(rnd(sqord), 0, 1, 0, p.height / 10);
            let fuzzY = y + p.map(rnd(sqord), 0, 1, 0, p.height / 10);
      
            if (p.dist(x, y, fuzzX, fuzzY) < p.height / 10) {
              if (sqord.squared) {
                p.square(fuzzX, fuzzY, p.map(rnd(sqord), 0, 1, p.height / 160, p.height / 16));
              } else {
                p.circle(fuzzX, fuzzY, p.map(rnd(sqord), 0, 1, p.height / 160, p.height / 16));
              }
            }
          } else {
            if (sqord.slinky && sqord.pipe) {
              if (i === 0 || i === (sqord.steps) - 1) {
                p.fill(0);
              } else {
                p.noFill();
              }
              p.stroke(0);
      
              if (sqord.squared) {
                p.square(x, y, (p.height / 7))
              } else {
                p.circle(x, y, (p.height / 7))
              }
            }
      
            if (sqord.slinky) {
              if (i === 0 || i === (sqord.steps) - 1) {
                p.fill(hue, 255, 255);
              } else {
                p.noFill();
              }
              p.stroke(hue, 255, 255);
            } else {
              p.noStroke();
              p.fill(hue, 255, 255);
            }
      
            if (sqord.squared) {
              p.square(x, y, sqord.bold && !sqord.slinky ? p.height / 5 : p.height / 13);
            } else {
              p.circle(x, y, sqord.bold && !sqord.slinky ? p.height / 5 : p.height / 13);
            }

            if (sqord.segmented && !sqord.slinky && !sqord.bold) {
              if (i % sqord.div === 0 || i === 0 || i === (sqord.steps) - 1) {
                p.noStroke();
                p.fill(sqord.decPairs[25]);
      
                if (sqord.squared) {
                  p.square(x, y, p.height / 12);
                } else {
                  p.circle(x, y, p.height / 12);
                }
              }
            }
          }
        };
      
        if (mySqord.current.flipper) {
          for (let j = 0; j < (mySqord.current.segments - 1); j++) {
            for (let i = 0; i <= (mySqord.current.steps); i++) {
              handleSteps(j, i, mySqord.current);
              mySqord.current.color++;
            }

            mySqord.current.seed = parseInt(mySqord.current.hash.slice(0, 16), 16);
          };

          mySqord.current.index = mySqord.current.reverse ? (mySqord.current.index - mySqord.current.speed) : mySqord.current.index + mySqord.current.speed;
      
          if (!mySqord.current.pause && p.abs(mySqord.current.index) > mySqord.current.speed * 15) {
            mySqord.current = makeSqord('', true, generateRandomHex(mySqord.current), p);
          }
        }

        if (!mySqord.current.start && !mySqord.current.flipper) {
          for (let j = mySqord.current.moveSegments; j < (mySqord.current.segments - mySqord.current.moveSegmentsR - 1); j++) {
            let dSteps = 0;
            let dStepsR = 0;
      
            if (j === mySqord.current.moveSegments) {
              dSteps = mySqord.current.moveSteps;
            }
      
            if (j === p.floor(mySqord.current.segments) - mySqord.current.moveSegmentsR - 1) {
              dStepsR = mySqord.current.moveStepsR;
            }

            for (let i = dSteps; i <= (mySqord.current.steps - dStepsR); i++) {
              handleSteps(j, i, mySqord.current);
              mySqord.current.color++;
            }
      
            mySqord.current.seed = parseInt(mySqord.current.hash.slice(0, 16), 16);
          }

          if (p.floor(p.abs(mySqord.current.index)) % 1 === 0 && !mySqord.current.stop) {
            if (mySqord.current.reverse) {
              mySqord.current.moveSteps++;
            } else {
              mySqord.current.moveStepsR++
            }
      
            mySqord.current.index = mySqord.current.reverse ? (mySqord.current.index - mySqord.current.speed) : mySqord.current.index + mySqord.current.speed;
          }
      
          if (mySqord.current.reverse && mySqord.current.moveSteps === mySqord.current.steps) {
            mySqord.current.moveSegments++;
            mySqord.current.moveSteps = 0;
          }
      
          if (!mySqord.current.reverse && mySqord.current.moveStepsR === mySqord.current.steps) {
            mySqord.current.moveSegmentsR++;
            mySqord.current.moveStepsR = 0;
          }
      
          if (mySqord.current.reverse && mySqord.current.moveSegments === p.floor(mySqord.current.segments)) {
            if (!mySqord.current.pause) {
              mySqord.current = makeSqord('', true, generateRandomHex(mySqord.current), p);
            }
      
            mySqord.current.moveSegmentsR2 = p.floor(mySqord.current.segments);
            mySqord.current.moveSegments2 = p.floor(mySqord.current.segments);
            mySqord.current.moveStepsR2 = mySqord.current.steps;
            mySqord.current.moveSteps2 = mySqord.current.steps;
            mySqord.current.reverse = false;
            mySqord.current.start = true;
          } else if (!mySqord.current.reverse && mySqord.current.moveSegmentsR === p.floor(mySqord.current.segments)) { 
            if (!mySqord.current.pause) {
              mySqord.current = makeSqord('', true, generateRandomHex(mySqord.current), p);
            }
            mySqord.current.moveSegmentsR2 = 0;
            mySqord.current.moveSegments2 = 0;
            mySqord.current.moveStepsR2 = 0;
            mySqord.current.moveSteps2 = 0;
            mySqord.current.reverse = true;
            mySqord.current.start = true;
          }
        }

        if (mySqord.current.start && !mySqord.current.flipper) {
          for (let j = mySqord.current.moveSegmentsR2; j < mySqord.current.moveSegments2; j++) {
            let dSteps = 0;
            let dStepsR = 0;
      
            if (!mySqord.current.reverse) {
              if (j > mySqord.current.moveSegmentsR2) {
                dStepsR = 0;
              } else {
                dStepsR = mySqord.current.moveStepsR2;
              }
      
              dSteps = mySqord.current.moveSteps2;
            } else {
              if (j === mySqord.current.moveSegments2 - 1) {
                dSteps = mySqord.current.moveSteps2;
              } else {
                dSteps = mySqord.current.steps;
              }
            }
      
            for (let i = dStepsR; i <= dSteps; i++) {
              handleSteps(j, i, mySqord.current);
              mySqord.current.color++;
            }
      
            mySqord.current.seed = parseInt(mySqord.current.hash.slice(0, 16), 16);
          }
      
          if (p.floor(p.abs(mySqord.current.index)) % 1 === 0 && !mySqord.current.stop) {
            if (mySqord.current.reverse) {
              if (mySqord.current.moveSegments2 < mySqord.current.segments) {
                mySqord.current.moveSteps2++;
              }
            } else {
              if (mySqord.current.moveSegmentsR2 >= 0) {
                mySqord.current.moveStepsR2--;
              }
            }
      
            mySqord.current.index = mySqord.current.reverse ? (mySqord.current.index - mySqord.current.speed) : mySqord.current.index + mySqord.current.speed;
          }
      
          if (mySqord.current.reverse && mySqord.current.moveSteps2 === mySqord.current.steps && mySqord.current.moveSegments2 < mySqord.current.segments) {
            mySqord.current.moveSegments2++;
            mySqord.current.moveSteps2 = 0;
          }
      
          if (!mySqord.current.reverse && mySqord.current.moveStepsR2 === 0 && mySqord.current.moveSegmentsR2 >= 0) {
            mySqord.current.moveSegmentsR2--;
            mySqord.current.moveStepsR2 = mySqord.current.steps;
          }
      
          if (!mySqord.current.changing && mySqord.current.reverse && mySqord.current.moveSegments2 >= p.floor(mySqord.current.segments)) {
            mySqord.current.changing = true;

            setTimeout(() => {
              mySqord.current.moveSteps = 0;
              mySqord.current.moveStepsR = 0;
              mySqord.current.moveSegments = 0;
              mySqord.current.moveSegmentsR = 0;
              if (!mySqord.current.dodge) {
                mySqord.current.reverse = false
              }
              mySqord.current.start = false;
              mySqord.current.changing = false;
            }, 10000);
          } else if (!mySqord.current.changing && !mySqord.current.reverse && mySqord.current.moveSegmentsR2 <= 0) {
            mySqord.current.changing = true;
      
            setTimeout(() => {
              mySqord.current.moveSteps = 0;
              mySqord.current.moveStepsR = 0;
              mySqord.current.moveSegments = 0;
              mySqord.current.moveSegmentsR = 0;
              if (!mySqord.current.dodge) {
                mySqord.current.reverse = true;
              }
              mySqord.current.start = false;
              mySqord.current.changing = false;
            }, 10000);
          }
        }
      };
    }
  }, []);

  useEffect(() => {
    return () => {
      if (myP5.current && myCanvas.current) {
        myP5.current.noLoop();
        myCanvas.current.remove();
      }
    };
  }, []);

  return (
    <VStack
      justify={'center'}
      align={'center'}
    />
  )
};
