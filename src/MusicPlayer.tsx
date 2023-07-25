import { Slider, SliderTrack, SliderFilledTrack, SliderThumb, IconButton, VStack, HStack, Text, Box } from '@chakra-ui/react';
import { useState, useEffect, useRef } from 'react';
import { FaPause, FaMusic } from 'react-icons/fa'
import { BiSkipNext } from 'react-icons/bi';

const songs = [
  '/audio/13_explore.d.mp3',
  '/audio/12_flowers.d.mp3',
  '/audio/11_circus.d.mp3',
  '/audio/10_infinitum.d.mp3',
  '/audio/1_sigma.d.wav',
  '/audio/2_dev.d.wav',
  '/audio/3_blank.d.wav',
  '/audio/4_dox.d.wav',
  '/audio/5_alpha.d.wav',
  '/audio/6_naughty.d.wav',
  '/audio/7_simp.d.wav',
  '/audio/8_beta.d.wav',
  '/audio/9_burn.d.wav',
];

const songNames = [
  'explore.d',
  'flowers.d',
  'circus.d',
  'infinitum.d',
  'sigma.d',
  'dev.d',
  'blank.d',
  'dox.d',
  'alpha.d',
  'naughty.d',
  'simp.d',
  'beta.d',
  'burn.d',
];

const openInNewTab = (url: string) => {
  const newWindow = window.open(url, '_blank', 'noopener,noreferrer')
  if (newWindow) newWindow.opener = null
}

const MusicPlayer = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSongIndex, setCurrentSongIndex] = useState(0);
  const audioRef: any = useRef(null);
  const [volume, setVolume] = useState(1);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.removeEventListener('ended', playNextSong);
      audioRef.current.pause();
    }

    audioRef.current = new Audio(songs[currentSongIndex]);
    audioRef.current.addEventListener('ended', playNextSong);

    if (isPlaying) {
      audioRef.current.play();
      audioRef.current.volume = volume;
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
    setCurrentSongIndex((currentSongIndex + 1) % songs.length);
  };

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleVolumeChange = (value: any) => {
    setVolume(value);
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
    </VStack>
  );
};

export default MusicPlayer;
