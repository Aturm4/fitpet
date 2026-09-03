import { useRef, useCallback } from 'react';
import type { ExerciseType } from '../game/xpSystem';
import type { Point } from '../utils/poseAngles';
import { createSquatDetector } from '../utils/detectors/squatDetector';
import { createPushupDetector } from '../utils/detectors/pushupDetector';
import { createJumpingJackDetector } from '../utils/detectors/jumpingJackDetector';

export function useExerciseCounter(onRep: (exercise: ExerciseType) => void) {
  const squat = useRef(createSquatDetector());
  const pushup = useRef(createPushupDetector());
  const jumpingjack = useRef(createJumpingJackDetector());

  const process = useCallback(
    (exercise: ExerciseType, landmarks: Point[]) => {
      let completed = false;
      if (exercise === 'squat') completed = squat.current.process(landmarks);
      if (exercise === 'pushup') completed = pushup.current.process(landmarks);
      if (exercise === 'jumpingjack') completed = jumpingjack.current.process(landmarks);
      if (completed) onRep(exercise);
    },
    [onRep]
  );

  return { process };
}
