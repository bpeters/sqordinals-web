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
  
      const p = new Q5();

      p.setup = function () {
        let canvas = p.createCanvas(p.windowWidth, p.windowHeight);

        canvas.ontouchstart = () => {};
        canvas.ontouchmove = () => {};
        canvas.ontouchend = () => {};
      };

      mySqord.current.ht = p.map(mySqord.current.decPairs[27], 0, 255, 3, 4);
      mySqord.current.color = 0;
      mySqord.current.div = Math.floor(p.map(Math.round(mySqord.current.decPairs[24]), 0, 230, 3, 20));

      let group = new THREE.Group();

      console.log(mySqord.current);

      for (let j = 0; j < (mySqord.current.segments - 1); j++) {
        for (let i = 0; i <= (mySqord.current.steps); i++) {
          displaySqord(mySqord, scene, group, p, j, i);
        }

        mySqord.current.seed = parseInt(mySqord.current.hash.slice(0, 16), 16);
      }

      scene.add(group);

      let box = new THREE.Box3().setFromObject( group );
      let center = box.getCenter( new THREE.Vector3() );

      group.position.x = center.x;
      group.position.y = center.y;
      group.position.z = center.z;

      group.children.forEach((child) => {
        child.position.x -= center.x;
        child.position.y -= center.y;
        child.position.z -= center.z;
      });

      mySqord.current.index = mySqord.current.reverse ? (mySqord.current.index - mySqord.current.speed) : mySqord.current.index + mySqord.current.speed;

      document.body.addEventListener("keydown", function (event) {
        if (event.code === 'Space') {
          isRotating = !isRotating;
        }
      }, false);

      const animate = function () {
        requestAnimationFrame(animate);

        // ambientLight.intensity = (Math.sin(performance.now() * 0.001) + 1.0) * 0.5;
        // light.intensity = (Math.cos(performance.now() * 0.001) + 1.0) * 0.5;
        // hemiLight.intensity = !hemiLight.intensity ? 1 : 0;

        if (isRotating) {
          group.rotation.y += mySqord.current.speed / 100 * mySqord.current.rotateY;
          group.rotation.x += mySqord.current.speed / 100 * mySqord.current.rotateX;
          group.rotation.z += mySqord.current.speed / 100 * mySqord.current.rotateZ;
        }

        controls.target.copy( group.position );
        controls.update();

        mySqord.current.color = 0;

        for (let j = 0; j < (mySqord.current.segments - 1); j++) {
          for (let i = 0; i <= (mySqord.current.steps); i++) {
            let sqord = mySqord.current;

            let hue = sqord.reverse ?
              360 - (((sqord.color / sqord.spread) + sqord.startColor + p.abs(sqord.index)) % 360) :
              (((sqord.color / sqord.spread) + sqord.startColor) + p.abs(sqord.index)) % 360;

            const foundLine = sqord.lines.find((l: any) => l.i === i && l.j === j);

            if (foundLine) {
              if (hue) {
                foundLine.line.material.color.setHSL(hue / 360, 1, 0.5);
              } else {
                let gray = ((mySqord.current.color + p.abs(sqord.index)) % 255) / 255;
                foundLine.line.material.color = new THREE.Color(gray, gray, gray);
              }

              if (sqord.flipper) {
                foundLine.line.material.transparent = true;
                foundLine.line.material.opacity = (Math.sin(performance.now() * 0.001) * 0.5) + 0.55;
              }

              foundLine.line.material.needsUpdate = true;
              mySqord.current.color++;
            }

            const foundOutline = sqord.outlines.find((l: any) => l.i === i && l.j === j);

            if (foundOutline) {
              if (hue) {
                foundOutline.outline.material.color.setHSL(hue / 360, 1, 0.5);
              } else {
                let gray = ((mySqord.current.color + p.abs(sqord.index)) % 255) / 255;
                foundOutline.outline.material.color = new THREE.Color(gray, gray, gray);
              }

              if (sqord.flipper) {
                foundOutline.outline.material.transparent = true;
                foundOutline.outline.material.opacity = (Math.sin(performance.now() * 0.001) * 0.5) + 0.6;
              }

              foundOutline.outline.material.needsUpdate = true;
              mySqord.current.color++;
            }

            const foundObject = sqord.objects.find((l: any) => l.i === i && l.j === j);

            if (foundObject) {
              if (hue) {
                foundObject.object.material.color.setHSL(hue / 360, 1, 0.5);
              } else {
                let gray = ((mySqord.current.color + p.abs(sqord.index)) % 255) / 255;
                foundObject.object.material.color = new THREE.Color(gray, gray, gray);
              }

              if (sqord.flipper) {
                foundObject.object.material.transparent = true;
                foundObject.object.material.opacity = (Math.cos(performance.now() * 0.001) * 0.5) + 0.6;
              }

              foundObject.object.material.needsUpdate = true;
              mySqord.current.color++;
            }
          }

          mySqord.current.seed = parseInt(mySqord.current.hash.slice(0, 16), 16);
        };

        mySqord.current.index = mySqord.current.reverse ? (mySqord.current.index - mySqord.current.speed) : mySqord.current.index + mySqord.current.speed;

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
