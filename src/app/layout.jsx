import './globals.css';
import '../../public/assets/css/index.css';
import Script from 'next/script';
import { Montserrat, Space_Mono } from 'next/font/google';

const montserrat = Montserrat({
  subsets: ['latin'],
  weight: ['300', '400', '600', '700', '900'],
  variable: '--font-body',
  display: 'swap',
});

const spaceMono = Space_Mono({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-mono',
  display: 'swap',
});

export const viewport = {
  themeColor: '#080808',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  viewportFit: 'cover',
};

export const metadata = {
  metadataBase: new URL('https://inmobiliarianortechico.pe'),
  title: 'Inmobiliaria Norte Chico | Lotes y Inmuebles en Chancay y Huaral',
  description: 'Inmobiliaria Norte Chico en Chancay y Huaral. Terrenos y lotes de alta plusvalÃ­a e inmuebles residenciales en el Norte Chico de Lima, PerÃº. Agenda tu visita.',
  keywords: [
    'Inmobiliaria Norte Chico',
    'Norte Chico',
    'Chancay',
    'Huaral',
    'Inmobiliaria Chancay',
    'Inmobiliaria Huaral',
    'Lotes en Chancay',
    'Terrenos en Huaral',
    'Inmuebles Norte Chico',
    'Venta de lotes Chancay Huaral',
  ],
  alternates: {
    canonical: 'https://inmobiliarianortechico.pe',
  },
  verification: {
    google: 'UvpZvDJeW4lXppCK7ikkx5gxeJuPFh6XbjiEBpCZdhc',
    other: {
      'facebook-domain-verification': ['tbgejpksn0jcdpp2uc332lrgl67p8l'],
    },
  },
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
  openGraph: {
    title: 'Inmobiliaria Norte Chico | Lotes y Inmuebles en Chancay y Huaral',
    description: 'Terrenos e inmuebles de alta plusvalÃ­a en Chancay y Huaral. Inmobiliaria Norte Chico te brinda asesorÃ­a personalizada sin costo.',
    type: 'website',
    url: 'https://inmobiliarianortechico.pe',
    siteName: 'Inmobiliaria Norte Chico',
    locale: 'es_PE',
    images: [
      {
        url: '/PR_GLORIETA_DELUXE.webp',
        width: 1200,
        height: 630,
        alt: 'Inmobiliaria Norte Chico - Chancay y Huaral',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Inmobiliaria Norte Chico | Lotes y Inmuebles en Chancay y Huaral',
    description: 'Terrenos e inmuebles de alta plusvalÃ­a en Chancay y Huaral. Inmobiliaria Norte Chico.',
    images: ['/PR_GLORIETA_DELUXE.webp'],
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': ['RealEstateAgent', 'LocalBusiness'],
  'name': 'Inmobiliaria Norte Chico',
  'alternateName': ['Norte Chico', 'Grupo Inmobiliario Norte Chico', 'Inmobiliaria Norte Chico Chancay Huaral'],
  'image': 'https://inmobiliarianortechico.pe/PR_GLORIETA_DELUXE.webp',
  '@id': 'https://inmobiliarianortechico.pe',
  'url': 'https://inmobiliarianortechico.pe',
  'sameAs': [
    'https://inmobiliarianortechico.pe',
    'https://www.instagram.com/inmobiliarianortechico',
    // TODO: Agregar URL de Facebook cuando estÃ© confirmada, ej: 'https://www.facebook.com/inmobiliarianortechico'
  ],
  'telephone': '+51904669316',
  'priceRange': '$$',
  'currenciesAccepted': 'USD, PEN',
  'paymentAccepted': 'Cash, Bank Transfer',
  'address': {
    '@type': 'PostalAddress',
    'addressLocality': 'Chancay y Huaral',
    'addressRegion': 'Lima',
    'addressCountry': 'PE',
  },
  'geo': {
    '@type': 'GeoCoordinates',
    'latitude': -11.4956,
    'longitude': -77.2064,
  },
  'areaServed': [
    {
      '@type': 'AdministrativeArea',
      'name': 'Chancay',
    },
    {
      '@type': 'AdministrativeArea',
      'name': 'Huaral',
    },
    {
      '@type': 'AdministrativeArea',
      'name': 'Norte Chico',
    },
  ],
  'hasOfferCatalog': {
    '@type': 'OfferCatalog',
    'name': 'CatÃ¡logo de Inmuebles y Terrenos',
    'itemListElement': [
      {
        '@type': 'OfferCatalog',
        'name': 'Terrenos Residenciales e InversiÃ³n',
        'itemListElement': [
          {
            '@type': 'Offer',
            'itemOffered': {
              '@type': 'Service',
              'name': 'Venta de Lotes y Terrenos en Chancay y Huaral',
            },
          },
        ],
      },
    ],
  },
  'contactPoint': {
    '@type': 'ContactPoint',
    'telephone': '+51904669316',
    'contactType': 'customer service',
    'areaServed': 'PE',
    'availableLanguage': ['Spanish', 'English'],
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
    'closes': '19:00',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <head>
        {/* Meta de verificación de dominio Facebook / Meta */}
        <meta name="facebook-domain-verification" content="tbgejpksn0jcdpp2uc332lrgl67p8l" />
        {/* Precarga de imagenes LCP criticas */}
        <link rel="preload" as="image" href="/PR_GLORIETA_DELUXE.webp" fetchPriority="high" />
        <link rel="preload" as="image" href="/PR_PLAZA_CHANCAY_desktop.webp" fetchPriority="high" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={`${montserrat.className} ${spaceMono.variable} bg-arena text-asfalto antialiased overflow-x-hidden selection:bg-terracota selection:text-arena`}>
        <div className="noise-overlay"></div>
        {children}

        {/* Microsoft Clarity */}
        <Script id="clarity-script" strategy="lazyOnload">
          {`
            (function(c,l,a,r,i,t,y){
                c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
            })(window, document, "clarity", "script", "xx8olz05i8");
          `}
        </Script>

        {/* Lazy Meta Pixel */}
        <Script id="meta-pixel-lazy" strategy="lazyOnload">
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
                    // TODO: Reemplazar 'TU_ID_DE_PIXEL_AQUI' con el Pixel ID real de Meta.
                    // Se obtiene en: Meta Business Suite > Administrador de eventos > Pixel
                    // Una vez obtenido, configurar en .env.local como NEXT_PUBLIC_META_PIXEL_ID
                    // y reemplazar el string aqui o consumir process.env.NEXT_PUBLIC_META_PIXEL_ID
                    fbq('init', 'TU_ID_DE_PIXEL_AQUI');
                    fbq('track', 'PageView');
                }
                ['touchstart', 'scroll', 'mousemove', 'click'].forEach(function(evt) {
                    window.addEventListener(evt, initMetaPixel, { passive: true, once: true });
                });
                setTimeout(initMetaPixel, 5000);
            })();
          `}
        </Script>
      </body>
    </html>
  );
}
