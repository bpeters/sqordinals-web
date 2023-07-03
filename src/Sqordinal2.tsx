import { useEffect, useRef } from "react"
import _ from 'lodash';
import {
  VStack,
} from "@chakra-ui/react";
import Zdog from 'zdog';

const hashToNumber = (hash: any) => {
  if (hash.startsWith('0x')) {
    hash = hash.substring(2);
  }
  let bigInt = parseInt(hash.substring(0, 16), 16);
  let number = bigInt / 0xffffffffffffffff;

  return number;
}

const mapValue = (value: any, start1: any, stop1: any, start2: any, stop2: any) => {
  return start2 + (stop2 - start2) * ((value - start1) / (stop1 - start1));
}

const curvePoint = (x1: any, y1: any, x2: any, y2: any, x3: any, y3: any, x4: any, y4: any, t: any) => {
  const u = 1 - t;
  const tt = t * t;
  const uu = u * u;
  const uuu = uu * u;
  const ttt = tt * t;

  const x = uuu * x1 + 3 * uu * t * x2 + 3 * u * tt * x3 + ttt * x4;
  const y = uuu * y1 + 3 * uu * t * y2 + 3 * u * tt * y3 + ttt * y4;

  return { x, y };
};

const catmullRom = (t: any, p0: any, p1: any, p2: any, p3: any) => {
  const v0 = (p2 - p0) * 0.5;
  const v1 = (p3 - p1) * 0.5;
  const t2 = t * t;
  const t3 = t * t * t;

  return (2 * p1 - 2 * p2 + v0 + v1) * t3 +
    (-3 * p1 + 3 * p2 - 2 * v0 - v1) * t2 +
    v0 * t + p1;
}

const quadraticBezierCurve = (x1: any, y1: any, x2: any, y2: any, x3: any, y3: any, t: any) => {
  const u = 1 - t;
  const tt = t * t;
  const uu = u * u;

  const x = uu * x1 + 2 * u * t * x2 + tt * x3;
  const y = uu * y1 + 2 * u * t * y2 + tt * y3;

  return { x, y };
}

const grayscaleValue = (value: any, opacity: any) => {
  let grayScale = Math.round(value * 255);
  return `rgba(${grayScale}, ${grayScale}, ${grayScale}, ${opacity})`;
}

const rnd = (sqord: any) => {
  sqord.seed ^= sqord.seed << 13;
  sqord.seed ^= sqord.seed >> 17;
  sqord.seed ^= sqord.seed << 5;
  return (((sqord.seed < 0) ? ~sqord.seed + 1 : sqord.seed) % 1000) / 1000;
};

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

