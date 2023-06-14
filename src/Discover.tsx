import { useState, useEffect } from "react"
import { useNavigate, useLocation, createSearchParams } from 'react-router-dom';
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
import { TbWaveSine, TbInfinity, TbRecordMail, TbRecordMailOff } from 'react-icons/tb'

import './Sqord';
import MusicPlayer from "./MusicPlayer";
import RecordTimer from "./RecordTimer";
import SqordSet from "./SqordSet";

declare global {
  interface Window {
    newHash: string;
    seed: boolean;
    isPause: boolean;
    record: boolean;
  }
}

const openInNewTab = (url: string) => {
  const newWindow = window.open(url, '_blank', 'noopener,noreferrer')
  if (newWindow) newWindow.opener = null
}

export const Discover = () => {
  const navigate = useNavigate();
  const { search } = useLocation();
  const seed = new URLSearchParams(search).get('seed');
  const set: string = new URLSearchParams(search).get('set') || '0';
  const vibe: string = new URLSearchParams(search).get('vibe') || '0';

  const [value, setValue]: any = useState(window.hash);
  const [isPause, setIsPause] = useState(false);
  const [record, setRecord] = useState(false);
  const [newCount, setNewCount] = useState(0);

  const handleInputChange = (event: any) => {
    setValue(event.target.value);
  }

  const updateSeed = () => {
    window.newHash = value;
    window.seed = true;
    navigate({
      pathname: '/',
      search: `?${createSearchParams({
        seed: value,
        set: newCount.toString(),
        vibe: isPause ? '1' : '0',
      })}`,
    }, { replace: true });
  };

  const handleKeyDown = (event: any) => {
    if (event.key === 'Enter') {
      updateSeed();
    }
  }

  const handlePause = () => {
    setIsPause(!isPause);
    window.isPause = !isPause;
    navigate({
      pathname: '/',
      search: `?${createSearchParams({
        seed: value,
        set: newCount.toString(),
        vibe: !isPause ? '1' : '0',
      })}`,
    });
  }

  useEffect(() => {
    if (seed && seed !== value) {
      setValue(seed);

      window.newHash = seed;
      window.seed = true;
    }

    if (set && parseInt(set, 10) !== newCount) {
      setNewCount(parseInt(set, 10));
      window.updateSet = parseInt(set, 10);
    }

    if (vibe) {
      if (vibe === '1') {
        setIsPause(true);
        window.isPause = true;
      }

      if (vibe === '0') {
        setIsPause(false);
        window.isPause = false;
      }
    }
  }, [seed, set, vibe]);

  return (
    <Box textAlign="center" fontSize="xl">
      <Grid minH="100vh" p={3}>
        <VStack
          zIndex={100000}
          position={'absolute'}
          top={'20px'}
          left={'20px'}
          justify={'flex-start'}
          align={'flex-start'}
          spacing={1}
        >
          <MusicPlayer />
          <HStack
            justify={'flex-start'}
            align={'flex-start'}
            spacing={4}
          >
            <Button
              fontSize={'12px'}
              fontWeight={'bold'}
              aria-label="Record"
              leftIcon={record ? <Icon as={TbRecordMailOff} color="#FE0101" boxSize="28px" /> : <Icon as={TbRecordMail} color="#0100FF" boxSize="28px" />}
              onClick={() => {
                window.record = !window.record;
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
          <HStack
            spacing={4}
            justify={'flex-start'}
            align={'flex-start'}
          >
            <Button
              fontSize={'12px'}
              fontWeight={'bold'}
              aria-label="Record"
              leftIcon={isPause ? <Icon as={TbWaveSine} color="#FE0101" boxSize="28px" /> : <Icon as={TbInfinity} color="#16FE07" boxSize="28px" />}
              onClick={handlePause}
              backgroundColor="black"
              _hover={{ backgroundColor: 'gray.800' }}
              _active={{ backgroundColor: 'gray.900' }}
            >
              {isPause ? 'Vibe Mode' : 'Infinite Mode'}
            </Button>
          </HStack>
        </VStack>
        <VStack
          zIndex={100000}
          position={'absolute'}
          bottom={'20px'}
          left={'20px'}
          justify={'flex-start'}
          align={'flex-start'}
          spacing={1}
        >
          <HStack
            spacing={6}
            paddingLeft={'10px'}
          >
            <Image
              src="/sqordinals.gif"
              alt="Sqordinals"
              width="140px"
            />
            <Box
              _hover={{
                cursor: 'pointer',
                opacity: 0.8,
              }}
              onClick={() => openInNewTab('https://discord.gg/sqordinals')}
            >
              <FaDiscord
                color='#01FFFF'
              />
            </Box>
            <Box
              _hover={{
                cursor: 'pointer',
                opacity: 0.8,
              }}
              onClick={() => openInNewTab('https://sqordinals.medium.com/')}
            >
              <FaMediumM
                color='#FEFE04'
              />
            </Box>
            <Box
              _hover={{
                cursor: 'pointer',
                opacity: 0.8,
              }}
              onClick={() => openInNewTab('https://twitter.com/sqordinals')}
            >
              <FaTwitter
                color='#0100FF'
              />
            </Box>
            <Box
              _hover={{
                cursor: 'pointer',
                opacity: 0.8,
              }}
              onClick={() => openInNewTab('https://magiceden.io/ordinals/marketplace/sqordinals')}
            >
              <Image
                src="/magic-eden.svg"
                alt="MagicEden"
                width="30px"
              />
            </Box>
          </HStack>
          <HStack
            spacing={4}
            paddingLeft={'10px'}
            paddingTop={'6px'}
          >
            <Text fontSize={'12px'} color={'#01FFFF'}>
              Deterministically Infinite Onchain Art, Secured by <b>Bitcoin</b>
            </Text>
          </HStack>
          <HStack
            spacing={2}
            paddingLeft={'10px'}
          >
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
                if (value) {
                  updateSeed();
                }
              }}
            >
              Seed
            </Button>
            <SqordSet />
            <Input 
              value={value}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              backgroundColor="black"
              color="white"
              borderColor="transparent"
              borderWidth={1}
              borderRadius={0}
              _focus={{
                borderColor: 'transparent',
                borderBottomColor: "white",
                boxShadow: "none",
              }}
              _hover={{
                borderBottomColor: "white",
                boxShadow: "none",
              }}
              fontSize={'10px'}
              width={'290px'}
              padding={'4px'}
            />
            <Input 
              value={newCount}
              type={'number'}
              onChange={(event: any) => {
                setNewCount(event.target.value);
                window.updateSet = event.target.value;
              }}
              onKeyDown={handleKeyDown}
              backgroundColor="black"
              color="white"
              borderColor="transparent"
              borderWidth={1}
              borderRadius={0}
              _focus={{
                borderColor: 'transparent',
                borderBottomColor: "white",
                boxShadow: "none",
              }}
              _hover={{
                borderBottomColor: "white",
                boxShadow: "none",
              }}
              fontSize={'10px'}
              width={'40px'}
              padding={'4px'}
            />
          </HStack>
        </VStack>
      </Grid>
    </Box>
  )
};
