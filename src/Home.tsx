import { useState, useEffect } from "react"
import { useNavigate, useLocation, createSearchParams } from 'react-router-dom';
import _ from 'lodash';
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

import { GodSeed } from "./GodSeed";
import { seeds } from "./seeds";

declare global {
  interface Window {
    newHash: string;
    seed: boolean;
    isPause: boolean;
    record: boolean;
  }
}

export const Home = () => {
  const size = 300;

  return (
    <VStack
      justify={'center'}
      align={'center'}
    >
      <Grid
        paddingTop={'90px'}
        templateColumns={`repeat(auto-fill, ${size}px)`}
        gap={4}
        justifyItems="center"
        alignItems="start"
        maxWidth={'100vw'}
        paddingLeft={'20px'}
        paddingRight={'20px'}
      >
        {_.shuffle(seeds).map((seed) => {
          return (
            <GodSeed
              key={seed.hash}
              seed={seed}
              size={size}
            />
          )
        })}
      </Grid>
    </VStack>
  )
};
