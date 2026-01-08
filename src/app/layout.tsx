import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { UserProvider } from "@/context/user-context";
import { AuthGuard } from "@/components/auth-guard";

const inter = Inter({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Campus Assistant - Voice Controlled AI",
  description:
    "Your intelligent campus companion with voice control and 3D interactive robot interface",
  keywords: ["campus", "assistant", "voice", "AI", "student", "education"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} antialiased gradient-bg min-h-screen`}>
        <UserProvider>
          <AuthGuard>{children}</AuthGuard>
        </UserProvider>
      </body>
    </html>
  );
}
