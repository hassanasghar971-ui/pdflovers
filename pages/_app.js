// pages/_app.js
import ErrorBoundary from '../components/ErrorBoundary'
import '../styles/globals.css' // your global styles

function MyApp({ Component, pageProps }) {
  return (
    <ErrorBoundary>
      <Component {...pageProps} />
    </ErrorBoundary>
  )
}

export default MyApp
