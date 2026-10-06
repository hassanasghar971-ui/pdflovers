// src/pages/_app.js
import ErrorBoundary from '../components/ErrorBoundary'
import '../styles/globals.css'

export default function MyApp({ Component, pageProps }) {
  return (
    <ErrorBoundary>
      <Component {...pageProps} />
    </ErrorBoundary>
  )
}
