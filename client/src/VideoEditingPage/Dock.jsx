import React, {useState} from 'react'
import VideoTimeline from './VideoTimeline'

import { MILLISECONDS_PER_SECOND, TRIM_SELECTOR_WIDTH_PX, VIDEO_EDITING_TIMELINE_WIDTH } from "../utils/constants"
import { millisecondsToFfmpegString } from "../utils/utils";

function Dock({ffmpeg, videoDuration, videoBlob, videoRef, onStopEditing}) {

    // Left and Right margins for trim selectors
    const [left, setLeft] = useState(0)
    const [right, setRight] = useState(0)

    const [isLoaded, setIsLoaded] = useState(false)
    const [downloading, setDownloading] = useState(false)

    async function onSaveGif() {
        setDownloading(true)

        const videoBuffer = await videoBlob.arrayBuffer();

        const VIDEO_DURATION_MILLISECONDS = videoDuration * MILLISECONDS_PER_SECOND
        const MILLISECONDS_PER_PIXEL = VIDEO_DURATION_MILLISECONDS / VIDEO_EDITING_TIMELINE_WIDTH

        const start = left * MILLISECONDS_PER_PIXEL
        const end = (VIDEO_EDITING_TIMELINE_WIDTH - right - TRIM_SELECTOR_WIDTH_PX) * MILLISECONDS_PER_PIXEL

        // Write video to ffmpeg memory
        ffmpeg.FS('writeFile', 'recording', new Uint8Array(videoBuffer));

        // Trim and convert video to gif
        // https://trac.ffmpeg.org/wiki/Seeking#Cuttingsmallsections
        await ffmpeg.run('-i', 'recording', 
            '-ss', millisecondsToFfmpegString(start),
            '-to', millisecondsToFfmpegString(end),
            'recording.gif');
        
        // Read gif from ffmpeg memory
        const gifBuffer = ffmpeg.FS('readFile', 'recording.gif');
        
        // Download gif
        const gifBlob = new Blob([gifBuffer], {type: 'image/gif'})
        const gifUrl = URL.createObjectURL(gifBlob)

        const link = document.createElement('a')
        link.href = gifUrl
        link.download = 'screen_recording.gif'
        link.click()

        setDownloading(false)
    }

    return (
        <div class='flex flex-col justify-center h-[140px]'>
            <div
                class='flex flex-col justify-evenly h-full'
                style={{
                    display: (isLoaded && !downloading) ? 'flex' : 'none'
                }}
            >
                <VideoTimeline
                    videoDuration={videoDuration}
                    videoRef={videoRef}
                    left={left}
                    right={right}
                    onMoveLeft={(l) => setLeft(l)}
                    onMoveRight={(r) => setRight(r)}
                    onLoad={() => setIsLoaded(true)}
                />
                
                <div class='flex justify-evenly'>
                    <button class='rounded-md bg-green-600 p-2 text-white' onClick={onSaveGif}>Save GIF</button>
                    <button class='rounded-md bg-green-600 p-2 text-white' onClick={onStopEditing}>Done</button>
                </div>
            </div>

            {downloading &&
            <p>Downloading...</p>}

            {!isLoaded &&
            <p>Loading Dock...</p>}
        </div>
    )
}


export default Dock
