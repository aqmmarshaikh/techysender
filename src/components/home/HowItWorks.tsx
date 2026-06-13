import { Upload, Link2, Share2, Download } from 'lucide-react';
import './HowItWorks.css';

const steps = [
  {
    icon: <Upload size={24} />,
    step: '01',
    title: 'Select Files',
    description: 'Drag and drop or browse to select your files. Supports images, videos, documents, and more.',
  },
  {
    icon: <Link2 size={24} />,
    step: '02',
    title: 'Generate Link',
    description: 'Your files are encrypted in-browser and a secure shareable link is generated instantly.',
  },
  {
    icon: <Share2 size={24} />,
    step: '03',
    title: 'Share Link',
    description: 'Share via QR code, WhatsApp, Telegram, or simply copy the link.',
  },
  {
    icon: <Download size={24} />,
    step: '04',
    title: 'Download',
    description: 'The receiver opens the link and downloads. Decryption happens automatically in their browser.',
  },
];

export function HowItWorks() {
  return (
    <section className="how-it-works section" id="how-it-works">
      <div className="container">
        <div className="how-header">
          <span className="section-label">How It Works</span>
          <h2 className="section-title">Four Steps. <span className="text-gradient">Zero Hassle.</span></h2>
          <p className="section-subtitle">Start sharing files in seconds. No registration required.</p>
        </div>

        <div className="how-steps">
          {steps.map((step, i) => (
            <div key={i} className="how-step">
              <div className="how-step-number">
                <span>{step.step}</span>
              </div>
              <div className="how-step-icon">
                {step.icon}
              </div>
              <h3 className="how-step-title">{step.title}</h3>
              <p className="how-step-description">{step.description}</p>
              {i < steps.length - 1 && (
                <div className="how-step-connector" aria-hidden="true" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
