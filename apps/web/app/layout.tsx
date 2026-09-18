import './globals.css';
import type { Metadata } from 'next';
import { NavbarClient } from '../components/navbar-client';

export const metadata: Metadata = {
  title: 'Bow — Mini GitHub for College Projects',
  description: 'Publish campus builds with screenshots, GitHub links, and tech stack. Upvote, bookmark, search by technology.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <NavbarClient />
        <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
        <footer className="mx-auto max-w-6xl px-4 pb-10 text-xs text-slate-500">
          Built for campus — publish real work, not PDFs. <a className="underline" href="/explore">Explore builds</a>
        </footer>
      </body>
    </html>
  );
}
