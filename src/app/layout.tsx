import type { Metadata } from "next";
import { Instrument_Serif, DM_Sans } from "next/font/google";
import "./globals.css";

const instrumentSerif = Instrument_Serif({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["400"],
  style: ["normal", "italic"],
  display: "swap",
});

const dmSans = DM_Sans({
  variable: "--font-body",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "BirdieFund | Play. Win. Give Back.",
  description: "A premium subscription platform combining golf performance tracking, charity fundraising, and monthly prize draws. Enter your scores, win prizes, and support causes that matter.",
  keywords: "golf, charity, subscription, prize draw, stableford, fundraising",
  openGraph: {
    title: "BirdieFund | Play. Win. Give Back.",
    description: "Enter your golf scores. Win monthly prizes. Support charities that matter.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${instrumentSerif.variable} ${dmSans.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
