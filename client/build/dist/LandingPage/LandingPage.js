import React from "../../_snowpack/pkg/react.js";
import {BsWindow} from "../../_snowpack/pkg/react-icons/bs.js";
function LandingPage({onStartRecording}) {
  const isMobile = /Mobi|Android/i.test(navigator.userAgent);
  return /* @__PURE__ */ React.createElement("div", {
    class: "w-full h-full flex justify-center"
  }, /* @__PURE__ */ React.createElement("div", {
    class: "flex flex-col my-[100px] h-[500px] items-center justify-evenly"
  }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h2", {
    class: "m-auto text-3xl font-bold mb-4 text-5xl"
  }, "Simple GIF screen recorder"), /* @__PURE__ */ React.createElement("p", {
    class: "text-base font-normal text-neutral-600 text-lg text-center"
  }, "Made by a ", /* @__PURE__ */ React.createElement("span", {
    class: "font-bold"
  }, "developer"), " for ", /* @__PURE__ */ React.createElement("span", {
    class: "font-bold"
  }, "developers"), ".")), !isMobile ? /* @__PURE__ */ React.createElement("div", {
    class: "w-[700px] flex flex-row justify-evenly items-center"
  }, /* @__PURE__ */ React.createElement("div", {
    class: "w-[250px] h-[200px] p-[10px] flex flex-col justify-center items-center border-2 rounded-xl bg-blue-100"
  }, /* @__PURE__ */ React.createElement(BsWindow, {
    class: "h-4/5 w-full"
  }), /* @__PURE__ */ React.createElement("p", null, "Screen")), /* @__PURE__ */ React.createElement("button", {
    class: "mt-4 flex h-[72px] w-60 items-center justify-around rounded-xl bg-red-500 text-white hover:bg-red-600 active:bg-red-700",
    onClick: onStartRecording
  }, /* @__PURE__ */ React.createElement("div", {
    class: "ml-2 tracking-wider"
  }, "Start Recording"), /* @__PURE__ */ React.createElement("div", {
    class: "flex h-12 w-12 content-center items-center rounded-full bg-white shadow-md"
  }, /* @__PURE__ */ React.createElement("div", {
    class: "mx-auto h-4 w-4 rounded-full bg-red-600 p-0"
  })))) : /* @__PURE__ */ React.createElement("p", null, "Sorry, this is not available on mobile devices"), /* @__PURE__ */ React.createElement("p", null, "No signups, no watermarks, no BS")));
}
export default LandingPage;
