// Small A-frame hut, used in the wordmark and footer.
export default function HutIcon({ className = "" }: { className?: string }) {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
            aria-hidden="true"
        >
            <path d="M2.5 20.5h19" />
            <path d="M4.5 20.5 12 4l7.5 16.5" />
            <path d="M9.5 20.5v-4.5a2.5 2.5 0 0 1 5 0v4.5" />
        </svg>
    );
}
