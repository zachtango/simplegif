import React, {useEffect, useRef, useState} from "../../_snowpack/pkg/react.js";
import {
  VIDEO_EDITING_TIMELINE_WIDTH,
  SIDE,
  VIDEO_EDITING_CONTAINER_WIDTH,
  TRIM_SELECTOR_WIDTH_PX,
  MILLISECONDS_PER_SECOND
} from "../utils/constants.js";
import {loadVideoDuration} from "../utils/utils.js";
const VideoTimeline = ({
  videoDuration,
  videoRef,
  left,
  right,
  onMoveLeft,
  onMoveRight,
  onLoad
}) => {
  const timelineRef = useRef(null);
  function onMouseMove(e, side) {
    const leftBound = timelineRef.current.offsetLeft;
    const rightBound = timelineRef.current.offsetLeft + timelineRef.current.clientWidth;
    if (side == SIDE.LEFT) {
      if (e.clientX >= rightBound - right - 4 * TRIM_SELECTOR_WIDTH_PX)
        return;
      const newLeft = Math.max(0, e.clientX - leftBound);
      onMoveLeft(newLeft);
      const VIDEO_DURATION_MILLISECONDS = videoDuration * MILLISECONDS_PER_SECOND;
      const PIXEL_WIDTH = timelineRef.current.clientWidth;
      const MILLISECONDS_PER_PIXEL = VIDEO_DURATION_MILLISECONDS / PIXEL_WIDTH;
      videoRef.current.currentTime = newLeft * MILLISECONDS_PER_PIXEL / MILLISECONDS_PER_SECOND;
    } else if (side == SIDE.RIGHT) {
      if (e.clientX <= leftBound + left + 3 * TRIM_SELECTOR_WIDTH_PX)
        return;
      const newRight = Math.max(0, rightBound - e.clientX - TRIM_SELECTOR_WIDTH_PX);
      onMoveRight(newRight);
    } else {
      throw `Invalid side value ${side}`;
    }
  }
  function onMouseDown(_, side) {
    document.onmousemove = (e) => onMouseMove(e, side);
    document.onmouseup = onMouseUp;
  }
  function onMouseUp() {
    document.onmousemove = null;
    document.onmousemove = null;
  }
  const numCanvases = Math.ceil(VIDEO_EDITING_TIMELINE_WIDTH / 100);
  const canvasRefs = Array.from({length: numCanvases}, () => useRef(null));
  useEffect(() => {
    (async () => {
      const video = videoRef.current;
      await loadVideoDuration(video);
      let time = 0;
      let counter = 0;
      function createImage() {
        if (counter >= numCanvases)
          return;
        const canvas = canvasRefs[counter].current;
        const context = canvas.getContext("2d");
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
      }
      function loadTime() {
        if (counter >= numCanvases) {
          video.removeEventListener("seeked", handleSeeked);
          video.currentTime = 0;
          onLoad();
          return;
        }
        video.currentTime = time;
        time += videoDuration / numCanvases;
        counter += 1;
      }
      function handleSeeked() {
        createImage();
        loadTime();
      }
      video.addEventListener("seeked", handleSeeked);
      video.currentTime = 0;
    })();
  }, []);
  return /* @__PURE__ */ React.createElement("div", {
    ref: timelineRef,
    class: `w-[${VIDEO_EDITING_TIMELINE_WIDTH}px] min-h-[60px] max-h-[60px] px-2 py-0.5 relative`
  }, /* @__PURE__ */ React.createElement("div", {
    class: "flex w-full h-full overflow-hidden"
  }, canvasRefs.map((ref, index) => /* @__PURE__ */ React.createElement("canvas", {
    class: "w-[100px] min-h-[60px] max-h-[60px]",
    key: index,
    ref
  }))), /* @__PURE__ */ React.createElement("div", {
    class: "absolute h-full rounded-md border-yellow-200 border-2",
    style: {
      top: 0,
      left,
      width: VIDEO_EDITING_TIMELINE_WIDTH - left - right
    }
  }, /* @__PURE__ */ React.createElement("div", {
    class: "w-full h-full bg-yellow-200 opacity-10"
  })), /* @__PURE__ */ React.createElement("div", {
    class: "rounded-l-md hover:cursor-grab absolute bg-yellow-200 h-full",
    onMouseDown: (e) => onMouseDown(e, SIDE.LEFT),
    style: {
      top: 0,
      left,
      width: TRIM_SELECTOR_WIDTH_PX
    },
    onDragStart: (e) => e.preventDefault()
  }), /* @__PURE__ */ React.createElement("div", {
    class: "rounded-r-md hover:cursor-grab absolute bg-yellow-200 h-full",
    onMouseDown: (e) => onMouseDown(e, SIDE.RIGHT),
    style: {
      top: 0,
      right,
      width: TRIM_SELECTOR_WIDTH_PX
    },
    onDragStart: (e) => e.preventDefault()
  }));
};
export default VideoTimeline;
