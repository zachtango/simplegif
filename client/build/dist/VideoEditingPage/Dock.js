import React, {useState} from "../../_snowpack/pkg/react.js";
import VideoTimeline from "./VideoTimeline.js";
import {MILLISECONDS_PER_SECOND, TRIM_SELECTOR_WIDTH_PX, VIDEO_EDITING_TIMELINE_WIDTH} from "../utils/constants.js";
import {millisecondsToFfmpegString} from "../utils/utils.js";
function Dock({ffmpeg, videoDuration, videoBlob, videoRef, onStopEditing}) {
  const [left, setLeft] = useState(0);
  const [right, setRight] = useState(0);
  const [downloading, setDownloading] = useState(false);
  async function onSaveGif() {
    setDownloading(true);
    const webmBuffer = await videoBlob.arrayBuffer();
    const VIDEO_DURATION_MILLISECONDS = videoDuration * MILLISECONDS_PER_SECOND;
    const MILLISECONDS_PER_PIXEL = VIDEO_DURATION_MILLISECONDS / VIDEO_EDITING_TIMELINE_WIDTH;
    const start = left * MILLISECONDS_PER_PIXEL;
    const end = (VIDEO_EDITING_TIMELINE_WIDTH - right - TRIM_SELECTOR_WIDTH_PX) * MILLISECONDS_PER_PIXEL;
    ffmpeg.FS("writeFile", "recording.webm", new Uint8Array(webmBuffer));
    await ffmpeg.run("-i", "recording.webm", "-ss", millisecondsToFfmpegString(start), "-to", millisecondsToFfmpegString(end), "recording.gif");
    const gifBuffer = ffmpeg.FS("readFile", "recording.gif");
    var gifBlob = new Blob([gifBuffer], {type: "image/gif"});
    var gifUrl = URL.createObjectURL(gifBlob);
    var link = document.createElement("a");
    link.href = gifUrl;
    link.download = "test.gif";
    link.click();
    setDownloading(false);
  }
  return /* @__PURE__ */ React.createElement("div", {
    class: "flex flex-col justify-evenly h-[140px]"
  }, !downloading ? /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(VideoTimeline, {
    videoDuration,
    videoRef,
    left,
    right,
    onMoveLeft: (l) => setLeft(l),
    onMoveRight: (r) => setRight(r)
  }), /* @__PURE__ */ React.createElement("div", {
    class: "flex justify-evenly"
  }, /* @__PURE__ */ React.createElement("button", {
    class: "rounded-md bg-green-600 p-2 text-white",
    onClick: onSaveGif
  }, "Save GIF"), /* @__PURE__ */ React.createElement("button", {
    class: "rounded-md bg-green-600 p-2 text-white",
    onClick: onStopEditing
  }, "Done"))) : /* @__PURE__ */ React.createElement("p", null, "Downloading..."));
}
export default Dock;
