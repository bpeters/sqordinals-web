import { useState } from "react"
import LazyLoad, { forceCheck } from 'react-lazyload';
import _ from 'lodash';
import Fuse from 'fuse.js'
import {
  Input,
  VStack,
  Grid,
  HStack,
  Button,
} from "@chakra-ui/react"

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

const shuffled = _.shuffle(seeds.map((s, i) => {
  return {
    ...s,
    index: i.toString(),
  }
}));

export const Home = () => {
  const size = 360;
  const [value, setValue]: any = useState('');
  const [searchTerm, setSearchTerm]: any = useState('');

  const handleInputChange = (event: any) => {
    setValue(event.target.value);
  }

  const handleKeyDown = (event: any) => {
    if (event.key === 'Enter') {
      setSearchTerm(value)
      forceCheck();
    }
  }

  const options = {
    keys: ['index']
  };

  const fuse = new Fuse(shuffled, options)

  const result = fuse.search(searchTerm);
  const searchList = searchTerm ? result.map((r) => r.item) : shuffled;

  return (
    <VStack
      justify={'center'}
      align={'center'}
    >
      <HStack
        zIndex={100000}
        position={'fixed'}
        top={'80px'}
        left={0}
        paddingLeft={'28px'}
        justify={'flex-start'}
        align={'flex-start'}
        spacing={1}
        width={'100vw'}
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
            setSearchTerm(value);
            forceCheck();
          }}
        >
          Find
        </Button>
        <Input 
          value={value}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          color="white"
          type="number"
          borderColor="transparent"
          borderWidth={1}
          borderRadius={0}
          placeholder="Sqordinal #"
          _focus={{
            borderColor: 'transparent',
            borderBottomColor: "white",
            boxShadow: "none",
          }}
          _hover={{
            borderBottomColor: "pink",
            boxShadow: "none",
          }}
          fontSize={'10px'}
          width={'80px'}
          padding={'4px'}
        />
      </HStack>
      <Grid
        paddingTop={'100px'}
        templateColumns={`repeat(auto-fill, ${size}px)`}
        gap={8}
        justifyItems="center"
        alignItems="start"
        maxWidth={'100vw'}
      >
        {searchList.map((seed: any, i) => {
          return (
            <LazyLoad
              key={`${seed.name}-${i}`}
              height={size * 0.75}
              offset={100}
              once
            >
              <GodSeed
                seed={seed}
                size={size}
              />
            </LazyLoad>
          )
        })}
      </Grid>
    </VStack>
  )
};
