import { useEffect, useRef } from 'react';
import { useGameStore } from '../../store/gameStore';

function pluralDays(n: number): string {
  if (n % 10 === 1 && n % 100 !== 11) return 'день';
  if ([2, 3, 4].includes(n % 10) && ![12, 13, 14].includes(n % 100)) return 'дня';
  return 'дней';
}

export function DecayBanner() {
  const { decayInfo, clearDecayInfo } = useGameStore();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!decayInfo) return;
    timerRef.current = setTimeout(clearDecayInfo, 4500);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [decayInfo]);

  if (!decayInfo) return null;

  const { xpLost, daysMissed } = decayInfo;

  return (
    <div
      className="absolute top-4 left-1/2 z-50 pointer-events-none"
      style={{ transform: 'translateX(-50%)' }}
    >
      <div
        className="flex items-center gap-3 px-5 py-3 rounded-2xl"
        style={{
          background: '#1a1025',
          border: '1px solid rgba(167,85,247,0.4)',
          boxShadow: '0 4px 24px rgba(124,58,237,0.35)',
          whiteSpace: 'nowrap',
        }}
      >
        <span className="text-2xl">😿</span>
        <div>
          <div className="text-white font-bold text-sm">
            Питомец скучал {daysMissed} {pluralDays(daysMissed)}
          </div>
          <div className="text-purple-400 text-xs font-bold">−{xpLost} XP потеряно</div>
        </div>
      </div>
    </div>
  );
}
