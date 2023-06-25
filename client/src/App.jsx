import React, { useState } from 'react';
import { detect } from 'detect-browser';

import LandingPage from './LandingPage/LandingPage';
import RecordingPage from './RecordingPage/RecordingPage';

import { PAGE_STATE } from './utils/constants';
import VideoEditingPage from './VideoEditingPage/VideoEditingPage';

const browser = detect();

function App() {
  // Video mime type to use, default to vp8 (supported by Firefox)
  let videoMimeType = 'video/webm; codecs=vp8';

  switch (browser && browser.name) {
    case 'chrome':
      videoMimeType = 'video/webm; codecs=vp9';
      break;
    case 'safari':
      videoMimeType = 'video/mp4; codecs="avc1.42E01E"';
      break;
  }

  const [pageState, setPageState] = useState(PAGE_STATE.LANDING);
  const [videoBlob, setVideoBlob] = useState();

  let page;

  switch (pageState) {
    case PAGE_STATE.LANDING:
      page = (
        <LandingPage
          onStartRecording={() => setPageState(PAGE_STATE.RECORDING)}
        />
      );
      break;
    case PAGE_STATE.RECORDING:
      page = (
        <RecordingPage
          videoMimeType={videoMimeType}
          onStopRecording={(blob) => {
            setPageState(PAGE_STATE.EDITING);
            setVideoBlob(blob);
          }}
        />
      );
      break;
    case PAGE_STATE.EDITING:
      if (videoBlob)
        page = (
          <VideoEditingPage
            videoBlob={videoBlob}
            onStopEditing={() => setPageState(PAGE_STATE.LANDING)}
          />
        );
      break;
    default:
      throw `Unknown page state ${pageState}`;
  }

  return (
    <div className='App' class='w-full h-full'>
      {page}
    </div>
  );
}

export default App;
