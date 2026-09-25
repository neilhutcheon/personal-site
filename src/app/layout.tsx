import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Geist, Geist_Mono } from "next/font/google";
import { TooltipProvider } from "@/components/ui/tooltip";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const display = Bricolage_Grotesque({
  variable: "--font-display",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Neil Hutcheon — Senior Software Engineer",
  description:
    "Neil Hutcheon is a Minneapolis-based Senior Software Engineer building production web apps, data/media pipelines, and Terraform-managed AWS infrastructure. Also: climber, disc golfer, trombonist.",
  openGraph: {
    title: "Neil Hutcheon — Senior Software Engineer",
    description:
      "Production web apps, data pipelines, and cloud infrastructure. Off the keyboard: climbing, disc golf, and trombone.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#f8f3e6",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${display.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <TooltipProvider>{children}</TooltipProvider>
      </body>
    </html>
  );
}
