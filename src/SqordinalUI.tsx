import { useState, useEffect } from "react"
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
  IconButton,
  Tooltip,
  Select,
} from "@chakra-ui/react"
import { useParams, useNavigate, createSearchParams, useLocation } from 'react-router-dom';
import { TbWaveSine, TbInfinity, TbRecordMail, TbRecordMailOff } from 'react-icons/tb';

import { Sqordinal } from "./Sqordinal";
import { Sqordinal2 } from "./Sqordinal2";
import { Sqordinal3D } from "./Sqordinal3D";
import { seeds } from "./seeds";
import RecordTimer from "./RecordTimer";
import SqordSet from "./SqordSet";

let chunks: any = [];
let recorder: any;

const openInNewTab = (url: string) => {
  const newWindow = window.open(url, '_blank', 'noopener,noreferrer')
  if (newWindow) newWindow.opener = null
}

export const SqordinalUI = () => {
  const { search } = useLocation();
  const set: number = parseInt(new URLSearchParams(search).get('set') || '0', 10);
  const vibe: string = new URLSearchParams(search).get('vibe') || '0';
  const m: string = new URLSearchParams(search).get('mode') || '0';

  const { id, awakenId }: any = useParams();
  const navigate = useNavigate();
  const [isPause, setIsPause] = useState(vibe === '1' ? true : false);
  const [record, setRecord] = useState(false);
  const [value, setValue]: any = useState(set);
  const [canvas, setCanvas]: any = useState(null);

  const [mode, setMode]: any = useState(m);

  const index = awakenId ? parseInt(awakenId, 10) : parseInt(id, 10);
  const outOfRange = index < 0 || index > 255;

  useEffect(() => {
    if (outOfRange || _.isNaN(index)) {
      window.location.assign(`/`);
    }
  }, [index, navigate]);

  const seed = seeds[index];

  const handleInputChange = (event: any) => {
    setValue(event.target.value);
  }

  const handleShift = () => {
    navigate({
      pathname: awakenId ? `/awaken/${awakenId}` : `/sqordinal/${id}`,
      search: `?${createSearchParams({
        set: value,
        vibe: isPause ? '1' : '0',
        mode,
      })}`,
    }, { replace: true });
  }

  const handleKeyDown = (event: any) => {
    if (event.key === 'Enter') {
      handleShift();
    }
  }

  useEffect(() => {
    if (canvas) {
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
  
        a.href = videoURL;
        a.download = 'sqordinal.webm';
  
        document.body.appendChild(a);
  
        a.click();
        document.body.removeChild(a);
      };
    }
  }, [canvas]);

  const handleSetPause = () => {
    setIsPause(!isPause)
    navigate({
      pathname: awakenId ? `/awaken/${awakenId}` : `/sqordinal/${id}`,
      search: `?${createSearchParams({
        set: value,
        vibe: isPause ? '0' : '1',
        mode,
      })}`,
    }, { replace: true });
  };

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
            color={_.get(seed, 'uncommon', false) ? '#E83A89' : 'white'}
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
            backgroundColor="transparent"
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
            borderColor="pink"
            borderWidth={1}
            borderRadius={0}
            _focus={{
              boxShadow: "none",
            }}
            _hover={{
              boxShadow: "none",
            }}
            height={'30px'}
            fontSize={'10px'}
            width={'60px'}
            textAlign={'left'}
          />
          <SqordSet />
        </HStack>
        <HStack
          justify={'flex-start'}
          align={'flex-start'}
          paddingTop={'10px'}
        >
          <Select
            defaultValue={mode}
            onChange={(event) => {
              setMode(event.target.value);
              navigate({
                pathname: awakenId ? `/sqordinal/${awakenId}` : `/sqordinal/${id}`,
                search: `?${createSearchParams({
                  set: value,
                  vibe: isPause ? '1' : '0',
                  mode: event.target.value,
                })}`,
              }, { replace: true });
            }}
            backgroundColor={'transparent'}
          >
            <option value="0">Seed</option>
            <option value="1">Sapling</option>
            <option value="2">Tree</option>
          </Select>
          <Tooltip
            label={isPause ? 'Stop Vibe' : 'Start Vibe'}
            placement="bottom"
          >
          <IconButton
            fontSize={'12px'}
            fontWeight={'bold'}
            aria-label="Vibe"
            icon={isPause ? <Icon as={TbWaveSine} color="#FE0101" boxSize="28px" /> : <Icon as={TbInfinity} color="#16FE07" boxSize="28px" />}
            onClick={() => {
              handleSetPause();
            }}
            backgroundColor="transparent"
            _hover={{ backgroundColor: 'gray.800' }}
            _active={{ backgroundColor: 'gray.900' }}
          />
          </Tooltip>
          {mode !== "2" && (
            <Tooltip
              label={record ? 'Stop Recording' : 'Start Recording'}
              placement="bottom"
            >
              <IconButton
                fontSize={'12px'}
                fontWeight={'bold'}
                aria-label="Record"
                icon={record ? <Icon as={TbRecordMailOff} color="#FE0101" boxSize="28px" /> : <Icon as={TbRecordMail} color="#0100FF" boxSize="28px" />}
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
                backgroundColor="transparent"
                _hover={{ backgroundColor: 'gray.800' }}
                _active={{ backgroundColor: 'gray.900' }}
              />
            </Tooltip>
          )}
          {record && <RecordTimer />}
        </HStack>
      </VStack>
      {!outOfRange && mode === "0" && (
        <Sqordinal seed={seed} setCanvas={setCanvas} set={set} isPause={isPause} />
      )}
      {!outOfRange && mode === "1" && (
        <Sqordinal2 seed={seed} setCanvas={setCanvas} set={set} isPause={isPause} />
      )}
      {!outOfRange && mode === "2" && (
        <Sqordinal3D seed={seed} set={set} isPause={isPause} />
      )}
    </VStack>
  )
};
