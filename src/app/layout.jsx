import './globals.css';
import '../../public/assets/css/index.min.css';
import Script from 'next/script';
import SecurityLayer from '../components/SecurityLayer';

export const metadata = {
  title: 'Norte Chico Properties | Lotes e Inmuebles en Huaral y Chancay',
  description: 'Invierte en lotes residenciales y terrenos de alta plusvalía en Huaral y Chancay. Grupo Inmobiliario Norte Chico. Agenda una visita hoy.',
  robots: 'index, follow',
  openGraph: {
    title: 'Norte Chico Properties | Lotes en Huaral y Chancay',
    description: 'Terrenos e inmuebles de alta plusvalía en el Norte Chico del Perú. Asesoría personalizada sin costo.',
    type: 'website',
    url: 'https://inmobiliarianortechico.pe',
    images: [
      {
        url: '/PR_GLORIETA_DELUXE.webp',
        width: 1200,
        height: 630,
        alt: 'Norte Chico Properties',
      },
    ],
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'RealEstateAgent',
  'name': 'Norte Chico Properties',
  'image': 'https://inmobiliarianortechico.pe/PR_GLORIETA_DELUXE.webp',
  '@id': 'https://inmobiliarianortechico.pe',
  'url': 'https://inmobiliarianortechico.pe',
  'telephone': '+56982816844',
  'priceRange': '$$',
  'address': {
    '@type': 'PostalAddress',
    'addressLocality': 'Huaral, Chancay',
    'addressRegion': 'Lima',
    'addressCountry': 'PE',
  },
  'geo': {
    '@type': 'GeoCoordinates',
    'latitude': -11.4956,
    'longitude': -77.2064,
  },
  'openingHoursSpecification': {
    '@type': 'OpeningHoursSpecification',
    'dayOfWeek': [
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
      'Sunday',
    ],
    'opens': '09:00',
    'closes': '18:00',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;600;700;900&family=Space+Mono:wght@400;700&display=swap" rel="stylesheet" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="bg-arena text-asfalto antialiased overflow-x-hidden selection:bg-terracota selection:text-arena">
        <SecurityLayer />
        <div className="noise-overlay"></div>
        {children}

        {/* Microsoft Clarity */}
        <Script id="clarity-script" strategy="afterInteractive">
          {`
            (function(c,l,a,r,i,t,y){
                c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
            })(window, document, "clarity", "script", "xx8olz05i8");
          `}
        </Script>

        {/* Lazy Meta Pixel */}
        <Script id="meta-pixel-lazy" strategy="afterInteractive">
          {`
            (function() {
                let pixelLoaded = false;
                function initMetaPixel() {
                    if (pixelLoaded) return;
                    pixelLoaded = true;
                    !function (f, b, e, v, n, t, s) {
                        if (f.fbq) return; n = f.fbq = function () {
                            n.callMethod ?
                                n.callMethod.apply(n, arguments) : n.queue.push(arguments)
                        };
                        if (!f._fbq) f._fbq = n; n.push = n; n.loaded = !0; n.version = '2.0';
                        n.queue = []; t = b.createElement(e); t.async = !0;
                        t.src = v; s = b.getElementsByTagName(e)[0];
                        s.parentNode.insertBefore(t, s)
                    }(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
                    fbq('init', 'TU_ID_DE_PIXEL_AQUI');
                    fbq('track', 'PageView');
                }
                ['touchstart', 'scroll', 'mousemove', 'click'].forEach(function(evt) {
                    window.addEventListener(evt, initMetaPixel, { passive: true, once: true });
                });
                setTimeout(initMetaPixel, 3000);
            })();
          `}
        </Script>
      </body>
    </html>
  );
}
