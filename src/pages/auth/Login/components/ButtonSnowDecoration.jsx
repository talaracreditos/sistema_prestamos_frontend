import React from 'react';

/* ============================================================
   SUBCOMPONENTE: Copo de nieve animado
   Evita repetir el mismo bloque <circle><animate/></circle> x14
============================================================ */
const Snowflake = ({ cx, cy, r, dur, begin, driftTo }) => (
  <circle cx={cx} cy={cy} r={r}>
    <animate
      attributeName="cy"
      values={`${cy};105`}
      dur={dur}
      begin={begin}
      repeatCount="indefinite"
    />
    {driftTo && (
      <animate
        attributeName="cx"
        values={`${cx};${driftTo[0]};${driftTo[1]}`}
        dur={dur}
        repeatCount="indefinite"
      />
    )}
  </circle>
);

const BIG_SNOWFLAKES = [
  { cx: 12, cy: -8, r: 2, dur: '2.8s', begin: '0s', driftTo: [20, 10] },
  { cx: 40, cy: -15, r: 1.4, dur: '3.7s', begin: '0.6s' },
  { cx: 67, cy: -5, r: 2.5, dur: '2.5s', begin: '1.2s', driftTo: [60, 72] },
  { cx: 94, cy: -20, r: 1.5, dur: '3.3s', begin: '0.2s' },
  { cx: 120, cy: -8, r: 2, dur: '2.9s', begin: '1.6s', driftTo: [128, 116] },
  { cx: 148, cy: -18, r: 1.5, dur: '3.9s', begin: '0.4s' },
  { cx: 175, cy: -5, r: 2.5, dur: '2.6s', begin: '1.4s', driftTo: [168, 180] },
  { cx: 203, cy: -22, r: 1.4, dur: '3.5s', begin: '0.7s' },
  { cx: 230, cy: -7, r: 2, dur: '2.7s', begin: '1.8s', driftTo: [238, 226] },
  { cx: 258, cy: -17, r: 1.5, dur: '3.6s', begin: '0.3s' },
  { cx: 292, cy: -6, r: 2.4, dur: '2.5s', begin: '1s', driftTo: [286, 296] },
  { cx: 320, cy: -18, r: 1.5, dur: '3.4s', begin: '0.5s' },
  { cx: 350, cy: -7, r: 2, dur: '2.8s', begin: '1.5s' },
  { cx: 382, cy: -20, r: 1.6, dur: '3.8s', begin: '0.1s' }
];

const SMALL_SNOWFLAKES = [
  { cx: 25, cy: -5, r: 1, dur: '2.1s', begin: '0.3s' },
  { cx: 85, cy: -10, r: 1, dur: '2.8s', begin: '1.2s' },
  { cx: 135, cy: -3, r: 1.1, dur: '2.3s', begin: '0.8s' },
  { cx: 190, cy: -12, r: 1, dur: '3s', begin: '1.5s' },
  { cx: 245, cy: -5, r: 1.1, dur: '2.4s', begin: '0.4s' },
  { cx: 280, cy: -15, r: 1, dur: '3.2s', begin: '1.1s' },
  { cx: 335, cy: -8, r: 1, dur: '2.6s', begin: '0.7s' },
  { cx: 370, cy: -2, r: 1.1, dur: '2.2s', begin: '1.7s' }
];

/* ============================================================
   SUBCOMPONENTE: Árbol de navidad con luces y nieve
============================================================ */
const ChristmasTree = () => (
  <g transform="translate(365,20) scale(0.80)">
    {/* Estrella */}
    <path
      d="M8 0 L10 5 L16 5 L11 9 L13 15 L8 11 L3 15 L5 9 L0 5 L6 5 Z"
      fill="#facc15"
    />
    {/* Árbol */}
    <path
      d="M8 12 L-5 31 L1 31 L-10 47 L-3 47 L-15 65 L31 65 L19 47 L26 47 L15 31 L21 31 Z"
      fill="#166534"
    />
    {/* Sombra */}
    <path
      d="M8 18 L1 31 L5 31 L-3 47 L3 47 L-7 63 L31 63 L22 48 L26 48 L16 32 L20 32 Z"
      fill="#14532d"
      opacity="0.45"
    />
    {/* Nieve sobre el árbol */}
    <path
      d="M-4 30 Q1 27 5 30 Q9 33 13 30 L11 34 Q7 36 4 33 Q0 32 -4 30 Z
         M-9 47 Q-3 44 3 47 Q9 50 16 47 L19 51 Q12 54 6 51 Q0 49 -6 51 Z
         M-14 64 Q-6 60 2 63 Q11 66 21 63 L26 66 L-14 66 Z"
      fill="#ffffff"
      opacity="0.95"
    />
    {/* Tronco */}
    <rect x="4" y="65" width="8" height="9" rx="1" fill="#78350f" />
    {/* Luces */}
    <circle cx="8" cy="24" r="2.2" fill="#facc15" />
    <circle cx="1" cy="38" r="2.2" fill="#dc2626" />
    <circle cx="16" cy="42" r="2.2" fill="#facc15" />
    <circle cx="-2" cy="54" r="2.2" fill="#fbbf24" />
    <circle cx="21" cy="56" r="2.2" fill="#ef4444" />
  </g>
);

/* ============================================================
   SUBCOMPONENTE: Decoración navideña completa del botón
   (nieve cayendo + nieve acumulada + arbolito)
============================================================ */
const ButtonSnowDecoration = () => (
  <svg
    viewBox="0 0 400 96"
    preserveAspectRatio="none"
    className="absolute inset-0 w-full h-full pointer-events-none"
    aria-hidden="true"
  >
    <defs>
      <linearGradient id="snowGradButton" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#ffffff" />
        <stop offset="100%" stopColor="#e2e8f0" />
      </linearGradient>
      <filter id="snowShadow">
        <feDropShadow dx="0" dy="1" stdDeviation="1" floodColor="#64748b" floodOpacity="0.35" />
      </filter>
    </defs>

    {/* Nieve cayendo */}
    <g fill="#ffffff" filter="url(#snowShadow)">
      {BIG_SNOWFLAKES.map((flake, i) => (
        <Snowflake key={`big-${i}`} {...flake} />
      ))}
    </g>

    <g fill="#ffffff" opacity="0.75">
      {SMALL_SNOWFLAKES.map((flake, i) => (
        <Snowflake key={`small-${i}`} {...flake} />
      ))}
    </g>

    {/* Nieve acumulada — capa 1 */}
    <path
      d="M0 96 L0 78 C18 74 30 79 45 76 C62 72 73 78 89 75 C105 72 118 78 134 75
         C151 71 165 78 181 74 C198 70 213 77 230 73 C247 69 260 76 277 72
         C294 68 307 76 323 72 C341 67 355 75 371 70 C382 67 392 70 400 68 L400 96 Z"
      fill="url(#snowGradButton)"
    />
    {/* Nieve acumulada — capa 2 */}
    <path
      d="M0 96 L0 88 C20 84 35 89 52 86 C72 82 85 88 103 85 C123 81 139 88 157 84
         C176 80 190 87 209 83 C228 79 244 86 263 82 C282 78 299 85 318 81
         C337 77 351 84 370 79 C383 76 392 80 400 77 L400 96 Z"
      fill="#ffffff"
      opacity="0.98"
    />

    <ChristmasTree />
  </svg>
);

export default ButtonSnowDecoration;