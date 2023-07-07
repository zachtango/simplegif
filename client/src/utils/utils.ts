// import {
//     MILLISECONDS_PER_SECOND,
//     MILLISECONDS_PER_MINUTE,
//     MILLISECONDS_PER_HOUR,
//   } from './constants';

import { FFmpeg } from '@ffmpeg/ffmpeg';
import {
  MILLISECONDS_PER_HOUR,
  MILLISECONDS_PER_MINUTE,
  MILLISECONDS_PER_SECOND,
  RESOLUTION_TO_FFMPEG_ARG,
  TIMELINE_WIDTH,
  TRIM_SELECTOR_WIDTH_PX,
} from './constants';

// Fix video duration infinity / NaN bug
// https://stackoverflow.com/questions/21522036/html-audio-tag-duration-always-infinity
export async function loadVideoDuration(video: HTMLVideoElement) {
  const durationChangeHandler = () => {
    if (video.duration === Infinity || isNaN(video.duration)) {
      video.currentTime = Number.MAX_SAFE_INTEGER;
      setTimeout(() => {
        video.currentTime = 0;
      }, 1000);
    }
  };
  video.addEventListener('durationchange', durationChangeHandler);

  video.currentTime = Number.MAX_SAFE_INTEGER;

  const waitValidVideoDuration = new Promise((resolve) => {
    const checkDuration = () => {
      if (video.duration !== Infinity && !isNaN(video.duration)) {
        resolve(null);
      } else {
        setTimeout(checkDuration, 100); // Retry after 100 ms
      }
    };
    checkDuration();
  });

  await waitValidVideoDuration;

  video.removeEventListener('durationchange', durationChangeHandler);
}

/*
    Given 2 diagnols of a rectangle

    Return the x and y of the top left corner
        and the width and height of the rectangle
*/
export const getBox = (diag1: number[], diag2: number[]) => {
  const [x1, y1] = diag1;
  const [x2, y2] = diag2;

  if (x1 < x2 && y1 < y2) {
    /*
            (x1, y1)
                    (x2, y2)
        */
    return [x1, y1, x2 - x1, y2 - y1];
  } else if (x1 < x2 && y1 > y2) {
    /*
                    (x2, y2)
            (x1, y1)
        */
    return [x1, y2, x2 - x1, y1 - y2];
  } else if (x1 > x2 && y1 < y2) {
    /*
                    (x1, y1)
            (x2, y2)
        */
    return [x2, y1, x1 - x2, y2 - y1];
  } else if (x1 > x2 && y1 > y2) {
    /*
            (x2, y2)
                    (x1, y1)
        */
    return [x2, y2, x1 - x2, y1 - y2];
  } else {
    throw 'Invalid box';
  }
};

/*
    Given two numbers that are floats
        return true or false whether they're within a certain epsilon of each other
*/
export function areFloatsEqual(a: number, b: number, epsilon: number) {
  return Math.abs(a - b) < epsilon;
}

/*
    Given a ffmpeg, videoBlob, left trim selector margin left (pixels), right trim selector margin right (pixels), and crop box dimensions
        1. apply edits to the video
        2. save video to gif
*/
export async function saveGif(
  ffmpeg: FFmpeg,
  videoBlob: Blob,
  videoDuration: number,
  left: number,
  right: number,
  crop: number[],
  resolution: Resolution,
) {
  const VIDEO_DURATION_MILLISECONDS = videoDuration * MILLISECONDS_PER_SECOND;
  const MILLISECONDS_PER_PIXEL = VIDEO_DURATION_MILLISECONDS / TIMELINE_WIDTH;

  const start = left * MILLISECONDS_PER_PIXEL;
  const end =
    (TIMELINE_WIDTH - right - TRIM_SELECTOR_WIDTH_PX) * MILLISECONDS_PER_PIXEL;

  const [x, y, w, h] = crop;

  const videoBuffer = await videoBlob.arrayBuffer();

  // Write video to ffmpeg memory
  ffmpeg.FS('writeFile', 'recording', new Uint8Array(videoBuffer));

  // Apply video edits
  await ffmpeg.run(
    '-i',
    'recording',
    '-ss',
    millisecondsToFfmpegString(start),
    '-to',
    millisecondsToFfmpegString(end),
    '-vf',
    `crop=${w}:${h}:${x}:${y}`,
    'recording.gif',
  );

  // Read gif from ffmpeg memory
  const gifBuffer = ffmpeg.FS('readFile', 'recording.gif');

  // Download gif
  const gifBlob = new Blob([gifBuffer], { type: 'image/gif' });
  const gifUrl = URL.createObjectURL(gifBlob);

  const link = document.createElement('a');
  link.href = gifUrl;
  link.download = `screen_recording${resolution}.gif`;
  link.click();

  return gifBlob
}

// Converts milliseconds (integer) to FFMPEG string format hh:mm:ss.(ms fraction)
// https://trac.ffmpeg.org/wiki/Seeking#Cuttingsmallsections
function millisecondsToFfmpegString(milliseconds: number) {
  const hours = Math.floor(milliseconds / MILLISECONDS_PER_HOUR);
  milliseconds %= MILLISECONDS_PER_HOUR;

  const minutes = Math.floor(milliseconds / MILLISECONDS_PER_MINUTE);
  milliseconds %= MILLISECONDS_PER_MINUTE;

  const seconds = Math.floor(milliseconds / MILLISECONDS_PER_SECOND);
  milliseconds %= MILLISECONDS_PER_SECOND;

  function toZeroFilled(integer: number) {
    if (integer < 10) {
      return `0${integer}`;
    }
    return `${integer}`;
  }

  // Convert to decimal of seconds
  milliseconds = milliseconds / MILLISECONDS_PER_SECOND;

  const millisecondsString = `${milliseconds}`.substring(1);

  return `${toZeroFilled(hours)}:${toZeroFilled(minutes)}:${toZeroFilled(
    seconds,
  )}${millisecondsString}`;
}


/*
    Given GIF Blob
        Copy to clipboard
*/
export async function gifToClipboard(gifBlob: Blob) {
//   // New clipboard item
//   const clipboardItem = new ClipboardItem({ 'image/gif': gifBlob })

  // Convert the GIF blob to a Data URL
  const reader = new FileReader();
  reader.onloadend = function () {
    const dataUrl = reader.result as string;

    // Copy the Data URL to the clipboard
    navigator.clipboard.writeText(dataUrl)
    .then(() => {
        console.log('GIF copied to clipboard!');
    })
    .catch((error) => {
        console.error('Failed to copy GIF:', error);
    });
  };
  reader.readAsDataURL(gifBlob);
}