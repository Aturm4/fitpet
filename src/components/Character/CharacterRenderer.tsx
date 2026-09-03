import { useEffect, useRef, useState } from 'react';
import { useActiveCharacter, useGameStore } from '../../store/gameStore';
import { getStage } from '../../game/characterStages';
import { CharacterSVG } from './CharacterSVG';

export function CharacterRenderer() {
  const char = useActiveCharacter();
  const { isLevelingUp, finishLevelUp } = useGameStore();
  const level = char?.level ?? 1;
  const totalReps = char?.totalReps ?? 0;
  const stage = getStage(level, char?.type);
  const [glow, setGlow] = useState(false);
  const [bounce, setBounce] = useState(false);
  const bounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (isLevelingUp) {
      setGlow(true);
      setTimeout(() => { setGlow(false); finishLevelUp(); }, 2000);
    }
  }, [isLevelingUp]);

  useEffect(() => {
    if (totalReps === 0) return;
    setBounce(true);
    if (bounceRef.current) clearTimeout(bounceRef.current);
    bounceRef.current = setTimeout(() => setBounce(false), 600);
  }, [totalReps]);

  return (
    <div className="relative flex items-center justify-center w-full h-full">
      {glow && (
        <div
          className="absolute inset-0 rounded-full opacity-40 animate-ping"
          style={{ background: stage.color, filter: 'blur(40px)' }}
        />
      )}
      <div
        style={{
          transform: `scale(${stage.scale}) ${bounce ? 'translateY(-12px)' : 'translateY(0)'}`,
          filter: glow ? `drop-shadow(0 0 32px ${stage.color})` : `drop-shadow(0 4px 12px rgba(0,0,0,0.5))`,
          transition: bounce ? 'transform 0.15s ease-out' : 'transform 0.3s ease',
        }}
      >
        <CharacterSVG shape={stage.bodyShape} color={stage.color} />
      </div>
      <div
        className="absolute bottom-4 text-center text-sm font-bold px-4 py-1 rounded-full"
        style={{ background: `${stage.color}33`, color: stage.color, border: `1px solid ${stage.color}55` }}
      >
        {stage.emoji} {stage.label}
      </div>
    </div>
  );
}
