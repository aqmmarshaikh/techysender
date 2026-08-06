import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Loader2, AlertCircle } from 'lucide-react';
import { GlassCard } from '../components/ui/GlassCard';
import { Button } from '../components/ui/Button';
import { getTransferDetailsFromShortCode } from '../lib/webrtc/shortLinks';
import { SEO } from '../components/seo/SEO';

export function ShortLinkRedirector() {
  const { shortCode } = useParams<{ shortCode: string }>();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function resolveShortLink() {
      if (!shortCode) {
        setError('Invalid short link code.');
        return;
      }

      try {
        const details = await getTransferDetailsFromShortCode(shortCode);
        if (!details) {
          setError('Link expired or not found.');
          // Or redirect to an expired page or /receive?error=expired
          // We will show error inline for simplicity, or navigate to receive.
          navigate('/receive?error=expired', { replace: true });
          return;
        }

        const { transferId, encryptionKey } = details;

        if (!encryptionKey) {
          setError('Encryption key missing from URL.');
          return;
        }

        // Seamlessly redirect to the full receive URL
        navigate(`/receive?id=${transferId}#${encryptionKey.replace(/^#/, '')}`, { replace: true });
      } catch (err) {
        console.error('Failed to resolve short link:', err);
        setError('An error occurred while resolving the link.');
      }
    }

    resolveShortLink();
  }, [shortCode, navigate]);

  if (error) {
    return (
      <div className="page-content">
        <SEO title="Invalid Transfer Link — TECHYSENDER" noindex />
        <div className="container" style={{ display: 'flex', justifyContent: 'center', marginTop: '4rem' }}>
          <div style={{ maxWidth: '400px', width: '100%', textAlign: 'center' }}>
            <GlassCard variant="default" padding="xl">
              <div style={{ color: 'var(--color-danger)', marginBottom: '1rem', display: 'flex', justifyContent: 'center' }}>
                <AlertCircle size={48} />
              </div>
              <h2 style={{ marginBottom: '1rem' }}>Invalid Link</h2>
              <p style={{ marginBottom: '2rem' }}>{error}</p>
              <Button variant="primary" onClick={() => navigate('/')}>Return to Home</Button>
            </GlassCard>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-content">
      <SEO title="Resolving Transfer Link — TECHYSENDER" noindex />
      <div className="container" style={{ display: 'flex', justifyContent: 'center', marginTop: '4rem' }}>
        <div style={{ maxWidth: '400px', width: '100%', textAlign: 'center' }}>
          <GlassCard variant="purple" padding="xl">
            <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'center' }}>
              <Loader2 className="spinner" size={48} style={{ color: 'var(--color-purple)' }} />
            </div>
            <h2>Resolving Link...</h2>
            <p>Please wait while we securely connect you.</p>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
