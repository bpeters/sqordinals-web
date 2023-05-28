import * as React from "react"
import {
  ChakraProvider,
  Box,
  Text,
  Link,
  VStack,
  Code,
  Grid,
  extendTheme,
  Image,
  HStack,
} from "@chakra-ui/react"
import { FaTwitter, FaMediumM, FaDiscord } from 'react-icons/fa'

import './Sqord';
import MusicPlayer from "./MusicPlayer";

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

export const App = () => (
  <ChakraProvider theme={theme}>
    <Box textAlign="center" fontSize="xl">
      <Grid minH="100vh" p={3}>
        <VStack
          zIndex={100000}
          position={'absolute'}
          bottom={'20px'}
          left={'20px'}
          justify={'flex-start'}
          align={'flex-start'}
        >
          <HStack
            spacing={4}
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
            <MusicPlayer />
          </HStack>
          <HStack
            spacing={4}
          >
            <Text fontSize={'12px'}>
              Deterministically Infinite Onchain Art, Secured by <b>Bitcoin</b>
            </Text>
          </HStack>
        </VStack>
      </Grid>
    </Box>
  </ChakraProvider>
)
