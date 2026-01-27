import type { Metadata } from "next";
import { IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

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

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body
                className={`${fontSans.variable} ${fontMono.variable} antialiased`}
            >
                {children}
            </body>
        </html>
    );
}
