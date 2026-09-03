import { useEffect, useRef, useState } from 'react';
import type { Point } from '../utils/poseAngles';

// Pose is loaded from CDN script tag in index.html
declare const Pose: new (config: { locateFile: (f: string) => string }) => {
  setOptions: (opts: Record<string, unknown>) => void;
  onResults: (cb: (results: PoseResults) => void) => void;
  send: (inputs: { image: HTMLVideoElement }) => Promise<void>;
  close: () => void;
};

interface PoseResults {
  poseLandmarks?: { x: number; y: number; z: number; visibility?: number }[];
}

export interface PoseDetectionResult {
  landmarks: Point[] | null;
}

export function usePoseDetection(
  videoRef: React.RefObject<HTMLVideoElement | null>,
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  active: boolean
): PoseDetectionResult {
  const [landmarks, setLandmarks] = useState<Point[] | null>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    if (!active) return;

    const pose = new Pose({
      locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`,
    });

    pose.setOptions({
      modelComplexity: 1,
      smoothLandmarks: true,
      enableSegmentation: false,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });

    pose.onResults((results) => {
      const lm = (results.poseLandmarks as Point[] | undefined) ?? null;
      setLandmarks(lm);

      const canvas = canvasRef.current;
      const video = videoRef.current;
      if (!canvas || !video) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      if (lm) drawSkeleton(ctx, lm, canvas.width, canvas.height);
    });

    const sendFrame = async () => {
      const video = videoRef.current;
      if (video && video.readyState >= 2) {
        await pose.send({ image: video });
      }
      rafRef.current = requestAnimationFrame(sendFrame);
    };

    rafRef.current = requestAnimationFrame(sendFrame);

    return () => {
      cancelAnimationFrame(rafRef.current);
      pose.close();
    };
  }, [active]);

  return { landmarks };
}

const CONNECTIONS = [
  [11, 12], [11, 13], [13, 15], [12, 14], [14, 16],
  [11, 23], [12, 24], [23, 24], [23, 25], [25, 27],
  [24, 26], [26, 28], [27, 29], [28, 30], [29, 31], [30, 32],
];

function drawSkeleton(
  ctx: CanvasRenderingContext2D,
  lm: Point[],
  w: number,
  h: number
) {
  ctx.strokeStyle = '#00ff88';
  ctx.lineWidth = 3;
  ctx.shadowColor = '#00ff88';
  ctx.shadowBlur = 8;

  for (const [a, b] of CONNECTIONS) {
    const pa = lm[a], pb = lm[b];
    if ((pa?.visibility ?? 1) < 0.4 || (pb?.visibility ?? 1) < 0.4) continue;
    ctx.beginPath();
    ctx.moveTo(pa.x * w, pa.y * h);
    ctx.lineTo(pb.x * w, pb.y * h);
    ctx.stroke();
  }

  ctx.fillStyle = '#ffffff';
  ctx.shadowColor = '#00aaff';
  ctx.shadowBlur = 6;
  for (const p of lm) {
    if ((p.visibility ?? 1) < 0.4) continue;
    ctx.beginPath();
    ctx.arc(p.x * w, p.y * h, 5, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.shadowBlur = 0;
}
