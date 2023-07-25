import { useEffect, useRef } from "react"
import _ from 'lodash';
import * as THREE from 'three';
import { ArcballControls } from "three/examples/jsm/controls/ArcballControls";
import {
  VStack,
} from "@chakra-ui/react"

import {
  generateRandomHex,
  makeSqord,
  displaySqord,
} from "./utility";

function shiftSceneLeft(scene: any, distance: number) {
  const leftVector = new THREE.Vector3(-1, 0, 0);
  scene.position.add(leftVector.multiplyScalar(distance));
}

function updateGroupCenter(group: any, camera: any, scene: any) {
  let box = new THREE.Box3().setFromObject(group);
  let size = box.getSize(new THREE.Vector3());

  let maxDim = Math.max(size.x, size.y, size.z);
  let fov = camera.fov * (Math.PI / 180);
  let cameraZ = Math.abs(maxDim / 4 * Math.tan(fov * 2));
  
  camera.position.z = cameraZ * 3;
}

let cleanup = false;

export const Sqordinal3D = ({ seed, set, isPause, setSqord }: any) => {
  const myRender: any = useRef();
  const mySqord: any = useRef();
  const mySet: any = useRef();
  const myGroup: any = useRef();
  const myScene: any = useRef();
  const myControls: any = useRef();
  const myCamera: any = useRef();
  const myAnimate: any = useRef();

  useEffect(() => {
    if (!_.isUndefined(mySet.current) && mySet.current !== set) {
      window.set = 0;

      if (myGroup.current) {
        myGroup.current.traverse((object: any) => {
          if (!object.isMesh) return;
        
          if (object.geometry) {
            object.geometry.dispose();
          }
        
          if (object.material) {
            if (Array.isArray(object.material)) {
              object.material.forEach((material: any) => material.dispose());
            } else {
              object.material.dispose();
            }
          }
        });
  
        while(myGroup.current.children.length > 0){ 
          myGroup.current.remove(myGroup.current.children[0]); 
        }
      }

      mySqord.current = makeSqord(seed.hash, false, null);

      if (set > 0) {
        for (let i = 1; i <= set; i++) {
          mySqord.current = makeSqord('', true, generateRandomHex(mySqord.current));
        }
      }

      setSqord(mySqord.current);

      mySet.current = window.set;
      mySqord.current.pause = isPause;

      for (let j = 0; j < (mySqord.current.segments - 1); j++) {
        for (let i = 0; i <= (mySqord.current.steps); i++) {
          displaySqord(mySqord, myGroup.current, j, i);
        }

        mySqord.current.seed = parseInt(mySqord.current.hash.slice(0, 16), 16);
      }

      mySqord.current.counter = !mySqord.current.reverse ? mySqord.current.allObjects.length - 1 : 0;

      updateGroupCenter(myGroup.current, myCamera.current, myScene.current);
    }
  }, [set]);

  useEffect(() => {
    if (mySqord.current) {
      mySqord.current.pause = isPause;
    }
  }, [isPause]);

  useEffect(() => {
    if (!mySqord.current && seed) {
      window.set = 0;
      myScene.current = new THREE.Scene();
      myCamera.current = new THREE.PerspectiveCamera(33, window.innerWidth / window.innerHeight, 0.1, 3000);
      const renderer = new THREE.WebGLRenderer({ antialias: true });
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.setSize(window.innerWidth, window.innerHeight);

      myRender.current.appendChild(renderer.domElement);

      myControls.current = new ArcballControls( myCamera.current, document.body, myScene.current );

      myControls.current.addEventListener('change', function () {
        renderer.render( myScene.current, myCamera.current );
      });

      myControls.current.setGizmosVisible(false);
      myControls.current.maxDistance = 2000;

      const hemiLight = new THREE.HemisphereLight(0x000000, 0xffffff, 1);
      // hemiLight.position.set(200, 200, 0);
      myScene.current.add(hemiLight);

      // const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
      // myScene.current.add(ambientLight);

      mySqord.current = makeSqord(seed.hash, false, null);
      let sqord = mySqord.current;
      sqord.height = window.innerHeight;
      sqord.width = window.innerWidth;

      if (set > 0) {
        for (let i = 1; i <= set; i++) {
          mySqord.current = makeSqord('', true, generateRandomHex(mySqord.current));
        }
      }

      setSqord(mySqord.current);

      mySet.current = window.set;
      mySqord.current.pause = isPause;

      myGroup.current = new THREE.Group();

      for (let j = 0; j < (mySqord.current.segments - 1); j++) {
        for (let i = 0; i <= (mySqord.current.steps); i++) {
          displaySqord(mySqord, myGroup.current, j, i);
        }

        mySqord.current.seed = parseInt(mySqord.current.hash.slice(0, 16), 16);
      }

      mySqord.current.counter = !mySqord.current.reverse ? mySqord.current.allObjects.length - 1 : 0;

      myScene.current.add(myGroup.current);

      updateGroupCenter(myGroup.current, myCamera.current, myScene.current);
      shiftSceneLeft(myScene.current, window.innerWidth / 4);

      const animate = function () {
        myAnimate.current = requestAnimationFrame(animate);

        if (!mySqord.current.pause) {
          myGroup.current.rotation.y += mySqord.current.speed / 1000 * mySqord.current.rotateY;
          myGroup.current.rotation.x += mySqord.current.speed / 1000 * mySqord.current.rotateX;
          myGroup.current.rotation.z += mySqord.current.speed / 1000 * mySqord.current.rotateZ;
        }

        myControls.current.target.copy( myGroup.current.position );
        myControls.current.update();

        mySqord.current.color = 0;

        if (!mySqord.current.start && !mySqord.current.flipper) {
          const allObject = mySqord.current.allObjects[mySqord.current.counter];
          allObject[allObject.type].visible = false;

          mySqord.current.counter = !mySqord.current.reverse ? mySqord.current.counter - 1 : mySqord.current.counter + 1;

          if (
            (!mySqord.current.reverse && mySqord.current.counter === 0) ||
            (mySqord.current.reverse && mySqord.current.counter === mySqord.current.allObjects.length - 1)
          ) {
            mySqord.current.reverse = !mySqord.current.reverse;
            mySqord.current.start = true;
          }
        }

        if (mySqord.current.start && !mySqord.current.flipper && !mySqord.current.changing) {
          const allObject = mySqord.current.allObjects[mySqord.current.counter];
          allObject[allObject.type].visible = true;

          mySqord.current.counter = !mySqord.current.reverse ? mySqord.current.counter - 1 : mySqord.current.counter + 1;

          if (
            (!mySqord.current.reverse && mySqord.current.counter === 0) ||
            (mySqord.current.reverse && mySqord.current.counter === mySqord.current.allObjects.length - 1)
          ) {
            mySqord.current.changing = true;

            setTimeout(() => {
              mySqord.current.start = false;
              mySqord.current.changing = false;
              if (mySqord.current.dodge) {
                mySqord.current.counter = mySqord.current.reverse ? 0 : mySqord.current.allObjects.length - 1;
              } else {
                mySqord.current.reverse = !mySqord.current.reverse;
              }
            }, 10000);
          }
        }

        for (const allObject of mySqord.current.allObjects) {
          let hue = mySqord.current.flow ?
            360 - (((mySqord.current.color / mySqord.current.spread) + mySqord.current.startColor + Math.abs(mySqord.current.index)) % 360) :
            (((mySqord.current.color / mySqord.current.spread) + mySqord.current.startColor) + Math.abs(mySqord.current.index)) % 360;

          if (allObject.type !== 'blank') {
            if (hue) {
              allObject[allObject.type].material.color.setHSL(hue / 360, 1, 0.5);
            } else {
              let gray = ((mySqord.current.color + Math.abs(mySqord.current.index)) % 255) / 255;
              allObject[allObject.type].material.color = new THREE.Color(gray, gray, gray);
            }

            allObject[allObject.type].material.needsUpdate = true;
            mySqord.current.color++;
          }

          mySqord.current.seed = parseInt(mySqord.current.hash.slice(0, 16), 16);
        }

        mySqord.current.index = mySqord.current.reverse ? (mySqord.current.index - mySqord.current.speed) : mySqord.current.index + mySqord.current.speed;

        renderer.render(myScene.current, myCamera.current);
      };

      animate();
    }
  }, []);

  useEffect(() => {
    return () => {
      if (myAnimate.current && myGroup.current && myScene.current && process.env.NODE_ENV === 'production') {
        cancelAnimationFrame(myAnimate.current);

        myGroup.current.traverse((object: any) => {
          if (!object.isMesh) return;

          if (object.geometry) {
            object.geometry.dispose();
          }
        
          if (object.material) {
            if (Array.isArray(object.material)) {
              object.material.forEach((material: any) => material.dispose());
            } else {
              object.material.dispose();
            }
          }
        });
  
        while(myGroup.current.children.length > 0){ 
          myGroup.current.remove(myGroup.current.children[0]); 
        }

        myScene.current.remove(myGroup.current);

        myScene.current.remove();
      }
    };
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
