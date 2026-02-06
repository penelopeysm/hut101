import type { Metadata } from "next";
import { IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google";
import TopMenu from "@/components/TopMenu";
import "./globals.css";
import { auth } from "@/lib/auth";

const fontSans = IBM_Plex_Sans({
    variable: "--font-sans",
    weight: ["400", "700"],
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
                className={`${fontSans.variable} ${fontMono.variable} antialiased`}
            >
                <TopMenu user={topMenuProps} />
                <main className="p-4 ml-4 mr-4">
                    {children}
                </main>
            </body>
        </html>
    );
}
