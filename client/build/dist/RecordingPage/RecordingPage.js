import React, {useEffect, useRef, useState} from "../../_snowpack/pkg/react.js";
import Timer from "./Timer.js";
function RecordingPage({videoMimeType, onStopRecording}) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState();
  const videoRef = useRef(null);
  async function load() {
    const stream = await navigator.mediaDevices.getDisplayMedia({
      video: {
        displaySurface: "window"
      },
      audio: false
    });
    videoRef.current.srcObject = stream;
    try {
      const recorder = new MediaRecorder(stream, {mimeType: videoMimeType});
      const chunks = [];
      recorder.ondataavailable = (e) => {
        chunks.push(e.data);
      };
      recorder.addEventListener("stop", () => {
        const blob = new Blob(chunks, {type: chunks[0].type});
        onStopRecording(blob);
        stream.getVideoTracks().forEach((track) => track.stop());
      });
      recorder.start();
      setMediaRecorder(recorder);
      setIsLoaded(true);
    } catch (e) {
      alert(`Error creating video recorder: ${e}`);
      stream.getVideoTracks().forEach((track) => track.stop());
    }
  }
  useEffect(() => {
    load();
  }, []);
  return /* @__PURE__ */ React.createElement("div", {
    class: "w-full h-full flex justify-center"
  }, /* @__PURE__ */ React.createElement("div", {
    class: "my-[50px] h-4/6 min-h-[500px] flex flex-col items-center justify-center"
  }, /* @__PURE__ */ React.createElement("div", {
    class: "h-4/5",
    style: {
      display: isLoaded ? "block" : "none"
    }
  }, /* @__PURE__ */ React.createElement("video", {
    class: "max-h-full min-h-full",
    autoPlay: true,
    ref: videoRef
  })), isLoaded && mediaRecorder && /* @__PURE__ */ React.createElement("div", {
    class: "my-[14px] flex flex-col items-center justify-evenly"
  }, /* @__PURE__ */ React.createElement(Timer, {
    mediaRecorder
  }), /* @__PURE__ */ React.createElement("button", {
    class: "mt-4 flex h-[52px] w-52 items-center justify-around rounded-xl bg-red-500 text-white hover:bg-red-600 active:bg-red-700",
    onClick: () => mediaRecorder.stop()
  }, /* @__PURE__ */ React.createElement("div", {
    class: "ml-2 tracking-wider"
  }, "Stop Recording"), /* @__PURE__ */ React.createElement("div", {
    class: "flex h-6 w-6 content-center items-center rounded-md bg-white shadow-md"
  }))), !isLoaded && /* @__PURE__ */ React.createElement("button", {
    class: "rounded-md bg-green-600 p-2 text-white",
    onClick: load
  }, "Please Grant Me Screen Recording Access")));
}
export default RecordingPage;
