import React, { useState, useEffect } from 'react';

// Tracks time elapsed while screen recording
function Timer({ mediaRecorder }) {
  const [time, setTime] = useState(0);

  useEffect(() => {
    let animationFrameId = null;
    let startTime = null;

    const animate = (timestamp) => {
      if (!startTime) {
        startTime = timestamp;
      }

      const elapsedTime = timestamp - startTime;
      setTime(elapsedTime);

      animationFrameId = window.requestAnimationFrame(animate);
    };

    animationFrameId = window.requestAnimationFrame(animate);

    // Clean up the animation frame when the component unmounts
    return () => {
      window.cancelAnimationFrame(animationFrameId);
    };
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
