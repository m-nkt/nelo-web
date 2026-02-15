import type { Metadata } from 'next'
import Script from 'next/script'
import './globals.css'

export const metadata: Metadata = {
  title: 'Nelo sets you up',
  description: 'Your personalized AI matchmaker for friends and dates that actually fit.',
  openGraph: {
    title: 'Nelo sets you up',
    description: 'Your personalized AI matchmaker for friends and dates that actually fit.',
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
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@100..1000&family=Inter:wght@100..900&family=Playfair+Display:ital,wght@0,400;0,900;1,400&family=Space+Grotesk:wght@300..700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans antialiased">
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

