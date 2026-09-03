import { useEffect, useRef } from 'react';

interface Props {
  onVideoReady: (video: HTMLVideoElement) => void;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
}

export function CameraFeed({ onVideoReady, videoRef, canvasRef }: Props) {
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ video: { width: 640, height: 480, facingMode: 'user' } })
      .then((stream) => {
        streamRef.current = stream;
        const video = videoRef.current;
        if (!video) return;
        video.srcObject = stream;
        video.onloadedmetadata = () => {
          video.play();
          onVideoReady(video);
        };
      })
      .catch(console.error);

    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  return (
    <div className="relative w-full h-full overflow-hidden rounded-2xl bg-black">
      <video
        ref={videoRef}
        className="absolute inset-0 w-full h-full object-cover scale-x-[-1]"
        muted
        playsInline
      />
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full object-cover scale-x-[-1] pointer-events-none"
      />
    </div>
  );
}
