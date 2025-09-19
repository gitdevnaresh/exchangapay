import React, { useState, useEffect } from 'react';
import { Text } from 'react-native';

const Timer = (props:any) => {
  const [seconds, setSeconds] = useState<number>(props.seconds ||120);

  useEffect(() => {
    const timer = setInterval(() => {
      setSeconds((prevSeconds) => prevSeconds>0? prevSeconds- 1:0);
      if(seconds===0){
        clearInterval(timer);
      }
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, []);

  useEffect(() => {
    if (seconds === 0 && props.timeEnd) {
        props.timeEnd();
    }
  }, [seconds]);

  const formatTime = (time: number): string => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;

    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(seconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
  };

  return <Text>{formatTime(seconds)}</Text>;
};

export default Timer;
