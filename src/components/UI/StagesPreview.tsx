import { useActiveCharacter } from '../../store/gameStore';
import { CHARACTER_STAGES, getStage } from '../../game/characterStages';
import { LEVEL_THRESHOLDS } from '../../game/xpSystem';
import { CharacterSVG } from '../Character/CharacterSVG';

interface Props {
  onClose: () => void;
}

export function StagesPreview({ onClose }: Props) {
  const char = useActiveCharacter();
  const currentLevel = char?.level ?? 1;
  const charType = char?.type ?? 'fat';

  return (
    <div
      className="absolute inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-3xl rounded-3xl p-5 flex flex-col gap-4"
        style={{ background: '#1e2130', border: '1px solid rgba(255,255,255,0.1)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-black text-white">Стадии персонажа</h2>
          <button
            onClick={onClose}
            className="text-white/40 hover:text-white text-2xl leading-none transition-colors"
          >
            ×
          </button>
        </div>

        <div className="grid grid-cols-3 gap-3 overflow-y-auto" style={{ maxHeight: '70vh' }}>
          {CHARACTER_STAGES.map((s) => {
            const stage = getStage(s.level, charType);
            const isUnlocked = currentLevel >= stage.level;
            const isCurrent = currentLevel === stage.level;
            const xpNeeded = LEVEL_THRESHOLDS[stage.level - 1];

            return (
              <div
                key={stage.level}
                className="flex flex-col items-center rounded-2xl p-3 gap-1 relative overflow-hidden"
                style={{
                  background: isCurrent ? `${stage.color}22` : 'rgba(255,255,255,0.04)',
                  border: `2px solid ${isCurrent ? stage.color : isUnlocked ? `${stage.color}55` : 'rgba(255,255,255,0.08)'}`,
                }}
              >
                {isCurrent && (
                  <div
                    className="absolute top-2 right-2 text-xs font-bold px-2 py-0.5 rounded-full"
                    style={{ background: stage.color, color: '#000' }}
                  >
                    сейчас
                  </div>
                )}

                {/* Mini character — size*1.9 = height, нет переполнения */}
                <div
                  className="flex items-end justify-center overflow-hidden w-full"
                  style={{
                    height: 120,
                    opacity: isUnlocked ? 1 : 0.35,
                    filter: isUnlocked ? `drop-shadow(0 2px 8px ${stage.color}66)` : 'none',
                  }}
                >
                  <CharacterSVG shape={stage.bodyShape} color={stage.color} size={63} />
                </div>

                <span className="font-bold text-white text-sm text-center">{stage.emoji} {stage.label}</span>
                <span className="text-xs text-white/40">Ур. {stage.level}</span>
                <span className="text-xs font-bold" style={{ color: isUnlocked ? stage.color : 'rgba(255,255,255,0.25)' }}>
                  {xpNeeded === 0 ? 'Старт' : `${xpNeeded} XP`}
                </span>

                {!isUnlocked && (
                  <span className="text-lg mt-1">🔒</span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
