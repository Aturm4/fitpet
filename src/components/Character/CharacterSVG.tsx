import { useRef } from 'react';

export type BodyShape = 'skinny' | 'fat' | 'chubby' | 'normal' | 'fit' | 'athletic' | 'champion';

interface Cfg {
  headR: number;
  shoulderW: number;
  waistW: number;
  belly: number;
  hipW: number;
  armW: number;
  legW: number;
  bodyH: number;
  muscle: number; // 0..1 — мышечная прорисовка
  round: boolean; // круглое лицо (полные типы)
}

const SHAPES: Record<BodyShape, Cfg> = {
  skinny:   { headR: 40, shoulderW: 44, waistW: 32, belly:  0, hipW: 38, armW: 11, legW: 15, bodyH: 100, muscle: 0.05, round: false },
  fat:      { headR: 50, shoulderW: 58, waistW: 68, belly: 20, hipW: 62, armW: 22, legW: 28, bodyH: 108, muscle: 0,    round: true  },
  chubby:   { headR: 46, shoulderW: 55, waistW: 56, belly:  8, hipW: 55, armW: 19, legW: 25, bodyH: 103, muscle: 0,    round: true  },
  normal:   { headR: 43, shoulderW: 53, waistW: 46, belly:  0, hipW: 50, armW: 16, legW: 22, bodyH: 103, muscle: 0.25, round: false },
  fit:      { headR: 41, shoulderW: 56, waistW: 40, belly:  0, hipW: 49, armW: 16, legW: 21, bodyH: 106, muscle: 0.55, round: false },
  athletic: { headR: 40, shoulderW: 64, waistW: 36, belly:  0, hipW: 49, armW: 21, legW: 21, bodyH: 110, muscle: 0.85, round: false },
  champion: { headR: 41, shoulderW: 68, waistW: 34, belly:  0, hipW: 51, armW: 23, legW: 22, bodyH: 112, muscle: 1,    round: false },
};

function bodyPath(cx: number, bodyTop: number, cfg: Cfg): string {
  const { shoulderW, waistW, belly, hipW, bodyH } = cfg;
  const neckW = 15;
  const bodyBot = bodyTop + bodyH;
  const mid = bodyTop + bodyH * 0.5;

  const lNeck = cx - neckW / 2;
  const rNeck = cx + neckW / 2;
  const lSho  = cx - shoulderW / 2;
  const rSho  = cx + shoulderW / 2;
  const lWaist = cx - waistW / 2 - belly;
  const rWaist = cx + waistW / 2 + belly;
  const lHip = cx - hipW / 2;
  const rHip = cx + hipW / 2;

  return [
    `M ${lNeck},${bodyTop}`,
    // плечо (трапеция → дельта)
    `C ${lNeck - 4},${bodyTop + 4} ${lSho + 4},${bodyTop + 6} ${lSho},${bodyTop + 16}`,
    `C ${lSho - 5},${bodyTop + 40} ${lWaist},${mid - 12} ${lWaist},${mid}`,
    `C ${lWaist},${mid + 18} ${lHip + 3},${bodyBot - 8} ${lHip},${bodyBot}`,
    `L ${rHip},${bodyBot}`,
    `C ${rHip - 3},${bodyBot - 8} ${rWaist},${mid + 18} ${rWaist},${mid}`,
    `C ${rWaist},${mid - 12} ${rSho + 5},${bodyTop + 40} ${rSho},${bodyTop + 16}`,
    `C ${rSho - 4},${bodyTop + 6} ${rNeck + 4},${bodyTop + 4} ${rNeck},${bodyTop} Z`,
  ].join(' ');
}

function shade(hex: string, amt: number): string {
  if (!hex.startsWith('#') || hex.length < 7) return hex;
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const f = (v: number) => amt >= 0
    ? Math.min(255, Math.round(v + (255 - v) * amt))
    : Math.max(0, Math.round(v * (1 + amt)));
  return `rgb(${f(r)},${f(g)},${f(b)})`;
}
const lighten = (h: string) => shade(h, 0.35);

let _counter = 0;

