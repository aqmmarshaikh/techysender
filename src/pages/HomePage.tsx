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
        title="TECHYSENDER – Secure P2P File Sharing"
        description="Send files instantly with end-to-end encryption, WebRTC technology, QR sharing, and secure short links. No sign-up. No storage. Just private file transfers."
        canonical="https://techysender.app/"
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

