import React, { useEffect, useRef, useState } from 'react';

import { VIDEO_EDITING_CONTAINER_WIDTH } from '../utils/constants';
import { createFFmpeg } from '@ffmpeg/ffmpeg';
import Dock from './Dock';
import { loadVideoDuration } from '../utils/utils';

const ffmpeg = createFFmpeg({
  log: true,
});

function VideoEditingPage({ videoBlob, onStopEditing }) {
  const videoBlobUrl = URL.createObjectURL(videoBlob);

  const videoRef = useRef(null);

  const [isLoaded, setIsLoaded] = useState(false);
  const [videoDuration, setVideoDuration] = useState(0);

  useEffect(() => {
    (async () => {
      const video = videoRef.current;

      // Load everything
      if (!ffmpeg.isLoaded()) await ffmpeg.load();

      await loadVideoDuration(video);

      setVideoDuration(video.duration);
      setIsLoaded(true);
    })();
  }, []);

  return (
    <div class='w-full h-full flex justify-center'>
      <div
        class={`my-[50px] w-[${VIDEO_EDITING_CONTAINER_WIDTH}px] h-[700px] min-w-[${VIDEO_EDITING_CONTAINER_WIDTH}px] min-h-[700px] flex flex-col items-center justify-evenly`}
      >
        <div
          class='w-full h-4/5 flex justify-center'
          style={{
            display: isLoaded ? 'flex' : 'none',
          }}
        >
          <video
            ref={videoRef}
            controls
            class='max-h-full'
            src={videoBlobUrl}
          />
        </div>

        {isLoaded && videoDuration && (
          <Dock
            ffmpeg={ffmpeg}
            videoBlob={videoBlob}
            videoDuration={videoDuration}
            videoRef={videoRef}
            onStopEditing={onStopEditing}
          />
        )}

        {!isLoaded && <div>Loading Video Editor...</div>}
      </div>
    </div>
  );
}

export default VideoEditingPage;
