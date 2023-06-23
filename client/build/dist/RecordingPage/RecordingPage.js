import React, {useEffect, useRef, useState} from "../../_snowpack/pkg/react.js";
function RecordingPage({onStopRecording}) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [recorder, setRecorder] = useState();
  const videoRef = useRef(null);
  async function load() {
    const stream = await navigator.mediaDevices.getDisplayMedia({
      video: {
        displaySurface: "window"
      },
      audio: false
    });
    videoRef.current.srcObject = stream;
    const recorder2 = new MediaRecorder(stream, {mimeType: "video/webm; codecs=vp9"});
    const chunks = [];
    recorder2.ondataavailable = (e) => {
      chunks.push(e.data);
    };
    recorder2.onstop = (e) => {
      const blob = new Blob(chunks, {type: chunks[0].type});
      onStopRecording(blob);
      stream.getVideoTracks().forEach((track) => track.stop());
    };
    recorder2.start();
    setRecorder(recorder2);
    setIsLoaded(true);
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
    class: "max-h-full",
    autoPlay: true,
    ref: videoRef
  })), isLoaded && recorder && /* @__PURE__ */ React.createElement("div", {
    class: "my-[14px] flex"
  }, /* @__PURE__ */ React.createElement("button", {
    class: "mt-4 flex h-[52px] w-52 items-center justify-around rounded-xl bg-red-500 text-white hover:bg-red-600 active:bg-red-700",
    onClick: () => recorder.stop()
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
