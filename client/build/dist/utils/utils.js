import {
  MILLISECONDS_PER_SECOND,
  MILLISECONDS_PER_MINUTE,
  MILLISECONDS_PER_HOUR,
} from './constants.js';

// Converts milliseconds (integer) to FFMPEG string format hh:mm:ss.(ms fraction)
export function millisecondsToFfmpegString(milliseconds) {
  const hours = Math.floor(milliseconds / MILLISECONDS_PER_HOUR);
  milliseconds %= MILLISECONDS_PER_HOUR;

  const minutes = Math.floor(milliseconds / MILLISECONDS_PER_MINUTE);
  milliseconds %= MILLISECONDS_PER_MINUTE;

  const seconds = Math.floor(milliseconds / MILLISECONDS_PER_SECOND);
  milliseconds %= MILLISECONDS_PER_SECOND;

  function toZeroFilled(integer) {
    if (integer < 10) {
      return `0${integer}`;
    }
    return `${integer}`;
  }

  // Convert to decimal of seconds
  milliseconds = milliseconds / MILLISECONDS_PER_SECOND;

  // Round to 3 decimals
  milliseconds = Math.round(milliseconds * 1000) / 1000;

  milliseconds = `${milliseconds}`.substring(1);

  return `${toZeroFilled(hours)}:${toZeroFilled(minutes)}:${toZeroFilled(
    seconds
  )}${milliseconds}`;
}

// Fix video duration infinity / NaN bug
// https://stackoverflow.com/questions/21522036/html-audio-tag-duration-always-infinity
export async function loadVideoDuration(video) {
  const getDuration = () => {
    video.addEventListener(
      'durationchange',
      function (e) {
        if (video.duration === Infinity || isNaN(video.duration)) {
          video.currentTime = Number.MAX_SAFE_INTEGER;
          setTimeout(() => {
            video.currentTime = 0;
          }, 1000);
        }
      },
      false
    );
    video.load();
    video.currentTime = Number.MAX_SAFE_INTEGER;
    video.play();
  };

  getDuration();

  const waitValidVideoDuration = new Promise((resolve) => {
    const checkDuration = () => {
      if (video.duration !== Infinity && !isNaN(video.duration)) {
        resolve();
      } else {
        setTimeout(checkDuration, 100); // Retry after 100 ms
      }
    };
    checkDuration();
  });

  await waitValidVideoDuration;
}
