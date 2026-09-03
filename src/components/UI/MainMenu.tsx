import { useGameStore, type Character } from '../../store/gameStore';
import { getStage } from '../../game/characterStages';
import { getLevelProgress, LEVEL_THRESHOLDS } from '../../game/xpSystem';

export function MainMenu() {
  const { characters, selectCharacter, goToCreate } = useGameStore();

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-slate-900 to-slate-800 p-6 gap-6">
      {/* Header */}
      <div className="text-center pt-4">
        <h1 className="text-5xl font-black text-white tracking-tight">FitPet</h1>
        <p className="text-white/50 mt-1 text-sm">Тренируйся — питомец растёт</p>
      </div>

      {/* Characters list */}
      <div className="flex-1 overflow-y-auto flex flex-col gap-3">
        {characters.length === 0 && (
          <div className="flex-1 flex flex-col items-center justify-center gap-3 text-white/30">
            <span className="text-6xl">👾</span>
            <p className="text-center text-sm">Создай первого персонажа<br />и начни тренироваться!</p>
          </div>
        )}
        {characters
          .slice()
          .sort((a, b) => b.xp - a.xp)
          .map((char) => (
            <CharacterCard key={char.id} char={char} onSelect={() => selectCharacter(char.id)} />
          ))}
      </div>

      {/* Create button */}
      <button
        onClick={goToCreate}
        className="w-full py-4 rounded-2xl font-bold text-lg text-white flex items-center justify-center gap-2 transition-all active:scale-95"
        style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
      >
        <span className="text-2xl">+</span>
        Создать персонажа
      </button>
    </div>
  );
}

function CharacterCard({ char, onSelect }: { char: Character; onSelect: () => void }) {
  const stage = getStage(char.level);
  const isMax = char.level >= 6;
  const nextThreshold = LEVEL_THRESHOLDS[char.level] ?? LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1];
  const progress = getLevelProgress(char.xp);

  return (
    <button
      onClick={onSelect}
      className="w-full flex items-center gap-4 p-4 rounded-2xl border text-left transition-all active:scale-98"
      style={{ background: `${stage.color}11`, borderColor: `${stage.color}44` }}
    >
      {/* Mini character preview */}
      <div
        className="w-16 h-16 rounded-xl flex items-center justify-center text-4xl flex-shrink-0"
        style={{ background: `${stage.color}22` }}
      >
        {stage.emoji}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <span className="font-bold text-white text-lg truncate">{char.name}</span>
          <span className="text-xs font-bold px-2 py-0.5 rounded-full ml-2 flex-shrink-0"
            style={{ background: `${stage.color}33`, color: stage.color }}>
            Ур. {char.level}
          </span>
        </div>
        <p className="text-xs text-white/50 mb-2">{stage.label} · {char.totalReps} повторений</p>
        {/* XP bar */}
        <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full"
            style={{
              width: `${(isMax ? 1 : progress) * 100}%`,
              background: stage.color,
            }}
          />
        </div>
        <div className="flex justify-between mt-0.5">
          <span className="text-xs text-white/30">{char.xp} XP</span>
          {!isMax && <span className="text-xs text-white/30">/{nextThreshold} XP</span>}
        </div>
      </div>

      {/* Arrow */}
      <span className="text-white/30 text-xl flex-shrink-0">›</span>
    </button>
  );
}
