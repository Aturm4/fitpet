import { getAngle, isVisible } from '../poseAngles';
import type { Point } from '../poseAngles';

type RepState = 'up' | 'down';

export interface SquatDetector {
  state: RepState;
  process: (landmarks: Point[]) => boolean;
}

export function createSquatDetector(): SquatDetector {
  let state: RepState = 'up';

  return {
    get state() { return state; },
    process(landmarks: Point[]): boolean {
      // MediaPipe indices: 23=left_hip, 25=left_knee, 27=left_ankle
      const hip = landmarks[23];
      const knee = landmarks[25];
      const ankle = landmarks[27];

      if (!isVisible(hip) || !isVisible(knee) || !isVisible(ankle)) return false;

      const angle = getAngle(hip, knee, ankle);

      if (state === 'up' && angle < 100) {
        state = 'down';
      } else if (state === 'down' && angle > 160) {
        state = 'up';
        return true; // rep completed
      }
      return false;
    },
  };
}
