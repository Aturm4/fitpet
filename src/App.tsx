import { useCallback, useEffect, useRef, useState } from 'react';
import { useGameStore } from './store/gameStore';
import type { ExerciseType } from './game/xpSystem';
import { CameraFeed } from './components/Camera/CameraFeed';
import { CharacterRenderer } from './components/Character/CharacterRenderer';
import { XPBar } from './components/UI/XPBar';
import { RepCounter } from './components/UI/RepCounter';
import { ExerciseSelector } from './components/UI/ExerciseSelector';
import { MainMenu } from './components/UI/MainMenu';
import { CharacterCreate } from './components/UI/CharacterCreate';
import { LevelUpBanner } from './components/UI/LevelUpBanner';
import { StagesPreview } from './components/UI/StagesPreview';
import { StatsModal } from './components/UI/StatsModal';
import { DailyGoalBar } from './components/UI/DailyGoalBar';
import { DecayBanner } from './components/UI/DecayBanner';
import { usePoseDetection } from './hooks/usePoseDetection';
import { useExerciseCounter } from './hooks/useExerciseCounter';

export default function App() {
  const { screen, addRep, applyDecay } = useGameStore();

  // Run once on app load — handles streak update + XP decay for missed days
  useEffect(() => { applyDecay(); }, []);

  if (screen === 'menu') return <MainMenu />;
  if (screen === 'create') return <CharacterCreate />;
  return <GameScreen addRep={addRep} />;
}

function GameScreen({ addRep }: { addRep: (e: ExerciseType) => void }) {
  const [exercise, setExercise] = useState<ExerciseType>('squat');
  const [sessionReps, setSessionReps] = useState<Record<ExerciseType, number>>({
    squat: 0, pushup: 0, jumpingjack: 0,
  });
  const [poseActive, setPoseActive] = useState(false);
  const [showStages, setShowStages] = useState(false);
  const [showStats, setShowStats] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleRep = useCallback(
    (ex: ExerciseType) => {
      addRep(ex);
      setSessionReps((prev) => ({ ...prev, [ex]: prev[ex] + 1 }));
    },
    [addRep]
  );

  const { process } = useExerciseCounter(handleRep);
  const { landmarks } = usePoseDetection(videoRef, canvasRef, poseActive);

  useEffect(() => {
    if (landmarks) process(exercise, landmarks);
  }, [landmarks, exercise, process]);

  const onVideoReady = useCallback(() => setPoseActive(true), []);

  return (
    <div className="w-full h-full flex bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative">
      <LevelUpBanner />
      <DecayBanner />
      {showStages && <StagesPreview onClose={() => setShowStages(false)} />}
      {showStats && <StatsModal onClose={() => setShowStats(false)} />}

      {/* Left — Camera */}
      <div className="flex flex-col gap-3 p-4 w-[55%]">
        <div className="flex-1 min-h-0">
          <CameraFeed videoRef={videoRef} canvasRef={canvasRef} onVideoReady={onVideoReady} />
        </div>
        <ExerciseSelector current={exercise} onChange={setExercise} />
      </div>

      {/* Right — Character & Stats */}
      <div className="flex flex-col gap-3 p-4 w-[45%]">
        <XPBar />
        <DailyGoalBar />
        <div className="flex-1 min-h-0 bg-white/5 rounded-2xl border border-white/10 overflow-hidden relative">
          <CharacterRenderer />
          <div className="absolute top-3 right-3 flex gap-2">
            <button
              onClick={() => setShowStats(true)}
              className="text-xs font-bold px-3 py-1.5 rounded-xl transition-all hover:scale-105"
              style={{ background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.6)', border: '1px solid rgba(255,255,255,0.15)' }}
            >
              📊 Стат
            </button>
            <button
              onClick={() => setShowStages(true)}
              className="text-xs font-bold px-3 py-1.5 rounded-xl transition-all hover:scale-105"
              style={{ background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.6)', border: '1px solid rgba(255,255,255,0.15)' }}
            >
              👁 Стадии
            </button>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <RepCounter exercise="squat" sessionReps={sessionReps.squat} />
          <RepCounter exercise="pushup" sessionReps={sessionReps.pushup} />
          <RepCounter exercise="jumpingjack" sessionReps={sessionReps.jumpingjack} />
        </div>
      </div>
    </div>
  );
}
