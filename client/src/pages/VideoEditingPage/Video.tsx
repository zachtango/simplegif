import React, { useState, useRef, useEffect } from 'react'
import { getBox, loadVideoDuration } from '../../utils/utils'
import * as StackBlur from 'stackblur-canvas'
import { TIMELINE_WIDTH } from '../../utils/constants'


// For drawing video frames that won't be edited, allowing us to get unblurred crop box
// This will never be incorporated into the UI --> chose to not use useRef as it will only add complexity
const videoCanvas = document.createElement('canvas')

function Video({
    video,
    trimsRef,
    videoPath,
    crop,
    setCrop
} : {
    video: HTMLVideoElement,
    trimsRef: React.MutableRefObject<number[]>,
    videoPath : string,
    crop : number[] | null,
    setCrop : (crop : number[]) => void
}) {
    const canvasRef = useRef<HTMLCanvasElement | null>(null)
  
    // Video dimensions [x, y]
    // Video pixels per canvas pixel
    const [scale, setScale] = useState<number[] | null>(null)
  
    // Getting updated crop in event handlers
    const cropRef = React.useRef(crop)
    const setCropState = (crop : number[]) => {
      cropRef.current = crop
      setCrop(crop)
    }

    // Avoid memory leaks with setTimeout
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

    // Render video to canvas when playing
    const videoPlayHandler = () => {
        const canvas  = canvasRef.current
        const context = canvas?.getContext('2d')
        const videoContext = videoCanvas.getContext('2d', { willReadFrequently: true })

        if( !(canvas && context && videoContext) )
            return
    
        (function render() {
            const endTime = video.duration - trimsRef.current[1] * video.duration / TIMELINE_WIDTH
            if( video.ended || video.currentTime > endTime ) {
                video.currentTime = trimsRef.current[0] * video.duration / TIMELINE_WIDTH
                video.play()
            }
            
            const crop = cropRef.current

            if(!crop || video.paused)
                return
        
            videoContext.drawImage(video, 0, 0, video.videoWidth, video.videoHeight)

            // Save frame part of image that's not supposed to be blurred
            const [x, y, w, h] = crop
            const frame = videoContext.getImageData(x, y, w, h)
            
            // Apply blur if crop box exists
            if(w != video.videoWidth || h != video.videoHeight) {
                if(context.filter !== undefined) {
                    // Check for filter support (e.g. Safari does not support it)
                    context.filter = "blur(10px)";
                    context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight)
                } else {
                    context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight)

                    // Add blur for unsupported browsers
                    StackBlur.canvasRGB(canvas, 0, 0, video.videoWidth, video.videoHeight, 100)
                }
            }

            // Write saved frame back unblurred
            context.putImageData(frame, x, y)

            // Render 60 fps
            timeoutRef.current = setTimeout(render, 1000 / 60)
        })()
    }

    const handleVisibilityChange = () => {
        if (document.visibilityState === 'visible') {
            // Tab has regained focus
            video.play();
        } else {
            // Tab has lost focus
            video.pause();
        }
    }
          
    useEffect(() => {
        const canvas  = canvasRef.current
        
        if(!canvas)
            return

        // Configure video
        video.src = videoPath
        video.autoplay = true
        video.muted = true

        const videoLoadedHandler = async () => {
            await loadVideoDuration(video)

            canvas.width = video.videoWidth
            canvas.height = video.videoHeight

            videoCanvas.width = video.videoWidth
            videoCanvas.height = video.videoHeight

            setCropState([ 0, 0, canvas.width, canvas.height ])
            setScale([ canvas.width / canvas.clientWidth, canvas.height / canvas.clientHeight ])

            video.addEventListener('play', videoPlayHandler)

            video.play()

            document.addEventListener('visibilitychange', handleVisibilityChange);
        }

        video.addEventListener('loadedmetadata', videoLoadedHandler)

        return () => {
            video.removeEventListener('loadedmetadata', videoLoadedHandler)
            video.removeEventListener('play', videoPlayHandler)
            
            if(timeoutRef.current)
                clearTimeout(timeoutRef.current)

            document.removeEventListener('visibilitychange', handleVisibilityChange)
        }

    }, [])
  
    useEffect(() => {
        if(!scale)
            return

        const canvas  = canvasRef.current
        const context = canvas?.getContext('2d')

        if( !(canvas && context) )
            return

        let start : number[] | null = null

        const mouseMoveHandler = (e : MouseEvent) => {
            if(!start)
                return
            
            const end = [ (e.clientX  - canvas.offsetLeft) * scale[0], (e.clientY - canvas.offsetTop) * scale[1] ]

            try {
                const box = getBox(start, end)
                setCropState(box)
            } catch {

            }
        }
    
        const mouseDownHandler = (e : MouseEvent) => {
            start = [ (e.clientX  - canvas.offsetLeft) * scale[0], (e.clientY - canvas.offsetTop) * scale[1] ]

            canvas.addEventListener('mousemove', mouseMoveHandler)
        }
    
        const mouseUpHandler = () => {
            canvas.removeEventListener('mousemove', mouseMoveHandler)
        }

        canvas.addEventListener('mousedown', mouseDownHandler, false)
        canvas.addEventListener('mouseup', mouseUpHandler, false)
    
        return () => {
            canvas.removeEventListener('mousemove', mouseMoveHandler)
            canvas.removeEventListener('mousedown', mouseDownHandler)
            canvas.removeEventListener('mouseup', mouseDownHandler)
        }
  
    }, [scale])

    return (
      <div className="Video">
        <canvas ref={canvasRef} style={{height: 500}} />
      </div>
    )
}



export default Video
