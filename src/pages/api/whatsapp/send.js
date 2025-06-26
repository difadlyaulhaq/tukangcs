// src/pages/api/whatsapp/send.js
import WhatsAppService from "../../../services/whatsapp-service.js";
import { adminDb } from "../../../lib/firebase-admin.js";

export const prerender = false;

// Global instance untuk mengakses service yang sama dengan connect.js
let whatsappService = null;

// Fungsi untuk mendapatkan atau membuat instance WhatsApp service
function getWhatsAppService() {
  if (!whatsappService) {
    whatsappService = new WhatsAppService();
  }
  return whatsappService;
}

export const POST = async ({ request, cookies }) => {
  try {
    const { phoneNumber, message } = await request.json();
    const userId = cookies.get("user_id")?.value || 'default-user';

    if (!phoneNumber || !message) {
      return new Response(JSON.stringify({
        success: false,
        message: 'Phone number and message are required'
      }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    // Dapatkan instance WhatsApp service
    const service = getWhatsAppService();
    const connectionStatus = service.getConnectionStatus();

    if (!connectionStatus.connected) {
      return new Response(JSON.stringify({
        success: false,
        message: 'WhatsApp not connected. Please connect first.',
        connectionStatus
      }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    // Format nomor telepon untuk WhatsApp
    let formattedNumber = phoneNumber.replace(/\D/g, '');
    
    // Add country code if not present (untuk Indonesia)
    if (!formattedNumber.startsWith('62') && formattedNumber.startsWith('0')) {
      formattedNumber = '62' + formattedNumber.substring(1);
    }
    
    const jid = `${formattedNumber}@s.whatsapp.net`;

    // Kirim pesan
    await service.sendMessage(jid, message);

    // Simpan pesan yang dikirim ke database
    await adminDb.collection('pesan').add({
      platform: 'whatsapp',
      senderId: jid,
      senderName: 'Outbound Message',
      isi: message,
      waktu: new Date().toISOString(),
      status: 'terkirim',
      userId,
      isOutbound: true,
      phoneNumber: formattedNumber,
      metadata: {
        messageType: 'text',
        sentBy: 'admin',
        direction: 'outbound'
      }
    });

    return new Response(JSON.stringify({
      success: true,
      message: 'Message sent successfully',
      data: {
        phoneNumber: formattedNumber,
        jid,
        sentAt: new Date().toISOString()
      }
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error('Error sending message:', error);
    
    // Log error untuk debugging
    let errorMessage = 'Failed to send message';
    
    if (error.message.includes('not connected')) {
      errorMessage = 'WhatsApp not connected';
    } else if (error.message.includes('invalid number')) {
      errorMessage = 'Invalid phone number format';
    } else if (error.message.includes('timeout')) {
      errorMessage = 'Message sending timeout';
    }
    
    return new Response(JSON.stringify({
      success: false,
      message: errorMessage,
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
};