import { useState, useEffect, useRef } from "react"
import { useNavigate, useLocation, createSearchParams } from 'react-router-dom';
import _ from 'lodash';
import p5 from 'p5';
import {
  Box,
  Text,
  Input,
  VStack,
  Grid,
  Image,
  HStack,
  Button,
  Icon,
} from "@chakra-ui/react"
import { FaTwitter, FaMediumM, FaDiscord } from 'react-icons/fa'

function lcg(sqord: any) {
  const a = 1664525;
  const c = 1013904223;
  const m = Math.pow(2, 32); // 2^32
  sqord.lcg_index = (a * sqord.lcg_index + c) % m;
  return sqord.lcg_index / m; // Normalize to range [0, 1)
}

function generateRandomHex(sqord: any) {
  let result = '';
  const characters = 'abcdef0123456789';
  for (let i = 0; i < 64; i++) {
    result += characters.charAt(Math.floor(lcg(sqord) * characters.length));
  }
  sqord.lcg_index++
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

  console.log(sqord.hash, sqord.lcg_index)

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

export const GodSeed = ({ hex }: any) => {
  const myCanvas: any = useRef();
  const myP5: any = useRef();
  // const [init, setInit] = useState(false);

  useEffect(() => {
    if (!myP5.current) {
      let sketch = (p: any) => {
        let sqord2 = makeSqord(hex, false, null, p);

        p.setup = function () {
          let canvas = p.createCanvas(300, 200);
          canvas.style('position', 'relative');
          p.colorMode(p.HSB, 360);
          p.strokeWeight(p.height / 1200);
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
        
          sqord2 = prepareSqord(sqord2);
        
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
        
          if (sqord2.flipper) {
            for (let j = 0; j < (sqord2.segments - 1); j++) {
              for (let i = 0; i <= (sqord2.steps); i++) {
                handleSteps(j, i, sqord2);
                sqord2.color++;
              }
        
              sqord2.seed = parseInt(sqord2.hash.slice(0, 16), 16);
            };
        
            sqord2.index = sqord2.reverse ? (sqord2.index - sqord2.speed) : sqord2.index + sqord2.speed;
        
            if (!sqord2.pause && p.abs(sqord2.index) > sqord2.speed * 15) {
              sqord2 = makeSqord('', true, generateRandomHex(sqord2), p);
              console.log(sqord2.hash);
            }
          }

          if (!sqord2.start && !sqord2.flipper) {
            for (let j = sqord2.moveSegments; j < (sqord2.segments - sqord2.moveSegmentsR - 1); j++) {
              let dSteps = 0;
              let dStepsR = 0;
        
              if (j === sqord2.moveSegments) {
                dSteps = sqord2.moveSteps;
              }
        
              if (j === p.floor(sqord2.segments) - sqord2.moveSegmentsR - 1) {
                dStepsR = sqord2.moveStepsR;
              }
        
              for (let i = dSteps; i <= (sqord2.steps - dStepsR); i++) {
                handleSteps(j, i, sqord2);
                sqord2.color++;
              }
        
              sqord2.seed = parseInt(sqord2.hash.slice(0, 16), 16);
            }
        
            if (p.floor(p.abs(sqord2.index)) % 1 === 0 && !sqord2.stop) {
              if (sqord2.reverse) {
                sqord2.moveSteps++;
              } else {
                sqord2.moveStepsR++
              }
        
              sqord2.index = sqord2.reverse ? (sqord2.index - sqord2.speed) : sqord2.index + sqord2.speed;
            }
        
            if (sqord2.reverse && sqord2.moveSteps === sqord2.steps) {
              sqord2.moveSegments++;
              sqord2.moveSteps = 0;
            }
        
            if (!sqord2.reverse && sqord2.moveStepsR === sqord2.steps) {
              sqord2.moveSegmentsR++;
              sqord2.moveStepsR = 0;
            }
        
            if (sqord2.reverse && sqord2.moveSegments === p.floor(sqord2.segments)) {
              if (!sqord2.pause) {
                sqord2 = makeSqord('', true, generateRandomHex(sqord2), p);
              }
        
              sqord2.moveSegmentsR2 = p.floor(sqord2.segments);
              sqord2.moveSegments2 = p.floor(sqord2.segments);
              sqord2.moveStepsR2 = sqord2.steps;
              sqord2.moveSteps2 = sqord2.steps;
              sqord2.reverse = false;
              sqord2.start = true;
            } else if (!sqord2.reverse && sqord2.moveSegmentsR === p.floor(sqord2.segments)) { 
              if (!sqord2.pause) {
                sqord2 = makeSqord('', true, generateRandomHex(sqord2), p);
              }
              sqord2.moveSegmentsR2 = 0;
              sqord2.moveSegments2 = 0;
              sqord2.moveStepsR2 = 0;
              sqord2.moveSteps2 = 0;
              sqord2.reverse = true;
              sqord2.start = true;
            }
          }
        
          if (sqord2.start && !sqord2.flipper) {
            for (let j = sqord2.moveSegmentsR2; j < sqord2.moveSegments2; j++) {
              let dSteps = 0;
              let dStepsR = 0;
        
              if (!sqord2.reverse) {
                if (j > sqord2.moveSegmentsR2) {
                  dStepsR = 0;
                } else {
                  dStepsR = sqord2.moveStepsR2;
                }
        
                dSteps = sqord2.moveSteps2;
              } else {
                if (j === sqord2.moveSegments2 - 1) {
                  dSteps = sqord2.moveSteps2;
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
        
            if (p.floor(p.abs(sqord2.index)) % 1 === 0 && !sqord2.stop) {
              if (sqord2.reverse) {
                if (sqord2.moveSegments2 < sqord2.segments) {
                  sqord2.moveSteps2++;
                }
              } else {
                if (sqord2.moveSegmentsR2 >= 0) {
                  sqord2.moveStepsR2--;
                }
              }
        
              sqord2.index = sqord2.reverse ? (sqord2.index - sqord2.speed) : sqord2.index + sqord2.speed;
            }
        
            if (sqord2.reverse && sqord2.moveSteps2 === sqord2.steps && sqord2.moveSegments2 < sqord2.segments) {
              sqord2.moveSegments2++;
              sqord2.moveSteps2 = 0;
            }
        
            if (!sqord2.reverse && sqord2.moveStepsR2 === 0 && sqord2.moveSegmentsR2 >= 0) {
              sqord2.moveSegmentsR2--;
              sqord2.moveStepsR2 = sqord2.steps;
            }
        
            if (!sqord2.changing && sqord2.reverse && sqord2.moveSegments2 >= p.floor(sqord2.segments)) {
              sqord2.changing = true;

              setTimeout(() => {
                sqord2.moveSteps = 0;
                sqord2.moveStepsR = 0;
                sqord2.moveSegments = 0;
                sqord2.moveSegmentsR = 0;
                if (!sqord2.dodge) {
                  sqord2.reverse = false
                }
                sqord2.start = false;
                sqord2.changing = false;
              }, 10000);
            } else if (!sqord2.changing && !sqord2.reverse && sqord2.moveSegmentsR2 <= 0) {
              sqord2.changing = true;
        
              setTimeout(() => {
                sqord2.moveSteps = 0;
                sqord2.moveStepsR = 0;
                sqord2.moveSegments = 0;
                sqord2.moveSegmentsR = 0;
                if (!sqord2.dodge) {
                  sqord2.reverse = true;
                }
                sqord2.start = false;
                sqord2.changing = false;
              }, 10000);
            }
          }
        };
      };

      myP5.current = new p5(sketch, myCanvas.current); 

      return () => {
        myP5.current.remove();
      }
    }
  }, []);

  return (
    <Box
      width="300px"
      height="200px"
      backgroundColor={'white'}
      padding={0}
    >
      <div ref={myCanvas} />
    </Box>
  )
};
