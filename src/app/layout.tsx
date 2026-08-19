import type { Metadata, Viewport } from 'next';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { CompareProvider } from '@/context/CompareContext';
import DemoRoleBar from '@/components/common/DemoRoleBar';
import Navbar from '@/components/common/Navbar';
import CompareDrawer from '@/components/marketplace/CompareDrawer';
import Footer from '@/components/common/Footer';

export const viewport: Viewport = {
  themeColor: '#FF6B00',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  title: {
    default: 'RideSetu — Himalayan Travel Mobility & Vehicle Rental Marketplace',
    template: '%s | RideSetu',
  },
  description:
    'Compare and book verified rental bikes, scooters, and self-drive cars from certified local partners across Rishikesh, Mussoorie, Dehradun, Nainital, and Haridwar with 100% deposit protection.',
  keywords: [
    'bike rental rishikesh',
    'scooty rental mussoorie',
    'car rental dehradun',
    'bike rental nainital',
    'self drive rental uttarakhand',
    'ridesetu travel mobility marketplace',
  ],
  authors: [{ name: 'RideSetu Technologies' }],
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'RideSetu',
  },
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    siteName: 'RideSetu',
    title: 'RideSetu — Verified Travel Mobility Marketplace',
    description: 'One Place. Every Ride. Every Destination. Compare transparent rental rates and book verified bikes and cars.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'RideSetu — Verified Travel Mobility Marketplace',
    description: 'Book verified bikes, scooties, and cars across Uttarakhand travel hubs with 360° digital handover.',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen flex flex-col antialiased selection:bg-brand-orange selection:text-white">
        <AuthProvider>
          <CompareProvider>
            <DemoRoleBar />
            <Navbar />
            <main className="flex-1">{children}</main>
            <CompareDrawer />
            <Footer />
          </CompareProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
