import { ParticleBackground } from '../components/home/ParticleBackground';
import { Hero } from '../components/home/Hero';
import { TransferOptions } from '../components/home/TransferOptions';
import { Features } from '../components/home/Features';
import { SecuritySection } from '../components/home/SecuritySection';
import { HowItWorks } from '../components/home/HowItWorks';
import { FAQ } from '../components/home/FAQ';

export function HomePage() {
  return (
    <>
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
