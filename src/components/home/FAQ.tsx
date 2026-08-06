import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import './FAQ.css';

const faqs = [
  {
    question: 'Is BYTEPORT really free?',
    answer: 'Yes, BYTEPORT is completely free and open source. There are no hidden fees, premium plans, or data monetization schemes.',
  },
  {
    question: 'How secure are my files?',
    answer: 'All files are encrypted using AES-256-GCM before leaving your browser. The encryption key is stored in the URL fragment, which is never sent to our servers. This means we physically cannot access your files.',
  },
  {
    question: 'What happens after 24 hours?',
    answer: 'All transfer data — including encrypted files, metadata, and analytics — is automatically deleted after 24 hours. The link becomes invalid and shows an expiration notice.',
  },
  {
    question: 'What is the maximum file size?',
    answer: 'The maximum total transfer size is 200 MB. You can send multiple files and folders as long as the total size stays under this limit.',
  },
  {
    question: 'Do I need to create an account?',
    answer: 'No. BYTEPORT requires no registration, no email, and no personal information. You can start transferring files immediately.',
  },
  {
    question: 'Which browsers are supported?',
    answer: 'BYTEPORT works on all modern browsers including Chrome, Firefox, Edge, and Safari on both desktop and mobile devices.',
  },
];

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="faq section" id="faq">
      <div className="container container-narrow">
        <div className="faq-header">
          <span className="section-label">FAQ</span>
          <h2 className="section-title">Common <span className="text-gradient">Questions</span></h2>
        </div>

        <div className="faq-list">
          {faqs.map((faq, i) => (
            <div key={i} className={`faq-item ${openIndex === i ? 'faq-item-open' : ''}`}>
              <button
                className="faq-question"
                id={`faq-question-${i}`}
                onClick={() => toggle(i)}
                aria-expanded={openIndex === i}
                aria-controls={`faq-answer-${i}`}
              >
                <span>{faq.question}</span>
                <ChevronDown size={18} className="faq-chevron" aria-hidden="true" />
              </button>
              <div
                className="faq-answer"
                id={`faq-answer-${i}`}
                role="region"
                aria-labelledby={`faq-question-${i}`}
              >
                <p>{faq.answer}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
