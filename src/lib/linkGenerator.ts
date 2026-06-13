/**
 * BYTEPORT — Link Generator Module
 *
 * Generates shareable transfer links with encryption keys in URL fragments.
 */

/**
 * Generate a unique transfer ID (URL-safe).
 */
export function generateTransferId(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(12));
  return Array.from(bytes)
    .map(b => b.toString(36))
    .join('')
    .slice(0, 16);
}

/**
 * Build a shareable transfer URL with the encryption key in the fragment.
 * The fragment (#key) is never sent to the server per HTTP spec.
 *
 * Format: https://domain.com/d/{transferId}#{encryptionKey}
 */
export function buildTransferUrl(transferId: string, encryptionKey: string): string {
  const baseUrl = window.location.origin;
  return `${baseUrl}/d/${transferId}#${encryptionKey}`;
}

/**
 * Extract transfer ID and encryption key from the current URL.
 */
export function parseTransferUrl(url?: string): { transferId: string; encryptionKey: string } | null {
  try {
    const fullUrl = url || window.location.href;
    const urlObj = new URL(fullUrl);
    const pathMatch = urlObj.pathname.match(/\/d\/([^/]+)/);
    const fragment = urlObj.hash.slice(1); // Remove #

    if (!pathMatch || !fragment) return null;

    return {
      transferId: pathMatch[1],
      encryptionKey: fragment,
    };
  } catch {
    return null;
  }
}

/**
 * Build a receive link for WebRTC direct transfer.
 * Format: https://domain.com/receive?id={sessionId}
 */
export function buildReceiveUrl(sessionId: string): string {
  const baseUrl = window.location.origin;
  return `${baseUrl}/receive?id=${sessionId}`;
}

/**
 * Generate a WhatsApp share URL.
 */
export function getWhatsAppShareUrl(transferUrl: string): string {
  const text = encodeURIComponent(`Here's a secure file transfer for you: ${transferUrl}`);
  return `https://wa.me/?text=${text}`;
}

/**
 * Generate a Telegram share URL.
 */
export function getTelegramShareUrl(transferUrl: string): string {
  const text = encodeURIComponent(`Here's a secure file transfer for you: ${transferUrl}`);
  return `https://t.me/share/url?url=${encodeURIComponent(transferUrl)}&text=${text}`;
}

/**
 * Use the native Web Share API if available.
 */
export async function nativeShare(transferUrl: string, title: string = 'BYTEPORT Transfer'): Promise<boolean> {
  if (!navigator.share) return false;

  try {
    await navigator.share({
      title,
      text: 'Secure file transfer via BYTEPORT',
      url: transferUrl,
    });
    return true;
  } catch {
    return false;
  }
}

/**
 * Copy text to clipboard.
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Fallback for older browsers
    try {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      return true;
    } catch {
      return false;
    }
  }
}
