import { Slider, SliderTrack, SliderFilledTrack, SliderThumb, IconButton, VStack, HStack, Text, Box, useToast } from '@chakra-ui/react';
import { useState, useEffect, useRef } from 'react';
import { FaPause, FaMusic, FaPlay } from 'react-icons/fa'
import { BiSkipNext } from 'react-icons/bi';

const songs = [
  '/audio/1_defi.wav',
  '/audio/2_beta.wav',
  '/audio/3_dox.wav',
  '/audio/4_circus.wav',
  '/audio/5_discover.wav',
  '/audio/6_blank.wav',
  '/audio/7_explore.wav',
  '/audio/8_ded.wav',
  '/audio/9_alpha.wav',
  '/audio/10_simp.wav',
  '/audio/11_infintium.wav',
  '/audio/12_heavy.wav',
  '/audio/13_stealth.wav',
  '/audio/14_sigma.wav',
  '/audio/15_dev.wav',
  '/audio/16_deep.wav',
  '/audio/17_burn.wav',
  '/audio/18_flowers.wav',
  '/audio/19_honk.wav',
  '/audio/20_naughty.wav',
  '/audio/21_swing.wav',
];

const songNames = [
  'defi',
  'beta',
  'dox',
  'circus',
  'discover',
  'blank',
  'explore',
  'ded',
  'alpha',
  'simp',
  'infintium',
  'heavy',
  'stealth',
  'sigma',
  'dev',
  'deep',
  'burn',
  'flowers',
  'honk',
  'naughty',
  'swing',
];

const openInNewTab = (url: string) => {
  const newWindow = window.open(url, '_blank', 'noopener,noreferrer')
  if (newWindow) newWindow.opener = null
}

const MusicPlayer = (props: any) => {
  const toast = useToast();
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSongIndex, setCurrentSongIndex] = useState(0);
  const audioRef: any = useRef(null);
  const [volume, setVolume] = useState(1);

  // useEffect(() => {
  //   toast({
  //     position: 'top-right',
  //     title: 'New Album Drop!',
  //     description: "",
  //     status: 'info',
  //     duration: 5000,
  //     isClosable: true,
  //   });
  // }, [])

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.removeEventListener('ended', playNextSong);
      audioRef.current.pause();
    }

    audioRef.current = new Audio(songs[currentSongIndex]);
    audioRef.current.addEventListener('ended', playNextSong);

    if (isPlaying) {
      audioRef.current.play().then(() => {
        audioRef.current.volume = volume;
      })
      .catch((error: any) => {
        console.log(error);
      });
    }

    return () => {
      audioRef.current.removeEventListener('ended', playNextSong);
      audioRef.current.pause();
    };
  }, [currentSongIndex, isPlaying]);

  useEffect(() => {
    audioRef.current.volume = volume;
  }, [volume]);

  const playNextSong = () => {
    const nextIndex = (currentSongIndex + 1) % songs.length;
    setCurrentSongIndex(nextIndex);
    props.setTrack(nextIndex);
  };

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleVolumeChange = (value: any) => {
    setVolume(value);
  };

  const renderSongsList = () => {
    return (
      <Box
        paddingY="4"
        overflowX="auto"
        whiteSpace="nowrap"
        maxWidth="100vw"
      >
        <HStack
          spacing="4"
        >
          {songs.map((song, index) => (
            <Box
              key={song}
              padding="2"
              borderRadius="md"
              borderWidth="1px"
              borderColor={currentSongIndex === index && isPlaying ? '#FF00EE' : 'white'}
              backgroundColor="transparent"
              _hover={{ borderColor: "#FF00EE", cursor: "pointer" }}
              onClick={() => {
                props.setTrack(index);
                setCurrentSongIndex(index);
                if (!isPlaying) {
                  setIsPlaying(true);
                }
              }}
            >
              <Text
                fontSize="sm"
                color={currentSongIndex === index && isPlaying ? '#FF00EE' : 'white'}
              >
                {songNames[index]}
              </Text>
            </Box>
          ))}
          <Box>
              <Text>
                fin
              </Text>
          </Box>
        </HStack>
      </Box>
    );
  };

  return (
    <VStack
      spacing={0}
      align={'flex-start'}
    >
      <HStack
        spacing={4}
      >
        <IconButton
          aria-label="Play pause"
          icon={isPlaying ? <BiSkipNext color="#FF00EE" size={'24px'} /> : <BiSkipNext color="#fff" opacity={0.5} size={'24px'} /> }
          onClick={() => {
            playNextSong();
          }}
          disabled={!isPlaying}
          backgroundColor="transparent"
          _hover={{ backgroundColor: 'gray.800' }}
          _active={{ backgroundColor: 'gray.900' }}
        />
        <HStack
          spacing={1}
        >
        <Text
          color="#fff"
          fontSize={'12px'}
          opacity={isPlaying ? 1 : 0.5}
        >
          {isPlaying ? `${songNames[currentSongIndex]} by` : 'not playing'}
        </Text>
        {isPlaying && (
          <Text
            onClick={() => {openInNewTab('https://twitter.com/jonhugo')}}
            color="#FF00EE"
            fontWeight={'bold'}
            fontSize={'12px'}
            _hover={{
              cursor: 'pointer',
              opacity: 0.8,
            }}
          >
            @jonhugo
          </Text>
        )}
        </HStack>
      </HStack>
      <HStack
        spacing={4}
      >
        <IconButton
          aria-label="Play pause"
          icon={isPlaying ? <FaPause color="#FE0101" /> : <FaMusic color="#FF00EE" />}
          onClick={handlePlayPause}
          backgroundColor="transparent"
          _hover={{ backgroundColor: 'gray.800' }}
          _active={{ backgroundColor: 'gray.900' }}
        />
        <Slider
          aria-label="slider-ex-4"
          value={volume}
          min={0}
          max={1}
          step={0.01}
          onChange={handleVolumeChange}
          orientation="horizontal"
          width={'100px'}
          colorScheme="pink"
        >
          <SliderTrack bg="gray.300">
            <SliderFilledTrack bg="pink.500" />
          </SliderTrack>
          <SliderThumb boxSize={3} />
        </Slider>
      </HStack>
      {renderSongsList()}
    </VStack>
  );
};

export default MusicPlayer;
