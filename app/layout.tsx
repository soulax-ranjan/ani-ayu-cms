import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import "./globals.css";

const roboto = Roboto({
  weight: ['300', '400', '500', '700', '900'],
  subsets: ["latin"],
  display: 'swap',
});

export const metadata: Metadata = {
    title: "AniAyu CMS Dashboard",
    description: "Material Design Admin Dashboard for AniAyu",
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body className={`min-h-screen antialiased bg-[#f4f5fa] text-[#1c1b1f] ${roboto.className}`}>
                {children}
            </body>
        </html>
    );
}
