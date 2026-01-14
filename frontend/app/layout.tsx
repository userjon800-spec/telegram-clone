import type { Metadata } from "next";
import { Space_Grotesk } from "next/font/google";
import "./globals.css";
const spaceGrotesk = Space_Grotesk({
  weight: ["400", "500", "600", "700", "300"],
  subsets: ["latin"],
  variable: "--font-spaceGrotesk",
});
export const metadata: Metadata = {
  title: "Telegram web",
  description: "Telegram web application clone created by Javohir Xamdamboyev",
  icons: { icon: "/logo.svg" },
};
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressContentEditableWarning>
      <body
        className={`${spaceGrotesk.className} antialiased sidebar-custom-scrollbar min-h-screen flex items-center justify-center`}
        suppressContentEditableWarning
      >
        {children}
      </body>
    </html>
  );
}