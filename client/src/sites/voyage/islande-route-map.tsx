const points = [
  { code: "KEF", label: "Keflavík", x: 118, y: 238 },
  { code: "REK", label: "Reykjavík", x: 183, y: 217 },
  { code: "THI", label: "Þingvellir", x: 258, y: 176 },
  { code: "VIK", label: "Vík", x: 388, y: 258 },
  { code: "JOK", label: "Jökulsárlón", x: 566, y: 212 },
];

export function IslandeRouteMap() {
  return (
    <figure className="overflow-hidden rounded-xl border border-[#dfe4ea] bg-[#eef2f6]">
      <svg
        viewBox="0 0 700 360"
        role="img"
        aria-labelledby="islande-map-title islande-map-description"
        className="h-auto min-h-[20rem] w-full"
      >
        <title id="islande-map-title">Itinéraire schématique en Islande</title>
        <desc id="islande-map-description">
          Parcours indicatif de Keflavík à Jökulsárlón via Reykjavík, Þingvellir
          et Vík.
        </desc>

        <path
          d="M79 206 112 155 169 127 232 111 297 82 370 94 414 120 484 115 548 140 626 158 648 204 603 247 527 274 454 288 371 302 302 282 240 295 182 275 125 269Z"
          fill="#ffffff"
          stroke="#d2d9e2"
          strokeWidth="2"
        />
        <path
          d="M118 238 C151 230 164 225 183 217 S232 187 258 176 S332 214 388 258 S504 244 566 212"
          fill="none"
          stroke="#1c4ed8"
          strokeDasharray="9 10"
          strokeLinecap="round"
          strokeWidth="4"
        />

        {points.map((point, index) => (
          <g key={point.code}>
            <circle
              cx={point.x}
              cy={point.y}
              r="8"
              fill={index === 0 ? "#0f1b2b" : "#1c4ed8"}
              stroke="#ffffff"
              strokeWidth="4"
            />
            <text
              x={point.x}
              y={point.y - 19}
              textAnchor="middle"
              className="site-label fill-[#0f1b2b] text-[12px] font-semibold"
            >
              {point.code}
            </text>
            <text
              x={point.x}
              y={point.y + 28}
              textAnchor="middle"
              className="fill-[#6b7684] text-[11px]"
            >
              {point.label}
            </text>
          </g>
        ))}

        <g transform="translate(610 52)">
          <circle cx="0" cy="0" r="25" fill="#ffffff" stroke="#dfe4ea" />
          <path d="M0 -14 5 3 0 0 -5 3Z" fill="#0f1b2b" />
          <text
            x="0"
            y="17"
            textAnchor="middle"
            className="site-label fill-[#6b7684] text-[8px] font-semibold"
          >
            N
          </text>
        </g>
      </svg>
      <figcaption className="site-label border-t border-[#dfe4ea] bg-white px-5 py-4 text-[0.62rem] font-medium uppercase tracking-[0.1em] text-[#6b7684]">
        Repère de préparation — itinéraire indicatif, pas une trace GPX
        officielle.
      </figcaption>
    </figure>
  );
}
