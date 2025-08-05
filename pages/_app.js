// pages/_app.js
import { useEffect } from 'react';
import Script from 'next/script';
import '../styles/globals.css';

export default function MyApp({ Component, pageProps }) {
  useEffect(() => {
    window.dataLayer = window.dataLayer || [];
    function gtag(){ window.dataLayer.push(arguments); }
    gtag('js', new Date());
    gtag('config', 'G-KS3C4VN97Q'); // 🔁 Replace with your GA4 Measurement ID
  }, []);

  return (
    <>
      {/* Google Analytics Script */}
      <Script
        strategy="afterInteractive"
        src="https://www.googletagmanager.com/gtag/js?id=G-KS3C4VN97Q" // 🔁 Replace with your ID
      />
      <Component {...pageProps} />
    </>
  );
}
