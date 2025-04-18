import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { SidebarProvider, Header } from '@/components/ui';
import { SidebarMenu } from '@/components/ui/sidebarMenu';
import { Footer } from '@/components/ui/foorter';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Courses',
  description: 'Courses app home page',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en'>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <SidebarProvider className={'flex flex-col'} defaultOpen={false}>
          <SidebarMenu />
          <Header />
          <main className={'flex-grow'}>{children}</main>
          <Footer />
        </SidebarProvider>
      </body>
    </html>
  );
}
