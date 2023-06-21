import { BrowserRouter as Router, Route, Routes, useNavigate } from 'react-router-dom';
import ReactGA from 'react-ga';
import {
  ChakraProvider,
  extendTheme,
  VStack,
  Image,
  HStack,
  Box,
  Text,
} from "@chakra-ui/react"

import { FaTwitter, FaMediumM, FaDiscord } from 'react-icons/fa'

import { Home } from "./Home";
import { Sqordinal } from "./Sqordinal";
import { Sqordinal3D } from "./Sqordinal3D";
import MusicPlayer from "./MusicPlayer";

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

const Header = () => {
  const navigate = useNavigate();

  return (
    <VStack
      zIndex={100000}
      position={'fixed'}
      top={0}
      left={0}
      paddingLeft={'20px'}
      paddingTop={'20px'}
      paddingBottom={'20px'}
      justify={'flex-start'}
      align={'flex-start'}
      spacing={1}
      // backgroundColor={'black'}
      width={'100vw'}
    >
      <HStack
        spacing={6}
        paddingLeft={'10px'}
      >
        <Image
          src="/sqordinals.gif"
          alt="Sqordinals"
          width="140px"
          _hover={{
            cursor: 'pointer',
          }}
          onClick={() => {
            window.location.assign(`/`);
          }}
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
    </VStack>
  )
}

const Footer = () => {
  return (
    <VStack
      zIndex={100000}
      position={'fixed'}
      bottom={0}
      left={0}
      paddingLeft={'20px'}
      paddingBottom={'10px'}
      paddingTop={'10px'}
      justify={'flex-start'}
      align={'flex-start'}
      spacing={1}
      // backgroundColor={'black'}
      width={'100vw'}
      opacity={1}
    >
      <MusicPlayer />
    </VStack>
  )
};

export const App = () => {
  return (
    <ChakraProvider theme={theme}>
      <Router>
        <Header />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="sqordinal/:id" element={<Sqordinal3D />} />
        </Routes>
        <Footer />
      </Router>
    </ChakraProvider>
  );
}
