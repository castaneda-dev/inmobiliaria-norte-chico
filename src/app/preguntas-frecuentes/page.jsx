export const dynamic = 'force-dynamic';

import BlogClient from '../blog/BlogClient';

export const metadata = {
  title: 'Preguntas Frecuentes & Blog Inmobiliario | Norte Chico Chancay y Huaral',
  description: 'Resuelve todas tus dudas sobre compra de terrenos, lotes en Chancay, plusvalía cerca al Megapuerto, financiamiento y saneamiento legal con SUNARP.',
  alternates: {
    canonical: 'https://inmobiliarianortechico.pe/preguntas-frecuentes',
  },
  openGraph: {
    title: 'Preguntas Frecuentes & Blog Inmobiliario | Inmobiliaria Norte Chico',
    description: 'Guía de preguntas frecuentes y análisis de inversión inmobiliaria en Chancay y Huaral.',
    url: 'https://inmobiliarianortechico.pe/preguntas-frecuentes',
    siteName: 'Inmobiliaria Norte Chico',
    locale: 'es_PE',
    images: [
      {
        url: '/PR_GLORIETA_DELUXE.webp',
        width: 1200,
        height: 630,
        alt: 'Preguntas Frecuentes - Inmobiliaria Norte Chico',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Preguntas Frecuentes & Guías | Inmobiliaria Norte Chico',
    description: 'Aclara tus dudas sobre lotes y terrenos en Chancay y Huaral.',
    images: ['/PR_GLORIETA_DELUXE.webp'],
  },
};

const articles = [
  {
    id: 'megapuerto-chancay-plusvalia-2026',
    category: 'Estrategia & Plusvalía',
    badgeColor: '#cb9f74',
    title: 'Megapuerto de Chancay 2026: Por qué el Eje Chancay-Huaral liderará la plusvalía inmobiliaria',
    excerpt: 'Análisis de impacto macroeconómico, demanda de habilitación urbana y proyección de revalorización por metro cuadrado para inversionistas que buscan alta rentabilidad.',
    readTime: '5 min de lectura',
    date: '16 de Agosto, 2026',
    author: 'Dirección Estratégica Norte Chico',
    authorRole: 'Comité de Inversiones',
    image: '/PR_CHANCAY_desktop.webp',
    featured: true,
    content: [
      {
        subtitle: '1. El Hub Portuario más moderno de Sudamérica',
        text: 'La consolidación operativa del Megapuerto Multipropósito de Chancay marca un hito histórico en el comercio marítimo bioceánico. La reducción del tiempo de tránsito de 35 a solo 10 días hacia Asia convierte al litoral del Norte Chico en el epicentro comercial y logístico indiscutible del Perú.'
      },
      {
        subtitle: '2. Efecto Multiplicador en Terrenos Residenciales y Comerciales',
        text: 'El desarrollo portuario no solo atrae almacenes y parques logísticos; genera una demanda exponencial de viviendas, residencias de campo para ejecutivos, zonas comerciales y servicios de hotelería y recreación en Chancay y los valles fértiles de Huaral.'
      },
      {
        subtitle: '3. La Regla de Oro: Comprar en Fase de Expansión',
        text: 'Quienes adquieren terrenos independizados hoy capturan el valor inicial antes de la maduración de los proyectos viales complementarios (vía periurbana y tren costero). El metro cuadrado en la zona mantiene una curva alcista sostenida.'
      }
    ],
    keyPoints: [
      'Conexión directa Chancay-Asia con reducción drástica de fletes.',
      'Alta demanda de suelo urbano para profesionales y ejecutivos del sector portuario.',
      'Excelente relación precio/m² con proyección de duplicación de valor en el mediano plazo.'
    ]
  },
  {
    id: 'guia-saneamiento-legal-sunarp',
    category: 'Saneamiento Legal SUNARP',
    badgeColor: '#10b981',
    title: 'Guía Legal SUNARP: Cómo verificar que un terreno en Chancay está 100% saneado',
    excerpt: 'Paso a paso para revisar partidas registrales, planos catastrales y evitar fraudes inmobiliarios. Compra con total certeza jurídica.',
    readTime: '4 min de lectura',
    date: '14 de Agosto, 2026',
    author: 'Área Legal & Saneamiento',
    authorRole: 'Operaciones SUNARP',
    image: '/PR_PLAZA_CHANCAY_desktop.webp',
    featured: false,
    content: [
      {
        subtitle: '1. La Partida Electrónica Independizada',
        text: 'Nunca compre acciones y derechos indivisos sin un plano visado. Cada lote debe contar con su propia Partida Registral en SUNARP, donde figure el área exacta, linderos y titularidad única libre de embargos.'
      },
      {
        subtitle: '2. Certificado Catastral y Zonificación Municipal',
        text: 'Verifique que el lote cuente con zonificación residencial (RDM/RDA) o comercio compatible con los planes de desarrollo urbano aprobados por la Municipalidad de Chancay o Huaral.'
      },
      {
        subtitle: '3. El Protocolo Cero-Riesgos de Norte Chico',
        text: 'En nuestro catálogo, ninguna propiedad se publica como disponible sin previa auditoría notarial y registral completa, garantizando entrega de título y posesión inmediata.'
      }
    ],
    keyPoints: [
      'Exija siempre Certificado Registral Inmobiliario (CRI) actualizado.',
      'Verifique que no existan cargas, hipotecas ni litigios pendientes.',
      'Firma de Escritura Pública ante Notario con bancarización completa.'
    ]
  },
  {
    id: 'pasos-comprar-lote-financiamiento-directo',
    category: 'Guía de Compra & Ventas',
    badgeColor: '#38bdf8',
    title: '5 Pasos para adquirir tu lote residencial con Financiamiento Directo y sin bancos',
    excerpt: 'Desde la selección del metraje y recorrido guiado en campo, hasta la firma notarial y entrega física del terreno con hitos topográficos.',
    readTime: '3 min de lectura',
    date: '10 de Agosto, 2026',
    author: 'Equipo Comercial & Conversión',
    authorRole: 'Ventas Norte Chico',
    image: '/PR_ECOTRULY_PARK_desktop.webp',
    featured: false,
    content: [
      {
        subtitle: 'Paso 1: Asesoría y Selección de Ubicación',
        text: 'Defina su objetivo: vivienda familiar de campo, casa de retiro o inversión a mediano plazo para reventa. Le presentamos las opciones que mejor se adaptan a su presupuesto.'
      },
      {
        subtitle: 'Paso 2: Recorrido Guiado en el Terreno',
        text: 'Coordinamos una visita presencial para inspeccionar la topografía, accesos, vistas panorámicas y la delimitación exacta de los hitos.'
      },
      {
        subtitle: 'Paso 3: Separación y Plan de Pago',
        text: 'Separe su lote con un monto accesible y elija entre pago al contado con descuento especial o cuotas mensuales estructuradas a su medida.'
      },
      {
        subtitle: 'Paso 4 y 5: Firma Notarial y Posesión',
        text: 'Formalización del contrato ante notario público colegiado y entrega inmediata de la posesión para que inicie su proyecto.'
      }
    ],
    keyPoints: [
      'Visita guiada sin costo con asesor personal.',
      'Flexibilidad de pagos en Dólares (USD) o Soles (PEN).',
      'Atención inmediata vía WhatsApp al +56 9 8281 6844.'
    ]
  }
];

const faqItems = [
  {
    category: 'Megapuerto y Plusvalía',
    question: '¿Por qué invertir en terrenos cerca al Megapuerto de Chancay?',
    answer: 'El Megapuerto Multipropósito de Chancay convertirá la zona en el principal hub marítimo del Pacífico Sur hacia Asia. Esto genera una demanda masiva de infraestructura comercial, residencial y logística, proyectando una revalorización y plusvalía continua de los terrenos a corto y mediano plazo.'
  },
  {
    category: 'Legalidad y Saneamiento',
    question: '¿Todos los lotes cuentan con saneamiento físico-legal e inscripción en SUNARP?',
    answer: 'Sí. En Inmobiliaria Norte Chico priorizamos la seguridad patrimonial de nuestros clientes. Todos los inmuebles y lotes cuentan con partida registral independizada en SUNARP, planos catastrales aprobados y documentación en regla libre de cargas y gravámenes.'
  },
  {
    category: 'Ubicación y Entorno',
    question: '¿En qué zonas exactas se encuentran los proyectos?',
    answer: 'Nuestros proyectos y lotes residenciales están estratégicamente ubicados en el Eje Logístico y Urbano del Norte Chico, principalmente en los distritos de Chancay y Huaral (Lima), con acceso rápido a la Carretera Panamericana Norte y zonas turísticas y comerciales.'
  },
  {
    category: 'Proceso de Compra',
    question: '¿Cuáles son las formas y facilidades de pago disponibles?',
    answer: 'Ofrecemos opciones de pago al contado con importantes descuentos por lanzamiento, así como financiamiento directo y facilidades estructuradas. Aceptamos transferencias bancarias nacionales e internacionales en Dólares (USD) y Soles (PEN).'
  },
  {
    category: 'Servicios Básicos',
    question: '¿Los proyectos cuentan con acceso a servicios básicos?',
    answer: 'Sí, nuestros terrenos cuentan con factibilidad y/o habilitación para servicios esenciales (agua, energía eléctrica, accesos afirmados/pavimentados y delimitación topográfica con hitos instalados).'
  },
  {
    category: 'Visitas Guiadas',
    question: '¿Cómo puedo agendar una visita guiada para conocer los terrenos?',
    answer: 'Puedes agendar una visita personalizada sin costo comunicándote directamente a través de nuestro WhatsApp oficial (+56 9 8281 6844) o completando el formulario de contacto. Organizamos recorridos directamente en el terreno con nuestros asesores comerciales.'
  }
];

const jsonLdFaq = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  'mainEntity': faqItems.map(item => ({
    '@type': 'Question',
    'name': item.question,
    'acceptedAnswer': {
      '@type': 'Answer',
      'text': item.answer,
    },
  })),
};

const jsonLdBreadcrumb = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  'itemListElement': [
    {
      '@type': 'ListItem',
      'position': 1,
      'name': 'Inicio',
      'item': 'https://inmobiliarianortechico.pe/'
    },
    {
      '@type': 'ListItem',
      'position': 2,
      'name': 'Preguntas Frecuentes',
      'item': 'https://inmobiliarianortechico.pe/preguntas-frecuentes'
    }
  ]
};

