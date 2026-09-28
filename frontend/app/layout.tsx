import type { Metadata, Viewport } from 'next';
import './globals.css';
import { AuthProvider } from '../context/AuthContext';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { BackToTop } from '../components/shared/BackToTop';
import { AIAssistant } from '../components/shared/AIAssistant';

export const viewport: Viewport = {
  themeColor: '#0E2A1F',
};

export const metadata: Metadata = {
  title: 'MarketLink | 100% Farm Fresh Pre-Orders & Local Farmers Market',
  description:
    'MarketLink (eGreen Basket) connects local farmers directly with consumers through pre-ordering, produce traceability, and smart AI demand forecasting. Shop farm-fresh, organic produce from verified local farmers.',
  keywords: [
    'MarketLink',
    'eGreen Basket',
    'AgriFlow',
    'farmers market',
    'organic produce',
    'local farmers',
    'agricultural marketplace',
    'pre-order produce',
    'produce traceability',
    'farm fresh',
    'buy local',
  ],
  authors: [{ name: 'MarketLink Team' }],
  openGraph: {
    title: 'MarketLink | 100% Farm Fresh Pre-Orders & Local Farmers Market',
    description: 'Shop farm-fresh, organic produce directly from local farmers. Pre-order, trace, and support local agriculture.',
    type: 'website',
    locale: 'en_US',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="bg-[#FDFBF7] text-[#0E2A1F] min-h-screen flex flex-col font-sans antialiased">
        <AuthProvider>
          <Navbar />
          <main className="flex-1">
            {children}
          </main>
          <Footer />
          <AIAssistant />
          <BackToTop />
        </AuthProvider>
      </body>
    </html>
  );
}
