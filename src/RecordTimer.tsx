import { Text } from '@chakra-ui/react';
import { useState, useEffect, useRef } from 'react';

const RecordTimer = () => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const timerId = setInterval(() => {
      setCount(count => count + 1);
    }, 1000);

    return () => clearInterval(timerId);
  }, [count]);

  return (
    <Text
      fontSize={'12px'}
      fontWeight={'bold'}
      paddingTop={'10px'}
    >
      {count}
    </Text>
  );
};

export default RecordTimer;
