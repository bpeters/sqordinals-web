import { Text, Input, HStack } from '@chakra-ui/react';
import { useState, useEffect, useRef } from 'react';

const SqordSet = () => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const timerId = setInterval(() => {
      setCount(window.set);
    }, 100);

    return () => clearInterval(timerId);
  }, []);

  return (
    <Text fontSize={'8px'}>
      [{count}]
    </Text>
  );
};

export default SqordSet;