export function CharacterSVG({
  shape, color, size = 200,
}: {
  shape: BodyShape; color: string; size?: number;
}) {
  const uid = useRef(`ch${_counter++}`).current;
  const svgH = Math.round(size * 1.9);
  const cx = 100;
  const cfg = SHAPES[shape];

  const headY   = 54;
  const R       = cfg.headR;
  const topY    = headY - R;
  const chinY   = headY + R;
  const neckTop = chinY - 8;
  const neckBot = neckTop + 18;
  const bodyTop = neckBot;
  const bodyBot = bodyTop + cfg.bodyH;
  const legH    = 78;
  const legBot  = bodyBot + legH;

  // ширина лица
  const faceHalf = R * (cfg.round ? 0.92 : 0.80);
  const jawHalf  = R * (cfg.round ? 0.80 : 0.50);

  // тон кожи
  const SKIN   = '#eab989';
  const SKIND  = '#c98a55';
  const SKINDD = '#a86b3c';
  const LIP    = '#c06b5a';
  const HAIRD  = '#1a1009';

  // черты лица
  const eyeY  = headY - R * 0.06;
  const eyeDX = R * 0.34;
  const eyeRX = R * 0.20;
  const noseTipY = headY + R * 0.40;
  const lipY  = headY + R * 0.66;

  // выражение рта по стадии
  const smile = shape === 'fat' ? 1 : shape === 'chubby' ? 3
    : shape === 'normal' ? 5 : shape === 'fit' ? 7 : 9;

  const headPath = [
    `M ${cx},${topY}`,
    `C ${cx - faceHalf * 1.08},${topY + 2} ${cx - faceHalf},${headY - R * 0.42} ${cx - faceHalf},${headY - R * 0.05}`,
    `C ${cx - faceHalf},${headY + R * 0.30} ${cx - jawHalf},${headY + R * 0.72} ${cx},${chinY}`,
    `C ${cx + jawHalf},${headY + R * 0.72} ${cx + faceHalf},${headY + R * 0.30} ${cx + faceHalf},${headY - R * 0.05}`,
    `C ${cx + faceHalf},${headY - R * 0.42} ${cx + faceHalf * 1.08},${topY + 2} ${cx},${topY} Z`,
  ].join(' ');

  return (
    <svg width={size} height={svgH} viewBox="0 0 200 380" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        {/* кожа — объёмный градиент со светом сверху-слева */}
        <radialGradient id={`sk-${uid}`} cx="38%" cy="30%" r="75%">
          <stop offset="0%" stopColor="#f6d3aa" />
          <stop offset="55%" stopColor={SKIN} />
          <stop offset="100%" stopColor={SKIND} />
        </radialGradient>
        <radialGradient id={`sh-${uid}`} cx="35%" cy="22%" r="80%">
          <stop offset="0%" stopColor={lighten(color)} />
          <stop offset="100%" stopColor={color} />
        </radialGradient>
        <linearGradient id={`pt-${uid}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#3d5270" />
          <stop offset="50%" stopColor="#2e3d55" />
          <stop offset="100%" stopColor="#212e42" />
        </linearGradient>
        <radialGradient id={`hr-${uid}`} cx="40%" cy="20%" r="80%">
          <stop offset="0%" stopColor="#4a3220" />
          <stop offset="100%" stopColor={HAIRD} />
        </radialGradient>
        {/* мягкая тень-виньетка для лица */}
        <radialGradient id={`fsh-${uid}`} cx="50%" cy="42%" r="60%">
          <stop offset="60%" stopColor="rgba(0,0,0,0)" />
          <stop offset="100%" stopColor="rgba(120,70,35,0.32)" />
        </radialGradient>
      </defs>

      {/* Тень на полу */}
      <ellipse cx={cx} cy={374} rx={cfg.hipW * 0.9} ry={7} fill="rgba(0,0,0,0.18)" />

      {/* ── ОБУВЬ ── */}
      <g>
        <rect x={cx - cfg.legW * 1.28} y={legBot} width={cfg.legW * 1.18} height={14} rx={7} fill="#1c2a3f" />
        <ellipse cx={cx - cfg.legW * 0.55} cy={legBot + 14} rx={cfg.legW * 0.72} ry={12} fill="#1c2a3f" />
        <rect x={cx - cfg.legW * 1.3} y={legBot + 10} width={cfg.legW * 1.35} height={5} rx={2} fill="#0e1822" />
        <line x1={cx - cfg.legW} y1={legBot + 4} x2={cx - cfg.legW * 0.25} y2={legBot + 4} stroke="#fff" strokeWidth="1.5" opacity="0.4" />
        <line x1={cx - cfg.legW * 0.95} y1={legBot + 8} x2={cx - cfg.legW * 0.3} y2={legBot + 8} stroke="#fff" strokeWidth="1.5" opacity="0.22" />
        <rect x={cx + cfg.legW * 0.1} y={legBot} width={cfg.legW * 1.18} height={14} rx={7} fill="#1c2a3f" />
        <ellipse cx={cx + cfg.legW * 0.55} cy={legBot + 14} rx={cfg.legW * 0.72} ry={12} fill="#1c2a3f" />
        <rect x={cx - cfg.legW * 0.05} y={legBot + 10} width={cfg.legW * 1.35} height={5} rx={2} fill="#0e1822" />
        <line x1={cx + cfg.legW * 0.25} y1={legBot + 4} x2={cx + cfg.legW} y2={legBot + 4} stroke="#fff" strokeWidth="1.5" opacity="0.4" />
        <line x1={cx + cfg.legW * 0.3} y1={legBot + 8} x2={cx + cfg.legW * 0.95} y2={legBot + 8} stroke="#fff" strokeWidth="1.5" opacity="0.22" />
      </g>

      {/* ── НОГИ ── */}
      <path d={`M ${cx-cfg.legW-3},${bodyBot+4} C ${cx-cfg.legW-5},${bodyBot+legH*0.5} ${cx-cfg.legW*1.1},${legBot-6} ${cx-cfg.legW*1.08},${legBot+2} L ${cx-3},${legBot+2} C ${cx-4},${legBot-6} ${cx-4},${bodyBot+legH*0.5} ${cx-3},${bodyBot+4} Z`}
        fill={`url(#pt-${uid})`} />
      <path d={`M ${cx+3},${bodyBot+4} C ${cx+4},${bodyBot+legH*0.5} ${cx+4},${legBot-6} ${cx+3},${legBot+2} L ${cx+cfg.legW*1.08},${legBot+2} C ${cx+cfg.legW*1.1},${legBot-6} ${cx+cfg.legW+5},${bodyBot+legH*0.5} ${cx+cfg.legW+3},${bodyBot+4} Z`}
        fill={`url(#pt-${uid})`} />
      {/* блик и тень мышц ноги */}
      <line x1={cx-cfg.legW*0.45} y1={bodyBot+16} x2={cx-cfg.legW*0.55} y2={legBot-10} stroke="rgba(255,255,255,0.08)" strokeWidth="5" strokeLinecap="round" />
      <line x1={cx+cfg.legW*0.45} y1={bodyBot+16} x2={cx+cfg.legW*0.55} y2={legBot-10} stroke="rgba(255,255,255,0.08)" strokeWidth="5" strokeLinecap="round" />
      <line x1={cx-2} y1={bodyBot+10} x2={cx-2} y2={legBot-4} stroke="rgba(0,0,0,0.18)" strokeWidth="3" strokeLinecap="round" />
      <line x1={cx+2} y1={bodyBot+10} x2={cx+2} y2={legBot-4} stroke="rgba(0,0,0,0.18)" strokeWidth="3" strokeLinecap="round" />

      {/* ── РУКИ ── */}
      {/* левая: плечо → бицепс → предплечье */}
      <path d={`M ${cx-cfg.shoulderW/2+3},${bodyTop+12} C ${cx-cfg.shoulderW/2-cfg.armW+1},${bodyTop+12} ${cx-cfg.shoulderW/2-cfg.armW-4},${bodyTop+cfg.bodyH*0.46} ${cx-cfg.shoulderW/2-cfg.armW+1},${bodyTop+cfg.bodyH*0.5} C ${cx-cfg.shoulderW/2-cfg.armW-6},${bodyTop+cfg.bodyH*0.6} ${cx-cfg.shoulderW/2-cfg.armW-3},${bodyTop+cfg.bodyH*0.72} ${cx-cfg.shoulderW/2-cfg.armW/2-2},${bodyTop+cfg.bodyH*0.74} C ${cx-cfg.shoulderW/2-1},${bodyTop+cfg.bodyH*0.55} ${cx-cfg.shoulderW/2-1},${bodyTop+24} ${cx-cfg.shoulderW/2+3},${bodyTop+12} Z`}
        fill={`url(#sh-${uid})`} />
      <circle cx={cx-cfg.shoulderW/2-cfg.armW/2-1} cy={bodyTop+cfg.bodyH*0.74+11} r={cfg.armW/2+3} fill={`url(#sk-${uid})`} />
      {/* правая */}
      <path d={`M ${cx+cfg.shoulderW/2-3},${bodyTop+12} C ${cx+cfg.shoulderW/2+cfg.armW-1},${bodyTop+12} ${cx+cfg.shoulderW/2+cfg.armW+4},${bodyTop+cfg.bodyH*0.46} ${cx+cfg.shoulderW/2+cfg.armW-1},${bodyTop+cfg.bodyH*0.5} C ${cx+cfg.shoulderW/2+cfg.armW+6},${bodyTop+cfg.bodyH*0.6} ${cx+cfg.shoulderW/2+cfg.armW+3},${bodyTop+cfg.bodyH*0.72} ${cx+cfg.shoulderW/2+cfg.armW/2+2},${bodyTop+cfg.bodyH*0.74} C ${cx+cfg.shoulderW/2+1},${bodyTop+cfg.bodyH*0.55} ${cx+cfg.shoulderW/2+1},${bodyTop+24} ${cx+cfg.shoulderW/2-3},${bodyTop+12} Z`}
        fill={`url(#sh-${uid})`} />
      <circle cx={cx+cfg.shoulderW/2+cfg.armW/2+1} cy={bodyTop+cfg.bodyH*0.74+11} r={cfg.armW/2+3} fill={`url(#sk-${uid})`} />
      {/* прорисовка бицепса для мышц */}
      {cfg.muscle > 0.4 && (
        <>
          <ellipse cx={cx-cfg.shoulderW/2-cfg.armW/2} cy={bodyTop+cfg.bodyH*0.34} rx={cfg.armW*0.4} ry={cfg.bodyH*0.12} fill="rgba(255,255,255,0.12)" />
          <ellipse cx={cx+cfg.shoulderW/2+cfg.armW/2} cy={bodyTop+cfg.bodyH*0.34} rx={cfg.armW*0.4} ry={cfg.bodyH*0.12} fill="rgba(255,255,255,0.12)" />
        </>
      )}

      {/* ── ТЕЛО / ФУТБОЛКА ── */}
      <path d={bodyPath(cx, bodyTop, cfg)} fill={`url(#sh-${uid})`} />
      {/* боковые тени для объёма */}
      <path d={`M ${cx-cfg.shoulderW/2+6},${bodyTop+18} C ${cx-cfg.waistW/2-cfg.belly},${bodyTop+cfg.bodyH*0.5} ${cx-cfg.hipW/2+5},${bodyBot-12} ${cx-cfg.hipW/2+8},${bodyBot-4}`}
        stroke="rgba(0,0,0,0.13)" strokeWidth="7" fill="none" strokeLinecap="round" />
      <path d={`M ${cx+cfg.shoulderW/2-6},${bodyTop+18} C ${cx+cfg.waistW/2+cfg.belly},${bodyTop+cfg.bodyH*0.5} ${cx+cfg.hipW/2-5},${bodyBot-12} ${cx+cfg.hipW/2-8},${bodyBot-4}`}
        stroke="rgba(0,0,0,0.13)" strokeWidth="7" fill="none" strokeLinecap="round" />
      {/* блик на груди */}
      <path d={`M ${cx-cfg.shoulderW/2+12},${bodyTop+22} Q ${cx-cfg.shoulderW/2+18},${bodyTop+52} ${cx-10},${bodyTop+72}`}
        stroke="rgba(255,255,255,0.16)" strokeWidth="6" strokeLinecap="round" fill="none" />
      {/* грудные мышцы (футболка обтягивает) */}
      {cfg.muscle > 0.4 && (
        <>
          <path d={`M ${cx},${bodyTop+20} Q ${cx-cfg.shoulderW*0.28},${bodyTop+26} ${cx-cfg.shoulderW*0.30},${bodyTop+44} Q ${cx-cfg.shoulderW*0.18},${bodyTop+52} ${cx},${bodyTop+48}`}
            stroke="rgba(0,0,0,0.14)" strokeWidth="2.5" fill="rgba(255,255,255,0.05)" />
          <path d={`M ${cx},${bodyTop+20} Q ${cx+cfg.shoulderW*0.28},${bodyTop+26} ${cx+cfg.shoulderW*0.30},${bodyTop+44} Q ${cx+cfg.shoulderW*0.18},${bodyTop+52} ${cx},${bodyTop+48}`}
            stroke="rgba(0,0,0,0.14)" strokeWidth="2.5" fill="rgba(255,255,255,0.05)" />
        </>
      )}
      {/* V-вырез */}
      <path d={`M ${cx-12},${bodyTop+2} L ${cx},${bodyTop+20} L ${cx+12},${bodyTop+2}`}
        stroke={SKIND} strokeWidth="1.5" fill="none" opacity="0.35" />

      {/* Кубики пресса */}
      {(shape === 'athletic' || shape === 'champion') && (
        <>
          {[0, 1, 2].flatMap((row) =>
            [-12, 12].map((dx) => (
              <ellipse key={`${row}${dx}`} cx={cx + dx} cy={bodyTop + 56 + row * 18}
                rx={8} ry={8.5} fill="rgba(255,255,255,0.07)" stroke="rgba(0,0,0,0.16)" strokeWidth="1.4" />
            ))
          )}
          <line x1={cx} y1={bodyTop + 50} x2={cx} y2={bodyBot - 14}
            stroke="rgba(0,0,0,0.2)" strokeWidth="2" strokeLinecap="round" />
        </>
      )}

      {/* Ремень */}
      <rect x={cx-cfg.hipW/2-2} y={bodyBot-10} width={cfg.hipW+4} height={12} rx={5} fill="#19253b" />
      <rect x={cx-8} y={bodyBot-12} width={16} height={16} rx={3} fill="#b8900e" />
      <rect x={cx-5} y={bodyBot-9} width={10} height={10} rx={2} fill="#f0c030" />
      <circle cx={cx} cy={bodyBot-4} r={2.5} fill="#b8900e" />

      {/* ── ШЕЯ ── */}
      <path d={`M ${cx-9},${neckTop} C ${cx-11},${neckBot-2} ${cx-13},${neckBot} ${cx-16},${neckBot+2} L ${cx+16},${neckBot+2} C ${cx+13},${neckBot} ${cx+11},${neckBot-2} ${cx+9},${neckTop} Z`}
        fill={`url(#sk-${uid})`} />
      {/* тень под подбородком */}
      <path d={`M ${cx-12},${neckTop+1} Q ${cx},${neckTop+7} ${cx+12},${neckTop+1}`}
        stroke="rgba(120,70,35,0.4)" strokeWidth="4" fill="none" strokeLinecap="round" />

      {/* ── ВОЛОСЫ (задний слой) ── */}
      <Hair shape={shape} cx={cx} headY={headY} R={R} faceHalf={faceHalf} uid={uid} layer="back" />

      {/* ── ГОЛОВА ── */}
      <path d={headPath} fill={`url(#sk-${uid})`} />
      {/* теневая лепка скул и челюсти */}
      <path d={headPath} fill={`url(#fsh-${uid})`} />
      <path d={`M ${cx-faceHalf*0.78},${headY+R*0.12} Q ${cx-faceHalf*0.5},${headY+R*0.5} ${cx-jawHalf*0.7},${headY+R*0.62}`}
        stroke={SKINDD} strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.3" />
      <path d={`M ${cx+faceHalf*0.78},${headY+R*0.12} Q ${cx+faceHalf*0.5},${headY+R*0.5} ${cx+jawHalf*0.7},${headY+R*0.62}`}
        stroke={SKINDD} strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.3" />
      {/* блик на лбу */}
      <ellipse cx={cx-R*0.2} cy={headY-R*0.42} rx={R*0.3} ry={R*0.16} fill="rgba(255,255,255,0.18)" />

      {/* ── УШИ ── */}
      <ellipse cx={cx-faceHalf+1} cy={headY+R*0.08} rx={6} ry={9} fill={`url(#sk-${uid})`} stroke={SKIND} strokeWidth="0.8" />
      <ellipse cx={cx+faceHalf-1} cy={headY+R*0.08} rx={6} ry={9} fill={`url(#sk-${uid})`} stroke={SKIND} strokeWidth="0.8" />
      <path d={`M ${cx-faceHalf-1},${headY+R*0.02} q 4,3 1,10`} stroke={SKINDD} strokeWidth="1.2" fill="none" opacity="0.5" />
      <path d={`M ${cx+faceHalf+1},${headY+R*0.02} q -4,3 -1,10`} stroke={SKINDD} strokeWidth="1.2" fill="none" opacity="0.5" />

      {/* ── БРОВИ ── */}
      <path d={`M ${cx-eyeDX-eyeRX} ${eyeY-eyeRX-5} Q ${cx-eyeDX} ${cfg.round ? eyeY-eyeRX-3 : eyeY-eyeRX-9} ${cx-eyeDX+eyeRX} ${eyeY-eyeRX-4}`}
        stroke="#2e1c0c" strokeWidth="3" strokeLinecap="round" fill="none" />
      <path d={`M ${cx+eyeDX-eyeRX} ${eyeY-eyeRX-4} Q ${cx+eyeDX} ${cfg.round ? eyeY-eyeRX-3 : eyeY-eyeRX-9} ${cx+eyeDX+eyeRX} ${eyeY-eyeRX-5}`}
        stroke="#2e1c0c" strokeWidth="3" strokeLinecap="round" fill="none" />

      {/* ── ГЛАЗА (миндалевидные) ── */}
      <Eye cx={cx-eyeDX} cy={eyeY} rx={eyeRX} ry={eyeRX*0.66} />
      <Eye cx={cx+eyeDX} cy={eyeY} rx={eyeRX} ry={eyeRX*0.66} />

      {/* ── НОС ── */}
      <path d={`M ${cx-1.5},${eyeY+4} L ${cx-2.5},${noseTipY-3}`}
        stroke={SKINDD} strokeWidth="1.4" fill="none" strokeLinecap="round" opacity="0.35" />
      <path d={`M ${cx-5},${noseTipY-2} Q ${cx},${noseTipY+4} ${cx+5},${noseTipY-2}`}
        stroke={SKINDD} strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.6" />
      <ellipse cx={cx-3.5} cy={noseTipY-1} rx={1.3} ry={1} fill={SKINDD} opacity="0.6" />
      <ellipse cx={cx+3.5} cy={noseTipY-1} rx={1.3} ry={1} fill={SKINDD} opacity="0.6" />
      <ellipse cx={cx+2} cy={noseTipY-4} rx={2} ry={2.5} fill="rgba(255,255,255,0.18)" />

      {/* ── ГУБЫ ── */}
      <Lips cx={cx} y={lipY} smile={smile} lip={LIP} />

      {/* ── РУМЯНЕЦ ── */}
      {(shape === 'fat' || shape === 'chubby' || shape === 'champion' || shape === 'athletic') && (
        <>
          <ellipse cx={cx - faceHalf * 0.55} cy={headY + R * 0.28} rx={R * 0.17} ry={R * 0.12} fill="#ff6060" opacity="0.18" />
          <ellipse cx={cx + faceHalf * 0.55} cy={headY + R * 0.28} rx={R * 0.17} ry={R * 0.12} fill="#ff6060" opacity="0.18" />
        </>
      )}

      {/* ── ВОЛОСЫ (передний слой / чёлка) ── */}
      <Hair shape={shape} cx={cx} headY={headY} R={R} faceHalf={faceHalf} uid={uid} layer="front" />

      {/* ── КОРОНА ── */}
      {shape === 'champion' && (
        <g transform={`translate(${cx-36}, ${topY-26})`}>
          <path d="M 0,32 L 10,6 L 26,22 L 36,0 L 46,22 L 62,6 L 72,32 Z"
            fill="#f0b800" stroke="#c88800" strokeWidth="2" strokeLinejoin="round" />
          <circle cx={36} cy={10} r={5.5} fill="#ef4444" />
          <circle cx={11} cy={18} r={4} fill="#22c55e" />
          <circle cx={61} cy={18} r={4} fill="#22c55e" />
          <path d="M 18,32 L 36,32 L 54,32" stroke="#c88800" strokeWidth="1.5" />
          <path d="M 36,6 L 39,11 L 36,9 L 33,11 Z" fill="rgba(255,255,255,0.55)" />
        </g>
      )}
    </svg>
  );
}

function Eye({ cx, cy, rx, ry }: { cx: number; cy: number; rx: number; ry: number }) {
  const irisR = ry * 1.05;
  return (
    <g>
      {/* белок (миндаль) */}
      <path d={`M ${cx-rx},${cy} Q ${cx},${cy-ry} ${cx+rx},${cy} Q ${cx},${cy+ry*0.95} ${cx-rx},${cy} Z`} fill="#fbfbf7" />
      {/* радужка */}
      <clipPath id={`eye${cx.toFixed(0)}-${cy.toFixed(0)}`}>
        <path d={`M ${cx-rx},${cy} Q ${cx},${cy-ry} ${cx+rx},${cy} Q ${cx},${cy+ry*0.95} ${cx-rx},${cy} Z`} />
      </clipPath>
      <g clipPath={`url(#eye${cx.toFixed(0)}-${cy.toFixed(0)})`}>
        <circle cx={cx} cy={cy} r={irisR} fill="#6b4a2a" />
        <circle cx={cx} cy={cy} r={irisR} fill="none" stroke="#3a2410" strokeWidth="0.8" />
        <circle cx={cx} cy={cy} r={irisR*0.5} fill="#161009" />
        <circle cx={cx-irisR*0.3} cy={cy-irisR*0.35} r={irisR*0.25} fill="#fff" opacity="0.9" />
      </g>
      {/* верхнее веко */}
      <path d={`M ${cx-rx},${cy} Q ${cx},${cy-ry*1.15} ${cx+rx},${cy}`} stroke="#2a1c10" strokeWidth="2" fill="none" strokeLinecap="round" />
      {/* нижнее веко (мягкое) */}
      <path d={`M ${cx-rx*0.85},${cy+ry*0.4} Q ${cx},${cy+ry*1.1} ${cx+rx*0.85},${cy+ry*0.4}`} stroke="#c98a55" strokeWidth="1" fill="none" opacity="0.5" />
    </g>
  );
}

function Lips({ cx, y, smile, lip }: { cx: number; y: number; smile: number; lip: string }) {
  const w = 11;
  // smile: насколько уголки/нижняя губа изгибаются вверх
  const cMy = y + 5 - smile * 0.3;       // глубина нижней губы
  const corner = y - smile * 0.35;        // подъём уголков
  return (
    <g>
      {/* нижняя губа (полная) */}
      <path d={`M ${cx-w},${y} Q ${cx},${cMy} ${cx+w},${y} Q ${cx},${corner+2} ${cx-w},${y} Z`} fill={lip} opacity="0.92" />
      {/* верхняя губа (лук Купидона) */}
      <path d={`M ${cx-w},${y} Q ${cx-w*0.45},${corner-3} ${cx-2},${corner-1} Q ${cx},${corner+1.5} ${cx+2},${corner-1} Q ${cx+w*0.45},${corner-3} ${cx+w},${y}`}
        fill={lip} opacity="0.78" />
      {/* линия рта */}
      <path d={`M ${cx-w},${y} Q ${cx},${corner+1} ${cx+w},${y}`} stroke="#8a3b30" strokeWidth="1.3" fill="none" strokeLinecap="round" />
      {/* блик на нижней губе */}
      <path d={`M ${cx-w*0.5},${y+1.5} Q ${cx},${cMy-1} ${cx+w*0.5},${y+1.5}`} stroke="rgba(255,255,255,0.3)" strokeWidth="1.2" fill="none" strokeLinecap="round" />
    </g>
  );
}

function Hair({ shape, cx, headY, R, faceHalf, uid, layer }: {
  shape: BodyShape; cx: number; headY: number; R: number; faceHalf: number; uid: string; layer: 'back' | 'front';
}) {
  const top = headY - R;
  const hl = headY - R * 0.42; // линия волос на лбу

  if (layer === 'back') {
    // объём черепа/волос за головой
    return (
      <path d={`M ${cx-faceHalf-2},${headY-R*0.05} C ${cx-faceHalf-5},${top-4} ${cx-faceHalf*0.4},${top-12} ${cx},${top-10} C ${cx+faceHalf*0.4},${top-12} ${cx+faceHalf+5},${top-4} ${cx+faceHalf+2},${headY-R*0.05} L ${cx+faceHalf},${hl} Q ${cx},${top+2} ${cx-faceHalf},${hl} Z`}
        fill={`url(#hr-${uid})`} />
    );
  }

  // передний слой — чёлка/укладка по типу
  if (shape === 'champion') {
    return (
      <g>
        <path d={`M ${cx-faceHalf},${hl+4} C ${cx-faceHalf+2},${top+4} ${cx-6},${top-4} ${cx},${top-2} C ${cx+6},${top-4} ${cx+faceHalf-2},${top+4} ${cx+faceHalf},${hl+4} C ${cx+faceHalf-6},${hl-4} ${cx+8},${hl-8} ${cx+2},${hl-2} C ${cx-6},${hl-7} ${cx-faceHalf+8},${hl-3} ${cx-faceHalf},${hl+4} Z`}
          fill={`url(#hr-${uid})`} />
        <path d={`M ${cx-faceHalf+6},${hl} Q ${cx-4},${top-2} ${cx+faceHalf*0.6},${hl-2}`} stroke="#5a3c22" strokeWidth="2.5" fill="none" strokeLinecap="round" opacity="0.7" />
        <path d={`M ${cx-faceHalf+10},${hl+3} Q ${cx},${top+2} ${cx+faceHalf*0.5},${hl+1}`} stroke="#3a2410" strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.6" />
      </g>
    );
  }
  if (shape === 'fat' || shape === 'chubby') {
    return (
      <path d={`M ${cx-faceHalf},${hl+6} C ${cx-faceHalf+2},${top+8} ${cx-8},${top+2} ${cx},${top+1} C ${cx+8},${top+2} ${cx+faceHalf-2},${top+8} ${cx+faceHalf},${hl+6} C ${cx+faceHalf-8},${hl} ${cx+6},${hl+2} ${cx},${hl+5} C ${cx-6},${hl+2} ${cx-faceHalf+8},${hl} ${cx-faceHalf},${hl+6} Z`}
        fill={`url(#hr-${uid})`} />
    );
  }
  // skinny / normal / fit — короткая аккуратная укладка
  return (
    <g>
      <path d={`M ${cx-faceHalf},${hl+5} C ${cx-faceHalf+2},${top+5} ${cx-6},${top-2} ${cx},${top} C ${cx+6},${top-2} ${cx+faceHalf-2},${top+5} ${cx+faceHalf},${hl+5} C ${cx+faceHalf-7},${hl-2} ${cx+10},${hl-5} ${cx+3},${hl+1} C ${cx-5},${hl-4} ${cx-faceHalf+9},${hl-1} ${cx-faceHalf},${hl+5} Z`}
        fill={`url(#hr-${uid})`} />
      <path d={`M ${cx-faceHalf+7},${hl+1} Q ${cx-4},${top+1} ${cx+faceHalf*0.55},${hl-1}`} stroke="#4a3220" strokeWidth="1.8" fill="none" strokeLinecap="round" opacity="0.6" />
    </g>
  );
}
