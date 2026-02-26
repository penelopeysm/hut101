import type { Metadata } from "next";
import { DM_Sans, Lora, IBM_Plex_Mono } from "next/font/google";
import TopMenu from "@/components/TopMenu";
import "./globals.css";
import { auth } from "@/lib/auth";

const fontSans = DM_Sans({
    variable: "--font-sans",
    subsets: ["latin"],
});

const fontSerif = Lora({
    variable: "--font-serif",
    subsets: ["latin"],
});

const fontMono = IBM_Plex_Mono({
    variable: "--font-mono",
    weight: ["400", "700"],
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: {
        default: "hut101",
        template: "%s | hut101",
    },
    description: "open source mentoring",
};

export default async function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const session = await auth();
    const topMenuProps = session ? {
        id: session.user.id,
        githubPicture: session.user.githubPicture,
        githubUsername: session.user.githubUsername,
        role: session.user.role,
    } : null;

    return (
        <html lang="en">
            <body
                className={`${fontSans.variable} ${fontSerif.variable} ${fontMono.variable} antialiased`}
            >
                <a
                    href="#main-content"
                    className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:bg-accent focus:text-white focus:px-4 focus:py-2 focus:rounded-md focus:text-sm focus:font-medium"
                >
                    Skip to main content
                </a>
                <TopMenu user={topMenuProps} />
                <main id="main-content" className="max-w-4xl mx-auto px-6 py-8">
                    {children}
                </main>
            </body>
        </html>
    );
}
