import { colors, fonts } from "../tokens";

// Placeholder "before" photo: notebook with scribbles, crossed-out words and messy post-its.
// Replace with <Img src={staticFile("photos/...")} /> once real photos exist.
export const ChaosNotebook = () => (
  <svg viewBox="0 0 100 112" width="100%" height="100%" preserveAspectRatio="xMidYMid slice" style={{ display: "block" }}>
    <rect width="100" height="112" fill="#F4F1EA" />
    {Array.from({ length: 16 }, (_, i) => (
      <line key={i} x1="0" x2="100" y1={10 + i * 6.5} y2={10 + i * 6.5} stroke="#9FB3C8" strokeWidth="0.25" />
    ))}
    <line x1="12" x2="12" y1="0" y2="112" stroke="#C9A3A3" strokeWidth="0.3" />
    <g fill="none" stroke="#1f2937" strokeWidth="0.7" strokeLinecap="round">
      <path d="M18 18c6-4 10 4 16 0s8-3 12 1M20 24c10 2 18-3 26 1" />
      <path d="M17 17l30 8M17 25l30-8" strokeWidth="0.5" />
      <path d="M55 30c8-10 22-6 18 6s-20 8-16-2 16-10 24-2" />
      <path d="M20 46c3-6 9-6 10 0s-7 8-9 2" />
      <path d="M30 60c10 8 20-8 30 0s14 8 22-4" />
      <path d="M22 80l14-6M36 74l-2 4M36 74l-4-1" />
      <path d="M60 78c-4 6 4 12 10 8s2-12-6-10" />
      <path d="M18 96c8-3 16 3 24 0M50 98c6-6 14 2 22-2" />
      <path d="M48 96l24 4M48 100l24-4" strokeWidth="0.5" />
    </g>
    <text x="68" y="54" fontFamily={fonts.script} fontSize="9" fill="#1f2937" transform="rotate(-12 68 54)">???</text>
    <text x="22" y="40" fontFamily={fonts.script} fontSize="5" fill="#1f2937" transform="rotate(6 22 40)">¿app? ¿web?</text>
    <g>
      <rect x="62" y="6" width="22" height="20" fill="#e5e5e5" transform="rotate(14 73 16)" />
      <rect x="6" y="64" width="20" height="18" fill="#d4d4d4" transform="rotate(-18 16 73)" />
      <rect x="70" y="88" width="20" height="18" fill="#dcdcdc" transform="rotate(22 80 97)" />
    </g>
  </svg>
);

// Placeholder "after" photo: clean board with three ordered post-its.
export const ClearBoard = () => {
  const notes = [
    { label: "Idea", color: colors.mint },
    { label: "Plan", color: colors.softSky },
    { label: "Acción", color: "#99F6E4" },
  ];
  return (
    <svg viewBox="0 0 100 112" width="100%" height="100%" preserveAspectRatio="xMidYMid slice" style={{ display: "block" }}>
      <rect width="100" height="112" fill="#FFFFFF" />
      {Array.from({ length: 12 * 13 }, (_, i) => (
        <circle key={i} cx={4 + (i % 12) * 8.4} cy={4 + Math.floor(i / 12) * 8.6} r="0.35" fill="#CBD5E1" />
      ))}
      <text x="50" y="18" textAnchor="middle" fontFamily={fonts.sans} fontWeight={900} fontSize="6" fill={colors.navy}>MI PROYECTO</text>
      {notes.map((n, i) => (
        <g key={n.label} transform={`translate(${8 + i * 30} 34)`}>
          <rect width="24" height="24" fill={n.color} />
          <rect width="24" height="3" fill="rgba(15,23,42,0.06)" />
          <text x="12" y="15.5" textAnchor="middle" fontFamily={fonts.script} fontWeight={700} fontSize="7" fill={colors.navy}>{n.label}</text>
        </g>
      ))}
      <g fill="none" stroke={colors.navy} strokeWidth="0.7" strokeLinecap="round">
        <path d="M33 46h4M35 44.5l2 1.5-2 1.5M63 46h4M65 44.5l2 1.5-2 1.5" />
      </g>
      {[0, 1, 2].map((i) => (
        <g key={i} transform={`translate(14 ${70 + i * 10})`}>
          <rect width="4" height="4" rx="0.6" fill="none" stroke={colors.teal} strokeWidth="0.6" />
          <path d="M0.8 2l1.2 1.2 2.2-2.6" fill="none" stroke={colors.teal} strokeWidth="0.7" />
          <rect x="8" y="1.4" width={50 - i * 10} height="1.4" rx="0.7" fill="#CBD5E1" />
        </g>
      ))}
    </svg>
  );
};
