import "./globals.css";
import type { ReactNode } from "react";
import Script from "next/script";

export const metadata = {
  title: "Fanvue App Starter",
  description: "Fanvue + Next.js starter",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}

        {/* Botpress Webchat – чат балон за сайта */}
        <Script
          src="https://cdn.botpress.cloud/webchat/v3.3/inject.js"
          strategy="afterInteractive"
        />
        <Script
          src="https://files.bpcontent.cloud/2025/11/18/21/20251118215803-SOB3WGTA.js"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