const hslToRgba = (h: any, s: any, l: any, a: any) => {
  let r, g, b;
  if(s == 0) {
    r = g = b = l;
  } else {
    let hue2rgb = function hue2rgb(p: any, q: any, t: any) {
      if(t < 0) t += 1;
      if(t > 1) t -= 1;
      if(t < 1/6) return p + (q - p) * 6 * t;
      if(t < 1/2) return q;
      if(t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    }
    let q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    let p = 2 * l - q;
    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }
  return `rgba(${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(b * 255)}, ${a})`;
}


const makeSqord = (hash: any, isNext: any, sqord2: any) => {
  let sqord: any = {
    hash: sqord2 ? sqord2.hash : hash,
    hashPairs: [],
    counter: 0,
    objects: [],
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
  sqord.segments = mapValue(sqord.decPairs[26], 0, 255, 12, 20);
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
  sqord.spread = (sqord.decPairs[28] < 15 ? 2 : mapValue(sqord.decPairs[28], 0, 255, 5, 50)) || 0;
  sqord.rotateX = (sqord.decPairs[15] < 128 ? -1 * sqord.decPairs[15] / 255 : sqord.decPairs[15] / 255) + 0.1 || 1;
  sqord.rotateY = (sqord.decPairs[16] < 128 ? -1 * sqord.decPairs[16] / 255 : sqord.decPairs[15] / 255) + 0.1 || 1;
  sqord.rotateZ = (sqord.decPairs[14] < 128 ? -1 * sqord.decPairs[14] / 255 : sqord.decPairs[14] / 255) + 0.1 || 1;
  sqord.spikes = sqord.decPairs[13] < 128;
  sqord.flow = sqord.decPairs[12] < 128;
  sqord.index = 0;

  sqord.steps = sqord.slinky ?
    ((sqord.decPairs[17] % 100) + 1) :
    sqord.fuzzy ?
      ((sqord.decPairs[17] % 2000) + 1) :
      ((sqord.decPairs[17] % 400) + 1);

  if (sqord.squared) {
    sqord.steps = Math.round(sqord.steps / 2) + 1;
  }

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

  sqord.ht = mapValue(sqord.decPairs[27], 0, 255, 3, 4);
  sqord.color = 0;
  sqord.div = Math.floor(mapValue(Math.round(sqord.decPairs[24]), 0, 230, 3, 20));

  sqord.start = true;

  return sqord;
};

const displaySqord = (
  sqord: any,
  group: any,
  j: any,
  i: any,
) => {
  let width = window.innerWidth;
  let height = window.innerHeight;

  let t = i / sqord.steps;

  if (sqord.flowers) {
    t = 1
  }

  let x1 = width / sqord.segments / sqord.wt * j;
  let x2 = width / sqord.segments / sqord.wt * (j + 1);
  let x3 = width / sqord.segments / sqord.wt * (j + 2);
  let x4 = width / sqord.segments / sqord.wt * (j + 3);
  let y1 = mapValue(sqord.decPairs[j], 0, 255, -height / sqord.ht, height / sqord.ht) * sqord.amp || 0;
  let y2 = mapValue(sqord.decPairs[j + 1], 0, 255, -height / sqord.ht, height / sqord.ht) * sqord.amp || 0;
  let y3 = mapValue(sqord.decPairs[j + 2], 0, 255, -height / sqord.ht, height / sqord.ht) * sqord.amp || 0;
  let y4 = mapValue(sqord.decPairs[j + 3], 0, 255, -height / sqord.ht, height / sqord.ht) * sqord.amp || 0;

  // let { x, y } = curvePoint(x1, y1, x2, y2, x3, y3, x4, y4, t);
  let x = catmullRom(t, x1, x2, x3, x4);
  let y = catmullRom(t, y1, y2, y3, y4);

  y = y * -1;

  let z = -1 * ((sqord.segments * sqord.amp) + i + 1)

  if (sqord.creepy) {
    let u = 1 - t;
    let tt = t * t;
    let uu = u * u;
    let uuu = uu * u;
    let ttt = tt * t;

    x = uuu * x1 + 3 * uu * t * x2 + 3 * u * tt * x3 + ttt * x4;
    y = uuu * y1 + 3 * uu * t * y2 + 3 * u * tt * y3 + ttt * y4;
  }

  if (sqord.flowers && sqord.spikes) {
    let { x: x0, y: y0 } = quadraticBezierCurve(x1, y1, x2, y2, x3, y3, 1);

    if (Math.round(t * 10) % 10 === 0) {
      sqord.objects.push({
        object: new Zdog.Shape({
          addTo: group,
          stroke: height / 128,
          color: '#fff',
          translate: { x: x0, y: y0, z: -1 * mapValue(rnd(sqord), 0, 1, 0, height / 4) },
          visible: sqord.flipper ? true : false,
        }),
        opacity: 1,
      });
    }
  }

  let isBlack = false;

  if (sqord.fuzzy) {
    let fuzzX = x + mapValue(rnd(sqord), 0, 1, 0, height / 8);
    let fuzzY = y - mapValue(rnd(sqord), 0, 1, 0, height / 8);
    let fuzzZ = mapValue(rnd(sqord), 0, 1, 0, height / 4);

    let size = mapValue(rnd(sqord), 0, 1, height / 160, height / 16);

    if (sqord.squared) {
      sqord.objects.push({
        object: new Zdog.Box({
          addTo: group,
          width: size,
          height: size,
          depth: size,
          stroke: false,
          color: '#fff',
          leftFace: '#fff',
          rightFace: '#fff',
          topFace: '#fff',
          bottomFace: '#fff',
          translate: { x: fuzzX, y: fuzzY, z: fuzzZ  },
          visible: sqord.flipper ? true : false,
        }),
        opacity: 0.8,
        isCube: true,
      });
    } else {
      sqord.objects.push({
        object: new Zdog.Shape({
          addTo: group,
          stroke: size,
          color: '#fff',
          translate: { x: fuzzX, y: fuzzY, z: fuzzZ  },
          visible: sqord.flipper ? true : false,
        }),
        opacity: 0.8,
      });
    }
  } else {
    let size = height / 16;
    
    if (sqord.slinky && sqord.pipe) {
      let newSize = size * 1.2;
      if (sqord.squared) {
        sqord.objects.push({
          object: new Zdog.Box({
            addTo: group,
            width: newSize,
            height: newSize,
            depth: newSize,
            stroke: false,
            color: '#000',
            leftFace: '#000',
            rightFace: '#000',
            topFace: '#000',
            bottomFace: '#000',
            translate: { x, y, z },
            visible: sqord.flipper ? true : false,
          }),
          opacity: 1,
          isCube: true,
          isBlack: true,
        });
      } else {
        sqord.objects.push({
          object: new Zdog.Shape({
            addTo: group,
            stroke: newSize,
            color: '#000',
            translate: { x, y, z },
            visible: sqord.flipper ? true : false,
          }),
          opacity: 1,
          isBlack: true,
        });
      }
    }

    if (sqord.squared) {
      let newSize = (sqord.bold && !sqord.slinky ? size * 3 : size) * 2;

      sqord.objects.push({
        object: new Zdog.Box({
          addTo: group,
          width: newSize,
          height: newSize,
          depth: newSize,
          stroke: false,
          color: '#000',
          leftFace: '#000',
          rightFace: '#000',
          topFace: '#000',
          bottomFace: '#000',
          translate: { x, y, z },
          visible: sqord.flipper ? true : false,
        }),
        opacity: 1,
        isCube: true,
        isBlack,
      });
    } else {
      sqord.objects.push({
        object: new Zdog.Shape({
          addTo: group,
          stroke: sqord.bold && !sqord.slinky ? size * 3 : size,
          color: '#000',
          translate: { x, y, z },
          visible: sqord.flipper ? true : false,
        }),
        opacity: 1,
        isBlack,
      });
    }

    if (sqord.slinky) {
      let newSize = size * 0.9;
      let color = '#000';

      let localIsBlack = false;

      if (i === 0 || i === (sqord.steps) - 1) {
        localIsBlack = false;
      } else {
        localIsBlack = true;
      }

      if (sqord.squared) {
        sqord.objects.push({
          object: new Zdog.Box({
            addTo: group,
            width: newSize,
            height: newSize,
            depth: newSize,
            stroke: newSize,
            color,
            leftFace: color,
            rightFace: color,
            topFace: color,
            bottomFace: color,
            translate: { x, y, z },
            visible: sqord.flipper ? true : false,
          }),
          opacity: 1,
          isCube: true,
          isBlack: localIsBlack,
        });
      } else {
        sqord.objects.push({
          object: new Zdog.Shape({
            addTo: group,
            stroke: newSize,
            color,
            translate: { x, y, z },
            visible: sqord.flipper ? true : false,
          }),
          opacity: 1,
          isBlack: localIsBlack,
        });
      }
    }

    if (sqord.segmented && !sqord.slinky && !sqord.bold) {
      if (i % sqord.div === 0 || i === 0 || i === (sqord.steps) - 1) {
        const grayValue = sqord.decPairs[25] / 255;

        let newSize = size * 1;
        let color = grayscaleValue(grayValue, 1);

        if (sqord.squared) {
          sqord.objects.push({
            object: new Zdog.Box({
              addTo: group,
              width: newSize,
              height: newSize,
              depth: newSize,
              stroke: newSize,
              color,
              leftFace: color,
              rightFace: color,
              topFace: color,
              bottomFace: color,
              translate: { x, y, z },
              visible: sqord.flipper ? true : false,
            }),
            opacity: 1,
            isCube: true,
            isBlack: true,
          });
        } else {
          sqord.objects.push({
            object: new Zdog.Shape({
              addTo: group,
              stroke: newSize,
              color,
              translate: { x, y, z },
              visible: sqord.flipper ? true : false,
            }),
            opacity: 1,
            isBlack: true,
          });
        }
      }
    }
    
  }

  sqord.color++;
};

export const Sqordinal2 = ({ seed, setCanvas, set, isPause, handleSetPause }: any) => {
  const mySet: any = useRef();
  const myRender: any = useRef();
  const mySqord: any = useRef();
  const myIllo: any = useRef();
  const myGroup: any = useRef();

  let width = window.innerWidth;
  let height = window.innerHeight;

  useEffect(() => {
    if (!_.isUndefined(mySet.current) && mySet.current !== set) {
      window.set = 0;
      myGroup.current.remove();
      mySqord.current = makeSqord(seed.hash, false, null);

      if (set > 0) {
        for (let i = 1; i <= set; i++) {
          mySqord.current = makeSqord('', true, generateRandomHex(mySqord.current));
        }
      }

      mySet.current = window.set;
      mySqord.current.pause = isPause;

      myGroup.current = new Zdog.Group({
        addTo: myIllo.current,
        translate: { x: -1 * (width / 3.6), z: 0, y: 0 },
      });

      for (let j = 0; j < (mySqord.current.segments - 1); j++) {
        for (let i = 0; i <= (mySqord.current.steps); i++) {
          displaySqord(mySqord.current, myGroup.current, j, i);
        }

        mySqord.current.seed = parseInt(mySqord.current.hash.slice(0, 16), 16);
      }

      myIllo.current.updateRenderGraph();

      mySqord.current.counter = !mySqord.current.reverse ? mySqord.current.objects.length - 1 : 0;
    }
  }, [set]);

  useEffect(() => {
    if (mySqord.current) {
      mySqord.current.pause = isPause;
    }
  }, [isPause]);

  useEffect(() => {
    if (!mySqord.current && seed) {

      setCanvas(myRender.current);

      myIllo.current = new Zdog.Illustration({
        element: myRender.current,
        dragRotate: true,
        zoom: 1,
      });

      let illo = myIllo.current;

      illo.setSize(width, height);

      mySqord.current = makeSqord(seed.hash, false, null);

      console.log(mySqord.current)

      window.set = 0;
      mySet.current = set;

      if (parseInt(set, 10) > 0) {
        for (let i = 1; i <= parseInt(set, 10); i++) {
          mySqord.current = makeSqord('', true, generateRandomHex(mySqord.current));
        }
      }

      mySqord.current.pause = isPause;

      myGroup.current = new Zdog.Group({
        addTo: illo,
        translate: { x: -1 * (width / 3.6), z: 0, y: 0 },
      });

      for (let j = 0; j < (mySqord.current.segments - 1); j++) {
        console.log(j)
        for (let i = 0; i <= (mySqord.current.steps); i++) {
          displaySqord(mySqord.current, myGroup.current, j, i);
        }

        mySqord.current.seed = parseInt(mySqord.current.hash.slice(0, 16), 16);
      }

      mySqord.current.counter = !mySqord.current.reverse ? mySqord.current.objects.length - 1 : 0;

      myRender.current.addEventListener('wheel', function(event: any) {
        let zoomChange = event.deltaY * -0.01;
        illo.zoom += zoomChange;

        event.preventDefault();
      }, { passive: false });

      let initialDistance = 0;

      myRender.current.addEventListener('touchmove', function(event: any) {
        if (event.touches.length === 2) {
          let touch1 = event.touches[0];
          let touch2 = event.touches[1];
          let deltaX = touch2.pageX - touch1.pageX;
          let deltaY = touch2.pageY - touch1.pageY;
          let currentDistance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

          if (initialDistance > 0) {
            let deltaDistance = currentDistance - initialDistance;
            illo.zoom += deltaDistance * 0.01;
          }

          initialDistance = currentDistance;
        } else {
          initialDistance = 0;
        }

        event.preventDefault();
      });

      const animate = () => {
        let sqord = mySqord.current;

        sqord.color = 0;

        if (!sqord.pause) {
          illo.rotate.y += sqord.speed / 100 * sqord.rotateY;
          illo.rotate.x += sqord.speed / 100 * sqord.rotateX;
          illo.rotate.z += sqord.speed / 100 * sqord.rotateZ;
        }

        if (!sqord.start && !sqord.flipper) {
          const object = sqord.objects[sqord.counter];
          object.object.visible = false;

          sqord.counter = !sqord.reverse ? sqord.counter - 1 : sqord.counter + 1;

          if (
            (!sqord.reverse && sqord.counter === 0) ||
            (sqord.reverse && sqord.counter === sqord.objects.length - 1)
          ) {
            sqord.reverse = !sqord.reverse;
            sqord.start = true;
          }
        }

        if (sqord.start && !sqord.flipper && !sqord.changing) {
          const object = sqord.objects[sqord.counter];
          object.object.visible = true;

          sqord.counter = !sqord.reverse ? sqord.counter - 1 : sqord.counter + 1;

          if (
            (!sqord.reverse && sqord.counter === 0) ||
            (sqord.reverse && sqord.counter === sqord.objects.length - 1)
          ) {
            sqord.changing = true;

            setTimeout(() => {
              sqord.start = false;
              sqord.changing = false;
              if (sqord.dodge) {
                sqord.counter = sqord.reverse ? 0 : sqord.objects.length - 1;
              } else {
                sqord.reverse = !sqord.reverse;
              }
            }, 10000);
          }
        }

        for (const object of mySqord.current.objects) {
          let hue = sqord.flow ?
            360 - (((sqord.color / sqord.spread) + sqord.startColor + Math.abs(sqord.index)) % 360) :
            (((sqord.color / sqord.spread) + sqord.startColor) + Math.abs(sqord.index)) % 360;

          if (!object.isBlack) {
            if (object.isCube) {
              if (hue) {
                object.object.color = hslToRgba(hue / 360, 1, 0.5, object.opacity || 1);
                object.object.leftFace = hslToRgba(hue / 360, 1, 0.5, object.opacity || 1);
                object.object.rightFace = hslToRgba(hue / 360, 1, 0.5, object.opacity || 1);
                object.object.topFace = hslToRgba(hue / 360, 1, 0.5, object.opacity || 1);
                object.object.bottomFace = hslToRgba(hue / 360, 1, 0.5, object.opacity || 1);
              } else {
                let gray = ((sqord.color + Math.abs(sqord.index)) % 255) / 255;
                object.object.color = grayscaleValue(gray, object.opacity || 1);
                object.object.leftFace = grayscaleValue(gray, object.opacity || 1);
                object.object.rightFace = grayscaleValue(gray, object.opacity || 1);
                object.object.topFace = grayscaleValue(gray, object.opacity || 1);
                object.object.bottomFace = grayscaleValue(gray, object.opacity || 1);
              }
            } else {
              if (hue) {
                object.object.color = hslToRgba(hue / 360, 1, 0.5, object.opacity || 1);
              } else {
                let gray = ((sqord.color + Math.abs(sqord.index)) % 255) / 255;

                object.object.color = grayscaleValue(gray, object.opacity || 1);
              }
            }
          }

          sqord.color++;

          sqord.seed = parseInt(sqord.hash.slice(0, 16), 16);
        }

        sqord.index = sqord.reverse ? (sqord.index - sqord.speed) : sqord.index + sqord.speed;

        myIllo.current.updateRenderGraph();
        requestAnimationFrame(animate);
      }
      animate();
    }
  }, []);

  return (
    <VStack
      justify={'center'}
      align={'center'}
      width={'100vw'}
      height={'100vh'}
    >
      <canvas ref={myRender} />
    </VStack>
  )
};
