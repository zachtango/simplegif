import React, { useState, useEffect } from 'react';

// Tracks time elapsed while screen recording
function Timer({ mediaRecorder }) {
  const [time, setTime] = useState(0);

  useEffect(() => {
    let interval = null;

    // Start the timer
    interval = setInterval(() => {
      setTime(prevTime => prevTime + 10); // Increase time by 10 milliseconds
    }, 10);

    // Media recorder guaranteed to be defined
    mediaRecorder.addEventListener('stop', () => {
        clearInterval(interval)
    })
  }, []);

  const formatTime = () => {
    const minutes = Math.floor(time / 60000);
    const seconds = Math.floor((time % 60000) / 1000);
    const milliseconds = Math.floor((time % 1000) / 10);

    return `${padWithZero(minutes)}:${padWithZero(seconds)}.${padWithZero(milliseconds)}`;
  };

  const padWithZero = (value) => {
    return value.toString().padStart(2, '0');
  };

  return (
    <div class='w-[75px]'>
        {formatTime()}
    </div>
  );
}

export default Timer;
