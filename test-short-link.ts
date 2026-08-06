import { app, db } from './src/lib/firebase.js';
import { createShortLink, getTransferDetailsFromShortCode } from './src/lib/webrtc/shortLinks.js';

async function run() {
  try {
    console.log('Testing createShortLink...');
    const shortCode = await createShortLink('test-transfer-id', 'test-encryption-key');
    console.log('Created short code:', shortCode);

    console.log('Testing getTransferDetailsFromShortCode...');
    const details = await getTransferDetailsFromShortCode(shortCode);
    console.log('Retrieved details:', details);

    if (details?.transferId === 'test-transfer-id' && details?.encryptionKey === 'test-encryption-key') {
      console.log('✅ Short Link system is working perfectly!');
    } else {
      console.log('❌ Validation failed.');
    }
  } catch (error) {
    console.error('❌ Error during testing:', error);
  }
  process.exit(0);
}

run();
