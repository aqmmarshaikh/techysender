import { useEffect, useRef, useState } from 'react';
import { Download, QrCode } from 'lucide-react';
import QRCode from 'qrcode';
import { Button } from '../ui/Button';
import './QRCodePanel.css';

interface QRCodePanelProps {
  url: string;
}

export function QRCodePanel({ url }: QRCodePanelProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!canvasRef.current || !url) return;

    QRCode.toCanvas(canvasRef.current, url, {
      width: 140,
      margin: 1,
      color: {
        dark: '#00E5FF',
        light: '#00000000', // transparent background
      },
      errorCorrectionLevel: 'M',
    }).catch(() => setError(true));
  }, [url]);

  const handleDownload = () => {
    if (!canvasRef.current) return;

    // Create a new canvas with background for download
    const downloadCanvas = document.createElement('canvas');
    const size = 280;
    downloadCanvas.width = size;
    downloadCanvas.height = size;
    const ctx = downloadCanvas.getContext('2d');
    if (!ctx) return;

    // Dark background
    ctx.fillStyle = '#111827';
    ctx.beginPath();
    ctx.roundRect(0, 0, size, size, 16);
    ctx.fill();

    // Border
    ctx.strokeStyle = 'rgba(0, 229, 255, 0.2)';
    ctx.lineWidth = 1;
    ctx.stroke();

    // QR code centered
    const qrSize = 200;
    const offset = (size - qrSize) / 2;
    ctx.drawImage(canvasRef.current, offset, offset, qrSize, qrSize);

    // Download
    const link = document.createElement('a');
    link.download = 'byteport-qr.png';
    link.href = downloadCanvas.toDataURL('image/png');
    link.click();
  };

  if (error) return null;

  return (
    <div className="qr-panel">
      <div className="qr-panel-header">
        <QrCode size={16} />
        <span>Scan to Download</span>
      </div>
      <div className="qr-panel-code">
        <canvas ref={canvasRef} className="qr-canvas" />
      </div>
      <Button
        variant="ghost"
        size="sm"
        icon={<Download size={14} />}
        onClick={handleDownload}
      >
        Download QR Code
      </Button>
    </div>
  );
}
