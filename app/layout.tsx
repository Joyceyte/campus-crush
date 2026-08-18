import type { Metadata } from "next";
import { Jersey_25 } from "next/font/google";
import WaitlistModal from "@/components/WaitlistModal";
import JoinPilotModal from "@/components/JoinPilotModal";
import "./globals.css";

const jersey25 = Jersey_25({
  weight: "400",
  variable: "--font-jersey",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Campus Crush — Meet Your Campus Crush This Semester",
  description: "Your AI campus matchmaker. Date without the awkward DMs.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${jersey25.variable}`}>
      <body className="antialiased">
        <a href="#main-content" className="skip-nav">Skip to main content</a>
        {children}
        <WaitlistModal />
        <JoinPilotModal />
      </body>
    </html>
  );
}
