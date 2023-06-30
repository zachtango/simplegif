import React, { useRef, useEffect, useState } from 'react'
import { TRIM_SELECTOR_WIDTH_PX, TrimSide, TIMELINE_WIDTH, TIMELINE_THUMBNAIL_WIDTH } from '../../utils/constants'
import { loadVideoDuration } from '../../utils/utils'

/*
    Timeline
        Width
            - width in pixels of the timeline
        Left, Right
            - left trim selector margin from left boundary
            - right trim selector margin from right boundary
        
        on trim mouse down
            start listening to the mouse move
            until the mouse goes up
*/
function Timeline({
    videoPath,
    left,
    right,
    setLeft,
    setRight,
    setTrims
} : {
    videoPath: string,
    left: number,
    right: number,
    setLeft: (left : number) => void
    setRight: (right : number) => void
    setTrims: (trims : number[]) => void
}) {

    const [isLoaded, setIsLoaded] = useState(false)

    // Need to ref to get the timeline offsetLeft to correctly calculate the margins for the trim selectors
    const timelineRef = useRef<HTMLDivElement | null>(null)

    // Video thumbnails for timeline
    const numCanvases = Math.ceil(TIMELINE_WIDTH / TIMELINE_THUMBNAIL_WIDTH)
    const canvasesRef = useRef<HTMLCanvasElement[] | null[]>(Array.from({ length: numCanvases }, () => null))

    useEffect(() => {
        // Separate video from Video component to prevent clashing of resources
        let video : HTMLVideoElement = document.createElement('video')

        video.src = videoPath

        let time = 0;
        let counter = 0;
        const canvases = canvasesRef.current

        function drawVideoThumbnail() {
            if (counter >= numCanvases)
                return

            const canvas = canvases[counter]
            const context = canvas?.getContext('2d')

            if( !(canvas && context) )
                return
            
            canvas.width = video.videoWidth
            canvas.height = video.videoHeight

            context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight)
        }

        function loadTime() {
            if (counter >= numCanvases) {
                cleanUp()
                return
            }

            time += video.duration / numCanvases
            video.currentTime = time
            counter += 1
        }

        function seekHandle() {
            drawVideoThumbnail()
            loadTime()
        }

        async function videoLoadedHandler() {
            await loadVideoDuration(video)

            video.addEventListener('seeked', seekHandle);

            // Fix Safari bug where timeline doesn't show first 3 canvases --> set it to 0.1
            video.currentTime = 0.1;
        }

        video.addEventListener('loadedmetadata', videoLoadedHandler)

        function cleanUp() {
            video.removeEventListener('loadedmetadata', videoLoadedHandler)
            video.removeEventListener('seeked', seekHandle)
            video = null as any
        }
    }, [])

    // Trim Selector Dragging
    const mouseMoveHandler = (e : MouseEvent, side : TrimSide) => {
        const timeline = timelineRef.current

        if(!timeline)
            return

        const leftBound = timeline.offsetLeft;
        const rightBound = timeline.offsetLeft + timeline.clientWidth;

        if(side === TrimSide.Left) {
            /*
                Container holding left bar starts at timelineRef.current.offsetLeft
                Therefore, for left bar
                    left margin = max(0, e.clientX - timelineRef.current.offsetLeft)

                    We take the max with 0 because the left bar shouldn't be able to leave the container
            */

            // Don't go over right trim selector
            if (e.clientX >= rightBound - right - 2 * TRIM_SELECTOR_WIDTH_PX) return;

            const newLeft = Math.max(0, e.clientX - leftBound);

            setLeft( newLeft )
            setTrims([newLeft, right])
        } else {
            /*
                Container holding right bar starts at timelineRef.current.offsetLeft + timelineRef.current.clientWidth
                Therefore, for right bar
                    right margin = max(0, timelineRef.current.offsetLeft + timelineRef.current.clientWidth - e.clientX)

                    We take the max with 0 because the left bar shouldn't be able to leave the container
            */

            // Don't go over left trim selector
            if (e.clientX <= leftBound + left + 1 * TRIM_SELECTOR_WIDTH_PX) return;

            const newRight = Math.max(
                0,
                rightBound - e.clientX - TRIM_SELECTOR_WIDTH_PX
            );

            setRight( newRight )
            setTrims([left, newRight])
        }
    }

    const mouseDownHandler = (side : TrimSide) => {
        const onMouseMove = (e : MouseEvent) => mouseMoveHandler(e, side)
        const onMouseUp = (e : MouseEvent) => {
            document.removeEventListener('mousemove', onMouseMove)
            e.currentTarget?.removeEventListener(e.type, onMouseUp as EventListenerOrEventListenerObject)
        }

        document.addEventListener('mousemove', onMouseMove)
        document.addEventListener('mouseup', onMouseUp)
    }

    return (
        <div ref={timelineRef} className={`Timeline relative flex w-[${TIMELINE_WIDTH}px] h-[60px] px-2 py-0.5 relative`}>
            <div className='flex w-full h-full overflow-hidden'>
                {canvasesRef.current.map((_, i) => (
                    <canvas
                        className='w-[100px]'
                        key={i}
                        ref={canvas => canvasesRef.current[i] = canvas}
                    />
                ))}
            </div>

            <div
                className='absolute h-full rounded-md border-yellow-200 border-2'
                style={{
                    top: 0,
                    left: left,
                    width: TIMELINE_WIDTH - left - right,
                }}
            >
                <div className='w-full h-full bg-yellow-200 opacity-20' />
            </div>

            <div 
                className={`TrimLeft rounded-l-md hover:cursor-grab absolute bg-yellow-200 h-full`} 
                style={{
                    top: 0,
                    left: left,
                    width: TRIM_SELECTOR_WIDTH_PX
                }}

                onMouseDown={() => mouseDownHandler(TrimSide.Left)}
            />

            <div
                className={`TrimRight rounded-r-md hover:cursor-grab absolute bg-yellow-200 h-full`} 
                style={{
                    top: 0,
                    right: right,
                    width: TRIM_SELECTOR_WIDTH_PX
                }}

                onMouseDown={() => mouseDownHandler(TrimSide.Right)}
            />
        </div>
    )
}


export default Timeline