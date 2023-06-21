import { useState, useEffect, useRef } from "react"
import _ from 'lodash';
import {
  Box,
  Text,
  VStack,
  HStack,
  Image,
  Button,
  Icon,
  Input,
} from "@chakra-ui/react"
import { useParams, useNavigate, createSearchParams, useLocation } from 'react-router-dom';
import { TbWaveSine, TbInfinity, TbRecordMail, TbRecordMailOff } from 'react-icons/tb'

import { seeds } from "./seeds";
import RecordTimer from "./RecordTimer";
import SqordSet from "./SqordSet";

let chunks: any = []; // Here we will save all video data
let recorder: any;

declare global {
  var Q5: any;
}

const openInNewTab = (url: string) => {
  const newWindow = window.open(url, '_blank', 'noopener,noreferrer')
  if (newWindow) newWindow.opener = null
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

export const Sqordinal = () => {
  const { search } = useLocation();
  const set: string = new URLSearchParams(search).get('set') || '0';
  const vibe: string = new URLSearchParams(search).get('vibe') || '0';

  const myP5: any = useRef();
  const mySqord: any = useRef();
  const { id }: any = useParams();
  const navigate = useNavigate();
  const [isPause, setIsPause] = useState(false);
  const [record, setRecord] = useState(false);
  const [value, setValue]: any = useState(0);

  const index = parseInt(id, 10);

  useEffect(() => {
    if (index < 0 || index > 255 || _.isNaN(index)) {
      window.location.assign(`/`);
    }
  }, [index, navigate]);

  const seed = seeds[index];

  useEffect(() => {
    if (!myP5.current && seed) {

      myP5.current = new Q5();

      const p = myP5.current;

      mySqord.current = makeSqord(seed.hash, false, null, p);

      window.set = 0;

      if (set && parseInt(set, 10) !== value) {
        setValue(parseInt(set, 10));

        if (parseInt(set, 10) > 0) {
          for (let i = 1; i <= parseInt(set, 10); i++) {
            mySqord.current = makeSqord('', true, generateRandomHex(mySqord.current), myP5.current);
          }
        }
      }

      if (vibe) {
        if (vibe === '1') {
          setIsPause(true);
          mySqord.current.pause = true;
        }

        if (vibe === '0') {
          setIsPause(false);
          mySqord.current.pause = false;
        }
      }

      p.setup = function () {
        let canvas = p.createCanvas(p.windowWidth, p.windowHeight);

        canvas.ontouchstart = () => {};
        canvas.ontouchmove = () => {};
        canvas.ontouchend = () => {};

        p.colorMode(p.HSB, 360);
        p.strokeWeight(p.height / 1200);
        p.pixelDensity(3);

        let stream = canvas.captureStream(30);
        recorder = new MediaRecorder(stream);

        recorder.onerror = function(e: any) {
          console.error('Error: ', e);
        };

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

  const handleInputChange = (event: any) => {
    setValue(event.target.value);
  }

  const handleShift = () => {
    navigate({
      pathname: `/sqordinal/${id}`,
      search: `?${createSearchParams({
        set: value,
        vibe: isPause ? '1' : '0',
      })}`,
    }, { replace: true });
    window.set = 0;
    mySqord.current = makeSqord(seed.hash, false, null, myP5.current);

    if (value > 0) {
      for (let i = 1; i <= value; i++) {
        mySqord.current = makeSqord('', true, generateRandomHex(mySqord.current), myP5.current);
      }
    }

    if (isPause) {
      mySqord.current.pause = true;
    }
  }

  const handleKeyDown = (event: any) => {
    if (event.key === 'Enter') {
      handleShift();
    }
  }

  return (
    <VStack
      justify={'center'}
      align={'center'}
    >
      <VStack
        zIndex={100000}
        position={'fixed'}
        top={'90px'}
        left={0}
        paddingLeft={'28px'}
        justify={'flex-start'}
        align={'flex-start'}
        spacing={2}
        width={'100vw'}
      >
        <HStack
          spacing={2}
          justify={'flex-start'}
          align={'center'}
        >
          <Text
            color={seed.uncommon ? '#E83A89' : 'white'}
            fontWeight={'bold'}
          >
            {_.get(seed, 'name', '')}
          </Text>
          <Box
            _hover={{
              cursor: 'pointer',
              opacity: 0.8,
            }}
            onClick={() => openInNewTab(`https://magiceden.io/ordinals/item-details/${seed.id}`)}
          >
            <Image
              src="/magic-eden.svg"
              alt="MagicEden"
              width="30px"
            />
          </Box>
          <Button
            fontSize={'12px'}
            fontWeight={'bold'}
            backgroundColor="black"
            _hover={{
              backgroundColor: 'none',
              opacity: 0.7,
            }}
            _active={{
              backgroundColor: 'none',
              color: 'green'
            }}
            paddingTop={'4px'}
            paddingBottom={'4px'}
            padding={'0px'}
            onClick={() => {
              handleShift();
            }}
          >
            Shift
          </Button>
          <Input 
            value={value}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            color="white"
            type="number"
            borderColor="transparent"
            borderWidth={1}
            borderRadius={0}
            _focus={{
              borderColor: 'transparent',
              borderBottomColor: "white",
              boxShadow: "none",
            }}
            _hover={{
              borderBottomColor: "pink",
              boxShadow: "none",
            }}
            fontSize={'10px'}
            width={'40px'}
            padding={'4px'}
          />
          <SqordSet />
        </HStack>
        <HStack
          justify={'flex-start'}
          align={'flex-start'}
          paddingTop={'10px'}
        >
          <Button
            fontSize={'12px'}
            fontWeight={'bold'}
            aria-label="Record"
            leftIcon={isPause ? <Icon as={TbWaveSine} color="#FE0101" boxSize="28px" /> : <Icon as={TbInfinity} color="#16FE07" boxSize="28px" />}
            onClick={() => {
              mySqord.current.pause = !mySqord.current.pause;
              setIsPause(!isPause)
              navigate({
                pathname: `/sqordinal/${id}`,
                search: `?${createSearchParams({
                  set: value,
                  vibe: isPause ? '0' : '1',
                })}`,
              }, { replace: true });
            }}
            backgroundColor="black"
            _hover={{ backgroundColor: 'gray.800' }}
            _active={{ backgroundColor: 'gray.900' }}
          >
            {isPause ? 'Vibe Mode' : 'Infinite Mode'}
          </Button>
          <Button
            fontSize={'12px'}
            fontWeight={'bold'}
            aria-label="Record"
            leftIcon={record ? <Icon as={TbRecordMailOff} color="#FE0101" boxSize="28px" /> : <Icon as={TbRecordMail} color="#0100FF" boxSize="28px" />}
            onClick={() => {
              if (recorder) {
                if (!record) {
                  recorder.start(1000);
                } else {
                  recorder.stop();
                }
              }

              setRecord(!record);
            }}
            backgroundColor="black"
            _hover={{ backgroundColor: 'gray.800' }}
            _active={{ backgroundColor: 'gray.900' }}
          >
            {record ? 'Stop Recording' : 'Start Recording'}
          </Button>
          {record && <RecordTimer />}
        </HStack>
      </VStack>
    </VStack>
  )
};
