import { useActiveCharacter, useGameStore } from '../../store/gameStore';
import { LEVEL_THRESHOLDS } from '../../game/xpSystem';
import { getStage } from '../../game/characterStages';

export function XPBar() {
  const char = useActiveCharacter();
  const { goToMenu } = useGameStore();

  if (!char) return null;

  const stage = getStage(char.level, char.type);
  const isMaxLevel = char.level >= 6;
  const nextThreshold = LEVEL_THRESHOLDS[char.level] ?? LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1];

  return (
    <div className="flex flex-col gap-1 px-4 py-3 bg-white/5 rounded-2xl border border-white/10">
      <div className="flex items-center gap-3">
        <button
          onClick={goToMenu}
          className="flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-bold text-white/70 hover:text-white transition-all flex-shrink-0"
          style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)' }}
        >
          ← Меню
        </button>
        <span className="font-bold text-white truncate flex-1">{char.name}</span>
        <span className="text-white/60 flex-shrink-0 text-sm">
          {stage.emoji} {isMaxLevel ? 'MAX' : `${char.xp} / ${nextThreshold} XP`}
        </span>
      </div>
      <div className="h-2.5 bg-white/10 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${(isMaxLevel ? 1 : char.levelProgress) * 100}%`,
            background: `linear-gradient(90deg, ${stage.color}, ${stage.color}cc)`,
            boxShadow: `0 0 12px ${stage.color}`,
          }}
        />
      </div>
      <div className="flex justify-between text-xs text-white/40">
        <span>{stage.label} · Ур. {char.level}</span>
        {!isMaxLevel && <span>Ур. {char.level + 1}</span>}
      </div>
    </div>
  );
}
