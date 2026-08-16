import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { CompareProvider } from '@/context/CompareContext';
import DemoRoleBar from '@/components/common/DemoRoleBar';
import Navbar from '@/components/common/Navbar';
import CompareDrawer from '@/components/marketplace/CompareDrawer';
import Footer from '@/components/common/Footer';

export const metadata: Metadata = {
  title: 'RideSetu — One Place. Every Ride. Every Destination.',
  description:
    'Compare and book verified rental bikes, scooters, and self-drive cars from trusted local partners across Uttarakhand and India top travel destinations.',
  keywords: [
    'bike rental rishikesh',
    'scooty rental mussoorie',
    'car rental dehradun',
    'bike rental nainital',
    'ridesetu travel mobility marketplace',
    'royal brothers alternative india',
  ],
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
