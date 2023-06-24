import { useState, useEffect, useRef } from "react"
import _ from 'lodash';
import * as THREE from 'three';
import { ArcballControls } from "three/examples/jsm/controls/ArcballControls";
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
import {
  openInNewTab,
  generateRandomHex,
  rnd,
  makeSqord,
  prepareSqord,
  mapValue,
  displaySqord,
} from "./utility";

let chunks: any = []; // Here we will save all video data
let recorder: any;
let clock = new THREE.Clock();
let isRotating = false;  // Start with rotation enabled


declare global {
  var Q5: any;
}

function updateGroupCenter(group: any) {
  // Calculate the bounding box and get its center
  let box = new THREE.Box3().setFromObject( group );
  let center = box.getCenter( new THREE.Vector3() );

  // Adjust group position
  group.position.x = center.x;
  group.position.y = center.y;
  group.position.z = center.z;

  // Adjust positions of all children
  group.children.forEach((child: any) => {
    child.position.x -= center.x;
    child.position.y -= center.y;
    child.position.z -= center.z;
  });
}

function showObjects(sqord: any, j: any, i: any, visible: any) {
  const foundLines = sqord.lines.filter((l: any) => l.i === i && l.j === j);
  foundLines.forEach((foundLine: any) => foundLine.line.visible = visible);

  const foundOutlines = sqord.outlines.filter((l: any) => l.i === i && l.j === j);
  foundOutlines.forEach((foundOutline: any) => foundOutline.outline.visible = visible);

  const foundObjects = sqord.objects.filter((l: any) => l.i === i && l.j === j);
  foundObjects.forEach((foundObject: any) => foundObject.object.visible = visible);

  const foundBlanks = sqord.blanks.filter((l: any) => l.i === i && l.j === j);
  foundBlanks.forEach((foundBlank: any) => foundBlank.blank.visible = visible);
}

