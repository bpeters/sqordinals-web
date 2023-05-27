import { Box, Button, Flex, IconButton } from '@chakra-ui/react';
import { useState, useEffect, useRef } from 'react';
import { FaPlay, FaPause } from 'react-icons/fa'

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

  return (
    <IconButton
      aria-label="Play pause"
      icon={isPlaying ? <FaPause color="#FE0101" /> : <FaPlay color="#16FE07" />}
      onClick={handlePlayPause}
      backgroundColor="black"
      _hover={{ backgroundColor: 'gray.800' }}
      _active={{ backgroundColor: 'gray.900' }}
    />
  );
};

export default MusicPlayer;
