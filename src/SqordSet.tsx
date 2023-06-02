import { Text } from '@chakra-ui/react';
import { useState, useEffect, useRef } from 'react';

const SqordSet = () => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const timerId = setInterval(() => {
      setCount(window.set);
    }, 300);

    return () => clearInterval(timerId);
  }, []);

  return (
    <Text
      fontSize={'12px'}
      fontWeight={'bold'}
      paddingTop={'4px'}
      paddingBottom={'4px'}
    >
      {count}
    </Text>
  );
};

export default SqordSet;
