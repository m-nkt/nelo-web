import type { Metadata } from 'next'
import Script from 'next/script'
import { Playfair_Display, Inter, Space_Grotesk, DM_Sans } from 'next/font/google'
import './globals.css'

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
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
  title: 'Nelo - Text to Friend',
  description: 'Make friends around the world. The easiest way to meet people you actually want to talk to.',
  openGraph: {
    title: 'nelo | New friends, anywhere',
    description: 'No messages. No coordination. A 15-minute conversation, matched for you.',
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
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
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

