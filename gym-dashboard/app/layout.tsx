import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import "./globals.css";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FitDash - Owner Dashboard",
  description: "Manage your gym empire",
};

import { Providers } from "@/components/providers/Providers";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('theme') || 'dark';
                  var colorTheme = localStorage.getItem('colorTheme') || 'violet';
                  document.documentElement.classList.add(theme);
                  document.documentElement.classList.add('theme-' + colorTheme);
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body
        className={`${dmSans.variable} antialiased font-sans`}
      >
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
