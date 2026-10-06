// pages/index.jsx
import Image from 'next/image'

export default function Home() {
  return (
    <main>
      <section
        style={{
          backgroundColor: '#005f73',
          color: '#ffffff',
          padding: '4rem 2rem',
          textAlign: 'center'
        }}
      >
        <h1 style={{ fontSize: '2.5rem', lineHeight: 1.2 }}>
          PDFLovers
        </h1>
        <p style={{ fontSize: '1.2rem', maxWidth: '600px', margin: '1rem auto' }}>
          Your all-in-one online PDF tool: convert, merge, split, compress, and edit—no installs required.
        </p>
        <button
          aria-label="Try PDF converter now"
          style={{
            backgroundColor: '#ee9b00',
            color: '#000',
            border: 'none',
            padding: '0.75rem 1.5rem',
            fontSize: '1rem',
            cursor: 'pointer'
          }}
        >
          Get Started
        </button>
        <div style={{ marginTop: '2rem' }}>
          <Image
            src="/images/hero.webp"
            alt="Screenshots of PDFLovers in action"
            width={800}
            height={400}
            priority // pulls in preloaded asset
          />
        </div>
      </section>
      {/* ... your other sections ... */}
    </main>
  )
}
