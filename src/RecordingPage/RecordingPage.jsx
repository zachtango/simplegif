import React, { useEffect, useRef, useState } from "react"


function RecordingPage({ onStopRecording }) {
    const [loaded, setLoaded] = useState(false)

    const [recorder, setRecorder] = useState()

    const videoRef = useRef(null)

    useEffect(() => {
        (async () => {
            // Get permission to get screen
            const stream = await navigator.mediaDevices.getDisplayMedia({
                video: {
                    displaySurface: "window",
                },
                audio: false,
            })

            // Stream screen to video html
            videoRef.current.srcObject = stream
            
            // Record screen
            const recorder = new MediaRecorder(stream, { mimeType: 'video/webm; codecs=vp9' })

            // Save recording data
            const chunks = []
            recorder.ondataavailable = e => {
                chunks.push(e.data)
            }

            // Save all recording data as a blob when recorder stops
            recorder.onstop = e => {
                const blob = new Blob(chunks, { type: chunks[0].type })
                
                onStopRecording(blob)

                // Stop screen sharing
                stream.getVideoTracks().forEach(track => track.stop())
            };

            recorder.start()

            setRecorder(recorder)

            setLoaded(true)
        })()
    }, [])
    
    console.log(loaded, recorder)
    return (
        <div class='w-full h-full flex justify-center'>
            <div class='my-[50px] h-4/6 min-h-[500px] flex flex-col items-center justify-center'>
                <div class='h-4/5'>
                    <video
                        class='max-h-full'

                        autoPlay
                        ref={videoRef}
                    />
                </div>

                {loaded && recorder &&
                    <div class='my-[14px] flex'>
                        <button
                            class="mt-4 flex h-[52px] w-52 items-center justify-around rounded-xl bg-red-500 text-white hover:bg-red-600 active:bg-red-700"
                            onClick={() => recorder.stop()}
                        >
                            {/* Stop Recording Text */}
                            <div class='ml-2 tracking-wider'>
                                Stop Recording
                            </div>
                            
                            {/* Stop Recording Icon */}
                            <div class="flex h-6 w-6 content-center items-center rounded-md bg-white shadow-md">
                            </div>
                        </button>
                    </div>
                }
            </div>
        </div>
    )
}


export default RecordingPage
