import React, { useEffect, useRef, useState } from 'react'
import { VIDEO_EDITING_TIMELINE_WIDTH, SIDE, VIDEO_EDITING_CONTAINER_WIDTH, TRIM_SELECTOR_WIDTH_PX, MILLISECONDS_PER_SECOND } from '../utils/constants';


const VideoTimeline = ({videoDuration, videoRef, left, right, onMoveLeft, onMoveRight}) => {
    
    const timelineRef = useRef(null)

    function onMouseMove(e, side) {
        const leftBound = timelineRef.current.offsetLeft;
        const rightBound = timelineRef.current.offsetLeft + timelineRef.current.clientWidth

        if(side == SIDE.LEFT) {
            /*
                Container holding left bar starts at timelineRef.current.offsetLeft
                Therefore, for left bar
                    left margin = max(0, e.clientX - timelineRef.current.offsetLeft)

                    We take the max with 0 because the left bar shouldn't be able to leave the container
            */
           
            // Don't go over right trim selector
            if(e.clientX >= (rightBound - right - 4 * TRIM_SELECTOR_WIDTH_PX))
                return
            
            const newLeft = Math.max(0, e.clientX - leftBound)
            onMoveLeft(newLeft)

            // Only on the left adjustment do we set the current video time to match the left adjustment
            const VIDEO_DURATION_MILLISECONDS = videoDuration * MILLISECONDS_PER_SECOND
            const PIXEL_WIDTH = timelineRef.current.clientWidth

            const MILLISECONDS_PER_PIXEL = VIDEO_DURATION_MILLISECONDS / PIXEL_WIDTH

            videoRef.current.currentTime = newLeft * MILLISECONDS_PER_PIXEL / MILLISECONDS_PER_SECOND
        } else if(side == SIDE.RIGHT) {
            /*
                Container holding right bar starts at timelineRef.current.offsetLeft + timelineRef.current.clientWidth
                Therefore, for right bar
                    right margin = max(0, timelineRef.current.offsetLeft + timelineRef.current.clientWidth - e.clientX)

                    We take the max with 0 because the left bar shouldn't be able to leave the container
            */
            
            // Don't go over left trim selector
            if(e.clientX <= (leftBound + left + 3 * TRIM_SELECTOR_WIDTH_PX))
                return

            const newRight = Math.max(0, rightBound - e.clientX - TRIM_SELECTOR_WIDTH_PX)
            onMoveRight(newRight)
        } else {
            throw `Invalid side value ${side}`
        }
    }

    function onMouseDown(_, side) {
        document.onmousemove = (e) => onMouseMove(e, side)
        document.onmouseup = onMouseUp
    }

    function onMouseUp() {
        document.onmousemove = null
        document.onmousemove = null
    }

    // Video thumbnails for timeline
    const numCanvases = Math.ceil( VIDEO_EDITING_TIMELINE_WIDTH / 100)
    const canvasRefs = Array.from({ length: numCanvases }, () => useRef(null))

    useEffect(() => {
        // Draw video thumbnails on timeline
        const video = videoRef.current;

        let time = 0
        let counter = 0

        function createImage() {
            if(counter >= numCanvases)
                return
            
            const canvas = canvasRefs[counter].current
            const context = canvas.getContext('2d')

            canvas.width = video.videoWidth
            canvas.height = video.videoHeight

            context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight)
        }

        function loadTime() {
            if(counter >= numCanvases) {
                video.removeEventListener('seeked', handleSeeked)
                video.currentTime = 0
                return;
            }
            
            video.currentTime = time
            time += videoDuration / numCanvases
            counter += 1
        }

        function handleSeeked() {
            createImage()
            loadTime()
        }

        video.addEventListener('seeked', handleSeeked)

        video.currentTime = 0
    }, [])
    
    return (
        <div ref={timelineRef} class={`w-[${VIDEO_EDITING_TIMELINE_WIDTH}px] min-h-[60px] max-h-[60px] px-2 relative`}>
            <div class='flex w-full h-full overflow-hidden'>
                {canvasRefs.map((ref, index) => (
                    <canvas class='w-[100px] min-h-[60px] max-h-[60px]' key={index} ref={ref} />
                ))}
            </div>

            <div class='absolute h-full rounded-md border-yellow-200 border-2'
                style={{
                    top: 0,
                    left: left,
                    width: VIDEO_EDITING_TIMELINE_WIDTH - left - right
                }}
            >
                <div class='w-full h-full bg-yellow-200 opacity-10' />
            </div>

            <div class='rounded-l-md hover:cursor-grab absolute bg-yellow-200 h-full'
                onMouseDown={e => onMouseDown(e, SIDE.LEFT)}
                style={{
                    top: 0,
                    left: left,
                    width: TRIM_SELECTOR_WIDTH_PX
                }}
            />

            <div class='rounded-r-md hover:cursor-grab absolute bg-yellow-200 h-full'
                onMouseDown={e => onMouseDown(e, SIDE.RIGHT)}
                style={{
                    top: 0,
                    right: right,
                    width: TRIM_SELECTOR_WIDTH_PX
                }}
            />
        </div>
    )
}

export default VideoTimeline
