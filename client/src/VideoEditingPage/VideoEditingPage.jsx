import React, { useEffect, useRef, useState } from "react"

import { VIDEO_EDITING_CONTAINER_WIDTH } from "../utils/constants"
import { createFFmpeg } from '@ffmpeg/ffmpeg';
import Dock from "./Dock";

const ffmpeg = createFFmpeg({
    log: true
})

function VideoEditingPage({videoBlob, onStopEditing}) {
    const videoBlobUrl = URL.createObjectURL(videoBlob)

    const videoRef = useRef(null)

    const [isLoaded, setIsLoaded] = useState(false)
    const [videoDuration, setVideoDuration] = useState(0)

    useEffect(() => {
        (async () => {
            const video = videoRef.current;

            const onDurationChange = function() {
                // Handle video.duration bug that won't be fixed on chrome
                // https://stackoverflow.com/questions/21522036/html-audio-tag-duration-always-infinity
                if(video.duration === Infinity) {
                    video.currentTime = Number.MAX_SAFE_INTEGER
                    setTimeout(() => {
                        video.currentTime = 0
                    }, 1000)
                    return
                }
            }

            const loadValidVideoDuration = new Promise((resolve) => {
                const checkDuration = () => {
                    if(video.duration !== Infinity && !isNaN(video.duration)) {
                        resolve()
                    }
                    else
                        setTimeout(checkDuration, 100) // Retry after 100 ms
                }
                checkDuration()
            })

            video.addEventListener('durationchange', onDurationChange)

            // Load everything
            if(!ffmpeg.isLoaded())
                await ffmpeg.load()
            
            await loadValidVideoDuration
            
            setVideoDuration(video.duration)
            setIsLoaded(true)
            
            // Clean up
            video.removeEventListener('durationchange', onDurationChange)
        })()
    }, [])
    
    return (
        <div class='w-full h-full flex justify-center'>
            <div class={`my-[50px] w-[${VIDEO_EDITING_CONTAINER_WIDTH}px] h-[700px] min-w-[${VIDEO_EDITING_CONTAINER_WIDTH}px] min-h-[700px] flex flex-col items-center justify-evenly`}>
                <div class='h-4/5'>
                    <video
                        ref={videoRef}
                        controls
                        class='max-h-full'
                        src={videoBlobUrl}

                        style={{
                            display: isLoaded ? 'block' : 'none'
                        }}
                    />
                </div>
                
                {isLoaded && videoDuration &&
                <Dock
                    ffmpeg={ffmpeg}

                    videoBlob={videoBlob}
                    videoDuration={videoDuration}
                    videoRef={videoRef}

                    onStopEditing={onStopEditing}
                />}
            </div>
        </div>
    )
}

export default VideoEditingPage