import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Nav from "@/components/Nav";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "cessation",
  description:
    "A generative art project using personal health data to reach digital nirvana.",
  openGraph: {
    title: "cessation",
    description:
      "A generative art project using personal health data to reach digital nirvana.",
    siteName: "cessation",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "cessation",
    description:
      "A generative art project using personal health data to reach digital nirvana.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={mono.variable}>
      <body>
        <Nav />
        <main>{children}</main>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
