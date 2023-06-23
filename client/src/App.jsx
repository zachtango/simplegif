import React, { useState } from "react";

import LandingPage from "./LandingPage/LandingPage";
import RecordingPage from "./RecordingPage/RecordingPage";


import { PAGE_STATE } from "./utils/constants";
import VideoEditingPage from "./VideoEditingPage/VideoEditingPage";

function App() {
    const [pageState, setPageState] = useState(PAGE_STATE.LANDING)
    const [videoBlob, setVideoBlob] = useState()

    let page;

    switch(pageState) {
        case PAGE_STATE.LANDING:
            page = <LandingPage onStartRecording={() => setPageState(PAGE_STATE.RECORDING)} />
            break
        case PAGE_STATE.RECORDING:
            page = <RecordingPage 
                onStopRecording={(blob) => {
                    setPageState(PAGE_STATE.EDITING)
                    setVideoBlob(blob)
                }}
            />
            break
        case PAGE_STATE.EDITING:
            if(videoBlob)
                page = <VideoEditingPage
                    videoBlob={videoBlob}
                    onStopEditing={() => setPageState(PAGE_STATE.LANDING)}
                />
            break
        default:
            throw `Unknown page state ${pageState}`
    }
    
    return (
        <div className="App" class='w-full h-full'>
            {page}
        </div>
    )
}

export default App;