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
    title: "hut101",
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
    } : null;

    return (
        <html lang="en">
            <body
                className={`${fontSans.variable} ${fontSerif.variable} ${fontMono.variable} antialiased`}
            >
                <TopMenu user={topMenuProps} />
                <main className="max-w-4xl mx-auto px-6 py-8">
                    {children}
                </main>
            </body>
        </html>
    );
}
