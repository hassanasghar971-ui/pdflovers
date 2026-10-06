// pages/_document.js
import Document, { Html, Head, Main, NextScript } from 'next/document'

class MyDocument extends Document {
  render() {
    return (
      <Html lang="en">
        <Head>
          {/* SEO */}
          <meta name="description" content="PDFLovers – Free online PDF converter, merger, splitter, compressor and editor." />
          <meta name="viewport"    content="width=device-width, initial-scale=1" />

          {/* Open Graph */}
          <meta property="og:title"       content="PDFLovers – Free PDF Tools" />
          <meta property="og:description" content="Convert, merge, split & edit PDFs online." />
          <meta property="og:image"       content="https://pdflovers-rouge.vercel.app/og-image.png" />
          <meta property="og:url"         content="https://pdflovers-rouge.vercel.app/" />
          <meta name="twitter:card"       content="summary_large_image" />

          {/* Preload critical assets */}
          <link
            rel="preload"
            href="/fonts/Inter-VariableFont_slnt,wght.ttf"
            as="font"
            type="font/ttf"
            crossOrigin="anonymous"
          />
          {/* Example: preload hero image */}
          <link rel="preload" as="image" href="/images/hero.webp" />

          {/* Favicon */}
          <link rel="icon" href="/favicon.ico" />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    )
  }
}

export default MyDocument
