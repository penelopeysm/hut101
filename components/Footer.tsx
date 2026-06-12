import Link from "next/link";
import HutIcon from "@/components/HutIcon";

export default function Footer() {
    return (
        <footer className="mt-20 border-t border-border">
            {/* Little mountain ridge sitting on the divider */}
            <div className="flex justify-center -mt-[11px]" aria-hidden="true">
                <svg
                    width="120"
                    height="22"
                    viewBox="0 0 120 22"
                    className="bg-background px-1 text-border"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <path d="M4 19 L30 6 L44 13 L62 3 L80 12 L94 7 L116 19" />
                </svg>
            </div>
            <div className="max-w-4xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-sm text-muted">
                <div className="flex items-center gap-2">
                    <HutIcon className="w-4 h-4 text-accent" />
                    <span className="font-serif text-base text-foreground">hut101</span>
                    <span aria-hidden="true">&middot;</span>
                    <span>open source for researchers, with a guide</span>
                </div>
                <div className="flex items-center gap-5">
                    <Link href="/projects" className="hover:text-accent transition-colors">
                        Projects
                    </Link>
                    <Link href="/about" className="hover:text-accent transition-colors">
                        About
                    </Link>
                    <Link href="/submit" className="hover:text-accent transition-colors">
                        Submit
                    </Link>
                </div>
            </div>
        </footer>
    );
}