import { createClient } from '../../utils/supabase/server';

export default async function FaqPage() {
  const supabase = createClient();
  let dynamicArticles = articles;

  try {
    const { data: dbArticles, error } = await supabase
      .from('articulos')
      .select('*')
      .eq('publicado', true)
      .order('destacado', { ascending: false })
      .order('created_at', { ascending: false });

    if (!error && dbArticles && dbArticles.length > 0) {
      dynamicArticles = dbArticles.map(a => {
        let parsedContent = a.contenido;
        if (typeof parsedContent === 'string') {
          try { parsedContent = JSON.parse(parsedContent); } catch (e) { parsedContent = [{ subtitle: 'Información', text: a.contenido }]; }
        }
        let parsedPoints = a.puntos_clave;
        if (typeof parsedPoints === 'string') {
          try { parsedPoints = JSON.parse(parsedPoints); } catch (e) { parsedPoints = [a.puntos_clave]; }
        }

        return {
          id: a.id,
          category: a.categoria || 'Inversión',
          badgeColor: a.badge_color || '#cb9f74',
          title: a.titulo,
          excerpt: a.resumen,
          readTime: a.tiempo_lectura || '4 min de lectura',
          date: a.created_at ? new Date(a.created_at).toLocaleDateString('es-PE', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Reciente',
          author: a.autor || 'Equipo Norte Chico',
          authorRole: a.autor_rol || 'Comité Editorial',
          image: a.imagen_url || '/PR_GLORIETA_DELUXE.webp',
          featured: !!a.destacado,
          content: Array.isArray(parsedContent) ? parsedContent : [{ subtitle: 'Detalle', text: String(a.resumen || '') }],
          keyPoints: Array.isArray(parsedPoints) ? parsedPoints : ['Información oficial de Inmobiliaria Norte Chico']
        };
      });
    }
  } catch (err) {
    console.error("Error fetching articles in FaqPage:", err);
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify([jsonLdFaq, jsonLdBreadcrumb]) }}
      />
      <BlogClient articles={dynamicArticles} faqItems={faqItems} />
    </>
  );
}

