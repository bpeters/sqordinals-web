import { useState, useEffect } from "react"
import { BrowserRouter as Router, Route, Routes, useNavigate, useLocation, createSearchParams } from 'react-router-dom';
import ReactGA from 'react-ga';
import {
  ChakraProvider,
  Box,
  Text,
  Input,
  VStack,
  Grid,
  extendTheme,
  Image,
  HStack,
  Button,
  IconButton,
} from "@chakra-ui/react"
import { FaTwitter, FaMediumM, FaDiscord } from 'react-icons/fa'
import { TbWaveSine, TbInfinity } from 'react-icons/tb'

import './Sqord';
import MusicPlayer from "./MusicPlayer";

declare global {
  interface Window {
    newHash: string;
    seed: boolean;
    isPause: boolean;
  }
}

ReactGA.initialize('G-S8026RGDNM');

const theme = extendTheme({
  styles: {
    global: {
      body: {
        bg: 'black', // This sets the background color to black
        color: 'white', // This sets the text color to white
      },
    },
  },
})

const openInNewTab = (url: string) => {
  const newWindow = window.open(url, '_blank', 'noopener,noreferrer')
  if (newWindow) newWindow.opener = null
}

const Home = () => {
  const navigate = useNavigate();
  const { search } = useLocation();
  const seed = new URLSearchParams(search).get('seed');

  const [value, setValue]: any = useState(window.hash);
  const [isPause, setIsPause] = useState(false);

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
  }

  useEffect(() => {
    if (seed && seed !== value) {
      setValue(seed);
      window.newHash = seed;
      window.seed = true;
    }
  }, [seed]);

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
          <HStack
            spacing={4}
            paddingLeft={'10px'}
            justify={'flex-start'}
            align={'flex-start'}
          >
            <MusicPlayer />
            <IconButton
              aria-label="Vibe"
              icon={isPause ? <TbWaveSine color="#FE0101" size={'20px'} /> : <TbInfinity color="#16FE07" size={'20px'} />}
              onClick={handlePause}
              backgroundColor="black"
              _hover={{ backgroundColor: 'gray.800' }}
              _active={{ backgroundColor: 'gray.900' }}
            />
            <Text
              fontSize={'12px'}
              fontWeight={'bold'}
              paddingTop={'10px'}
            >
              {isPause ? 'Vibe' : 'Infinite'}
            </Text>
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
          >
            <Text fontSize={'12px'}>
              Deterministically Infinite Onchain Art, Secured by <b>Bitcoin</b>
            </Text>
          </HStack>
          <HStack
            spacing={4}
            paddingLeft={'10px'}
            _hover={{
              cursor: 'pointer',
              opacity: 0.8,
            }}
            onClick={() => openInNewTab('https://www.squiggledao.com/learn')}
          >
            <Text fontSize={'12px'}>
              Inspired by <b>Chromie Squiggles</b> by Erick Calderon "Snowfro"
            </Text>
          </HStack>
          <HStack
            spacing={2}
            paddingLeft={'10px'}
          >
            <Text fontSize={'8px'}>
              v1
            </Text>
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
          </HStack>
        </VStack>
      </Grid>
    </Box>
  )
};

export const App = () => {
  return (
    <ChakraProvider theme={theme}>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
        </Routes>
      </Router>
    </ChakraProvider>
  );
}