export const Sqordinal3D = () => {
  const { search } = useLocation();
  const set: string = new URLSearchParams(search).get('set') || '0';
  const vibe: string = new URLSearchParams(search).get('vibe') || '0';

  const myRender: any = useRef();
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
    if (!mySqord.current && seed) {
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 3000);
      const renderer = new THREE.WebGLRenderer();
      renderer.setSize(window.innerWidth, window.innerHeight);

      myRender.current.appendChild(renderer.domElement);

      const controls = new ArcballControls( camera, document.body, scene );

      controls.addEventListener('change', function () {
        renderer.render( scene, camera );
      });

      camera.position.x = 0;
      camera.position.z = 560;
      controls.update();

      controls.setGizmosVisible(false);
      controls.maxDistance = 2000;

      const hemiLight = new THREE.HemisphereLight(0x000000, 0xffffff, 0.2);
      hemiLight.position.set(200, 200, 0);
      scene.add(hemiLight);

      const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
      scene.add(ambientLight);

      mySqord.current = makeSqord(seed.hash, false, null);
      let sqord = mySqord.current;
  
      const p = new Q5();

      p.setup = function () {
        let canvas = p.createCanvas(p.windowWidth, p.windowHeight);

        canvas.ontouchstart = () => {};
        canvas.ontouchmove = () => {};
        canvas.ontouchend = () => {};
      };

      sqord.ht = p.map(sqord.decPairs[27], 0, 255, 3, 4);
      sqord.color = 0;
      sqord.div = Math.floor(p.map(Math.round(sqord.decPairs[24]), 0, 230, 3, 20));

      console.log(sqord);

      let group = new THREE.Group();

      for (let j = 0; j < (sqord.segments - 1); j++) {
        for (let i = 0; i <= (sqord.steps); i++) {
          displaySqord(mySqord, group, p, j, i);
        }

        sqord.seed = parseInt(sqord.hash.slice(0, 16), 16);
      }

      scene.add(group);

      updateGroupCenter(group);

      document.body.addEventListener("keydown", function (event) {
        if (event.code === 'Space') {
          isRotating = !isRotating;
        }
      }, false);

      const animate = function () {
        requestAnimationFrame(animate);

        if (isRotating) {
          group.rotation.y += sqord.speed / 100 * sqord.rotateY;
          group.rotation.x += sqord.speed / 100 * sqord.rotateX;
          group.rotation.z += sqord.speed / 100 * sqord.rotateZ;
        }

        controls.target.copy( group.position );
        controls.update();

        sqord.color = 0;

        const maxArrayLength = Math.max(sqord.lines.length, sqord.outlines.length, sqord.objects.length, sqord.blanks.length);

        if (!sqord.start && !sqord.flipper) {
          if (sqord.counter < sqord.lines.length) {
            sqord.lines[sqord.counter].line.visible = false;
          }

          if (sqord.counter < sqord.outlines.length) {
            sqord.outlines[sqord.counter].outline.visible = false;
          }
        
          if (sqord.counter < sqord.objects.length) {
            sqord.objects[sqord.counter].object.visible = false;
          }

          if (sqord.counter < sqord.blanks.length) {
            sqord.blanks[sqord.counter].blank.visible = false;
          }

          sqord.counter++;

          if (sqord.reverse && sqord.counter > maxArrayLength) {
            sqord.moveSegmentsR2 = p.floor(sqord.segments);
            sqord.moveSegments2 = p.floor(sqord.segments);
            sqord.moveStepsR2 = sqord.steps;
            sqord.moveSteps2 = sqord.steps;
            sqord.reverse = false;
            sqord.start = true;
          } else if (!sqord.reverse && sqord.counter < 0) { 
            sqord.moveSegmentsR2 = 0;
            sqord.moveSegments2 = 0;
            sqord.moveStepsR2 = 0;
            sqord.moveSteps2 = 0;
            sqord.reverse = true;
            sqord.start = true;
          }
        }

        if (sqord.start && !sqord.flipper) {
          for (let j = sqord.moveSegmentsR2; j < sqord.moveSegments2; j++) {
            let dSteps = 0;
            let dStepsR = 0;
      
            if (!sqord.reverse) {
              if (j > sqord.moveSegmentsR2) {
                dStepsR = 0;
              } else {
                dStepsR = sqord.moveStepsR2;
              }
      
              dSteps = sqord.moveSteps2;
            } else {
              if (j === sqord.moveSegments2 - 1) {
                dSteps = sqord.moveSteps2;
              } else {
                dSteps = sqord.steps;
              }
            }

            for (let i = dStepsR; i <= dSteps; i++) {
              showObjects(sqord, j, i, true)
            }
          }

          if (p.floor(p.abs(sqord.index)) % 1 === 0 && !sqord.stop) {
            if (sqord.reverse) {
              if (sqord.moveSegments2 < sqord.segments) {
                sqord.moveSteps2++;
              }
            } else {
              if (sqord.moveSegmentsR2 >= 0) {
                sqord.moveStepsR2--;
              }
            }      
          }

          if (sqord.reverse && sqord.moveSteps2 === sqord.steps && sqord.moveSegments2 < sqord.segments) {
            sqord.moveSegments2++;
            sqord.moveSteps2 = 0;
          }

          if (!sqord.reverse && sqord.moveStepsR2 === 0 && sqord.moveSegmentsR2 >= 0) {
            sqord.moveSegmentsR2--;
            sqord.moveStepsR2 = sqord.steps;
          }

          if (
            (!sqord.changing && sqord.reverse && sqord.moveSegments2 >= p.floor(sqord.segments)) ||
            (!sqord.changing && !sqord.reverse && sqord.moveSegmentsR2 <= 0)
          ) {
            sqord.changing = true;

            setTimeout(() => {
              sqord.counter = sqord.reverse ? maxArrayLength : 0;
              sqord.moveSteps = 0;
              sqord.moveStepsR = 0;
              sqord.moveSegments = 0;
              sqord.moveSegmentsR = 0;
              sqord.start = false;
              sqord.changing = false;
              sqord.reverse = !sqord.reverse;
            }, 3000);
          }
        }

        for (let j = 0; j < (mySqord.current.segments - 1); j++) {
          for (let i = 0; i <= (mySqord.current.steps); i++) {
            let hue = sqord.reverse ?
              360 - (((sqord.color / sqord.spread) + sqord.startColor + p.abs(sqord.index)) % 360) :
              (((sqord.color / sqord.spread) + sqord.startColor) + p.abs(sqord.index)) % 360;

            const foundLines = sqord.lines.filter((l: any) => l.i === i && l.j === j);

            for (const foundLine of foundLines) {
              if (hue) {
                foundLine.line.material.color.setHSL(hue / 360, 1, 0.5);
              } else {
                let gray = ((mySqord.current.color + p.abs(sqord.index)) % 255) / 255;
                foundLine.line.material.color = new THREE.Color(gray, gray, gray);
              }

              foundLine.line.material.needsUpdate = true;
              mySqord.current.color++;
            }

            const foundOutlines = sqord.outlines.filter((l: any) => l.i === i && l.j === j);

            for (const foundOutline of foundOutlines) {
              if (hue) {
                foundOutline.outline.material.color.setHSL(hue / 360, 1, 0.5);
              } else {
                let gray = ((mySqord.current.color + p.abs(sqord.index)) % 255) / 255;
                foundOutline.outline.material.color = new THREE.Color(gray, gray, gray);
              }

              foundOutline.outline.material.needsUpdate = true;
              mySqord.current.color++;
            }

            const foundObjects = sqord.objects.filter((l: any) => l.i === i && l.j === j);

            for (const foundObject of foundObjects) {
              if (hue) {
                foundObject.object.material.color.setHSL(hue / 360, 1, 0.5);
              } else {
                let gray = ((mySqord.current.color + p.abs(sqord.index)) % 255) / 255;
                foundObject.object.material.color = new THREE.Color(gray, gray, gray);
              }

              foundObject.object.material.needsUpdate = true;
              mySqord.current.color++;
            }
          }
  
          mySqord.current.seed = parseInt(mySqord.current.hash.slice(0, 16), 16);
        }

        sqord.index = sqord.reverse ? (sqord.index - sqord.speed) : sqord.index + sqord.speed;

        // if (!mySqord.current.pause && p.abs(mySqord.current.index) > mySqord.current.speed * 15) {
        //   scene.traverse((o) => {
        //     if (o instanceof THREE.Mesh){
        //       o.geometry.dispose();
        //       o.material.dispose();
        //     }
        //   });

        //   while(scene.children.length > 0){ 
        //     scene.remove(scene.children[0]); 
        //   }
        // }

        renderer.render(scene, camera);
      };
  
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
      <div style={{ height: '100vh', width: '100vw'}} ref={myRender} />
    </VStack>
  )
};
