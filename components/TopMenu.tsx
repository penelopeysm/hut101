"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { signIn, signOut } from "next-auth/react";
import HutIcon from "@/components/HutIcon";
import { buttonSmallClass } from "@/lib/styles";

interface TopMenuUser {
    id: bigint;
    githubPicture: string;
    githubUsername: string;
    role: string;
}

interface TopMenuProps {
    user: TopMenuUser | null;
}

export default function TopMenu({ user }: TopMenuProps) {
    const [menuOpen, setMenuOpen] = useState(false);
    const pathname = usePathname();

    const isActive = (href: string) =>
        pathname === href || pathname.startsWith(`${href}/`);

    const linkClass = (href: string, block = false) =>
        `${block ? "block " : ""}transition-colors ${
            isActive(href)
                ? "text-foreground underline decoration-accent decoration-2 underline-offset-[6px]"
                : "text-muted hover:text-foreground"
        }`;

    return (
        <nav className="sticky top-0 z-40 bg-background/85 backdrop-blur-sm border-b border-border">
            <div className="flex justify-between items-center px-4 sm:px-6 h-14">
                <div className="flex items-center gap-4 sm:gap-6">
                    <Link href="/" className="flex items-center gap-1.5 font-serif font-semibold text-xl tracking-tight">
                        <HutIcon className="w-5 h-5 text-accent" />
                        hut101
                    </Link>
                    <div className="hidden sm:flex gap-4 text-sm">
                        <Link href="/projects" className={linkClass("/projects")}>
                            Projects
                        </Link>
                        <Link href="/about" className={linkClass("/about")}>
                            About
                        </Link>
                    </div>
                </div>

                <div className="flex items-center gap-3 sm:gap-4 text-sm">
                    {/* Desktop links */}
                    {user ? (
                        <div className="hidden sm:flex items-center gap-4">
                            <Link href="/submit" className={linkClass("/submit")}>
                                Submit a Project
                            </Link>
                            {user.role === "ADMIN" && (
                                <Link href="/admin" className={linkClass("/admin")}>
                                    Admin
                                </Link>
                            )}
                            <Link href={`/users/${user.id}`} className={linkClass(`/users/${user.id}`)}>
                                My Profile
                            </Link>
                            <button onClick={() => signOut()} className="cursor-pointer text-muted hover:text-foreground transition-colors">
                                Logout
                            </button>
                            <Link href={`/users/${user.id}`}>
                                <Image
                                    src={user.githubPicture}
                                    alt={`${user.githubUsername}'s avatar`}
                                    width={28}
                                    height={28}
                                    className="rounded-full ring-2 ring-border"
                                />
                            </Link>
                        </div>
                    ) : (
                        <button
                            onClick={() => signIn("github")}
                            className={`hidden sm:inline ${buttonSmallClass}`}
                        >
                            Login with GitHub
                        </button>
                    )}

                    {/* Hamburger button (mobile only) */}
                    <button
                        onClick={() => setMenuOpen(!menuOpen)}
                        className="sm:hidden cursor-pointer p-1 text-muted hover:text-foreground transition-colors"
                        aria-label="Toggle menu"
                    >
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                            {menuOpen ? (
                                <>
                                    <line x1="4" y1="4" x2="16" y2="16" />
                                    <line x1="16" y1="4" x2="4" y2="16" />
                                </>
                            ) : (
                                <>
                                    <line x1="3" y1="5" x2="17" y2="5" />
                                    <line x1="3" y1="10" x2="17" y2="10" />
                                    <line x1="3" y1="15" x2="17" y2="15" />
                                </>
                            )}
                        </svg>
                    </button>
                </div>
            </div>

            {/* Mobile dropdown */}
            {menuOpen && (
                <div className="sm:hidden border-t border-border px-4 py-3 space-y-3 text-sm animate-fade-in">
                    <Link href="/projects" onClick={() => setMenuOpen(false)} className={linkClass("/projects", true)}>
                        Projects
                    </Link>
                    <Link href="/about" onClick={() => setMenuOpen(false)} className={linkClass("/about", true)}>
                        About
                    </Link>
                    {user ? (
                        <>
                            <Link href="/submit" onClick={() => setMenuOpen(false)} className={linkClass("/submit", true)}>
                                Submit a Project
                            </Link>
                            {user.role === "ADMIN" && (
                                <Link href="/admin" onClick={() => setMenuOpen(false)} className={linkClass("/admin", true)}>
                                    Admin
                                </Link>
                            )}
                            <Link href={`/users/${user.id}`} onClick={() => setMenuOpen(false)} className={linkClass(`/users/${user.id}`, true)}>
                                My Profile
                            </Link>
                            <button onClick={() => { signOut(); setMenuOpen(false); }} className="cursor-pointer block text-muted hover:text-foreground transition-colors">
                                Logout
                            </button>
                        </>
                    ) : (
                        <button
                            onClick={() => { signIn("github"); setMenuOpen(false); }}
                            className={buttonSmallClass}
                        >
                            Login with GitHub
                        </button>
                    )}
                </div>
            )}
        </nav>
    );
}
