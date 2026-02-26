"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { signIn, signOut } from "next-auth/react";

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

    return (
        <nav className="shadow-sm bg-background">
            <div className="flex justify-between items-center px-4 sm:px-6 h-14">
                <div className="flex items-center gap-4 sm:gap-6">
                    <Link href="/" className="font-sans text-xl tracking-tight">
                        hut101
                    </Link>
                    <div className="hidden sm:flex gap-4 text-sm">
                        <Link href="/projects" className="text-muted hover:text-foreground transition-colors">
                            Projects
                        </Link>
                        <Link href="/about" className="text-muted hover:text-foreground transition-colors">
                            About
                        </Link>
                    </div>
                </div>

                <div className="flex items-center gap-3 sm:gap-4 text-sm">
                    {/* Desktop links */}
                    {user ? (
                        <div className="hidden sm:flex items-center gap-4">
                            <Link href="/submit" className="text-muted hover:text-foreground transition-colors">
                                Submit a Project
                            </Link>
                            {user.role === "ADMIN" && (
                                <Link href="/admin" className="text-muted hover:text-foreground transition-colors">
                                    Admin
                                </Link>
                            )}
                            <Link href={`/users/${user.id}`} className="text-muted hover:text-foreground transition-colors">
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
                            className="hidden sm:inline cursor-pointer bg-accent text-white px-3 py-1.5 rounded-md text-sm font-medium hover:bg-accent-hover transition-colors"
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
                    <Link href="/projects" onClick={() => setMenuOpen(false)} className="block text-muted hover:text-foreground transition-colors">
                        Projects
                    </Link>
                    <Link href="/about" onClick={() => setMenuOpen(false)} className="block text-muted hover:text-foreground transition-colors">
                        About
                    </Link>
                    {user ? (
                        <>
                            <Link href="/submit" onClick={() => setMenuOpen(false)} className="block text-muted hover:text-foreground transition-colors">
                                Submit a Project
                            </Link>
                            {user.role === "ADMIN" && (
                                <Link href="/admin" onClick={() => setMenuOpen(false)} className="block text-muted hover:text-foreground transition-colors">
                                    Admin
                                </Link>
                            )}
                            <Link href={`/users/${user.id}`} onClick={() => setMenuOpen(false)} className="block text-muted hover:text-foreground transition-colors">
                                My Profile
                            </Link>
                            <button onClick={() => { signOut(); setMenuOpen(false); }} className="cursor-pointer block text-muted hover:text-foreground transition-colors">
                                Logout
                            </button>
                        </>
                    ) : (
                        <button
                            onClick={() => { signIn("github"); setMenuOpen(false); }}
                            className="cursor-pointer bg-accent text-white px-3 py-1.5 rounded-md text-sm font-medium hover:bg-accent-hover transition-colors"
                        >
                            Login with GitHub
                        </button>
                    )}
                </div>
            )}
        </nav>
    );
}
