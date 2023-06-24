import React, {useEffect, useRef, useState} from "../../_snowpack/pkg/react.js";
import {VIDEO_EDITING_CONTAINER_WIDTH} from "../utils/constants.js";
import {createFFmpeg} from "../../_snowpack/pkg/@ffmpeg/ffmpeg.js";
import Dock from "./Dock.js";
import {loadVideoDuration} from "../utils/utils.js";
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
      if (!ffmpeg.isLoaded())
        await ffmpeg.load();
      await loadVideoDuration(video);
      setVideoDuration(video.duration);
      setIsLoaded(true);
    })();
  }, []);
  return /* @__PURE__ */ React.createElement("div", {
    class: "w-full h-full flex justify-center"
  }, /* @__PURE__ */ React.createElement("div", {
    class: `my-[50px] w-[${VIDEO_EDITING_CONTAINER_WIDTH}px] h-[700px] min-w-[${VIDEO_EDITING_CONTAINER_WIDTH}px] min-h-[700px] flex flex-col items-center justify-evenly`
  }, /* @__PURE__ */ React.createElement("div", {
    class: "w-full h-4/5 flex justify-center",
    style: {
      display: isLoaded ? "flex" : "none"
    }
  }, /* @__PURE__ */ React.createElement("video", {
    ref: videoRef,
    controls: true,
    class: "max-h-full",
    src: videoBlobUrl
  })), isLoaded && videoDuration && /* @__PURE__ */ React.createElement(Dock, {
    ffmpeg,
    videoBlob,
    videoDuration,
    videoRef,
    onStopEditing
  }), !isLoaded && /* @__PURE__ */ React.createElement("div", null, "Loading Video Editor...")));
}
export default VideoEditingPage;
