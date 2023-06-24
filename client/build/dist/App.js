import React, {useState} from "../_snowpack/pkg/react.js";
import {detect} from "../_snowpack/pkg/detect-browser.js";
import LandingPage from "./LandingPage/LandingPage.js";
import RecordingPage from "./RecordingPage/RecordingPage.js";
import {PAGE_STATE} from "./utils/constants.js";
import VideoEditingPage from "./VideoEditingPage/VideoEditingPage.js";
const browser = detect();
function App() {
  let videoMimeType = "video/webm; codecs=vp8";
  switch (browser && browser.name) {
    case "chrome":
      videoMimeType = "video/webm; codecs=vp9";
      break;
    case "safari":
      videoMimeType = 'video/mp4; codecs="avc1.42E01E"';
      break;
  }
  const [pageState, setPageState] = useState(PAGE_STATE.LANDING);
  const [videoBlob, setVideoBlob] = useState();
  let page;
  switch (pageState) {
    case PAGE_STATE.LANDING:
      page = /* @__PURE__ */ React.createElement(LandingPage, {
        onStartRecording: () => setPageState(PAGE_STATE.RECORDING)
      });
      break;
    case PAGE_STATE.RECORDING:
      page = /* @__PURE__ */ React.createElement(RecordingPage, {
        videoMimeType,
        onStopRecording: (blob) => {
          setPageState(PAGE_STATE.EDITING);
          setVideoBlob(blob);
        }
      });
      break;
    case PAGE_STATE.EDITING:
      if (videoBlob)
        page = /* @__PURE__ */ React.createElement(VideoEditingPage, {
          videoBlob,
          onStopEditing: () => setPageState(PAGE_STATE.LANDING)
        });
      break;
    default:
      throw `Unknown page state ${pageState}`;
  }
  return /* @__PURE__ */ React.createElement("div", {
    className: "App",
    class: "w-full h-full"
  }, page);
}
export default App;
