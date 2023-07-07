import React, { useEffect, useRef, useState } from 'react';
import Timer from './Timer';

function RecordingPage({
  videoMimeType,
  onStopRecording,
}: {
  videoMimeType: string;
  onStopRecording: (blob: Blob) => void;
}) {
  const [isLoaded, setIsLoaded] = useState(false);

  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(
    null,
  );

  const videoRef = useRef<HTMLVideoElement | null>(null);

  async function load() {
    let stream: MediaStream | null = null;

    try {
      // Get permission to get screen
      // Ugly to use any but see below
      // https://stackoverflow.com/questions/48026144/typescript-prevents-me-from-passing-the-correct-constraints-to-getusermedia
      stream = await navigator.mediaDevices.getDisplayMedia({
        video: { width: 9999, height: 9999 },
        audio: false,
      });

      if (!stream) throw 'Unable to retrieve screen stream';

      // Stream screen to video html
      if (!videoRef.current) throw 'Video element not defined';

      videoRef.current.srcObject = stream;

      // Record screen
      const recorder = new MediaRecorder(stream, { mimeType: videoMimeType });

      // Save recording data
      const chunks: Blob[] = [];
      recorder.ondataavailable = (e) => {
        chunks.push(e.data);
      };

      // Save all recording data as a blob when recorder stops
      recorder.addEventListener('stop', () => {
        const blob = new Blob(chunks, { type: chunks[0].type });

        onStopRecording(blob);

        // Stop screen sharing
        stream?.getVideoTracks().forEach((track) => track.stop());
      });

      recorder.start();

      setMediaRecorder(recorder);

      setIsLoaded(true);
    } catch (e) {
      alert(`Error setting up screen recording: ${e}`);

      if (stream)
        // Stop screen sharing because of error
        stream.getVideoTracks().forEach((track) => track.stop());
    }
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="w-full h-full flex justify-center">
      <div className="my-[50px] h-4/6 min-h-[500px] flex flex-col items-center justify-center">
        <div
          className="h-4/5"
          style={{
            display: isLoaded ? 'block' : 'none',
          }}
        >
          <video
            className="max-h-full min-h-full"
            autoPlay
            playsInline
            ref={videoRef}
          />
        </div>

        {isLoaded && mediaRecorder && (
          <div className="my-[14px] flex flex-col items-center justify-evenly">
            <Timer />
            <button
              className="mt-4 flex h-[52px] w-52 items-center justify-around rounded-xl bg-red-500 text-white hover:bg-red-600 active:bg-red-700"
              onClick={() => mediaRecorder.stop()}
            >
              {/* Stop Recording Text */}
              <div className="ml-2 tracking-wider">Stop Recording</div>

              {/* Stop Recording Icon */}
              <div className="flex h-6 w-6 content-center items-center rounded-md bg-white shadow-md"></div>
            </button>
          </div>
        )}

        {!isLoaded && (
          <button
            className="rounded-md bg-green-600 p-2 text-white"
            onClick={load}
          >
            Please Grant Me Screen Recording Access
          </button>
        )}
      </div>
    </div>
  );
}

export default RecordingPage;
