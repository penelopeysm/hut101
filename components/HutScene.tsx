// Line-art A-frame hut for the home page hero. Decorative only.
// The smoke puffs animate via .smoke-puff in globals.css.
export default function HutScene({ className = "" }: { className?: string }) {
    return (
        <svg viewBox="0 0 260 210" fill="none" className={className} aria-hidden="true">
            {/* Door fill, painted under the strokes */}
            <path
                d="M112 192 V160 a18 18 0 0 1 36 0 V192 Z"
                fill="var(--accent)"
                fillOpacity="0.18"
            />

            <g stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                {/* Ground */}
                <path d="M8 192 Q 130 184 252 192" />

                {/* A-frame and crossbeam */}
                <path d="M58 192 L130 40 L202 192" />
                <path d="M88 130 H172" />

                {/* Chimney (follows the right roof slope) */}
                <path d="M156 95 V62 H174 V132" />
                <path d="M153 62 H177" />

                {/* Round window */}
                <circle cx="130" cy="96" r="13" />
                <path d="M117 96 H143 M130 83 V109" />

                {/* Door */}
                <path d="M112 192 V160 a18 18 0 0 1 36 0 V192" />
                <circle cx="141" cy="172" r="1.5" fill="currentColor" />

                {/* "101" trail sign */}
                <path d="M34 192 V144" />
                <rect x="10" y="116" width="48" height="28" rx="5" />

                {/* Pine tree */}
                <path d="M236 192 v-12" />
                <path d="M224 180 L236 156 L248 180 Z" />
                <path d="M227 162 L236 144 L245 162 Z" />

                {/* Grass tufts */}
                <path d="M72 192 q3 -8 6 0" />
                <path d="M212 192 q3 -8 6 0" />
            </g>

            <text
                x="34"
                y="131"
                textAnchor="middle"
                dominantBaseline="middle"
                fontFamily="var(--font-mono)"
                fontWeight="700"
                fontSize="15"
                fill="currentColor"
            >
                101
            </text>

            {/* Smoke */}
            <g stroke="currentColor" strokeWidth="2.5" opacity="0.55">
                <circle className="smoke-puff" cx="167" cy="48" r="5" />
                <circle className="smoke-puff" style={{ animationDelay: "1.6s" }} cx="172" cy="36" r="7" />
                <circle className="smoke-puff" style={{ animationDelay: "3.2s" }} cx="180" cy="22" r="9" />
            </g>
        </svg>
    );
}
