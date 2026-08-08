import React from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Features from './components/Features';
import Philosophy from './components/Philosophy';
import Catalog from './components/Catalog';
import ContactForm from './components/ContactForm';
import Footer from './components/Footer';

function App() {
  return (
    <>
      <div className="noise-overlay"></div>
      <Navbar />
      <main>
        <Hero />
        <Features />
        <Philosophy />
        <Catalog />
        <ContactForm />
      </main>
      <Footer />
    </>
  );
}

export default App;
