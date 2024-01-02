import { BrowserRouter as Router, Route, Routes, useNavigate } from 'react-router-dom';
import { useState } from "react";
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
import { getAddress, signMessage } from 'sats-connect';

import { FaTwitter, FaMediumM, FaDiscord, FaMusic, FaSpotify } from 'react-icons/fa'

import { Home } from "./Home";
import { SqordinalUI } from "./SqordinalUI";
import { Sqore } from "./Sqore";
import MusicPlayer from "./MusicPlayer";


declare global {
  interface Window {
    btc: any;
    unisat: any;
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
          onClick={async () => {

            // const getAddressOptions: any = {
            //   payload: {
            //     purposes: ['ordinals'],
            //     message: 'Address for receiving Ordinals and payments',
            //     network: {
            //       type:'Mainnet'
            //     },
            //   },
            //   onFinish: async (response: any) => {
            //     console.log(response.addresses[0].address);
            //     const signMessageOptions: any = {
            //       payload: {
            //         network: {
            //           type: "Mainnet",
            //         },
            //         address: response.addresses[0].address,
            //         message: "test",
            //       },
            //       onFinish: (r: any) => {
            //         // signature
            //         console.log(r)
            //       },
            //       onCancel: () => alert("Canceled"),
            //     };
            //     await signMessage(signMessageOptions);
            //   },
            //   onCancel: () => alert('Request canceled'),
            //   }
                
            // await getAddress(getAddressOptions);

            // if (typeof window.unisat !== 'undefined') {
            //   console.log('UniSat Wallet is installed!');
            //   let accounts = await window.unisat.requestAccounts();
            //   console.log(accounts);

            //   let res = await window.unisat.signMessage("test","bip322-simple");
            //   console.log(res);
            // }
            // if (window && window.btc) {

            //   const userAddresses = await window.btc?.request('getAddresses');

            //   console.log(userAddresses);

            //   // const userAccount = userAddresses.result.addresses
            //   //   .find((address: any) => address.type === 'p2tr');

            //   // console.log(userAccount)

            //   const response = await window.btc.request('signMessage', { 
            //     message: 'test', 
            //     paymentType: 'p2tr' // or 'p2wphk' (default)
            //   });

            //   console.log(JSON.stringify(response));
            // }
            // window.location.assign(`/`);
            navigate('sqordinal');
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
          onClick={() => openInNewTab('https://open.spotify.com/album/0sponPpRy5Z7w8A1isGjBx?si=CQwYRvMdREeYEjraPO6_aA')}
        >
          <FaSpotify
            color='#1BD661'
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
        <Box
          _hover={{
            cursor: 'pointer',
            opacity: 0.8,
          }}
          onClick={() => navigate('/')}
        >
          <FaMusic
            color='#0100FF'
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

const Footer = (props: any) => {
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
      <MusicPlayer setTrack={props.setTrack} />
    </VStack>
  )
};

export const App = () => {
  const [track, setTrack]: any = useState(0);

  return (
    <ChakraProvider theme={theme}>
      <Router>
        <Header />
        <Routes>
          <Route path="/" element={<Sqore track={track} />} />
          <Route path="sqordinal" element={<Home />} />
          <Route path="sqordinal/:id" element={<SqordinalUI />} />
        </Routes>
        <Footer setTrack={setTrack} />
      </Router>
    </ChakraProvider>
  );
}
