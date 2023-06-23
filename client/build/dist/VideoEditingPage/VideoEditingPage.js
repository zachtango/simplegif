import React, {useEffect, useRef, useState} from "../../_snowpack/pkg/react.js";
import {VIDEO_EDITING_CONTAINER_WIDTH} from "../utils/constants.js";
import {createFFmpeg} from "../../_snowpack/pkg/@ffmpeg/ffmpeg.js";
import Dock from "./Dock.js";
const ffmpeg = createFFmpeg({
  log: true
});
function VideoEditingPage({videoBlob, onStopEditing}) {
  const videoBlobUrl = URL.createObjectURL(videoBlob);
  const videoRef = useRef(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [videoDuration, setVideoDuration] = useState(0);
  useEffect(() => {
    (async () => {
      const video = videoRef.current;
      const onDurationChange = function() {
        if (video.duration === Infinity) {
          video.currentTime = Number.MAX_SAFE_INTEGER;
          setTimeout(() => {
            video.currentTime = 0;
          }, 1e3);
          return;
        }
      };
      const loadValidVideoDuration = new Promise((resolve) => {
        const checkDuration = () => {
          if (video.duration !== Infinity && !isNaN(video.duration)) {
            resolve();
          } else
            setTimeout(checkDuration, 100);
        };
        checkDuration();
      });
      video.addEventListener("durationchange", onDurationChange);
      if (!ffmpeg.isLoaded())
        await ffmpeg.load();
      await loadValidVideoDuration;
      setVideoDuration(video.duration);
      setIsLoaded(true);
      video.removeEventListener("durationchange", onDurationChange);
    })();
  }, []);
  return /* @__PURE__ */ React.createElement("div", {
    class: "w-full h-full flex justify-center"
  }, /* @__PURE__ */ React.createElement("div", {
    class: `my-[50px] w-[${VIDEO_EDITING_CONTAINER_WIDTH}px] h-[700px] min-w-[${VIDEO_EDITING_CONTAINER_WIDTH}px] min-h-[700px] flex flex-col items-center justify-evenly`
  }, /* @__PURE__ */ React.createElement("div", {
    class: "h-4/5"
  }, /* @__PURE__ */ React.createElement("video", {
    ref: videoRef,
    controls: true,
    class: "max-h-full",
    src: videoBlobUrl,
    style: {
      display: isLoaded ? "block" : "none"
    }
  })), isLoaded && videoDuration && /* @__PURE__ */ React.createElement(Dock, {
    ffmpeg,
    videoBlob,
    videoDuration,
    videoRef,
    onStopEditing
  })));
}
export default VideoEditingPage;
