import { Share2, MessageCircle, Send } from 'lucide-react';
import { Button } from '../ui/Button';
import { getWhatsAppShareUrl, getTelegramShareUrl, nativeShare } from '../../lib/linkGenerator';
import './ShareButtons.css';

interface ShareButtonsProps {
  url: string;
}

export function ShareButtons({ url }: ShareButtonsProps) {
  const handleWhatsApp = () => {
    window.open(getWhatsAppShareUrl(url), '_blank');
  };

  const handleTelegram = () => {
    window.open(getTelegramShareUrl(url), '_blank');
  };

  const handleNativeShare = async () => {
    await nativeShare(url);
  };

  const supportsNativeShare = typeof navigator !== 'undefined' && !!navigator.share;

  return (
    <div className="share-buttons">
      <span className="share-buttons-label">Share via</span>
      <div className="share-buttons-row">
        <Button
          variant="secondary"
          size="md"
          icon={<MessageCircle size={16} />}
          onClick={handleWhatsApp}
          className="share-btn share-btn-whatsapp"
        >
          WhatsApp
        </Button>
        <Button
          variant="secondary"
          size="md"
          icon={<Send size={16} />}
          onClick={handleTelegram}
          className="share-btn share-btn-telegram"
        >
          Telegram
        </Button>
        {supportsNativeShare && (
          <Button
            variant="secondary"
            size="md"
            icon={<Share2 size={16} />}
            onClick={handleNativeShare}
            className="share-btn"
          >
            More
          </Button>
        )}
      </div>
    </div>
  );
}
