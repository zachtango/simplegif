import React, {useState} from 'react'
import VideoTimeline from './VideoTimeline'

import { MILLISECONDS_PER_SECOND, TRIM_SELECTOR_WIDTH_PX, VIDEO_EDITING_TIMELINE_WIDTH } from "../utils/constants"
import { millisecondsToFfmpegString } from "../utils/utils";

function Dock({ffmpeg, videoDuration, videoBlob, videoRef, onStopEditing}) {

    // Left and Right margins for trim selectors
    const [left, setLeft] = useState(0)
    const [right, setRight] = useState(0)

    const [downloading, setDownloading] = useState(false)

    async function onSaveGif() {
        setDownloading(true)

        const webmBuffer = await videoBlob.arrayBuffer();

        const VIDEO_DURATION_MILLISECONDS = videoDuration * MILLISECONDS_PER_SECOND
        const MILLISECONDS_PER_PIXEL = VIDEO_DURATION_MILLISECONDS / VIDEO_EDITING_TIMELINE_WIDTH

        const start = left * MILLISECONDS_PER_PIXEL
        const end = (VIDEO_EDITING_TIMELINE_WIDTH - right - TRIM_SELECTOR_WIDTH_PX) * MILLISECONDS_PER_PIXEL

        // Write webm to ffmpeg memory
        ffmpeg.FS('writeFile', 'recording.webm', new Uint8Array(webmBuffer));

        // Trim and convert webm to gif
        // https://trac.ffmpeg.org/wiki/Seeking#Cuttingsmallsections
        await ffmpeg.run('-i', 'recording.webm', 
            '-ss', millisecondsToFfmpegString(start),
            '-to', millisecondsToFfmpegString(end),
            'recording.gif');
        
        // Read gif from ffmpeg memory
        const gifBuffer = ffmpeg.FS('readFile', 'recording.gif');
        
        // Download gif
        var gifBlob = new Blob([gifBuffer], {type: 'image/gif'})
        var gifUrl = URL.createObjectURL(gifBlob)

        var link = document.createElement('a')
        link.href = gifUrl
        link.download = 'test.gif'
        link.click()

        setDownloading(false)
    }

    return (
        <div class='flex flex-col justify-evenly h-[140px]'>
            {!downloading ?
            <>
                <VideoTimeline
                    videoDuration={videoDuration}
                    videoRef={videoRef}
                    left={left}
                    right={right}
                    onMoveLeft={(l) => setLeft(l)}
                    onMoveRight={(r) => setRight(r)}
                />
                
                <div class='flex justify-evenly'>
                    <button class='rounded-md bg-green-600 p-2 text-white' onClick={onSaveGif}>Save GIF</button>
                    <button class='rounded-md bg-green-600 p-2 text-white' onClick={onStopEditing}>Done</button>
                </div>
            </> :
            <p>Downloading...</p>}
        </div>
    )
}


export default Dock
