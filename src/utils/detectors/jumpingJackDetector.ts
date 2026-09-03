import { isVisible } from '../poseAngles';
import type { Point } from '../poseAngles';

type JackState = 'closed' | 'open';

export interface JumpingJackDetector {
  state: JackState;
  process: (landmarks: Point[]) => boolean;
}

export function createJumpingJackDetector(): JumpingJackDetector {
  let state: JackState = 'closed';

  return {
    get state() { return state; },
    process(landmarks: Point[]): boolean {
      // MediaPipe indices: 11=L_shoulder, 12=R_shoulder, 15=L_wrist, 16=R_wrist
      // 23=L_hip, 24=R_hip, 27=L_ankle, 28=R_ankle
      const lShoulder = landmarks[11];
      const rShoulder = landmarks[12];
      const lWrist = landmarks[15];
      const rWrist = landmarks[16];
      const lHip = landmarks[23];
      const rHip = landmarks[24];
      const lAnkle = landmarks[27];
      const rAnkle = landmarks[28];

      const allVisible = [lShoulder, rShoulder, lWrist, rWrist, lHip, rHip, lAnkle, rAnkle]
        .every(p => isVisible(p, 0.4));
      if (!allVisible) return false;

      const wristsAboveShoulders = lWrist.y < lShoulder.y && rWrist.y < rShoulder.y;
      const feetWide = Math.abs(lAnkle.x - rAnkle.x) > Math.abs(lHip.x - rHip.x) * 1.5;
      const isOpen = wristsAboveShoulders && feetWide;

      const wristsBelowShoulders = lWrist.y > lShoulder.y && rWrist.y > rShoulder.y;
      const feetClose = Math.abs(lAnkle.x - rAnkle.x) < Math.abs(lHip.x - rHip.x) * 0.8;
      const isClosed = wristsBelowShoulders && feetClose;

      if (state === 'closed' && isOpen) {
        state = 'open';
      } else if (state === 'open' && isClosed) {
        state = 'closed';
        return true;
      }
      return false;
    },
  };
}
