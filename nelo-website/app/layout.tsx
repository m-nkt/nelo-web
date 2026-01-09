import type { Metadata } from 'next'
import Script from 'next/script'
import { Playfair_Display, Inter, Space_Grotesk, DM_Sans } from 'next/font/google'
import './globals.css'

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
  preload: true, // ヒーローセクションで使用するため優先読み込み
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
  preload: true, // サブタイトルで使用するため優先読み込み
})

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
  display: 'swap',
})

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Nelo - New friends. That last.',
  description: 'New friends. That last.',
  openGraph: {
    title: 'nelo | New friends. That last.',
    description: 'New friends. That last.',
    images: ['https://nelo.so/og-image.jpg'],
    url: 'https://nelo.so',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${playfair.variable} ${inter.variable} ${spaceGrotesk.variable} ${dmSans.variable} font-sans antialiased`}>
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-PTG1NT8K0R"
          strategy="lazyOnload"
        />
        <Script id="google-analytics" strategy="lazyOnload">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-PTG1NT8K0R');
          `}
        </Script>
        {children}
      </body>
    </html>
  )
}

