import React, {useState} from "../../_snowpack/pkg/react.js";
import VideoTimeline from "./VideoTimeline.js";
import {MILLISECONDS_PER_SECOND, TRIM_SELECTOR_WIDTH_PX, VIDEO_EDITING_TIMELINE_WIDTH} from "../utils/constants.js";
import {millisecondsToFfmpegString} from "../utils/utils.js";
function Dock({ffmpeg, videoDuration, videoBlob, videoRef, onStopEditing}) {
  const [left, setLeft] = useState(0);
  const [right, setRight] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [downloading, setDownloading] = useState(false);
  async function onSaveGif() {
    setDownloading(true);
    const videoBuffer = await videoBlob.arrayBuffer();
    const VIDEO_DURATION_MILLISECONDS = videoDuration * MILLISECONDS_PER_SECOND;
    const MILLISECONDS_PER_PIXEL = VIDEO_DURATION_MILLISECONDS / VIDEO_EDITING_TIMELINE_WIDTH;
    const start = left * MILLISECONDS_PER_PIXEL;
    const end = (VIDEO_EDITING_TIMELINE_WIDTH - right - TRIM_SELECTOR_WIDTH_PX) * MILLISECONDS_PER_PIXEL;
    ffmpeg.FS("writeFile", "recording", new Uint8Array(videoBuffer));
    await ffmpeg.run("-i", "recording", "-ss", millisecondsToFfmpegString(start), "-to", millisecondsToFfmpegString(end), "recording.gif");
    const gifBuffer = ffmpeg.FS("readFile", "recording.gif");
    const gifBlob = new Blob([gifBuffer], {type: "image/gif"});
    const gifUrl = URL.createObjectURL(gifBlob);
    const link = document.createElement("a");
    link.href = gifUrl;
    link.download = "screen_recording.gif";
    link.click();
    setDownloading(false);
  }
  return /* @__PURE__ */ React.createElement("div", {
    class: "flex flex-col justify-center h-[140px]"
  }, /* @__PURE__ */ React.createElement("div", {
    class: "flex flex-col justify-evenly h-full",
    style: {
      display: isLoaded && !downloading ? "flex" : "none"
    }
  }, /* @__PURE__ */ React.createElement(VideoTimeline, {
    videoDuration,
    videoRef,
    left,
    right,
    onMoveLeft: (l) => setLeft(l),
    onMoveRight: (r) => setRight(r),
    onLoad: () => setIsLoaded(true)
  }), /* @__PURE__ */ React.createElement("div", {
    class: "flex justify-evenly"
  }, /* @__PURE__ */ React.createElement("button", {
    class: "rounded-md bg-green-600 p-2 text-white",
    onClick: onSaveGif
  }, "Save GIF"), /* @__PURE__ */ React.createElement("button", {
    class: "rounded-md bg-green-600 p-2 text-white",
    onClick: onStopEditing
  }, "Done"))), downloading && /* @__PURE__ */ React.createElement("p", null, "Downloading..."), !isLoaded && /* @__PURE__ */ React.createElement("p", null, "Loading Dock..."));
}
export default Dock;
