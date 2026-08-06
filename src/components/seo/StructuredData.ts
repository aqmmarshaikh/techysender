export function getOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'BYTEPORT',
    url: 'https://byteport.app',
    logo: 'https://byteport.app/favicon.svg',
    sameAs: [],
    description: 'Encrypted browser-based peer-to-peer file sharing platform.',
  };
}

export function getWebSiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'BYTEPORT',
    url: 'https://byteport.app',
    potentialAction: {
      '@type': 'SearchAction',
      target: 'https://byteport.app/receive?id={search_term_string}',
      'query-input': 'required name=search_term_string',
    },
  };
}

export function getWebApplicationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'BYTEPORT',
    url: 'https://byteport.app',
    applicationCategory: 'SecurityApplication',
    operatingSystem: 'All',
    browserRequirements: 'Requires WebRTC and Web Crypto API support',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    featureList: [
      'End-to-End Encryption (AES-GCM)',
      'Peer-to-Peer Browser Transfers',
      'No File Size Limits',
      'No Account Required',
      'Zero Cloud Storage',
    ],
  };
}

export function getBreadcrumbSchema(items: Array<{ name: string; url: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function getFAQSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'Is BYTEPORT completely private?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes. Your files are encrypted in your browser before transmission using AES-GCM and sent directly peer-to-peer via WebRTC. Unencrypted data never touches any server.',
        },
      },
      {
        '@type': 'Question',
        name: 'Is there a file size limit?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'No hard file size limits. Transfers stream directly from browser memory to memory without uploading to intermediate servers.',
        },
      },
      {
        '@type': 'Question',
        name: 'Do I need to create an account?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'No account, email, or registration is required. You can start transferring files instantly.',
        },
      },
      {
        '@type': 'Question',
        name: 'Where are my files stored?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Nowhere on the cloud. Files stream directly between the sender and receiver devices.',
        },
      },
    ],
  };
}

export function getPrivacyPageSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Privacy Policy — BYTEPORT',
    description: 'Learn how BYTEPORT respects your privacy with zero-knowledge, zero-storage peer-to-peer architecture.',
    url: 'https://byteport.app/privacy',
  };
}
