import type { Metadata } from "next";
import "./globals.css";
import Navbar from "./navbar";
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

// Define the Base URL for your site (Change this to your actual domain in production)
const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

export const metadata: Metadata = {
  // 1. Base Title Template: "Page Name | SoccerWatcher"
  title: {
    default: 'SoccerWatcher | Advanced Soccer Analytics & Stats',
    template: '%s | SoccerWatcher',
  },
  
  // 2. Description for Google Search Results
  description: 'The ultimate hub for soccer statistics. Explore player radar charts, team ELO rankings, heatmaps, and trending football analysis.',
  
  // 3. Keywords for SEO indexing
  keywords: [
    'soccer stats', 
    'football analytics', 
    'player scouting', 
    'radar charts', 
    'team ELO rankings', 
    'premier league stats', 
    'transfer market analysis',
    'scouting report'
  ],

  // 4. Authors and Creator info
  authors: [{ name: 'SoccerWatcher Team' }],
  creator: 'SoccerWatcher',

  // 5. Metadata Base (Crucial for social images to work)
  metadataBase: new URL(BASE_URL),

  // 6. Open Graph (Facebook, LinkedIn, Discord, iMessage)
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: BASE_URL,
    title: 'SoccerWatcher - The Hub for Soccer Stats',
    description: 'Compare players, track team ELO, and visualize performance with our advanced scouting tools.',
    siteName: 'SoccerWatcher',
    images: [
      {
        url: '/banner.jpg', // Using the banner you added to the home page
        width: 1200,
        height: 630,
        alt: 'SoccerWatcher Analytics Dashboard',
      },
    ],
  },

  // 7. Twitter Card (Twitter/X)
  twitter: {
    card: 'summary_large_image',
    title: 'SoccerWatcher | Advanced Soccer Analytics',
    description: 'Visualize the beautiful game. Radar charts, heatmaps, and ELO rankings for top football leagues.',
    images: ['/banner.jpg'], // Re-use the banner
  },

  // 8. Icons
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },

  // 9. Robots (Control crawling)
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-slate-50 text-slate-900 dark:bg-black dark:text-slate-50`}>
        <Navbar />
        {children}
      </body>
    </html>
  );
}
