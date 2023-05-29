import { Slider, SliderTrack, SliderFilledTrack, SliderThumb, IconButton, VStack } from '@chakra-ui/react';
import { useState, useEffect, useRef } from 'react';
import { FaPlay, FaPause, FaMusic } from 'react-icons/fa'

const songs = [
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

const MusicPlayer = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSongIndex, setCurrentSongIndex] = useState(Math.floor(Math.random() * songs.length));
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
    let nextSongIndex;
    do {
      nextSongIndex = Math.floor(Math.random() * songs.length);
    } while (nextSongIndex === currentSongIndex);
    setCurrentSongIndex(nextSongIndex);
  };

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleVolumeChange = (value: any) => {
    setVolume(value);
  };

  return (
    <VStack
      spacing={4}
    >
      <IconButton
        aria-label="Play pause"
        icon={isPlaying ? <FaPause color="#FE0101" /> : <FaMusic color="#16FE07" />}
        onClick={handlePlayPause}
        backgroundColor="black"
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
        orientation="vertical"
        height={'100px'}
        colorScheme="pink"
      >
        <SliderTrack bg="gray.300">
          <SliderFilledTrack bg="pink.500" />
        </SliderTrack>
        <SliderThumb boxSize={3} />
      </Slider>
    </VStack>
  );
};

export default MusicPlayer;
