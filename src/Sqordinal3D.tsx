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

      // Create a directional light
      const light = new THREE.DirectionalLight(0xffffff, 0.2);
      light.position.set(0, 500, 0); 
      scene.add(light);

      // Create an ambient light
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
      scene.add(ambientLight);

      mySqord.current = makeSqord(seed.hash, false, null);

      window.set = 0;
  
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

      console.log(mySqord.current.fuzzy, mySqord.current.slinky, mySqord.current.pipe, mySqord.current.segmented, mySqord.current.bold, mySqord.current.creepy, mySqord.current.flowers)

      let group = new THREE.Group();

      for (let j = 0; j < (mySqord.current.segments - 1); j++) {
        for (let i = 0; i <= (mySqord.current.steps); i++) {
          displaySqord(mySqord, scene, group, p, j, i);
        }

        mySqord.current.seed = parseInt(mySqord.current.hash.slice(0, 16), 16);
      }

      scene.add(group);

      group.position.x -= window.innerWidth / 4;

      mySqord.current.index = mySqord.current.reverse ? (mySqord.current.index - mySqord.current.speed) : mySqord.current.index + mySqord.current.speed;


      const animate = function () {
        requestAnimationFrame(animate);

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

        //   mySqord.current = makeSqord('', true, generateRandomHex(mySqord.current));
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
      <div style={{ height: '100vh', width: '100vw'}} ref={myRender} />
    </VStack>
  )
};
