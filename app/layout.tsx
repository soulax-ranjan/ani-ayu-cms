import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
    title: "Admin Dashboard",
    description: "Minimal Admin Dashboard",
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body className="min-h-screen antialiased bg-gray-50">{children}</body>
        </html>
    );
}
