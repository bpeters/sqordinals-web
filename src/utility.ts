import * as THREE from 'three';

export const openInNewTab = (url: string) => {
  const newWindow = window.open(url, '_blank', 'noopener,noreferrer')
  if (newWindow) newWindow.opener = null
}

export const lcg = (sqord: any) => {
  const a = 1664525;
  const c = 1013904223;
  const m = Math.pow(2, 32); // 2^32
  sqord.lcg_index = (a * sqord.lcg_index + c) % m;
  const result = sqord.lcg_index / m;

  return  result;
}

export const generateRandomHex = (sqord: any) => {
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

export const hashToNumber = (hash: any) => {
  if (hash.startsWith('0x')) {
    hash = hash.substring(2);
  }
  let bigInt = parseInt(hash.substring(0, 16), 16);
  let number = bigInt / 0xffffffffffffffff;

  return number;
}

export const rnd = (sqord: any) => {
  sqord.seed ^= sqord.seed << 13;
  sqord.seed ^= sqord.seed >> 17;
  sqord.seed ^= sqord.seed << 5;
  return (((sqord.seed < 0) ? ~sqord.seed + 1 : sqord.seed) % 1000) / 1000;
}

export const mapValue = (value: any, start1: any, stop1: any, start2: any, stop2: any) => {
  return start2 + (stop2 - start2) * ((value - start1) / (stop1 - start1));
}

export const prepareSqord = (s: any) => {
  s.ht = mapValue(s.decPairs[27], 0, 255, 3, 4);
  s.color = 0;
  s.div = Math.floor(mapValue(Math.round(s.decPairs[24]), 0, 230, 3, 20));

  return s;
}

export const makeSqord = (hash: any, isNext: boolean, sqord2: any) => {
  let sqord: any = {
    hash: sqord2 ? sqord2.hash : hash,
    hashPairs: [],
    objects: [],
    lines: [],
    outlines: [],
    blanks: [],
    allObjects: [],
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
  sqord.rotateX = (sqord.decPairs[15] < 128 ? -1 * sqord.decPairs[15] / 255 : sqord.decPairs[15] / 255) || 0;
  sqord.rotateY = (sqord.decPairs[16] < 128 ? -1 * sqord.decPairs[16] / 255 : sqord.decPairs[15] / 255) || 0;
  sqord.rotateZ = (sqord.decPairs[14] < 128 ? -1 * sqord.decPairs[14] / 255 : sqord.decPairs[14] / 255) || 0;
  sqord.spikes = sqord.decPairs[13] < 128;
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
    sqord.moveSegmentsR2 = Math.floor(sqord.segments);
    sqord.moveSegments2 = Math.floor(sqord.segments);
    sqord.moveStepsR2 = sqord.steps;
    sqord.moveSteps2 = sqord.steps;
  }

  sqord.start = true;
  sqord.stop = false;

  return sqord;
};

export const displaySqord = (
  mySqord: any,
  group: any,
  p: any,
  j: any,
  i: any,
) => {
  let sqord = mySqord.current;
  let t = i / sqord.steps;

  if (sqord.flowers) {
    t = 1
  }

  let width = window.innerWidth;
  let height = window.innerHeight;

  let x1 = width / sqord.segments / sqord.wt * j;
  let x2 = width / sqord.segments / sqord.wt * (j + 1);
  let x3 = width / sqord.segments / sqord.wt * (j + 2);
  let x4 = width / sqord.segments / sqord.wt * (j + 3);
  let y1 = mapValue(sqord.decPairs[j], 0, 255, -height / sqord.ht, height / sqord.ht) * sqord.amp || 0;
  let y2 = mapValue(sqord.decPairs[j + 1], 0, 255, -height / sqord.ht, height / sqord.ht) * sqord.amp || 0;
  let y3 = mapValue(sqord.decPairs[j + 2], 0, 255, -height / sqord.ht, height / sqord.ht) * sqord.amp || 0;
  let y4 = mapValue(sqord.decPairs[j + 3], 0, 255, -height / sqord.ht, height / sqord.ht) * sqord.amp || 0;

  let x = p.curvePoint(x1, x2, x3, x4, t);
  let y = p.curvePoint(y1, y2, y3, y4, t) * -1;
  let z = -2 * ((sqord.segments * sqord.amp) + i + 1)

  let hue = sqord.reverse ?
    360 - (((sqord.color / sqord.spread) + sqord.startColor + p.abs(sqord.index)) % 360) :
    (((sqord.color / sqord.spread) + sqord.startColor) + p.abs(sqord.index)) % 360;

  if (sqord.creepy) {
    let u = 1 - t;
    let tt = t * t;
    let uu = u * u;
    let uuu = uu * u;
    let ttt = tt * t;

    x = uuu * x1 + 3 * uu * t * x2 + 3 * u * tt * x3 + ttt * x4;
    y = uuu * y1 + 3 * uu * t * y2 + 3 * u * tt * y3 + ttt * y4;
  }

  if (sqord.spikes) {
    let x0 = p.curvePoint(x1, x2, x3, x4, sqord.flowers ? 0 : 1);
    let y0 = p.curvePoint(y1, y2, y3, y4, sqord.flowers ? 0 : 1);

    let curve = new THREE.QuadraticBezierCurve3(
      new THREE.Vector3( x0, y0, z ), // control point
      new THREE.Vector3( x, y, z * 1 ), // start point
      new THREE.Vector3( x0, y0, z * (sqord.creepy ? 1 : 1 )) // end point
    );

    let points = curve.getPoints( 3 );
    let geometry = new THREE.BufferGeometry().setFromPoints( points );

    let material = new THREE.LineBasicMaterial();
    material.color.setHSL(hue / 360, 1, 0.5);

    if (sqord.slinky || sqord.fuzzy) {
      material.transparent = true;
      material.opacity = 0.2;
    }

    let line = new THREE.Line(geometry, material);
    line.visible = sqord.flipper ? true : false;

    group.add(line);

    mySqord.current.lines.push({
      i,
      j,
      line,
    });
  }

  let object;
  let geometry;
  let material;
  let isBlack = false;

  if (sqord.fuzzy) {
    let fuzzX = x + p.map(rnd(sqord), 0, 1, 0, p.height / 3);
    let fuzzY = y - p.map(rnd(sqord), 0, 1, 0, p.height / 3);
    let fuzzZ = p.map(rnd(sqord), 0, 1, 0, p.height);

    let size = p.map(rnd(sqord), 0, 1, p.height / 35, p.height / 4);

    if (sqord.squared) {
      geometry = new THREE.BoxGeometry(size * 2, size * 2, size * 2);
    } else {
      geometry = new THREE.SphereGeometry(size);
    }

    material = new THREE.MeshStandardMaterial();
    if (hue) {
      material.color.setHSL(hue / 360, 1, 0.5);
    } else {
      material.color = new THREE.Color("white");
    }
    material.transparent = true;
    material.opacity = 0.8;
    object = new THREE.Mesh(geometry, material);

    object.position.set(fuzzX, fuzzY, fuzzZ);
    object.visible = sqord.flipper ? true : false;
    group.add(object);

    mySqord.current.objects.push({
      i,
      j,
      object,
    });
  } else {
    let size = height / 35;

    if (sqord.slinky && sqord.pipe) {
      material = new THREE.MeshStandardMaterial({ color: new THREE.Color('black') });

      let outlineGeometry;
      
      if (sqord.squared) {
        outlineGeometry = new THREE.BoxGeometry((size * 1.2) * 2, (size * 1.2) * 2, (size * 1.2) * 2);
      } else {
        outlineGeometry = new THREE.SphereGeometry(size * 1.2);
      }

      let outlineMaterial = new THREE.MeshStandardMaterial({ color: new THREE.Color('black'), side: THREE.BackSide });
      let outlineSphere = new THREE.Mesh(outlineGeometry, outlineMaterial);

      outlineSphere.position.set(x, y, z);
      outlineSphere.visible = sqord.flipper ? true : false;
      group.add(outlineSphere);

      mySqord.current.blanks.push({
        i,
        j,
        blank: outlineSphere,
      });

      if (sqord.squared) {
        geometry = new THREE.BoxGeometry(size * 2, size * 2, size * 2);
      } else {
        geometry = new THREE.SphereGeometry(size);
      }

      let objectEmpty = new THREE.Mesh(geometry, material);
      objectEmpty.visible = sqord.flipper ? true : false;
      group.add(objectEmpty);

      mySqord.current.blanks.push({
        i,
        j,
        blank: objectEmpty,
      });
    }

    if (sqord.segmented && !sqord.slinky && !sqord.bold) {
      if (i % sqord.div === 0 || i === 0 || i === (sqord.steps) - 1) {
        const grayValue = sqord.decPairs[25] / 255;
        material = new THREE.MeshStandardMaterial();
        material.color = new THREE.Color(grayValue, grayValue, grayValue);
        material.transparent = true;
        material.opacity = 0.1;

        if (sqord.squared) {
          geometry = new THREE.BoxGeometry((size * 1.2) * 2, (size * 1.2) * 2, (size * 1.2) * 2);
        } else {
          geometry = new THREE.SphereGeometry((size * 1.2));
        }

        object = new THREE.Mesh(geometry, material);
        object.visible = sqord.flipper ? true : false;
        object.position.set(x, y, z);
        group.add(object);

        mySqord.current.blanks.push({
          i,
          j,
          blank: object,
        });
      }
    }

    if (sqord.slinky) {
      if (i === 0 || i === (sqord.steps) - 1) {
        material = new THREE.MeshStandardMaterial();
        if (hue) {
          material.color.setHSL(hue / 360, 1, 0.5);
        } else {
          material.color = new THREE.Color("white");
        }
      } else {
        isBlack = true;
        material = new THREE.MeshStandardMaterial({
          color: new THREE.Color('black'),
          side: THREE.FrontSide
        });
      }

      let outlineGeometry;
      
      if (sqord.squared) {
        outlineGeometry = new THREE.BoxGeometry((size * 1.2) * 2, (size * 1.2) * 2, (size * 1.2) * 2);
      } else {
        outlineGeometry = new THREE.SphereGeometry(size * 1.2);
      }

      let outlineMaterial = new THREE.MeshStandardMaterial({ side: THREE.BackSide });

      if (hue) {
        outlineMaterial.color.setHSL(hue / 360, 1, 0.5);
      } else {
        outlineMaterial.color = new THREE.Color("white");
      }

      let outline = new THREE.Mesh(outlineGeometry, outlineMaterial);

      outline.position.set(x, y, z);
      outline.visible = sqord.flipper ? true : false;
      group.add(outline);
 
      mySqord.current.outlines.push({
        i,
        j,
        outline,
      });
    } else {
      material = new THREE.MeshStandardMaterial({ side: THREE.BackSide });

      if (hue) {
        material.color.setHSL(hue / 360, 1, 0.5);
      } else {
        material.color = new THREE.Color("white");
      }
    }

    if (sqord.squared) {
      geometry = new THREE.BoxGeometry((sqord.bold && !sqord.slinky ? size * 3 : size) * 2, (sqord.bold && !sqord.slinky ? size * 3 : size) * 2, (sqord.bold && !sqord.slinky ? size * 3 : size) * 2);
    } else {
      geometry = new THREE.SphereGeometry(sqord.bold && !sqord.slinky ? size * 3 : size);
    }

    object = new THREE.Mesh(geometry, material);

    object.position.set(x, y, z);
    object.visible = sqord.flipper ? true : false;
    group.add(object);

    if (!isBlack) {
      mySqord.current.objects.push({
        i,
        j,
        object,
      });
    } else {
      mySqord.current.blanks.push({
        i,
        j,
        blank: object,
      });
    }
  }

  mySqord.current.color++;
}

