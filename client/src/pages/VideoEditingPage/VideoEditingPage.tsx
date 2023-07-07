import React, { ChangeEvent, useEffect, useRef, useState } from 'react';

import { createFFmpeg } from '@ffmpeg/ffmpeg';
import videoPath from '../../video.mp4';
import Video from './Video';
import Timeline from './Timeline';
import { FiChevronDown } from 'react-icons/fi';
import { saveGif } from '../../utils/utils';

const ffmpeg = createFFmpeg({
  log: true,
});

// For loading and playing the video, video attributes get used by Video and Timeline components
// This will never be incorporated into the UI --> chose to not use useRef as it will only add complexity
const video = document.createElement('video');

/*
  Video
  Canvas
    - allows cropping
    - state x, y, w, h of crop box
  Timeline
    - allows trimming
    - state left and right margin or draggers
*/

function VideoEditingPage({
  videoBlob,
  onStopEditing,
}: {
  videoBlob: Blob;
  onStopEditing: () => void;
}) {
  const videoBlobUrl = URL.createObjectURL(videoBlob);

  // Canvas state
  const [crop, setCrop] = useState<number[] | null>(null);

  // Timline state
  const [left, setLeft] = useState(0);
  const [right, setRight] = useState(0);

  // Getting left and right updated in event handlers
  const trimsRef = React.useRef([left, right]);

  // Resolutions
  const [resolution, setResolution] = useState<Resolution>('720');
  const resolutions = ['360', '480', '720', '1080'];

  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    if (!ffmpeg.isLoaded()) ffmpeg.load();
  }, []);

  const saveGifHandler = async () => {
    if (!crop) return;

    setIsDownloading(true);

    await saveGif(
      ffmpeg,
      videoBlob,
      video.duration,
      left,
      right,
      crop,
      resolution,
    );

    setIsDownloading(false);
  };

  return (
    <div className="w-full h-full flex flex-col justify-center items-center">
      <Video
        video={video}
        trimsRef={trimsRef}
        videoPath={videoBlobUrl}
        crop={crop}
        setCrop={setCrop}
      />

      <div className="Dock mt-8">
        <Timeline
          videoPath={videoBlobUrl}
          left={left}
          right={right}
          setLeft={setLeft}
          setRight={setRight}
          setTrims={(trims: number[]) => (trimsRef.current = trims)}
        />

        <div className="flex justify-evenly mt-4">
          {isDownloading ? (
            <div>Downloading...</div>
          ) : (
            <>
              <div className="w-[200px] flex justify-evenly">
                <div className="relative inline-block">
                  <select
                    className="block appearance-none w-full py-2 pl-3 pr-8 border border-gray-300 bg-white focus:outline-none focus:ring-0 rounded-md shadow-sm"
                    onChange={(e) =>
                      setResolution(e.target.value as Resolution)
                    }
                    value={resolution}
                  >
                    {resolutions.map((resolution) => (
                      <option key={resolution} value={resolution}>
                        {resolution}p
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                    <FiChevronDown className="w-5 h-5 text-gray-400" />
                  </div>
                </div>

                <button
                  className="rounded-md bg-green-600 p-2 text-white"
                  onClick={saveGifHandler}
                >
                  Save GIF
                </button>
              </div>

              <button
                className="rounded-md bg-green-600 p-2 text-white"
                onClick={onStopEditing}
              >
                Done
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default VideoEditingPage;
