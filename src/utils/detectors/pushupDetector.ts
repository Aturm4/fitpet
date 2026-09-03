import { getAngle, isVisible } from '../poseAngles';
import type { Point } from '../poseAngles';

type RepState = 'up' | 'down';

export interface PushupDetector {
  state: RepState;
  process: (landmarks: Point[]) => boolean;
}

export function createPushupDetector(): PushupDetector {
  let state: RepState = 'up';

  return {
    get state() { return state; },
    process(landmarks: Point[]): boolean {
      // MediaPipe indices: 11=left_shoulder, 13=left_elbow, 15=left_wrist
      const shoulder = landmarks[11];
      const elbow = landmarks[13];
      const wrist = landmarks[15];

      if (!isVisible(shoulder) || !isVisible(elbow) || !isVisible(wrist)) return false;

      const angle = getAngle(shoulder, elbow, wrist);

      if (state === 'up' && angle < 90) {
        state = 'down';
      } else if (state === 'down' && angle > 160) {
        state = 'up';
        return true;
      }
      return false;
    },
  };
}
