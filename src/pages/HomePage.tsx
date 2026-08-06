import { ParticleBackground } from '../components/home/ParticleBackground';
import { Hero } from '../components/home/Hero';
import { TransferOptions } from '../components/home/TransferOptions';
import { Features } from '../components/home/Features';
import { SecuritySection } from '../components/home/SecuritySection';
import { HowItWorks } from '../components/home/HowItWorks';
import { FAQ } from '../components/home/FAQ';
import { SEO } from '../components/seo/SEO';
import {
  getOrganizationSchema,
  getWebSiteSchema,
  getWebApplicationSchema,
  getFAQSchema,
} from '../components/seo/StructuredData';

export function HomePage() {
  const schemas = [
    getOrganizationSchema(),
    getWebSiteSchema(),
    getWebApplicationSchema(),
    getFAQSchema(),
  ];

  return (
    <>
      <SEO
        title="BYTEPORT — Encrypted Browser-Based P2P File Sharing"
        description="Send large files securely with end-to-end AES-GCM encryption directly between browsers. Zero accounts, zero cloud storage, unlimited file sizes."
        canonical="https://byteport.app/"
        structuredData={schemas}
      />
      <ParticleBackground />
      <Hero />
      <TransferOptions />
      <Features />
      <SecuritySection />
      <HowItWorks />
      <FAQ />
    </>
  );
}

