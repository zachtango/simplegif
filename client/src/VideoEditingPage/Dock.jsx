import React, {useState} from 'react'
import { FiChevronDown } from 'react-icons/fi';

import VideoTimeline from './VideoTimeline'

import { MILLISECONDS_PER_SECOND, RESOLUTION_TO_FFMPEG_ARG, TRIM_SELECTOR_WIDTH_PX, VIDEO_EDITING_TIMELINE_WIDTH } from "../utils/constants"
import { millisecondsToFfmpegString } from "../utils/utils";

function Dock({ffmpeg, videoDuration, videoBlob, videoRef, onStopEditing}) {

    // Left and Right margins for trim selectors
    const [left, setLeft] = useState(0)
    const [right, setRight] = useState(0)

    const [isLoaded, setIsLoaded] = useState(false)
    const [downloading, setDownloading] = useState(false)

    const [resolution, setResolution] = useState(1080)
    const resolutions = [360, 480, 720, 1080]

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
            '-vf', RESOLUTION_TO_FFMPEG_ARG[resolution],
            `recording${resolution}.gif`);
        
        // Read gif from ffmpeg memory
        const gifBuffer = ffmpeg.FS('readFile', `recording${resolution}.gif`);
        
        // Download gif
        const gifBlob = new Blob([gifBuffer], {type: 'image/gif'})
        const gifUrl = URL.createObjectURL(gifBlob)

        const link = document.createElement('a')
        link.href = gifUrl
        link.download = `screen_recording${resolution}.gif`
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
                    <div class='w-[200px] flex justify-evenly'>
                        <div className="relative inline-block">
                            <select className="block appearance-none w-full py-2 pl-3 pr-8 border border-gray-300 bg-white focus:outline-none focus:ring-0 rounded-md shadow-sm"
                                onChange={e => setResolution(e.target.value)}
                                value={resolution}
                            >
                                {resolutions.map(resolution => (
                                    <option value={resolution}>{resolution}p</option>
                                ))}
                            </select>
                            <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                                <FiChevronDown className="w-5 h-5 text-gray-400" />
                            </div>
                        </div>
                        
                        <button class='rounded-md bg-green-600 p-2 text-white' onClick={onSaveGif}>Save GIF</button>
                    </div>

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
