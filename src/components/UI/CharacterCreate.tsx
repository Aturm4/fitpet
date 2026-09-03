import { useState } from 'react';
import { useGameStore } from '../../store/gameStore';
import type { CharacterType } from '../../game/characterStages';
import { CharacterSVG } from '../Character/CharacterSVG';

const TYPES: { id: CharacterType; emoji: string; label: string; desc: string }[] = [
  { id: 'fat',    emoji: '😴', label: 'Толстяк',  desc: 'Люблю поесть и полежать' },
  { id: 'skinny', emoji: '🥢', label: 'Дрыщ',     desc: 'Нужно срочно накачаться' },
];

export function CharacterCreate() {
  const { createCharacter, goToMenu } = useGameStore();
  const [name, setName] = useState('');
  const [type, setType] = useState<CharacterType | null>(null);

  const canCreate = name.trim().length > 0 && type !== null;

  function handleCreate() {
    if (!canCreate) return;
    createCharacter(name.trim(), type!);
  }

  return (
    <div
      className="w-full h-full overflow-y-auto"
      style={{ background: 'linear-gradient(to bottom, #0f172a, #1e293b)' }}
    >
      <div className="flex flex-col gap-5 p-6 pb-10 min-h-full">
        {/* Back */}
        <button
          onClick={goToMenu}
          className="self-start flex items-center gap-1 text-sm font-medium px-3 py-1.5 rounded-xl"
          style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.6)' }}
        >
          ← Назад
        </button>

        <div className="text-center">
          <h2 className="text-3xl font-black text-white">Новый персонаж</h2>
          <p className="text-white/40 text-sm mt-1">С чего начнём?</p>
        </div>

        {/* Type selection */}
        <div className="flex gap-3">
          {TYPES.map((t) => {
            const active = type === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setType(t.id)}
                className="flex-1 flex flex-col items-center gap-2 py-4 rounded-2xl transition-all active:scale-95"
                style={{
                  border: `2px solid ${active ? '#6366f1' : 'rgba(255,255,255,0.1)'}`,
                  background: active ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.05)',
                }}
              >
                <CharacterSVG
                  shape={t.id === 'fat' ? 'fat' : 'skinny'}
                  color={active ? '#6366f1' : '#64748b'}
                  size={70}
                />
                <span className="text-white font-bold text-sm">{t.label}</span>
                <span className="text-white/40 text-xs text-center px-1">{t.desc}</span>
              </button>
            );
          })}
        </div>

        {/* Name input */}
        <div className="flex flex-col gap-2">
          <label className="text-white/60 text-sm font-medium">Имя персонажа</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
            placeholder="Введи имя..."
            maxLength={20}
            className="w-full px-4 py-3 rounded-xl text-white text-lg font-medium outline-none"
            style={{
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.15)',
            }}
            onFocus={(e) => (e.currentTarget.style.borderColor = 'rgba(99,102,241,0.8)')}
            onBlur={(e) => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)')}
          />
        </div>

        {/* Hint */}
        {!canCreate && (
          <p className="text-white/25 text-xs text-center">
            {!type ? 'Выбери тип персонажа' : 'Введи имя'}
          </p>
        )}

        {/* Create button */}
        <button
          onClick={handleCreate}
          className="w-full py-4 rounded-2xl font-bold text-lg text-white transition-all active:scale-95"
          style={{
            background: canCreate
              ? 'linear-gradient(135deg, #6366f1, #8b5cf6)'
              : 'rgba(255,255,255,0.08)',
            color: canCreate ? '#fff' : 'rgba(255,255,255,0.25)',
            boxShadow: canCreate ? '0 4px 20px rgba(99,102,241,0.4)' : 'none',
            cursor: canCreate ? 'pointer' : 'default',
          }}
        >
          Создать 💪
        </button>
      </div>
    </div>
  );
}
