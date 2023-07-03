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
      sqord.height = window.innerHeight;
      sqord.width = window.innerWidth;

      sqord.ht = mapValue(sqord.decPairs[27], 0, 255, 3, 4);
      sqord.color = 0;
      sqord.div = Math.floor(mapValue(Math.round(sqord.decPairs[24]), 0, 230, 3, 20));

      console.log(sqord);

      let group = new THREE.Group();

      for (let j = 0; j < (sqord.segments - 1); j++) {
        for (let i = 0; i <= (sqord.steps); i++) {
          displaySqord(mySqord, group, j, i);
        }

        sqord.seed = parseInt(sqord.hash.slice(0, 16), 16);
      }

      sqord.counter = !sqord.reverse ? sqord.allObjects.length - 1 : 0;

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

        if (!sqord.start && !sqord.flipper) {
          const allObject = sqord.allObjects[sqord.counter];
          allObject[allObject.type].visible = false;

          sqord.counter = !sqord.reverse ? sqord.counter - 1 : sqord.counter + 1;

          if (
            (!sqord.reverse && sqord.counter === 0) ||
            (sqord.reverse && sqord.counter === sqord.allObjects.length - 1)
          ) {
            sqord.reverse = !sqord.reverse;
            sqord.start = true;
          }
        }

        if (sqord.start && !sqord.flipper && !sqord.changing) {
          const allObject = sqord.allObjects[sqord.counter];
          allObject[allObject.type].visible = true;

          sqord.counter = !sqord.reverse ? sqord.counter - 1 : sqord.counter + 1;

          if (
            (!sqord.reverse && sqord.counter === 0) ||
            (sqord.reverse && sqord.counter === sqord.allObjects.length - 1)
          ) {
            sqord.changing = true;

            setTimeout(() => {
              sqord.start = false;
              sqord.changing = false;
              if (sqord.dodge) {
                sqord.counter = sqord.reverse ? 0 : sqord.allObjects.length - 1;
              } else {
                sqord.reverse = !sqord.reverse;
              }
            }, 10000);
          }
        }

        for (const allObject of sqord.allObjects) {
          let hue = sqord.flow ?
            360 - (((sqord.color / sqord.spread) + sqord.startColor + Math.abs(sqord.index)) % 360) :
            (((sqord.color / sqord.spread) + sqord.startColor) + Math.abs(sqord.index)) % 360;

          if (allObject.type !== 'blank') {
            if (hue) {
              allObject[allObject.type].material.color.setHSL(hue / 360, 1, 0.5);
            } else {
              let gray = ((sqord.color + Math.abs(sqord.index)) % 255) / 255;
              allObject[allObject.type].material.color = new THREE.Color(gray, gray, gray);
            }

            allObject[allObject.type].material.needsUpdate = true;
            sqord.color++;
          }

          mySqord.current.seed = parseInt(mySqord.current.hash.slice(0, 16), 16);
        }

        sqord.index = sqord.reverse ? (sqord.index - sqord.speed) : sqord.index + sqord.speed;

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
