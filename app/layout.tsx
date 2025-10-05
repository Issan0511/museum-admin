import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Museum Admin",
  description: "Admin console for Supabase tables",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body>
        <main>{children}</main>
      </body>
    </html>
  );
}
