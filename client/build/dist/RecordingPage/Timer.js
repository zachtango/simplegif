import React, {useState, useEffect} from "../../_snowpack/pkg/react.js";
function Timer({mediaRecorder}) {
  const [time, setTime] = useState(0);
  useEffect(() => {
    let animationFrameId = null;
    let startTime = null;
    const animate = (timestamp) => {
      if (!startTime) {
        startTime = timestamp;
      }
      const elapsedTime = timestamp - startTime;
      setTime(elapsedTime);
      animationFrameId = window.requestAnimationFrame(animate);
    };
    animationFrameId = window.requestAnimationFrame(animate);
    return () => {
      window.cancelAnimationFrame(animationFrameId);
    };
  }, []);
  const formatTime = () => {
    const minutes = Math.floor(time / 6e4);
    const seconds = Math.floor(time % 6e4 / 1e3);
    const milliseconds = Math.floor(time % 1e3 / 10);
    return `${padWithZero(minutes)}:${padWithZero(seconds)}.${padWithZero(milliseconds)}`;
  };
  const padWithZero = (value) => {
    return value.toString().padStart(2, "0");
  };
  return /* @__PURE__ */ React.createElement("div", {
    class: "w-[75px]"
  }, formatTime());
}
export default Timer;
