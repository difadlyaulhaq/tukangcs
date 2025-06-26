// src/pages/api/whatsapp/messages.js
import { adminDb } from "../../../lib/firebase-admin.js";

export const prerender = false;

export const GET = async ({ url, cookies }) => {
  try {
    const userId = cookies.get("user_id")?.value || 'default-user';
    const platform = url.searchParams.get('platform') || 'whatsapp';
    const limit = parseInt(url.searchParams.get('limit') || '50');
    const status = url.searchParams.get('status');

    let query = adminDb.collection('pesan')
      .where('userId', '==', userId)
      .where('platform', '==', platform)
      .orderBy('waktu', 'desc')
      .limit(limit);

    if (status) {
      query = query.where('status', '==', status);
    }

    const snapshot = await query.get();
    const messages = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return new Response(JSON.stringify({
      success: true,
      data: messages,
      total: messages.length
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error('Error fetching messages:', error);
    return new Response(JSON.stringify({
      success: false,
      message: error.message
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
};

export const POST = async ({ request, cookies }) => {
  try {
    const userId = cookies.get("user_id")?.value || 'default-user';
    const { messageId, status, reply } = await request.json();

    if (!messageId) {
      return new Response(JSON.stringify({
        success: false,
        message: 'Message ID is required'
      }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    const messageRef = adminDb.collection('pesan').doc(messageId);
    
    // Update status pesan
    if (status) {
      await messageRef.update({
        status,
        updatedAt: new Date().toISOString()
      });
    }

    // Kirim reply jika ada
    if (reply) {
      const messageDoc = await messageRef.get();
      const messageData = messageDoc.data();
      
      if (messageData) {
        // Import WhatsApp service secara dinamis untuk menghindari circular import
        try {
          const { default: WhatsAppService } = await import('../../../services/whatsapp-service.js');
          // Asumsi ada global instance atau buat instance baru
          // Untuk sementara, simpan reply sebagai pesan admin
          
          await adminDb.collection('pesan').add({
            platform: 'whatsapp',
            senderId: messageData.senderId,
            senderName: 'Admin',
            isi: reply,
            waktu: new Date().toISOString(),
            status: 'terkirim',
            userId,
            isReply: true,
            originalMessageId: messageId,
            metadata: {
              messageType: 'text',
              sentBy: 'admin'
            }
          });
        } catch (importError) {
          console.warn('WhatsApp service not available for sending reply:', importError);
        }
      }
    }

    return new Response(JSON.stringify({
      success: true,
      message: 'Message updated successfully'
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error('Error updating message:', error);
    return new Response(JSON.stringify({
      success: false,
      message: error.message
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
};